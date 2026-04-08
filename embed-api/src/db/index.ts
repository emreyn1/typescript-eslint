import pg from "pg";
import { config } from "../config.js";

const pool = new pg.Pool({ connectionString: config.databaseUrl });

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS content_cache (
      id SERIAL PRIMARY KEY,
      tmdb_id INTEGER NOT NULL,
      content_type VARCHAR(10) NOT NULL,
      season INTEGER,
      episode INTEGER,
      telegram_file_id TEXT,
      hls_path TEXT,
      cached_at TIMESTAMPTZ DEFAULT NOW(),
      last_accessed TIMESTAMPTZ DEFAULT NOW(),
      file_size BIGINT,
      duration INTEGER,
      UNIQUE(tmdb_id, content_type, season, episode)
    );

    CREATE TABLE IF NOT EXISTS coin_balances (
      id SERIAL PRIMARY KEY,
      fingerprint TEXT UNIQUE NOT NULL,
      balance INTEGER DEFAULT 0,
      total_earned INTEGER DEFAULT 0,
      total_spent INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS coin_transactions (
      id SERIAL PRIMARY KEY,
      fingerprint TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type VARCHAR(20) NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS watch_sessions (
      id SERIAL PRIMARY KEY,
      fingerprint TEXT NOT NULL,
      tmdb_id INTEGER NOT NULL,
      content_type VARCHAR(10),
      started_at TIMESTAMPTZ DEFAULT NOW(),
      last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
      watch_seconds INTEGER DEFAULT 0,
      coins_awarded INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS referral_codes (
      id SERIAL PRIMARY KEY,
      fingerprint TEXT UNIQUE NOT NULL,
      code VARCHAR(20) UNIQUE NOT NULL,
      referred_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_content_cache_lookup
      ON content_cache(tmdb_id, content_type, season, episode);
    CREATE INDEX IF NOT EXISTS idx_watch_sessions_fp
      ON watch_sessions(fingerprint, started_at);
    CREATE INDEX IF NOT EXISTS idx_coin_transactions_fp
      ON coin_transactions(fingerprint);
  `);
}

export { pool };

export async function getCachedContent(
  tmdbId: number,
  type: string,
  season?: number,
  episode?: number,
) {
  const result = await pool.query(
    `SELECT * FROM content_cache
     WHERE tmdb_id = $1 AND content_type = $2
       AND (season IS NOT DISTINCT FROM $3)
       AND (episode IS NOT DISTINCT FROM $4)
       AND hls_path IS NOT NULL`,
    [tmdbId, type, season ?? null, episode ?? null],
  );

  if (result.rows[0]) {
    pool.query(
      `UPDATE content_cache SET last_accessed = NOW() WHERE id = $1`,
      [result.rows[0].id],
    );
  }

  return result.rows[0] ?? null;
}

export async function upsertContentCache(entry: {
  tmdbId: number;
  contentType: string;
  season?: number;
  episode?: number;
  telegramFileId?: string;
  hlsPath?: string;
  fileSize?: number;
  duration?: number;
}) {
  await pool.query(
    `INSERT INTO content_cache (tmdb_id, content_type, season, episode, telegram_file_id, hls_path, file_size, duration)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (tmdb_id, content_type, season, episode)
     DO UPDATE SET
       telegram_file_id = COALESCE(EXCLUDED.telegram_file_id, content_cache.telegram_file_id),
       hls_path = COALESCE(EXCLUDED.hls_path, content_cache.hls_path),
       file_size = COALESCE(EXCLUDED.file_size, content_cache.file_size),
       duration = COALESCE(EXCLUDED.duration, content_cache.duration),
       cached_at = NOW()`,
    [
      entry.tmdbId,
      entry.contentType,
      entry.season ?? null,
      entry.episode ?? null,
      entry.telegramFileId ?? null,
      entry.hlsPath ?? null,
      entry.fileSize ?? null,
      entry.duration ?? null,
    ],
  );
}
