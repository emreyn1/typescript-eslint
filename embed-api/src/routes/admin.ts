/**
 * Health HTTP Endpoint — design component 7 ("Health HTTP Endpoint",
 * `src/routes/admin.ts`; Req 3.1, 3.2).
 *
 * `GET /admin/providers/report` returns the latest persisted `ProviderReport`
 * as JSON, sourced from the `HealthReportStore` (`HealthReportStore.getLatestReport()`,
 * Req 3.1). When no report has been generated yet it responds **404** with a
 * clear message rather than an empty body, so the operator can tell "not yet
 * run" apart from "ran, all empty".
 *
 * AUTHENTICATION (Req 3.2) — this is an operator-only endpoint and MUST require
 * auth. A bearer token is read from the `Authorization` header and compared
 * against `config.healthAuthToken` in **constant time** (`crypto.timingSafeEqual`
 * over fixed-length SHA-256 digests, so neither token length nor content leaks
 * via timing). Missing or wrong token → **401**.
 *
 * LOCKED-BY-DEFAULT — if `config.healthAuthToken` is empty/unset the endpoint is
 * treated as **locked** (always 401), never open. An operator must configure a
 * token to use it; failing closed avoids accidentally exposing provider health
 * on a fresh deploy.
 *
 * SECURITY BOUNDARY — unlike the public `/embed` surface, this route is NOT
 * iframable and is NOT advertised to cinex or any public surface. It is exempt
 * from the permissive public CORS allowance: it emits no `Access-Control-Allow-*`
 * headers, so browsers will not let arbitrary origins read the report.
 *
 * NOTE TO OPERATORS: `/admin/*` MUST stay off the public hostname / behind auth
 * (see task 19.2 — Cloudflare/CDN fronts only `/embed`). Do not route the
 * public hostname to `/admin`.
 *
 * Requirements: 3.1 (return the latest report), 3.2 (require authentication).
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createHash, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";
import { healthReportStore } from "../health/index.js";
import type { HealthReportStore } from "../health/index.js";

/** Extract the bearer credential from an `Authorization: Bearer <token>` header. */
function extractBearerToken(req: FastifyRequest): string | null {
  const header = req.headers["authorization"];
  if (typeof header !== "string") return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (match === null) return null;
  const token = match[1].trim();
  return token.length === 0 ? null : token;
}

/**
 * Constant-time string compare. Hashing both inputs to fixed-length SHA-256
 * digests lets `timingSafeEqual` (which requires equal-length buffers) run
 * without branching on, or leaking, the lengths of the secret or the candidate.
 */
function constantTimeEqual(a: string, b: string): boolean {
  const da = createHash("sha256").update(a, "utf8").digest();
  const db = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(da, db);
}

/**
 * Authenticate a request against `config.healthAuthToken` (Req 3.2).
 *
 * Returns `true` only when a bearer token is present AND matches the configured
 * token in constant time. When no token is configured the endpoint is locked
 * (always returns `false`), so it never opens by default.
 */
function isAuthorized(req: FastifyRequest): boolean {
  const expected = config.healthAuthToken;
  // Locked-by-default: an unconfigured token means the endpoint is closed.
  if (typeof expected !== "string" || expected.length === 0) return false;
  const provided = extractBearerToken(req);
  if (provided === null) return false;
  return constantTimeEqual(provided, expected);
}

/**
 * Fastify plugin registering `GET /admin/providers/report`. Matches the
 * existing route style (`streamRoutes`, `embedRoutes`): an exported
 * `async function(app)` registering handlers on the passed instance.
 *
 * A custom {@link HealthReportStore} can be injected for testing; production
 * uses the configured default store.
 */
export async function adminRoutes(
  app: FastifyInstance,
  store: HealthReportStore = healthReportStore,
): Promise<void> {
  app.get("/admin/providers/report", async (req: FastifyRequest, reply: FastifyReply) => {
    // Operator-only: never cache, never advertise, never expose via CORS.
    reply.header("Cache-Control", "no-store");

    // --- AUTH (Req 3.2): locked-by-default, constant-time bearer compare. ---
    if (!isAuthorized(req)) {
      return reply
        .status(401)
        .header("WWW-Authenticate", "Bearer")
        .send({ error: "Unauthorized" });
    }

    // --- Latest report (Req 3.1). ------------------------------------------
    const report = await store.getLatestReport();
    if (report === null) {
      return reply
        .status(404)
        .send({ error: "No provider report available yet. Run the health check first." });
    }

    return reply.header("Content-Type", "application/json; charset=utf-8").send(report);
  });
}
