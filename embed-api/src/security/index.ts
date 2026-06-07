// Abuse/Security Layer (public surface only): rate limiter, referer allowlist,
// production secret guard, Turnstile bot-check, composed AbuseGate.

// Rate limiter — pure decision split from a pluggable counter store (task 10.1).
export {
  rateLimitDecision,
  MemoryCounterStore,
  RedisCounterStore,
  createCounterStore,
  RateLimiter,
  createRateLimiter,
  rateLimitKey,
  thresholdForKey,
} from "./rateLimiter.js";
export type {
  RateLimitDecisionInput,
  RateLimitResult,
  RateWindow,
  CounterStore,
  RateLimitScope,
  RateLimitIdentity,
  RateLimitThresholds,
  RateLimiterOptions,
} from "./rateLimiter.js";

// Referer / domain allowlist predicate — pure, open-by-default (task 10.3).
export { refererAllowed, refererHost } from "./refererAllowlist.js";

// Production insecure-secret startup guard (task 10.5). Exported for the server
// bootstrap to invoke before binding a port — NOT called at import time here.
export {
  secretGuardDecision,
  enforceSecretGuard,
} from "./secretGuard.js";
export type {
  SecretGuardDecision,
  EnforceSecretGuardOptions,
} from "./secretGuard.js";

// Cloudflare Turnstile bot-check — verified server-side before a stream
// Session_Token is issued on /embed; disabled ⇒ bypassed (task 10.7).
export {
  verifyTurnstileToken,
  TURNSTILE_SITEVERIFY_URL,
} from "./turnstile.js";
export type {
  TurnstileResult,
  VerifyTurnstileOptions,
} from "./turnstile.js";

// Composed AbuseGate — runs the public-surface gates in order (rate limit →
// referer allowlist → Turnstile) and returns the first failing control, or
// null to proceed; applied only when `policy.abuseControls` (task 10.9).
export { createAbuseGate } from "./abuseGate.js";
export type {
  AbuseGate,
  AbuseRequest,
  AbuseGateOutcome,
  AbuseControlKind,
  AbuseGateOptions,
} from "./abuseGate.js";
