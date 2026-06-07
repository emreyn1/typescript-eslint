/**
 * HealthChecker (design component 5, "Health Check"; Req 2.1, 2.3, 2.4).
 *
 * Tests whether each CinePro Core provider actually produces a *playable*
 * (Working_Source) result across a configurable set of test titles, then
 * aggregates the per-provider outcomes into a {@link ProviderReport}. The
 * report is the artifact the authed `/admin/providers/report` endpoint
 * (task 8.9) and the `health:check` CLI (task 8.11) surface, and it drives the
 * unhealthy-provider exclusion filter (task 8.7).
 *
 * Playability decision (Req 2.1): a single source is "working" iff a
 * `HEAD`/range `GET` through its proxy path returns 2xx **and** — for `hls`
 * sources — the response body parses as a valid manifest with at least one
 * segment or variant. Any network error, timeout, or non-2xx response yields
 * `working: false` with a recorded reason.
 *
 * Classification (Req 2.2, 2.5) is delegated to the pure {@link classify}
 * function: a provider with `workingTitleCount > 0` is healthy; one that was
 * tested (`testedTitleCount > 0`) but produced nothing playable is unhealthy
 * (with a dominant `failureReason`); one that could not be tested at all is
 * unknown.
 *
 * Provider discovery (design note): the set of providers comes from CinePro
 * Core, not from embed-api. To keep this component **testable and not
 * hard-wired to a live Core**, the checker takes its providers from one of two
 * injected sources, in priority order:
 *   1. An explicit `providers` list passed to the constructor (used by tests
 *      and by callers that already know the registered provider set), or
 *   2. Auto-discovery from the OMSS responses themselves — the distinct
 *      `provider {id,name}` entries that appear in `sources[]` and the
 *      `diagnostics[]` of the resolved test titles (mirrors how Core reports
 *      which providers it attempted).
 * The title-resolution and per-source playability probe are likewise injected
 * (defaulting to an {@link AggregatorClient} and a real `fetch`-based probe),
 * so the whole component can be unit-tested with no network.
 *
 * Requirements: 2.1, 2.3, 2.4.
 */
import { config } from "../config.js";
import { classify, type HealthStatus } from "./classify.js";
import { boundedMap } from "../aggregator/aggregate.js";
import { selectSource } from "../aggregator/select.js";
import {
  AggregatorClient,
  CoreUnavailableError,
  type OmssResponse,
  type OmssSource,
} from "../aggregator/client.js";

// Re-export so callers can use the classification type from the health domain.
export type { HealthStatus } from "./classify.js";

/**
 * A reference to a title to health-check. For movies, `season`/`episode` are
 * omitted; for TV they are required.
 */
export interface TitleRef {
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}

/** A provider identity (id + human-readable name) as reported by Core. */
export interface ProviderRef {
  id: string;
  name: string;
}

/**
 * The outcome of checking one provider against one title (Req 2.1). Carries the
 * title identifiers through so a per-title audit is possible.
 */
export interface ProviderTitleResult {
  providerId: string;
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  /** True iff a playable Working_Source was produced for this provider+title. */
  working: boolean;
  /** Present when `working` is false — why the source was not playable. */
  reason?: string;
}

/**
 * A single provider's aggregated health across the test-title set (Req 2.4).
 * `failureReason` is present **iff** `status === "unhealthy"` (Req 2.5),
 * inherited from {@link classify}.
 */
export interface ProviderHealth {
  providerId: string;
  providerName: string;
  /** Exactly one of healthy / unhealthy / unknown (Req 2.2). */
  status: HealthStatus;
  /** Number of test titles that yielded a Working_Source (Req 2.4). */
  workingTitleCount: number;
  /** Number of test titles actually tested for this provider. */
  testedTitleCount: number;
  /** ISO-8601 time the check was performed (Req 2.4). */
  checkedAt: string;
  /** Dominant failure reason; present iff unhealthy (Req 2.5). */
  failureReason?: string;
}

/**
 * The aggregated report across all providers and test titles (Req 2.3). This is
 * the canonical shape persisted by the HealthReportStore (task 8.5) and served
 * by the report endpoint — `store.ts` imports these types from here.
 */
