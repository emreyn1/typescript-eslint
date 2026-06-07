/**
 * Composed AbuseGate (design component 12; Req 13.1, 13.2, 13.5, 15.3).
 *
 * The Abuse/Security Layer is applied **only when `policy.abuseControls`** is
 * true — i.e. on the public `/embed` surface. The *caller/route* checks the
 * policy flag (component 11); this gate itself just **evaluates** the public
 * abuse controls in order and returns the **first failing control**, or `null`
 * to proceed.
 *
 * Evaluation order (short-circuit on the first failure):
 *   1. **Per-IP and per-referer rate limiting** (Req 13.1) — `RateLimiter.check`
 *      with embed-scope keys (`embed:ip:*`, `embed:referer:*`). A reject →
 *      `{ kind: "rate_limited" }`.
 *   2. **Referer / domain allowlist** (Req 13.5, hotlink protection) —
 *      `refererAllowed(refererHost(referer), config.refererAllowlist)`. Empty
 *      allowlist is open (vidsrc.to-style broad embedding). A reject →
 *      `{ kind: "forbidden_referer" }`.
 *   3. **Cloudflare Turnstile** (Req 13.2) — `verifyTurnstileToken(...)` before a
 *      stream `Session_Token` is issued. Disabled ⇒ bypassed. A reject →
 *      `{ kind: "turnstile_required" }`.
 *
 * Failures are **non-throwing**: the gate catches errors from the stateful rate
 * limiter and **fails closed** to `rate_limited` (a counter-store outage must
 * not silently grant unbounded access, Req 13.1/15.3). The Turnstile verifier
 * already fails closed internally, and the referer predicate is pure. A
 * short-circuited request yields an explicit control kind so the route can
 * return a rate-limited / challenge response rather than a broken player
 * (Req 15.3).
 *
 * The request is a **minimal abstraction** (`ip`, `headers`, optional
 * `turnstileToken`) rather than a hard binding to Fastify's `FastifyRequest`,
 * so the gate is testable in isolation and reusable across route frameworks.
 *
 * Requirements: 13.1, 13.2, 13.5, 15.3.
 */

import { config } from "../config.js";
import { rateLimitKey, type RateLimiter } from "./rateLimiter.js";
import { refererAllowed, refererHost } from "./refererAllowlist.js";
import { verifyTurnstileToken } from "./turnstile.js";

/** The public abuse controls a request can fail, in evaluation order. */
export type AbuseControlKind =
  | "rate_limited"
  | "turnstile_required"
  | "forbidden_referer";

/** The first failing control, or `null` to proceed. */
export type AbuseGateOutcome = { kind: AbuseControlKind } | null;

/**
 * Minimal request abstraction the gate reads from. Intentionally *not* bound to
 * Fastify so the gate stays unit-testable and framework-agnostic — a route
 * adapter maps its real request onto this shape.
 */
export interface AbuseRequest {
  /** Client IP (e.g. Fastify's `request.ip`). Used for the per-IP rate-limit key. */
  ip?: string | null;
  /**
   * Request headers. `referer`/`origin` drive the referer rate-limit key and the
   * allowlist check; `cf-turnstile-response` is a fallback source for the token.
   * Values may be a string or string[] (multi-valued headers).
   */
  headers?: Record<string, string | string[] | undefined>;
  /**
   * Turnstile response token supplied by the client (body/query). When absent,
   * the gate falls back to the `cf-turnstile-response` header.
   */
  turnstileToken?: string | null;
}

/** The composed public-surface abuse gate. */
export interface AbuseGate {
  /**
   * Run the public-surface gates in order and return the first failing control,
   * or `null` to proceed. Never throws.
   */
  evaluate(req: AbuseRequest): Promise<AbuseGateOutcome>;
}

