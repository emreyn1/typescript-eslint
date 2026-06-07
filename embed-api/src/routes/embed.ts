/**
 * Embed Routes — the public, ad-supported, abuse-controlled surface (design
 * component 3, "Watch & Embed Routes"; the `/embed` request flow).
 *
 *   GET /embed/movie/:tmdbId                 (Req 11.1)
 *   GET /embed/tv/:tmdbId/:season/:episode   (Req 11.1)
 *
 * This is the public, vidsrc.to-style surface for arbitrary `Embed_Consumers`.
 * Its policy is fixed by the Policy Resolver to `public_embed` — **ad-supported,
 * abuse-gated, CDN-cacheable manifests** (Req 11.1, 12.1, 14.2). It shares the
 * exact same resolution core as the ad-free `/watch` surface (Aggregator Client
 * → resolution cache → dedup/union → source selector → `/stream` proxy →
 * player), differing only by that policy and by two public-surface wrappers:
 * the **AbuseGate** (component 12) in front and **Ad Insertion** (component 13)
 * in the rendered player. Enabling or stressing `/embed` can never turn
 * `/watch` into an ad-supported or abuse-gated path (Req 11.5, 15.2).
 *
 * Per-request orchestration (design "Watch & Embed Routes"):
 *   0. policy = resolvePolicy("/embed") → public_embed. The whole surface is
 *      gated by `config.publicEmbedEnabled`; when off it behaves as if the
 *      surface does not exist (Content Unavailable, Req 11.1).
 *   1. **Abuse gate, BEFORE resolving** (Req 13.1, 13.2, 13.5, 15.3): run
 *      `AbuseGate.evaluate(req)` (per-IP/referer rate limit → referer allowlist
 *      → Turnstile). A failing control short-circuits to an **explicit**
 *      response — 429 `rate_limited`, 403 `forbidden_referer`, or a Turnstile
 *      challenge — **never** a broken player (Req 15.3).
 *   2. Validate ids (the `Number()`/`isNaN` guard); invalid → 400.
 *   3. Resolve via the resolution cache, passing ids through to the Aggregator
 *      Client exactly as received (Req 4.3). The client enforces the 10s
 *      timeout + single `expiresAt` refresh and throws `CoreUnavailableError`
 *      on failure.
 *   4. Aggregate/dedup the OMSS sources, then select the best source (prefer
 *      hls, highest quality). No source / Core failure/timeout → "Content
 *      Unavailable" (Req 15.1).
 *   5. Rewrite the selected source URL into an embed-api-served, signed
 *      `/stream?data=<token>&surface=public_embed` URL (Req 6.1) so the Core
 *      host never reaches the client.
 *   6. Record per-title source count + provider attribution (Req 1.6); a
 *      persistence failure never crashes the request (logged + swallowed).
 *   7. Render `player-v2.html` with the fingerprint + anti-debug scripts and an
 *      **active** ad bumper (`renderAdBumper(policy)`, gated by AD_BUMPER_ENABLED,
 *      Req 12.1/12.2/12.4), keeping the surface iframable for arbitrary consumers
 *      (`X-Frame-Options: ALLOWALL` + permissive CSP, Req 11.3) and emitting a
 *      CDN-cacheable manifest `Cache-Control` (Req 14.2).
 *
 * Requirements: 11.1, 11.3, 11.4, 12.1, 12.2, 12.4, 13.1, 13.2, 13.5, 14.2,
 * 15.1, 15.3.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
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
import { createRateLimiter, createAbuseGate } from "../security/index.js";
import type { AbuseGate, AbuseGateOutcome } from "../security/index.js";
import { createStore } from "../storage/index.js";
import type { Store } from "../storage/index.js";

// --- Player template (loaded once at module init, mirroring /watch). --------
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
      storePromise = null;
      throw err;
    });
  }
  return storePromise;
}

// --- HTML builders (mirror the /watch substitution pattern) ----------------

/**
 * Render the player by string-replacing the four template placeholders:
 * fingerprint + anti-debug scripts, the HLS source (the signed `/stream` URL),
 * and the ad bumper. On `public_embed` the bumper is active when
 * `AD_BUMPER_ENABLED` (Req 12.1, 12.2, 12.4) via `renderAdBumper(policy)`.
 */
function buildPlayerHtml(hlsSource: string, policy: SurfacePolicy): string {
  return playerTemplate
    .replace("{{FINGERPRINT_SCRIPT}}", fingerprintScript)
    .replace("{{ANTIDEBUG_SCRIPT}}", antiDebugScript)
    .replace("'{{HLS_SOURCE}}'", `'${hlsSource}'`)
    .replace("{{AD_BUMPER}}", renderAdBumper(policy));
}

