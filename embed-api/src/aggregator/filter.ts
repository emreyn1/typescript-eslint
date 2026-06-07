/**
 * Unhealthy-provider exclusion filter (design component 9, "Provider Filter";
 * Req 2.6).
 *
 * Prunes sources contributed by providers that the latest {@link ProviderReport}
 * classified `"unhealthy"`, so dead providers do not reach source selection or
 * attribution. The behavior is gated by `config.excludeUnhealthyProviders`:
 *
 *   - flag **true** AND a report exists → remove every source whose
 *     `provider.id` is listed as `"unhealthy"` in the report.
 *   - flag **false** OR no report available → return the sources unchanged.
 *
 * The module is split into a **pure** decision function ({@link excludeUnhealthy})
 * and an **IO** convenience wrapper ({@link filterSources}) that loads the latest
 * report from the {@link HealthReportStore}. Keeping the pure core free of I/O is
 * what lets Property 8 ("unhealthy providers are excluded from aggregation when
 * configured") test the filtering logic deterministically without a store.
 *
 * Requirements: 2.6.
 */
import { config } from "../config.js";
import type { OmssSource } from "./client.js";
import type { ProviderReport } from "../health/checker.js";
import {
  healthReportStore,
  type HealthReportStore,
} from "../health/store.js";

/**
 * Collect the set of provider ids classified `"unhealthy"` in a report. Returns
 * an empty set for a `null` report or one with no providers, so callers never
 * have to null-check.
 */
export function unhealthyProviderIds(
  report: ProviderReport | null
): Set<string> {
  const ids = new Set<string>();
  if (!report) return ids;
  for (const provider of report.providers ?? []) {
    if (provider.status === "unhealthy" && provider.providerId) {
      ids.add(provider.providerId);
    }
  }
  return ids;
}

/**
 * Pure exclusion filter (Req 2.6).
 *
 * Removes sources whose originating `provider.id` is classified `"unhealthy"`
 * in `report`, but only when exclusion is enabled. When `enabled` is false or
 * `report` is `null`, the input list is returned unchanged (a new array with
 * the same elements, never mutated).
 *
 * Pure: depends only on its arguments (no clock, environment, or I/O). The
 * `enabled` flag defaults to `config.excludeUnhealthyProviders` so production
 * callers get the configured behavior, while tests can pin it explicitly to
 * exercise both branches deterministically.
 *
 * @param sources The candidate sources (typically the deduped OMSS union).
 * @param report  The latest provider report, or `null` if none is available.
 * @param enabled Whether exclusion is active. Defaults to the config flag.
 */
export function excludeUnhealthy(
  sources: OmssSource[],
  report: ProviderReport | null,
  enabled: boolean = config.excludeUnhealthyProviders
): OmssSource[] {
  const list = sources ?? [];

  // Pass through unchanged when disabled or when there is no report to consult.
  if (!enabled || report === null) {
    return [...list];
  }

  const excluded = unhealthyProviderIds(report);
  if (excluded.size === 0) {
    return [...list];
  }

  return list.filter((source) => !excluded.has(source.provider?.id));
}

/**
 * IO convenience wrapper (design component 9).
 *
 * Loads the latest {@link ProviderReport} from the {@link HealthReportStore} and
 * applies the pure {@link excludeUnhealthy} filter. This is the entry point the
 * aggregation path uses to prune dead providers; the store is injectable so the
 * wrapper itself can be tested without real persistence.
 *
 * Honors `config.excludeUnhealthyProviders`: when the flag is off, the latest
 * report is not even loaded — the sources pass straight through.
 *
 * @param sources The candidate sources to filter.
 * @param store   The report store to read the latest report from. Defaults to
 *                the shared {@link healthReportStore}.
 */
export async function filterSources(
  sources: OmssSource[],
  store: HealthReportStore = healthReportStore
): Promise<OmssSource[]> {
  // Short-circuit when disabled: no need to touch the store at all (Req 2.6).
  if (!config.excludeUnhealthyProviders) {
    return [...(sources ?? [])];
  }

  const report = await store.getLatestReport();
  return excludeUnhealthy(sources, report);
}
