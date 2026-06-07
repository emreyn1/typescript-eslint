# Cloudflare / CDN Fronting for the Public `/embed` Surface

> **Scope.** This guide covers putting Cloudflare (or an equivalent CDN/WAF) **in front of
> the public `/embed` surface only**. The cinex `/watch` surface, the `/admin` health
> endpoint, and the tokened `/stream` routes are deliberately kept **off the public
> hostname / behind auth**. The edge is the **primary** abuse and caching layer; the
> app-side controls in `embed-api` are **defense-in-depth** for when the edge is bypassed
> (a direct origin hit).
>
> Requirements covered: **6.4** (Core stays loopback; only embed-api published; `/admin`
> never public), **13.1** (edge per-IP rate limiting as the primary limit), **13.2**
> (Turnstile at the edge), **14.2 / 14.3** (manifest edge-caching that honors the
> `Cache-Control` headers embed-api emits; segments + tokens never cached), **14.4**
> (`PROXY_MODE`), and **Resource Footprint §1/§2** (keep segment egress off the VPS).

---

## 0. Topology — what is public and what is not

```
                          ┌─────────────────────────────────────────┐
  Third-party iframe ───▶ │  Cloudflare edge (proxied / orange-cloud) │
  (arbitrary site)        │  WAF · Bot Fight · Rate Limit · Turnstile │
                          │  Cache Rules (manifest only)              │
                          └───────────────────┬───────────────────────┘
                                              │  only /embed/* + the
                                              │  /stream manifest it points to
                                              ▼
                          ┌─────────────────────────────────────────┐
   firewall: only the     │  VPS — embed-api (Fastify, PORT=3001)     │
   embed-api port open    │  public routes: /embed, /stream, /hls     │
                          │  NON-public: /watch, /admin, /api/v1/*    │
                          └───────────────────┬───────────────────────┘
                                              │  http://127.0.0.1:8080 (loopback)
                                              ▼
                          ┌─────────────────────────────────────────┐
                          │  CinePro Core (OMSS) — loopback ONLY      │
                          │  never bound to 0.0.0.0, never public     │
                          └─────────────────────────────────────────┘
```

| Surface / route | Hostname | At the edge? | Notes |
|-----------------|----------|--------------|-------|
| `GET /embed/movie/:id`, `/embed/tv/:id/:s/:e` | **public** (e.g. `embed.movieon.to`) | **Yes** — proxied through Cloudflare | The only surface intended for arbitrary third-party iframes (Req 11.3). |
| `GET /stream?data=…` (manifest `.m3u8`) | public, same host | Yes — but **manifest cached only** | Segments + `Session_Token` responses are `no-store`; never cached (Req 14.3). |
| `GET /watch/...` (cinex) | **internal hostname** or first-party origin only | No | First-party, ad-free. Do not publish on the public embed hostname. |
| `GET /admin/providers/report` | **never public** | No | Bearer-token auth (Req 3.2); keep off the public hostname entirely (Req 6.4). |
| `/api/v1/heartbeat`, `/coins/*`, `/referral/*` | first-party only | No | App-side rate limit + fingerprint (Req 13.6). |
| CinePro Core `/v1/...` | **loopback only** (`127.0.0.1:8080`) | No | Reached only by embed-api; never exposed (Req 6.4, 8.3). |

**Two hostnames is the clean split.** Publish the public embed surface on a dedicated
hostname (the `EMBED_DOMAIN`, e.g. `embed.movieon.to`) routed through Cloudflare, and serve
`/watch` + `/admin` on a separate first-party hostname/origin that the public embed
hostname does not resolve to. If you must share one host, use the WAF rules in §6 to block
`/admin` and `/api/v1/*` at the edge — but separate hostnames is stronger and simpler.

---

## 1. DNS — proxy the public embed hostname

In **Cloudflare → DNS**, create/point the public embed hostname at the VPS and set it to
**Proxied** (orange cloud) so all edge features apply:

