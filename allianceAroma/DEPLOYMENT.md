# Alliance Aroma — Deployment Rehberi

> Domain zaten Cloudflare'de mevcut. Bu rehber projeyi sifirdan canli hale getirmek icin gereken TUM adimlari icerir.
>
> **Tahmini sure:** Tum servisleri kurup degerleri girdikten sonra ~2-3 saat icerisinde site canli olur.

## ISLEM SIRASI

```
1. BU DOSYA (DEPLOYMENT.md) → Adim 1-9: Tum servisleri kur, env degerlerini doldur, lokalde test et
2. OPENNEXT-DEPLOYMENT.md   → Cloudflare Workers'a deploy etme detaylari
3. BU DOSYA (DEPLOYMENT.md) → Adim 10-12: Deploy, domain baglama, canli kontroller
4. AFFILIATE-TESTING.md     → Affiliate sistemini test et, komisyon degerlerini dogrula
```

> **Kisa ozet:** Oncelikle bu dosyadaki ADIM 1-9'u takip et (servisler + env + lokal test). Sonra `OPENNEXT-DEPLOYMENT.md`'ye gecip deploy'u yap. Son olarak bu dosyanin ADIM 11-12'si ile domain bagla ve canli kontrolleri yap.

---

## GENEL BAKIS

| Servis | Ne icin | Ucretsiz mi | Dashboard |
|--------|---------|-------------|-----------|
| Supabase | Veritabani + Auth | Evet (Free tier) | https://supabase.com/dashboard |
| Stripe | Odeme | Evet (test), islem basina %2.9 (canli) | https://dashboard.stripe.com |
| PostHog | Analytics | Evet (1M event/ay) | https://us.posthog.com |
| Resend | E-posta | Evet (100 email/gun) | https://resend.com |
| Sentry | Hata takibi | Evet (5K event/ay) | https://sentry.io |
| Cloudflare Pages | Hosting | Evet | https://dash.cloudflare.com |
| Google Cloud | OAuth (Google ile giris) | Evet | https://console.cloud.google.com |
| Facebook Developers | OAuth (Facebook ile giris) | Evet | https://developers.facebook.com |

---

## ADIM 1: Supabase Projesi Olustur (~15 dk)

1. https://supabase.com/dashboard adresine git, hesap olustur/giris yap
2. **"New Project"** tikla
3. Proje bilgileri:
   - **Name:** `alliancearoma`
   - **Database Password:** guclu bir sifre belirle (kaydet!)
   - **Region:** `Central EU (Frankfurt)` veya `West EU (London)` — Dubai'ye en yakin
4. Proje olusturulduktan sonra **Settings → API** sayfasina git
5. Asagidaki degerleri kopyala:

```
NEXT_PUBLIC_SUPABASE_URL=https://XXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

> **ONEMLI:** `SERVICE_ROLE_KEY` asla client tarafinda kullanilmamali. Sadece server-side (webhook, API route).

### 1b: Veritabani Semasinini Yukle

Supabase Dashboard → **SQL Editor** → New Query → asagidaki dosyalari SIRAYLA calistir:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_self_referral_protection.sql`
3. `supabase/migrations/003_security_hardening.sql`

Her birini kopyala-yapistir, **Run** tikla. Hata yoksa bir sonrakine gec.

### 1c: Auth Ayarlari

Supabase Dashboard → **Authentication → URL Configuration:**

- **Site URL:** `https://alliancearoma.com` (veya domainin)
- **Redirect URLs:** asagidakileri ekle:
  ```
  https://alliancearoma.com/auth/callback
  https://www.alliancearoma.com/auth/callback
  http://localhost:3000/auth/callback
  ```

---

## ADIM 2: Stripe Hesabi (~20 dk)

1. https://dashboard.stripe.com adresine git, hesap olustur
2. **Ulke:** `United Arab Emirates` sec
3. Oncelikle **Test Mode** ile calis (sag ustteki toggle)

### 2a: API Anahtarlari

Dashboard → **Developers → API keys:**

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 2b: Webhook Ayarla

Dashboard → **Developers → Webhooks → Add endpoint:**

- **Endpoint URL:** `https://alliancearoma.com/api/webhooks/stripe`
- **Events to listen:** asagidakileri sec:
  - `checkout.session.completed`
  - `charge.refunded`
  - `charge.dispute.created`
- **Signing secret'i** kopyala:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

> **NOT:** Canli yayina gecerken Test Mode'u kapatip anahtarlari `pk_live_...` ve `sk_live_...` olarak degistir.

---

## ADIM 3: PostHog Analytics (~5 dk)

1. https://us.posthog.com adresine git, hesap olustur
2. Yeni proje olustur: `Alliance Aroma`
3. **Settings → Project → Project API Key:**

