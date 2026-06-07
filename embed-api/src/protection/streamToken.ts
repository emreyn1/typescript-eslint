// Stream-token (a.k.a. Session_Token) sign/verify.
//
// Task 13.1 (embed-omss-backend): the value that reaches the browser as
// `/stream?data=<token>` is NOT the raw CinePro Core proxy `data` parameter —
// it is an opaque, HMAC-signed token that encodes the original Core `data`
// plus an expiry. The raw Core `data` and the Core host are therefore never
// exposed to the client; they are only ever recoverable server-side via a
// successful `verifyStreamToken` (Requirements 6.2, 6.4, 13.3; design "Stream
// proxy token (a.k.a. Session_Token)" and Stream Proxy component 4).
//
// Wire format (per design):
//
//   token   = base64url(payload) + "." + hmac
//   payload = JSON { d: <original Core data>, e: <unix expiry seconds> }
//   hmac    = HMAC-SHA256(base64url(payload), config.hmacSecret)  (hex)
//
// This token IS the `Session_Token` of Req 13.3: a valid, unexpired,
// signature-correct token is one half of the `/stream` AND-gate (task 13.3
// additionally requires a passing fingerprint / anti-debug signal).
//
// Signing style mirrors the existing `protection/hmac.ts` primitives
// (`createHmac("sha256", config.hmacSecret)`), but verification here uses a
// **constant-time** comparison so tampered signatures cannot be probed via a
// timing side channel.

import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";

/** Opaque-to-the-client stream token. `base64url(payload).hmac` */
export type StreamToken = string;

/** Decoded token payload. Kept short to keep the token compact. */
interface StreamTokenPayload {
  /** The original CinePro Core proxy `data` parameter. */
  d: string;
  /** Unix expiry, in seconds. */
  e: number;
}

/** Result of verifying a stream token. */
export type VerifyResult =
  | { ok: true; data: string }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

// --- base64url helpers (no padding, URL-safe) -----------------------------

function base64urlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64urlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

/** Compute the hex HMAC of the encoded payload segment. */
function signPayload(encodedPayload: string): string {
  return createHmac("sha256", config.hmacSecret)
    .update(encodedPayload)
    .digest("hex");
}

/**
 * Constant-time string compare. Returns false (without leaking length via a
 * throw) when the candidates differ in length.
 */
function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Sign the original Core `data` into an opaque stream token that expires after
 * `ttlSeconds` (default: `config.urlTtlSeconds`).
 *
 * The returned string is safe to place in a URL query value and reveals
 * neither the Core host nor the raw `data` without the HMAC secret.
 */
export function signStreamToken(
  coreData: string,
  ttlSeconds: number = config.urlTtlSeconds,
): StreamToken {
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload: StreamTokenPayload = { d: coreData, e: expiry };
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const hmac = signPayload(encodedPayload);
  return `${encodedPayload}.${hmac}`;
}

/**
 * Verify a stream token and, on success, recover EXACTLY the original Core
 * `data`. Verification rejects, in order:
 *   - `malformed`     — wrong shape / undecodable / not a `{ d, e }` payload
 *   - `bad_signature` — HMAC mismatch (constant-time compare; covers tamper)
 *   - `expired`       — `e` is at or before the current time
 *
 * A `malformed` result is returned before signature/expiry checks because a
 * structurally invalid token has no trustworthy fields to evaluate.
 */
export function verifyStreamToken(token: StreamToken): VerifyResult {
  if (typeof token !== "string") return { ok: false, reason: "malformed" };

  // Split into exactly two segments: payload + hmac. Reject anything else.
  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0 || dotIndex === token.length - 1) {
    return { ok: false, reason: "malformed" };
  }
  const encodedPayload = token.slice(0, dotIndex);
  const providedHmac = token.slice(dotIndex + 1);
  // A valid token has a single separator; a second `.` means tampering/garbage.
  if (providedHmac.includes(".")) {
    return { ok: false, reason: "malformed" };
  }

  // Signature check first (constant-time) — never trust unsigned bytes.
  const expectedHmac = signPayload(encodedPayload);
  if (!constantTimeEqual(providedHmac, expectedHmac)) {
    return { ok: false, reason: "bad_signature" };
  }

  // Signature is valid; decode and structurally validate the payload.
  let payload: StreamTokenPayload;
  try {
    const parsed = JSON.parse(base64urlDecode(encodedPayload)) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as StreamTokenPayload).d !== "string" ||
      typeof (parsed as StreamTokenPayload).e !== "number" ||
      !Number.isFinite((parsed as StreamTokenPayload).e)
    ) {
      return { ok: false, reason: "malformed" };
    }
    payload = parsed as StreamTokenPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  // Expiry check (seconds). At-or-past expiry is rejected.
  const now = Math.floor(Date.now() / 1000);
  if (payload.e <= now) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, data: payload.d };
}
