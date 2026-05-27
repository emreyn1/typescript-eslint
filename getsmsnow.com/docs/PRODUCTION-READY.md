# Production-Ready Checklist – GetSMSNow

Bu site çok kullanıcılı bir ticaret/aktivasyon sitesi olacak. Aşağıda **yapılmış** olanlar ve **canlıya almadan önce / yük trafiği için** yapılması gerekenler listeleniyor.

---

## ✅ Şu an hazır olanlar

- **Next.js 15**, TypeScript, Tailwind, responsive UI
- **SMSPool entegrasyonu:** balance, countries, services, price (%70 marj), order (%10 max_price buffer), check, cancel
- **SEO:** metadata, Open Graph, Twitter Card, robots.txt, sitemap.xml, JSON-LD (Organization, WebSite, FAQPage)
- **Güvenlik başlıkları:** X-Frame-Options, X-Content-Type-Options, Referrer-Policy (next.config)
- **Sayfalar:** Ana sayfa, SMS Activations, Rent Number, API (Coming Soon), Earn with SIM, FAQ, Referral, Login, Register, Forgot password, Privacy/Terms/Refund
- **API key:** Sadece server-side (.env.local), client’a gönderilmiyor
- **404 sayfası,** favicon/logo dokümantasyonu ([LOGO-AND-FAVICON.md](LOGO-AND-FAVICON.md))

---

## 🔴 Canlıya almadan önce mutlaka yapılacaklar

### 1. Gerçek kullanıcı ve ödeme sistemi
- **Şu an:** ✅ Tamamlandı – Supabase, NextAuth (Google, Telegram, e-posta/şifre, e-posta/kod), Cryptomus + NOWPayments + Paddle ile bakiye, sipariş akışı çalışıyor.
- **Yapılacak:** (Opsiyonel) Forgot password gerçek implementasyonu.
- **Not:** Aşağıdaki maddeler tamamlandı (özet tabloya bakın):
  - **Veritabanı:** Kullanıcılar, bakiye, siparişler, referral kodları (PostgreSQL, MySQL veya Supabase/Firebase).
  - **Gerçek auth:** NextAuth.js, Clerk veya kendi JWT/session’ın; cookie/httpOnly ile güvenli oturum.
  - **Bakiye / ödeme:** Kullanıcı bakiye yükleyebilmeli (Stripe, PayPal, kripto vb.). Sipariş atılmadan önce bakiye düşümü ve SMSPool’a ödeme akışı netleştirilmeli.

### 2. Yasal sayfalar (GDPR / ticaret)
- **Şu an:** ✅ Privacy Policy, Terms of Service, Refund Policy yazıldı.
- **Yapılacak:** Hukukçu ile gözden geçirme önerilir.

### 3. Favicon ve OG görseli
- **Şu an:** Layout `favicon.ico` ve `apple-touch-icon.png` bekliyor; `public/` içinde yok.
- **Yapılacak:** [LOGO-AND-FAVICON.md](LOGO-AND-FAVICON.md)’e göre `public/favicon.ico`, `public/apple-touch-icon.png` (180×180) ve isteğe bağlı `public/og.png` (1200×630) eklenmeli.

### 4. Ortam değişkenleri (production)
- **Production’da:** `NEXT_PUBLIC_SITE_URL` = canlı domain (örn. `https://www.getsmsnow.com`).
- **SMSPOOL_API_KEY** sadece server ortamında (Vercel/Netlify env), asla client’ta kullanılmamalı.

---

## 🟠 Yüksek trafik ve güvenlik için önerilenler

### 5. Rate limiting (API)
- **Amaç:** `/api/smspool/order`, `/api/smspool/price` (ve isteğe bağlı balance) için istek sınırı; bot ve kötüye kullanımı azaltır.
- **Yöntem:** `middleware.ts` + IP bazlı limit (örn. Upstash Redis ile `@upstash/ratelimit`) veya Vercel/Cloudflare rate limit.

### 6. Hata izleme ve loglama
- **Amaç:** Canlıda hataları görmek ve kullanıcıyı bilgilendirmek.
- **Yapılacak:** Sentry (veya benzeri) entegrasyonu, hata sınırları (error boundaries). API route’larda try/catch ile anlamlı mesaj dönmek (zaten kısmen var).

### 7. CAPTCHA / bot koruması
- **Amaç:** Kayıt, giriş ve “Get Number” / sipariş gibi kritik aksiyonlarda bot azaltma.
- **Yapılacak:** reCAPTCHA v3, hCaptcha veya Turnstile gibi bir çözüm; form submit veya order API’ye token gönderip doğrulama.

### 8. E-posta
- **Şu an:** ✅ Resend ile e-posta doğrulama kodu çalışıyor. Forgot password hâlâ placeholder.
- **Yapılacak:** Gerçek şifre sıfırlama akışı (Resend + token).

---

## 🟡 İsteğe bağlı iyileştirmeler

- **Çok dilli (i18n):** Navbar’daki dil seçici şu an sadece UI; içerik çevirisi için next-intl veya benzeri eklenebilir.
- **Analytics:** Google Analytics 4, Plausible vb. trafik ve dönüşüm takibi.
- **CDN / cache:** Vercel/Netlify zaten edge ve cache sunar; ek olarak price/countries cache’i (kısa TTL) düşünülebilir.
- **SMSPool limitleri:** SMSPool API’nin rate limit’lerini dokümantasyondan kontrol edip, yoğun trafikte kuyruk veya backoff planı.

---

## Özet tablo

| Konu | Durum | Öncelik |
|------|--------|---------|
| Frontend, SEO, SMSPool API, güvenlik başlıkları | ✅ Hazır | - |
| Veritabanı + gerçek auth | ✅ Tamamlandı | - |
| Ödeme / bakiye yükleme | ✅ Tamamlandı | - |
| Yasal sayfalar (Privacy, Terms, Refund) | ✅ Yazıldı | 🟠 Hukukçu gözden geçirmesi |
| Favicon, apple-touch-icon, og.png | ❌ Eksik dosya | 🔴 Kritik |
| Rate limiting (API) | ❌ Yok | 🟠 Önerilen |
| Hata izleme (Sentry vb.) | ❌ Yok | 🟠 Önerilen |
| CAPTCHA | ❌ Yok | 🟠 Önerilen |
| Forgot password | ⚠️ Placeholder | 🟠 Önerilen |
| i18n / Analytics | ❌ Yok | 🟡 Opsiyonel |

**Deploy checklist** için: [PRODUCTION-READINESS.md](PRODUCTION-READINESS.md)
