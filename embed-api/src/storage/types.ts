/**
 * Storage-backend abstraction — shared types.
 *
 * `embed-api` persists only two small things (design → Data Models →
 * "Persisted data"):
 *   1. the latest provider health report  (`provider_reports`)
 *   2. per-title source/attribution stats (`title_source_stats`, Req 1.6)
 *
 * Three interchangeable backends implement {@link Store}, selected by
 * `config.storageBackend`: `sqlite` (default, single file), `json` (flat file +
 * a sibling stats file), and `postgres` (opt-in). The interface is deliberately
 * tiny so no caller depends on Postgres-specific behavior — the DDL/handling is
 * portable (`SERIAL`→`INTEGER PRIMARY KEY AUTOINCREMENT`, `TIMESTAMPTZ`/`JSONB`
 * →`TEXT` under SQLite; documents under JSON).
 *
 * Design: Components & Interfaces → "6. Health Report Store"; Data Models →
 * "Persisted data"; Resource Footprint & Cheap-VPS Tuning §1.
 */

/**
 * A provider health report document, persisted opaquely as JSON in the
 * `report` column / document. The only field the storage layer interprets is
 * {@link ProviderReport.generatedAt} (used to order rows so `getLatestReport`
 * can return the most recent). The full health-specific shape (test titles,
 * per-provider classifications) is layered on top by task 8 and persisted
 * as-is.
 */
export interface ProviderReport {
  /** ISO-8601 instant the report was generated. Used for latest-ordering. */
  generatedAt: string;
  /** Remaining health-specific fields are persisted opaquely. */
  [key: string]: unknown;
}

/** Distinct content kinds tracked in `title_source_stats`. */
export type ContentType = "movie" | "tv";

/** Per-provider attribution breakdown stored alongside a title's source count. */
export interface ProviderAttribution {
  id: string;
  name: string;
  count: number;
}

/**
 * One attribution record for a resolved title (Req 1.6). `season`/`episode` are
 * present only for TV. `recordedAt` is optional on write — backends default it
 * to the current time when omitted.
 */
export interface TitleSourceStat {
  tmdbId: number;
  contentType: ContentType;
  season?: number | null;
  episode?: number | null;
  /** Distinct sources after dedup. */
  sourceCount: number;
  /** Per-provider breakdown: `[{ id, name, count }]`. */
  providers: ProviderAttribution[];
  /** ISO-8601; defaults to "now" when omitted. */
  recordedAt?: string;
}

/** A {@link TitleSourceStat} as read back from a backend (id + recordedAt set). */
export interface StoredTitleSourceStat extends TitleSourceStat {
  id: number;
  recordedAt: string;
}

/**
 * Persists and reads the latest {@link ProviderReport}.
 * Mirrors the design's `HealthReportStore` interface (component 6).
 */
export interface HealthReportStore {
  /** Persist a report. Backends key ordering on `report.generatedAt`. */
  saveReport(report: ProviderReport): Promise<void>;
  /** Return the report with the greatest `generatedAt`, or null if none. */
  getLatestReport(): Promise<ProviderReport | null>;
}

/**
 * Appends per-title attribution rows. This is the "attribution writer" the
 * watch/embed routes call after selecting sources (Req 1.6).
 */
export interface StatsWriter {
  /** Append one attribution record. */
  recordTitleStats(stat: TitleSourceStat): Promise<void>;
  /** Read appended stats, newest first (used for verification/parity tests). */
  listTitleStats(): Promise<StoredTitleSourceStat[]>;
}

/**
 * The composite store returned by {@link createStore}. Combines the report
 * store and the attribution writer, plus a `close()` for backends that hold a
 * handle (sqlite file / pg pool); the JSON backend's `close()` is a no-op.
 */
export interface Store extends HealthReportStore, StatsWriter {
  /** The backend that was selected (useful for diagnostics/logging). */
  readonly backend: "sqlite" | "json" | "postgres";
  /** Release any held resources (db handle / connection pool). */
  close(): Promise<void>;
}