export interface ProviderReport {
  /** ISO-8601 time the whole report was generated. */
  generatedAt: string;
  /** The test titles the run was executed against. */
  testTitles: TitleRef[];
  /** Per-provider health, one entry per discovered/configured provider. */
  providers: ProviderHealth[];
}

/**
 * Resolves a title into an OMSS response. The default is an
 * {@link AggregatorClient}; tests inject a stub.
 */
export interface TitleResolver {
  resolve(title: TitleRef): Promise<OmssResponse>;
}

/** The result of probing a single source for playability. */
export interface ProbeResult {
  working: boolean;
  reason?: string;
}

/**
 * Decides whether a single source is playable (Req 2.1). The default
 * implementation issues a `HEAD`/range `GET` through the proxy path and, for
 * `hls`, validates the manifest; tests inject a deterministic stub.
 */
export interface PlayabilityProbe {
  probe(source: OmssSource): Promise<ProbeResult>;
}

/** A minimal `fetch` shape so the default probe can be unit-tested. */
export type FetchLike = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  }
) => Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
}>;

/** Constructor dependencies for {@link HealthChecker} (all optional). */
export interface HealthCheckerDeps {
  /** Resolves a title → OMSS. Defaults to a new {@link AggregatorClient}. */
  resolver?: TitleResolver;
  /** Probes a source for playability. Defaults to the proxy-fetch probe. */
  probe?: PlayabilityProbe;
  /**
   * Explicit provider set to test. When omitted, providers are auto-discovered
   * from the OMSS responses of the test titles (sources + diagnostics).
   */
  providers?: ProviderRef[];
  /** Clock injection for deterministic timestamps. Defaults to `Date`. */
  now?: () => Date;
  /** Bounded fan-out for probes. Defaults to `config.providerFanoutConcurrency`. */
  concurrency?: number;
}

/**
 * Adapts an {@link AggregatorClient} to the {@link TitleResolver} interface,
 * dispatching movie vs. TV to the right Core endpoint.
 */
export class AggregatorTitleResolver implements TitleResolver {
  constructor(private readonly client: AggregatorClient = new AggregatorClient()) {}

  resolve(title: TitleRef): Promise<OmssResponse> {
    if (title.type === "tv") {
      return this.client.getTvSources(
        title.tmdbId,
        title.season ?? 0,
        title.episode ?? 0
      );
    }
    return this.client.getMovieSources(title.tmdbId);
  }
}

/**
 * Validate that an HLS manifest body has at least one segment or variant
 * (Req 2.1). Accepts a master playlist (one or more `#EXT-X-STREAM-INF`
 * variants) or a media playlist (one or more `#EXTINF` segments, or any
 * non-comment URI line). Returns false for a body that is not a manifest.
 */
export function isPlayableHlsManifest(body: string): boolean {
  if (typeof body !== "string") return false;
  const text = body.trim();
  if (text === "" || !text.includes("#EXTM3U")) return false;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== "");

  // A variant (master playlist) or a segment marker (media playlist).
  const hasVariant = lines.some((l) => l.startsWith("#EXT-X-STREAM-INF"));
  const hasSegmentMarker = lines.some((l) => l.startsWith("#EXTINF"));
  // Any non-comment, non-blank line is a URI (segment or variant target).
  const hasUri = lines.some((l) => !l.startsWith("#"));

  return hasVariant || hasSegmentMarker || hasUri;
}

/**
 * Default {@link PlayabilityProbe}: resolves the Core-relative proxy `url` to an
 * absolute Core URL and issues a `HEAD` (non-hls) or range `GET` (hls, so the
 * manifest body can be parsed). 2xx is required; for `hls` the body must parse
 * as a valid manifest with ≥1 segment/variant. Any timeout/network/non-2xx →
 * `working: false` with a reason. The Core base URL is used only to build the
 * outbound request and is never surfaced in results.
 */
export class ProxyFetchProbe implements PlayabilityProbe {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: FetchLike;

  constructor(
    fetchImpl: FetchLike = fetch as unknown as FetchLike,
    baseUrl: string = config.cineproBaseUrl,
    timeoutMs: number = config.cineproTimeoutMs
  ) {
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.timeoutMs =
      Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 10000;
  }

