/**
 * Rate limiter — a **pure decision function** split from a **stateful counter
 * store**, so the decision can be property-tested in isolation (design
 * component 12 §1; "Rate-limit counter" data model).
 *
 * Layout:
 *   1. `rateLimitDecision(...)` — pure, total: given a window's `(count,
 *      windowStart)` and the current `now`, decides `allowed` purely from
 *      `count <= threshold` *within the current window*. Counts from an
 *      already-elapsed window do not affect the decision (window rollover
 *      resets). Depends only on its inputs (Property 16).
 *   2. `CounterStore` — increments/reads the ephemeral per-key window counter.
 *      Two interchangeable backends selected by `config.rateLimitBackend`:
 *        - `memory` (default): a sweeping `Map<key, RateWindow>` (cheap-VPS).
 *        - `redis` (optional dep, via `config.redisUrl`): `INCR` + `EXPIRE`.
 *      Counters are ephemeral — losing them on restart only resets windows,
 *      which is acceptable; they are NEVER persisted to the durable store.
 *   3. `RateLimiter.check(key, now)` — reads/increments the counter for `key`
 *      and applies the pure decision using the threshold derived from the key.
 *
 * Keys are formed as `${scope}:${identity}:${value}` where
 * `scope ∈ {embed, api}` and `identity ∈ {ip, referer}` (the `${scope}:${identity}`
 * prefix selects the threshold; the trailing value isolates the client).
 *
 * Requirements: 13.1 (per-IP / per-referer rate limit on the public surface),
 * 13.6 (per-IP rate limit on `/api/v1/*`).
 */

import type { Config, RateLimitBackend } from "../config.js";

// ---------------------------------------------------------------------------
// 1. Pure decision function (Property 16)
// ---------------------------------------------------------------------------

/** Inputs to the pure rate-limit decision. All times are epoch milliseconds. */
export interface RateLimitDecisionInput {
  /** Requests recorded in the window that began at `windowStart` (incl. this one). */
  count: number;
  /** Epoch-ms start of the counter's current window. */
  windowStart: number;
  /** Epoch-ms timestamp of the request being decided. */
  now: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Maximum allowed requests per window. */
  threshold: number;
}

/** Result of a rate-limit decision. */
export interface RateLimitResult {
  /** `true` ⇔ the request is within the allowed budget for the current window. */
  allowed: boolean;
  /** Remaining budget in the current window (never negative). */
  remaining: number;
  /** Epoch-ms at which the current window resets. */
  resetAt: number;
}

/**
 * Pure, total rate-limit decision.
 *
 * `allowed = effectiveCount <= threshold`, where `effectiveCount` is the count
 * *within the current window*:
 *  - If the stored window has elapsed (`now >= windowStart + windowMs`), the
 *    window has rolled over: the stale `count` is discarded and this request
 *    starts a fresh window counted as 1 (so it is allowed whenever
 *    `threshold >= 1`), resetting at `now + windowMs`.
 *  - Otherwise the request falls inside the existing window: the decision uses
 *    the supplied `count` and the window resets at `windowStart + windowMs`.
 *
 * Depends only on its inputs — no clock, no I/O — so it is deterministic and
 * property-testable (Property 16). Requirements: 13.1, 13.6.
 */
export function rateLimitDecision({
  count,
  windowStart,
  now,
  windowMs,
  threshold,
}: RateLimitDecisionInput): RateLimitResult {
  const windowEnd = windowStart + windowMs;
  const rolledOver = now >= windowEnd;

  // Counts outside the current window don't affect the decision: a rolled-over
  // window restarts at 1 (this request).
  const effectiveCount = rolledOver ? 1 : count;
  const resetAt = rolledOver ? now + windowMs : windowEnd;

  const allowed = effectiveCount <= threshold;
  const remaining = Math.max(0, threshold - effectiveCount);

  return { allowed, remaining, resetAt };
}

// ---------------------------------------------------------------------------
// 2. Counter store (stateful, ephemeral)
// ---------------------------------------------------------------------------

/** A single key's window counter (ephemeral; never persisted to the report store). */
export interface RateWindow {
  count: number;
  windowStart: number;
}

