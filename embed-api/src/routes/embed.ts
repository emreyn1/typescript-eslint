import type { FastifyInstance } from "fastify";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fingerprintScript,
  antiDebugScript,
} from "../protection/fingerprint.js";
import { resolveContent } from "../pipeline/catalog.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const hlsTemplate = readFileSync(
  join(__dirname, "../player/player-v2.html"),
  "utf-8",
);

function buildHlsHtml(hlsSource: string) {
  return hlsTemplate
    .replace("{{FINGERPRINT_SCRIPT}}", fingerprintScript)
    .replace("{{ANTIDEBUG_SCRIPT}}", antiDebugScript)
    .replace("'{{HLS_SOURCE}}'", `'${hlsSource}'`);
}

/** "Yakında" sayfası — içerik bulunamadığında gösterilir */
function buildUnavailableHtml(reason = "") {
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

function sendPlayerResponse(reply: any, html: string) {
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

export async function embedRoutes(app: FastifyInstance) {
  app.get<{ Params: { tmdbId: string } }>(
    "/embed/movie/:tmdbId",
    async (req, reply) => {
      const tmdbId = Number(req.params.tmdbId);
      if (!tmdbId || isNaN(tmdbId)) {
        return reply.status(400).send("Invalid ID");
      }

      try {
        const cached = await resolveContent({ tmdbId, type: "movie" });
        if (cached) {
          return sendPlayerResponse(reply, buildHlsHtml(cached.hlsUrl));
        }
      } catch (err) {
        app.log.warn(`resolveContent movie/${tmdbId}: ${err}`);
      }

      return sendPlayerResponse(reply, buildUnavailableHtml());
    },
  );

  app.get<{ Params: { tmdbId: string; season: string; episode: string } }>(
    "/embed/tv/:tmdbId/:season/:episode",
    async (req, reply) => {
      const tmdbId = Number(req.params.tmdbId);
      const season = Number(req.params.season);
      const episode = Number(req.params.episode);

      if (!tmdbId || isNaN(tmdbId)) {
        return reply.status(400).send("Invalid ID");
      }

      try {
        const cached = await resolveContent({
          tmdbId,
          type: "tv",
          season,
          episode,
        });
        if (cached) {
          return sendPlayerResponse(reply, buildHlsHtml(cached.hlsUrl));
        }
      } catch (err) {
        app.log.warn(`resolveContent tv/${tmdbId}/${season}/${episode}: ${err}`);
      }

      return sendPlayerResponse(reply, buildUnavailableHtml());
    },
  );

  app.get<{
    Querystring: { tmdb: string; type?: string; s?: string; e?: string };
  }>("/embed", async (req, reply) => {
    const { tmdb, type, s, e } = req.query;
    const tmdbId = Number(tmdb);

    if (!tmdbId || isNaN(tmdbId)) {
      return reply.status(400).send("Invalid tmdb parameter");
    }

    if (type === "tv") {
      const season = Number(s) || 1;
      const episode = Number(e) || 1;
      return reply.redirect(`/embed/tv/${tmdbId}/${season}/${episode}`);
    }

    return reply.redirect(`/embed/movie/${tmdbId}`);
  });
}
