/**
 * Cloudflare Turnstile bot-check (design component 12 §3; Req 13.2).
 *
 * Role in the abuse pipeline:
 *   When `config.turnstileEnabled`, a valid Turnstile token must be verified
 *   server-side — via `config.turnstileSecret` against Cloudflare's siteverify
 *   endpoint — **before a stream `Session_Token` is issued** on the public
 *   `/embed` surface. The bot-check *fronts token issuance*, not every asset:
 *   once a request verifies, playback proceeds and individual segment/manifest
 *   fetches are not re-challenged (the HMAC + fingerprint stream gate handles
 *   those downstream, Req 13.3).
 *
 * Contract (kept deliberately small and resilient so the composed AbuseGate,
 * task 10.9, can call it as one gate among several):
 *   - `config.turnstileEnabled === false` ⇒ bypassed ⇒ `{ ok: true }`.
 *     No network call is made; the gate is a no-op.
 *   - enabled, but the token is missing/blank ⇒ `{ ok: false, reason:
 *     "missing_token" }`. No network call is made.
 *   - enabled, token present ⇒ POST to the siteverify endpoint with
 *     `secret` + `response` (+ optional `remoteip`) and resolve `ok` from the
 *     response body's `success` flag. A `false` `success` ⇒ `{ ok: false,
 *     reason: "verify_failed" }` (with the first Cloudflare error code, if any).
 *   - any network error / non-2xx / unparseable body ⇒ `{ ok: false, reason:
 *     "verify_failed" }`. The verifier never throws — a transient siteverify
 *     outage fails closed (deny) without crashing the route.
 *
 * Requirements: 13.2.
 */

import { config } from "../config.js";

/** Cloudflare's server-side Turnstile validation endpoint. */
export const TURNSTILE_SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Default time budget for the siteverify round-trip (ms). */
const SITEVERIFY_TIMEOUT_MS = 10000;

/** Outcome of a Turnstile verification attempt. */
export interface TurnstileResult {
  /** `true` when the check is satisfied (verified) or bypassed (disabled). */
  ok: boolean;
  /**
   * Why the check failed, when `ok` is false:
   *   - `"missing_token"`  — enabled but no token supplied by the client.
   *   - `"verify_failed"`  — siteverify returned `success: false`, errored,
   *                          timed out, or returned an unparseable body.
   */
  reason?: "missing_token" | "verify_failed";
}

/** Injectable seams so the verifier is testable without real network/clock. */
export interface VerifyTurnstileOptions {
  /** Override the enabled flag (defaults to `config.turnstileEnabled`). */
  enabled?: boolean;
  /** Override the secret (defaults to `config.turnstileSecret`). */
  secret?: string;
  /** Override the siteverify endpoint (defaults to the Cloudflare URL). */
  endpoint?: string;
  /** Override the request timeout in ms (defaults to {@link SITEVERIFY_TIMEOUT_MS}). */
  timeoutMs?: number;
  /** Injectable `fetch` (defaults to the global `fetch`). */
  fetchImpl?: typeof fetch;
}

/** Shape of the relevant fields in Cloudflare's siteverify JSON response. */
interface SiteverifyResponse {
  success?: boolean;
  "error-codes"?: string[];
}

/**
 * Verify a Cloudflare Turnstile token server-side.
 *
 * @param token    The Turnstile response token supplied by the client. When
 *                 the check is enabled, a `null`/`undefined`/blank token short-
 *                 circuits to `{ ok: false, reason: "missing_token" }`.
 * @param remoteIp Optional client IP, forwarded to siteverify as `remoteip`
 *                 (Cloudflare uses it as an additional signal).
 * @param options  Test seams (enabled flag, secret, endpoint, timeout, fetch).
 * @returns        `{ ok: true }` when verified or bypassed (disabled);
 *                 otherwise `{ ok: false, reason }`. Never throws.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string,
  options: VerifyTurnstileOptions = {}
): Promise<TurnstileResult> {
  const enabled = options.enabled ?? config.turnstileEnabled;

  // Disabled ⇒ bypassed. No token required, no network call (Req 13.2).
  if (!enabled) return { ok: true };

  // Enabled but no usable token ⇒ deny without calling Cloudflare.
  if (token === null || token === undefined || token.trim() === "") {
    return { ok: false, reason: "missing_token" };
  }

  const secret = options.secret ?? config.turnstileSecret;
  const endpoint = options.endpoint ?? TURNSTILE_SITEVERIFY_URL;
  const timeoutMs = options.timeoutMs ?? SITEVERIFY_TIMEOUT_MS;
  const doFetch = options.fetchImpl ?? fetch;

  // Cloudflare expects an application/x-www-form-urlencoded POST body.
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp !== undefined && remoteIp !== "") {
    body.set("remoteip", remoteIp);
  }

  // Bound the siteverify round-trip so a hung endpoint cannot stall token
  // issuance; an abort is treated as a verify failure (fail closed).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await doFetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Non-2xx from siteverify ⇒ cannot confirm the token ⇒ deny.
      return { ok: false, reason: "verify_failed" };
    }

    const data = (await res.json()) as SiteverifyResponse;
    if (data && data.success === true) {
      return { ok: true };
    }

    return { ok: false, reason: "verify_failed" };
  } catch {
    // Network error, timeout/abort, or unparseable body ⇒ fail closed.
    return { ok: false, reason: "verify_failed" };
  } finally {
    clearTimeout(timer);
  }
}
