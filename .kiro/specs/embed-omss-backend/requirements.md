# Requirements Document

## Introduction

This feature builds and expands an **embed-source aggregator** for the streaming stack, and now opens it as a **public, vidsrc.to-style embed PROVIDER service**. The **primary, highest-priority goal is unchanged: maximize the number of working (playable) embed Sources** by scraping from as many high-quality, long-lived embed providers as possible, and by making it cheap to add new providers so that count keeps growing over time.

The scraping engine is **CinePro Core** (`ghcr.io/cinepro-org/core:latest`), an OMSS-compliant (Open Media Streaming Standard) backend that already aggregates roughly 10-15 upstream embed providers (vidsrc, vidzee, vidnest, tulnex — which itself fans out to 14 upstream servers including onion, vidzee, icefy, vaplayer, the vidfast family, allmovies, vidlink, moviebox — vidapi, popr, cinesu, streammafia, vixsrc, and others). CinePro Core is chosen specifically because it is **extensible**: a new provider is added by dropping a TypeScript class that extends `BaseProvider` from `@omss/framework` into its `src/providers/` directory, where it is auto-discovered at startup. This makes it the right foundation for the core objective — adding new custom providers for the best, longest-lived embeds so the count of working sources keeps growing beyond what ships by default.

Because not every scraped provider works for every title, **provider health/playability testing** is required: each provider is tested across titles, classified as healthy, unhealthy, or unknown, and summarized in a per-provider report so the operator knows which sources actually work and can prune dead ones. Health results feed directly back into the primary goal by identifying which providers contribute working sources.

### Two delivery surfaces, two monetization policies (NEW MAJOR SCOPE)

The aggregated sources are now delivered through **two distinct surfaces on the same backend (`embed-api`), each with its own policy keyed by route/audience**:

