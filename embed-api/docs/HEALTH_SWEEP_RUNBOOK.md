# Provider Health Sweep — Runbook

How to verify that the scraped embed providers actually produce **playable**
sources, persist the result as a `Provider_Report`, read it back, and prune dead
providers from aggregation.

> Realizes the primary goal of the spec (maximize working sources) by telling you
> which providers actually work. Backs spec task **21.1**.
> _Requirements: 1.1, 2.1, 2.3, 2.4, 2.6, 3.1, 3.3._

---

## What the sweep does

The `health:check` CLI (`src/cli/health.ts`, built to `dist/cli/health.js`):

1. Loads the test titles from `--titles <path>` (defaults to
   `config.healthTestTitlesPath` = `./test-titles.json`).
2. Resolves **each title once** through the Aggregator Client against CinePro
   Core (`GET /v1/movies/:id`, `GET /v1/tv/:id/:s/:e`).
3. Discovers the provider set from the OMSS responses (`sources[]` +
   `diagnostics[]`) — or uses an explicitly injected provider list.
4. Probes each provider's best source for **playability**: a `HEAD`/range `GET`
   through the proxy path must return `2xx`, and for `hls` the body must parse as
   a manifest with at least one segment/variant.
5. Classifies every provider (see below), prints a human table **and** JSON,
   and **persists the `Provider_Report`** via the store.
6. Exits with a code that is useful in cron/CI (see Exit codes).

The same persisted report is what `GET /admin/providers/report` serves and what
the unhealthy-exclusion filter consults during aggregation.

---

## Prerequisites for a real run

You need a **live CinePro Core** the sweep can reach. Core requires a TMDB key
and network access; it is not present in a clean dev sandbox.

### 1. Start CinePro Core (loopback-only)

Bind Core to loopback so it is never publicly exposed; embed-api talks to it
over `127.0.0.1`.

```bash
docker run -d --name cinepro-core \
  -p 127.0.0.1:8080:8080 \
  -e TMDB_API_KEY="<your-tmdb-key>" \
  -e NODE_OPTIONS="--max-old-space-size=512" \
  --memory=768m \
  ghcr.io/cinepro-org/core:latest
```

- `TMDB_API_KEY` is **required** by Core to resolve titles (Req 8.2).
- The memory caps (`coreMaxOldSpaceMb` / `--memory`) keep Core inside a cheap
  1–2 GB VPS (Resource Footprint §3/§4).
- Image is pinned to `ghcr.io/cinepro-org/core:latest` (Req 8.3).

Confirm Core is up:

```bash
curl -fsS http://127.0.0.1:8080/v1/movies/603 >/dev/null && echo "core OK"
```

### 2. Point embed-api at Core and configure the report

```bash
export CINEPRO_BASE_URL="http://127.0.0.1:8080"   # Req 8.1; if unset, a warning is logged and the loopback default is used (Req 8.4)
export CINEPRO_TIMEOUT_MS=10000                    # 10s ceiling on Core calls (Req 7.3)
export STORAGE_BACKEND=sqlite                      # default; report persists to ./data/embed.db
# export STORAGE_BACKEND=json                      # alternative: writes ./data/provider-report.json
export EXCLUDE_UNHEALTHY_PROVIDERS=true            # default; prune dead providers from aggregation (Req 2.6)
export HEALTH_AUTH_TOKEN="<a-long-random-token>"   # required to read the report over HTTP (Req 3.2)
```

### 3. Provide test titles

A JSON array of `{ tmdbId, type, season?, episode? }`. A starter file lives at
`./data/test-titles.json`:

```json
[
  { "tmdbId": 603,   "type": "movie" },
  { "tmdbId": 27205, "type": "movie" },
  { "tmdbId": 1399,  "type": "tv", "season": 1, "episode": 1 }
]
```

Pick well-known, long-lived titles so a "no source" result points at the
provider, not at an obscure title.

---

## Run the sweep

```bash
# via the npm script (builds first, then runs)
npm run health:check -- --titles ./data/test-titles.json

# or directly against the compiled CLI
node dist/cli/health.js --titles ./data/test-titles.json
```

Output is a fixed-width table followed by a `--- JSON ---` block (the full
`Provider_Report`). The report is **persisted automatically** on success.

Example table:

