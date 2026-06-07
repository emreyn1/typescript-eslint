/**
 * `/api/v1/*` protection — design component 12 §5 ("`/api/v1/*` protection",
 * Req 13.6).
 *
 * The public coin / heartbeat / referral endpoints (`/api/v1/heartbeat`,
 * `/api/v1/coins/*`, `/api/v1/referral/*`) are part of the public, abuse-
 * controlled surface. They reuse the **same per-IP rate limiter** as `/embed`
 * (api-scope keys, `config.apiRateLimitMaxPerIp`) and **validate the
 * fingerprint** carried by the request **before recording any coin / heartbeat
 * / referral effect**. A failed check is rejected with **no side effect**:
 *   - rate-limited            → **429** (no coin credited, no heartbeat
 *                                recorded, no referral linked),
 *   - fingerprint missing/bad → **403** (likewise no side effect).
 *
 * The protection is delivered as a reusable Fastify **preHandler**
 * ({@link apiV1Guard}). Because a preHandler that sends a reply short-circuits
 * the request, the route handler (which performs the DB side effect) never runs
 * on a rejected request — that is precisely the "no-side-effect-on-reject"
 * guarantee of Req 13.6. {@link apiV1Routes} wires the guard onto the
 * heartbeat / coins / referral routes.
 *
 * Scope note: the DB logic for these endpoints lives in the legacy compiled
 * `dist/routes/api.js` and is **out of scope** for this task. The route effects
 * are abstracted behind {@link ApiV1Effects} so the guard can be wired and
 * tested without binding to the database; an integrator supplies the real
 * effect implementations (or delegates to the existing handlers).
 *
 * Requirements: 13.6.
 */

import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
} from "fastify";
import { config } from "../config.js";
import { rateLimitKey, type RateLimiter } from "../security/index.js";

// ---------------------------------------------------------------------------
// Client IP extraction (mirrors the existing dist/routes/api.js behaviour)
// ---------------------------------------------------------------------------

