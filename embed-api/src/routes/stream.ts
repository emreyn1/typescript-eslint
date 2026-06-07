/**
 * Stream Proxy — design component 4 ("Stream Proxy", `src/routes/stream.ts`).
 *
 * `GET /stream?data=<signed>` is the single byte-serving endpoint behind the
 * player. The `data` the browser holds is NEVER the raw CinePro Core proxy
 * `data` parameter — it is an opaque, HMAC-signed `Session_Token`
 * (`protection/streamToken.ts`) that encodes the original Core `data` (or a
 * resolved child URL) plus an expiry. The Core host and raw `data` are
 * therefore never exposed to the client (Req 6.1, 6.4).
 *
 * STREAM GATE (Req 13.3) — an AND-gate enforced *before any byte* is served:
 *   1. a valid, unexpired, signature-correct HMAC `Session_Token`, AND
 *   2. a passing fingerprint / anti-debug signal (the `_fp` cookie set by the
 *      `fingerprintScript` injected into `player-v2.html`).
 * A missing / invalid / expired token OR a failed fingerprint → **403**,
 * never a partial stream.
 *
 * PROXY MODE (`config.proxyMode`) — the dominant cheap-VPS egress lever:
 *   - `proxy` (default): both the `.m3u8` manifest and every segment/variant
 *     transit embed-api; child URIs are rewritten back through `/stream` so the
 *     Core host stays hidden and every byte flows through embed-api.
 *   - `playlist-only`: only the manifest transits embed-api; its child URIs are
 *     rewritten to absolute upstream URLs so the heavy segment bytes bypass
 *     embed-api (host of the *segments* may be exposed; big bandwidth saving).
 *   - `redirect`: 302-redirect straight to the upstream/Core URL (lightest;
 *     loses host-hiding for whatever the client is redirected to).
 *
 * CACHE-CONTROL (Req 14.2, 14.3) — via the `cacheControlFor` matrix: every
 * `segment` and every `Session_Token` response is `no-store` on every surface;
 * only the `.m3u8` manifest may carry the CDN-cacheable header, and only on the
 * public surface.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 13.3, 14.2, 14.3; Resource Footprint §2.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Readable } from "node:stream";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import { config } from "../config.js";
import { signStreamToken, verifyStreamToken } from "../protection/streamToken.js";
import { cacheControlFor } from "../cache/cacheControl.js";
import type { Surface } from "../policy/index.js";

/** Shape of the `/stream` query string. */
interface StreamQuery {
  /** The opaque, HMAC-signed `Session_Token`. */
  data?: string;
  /** Optional surface hint (`public_embed` | `cinex_watch`); defaults safely. */
  surface?: string;
}

/**
 * Resolve the delivery {@link Surface} for this request from its context.
 *
 * The surface only affects the **manifest** cache-control header (CDN-cacheable
 * on `public_embed`, `private, no-cache` otherwise). Segments and tokens are
 * `no-store` regardless, so an unknown/missing surface defaults to the
 * conservative `cinex_watch` — never the more-cacheable one.
 */
function resolveSurface(req: FastifyRequest): Surface {
  const raw = ((req.query as StreamQuery).surface ?? "").trim().toLowerCase();
  return raw === "public_embed" || raw === "embed" ? "public_embed" : "cinex_watch";
}

/**
 * The fingerprint half of the stream gate (Req 13.3). The `fingerprintScript`
 * in `player-v2.html` computes a fingerprint and persists it in the `_fp`
 * cookie before the player ever requests a stream. A present, non-empty `_fp`
 * cookie is the server-observable "passing fingerprint / anti-debug signal";
 * its absence fails the gate.
 */
function hasPassingFingerprint(req: FastifyRequest): boolean {
  const cookieHeader = req.headers["cookie"];
  if (typeof cookieHeader !== "string" || cookieHeader.length === 0) return false;
  const match = cookieHeader.match(/(?:^|;\s*)_fp=([^;]*)/);
  return match !== null && match[1].trim().length > 0;
}

/**
 * Map the verified Core `data` to the absolute upstream URL to fetch.
 *
 * - An already-absolute `http(s)` value is a resolved child URL (produced when
 *   we rewrote a manifest in `proxy` mode) — fetch it directly.
 * - Anything else is the original CinePro Core proxy `data` parameter — fetch
 *   it via `${config.cineproBaseUrl}/v1/proxy?data=...` (Req 6.2). The base URL
 *   is server-side only and never returned to the client.
 */
