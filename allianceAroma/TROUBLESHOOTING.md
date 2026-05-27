# Alliance Aroma — Kurulum Sorun Giderme Rehberi

> Deployment surecinde karsilasilan sorunlar ve cozumleri.

---

## 1. Supabase Migration Hatasi: `relation already exists`

**Hata:** `ERROR: 42P07: relation "profiles_referral_code_key" already exists`

**Neden:** `001_initial_schema.sql` icinde `referral_code TEXT UNIQUE` (satir 16) otomatik olarak `profiles_referral_code_key` indexi olusturuyordu, sonra satir 25'te ayni isimle tekrar index olusturulmaya calisiliyordu.

**Cozum:** `UNIQUE` keyword'u kaldirildi, sadece partial unique index kullanildi. Temiz baslangic icin once DROP sonra CREATE:

```sql
DROP TABLE IF EXISTS public.commissions CASCADE;
DROP TABLE IF EXISTS public.referral_clicks CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_commissions(UUID, UUID, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS public.cancel_order_commissions(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_self_referral() CASCADE;
DROP FUNCTION IF EXISTS public.protect_referral_fields() CASCADE;
DROP FUNCTION IF EXISTS public.link_referral_to_user(UUID, TEXT) CASCADE;
```

Sonra 001 → 002 → 003 → 004 sirasiyla calistir.

---

## 2. Supabase API Key Karmasasi: `sb_publishable_` vs `eyJ...`

**Sorun:** Supabase API key isimlendirmesini guncelledi. Yeni isimler:
- `sb_publishable_...` = eski `anon key`
- `sb_secret_...` = eski `service_role key`

**Konum:** Supabase Dashboard → Settings → API (eski tab: "Legacy anon, service_role API keys")

**Cozum:** Her iki format da calisir. `.env.local`'a hangisini koyarsan koy, ayni islevi gorur.

---

## 3. OpenNext Migrate Hatasi: `open-next.config.ts already exists`

**Hata:** `Exiting since the project is already configured for OpenNext`

**Neden:** Eski bir `open-next.config.ts` (AWS icin) mevcuttu.

**Cozum:** Dosya Cloudflare icin manuel guncellendi:

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare"
export default defineCloudflareConfig({})
```

Ek olarak `wrangler.jsonc`, `.dev.vars`, `public/_headers` manuel olusturuldu ve `package.json`'a `preview`/`deploy` scriptleri eklendi.

---

## 4. `pnpm deploy` Hatasi: `A deploy is only possible from inside a workspace`

**Hata:** `ERR_PNPM_CANNOT_DEPLOY`

**Neden:** `pnpm deploy` pnpm'in kendi workspace komutu. Bizim `deploy` scriptiyle karistiriliyor.

**Cozum:** `npm run deploy` veya `pnpm run deploy` kullan (`run` kelimesi onemli).

---

## 5. Deploy Hatasi: `Asset too large` (95.6 MB PDF)

**Hata:** `Cloudflare Workers supports assets with sizes of up to 25 MiB`

**Neden:** `public/products/` icinde 95.6 MB'lik bir PDF dosyasi vardi (`Alliance Aroma Presentation...pdf`). Cloudflare max 25 MB.

**Cozum:** PDF dosyasi `public/products/`'dan proje kokune tasindi. Sitede kullanilmiyordu.

---

## 6. Google OAuth: `localhost:3000` Redirect Hatasi

**Hata:** Google ile giris sonrasi `localhost:3000/?code=...` adresine yonleniyor ama site calismiyor.

**Neden:** Supabase Auth ayarlarinda Site URL `http://localhost:3000` olarak kalmi veya `https://alliancearoma.com` olarak ayarlanmis ama Workers domain farkli.

**Cozum:** Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `https://alliancearoma.com`
- **Redirect URLs:** asagidakileri ekle:
  - `https://alliancearoma.com/auth/callback`
  - `https://www.alliancearoma.com/auth/callback`
  - `http://localhost:3000/auth/callback` (lokal test icin)

---

## 7. www vs non-www Redirect

**Sorun:** Site `www.alliancearoma.com` uzerinde calisiyor ama `alliancearoma.com` olarak isteniyor.

**Cozum:** Cloudflare Dashboard → alliancearoma.com → Rules → "Redirect from WWW to root" template'ini kullan:
- Request URL: `https://www.alliancearoma.com/*`
- Target URL: `https://alliancearoma.com/${1}`
- Status code: `301`
- **Preserve query string: ACIK** (cunku `?ref=CODE` gibi referral parametreleri korunmali)

---

## 8. DNS Record Hatasi: `already has a DNS record`

