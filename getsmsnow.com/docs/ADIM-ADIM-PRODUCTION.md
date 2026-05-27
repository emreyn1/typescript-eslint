# Adım Adım Production – GetSMSNow

.env dolduruldu. Sırada ne var? Bu dokümanda **sırayla** yapman gereken her şey listeleniyor: Google OAuth hatası çözümü, deploy, webhook’lar, n8n otomasyon fikirleri.

---

## Ön Bilgi

- **Cryptomus:** UI’da kapalı, sadece NOWPayments + Paddle kullanılıyor. Kod ve yorumlar olduğu gibi duruyor.
- **.env:** Tüm değerler dolduruldu (varsayıyoruz).

---

# BÖLÜM 1: Google OAuth "Access blocked" Hatası Çözümü

**Hata:** "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy for keeping apps secure."

## Adım 1.1: Google Cloud Console Kontrolleri

1. [console.cloud.google.com](https://console.cloud.google.com) → Projeni seç
2. **APIs & Services** → **OAuth consent screen**
3. Şunları kontrol et:

| Alan | Gerekli değer |
|------|----------------|
| **User type** | External (herkese açık) |
| **App name** | GetSMSNow (veya site adın) |
| **User support email** | Geçerli e-posta (örn. support@getsmsnow.com) |
| **Developer contact** | Geçerli e-posta |
| **Privacy policy URL** | `https://getsmsnow.com/privacy-policy` |
| **Terms of service URL** | `https://getsmsnow.com/terms-of-service` |

Eksik veya yanlışsa düzelt.

---

## Adım 1.2: Domain Doğrulama (Önemli)

Google, production uygulamalarda **domain sahipliğini** doğrulamak ister.

1. [Google Search Console](https://search.google.com/search-console/about) → Add property
2. Domain: `getsmsnow.com` (veya `www.getsmsnow.com`)
3. Doğrulama: DNS TXT kaydı veya HTML dosyası
4. Domain sahibi olduğunu kanıtla
5. Google Cloud Console’da **OAuth consent screen** → **Authorized domains** bölümünde bu domain’in listelendiğinden emin ol

---

## Adım 1.3: OAuth Client Ayarları

1. **APIs & Services** → **Credentials** → OAuth 2.0 Client ID’ni aç
2. **Authorized redirect URIs** içinde şunlar olmalı:
   - `https://getsmsnow.com/api/auth/callback/google`
   - (Localhost sadece geliştirme için: `http://localhost:3000/api/auth/callback/google`)
3. **Authorized JavaScript origins** (varsa):
   - `https://getsmsnow.com`
   - `http://localhost:3000` (geliştirme için)

**Önemli:** Production’da localhost URI’leri **olmamalı** (Google politikası). Ayrı test projesi kullan.

---

## Adım 1.4: Scope Kontrolü

NextAuth Google provider varsayılan olarak `email`, `profile`, `openid` kullanır – bunlar **sensitive değil**.

1. **OAuth consent screen** → **Scopes** bölümü
2. Sadece `email`, `profile`, `openid` olmalı
3. Gmail, Drive, Calendar vb. **ekleme** – bunlar sensitive/restricted, doğrulama ister

---

## Adım 1.5: Publish App

1. **OAuth consent screen** → **Publishing status**
2. "Testing" ise → **PUBLISH APP** tıkla
3. Onay ver
4. **Sensitive scope yoksa** uygulama birkaç dakika içinde "In production" olur

---

## Adım 1.6: Hâlâ "Access blocked" Alıyorsan

| Olası neden | Çözüm |
|-------------|-------|
| **Test users** | Testing modundaysan sadece Test users listesindekiler giriş yapabilir. eceseckin166@gmail.com’u **Test users**’a ekle veya **PUBLISH APP** yap |
| **Domain doğrulanmamış** | Search Console’da domain doğrulamasını tamamla |
| **Redirect URI uyuşmuyor** | Tam URL eşleşmeli: `https://getsmsnow.com/api/auth/callback/google` (trailing slash yok) |
| **App verification gerekli** | Google bazen ek doğrulama ister. OAuth consent screen’de uyarı/başvuru linki varsa takip et |
| **Yeni proje** | Bazen 24–48 saat beklemen gerekebilir |

---

## Adım 1.7: Ayrı Production Projesi (Önerilir)

Google, test ve production için **ayrı projeler** önerir.

1. Yeni proje oluştur: "GetSMSNow Production"
2. OAuth client oluştur, production redirect URI’leri ekle
3. OAuth consent screen’i yapılandır
4. Yeni `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET`’ı `.env` ve Vercel’e yaz

---

# BÖLÜM 2: Vercel Deploy Sırası

## Adım 2.1: Repo ve Vercel

1. Kodu GitHub’a push et
2. [vercel.com](https://vercel.com) → Import project
3. Repo’yu seç, framework: Next.js (otomatik algılanır)

## Adım 2.2: Environment Variables (Vercel)

Vercel → Project → **Settings** → **Environment Variables**

`.env.example`’daki tüm değişkenleri ekle (Production ortamı için):

- `AUTH_SECRET` **(zorunlu – session 500 önler)**
- `NEXT_PUBLIC_SITE_URL` = `https://getsmsnow.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMSPOOL_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `TELEGRAM_BOT_TOKEN` (opsiyonel)
- `NEXT_PUBLIC_TELEGRAM_BOT_NAME` (opsiyonel)
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`
- `PADDLE_API_KEY`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_ENV` = `production` (canlı ödeme için)

**Cryptomus:** Eklemene gerek yok (devre dışı).

## Adım 2.3: Domain

1. Vercel → **Settings** → **Domains**
2. `getsmsnow.com` ekle
3. DNS’te Vercel’in verdiği A/CNAME kayıtlarını tanımla
4. SSL otomatik gelir

## Adım 2.4: Deploy

1. `git push` veya Vercel’de **Redeploy**
2. `https://getsmsnow.com` açılıyor mu kontrol et

---

# BÖLÜM 3: Ödeme Webhook’ları

## Adım 3.1: NOWPayments

1. [account.nowpayments.io](https://account.nowpayments.io) → **Payment Settings** → **IPN (Instant Payment Notification)**
2. **IPN Callback URL:** `https://getsmsnow.com/api/nowpayments/webhook`
3. **IPN Secret** oluştur, `.env` ve Vercel’deki `NOWPAYMENTS_IPN_SECRET` ile aynı yap

## Adım 3.2: Paddle

1. [developer.paddle.com](https://developer.paddle.com) → **Webhooks**
2. **Notification URL:** `https://getsmsnow.com/api/paddle/webhook`
3. **Event:** `transaction.completed`
4. **Webhook secret** oluştur, `PADDLE_WEBHOOK_SECRET` ile aynı yap
5. **PADDLE_ENV** = `production` (sandbox değil)

---

# BÖLÜM 4: Diğer Servisler

## Adım 4.1: Resend

- Domain doğrulaması (opsiyonel): `noreply@getsmsnow.com` kullanmak için
- `RESEND_FROM` = `GetSMSNow <onboarding@resend.dev>` (doğrulama yoksa)

## Adım 4.2: Telegram

- @BotFather → `/setdomain` → `getsmsnow.com`
- `NEXT_PUBLIC_TELEGRAM_BOT_NAME` = bot kullanıcı adı (örn. GetSMSNowBot). Boş bırakırsan varsayılan "GetSMSNowBot" kullanılır. Tamamen kapatmak için `DISABLED` yaz.
- `NEXT_PUBLIC_TELEGRAM_BOT_NAME` = bot kullanıcı adı

## Adım 4.3: Supabase

- Migration’lar çalıştırıldı mı? (`001_initial.sql`, `002_nowpayments_paddle_payments.sql`)
- Production Supabase projesi kullanılıyor mu?

---

# BÖLÜM 5: Son Kontroller

| # | Kontrol | Beklenen |
|---|---------|----------|
| 1 | Site açılıyor | `https://getsmsnow.com` |
| 2 | Kayıt | E-posta + şifre, kod geliyor |
| 3 | E-posta doğrulama | Resend ile kod ulaşıyor |
| 4 | Google ile giriş | "Access blocked" yok |
| 5 | Telegram ile giriş | Çalışıyor |
| 6 | Bakiye yükleme (NOWPayments) | Invoice oluşuyor, ödeme sonrası bakiye artıyor |
| 7 | Bakiye yükleme (Paddle) | Checkout açılıyor, ödeme sonrası bakiye artıyor |
| 8 | SMS siparişi | Numara alınıyor, SMS kontrolü çalışıyor |
| 9 | İptal + iade | İptal sonrası bakiye geri geliyor |

---

# BÖLÜM 6: n8n Otomasyon Fikirleri

n8n ile yapılabilecek otomasyonlar:

## 6.1 Webhook Monitoring

- **Amaç:** Ödeme webhook’larının başarısız olup olmadığını izlemek
- **Akış:** Uygulama webhook’a 500 döndüğünde Slack/Discord/Telegram’a bildirim
- **Not:** n8n’de HTTP Request node ile webhook URL’ini periyodik test etmek veya uygulama tarafında hata olduğunda n8n webhook’una POST atmak

## 6.2 Ödeme Onay Bildirimi

- **Amaç:** Yeni ödeme geldiğinde e-posta/Slack bildirimi
- **Akış:** Supabase’de `balance_transactions` tablosuna yeni `topup` kaydı eklendiğinde tetikleyici (Supabase webhook veya cron + sorgu) → n8n → e-posta/Slack

## 6.3 Günlük Özet

- **Amaç:** Her gün toplam gelir, yeni kullanıcı sayısı
- **Akış:** Cron (her gün 09:00) → Supabase’den sorgu → E-posta veya Slack’e rapor

## 6.4 SMSPool Bakiye Uyarısı

- **Amaç:** SMSPool bakiyesi düşükse uyarı
- **Akış:** Cron (her 6 saat) → SMSPool balance API (veya kendi `/api/smspool/balance` – auth gerekir) → Bakiye < X ise bildirim

## 6.5 n8n Kurulum (Kısa)

1. [n8n.io](https://n8n.io) – self-hosted veya n8n Cloud
2. Webhook node veya Cron node ile tetikleyici
3. HTTP Request ile API çağrısı
4. Slack/Email/Telegram node ile bildirim

**Not:** n8n’in kendi webhook’una erişebilmesi için public URL gerekir (ngrok veya n8n Cloud).

---

# Sorun Giderme

| Hata | Çözüm |
|------|-------|
| **"Auth not configured"** | Vercel'de `NEXT_PUBLIC_SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` ekle, Redeploy |
| **api/auth/session 500** | Vercel'de `AUTH_SECRET` ekle (`openssl rand -base64 32`), Redeploy |
| **Telegram widget görünmüyor** | Vercel'de `NEXT_PUBLIC_TELEGRAM_BOT_NAME` = bot adı (örn. GetSMSNowBot). BotFather'da `/setdomain` ile `getsmsnow.com` ekle |
| **favicon 404** | `app/` altına `favicon.ico` ekle veya `layout.tsx` metadata'da tanımla |

---

# Özet Sıra

1. **Google OAuth:** Domain doğrula, consent screen doldur, PUBLISH APP
2. **Vercel:** Repo bağla, env ekle, domain ekle, deploy
3. **NOWPayments:** Webhook URL + IPN secret
4. **Paddle:** Webhook URL + secret, PADDLE_ENV=production
5. **Resend, Telegram, Supabase:** Son ayarlar
6. **Test:** Kayıt, giriş, ödeme, sipariş
7. **n8n (opsiyonel):** Monitoring, bildirim, raporlama

---

*Son güncelleme: Şubat 2025*
