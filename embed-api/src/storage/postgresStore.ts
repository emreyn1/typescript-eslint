/**
 * Postgres storage backend (opt-in).
 *
 * Used only when `config.storageBackend === "postgres"` and
 * `config.databaseUrl` is set — e.g. an existing multi-node deployment where
 * Postgres is already present (design → Health Report Store; Resource
 * Footprint §1). On a single cheap VPS the sqlite/json backends are preferred
 * to avoid a full DB server's RAM/CPU cost.
 *
 * The `pg` driver is an **optional** dependency, **lazy-loaded** only here via
 * {@link createPostgresStore}, so a missing `pg` never breaks the build or the
 * sqlite/json backends.
 *
 * Uses the canonical Postgres DDL (`SERIAL`, `TIMESTAMPTZ`, `JSONB`); the
 * portable equivalents live in the SQLite backend. No caller depends on
 * Postgres-specific behavior — the {@link Store} surface is identical across
 * backends.
 */
import { config } from "../config.js";
import type {
  ProviderReport,
  Store,
  StoredTitleSourceStat,
  TitleSourceStat,
} from "./types.js";

// Type-only import — erased at compile time, imposes no runtime dep.
import type { Pool as PgPool } from "pg";

const DDL = `
CREATE TABLE IF NOT EXISTS provider_reports (
  id           SERIAL PRIMARY KEY,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  report       JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_provider_reports_generated
  ON provider_reports(generated_at DESC);

CREATE TABLE IF NOT EXISTS title_source_stats (
  id           SERIAL PRIMARY KEY,
  tmdb_id      INTEGER NOT NULL,
  content_type VARCHAR(10) NOT NULL,
  season       INTEGER,
  episode      INTEGER,
  source_count INTEGER NOT NULL,
  providers    JSONB NOT NULL,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_title_source_stats_lookup
  ON title_source_stats(tmdb_id, content_type, season, episode);
`;

class PostgresStore implements Store {
  readonly backend = "postgres" as const;

  constructor(private readonly pool: PgPool) {}

  async saveReport(report: ProviderReport): Promise<void> {
    // Pass an explicit generated_at so latest-ordering matches the report's own
    // timestamp rather than insert time. JSONB takes a JSON string + cast.
    await this.pool.query(
      "INSERT INTO provider_reports (generated_at, report) VALUES ($1, $2::jsonb)",
      [report.generatedAt, JSON.stringify(report)]
    );
  }

  async getLatestReport(): Promise<ProviderReport | null> {
    const res = await this.pool.query<{ report: ProviderReport }>(
      "SELECT report FROM provider_reports ORDER BY generated_at DESC, id DESC LIMIT 1"
    );
    // pg parses JSONB into a JS object already — no JSON.parse needed.
    return res.rows[0]?.report ?? null;
  }

  async recordTitleStats(stat: TitleSourceStat): Promise<void> {
    await this.pool.query(
      `INSERT INTO title_source_stats
         (tmdb_id, content_type, season, episode, source_count, providers, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [
        stat.tmdbId,
        stat.contentType,
        stat.season ?? null,
        stat.episode ?? null,
        stat.sourceCount,
        JSON.stringify(stat.providers),
        stat.recordedAt ?? new Date().toISOString(),
      ]
    );
  }

  async listTitleStats(): Promise<StoredTitleSourceStat[]> {
    const res = await this.pool.query<{
      id: number;
      tmdb_id: number;
      content_type: string;
      season: number | null;
      episode: number | null;
      source_count: number;
      providers: StoredTitleSourceStat["providers"];
      recorded_at: Date | string;
    }>(
      `SELECT id, tmdb_id, content_type, season, episode, source_count, providers, recorded_at
         FROM title_source_stats ORDER BY id DESC`
    );
    return res.rows.map((r) => ({
      id: r.id,
      tmdbId: r.tmdb_id,
      contentType: r.content_type as TitleSourceStat["contentType"],
      season: r.season,
      episode: r.episode,
      sourceCount: r.source_count,
      providers: r.providers,
      recordedAt:
        r.recorded_at instanceof Date
          ? r.recorded_at.toISOString()
          : String(r.recorded_at),
    }));
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

/**
 * Lazy-load `pg`, open a connection pool against `config.databaseUrl`, apply
 * the schema, and return a ready {@link Store}. Throws a clear error when the
 * optional dependency is missing or no `DATABASE_URL` is configured.
 */
export async function createPostgresStore(
  databaseUrl: string = config.databaseUrl
): Promise<Store> {
  if (!databaseUrl || databaseUrl.trim() === "") {
    throw new Error(
      "STORAGE_BACKEND=postgres requires DATABASE_URL to be set."
    );
  }

  let Pool: typeof PgPool;
  try {
    // pg is CommonJS; under NodeNext the package lands on `.default`.
    const pgModule = (await import("pg")) as unknown as {
      default?: { Pool: typeof PgPool };
      Pool?: typeof PgPool;
    };
    const resolved = pgModule.default?.Pool ?? pgModule.Pool;
    if (!resolved) throw new Error("pg.Pool not found in module");
    Pool = resolved;
  } catch (err) {
    throw new Error(
      "STORAGE_BACKEND=postgres requires the optional dependency 'pg'. " +
        "Install it (npm i pg) or select STORAGE_BACKEND=sqlite.",
      { cause: err }
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  await pool.query(DDL);
  return new PostgresStore(pool);
}
