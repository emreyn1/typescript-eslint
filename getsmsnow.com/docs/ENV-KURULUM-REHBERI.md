# .env Kurulum Rehberi

Bu dokümanda `.env.local` dosyasını adım adım nasıl dolduracağını anlatıyorum.

---

## Hazırlık

1. Proje klasöründe `.env.example` dosyasını kopyala:
   ```bash
   cp .env.example .env.local
   ```

2. `.env.local` dosyasını aç (VS Code veya herhangi bir editör ile).

---

## Öncelik 1: Site Çalışsın (Zorunlu)

Bunlar olmadan site düzgün açılmaz.

### 1. AUTH_SECRET

**Ne işe yarar:** NextAuth oturum şifrelemesi için.

**Nasıl alınır:** Terminalde:
```bash
openssl rand -base64 32
```

Çıkan satırı kopyala, `.env.local` içinde `AUTH_SECRET=` yanına yapıştır.

**Örnek:** `AUTH_SECRET=K7x9mP2qR5sT8vW1yZ4aB6cD9eF0gH3jL=`

---

### 2. NEXT_PUBLIC_SITE_URL

**Ne işe yarar:** Site URL'i (metadata, linkler, callback URL'leri için).

**Değer:**
- **Local geliştirme:** `http://localhost:3000`
- **Canlı site:** `https://getsmsnow.com` (veya kendi domain'in)

---

### 3. NEXT_PUBLIC_SUPABASE_URL

**Ne işe yarar:** Supabase proje URL'i.

**Nasıl alınır:**
1. [supabase.com](https://supabase.com) → Giriş yap
2. Proje oluştur (veya mevcut projeyi aç)
3. **Settings** → **API** → **Project URL** kopyala

**Örnek:** `https://abcdefghijk.supabase.co`

---

### 4. SUPABASE_SERVICE_ROLE_KEY

**Ne işe yarar:** Supabase admin erişimi (kullanıcılar, siparişler, bakiye).

**Nasıl alınır:** Aynı Settings → API sayfasında **service_role** (anon değil!) key'i kopyala.

**⚠️ Bu anahtarı kimseyle paylaşma. Git'e atma.**

---

### 5. SMSPOOL_API_KEY

**Ne işe yarar:** Numara siparişi, SMS kontrol, iptal.

**Nasıl alınır:**
1. [smspool.net](https://smspool.net) → Kayıt ol / Giriş yap
2. Bakiye yükle (minimum sipariş için)
3. **Settings** (veya **My Account**) → **API Key** → 32 karakterlik key'i kopyala

---

## Öncelik 2: Kayıt ve Giriş Çalışsın

### 6. RESEND_API_KEY

**Ne işe yarar:** Email doğrulama kodu, şifre sıfırlama.

**Nasıl alınır:**
1. [resend.com](https://resend.com) → Kayıt ol
2. **API Keys** → **Create API Key**
3. Key'i kopyala

**RESEND_FROM:** Varsayılan `GetSMSNow <onboarding@resend.dev>` Resend free tier ile çalışır. Kendi domain'in varsa `noreply@getsmsnow.com` gibi değiştirebilirsin (domain doğrulaması gerekir).

---

### 7. GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET

**Ne işe yarar:** "Google ile giriş yap" butonu.

**Nasıl alınır:**
1. [console.cloud.google.com](https://console.cloud.google.com)
2. Yeni proje oluştur veya mevcut projeyi seç
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
4. **Application type:** Web application
5. **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google` (geliştirme için)
6. Canlıda: `https://getsmsnow.com/api/auth/callback/google`
7. Client ID ve Client Secret'ı kopyala

**İstersen sonra ekleyebilirsin** – sadece email ile kayıt da çalışır.

---

### 8. TELEGRAM_BOT_TOKEN & NEXT_PUBLIC_TELEGRAM_BOT_NAME

**Ne işe yarar:** "Telegram ile giriş yap" butonu.

**Nasıl alınır:**
1. Telegram'da [@BotFather](https://t.me/BotFather) aç
2. `/newbot` yaz → bot adı ver (örn. GetSMSNowBot)
3. Bot oluşturulunca **token**ı kopyala (örn. `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. `/setdomain` → domain gir (örn. `getsmsnow.com` veya localhost için `localhost`)

**NEXT_PUBLIC_TELEGRAM_BOT_NAME:** Bot kullanıcı adı (örn. `GetSMSNowBot`)

**İstersen sonra ekleyebilirsin** – sadece email ile kayıt da çalışır.

---

## Öncelik 3: Ödeme (Site çalışınca)

### 9. CRYPTOMUS (Kripto)

**Ne işe yarar:** Bitcoin, USDT vb. ile bakiye yükleme.

**Nasıl alınır:**
1. [cryptomus.com](https://cryptomus.com) → Kayıt ol
2. Merchant hesabı aç
3. **Merchant ID** ve **API Key** al

---

### 10. NOWPAYMENTS (Kripto)

**Ne işe yarar:** Alternatif kripto ödeme.

**Nasıl alınır:**
1. [account.nowpayments.io](https://account.nowpayments.io)
2. **API Key** oluştur
3. **Payment Settings** → **IPN (Instant Payment Notification)** → **IPN Secret** oluştur
4. Webhook URL: `https://getsmsnow.com/api/nowpayments/webhook`

---

### 11. PADDLE (Kredi kartı, Apple Pay, PayPal)

**Ne işe yarar:** Kart ile ödeme.

**Nasıl alınır:**
1. [developer.paddle.com](https://developer.paddle.com)
2. Hesap oluştur
3. **API Keys** → Key oluştur  
4. **Webhooks** → Webhook secret oluştur  
5. Webhook URL: `https://getsmsnow.com/api/paddle/webhook`

**PADDLE_ENV:** 
- `sandbox` = test modu (canlı para yok)
- `production` = gerçek ödeme

---

## Özet Checklist

| Değişken | Zorunlu | Nereden |
|----------|---------|---------|
| AUTH_SECRET | ✅ | `openssl rand -base64 32` |
| NEXT_PUBLIC_SITE_URL | ✅ | localhost veya domain |
| NEXT_PUBLIC_SUPABASE_URL | ✅ | Supabase → Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | ✅ | Supabase → Settings → API |
| SMSPOOL_API_KEY | ✅ | smspool.net → API Key |
| RESEND_API_KEY | ✅ | resend.com → API Keys |
| GOOGLE_CLIENT_ID | ❌ | Google Cloud Console |
| GOOGLE_CLIENT_SECRET | ❌ | Google Cloud Console |
| TELEGRAM_BOT_TOKEN | ❌ | @BotFather |
| NEXT_PUBLIC_TELEGRAM_BOT_NAME | ❌ | Bot adı |
| CRYPTOMUS_* | ❌ | cryptomus.com |
| NOWPAYMENTS_* | ❌ | nowpayments.io |
| PADDLE_* | ❌ | developer.paddle.com |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | ❌ | dash.cloudflare.com → Turnstile |
| TURNSTILE_SECRET_KEY | ❌ | dash.cloudflare.com → Turnstile |

---

## Minimal Başlangıç

İlk denemede sadece şunları doldur:

```
AUTH_SECRET=<openssl rand -base64 32 çıktısı>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=<supabase project url>
SUPABASE_SERVICE_ROLE_KEY=<supabase service_role key>
SMSPOOL_API_KEY=<smspool 32 char key>
RESEND_API_KEY=<resend api key>
RESEND_FROM=GetSMSNow <onboarding@resend.dev>
```

Sonra `npm run dev` ile siteyi çalıştır. Kayıt, giriş, numara alma bu kadarla çalışır.

---

## Supabase Migration

`.env` doldurduktan sonra Supabase'de migration'ları çalıştır:

1. Supabase Dashboard → **SQL Editor**
2. `supabase/migrations/001_initial.sql` içeriğini yapıştır → Run
3. `supabase/migrations/002_nowpayments_paddle_payments.sql` içeriğini yapıştır → Run

---

## Cloudflare Turnstile (CAPTCHA)

**Ne işe yarar:** Bot koruması (brute-force, spam, credential stuffing).

**Turnstile / CAPTCHA nereye konur?**

| Yer | Öncelik | Neden |
|-----|---------|-------|
| Register | ✅ Zaten var | Toplu hesap açma, bot kayıt |
| Login | Yüksek | Brute-force, credential stuffing |
| Send code | Yüksek | E-posta spam, kod bombardımanı |
| Sipariş / Get Number | Yüksek | Para, bot sipariş |
| Forgot password | Orta | E-posta spam |
| Contact form | Düşük | Form spam |

**Nasıl alınır:**
1. [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile
2. **Add site** → Site key ve Secret key oluştur
3. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = Site key (public)
4. `TURNSTILE_SECRET_KEY` = Secret key (gizli)

**Opsiyonel:** Key'ler boşsa Turnstile devre dışı kalır (geliştirme için).

---

## Sorun yaşarsan

- **"SMSPOOL_API_KEY is not set"** → Key'i kontrol et, boşluk kalmasın
- **"Database not configured"** → Supabase URL ve service_role key doğru mu?
- **Email gitmiyor** → Resend API key ve domain doğrulaması
- **Google login çalışmıyor** → Redirect URI tam eşleşmeli (http/https, trailing slash yok)