```
PROVIDER                  STATUS      WORKING/TESTED    REASON
------------------------  ----------  ----------------  --------------------
vidsrc                    healthy     3/3
vidzee                    healthy     2/3
deadprov                  unhealthy   0/3               proxy returned 502
somenew (somenew)         unknown     0/0
```

---

## Read the report back over HTTP

The latest report is served by the **authenticated** admin endpoint
(`GET /admin/providers/report`, Req 3.1/3.2). It is locked-by-default: with no
`HEALTH_AUTH_TOKEN` configured it always returns `401`.

```bash
curl -fsS http://127.0.0.1:3001/admin/providers/report \
  -H "Authorization: Bearer $HEALTH_AUTH_TOKEN" | jq .
```

- Missing/wrong token → `401 Unauthorized`.
- No report generated yet → `404` with a "run the health check first" message.
- `/admin/*` MUST stay **off the public hostname** and behind auth — Cloudflare/
  CDN fronts only `/embed` (see task 19.2). The response is `no-store` and emits
  no CORS headers.

---

## Interpreting the classifications

Classification is a **total** function — every provider gets exactly one status
(Req 2.2, 2.5):

| Status      | Condition                                                | Meaning |
|-------------|----------------------------------------------------------|---------|
| `healthy`   | `workingTitleCount > 0`                                   | Produced at least one playable source across the test set. Keep it. |
| `unhealthy` | `testedTitleCount > 0` and `workingTitleCount === 0`      | Was attempted but produced nothing playable. `failureReason` carries the dominant reason. Candidate for pruning. |
| `unknown`   | `testedTitleCount === 0`                                  | Could not be tested — Core unreachable, provider disabled mid-run, or no applicable titles. **Not** evidence the provider is bad. |

`failureReason` is present **iff** the status is `unhealthy`.

> A fully-unreachable Core leaves providers `unknown` (or yields an empty
> provider list), never falsely `unhealthy` — because a title whose resolution
> fails is counted as *not tested* for any provider.

---

## How unhealthy providers get pruned (`EXCLUDE_UNHEALTHY_PROVIDERS`)

During aggregation, `src/aggregator/filter.ts` consults the latest persisted
report (Req 2.6):

- `EXCLUDE_UNHEALTHY_PROVIDERS=true` (default) **and** a report exists → every
  source whose `provider.id` is classified `unhealthy` is removed before source
  selection and attribution. `unknown` and `healthy` providers pass through.
- `EXCLUDE_UNHEALTHY_PROVIDERS=false`, or no report available → all sources pass
  through unchanged.

So the loop is: **run the sweep → report persists → unhealthy providers drop out
of aggregation** until a later sweep reclassifies them. Re-running the sweep
after a provider recovers re-includes it automatically (latest report wins, by
max `generatedAt`).

---

## Exit codes

| Code | Constant         | Meaning |
|------|------------------|---------|
| `0`  | `EXIT_OK`        | At least one provider is `healthy`. |
| `1`  | `EXIT_NO_HEALTHY`| Every provider is `unhealthy`/`unknown`, or there were no providers to report. **This is what you get when no live Core is reachable.** |
| `2`  | `EXIT_ERROR`     | The run could not start — missing/invalid `--titles` file, or the health run threw. |

A `0` from a cron run means the provider set is producing working sources; a `1`
warrants investigation (Core down, providers all failing, or test titles
unsuitable); a `2` is an operator/config error.

---

## Scheduling (off-peak, never per request)

Health checks are **never** run per user request. Schedule them off-peak via the
cron scheduler (task 19.1):

```bash
export HEALTH_CRON_SCHEDULE="0 4 * * *"   # 04:00 daily (default)
npm run health:cron
```

---

## Troubleshooting

- **`CINEPRO_BASE_URL is not set` warning** — the loopback default
  (`http://127.0.0.1:8080`) is being used. Set the env var to silence it
  (Req 8.4). The server/CLI still runs.
- **Empty provider list / exit `1`** — Core is unreachable or returned no
  sources for any title. Confirm Core is up (the `curl` check above), the TMDB
  key is valid, and the titles exist.
- **`401` from the admin endpoint** — set `HEALTH_AUTH_TOKEN` and send it as
  `Authorization: Bearer <token>`.
- **`404` from the admin endpoint** — no report persisted yet; run the sweep.
- **All providers `unhealthy` but Core is up** — likely a proxy/header or
  expired-source issue; check the `failureReason` column (e.g. `proxy returned
  5xx`, `hls manifest had no segments`).