| Type | Name | Content | Proxy status |
|------|------|---------|--------------|
| `A` (or `AAAA`) | `embed` (→ `embed.movieon.to`) | `<VPS public IP>` | **Proxied** (orange cloud) |

- Keep the cinex/first-party hostname (`/watch`, `/admin`) on a **separate** record. It may
  be proxied too, but it must **not** be the hostname you advertise for `/embed` and must
  not route to `/admin` publicly.
- **SSL/TLS mode:** set to **Full (strict)** and run a valid origin certificate on the VPS
  reverse proxy so the edge↔origin hop is encrypted and authenticated.
- **Origin lockdown (critical):** once traffic flows through Cloudflare, lock the VPS
  firewall so the embed-api port is reachable **only from Cloudflare IP ranges** — see §5.
  This stops attackers from hitting the origin directly and bypassing the edge controls.

---

## 2. Edge rate limiting — the PRIMARY per-IP limit (Req 13.1)

Cloudflare's rate limiting runs on the edge (free of your VPS CPU) and is the **primary**
per-IP limit. The `embed-api` limiter (`RATE_LIMIT_*`) stays enabled as **defense-in-depth**
for direct-origin hits, but the edge should absorb the bulk of abuse before it reaches the
box.

**Cloudflare → Security → WAF → Rate limiting rules → Create rule:**

| Field | Value |
|-------|-------|
| Rule name | `embed-per-ip` |
| If incoming requests match | `URI Path` `starts with` `/embed/` |
| (optionally also) | `URI Path` `starts with` `/stream` |
| Rate | **100 requests** per **1 minute** |
| Counting characteristic | **IP** (`ip.src`) — per client IP |
| Then take action | **Block** (or **Managed Challenge** for a softer touch) |
| Duration (mitigation timeout) | `60s` (or `600s` for repeat offenders) |

Expression-editor equivalent (Cloudflare rules language):

```
(http.request.uri.path starts_with "/embed/") or (http.request.uri.path starts_with "/stream")
```

Tuning notes:
- Keep the **edge** threshold a little **higher** than the app threshold so the edge is the
  outer wall and the app limiter only ever triggers on direct-origin abuse. The app defaults
  are `RATE_LIMIT_MAX_PER_IP=120` / `RATE_LIMIT_WINDOW_SEC=60` and
  `RATE_LIMIT_MAX_PER_REFERER=600`; pick an edge value at or just under the per-IP figure
  and observe.
- One embedding page can fan out to several `/embed` + `/stream` requests; count real player
  loads, not raw hits, when choosing the number.
- For a per-referer style limit, add a second rule keyed on the `Referer`/`Origin` header.

---

## 3. Turnstile at the edge (Req 13.2)

There are two complementary layers; use **both**:

1. **Edge challenge (primary).** A Cloudflare **Managed Challenge** action (via Bot Fight
   Mode §6, or a WAF rule that challenges suspicious `/embed/*` traffic) makes bots solve a
   Turnstile/JS challenge at the edge before they ever reach the origin. This keeps automated
   abuse off the VPS entirely.

2. **App-side token verification (authoritative gate).** When `TURNSTILE_ENABLED=true`,
   `embed-api` verifies a Turnstile token **server-side** via `verifyTurnstileToken(...)`
   (`src/security/turnstile.ts`) against Cloudflare's siteverify endpoint
   (`https://challenges.cloudflare.com/turnstile/v0/siteverify`) **before a stream
   `Session_Token` is issued** on `/embed`. The bot-check fronts token issuance, not every
   asset — once verified, playback proceeds.

Keys (set in the VPS `.env`, see `.env.example`):

```dotenv
TURNSTILE_ENABLED=true
TURNSTILE_SITE_KEY=<your Turnstile site key>     # public; rendered in the challenge widget
TURNSTILE_SECRET=<your Turnstile secret key>     # private; used by verifyTurnstileToken server-side
```

- `TURNSTILE_SITE_KEY` is the public widget key; `TURNSTILE_SECRET` is private and never
  leaves the server — it is only used in the siteverify call.
