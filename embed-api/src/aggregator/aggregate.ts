// Union aggregation with bounded fan-out — Req 1.2, 1.7, Resource Footprint §3.
//
// The PRIMARY GOAL of this feature is to maximize the number of working,
// distinct embed sources for a title. CinePro Core already fans out across its
// registered providers and returns a *unioned* OMSS response, so the common
// path here is simply: take the full `sources[]` union (NEVER first-match,
// Req 1.2), and apply dedup defensively before counting/selection (Req 1.5).
//
// Where embed-api itself performs concurrent per-provider work (an array of
// async source-producers rather than a single Core response), this module
// bounds parallelism with `config.providerFanoutConcurrency` so a wide provider
// set cannot exhaust CPU / sockets / RAM on a cheap VPS (Resource Footprint §3).
// The union semantics are unchanged by the limit — only the parallelism is
// bounded.
//
// Resilience (Req 1.7): a provider that throws or returns nothing contributes
// `[]` and does NOT abort the others — every succeeding provider's sources are
// collected.
//
// Dedup lives in `./dedup.ts`; the canonical source shape is `OmssSource` from
// `./client.ts`.
import { config } from "../config.js";
import { dedup } from "./dedup.js";
import type { OmssResponse, OmssSource } from "./client.js";

/** A value or a promise of that value. */
export type MaybePromise<T> = T | Promise<T>;

/**
 * An async (or sync) producer of one provider's sources. Intended to wrap a
 * single provider scrape so many can be run with bounded parallelism. A
 * producer SHOULD return `[]` on a miss; if it throws, {@link aggregate}
 * defensively treats it as `[]` (Req 1.7).
 */
export type SourceProducer = () => MaybePromise<readonly OmssSource[]>;

/**
 * Accepted aggregation inputs:
 *  - a full {@link OmssResponse} from CinePro Core (already a provider union), or
 *  - an array whose elements are each either a ready per-provider source list
 *    or a {@link SourceProducer} that resolves one (for embed-api-side fan-out).
 */
export type AggregateInput =
  | OmssResponse
  | ReadonlyArray<readonly OmssSource[] | SourceProducer>;

/**
 * Run `worker` over `items` with at most `limit` invocations in flight at once,
 * returning the results in input order (like a bounded `Promise.all`).
 *
 * General-purpose bounded-concurrency primitive used by {@link aggregate} to
 * cap provider fan-out (Resource Footprint §3), exported because it is broadly
 * useful for any "do N async things, but no more than K at a time" need.
 *
 * `limit` is clamped to at least 1 and never exceeds `items.length`; a
 * non-finite/non-positive `limit` falls back to a single worker. Rejections
 * from `worker` propagate (callers that need resilience should make `worker`
 * total — see {@link aggregate}).
 */
export async function boundedMap<T, R>(
  items: readonly T[],
  worker: (item: T, index: number) => MaybePromise<R>,
  limit: number = config.providerFanoutConcurrency
): Promise<R[]> {
  const results = new Array<R>(items.length);
  if (items.length === 0) {
    return results;
  }

  const workers = normalizeConcurrency(limit, items.length);
  let next = 0;

  // Each runner pulls the next index until the queue is drained. Running
  // `workers` runners concurrently bounds in-flight work to exactly `workers`.
  async function run(): Promise<void> {
    for (;;) {
      const index = next++;
      if (index >= items.length) {
        return;
      }
      results[index] = await worker(items[index], index);
    }
  }

  const runners: Array<Promise<void>> = [];
  for (let i = 0; i < workers; i++) {
    runners.push(run());
  }
  await Promise.all(runners);
  return results;
}

/**
 * Aggregate sources into the **deduped union of all providers**.
 *
 * - Given an {@link OmssResponse} (CinePro Core already unioned its providers):
 *   returns `dedup(response.sources)` — the full union, never first-match
 *   (Req 1.2), with duplicates collapsed defensively (Req 1.5).
 * - Given an array of per-provider source lists and/or {@link SourceProducer}s:
 *   runs the producers with bounded parallelism (`concurrency`, default
 *   `config.providerFanoutConcurrency`, Resource Footprint §3), collects from
 *   every producer that succeeds, treats a thrown/empty producer as `[]`
 *   without aborting the rest (Req 1.7), then returns the deduped union.
 *
 * Always returns the union across all succeeding providers — it never stops at
 * the first provider that yields a source.
 */
export async function aggregate(
  input: AggregateInput,
  concurrency: number = config.providerFanoutConcurrency
): Promise<OmssSource[]> {
  // Case 1: a full OMSS response — Core already produced the provider union.
  if (isOmssResponse(input)) {
    return dedup(Array.isArray(input.sources) ? input.sources : []);
  }

  // Case 2/3: an array of ready source lists and/or async producers. Normalize
  // every element to a producer, then fan out with bounded parallelism.
  const producers = input.map(toProducer);
  const perProvider = await boundedMap(
    producers,
    (produce) => runProducerSafely(produce),
    concurrency
  );

  // Union: concatenate every provider's contribution (Req 1.2), then dedup
  // defensively before the count/selection downstream (Req 1.5).
  const union: OmssSource[] = [];
  for (const list of perProvider) {
    for (const source of list) {
      union.push(source);
    }
  }
  return dedup(union);
}

/**
 * Resilient producer runner (Req 1.7): awaits a producer and returns its
 * sources, mapping ANY failure (throw / rejection) or non-array result to `[]`
 * so one bad provider can never abort the aggregation of the others.
 */
async function runProducerSafely(
  produce: SourceProducer
): Promise<readonly OmssSource[]> {
  try {
    const out = await produce();
    return Array.isArray(out) ? out : [];
  } catch {
    return [];
  }
}

/** Wrap a ready source list as a producer; pass producers through unchanged. */
function toProducer(
  item: readonly OmssSource[] | SourceProducer
): SourceProducer {
  return typeof item === "function" ? item : () => item;
}

/** Type guard: a non-array object carrying a `sources` field is an OMSS response. */
function isOmssResponse(input: AggregateInput): input is OmssResponse {
  return (
    typeof input === "object" &&
    input !== null &&
    !Array.isArray(input) &&
    "sources" in input
  );
}

/**
 * Clamp a requested concurrency `limit` to a usable worker count: at least 1,
 * an integer, and never more than the number of items to process. A
 * non-finite/non-positive limit falls back to a single worker (fully serial).
 */
function normalizeConcurrency(limit: number, itemCount: number): number {
  let n = Number.isFinite(limit) ? Math.floor(limit) : 1;
  if (n < 1) {
    n = 1;
  }
  return Math.min(n, itemCount);
}