- **Public embed surface (`/embed/movie/:id`, `/embed/tv/:id/:s/:e`)** — the existing `/embed` routes are the **PUBLIC interface**, embedded via `<iframe>` by arbitrary third-party websites (vidsrc.to-style). This surface is **AD-SUPPORTED**, using the ad bumper / VAST infrastructure already present in `embed-api` (`ads/bumper.js`, `AD_VAST_URL`, `AD_BUMPER_ENABLED`). It is a multi-audience, public, potentially high-traffic service.
- **Cinex consumer surface (`/watch/...`)** — serves the first-party `cinex` site and stays **AD-FREE**. The cinex ad-free integration (replacing cinex's ad-laden iframe embeds) is **unchanged**; the prior blanket "ad-free" framing applies **only** to this `/watch` path and is not regressed.

Both surfaces resolve titles through the same Embed_Aggregator (CinePro Core) and reuse the same player, fingerprint, and anti-debug protection. The difference is policy: ads on `/embed`, ad-free on `/watch`.

### Public-scale posture

Public exposure introduces scale, abuse, and bandwidth concerns that the cinex-only design did not have:

- **Scale / bandwidth:** public traffic is served with **Cloudflare/CDN in front** plus **aggressive manifest edge-caching**. OMSS source resolutions and manifests are cached so repeated public requests for the same title do not re-scrape. The proxy is preserved but made cacheable, and the `redirect` proxy mode remains a configurable fallback for cost control.
- **Abuse / security:** the public surface needs per-IP and/or per-referer rate limiting, bot protection (Cloudflare Turnstile — `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET` already configured), enforcement that the HMAC session secret is not the insecure default in production, an optional referer/domain allowlist (hotlink protection), and rate-limiting + fingerprint validation on the public coin/referral/heartbeat endpoints.

The **secondary goal** is unchanged: put the aggregated ad-free sources to use in the `cinex` consumer site by replacing `cinex`'s existing ad-laden third-party iframe embeds (the `ads: true` entries in `cinex/src/utils/players.ts`) with the ad-free aggregated sources served by `embed-api` at `/watch/...`, while keeping `embed-api`'s clean `player-v2.html` plus fingerprint and anti-debug protection as the playback layer. A **supporting goal** is to retire (feature-flag off, but keep the code) the legacy torrent/Telegram/YTS/EZTV/Real-Debrid pipeline, since scraping supersedes it.

**Key constraints to track (carried forward from prior analysis, with the license sharpened):**
- CinePro Core is licensed **PolyForm Noncommercial 1.0.0** (personal/non-commercial only). Opening `embed-api` as a **public, ad-supported** service is a **clear commercial-use conflict, not a gray area**. A documented mitigation path is to author our own `BaseProvider` providers rather than relying on CinePro's bundled providers; this reduces but does not eliminate risk because the framework and container image are still CinePro. This remains an operator decision.
- Streaming revenue depends on Core Web Vitals (LCP/INP/CLS); the player and integration layers must not regress these.
- Self-hosted scrapers carry DMCA / abuse risk that must be documented, now amplified by public exposure.
- CinePro Core's internal host address must never be exposed to the client.

> **Open decisions (assumptions made for this draft — confirm or correct):**
> 1. **CinePro Core hosting:** assumed **same host as `embed-api`**, reachable on a private/loopback URL (e.g. `http://127.0.0.1:8080`), not publicly exposed.
> 2. **Commercial license concern:** now **sharpened to a clear conflict** (public + ad-supported); flagged as a documented risk for the operator to accept, with the custom-provider mitigation path noted. Not auto-resolved.
> 3. **Torrent/Telegram pipeline:** assumed **kept as a feature-flagged-off fallback**, not deleted, so it can be re-enabled.
> 4. **New-provider authoring:** assumed new providers are added as `BaseProvider` subclasses inside the CinePro Core container's `src/providers/` directory (auto-discovered at startup), and the operator maintains this provider set.
> 5. **Health-test output:** assumed **an authenticated health endpoint on `embed-api` plus a CLI command**, producing a per-provider report.
> 6. **Public CDN fronting:** assumed **Cloudflare (or equivalent CDN) sits in front of the public `/embed` surface** and that Turnstile is the bot-protection mechanism, since the keys are already configured.

## Glossary

- **Embed_Aggregator**: The capability, realized by CinePro_Core, that scrapes multiple upstream embed Providers for a title and returns the combined set of playable Sources.
- **CinePro_Core**: The OMSS-compliant scraping engine container (`ghcr.io/cinepro-org/core:latest`) that resolves a TMDB id into playable Sources by scraping its registered Providers. Exposes `GET /v1/movies/{tmdbId}`, `GET /v1/tv/{tmdbId}/{season}/{episode}`, and `GET /v1/proxy?data=...`.
- **OMSS**: Open Media Streaming Standard — the response contract `{ responseId, expiresAt, sources[], subtitles[], diagnostics[] }`.
- **OMSS_Framework**: The `@omss/framework` package providing `BaseProvider`, the base class new Providers extend.
- **BaseProvider**: The base class from OMSS_Framework that a Provider implementation extends; instances placed in CinePro_Core's `src/providers/` directory are auto-discovered at startup.
- **Provider**: A named upstream embed source that CinePro_Core scrapes (e.g. vidsrc, vidzee, vidnest, tulnex, vidapi, popr, cinesu, streammafia, vixsrc).
- **Custom_Provider**: A new Provider added by the operator (beyond the defaults shipped with CinePro_Core) as a BaseProvider subclass, intended to grow the working Source count and to reduce reliance on CinePro's bundled providers.
- **Source**: A single playable stream entry `{ url, type (hls|dash|http|mp4|mkv|webm), quality, audioTracks[], provider{id,name} }`. `url` is a CinePro_Core proxy path (`/v1/proxy?data=...`).
- **Ad_Free_Source**: A Source served through CinePro_Core's proxy that does not embed third-party advertising, as distinct from a Cinex `ads: true` iframe embed.
- **Working_Source**: A Source classified as playable by a Health_Check.
- **Embed_API**: The self-hosted Fastify/TypeScript backend at `embed-api` that serves the Player_Layer and proxies streams. Exposes `/watch/...`, `/embed/...`, `/api/v1/*`, `/hls/...`.
- **Public_Embed**: The public, third-party-facing delivery surface served by the `/embed/movie/:id` and `/embed/tv/:id/:s/:e` routes, embedded via iframe by arbitrary external sites. Subject to the Ad_Supported_Embed policy and the public abuse/security controls.
- **Embed_Consumer**: A third-party website that embeds the Public_Embed surface in an `<iframe>`. Embed_Consumers are arbitrary and untrusted; the Public_Embed must remain broadly iframable for them while abuse controls are applied.
- **Ad_Supported_Embed**: The monetization policy applied to the Public_Embed surface, where the ad bumper / VAST infrastructure (`ads/bumper.js`, `AD_VAST_URL`, `AD_BUMPER_ENABLED`) is active. Distinct from the ad-free policy applied to the Cinex `/watch` surface.
- **Rate_Limit**: A control that caps the number of requests accepted from a single client identity (per-IP and/or per-referer) within a time window, applied to the Public_Embed surface and the public `/api/v1/*` endpoints.
- **Bot_Check**: A bot-protection challenge applied to the Public_Embed surface, realized via Cloudflare Turnstile using `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET`.
- **CDN_Edge_Cache**: A Cloudflare/CDN layer in front of the Public_Embed surface that caches manifests and source resolutions at the edge, governed by Embed_API's cache-control headers.
- **Session_Token**: The HMAC-signed token (using `HMAC_SECRET`) combined with the fingerprint / anti-debug checks that gates stream access through Embed_API.
- **Cinex**: The Next.js consumer site whose `getMoviePlayers`/`getTvShowPlayers` (`cinex/src/utils/players.ts`) currently return one `CinePro` slot (ad-free) plus ~16 third-party iframe embeds (`ads: true`). Served the ad-free `/watch` policy.
- **Torrent_Pipeline**: The existing legacy resolve path (cache → Telegram → torrent/YTS/EZTV → Real-Debrid → ffmpeg remux to HLS) currently in `dist/pipeline/`.
- **Health_Check**: An operation that tests whether a Source for a given Provider and title is actually playable.
- **Provider_Report**: The aggregated result of Health_Checks across Providers, listing each Provider's health classification.
- **Publisher**: A third-party website operator who places the Public_Embed iframe on their own site. A Publisher is the operator of an Embed_Consumer and is distinct from the operator of Embed_API. Publishers bring their own traffic; every play they generate carries the Ad_Supported_Embed policy.
- **Embed_Code_Page**: The public, no-signup developer page served by Embed_API where a Publisher selects a title and obtains a copy-paste Embed_Snippet, with a live player preview and a one-click "Copy embed code" control as the primary call to action.
- **Embed_Snippet**: The generated copy-paste `<iframe>` HTML produced by the Embed_Code_Page whose `src` references a Public_Embed URL, including the documented allowed iframe attributes, that a Publisher pastes into their site.
- **Publisher_Stats**: The attribution storage dimension that records the embedding-site host (derived from Referer/Origin) per Public_Embed request, realized as an added field on `title_source_stats` or a sibling `publisher_stats` table.
- **Publisher_Report**: The aggregated per-Publisher analytics, keyed by embedding-site host, ranking Publishers by the number of plays or stream requests attributed to each, used to drive monetization decisions and as the data backbone for any future revenue-share.
- **Conversion_Event**: A measurable funnel event recorded for the Embed_Code_Page — one of `page_view`, `snippet_generated`, `copy_clicked` — plus `first_embed_call` recorded when a previously unseen Publisher referer makes its first Public_Embed request.

## Requirements

### Requirement 1: Maximize the number of working sources and add new providers (highest priority)

**User Story:** As the site operator, I want the Embed_Aggregator to scrape as many high-quality embed Providers as possible and to let me add new Providers, so that the number of working Sources is as large as possible and keeps growing.

#### Acceptance Criteria

1. THE Embed_Aggregator SHALL use CinePro_Core as the scraping engine for resolving a title into Sources.
2. WHEN a title is requested, THE Embed_Aggregator SHALL query every registered Provider and return the combined set of Sources produced across all Providers, rather than stopping at the first Provider that yields a Source.
3. WHEN CinePro_Core starts, THE Embed_Aggregator SHALL auto-discover and register every BaseProvider subclass present in the CinePro_Core `src/providers/` directory.
4. THE Embed_Aggregator SHALL allow a Custom_Provider to be added by placing a BaseProvider subclass into the CinePro_Core `src/providers/` directory without modifying CinePro_Core engine code.
5. WHEN the combined Source set for a title contains duplicate Sources resolving to the same stream, THE Embed_Aggregator SHALL deduplicate them so the reported count reflects distinct Sources.
6. THE Embed_Aggregator SHALL record, for each requested title, the count of Sources returned and the originating Provider for each Source.
7. WHERE a Provider fails to return a Source for a title, THE Embed_Aggregator SHALL continue querying the remaining Providers and SHALL still return Sources from the Providers that succeeded.

### Requirement 2: Provider health / playability testing and pruning

**User Story:** As the site operator, I want each Provider tested for playability across titles and summarized in a report, so that I know which Providers actually contribute working Sources and can prune dead ones.

#### Acceptance Criteria

1. WHEN a Health_Check is run for a Provider and title, THE Embed_API SHALL determine whether the resolved Source is playable.
2. THE Embed_API SHALL classify each Health_Check result as exactly one of: healthy, unhealthy, or unknown.
3. WHEN Health_Checks complete across the configured Providers for a set of test titles, THE Embed_API SHALL produce a Provider_Report listing each Provider with its result classification.
4. THE Provider_Report SHALL include, for each Provider, the result classification, the number of test titles that yielded a Working_Source, and the time the check was performed.
5. WHERE a Provider is classified unhealthy, THE Provider_Report SHALL include the failure reason.
6. THE Embed_API SHALL provide a configuration value that excludes a Provider classified unhealthy from aggregation so that dead sources can be pruned.

### Requirement 3: Surface provider test results

**User Story:** As the site operator, I want to access Provider test results on demand, so that I can monitor source health and decide which Providers to keep.

#### Acceptance Criteria

1. WHEN an operator requests Provider health results, THE Embed_API SHALL return the latest Provider_Report.
2. WHERE the health results interface is exposed over HTTP, THE Embed_API SHALL require authentication for the health results endpoint.
3. THE Embed_API SHALL provide a command-line method to run Health_Checks and output a Provider_Report.

### Requirement 4: Serve aggregated sources through Embed_API routes

**User Story:** As the site operator, I want Embed_API to serve the aggregated Sources through both its cinex `/watch/...` routes and its public `/embed/...` routes, so that the working Sources reach the player on both surfaces.

#### Acceptance Criteria

1. WHEN a request for `/watch/movie/{tmdbId}` is received, THE Embed_API SHALL call CinePro_Core's `GET /v1/movies/{tmdbId}` endpoint.
2. WHEN a request for `/watch/tv/{tmdbId}/{season}/{episode}` is received, THE Embed_API SHALL call CinePro_Core's `GET /v1/tv/{tmdbId}/{season}/{episode}` endpoint.
3. THE Embed_API SHALL pass the `tmdbId` and, for TV, `season` and `episode` exactly as received when calling CinePro_Core.
4. WHEN CinePro_Core returns an OMSS response containing at least one Source, THE Embed_API SHALL select a playable Source and serve the Player_Layer configured with that Source.
5. WHERE the OMSS response contains multiple Sources, THE Embed_API SHALL prefer a Source of type `hls` over other types.
6. WHERE multiple `hls` Sources exist, THE Embed_API SHALL select the Source with the highest quality value.
7. WHEN the Player_Layer is rendered, THE Embed_API SHALL render the existing `player-v2.html` template with the existing fingerprint script and anti-debug script injected.

### Requirement 5: Integrate ad-free sources into Cinex and replace ad-laden embeds

**User Story:** As the site operator, I want `cinex` to use the ad-free aggregated Sources instead of its ad-laden iframe embeds, so that viewers get ad-free playback through the existing CinePro slot.

#### Acceptance Criteria

1. WHEN `getMoviePlayers` or `getTvShowPlayers` builds the player list, THE Cinex SHALL include the ad-free Source served by Embed_API at `NEXT_PUBLIC_EMBED_API_URL/watch/...`.
2. THE Cinex SHALL remove the `ads: true` third-party iframe embed entries from the player list returned by `getMoviePlayers` and `getTvShowPlayers`.
3. WHILE the ad-free Embed_API Source is available for a title, THE Cinex SHALL present it as the default selected player.
4. THE Cinex SHALL obtain the Embed_API base URL from the `NEXT_PUBLIC_EMBED_API_URL` configuration value rather than a hard-coded host.

### Requirement 6: Proxy and header handling for aggregated streams

**User Story:** As a viewer, I want streams to play reliably in the player, so that I can watch without errors caused by missing upstream headers or exposed internal hosts.

#### Acceptance Criteria

1. WHEN a selected Source URL is a CinePro_Core proxy path (`/v1/proxy?data=...`), THE Embed_API SHALL expose that stream to the Player_Layer through an Embed_API-served URL.
2. WHEN the Player_Layer requests stream segments, THE Embed_API SHALL forward the request to CinePro_Core preserving the required proxy `data` parameter.
3. IF CinePro_Core requires specific request headers to serve a stream, THEN THE Embed_API SHALL forward those headers when proxying segment requests.
4. THE Embed_API SHALL keep CinePro_Core's internal host address hidden from the client. (Negative intent expressed positively: this is a security boundary requirement.)
5. WHERE the proxy mode is configured to `redirect`, THE Embed_API SHALL redirect the Player_Layer to the upstream stream URL as a cost-control fallback.

### Requirement 7: Error handling and unavailable content

**User Story:** As a viewer, I want a clear response when a title cannot be resolved, so that I am not shown a broken player.

#### Acceptance Criteria

1. IF the Embed_Aggregator returns no Sources for a title, THEN THE Embed_API SHALL serve the existing "Content Unavailable" page.
2. IF the call to CinePro_Core fails or times out, THEN THE Embed_API SHALL serve the "Content Unavailable" page and log the failure.
3. WHEN CinePro_Core is unreachable, THE Embed_API SHALL respond within a configured timeout of 10 seconds.
4. IF a selected OMSS Source has expired according to its `expiresAt` value when selected, THEN THE Embed_API SHALL request a fresh OMSS response before serving the Player_Layer.

### Requirement 8: Configuration and deployment of CinePro Core

**User Story:** As the site operator, I want CinePro_Core configured and deployed alongside Embed_API, so that the aggregator runs in my own environment.

#### Acceptance Criteria

1. THE Embed_API SHALL read the CinePro_Core base URL from a configuration value.
2. WHERE a TMDB API key is required by CinePro_Core, THE deployment SHALL supply `TMDB_API_KEY` to the CinePro_Core container.
3. THE deployment SHALL run CinePro_Core from the image `ghcr.io/cinepro-org/core:latest`.
4. IF the CinePro_Core base URL configuration value is missing at startup, THEN THE Embed_API SHALL log a startup warning identifying the missing configuration.

### Requirement 9: Retire or disable the legacy torrent pipeline

**User Story:** As the site operator, I want the legacy torrent/Telegram pipeline disabled by default, so that resolution goes through the Embed_Aggregator while preserving the option to revert.

#### Acceptance Criteria

1. WHILE the Embed_Aggregator is enabled, THE Embed_API SHALL use the Embed_Aggregator as the resolution source for `/watch/...` and `/embed/...` routes.
2. THE Embed_API SHALL provide a configuration flag that enables or disables the Torrent_Pipeline.
3. WHERE the Torrent_Pipeline flag is disabled, THE Embed_API SHALL skip torrent, Telegram, and Real-Debrid resolution. (Negative intent expressed positively: disabling a side-effecting subsystem.)
4. THE Embed_API SHALL retain the Torrent_Pipeline code so that it can be re-enabled via configuration.

### Requirement 10: License, performance, and risk acknowledgment (constraints)

**User Story:** As the site operator, I want the licensing, performance, and legal risks documented, so that I can make an informed decision before running CinePro_Core as a public, ad-supported service.

#### Acceptance Criteria

1. THE specification SHALL document that CinePro_Core is licensed under PolyForm Noncommercial 1.0.0.
2. THE specification SHALL document that operating Embed_API as a public, ad-supported service is a clear commercial-use conflict with the PolyForm Noncommercial 1.0.0 license, not a gray area.
3. THE specification SHALL document that authoring Custom_Providers as BaseProvider subclasses (rather than relying on CinePro_Core's bundled providers) is a mitigation path that reduces but does not eliminate the license risk, because the OMSS_Framework and container image remain CinePro.
4. THE specification SHALL document the DMCA and abuse risks of operating a self-hosted scraper, amplified by public exposure.
5. THE Cinex integration SHALL preserve Core Web Vitals (LCP, INP, CLS) so that ad revenue is not regressed.

### Requirement 11: Distinct public-embed audience and surface separation

**User Story:** As the site operator, I want the public `/embed` surface and the cinex `/watch` surface to apply different policies on the same backend, so that I can monetize public traffic with ads while keeping cinex ad-free.

#### Acceptance Criteria

1. WHEN a request is received on the `/embed/movie/:id` or `/embed/tv/:id/:s/:e` routes, THE Embed_API SHALL classify the request as a Public_Embed request and apply the Ad_Supported_Embed policy and the public abuse/security controls.
2. WHEN a request is received on the `/watch/...` routes, THE Embed_API SHALL classify the request as a Cinex request and apply the ad-free policy.
3. THE Embed_API SHALL serve the Public_Embed surface in a manner that remains embeddable in an `<iframe>` by an arbitrary Embed_Consumer.
4. THE Embed_API SHALL resolve titles for both the Public_Embed surface and the Cinex surface through the same Embed_Aggregator.
5. WHILE the Public_Embed surface is enabled, THE Embed_API SHALL continue to serve the Cinex `/watch/...` surface ad-free. (No regression of the cinex ad-free policy.)

### Requirement 12: Ad-supported policy for the public embed surface

**User Story:** As the site operator, I want the public embed surface to show ads using the existing bumper/VAST infrastructure, so that public traffic is monetized.

#### Acceptance Criteria

1. WHERE `AD_BUMPER_ENABLED` is true, THE Embed_API SHALL apply the ad bumper to the Player_Layer served on the Public_Embed surface.
2. WHERE an `AD_VAST_URL` is configured, THE Embed_API SHALL use that VAST tag when applying ads on the Public_Embed surface.
3. THE Embed_API SHALL apply the Ad_Supported_Embed policy only to the Public_Embed surface and SHALL serve the Cinex `/watch/...` surface without the ad bumper.
4. WHERE `AD_BUMPER_ENABLED` is false, THE Embed_API SHALL serve the Public_Embed surface without ads.

### Requirement 13: Abuse and security controls for public exposure

**User Story:** As the site operator, I want rate limiting, bot protection, and stream-access gating on the public surface, so that public exposure does not enable abuse or hotlinking.

#### Acceptance Criteria

1. WHEN requests on the Public_Embed surface exceed a configured per-IP or per-referer threshold within a time window, THE Embed_API SHALL apply a Rate_Limit by rejecting the excess requests.
2. WHERE Bot_Check is enabled, THE Embed_API SHALL validate a Cloudflare Turnstile token using `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET` before granting stream access on the Public_Embed surface.
3. WHEN stream access is requested, THE Embed_API SHALL require a valid HMAC Session_Token together with the fingerprint / anti-debug checks before serving the stream.
4. IF `HMAC_SECRET` equals the insecure default value `change-this-secret-in-production` while running in production, THEN THE Embed_API SHALL refuse to start or SHALL log a critical security error identifying the insecure secret.
5. WHERE a referer/domain allowlist is configured, THE Embed_API SHALL serve the Public_Embed surface only to Embed_Consumers whose referer matches the allowlist (hotlink protection).
6. WHEN a request is received on the `/api/v1/heartbeat`, `/api/v1/coins/*`, or `/api/v1/referral/*` endpoints, THE Embed_API SHALL apply a Rate_Limit and SHALL validate the fingerprint before recording any coin, heartbeat, or referral effect.

### Requirement 14: Public-scale caching and CDN edge fronting

**User Story:** As the site operator, I want source resolutions and manifests cached and CDN-frontable, so that repeated public requests for the same title do not re-scrape and bandwidth cost stays controlled.

#### Acceptance Criteria

1. WHEN a title is resolved through the Embed_Aggregator, THE Embed_API SHALL cache the OMSS source resolution so that a repeated request for the same title within the cache window is served without re-scraping.
2. WHEN the Embed_API serves a manifest on the Public_Embed surface, THE Embed_API SHALL set cache-control headers that permit CDN_Edge_Cache caching of that manifest.
3. THE Embed_API SHALL set cache-control headers that prevent caching of stream segments and Session_Tokens.
4. THE Embed_API SHALL provide a configuration value selecting the proxy mode, including a `redirect` mode that bypasses segment proxying for cost control.
5. WHILE a cached source resolution has not expired according to its `expiresAt` value, THE Embed_API SHALL serve it from cache rather than re-querying CinePro_Core.

### Requirement 15: Graceful behavior under public load

**User Story:** As the site operator, I want the service to degrade gracefully under public load without breaking cinex, so that high public traffic does not produce broken players or regress the cinex path.

#### Acceptance Criteria

1. IF a title cannot be resolved under load, THEN THE Embed_API SHALL serve the existing "Content Unavailable" page rather than a broken player.
2. WHILE the Public_Embed surface is under high request volume, THE Embed_API SHALL continue serving the Cinex `/watch/...` surface ad-free and functional.
3. WHEN a Rate_Limit rejects a Public_Embed request, THE Embed_API SHALL return a response indicating the request was rate-limited rather than a broken player.

## Epic: B2B Embed Network (Publisher Distribution)

This epic turns `embed-api` from a single-site backend into a **public, vidsrc.to/2embed-style embed PROVIDER** that arbitrary third-party websites embed via `<iframe>`. It is the highest-ROI lever in the spec: third-party **Publishers bring the traffic**, and OUR ad-supported player (Req 11-15) carries OUR ads on every embed call. ~90% of the serving machinery already exists; this epic adds the **distribution, adoption, attribution, and conversion-measurement** layer on top — it does not replace or weaken any prior requirement.

**Conversion goal (explicit):** the funnel here is **Publisher adoption**. A site owner who lands on the Embed_Code_Page must be able to grab a working iframe snippet and paste it on their site with **zero friction — no signup, no API key, instant**. Frictionless copy-paste = maximum adoption = maximum ad inventory. The page is optimized for a single action: copy the embed code.

### Requirement 16: Frictionless embed-code acquisition page (conversion-critical)

**User Story:** As a Publisher, I want to enter a title and instantly get a working copy-paste iframe snippet with a live preview, so that I can put the player on my site immediately without signing up or getting a key.

#### Acceptance Criteria

1. THE Embed_API SHALL serve a public Embed_Code_Page that is reachable without signup, login, or an API key.
2. WHEN a Publisher supplies a TMDB id and a content type of movie on the Embed_Code_Page, THE Embed_API SHALL generate an Embed_Snippet containing an `<iframe>` whose `src` references the `/embed/movie/:tmdbId` route.
3. WHEN a Publisher supplies a TMDB id, a content type of tv, a season, and an episode on the Embed_Code_Page, THE Embed_API SHALL generate an Embed_Snippet containing an `<iframe>` whose `src` references the `/embed/tv/:tmdbId/:season/:episode` route.
4. WHEN an Embed_Snippet is generated, THE Embed_Code_Page SHALL render a live preview of the player loaded from the generated Public_Embed URL.
5. THE Embed_Code_Page SHALL present a single one-click "Copy embed code" control as the primary call to action.
6. WHEN the Publisher activates the "Copy embed code" control, THE Embed_Code_Page SHALL copy the current Embed_Snippet to the clipboard and SHALL display a confirmation that the snippet was copied.
7. THE Embed_Code_Page SHALL render the generated Embed_Snippet and the "Copy embed code" control after only the title-selection step, requiring no signup, authentication, or API-key step.
8. THE Embed_Code_Page SHALL limit its interactive elements to the title-selection input, the live preview, the Embed_Snippet display, the "Copy embed code" control, and one minimal usage example, so that the copy action is the dominant action on the page.

### Requirement 17: Public, documented B2B integration contract

**User Story:** As an advanced Publisher, I want documented iframe URL patterns and a programmatic API, so that I can integrate the embeds in bulk or automatically across my catalog.

#### Acceptance Criteria

1. THE Embed_API SHALL publish documentation of the Public_Embed iframe URL patterns `/embed/movie/:tmdbId` and `/embed/tv/:tmdbId/:season/:episode`.
2. THE Embed_API SHALL expose an OMSS-compatible REST integration for programmatic Publishers covering movie requests (`/v1/movies/:id`) and TV requests (`/v1/tv/:id/:season/:episode`), served by Embed_API so that CinePro_Core's internal host remains hidden (consistent with Requirement 6.4).
3. THE Embed_API documentation SHALL state that no authentication and no API key are required to use the Public_Embed iframe URLs.
4. THE Embed_API documentation SHALL document the allowed iframe attributes `width`, `height`, and `allowfullscreen` for the Embed_Snippet.
5. WHERE a Publisher integrates programmatically, THE documented integration contract SHALL describe the request parameters and the OMSS response shape `{ responseId, expiresAt, sources[], subtitles[], diagnostics[] }`.

### Requirement 18: Open embedding by default, abuse-bounded

**User Story:** As the site operator, I want third-party embedding to work out of the box without referer blocking, so that adoption is maximized, while still being able to tighten controls if a Publisher abuses the service.

#### Acceptance Criteria

1. THE Embed_API SHALL default the Public_Embed referer allowlist to empty so that third-party referers are not blocked by default.
2. WHILE the Public_Embed referer allowlist is empty, THE Embed_API SHALL serve the Public_Embed surface to an Embed_Consumer regardless of the embedding site's referer.
3. WHILE the Public_Embed referer allowlist is empty, THE Embed_API SHALL rely on the per-IP Rate_Limit and the HMAC Session_Token with fingerprint stream gate for abuse control on the Public_Embed surface.
4. THE Embed_API SHALL provide a configuration value that selects between open embedding and referer-allowlist enforcement, so that the operator can tighten embedding if abuse occurs.
5. IF the operator populates the Public_Embed referer allowlist, THEN THE Embed_API SHALL enforce it by serving the Public_Embed surface only to Embed_Consumers whose referer matches the allowlist (consistent with Requirement 13.5).

### Requirement 19: Per-publisher attribution and analytics

**User Story:** As the site operator, I want to see which third-party Publishers drive the most plays, so that I can make monetization decisions and have the data backbone for a future revenue-share.

#### Acceptance Criteria

1. WHEN a Public_Embed request or a stream request on the Public_Embed surface is served, THE Embed_API SHALL record the embedding-site host derived from the Referer or Origin header as a Publisher dimension.
2. THE Embed_API SHALL persist the Publisher dimension by extending `title_source_stats` with a publisher/referer field or by writing to a sibling `publisher_stats` table (Publisher_Stats).
3. WHEN an operator requests publisher analytics, THE Embed_API SHALL produce a Publisher_Report ranking Publishers by the number of plays or stream requests attributed to each embedding-site host.
4. IF a Public_Embed request carries no Referer and no Origin header, THEN THE Embed_API SHALL record the Publisher as `unknown` rather than dropping the record.
5. WHERE the Publisher_Report is exposed over HTTP, THE Embed_API SHALL require authentication for the Publisher_Report endpoint (consistent with Requirement 3.2).

### Requirement 20: Ad policy guaranteed on every B2B embed

**User Story:** As the site operator, I want every play served through any third-party embed to carry the ad-supported policy, so that the B2B model is monetized and no Publisher can strip ads.

#### Acceptance Criteria

1. WHILE `AD_BUMPER_ENABLED` is true, THE Embed_API SHALL apply the Ad_Supported_Embed policy to every play served through the Public_Embed surface, independent of the embedding site.
2. THE Embed_API SHALL determine the Ad_Supported_Embed policy from the route surface only and SHALL serve the Public_Embed surface with that policy regardless of any iframe query parameter supplied by an Embed_Consumer. (Positive expression of the boundary: ad delivery cannot be disabled via iframe params.)
3. THE Embed_API SHALL apply the same Ad_Supported_Embed policy across all Publishers so that ad delivery does not vary by embedding site.

### Requirement 21: Optional attribution backlink and future publisher accounts (low priority)

**User Story:** As the site operator, I want an optional "Powered by" backlink and a documented path to future Publisher accounts and revenue-share, so that I can grow the network later without adding signup friction to the default copy-paste path now.

#### Acceptance Criteria

1. WHERE an optional attribution backlink parameter is supplied in a Public_Embed request, THE Embed_API SHALL render a "Powered by" attribution link in the Public_Embed player.
2. THE Embed_Code_Page SHALL generate the default Embed_Snippet without the optional attribution backlink parameter.
3. THE specification SHALL document an extension point for future Publisher accounts and revenue-share that does not add signup to the default copy-paste path.
4. THE Embed_API SHALL keep the default Embed_Snippet copy-paste path free of signup and account-creation steps.

### Requirement 22: Conversion measurement of the embed-code funnel

**User Story:** As the site operator, I want the embed-code page funnel measured end to end, so that adoption is a measurable, A/B-testable hypothesis rather than a guess.

#### Acceptance Criteria

1. WHEN the Embed_Code_Page is viewed, THE Embed_API SHALL record a `page_view` Conversion_Event.
2. WHEN an Embed_Snippet is generated on the Embed_Code_Page, THE Embed_API SHALL record a `snippet_generated` Conversion_Event.
3. WHEN the "Copy embed code" control is activated, THE Embed_API SHALL record a `copy_clicked` Conversion_Event.
4. WHERE a Public_Embed request originates from a Publisher referer not seen before, THE Embed_API SHALL record a `first_embed_call` Conversion_Event attributed to that Publisher.
5. THE Embed_API SHALL expose the recorded Conversion_Events so that the `page_view` → `snippet_generated` → `copy_clicked` funnel conversion rate can be computed.
6. THE Embed_Code_Page SHALL record Conversion_Events in a way that supports A/B test variant assignment, so that conversion changes are measurable per variant.

### Requirement 23: B2B distribution constraints (license, DMCA, cheap-VPS posture)

**User Story:** As the site operator, I want the added legal and cost exposure of public Publisher distribution documented, so that I can make an informed decision before opening the B2B Embed Network.

#### Acceptance Criteria

1. THE specification SHALL document that operating the B2B Embed Network as a public, ad-supported distribution service is commercial use that makes the PolyForm Noncommercial 1.0.0 conflict described in Requirement 10.2 more clearly commercial.
2. THE specification SHALL document that public Publisher distribution amplifies the DMCA and abuse exposure described in Requirement 10.4.
3. WHILE serving the B2B Embed Network at public scale, THE Embed_API SHALL support the `playlist-only` and `redirect` proxy modes so that egress cost stays bounded on a low-resource VPS (consistent with Requirement 14.4).
4. THE Embed_API SHALL keep CinePro_Core's internal host address hidden from Publishers and Embed_Consumers (consistent with Requirement 6.4).
