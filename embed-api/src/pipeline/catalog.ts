/**
 * Legacy Torrent_Pipeline — resolver entry point (design component 10, "Legacy
 * Torrent Pipeline"; Req 9.1, 9.2, 9.3, 9.4).
 *
 * RETAINED-BUT-DORMANT, OFF BY DEFAULT.
 *
 * The new CinePro Core aggregator is the resolution source for the `/watch` and
 * `/embed` routes (Req 9.1) — see `src/routes/watch.ts` / `src/routes/embed.ts`,
 * which resolve exclusively through the Aggregator Client and never call this
 * module. This legacy resolver (cache → Telegram → torrent/YTS/EZTV →
 * Real-Debrid → ffmpeg remux → HLS) is **retained** so it can be re-enabled via
 * configuration (Req 9.4), but it is **disabled by default**: every entry point
 * short-circuits to `null` with no torrent/Telegram/Real-Debrid work whenever
 * `config.torrentPipelineEnabled !== true` (Req 9.2, 9.3).
 *
 * This mirrors the gate already present in the compiled `dist/pipeline/catalog.js`
 * (`processFromTorrent` returns early unless `TORRENT_PIPELINE_ENABLED === "true"`),
 * but reads the single typed `config.torrentPipelineEnabled` flag (default
 * `false`, see `src/config.ts`) instead of `process.env` directly.
 *
 * Reconstruction note: the deeper Telegram-download, ffmpeg-remux, R2-upload, and
 * content-cache (DB) stages of the legacy pipeline live in `dist/pipeline/`
 * (`remux.js`, `../telegram/client.js`, `../db/index.js`, `../cdn/cloudflare.js`)
 * and have not yet been ported into `src/`. They are not needed while the flag is
 * off. When the operator re-enables the pipeline, those modules must be
 * reconstructed and wired back into `processFromTorrent` at the marked point; the
 * torrent-discovery helpers (`./torrent.ts`) are already fully reconstructed.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4.
 */
import { config } from "../config.js";
import { resolveMovieTorrent, resolveTvTorrent } from "./torrent.js";

/** A title to resolve (TMDB id + type, plus season/episode for TV). */
export interface ContentInfo {
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}

/** The result of a successful legacy resolution: a playable HLS URL. */
export interface ResolveResult {
  hlsUrl: string;
  r2Prefix: string;
  duration: number;
}

/**
 * Returns `true` only when the legacy torrent pipeline is explicitly enabled.
 * Centralizes the default-off gate so callers can defensively re-check it
 * (Req 9.2). `config.torrentPipelineEnabled` defaults to `false`.
 */
export function torrentPipelineEnabled(): boolean {
  return config.torrentPipelineEnabled === true;
}

/**
 * Legacy resolve entry point. Priority order (when enabled):
 *   1. HLS already in the content cache → return it
 *   2. Telegram file registered → download + remux
 *   3. YTS/EZTV torrent → (optional Real-Debrid) → remux
 *   4. Not found → null
 *
 * DEFAULT-OFF GATE (Req 9.2, 9.3): while `torrentPipelineEnabled` is false, this
 * returns `null` immediately — no cache lookup, no Telegram, no torrent, no
 * Real-Debrid, no side effects. The aggregator path is the resolution source
 * (Req 9.1), so this is never reached on the default `/watch` and `/embed` flows.
 */
export async function resolveContent(
  info: ContentInfo,
): Promise<ResolveResult | null> {
  if (!torrentPipelineEnabled()) {
    // Pipeline disabled: skip torrent, Telegram, and Real-Debrid resolution
    // entirely (Req 9.3). The aggregator is the resolution source (Req 9.1).
    return null;
  }

  // --- RETAINED legacy flow (only reached when the flag is ON) -------------
  // Stages 1 (content-cache hit) and 2 (Telegram-registered file) depend on the
  // `../db` and `../telegram` modules that have not yet been ported into `src/`
  // (see the reconstruction note in the file header). They are preserved in
  // `dist/pipeline/catalog.js`. Until those modules are reconstructed, the
  // retained flow goes straight to the torrent stage.
  return processFromTorrent(info);
}

/**
 * Stage 3 of the legacy pipeline: discover a torrent (YTS for movies, EZTV for
 * TV), optionally unrestrict it via Real-Debrid, then remux the direct URL to
 * HLS.
 *
 * DEFAULT-OFF GATE (Req 9.2, 9.3): defensively re-checks the flag so this is a
 * no-op with no side effects when the pipeline is disabled (mirrors the gate in
 * `dist/pipeline/catalog.js`).
 */
export async function processFromTorrent(
  info: ContentInfo,
): Promise<ResolveResult | null> {
  if (!torrentPipelineEnabled()) return null;

  const resolved =
    info.type === "movie"
      ? await resolveMovieTorrent(info.tmdbId)
      : await resolveTvTorrent(info.tmdbId, info.season ?? 1, info.episode ?? 1);

  if (!resolved) return null;

  // A bare magnet cannot be served without Real-Debrid (or a webtorrent stage),
  // matching the legacy behavior of returning null for `via === "magnet"`.
  if (resolved.via === "magnet") return null;

  // RETAINED remux stage: the legacy pipeline remuxes `resolved.directUrl` to
  // HLS (ffmpeg), optionally uploads the segments to R2, and writes the
  // content cache — implemented in `dist/pipeline/remux.js` + `../cdn` + `../db`.
  // Those modules are not yet reconstructed in `src/` (see file header). Surface
  // a clear, actionable error instead of silently dropping the resolved source,
  // so re-enabling the flag without porting the remux stage fails loudly rather
  // than mysteriously.
  throw new Error(
    "Legacy torrent pipeline is enabled but the remux/HLS stage has not been " +
      "reconstructed in src/ (see dist/pipeline/remux.js). Port the remux, R2 " +
      "upload, and content-cache modules before enabling torrentPipelineEnabled.",
  );
}

/**
 * Build the R2/HLS path prefix for a title. Pure helper retained from the legacy
 * pipeline (used by the remux/upload stage when re-enabled).
 */
export function buildR2Prefix(info: ContentInfo): string {
  if (info.type === "tv") {
    return `tv/${info.tmdbId}/s${info.season}e${info.episode}`;
  }
  return `movie/${info.tmdbId}`;
}
