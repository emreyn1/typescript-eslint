/**
 * Production insecure-secret startup guard (design component 12, "Production
 * secret guard"; Req 13.4).
 *
 * Layout:
 *   1. `secretGuardDecision(env, secret, refuseStart)` — a **pure, total
 *      predicate** over `(env, secret, refuseStart)` (Property 18). It returns
 *      a non-`ok` decision **iff** `env === "production"` **and** `secret` is
 *      the insecure shipped default (`INSECURE_HMAC_SECRET_DEFAULT`,
 *      i.e. `"change-this-secret-in-production"`); it then chooses
 *      `"refuse_start"` when `refuseStart` is true, otherwise `"critical_log"`.
 *      Every other `(env, secret)` combination → `"ok"`.
 *   2. `enforceSecretGuard(...)` — runs the decision using `config` values and
 *      enforces the outcome **before the server binds a port**:
 *        - `"refuse_start"` → throw/exit with a clear error naming `HMAC_SECRET`
 *          (the process must not continue to bind a port).
 *        - `"critical_log"` → log a CRITICAL security error naming the key,
 *          then continue (operator chose to tolerate it).
 *        - `"ok"` → do nothing.
 *      The logger and exit hooks are injectable for testability. This module
 *      does NOT call the guard at import time — server bootstrap invokes it.
 *
 * Requirements: 13.4.
 */

import { config, INSECURE_HMAC_SECRET_DEFAULT } from "../config.js";

// ---------------------------------------------------------------------------
// 1. Pure decision function (Property 18)
// ---------------------------------------------------------------------------

/** The three possible outcomes of the secret guard. */
export type SecretGuardDecision = "ok" | "refuse_start" | "critical_log";

/**
 * Pure, total guard decision.
 *
 * Returns a non-`ok` decision **iff** running in production with the insecure
 * default `HMAC_SECRET`. When non-`ok`, `refuseStart` selects between refusing
 * to start (`true`) and logging a CRITICAL error (`false`). Depends only on its
 * inputs — no environment or clock access (Property 18).
 */
export function secretGuardDecision(
  env: string,
  secret: string,
  refuseStart: boolean
): SecretGuardDecision {
  if (env === "production" && secret === INSECURE_HMAC_SECRET_DEFAULT) {
    return refuseStart ? "refuse_start" : "critical_log";
  }
  return "ok";
}

// ---------------------------------------------------------------------------
// 2. Enforcement (runs before the server binds a port)
// ---------------------------------------------------------------------------

/** The human-readable CRITICAL message naming the insecure key. */
const INSECURE_SECRET_MESSAGE =
  "[security] CRITICAL: HMAC_SECRET is still the insecure default " +
  `"${INSECURE_HMAC_SECRET_DEFAULT}" while NODE_ENV=production. ` +
  "Set HMAC_SECRET to a strong, unique value before serving traffic " +
  "(Req 13.4).";

/** Injectable hooks so the enforcement is testable without a real process. */
export interface EnforceSecretGuardOptions {
  /** Runtime environment string (defaults to `config.env`). */
  env?: string;
  /** The HMAC secret to check (defaults to `config.hmacSecret`). */
  secret?: string;
  /** Whether to refuse start vs. log (defaults to `config.refuseStartOnInsecureSecret`). */
  refuseStart?: boolean;
  /** CRITICAL error logger (defaults to `console.error`). */
  logger?: (msg: string) => void;
  /**
   * Fatal-exit hook for the `refuse_start` outcome. When provided it is invoked
   * with the message and then enforcement throws to guarantee the caller never
   * proceeds to bind a port. Defaults to throwing only.
   */
  exit?: (msg: string) => void;
}

/**
 * Enforce the production secret guard. MUST be called during server bootstrap
 * **before** the HTTP server binds a port.
 *
 * - `refuse_start`: invokes `exit` (if supplied) and then throws an `Error`
 *   naming `HMAC_SECRET`, so the process cannot continue to listen.
 * - `critical_log`: logs a CRITICAL security error naming the key and returns.
 * - `ok`: returns without side effects.
 *
 * Returns the decision so callers/tests can assert the outcome.
 */
export function enforceSecretGuard(
  options: EnforceSecretGuardOptions = {}
): SecretGuardDecision {
  const env = options.env ?? config.env;
  const secret = options.secret ?? config.hmacSecret;
  const refuseStart =
    options.refuseStart ?? config.refuseStartOnInsecureSecret;
  const logger = options.logger ?? ((msg: string) => console.error(msg));

  const decision = secretGuardDecision(env, secret, refuseStart);

  switch (decision) {
    case "refuse_start": {
      // Refusing to start is the preferred outcome: do not bind a port with a
      // known-insecure signing key. Allow an injectable exit hook, then throw
      // so the caller is guaranteed not to proceed.
      if (options.exit) options.exit(INSECURE_SECRET_MESSAGE);
      throw new Error(INSECURE_SECRET_MESSAGE);
    }
    case "critical_log": {
      logger(INSECURE_SECRET_MESSAGE);
      return decision;
    }
    case "ok":
    default:
      return "ok";
  }
}
