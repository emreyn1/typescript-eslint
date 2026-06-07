/**
 * Resolution cache — design component 14 ("Resolution + Manifest Cache"),
 * the OMSS source-resolution half of the public-scale economics.
 *
 * One in-memory, ephemeral cache that sits in front of the Aggregator so a
 * repeated request for the same title within the cache window is served
 * without re-scraping CinePro Core (Req 14.1), and concurrent identical
 * requests within that window collapse into a *single* Core call (request
 * coalescing, Resource Footprint §3).
 *
 * Validity rule (Req 14.5 + `AGGREGATOR_CACHE_TTL_MS`): a cached entry is
 * served while BOTH hold —
 *   1. `now < expiresAt` of the cached OMSS response (honor OMSS expiry,
 *      consistent with the single-refresh rule in Req 7.4), AND
 *   2. `now < storedAt + config.aggregatorCacheTtlMs` (the local reuse bound).
 * So the effective entry expiry is `min(OMSS.expiresAt, storedAt + ttl)`.
 * Once expired the title is re-resolved on the next request.
 *
 * Bypass: when `config.coreOmssCacheEnabled` is false the cache is fully
 * bypassed — every call invokes `resolve()` with no caching and no coalescing.
 *
 * Storage is a plain `Map` (in-memory, ephemeral); nothing is persisted.
 *
 * Requirements: 14.1, 14.5, Resource Footprint §3.
 */
import { config } from "../config.js";
import type { OmssResponse } from "../aggregator/client.js";

/** The two content kinds a title can be resolved as. */
export type TitleType = "movie" | "tv";

/**
 * Identity of a resolvable title. TV episodes carry `season`/`episode`; movies
 * leave them undefined. Two requests with equal {@link TitleKey} fields share
 * the same cache entry and the same in-flight resolution.
 */
export interface TitleKey {
  tmdbId: number;
  type: TitleType;
  season?: number;
  episode?: number;
}

/**
 * Build the canonical string used to key the cache and the in-flight map from
 * a {@link TitleKey}. Movies key as `movie:<id>`; TV episodes key as
 * `tv:<id>:<season>:<episode>` so different episodes never collide.
 */
export function titleKeyToString(key: TitleKey): string {
  if (key.type === "tv") {
    return `tv:${key.tmdbId}:${key.season ?? ""}:${key.episode ?? ""}`;
  }
  return `movie:${key.tmdbId}`;
}

/** A stored OMSS resolution plus the timestamps that bound its reuse. */
interface CacheEntry {
  response: OmssResponse;
  /** Epoch ms when the resolution was stored. */
  storedAt: number;
  /** Effective expiry = `min(OMSS.expiresAt, storedAt + aggregatorCacheTtlMs)`. */
  expiresAt: number;
}

/**
 * In-memory OMSS resolution cache with request coalescing.
 *
 * Reuse a single instance across routes so the cache and the in-flight map are
 * shared; the exported {@link resolutionCache} singleton is provided for that.
 */
export class ResolutionCache {
  /** Title key → fresh resolution. */
  private readonly entries = new Map<string, CacheEntry>();
  /** Title key → resolution currently in flight (for coalescing). */
  private readonly inflight = new Map<string, Promise<OmssResponse>>();

  /**
   * Serve a cached OMSS response for `key` when one is still valid, otherwise
   * invoke `resolve()` exactly once and cache the result. Concurrent calls for
   * the same `key` within the window await the same in-flight promise so Core
   * is hit only once (Req 14.1, Resource Footprint §3).
   *
   * When `config.coreOmssCacheEnabled` is false the cache is bypassed entirely:
   * `resolve()` is always called and nothing is stored or coalesced.
   */
  async getOrResolve(
    key: TitleKey,
    resolve: () => Promise<OmssResponse>
  ): Promise<OmssResponse> {
    // Cache disabled → always re-resolve, no caching/coalescing.
    if (!config.coreOmssCacheEnabled) {
      return resolve();
    }

    const keyStr = titleKeyToString(key);
    const now = Date.now();

    // 1. Serve a still-valid cached entry without touching Core (Req 14.5).
    const entry = this.entries.get(keyStr);
    if (entry && now < entry.expiresAt) {
      return entry.response;
    }

    // 2. A resolution is already in flight for this title → coalesce onto it.
    const pending = this.inflight.get(keyStr);
    if (pending) {
      return pending;
    }

    // 3. Miss/expired and nothing in flight → resolve once, share the promise.
    const promise = (async () => {
      const storedAt = Date.now();
      const response = await resolve();
      this.entries.set(keyStr, {
        response,
        storedAt,
        expiresAt: this.computeExpiry(response.expiresAt, storedAt),
      });
      return response;
    })().finally(() => {
      // Clear the in-flight slot whether the resolution succeeded or threw, so
      // a failed resolution does not pin a rejected promise forever.
      this.inflight.delete(keyStr);
    });

    this.inflight.set(keyStr, promise);
    return promise;
  }

  /** Drop all cached entries (in-flight resolutions are unaffected). */
  clear(): void {
    this.entries.clear();
  }

  /**
   * Effective entry expiry = `min(OMSS.expiresAt, storedAt + ttl)`.
   *
   * A missing/invalid OMSS `expiresAt` is treated as no OMSS bound, so the
   * local TTL governs alone. If OMSS `expiresAt` is already in the past the
   * entry is born expired and the next request re-resolves (Req 7.4 parity).
   */
  private computeExpiry(omssExpiresAt: string, storedAt: number): number {
    const ttlBound = storedAt + config.aggregatorCacheTtlMs;
    const omssBound = Date.parse(omssExpiresAt);
    if (Number.isNaN(omssBound)) {
      return ttlBound;
    }
    return Math.min(omssBound, ttlBound);
  }
}

/** Shared, process-wide resolution cache used by the `/embed` and `/watch` routes. */
export const resolutionCache = new ResolutionCache();