- **How the layers complement each other:** the edge challenge cheaply filters obvious bots
  before they cost you origin CPU/egress; the app-side `verifyTurnstileToken` is the
  authoritative gate that guarantees no `Session_Token` (and therefore no stream) is handed
  out without a verified human signal, even if a request reaches the origin directly.
- **Default posture:** ship with `TURNSTILE_ENABLED=false` and rely on edge Bot Fight Mode;
  turn the app gate on when abuse is observed, since the interactive challenge adds friction
  for legitimate Embed_Consumers.

---

## 4. Manifest edge-caching that honors origin `Cache-Control` (Req 14.2, 14.3)

`embed-api` emits a precise cache-control matrix (`src/cache/cacheControl.ts`):

| Response | Surface | `Cache-Control` emitted | Cacheable at edge? |
|----------|---------|-------------------------|--------------------|
| `.m3u8` manifest | `/embed` (public) | `public, max-age=<MANIFEST_CACHE_TTL_SEC>` | **Yes** |
| `.m3u8` manifest | `/watch` (cinex) | `private, no-cache` | No |
| Stream **segment** (any surface) | — | `no-store` | **Never** |
| `Session_Token` response (any surface) | — | `no-store` | **Never** |

The goal at the edge: **respect the origin `Cache-Control`** so the cacheable manifest is
served from the edge on repeat hits, while segments and tokens are **never** cached.

**Cloudflare → Caching → Cache Rules → Create rule.** Create the following two rules, in
this order (more specific first):

**Rule A — never cache stream bytes/tokens (bypass):**

| Field | Value |
|-------|-------|
| Rule name | `stream-no-cache` |
| When incoming requests match | `URI Path` `starts with` `/stream` |
| Then — Cache eligibility | **Bypass cache** |

Expression:

```
(http.request.uri.path starts_with "/stream")
```

> This guarantees segment and `Session_Token` responses served by `/stream` are never
> edge-cached, matching their origin `no-store`. (If you later serve the manifest from a
> distinct path/extension, narrow this rule to the segment/token paths and allow the
> `.m3u8` to fall through to Rule B.)

**Rule B — cache the public manifest, respecting origin headers:**

| Field | Value |
|-------|-------|
| Rule name | `embed-manifest-cache` |
| When incoming requests match | `URI Path` `ends with` `.m3u8` **and** `URI Path` `starts with` `/embed` |
| Then — Cache eligibility | **Eligible for cache** |
| Edge TTL | **Use cache-control header if present** (respect origin) |
| Browser TTL | **Respect origin** |

Expression:

```
(http.request.uri.path starts_with "/embed") and (ends_with(http.request.uri.path, ".m3u8"))
```

Key points:
- Set Edge TTL to **"Use cache-control header if present"** so Cloudflare honors the
  `public, max-age=<MANIFEST_CACHE_TTL_SEC>` the origin emits — do **not** hard-code a longer
  edge TTL, or you risk pinning a stale manifest past the short OMSS `expiresAt` window.
- `MANIFEST_CACHE_TTL_SEC` (default `30`) is intentionally short so a re-resolved source is
  picked up quickly at the edge.
- **Never** add a Cache Rule that force-caches `/stream` segments or sets "Cache Everything"
  for `Session_Token` responses — that would defeat Req 14.3 and could serve expiring tokens
  to the wrong user.

---

## 5. Origin lockdown — only the embed-api port, firewall the rest

Fronting only helps if the origin cannot be hit directly. Lock the VPS down:

- **Publish only the embed-api port.** Do not expose CinePro Core. Core is bound to
  **loopback** (`127.0.0.1:8080`) and reached only by embed-api (Req 6.4, 8.3). Confirm Core
  is **never** bound to `0.0.0.0`.
