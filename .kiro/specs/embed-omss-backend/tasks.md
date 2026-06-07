# Implementation Plan: embed-omss-backend

## Overview

Convert the feature design into a series of incremental coding steps. The **primary goal drives the sequence**: get the buildable project back, then stand up the **source-aggregation path** and the **cheap new-provider authoring path** as early, first-class work, then the **health-test/prune loop**. The expanded scope adds a **public, vidsrc.to-style embed service** with **two surfaces on one backend** — the ad-supported, abuse-controlled public `/embed` surface and the ad-free first-party `/watch` surface — so the middle of the plan now builds the **Policy Resolver**, the **Abuse/Security Layer**, **Ad Insertion**, and the **Resolution + Manifest Cache** before wiring both route groups, the stream proxy, cinex integration, the legacy-pipeline flag-off, CDN-fronted deployment, and a late provider health sweep.

Implementation language is **TypeScript** (Fastify backend; Vitest + fast-check for tests), as specified throughout the design. Every cost/abuse lever (storage backend, `proxyMode`, OMSS/manifest caches, fan-out concurrency, rate-limit backend/window/thresholds, Turnstile, referer allowlist, ad bumper/VAST, Core memory cap, off-peak health cron) is **configurable, not hard-coded**, per the cheap-VPS / public-scale tuning sections.

Conventions:
- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP. The agent MUST NOT auto-implement `*` sub-tasks.
- Property tests use `fast-check`, run a **minimum of 100 iterations**, and are tagged `// Feature: embed-omss-backend, Property {n}: {text}`, placed next to the code they validate.
- All file paths target the reconstructed `src/` tree in `embed-api`, except provider-authoring files which live in **CinePro Core** `src/providers/`, and cinex files under `cinex/src/`.
- The two surfaces share one resolution core; only the per-route `SurfacePolicy` (ads / abuse controls / CDN-cache) differs. `/watch` must never enter the ad or abuse branches (Req 11.5, 12.3, 15.2).

## Tasks

- [x] 1. Reconstruct the buildable TypeScript project and player template
  - [x] 1.1 Recreate the buildable `embed-api` TS project
    - Create `package.json` (Fastify, hls/manifest deps, optional `redis`/`better-sqlite3`, `vitest`, `fast-check`, `tsx`/`ts-node`, build + test scripts), `tsconfig.json`, and the `src/` directory layout (`aggregator/`, `routes/`, `policy/`, `security/`, `ads/`, `cache/`, `health/`, `storage/`, `protection/`, `cli/`, `player/`)
    - Configure Vitest as the test runner and wire `fast-check` so property tests can run with `--run`
    - Establish the build step that compiles `src/` → `dist/` (the existing `dist/*.js` is a stopgap, not the target)
    - _Requirements: Source/build reconstruction risk (design Constraints & Risks)_
  - [x] 1.2 Recreate the `player-v2.html` template with the ad-bumper placeholder
    - Author `src/player/player-v2.html` with the `{{FINGERPRINT_SCRIPT}}`, `{{ANTIDEBUG_SCRIPT}}`, `'{{HLS_SOURCE}}'`, and the new `{{AD_BUMPER}}` placeholder/variant wiring that the route string-replaces (mirrors the existing substitution pattern; the public surface injects the bumper, `/watch` injects nothing)
    - Include a deferred `hls.js` player and a passive `postMessage` emitter posting `{ type: "PLAYER_EVENT", data: { event, currentTime, duration, mediaType, season, episode } }` (play/pause/seeked/ended/timeupdate) so history sync works and CWV is not regressed; load the ad-bumper script deferred/async so it never blocks LCP
    - Set `noindex,nofollow`
    - _Requirements: 4.7, 10.5, 12.1_

- [x] 2. Configuration layer
  - [x] 2.1 Implement `src/config.ts` with all env keys and startup validation
    - Add every key from the design config table, including the new public-service keys: `cineproBaseUrl`, `cineproTimeoutMs`, `aggregatorEnabled`, `torrentPipelineEnabled`, `excludeUnhealthyProviders`, `healthAuthToken`, `healthReportPath`, `healthTestTitlesPath`, `tmdbApiKey`, `storageBackend`, `sqlitePath`, `databaseUrl`, `proxyMode`, `coreOmssCacheEnabled`, `aggregatorCacheTtlMs`, `providerFanoutConcurrency`, `coreMaxOldSpaceMb`, `healthCronSchedule`, `publicEmbedEnabled`, `adBumperEnabled`, `adVastUrl`, `rateLimitBackend`, `rateLimitWindowSec`, `rateLimitMaxPerIp`, `rateLimitMaxPerReferer`, `apiRateLimitMaxPerIp`, `redisUrl`, `turnstileEnabled`, `turnstileSiteKey`, `turnstileSecret`, `hmacSecret`, `refuseStartOnInsecureSecret`, `refererAllowlist`, `manifestCacheTtlSec`, `env` (`NODE_ENV`) — all with the documented defaults
    - On startup, if `CINEPRO_BASE_URL` is missing/empty, log a **warning** naming the key (do not crash); keep the rest of config tolerant
    - All new cost/abuse levers are read from config, never hard-coded
    - _Requirements: 8.1, 8.4, 7.3, 9.1, 9.2, 2.6, 3.2, 11.1, 12.1, 12.2, 13.1, 13.2, 13.4, 13.5, 14.2, 14.4_
  - [ ]* 2.2 Write unit tests for config and startup validation
    - Assert defaults resolve (including the new public/abuse/cache keys) and that a missing `CINEPRO_BASE_URL` logs a warning naming the key while the server still starts
    - _Requirements: 8.4_

- [x] 3. Policy Resolver (surface/policy separation)
  - [x] 3.1 Implement the Policy Resolver (`src/policy/resolve.ts`)
    - Pure, total `resolvePolicy(prefix: "/embed" | "/watch") → SurfacePolicy`: `/embed` → `{ surface: "public_embed", adSupported: true, abuseControls: true, cdnCacheManifests: true }`; `/watch` → all `false` / `cinex_watch`. No other input (including `publicEmbedEnabled`) changes the mapping; `adSupported` marks eligibility only
    - This is the single source of truth so the two surfaces cannot drift or swap policies
    - _Requirements: 11.1, 11.2, 11.5_
  - [ ]* 3.2 Write property test for the surface→policy mapping
    - **Property 14: Surface → policy mapping is total and correct**
    - **Validates: Requirements 11.1, 11.2, 11.5**