/** Collapse a possibly multi-valued header to its first non-empty string value. */
function firstHeader(
  headers: FastifyRequest["headers"],
  name: string
): string | null {
  const raw = headers[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Resolve the client IP used for the per-IP rate-limit key. Prefers the
 * CDN-supplied `cf-connecting-ip`, then the first hop of `x-forwarded-for`,
 * then Fastify's `request.ip` — matching how the legacy API handlers derive the
 * caller's address so the limiter keys the true client behind Cloudflare.
 */
export function clientIpOf(req: FastifyRequest): string {
  const cf = firstHeader(req.headers, "cf-connecting-ip");
  if (cf !== null) return cf;
  const xff = firstHeader(req.headers, "x-forwarded-for");
  if (xff !== null) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.ip;
}

// ---------------------------------------------------------------------------
// Fingerprint extraction + validation (pure, testable)
// ---------------------------------------------------------------------------

/** Maximum accepted fingerprint length (guards against junk / oversized input). */
const FINGERPRINT_MAX_LEN = 128;
/** Minimum accepted fingerprint length (the referral logic slices 8 chars). */
const FINGERPRINT_MIN_LEN = 8;
/**
 * Allowed fingerprint charset. The player's `fingerprintScript` emits a base36
 * hash (`[a-z0-9]`); browser/cinex fingerprints may be longer hex/base62 with
 * `-`/`_` separators. We accept that conservative alphanumeric-plus-separator
 * set and reject anything else (whitespace, punctuation, control chars) so a
 * malformed/forged token is refused before any effect runs.
 */
const FINGERPRINT_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Pull the fingerprint a request carries, checking the conventional locations
 * the existing API handlers use: the JSON body (`fingerprint` on POSTs, `fp` as
 * an alias), the query string (`fp`/`fingerprint` on GETs), and finally an
 * `x-fingerprint` header. Returns the raw (untrimmed) value or `null`.
 */
export function extractFingerprint(req: FastifyRequest): string | null {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const query = (req.query ?? {}) as Record<string, unknown>;

  const candidate =
    body["fingerprint"] ??
    body["fp"] ??
    query["fingerprint"] ??
    query["fp"] ??
    firstHeader(req.headers, "x-fingerprint");

  return typeof candidate === "string" ? candidate : null;
}

/**
 * Pure, total fingerprint validity check: present, well-formed, and within the
 * accepted length/charset bounds. This is the Req 13.6 "validate the
 * fingerprint" gate; it intentionally does not touch the DB.
 */
export function isValidFingerprint(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  const fp = value.trim();
  if (fp.length < FINGERPRINT_MIN_LEN || fp.length > FINGERPRINT_MAX_LEN) {
    return false;
  }
  return FINGERPRINT_PATTERN.test(fp);
}

// ---------------------------------------------------------------------------
// The guard (reusable Fastify preHandler)
// ---------------------------------------------------------------------------

/** Tuning / test seams for {@link apiV1Guard}. */
export interface ApiV1GuardOptions {
  /** Injectable clock for the rate-limit window (defaults to `Date.now`). */
  now?: () => number;
}

/**
 * Build the `/api/v1/*` protection preHandler from the shared rate limiter.
 *
 * Order of checks (both run **before** the route handler / any side effect):
 *   1. **Per-IP rate limit** (`config.apiRateLimitMaxPerIp`, api-scope key via
 *      `rateLimitKey("api", "ip", ip)`). Over budget → **429**. A counter-store
 *      error **fails closed** to 429 so an outage never grants unbounded
 *      coin/heartbeat/referral writes.
 *   2. **Fingerprint validation** ({@link isValidFingerprint}). Missing or
 *      malformed → **403**.
 *
 * On any rejection the preHandler sends the reply and returns, so Fastify never
 * invokes the route handler — guaranteeing no coin is credited, no heartbeat is
 * recorded, and no referral is linked (Req 13.6).
 */
export function apiV1Guard(
  rateLimiter: RateLimiter,
  options: ApiV1GuardOptions = {}
): preHandlerHookHandler {
  const clock = options.now ?? Date.now;

  return async function guard(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // --- Gate 1: per-IP rate limit (Req 13.6) -----------------------------
    const ip = clientIpOf(req);
    let allowed: boolean;
    try {
      const result = await rateLimiter.check(rateLimitKey("api", "ip", ip), clock());
      allowed = result.allowed;
    } catch {
      // Fail closed: a counter-store outage must not open the write endpoints.
      allowed = false;
    }
    if (!allowed) {
      // 429 with no side effect — the route handler never runs.
      await reply
        .status(429)
        .send({ error: "rate_limited", message: "Too many requests" });
      return;
    }

    // --- Gate 2: fingerprint validation (Req 13.6) ------------------------
    if (!isValidFingerprint(extractFingerprint(req))) {
      // 403 with no side effect — the route handler never runs.
      await reply
        .status(403)
        .send({ error: "invalid_fingerprint", message: "Missing or malformed fingerprint" });
      return;
    }

    // Both checks passed — fall through to the route handler.
  };
}

// ---------------------------------------------------------------------------
// Protected route wiring
// ---------------------------------------------------------------------------

/**
 * The side-effecting call points behind `/api/v1/*`. The real implementations
 * (the coin/heartbeat/referral DB writes) live in the legacy compiled
 * `dist/routes/api.js` and are out of scope here; an integrator injects them so
 * the guard wiring stays independent of the database. Each handler is only ever
 * reached **after** the guard has passed (Req 13.6).
 */
export interface ApiV1Effects {
  heartbeat(req: FastifyRequest, reply: FastifyReply): Promise<unknown> | unknown;
  coinsBalance(req: FastifyRequest, reply: FastifyReply): Promise<unknown> | unknown;
  coinsSpend(req: FastifyRequest, reply: FastifyReply): Promise<unknown> | unknown;
  referralStats(req: FastifyRequest, reply: FastifyReply): Promise<unknown> | unknown;
  referralLink(req: FastifyRequest, reply: FastifyReply): Promise<unknown> | unknown;
}

/** Options for {@link apiV1Routes}. */
export interface ApiV1RoutesOptions {
  /** The shared rate limiter (built via `createRateLimiter`, task 10.1). */
  rateLimiter: RateLimiter;
  /** The injected side-effect handlers (out-of-scope DB logic). */
  effects: ApiV1Effects;
  /** Tuning / test seams forwarded to {@link apiV1Guard}. */
  guardOptions?: ApiV1GuardOptions;
}

/**
 * Register the protected `/api/v1/*` coin / heartbeat / referral routes with the
 * {@link apiV1Guard} applied as a per-route `preHandler`. The guard enforces the
 * per-IP rate limit and fingerprint validation before each handler runs, so a
 * rejected request produces no coin/heartbeat/referral side effect (Req 13.6).
 *
 * Matches the existing route style (`async function(app)` registering handlers
 * on the passed instance). The protected endpoints mirror those in
 * `dist/routes/api.js`:
 *   - `POST /api/v1/heartbeat`      → watch-to-earn coin accrual
 *   - `GET  /api/v1/coins/balance`  → coin balance read
 *   - `POST /api/v1/coins/spend`    → coin spend
 *   - `GET  /api/v1/referral/stats` → referral stats read
 *   - `POST /api/v1/referral/link`  → referral linking
 */
export async function apiV1Routes(
  app: FastifyInstance,
  options: ApiV1RoutesOptions
): Promise<void> {
  const { rateLimiter, effects, guardOptions } = options;
  const preHandler = apiV1Guard(rateLimiter, guardOptions);

  app.log.info(
    { apiRateLimitMaxPerIp: config.apiRateLimitMaxPerIp },
    "registering protected /api/v1/* routes"
  );

  app.post("/api/v1/heartbeat", { preHandler }, async (req, reply) =>
    effects.heartbeat(req, reply)
  );
  app.get("/api/v1/coins/balance", { preHandler }, async (req, reply) =>
    effects.coinsBalance(req, reply)
  );
  app.post("/api/v1/coins/spend", { preHandler }, async (req, reply) =>
    effects.coinsSpend(req, reply)
  );
  app.get("/api/v1/referral/stats", { preHandler }, async (req, reply) =>
    effects.referralStats(req, reply)
  );
  app.post("/api/v1/referral/link", { preHandler }, async (req, reply) =>
    effects.referralLink(req, reply)
  );
}
