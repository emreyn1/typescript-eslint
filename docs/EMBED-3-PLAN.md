# NyumatFlix / embed-api — 3 Üretim Planı

> Bu belge 3 farklı deploy stratejisini karşılaştırır.
> Her plan bağımsız çalışır, birbirinin ön koşulu DEĞİLDİR.
> Kararı verdikten sonra sadece o planın iş listesini takip et.

---

## HIZLI KARŞILAŞTIRMA

```
                   PLAN D              PLAN E              PLAN F
                   CinePro Scraper     Proxy Streamer      Hybrid God Mode
─────────────────────────────────────────────────────────────────────────────
Bütçe (aylık)      $6-12               $20-30              $50-80
Kurulum süresi     3-5 gün             10-14 gün           25-40 gün
İlk gelir          Ay 2                Ay 3                Ay 4-5
Ay 12 gelir        $800-3000           $1000-3000          $3000-8000
Bakım              Haftada 1 saat      Haftada 2-3 saat    Haftada 8-12 saat
Scraping riski     CinePro üstlenir    RD üstlenir         Sen üstlenirsin
İçerik kontrolü    Yok (3. parti)      Orta (cache)        Tam (kendi HLS)
Reklam kontrolü    Tam                 Tam                 Tam
OPSEC seviyesi     Düşük-orta          Orta                Yüksek gerektirir
Mevcut kod         %85 hazır           %70 hazır           %40 hazır
```

---

## PLAN D — CinePro Scraper (YENİ, ÖNERİLEN)

### Nedir?

CinePro açık kaynak scraper'ı 10 farklı embed provider'dan (VidSrc, StreamMafia, VidRock, Vidzee, VixSrc, vb.) gerçek video URL'lerini çeker. Sen sadece proxy yaparsın — video dosyalarını host etmezsin.

### Neden en iyi başlangıç?

1. **Video host etmiyorsun** → DMCA riski minimun (sen sadece index/proxy)
2. **10 provider** → biri düşerse 9'u devam eder
3. **Sıfır ek maliyet** → CinePro ücretsiz, sadece VPS lazım
4. **Kod %85 hazır** → `embed-api` + `cinepro` entegre edildi
5. **Reklam geliri tamamen sende** → iframe değil, kendi player'ın

### Mimari

```
Kullanıcı → NyumatFlix UI (Next.js)
         → embed-api /watch/movie/27205
         → CinePro API → 10 provider'dan kaynak toplar
         → En iyi kaynağı seçer (HLS 1080p tercih)
         → player-v3.html ile oynatır (kendi domain'inden)
         → Pop-under + VAST pre-roll reklam
```

### Tech Stack

```
Frontend:        Next.js 15 + Tailwind + shadcn/ui
Embed Backend:   Fastify 5 (embed-api) — port 3001
Scraper:         CinePro Core (OMSS framework) — port 3000
Player:          player-v3.html (hls.js + custom controls)
Reklam:          Adsterra pop-under + VAST pre-roll (Google IMA)
VPS:             Hetzner CX11 ($5/ay)
Domain:          Njalla ($15/yıl, XMR)
CDN:             Cloudflare Free (orange cloud ON)
```

### Entegre Edilen Dosyalar

```
YENİ:
  embed-api/src/cinepro/client.ts      CinePro API istemcisi
  embed-api/src/routes/cinepro.ts      /watch/* ve /api/v1/cinepro/* route'ları
  embed-api/src/player/player-v3.html  Modern player (çoklu kaynak, kalite seçici)

DEĞİŞTİRİLEN:
  embed-api/src/config.ts              CINEPRO_URL eklendi
  embed-api/src/server.ts              cineproRoutes register edildi
  embed-api/.env.example               CINEPRO_URL eklendi
```

### API Endpoint'leri

```
GET /watch/movie/:tmdbId                    Player HTML (otomatik en iyi kaynak)
GET /watch/tv/:tmdbId/:season/:episode      Player HTML (dizi)
GET /api/v1/cinepro/sources?tmdb=27205      JSON: tüm kaynaklar + en iyi seçim
GET /api/v1/cinepro/sources?tmdb=1396&type=tv&s=1&e=1   JSON: dizi kaynakları
```

### İş Listesi (3-5 gün)

