/**
 * Watch Routes — the ad-free cinex surface (design component 3, "Watch & Embed
 * Routes"; the `/watch` request flow).
 *
 *   GET /watch/movie/:tmdbId                 (Req 4.1)
 *   GET /watch/tv/:tmdbId/:season/:episode   (Req 4.2)
 *
 * This is the first-party cinex surface. Its policy is fixed by the Policy
 * Resolver to `cinex_watch` — **ad-free, no abuse gate, not CDN-cached**
 * (Req 11.2, 12.3). It shares the same resolution core (Aggregator Client →
 * resolution cache → dedup/union → source selector → `/stream` proxy → player)
 * as the public `/embed` surface, differing only by that policy, so enabling or
 * stressing `/embed` can never turn `/watch` into an ad-supported or
 * abuse-gated path (Req 11.5, 15.2). It never enters the ad or abuse branches.
 *
 * Per-request orchestration (design "Watch & Embed Routes"):
 *   0. policy = resolvePolicy("/watch") → cinex_watch.
 *   1. Validate ids (the `Number()`/`isNaN` guard from the legacy embed route);
 *      invalid → 400.
 *   2. Resolve via the resolution cache, passing ids through to the Aggregator
 *      Client exactly as received (Req 4.3). The client enforces the 10s
 *      timeout and the single `expiresAt` refresh (Req 7.3, 7.4) and throws
 *      `CoreUnavailableError` on failure.
 *   3. Aggregate/dedup the OMSS sources, then select the best source (prefer
 *      hls, highest quality, Req 4.4-4.6). No source → "Content Unavailable"
 *      (Req 7.1). Core failure/timeout → "Content Unavailable" + warn (Req 7.2).
 *   4. Rewrite the selected source URL into an embed-api-served, signed
 *      `/stream?data=<token>&surface=cinex_watch` URL (Req 6.1) so the Core host
 *      never reaches the client.
 *   5. Record per-title source count + provider attribution (Req 1.6); a
 *      persistence failure never crashes the request (logged + swallowed).
 *   6. Render `player-v2.html` with the fingerprint + anti-debug scripts (Req
 *      4.7) and an **empty** ad bumper (ad-free, Req 12.3), with `private,
 *      no-cache` headers (the cinex_watch manifest cache policy).
 *
 * Gated on `config.aggregatorEnabled`: while true (default) the aggregator is
 * the resolution source and the legacy torrent pipeline is skipped (Req 9.1).
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 6.1, 1.6, 7.1, 7.2, 11.2, 12.3, 15.1, 15.2.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyInstance, FastifyReply } from "fastify";
import { config } from "../config.js";
import { resolvePolicy } from "../policy/index.js";
import type { SurfacePolicy } from "../policy/index.js";
import { AggregatorClient, CoreUnavailableError } from "../aggregator/client.js";
import type { OmssResponse, OmssSource } from "../aggregator/client.js";
import { selectSource } from "../aggregator/select.js";
import { computeAttribution } from "../aggregator/attribution.js";
import { aggregate } from "../aggregator/aggregate.js";
import { resolutionCache } from "../cache/resolution.js";
import type { TitleKey } from "../cache/resolution.js";
import { cacheControlFor } from "../cache/cacheControl.js";
import { renderAdBumper } from "../ads/insert.js";
import { signStreamToken } from "../protection/streamToken.js";
import { fingerprintScript, antiDebugScript } from "../protection/fingerprint.js";
import { createStore } from "../storage/index.js";
import type { Store } from "../storage/index.js";

// --- Player template (loaded once at module init, mirroring the legacy route).
const __dirname = dirname(fileURLToPath(import.meta.url));
const playerTemplate = readFileSync(
  join(__dirname, "../player/player-v2.html"),
  "utf-8",
);

// --- Shared singletons -----------------------------------------------------

/** One HTTP client to CinePro Core; all behavior is read from `config`. */
const aggregatorClient = new AggregatorClient();

/**
 * Lazily-created, process-wide storage `Store` (the attribution `StatsWriter`).
 * Created on first use so importing this module opens no sqlite handle / pg
 * pool. A failed creation is not memoized as rejected — it is retried next time.
 */
