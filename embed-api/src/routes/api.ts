import type { FastifyInstance } from "fastify";
import { generateSessionToken } from "../protection/hmac.js";
import { getSourcesForMovie, getSourcesForTv } from "../providers/index.js";
import { resolveContent, registerTelegramContent, getCacheStats } from "../pipeline/catalog.js";
import { pool } from "../db/index.js";

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

    // Check if we have cached HLS for this content
    let hasDirectSource = false;
    try {
      const cached = await resolveContent({
        tmdbId,
        type: mediaType as "movie" | "tv",
      });
      hasDirectSource = cached !== null;
    } catch {}

    return reply.send({
      sources: sources.map((s) => ({
        id: s.id,
        name: s.name,
      })),
      token,
      count: sources.length,
      direct: hasDirectSource,
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

  // --- Phase 2: content registration (admin) ---

  app.post<{
    Body: {
      tmdbId: number;
      type: string;
      season?: number;
      episode?: number;
      telegramFileId: string;
    };
  }>("/api/v1/content/register", async (req, reply) => {
    const { tmdbId, type, season, episode, telegramFileId } = req.body as any;

    if (!tmdbId || !telegramFileId) {
      return reply.status(400).send({ error: "tmdbId and telegramFileId required" });
    }

    await registerTelegramContent(
      { tmdbId, type: type || "movie", season, episode },
      telegramFileId,
    );

    return reply.send({ ok: true });
  });

  app.get("/api/v1/content/stats", async (_req, reply) => {
    const stats = await getCacheStats();
    return reply.send(stats);
  });

  // --- Referral / Watch-to-Earn ---

  app.post<{
    Body: { fingerprint: string; tmdbId: number; contentType?: string };
  }>("/api/v1/heartbeat", async (req, reply) => {
    const { fingerprint, tmdbId, contentType } = req.body as any;

    if (!fingerprint || !tmdbId) {
      return reply.status(400).send({ error: "fingerprint and tmdbId required" });
    }

    const COINS_PER_MINUTE = 1;
    const DAILY_COIN_CAP = 100;

    // Check daily cap
    const today = new Date().toISOString().split("T")[0];
    const earned = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM coin_transactions
       WHERE fingerprint = $1 AND type = 'watch' AND created_at::date = $2::date`,
      [fingerprint, today],
    );

    if (Number(earned.rows[0].total) >= DAILY_COIN_CAP) {
      return reply.send({ coins: 0, reason: "daily_cap" });
    }

    // Upsert watch session
    const session = await pool.query(
      `INSERT INTO watch_sessions (fingerprint, tmdb_id, content_type)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [fingerprint, tmdbId, contentType || "movie"],
    );

    // Update existing session or create new
    await pool.query(
      `UPDATE watch_sessions SET last_heartbeat = NOW(),
         watch_seconds = watch_seconds + 30
       WHERE fingerprint = $1 AND tmdb_id = $2
         AND started_at > NOW() - INTERVAL '4 hours'`,
      [fingerprint, tmdbId],
    );

    // Award coins every 60 seconds of watch time
    await pool.query(
      `INSERT INTO coin_balances (fingerprint, balance, total_earned)
       VALUES ($1, $2, $2)
       ON CONFLICT (fingerprint) DO UPDATE SET
         balance = coin_balances.balance + $2,
         total_earned = coin_balances.total_earned + $2`,
      [fingerprint, COINS_PER_MINUTE],
    );

    await pool.query(
      `INSERT INTO coin_transactions (fingerprint, amount, type, description)
       VALUES ($1, $2, 'watch', $3)`,
      [fingerprint, COINS_PER_MINUTE, `Watch TMDB ${tmdbId}`],
    );

    return reply.send({ coins: COINS_PER_MINUTE, awarded: true });
  });

  app.get<{
    Querystring: { fp: string };
  }>("/api/v1/coins/balance", async (req, reply) => {
    const fp = req.query.fp;
    if (!fp) return reply.status(400).send({ error: "fp required" });

    const result = await pool.query(
      `SELECT balance, total_earned, total_spent FROM coin_balances WHERE fingerprint = $1`,
      [fp],
    );

    return reply.send(result.rows[0] || { balance: 0, total_earned: 0, total_spent: 0 });
  });

  app.post<{
    Body: { fingerprint: string; amount: number; item: string };
  }>("/api/v1/coins/spend", async (req, reply) => {
    const { fingerprint, amount, item } = req.body as any;

    if (!fingerprint || !amount || !item) {
      return reply.status(400).send({ error: "fingerprint, amount, item required" });
    }

    const balance = await pool.query(
      `SELECT balance FROM coin_balances WHERE fingerprint = $1`,
      [fingerprint],
    );

    const current = Number(balance.rows[0]?.balance) || 0;
    if (current < amount) {
      return reply.status(400).send({ error: "Insufficient balance" });
    }

    await pool.query(
      `UPDATE coin_balances SET balance = balance - $2, total_spent = total_spent + $2
       WHERE fingerprint = $1`,
      [fingerprint, amount],
    );

    await pool.query(
      `INSERT INTO coin_transactions (fingerprint, amount, type, description)
       VALUES ($1, $2, 'spend', $3)`,
      [fingerprint, -amount, `Purchase: ${item}`],
    );

    return reply.send({ ok: true, remaining: current - amount });
  });

  app.get("/api/v1/health", async (_req, reply) => {
    return reply.send({ status: "ok", uptime: process.uptime() });
  });
}