```
GÜN 1: Ortam Kurulumu
  □ Hetzner CX11 VPS sipariş ($5/ay)
  □ Njalla domain al (XMR ile)
  □ Cloudflare'e domain ekle (orange cloud ON)
  □ VPS'e Docker + Docker Compose kur
  □ openssl rand -hex 32 → HMAC_SECRET

GÜN 2: Deploy
  □ cinepro/.env doldur (TMDB_API_KEY)
  □ embed-api/.env doldur (tüm key'ler)
  □ docker-compose.yml hazırla (cinepro + embed-api + postgres)
  □ SSL sertifika (Cloudflare flexible veya Let's Encrypt)
  □ Nginx reverse proxy (embed.domain.com → :3001, api → :3000)

GÜN 3: Reklam Entegrasyonu
  □ Adsterra hesap aç → zone al → pop-under script
  □ HilltopAds VAST tag al → player-v3.html'e ekle
  □ Pop-under script'i site layout'a inject et

GÜN 4: Test & SEO
  □ 20 popüler film test (Inception, Fight Club, Interstellar...)
  □ 5 popüler dizi test (Breaking Bad, The Office, Game of Thrones...)
  □ Kırık kaynak varsa provider'ı geçici disable et
  □ sitemap.xml, robots.txt, meta taglar
  □ Google Search Console kayıt

GÜN 5: Monitoring & Launch
  □ UptimeRobot: CinePro + embed-api health check
  □ Cloudflare analytics aktif
  □ İlk 100 popüler film URL'lerini warm-up et
  □ Reddit/Telegram/Discord'da tanıtım
```

### Maliyet

```
Hetzner CX11            $5/ay
Domain (Njalla)          $1.25/ay ($15/yıl)
Cloudflare               $0 (free)
CinePro                  $0 (open source)
Adsterra                 $0 (reklam geliri)
────────────────────────────────
TOPLAM                   ~$6.25/ay
```

### Gelir Tahmini

```
Ay 2   (2K ziyaret/gün):    $30-100/ay
Ay 4   (8K ziyaret/gün):    $200-600/ay
Ay 8   (25K ziyaret/gün):   $500-1500/ay
Ay 12  (50K ziyaret/gün):   $800-3000/ay
```

### Riskler & Çözümleri

| Risk | Olasılık | Çözüm |
|------|----------|-------|
| CinePro provider kırılması | Orta | 10 provider var, 1-2 düşse bile devam |
| Upstream site yapı değişikliği | Orta | CinePro community güncellemelerini takip et |
| DMCA | Düşük | Video host etmiyorsun, domain rotate et |
| Cloudflare abuse report | Düşük | Njalla sahte kimlik istemiyor |

---

## PLAN E — Proxy Streamer (Mevcut Kod = "Lean Startup" Temizlenmiş)

### Nedir?

YTS/EZTV torrent sitelerinden magnet link bul → Real-Debrid ile indir → ffmpeg ile HLS'e dönüştür → kendi CDN'inden serve et. Tam kontrol, ama sen video host ediyorsun.

### Mimari

```
Kullanıcı → NyumatFlix UI
         → embed-api /embed/movie/27205
         → pipeline/catalog.ts: cache var mı?
           ├─ EVET → HLS serve (anlık)
           └─ HAYIR → torrent.ts (YTS API → magnet)
                    → Real-Debrid unrestrict → HTTP URL
                    → remux.ts (ffmpeg → HLS .ts segmentler)
                    → Cloudflare R2 upload VEYA lokal disk
                    → player-v2.html ile oynat
         → Adsterra pop-under + VAST pre-roll
```

### Tech Stack

```
Frontend:        Next.js 15 + Tailwind
Embed Backend:   Fastify 5 (embed-api)
Pipeline:        torrent.ts → remux.ts → catalog.ts
Player:          player-v2.html (hls.js + Plyr)
CDN:             Cloudflare R2 ($0.015/GB, egress free)
Debrid:          Real-Debrid ($3/ay, kripto, KYC yok)
VPS:             Hetzner CX21 ($7/ay, daha fazla disk)
```

### Mevcut Koddan Kullanılanlar

```
KULLANILIR:
  pipeline/torrent.ts     %90 (webtorrent fallback eksik → RD zorunlu yap)
  pipeline/remux.ts       %100
  pipeline/catalog.ts     %100 (TORRENT_PIPELINE_ENABLED=true yap)
  db/index.ts             %100 (content_cache)
  cdn/cloudflare.ts       %100 (R2 upload)
  routes/embed.ts         %100
  routes/hls.ts           %100
  player/player-v2.html   %100 (VAST ekle)
  protection/*            %100

EKSİK (YAZILACAK):
  - Pre-cache worker (popüler 500 film cron job)
  - 1337x scraper (YTS+EZTV'ye ek)
  - RD hesap rotation (tek hesap → 3 hesap)
  - VAST tag entegrasyonu (player-v2.html)
  - Monitoring (scraper + RD health)
```

