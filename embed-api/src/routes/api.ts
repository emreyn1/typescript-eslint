import type { FastifyInstance } from "fastify";
import { generateSessionToken } from "../protection/hmac.js";
import { getSourcesForMovie, getSourcesForTv } from "../providers/index.js";

export async function apiRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { tmdb: string; type?: string };
  }>("/api/v1/sources", async (req, reply) => {
    const { tmdb, type } = req.query;
    const tmdbId = Number(tmdb);

    if (!tmdbId || isNaN(tmdbId)) {
      return reply.status(400).send({ error: "Invalid tmdb ID" });
    }

    const mediaType = type || "movie";
    const sources =
      mediaType === "movie"
        ? getSourcesForMovie(tmdbId)
        : getSourcesForTv(tmdbId, 1, 1);

    const clientIp =
      (req.headers["cf-connecting-ip"] as string) ||
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.ip;

    const token = generateSessionToken(clientIp, req.headers["user-agent"] || "");

    return reply.send({
      sources: sources.map((s) => ({
        id: s.id,
        name: s.name,
      })),
      token,
      count: sources.length,
    });
  });

  app.get<{
    Querystring: { tmdb: string; season?: string; episode?: string };
  }>("/api/v1/resolve", async (req, reply) => {
    const { tmdb, season, episode } = req.query;
    const tmdbId = Number(tmdb);

    if (!tmdbId || isNaN(tmdbId)) {
      return reply.status(400).send({ error: "Invalid tmdb ID" });
    }

    const s = Number(season) || 1;
    const e = Number(episode) || 1;

    const movieSources = getSourcesForMovie(tmdbId);
    const tvSources = getSourcesForTv(tmdbId, s, e);

    return reply.send({
      movie: movieSources,
      tv: tvSources,
    });
  });

  app.get("/api/v1/health", async (_req, reply) => {
    return reply.send({ status: "ok", uptime: process.uptime() });
  });
}
