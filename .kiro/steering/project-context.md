---
inclusion: always
---

# Project Context

> Bu workspace BİRDEN FAZLA ürün sitesi barındırır. Her sohbette hangi klasörde
> çalışıldığını tespit et ve o sitenin tipine göre `#01-project-types` + `#02-keyword-triggers`
> kurallarını uygula. Hedef: en yüksek conversion rate.

## Aktif ürün siteleri (klasör → tip → stack → gelir)

- **kart-site/** → **fintech / kart**
  Next.js 14, Prisma, NextAuth, bcryptjs, otpauth (2FA), Radix UI, framer-motion, zod
  Gelir: tier/ödeme bazlı · Öncelik: PCI, idempotent webhook, 2FA, güven sinyalleri, paywall/pricing UX

- **getsmsnow.com/** → **tool / utility (sanal numara / SMS-OTP)**
  Next.js (static export `out/`), Supabase backend
  SMS sağlayıcı: SMSPOOL · Auth: Google OAuth + Telegram + Resend(email)
  Ödeme: Cryptomus + NOWPayments (kripto) + Paddle (kart) · Bot koruması: Cloudflare Turnstile
  Rakipler: grizzlysms, smspool, tiger-sms
  Gelir: kullandıkça-öde + bakiye yükleme (top-up) · Öncelik: hızlı time-to-value,
  numara seç→öde→OTP al akışını sürtünmesiz yap, top-up CRO, fiyat/güven sinyalleri, SEO

- **NyumatFlix/** + **cinepro/** → **streaming / film**
  Next.js
  Gelir: reklam bazlı · Öncelik: Core Web Vitals (LCP/INP/CLS), programmatic SEO,
  Schema.org VideoObject, mobile-first, lazy media, ad placement A/B test

- **allianceAroma/** → Next.js + OpenNext (Cloudflare) · tip projeye göre teyit et

## Genel marka/yaklaşım
Conversion-odaklı ürün geliştirme. "İyi yap" = sadece UI değil:
UX/akış → UI → metin → CRO → güvenlik → performans sırası.

## Hard constraints
- Ödeme/auth mantığında: idempotency + imza doğrulama + rate limit ZORUNLU
- Ham kart/secret ASLA saklanmaz (provider tokenize)
- Streaming'de Core Web Vitals korunur (reklam geliri buna bağlı)
- Her conversion iddiası için ölçülebilir hipotez (A/B test'e uygun) sun
- Büyük değişiklikten önce: tip tespit → konu checklist → kısa plan → onay