  async probe(source: OmssSource): Promise<ProbeResult> {
    const url = this.absolute(source.url);
    const isHls = source.type === "hls";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await this.fetchImpl(url, {
        // hls needs the body to validate the manifest; everything else is a
        // light range GET so we never pull a full media file.
        method: isHls ? "GET" : "HEAD",
        headers: isHls ? {} : { range: "bytes=0-1" },
        signal: controller.signal,
      });

      if (!res.ok) {
        return {
          working: false,
          reason: `proxy returned ${res.status} ${res.statusText}`,
        };
      }

      if (isHls) {
        const body = await res.text();
        if (!isPlayableHlsManifest(body)) {
          return {
            working: false,
            reason: "hls manifest had no segments or variants",
          };
        }
      }

      return { working: true };
    } catch (err) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      return {
        working: false,
        reason: isAbort
          ? `probe timed out after ${this.timeoutMs}ms`
          : `probe failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /** Join a Core-relative proxy path onto the base URL. */
  private absolute(rawUrl: string): string {
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    return `${this.baseUrl}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
  }
}

/**
 * Orchestrates provider health testing and report generation.
 *
 * Construct with no arguments for the production wiring (real Core client +
 * proxy-fetch probe, providers auto-discovered from Core), or inject any of the
 * dependencies for testing.
 */
export class HealthChecker {
  private readonly resolver: TitleResolver;
  private readonly probe: PlayabilityProbe;
  private readonly injectedProviders?: ProviderRef[];
  private readonly now: () => Date;
  private readonly concurrency: number;

  constructor(deps: HealthCheckerDeps = {}) {
    this.resolver = deps.resolver ?? new AggregatorTitleResolver();
    this.probe = deps.probe ?? new ProxyFetchProbe();
    this.injectedProviders = deps.providers;
    this.now = deps.now ?? (() => new Date());
    this.concurrency =
      deps.concurrency && deps.concurrency > 0
        ? deps.concurrency
        : config.providerFanoutConcurrency;
  }