- [x] 4. Source aggregation core (primary goal)
  - [x] 4.1 Implement OMSS types and the Aggregator Client
    - Define `OmssSource` / `OmssResponse` types and `AggregatorClient` with `getMovieSources` / `getTvSources`
    - Build URLs from `config.cineproBaseUrl` (never leak it), enforce a 10s `AbortController` timeout, throw `CoreUnavailableError` on non-2xx/network/timeout, and perform exactly one refresh fetch when the response `expiresAt < now`
    - _Requirements: 4.1, 4.2, 4.3, 7.3, 7.4_
  - [x] 4.2 Implement stream-identity dedup (`src/aggregator/dedup.ts`)
    - Collapse duplicates by normalized resolved URL (scheme+host+path+sorted query, excluding volatile/expiry params), falling back to `(type, quality, providerId)`; idempotent
    - _Requirements: 1.5_
  - [ ]* 4.3 Write property test for deduplication
    - **Property 2: Deduplication yields distinct streams, is idempotent, and loses no identity**
    - **Validates: Requirements 1.5**
  - [x] 4.4 Implement attribution counting (`src/aggregator/attribution.ts`)
    - From a deduped source list, compute `source_count` and the per-provider `[{id,name,count}]` breakdown
    - _Requirements: 1.6_
  - [ ]* 4.5 Write property test for attribution counts
    - **Property 3: Attribution counts are internally consistent**
    - **Validates: Requirements 1.6**
  - [x] 4.6 Implement union aggregation with bounded fan-out (`src/aggregator/aggregate.ts`)
    - Consume the full `sources[]` union (never first-match), apply dedup defensively, and bound parallelism with `config.providerFanoutConcurrency`; a failing/empty provider contributes `[]` without aborting the rest
    - _Requirements: 1.2, 1.7, Resource Footprint §3_
  - [ ]* 4.7 Write property test for union aggregation and resilience
    - **Property 1: Aggregation is the union of all succeeding providers, regardless of failures**
    - **Validates: Requirements 1.2, 1.7**
  - [x] 4.8 Implement the Source Selector (`src/aggregator/select.ts`)
    - Pure, total `selectSource` + `qualityRank`: prefer `hls`, then highest quality, with deterministic tie-break (earliest index, then smallest provider id); `null` on empty
    - _Requirements: 4.4, 4.5, 4.6_
  - [ ]* 4.9 Write property test for source selection
    - **Property 4: Source selection prefers HLS, then maximal quality, deterministically**
    - **Validates: Requirements 4.4, 4.5, 4.6**
  - [ ]* 4.10 Write unit tests for the Aggregator Client
    - Verify endpoint routing, 10s timeout abort, and single `expiresAt` refresh; assert the Core base URL never appears in returned data
    - _Requirements: 4.1, 4.2, 7.3, 7.4_

- [x] 5. Cheap new-provider authoring path (primary growth lever, inside CinePro Core)
  - [x] 5.1 Add a worked sample `Custom_Provider` and the BaseProvider template
    - Create `Custom_Provider` as a `BaseProvider` subclass in CinePro Core `src/providers/` (stable `id`, `getMovieSources`/`getTVSources` returning `[]` on miss never throwing, `createProxyUrl` for playback, `healthCheck`), serving as the copy-paste template for new providers
    - _Requirements: 1.3, 1.4, 1.7_
  - [x] 5.2 Write the "how to add a new provider" doc
    - Short guide: subclass `BaseProvider`, drop into `src/providers/`, auto-discovery on startup, the `id`/`createProxyUrl`/return-`[]` authoring contract, and how to disable via `enabled = false`
    - _Requirements: 1.3, 1.4_
  - [ ]* 5.3 Write integration test for provider auto-discovery
    - Drop the sample `BaseProvider` subclass into Core's `src/providers/`, start Core, confirm it registers and contributes sources
    - _Requirements: 1.3, 1.4_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Storage-backend abstraction (cheap-VPS default)
  - [x] 7.1 Implement the storage interface with sqlite/json/postgres backends
    - Define a small storage interface and three interchangeable backends selected by `config.storageBackend`: `sqlite` (default, single file at `config.sqlitePath`), `json` (file at `config.healthReportPath`), `postgres` (opt-in via `DATABASE_URL`); create `provider_reports` and `title_source_stats` shapes portably
    - _Requirements: Data Models, Resource Footprint §1_
  - [ ]* 7.2 Write unit tests for storage-backend parity
    - Assert save/getLatest round-trip behaves identically under `sqlite`, `json`, and `postgres`
    - _Requirements: Data Models, Resource Footprint §1_

