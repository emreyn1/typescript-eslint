# License, DMCA, and Risk Acknowledgment

> **Status: OPERATOR DECISION REQUIRED — read in full before any production deployment.**
>
> This is an **out-of-code / operator-decision document**. It records the licensing,
> legal, and performance risks of running `embed-api` as a public, ad-supported embed
> provider in front of CinePro Core. **No code in this repository resolves the central
> license conflict described below.** Whether to accept, reject, or mitigate that
> conflict is a non-coding decision that only the operator can make.
>
> _Covers Requirements 10.1–10.5 of the `embed-omss-backend` spec. This document is not
> legal advice; consult a qualified attorney before operating commercially._

---

## 1. CinePro Core is licensed PolyForm Noncommercial 1.0.0 (Req 10.1)

The scraping engine this backend depends on — **CinePro Core**
(`ghcr.io/cinepro-org/core:latest`) and the OMSS framework it builds on
(`@omss/framework`) — is licensed under **PolyForm Noncommercial 1.0.0**.

PolyForm Noncommercial 1.0.0 permits **only non-commercial / personal use**. It grants
the right to use the software for any purpose that is **not primarily intended for or
directed toward commercial advantage or monetary compensation**. Operating it as part of
a revenue-generating service is outside the grant.

License text: https://polyformproject.org/licenses/noncommercial/1.0.0/

---

## 2. A public, ad-supported deployment is a CLEAR commercial-use conflict — not a gray area (Req 10.2)

Operating `embed-api` as a **public, ad-supported embed provider** is a **clear,
unambiguous commercial-use conflict** with the PolyForm Noncommercial 1.0.0 license.
**This is not a gray area, an edge case, or a matter of interpretation.**

State it plainly:

- The public `/embed/movie/:id` and `/embed/tv/:id/:s/:e` surface is exposed to
  **arbitrary third-party websites** (a vidsrc.to-style provider). Public exposure of
  the service is commercial in character.
- That surface is **AD-SUPPORTED**: it runs the ad bumper / VAST infrastructure
  (`ads/bumper.js`, `AD_VAST_URL`, `AD_BUMPER_ENABLED`). **Ad revenue is, by definition,
  commercial use.**

