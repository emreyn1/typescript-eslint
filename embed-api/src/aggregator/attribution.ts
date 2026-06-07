// Attribution counting for aggregated OMSS sources.
//
// Task 4.4 (embed-omss-backend): from a *deduped* source list, compute the
// per-title source count and the per-provider attribution breakdown
// (Requirement 1.6; design "Source Aggregation Model" attribution section).
//
// This is a pure, total function. It assumes the input has already been passed
// through `dedup` (./dedup.ts) so that `sourceCount` reflects *distinct*
// streams. It does not itself deduplicate.
//
// The output `providers` breakdown is shaped to align exactly with the storage
// layer's `ProviderAttribution` (`{ id, name, count }`) so the result can be
// handed to a `StatsWriter` (`TitleSourceStat.providers`) without remapping.

import type { OmssSource } from "./client.js";
import type { ProviderAttribution } from "../storage/types.js";

/**
 * Attribution summary for a resolved title.
 *
 * Invariants (Property 3 — internally consistent):
 * - `sourceCount === sources.length` of the input.
 * - `sum(providers[].count) === sourceCount`.
 * - every `providers[].id` appears on at least one input source.
 * - providers are ordered by first appearance in the input (stable).
 */
export interface Attribution {
  /** Number of (distinct) sources — equals the input length. */
  sourceCount: number;
  /** Per-provider breakdown `[{ id, name, count }]`, ordered by first appearance. */
  providers: ProviderAttribution[];
}

/**
 * Minimal structural shape needed to attribute a source to a provider. Matches
 * the relevant subset of {@link OmssSource} (`{ provider: { id, name } }`), so
 * callers can pass an `OmssSource[]` directly.
 */
export interface AttributableSource {
  provider: { id: string; name: string };
}

/**
 * Compute the source count and per-provider attribution from a deduped source
 * list.
 *
 * - `sourceCount` is exactly the number of input sources.
 * - Sources are grouped by provider `id`; the per-provider `count` sums to
 *   `sourceCount`.
 * - Providers appear in the breakdown in the order of their first occurrence in
 *   the input (stable ordering), so the result is deterministic.
 * - The `name` recorded for a provider is the one from its first occurrence.
 *
 * Requirement 1.6.
 */
export function computeAttribution(
  sources: readonly AttributableSource[]
): Attribution {
  // Map preserves insertion order, giving us stable "first appearance" ordering.
  const byProvider = new Map<string, ProviderAttribution>();

  for (const source of sources) {
    const id = source.provider?.id ?? "";
    const name = source.provider?.name ?? "";
    const existing = byProvider.get(id);
    if (existing) {
      existing.count += 1;
    } else {
      byProvider.set(id, { id, name, count: 1 });
    }
  }

  return {
    sourceCount: sources.length,
    providers: [...byProvider.values()],
  };
}

// Type-level assurance that `OmssSource` is an `AttributableSource`, so callers
// may pass `OmssResponse.sources` directly without adaptation.
const _typecheck: (s: OmssSource) => AttributableSource = (s) => s;
void _typecheck;