- [x] 8. Provider health testing, reporting, and pruning
  - [x] 8.1 Implement the health classification function (`src/health/classify.ts`)
    - Total function: `workingTitleCount > 0` → healthy; tested but zero working → unhealthy (+ `failureReason`); untested → unknown; `failureReason` present iff unhealthy
    - _Requirements: 2.2, 2.5_
  - [ ]* 8.2 Write property test for health classification
    - **Property 9: Health classification is total, correctly mapped, and reasons accompany unhealthy**
    - **Validates: Requirements 2.2, 2.5**
  - [x] 8.3 Implement the HealthChecker (`src/health/checker.ts`)
    - `checkProviderTitle` decides playability (HEAD/range GET 2xx and, for hls, a valid manifest with ≥1 segment); `runHealthChecks` runs the configured test titles across providers and produces a `ProviderReport`
    - _Requirements: 2.1, 2.3, 2.4_
  - [ ]* 8.4 Write property test for report completeness
    - **Property 10: Provider report is complete and counts are accurate**
    - **Validates: Requirements 2.3, 2.4**
  - [x] 8.5 Implement the HealthReportStore (`src/health/store.ts`)
    - `saveReport` / `getLatestReport` over the storage interface from 7.1; latest = max `generatedAt`
    - _Requirements: 3.1, 2.3_
  - [ ]* 8.6 Write property test for latest-report selection
    - **Property 11: Latest report selection returns the most recent**
    - **Validates: Requirements 3.1**
  - [x] 8.7 Implement the unhealthy-provider exclusion filter (`src/aggregator/filter.ts`)
    - When `config.excludeUnhealthyProviders` is true, exclude providers classified `unhealthy` in the latest report (Core `?exclude=` or post-filter the OMSS response); when false, pass through unchanged
    - _Requirements: 2.6_
  - [ ]* 8.8 Write property test for unhealthy exclusion
    - **Property 8: Unhealthy providers are excluded from aggregation when configured**
    - **Validates: Requirements 2.6**
  - [x] 8.9 Implement the authed health endpoint (`src/routes/admin.ts`)
    - `GET /admin/providers/report` returns the latest `ProviderReport` JSON; require a bearer token compared in constant time against `config.healthAuthToken`; 401 on missing/wrong; exempt from public CORS and kept off the public hostname
    - _Requirements: 3.1, 3.2_
  - [ ]* 8.10 Write unit tests for health endpoint auth
    - 200 with valid token, 401 otherwise
    - _Requirements: 3.2_
  - [x] 8.11 Implement the health CLI (`src/cli/health.ts`)
    - `node dist/cli/health.js --titles ./test-titles.json` runs `runHealthChecks`, prints a human table + JSON, saves via the store, and exits non-zero if every provider is unhealthy/unknown
    - _Requirements: 3.3_
  - [ ]* 8.12 Write integration test for the health CLI
    - Run against a stub checker; assert printed report and expected exit code
    - _Requirements: 3.3_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Abuse / Security Layer (public surface only)
  - [x] 10.1 Implement the rate limiter with a split pure decision + counter store (`src/security/rateLimiter.ts`)
    - Pure decision function `allowed = count <= threshold` within `window`, depending only on `(count, windowStart, now, threshold)`; split from a stateful counter store selected by `config.rateLimitBackend` — `memory` (sweeping `Map`, default) or `redis` (`INCR`+`EXPIRE`, via `config.redisUrl`); per-IP and per-referer keys with `config.rateLimitWindowSec` / `rateLimitMaxPerIp` / `rateLimitMaxPerReferer`
    - _Requirements: 13.1, 13.6_
  - [ ]* 10.2 Write property test for the rate-limit decision
    - **Property 16: Rate-limit decision is a pure function of (count, window, threshold)**
    - **Validates: Requirements 13.1, 13.6**
  - [x] 10.3 Implement the referer/domain allowlist predicate (`src/security/refererAllowlist.ts`)
    - Pure `refererAllowed(host, allowlist)`: empty allowlist = open (vidsrc.to-style broad embedding); otherwise exact-or-suffix match against `config.refererAllowlist`
    - _Requirements: 13.5, 11.3_
  - [ ]* 10.4 Write property test for the referer-allowlist predicate
    - **Property 17: Referer-allowlist predicate is correct and open-by-default**
    - **Validates: Requirements 13.5**
  - [x] 10.5 Implement the production insecure-secret startup guard (`src/security/secretGuard.ts`)
    - Pure `secretGuardDecision(env, secret)` → `ok` | `refuse_start` | `critical_log`: non-`ok` iff `env === "production"` and `secret === "change-this-secret-in-production"`, choosing `refuse_start` when `config.refuseStartOnInsecureSecret` else `critical_log`; wire it to run before the server binds a port (refuse start or log CRITICAL naming the key)
    - _Requirements: 13.4_
  - [ ]* 10.6 Write property test for the secret guard
    - **Property 18: Production insecure-secret guard**
    - **Validates: Requirements 13.4**
  - [x] 10.7 Implement the Cloudflare Turnstile bot-check (`src/security/turnstile.ts`)
    - When `config.turnstileEnabled`, verify a Turnstile token server-side via `config.turnstileSecret` against the siteverify endpoint **before a stream `Session_Token` is issued** on `/embed`; once verified, playback proceeds (the bot-check fronts token issuance, not every asset)
    - _Requirements: 13.2_
  - [ ]* 10.8 Write integration test for the Turnstile gate
    - With a mocked siteverify endpoint: valid token → token issuance allowed; invalid/missing token (when enabled) → challenge/deny before any `Session_Token`; disabled → bypassed
    - _Requirements: 13.2_
  - [x] 10.9 Implement the composed AbuseGate (`src/security/abuseGate.ts`)
    - `evaluate(req)` runs the gates in order (per-IP/referer rate limit → referer allowlist → Turnstile) and returns the first failing control (`rate_limited` | `forbidden_referer` | `turnstile_required`) or `null` to proceed; applied only when `policy.abuseControls`
    - _Requirements: 13.1, 13.2, 13.5, 15.3_
  - [x] 10.10 Implement `/api/v1/*` protection (`src/routes/apiV1.ts`)
    - Apply the per-IP rate limiter (`config.apiRateLimitMaxPerIp`) and validate the fingerprint on `/api/v1/heartbeat`, `/api/v1/coins/*`, `/api/v1/referral/*` **before recording any coin/heartbeat/referral effect**; a failed check is rejected with **no side effect**
    - _Requirements: 13.6_
  - [ ]* 10.11 Write integration tests for `/api/v1/*` protection
    - Rate-limit burst beyond the per-IP threshold is rejected; a fingerprint-invalid or rate-limited request records **no** coin/heartbeat/referral effect (no-side-effect-on-reject)
    - _Requirements: 13.6_

- [x] 11. Ad Insertion (public embed surface only)
  - [x] 11.1 Implement Ad Insertion (`src/ads/insert.ts`, wrapping existing `ads/bumper.js`)
    - Pure `adConfigFor(policy)` → `{ bumper, vastUrl }`: bumper enabled **iff** `policy.adSupported` (public_embed) **and** `config.adBumperEnabled`; `vastUrl` attached iff bumper enabled and `config.adVastUrl` set; `/watch` always returns `{ bumper: false }`. Wire the chosen config into the `{{AD_BUMPER}}` placeholder; keep the bumper script deferred/async and fire the VAST request after the player shell paints (CWV-light)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 10.5_
  - [ ]* 11.2 Write property test for the ad-config truth table
    - **Property 19: Ad-supported config is surface- and flag-correct**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

