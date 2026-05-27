# GetSMSNow

Receive SMS online with temporary phone numbers. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

With **SMSPool API** enabled, the app runs as a **Node server** (no static export) so API routes work. Build and start:

```bash
npm run build
npm start
```

For **static-only** deploy (no API), set `output: 'export'` and `distDir: 'out'` in `next.config.js`, then build and serve the `out/` folder.

### Environment (optional)

Copy `.env.example` to `.env.local` and set your production URL for metadata and sitemap:

```bash
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_SITE_URL to your domain, e.g. https://www.getsmsnow.com
```

Rebuild after changing env vars.

### SMSPool.net API

Backend proxy for [SMSPool](https://smspool.net) is under `src/lib/smspool.ts` and `src/app/api/smspool/*`. **API key must stay server-side** (never expose in the browser).

1. Add `SMSPOOL_API_KEY` to `.env.local` (32-char key from SMSPool dashboard).
2. **Mapping:** Country codes are derived in `src/lib/smspool-mapping.ts` (e.g. our `uk` → API `GB`). Service IDs are mapped to SMSPool numeric IDs in `serviceToSmspool`. Price: `GET /api/smspool/price?countryId=us&serviceId=whatsapp` returns our selling price (API cost × 1.7, 70% margin).
3. **Endpoints:**
   - `GET /api/smspool/balance` – account balance (auth required)
   - `POST /api/smspool/order` – body: `{ countryId, serviceId, maxPrice?, pricingOption? }` (auth required)
   - `POST /api/smspool/check` – body: `{ orderId }` – check if SMS received (auth required)
   - `POST /api/orders/cancel` – body: `{ orderId }` – cancel order (auth required, validates ownership)
   - `GET /api/smspool/countries` – SMSPool country list
   - `GET /api/smspool/services` – SMSPool service list

## Deploy (Production-Ready)

This app uses **API routes** (SMSPool), so it must run as a **Node server**.

### Option 1: Vercel (recommended)

1. Push the repo to GitHub.
2. Import the project on [Vercel](https://vercel.com/new).
3. Add env vars: `NEXT_PUBLIC_SITE_URL` = your domain, `SMSPOOL_API_KEY` = your key (secret).
4. Deploy. Vercel runs `next build` and serves with Node; API routes work automatically.

### Option 2: Netlify / other Node host

1. Build: `npm run build`. Run with `npm start` or use platform’s Node runtime.
2. Add env: `NEXT_PUBLIC_SITE_URL`, `SMSPOOL_API_KEY`.

### Option 3: VPS / Docker

1. `npm run build && npm start` (or PM2). Put Nginx/Caddy in front with HTTPS.
2. Set `NEXT_PUBLIC_SITE_URL` to your domain.

## Scripts

| Script   | Description                    |
| -------- | ------------------------------ |
| `npm run dev`   | Start dev server (Turbopack)   |
| `npm run build` | Production build               |
| `npm run start` | Start production server (after build) |
| `npm run lint`  | Biome lint + TypeScript check  |
| `npm run format`| Biome format                   |

## SEO & social assets

Included out of the box:

- **JSON-LD**: Organization, WebSite, FAQPage (in `src/data/structured-data.ts`)
- **Open Graph**: title, description, image (`/og.png`), locale
- **Twitter Card**: summary_large_image with same image
- **robots.txt**: Generated from `NEXT_PUBLIC_SITE_URL` (allow all, sitemap URL)
- **sitemap.xml**: Generated from `NEXT_PUBLIC_SITE_URL` (all main routes, lastmod, priority)

Recommended assets (add to `public/`):

| File | Purpose | Recommended size |
|------|--------|-------------------|
| `og.png` | Social preview (Facebook, Twitter, LinkedIn) | 1200×630 px |
| `favicon.ico` | Browser tab icon | 32×32 or multi-size |
| `apple-touch-icon.png` | iOS home screen icon | 180×180 px |

If `og.png` is missing, social shares may show no image or a fallback. Favicon and apple-touch-icon are optional (browsers may use default).

## Production checklist

- [x] `poweredByHeader: false`, `compress: true`, security headers (next.config)
- [x] SEO: metadata, Open Graph, Twitter, `robots.txt`, `sitemap.xml`
- [x] JSON-LD: Organization, WebSite, FAQPage
- [x] OG image and Twitter card metadata (add `public/og.png` 1200×630)
- [x] Custom 404 page (`app/not-found.tsx`)
- [x]    No `console.log` in form handlers
- [x] `.env.example` and README deploy instructions
- [x] SMSPool API server-side only; price/order with margin and max_price buffer
- [ ] **Full production (high traffic):** See [docs/INDEX.md](docs/INDEX.md) — tüm dokümantasyon (YAPILACAKLAR, BULUNANLAR, PRODUCTION-READY, SENIN-YAPACAKLARIN vb.)

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
