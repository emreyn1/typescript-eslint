// Source aggregation core (CinePro Core client, dedup, attribution, union
// aggregation, source selector, unhealthy-provider filter). Filled in by task 4 / 8.7.

// Aggregator Client + OMSS types (task 4.1).
export {
  AggregatorClient,
  CoreUnavailableError,
} from "./client.js";
export type {
  OmssSource,
  OmssSourceType,
  OmssAudioTrack,
  OmssSubtitle,
  OmssDiagnostic,
  OmssResponse,
} from "./client.js";

// Stream-identity dedup (task 4.2).
export { dedup, streamIdentityKey } from "./dedup.js";
export type { StreamIdentitySource } from "./dedup.js";

// Union aggregation with bounded fan-out (task 4.6).
export { aggregate, boundedMap } from "./aggregate.js";
export type { AggregateInput, SourceProducer, MaybePromise } from "./aggregate.js";

// Unhealthy-provider exclusion filter (task 8.7).
export {
  excludeUnhealthy,
  filterSources,
  unhealthyProviderIds,
} from "./filter.js";