- [x] 12. Resolution + Manifest Cache (public-scale economics)
  - [x] 12.1 Implement the resolution cache (`src/cache/resolution.ts`)
    - `getOrResolve(key, resolve)` keyed by `(tmdbId, type, season?, episode?)`: serve a cached OMSS response while `now < expiresAt` (honoring OMSS `expiresAt`, Req 14.5) and within `config.aggregatorCacheTtlMs`; coalesce concurrent identical requests within the window into a single Core call; respect `config.coreOmssCacheEnabled`; re-resolve once expired
    - _Requirements: 14.1, 14.5, Resource Footprint §3_
  - [x] 12.2 Implement the cache-control header matrix (`src/cache/cacheControl.ts`)
    - Pure helper over `(responseKind, surface)`: manifest on `public_embed` → `public, max-age=<config.manifestCacheTtlSec>` (CDN-cacheable); every `segment` and `session_token` on every surface → `no-store`; `/watch` manifest → `private, no-cache`. No input yields a cacheable segment or token
    - _Requirements: 14.2, 14.3_
  - [ ]* 12.3 Write property test for the cache-control invariant
    - **Property 15: Cache-control invariant — manifests cacheable, segments and tokens never**
    - **Validates: Requirements 14.2, 14.3**
  - [ ]* 12.4 Write tests for the resolution cache behavior
    - Two concurrent identical requests within the window → one Core call; a request after `expiresAt`/TTL → a fresh Core call
    - _Requirements: 14.1, 14.5, Resource Footprint §3_

- [x] 13. Stream token and proxy with stream gate and configurable proxyMode
  - [x] 13.1 Implement stream-token sign/verify (`src/protection/streamToken.ts`)
    - HMAC `Session_Token` (reusing `config.hmacSecret`) encoding the original Core `data` + expiry; the raw Core `data` and host are never exposed to the client
    - _Requirements: 6.2, 13.3_
  - [ ]* 13.2 Write property test for stream-token round-trip
    - **Property 6: Stream-token round-trip**
    - **Validates: Requirements 6.2**
  - [x] 13.3 Implement the `/stream` proxy with the stream gate and `proxyMode` (`src/routes/stream.ts`)
    - **AND-gate before any byte:** require a valid HMAC `Session_Token` **and** a passing fingerprint / anti-debug signal; missing/invalid/expired token or failed fingerprint → **403**, never a partial stream
    - Decode Core `data`, serve per `config.proxyMode`: `proxy` (manifest + all segments transit embed-api, headers forwarded, host hidden), `playlist-only` (rewrite manifest only, segments bypass), `redirect` (302); support HTTP range; rewrite hls child URIs back through `/stream` in `proxy` mode; record the chosen mode in logging
    - **Cache-control:** apply the matrix from 12.2 — segments and `Session_Token` responses are always `no-store`; only the `.m3u8` manifest may carry the cacheable header on the public surface
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 13.3, 14.2, 14.3, Resource Footprint §2_
  - [ ]* 13.4 Write property test for Core-host non-leakage
    - **Property 7: The Core host never leaks and stream URLs are embed-api-relative**
    - **Validates: Requirements 6.1, 6.4**
  - [ ]* 13.5 Write property test for proxy-mode host-hiding
    - **Property 13: Proxy-mode host-hiding is mode-correct**
    - **Validates: Requirements 6.1, 6.4**
  - [ ]* 13.6 Write example tests for proxy modes and the stream gate
    - `proxy` rewrites segments through `/stream`; `playlist-only` rewrites only the manifest; `redirect` issues a 302; valid token + passing fingerprint → 200, missing/expired/tampered token → 403, failing fingerprint → 403
    - _Requirements: 6.1, 6.3, 13.3, Resource Footprint §2_

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Watch and public Embed routes (dual-surface wiring)
  - [x] 15.1 Implement `/watch` routes — ad-free cinex surface (`src/routes/watch.ts`)
    - `GET /watch/movie/:tmdbId` and `GET /watch/tv/:tmdbId/:season/:episode`: `resolvePolicy("/watch")` → `cinex_watch`; validate ids, pass them through to the Aggregator Client exactly as received, resolve via the resolution cache, select the best source, rewrite its URL into `/stream?data=<signed>`, record count + provider attribution, render `player-v2.html` with the bumper **off** and `private, no-cache` headers; serve "Content Unavailable" when no source or Core fails/times out (gated on `config.aggregatorEnabled`); never enters the ad or abuse branches
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 6.1, 1.6, 7.1, 7.2, 11.2, 12.3, 15.1, 15.2_
  - [x] 15.2 Implement public `/embed` routes — ad-supported, abuse-controlled surface (`src/routes/embed.ts`)
    - `GET /embed/movie/:tmdbId` and `GET /embed/tv/:tmdbId/:season/:episode`: `resolvePolicy("/embed")` → `public_embed`, gated by `config.publicEmbedEnabled`; run the AbuseGate (rate limit → referer allowlist → Turnstile) **before** resolving, short-circuiting to an explicit rate-limited / challenge response (never a broken player); resolve via the resolution cache; select source; rewrite to `/stream?data=<signed>`; apply Ad Insertion (`{{AD_BUMPER}}` from `adConfigFor`); send the player with CDN-cacheable manifest headers; keep the surface iframable for arbitrary Embed_Consumers; serve "Content Unavailable" on no source / Core failure
    - _Requirements: 11.1, 11.3, 11.4, 12.1, 12.2, 12.4, 13.1, 13.2, 13.5, 14.2, 15.1, 15.3_
  - [ ]* 15.3 Write property test for identifier pass-through
    - **Property 5: Identifier pass-through fidelity**
    - **Validates: Requirements 4.3**
  - [ ]* 15.4 Write example/error tests for the watch route
    - Routing maps to the right client call; placeholders substituted with fingerprint + anti-debug present and bumper off; empty sources → Unavailable; client throws → Unavailable + warn; expired `expiresAt` → one refresh
    - _Requirements: 4.1, 4.2, 4.7, 7.1, 7.2, 7.4, 12.3_
  - [ ]* 15.5 Write integration tests for the public embed surface and load isolation
    - Rate-limit burst on `/embed` returns an explicit rate-limited response, not a player; CDN manifest is cacheable while segments/tokens are `no-store`; `/watch` stays ad-free and functional while `/embed` is under high request volume (load isolation); `redirect` proxy mode works at public scale
    - _Requirements: 11.5, 13.1, 14.2, 14.3, 14.4, 15.2, 15.3_