### İş Listesi (10-14 gün)

```
HAFTA 1:
  □ Gün 1-2: Ortam kurulumu (VPS, domain, R2, RD hesap)
  □ Gün 3-4: pipeline/ düzeltmeleri + TORRENT_PIPELINE_ENABLED=true
  □ Gün 5: Pre-cache worker (TMDB trending → RD → HLS → R2)

HAFTA 2:
  □ Gün 6-7: Reklam entegrasyonu (pop-under + VAST)
  □ Gün 8-9: Docker compose deploy + SSL + Nginx
  □ Gün 10-11: 30 film + 10 dizi test
  □ Gün 12-14: Bug fix + monitoring + SEO
```

### Maliyet

```
Hetzner CX21             $7/ay
Real-Debrid              $3/ay
Cloudflare R2 (100 film) $5/ay
Domain (Njalla)          $1.25/ay
────────────────────────────────
MİNİMUM                  ~$16/ay

Ölçekli (+2 RD, 1337x proxy):
────────────────────────────────
TOPLAM                   ~$28/ay
```

### Gelir Tahmini

```
Ay 3   (5K ziyaret/gün):     $200-600/ay
Ay 6   (15K ziyaret/gün):    $500-1500/ay
Ay 12  (40K ziyaret/gün):    $1000-3000/ay
```

### Riskler

| Risk | Olasılık | Çözüm |
|------|----------|-------|
| RD hesap ban | Düşük | 3 hesap rotation, tek VPS IP |
| DMCA (video host) | Orta | Domain rotate, R2 content takedown |
| ffmpeg yük (100 concurrent) | Orta | Pre-cache ile %90 trafiği cache'den serve et |
| R2 maliyet patlaması | Düşük | TTL + auto-delete eski içerik |

---

## PLAN F — Hybrid God Mode (CinePro + RD + Telegram)

### Nedir?

CinePro scraping + Real-Debrid torrent pipeline + Telegram exclusive içerik. 3 katmanlı fallback zinciri. En güçlü ama en karmaşık plan.

### Mimari

```
Kullanıcı → embed-api

Öncelik 1: Cache (R2/lokal) → anlık HLS serve
    ↓ yoksa
Öncelik 2: CinePro scraper → 10 provider → proxy stream
    ↓ scraper başarısızsa
Öncelik 3: RD + torrent → ffmpeg → HLS → cache
    ↓ torrent yoksa
Öncelik 4: Telegram exclusive (premium kullanıcı)
    ↓ hiçbiri yoksa
"Content Unavailable"
```

### Tech Stack

```
Frontend:        Next.js 15 + Tailwind + shadcn/ui
Embed Backend:   Fastify 5 (embed-api) — tüm route'lar aktif
Scraper:         CinePro Core (10 provider)
Pipeline:        torrent.ts + remux.ts + catalog.ts
Storage:         Cloudflare R2 + Telegram channel
Player:          player-v3.html (multi-source, kalite seçici)
CDN:             Cloudflare Free + R2
Debrid:          Real-Debrid × 3 ($9/ay)
VPS:             Hetzner CX31 ($15/ay, 80GB disk)
Domain:          Njalla ($15/yıl)
Proxy:           IPRoyal residential ($25/ay, scraping için)
VPN:             Mullvad ($5/ay, VPS'te WireGuard)
```

### Mevcut Koddan Kullanılanlar

```
PLAN D'nin tamamı:
  + cinepro/client.ts
  + routes/cinepro.ts
  + player/player-v3.html

PLAN E'nin tamamı:
  + pipeline/*
  + cdn/cloudflare.ts
  + routes/hls.ts

EK:
  + telegram/client.ts (exclusive içerik)
  + providers/index.ts (son fallback: iframe)
  + protection/* (fingerprint, anti-debug)
  + ads/bumper.ts (VAST entegrasyonu)

YENİ YAZILACAK:
  □ src/orchestrator.ts — 4 katmanlı fallback zinciri yöneticisi
  □ src/monitoring/health.ts — provider + RD + CinePro sağlık skorları
  □ src/admin/panel.ts — basit admin arayüzü (/admin/*)
  □ Pre-cache worker (cron, TMDB trending)
  □ Telegram session setup script
```

### İş Listesi (25-40 gün)