  /**
   * Decide playability for a single provider against a single title (Req 2.1).
   * Resolves the title, picks the best source contributed by `providerId`
   * (preferring hls / highest quality via the shared selector), and probes it.
   * A provider that contributed no source, or a failed resolution, yields
   * `working: false` with a reason.
   */
  async checkProviderTitle(
    providerId: string,
    title: TitleRef
  ): Promise<ProviderTitleResult> {
    let response: OmssResponse;
    try {
      response = await this.resolver.resolve(title);
    } catch (err) {
      return this.titleResult(providerId, title, {
        working: false,
        reason:
          err instanceof CoreUnavailableError
            ? `core unavailable: ${err.message}`
            : `resolution failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }

    const providerSources = (response.sources ?? []).filter(
      (s) => s.provider?.id === providerId
    );
    if (providerSources.length === 0) {
      return this.titleResult(providerId, title, {
        working: false,
        reason: "provider returned no source for title",
      });
    }

    const best = selectSource(providerSources);
    if (best === null) {
      return this.titleResult(providerId, title, {
        working: false,
        reason: "provider returned no selectable source",
      });
    }

    const probed = await this.probe.probe(best);
    return this.titleResult(providerId, title, probed);
  }

  /**
   * Run health checks for every configured/discovered provider across all
   * `titles` and produce a {@link ProviderReport} (Req 2.3, 2.4).
   *
   * Each title is resolved exactly once. A title whose resolution fails is
   * counted as *not tested* for any provider (so a fully-unreachable Core
   * leaves providers classified `unknown`, never falsely `unhealthy`). For each
   * successfully-resolved title, every provider's best contributed source is
   * probed; per-provider working/tested counts are aggregated and passed to the
   * pure {@link classify} function to derive status + failureReason.
   */
  async runHealthChecks(titles: TitleRef[]): Promise<ProviderReport> {
    const generatedAt = this.now().toISOString();

    // 1. Resolve each title once (bounded fan-out). Failed resolutions are
    //    recorded as `null` so those titles count as untested.
    const resolved = await boundedMap(
      titles,
      async (title) => {
        try {
          return { title, response: await this.resolver.resolve(title) };
        } catch {
          return { title, response: null as OmssResponse | null };
        }
      },
      this.concurrency
    );

    // 2. Determine the provider set: explicit injection wins; otherwise
    //    auto-discover from the OMSS responses (sources + diagnostics).
    const providers =
      this.injectedProviders && this.injectedProviders.length > 0
        ? this.injectedProviders
        : discoverProviders(resolved.map((r) => r.response));

    const checkedAt = this.now().toISOString();

    // 3. For each provider, probe its best source on every successfully
    //    resolved title and tally working/tested counts.
    const providerHealth = await boundedMap(
      providers,
      async (provider) => this.aggregateProvider(provider, resolved, checkedAt),
      this.concurrency
    );

    return {
      generatedAt,
      testTitles: titles,
      providers: providerHealth,
    };
  }

  /**
   * Aggregate one provider's outcomes across all resolved titles into a
   * {@link ProviderHealth}, using {@link classify} for the final status/reason.
   */
  private async aggregateProvider(
    provider: ProviderRef,
    resolved: { title: TitleRef; response: OmssResponse | null }[],
    checkedAt: string
  ): Promise<ProviderHealth> {
    let testedTitleCount = 0;
    let workingTitleCount = 0;
    const failureReasons: string[] = [];

    for (const { response } of resolved) {
      // A title whose resolution failed is not testable for any provider.
      if (response === null) continue;
      testedTitleCount += 1;

      const providerSources = (response.sources ?? []).filter(
        (s) => s.provider?.id === provider.id
      );

      if (providerSources.length === 0) {
        failureReasons.push("provider returned no source for title");
        continue;
      }

      const best = selectSource(providerSources);
      if (best === null) {
        failureReasons.push("provider returned no selectable source");
        continue;
      }

      const probed = await this.probe.probe(best);
      if (probed.working) {
        workingTitleCount += 1;
      } else if (probed.reason) {
        failureReasons.push(probed.reason);
      }
    }

    const { status, failureReason } = classify({
      testedTitleCount,
      workingTitleCount,
      failureReason: dominantReason(failureReasons),
    });

    return {
      providerId: provider.id,
      providerName: provider.name,
      status,
      workingTitleCount,
      testedTitleCount,
      checkedAt,
      ...(failureReason ? { failureReason } : {}),
    };
  }

  /** Assemble a {@link ProviderTitleResult}, copying through title identifiers. */
  private titleResult(
    providerId: string,
    title: TitleRef,
    probed: ProbeResult
  ): ProviderTitleResult {
    return {
      providerId,
      tmdbId: title.tmdbId,
      type: title.type,
      ...(title.season !== undefined ? { season: title.season } : {}),
      ...(title.episode !== undefined ? { episode: title.episode } : {}),
      working: probed.working,
      ...(probed.reason ? { reason: probed.reason } : {}),
    };
  }
}

/**
 * Auto-discover the distinct provider set from a batch of OMSS responses. A
 * provider is included if it appears in any response's `sources[]`
 * (`provider {id,name}`) or `diagnostics[]` (`provider` name). Diagnostics-only
 * providers (Core attempted them but they produced no source) are included so
 * they can be classified `unhealthy` rather than silently dropped.
 */
export function discoverProviders(
  responses: (OmssResponse | null)[]
): ProviderRef[] {
  const byId = new Map<string, ProviderRef>();

  for (const response of responses) {
    if (!response) continue;

    for (const source of response.sources ?? []) {
      const p = source.provider;
      if (p?.id && !byId.has(p.id)) {
        byId.set(p.id, { id: p.id, name: p.name ?? p.id });
      }
    }

    for (const diag of response.diagnostics ?? []) {
      // Diagnostics carry the provider name; use it as both id and name when no
      // source-derived id already exists for it.
      const name = diag.provider;
      if (name && !byId.has(name)) {
        byId.set(name, { id: name, name });
      }
    }
  }

  return [...byId.values()];
}

/**
 * Pick the dominant (most frequent) failure reason from a list, breaking ties
 * by first occurrence. Returns undefined for an empty list.
 */
function dominantReason(reasons: string[]): string | undefined {
  if (reasons.length === 0) return undefined;

  const counts = new Map<string, number>();
  for (const r of reasons) {
    counts.set(r, (counts.get(r) ?? 0) + 1);
  }

  let best = reasons[0];
  let bestCount = 0;
  for (const r of reasons) {
    const c = counts.get(r) ?? 0;
    if (c > bestCount) {
      best = r;
      bestCount = c;
    }
  }
  return best;
}
