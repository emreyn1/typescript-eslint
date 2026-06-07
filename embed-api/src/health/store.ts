/**
 * Health Report Store (design component 6, "Health Report Store"; Req 3.1, 2.3).
 *
 * A **thin** health-domain wrapper over the backend-agnostic storage `Store`
 * (`src/storage`). All persistence, backend selection (sqlite / json /
 * postgres), and latest-by-`generatedAt` ordering live in the storage layer;
 * this module only narrows the opaque storage `ProviderReport` to the full
 * health-domain shape and exposes the two operations the health subsystem
 * needs:
 *
 *   - `saveReport(report)`        — persist a {@link ProviderReport}.
 *   - `getLatestReport()`         — read back the most recent report
 *                                   (`latest = max generatedAt`, Req 3.1),
 *                                   or `null` when none has been saved.
 *
 * The underlying storage `Store` is created **lazily** (and once) via
 * {@link createStore}, so importing this module never opens a sqlite handle or
 * a pg pool until the first read/write actually happens. A custom store can be
 * injected for testing.
 *
 * Requirements: 3.1 (return the latest report), 2.3 (persist the report
 * produced by the HealthChecker).
 */
import { createStore } from "../storage/index.js";
import type {
  Store,
  ProviderReport as StoredProviderReport,
} from "../storage/index.js";
// Canonical health-domain shapes live in checker.ts (task 8.3); the store
// imports them so there is a single definition of ProviderReport/ProviderHealth.
import type { ProviderReport } from "./checker.js";

export type { TitleRef, ProviderHealth, ProviderReport } from "./checker.js";

/**
 * Health-domain view of the report store (design component 6). Mirrors the
 * storage `HealthReportStore` but typed against the full health-domain
 * {@link ProviderReport} shape.
 */
export interface HealthReportStore {
  /** Persist a report (Req 2.3). */
  saveReport(report: ProviderReport): Promise<void>;
  /** Return the report with the greatest `generatedAt`, or `null` (Req 3.1). */
  getLatestReport(): Promise<ProviderReport | null>;
}

/** A factory that resolves the underlying backend-agnostic storage `Store`. */
export type StoreFactory = () => Promise<Store>;

/**
 * Lazily-created, process-wide singleton promise for the default storage
 * `Store`. Created on first use so importing this module has no side effects
 * (no sqlite handle / pg pool until a read or write happens).
 */
let defaultStorePromise: Promise<Store> | null = null;

/** Resolve (creating once) the default storage `Store` for `config.storageBackend`. */
function getDefaultStore(): Promise<Store> {
  if (defaultStorePromise === null) {
    defaultStorePromise = createStore();
  }
  return defaultStorePromise;
}

/**
 * Build a {@link HealthReportStore} backed by the storage layer.
 *
 * The underlying `Store` is obtained lazily through `storeFactory` (default:
 * the shared, lazily-created singleton), so no backend resource is opened until
 * the first `saveReport`/`getLatestReport` call. Pass a custom factory to inject
 * a store (e.g. in tests).
 *
 * Kept intentionally thin: persistence and `latest = max generatedAt` ordering
 * are the storage layer's responsibility; this wrapper only narrows the opaque
 * stored document back to the health-domain {@link ProviderReport}.
 */
export function createHealthReportStore(
  storeFactory: StoreFactory = getDefaultStore
): HealthReportStore {
  return {
    async saveReport(report: ProviderReport): Promise<void> {
      const store = await storeFactory();
      // The health ProviderReport is structurally a storage ProviderReport
      // (has `generatedAt: string`; the rest is persisted opaquely). The cast
      // satisfies the storage type's index signature.
      await store.saveReport(report as unknown as StoredProviderReport);
    },

    async getLatestReport(): Promise<ProviderReport | null> {
      const store = await storeFactory();
      const latest = await store.getLatestReport();
      // The storage layer round-trips the document as-is, so the opaque report
      // is the health-domain shape it was saved as.
      return (latest as ProviderReport | null) ?? null;
    },
  };
}

/**
 * Convenience default {@link HealthReportStore} bound to the lazily-created
 * default storage `Store`. Suitable for app code that just needs the configured
 * backend; tests should prefer {@link createHealthReportStore} with an injected
 * factory.
 */
export const healthReportStore: HealthReportStore = createHealthReportStore();