let storePromise: Promise<Store> | null = null;
function getStore(): Promise<Store> {
  if (storePromise === null) {
    storePromise = createStore().catch((err) => {
      // Reset so a transient backend failure can be retried on the next record.
      storePromise = null;
      throw err;
    });
  }
  return storePromise;
}

// --- HTML builders (mirror the legacy embed route's substitution pattern) ---

/**
 * Render the player by string-replacing the four template placeholders:
 * fingerprint + anti-debug scripts (Req 4.7), the HLS source (the signed
 * `/stream` URL), and the ad bumper (empty on `cinex_watch`, Req 12.3).
 */
function buildPlayerHtml(hlsSource: string, policy: SurfacePolicy): string {
  return playerTemplate
    .replace("{{FINGERPRINT_SCRIPT}}", fingerprintScript)
    .replace("{{ANTIDEBUG_SCRIPT}}", antiDebugScript)
    .replace("'{{HLS_SOURCE}}'", `'${hlsSource}'`)
    .replace("{{AD_BUMPER}}", renderAdBumper(policy));
}

/** The existing "Content Unavailable" page (Req 7.1, 7.2, 15.1). */
function buildUnavailableHtml(reason = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Player</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:#0a0a0a;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}
.wrap{text-align:center;padding:40px}
.icon{width:64px;height:64px;margin:0 auto 16px;opacity:.3}
h3{color:#e5e5e5;font-size:16px;font-weight:600;margin-bottom:8px}
p{color:#666;font-size:13px;line-height:1.6;max-width:260px;margin:0 auto}
</style>
</head>
<body>
<div class="wrap">
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4M12 16h.01"/>
  </svg>
  <h3>Content Unavailable</h3>
  <p>This title is not in our library yet.${reason ? " " + reason : ""}</p>
</div>
</body>
</html>`;
}

/**
 * Send a player/unavailable HTML response reusing the legacy header pattern
 * (iframable for arbitrary consumers via `X-Frame-Options: ALLOWALL` + a
 * permissive CSP). The manifest/player `Cache-Control` comes from the policy:
 * `cinex_watch` → `private, no-cache` (Req 14.x via `cacheControlFor`).
 */
function sendPlayerResponse(
  reply: FastifyReply,
  html: string,
  policy: SurfacePolicy,
): FastifyReply {
  return reply
    .header("Content-Type", "text/html; charset=utf-8")
    .header("X-Frame-Options", "ALLOWALL")
    .header(
      "Content-Security-Policy",
      "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
    )
    .header("Cache-Control", cacheControlFor("manifest", policy.surface))
    .send(html);
}

// --- Attribution persistence (non-fatal) -----------------------------------

/**
 * Record per-title source count + provider attribution (Req 1.6). A persistence
 * failure must never crash the request, so any error is logged and swallowed
 * (design "Watch & Embed Routes" step 6).
 */
async function recordTitleStats(
  app: FastifyInstance,
  key: TitleKey,
  dedupedSources: readonly OmssSource[],
): Promise<void> {
  try {
    const store = await getStore();
    const attribution = computeAttribution(dedupedSources);
    await store.recordTitleStats({
      tmdbId: key.tmdbId,
      contentType: key.type,
      season: key.season ?? null,
      episode: key.episode ?? null,
      sourceCount: attribution.sourceCount,
      providers: attribution.providers,
    });
  } catch (err) {
    app.log.warn(`recordTitleStats ${describeKey(key)}: ${err}`);
  }
}

/** Human-readable title key for logging. */
function describeKey(key: TitleKey): string {
  return key.type === "tv"
    ? `tv/${key.tmdbId}/${key.season}/${key.episode}`
    : `movie/${key.tmdbId}`;
}

// --- Shared orchestration core ---------------------------------------------

/**
 * Resolve a title, select the best source, and serve the ad-free player — or
 * the "Content Unavailable" page when there is no source or Core fails/times
 * out. Used by both the movie and TV routes; the only difference is the
 * `fetchSources` thunk passed in.
 */
async function serveWatch(
  app: FastifyInstance,
  reply: FastifyReply,
  key: TitleKey,
  fetchSources: () => Promise<OmssResponse>,
): Promise<FastifyReply> {
  const policy = resolvePolicy("/watch"); // → cinex_watch (Req 11.2)

  // Gated on the aggregator: while disabled, there is no resolution source for
  // this route, so serve "Content Unavailable" rather than a broken player.
  if (!config.aggregatorEnabled) {
    return sendPlayerResponse(reply, buildUnavailableHtml(), policy);
  }

  // Resolve via the cache (coalesced/cached); the client enforces the 10s
  // timeout + single expiresAt refresh and throws on Core failure (Req 7.2-7.4).
  let response: OmssResponse;
  try {
    response = await resolutionCache.getOrResolve(key, fetchSources);
  } catch (err) {
    if (err instanceof CoreUnavailableError) {
      app.log.warn(`CinePro Core unavailable for ${describeKey(key)}: ${err.message}`);
    } else {
      app.log.warn(`resolve ${describeKey(key)}: ${err}`);
    }
    return sendPlayerResponse(reply, buildUnavailableHtml(), policy);
  }

  // Union + dedup the provider sources (Req 1.5), then pick the best one
  // (prefer hls, then highest quality, Req 4.4-4.6).
  const dedupedSources = await aggregate(response);
  const selected = selectSource(dedupedSources);
  if (selected === null) {
    // No playable source for this title (Req 7.1, 15.1).
    return sendPlayerResponse(reply, buildUnavailableHtml(), policy);
  }

  // Record count + provider attribution (Req 1.6); never crashes the request.
  await recordTitleStats(app, key, dedupedSources);

  // Rewrite the selected source URL into an embed-api-served, signed /stream URL
  // (Req 6.1). The signed token hides the raw Core `data` + host from the client.
  const token = signStreamToken(selected.url);
  const streamUrl = `/stream?data=${encodeURIComponent(token)}&surface=${policy.surface}`;

  return sendPlayerResponse(reply, buildPlayerHtml(streamUrl, policy), policy);
}

// --- Routes ----------------------------------------------------------------

/** Route params for the movie route. */
interface MovieParams {
  tmdbId: string;
}
/** Route params for the TV route. */
interface TvParams {
  tmdbId: string;
  season: string;
  episode: string;
}

/**
 * Fastify plugin registering the ad-free cinex `/watch` routes. Matches the
 * existing route style (`embedRoutes`, `streamRoutes`): an exported
 * `async function(app)` registering handlers on the passed instance.
 */
export async function watchRoutes(app: FastifyInstance): Promise<void> {
  // GET /watch/movie/:tmdbId — Req 4.1
  app.get("/watch/movie/:tmdbId", async (req, reply) => {
    const { tmdbId: rawTmdbId } = req.params as MovieParams;
    const tmdbId = Number(rawTmdbId);
    if (!tmdbId || Number.isNaN(tmdbId)) {
      return reply.status(400).send("Invalid ID");
    }
    // Pass tmdbId through to the Aggregator Client exactly as received (Req 4.3).
    return serveWatch(
      app,
      reply,
      { tmdbId, type: "movie" },
      () => aggregatorClient.getMovieSources(tmdbId),
    );
  });

  // GET /watch/tv/:tmdbId/:season/:episode — Req 4.2
  app.get("/watch/tv/:tmdbId/:season/:episode", async (req, reply) => {
    const { tmdbId: rawTmdbId, season: rawSeason, episode: rawEpisode } =
      req.params as TvParams;
    const tmdbId = Number(rawTmdbId);
    const season = Number(rawSeason);
    const episode = Number(rawEpisode);
    // tmdbId must be a positive number; season/episode must be valid numbers
    // (season 0 / "specials" is allowed, so only reject NaN there).
    if (!tmdbId || Number.isNaN(tmdbId)) {
      return reply.status(400).send("Invalid ID");
    }
    if (Number.isNaN(season) || Number.isNaN(episode)) {
      return reply.status(400).send("Invalid ID");
    }
    // Pass tmdbId/season/episode through exactly as received (Req 4.3).
    return serveWatch(
      app,
      reply,
      { tmdbId, type: "tv", season, episode },
      () => aggregatorClient.getTvSources(tmdbId, season, episode),
    );
  });
}