- [x] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Legacy torrent pipeline feature-flag (retain, off by default)
  - [x] 17.1 Wire the torrent pipeline behind `torrentPipelineEnabled` (default false)
    - Ensure `/watch` and `/embed` resolve via the aggregator and skip torrent/Telegram/Real-Debrid resolution while the flag is off; retain the pipeline code so it can be re-enabled
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [ ]* 17.2 Write unit tests for the legacy flag
    - With `torrentPipelineEnabled` false, `processFromTorrent` returns null with no side effects; torrent modules still compile/import
    - _Requirements: 9.3, 9.4_

- [x] 18. cinex integration (ad-free slot, drop ad-laden embeds, history sync)
  - [x] 18.1 Update `cinex/src/utils/players.ts`
    - Keep the `cineproMoviePlayers`/`cineproTvPlayers` ad-free slot built from `NEXT_PUBLIC_EMBED_API_URL/watch/...`; remove every `ads: true` iframe entry; keep the CinePro slot first/recommended (default selected); handle the empty-list case when the env var is unset
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 18.2 Write property test for ad-free player list
    - **Property 12: cinex player list contains no ad-laden entries**
    - **Validates: Requirements 5.2**
  - [x] 18.3 Fix `useVidlinkPlayer` origin allow-list and player postMessage wiring
    - Replace the hard-coded `https://vidlink.pro` origin check with an allow-list including the `NEXT_PUBLIC_EMBED_API_URL` origin (sourced from config, not hard-coded); confirm `player-v2.html` posts the `PLAYER_EVENT` shape the hook expects; keep `syncHistory`/`sendBeacon`/anti-spam logic unchanged
    - _Requirements: 5.4, 10.5_
  - [ ]* 18.4 Write unit tests for cinex slot and origin allow-list
    - CinePro slot present/first/recommended with env-derived URLs; postMessage from the embed-api origin is accepted and others rejected
    - _Requirements: 5.1, 5.3, 5.4, 10.5_

- [x] 19. Deployment, CDN fronting, and off-peak health cron
  - [x] 19.1 Author Docker deployment and the health cron scheduler
    - Compose/manifest running Core from `ghcr.io/cinepro-org/core:latest` bound to loopback (`127.0.0.1:8080`), passing `TMDB_API_KEY`, with `NODE_OPTIONS=--max-old-space-size=512` (`coreMaxOldSpaceMb`) and `--memory=768m`; only publish embed-api ports; add a scheduler that runs `health:check` on `config.healthCronSchedule` (off-peak), never per request
    - _Requirements: 8.2, 8.3, 6.4, Resource Footprint §3, §4_
  - [x] 19.2 Add Cloudflare/CDN fronting for the public `/embed` surface
    - Document and configure Cloudflare/CDN in front of the public hostname for `/embed` only: edge per-IP rate limiting (primary limit), Turnstile at the edge, and manifest edge-caching honoring the cache-control headers embed-api emits; keep `/watch`, `/admin`, and tokened routes off the public hostname / behind auth; recommend `playlist-only` or `redirect` proxy mode at public scale so segment bytes leave the VPS; keep Core loopback-only and the memory cap
    - _Requirements: 6.4, 13.1, 13.2, 14.2, 14.4, Resource Footprint §1, §2_
  - [ ]* 19.3 Write smoke/integration tests for deployment and cron
    - Manifest passes `TMDB_API_KEY` and binds Core to loopback; Core starts with the heap/memory caps; the scheduler fires on schedule and not per request (fake clock); the public hostname does not expose `/admin`
    - _Requirements: 8.2, 8.3, 6.4, Resource Footprint §3, §4_

- [x] 20. License, risk, and constraints documentation
  - [x] 20.1 Document license/DMCA/CWV risks and capture the operator decision (out-of-code item)
    - Record in the repo that CinePro Core is PolyForm Noncommercial 1.0.0, that operating embed-api as a **public, ad-supported** service is a **clear commercial-use conflict (not a gray area)**, that authoring Custom_Providers reduces but does not eliminate the risk (framework + image remain CinePro), the DMCA/abuse exposure amplified by public exposure, and the CWV non-regression requirement
    - **Out-of-code / operator decision:** accepting, rejecting, or mitigating the sharpened public+commercial PolyForm Noncommercial license conflict is a non-coding decision for the user — flagged here so it is not lost; no code resolves it
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 21. Provider health sweep and verification (late, realizes the primary goal)
  - [x] 21.1 Run the health sweep against live Core and record a Provider_Report
    - Execute the `health:check` CLI (built in 8.11) against the deployed Core to test whether all providers actually work across the test titles, persist the resulting `Provider_Report` via the store, and confirm unhealthy providers are excluded from aggregation per config
    - _Requirements: 1.1, 2.1, 2.3, 2.4, 2.6, 3.1, 3.3_

- [x] 22. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Epic: B2B Embed Network (Publisher Distribution)

This epic appends the **distribution / adoption / attribution / conversion** layer (Req 16-23, design "B2B Embed Network" components 15-20, Properties 20-23) **on top of** the completed serving path (Tasks 1-22). It adds **no new playback machinery**: the snippet `src`, the live preview, and every programmatic call resolve through the *same* public `/embed/*` routes, the same Source Selector, player template, `/stream` proxy, Ad Insertion, Abuse/Security Layer, and Resolution Cache already built above. The new components are thin additions — a no-auth code page, a docs/REST facade, an open-embedding toggle, an attribution writer + report, a route-surface ad guarantee, an optional backlink, and a passive conversion recorder — wired onto the already-completed routes/storage/security/ads/cache. Every new lever (public base URL, embed-code page toggle, B2B embed mode, conversion-events toggle, powered-by default) is **configurable, not hard-coded**.

