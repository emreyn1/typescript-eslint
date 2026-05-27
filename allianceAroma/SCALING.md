# Alliance Aroma — Olceklendirme Rehberi (Scaling Guide)

> Bu dokuman projenin 0'dan 100K+ kullaniciya nasil buyuyecegini, her asamada nelerin degismesi gerektigini ve ne zaman hangi harcamalarin yapilmasini anlatir.
>
> **Onemli:** Her asamayi sirasinda oku. Erken optimizasyon yapma — ihtiyac olunca aksiyon al.

---

## Mevcut Teknoloji Yigini

| Katman | Teknoloji | Ucretsiz Limit |
|--------|-----------|----------------|
| Frontend/Backend | Next.js 16 (App Router) | — |
| Hosting | Cloudflare Workers (OpenNext) | 100K req/gun, 10ms CPU |
| Veritabani + Auth | Supabase Free | 500MB DB, 5GB egress, 50 conn |
| Odeme | Stripe | islem basina %2.9 + 30c |
| E-posta | Resend | 100 email/gun |
| Analytics | PostHog | 1M event/ay |
| Hata takibi | Sentry | 5K event/ay |
| Affiliate | 10 seviye komisyon sistemi | — |

---

## Trafik Esikleri ve Aksiyon Plani

---

### Asama 1: 0–100 Kullanici (Simdiki Durum)

**Hedef:** Product-market fit bul. Teknik borca takilma, urun sat.

| Alan | Durum | Aksiyon |
|------|-------|---------|
| Supabase Free | 500MB DB, yeterli | Degisiklik yok |
| Cloudflare Workers Free | 10ms CPU limiti, ERROR 1102 riski | Sorun yasarsan Workers Paid ($5/ay) al |
| Resend Free | 100/gun, test icin yeterli | Degisiklik yok |
| PostHog Free | 1M event, fazlasiyla yeterli | Degisiklik yok |
| Sentry Free | 5K event, yeterli | Degisiklik yok |
| Stripe | Canli modda test et | Test modundan cikmayi unutma |

**Bilinen sorunlar:**
- Cloudflare Workers Free tier'da 10ms CPU limiti var. Buyuk sayfalar veya yogun server component'lar `Error 1102` verebilir
- Cozum: Workers Paid ($5/ay) → 30ms CPU limiti. Ya da Vercel Hobby (free, 10s limit)
- Supabase Free'de 1 hafta inaktiflik sonrasi proje durdurulabilir (pause). Dashboard'dan tekrar baslatilir ama bunu unutma

**Bu asamada yapma:**
- Redis/cache kurma
- CDN optimizasyonu
- Load testing
- Microservice mimarisi dusunme

---

### Asama 2: 100–1,000 Kullanici

**Hedef:** Stabil calisma, ilk olceklendirme adimlari.

**Veritabani:**
- Supabase Free hala calisiyor olabilir ama 500MB limite yaklasiyorsan Pro ($25/ay) al
- Supabase Free'de proje pause riski var — gunluk trafik varsa sorun olmaz ama yine de Pro'ya gecmek guvenli
- Connection pooling (Supavisor) etkinlestir: Supabase Dashboard → Settings → Database → Connection Pooling
- `pgbouncer` modu yerine `supavisor` kullan (Supabase'in yeni default'u)

**Eklenecek index'ler:**

```sql
-- Komisyon sorgulari icin
CREATE INDEX IF NOT EXISTS commissions_affiliate_status_idx
  ON public.commissions(affiliate_id, status);

CREATE INDEX IF NOT EXISTS commissions_created_at_idx
  ON public.commissions(created_at DESC);

-- Siparis sorgulari icin
CREATE INDEX IF NOT EXISTS orders_status_created_idx
  ON public.orders(status, created_at DESC);

-- Referral path ile downline sorgulari icin (zaten var ama kontrol et)
CREATE INDEX IF NOT EXISTS profiles_referrer_path_idx
  ON public.profiles USING btree(referrer_path text_pattern_ops);
```

