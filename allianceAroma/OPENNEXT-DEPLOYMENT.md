# Alliance Aroma — OpenNext + Cloudflare Deployment Rehberi

> Bu dokuman `.env.example` degerlerinin dogru kullanimi ve OpenNext ile Cloudflare Workers'a deploy etme surecini **best practice** olarak aciklar.

---

## BOLUM 1: .env DEGERLERI — CALISIR MI? BEST PRACTICE

### Evet, .env.example degerleri eklendiginde calisacak

`.env.example` dosyasindaki tum degiskenler projede kullaniliyor. Degerleri `.env.local` (lokalde) veya Cloudflare Workers **Environment Variables** (canlida) olarak girdiginde site calisir.

### Best Practice Kurallari

| Kural | Aciklama |
|-------|----------|
| **NEXT_PUBLIC_*** | Tarayicida gorunur. API key yerine public ID kullan (ornegin Stripe pk_, PostHog phc_). |
| **Secret key'ler** | `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` vb. asla client'a gecmemeli. Sadece Server Components, API routes, Server Actions. |
| **OAuth** | Google/Facebook anahtarlari `.env`'e GIRMEZ. Supabase Dashboard'da girilir. |
| **NEXT_PUBLIC_SITE_URL** | Canli domain ile ayni olmali. Auth redirect'ler buna bagli. |
| **Bos/placeholder** | Eksik env varsa build veya runtime hatalari olur. Tum zorunlu degiskenleri doldur. |

### Zorunlu vs Opsiyonel

| Degisken | Zorunlu | Eksikse |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Evet | Auth/DB calismaz |
| `SUPABASE_SERVICE_ROLE_KEY` | Evet (webhook icin) | Stripe webhook, server-side islemler calismaz |
| `NEXT_PUBLIC_SITE_URL` | Evet | Auth redirect hatalari |
| Stripe (3 degisken) | Evet | Odeme calismaz |
| PostHog | Hayir | Analytics calismaz, site calisir |
| Resend | Hayir* | Email gonderilmez (*email dogrulama icin gerekli) |
| Sentry | Hayir | Hata raporlama yok, site calisir |

---

## BOLUM 2: OpenNext + Cloudflare Kurulumu

### Onkosullar

- Node.js 20+
- Cloudflare hesabi
- Wrangler 3.99.0+

### Adim 1: Migrate Komutu (En Kolay Yol)

Mevcut Next.js projesini OpenNext + Cloudflare icin otomatik yapilandirir:

```bash
npx @opennextjs/cloudflare migrate
```

