---
inclusion: manual
---

# Project Type Auto-Decomposition (Layer 2 — Manuel/Lazy)

Bir proje tipi tespit edildiğinde veya onaylandığında, kullanıcı belirtmese bile
TÜM ilgili konuları otomatik dahil et. `#00-intent-router` cevap aldıktan sonra bu kural yüklenir.

## Fintech (örn. kart-sitesi)
- PCI: ham kart numarasını ASLA saklama; provider üzerinden tokenize et
- Webhook idempotency ZORUNLU (event.id unique, imza doğrulama)
- 2FA + rate limiting + audit log
- Tier yükseltme UX → paywall, pricing konuları
- Güven sinyalleri → marketing-psychology
- Çoklu ödeme sağlayıcı desteği
- Araçlar: güvenlik denetimi, Sequential Thinking MCP

## Streaming / Medya
- Core Web Vitals (LCP/INP/CLS) — reklam geliri buna bağlı → Chrome DevTools MCP
- Title sayfaları için programmatic SEO
- Schema.org VideoObject
- AI crawler'lar için IndexNow + llms.txt
- Reklam yerleşim deneyleri → A/B testing
- Mobile-first, lazy media yükleme

## SaaS
- Auth: magic link + OAuth (Google/GitHub)
- Stripe subscription + Customer Portal + idempotent webhook
- Onboarding 5-7 adım
- Email lifecycle (welcome, trial, churn, win-back)
- Analytics + feature flags → PostHog MCP
- Error tracking → Sentry
- Billing/auth mantığı için Sequential Thinking MCP

## Landing Page
- Hero + Features + Pricing + Testimonials + FAQ + CTA
- Dönüşüm metni → CRO, copywriting, marketing-psychology
- SEO: metadata + sitemap + OG images
- CTA analytics + A/B testing
- Performans → Chrome DevTools MCP

## E-ticaret
- Ürün/sepet/checkout akışı → CRO, idempotent ödeme webhook
- Güven + aciliyet → marketing-psychology
- Email: terk edilmiş sepet, makbuzlar
- Checkout mantığı için Sequential Thinking MCP

## Dashboard / Admin
- Sidebar nav + RBAC izinler
- Data tablolar + filtreler + bulk actions + CSV/PDF export
- Grafikler (Recharts/Tremor)
- Veri/izin mantığı için Sequential Thinking MCP

## Dev Tool / Library (örn. eslint-plugin, bu workspace)
- API yüzey alanı tasarımı + semver disiplini
- Kapsamlı test (unit + integration + property-based)
- Dokümantasyon + örnekler + changelog
- Type safety (strict TS), public API'lerde return type zorunlu
- Performans regresyon takibi
- Backward compatibility kontrolü

## Output Pattern
Her zaman sun: tespit edilen tip → konu checklist'i → hangi araçların/skill'lerin
devreye gireceği → kısa plan → onay bekle.
