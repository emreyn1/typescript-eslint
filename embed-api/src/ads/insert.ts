/**
 * Ad Insertion (Public_Embed surface only) — design component 13.
 *
 * Wraps the existing ad-bumper / VAST infrastructure (`ads/bumper.js`,
 * `AD_VAST_URL`, `AD_BUMPER_ENABLED`) behind a single pure decision
 * (`adConfigFor`) plus a markup builder (`renderAdBumper`) that fills the
 * `{{AD_BUMPER}}` placeholder in `player-v2.html`.
 *
 * Policy split (Req 11.x): the decision is driven entirely by the
 * {@link SurfacePolicy} produced by the Policy Resolver, so `/watch` can never
 * become ad-supported and `/embed` is gated again by `AD_BUMPER_ENABLED`.
 *
 * CWV (Req 10.5): the injected markup is minimal and the bumper/VAST wiring is
 * loaded **deferred/async**, firing the VAST request only after the player
 * shell paints — so the ad path never blocks LCP and keeps INP/CLS stable.
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4, 10.5.
 */
import { config } from "../config.js";
import type { SurfacePolicy } from "../policy/index.js";

/** The resolved ad configuration for a single rendered player. */
export interface AdConfig {
  /** Whether the ad bumper is active for this player. */
  bumper: boolean;
  /** VAST tag URL to use, or `null` when no VAST tag applies. */
  vastUrl: string | null;
}

/**
 * Pure decision over `(surface, AD_BUMPER_ENABLED, AD_VAST_URL)`.
 *
 * - bumper is enabled **iff** `policy.adSupported` (the `public_embed` surface)
 *   **and** `config.adBumperEnabled` (Req 12.1, 12.4);
 * - `vastUrl` is attached **iff** the bumper is enabled **and**
 *   `config.adVastUrl` is configured (Req 12.2);
 * - the `cinex_watch` surface (`policy.adSupported === false`) **always**
 *   returns `{ bumper: false, vastUrl: null }` regardless of `AD_BUMPER_ENABLED`
 *   (Req 12.3).
 */
export function adConfigFor(policy: SurfacePolicy): AdConfig {
  if (!policy.adSupported || !config.adBumperEnabled) {
    return { bumper: false, vastUrl: null };
  }
  const vast = config.adVastUrl.trim();
  return { bumper: true, vastUrl: vast === "" ? null : vast };
}

/**
 * Escape a string for safe inline embedding inside a `<script>` block:
 * JSON-encode it and neutralise any `<`/`>` so a hostile/quirky `AD_VAST_URL`
 * cannot break out of the script context (e.g. a literal `</script>`).
 */
function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Build the `{{AD_BUMPER}}` substitution string for `player-v2.html`.
 *
 * When the bumper is enabled for this surface, emit the **deferred/async**
 * ad-bumper wiring: a tiny config blob plus a script that defers the VAST
 * request until after the player shell has painted (one `requestAnimationFrame`
 * past the `load` event), so it never blocks LCP (CWV-light, Req 10.5). When the
 * bumper is disabled (every `/watch` request, and `/embed` with
 * `AD_BUMPER_ENABLED=false`), emit the empty string so the placeholder is
 * replaced with nothing (Req 12.3, 12.4).
 *
 * The markup intentionally references the existing bumper/VAST infrastructure
 * via a small global (`window.__EMBED_AD_BUMPER__`) that the deferred wiring
 * consumes; the heavy lifting (HLS bumper-segment injection) already lives
 * server-side in `ads/bumper.js` and is keyed off the same `AD_BUMPER_ENABLED`
 * flag, so this client wiring stays minimal.
 */
export function renderAdBumper(policy: SurfacePolicy): string {
  const ad = adConfigFor(policy);
  if (!ad.bumper) return "";

  const blob = jsonForScript({ enabled: true, vastUrl: ad.vastUrl });

  // Minimal, deferred, non-blocking. No external <script src> on the critical
  // path; the VAST request (if any) fires after first paint via rAF.
  return `<!-- ad-bumper (public embed surface; deferred, CWV-light) -->
<script>
  window.__EMBED_AD_BUMPER__ = ${blob};
  (function () {
    var cfg = window.__EMBED_AD_BUMPER__;
    if (!cfg || !cfg.enabled) return;
    function fireBumper() {
      // Defer one frame past load so the player shell paints first (no LCP block).
      (window.requestAnimationFrame || function (cb) { setTimeout(cb, 0); })(function () {
        if (!cfg.vastUrl) return; // bumper on, but no VAST tag configured
        try {
          var beacon = new Image();
          beacon.referrerPolicy = 'no-referrer';
          beacon.src = cfg.vastUrl;
        } catch (e) { /* ad failures must never break playback */ }
      });
    }
    if (document.readyState === 'complete') {
      fireBumper();
    } else {
      window.addEventListener('load', fireBumper, { once: true });
    }
  })();
</script>`;
}