- [ ] 23. Configuration additions for the B2B Embed Network
  - [ ] 23.1 Add the B2B config keys to `src/config.ts` with documented defaults
    - Add `embedPublicUrl` (`PUBLIC_BASE_URL`, alias `EMBED_PUBLIC_URL`, falling back to the request origin), `embedCodePageEnabled` (`EMBED_CODE_PAGE_ENABLED`, default `true`), `b2bEmbedMode` (`B2B_EMBED_MODE`, `open` | `allowlist`, default `open`), `conversionEventsEnabled` (`CONVERSION_EVENTS_ENABLED`, default `true`), and `poweredByDefault` (`POWERED_BY_DEFAULT`, default `false`); validate `B2B_EMBED_MODE` ∈ {`open`,`allowlist`}; read every key from config, never hard-coded
    - _Requirements: 16.1, 16.2, 16.3, 17.2, 18.4, 18.5, 21.2, 22.6_
  - [ ]* 23.2 Write unit tests for the new B2B config keys
    - Defaults resolve (`EMBED_CODE_PAGE_ENABLED`/`CONVERSION_EVENTS_ENABLED` true, `B2B_EMBED_MODE` open, `POWERED_BY_DEFAULT` false); `B2B_EMBED_MODE` rejects unknown values; `PUBLIC_BASE_URL` falls back to request origin when unset
    - _Requirements: 16.1, 18.4, 21.2_

- [ ] 24. Extend the storage abstraction for publisher and conversion data
  - [ ] 24.1 Add `publisher_stats` and `conversion_events` to the storage interface and all three backends
    - Extend the storage interface (design component 6) with `publisher_stats` upsert/read (host PK, `plays`, `streams`, `first_seen_at`, `last_seen_at`; `unknown` bucket allowed) and `conversion_events` append/query; implement portably across `sqlite` (default; `INTEGER PRIMARY KEY AUTOINCREMENT`, `TEXT` ISO-8601 timestamps), `json` (keyed object for publisher stats, appended array for events), and `postgres` (portable DDL); selected by `config.storageBackend`; no caller depends on Postgres-specific behavior
    - _Requirements: 19.2, 19.4, 22.5_
  - [ ]* 24.2 Write storage-parity tests for the new tables
    - `publisher_stats` upsert/getReport rows and `conversion_events` append/query round-trip identically under `sqlite`, `json`, and `postgres`
    - _Requirements: 19.2, 22.5_

- [ ] 25. Embed Code Page (conversion-critical)
  - [ ] 25.1 Implement the pure `buildEmbedSnippet` builder (`src/routes/embedCode.ts`)
    - Pure, total: `src` rooted at `config.embedPublicUrl` / `PUBLIC_BASE_URL` (**never** the Core host and **never** the embed-api admin/Core origin); path exactly `/embed/movie/{tmdbId}` or `/embed/tv/{tmdbId}/{season}/{episode}`; emit **only** the allowed attributes `width`, `height`, `allowfullscreen`; **no** ad-disabling query parameter; **no** `pb=` unless `poweredBy` is explicitly true (defaulting from `config.poweredByDefault`, i.e. false)
    - _Requirements: 16.2, 16.3, 17.4, 20.2, 21.2, 6.4_
  - [ ]* 25.2 Write property test for the embed snippet builder
    - **Property 22: Embed snippet always targets the public embed base and never the Core host**
    - **Validates: Requirements 16.2, 16.3, 17.4, 20.2, 21.2**
  - [ ] 25.3 Implement the no-signup `GET /embed-code` page (`src/routes/embedCode.ts`)
    - Gated by `config.embedCodePageEnabled`; exactly five interactive regions — title selector (tmdbId + type toggle, season/episode for tv), a live preview `<iframe>` whose `src` is byte-identical to the snippet `src`, a read-only snippet display, a single one-click "Copy embed code" CTA (`navigator.clipboard.writeText` with a `document.execCommand('copy')` fallback) that shows a transient "Copied!" confirmation, and one static usage example; no auth/login/key gate at any point; minimal CSS/JS, preview iframe deferred until a title is chosen; fire `page_view` / `snippet_generated` / `copy_clicked` beacons passively via `navigator.sendBeacon` (non-blocking); keep the default copy-paste path free of signup/account steps
    - _Requirements: 16.1, 16.4, 16.5, 16.6, 16.7, 16.8, 21.4, 10.4, 22.1, 22.2, 22.3, 22.6_
  - [ ]* 25.4 Write example tests for the embed-code page
    - No-credential `GET /embed-code` → 200; after supplying only a title the snippet + copy control render with no auth/login/key prompt; preview iframe `src` is byte-identical to the snippet `src`; interactive element set ⊆ {title input, preview, snippet, copy, one usage example}; activating copy calls `navigator.clipboard.writeText` (with `execCommand` fallback) and shows the "Copied!" confirmation
    - _Requirements: 16.1, 16.4, 16.5, 16.6, 16.7, 16.8_

- [ ] 26. Public integration contract — docs + OMSS REST facade
  - [ ] 26.1 Author the integration docs artifact (`docs/B2B_EMBED_INTEGRATION.md`, served at `GET /docs/embed`)
    - Document the iframe URL patterns `/embed/movie/:tmdbId` and `/embed/tv/:tmdbId/:season/:episode`; state that **no authentication and no API key** are required; document the allowed iframe attributes `width` / `height` / `allowfullscreen`; document the OMSS request params and the response shape `{ responseId, expiresAt, sources[], subtitles[], diagnostics[] }`; document the additive, opt-in future-accounts / revenue-share extension point that does not add signup to the default copy-paste path
    - _Requirements: 17.1, 17.3, 17.4, 17.5, 21.3_
  - [ ] 26.2 Implement the OMSS REST facade route (`src/routes/integration.ts`)
    - `GET /v1/movies/:id` and `GET /v1/tv/:id/:season/:episode` served by embed-api as a thin wrapper over the existing Aggregator Client; rewrite every `source.url` to an embed-api-served `/stream?data=...` so the CinePro Core host stays hidden; public + no-auth; route requests through the existing Abuse/Security Layer (rate limit, optional allowlist)
    - _Requirements: 17.2, 6.4, 23.4_
  - [ ]* 26.3 Write example tests for the REST facade and docs
    - `/v1/movies/:id` and `/v1/tv/:id/:s/:e` return the OMSS shape with every `source.url` rewritten to `/stream?data=...` and no Core host string anywhere in the response; the docs artifact states no-auth/no-key and lists the URL patterns, allowed attributes, and OMSS response shape
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 6.4_

