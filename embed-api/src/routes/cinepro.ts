import type { FastifyInstance } from "fastify";
import {
  getMovieSources,
  getTVSources,
  pickBestSource,
  type CineProSource,
} from "../cinepro/client.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fingerprintScript,
  antiDebugScript,
} from "../protection/fingerprint.js";
import { config } from "../config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const playerTemplate = readFileSync(
  join(__dirname, "../player/player-v3.html"),
  "utf-8",
);

function buildPlayerHtml(sources: CineProSource[], title: string) {
  return playerTemplate
    .replace("{{FINGERPRINT_SCRIPT}}", fingerprintScript)
    .replace("{{ANTIDEBUG_SCRIPT}}", antiDebugScript)
    .replace("'{{SOURCES}}'", JSON.stringify(sources))
    .replace("{{TITLE}}", title)
    .replace("{{VAST_URL}}", config.adVastUrl || "");
}

function sendHtml(reply: any, html: string) {
  return reply
    .header("Content-Type", "text/html; charset=utf-8")
    .header("X-Frame-Options", "ALLOWALL")
    .header(
      "Content-Security-Policy",
      "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
    )
    .header("Cache-Control", "no-store")
    .send(html);
}

function unavailableHtml() {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Player</title><style>*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:#0a0a0a;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}
.w{text-align:center;padding:40px}h3{color:#e5e5e5;font-size:16px;margin-bottom:8px}
p{color:#666;font-size:13px;max-width:260px;margin:0 auto}</style></head>
<body><div class="w"><h3>Content Unavailable</h3><p>No sources found for this title.</p></div></body></html>`;
}

export async function cineproRoutes(app: FastifyInstance) {
  // Movie embed via CinePro
  app.get<{ Params: { tmdbId: string } }>(
    "/watch/movie/:tmdbId",
    async (req, reply) => {
      const tmdbId = Number(req.params.tmdbId);
      if (!tmdbId || isNaN(tmdbId)) {
        return reply.status(400).send("Invalid ID");
      }

      const data = await getMovieSources(tmdbId);
      if (!data || data.sources.length === 0) {
        return sendHtml(reply, unavailableHtml());
      }

      return sendHtml(reply, buildPlayerHtml(data.sources, `Movie ${tmdbId}`));
    },
  );

  // TV embed via CinePro
  app.get<{ Params: { tmdbId: string; season: string; episode: string } }>(
    "/watch/tv/:tmdbId/:season/:episode",
    async (req, reply) => {
      const tmdbId = Number(req.params.tmdbId);
      const season = Number(req.params.season);
      const episode = Number(req.params.episode);

      if (!tmdbId || isNaN(tmdbId)) {
        return reply.status(400).send("Invalid ID");
      }

      const data = await getTVSources(tmdbId, season, episode);
      if (!data || data.sources.length === 0) {
        return sendHtml(reply, unavailableHtml());
      }

      return sendHtml(
        reply,
        buildPlayerHtml(data.sources, `TV ${tmdbId} S${season}E${episode}`),
      );
    },
  );

  // JSON API — returns all CinePro sources
  app.get<{
    Querystring: { tmdb: string; type?: string; s?: string; e?: string };
  }>("/api/v1/cinepro/sources", async (req, reply) => {
    const tmdbId = Number(req.query.tmdb);
    if (!tmdbId || isNaN(tmdbId)) {
      return reply.status(400).send({ error: "Invalid tmdb ID" });
    }

    const type = req.query.type || "movie";
    const data =
      type === "tv"
        ? await getTVSources(
            tmdbId,
            Number(req.query.s) || 1,
            Number(req.query.e) || 1,
          )
        : await getMovieSources(tmdbId);

    if (!data) {
      return reply.status(502).send({ error: "CinePro unavailable" });
    }

    const best = pickBestSource(data.sources);

    return reply.send({
      total: data.sources.length,
      expiresAt: data.expiresAt,
      best: best
        ? {
            url: best.url,
            type: best.type,
            quality: best.quality,
            provider: best.provider.name,
          }
        : null,
      sources: data.sources.map((s) => ({
        url: s.url,
        type: s.type,
        quality: s.quality,
        provider: s.provider.name,
      })),
    });
  });
}
