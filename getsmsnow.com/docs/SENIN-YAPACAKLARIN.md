# Senin Yapacakların – Adım Adım Rehber

Bu dosya: **senin tarafından** sağlanması gerekenler, adım adım yapılacaklar ve trade-off açıklamalarını içerir.

---

## 1. Benim Tarafımdan Neye İhtiyacım Var?

### 1.1 Hesaplar ve API Anahtarları

| Sağlaman Gereken | Nereden | Not |
|------------------|--------|-----|
| **Supabase** | [supabase.com](https://supabase.com) | Proje oluştur, `supabase/migrations/001_initial.sql` çalıştır |
| **SMSPool API Key** | [smspool.net](https://smspool.net) dashboard | 32 karakter |
| **Google OAuth** | [Google Cloud Console](https://console.cloud.google.com) | Client ID + Secret (Credentials) |
| **Telegram Bot** | @BotFather, `/newbot` + `/setdomain` | Bot adı + token |
| **Resend** | [resend.com](https://resend.com) | API key, domain doğrulaması (veya onboarding@resend.dev) |
| **Cryptomus** | [cryptomus.com](https://cryptomus.com) | Merchant ID + API key |

### 1.2 Görseller

| Dosya | Boyut | Nereden |
|-------|--------|---------|
| `favicon.ico` | 16+32+48 (tek .ico) | [favicon.io](https://favicon.io), [realfavicongenerator.net](https://realfavicongenerator.net) |
| `apple-touch-icon.png` | 180×180 px | Aynı araçlar veya [cloudconvert.com](https://cloudconvert.com) ile dönüştür |
| `og.png` | 1200×630 px | Canva, Figma veya aynı araçlarla |

**Format dönüştürme:** [cloudconvert.com](https://cloudconvert.com), [convertio.co](https://convertio.co) – .ico ↔ .svg ↔ .png

### 1.3 Domain ve Hosting

- Domain (örn. getsmsnow.com)
- Hosting: Vercel (önerilir), Netlify veya VPS
- Cloudflare (ücretsiz) – rate limiting için dashboard yapılandırması

---

## 2. Adım Adım Ne Yapmalısın?

### Adım 1: Ortam değişkenleri (.env.local)

1. `.env.example` dosyasını `.env.local` olarak kopyala.
2. Tüm değerleri doldur (Supabase, SMSPool, Google, Telegram, Resend, Cryptomus).
3. `AUTH_SECRET` için: `openssl rand -base64 32` çalıştır, çıkan değeri koy.

### Adım 2: Supabase kurulumu

1. [supabase.com](https://supabase.com) → New Project.
2. SQL Editor'de `supabase/migrations/001_initial.sql` içeriğini yapıştır, çalıştır.
3. Settings → API: `NEXT_PUBLIC_SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` al.

### Adım 3: Görselleri ekle

1. `public/favicon.ico` oluştur (favicon.io vb.).
2. `public/apple-touch-icon.png` (180×180).
3. `public/og.png` (1200×630).
4. `docs/LOGO-AND-FAVICON.md` format detayları için.

### Adım 4: Cloudflare rate limiting (opsiyonel, önerilir)

1. Domain'i Cloudflare'e ekle.
2. Security → WAF → Rate limiting rules.
3. Örnek: `/api/auth/send-code` için 5/dk, `/api/auth/register` için 3/saat.

### Adım 5: Ödeme webhook'ları

1. **Cryptomus** dashboard → Webhook URL: `https://yourdomain.com/api/cryptomus/webhook`
2. **NOWPayments** Settings → IPN Callback URL: `https://yourdomain.com/api/nowpayments/webhook`
3. **Paddle** Developer Tools → Notifications → Add webhook: `https://yourdomain.com/api/paddle/webhook` (event: transaction.completed)
4. İlk canlı ödemede imza hatası alırsan `BULUNANLAR.md` → Cryptomus webhook bölümüne bak.

### Adım 6: Yasal sayfalar (önerilir)

1. Privacy, Terms, Refund metinlerini hukukçu ile gözden geçir.

---

## 3. Daha Önce Ne Yaptık, Doğru mu Yaptık? (Trade-off Özeti)

| Yapılan | Doğru mu? | Trade-off |
|---------|-----------|-----------|
| **Kullanıcı hemen oluşturuluyor, kod opsiyonel** | Kısmen | **Karar:** Kod zorunlu yapılacak. |
| **Referral tablosu var ama kullanılmıyor** | Hayır | **Yapılacak:** `?ref=` → `referrals` insert. |
| **Sipariş + bakiye ayrı işlemler** | Riskli | **Yapılacak:** Transaction + rollback. |
| **Rate limiting – Cloudflare** | Uygun | Ücretsiz, edge'de. |

---

## 4. Senin Yapacağın Adımlarda Trade-off'lar

| Adım | Trade-off |
|------|-----------|
| **Kod zorunlu** | Güvenlik ↑ vs. UX biraz zorlaşır |
| **Referral** | Gelir potansiyeli ↑ vs. karmaşıklık |
| **Cloudflare** | Ücretsiz; in-app detaylı limit yok |
| **Transaction** | Tutarlılık ↑ vs. kod karmaşıklaşır |

---

## 5. Öncelik Sırası

1. **Hemen:** .env.local doldur, Supabase migration çalıştır, temel test.
2. **Kısa vadede:** Görselleri ekle, referral entegrasyonu, kayıtta kod zorunlu.
3. **Orta vadede:** Forgot password, profil/şifre değiştirme, Cloudflare rate limiting.
4. **Uzun vadede:** Transaction + rollback, CAPTCHA, Sentry, yasal sayfaların hukuken gözden geçirilmesi.

---

*Detay için: [BULUNANLAR.md](BULUNANLAR.md), [YAPILACAKLAR.md](YAPILACAKLAR.md)*
