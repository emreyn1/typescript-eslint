# Production Readiness Checklist – getsmsnow.com

Domain: **getsmsnow.com** (Vercel üzerinden bağlanacak)

---

## 1. Vercel Deployment

- [ ] `vercel --prod` ile deploy edildi
- [ ] Vercel Dashboard → Project → **Settings** → **Domains** → `getsmsnow.com` eklendi
- [ ] Domain DNS: Vercel’in verdiği A/CNAME kayıtları domain sağlayıcına eklendi
- [ ] SSL otomatik (Vercel Let’s Encrypt)

---

## 2. Environment Variables (Vercel)

Vercel Dashboard → Project → **Settings** → **Environment Variables**:

| Değişken | Production | Not |
|----------|------------|-----|
| `AUTH_SECRET` | ✅ Zorunlu | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://getsmsnow.com` | Trailing slash yok |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role (anon değil) |
| `SMSPOOL_API_KEY` | ✅ | 32 karakter |
| `RESEND_API_KEY` | ✅ | Email doğrulama |
| `RESEND_FROM` | `GetSMSNow <onboarding@resend.dev>` veya `noreply@getsmsnow.com` | |
| `GOOGLE_CLIENT_ID` | ✅ | OAuth için |
| `GOOGLE_CLIENT_SECRET` | ✅ | |
| `TELEGRAM_BOT_TOKEN` | Opsiyonel | Telegram login |
| `NEXT_PUBLIC_TELEGRAM_BOT_NAME` | Opsiyonel | |
| `NOWPAYMENTS_API_KEY` | ✅ | Kripto ödeme |
| `NOWPAYMENTS_IPN_SECRET` | ✅ | Webhook imzası |
| `PADDLE_API_KEY` | ✅ | Kart ödeme |
| `PADDLE_WEBHOOK_SECRET` | ✅ | Webhook imzası |
| `PADDLE_ENV` | `production` | Canlı para için (sandbox = test) |

**AUTH_URL:** Auth.js v5 Vercel’de `NEXT_PUBLIC_SITE_URL` veya `VERCEL_URL` kullanır. Ekstra `AUTH_URL` gerekmez.

---

## 3. Google OAuth (Production)

1. [console.cloud.google.com](https://console.cloud.google.com) → OAuth client
2. **Authorized redirect URIs** ekle: `https://getsmsnow.com/api/auth/callback/google`
3. **OAuth consent screen** → **PUBLISH APP** (Testing → In production)
4. Privacy policy URL: `https://getsmsnow.com/privacy-policy`

---

## 4. Webhook URL’leri (Ödeme Sağlayıcılar)

| Sağlayıcı | Webhook URL |
|-----------|-------------|
| NOWPayments | `https://getsmsnow.com/api/nowpayments/webhook` |
| Paddle | `https://getsmsnow.com/api/paddle/webhook` |

Her ikisinde de ilgili dashboard’da bu URL’leri tanımla ve secret’ları `.env`’e ekle.

---

## 5. Supabase

- [ ] Migration’lar çalıştırıldı (`001_initial.sql`, `002_nowpayments_paddle_payments.sql`)
- [ ] Production Supabase projesi kullanılıyor (development değil)
- [ ] Supabase URL/keys production ortamına ait

---

## 6. Ödeme Akışı (Şu an aktif)

- **NOWPayments** – Kripto
- **Paddle** – Kart, Apple Pay, PayPal
- **Cryptomus** – Kodda duruyor, UI’da kapalı

---

## 7. Son Kontroller

- [ ] `https://getsmsnow.com` açılıyor
- [ ] Kayıt / giriş çalışıyor
- [ ] Email doğrulama kodu geliyor (Resend)
- [ ] Google ile giriş çalışıyor (OAuth publish edildiyse)
- [ ] Bakiye yükleme (NOWPayments / Paddle) test edildi
- [ ] SMS siparişi alınabiliyor (SMSPool)

---

## Sorun Çıkarsa

| Belirti | Olası neden |
|---------|--------------|
| "Invalid redirect_uri" | Google Console’da URI tam eşleşmeli |
| Webhook 401 | IPN/Webhook secret yanlış |
| Email gelmiyor | Resend API key, domain doğrulama |
| Session kayboluyor | AUTH_SECRET production’da set edilmeli |