/** The shared "Content Unavailable" page (Req 15.1). */
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
 * Headers that keep the public surface iframable for arbitrary `Embed_Consumers`
 * (Req 11.3): `X-Frame-Options: ALLOWALL` + a permissive `frame-ancestors *`
 * CSP. Mirrors the /watch pattern (both surfaces are iframable; only the
 * cache-control differs).
 */
function applyEmbedHeaders(reply: FastifyReply, policy: SurfacePolicy): FastifyReply {
  return reply
    .header("Content-Type", "text/html; charset=utf-8")
    .header("X-Frame-Options", "ALLOWALL")
    .header(
      "Content-Security-Policy",
      "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
    )
    .header("Cache-Control", cacheControlFor("manifest", policy.surface));
}

/**
 * Send a player/unavailable HTML response. The manifest/player `Cache-Control`
 * comes from the policy: `public_embed` → `public, max-age=<manifestCacheTtlSec>`
 * (CDN-cacheable, Req 14.2).
 */
function sendPlayerResponse(
  reply: FastifyReply,
  html: string,
  policy: SurfacePolicy,
): FastifyReply {
  return applyEmbedHeaders(reply, policy).send(html);
}

/** A tiny Turnstile challenge page (noindex, iframable) rather than a broken player. */
function buildTurnstileChallengeHtml(): string {
  const siteKey = config.turnstileSiteKey;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Verify</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:#0a0a0a;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}
.wrap{text-align:center;padding:40px}
h3{color:#e5e5e5;font-size:16px;font-weight:600;margin-bottom:12px}
p{color:#666;font-size:13px;line-height:1.6;max-width:300px;margin:0 auto 16px}
</style>
${siteKey ? `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` : ""}
</head>
<body>
<div class="wrap">
  <h3>Verifying your browser</h3>
  <p>Please complete the check below to continue.</p>
  ${siteKey ? `<div class="cf-turnstile" data-sitekey="${siteKey}"></div>` : `<p>Verification required.</p>`}
</div>
</body>
</html>`;
}

/**
 * Map a failing AbuseGate control to an **explicit** HTTP response — never a
 * broken player (Req 15.3):
 *   - `rate_limited`      → 429 with `Retry-After` (Req 13.1)
 *   - `forbidden_referer` → 403 (hotlink protection, Req 13.5)
 *   - `turnstile_required`→ 403 + a Turnstile challenge page (Req 13.2)
 * All three stay iframable so the consumer's frame shows the explicit state.
 */
function sendAbuseResponse(
  reply: FastifyReply,
  outcome: { kind: NonNullable<AbuseGateOutcome>["kind"] },
): FastifyReply {
  // Keep iframable headers so the explicit state renders inside arbitrary frames.
  reply
    .header("X-Frame-Options", "ALLOWALL")
    .header("Content-Security-Policy", "frame-ancestors *;")
    // Abuse-control responses must never be cached by a CDN.
    .header("Cache-Control", "no-store");

  switch (outcome.kind) {
    case "rate_limited":
      return reply
        .status(429)
        .header("Retry-After", String(config.rateLimitWindowSec))
        .header("Content-Type", "text/plain; charset=utf-8")
        .send("Too Many Requests");
    case "forbidden_referer":
      return reply
        .status(403)
        .header("Content-Type", "text/plain; charset=utf-8")
        .send("Forbidden");
    case "turnstile_required":
      return reply
        .status(403)
        .header("Content-Type", "text/html; charset=utf-8")
        .send(buildTurnstileChallengeHtml());
    default: {
      // Exhaustiveness guard: any new control kind must be handled explicitly.
      return outcome.kind satisfies never, reply.status(403).send("Forbidden");
    }
  }
}

// --- Attribution persistence (non-fatal) -----------------------------------

/**
 * Record per-title source count + provider attribution (Req 1.6). A persistence
 * failure must never crash the request, so any error is logged and swallowed.
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

// --- Abuse-request adapter -------------------------------------------------

/**
 * Map a Fastify request onto the framework-agnostic {@link AbuseRequest} the
 * gate reads from. The Turnstile token is pulled from the query/body (the
 * gate also falls back to the `cf-turnstile-response` header).
 */
function toAbuseRequest(req: FastifyRequest): {
  ip: string;
  headers: Record<string, string | string[] | undefined>;
  turnstileToken: string | null;
} {
  const query = (req.query ?? {}) as Record<string, unknown>;
  const body = (req.body ?? {}) as Record<string, unknown>;
  const tokenRaw =
    query["cf-turnstile-response"] ??
    query.turnstileToken ??
    body["cf-turnstile-response"] ??
    body.turnstileToken;
  const turnstileToken = typeof tokenRaw === "string" ? tokenRaw : null;
  return { ip: req.ip, headers: req.headers, turnstileToken };
}

// --- Shared orchestration core ---------------------------------------------

/**
 * Resolve a title, select the best source, and serve the ad-supported player —
 * or the "Content Unavailable" page when there is no source or Core
 * fails/times out. The abuse gate has already passed by the time this runs.
 * Used by both the movie and TV routes; the only difference is the
 * `fetchSources` thunk passed in.
 */
async function serveEmbed(
  app: FastifyInstance,
  reply: FastifyReply,
  key: TitleKey,
  fetchSources: () => Promise<OmssResponse>,
): Promise<FastifyReply> {
  const policy = resolvePolicy("/embed"); // → public_embed (Req 11.1)

  // Gated on the aggregator: while disabled, there is no resolution source for
  // this route, so serve "Content Unavailable" rather than a broken player.
  if (!config.aggregatorEnabled) {
    return sendPlayerResponse(reply, buildUnavailableHtml(), policy);
  }

  // Resolve via the cache (coalesced/cached); the client enforces the 10s
  // timeout + single expiresAt refresh and throws on Core failure (Req 15.1).
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
  // (prefer hls, then highest quality).
  const dedupedSources = await aggregate(response);
  const selected = selectSource(dedupedSources);
  if (selected === null) {
    // No playable source for this title (Req 15.1).
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
 * Fastify plugin registering the public, ad-supported `/embed` routes. Matches
 * the existing route style (`watchRoutes`, `streamRoutes`): an exported
 * `async function(app)` registering handlers on the passed instance.
 *
 * The shared rate limiter is built **once at plugin init** (`createRateLimiter`)
 * and the composed AbuseGate (`createAbuseGate`) wraps it, so every `/embed`
 * request runs the same per-IP/referer counters → referer allowlist → Turnstile
 * gate before any resolution work (Req 13.1, 13.2, 13.5).
 */
export async function embedRoutes(app: FastifyInstance): Promise<void> {
  // Build the shared rate limiter + abuse gate once for this plugin instance.
  const rateLimiter = await createRateLimiter(config);
  const abuseGate: AbuseGate = createAbuseGate(rateLimiter);

  /**
   * Run the public-surface controls that gate EVERY /embed request before any
   * resolution work: the surface enable flag, then the AbuseGate. Returns the
   * reply when the request was short-circuited (so the handler should return
   * it), or `null` to proceed to resolution.
   */
  async function gate(
    req: FastifyRequest,
    reply: FastifyReply,
    policy: SurfacePolicy,
  ): Promise<FastifyReply | null> {
    // Surface off ⇒ behave as if it does not exist (Req 11.1).
    if (!config.publicEmbedEnabled) {
      return sendPlayerResponse(reply, buildUnavailableHtml(), policy);
    }
    // Abuse gate BEFORE resolving — explicit response on a failing control,
    // never a broken player (Req 13.1, 13.2, 13.5, 15.3).
    const outcome = await abuseGate.evaluate(toAbuseRequest(req));
    if (outcome !== null) {
      return sendAbuseResponse(reply, outcome);
    }
    return null;
  }

  // GET /embed/movie/:tmdbId — Req 11.1
  app.get("/embed/movie/:tmdbId", async (req, reply) => {
    const policy = resolvePolicy("/embed");
    const gated = await gate(req, reply, policy);
    if (gated !== null) return gated;

    const { tmdbId: rawTmdbId } = req.params as MovieParams;
    const tmdbId = Number(rawTmdbId);
    if (!tmdbId || Number.isNaN(tmdbId)) {
      return reply.status(400).send("Invalid ID");
    }
    // Pass tmdbId through to the Aggregator Client exactly as received (Req 4.3).
    return serveEmbed(
      app,
      reply,
      { tmdbId, type: "movie" },
      () => aggregatorClient.getMovieSources(tmdbId),
    );
  });

  // GET /embed/tv/:tmdbId/:season/:episode — Req 11.1
  app.get("/embed/tv/:tmdbId/:season/:episode", async (req, reply) => {
    const policy = resolvePolicy("/embed");
    const gated = await gate(req, reply, policy);
    if (gated !== null) return gated;

    const { tmdbId: rawTmdbId, season: rawSeason, episode: rawEpisode } =
      req.params as TvParams;
    const tmdbId = Number(rawTmdbId);
    const season = Number(rawSeason);
    const episode = Number(rawEpisode);
    if (!tmdbId || Number.isNaN(tmdbId)) {
      return reply.status(400).send("Invalid ID");
    }
    if (Number.isNaN(season) || Number.isNaN(episode)) {
      return reply.status(400).send("Invalid ID");
    }
    // Pass tmdbId/season/episode through exactly as received (Req 4.3).
    return serveEmbed(
      app,
      reply,
      { tmdbId, type: "tv", season, episode },
      () => aggregatorClient.getTvSources(tmdbId, season, episode),
    );
  });
}