**Hata:** `This zone already has a DNS record of type A, AAAA or CNAME for that hostname`

**Neden:** `www` icin zaten bir DNS kaydi mevcut.

**Cozum:** "Ignore and deploy rule anyway" sec → Deploy rule tikla. Mevcut DNS kaydi zaten Cloudflare proxy uzerinden geciyor, kural calisacak.

---

## 9. SSL/TLS Ayari

**Soru:** Full (Strict) secilmeli mi?

**Cevap:** Evet, **Full (Strict)** secilmeli. Cloudflare Workers kendi SSL sertifikasini otomatik olusturur. Harici sunucu yok, Cloudflare her iki ucu da yonetiyor.

Konum: Cloudflare Dashboard → alliancearoma.com → SSL/TLS → Full (Strict)

> **NOT:** Full (Strict) secildikten sonra site 2-5 dakika erisimez olabilir. Bu normaldir — Cloudflare sertifikayi yeniden olusturuyor. Sunucu Cloudflare Workers uzerinde oldugu icin her iki uc da Cloudflare'de, dolayisiyla Full (Strict) her zaman sorunsuz calisir. Bekle, otomatik duzelir.

---

## 10. Sentry Auth Token: Konum Bulmak

**Sorun:** Sentry'de Auth Token nerede?

**Cozum:** Direkt su adrese git: https://sentry.io/settings/auth-tokens/ → Create Token → Name: `alliancearoma` → scope otomatik (`org:ci`, Source Map Upload). Token'i `.env.local`'a ve Cloudflare'e koy.

---

## 11. Resend API Key Kaybi

**Sorun:** API key olusturuldu ama kaydedilmedi.

**Cozum:** Resend API key'leri sadece olusturulurken gosterilir. Kaybolursa:
1. Resend Dashboard → API Keys → eski key'i sil
2. Yeni key olustur → hemen kopyala
3. Degistirmesi gereken yerler:
   - `.env.local` → `RESEND_API_KEY`
   - Cloudflare → Variables and Secrets → `RESEND_API_KEY`
   - Supabase SMTP (kullaniliyorsa) → Password alani

---

## 12. Google OAuth: Giris Sonrasi Login Olmamis Gibi Gorunuyor

**Sorun:** Google ile giris yapilinca Supabase'e yonleniyor, geri donuyor ama kullanici login olmamis gibi ana sayfaya atiliyor.

**Neden:** Supabase Dashboard'da Site URL `http://alliancearoma.com` olarak ayarli (HTTP, HTTPS degil). OAuth callback `http://` adresine yonleniyor ve calismiyor.

**Cozum:** Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://alliancearoma.com` (**https** olmali!)
- Redirect URLs listesine ekle:
  - `https://alliancearoma.com/auth/callback`
  - `https://www.alliancearoma.com/auth/callback`
  - `https://alliancearoma.arifhallacc.workers.dev/auth/callback`
  - `http://localhost:3000/auth/callback`

---

## 13. Facebook OAuth: "URL Yuklenemedi" Hatasi

**Hata:** Facebook Login tiklaninca "Bu baglantinin domaini uygulamanin domainlerinde yer almiyor" hatasi.

**Neden:** Facebook App'inde domain, Site URL ve OAuth Redirect URI eksik.

**Cozum — 3 adim:**

**Adim 1:** Meta Developers → App settings → Basic:
- **App domains:** `alliancearoma.com`
- **Privacy policy URL:** `https://alliancearoma.com/privacy-policy`
- **User data deletion:** "Data deletion instructions URL" → `https://alliancearoma.com/privacy-policy` (Privacy sayfasinda "Your Rights" bolumunde veri silme aciklanir)
- **Category:** "Business and pages" veya "Shopping" sec

**Adim 2:** Ayni sayfada asagi kaydir → **+ Add Platform** → **Website** sec:
- **Site URL:** `https://alliancearoma.com`

**Adim 3:** Sol menü → Kullanim durumlari (Use Cases) → Facebook Login → Customize:
- **Valid OAuth Redirect URIs:** `https://XXXXX.supabase.co/auth/v1/callback`

> **NOT:** Save changes "An error occurred" diyorsa zorunlu alanlar eksiktir. Privacy policy URL, Category, User data deletion hepsi dolu olmali.

---

## 14. Facebook App: "An error occurred. Please try again later."

**Hata:** Save changes tiklaninca kaydetmiyor.

**Neden:** Facebook tum zorunlu alanlarin doldurulmasini istiyor ama hangisinin eksik oldugunu soylemiypr.

