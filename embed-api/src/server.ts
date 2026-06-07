/**
 * embed-api server bootstrap.
 *
 * Mirrors the pattern of the legacy `dist/server.js` and wires ALL new modules:
 *   - Fastify with logger (warn in prod, info in dev), trustProxy: true
 *   - @fastify/cors  — allowlist from config.allowedOrigins (empty = allow all)
 *   - @fastify/rate-limit — global 120 req/min, keyed on real client IP
 *   - Security response headers hook (X-Content-Type-Options, …, Server: nginx)
 *   - enforceSecretGuard() BEFORE binding a port (Req 13.4)
 *   - createStore() — storage init; exit(1) on failure
 *   - streamRoutes, watchRoutes, embedRoutes, adminRoutes, siteRoutes
 *   - apiV1Routes  — with stub ApiV1Effects (501) until the DB layer is ported
 *   - HealthCronScheduler — started when config.healthCronSchedule is set
 *   - SIGTERM / SIGINT graceful shutdown
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

import { config } from "./config.js";
import { enforceSecretGuard } from "./security/secretGuard.js";
import { createStore } from "./storage/index.js";
import { createRateLimiter } from "./security/rateLimiter.js";
import {
  streamRoutes,
  watchRoutes,
  embedRoutes,
  adminRoutes,
  apiV1Routes,
} from "./routes/index.js";
import type { ApiV1Effects } from "./routes/index.js";
import { siteRoutes } from "./routes/site.js";
import { HealthCronScheduler } from "./cli/scheduler.js";
import type { Store } from "./storage/index.js";

// ---------------------------------------------------------------------------
// 1. Secret guard — MUST run before any port is bound (Req 13.4)
// ---------------------------------------------------------------------------

enforceSecretGuard();

// ---------------------------------------------------------------------------
// 2. Fastify instance (mirrors dist/server.js)
// ---------------------------------------------------------------------------

const app = Fastify({
  logger: {
    level: config.env === "production" ? "warn" : "info",
  },
  trustProxy: true,
});

// ---------------------------------------------------------------------------
// 3. CORS (origin allowlist — empty = allow all)
// ---------------------------------------------------------------------------

await app.register(cors, {
  origin: (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
    if (!origin) return cb(null, true);
    if (config.allowedOrigins.length === 0) return cb(null, true);
    if (config.allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked"), false);
  },
  methods: ["GET", "POST"],
  credentials: false,
});

// ---------------------------------------------------------------------------
// 4. Global rate-limit (@fastify/rate-limit — 120 req/min, real client IP)
// ---------------------------------------------------------------------------

await app.register(rateLimit, {
  max: 120,
  timeWindow: "1 minute",
  keyGenerator: (req) =>
    (req.headers["cf-connecting-ip"] as string | undefined) ??
    ((req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]) ??
    req.ip,
});

// ---------------------------------------------------------------------------
// 5. Security response headers (mirrors dist/server.js onSend hook)
// ---------------------------------------------------------------------------

app.addHook("onSend", async (_req, reply) => {
  reply.header("X-Content-Type-Options", "nosniff");
  reply.header("X-DNS-Prefetch-Control", "off");
  reply.header("Referrer-Policy", "no-referrer");
  reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  reply.header("Server", "nginx");
});

// ---------------------------------------------------------------------------
// 6. Storage init (exit on failure — nothing can run without the store)
// ---------------------------------------------------------------------------

let store: Store;
try {
  store = await createStore();
  app.log.info({ backend: config.storageBackend }, "storage initialised");
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("[server] FATAL: storage init failed:", err);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 7. Route registration
// ---------------------------------------------------------------------------

// Landing page (GET /)
await app.register(siteRoutes);

// New-module routes
await app.register(streamRoutes);
await app.register(watchRoutes);
await app.register(embedRoutes);
// adminRoutes takes an optional HealthReportStore as its second arg (not Fastify
// plugin options), so we call it directly rather than via app.register.
await adminRoutes(app);

// /api/v1/* — guard is active; effects are STUBS (501) until the DB layer is
// ported from legacy dist/routes/api.js.
// TODO: replace each stub with a real implementation backed by the storage layer.
const stubEffects: ApiV1Effects = {
  async heartbeat(_req, reply) {
    return reply.status(501).send({ error: "not_implemented", message: "heartbeat: DB layer not yet ported" });
  },
  async coinsBalance(_req, reply) {
    return reply.status(501).send({ error: "not_implemented", message: "coinsBalance: DB layer not yet ported" });
  },
  async coinsSpend(_req, reply) {
    return reply.status(501).send({ error: "not_implemented", message: "coinsSpend: DB layer not yet ported" });
  },
  async referralStats(_req, reply) {
    return reply.status(501).send({ error: "not_implemented", message: "referralStats: DB layer not yet ported" });
  },
  async referralLink(_req, reply) {
    return reply.status(501).send({ error: "not_implemented", message: "referralLink: DB layer not yet ported" });
  },
};

const apiRateLimiter = await createRateLimiter(config);

await app.register(apiV1Routes, {
  rateLimiter: apiRateLimiter,
  effects: stubEffects,
});

// ---------------------------------------------------------------------------
// 8. Health cron scheduler (optional — only when a schedule is configured)
// ---------------------------------------------------------------------------

let scheduler: HealthCronScheduler | null = null;

if (config.healthCronSchedule) {
  try {
    scheduler = new HealthCronScheduler({ schedule: config.healthCronSchedule });
    scheduler.start();
    app.log.info({ schedule: config.healthCronSchedule }, "health cron scheduler started");
  } catch (err) {
    // A bad cron expression is a misconfiguration warning, not a fatal error.
    app.log.warn(`[server] health cron scheduler failed to start (bad expression?): ${err}`);
  }
}

// ---------------------------------------------------------------------------
// 9. Graceful shutdown (SIGTERM / SIGINT)
// ---------------------------------------------------------------------------

async function shutdown(signal: string): Promise<void> {
  app.log.info(`[server] received ${signal}, shutting down`);

  scheduler?.stop();

  // Close the store if it exposes a close method (e.g. sqlite / postgres).
  const closeableStore = store as Store & { close?: () => Promise<void> };
  if (typeof closeableStore.close === "function") {
    try {
      await closeableStore.close();
    } catch (err) {
      app.log.warn(`[server] store close error: ${err}`);
    }
  }

  await app.close();
  process.exit(0);
}

process.on("SIGTERM", () => { void shutdown("SIGTERM"); });
process.on("SIGINT",  () => { void shutdown("SIGINT"); });

// ---------------------------------------------------------------------------
// 10. Listen
// ---------------------------------------------------------------------------

try {
  await app.listen({ port: config.port, host: config.host });
  app.log.info(`Embed API running on http://${config.host}:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
