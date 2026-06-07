# Adding a New Provider

> **Why this matters (the primary goal):** every working provider grows the number of
> playable, ad-free Sources we can return per title. Adding "best, long-lived ad-free
> embeds" is the single highest-value recurring activity in this stack. The whole point of
> running CinePro Core is that adding a provider is _cheap_ — so keep adding them.

## TL;DR

1. Write a class that extends `BaseProvider` from `@omss/framework`.
2. Drop the file into **CinePro Core's** `src/providers/` directory.
3. Restart Core — auto-discovery registers it at startup. **No engine code changes, no
   manual import, no registry edit.**

That's the entire flow. A new provider is one file in one directory.

## How discovery works

When CinePro Core starts, the provider registry scans `src/providers/` and registers
**every** `BaseProvider` subclass it finds. Aggregation then queries all registered
providers in parallel and returns the union of their Sources. You never touch the engine,
the router, or an import list — dropping the file in is the registration.

> Providers are authored **inside CinePro Core** (`src/providers/`), not in `embed-api`.
> `embed-api` is the thin player + proxy layer in front of Core; it owns no scraping logic.

## Authoring contract

These three rules are what make the working-source count grow **safely**. Follow them.

- **Unique, stable `id`.** It's the key used for attribution (which provider produced a
  source), dedup tie-breaking, and unhealthy-exclusion (pruning dead providers). Don't
  rename it once shipped, or you'll orphan health history and attribution.
- **Never throw; return `[]` on a miss.** `getMovieSources` / `getTVSources` must return an
  empty array when they can't resolve a title, and must not throw past the registry. One
  provider's miss must never block the others — resilience is the whole reason aggregation
  is a union.
- **Always wrap the playable URL in `createProxyUrl(rawUrl, HEADERS)`.** This routes every
  byte through Core's `/v1/proxy` (and then `embed-api`'s `/stream`), so the required
  upstream headers stay attached and the **upstream host stays hidden** from the client.
  Returning a raw upstream URL leaks the host and usually breaks playback.

## Template

Copy this to start a new provider. A worked, copy-paste-ready sample also lives at
[`providers-template/custom-provider.ts`](../providers-template/custom-provider.ts).

```ts
// CinePro Core: src/providers/my-provider.ts
import { BaseProvider, type TitleContext, type Source } from "@omss/framework";

export default class MyProvider extends BaseProvider {
  readonly id = "myprovider";                 // unique, stable; used in attribution + exclusion
  readonly name = "My Provider";
  enabled = true;                             // set false to keep the code but skip discovery

  protected readonly BASE_URL = "https://example-embed.tld";
  protected readonly HEADERS = {              // headers required to scrape / play
    "User-Agent": "Mozilla/5.0 ...",
    "Referer": "https://example-embed.tld/",
  };

  readonly capabilities = {                   // advertise what this provider supports
    movie: true,
    tv: true,
    quality: ["1080p", "720p", "480p"],
    types: ["hls"] as const,
  };

  // Resolve a movie into one or more playable Sources. Return [] on miss — never throw.
  async getMovieSources(ctx: TitleContext): Promise<Source[]> {
    const html = await this.fetch(`${this.BASE_URL}/movie/${ctx.tmdbId}`, { headers: this.HEADERS });
    const stream = this.extractStream(html);             // provider-specific scraping
    if (!stream) return [];
    return [{
      url: this.createProxyUrl(stream.url, this.HEADERS), // route playback through Core /v1/proxy
      type: "hls",
      quality: stream.quality,
      provider: { id: this.id, name: this.name },
    }];
  }

  // Resolve a TV episode. Return [] on miss — never throw.
  async getTVSources(ctx: TitleContext): Promise<Source[]> {
    const html = await this.fetch(
      `${this.BASE_URL}/tv/${ctx.tmdbId}/${ctx.season}/${ctx.episode}`,
      { headers: this.HEADERS },
    );
    const stream = this.extractStream(html);
    if (!stream) return [];
    return [{
      url: this.createProxyUrl(stream.url, this.HEADERS),
      type: "hls",
      quality: stream.quality,
      provider: { id: this.id, name: this.name },
    }];
  }

  // Lightweight self-test used by the framework / health tooling.
  async healthCheck(ctx: TitleContext): Promise<boolean> {
    const sources = ctx.type === "tv" ? await this.getTVSources(ctx) : await this.getMovieSources(ctx);
    return sources.length > 0;
  }
}
```

## Disabling a provider without deleting it

Set the flag — keep the file:

```ts
enabled = false;   // code stays in src/providers/, but discovery skips it on startup
```

Use this to park a flaky provider while you debug it, instead of deleting working scraping
logic you may want back.

## Testing a new provider

Before trusting a provider in production, run the health CLI to confirm it actually returns
playable sources across the test titles:

```bash
npm run health:check
```

This runs each provider against the test-title set and produces a per-provider report
(healthy / unhealthy / unknown, with working-title counts and reasons). Two things to know:

- A provider that produces no playable source for any test title is classified
  **unhealthy** with a failure reason — that's your signal to fix or remove it.
- Unhealthy providers can be **auto-excluded from aggregation** via configuration
  (`EXCLUDE_UNHEALTHY_PROVIDERS`), so dead sources are pruned automatically and don't drag
  down the working set. Persistently unhealthy providers are good candidates to delete.

## Checklist for a new provider

- [ ] Extends `BaseProvider` from `@omss/framework`
- [ ] File placed in CinePro Core `src/providers/`
- [ ] Unique, stable `id`
- [ ] `getMovieSources` / `getTVSources` return `[]` on miss and never throw
- [ ] Playable URL always built with `createProxyUrl(rawUrl, HEADERS)`
- [ ] `healthCheck` implemented
- [ ] Verified with `npm run health:check`