/**
 * The stateful counter store behind the pure decision. Implementations record
 * one request against `key` and return the resulting `(count, windowStart)` for
 * the current window so the caller can apply {@link rateLimitDecision}.
 */
export interface CounterStore {
  /**
   * Record one request against `key` at `now` and return the window state.
   * Implementations are responsible for window rollover (a request arriving
   * after the window elapsed starts a new window at `count = 1`).
   */
  increment(key: string, now: number, windowMs: number): Promise<RateWindow>;
  /** Release any backend resources (no-op for memory). */
  close?(): Promise<void>;
}

/**
 * In-memory counter store: a sweeping `Map<key, RateWindow>`. Default backend,
 * sized for a single cheap VPS. Stale windows are swept lazily on access and,
 * optionally, periodically via {@link sweep}.
 */
export class MemoryCounterStore implements CounterStore {
  private readonly windows = new Map<string, RateWindow>();

  async increment(key: string, now: number, windowMs: number): Promise<RateWindow> {
    const existing = this.windows.get(key);
    if (existing === undefined || now >= existing.windowStart + windowMs) {
      // Fresh window (no entry, or the previous window has elapsed).
      const fresh: RateWindow = { count: 1, windowStart: now };
      this.windows.set(key, fresh);
      return { ...fresh };
    }
    existing.count += 1;
    return { ...existing };
  }

  /** Drop windows that have fully elapsed, keeping the Map small. */
  sweep(now: number, windowMs: number): void {
    for (const [key, win] of this.windows) {
      if (now >= win.windowStart + windowMs) {
        this.windows.delete(key);
      }
    }
  }

  /** Current number of tracked windows (testing/observability). */
  get size(): number {
    return this.windows.size;
  }
}

/** Minimal shape of the parts of the `redis` client we use (lazy-loaded). */
interface RedisLikeClient {
  connect(): Promise<unknown>;
  quit(): Promise<unknown>;
  incr(key: string): Promise<number>;
  pExpire(key: string, ms: number): Promise<unknown>;
  pTTL(key: string): Promise<number>;
}

/**
 * Redis-backed counter store using `INCR` + `EXPIRE` fixed windows. The
 * `redis` package is an **optional dependency** and is **lazy-loaded** only
 * when this backend is selected, so memory-only deployments never need it.
 *
 * The first `INCR` of a window sets the key's expiry to `windowMs`; redis then
 * auto-expires the key at the window end, so the returned `count` is always the
 * within-window count. `windowStart` is reconstructed from the remaining TTL so
 * the pure decision computes an accurate `resetAt`.
 */
export class RedisCounterStore implements CounterStore {
  private constructor(private readonly client: RedisLikeClient) {}

  /** Lazy-load `redis`, connect, and construct the store. */
  static async create(redisUrl: string): Promise<RedisCounterStore> {
    // Lazy import: only pulled in when the redis backend is actually selected.
    const redis = (await import("redis")) as unknown as {
      createClient(opts: { url: string }): RedisLikeClient;
    };
    const client = redis.createClient({ url: redisUrl });
    await client.connect();
    return new RedisCounterStore(client);
  }