```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## ADIM 4: Resend E-posta (~10 dk)

1. https://resend.com adresine git, hesap olustur
2. **API Keys → Create API Key:**

```
RESEND_API_KEY=re_...
```

3. **Domains → Add Domain:** `alliancearoma.com`
   - Resend sana DNS kayitlari verecek (MX, TXT, DKIM)
   - Bu kayitlari **Cloudflare DNS** panelinde ekle
   - Dogrulama 5-10 dk surer

4. Dogrulama tamamlandiktan sonra:

```
RESEND_FROM_EMAIL=Alliance Aroma <noreply@alliancearoma.com>
```

### 4b: Supabase Auth Emaillerini @alliancearoma.com Uzerinden Gonder

Supabase'in kayit dogrulama, sifre sifirlama gibi emailleri de `@alliancearoma.com`'dan gitmesi icin:

1. Resend Dashboard → **SMTP** sayfasina git. SMTP bilgilerini kopyala:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: senin API anahtarin (`re_...`)

2. **Supabase Dashboard → Authentication → SMTP Settings → Enable Custom SMTP:**
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: `re_...` (Resend API key)
   - Sender email: `noreply@alliancearoma.com`
   - Sender name: `Alliance Aroma`
   - **Save**

> Bu adimdan sonra kayit dogrulama, sifre sifirlama gibi tum Supabase Auth emailleri `noreply@alliancearoma.com` adresinden gidecek.

---

## ADIM 5: Sentry Hata Takibi (~5 dk)

1. https://sentry.io adresine git, hesap olustur
2. Yeni proje olustur: Platform → **Next.js**
3. Proje ayarlarindan degerleri al:

```
NEXT_PUBLIC_SENTRY_DSN=https://...@o....ingest.us.sentry.io/...
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=alliancearoma
SENTRY_AUTH_TOKEN=sntrys_...
```

> `SENTRY_AUTH_TOKEN` → Settings → Auth Tokens → Create Token (scope: `project:releases`, `org:read`)

---

## ADIM 6: Google OAuth (~15 dk)

1. https://console.cloud.google.com adresine git
2. Yeni proje olustur veya mevcut projeyi sec
3. **APIs & Services → OAuth consent screen:**
   - User Type: `External`
   - App name: `Alliance Aroma`
   - Support email: senin emailin
   - Authorized domains: `alliancearoma.com`
   - **Save & Continue** (scope eklemeye gerek yok, default email/profile yeterli)
4. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID:**
   - Application type: `Web application`
   - Name: `Alliance Aroma Web`
   - Authorized redirect URIs — asagidakini ekle:
     ```
     https://XXXXX.supabase.co/auth/v1/callback
     ```
     (XXXXX = Supabase proje ID'n)
5. **Client ID** ve **Client Secret** kopyala
6. **Supabase Dashboard → Authentication → Providers → Google:**
   - Google enabled: `ON`
   - Client ID: yapistir
   - Client Secret: yapistir
   - **Save**

> Uygulamayi yayinlamak icin Google OAuth consent screen'de **"Publish App"** tikla (yoksa sadece test kullanicilari girebilir).

---

## ADIM 7: Facebook OAuth (~15 dk)

1. https://developers.facebook.com/apps adresine git
2. **Create App → Consumer (veya Business)** sec
3. App ismi: `Alliance Aroma`
4. App olusturulduktan sonra **Add Product → Facebook Login → Set Up:**
   - Valid OAuth Redirect URIs:
     ```
     https://XXXXX.supabase.co/auth/v1/callback
     ```
5. **Settings → Basic** sayfasindan:
   - **App ID** ve **App Secret** kopyala
6. **Supabase Dashboard → Authentication → Providers → Facebook:**
   - Facebook enabled: `ON`
   - App ID: yapistir
   - App Secret: yapistir
   - **Save**

> Facebook app'i canli yayina almak icin **App Review → Permissions and Features** sayfasindan `email` ve `public_profile` izinlerini onayla.

---

## ADIM 8: .env.local Dosyasini Doldur

Proje klasorundeki `.env.local` dosyasini asagidaki gibi doldur (tum degerler yukaridaki adimlardan):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Site URL
NEXT_PUBLIC_SITE_URL=https://alliancearoma.com

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Alliance Aroma <noreply@alliancearoma.com>

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=alliancearoma
SENTRY_AUTH_TOKEN=sntrys_...
```

> **Google ve Facebook OAuth anahtarlari `.env.local`'a GIRMEZ.** Bunlar dogrudan Supabase Dashboard'da girilir. Supabase bunlari kendi icinde yonetir.

---

## ADIM 9: Lokalde Test Et (~10 dk)

```bash
# Bagimlikliklan yukle
pnpm install

# Gelistirme sunucusu baslat
pnpm dev
```

Tarayicida `http://localhost:3000` ac ve test et:
- [x] Anasayfa yukluyor mu?
- [x] Urunler gorunuyor mu?
- [x] Kayit ol (email + sifre)
- [x] Google ile giris
- [x] Facebook ile giris
- [x] Sepete urun ekle
- [x] Checkout'a git (Stripe test mode)
- [x] Referral linki calisyor mu? (`?ref=TEST_CODE`)

