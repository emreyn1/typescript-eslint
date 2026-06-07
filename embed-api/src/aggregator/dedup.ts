// Stream-identity deduplication for aggregated OMSS sources.
//
// Task 4.2 (embed-omss-backend): collapse duplicate sources that resolve to the
// same underlying stream so the reported source count reflects *distinct*
// streams (Requirement 1.5; design "Source Aggregation Model" dedup section).
//
// The canonical source shape is `OmssSource` from `./client.ts` (built in
// parallel). To keep this module buildable on its own — and to avoid coupling
// dedup to the full OMSS type — the functions are generic over the minimal
// structural shape they actually need. `OmssSource` is assignable to
// `StreamIdentitySource`, so callers can pass an `OmssSource[]` directly:
//
//   import type { OmssSource } from "./client.js";
//   const distinct = dedup(response.sources); // OmssSource[] -> OmssSource[]

/**
 * Minimal structural shape required to compute a stream identity. Matches the
 * relevant subset of `OmssSource` (`{ url, type, quality?, provider }`).
 */
export interface StreamIdentitySource {
  /** Stream URL — typically a CinePro proxy path (`/v1/proxy?data=...`). */
  url: string;
  /** Stream container/protocol (`hls` | `dash` | `http` | `mp4` | ...). */
  type: string;
  /** Optional quality label, e.g. "1080p", "720p", "auto". */
  quality?: string;
  /** Originating provider attribution. */
  provider: { id: string; name: string };
}

/**
 * Query parameters that are volatile (per-request tokens, expiry, signatures)
 * and therefore MUST NOT contribute to a stable stream identity. Two URLs that
 * differ only in these params point at the same stream and should collapse.
 * Compared case-insensitively.
 */
const VOLATILE_PARAM_KEYS: ReadonlySet<string> = new Set([
  "token",
  "access_token",
  "expires",
  "expire",
  "exp",
  "sig",
  "signature",
  "hash",
  "hmac",
  "nonce",
  "ts",
  "timestamp",
]);

// Sentinel base used to parse relative URLs (e.g. "/v1/proxy?data=..."). The
// host is constant for all relative inputs, so path + query still discriminate.
const RELATIVE_BASE = "http://stream.local";
const RELATIVE_HOST = "stream.local";

function isVolatileParam(key: string): boolean {
  return VOLATILE_PARAM_KEYS.has(key.toLowerCase());
}

/**
 * Normalize a URL into a stable identity string:
 *   scheme + host(+port) + path + sorted, volatile-free query.
 * Returns `null` when the input is empty or cannot be parsed into a URL with a
 * meaningful path/query (an "opaque" URL), signalling the caller to fall back
 * to provider/type/quality identity.
 */
function normalizeUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (trimmed === "") {
    return null;
  }

  let parsed: URL;
  let isRelative = false;
  try {
    parsed = new URL(trimmed);
  } catch {
    // Retry as a relative URL (paths like "/v1/proxy?data=...").
    try {
      parsed = new URL(trimmed, RELATIVE_BASE);
      isRelative = true;
    } catch {
      return null;
    }
  }

  // A relative URL with no path and no query is opaque (e.g. "?" or "#frag").
  if (isRelative && (parsed.pathname === "" || parsed.pathname === "/") && parsed.search === "") {
    return null;
  }

  const scheme = isRelative ? "" : parsed.protocol.toLowerCase();
  const host = isRelative ? "" : parsed.host.toLowerCase();

  // Normalize the path: collapse a single trailing slash (but keep root "/").
  let path = parsed.pathname;
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  // Rebuild the query from non-volatile params, sorted deterministically by
  // key then value so param ordering never affects identity.
  const kept: Array<[string, string]> = [];
  for (const [key, value] of parsed.searchParams.entries()) {
    if (!isVolatileParam(key)) {
      kept.push([key, value]);
    }
  }
  kept.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
  const query = kept.map(([k, v]) => `${k}=${v}`).join("&");

  const hostPart = isRelative ? RELATIVE_HOST : `${scheme}//${host}`;
  return query === "" ? `${hostPart}${path}` : `${hostPart}${path}?${query}`;
}

/**
 * Compute a stable stream-identity key for a source.
 *
 * Primary identity is the normalized resolved URL (scheme + host + path +
 * sorted query, excluding volatile/expiry params). When the URL is opaque or
 * empty, falls back to `(type, quality, providerId)`. Keys are prefixed by kind
 * so a URL identity can never collide with a fallback identity.
 *
 * Exported for use in tests and provider attribution.
 */
export function streamIdentityKey(source: StreamIdentitySource): string {
  const normalized = normalizeUrl(source.url);
  if (normalized !== null) {
    return `url:${normalized}`;
  }
  const type = source.type ?? "";
  const quality = source.quality ?? "";
  const providerId = source.provider?.id ?? "";
  return `meta:${JSON.stringify([type, quality, providerId])}`;
}

/**
 * Collapse duplicate sources that resolve to the same stream identity.
 *
 * - Preserves the first occurrence of each distinct identity (order-stable).
 * - Keeps every distinct identity (no over-collapsing across real streams).
 * - Pure and idempotent: `dedup(dedup(x))` deep-equals `dedup(x)`.
 *
 * Requirement 1.5.
 */
export function dedup<T extends StreamIdentitySource>(sources: readonly T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const source of sources) {
    const key = streamIdentityKey(source);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(source);
    }
  }
  return result;
}