  async increment(key: string, now: number, windowMs: number): Promise<RateWindow> {
    const count = await this.client.incr(key);
    let pttl: number;
    if (count === 1) {
      // First hit of a new window — arm the expiry so redis rolls it over.
      await this.client.pExpire(key, windowMs);
      pttl = windowMs;
    } else {
      pttl = await this.client.pTTL(key);
      if (pttl < 0) {
        // Key had no expiry (e.g. survived a code change) — re-arm it.
        await this.client.pExpire(key, windowMs);
        pttl = windowMs;
      }
    }
    // windowEnd = now + pttl  ⇒  windowStart = now - (windowMs - pttl).
    const windowStart = now - (windowMs - pttl);
    return { count, windowStart };
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}

/**
 * Build the configured counter store. `redis` is selected only when
 * `config.rateLimitBackend === "redis"`; otherwise the in-memory store is used.
 */
export async function createCounterStore(
  backend: RateLimitBackend,
  redisUrl: string
): Promise<CounterStore> {
  if (backend === "redis") {
    if (!redisUrl) {
      throw new Error(
        "[rateLimiter] RATE_LIMIT_BACKEND=redis requires REDIS_URL to be set."
      );
    }
    return RedisCounterStore.create(redisUrl);
  }
  return new MemoryCounterStore();
}

// ---------------------------------------------------------------------------
// 3. Key parsing, thresholds, and the RateLimiter
// ---------------------------------------------------------------------------

/** Scopes a rate-limit key can belong to. */
export type RateLimitScope = "embed" | "api";
/** Identity a rate-limit key is keyed by. */
export type RateLimitIdentity = "ip" | "referer";

/** Per-scope/identity request thresholds (max requests per window). */
export interface RateLimitThresholds {
  embedIp: number;
  embedReferer: number;
  apiIp: number;
  apiReferer: number;
}

/**
 * Build a counter key: `${scope}:${identity}:${value}`. The `${scope}:${identity}`
 * prefix selects the threshold; the trailing `value` (IP address or referer
 * host) isolates the individual client.
 */
export function rateLimitKey(
  scope: RateLimitScope,
  identity: RateLimitIdentity,
  value: string
): string {
  return `${scope}:${identity}:${value}`;
}

/**
 * Resolve the threshold for a key from its `${scope}:${identity}` prefix.
 * Unknown prefixes fall back to the most restrictive configured threshold so a
 * malformed key never grants an unbounded budget.
 */
export function thresholdForKey(key: string, thresholds: RateLimitThresholds): number {
  const [scope, identity] = key.split(":");
  if (scope === "embed" && identity === "ip") return thresholds.embedIp;
  if (scope === "embed" && identity === "referer") return thresholds.embedReferer;
  if (scope === "api" && identity === "ip") return thresholds.apiIp;
  if (scope === "api" && identity === "referer") return thresholds.apiReferer;
  return Math.min(
    thresholds.embedIp,
    thresholds.embedReferer,
    thresholds.apiIp,
    thresholds.apiReferer
  );
}

/** Construction options for {@link RateLimiter}. */
export interface RateLimiterOptions {
  store: CounterStore;
  /** Fixed window length in milliseconds. */
  windowMs: number;
  thresholds: RateLimitThresholds;
}

/**
 * The stateful rate limiter: it owns the counter {@link CounterStore} and
 * applies the pure {@link rateLimitDecision} using the threshold derived from
 * the key. `check(key, now)` records the request and returns the decision.
 */
export class RateLimiter {
  private readonly store: CounterStore;
  private readonly windowMs: number;
  private readonly thresholds: RateLimitThresholds;

  constructor(options: RateLimiterOptions) {
    this.store = options.store;
    this.windowMs = options.windowMs;
    this.thresholds = options.thresholds;
  }

  /**
   * Record one request against `key` at `now` and return whether it is allowed.
   * `key` should be built via {@link rateLimitKey}; the threshold is selected
   * from its `${scope}:${identity}` prefix.
   */
  async check(key: string, now: number): Promise<RateLimitResult> {
    const { count, windowStart } = await this.store.increment(key, now, this.windowMs);
    const threshold = thresholdForKey(key, this.thresholds);
    return rateLimitDecision({
      count,
      windowStart,
      now,
      windowMs: this.windowMs,
      threshold,
    });
  }

  /** Release backend resources. */
  async close(): Promise<void> {
    await this.store.close?.();
  }
}

/**
 * Wire a {@link RateLimiter} from the app config: pick the counter-store
 * backend (`memory` default, `redis` optional via `config.redisUrl`), convert
 * `rateLimitWindowSec` to milliseconds, and load the per-scope thresholds
 * (`rateLimitMaxPerIp`, `rateLimitMaxPerReferer`, `apiRateLimitMaxPerIp`).
 */
export async function createRateLimiter(config: Config): Promise<RateLimiter> {
  const store = await createCounterStore(config.rateLimitBackend, config.redisUrl);
  return new RateLimiter({
    store,
    windowMs: config.rateLimitWindowSec * 1000,
    thresholds: {
      embedIp: config.rateLimitMaxPerIp,
      embedReferer: config.rateLimitMaxPerReferer,
      apiIp: config.apiRateLimitMaxPerIp,
      // `/api/v1/*` is per-IP per design; reuse the embed per-referer cap if a
      // referer-scoped api key is ever formed.
      apiReferer: config.rateLimitMaxPerReferer,
    },
  });
}
