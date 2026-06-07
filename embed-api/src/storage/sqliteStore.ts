/**
 * SQLite storage backend (default, cheap-VPS).
 *
 * A single local file at `config.sqlitePath` — no separate server process,
 * tiny footprint, and the same history/queries as Postgres for one node
 * (design → Health Report Store; Resource Footprint §1).
 *
 * The native dependency `better-sqlite3` is an **optional** dependency and is
 * **lazy-loaded** only when this backend is selected, via {@link createSqliteStore}.
 * Importing this module does not pull in the native addon, so a missing
 * `better-sqlite3` never breaks the build or the json/postgres backends.
 *
 * Portable DDL: `SERIAL`→`INTEGER PRIMARY KEY AUTOINCREMENT`, `TIMESTAMPTZ`/
 * `JSONB`→`TEXT` (ISO-8601 / JSON string).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { config } from "../config.js";
import type {
  ProviderReport,
  Store,
  StoredTitleSourceStat,
  TitleSourceStat,
} from "./types.js";

// Type-only import — erased at compile time, so it imposes no runtime dep.
import type DatabaseConstructor from "better-sqlite3";
type Database = DatabaseConstructor.Database;

const DDL = `
CREATE TABLE IF NOT EXISTS provider_reports (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  generated_at TEXT NOT NULL,
  report       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_provider_reports_generated
  ON provider_reports(generated_at DESC);

CREATE TABLE IF NOT EXISTS title_source_stats (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  tmdb_id      INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  season       INTEGER,
  episode      INTEGER,
  source_count INTEGER NOT NULL,
  providers    TEXT NOT NULL,
  recorded_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_title_source_stats_lookup
  ON title_source_stats(tmdb_id, content_type, season, episode);
`;

class SqliteStore implements Store {
  readonly backend = "sqlite" as const;

  constructor(private readonly db: Database) {}

  async saveReport(report: ProviderReport): Promise<void> {
    this.db
      .prepare(
        "INSERT INTO provider_reports (generated_at, report) VALUES (?, ?)"
      )
      .run(report.generatedAt, JSON.stringify(report));
  }

  async getLatestReport(): Promise<ProviderReport | null> {
    const row = this.db
      .prepare(
        "SELECT report FROM provider_reports ORDER BY generated_at DESC, id DESC LIMIT 1"
      )
      .get() as { report: string } | undefined;
    return row ? (JSON.parse(row.report) as ProviderReport) : null;
  }

  async recordTitleStats(stat: TitleSourceStat): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO title_source_stats
           (tmdb_id, content_type, season, episode, source_count, providers, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        stat.tmdbId,
        stat.contentType,
        stat.season ?? null,
        stat.episode ?? null,
        stat.sourceCount,
        JSON.stringify(stat.providers),
        stat.recordedAt ?? new Date().toISOString()
      );
  }

  async listTitleStats(): Promise<StoredTitleSourceStat[]> {
    const rows = this.db
      .prepare(
        `SELECT id, tmdb_id, content_type, season, episode, source_count, providers, recorded_at
           FROM title_source_stats ORDER BY id DESC`
      )
      .all() as Array<{
      id: number;
      tmdb_id: number;
      content_type: string;
      season: number | null;
      episode: number | null;
      source_count: number;
      providers: string;
      recorded_at: string;
    }>;
    return rows.map((r) => ({
      id: r.id,
      tmdbId: r.tmdb_id,
      contentType: r.content_type as TitleSourceStat["contentType"],
      season: r.season,
      episode: r.episode,
      sourceCount: r.source_count,
      providers: JSON.parse(r.providers),
      recordedAt: r.recorded_at,
    }));
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

/**
 * Lazy-load `better-sqlite3`, open/create the DB file (creating the parent
 * directory if needed), apply the schema, and return a ready {@link Store}.
 * Throws a clear error if the optional dependency is not installed.
 */
export async function createSqliteStore(
  sqlitePath: string = config.sqlitePath
): Promise<Store> {
  let Database: typeof DatabaseConstructor;
  try {
    // Dynamic import keeps the native addon out of other backends' paths.
    Database = (await import("better-sqlite3")).default;
  } catch (err) {
    throw new Error(
      "STORAGE_BACKEND=sqlite requires the optional dependency 'better-sqlite3'. " +
        "Install it (npm i better-sqlite3) or select STORAGE_BACKEND=json.",
      { cause: err }
    );
  }

  // `:memory:` is supported for tests; for a file path, ensure the dir exists.
  if (sqlitePath !== ":memory:") {
    fs.mkdirSync(path.dirname(path.resolve(sqlitePath)), { recursive: true });
  }

  const db = new Database(sqlitePath);
  db.pragma("journal_mode = WAL");
  db.exec(DDL);
  return new SqliteStore(db);
}
