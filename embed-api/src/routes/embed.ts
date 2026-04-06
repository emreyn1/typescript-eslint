import type { FastifyInstance } from "fastify";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import { getSourcesForMovie, getSourcesForTv } from "../providers/index.js";
import {
  fingerprintScript,
  antiDebugScript,
} from "../protection/fingerprint.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const playerTemplate = readFileSync(
  join(__dirname, "../player/player.html"),
  "utf-8",
);

function buildPlayerHtml(sources: { id: string; name: string; url: string }[]) {
  return playerTemplate
    .replace("{{FINGERPRINT_SCRIPT}}", fingerprintScript)
    .replace("{{ANTIDEBUG_SCRIPT}}", antiDebugScript)
    .replace("'{{SOURCES_JSON}}'", JSON.stringify(sources));
}

export async function embedRoutes(app: FastifyInstance) {
  app.get<{
    Params: { tmdbId: string };
    Querystring: { s?: string; e?: string };
  }>("/embed/movie/:tmdbId", async (req, reply) => {
    const tmdbId = Number(req.params.tmdbId);
    if (!tmdbId || isNaN(tmdbId)) {
      return reply.status(400).send("Invalid ID");
    }

    const sources = getSourcesForMovie(tmdbId);
    const html = buildPlayerHtml(sources);

    return reply
      .header("Content-Type", "text/html; charset=utf-8")
      .header("X-Frame-Options", "ALLOWALL")
      .header(
        "Content-Security-Policy",
        "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
      )
      .header("Cache-Control", "no-store")
      .send(html);
  });

  app.get<{
    Params: { tmdbId: string; season: string; episode: string };
  }>("/embed/tv/:tmdbId/:season/:episode", async (req, reply) => {
    const tmdbId = Number(req.params.tmdbId);
    const season = Number(req.params.season);
    const episode = Number(req.params.episode);

    if (!tmdbId || isNaN(tmdbId)) {
      return reply.status(400).send("Invalid ID");
    }

    const sources = getSourcesForTv(tmdbId, season, episode);
    const html = buildPlayerHtml(sources);

    return reply
      .header("Content-Type", "text/html; charset=utf-8")
      .header("X-Frame-Options", "ALLOWALL")
      .header(
        "Content-Security-Policy",
        "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
      )
      .header("Cache-Control", "no-store")
      .send(html);
  });

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