**Hosting:**
- Workers Paid ($5/ay) → sorunsuz
- ISR/SSG ile urun sayfalarini statik hale getir (CPU time dusuyor)
- `next.config.js`'te `revalidate` degerlerini ayarla:

```js
// Urun sayfalari — 1 saat cache
export const revalidate = 3600

// Koleksiyon sayfalari — 15 dakika
export const revalidate = 900
```

**Email:**
- 100 kullanicida bile 100/gun limitine takilan senaryolar:
  - Kayit onay emaili + hosgeldin emaili + siparis onayi = 3 email/kullanici
  - Gunluk 33 yeni kayit bile limiti doldurur
- Resend Pro ($20/ay): 50K email/ay
- Ozel domain dogrulama (SPF, DKIM, DMARC) yap — deliverability artar

**Monitoring:**
- UptimeRobot (free, 5 dk aralik) ile uptime takibi baslat
- Supabase Dashboard → Reports sekmesinden DB performansini izle
- PostHog'da onemli event'leri tanimla: signup, purchase, affiliate_click

**Guvenlik:**
- Rate limiting ekle (API route'lara)
- Stripe webhook signature dogrulamasini kontrol et
- CORS ayarlarini sadece kendi domain'ine kisitla

---

### Asama 3: 1,000–10,000 Kullanici

**Hedef:** Performans optimizasyonu, profesyonel altyapi.

**Veritabani — Supabase Pro ($25/ay) zorunlu:**
- 8GB disk, 50GB egress, 60 connection
- Point-in-time recovery (backup)
- Dedicated compute dusunmeye basla ($0.01536/saat = ~$11/ay en dusuk)
- `pg_stat_statements` ile yavas sorgulari tespit et:

```sql
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Cache katmani ekle:**
- Cloudflare KV veya Workers KV kullan (Free tier: 100K read/gun)
- Cache'lenecek veriler:
  - Urun katalogu (degisiklik sikligi dusuk)
  - Komisyon oranlari (packages.ts'ten geliyor, sabit)
  - Affiliate dashboard verileri (5 dk TTL)
  - Ranking hesaplamalari (15 dk TTL)

```typescript
// Ornek: KV ile urun cache
const CACHE_KEY = 'products:all'
const cached = await env.KV.get(CACHE_KEY, 'json')
if (cached) return cached

const products = await supabase.from('products').select('*')
await env.KV.put(CACHE_KEY, JSON.stringify(products.data), { expirationTtl: 3600 })
```

**Gorsel optimizasyonu:**
- Cloudflare Images ($5/ay, 100K variant/ay) veya
- next/image ile otomatik optimizasyon (Vercel'de calisir, Workers'da custom loader gerekir)
- WebP format zorunlu, lazy loading default

**Rate limiting (detayli):**

```typescript
// API route'larda rate limit ornegi
// Cloudflare Workers'da: request.cf.country, request.headers.get('cf-connecting-ip')
// Supabase RPC'de: pg_sleep ile yavaslatma YAPMA, uygulama katmaninda yap

const RATE_LIMITS = {
  '/api/checkout':     { window: 60, max: 10 },   // dakikada 10
  '/api/auth/signup':  { window: 300, max: 5 },    // 5 dakikada 5
  '/api/affiliate':    { window: 60, max: 30 },    // dakikada 30
}
```

**Email — Resend Pro ($20/ay):**
- 50K email/ay
- Dedicated sending domain zorunlu
- Transactional (siparis onayi, sifre sifirlama) ve marketing (bulten) emailleri AYIR
- Marketing icin ayri servis dusun (Loops, Mailchimp)

**PostHog:**
- 1M event/ay limitini kontrol et
- Asarsan: PostHog Cloud ($0.00031/event) veya self-hosted
- Gereksiz event'leri filtrele (scroll, mouse move vs gonderme)

**Sentry:**
- 5K event/ay limitini kontrol et
- Sample rate'i ayarla: `tracesSampleRate: 0.1` (her 10 istekten 1'ini izle)
- Sentry Team ($26/ay): 50K event

**Background job'lar:**
- Komisyon hesaplamalarini async yap
- Stripe webhook → queue → komisyon hesapla
- Cloudflare Queues (beta) veya basit bir cron job

**Affiliate sistemi:**
- Network tree sorgusu yavasliyor mu kontrol et
- `referrer_path LIKE '/uuid1/uuid2/%'` sorgusu 10K satirda sorun cikmaz ama index'i kontrol et
- Dashboard verilerini cache'le (5 dk TTL)

---

### Asama 4: 10,000–100,000 Kullanici

**Hedef:** Enterprise-grade altyapi, yedeklilik, gercek olceklendirme.

**Veritabani — Supabase Team ($599/ay) veya self-hosted:**
- Read replica ekle (raporlama sorgulari master'i yormasin)
- Partition stratejisi:

```sql
-- commissions tablosunu aya gore partition'la
CREATE TABLE public.commissions_partitioned (
  LIKE public.commissions INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE commissions_y2025_q1 PARTITION OF commissions_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE commissions_y2025_q2 PARTITION OF commissions_partitioned
  FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');

-- orders tablosu icin de benzer yaklasim
```

- Materialized view'lar ile dashboard istatistikleri:

```sql
CREATE MATERIALIZED VIEW mv_affiliate_stats AS
SELECT
  affiliate_id,
  COUNT(*) as total_commissions,
  SUM(amount) as total_earned,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
  MAX(created_at) as last_commission_at
FROM public.commissions
GROUP BY affiliate_id;

-- Her 15 dakikada yenile (cron ile)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_affiliate_stats;
```

**CDN stratejisi:**
- Statik asset'ler: Cloudflare CDN (zaten var, Cache-Control header'lari ayarla)
- API response cache: Cloudflare Cache API ile hot endpoint'leri cache'le
- Gorsel CDN: Tum urun gorselleri Cloudflare R2 + Images uzerinden

```
Cache-Control headerlari:
  /                       → no-cache (her zaman fresh)
  /products/*             → max-age=3600, stale-while-revalidate=86400
  /api/products           → max-age=300, s-maxage=600
  /_next/static/*         → max-age=31536000, immutable
  /images/*               → max-age=86400
```

**Altyapi degisiklikleri:**
- Admin paneli ayri subdomain'e tasi (admin.alliancearoma.com)
- Admin paneli icin ayri Workers/Vercel projesi
- Admin hesaplari icin 2FA zorunlu (TOTP — Google Authenticator)
- VPS alternatifi: Hetzner ($5-20/ay), DigitalOcean ($6-24/ay) uzerinde self-hosted

**Otomatik backup'lar:**
- Supabase Team: otomatik daily backup
- Self-hosted: `pg_dump` ile 6 saatte bir backup → Cloudflare R2 veya S3
- Backup'lari test et! Geri yuklemeyi en az ayda bir dene

**Load testing:**
- k6 veya Artillery ile yukleme testi yap
- Hedef: 100 concurrent kullanici, 1000 req/dk
- Test senaryolari:
  1. Ana sayfa yuklenme
  2. Urun sayfasi yuklenme
  3. Checkout akisi
  4. Affiliate dashboard
  5. Komisyon hesaplama (webhook simulasyonu)

**Compliance:**
- GDPR: kullanici veri silme endpoint'i (right to be forgotten)
- Cerez banner'i ekle (PostHog, analytics icin)
- Gizlilik politikasi ve kullanim sartlari sayfalari

---

### Asama 5: 100,000+ Kullanici

**Hedef:** Global olcek, multi-region, dedicated ekip.

**Multi-region deployment:**
- Cloudflare Workers zaten global ama veritabani tek bolge
- Supabase'in multi-region cozumu: Read replica'lar farkli bolgelerde
- Alternatif: CockroachDB veya PlanetScale (global distributed)
- Edge caching ile DB erisimini minimize et

**Veritabani sharding:**
- Kullanici bazli sharding: user_id hash → shard
- Region bazli sharding: kullanicinin bolgesine gore
- Affiliate sorgusu zorlugu: cross-shard tree traversal gerekebilir

**Microservice degerlendirmesi:**

| Servis | Ayrilmali mi? | Neden |
|--------|---------------|-------|
| Auth | Hayir | Supabase Auth zaten ayri |
| Siparis/Odeme | Evet | Yuksek throughput, bagimsiz scale |
| Komisyon hesaplama | Evet | CPU-yogun, async calisabilir |
| Bildirim (email/push) | Evet | Queue-based, bagimsiz |
| Urun katalogu | Belki | Basit CRUD, monolith'te kalabilir |
| Admin | Evet (zaten ayri) | Farkli auth, farkli yuklenme patterni |

**Dedicated ekip ihtiyaci:**
- DevOps/SRE: 1 kisi (altyapi, monitoring, deployment)
- Backend: 1-2 kisi (API, veritabani, komisyon sistemi)
- Frontend: 1 kisi (UI/UX, performans)
- Minimum: 2-3 kisi teknik ekip

**Compliance (genisletilmis):**
- GDPR (AB kullanicilari)
- PCI-DSS (Stripe handle ediyor ama entegrasyon kurallarina uy)
- KVKK (Turkiye kullanicilari)
- Data residency gereksinimleri (veri nerede duruyor?)
- SOC 2 Type II (kurumsal musteriler isterse)

---

## Veritabani Optimizasyonu

### Kritik Index'ler

Mevcut index'ler (001_initial_schema.sql'de tanimli):

```
profiles_referral_code_key    → referral_code (UNIQUE, WHERE NOT NULL)
profiles_referrer_path_idx    → referrer_path (btree)
orders_user_id_idx            → user_id
commissions_affiliate_id_idx  → affiliate_id
commissions_order_id_idx      → order_id
```

Buyume ile eklenmesi gereken index'ler:

```sql
-- 100+ kullanici: Komisyon dashboard sorgulari
CREATE INDEX commissions_affiliate_status_idx
  ON public.commissions(affiliate_id, status);

-- 1K+ kullanici: Tarih bazli sorgular
CREATE INDEX commissions_created_desc_idx
  ON public.commissions(created_at DESC);

CREATE INDEX orders_created_desc_idx
  ON public.orders(created_at DESC);

-- 1K+ kullanici: Siparis durumu filtresi
CREATE INDEX orders_status_idx
  ON public.orders(status) WHERE status != 'cancelled';

-- 5K+ kullanici: Downline tree sorgusu (text_pattern_ops LIKE icin)
DROP INDEX IF EXISTS profiles_referrer_path_idx;
CREATE INDEX profiles_referrer_path_pattern_idx
  ON public.profiles USING btree(referrer_path text_pattern_ops);

-- 10K+ kullanici: Composite index'ler
CREATE INDEX commissions_affiliate_date_idx
  ON public.commissions(affiliate_id, created_at DESC, status);

-- 10K+ kullanici: Referral click analytics
CREATE INDEX referral_clicks_affiliate_date_idx
  ON public.referral_clicks(affiliate_id, created_at DESC);

-- 50K+ kullanici: Partial index'ler (sadece aktif kayitlari indexle)
CREATE INDEX orders_pending_idx
  ON public.orders(created_at DESC) WHERE status = 'pending';

CREATE INDEX commissions_pending_idx
  ON public.commissions(affiliate_id, amount) WHERE status = 'pending';
```

### Connection Management

**Supabase connection limitleri:**

| Plan | Direct Connections | Pooler Connections |
|------|--------------------|--------------------|
| Free | 60 | 200 (Supavisor) |
| Pro | 120 | 400 |
| Team | 240 | 800+ |

**Kurallar:**
- Server component'lar ve API route'lar → Pooler (transaction mode) kullan
- Realtime subscriptions → Direct connection kullan
- Her Workers instance 1 connection tutar — Supavisor bunu yonetiyor
- `SUPABASE_URL` yerine `SUPABASE_POOLER_URL` kullan (port 6543)

```
# Direct connection (realtime icin)
postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# Pooler connection (server-side icin) — BUNU KULLAN
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Sorgu Optimizasyonu

**Yavas sorgu tespiti:**

```sql
-- Supabase Dashboard → SQL Editor'de calistir
-- 100ms'den yavas sorgulari bul
SELECT
  query,
  calls,
  round(mean_exec_time::numeric, 2) as avg_ms,
  round(total_exec_time::numeric, 2) as total_ms
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**EXPLAIN ANALYZE kullanimi:**

```sql
-- Sorunlu sorguyu once EXPLAIN ile kontrol et
EXPLAIN ANALYZE
SELECT c.*, p.full_name
FROM commissions c
JOIN profiles p ON p.id = c.affiliate_id
WHERE c.affiliate_id = 'uuid-here'
  AND c.status = 'pending'
ORDER BY c.created_at DESC
LIMIT 50;

-- Seq Scan goruyorsan → index eksik
-- Nested Loop goruyorsan ve yavas → JOIN stratejisini degistir
```

**Materialized view'lar (10K+ kullanicida):**

```sql
-- Affiliate dashboard istatistikleri
CREATE MATERIALIZED VIEW mv_affiliate_dashboard AS
SELECT
  p.id as affiliate_id,
  p.full_name,
  p.referral_code,
  p.current_rank,
  COUNT(DISTINCT c.order_id) as total_orders,
  COALESCE(SUM(c.amount), 0) as total_earned,
  COALESCE(SUM(c.amount) FILTER (WHERE c.status = 'paid'), 0) as total_paid,
  COALESCE(SUM(c.amount) FILTER (WHERE c.status = 'pending'), 0) as total_pending,
  COUNT(DISTINCT d.id) as direct_referrals,
  MAX(c.created_at) as last_commission_date
FROM profiles p
LEFT JOIN commissions c ON c.affiliate_id = p.id
LEFT JOIN profiles d ON d.referrer_id = p.id
WHERE p.is_affiliate = true
GROUP BY p.id, p.full_name, p.referral_code, p.current_rank;

CREATE UNIQUE INDEX mv_affiliate_dashboard_id ON mv_affiliate_dashboard(affiliate_id);

-- Cron ile yenile (Supabase pg_cron extension)
SELECT cron.schedule(
  'refresh-affiliate-dashboard',
  '*/15 * * * *',  -- her 15 dakika
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_affiliate_dashboard'
);
```

---

## Hosting Karsilastirma (Buyumeye Gore)

| Kullanici | Hosting | DB | Email | Toplam Aylik Maliyet |
|-----------|---------|----|----|---------------------|
| 0–100 | CF Workers Free | Supabase Free | Resend Free | **$0** |
| 100–500 | CF Workers Paid | Supabase Free | Resend Free | **$5** |
| 500–1K | CF Workers Paid | Supabase Free/Pro | Resend Pro | **$5–50** |
| 1K–5K | CF Workers Paid veya Vercel Pro | Supabase Pro | Resend Pro | **$45–70** |
| 5K–10K | Vercel Pro + Edge | Supabase Pro + Compute | Resend Business | **$70–150** |
| 10K–50K | VPS + CF CDN | Supabase Team veya self-hosted | Resend Business | **$100–700** |
| 50K–100K | Multi-VPS / Dedicated | Self-hosted PG + replicas | Dedicated email | **$500–2000** |
| 100K+ | Multi-region cluster | Distributed DB | Enterprise email | **$2000+** |

**Detayli hosting karsilastirma:**

| Ozellik | CF Workers | Vercel | VPS (Hetzner) |
|---------|-----------|--------|---------------|
| Fiyat (baslangic) | $5/ay | $20/ay (Pro) | $5/ay |
| CPU limiti | 30ms (paid) | 10s (hobby), 60s (pro) | Sinirsiz |
| Cold start | ~0ms (edge) | ~250ms | Yok (always running) |
| Region | Global edge | Tek region + edge | Tek region |
| SSL | Otomatik | Otomatik | Let's Encrypt (manual) |
| Custom domain | Evet | Evet | Manual (nginx) |
| Scaling | Otomatik | Otomatik | Manual |
| OpenNext uyum | Evet (tasarim amaci) | Native Next.js | PM2 + next start |
| Onerilen aralik | 0–10K | 1K–100K | 10K+ |

---

## Guvenlik Kontrol Listesi

### Her Asamada Zorunlu

| Kontrol | Nasil | Durum |
|---------|-------|-------|
| Rate limiting | API route'larda IP bazli limit | Asama 2'de ekle |
| Input validation | Zod schema ile tum input'lari dogrula | Simdiden var olmali |
| CORS | Sadece kendi domain'e izin ver | next.config.js |
| Security headers | Helmet veya next.config.js headers | Asama 2'de ekle |
| SQL injection | Supabase RLS + parameterized queries | Varsayilan korunma |
| XSS | React otomatik escape + DOMPurify | Varsayilan korunma |
| CSRF | SameSite cookie + Supabase Auth | Varsayilan korunma |
| Env secrets | NEXT_PUBLIC_ olmayan key'ler server-only | Kontrol et |

### Asama 3+ Icin

| Kontrol | Nasil |
|---------|-------|
| Admin 2FA | TOTP (Google Auth) veya passkey |
| Audit logging | Admin islemlerini logla (kim, ne, ne zaman) |
| IP whitelisting | Admin panel erisimi icin |
| Webhook signature | Stripe webhook'larinda imza dogrulama |
| Dependency audit | `npm audit` haftalik calistir |
| Secret rotation | API key'leri 90 gunde bir degistir |

### next.config.js Guvenlik Headerlari

```js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

---

## Monitoring ve Alerting

### Katmanli Monitoring Stratejisi

| Katman | Arac | Ucretsiz mi | Ne izler |
|--------|------|-------------|----------|
| Uptime | UptimeRobot / Better Uptime | Evet (5 dk) | Site erisimi |
| Hatalar | Sentry | Evet (5K/ay) | JS hatalari, unhandled exceptions |
| Performans | PostHog | Evet (1M/ay) | Sayfa yuklenme, Web Vitals |
| Veritabani | Supabase Dashboard | Evet | Sorgu performansi, disk kullanimi |
| Workers | CF Dashboard | Evet | CPU time, request count, error rate |
| Loglar | Cloudflare Logpush | Paid | Detayli request loglari |

### Alarm Kurallari (Asama 2'den Itibaren)

| Alarm | Esik | Kanal |
|-------|------|-------|
| Site down | 2 dk | Telegram bot / Email |
| Hata orani yuksek | >5% (5 dk pencere) | Telegram / Email |
| Yavas sorgular | >500ms ortalama | Email (gunluk ozet) |
| DB disk kullanimi | >80% | Email |
| Supabase egress | >4GB (5GB limitin %80'i) | Email |
| Workers CPU | Surekli limit yakininda | Email |
| Sentry event | >4K (5K limitin %80'i) | Email |

### UptimeRobot Kurulumu (Ucretsiz)

1. https://uptimerobot.com hesap olustur
2. Monitor ekle:
   - **Tip:** HTTPS
   - **URL:** `https://alliancearoma.com`
   - **Interval:** 5 dakika
   - **Alert Contact:** email adresin
3. Ikinci monitor: `https://alliancearoma.com/api/health` (health check endpoint'i olustur)

### Health Check Endpoint Ornegi

```typescript
// app/api/health/route.ts
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {} as Record<string, string>
  }

  // DB check
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await supabase.from('products').select('id').limit(1)
    checks.services.database = error ? 'error' : 'ok'
  } catch {
    checks.services.database = 'error'
  }

  const allOk = Object.values(checks.services).every(s => s === 'ok')
  return Response.json(checks, { status: allOk ? 200 : 503 })
}
```

---

## Email Scaling

### Resend Plan Karsilastirma

| Plan | Fiyat | Limit | Dedicated IP | Custom Domain |
|------|-------|-------|--------------|---------------|
| Free | $0 | 100/gun, 3K/ay | Hayir | 1 domain |
| Pro | $20/ay | 50K/ay | Hayir | 10 domain |
| Business | $90/ay | 200K/ay | Evet ($40/ay ek) | 100 domain |
| Enterprise | Custom | Sinirsiz | Evet | Sinirsiz |

### Ne Zaman Upgrade

| Senaryo | Gunluk Email | Plan |
|---------|-------------|------|
| Test asamasi, birkac kullanici | <20 | Free |
| Duzenli kayit + siparis | 20–100 | Free (sinirina dikkat) |
| Gunluk 30+ siparis | 100–500 | Pro ($20/ay) |
| Marketing emailleri de gonderiyorsan | 500+ | Business ($90/ay) |
| Gunluk 1000+ email | 1000+ | Business + Dedicated IP |

### Email Deliverability En Iyi Uygulamalar

1. **Domain dogrulama (zorunlu):**
   - SPF record: `v=spf1 include:resend.com ~all`
   - DKIM: Resend dashboard'dan al
   - DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc@alliancearoma.com`

2. **Transactional vs Marketing ayirimi:**
   - Transactional: siparis onayi, sifre sifirlama, hesap dogrulama → `noreply@alliancearoma.com`
   - Marketing: bulten, kampanya, affiliate bildirimleri → `info@alliancearoma.com`
   - Farkli subdomain kullan: `mail.alliancearoma.com` vs `news.alliancearoma.com`

3. **Bounce/spam yonetimi:**
   - Hard bounce'lari otomatik listeden cikar
   - Unsubscribe linki zorunlu (marketing emaillerde)
   - Spam sikayeti oranini <%0.1 tut

4. **Dedicated IP (1000+ email/gun):**
   - IP warm-up sureci: 2-4 hafta
   - Baslangicta gunluk 50 → 100 → 200 → 500 → 1000 arttir
   - Ani yuksek hacim = spam filtrelerine takilir

---

## Affiliate Sistemi Ozel Notlar

### referrer_path Yapisi

Mevcut yapi: `/root_uuid/uuid2/uuid3/.../buyer_uuid`

- Her UUID = 36 karakter
- Ayirici `/` = 1 karakter
- Max 11 segment (10 ust + kendisi) = 11 * 37 = **407 karakter max**
- TEXT tipinde saklandigi icin boyut sorunu yok
- Ancak LIKE sorgusu buyuk tablolarda yavaslar → `text_pattern_ops` index kullan

### Komisyon Hesaplama Performansi

Mevcut `calculate_commissions()` fonksiyonu:
- Her siparis icin max 10 INSERT (sabit — kullanici sayisiyla BUYUMEZ)
- `referrer_path` string parse + loop = O(10)
- 100K kullanicida bile tek siparis icin komisyon hesaplama <10ms
- **SORUN DEGIL** — ama yogun trafik aninda DB yuku acisindan async yapmak iyi olur

### Network Tree Sorgusu Performansi

```sql
-- Bir affiliate'in direkt alt katmanini getir
SELECT * FROM profiles
WHERE referrer_id = 'affiliate-uuid';
-- Bu HIZLI (referrer_id index'li)

-- Bir affiliate'in TUM alt agacini getir (10 seviye)
SELECT * FROM profiles
WHERE referrer_path LIKE '/affiliate-uuid/%';
-- Bu 10K+ satirda YAVASLAR
-- Cozum 1: text_pattern_ops index (yukarida var)
-- Cozum 2: Sonucu cache'le (5 dk TTL)
-- Cozum 3: ltree extension kullan (ileri seviye)
```

### 10K+ Kullanicida Affiliate Optimizasyonlari

1. **Cache:** Affiliate dashboard verileri → KV/Redis (5 dk TTL)
2. **Materialized view:** `mv_affiliate_dashboard` (yukaridaki SQL)
3. **Async komisyon:** Stripe webhook → Cloudflare Queue → komisyon hesapla
4. **Batch payout:** Aylik toplu odeme islemi

```
Akis (simdiki):
  Stripe webhook → calculate_commissions() → DB INSERT (sync)

Akis (10K+ kullanici):
  Stripe webhook → Queue'ya ekle → Worker komisyon hesapla → DB INSERT
                                 → Affiliate'e bildirim gonder
```

5. **Network tree lazy loading:**
   - Ilk yuklemede sadece Level 1 (direkt referral'lar) goster
   - Alt seviyeleri tiklaninca yukle (expand on demand)
   - Tum agaci tek seferde yukleme

### Aylik Payout Islemi

```
Payout akisi:
1. Ayin 1'i: Onceki ayin komisyonlarini hesapla
2. Minimum odeme esigi kontrol (ornegin min 50 AED)
3. Affiliate'lerin banka/odeme bilgilerini dogrula
4. Toplu odeme olustur (Stripe Connect veya manuel)
5. Komisyon status'unu 'processing' → 'paid' yap
6. Affiliate'e email gonder (odeme yapildi)

Dikkat:
- Iptal edilen siparislerin komisyonlarini geri al (status = 'cancelled')
- Iade edilen siparisleri de kontrol et
- Odeme islemini transaction icinde yap (ya hepsi ya hicbiri)
```

---

## Maliyet Tahmini Ozeti

| Asama | Kullanici | Aylik Gelir (tahmini) | Aylik Infra Maliyeti | Kar Marji |
|-------|-----------|----------------------|---------------------|-----------|
| 1 | 0–100 | $0–500 | $0–5 | — |
| 2 | 100–1K | $500–5K | $5–50 | %95+ |
| 3 | 1K–10K | $5K–50K | $50–200 | %95+ |
| 4 | 10K–100K | $50K–500K | $200–2K | %95+ |
| 5 | 100K+ | $500K+ | $2K+ | %95+ |

> Not: Stripe komisyonu (%2.9 + 30c) bu tabloya dahil degil.
> SaaS/e-ticaret icin infra maliyeti genellikle gelirin %1-5'i olmali.

---

## Hizli Referans: Ne Zaman Ne Yap

```
[ ] 0 kullanici     → Deploy et, urun sat, hic optimize etme
[ ] 50 kullanici    → Workers Paid ($5) al (Error 1102 oluyorsa)
[ ] 100 kullanici   → UptimeRobot kur, temel monitoring
[ ] 200 kullanici   → Resend Pro ($20) upgrade (email limiti)
[ ] 500 kullanici   → DB index'lerini ekle, ISR/SSG aktif et
[ ] 1K kullanici    → Supabase Pro ($25), connection pooling
[ ] 2K kullanici    → KV cache ekle, rate limiting
[ ] 5K kullanici    → Sentry Team ($26), PostHog deger (limit kontrol)
[ ] 10K kullanici   → Read replica, materialized view, async komisyon
[ ] 25K kullanici   → Admin paneli ayir, 2FA, load testing
[ ] 50K kullanici   → Supabase Team veya self-hosted, partitioning
[ ] 100K kullanici  → Multi-region, dedicated ekip, compliance
```

---

## Son Notlar

1. **Erken optimizasyon yapma.** Asama 1'deyken Asama 4 sorunlarini cozmeye calisma. Oncelik: urun sat, musteriye deger kat.

2. **Monitoring'i erken kur.** Asama 2'de UptimeRobot + Sentry + PostHog aktif olmali. Sorunlari musterilerden once SEN gormelisin.

3. **Veritabani en kritik darbogazdir.** Connection limiti, yavas sorgular, disk dolmasi — bunlarin hepsi siteyi durdurur. DB'yi izle.

4. **Cache her seyi cozer.** Veritabani yavasliyor → once cache dene. KV/Redis ucuz ve etkili.

5. **Affiliate sistemi iyi tasarlanmis.** `referrer_path` yaklasimi 100K kullaniciya kadar recursive CTE'den daha performansli. Asil darbogas agac gorsellestirme sorgulari — onlari cache'le.

6. **Maliyet kontrolu.** Her yeni servis eklerken "bunu Free tier'da yapabilir miyim?" diye sor. Cogu zaman evet.

7. **Bu dokumani 3 ayda bir guncelle.** Supabase, Cloudflare, Resend fiyatlari ve limitleri degisiyor. Guncel tut.