- [ ] 27. Open-embedding default wired into the abuse gate
  - [ ] 27.1 Wire `B2B_EMBED_MODE` into the `/embed` abuse gate (`src/routes/embed.ts`, reuse `refererAllowed`)
    - `open` (default) with an empty `REFERER_ALLOWLIST` serves any referer (vidsrc.to-style); `allowlist` mode requires a non-empty `REFERER_ALLOWLIST` (empty → misconfiguration warning) and enforces it via the existing `refererAllowed` predicate; the toggle changes **only** the referer check and MUST NOT relax the HMAC + fingerprint stream gate, the per-IP/referer rate limit, the Turnstile option, or the production secret guard
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 13.5_
  - [ ]* 27.2 Write tests for the open/allowlist toggle and gate integrity
    - `open` + empty allowlist serves any referer; `allowlist` + populated list serves only matching referers and refuses others; switching modes leaves the stream gate (still 403 without a valid token) and the rate limiter behavior unchanged
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 28. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 29. Publisher attribution and analytics
  - [ ] 29.1 Implement the pure `publisherHost` extractor (`src/security/publisherHost.ts`, reuse `refererHost`)
    - Prefer the `Referer` host, fall back to the `Origin` host, return exactly `"unknown"` iff neither header yields a parseable host; the result never contains a scheme, path, or port and the function never throws
    - _Requirements: 19.1, 19.4_
  - [ ]* 29.2 Write property test for publisher host extraction
    - **Property 20: Publisher host extraction is correct with an unknown fallback**
    - **Validates: Requirements 19.1, 19.4**
  - [ ] 29.3 Record publisher attribution on `/embed` and `/stream` (`src/attribution/publisher.ts`)
    - On every public `/embed/*` request and every `/stream` request on the public surface, derive `publisherHost(referer, origin)` and upsert the `publisher_stats` row (increment `plays` on `/embed`, `streams` on `/stream`, bump `last_seen_at`, set `first_seen_at` for a brand-new host) via the storage abstraction; the `"unknown"` bucket is recorded, never dropped
    - _Requirements: 19.1, 19.2, 19.4_
  - [ ] 29.4 Implement the pure `buildPublisherReport` ranking (`src/attribution/publisher.ts`)
    - Rank publishers descending by `total = plays + streams` with a lexicographic-host tie-break (stable total order); every input host appears exactly once, each row's `total` equals its input `plays + streams`, and no host is added or dropped
    - _Requirements: 19.3_
  - [ ]* 29.5 Write property test for the publisher report ranking
    - **Property 21: Publisher report ranking is count-accurate and a stable total order**
    - **Validates: Requirements 19.3**
  - [ ] 29.6 Implement the authed `GET /admin/publishers/report` endpoint (`src/routes/admin.ts`)
    - Reuse the exact admin-auth pattern from the health endpoint (constant-time bearer compare against `config.healthAuthToken`; 401 on missing/wrong); excluded from the public CORS/iframe allowance; returns the ranked `PublisherReport` (including the `unknown` bucket)
    - _Requirements: 19.3, 19.5_
  - [ ]* 29.7 Write example tests for attribution write and report auth
    - An `/embed` request with `Referer: https://pub.example/x` upserts host `pub.example` with `plays`+1; a `/stream` request increments `streams`; a request with neither header records host `unknown`; the report endpoint returns 200 with a valid token and 401 otherwise, ranked desc by total
    - _Requirements: 19.1, 19.2, 19.4, 19.5_

- [ ] 30. B2B ad guarantee and optional attribution backlink
  - [ ] 30.1 Wire the optional `{{POWERED_BY}}` backlink into the player and `/embed` route (`src/routes/embed.ts`, `src/player/player-v2.html`)
    - When a Public_Embed request carries `pb=1` (or `pb=<label>`), render a small "Powered by" attribution link via a `{{POWERED_BY}}` placeholder using the same string-substitution mechanism as `{{FINGERPRINT_SCRIPT}}` / `{{AD_BUMPER}}`; absent/empty `pb` → the placeholder renders nothing; default-off via `config.poweredByDefault`
    - _Requirements: 21.1, 21.2_
  - [ ]* 30.2 Write unit test for powered-by rendering and default-off snippet
    - `/embed/...?pb=1` renders the "Powered by" link; no `pb` → no link; the default generated snippet contains no `pb=` parameter
    - _Requirements: 21.1, 21.2_
  - [ ]* 30.3 Write test asserting ads cannot be disabled via iframe params on `/embed`
    - `adConfigFor` on the `/embed` surface is determined by the route surface only and is unchanged by any iframe query parameter supplied by an Embed_Consumer (route-surface ad guarantee; cross-references **Property 19**)
    - **Validates: Requirements 20.1, 20.2, 20.3**

