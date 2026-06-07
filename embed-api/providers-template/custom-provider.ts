/* =============================================================================
 * CinePro Core provider — WORKED SAMPLE / COPY-PASTE TEMPLATE
 * -----------------------------------------------------------------------------
 * Authored by us (embed-omss-backend) for deployment INTO CinePro Core.
 *
 * WHERE THIS FILE LIVES AT RUNTIME
 *   This file is NOT part of embed-api. It is a self-contained template intended
 *   to be dropped into the CinePro Core container at:
 *
 *       CinePro Core: src/providers/custom-provider.ts
 *
 *   CinePro Core (ghcr.io/cinepro-org/core:latest, built on @omss/framework)
 *   auto-discovers every `BaseProvider` subclass in its `src/providers/`
 *   directory at startup and registers each one where `enabled === true`
 *   (Req 1.3, 1.4). No engine code changes are needed — adding a provider is
 *   just dropping a file like this one in and restarting Core.
 *
 *   It lives under embed-api/providers-template/ (OUTSIDE embed-api's `src/`) on
 *   purpose: embed-api's tsconfig only compiles `src/**`, and `@omss/framework`
 *   is not a dependency of embed-api, so this file is intentionally excluded
 *   from `npm run build`. It is documentation + a ready-to-author template, not
 *   compiled application code in this repo.
 *
 * HOW TO AUTHOR A NEW PROVIDER FROM THIS TEMPLATE
 *   1. Copy this file to `src/providers/<your-provider>.ts` inside CinePro Core.
 *   2. Rename the class and set a unique, STABLE `id` (see contract below).
 *   3. Point `BASE_URL` / `HEADERS` at the embed host you are scraping.
 *   4. Replace the `extractStream` stub with the provider-specific scraping that
 *      pulls the playable stream URL out of the fetched page/JSON.
 *   5. Leave `getMovieSources` / `getTVSources` returning `[]` on a miss, and
 *      always wrap the playable URL in `this.createProxyUrl(...)`.
 *
 * AUTHORING CONTRACT (what makes the working-source count grow SAFELY)
 *   • id — unique + stable. It is the key used for attribution (Req 1.6), dedup
 *     tie-breaking, and unhealthy-provider exclusion (Req 2.6). Never reuse or
 *     churn an id: changing it orphans health history and attribution.
 *   • getMovieSources / getTVSources MUST return `[]` on any miss/failure and
 *     MUST NOT throw past the registry (Req 1.7). One provider's miss must never
 *     block the union of all the others — catch your own errors and return [].
 *   • ALWAYS produce the playable `url` via `this.createProxyUrl(rawUrl, HEADERS)`.
 *     This routes every byte through Core's `/v1/proxy` (and then embed-api's
 *     `/stream`), keeping the required upstream headers attached and the upstream
 *     host hidden from the client.
 *   • Disable without deleting by setting `enabled = false` — the file stays in
 *     `src/providers/` but the registry skips it at discovery. A provider that
 *     consistently fails health checks is excluded from aggregation by config
 *     (Req 2.6) and is a candidate to disable or delete to keep the set clean.
 *
 * Validates / supports: Requirements 1.3, 1.4, 1.7.
 * =============================================================================
 */

// NOTE: `@omss/framework` is provided by the CinePro Core container, not by
// embed-api. These imports resolve inside Core; they intentionally do not
// resolve in this repo (this template is excluded from embed-api's build).
import { BaseProvider, type TitleContext, type Source } from "@omss/framework";

/**
 * The shape `extractStream` is expected to return. This is local to the
 * template — replace/extend it to match whatever your scraping yields.
 */
interface ExtractedStream {
  /** The raw upstream stream URL (e.g. an .m3u8). Wrapped by createProxyUrl. */
  url: string;
  /** Best-known quality label, used by the Source Selector's quality ranking. */
  quality?: string;
}

/**
 * CustomProvider — a worked sample provider.
 *
 * Default export so CinePro Core's registry can auto-discover it (the registry
 * imports each module in `src/providers/` and registers the default export when
 * it extends BaseProvider and `enabled === true`).
 */
