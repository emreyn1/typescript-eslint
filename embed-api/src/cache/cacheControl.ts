/**
 * Cache-control header matrix — design component 14 ("Resolution + Manifest
 * Cache"), the invariant behind **Property 15**.
 *
 * A pure, total helper that maps a `(responseKind, surface)` pair to the exact
 * `Cache-Control` header value the route/proxy must emit. It is the single
 * source of truth for the caching policy so the rule cannot drift between the
 * player route, the `/stream` proxy, and the CDN:
 *
 *   | Response       | `public_embed` (`/embed`)                       | `cinex_watch` (`/watch`) |
 *   |----------------|-------------------------------------------------|--------------------------|
 *   | `manifest`     | `public, max-age=<config.manifestCacheTtlSec>`  | `private, no-cache`      |
 *   | `segment`      | `no-store`                                      | `no-store`               |
 *   | `session_token`| `no-store`                                      | `no-store`               |
 *
 * The invariant: a manifest is CDN-cacheable **iff** the surface is
 * `public_embed`; every `segment` and every `session_token` is `no-store` on
 * every surface. No input yields a cacheable segment or token.
 *
 * Requirements: 14.2, 14.3.
 */
import { config } from "../config.js";
import type { Surface } from "../policy/index.js";

/** The kind of response whose cache policy is being decided. */
export type ResponseKind = "manifest" | "segment" | "session_token";

/** The fixed value used for everything that must never be cached. */
const NO_STORE = "no-store";

/**
 * Return the `Cache-Control` header value for a `(responseKind, surface)` pair.
 *
 * - `manifest` on `public_embed` → `public, max-age=<config.manifestCacheTtlSec>`
 *   (CDN-cacheable so Cloudflare serves hot titles from the edge, Req 14.2);
 * - `manifest` on `cinex_watch` → `private, no-cache` (first-party, not edge-cached);
 * - every `segment` and every `session_token`, on every surface → `no-store`
 *   (Req 14.3) — there is no input under which a segment or token is cacheable.
 *
 * Pure and deterministic: depends only on its arguments and the configured
 * `manifestCacheTtlSec`.
 */
export function cacheControlFor(responseKind: ResponseKind, surface: Surface): string {
  if (responseKind === "manifest") {
    return surface === "public_embed"
      ? `public, max-age=${config.manifestCacheTtlSec}`
      : "private, no-cache";
  }
  // segment | session_token — never cacheable on any surface (Req 14.3).
  return NO_STORE;
}
