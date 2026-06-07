/**
 * embed-api library re-exports.
 *
 * The Fastify bootstrap (process entry point) lives in `src/server.ts`, which
 * compiles to `dist/server.js`.  This module re-exports `APP_NAME` and acts as
 * a convenience surface for tooling / tests that import from the package root.
 *
 * Module map (all now implemented):
 *   - config.ts                — runtime config from env
 *   - policy/                  — surface policy resolver
 *   - aggregator/              — CinePro Core OMSS aggregator client
 *   - storage/                 — sqlite / json / postgres store abstraction
 *   - health/                  — provider health checker + report store
 *   - security/                — rate limiter, secret guard, abuse gate
 *   - ads/                     — ad bumper insertion
 *   - cache/                   — resolution cache + cache-control matrix
 *   - protection/              — HMAC stream token, fingerprint scripts
 *   - routes/                  — streamRoutes, watchRoutes, embedRoutes,
 *                                adminRoutes, apiV1Routes + guard
 *   - cli/                     — health CLI + cron scheduler
 *   - player/player-v2.html    — embedded player template
 *   - server.ts                — Fastify bootstrap (entry point)
 */
export const APP_NAME = "embed-api";