function resolveUpstreamUrl(coreData: string): string {
  if (/^https?:\/\//i.test(coreData)) return coreData;
  return `${config.cineproBaseUrl}/v1/proxy?data=${encodeURIComponent(coreData)}`;
}

/** True when the upstream response is an HLS manifest (by content-type or path). */
function isManifest(contentType: string, upstreamUrl: string): boolean {
  const ct = contentType.toLowerCase();
  if (ct.includes("mpegurl")) return true; // covers application/vnd.apple.mpegurl, audio/x-mpegurl, ...
  const path = upstreamUrl.split("?")[0].toLowerCase();
  return path.endsWith(".m3u8");
}

/**
 * Rewrite a single child URI found in a manifest.
 *
 * - `proxy` mode: resolve to absolute, then route it back through `/stream` as
 *   a freshly-signed token so the upstream/Core host stays hidden and every
 *   byte transits embed-api.
 * - `playlist-only` mode: resolve to absolute upstream so the player fetches
 *   segments directly (they bypass embed-api), the Core host of the segments
 *   may be exposed — the documented bandwidth/host trade-off.
 */
function rewriteChildUri(uri: string, baseUrl: string, surface: Surface): string {
  let absolute: string;
  try {
    absolute = new URL(uri, baseUrl).toString();
  } catch {
    return uri; // leave un-parseable URIs untouched
  }
  if (config.proxyMode === "playlist-only") {
    return absolute;
  }
  // `proxy` mode (default): keep every byte flowing through embed-api.
  const token = signStreamToken(absolute);
  return `/stream?data=${encodeURIComponent(token)}&surface=${surface}`;
}

/**
 * Rewrite an HLS manifest's child segment/variant URIs (Req 6.1). Handles both
 * bare URI lines and URIs embedded in tag attributes (`#EXT-X-KEY`,
 * `#EXT-X-MEDIA`, `#EXT-X-MAP`, ... all expose `URI="..."`).
 */
function rewriteManifest(body: string, baseUrl: string, surface: Surface): string {
  return body
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed === "") return line;
      if (trimmed.startsWith("#")) {
        // Rewrite any URI="..." attribute on a tag line.
        return line.replace(
          /URI="([^"]*)"/g,
          (_m, uri: string) => `URI="${rewriteChildUri(uri, baseUrl, surface)}"`,
        );
      }
      // A bare, non-comment line is a segment or variant-playlist URI.
      return rewriteChildUri(trimmed, baseUrl, surface);
    })
    .join("\n");
}

/** Build the subset of request headers CinePro Core may require (Req 6.3). */
function buildForwardHeaders(req: FastifyRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const range = req.headers["range"];
  if (typeof range === "string") headers["range"] = range; // HTTP range for seeking
  const ua = req.headers["user-agent"];
  if (typeof ua === "string") headers["user-agent"] = ua;
  const accept = req.headers["accept"];
  if (typeof accept === "string") headers["accept"] = accept;
  return headers;
}

/** Copy a single upstream response header onto the reply when present. */
function passThroughHeader(resp: Response, reply: FastifyReply, name: string): void {
  const value = resp.headers.get(name);
  if (value !== null) reply.header(name, value);
}

/**
 * Fetch the upstream stream and serve it per `config.proxyMode`. Only reached
 * after the stream gate has passed, so no byte is ever served to an
 * un-gated request.
 */
async function serveProxied(
  req: FastifyRequest,
  reply: FastifyReply,
  coreData: string,
  surface: Surface,
): Promise<FastifyReply> {
  const upstreamUrl = resolveUpstreamUrl(coreData);

  // `redirect` mode: hand the client straight to the upstream URL (lightest,
  // loses host-hiding). Still gated; never cached.
  if (config.proxyMode === "redirect") {
    reply.header("Cache-Control", cacheControlFor("segment", surface));
    return reply.redirect(302, upstreamUrl);
  }

  let resp: Response;
  try {
    resp = await fetch(upstreamUrl, { method: "GET", headers: buildForwardHeaders(req) });
  } catch {
    return reply.status(502).send("Upstream error");
  }
  if (!resp.ok && resp.status !== 206) {
    return reply.status(resp.status).send("Upstream error");
  }

  const contentType = resp.headers.get("content-type") ?? "";

  // Manifest: small, rewrite child URIs, may be CDN-cacheable on public surface.
  if (isManifest(contentType, upstreamUrl)) {
    const rewritten = rewriteManifest(await resp.text(), upstreamUrl, surface);
    return reply
      .header("Content-Type", contentType || "application/vnd.apple.mpegurl")
      .header("Access-Control-Allow-Origin", "*")
      .header("Cache-Control", cacheControlFor("manifest", surface))
      .send(rewritten);
  }

  // Segment / other binary: stream through, never cacheable (Req 14.3).
  reply
    .header("Content-Type", contentType || "application/octet-stream")
    .header("Access-Control-Allow-Origin", "*")
    .header("Cache-Control", cacheControlFor("segment", surface));
  passThroughHeader(resp, reply, "content-length");
  passThroughHeader(resp, reply, "content-range");
  passThroughHeader(resp, reply, "accept-ranges");
  reply.status(resp.status); // preserve 206 for range responses

  const nodeStream =
    resp.body !== null
      ? Readable.fromWeb(resp.body as unknown as NodeWebReadableStream)
      : Readable.from([]);
  return reply.send(nodeStream);
}

/**
 * Fastify plugin registering `GET /stream`. Matches the existing route style
 * (`hlsRoutes`, `embedRoutes`): an exported `async function(app)` registering
 * handlers on the passed instance.
 */
export async function streamRoutes(app: FastifyInstance): Promise<void> {
  app.get("/stream", async (req, reply) => {
    const { data } = req.query as StreamQuery;
    const surface = resolveSurface(req);

    // Record the chosen proxy mode so breakage can be correlated with the mode.
    req.log.info({ proxyMode: config.proxyMode, surface }, "stream proxy");

    // --- STREAM GATE (Req 13.3): AND-gate, enforced before any byte. --------
    // Denials are 403 and never cached; we never emit a partial stream.
    reply.header("Cache-Control", cacheControlFor("session_token", surface));

    if (typeof data !== "string" || data.length === 0) {
      return reply.status(403).send("Forbidden");
    }
    const verdict = verifyStreamToken(data);
    if (!verdict.ok) {
      // missing/invalid/expired/tampered Session_Token → 403
      return reply.status(403).send("Forbidden");
    }
    if (!hasPassingFingerprint(req)) {
      // failed fingerprint / anti-debug signal → 403
      return reply.status(403).send("Forbidden");
    }

    // --- Gate passed: serve per proxyMode (Req 6.1-6.4, Resource Footprint §2).
    return serveProxied(req, reply, verdict.data, surface);
  });
}