**Cozum:** Su alanlarin hepsinin dolu oldugunu kontrol et:
- Privacy policy URL → `https://alliancearoma.com/privacy-policy`
- Category → bir kategori secilmis olmali
- User data deletion → `https://alliancearoma.com/privacy-policy`
- App domains → `alliancearoma.com`
- Site URL (Website platform) → `https://alliancearoma.com`

Hepsi doluysa sayfayi yenileyip tekrar dene.

---

## 15. Cloudflare Custom Domain: Ikisi Birden Calismiyorsa

**Sorun:** `alliancearoma.com` ve `www.alliancearoma.com`'dan sadece biri calisiyor.

**Cozum:** Ikisi de Workers & Pages → alliancearoma → Settings → Domains & Routes'da ekli olmali. DNS sayfasinda iki kayit da "Worker" tipinde, "Proxied" olmali. Tarayici cache'i temizle veya gizli pencere ile test et.

---

## 16. Cloudflare'de Env Degiskenleri Ne Zaman Girilir?

**Sorun:** Workers & Pages'da proje gorunmuyor, env girilemiyor.

**Cozum:** Env degiskenleri ilk deploy'dan **sonra** girilir. Sira:
1. `npm run deploy` → proje Cloudflare'de olusur
2. Dashboard → Workers & Pages → alliancearoma → Settings → Variables and Secrets
3. Tum degerleri ekle
4. `npm run deploy` → tekrar deploy et (yeni env'ler uygulanir)

---

## 17. Google OAuth: "Choose an account to continue to btiglnuhfonbmrkkalcs.supabase.co"

**Sorun:** Google ile giris tiklaninca "Choose an account to continue to btiglnuhfonbmrkkalcs.supabase.co" gorunuyor. Uygulama adi (Alliance Aroma) veya profil ismi yazmiyor.

**Neden:** Supabase Auth, OAuth callback'i kendi sunucusunda alir (`https://XXXXX.supabase.co/auth/v1/callback`). Google bu domain'i "continue to X" kisminda gosterir. **Site URL** (alliancearoma.com) sadece giris *sonrasi* yonlendirme icin kullanilir; OAuth consent ekranindaki domain Supabase'den gelir.

**Cozum — 2 secenek:**

### Secenek A: Google Brand Verification (Ucretsiz, onerilir)

1. [Google Cloud Console → Branding](https://console.cloud.google.com/auth/branding) sayfasina git
2. **App name:** `Alliance Aroma`
3. **Logo:** Yukle (128x128 px onerilir)
4. **Support email, Privacy policy, Terms of service** doldur:
   - Privacy policy: `https://alliancearoma.com/privacy-policy`
   - Terms of service: `https://alliancearoma.com/terms-of-service`
5. **Save** → Sonra **Submit for verification** (Brand verification)
6. Onay 2–3 is gunu surer. Onaylandiktan sonra consent ekraninda uygulama adin ve logon gorunur

### Secenek B: Supabase Custom Domain (Ucretli Pro plan)

Callback domain'in `auth.alliancearoma.com` olarak gorunmesi icin **Supabase Custom Domain** gerekli. Bu **Pro plan add-on** (ucretli).

**Adimlar:**

1. **Supabase Pro plana gec** → [Dashboard Billing](https://supabase.com/dashboard/org/_/billing)
2. **Custom Domain ekle** → [Settings → General → Custom Domains](https://supabase.com/dashboard/project/_/settings/general)
3. **DNS kayitlari** (ornek: `auth.alliancearoma.com`):
   - CNAME: `auth.alliancearoma.com` → `btiglnuhfonbmrkkalcs.supabase.co`
   - TXT: Supabase'in verdigi `_acme-challenge.auth.alliancearoma.com` kaydi
4. **Google Cloud Console** → OAuth Client → Authorized redirect URIs:
   - `https://auth.alliancearoma.com/auth/v1/callback` ekle
5. **Meta Developers** → Facebook Login → Valid OAuth Redirect URIs:
   - `https://auth.alliancearoma.com/auth/v1/callback` ekle
6. **Domain aktif edildikten sonra** `.env` ve projedeki Supabase URL'ini guncelle:
   - `NEXT_PUBLIC_SUPABASE_URL=https://auth.alliancearoma.com`
   - Cloudflare env'de de ayni degeri koy

> **Not:** Site URL (https://alliancearoma.com) degismez; sadece Supabase API/Auth URL'i custom domain olur. OAuth ekraninda "continue to auth.alliancearoma.com" gorunur.

---

## 18. Yeni Sayfalar (Privacy, Terms) Sonrasi Deploy

**Sorun:** Privacy ve Terms sayfalarini ekledik, nasil yayinlariz?

**Cozum:** Wrangler ayri calistirmana gerek yok. Proje `opennextjs-cloudflare` kullaniyor; `deploy` scripti build + deploy'u birlikte yapar:

```bash
npm run deploy
# veya
pnpm run deploy
```

Bu komut: `opennextjs-cloudflare build` → `opennextjs-cloudflare deploy` calistirir. Wrangler arka planda kullanilir. Yeni sayfalar otomatik dahil edilir.

**Sira:** Once deploy et, sonra Google/Facebook'ta Privacy ve Terms URL'lerini guncelle. Boylece URL'ler canli olur ve platformlar dogrulayabilir.

---

## 19. Google OAuth Icin 128x128 Logo Olusturma

**Sorun:** Google Cloud Console Branding 128x128 px logo istiyor. Mevcut logo buyuk, nasil kuculturuz?

**Best practice — 3 secenek:**

### Secenek A: Online (En kolay, kurulumsuz)
- **[Squoosh.app](https://squoosh.app)** (Google'in araci): Logo'yu surukle, Resize → 128x128, PNG sec, indir.
- **[ResizeImage.net](https://resizeimage.net)**: Upload → 128x128 gir → Resize.

### Secenek B: macOS Preview
1. `public/logo.png` dosyasini Preview ile ac
2. Tools → Adjust Size → Width: 128, Height: 128 (Constrain proportions kapali veya kare yap)
3. File → Export → PNG olarak kaydet (`logo-128.png`)

### Secenek C: Proje scripti (Tekrar kullanilabilir)
Projede hazir script var. `public/logo.png` mevcutsa:
```bash
pnpm run resize-logo
```
Bu `public/logo-128.png` olusturur. Google Branding'e bu dosyayi yukle. (sharp devDependency olarak ekli)

**Not:** Logo kare (1:1) olmali. Dikdortgen logo'yu 128x128 yapinca kisilabilir; Squoosh'ta "Resize" → "Fit" veya "Cover" secenekleriyle oranlari ayarlayabilirsin.

---

## 20. Stripe: "An error occurred with our connection to Stripe. Request was retried 2 times."

**Sorun:** Cart'ta "Proceed to payment" tiklaninca Stripe baglanti hatasi.

**Neden:** Cloudflare Workers ortaminda Stripe Node.js kutuphanesi varsayilan olarak `node:https` kullanir; bu Workers'da yok. Baglanti kopar ve retry sonrasi hata verir.

**Cozum:** `lib/stripe/index.ts` icinde Stripe'i Fetch API ile yapilandir:

```ts
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
  httpClient: Stripe.createFetchHttpClient(),
})
```

Bu degisiklik yapildiysa `pnpm run deploy` ile tekrar deploy et. Ayrica Cloudflare Workers env'de `STRIPE_SECRET_KEY` tanimli oldugundan emin ol.

---

## 21. Login/Register Sonrasi Kullanici Adi ve Cart Gec Gorunuyor (~60 sn)

**Sorun:** Giris yaptiktan sonra kullanici adi ve cart cok gec (dakikalarca) gorunuyor.

**Neden:** 
- Email/sifre ile giris server action uzerinden yapiliyordu; client-side auth state guncellenmeden sayfa yenileniyordu.
- `getUser()` sunucuya dogrulama icin gidiyor; `getSession()` storage'dan okur, daha hizli.

**Cozum (yapildi):**
1. Login formu artik auth context'teki `login()` kullaniyor (client-side Supabase) — giris aninda state guncellenir.
2. `refreshUser` icinde `getSession()` kullanildi (`getUser()` yerine) — ilk yuklemede daha hizli.
3. Login basarili olunca hemen `loadProfile` + `setUser` cagriliyor — header aninda guncellenir.

---

## 22. Cloudflare Turnstile Kurulumu (Login/Register CAPTCHA)

**Nerede kullanilir:** Login ve Register formlari.

**Adimlar:**
1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Turnstile → Add Site
2. Domain ekle: `alliancearoma.com` ve `localhost` (test icin)
3. Mode: **Managed** (ucretsiz)
4. Site Key ve Secret Key kopyala
5. `.env.local` ekle:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
   TURNSTILE_SECRET_KEY=0x4AAAAAAA...
   ```
6. Cloudflare Workers deploy'da `TURNSTILE_SECRET_KEY` env variable ekle (Wrangler secrets veya dashboard)

**Not:** Key'ler tanimli degilse Turnstile atlanir; formlar normal calisir. Key'ler varsa dogrulama zorunludur.
