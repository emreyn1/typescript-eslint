/**
 * Storage-backend abstraction (task 7.1).
 *
 * A small, backend-agnostic storage interface with three interchangeable
 * implementations selected by `config.storageBackend`:
 *   - `sqlite`   (default) — single file at `config.sqlitePath`, lazy-loads
 *                 the optional `better-sqlite3` native addon.
 *   - `json`     — flat document at `config.healthReportPath` plus a sibling
 *                 stats file; zero native dependencies.
 *   - `postgres` — opt-in via `config.databaseUrl`, lazy-loads the optional
 *                 `pg` driver.
 *
 * The optional native deps (`better-sqlite3` / `pg`) are imported dynamically
 * inside the backend that needs them, so a missing optional dep never breaks
 * the build or the other backends (design → Health Report Store; Resource
 * Footprint §1).
 *
 * No caller depends on Postgres-specific behavior — both the
 * {@link HealthReportStore} (report) and the {@link StatsWriter} (attribution)
 * are served by the same {@link Store} surface across all three backends.
 */
import { config } from "../config.js";
import { JsonStore } from "./jsonStore.js";
import { createSqliteStore } from "./sqliteStore.js";
import { createPostgresStore } from "./postgresStore.js";
import type { Store } from "./types.js";

export type {
  ProviderReport,
  ContentType,
  ProviderAttribution,
  TitleSourceStat,
  StoredTitleSourceStat,
  HealthReportStore,
  StatsWriter,
  Store,
} from "./types.js";
export { JsonStore } from "./jsonStore.js";
export { createSqliteStore } from "./sqliteStore.js";
export { createPostgresStore } from "./postgresStore.js";

/**
 * Factory: build the {@link Store} for the configured backend
 * (`config.storageBackend`). Async because the sqlite/postgres backends
 * lazy-load their optional native dependency and apply their schema before the
 * store is usable. The returned value satisfies `HealthReportStore & StatsWriter`.
 *
 * @param backend Override the backend (defaults to `config.storageBackend`).
 */
export async function createStore(
  backend: Store["backend"] = config.storageBackend
): Promise<Store> {
  switch (backend) {
    case "json":
      return new JsonStore();
    case "postgres":
      return createPostgresStore();
    case "sqlite":
    default:
      return createSqliteStore();
  }
}
