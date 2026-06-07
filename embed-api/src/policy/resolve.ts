/**
 * Policy Resolver — the single source of truth mapping an incoming route prefix
 * to a {@link SurfacePolicy}. It is the one place that decides "ads or not /
 * abuse controls or not / CDN-cacheable manifests or not", so the two delivery
 * surfaces (public `/embed` and first-party cinex `/watch`) cannot drift apart
 * or accidentally swap policies.
 *
 * Requirements: 11.1, 11.2, 11.5 (design "Surfaces & Policy", component 11).
 */

/** The two delivery surfaces served by the same backend. */
export type Surface = "public_embed" | "cinex_watch";

/**
 * The policy that applies to a request, keyed entirely by the route prefix.
 *
 * - `adSupported`   marks *eligibility* for ads only (true ⇔ `public_embed`).
 *                   Actual ad rendering is gated again at render time by
 *                   `AD_BUMPER_ENABLED` (Req 12.4) in the Ad Insertion layer.
 * - `abuseControls` true ⇔ `public_embed` (rate limit + Turnstile + referer
 *                   allowlist + HMAC/fingerprint stream gate).
 * - `cdnCacheManifests` true ⇔ `public_embed` (edge-cacheable manifests).
 */
export interface SurfacePolicy {
  surface: Surface;
  adSupported: boolean;
  abuseControls: boolean;
  cdnCacheManifests: boolean;
}

/** The only route prefixes the resolver maps. */
export type RoutePrefix = "/embed" | "/watch";

/**
 * Pure, total mapping from a route prefix to its {@link SurfacePolicy}.
 *
 * `/embed` → ad-supported, abuse-controlled, CDN-cacheable public surface.
 * `/watch` → ad-free, ungated, non-cached first-party cinex surface.
 *
 * No other input (including `publicEmbedEnabled`) changes this mapping: it is
 * the single source of truth so the two surfaces cannot drift or swap policies.
 */
export function resolvePolicy(prefix: RoutePrefix): SurfacePolicy {
  return prefix === "/embed"
    ? {
        surface: "public_embed",
        adSupported: true,
        abuseControls: true,
        cdnCacheManifests: true,
      }
    : {
        surface: "cinex_watch",
        adSupported: false,
        abuseControls: false,
        cdnCacheManifests: false,
      };
}