Bu komut su islemleri yapar:
- `@opennextjs/cloudflare` ve `wrangler` yukler
- `wrangler.jsonc` olusturur
- `open-next.config.ts` olusturur (mevcut AWS config'i uzerine yazar)
- `package.json` scriptlerini gunceller
- `public/_headers` (static asset caching) ekler
- `.dev.vars` olusturur
- `.open-next`'i `.gitignore`'a ekler
- R2 bucket olusturur (R2 aktifse)

### Adim 2: Manuel Kurulum (Tercih Edersen)

#### 2a. Paketleri Yukle

```bash
pnpm add @opennextjs/cloudflare
pnpm add -D wrangler@latest
```

#### 2b. wrangler.jsonc Olustur

Proje kokunde `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "alliancearoma",
  "compatibility_date": "2024-12-30",
  "compatibility_flags": [
    "nodejs_compat",
    "global_fetch_strictly_public"
  ],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "services": [
    {
      "binding": "WORKER_SELF_REFERENCE",
      "service": "alliancearoma"
    }
  ],
  "images": {
    "binding": "IMAGES"
  }
}
```

> R2 cache kullanacaksan `r2_buckets` binding ekle. Bkz. [OpenNext Caching](https://opennext.js.org/cloudflare/caching)

#### 2c. open-next.config.ts Guncelle

Mevcut `open-next.config.ts` AWS icin. Cloudflare icin degistir:

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare"

export default defineCloudflareConfig({
  // R2 cache opsiyonel
  // incrementalCache: r2IncrementalCache,
})
```

> `defineCloudflareConfig` icin `@opennextjs/aws` devDependency gerekebilir (tip icin).

#### 2d. .dev.vars Olustur

Proje kokunde `.dev.vars`:

```
NEXTJS_ENV=development
```

Lokalde `.env.local` dosyasini kullanmak icin `development` kalsin. Production'da Cloudflare env vars kullanilir.

#### 2e. package.json Scriptleri

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
  }
}
```

> `build` scripti `next build` olmali — `opennextjs-cloudflare build` bunu otomatik cagirir.

#### 2f. public/_headers (Static Asset Caching)

`public/_headers` dosyasi olustur:

```
/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
```

#### 2g. .gitignore

```
.open-next
.dev.vars
```

> `.dev.vars` icinde secret varsa git'e ekleme. Cloudflare'de env vars kullan.

#### 2h. next.config.mjs — Dev Icin (Opsiyonel)

Lokalde Cloudflare binding'leri kullanacaksan:

```js
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

// mevcut config...
initOpenNextCloudflareForDev()
```

---

## BOLUM 3: Deploy Adimlari

### 3a. Cloudflare'de Oturum Ac

```bash
pnpm wrangler login
```

### 3b. Environment Variables

Cloudflare Dashboard → **Workers & Pages** → **alliancearoma** (veya proje adin) → **Settings** → **Variables and Secrets**:

Tum `.env.example` degerlerini ekle (Production ve Preview icin):

| Degisken | Deger | Secret? |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co | Hayir |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... | Hayir |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... | **Evet** |
| `NEXT_PUBLIC_SITE_URL` | https://alliancearoma.com | Hayir |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_... | Hayir |
| `STRIPE_SECRET_KEY` | sk_... | **Evet** |
| `STRIPE_WEBHOOK_SECRET` | whsec_... | **Evet** |
| `NEXT_PUBLIC_POSTHOG_KEY` | phc_... | Hayir |
| `NEXT_PUBLIC_POSTHOG_HOST` | https://us.i.posthog.com | Hayir |
| `RESEND_API_KEY` | re_... | **Evet** |
| `RESEND_FROM_EMAIL` | Alliance Aroma <noreply@...> | Hayir |
| `NEXT_PUBLIC_SENTRY_DSN` | https://... | Hayir |
| `SENTRY_ORG` | your-org | Hayir |
| `SENTRY_PROJECT` | alliancearoma | Hayir |
| `SENTRY_AUTH_TOKEN` | sntrys_... | **Evet** |

### 3c. Deploy

```bash
pnpm deploy
```

Bu komut:
1. `next build` calistirir
2. OpenNext Cloudflare adapter'i build'e uygular
3. R2 cache populate eder (varsa)
4. `wrangler deploy` ile Cloudflare Workers'a yukler

### 3d. Custom Domain

Cloudflare Dashboard → **Workers & Pages** → **alliancearoma** → **Custom domains**:
- `alliancearoma.com`
- `www.alliancearoma.com`

Domain zaten Cloudflare'deyse DNS otomatik ayarlanir.

---

## BOLUM 4: CI/CD (GitHub Actions)

Her `main` branch push'unda otomatik deploy:

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - run: pnpm deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          # Tum diger env vars Cloudflare Dashboard'da tanimli olmali
          # VEYA burada secrets olarak ekle
```

GitHub repo → **Settings** → **Secrets**:
- `CLOUDFLARE_API_TOKEN`: Wrangler API token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare hesap ID

> Env vars icin iki secenek: (1) Cloudflare Dashboard'da tanimla — deploy sirasinda otomatik enjekte edilir. (2) GitHub Secrets'ta tut — workflow'da `env:` ile gec. Best practice: Hassas degerler Cloudflare'de, build-time (Sentry token vb.) GitHub Secrets'ta.

---

## BOLUM 5: Best Practice Ozeti

| Konu | Best Practice |
|------|---------------|
| **Env vars** | Secret'lar Cloudflare'de "Encrypt" ile isaretle. `NEXT_PUBLIC_*` disindakileri client'a gecirme. |
| **Build** | `pnpm deploy` kullan — build + deploy tek komut. |
| **Preview** | `pnpm preview` ile lokalde Workers runtime'da test et. |
| **Cache** | R2 bucket ile ISR/cache kullan — daha hizli, ucretsiz tier yeterli. |
| **Image** | `images.binding: "IMAGES"` wrangler'da — Next.js Image Optimization Cloudflare'de calisir. |
| **Edge runtime** | `export const runtime = "edge"` KULLANMA — OpenNext Cloudflare desteklemiyor. |
| **Sentry** | Build'de `SENTRY_AUTH_TOKEN` gerekli (source map). Cloudflare env'de tanimla. |

---

## BOLUM 6: Sorun Giderme

| Sorun | Cozum |
|-------|-------|
| `nodejs_compat` hatasi | `wrangler.jsonc` → `compatibility_flags` icinde `nodejs_compat` oldugundan emin ol. |
| Env var okunmuyor | Cloudflare'de Production + Preview icin ayri ayri tanimla. |
| Build hatasi | `pnpm build` tek basina calisiyor mu kontrol et. Sonra `opennextjs-cloudflare build`. |
| Webhook 401/500 | `STRIPE_WEBHOOK_SECRET` dogru mu? Stripe Dashboard'da endpoint URL canli domain mi? |
| Auth redirect hatalari | `NEXT_PUBLIC_SITE_URL` canli domain ile ayni mi? Supabase Redirect URLs guncel mi? |

---

## BOLUM 7: DEPLOYMENT.md ile Iliski

- **DEPLOYMENT.md**: Supabase, Stripe, PostHog vb. servislerin kurulumu, env degerlerinin nereden alinacagi.
- **OPENNEXT-DEPLOYMENT.md** (bu dosya): OpenNext + Cloudflare'a nasil deploy edilecegi, env'lerin Cloudflare'de nasil tanimlanacagi, best practice.

Iki dokuman birlikte kullanilir: Once DEPLOYMENT.md ile servisleri kur, sonra bu dokumanla OpenNext deploy et.
