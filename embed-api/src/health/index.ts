// Provider health testing: classification, HealthChecker, HealthReportStore.
// Feeds the authed report endpoint and the CLI. Filled in by task 8.
export {
  classify,
  DEFAULT_UNHEALTHY_REASON,
  type HealthStatus,
  type ClassifyInput,
  type HealthClassification,
} from "./classify.js";

// HealthChecker, playability probe, provider discovery, and the canonical
// health domain types (task 8.3). `store.ts` (task 8.5) imports ProviderReport
// / ProviderHealth from here so there is a single canonical definition.
export {
  HealthChecker,
  AggregatorTitleResolver,
  ProxyFetchProbe,
  isPlayableHlsManifest,
  discoverProviders,
} from "./checker.js";
export type {
  TitleRef,
  ProviderRef,
  ProviderTitleResult,
  ProviderHealth,
  ProviderReport,
  TitleResolver,
  PlayabilityProbe,
  ProbeResult,
  FetchLike,
  HealthCheckerDeps,
} from "./checker.js";

export {
  createHealthReportStore,
  healthReportStore,
  type HealthReportStore,
  type StoreFactory,
} from "./store.js";
