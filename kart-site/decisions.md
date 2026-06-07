# Decision Log — kart-site

Architectural decisions and what was tried. AI reads this before suggesting changes.

---

## 2026-05-29: Product pivot — Instant virtual cards
- **Before:** Generic "card delivery" messaging
- **Decision:** Instant virtual Visa/MC delivery, physical card optional
- **Reason:** Instant gratification = higher conversion. Competitors (pryvero.cards) do this.

## 2026-05-29: Competitor benchmark — pryvero.cards
- **Decision:** Use pryvero.cards as primary design/UX reference
- **What to copy:** Trust signals placement, pricing layout, hero structure, CTA positioning
- **What to beat:** Faster signup, clearer fees, better mobile UX
- **Method:** `/hallmark study https://pryvero.cards` for design DNA extraction

## 2026-05-29: CRO-focused stack
- **Tried:** 60+ skills (full marketing bundle)
- **Problem:** 13K token overhead, diluted focus
- **Decision:** 8 CRO-focused skills only
- **Reason:** Lower overhead, sharper conversion focus

## 2026-05-29: Anti-slop rules
- **Decision:** No generic copy, no stock images, specific numbers always
- **Examples:**
  - ❌ "Get your card fast" → ✅ "Virtual card in 30 seconds"
  - ❌ "Affordable pricing" → ✅ "€4.99/month, no hidden fees"
  - ❌ Stock card image → ✅ Actual Visa/MC branded card render

---

## Funnel Optimization Queue (TODO)
1. [ ] Hero section — instant delivery messaging + trust badges
2. [ ] Signup flow — email-only first step
3. [ ] Pricing page — tier comparison like pryvero
4. [ ] Card preview — show actual card design before purchase

---

## 2026-05-30: Stack finalized — Static Export
- **Decision:** Next.js 15 + `output: 'export'` (pure static)
- **Reason:** High-risk site = easy recovery needed. Static files = deploy anywhere in 2 minutes.
- **Rejected:** SSR/Node.js (slower recovery), PHP+HTMX (less DX)

## 2026-05-30: Hosting strategy — Multi-VPS Offshore
- **Decision:** 3-5 offshore VPS (different providers, different countries)
- **Providers:** HostCreed (NL), FlokiNET (IS), Impreza (RO)
- **Reason:** Single VPS = single point of failure. Takedown = hours of downtime.
- **DNS:** Failover setup, low TTL

## 2026-05-30: MCP/Skills optimization
- **Active MCPs:** cursor-ide-browser, user-shadcn, user-chrome-devtools
- **Disabled:** user-magic, user-sequential-thinking (unnecessary for landing page)
- **Active Skills:** cro, copywriting, signup, pricing, paywalls, hallmark
- **Reason:** Less token overhead = better context = better output

## 2026-05-30: Framework takedown myth — DEBUNKED
- **Research:** No evidence that JS framework affects takedown speed
- **Reality:** Hosting location determines takedown, not technology stack
- **Source:** Interisle Phishing Report 2025, Vercel Transparency Report, academic papers

<!-- Add new decisions above this line -->
