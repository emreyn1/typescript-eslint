/**
 * Health classification (design component 5, "Health Check"; Req 2.2, 2.5).
 *
 * A **pure, total** function that maps a provider's test outcome
 * (`testedTitleCount`, `workingTitleCount`, optional dominant `failureReason`)
 * onto exactly one {@link HealthStatus}, with the invariant that a
 * `failureReason` is present **iff** the status is `"unhealthy"`.
 *
 * Classification rule (every provider gets exactly one status, Req 2.2):
 *   - **healthy**   — `workingTitleCount > 0` (produced at least one
 *                     Working_Source across the test set).
 *   - **unhealthy** — tested (`testedTitleCount > 0`) but produced nothing
 *                     playable (`workingTitleCount === 0`); the dominant
 *                     `failureReason` accompanies it (Req 2.5).
 *   - **unknown**   — untested (`testedTitleCount === 0`); could not be tested
 *                     (e.g. Core unreachable, provider disabled, no applicable
 *                     test titles).
 *
 * Totality: every `(testedTitleCount >= 0, workingTitleCount ∈ [0,
 * testedTitleCount])` input maps to exactly one status, and `failureReason` is
 * set **iff** `status === "unhealthy"`.
 *
 * Requirements: 2.2, 2.5.
 */

/** The mutually-exclusive health classifications (Req 2.2). */
export type HealthStatus = "healthy" | "unhealthy" | "unknown";

/** Object-form input for {@link classify}. */
export interface ClassifyInput {
  /** Number of test titles attempted for the provider (`>= 0`). */
  testedTitleCount: number;
  /** Number of test titles that yielded a Working_Source (`[0, testedTitleCount]`). */
  workingTitleCount: number;
  /** Optional dominant failure reason; only retained when the result is unhealthy. */
  failureReason?: string;
}

/**
 * The classification result. `failureReason` is present **iff**
 * `status === "unhealthy"` (Req 2.5).
 */
export interface HealthClassification {
  status: HealthStatus;
  failureReason?: string;
}

/**
 * Default failure reason used when a provider is classified `"unhealthy"` but
 * no dominant reason was supplied — preserves the "reason present iff unhealthy"
 * invariant (Req 2.5).
 */
export const DEFAULT_UNHEALTHY_REASON =
  "no working source produced across tested titles";

/**
 * Classify a provider's health from its test counts.
 *
 * Accepts either the object form (`classify({ testedTitleCount,
 * workingTitleCount, failureReason })`) or the positional form
 * (`classify(testedTitleCount, workingTitleCount, failureReason)`).
 *
 * Pure and total: depends only on its inputs (no clock, environment, or I/O),
 * and returns exactly one {@link HealthClassification} for every input. The
 * returned `failureReason` is present **iff** `status === "unhealthy"`.
 */
export function classify(input: ClassifyInput): HealthClassification;
export function classify(
  testedTitleCount: number,
  workingTitleCount: number,
  failureReason?: string
): HealthClassification;
export function classify(
  inputOrTested: ClassifyInput | number,
  workingTitleCount?: number,
  failureReason?: string
): HealthClassification {
  // Normalize the two call forms into a single shape.
  const tested =
    typeof inputOrTested === "number"
      ? inputOrTested
      : inputOrTested.testedTitleCount;
  const working =
    typeof inputOrTested === "number"
      ? workingTitleCount ?? 0
      : inputOrTested.workingTitleCount;
  const reason =
    typeof inputOrTested === "number"
      ? failureReason
      : inputOrTested.failureReason;

  // healthy: at least one title produced a Working_Source. (working > 0 implies
  // tested > 0 given the [0, tested] domain, so this is checked first.)
  if (working > 0) {
    return { status: "healthy" };
  }

  // unknown: nothing was tested (or counts are non-positive) and nothing worked.
  if (tested <= 0) {
    return { status: "unknown" };
  }

  // unhealthy: tested but produced no Working_Source. A reason always
  // accompanies an unhealthy result (Req 2.5).
  return {
    status: "unhealthy",
    failureReason:
      reason && reason.trim() !== "" ? reason : DEFAULT_UNHEALTHY_REASON,
  };
}