### Stripe Test Kart Bilgileri:
```
Kart No: 4242 4242 4242 4242
Son Kullanma: 12/30
CVC: 123
```

---

## ADIM 10: Cloudflare'a Deploy Et (~20 dk)

### OpenNext + Cloudflare Workers (Onerilen)

OpenNext ile tam Next.js destegi (SSR, API routes, middleware, image optimization) Cloudflare Workers'da calisir.

**Detayli adimlar icin:** `OPENNEXT-DEPLOYMENT.md` dosyasina bak.

**Hizli baslangic:**
```bash
npx @opennextjs/cloudflare migrate
pnpm deploy
```

Environment variables Cloudflare Dashboard → Workers & Pages → Settings → Variables and Secrets bolumune girilir.

### Alternatif: Cloudflare Pages (Git Entegrasyonu)

GitHub'a baglayip otomatik deploy istersen: Cloudflare Dashboard → Pages → Connect to Git → Framework: Next.js. Build command: `pnpm build`, output: `.next`. Env vars ekle.

---

## ADIM 11: Domain Baglantisi (~5 dk)

Domain zaten Cloudflare'de oldugu icin:

1. **Cloudflare Pages → projen → Custom domains → Set up a custom domain:**
   - `alliancearoma.com` gir
   - `www.alliancearoma.com` gir
2. Cloudflare DNS otomatik olarak CNAME kayitlarini ekleyecek
3. SSL sertifikasi otomatik (Cloudflare Full Strict)
4. **5 dakika icinde** site canli olur

---

## ADIM 12: Canli Yayin Sonrasi Kontrol Listesi

### Hemen yapilmasi gereken:
- [ ] `NEXT_PUBLIC_SITE_URL` degerini `https://alliancearoma.com` olarak guncelle
- [ ] Supabase Auth → Site URL'i canli domain olarak guncelle
- [ ] Supabase Auth → Redirect URL'lere canli domaini ekle
- [ ] Stripe webhook URL'ini canli domainle guncelle
- [ ] Stripe'i **Live Mode'a** gec, anahtarlari `pk_live_...` / `sk_live_...` olarak degistir
- [ ] Google OAuth → Authorized redirect URI'nin dogru oldugunu kontrol et
- [ ] Facebook OAuth → Redirect URI'nin dogru oldugunu kontrol et
- [ ] Resend domain dogrulamasinin tamamlandigini kontrol et

### Test:
- [ ] `https://alliancearoma.com` erisilebilir
- [ ] HTTPS sertifikasi gecerli (yesil kilit)
- [ ] Kayit ol + email dogrulama calisiyor
- [ ] Google ile giris calisiyor
- [ ] Facebook ile giris calisiyor
- [ ] Referral linki calisiyor
- [ ] Stripe odeme calisiyor (canli kartla kucuk bir test)
- [ ] Siparis sonrasi Supabase'de `orders` tablosunda kayit gorunuyor
- [ ] Komisyon hesaplama calisiyor (`commissions` tablosu)

---

## OZET: Tum Env Degiskenleri

| Degisken | Nereden Alinir | Tip |
|----------|---------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **Secret** |
| `NEXT_PUBLIC_SITE_URL` | Senin domainin | Public |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys | Public |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys | **Secret** |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks | **Secret** |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog → Settings → Project API Key | Public |
| `NEXT_PUBLIC_POSTHOG_HOST` | Sabit: `https://us.i.posthog.com` | Public |
| `RESEND_API_KEY` | Resend → API Keys | **Secret** |
| `RESEND_FROM_EMAIL` | Domain dogrulandiktan sonra | Config |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry → Project → Client Keys | Public |
| `SENTRY_ORG` | Sentry → Settings → Organization | Config |
| `SENTRY_PROJECT` | Sentry → Settings → Projects | Config |
| `SENTRY_AUTH_TOKEN` | Sentry → Settings → Auth Tokens | **Secret** |

> **Google/Facebook OAuth** degiskenleri `.env`'e girmez — dogrudan Supabase Dashboard'da girilir.

---

## SURE TAHMINI

| Adim | Sure |
|------|------|
| Supabase projesi + DB setup | ~15 dk |
| Stripe hesabi + webhook | ~20 dk |
| PostHog | ~5 dk |
| Resend + DNS | ~10 dk (+ DNS yayilma ~5-10 dk) |
| Sentry | ~5 dk |
| Google OAuth | ~15 dk |
| Facebook OAuth | ~15 dk |
| .env.local doldurma | ~5 dk |
| Lokal test | ~10 dk |
| GitHub + Cloudflare Pages deploy | ~20 dk |
| Domain baglama + SSL | ~5 dk |
| Canli kontroller | ~10 dk |
| **TOPLAM** | **~2-2.5 saat** |

> Tum servisler ucretsiz tier ile baslar. Production hacimleri arttikca Stripe islem ucretleri (%2.9 + 30¢) disinda ek maliyet olmaz.