/** Wiring/overrides for {@link createAbuseGate} (test seams + config injection). */
export interface AbuseGateOptions {
  /** Referer allowlist (defaults to `config.refererAllowlist`). */
  refererAllowlist?: string[];
  /** Override the Turnstile enabled flag (defaults to `config.turnstileEnabled`). */
  turnstileEnabled?: boolean;
  /** Injectable Turnstile verifier (defaults to {@link verifyTurnstileToken}). */
  verifyTurnstile?: typeof verifyTurnstileToken;
  /** Injectable clock for rate-limit windows (defaults to `Date.now`). */
  now?: () => number;
}

/** Read a single header value, collapsing multi-valued headers to the first entry. */
function headerValue(
  headers: AbuseRequest["headers"],
  name: string
): string | null {
  if (headers === undefined) return null;
  const raw = headers[name];
  if (raw === undefined) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Pull the raw referer/origin value from a request's headers. */
function refererValue(req: AbuseRequest): string | null {
  return headerValue(req.headers, "referer") ?? headerValue(req.headers, "origin");
}

/** Resolve the Turnstile token from the explicit field, else the header. */
function turnstileToken(req: AbuseRequest): string | null {
  if (req.turnstileToken !== undefined && req.turnstileToken !== null) {
    const trimmed = req.turnstileToken.trim();
    return trimmed === "" ? null : trimmed;
  }
  return headerValue(req.headers, "cf-turnstile-response");
}

/**
 * Build the composed AbuseGate, wiring it to the shared {@link RateLimiter} and
 * (by default) the app `config` for the allowlist and Turnstile settings.
 *
 * The returned gate evaluates the public abuse controls in order
 * (rate limit → referer allowlist → Turnstile) and returns the first failing
 * control, or `null` to proceed. It is applied only when `policy.abuseControls`
 * is true — the caller/route enforces that; the gate just evaluates.
 *
 * @param rateLimiter The shared rate limiter (task 10.1; built via `createRateLimiter`).
 * @param options     Optional config/test overrides.
 */
export function createAbuseGate(
  rateLimiter: RateLimiter,
  options: AbuseGateOptions = {}
): AbuseGate {
  const allowlist = options.refererAllowlist ?? config.refererAllowlist;
  const turnstileEnabled = options.turnstileEnabled ?? config.turnstileEnabled;
  const verify = options.verifyTurnstile ?? verifyTurnstileToken;
  const clock = options.now ?? Date.now;

  return {
    async evaluate(req: AbuseRequest): Promise<AbuseGateOutcome> {
      const now = clock();
      const ip = typeof req.ip === "string" && req.ip.trim() !== "" ? req.ip.trim() : null;
      const host = refererHost(refererValue(req));

      // --- Gate 1: per-IP and per-referer rate limiting (Req 13.1) ----------
      // A counter-store error fails closed to `rate_limited` so an outage never
      // grants unbounded public access (Req 15.3).
      try {
        if (ip !== null) {
          const ipResult = await rateLimiter.check(rateLimitKey("embed", "ip", ip), now);
          if (!ipResult.allowed) return { kind: "rate_limited" };
        }
        if (host !== null) {
          const refResult = await rateLimiter.check(
            rateLimitKey("embed", "referer", host),
            now
          );
          if (!refResult.allowed) return { kind: "rate_limited" };
        }
      } catch {
        return { kind: "rate_limited" };
      }

      // --- Gate 2: referer / domain allowlist (Req 13.5) --------------------
      // Empty allowlist is open-by-default; a non-empty allowlist refuses a
      // non-matching (or missing) host. The predicate is pure and never throws.
      if (!refererAllowed(host, allowlist)) {
        return { kind: "forbidden_referer" };
      }

      // --- Gate 3: Cloudflare Turnstile bot-check (Req 13.2) ----------------
      // Disabled ⇒ bypassed. The verifier never throws and already fails closed
      // on network/verify errors.
      try {
        const result = await verify(turnstileToken(req), ip ?? undefined, {
          enabled: turnstileEnabled,
        });
        if (!result.ok) return { kind: "turnstile_required" };
      } catch {
        return { kind: "turnstile_required" };
      }

      // All gates passed — proceed.
      return null;
    },
  };
}