Both facts together place the deployment squarely **outside** the PolyForm Noncommercial
grant. The earlier framing (around cinex's own ad monetization) treated this as a softer
concern; the public, ad-supported `/embed` surface makes the conflict **larger in scope
and unambiguous.**

> The ad-free, first-party cinex `/watch` surface does not change this conclusion. The
> public, ad-supported `/embed` surface alone is sufficient to create the conflict.

---

## 3. Mitigation: Custom_Providers REDUCE but DO NOT ELIMINATE the risk (Req 10.3)

A documented mitigation path is to **author our own `Custom_Provider` classes**
(`BaseProvider` subclasses dropped into CinePro Core's `src/providers/`) instead of
relying on CinePro's bundled providers. This reduces dependence on CinePro's
provider-specific IP.

**It does NOT eliminate the license conflict.** The reason is concrete:

- The **OMSS framework (`@omss/framework`)** that `Custom_Provider` extends is CinePro
  code under PolyForm Noncommercial.
- The **container image (`ghcr.io/cinepro-org/core:latest`)** that runs the providers is
  CinePro code under PolyForm Noncommercial.
- Custom providers run **inside** that licensed engine. Writing our own providers does
  not change what the engine and framework are licensed under.

So: custom providers narrow how much CinePro provider IP we lean on, but the framework
and image remain CinePro and remain PolyForm-licensed. **Residual risk remains.**

### The operator's real options

1. **Obtain a commercial grant / separate license** from the CinePro authors that permits
   public, ad-supported operation.
2. **Replace Core with a differently-licensed (or own) engine** — re-implement the
   aggregation behind the **same OMSS contract** (`{ responseId, expiresAt, sources[],
   subtitles[], diagnostics[] }`) so `embed-api` is unchanged, but the engine underneath
   is not PolyForm-Noncommercial code.
3. **De-monetize the public surface** — disable ads (`AD_BUMPER_ENABLED=false`) and/or
   stop exposing `/embed` publicly, reverting to genuinely non-commercial / personal use.
4. **Accept the documented risk** — proceed knowingly, understanding the conflict is
   clear and that enforcement (cease-and-desist, takedown, or legal action by the authors)
   is possible.

**No code path in this repository implements any of these. This is the operator's choice.**

---

## 4. DMCA / abuse risk of a self-hosted scraper — AMPLIFIED by public exposure (Req 10.4)

Operating a self-hosted scraper that aggregates third-party embed providers carries
**DMCA takedown and abuse exposure**. Public exposure **amplifies** it relative to a
first-party-only deployment:

- **Discoverability:** a public, vidsrc.to-style `/embed` surface is found, indexed
  (despite `noindex`), and shared by third parties.
- **Hotlinking:** arbitrary external sites iframe the surface, driving traffic and
  attention the operator does not control.
- **Higher traffic:** public scale means more requests, more bandwidth, and a larger,
  more visible footprint for rights holders and hosts to notice.

### Mitigations already in the design (reduce, do NOT eliminate)

- **Core is private/loopback-only** — there is no publicly reachable scraping endpoint;
  the browser only ever talks to `embed-api`.
- **The internal Core host is never exposed** to the client (enforced by the stream
  proxy / Property 7).
- **The player sets `noindex,nofollow`** to discourage search indexing.
- **Cloudflare fronts the public surface** — edge rate limiting, Turnstile bot-check, and
  manifest edge-caching.
- **Public abuse layer (Req 13)** — per-IP/referer rate limiting, Turnstile before token
  issuance, HMAC `Session_Token` + fingerprint stream gating, and an optional referer
  allowlist (hotlink protection).

### Recommended operator actions (out of code)

- **Maintain a DMCA contact and takedown process** (a published agent/contact and a
  documented procedure for responding to notices).
- **Consider jurisdiction** for hosting and incorporation before going public.
- **Keep the referer allowlist ready to tighten** if hotlinking abuse appears.

These reduce exposure; they **do not eliminate** legal risk.

---

## 5. Core Web Vitals non-regression (Req 10.5)

Streaming ad revenue depends on **Core Web Vitals (LCP, INP, CLS)**, so the integration
must **not regress** them. How this is addressed:

- **Ad-free cinex `/watch` path:** removing the ~16 third-party `ads: true` iframe slots
  in favor of one self-hosted ad-free player generally *improves* CWV (fewer third-party
  iframes, less third-party JS).
- **Deferred ad bumper on the public surface:** on `/embed`, the ad bumper script is
  loaded **deferred/async** and the VAST request fires **after** the player shell paints,
  so ads never block LCP.
- **Lazy player:** the iframe is lazy-loaded, `hls.js` is loaded deferred, and the
  history `postMessage` listener is **passive**, so INP is not regressed.
- **Verification:** treated as a CWV budget gate (Lighthouse CI or field CWV) comparing
  the ad-laden baseline against the ad-free single-slot version — an integration/budget
  gate, not a unit/property test.

---

## OPERATOR DECISION REQUIRED

> **No code resolves the PolyForm Noncommercial license conflict.** The decision to go to
> production with a public, ad-supported deployment is **yours**, made knowingly. Consciously
> sign off on each item below before production:

- [ ] I understand **CinePro Core and `@omss/framework` are licensed PolyForm
      Noncommercial 1.0.0** (non-commercial / personal use only). _(Req 10.1)_
- [ ] I understand that running `embed-api` as a **public, ad-supported** service is a
      **CLEAR commercial-use conflict with that license — not a gray area.** _(Req 10.2)_
- [ ] I understand that **authoring Custom_Providers reduces but does NOT eliminate** the
      conflict, because the framework and container image remain CinePro. _(Req 10.3)_
- [ ] I have chosen one of the explicit options and recorded it below:
      - [ ] Obtain a commercial grant / separate license from the authors
      - [ ] Replace Core with a differently-licensed / own engine behind the OMSS contract
      - [ ] De-monetize the public surface (disable ads and/or public `/embed`)
      - [ ] **Knowingly accept the documented risk** and proceed
- [ ] I understand the **DMCA / abuse exposure is amplified by public exposure**, I have
      reviewed the in-design mitigations, and I will **maintain a DMCA contact/process and
      consider jurisdiction**. _(Req 10.4)_
- [ ] I will **enforce Core Web Vitals non-regression** (ad-free `/watch`, deferred ad
      bumper on `/embed`, lazy player) via a CWV budget gate before launch. _(Req 10.5)_
- [ ] I have, where appropriate, **consulted qualified legal counsel** about the above.

**Decision recorded by:** ______________________  **Date:** ____________

**Chosen option / notes:** ________________________________________________
