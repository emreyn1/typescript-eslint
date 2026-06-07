/**
 * Aggregator Client — a thin HTTP client to CinePro Core (the OMSS-compliant
 * scraping engine). It is responsible for calling the right Core endpoint,
 * enforcing the configured timeout, parsing the OMSS response, and triggering a
 * single `expiresAt` refresh when the returned response has already expired.
 *
 * Design: Components & Interfaces → "1. Aggregator Client".
 * Requirements: 4.1, 4.2, 4.3 (endpoint routing / id pass-through),
 *               7.3 (10s timeout), 7.4 (one expiresAt refresh).
 *
 * Security boundary: the Core base URL (`config.cineproBaseUrl`) is only ever
 * used to build the outbound request URL. It is never copied into the parsed
 * {@link OmssResponse} returned to callers, so the internal Core host cannot
 * leak to the client (Req 6.4 is enforced downstream; this client simply never
 * surfaces the base URL).
 */
import { config } from "../config.js";

/**
 * The media container/transport type of a single playable {@link OmssSource}.
 * Mirrors the OMSS contract exactly (design component 1).
 */
export type OmssSourceType = "hls" | "dash" | "http" | "mp4" | "mkv" | "webm";

/** A single audio track advertised on a source. */
export interface OmssAudioTrack {
  lang: string;
  label?: string;
}

/** A subtitle track advertised on an OMSS response. */
export interface OmssSubtitle {
  lang: string;
  url: string;
  label?: string;
}

/** Per-provider diagnostic entry from a CinePro Core resolution. */
export interface OmssDiagnostic {
  provider: string;
  ok: boolean;
  reason?: string;
}

/**
 * A single playable stream entry. `url` is a CinePro Core-relative proxy path
 * (`/v1/proxy?data=...`); it is rewritten into an embed-api-served `/stream`
 * URL downstream — never served to the client as-is.
 */
export interface OmssSource {
  url: string;
  type: OmssSourceType;
  quality?: string;
  audioTracks?: OmssAudioTrack[];
  provider: { id: string; name: string };
}

/**
 * The OMSS response contract returned by CinePro Core for a title:
 * `{ responseId, expiresAt, sources[], subtitles[], diagnostics[] }`.
 */
export interface OmssResponse {
  responseId: string;
  /** ISO-8601 instant after which the resolution must be refreshed. */
  expiresAt: string;
  sources: OmssSource[];
  subtitles?: OmssSubtitle[];
  diagnostics?: OmssDiagnostic[];
}

/**
 * Thrown when CinePro Core cannot be reached or returns a non-success result:
 * a non-2xx status, a network error, or a timeout abort. Routes catch this and
 * serve the "Content Unavailable" page while logging the failure (Req 7.2).
 */
export class CoreUnavailableError extends Error {
  /** The endpoint path that was being requested (no base URL — never leaked). */
  readonly endpoint: string;
  /** The underlying cause (HTTP status text, abort, or network error). */
  override readonly cause?: unknown;

  constructor(message: string, endpoint: string, cause?: unknown) {
    super(message);
    this.name = "CoreUnavailableError";
    this.endpoint = endpoint;
    this.cause = cause;
  }
}

/**
 * HTTP client to CinePro Core. Construct once and reuse; all behavior is read
 * from {@link config} (base URL + timeout) so nothing is hard-coded.
 */
export class AggregatorClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(
    baseUrl: string = config.cineproBaseUrl,
    timeoutMs: number = config.cineproTimeoutMs
  ) {
    // Trim a trailing slash so endpoint joins are unambiguous.
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    // Guard against a non-positive/NaN override; fall back to the 10s default.
    this.timeoutMs = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 10000;
  }

  /**
   * Resolve a movie title. Calls `GET {cineproBaseUrl}/v1/movies/{tmdbId}`
   * (Req 4.1), passing `tmdbId` through exactly as received (Req 4.3).
   */
  async getMovieSources(tmdbId: number): Promise<OmssResponse> {
    const endpoint = `/v1/movies/${tmdbId}`;
    return this.resolve(endpoint);
  }

  /**
   * Resolve a TV episode. Calls
   * `GET {cineproBaseUrl}/v1/tv/{tmdbId}/{season}/{episode}` (Req 4.2),
   * passing the identifiers through exactly as received (Req 4.3).
   */
  async getTvSources(
    tmdbId: number,
    season: number,
    episode: number
  ): Promise<OmssResponse> {
    const endpoint = `/v1/tv/${tmdbId}/${season}/${episode}`;
    return this.resolve(endpoint);
  }

  /**
   * Fetch + parse the endpoint, then perform exactly one refresh fetch when the
   * parsed response has already expired (Req 7.4). The refresh result is
   * returned even if it too is expired — only a single refresh is attempted.
   */
  private async resolve(endpoint: string): Promise<OmssResponse> {
    const first = await this.fetchOmss(endpoint);
    if (this.isExpired(first.expiresAt)) {
      // Exactly one refresh fetch before returning (Req 7.4).
      return this.fetchOmss(endpoint);
    }
    return first;
  }

  /**
   * Perform a single GET against Core with an `AbortController` timeout
   * (Req 7.3), parse the OMSS JSON body, and normalize failures into
   * {@link CoreUnavailableError}.
   */
  private async fetchOmss(endpoint: string): Promise<OmssResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: { accept: "application/json" },
        signal: controller.signal,
      });
    } catch (err) {
      // Network error or timeout abort → Core unavailable (Req 7.2, 7.3).
      const isAbort = err instanceof Error && err.name === "AbortError";
      throw new CoreUnavailableError(
        isAbort
          ? `CinePro Core timed out after ${this.timeoutMs}ms`
          : "CinePro Core is unreachable",
        endpoint,
        err
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      // Non-2xx → Core unavailable (Req 7.2).
      throw new CoreUnavailableError(
        `CinePro Core returned ${response.status} ${response.statusText}`,
        endpoint
      );
    }

    try {
      const body = (await response.json()) as OmssResponse;
      return this.normalize(body);
    } catch (err) {
      throw new CoreUnavailableError(
        "CinePro Core returned an unparseable OMSS response",
        endpoint,
        err
      );
    }
  }

  /**
   * Defensively normalize the parsed body into a well-formed
   * {@link OmssResponse}, ensuring `sources` is always an array so callers
   * (selector, dedup) never have to null-check. The Core base URL is never
   * injected here — only fields present in the OMSS contract are surfaced.
   */
  private normalize(body: OmssResponse): OmssResponse {
    return {
      responseId: body?.responseId ?? "",
      expiresAt: body?.expiresAt ?? "",
      sources: Array.isArray(body?.sources) ? body.sources : [],
      ...(body?.subtitles ? { subtitles: body.subtitles } : {}),
      ...(body?.diagnostics ? { diagnostics: body.diagnostics } : {}),
    };
  }

  /**
   * True when `expiresAt` is a valid instant strictly in the past. An invalid
   * or missing `expiresAt` is treated as NOT expired, so a malformed timestamp
   * does not trigger an unbounded refresh loop (we only ever refresh once).
   */
  private isExpired(expiresAt: string, now: number = Date.now()): boolean {
    const t = Date.parse(expiresAt);
    if (Number.isNaN(t)) return false;
    return t < now;
  }
}