export default class CustomProvider extends BaseProvider {
  // --- Identity -------------------------------------------------------------
  // `id` MUST be unique across all providers and STABLE over time. It keys
  // attribution (Req 1.6), dedup tie-breaking, and unhealthy-exclusion (Req 2.6).
  readonly id = "custom_provider";
  readonly name = "Custom Provider";

  // Flip to `false` to keep this file in src/providers/ but skip registration
  // at startup (disable without deleting — part of the authoring contract).
  enabled = true;

  // --- Scraping configuration ----------------------------------------------
  // Placeholder/example host — replace with the real embed host you scrape.
  protected readonly BASE_URL = "https://example-embed.tld";

  // Headers required to scrape AND to play. These same HEADERS are handed to
  // createProxyUrl so Core forwards them when proxying the stream.
  protected readonly HEADERS = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Referer: "https://example-embed.tld/",
  };

  // Advertise what this provider supports so the aggregator/selector can reason
  // about it. Keep this honest — only list types/qualities you actually return.
  readonly capabilities = {
    movie: true,
    tv: true,
    quality: ["1080p", "720p", "480p"],
    types: ["hls"] as const,
  };

  /**
   * Resolve a movie into zero or more playable Sources.
   * Returns `[]` on any miss/failure and never throws past the registry (Req 1.7).
   */
  async getMovieSources(ctx: TitleContext): Promise<Source[]> {
    try {
      const html = await this.fetch(`${this.BASE_URL}/movie/${ctx.tmdbId}`, {
        headers: this.HEADERS,
      });
      const stream = this.extractStream(html);
      if (!stream) return []; // miss → contribute nothing, never block the union

      return [
        {
          // ALWAYS proxy the playable URL through Core (host hidden, headers kept).
          url: this.createProxyUrl(stream.url, this.HEADERS),
          type: "hls",
          quality: stream.quality,
          provider: { id: this.id, name: this.name },
        },
      ];
    } catch {
      // Swallow provider-local errors: one provider's failure must not abort the
      // rest of the aggregation (Req 1.7).
      return [];
    }
  }

  /**
   * Resolve a TV episode into zero or more playable Sources.
   * `season` / `episode` are passed through exactly as received from the request.
   * Returns `[]` on any miss/failure and never throws past the registry (Req 1.7).
   */
  async getTVSources(ctx: TitleContext): Promise<Source[]> {
    try {
      const html = await this.fetch(
        `${this.BASE_URL}/tv/${ctx.tmdbId}/${ctx.season}/${ctx.episode}`,
        { headers: this.HEADERS },
      );
      const stream = this.extractStream(html);
      if (!stream) return [];

      return [
        {
          url: this.createProxyUrl(stream.url, this.HEADERS),
          type: "hls",
          quality: stream.quality,
          provider: { id: this.id, name: this.name },
        },
      ];
    } catch {
      return [];
    }
  }

  /**
   * Optional lightweight self-test used by the framework / health tooling.
   * Returns true iff the provider can currently produce at least one Source for
   * the given title (drives healthy/unhealthy classification in the report).
   */
  async healthCheck(ctx: TitleContext): Promise<boolean> {
    const sources =
      ctx.type === "tv"
        ? await this.getTVSources(ctx)
        : await this.getMovieSources(ctx);
    return sources.length > 0;
  }

  // ---------------------------------------------------------------------------
  // PROVIDER-SPECIFIC SCRAPING STUB — REPLACE THIS PER PROVIDER.
  //
  // This is the one piece every new provider must implement differently. Parse
  // the fetched page/JSON and pull out the playable stream URL (+ quality). Use
  // whatever the upstream actually serves (embedded JSON, a regex over inline
  // script, a follow-up API call via `this.fetch`, etc.).
  //
  // Return `null` when nothing playable is found so the callers above contribute
  // `[]` (Req 1.7). Do NOT call createProxyUrl here — the callers wrap the URL.
  // ---------------------------------------------------------------------------
  private extractStream(_html: string): ExtractedStream | null {
    // TODO(operator): replace this stub with real scraping for your provider.
    // Example shape of what to return once you locate the stream:
    //   const m = _html.match(/"file":"(?<url>https:[^"]+\.m3u8)"/);
    //   if (!m?.groups?.url) return null;
    //   return { url: m.groups.url.replace(/\\\//g, "/"), quality: "1080p" };
    return null;
  }
}