```
HAFTA 1: Plan D (CinePro baseline)
  □ Gün 1-5: Plan D'nin tamamını deploy et

HAFTA 2: Plan E katmanı
  □ Gün 6-7: RD hesap × 3 aç, pipeline/ aktif et
  □ Gün 8-9: Pre-cache worker (500 film)
  □ Gün 10: R2 upload + segment serve

HAFTA 3: Orchestrator + Fallback
  □ Gün 11-13: orchestrator.ts (cache → CinePro → RD → Telegram → iframe)
  □ Gün 14-15: Her katmanın timeout ve fallback davranışı test

HAFTA 4: Telegram + Premium
  □ Gün 16-17: Telegram session + channel kurulumu
  □ Gün 18-19: Premium kullanıcı ayrımı (coin sistemi genişlet)
  □ Gün 20: Exclusive içerik upload akışı

HAFTA 5: Reklam + Monitoring + OPSEC
  □ Gün 21-22: Çoklu reklam katmanı (pop-under + VAST + banner)
  □ Gün 23-24: Monitoring dashboard (/admin/*)
  □ Gün 25-26: OPSEC sertleştirme (Mullvad, residential proxy, ayrı kimlik)
  □ Gün 27-30: Kapsamlı test + bug fix + SEO

HAFTA 6+: Optimizasyon
  □ Domain rotation havuzu (3 domain)
  □ A/B test reklam yerleşimi
  □ Scraper sağlık auto-disable
  □ CDN edge caching
```

### Maliyet

```
Hetzner CX31              $15/ay
Real-Debrid × 3           $9/ay
Cloudflare R2              $10/ay
Domain (Njalla)            $1.25/ay
IPRoyal residential        $25/ay
Mullvad VPN                $5/ay
────────────────────────────────
TOPLAM                     ~$65/ay
```

### Gelir Tahmini

```
Ay 4   (10K ziyaret/gün):    $400-1000/ay
Ay 6   (30K ziyaret/gün):    $1500-3000/ay
Ay 12  (80K ziyaret/gün):    $3000-8000/ay
```

### Riskler

| Risk | Olasılık | Çözüm |
|------|----------|-------|
| Yüksek bakım yükü | Kesin | Haftada 8-12 saat ayır veya eleman |
| DMCA (video host) | Yüksek | 3 domain rotation, R2 auto-purge |
| Scraper kırılması | Orta | 10 CinePro provider + RD fallback |
| RD toplu ban | Düşük | 3 hesap, farklı email/ödeme |
| Reklam ağı hesap kapatma | Orta | 2. reklam ağı yedek (HilltopAds) |

---

## KARAR AĞACI

```
Ne kadar zamanın var?
├─ 1 hafta → PLAN D (CinePro)
├─ 2 hafta → PLAN E (Proxy Streamer)
└─ 1+ ay   → PLAN F (Hybrid)

Risk toleransın?
├─ "DMCA gelirse kapatırım"      → PLAN D
├─ "Domain rotate ederim"        → PLAN E
└─ "Ayrı kimlikle yürütürüm"    → PLAN F

Bakıma vakit?
├─ Haftada < 2 saat              → PLAN D
├─ Haftada 2-3 saat              → PLAN E
└─ Haftada 8+ saat               → PLAN F

Emin değilim?
→ PLAN D'den başla
→ Trafik $500/ay'ı geçince PLAN E'ye yükselt
→ $2000/ay'ı geçince PLAN F'ye geç
```

---

## KOD HARİTASI — HER PLANDA HANGİ DOSYA AKTİF?

```
DOSYA                           PLAN D    PLAN E    PLAN F
─────────────────────────────────────────────────────────
cinepro/client.ts               AKTİF     -         AKTİF
routes/cinepro.ts               AKTİF     -         AKTİF
player/player-v3.html           AKTİF     -         AKTİF
providers/index.ts              -         fallback  fallback
pipeline/torrent.ts             -         AKTİF     AKTİF
pipeline/remux.ts               -         AKTİF     AKTİF
pipeline/catalog.ts             -         AKTİF     AKTİF
cdn/cloudflare.ts               -         AKTİF     AKTİF
telegram/client.ts              -         -         AKTİF
routes/embed.ts                 -         AKTİF     AKTİF
routes/hls.ts                   -         AKTİF     AKTİF
player/player-v2.html           -         AKTİF     fallback
protection/*                    AKTİF     AKTİF     AKTİF
ads/bumper.ts                   stub      VAST      VAST
db/index.ts                     kısmi     AKTİF     AKTİF
config.ts                       AKTİF     AKTİF     AKTİF
server.ts                       AKTİF     AKTİF     AKTİF
```

---

**Tavsiye: PLAN D ile başla. 3-5 günde canlıya çık, gelir gelmeye başlasın, sonra ölçekle.**