- [ ] 31. Conversion measurement of the embed-code funnel
  - [ ] 31.1 Implement the passive conversion beacon `POST /api/v1/cevent` (`src/routes/cevent.ts`)
    - Accept `navigator.sendBeacon` posts of `page_view` / `snippet_generated` / `copy_clicked` carrying an A/B `variant` (default `control`) and a non-PII `anonId`; reuse the existing `/api/v1/*` rate limiter and a fingerprint-light check; over-limit / abuse beacons are dropped with **no** recorded effect; persist accepted events to `conversion_events`; gated entirely by `config.conversionEventsEnabled`
    - _Requirements: 22.1, 22.2, 22.3, 22.6, 13.6, 10.4_
  - [ ] 31.2 Record the server-derived `first_embed_call` (`src/attribution/publisher.ts`)
    - When a never-seen publisher host sets `first_seen_at` on its first `/embed` request, record exactly one `first_embed_call` Conversion_Event attributed to that host; derived server-side from `publisher_stats`, never from a client beacon, so it cannot be spoofed
    - _Requirements: 22.4_
  - [ ] 31.3 Implement the pure `computeFunnel` and authed `GET /admin/conversion/funnel` (`src/conversion/funnel.ts`, `src/routes/admin.ts`)
    - `computeFunnel` partitions events by `variant`, tallies each stage exactly, sets `rateFromPrev = stage / previousStage` (and `0` when the previous stage is `0`), counts `first_embed_call` once per previously-unseen host, and never drops unknown-variant events; the authed funnel endpoint reuses the admin-auth pattern and returns the per-variant funnel; toggled off by `config.conversionEventsEnabled`
    - _Requirements: 22.5, 22.6_
  - [ ]* 31.4 Write property test for the conversion funnel derivation
    - **Property 23: Conversion funnel is monotonic and derived consistently per variant**
    - **Validates: Requirements 22.4, 22.5, 22.6**
  - [ ]* 31.5 Write example tests for the beacons, funnel endpoint, and storage
    - Viewing `/embed-code` posts `page_view`; generating a snippet posts `snippet_generated`; copy posts `copy_clicked`; each carries the `variant` and uses `sendBeacon` passively; a rate-limited/fingerprint-failing beacon records nothing; the first `/embed` from a never-seen host records exactly one `first_embed_call` and repeats do not; the funnel endpoint (auth) returns per-variant counts/rates and is disabled by `CONVERSION_EVENTS_ENABLED=false`; `conversion_events` round-trip identically across backends
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6_

- [ ] 32. B2B distribution constraints documentation (out-of-code operator decision)
  - [ ] 32.1 Append the B2B constraints to `docs/LICENSE_AND_RISKS.md`
    - Record that operating the B2B Embed Network as a public, ad-supported distribution service is commercial use that makes the PolyForm Noncommercial 1.0.0 conflict (Req 10.2) **more clearly commercial**; that public Publisher distribution **amplifies** the DMCA and abuse exposure (Req 10.4); that the `playlist-only` and `redirect` proxy modes must be supported to bound egress on a low-resource VPS; and that CinePro Core's internal host stays hidden from Publishers and Embed_Consumers
    - **Out-of-code / operator decision:** accepting, rejecting, or mitigating the sharpened public + commercial PolyForm Noncommercial conflict is a non-coding decision for the user — flagged here so it is not lost; no code resolves it
    - _Requirements: 23.1, 23.2, 23.3, 23.4_

- [ ] 33. Final checkpoint - build and tests green for the B2B epic
  - Run the `src/` → `dist/` build and the full Vitest + fast-check suite for the B2B Embed Network epic; ensure the build compiles and all tests (including Properties 20-23) pass; ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; core implementation tasks are never optional.
- Sequence reflects the stated priority: source-count maximization (Task 4) and cheap provider authoring (Task 5) come before serving and integration; the health-test/prune loop (Task 8) and a live verification sweep (Task 21) are first-class, not afterthoughts.
- The public-service scope is layered in the middle: the **Policy Resolver** (Task 3) is the single source of truth for surface/policy separation; the **Abuse/Security Layer** (Task 10), **Ad Insertion** (Task 11), and **Resolution + Manifest Cache** (Task 12) are per-surface wrappers around the shared resolution core, wired into both route groups in Task 15 without ever turning `/watch` into an ad-supported or abuse-gated path.
- Every cost/abuse lever (storage backend, `proxyMode`, OMSS/manifest caches, fan-out concurrency, rate-limit backend/window/thresholds, Turnstile, referer allowlist, ad bumper/VAST, Core memory cap, off-peak health cron) is implemented as **configurable**, never hard-coded.
- Property tests use `fast-check`, ≥100 iterations, tagged `// Feature: embed-omss-backend, Property {n}: {text}`; Properties 1–23 are each their own sub-task placed next to the code they validate.
- The sharpened public+commercial PolyForm Noncommercial license decision (Tasks 20.1 and 32.1) is explicitly an operator decision, out of code, captured so it is not lost.
- Task 21 runs the CLI tooling built earlier to verify the scraped embeds actually play and records the report.
- **B2B Embed Network epic (Tasks 23-33):** appends the distribution/adoption/attribution/conversion layer onto the completed serving path. It introduces no new playback machinery — the snippet, preview, and REST facade are consumers of the existing public `/embed/*` routes, so ads (Property 19), abuse bounds (Property 17), host-hiding (Property 7/13), and caching (Req 14) are inherited automatically. New Properties 20-23 cover publisher host extraction, publisher-report ranking, snippet targeting, and funnel derivation. The frictionless copy-paste path stays free of signup, login, and API keys.

## Task Dependency Graph

Waves 0–9 below scheduled the original epic (Tasks 1-22), which is **complete**. The graph now schedules **only the new B2B Embed Network leaf tasks (23-33)**; they depend on the already-completed config, storage, security, ads, cache, and route components, so they form a fresh schedule starting at wave 0. Tasks that write the same file are placed in different waves (`src/routes/embed.ts`: 27.1 → 29.3 → 30.1; `src/attribution/publisher.ts`: 29.4 → 29.3 → 31.2; `src/routes/admin.ts`: 29.6 → 31.3; `src/routes/embedCode.ts`: 25.1 → 25.3). Checkpoint and final build tasks (28, 33) are excluded per the graph rules.

```json
{
  "waves": [
    { "id": 0, "tasks": ["23.1", "24.1", "29.1", "26.1", "32.1"] },
    { "id": 1, "tasks": ["23.2", "24.2", "29.2", "25.1", "29.4", "26.2"] },
    { "id": 2, "tasks": ["25.2", "29.5", "25.3", "26.3", "27.1", "29.6"] },
    { "id": 3, "tasks": ["27.2", "25.4", "29.3"] },
    { "id": 4, "tasks": ["29.7", "30.1", "31.1", "31.2"] },
    { "id": 5, "tasks": ["30.2", "30.3", "31.3"] },
    { "id": 6, "tasks": ["31.4", "31.5"] }
  ]
}
```