- **Restrict the embed-api port to Cloudflare IPs.** Allow inbound to the public port
  **only** from [Cloudflare's published IP ranges](https://www.cloudflare.com/ips/) so
  attackers cannot bypass the edge by hitting the origin IP. Example (illustrative — pull the
  current ranges from Cloudflare and script the full list):

  ```bash
  # Default-deny inbound on the public app port, then allow Cloudflare ranges only.
  # Replace 3001 with your published embed-api/reverse-proxy port.
  for cidr in $(curl -s https://www.cloudflare.com/ips-v4); do
    sudo ufw allow from "$cidr" to any port 443 proto tcp
  done
  sudo ufw deny 443/tcp        # block everyone else on the public port
  # Keep SSH (22) restricted to your admin IPs, NOT open to the world.
  ```

- **Keep `/admin` and `/api/v1/*` off the public hostname.** Either serve them on a separate
  internal hostname, or block them at the edge (§6). `/admin/providers/report` additionally
  requires the `HEALTH_AUTH_TOKEN` bearer token — but auth is not a substitute for keeping it
  off the public hostname.
- **Core memory cap stays in place.** Keep `NODE_OPTIONS=--max-old-space-size=512`
  (`CORE_MAX_OLD_SPACE_MB`) and the hard Docker `--memory=768m` limit so Core cannot balloon
  and OOM-kill embed-api on a small box (Resource Footprint §3). Fronting does not change
  this.

---

## 6. WAF / Bot Fight / managed rules

- **Cloudflare Managed Ruleset (WAF):** enable the Cloudflare Managed Ruleset for the public
  zone for baseline protection against common exploits. Run in **Log** briefly to catch false
  positives on legitimate iframe traffic, then switch to **Block**.
- **Block `/admin` and `/api/v1/*` at the edge** (belt-and-suspenders if they share a host).
  WAF custom rule → **Block**:

  ```
  (http.request.uri.path starts_with "/admin") or (http.request.uri.path starts_with "/api/v1/")
  ```

- **Bot Fight Mode** (Security → Bots): enable to challenge/deny automated traffic at the
  edge. This is the cheap front line that complements the app-side Turnstile gate (§3). On
  paid plans, Super Bot Fight Mode lets you target "definitely automated" traffic on
  `/embed/*` specifically.
- **Keep the public surface iframable.** Do not enable edge features that inject
  interstitials/JS into the HTML response of `/embed` in a way that breaks third-party iframe
  embedding (Req 11.3). `embed-api` intentionally sets permissive iframe headers on `/embed`;
  challenges should gate **bots**, not normal embedded players.

---

## 7. Proxy mode at public scale — push segment bytes off the VPS (Req 14.4, Resource Footprint §2)

Every video byte routed through `/stream` consumes VPS **egress**. Manifests are kilobytes;
segments are the whole movie. Opening `/embed` to arbitrary sites multiplies traffic far
beyond cinex-only levels, so **segment egress dominates the cost**.

**Recommendation for the public surface: set `PROXY_MODE=playlist-only` (or `redirect`)** so
the heavy segment bytes are served by the CDN/upstream, not the VPS:

```dotenv
# .env on the VPS — public-scale economics
PROXY_MODE=playlist-only
```

| Mode | What transits embed-api | Egress cost | Trade-off |
|------|-------------------------|-------------|-----------|
| `proxy` (default) | manifest **+** all segments | **Full / highest** | Most correct & safe: Core host hidden, required headers attached, ad-free guaranteed. **Too expensive at public scale.** |
| `playlist-only` | manifest only (tiny); segments rewritten to upstream/Core | **Low** (big saving) | Upstream/Core segment host may be exposed; providers needing per-segment header forwarding may break. **Recommended for `/embed`.** |
| `redirect` | nothing (302 to upstream) | **Lowest** | **Loses host-hiding and the ad-free guarantee** for the redirected target; only for clean, header-free providers. |

Guidance:
- Start at `playlist-only`: it keeps host-hiding for the (tiny) manifest while letting the
  heavy segment bytes bypass the VPS — the single largest egress saving available.
- Reserve `redirect` for providers you have verified are clean and require no headers,
  because it gives up the core guarantees.
- Reserve full `proxy` for the cinex `/watch` path (lower, first-party volume) or for clean
  providers where correctness matters more than egress.
- **Net effect** with manifest edge-caching (§4) + OMSS resolution caching
  (`CORE_OMSS_CACHE_ENABLED`, `AGGREGATOR_CACHE_TTL_MS`) + `playlist-only`/`redirect`: the VPS
  handles mostly tiny manifest/token traffic and signing CPU, while the CDN and upstreams
  absorb the bandwidth. This is what makes a public, high-traffic embed provider viable on a
  cheap VPS without regressing the cinex path.

---

## 8. Operator checklist

Work top to bottom; each item maps to a requirement called out above.

- [ ] **DNS:** public embed hostname (`EMBED_DOMAIN`) is **Proxied** (orange cloud) through
      Cloudflare; `/watch` + `/admin` live on a separate hostname/origin (Req 6.4).
- [ ] **SSL/TLS:** mode is **Full (strict)** with a valid origin cert.
- [ ] **WAF managed rules:** Cloudflare Managed Ruleset enabled (Log → Block after tuning).
- [ ] **WAF custom rule:** `/admin` and `/api/v1/*` blocked at the edge (if host is shared).
- [ ] **Bot Fight Mode:** enabled; complements app-side Turnstile (Req 13.2).
- [ ] **Rate limit rule:** per-IP rule on `/embed/` (+ `/stream`) created; edge is the
      **primary** limit, app limiter is defense-in-depth (Req 13.1).
- [ ] **Turnstile:** `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET` set; `TURNSTILE_ENABLED`
      toggled per abuse level; edge challenge fronts the app `verifyTurnstileToken` gate
      (Req 13.2).
- [ ] **Cache rule A:** `/stream` set to **Bypass cache** — segments + tokens never cached
      (Req 14.3).
- [ ] **Cache rule B:** `/embed` `.m3u8` **Eligible for cache**, Edge TTL = **use origin
      cache-control** (honors `MANIFEST_CACHE_TTL_SEC`) (Req 14.2).
- [ ] **Proxy mode:** `PROXY_MODE=playlist-only` (or `redirect`) on the public surface so
      segment bytes leave the VPS (Req 14.4, Resource Footprint §2).
- [ ] **Origin lockdown:** firewall allows the embed-api port **only** from Cloudflare IP
      ranges; nothing else inbound on the public port (Req 6.4).
- [ ] **Core loopback:** CinePro Core bound to `127.0.0.1:8080`, never `0.0.0.0`, never
      published; memory cap (`--max-old-space-size=512`, `--memory=768m`) in place
      (Req 6.4, Resource Footprint §1/§3).
- [ ] **Verify the boundary:** from an external host, `curl` the public hostname for
      `/admin/providers/report` and confirm it does **not** return the report; confirm Core's
      port is not reachable from the public internet.

---

## 9. Quick verification snippets

After wiring the edge, sanity-check the boundary and cache behavior from an external machine:

```bash
# 1) /admin must NOT be reachable on the public embed hostname (expect connection
#    refused / 403 / 404 — never the JSON report).
curl -sS -o /dev/null -w "%{http_code}\n" https://embed.movieon.to/admin/providers/report

# 2) Core's port must NOT be reachable from the public internet (expect timeout/refused).
curl -sS --max-time 5 http://<VPS_PUBLIC_IP>:8080/ ; echo "exit=$?"

# 3) A public /embed manifest should be edge-cacheable; look for cache-control from origin
#    and CF-Cache-Status from the edge (HIT on the second request).
curl -sSI "https://embed.movieon.to/stream?data=<signed>" | grep -iE "cache-control|cf-cache-status"

# 4) A /stream segment/token response must be no-store and bypass the edge.
curl -sSI "https://embed.movieon.to/stream?data=<signed-segment>" | grep -iE "cache-control|cf-cache-status"
```

> The exact `/stream` URLs are issued by the player; grab them from the network panel of a
> real `/embed` load. The point of the checks is the **headers**: manifests carry
> `public, max-age=…` and can show a `CF-Cache-Status: HIT`; segments and tokens carry
> `no-store` and must never show a cache HIT.
