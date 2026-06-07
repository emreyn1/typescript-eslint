// Source Selector — Req 4.4, 4.5, 4.6
//
// Pure, total source selection for the OMSS aggregation core. Implements the
// "Source-selection algorithm" from the design:
//   1. Prefer `hls` sources over all other types (Req 4.5).
//   2. Among the chosen pool, pick the highest quality (Req 4.6).
//   3. Deterministic tie-break so selection is a pure, total function:
//      earliest index, then lexicographically smallest provider.id.
//   4. Empty input → null (Req 4.4 selects a source only when one exists).
//
// The full `OmssSource` shape lives in `./client.ts` (Aggregator Client, task
// 4.1, built in parallel). To keep this module decoupled while that file lands
// — and to remain compatible once it exists — selection is written against a
// minimal structural type and is generic, so it accepts and returns the full
// `OmssSource` (a structural supertype) unchanged.

/**
 * Minimal structural shape this selector depends on. `OmssSource` from
 * `./client.ts` is structurally assignable to this, so `selectSource` works
 * directly on `OmssSource[]` and returns the matching element type.
 */
export interface SelectableSource {
  type: string;
  quality?: string | null;
  provider: { id: string; name: string };
}

/**
 * Map an OMSS `quality` string to a numeric rank (higher is better).
 *
 * - Named resolutions: `2160p`/`4k` → 2160, `1440p` → 1440, `1080p` → 1080,
 *   `720p` → 720, `480p` → 480, `360p` → 360.
 * - Any generic `<n>p` token → `n` (e.g. `"4320p"` → 4320, `"240p"` → 240).
 * - `"auto"`, empty string, `null`/`undefined` → 1 (selectable but lowest real
 *   priority).
 * - Anything else → 0.
 *
 * Pure and total over all string | null | undefined inputs.
 */
export function qualityRank(quality?: string | null): number {
  if (quality === null || quality === undefined) {
    return 1;
  }

  const normalized = quality.trim().toLowerCase();

  if (normalized === "") {
    return 1;
  }
  if (normalized === "auto") {
    return 1;
  }
  if (normalized === "4k") {
    return 2160;
  }

  // Generic "<digits>p" anywhere in the string (covers 2160p/1440p/1080p/720p/
  // 480p/360p and any other "<n>p" resolution).
  const match = normalized.match(/(\d+)p/);
  if (match) {
    return Number.parseInt(match[1], 10);
  }

  return 0;
}

/**
 * Select the single best source to play, or `null` when there are none.
 *
 * Ordering (highest priority first):
 *   1. Prefer `hls` type — if any `hls` source exists, only `hls` sources are
 *      eligible; otherwise the whole list is eligible (Req 4.5).
 *   2. Highest `qualityRank` wins (Req 4.6).
 *   3. Tie-break: earliest index in the original list, then lexicographically
 *      smallest `provider.id`.
 *
 * Pure and total: for any non-empty input it returns exactly one element of the
 * input; for empty input it returns `null`. Generic so the full `OmssSource`
 * type flows through unchanged.
 */
export function selectSource<T extends SelectableSource>(sources: T[]): T | null {
  if (sources.length === 0) {
    return null;
  }

  // Req 4.5: prefer hls; fall back to the full list when no hls source exists.
  const hls = sources.filter((s) => s.type === "hls");
  const pool = hls.length > 0 ? hls : sources;

  // Track each candidate's index within the original `sources` array so the
  // tie-break "earliest index" is stable regardless of filtering.
  let best: T = pool[0];
  let bestIndex = sources.indexOf(best);
  let bestRank = qualityRank(best.quality);

  for (let i = 1; i < pool.length; i++) {
    const candidate = pool[i];
    const candidateIndex = sources.indexOf(candidate);
    const candidateRank = qualityRank(candidate.quality);

    if (isBetter(candidate, candidateIndex, candidateRank, best, bestIndex, bestRank)) {
      best = candidate;
      bestIndex = candidateIndex;
      bestRank = candidateRank;
    }
  }

  return best;
}

/**
 * Total ordering used by `selectSource`: higher quality first, then earliest
 * original index, then lexicographically smallest provider id.
 */
function isBetter(
  candidate: SelectableSource,
  candidateIndex: number,
  candidateRank: number,
  current: SelectableSource,
  currentIndex: number,
  currentRank: number,
): boolean {
  if (candidateRank !== currentRank) {
    return candidateRank > currentRank;
  }
  if (candidateIndex !== currentIndex) {
    return candidateIndex < currentIndex;
  }
  // Same rank and same index is impossible for distinct elements; the provider
  // id is the final deterministic discriminator.
  return candidate.provider.id < current.provider.id;
}
