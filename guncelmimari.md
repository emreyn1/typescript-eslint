# Güncel Mimari — Film Sitesi Stack

Son güncelleme: Mayıs 2026

---

## 1. Genel Akış

```
Kullanıcı (tarayıcı)
  │
  ▼
NyumatFlix  (Next.js 15 · port 3000 · Vercel veya Docker)
  │  TMDB API → film/dizi metadata, poster, liste
  │
  ├── Server 1 (kendi altyapısı) ──────────────────────────────┐
  │     iframe src="https://embed.domain.com/watch/movie/:id"  │
  │                                                            │
  │                                           embed-api        │
  │                                           (Fastify · 3001) │
  │                                                ↓           │
  │                                           cinepro          │
  │                                           (OMSS · 3000)    │
  │                                                ↓           │
  │                                           13 provider      │
  │                                           → m3u8 URL       │
  │                                                ↓           │
  │                                           player-v3.html   │
  │                                           (temiz, REKLAMSIZ)│
  │                                                            │
  ├── Server 2 · vsrc.su (VidSrc) ─── harici iframe           │
  ├── Server 3 · player.autoembed.cc ─ harici iframe           │
  ├── Server 4 · multiembed.mov ────── harici iframe           │
  └── Server 5 · vidnest.fun ──────── harici iframe           ─┘
```

---

## 2. Servisler

### 2.1 NyumatFlix (Frontend)
| Özellik | Değer |
|---|---|
| Framework | Next.js 15 (App Router) |
| Paket yöneticisi | Bun |
| UI | Tailwind + Radix UI + shadcn |
| Auth | NextAuth v5 — Resend magic link (email) |
| DB | Neon Postgres (serverless) + Drizzle ORM |
| Deploy | Vercel (standalone output) veya Docker |
| Port | 3000 |

**Sayfalar:**
- `/` Home, trending, öneriler
- `/movies/browse`, `/tvshows` — Keşfet
- `/search` — Arama
- `/watch/movie/[id]` — Film izle
- `/watch/tv/[id]` — Dizi izle
- `/vip` — VIP üyelik
- `/referral` — Referral sistemi
- `/playground` — Test sayfası

**DB tabloları:**
- `user`, `account`, `session`, `verificationToken` (NextAuth standart)
- VIP ve referral için ek API route'ları (`/api/vip`, `/api/referral`)

**Kritik ENV:**
```
TMDB_API_KEY=
NEXT_PUBLIC_EMBED_API_URL=https://embed.siteadin.com   # ← prod'da localhost değil!
NEXT_PUBLIC_SITE_URL=https://siteadin.com
AUTH_SECRET=          # openssl rand -hex 32
AUTH_RESEND_KEY=      # resend.com API key
DATABASE_URL=         # neon.tech connection string (dev)
PROD_DATABASE_URL=    # neon.tech connection string (prod)
```

---

### 2.2 embed-api (Embed Backend)
| Özellik | Değer |
|---|---|
| Framework | Fastify 5 |
| Dil | TypeScript (ESM) |
| Port | 3001 |
| Deploy | Docker (127.0.0.1:3001, Nginx arkasında) |

**Route'lar:**
| Endpoint | Açıklama |
|---|---|
| `GET /watch/movie/:tmdbId` | cinepro → HTML player döner |
| `GET /watch/tv/:tmdbId/:season/:episode` | cinepro → HTML player döner |
| `GET /api/v1/cinepro/sources` | JSON — tüm kaynakları döner |
| `GET /embed/movie/:tmdbId` | HLS pipeline (Phase 2 — torrent) |
| `GET /embed/tv/:tmdbId/:season/:episode` | HLS pipeline (Phase 2) |
| `GET /hls/*` | HLS proxy/cache |
| `GET /api/*` | Genel API (watchlist, analytics) |
| `GET /` | Site route (opsiyonel) |

**Güvenlik:**
- Cloudflare Turnstile (opsiyonel — `TURNSTILE_SECRET`)
- HMAC imzalı URL'ler (`HMAC_SECRET`, TTL: 2 saat)
- Canvas fingerprint + anti-debug script (player içinde)
- Rate limit: 120 istek/dakika (IP bazlı, CF-Connecting-IP aware)
- `X-Frame-Options: ALLOWALL` (iframe kullanımı için)
- `Server: nginx` spoof

**Player (player-v3.html):**
- Sıfırdan yazılmış temiz HTML5 video player
- HLS.js ile m3u8 oynatma
- Kalite seçici (otomatik + manuel)
- Kaynak seçici (birden fazla provider varsa)
- VAST reklam desteği **opsiyonel** (`AD_VAST_URL` boşsa reklam YOK)
- Bumper reklam (`AD_BUMPER_ENABLED=false` varsayılan)

**Kritik ENV:**
```
PORT=3001
HOST=0.0.0.0
HMAC_SECRET=          # openssl rand -hex 32
ALLOWED_ORIGINS=https://siteadin.com
EMBED_DOMAIN=embed.siteadin.com
SITE_DOMAIN=siteadin.com
DATABASE_URL=postgresql://...
CINEPRO_URL=http://cinepro:3000   # docker-compose service adı
# Opsiyonel Phase 2:
TORRENT_PIPELINE_ENABLED=false
REAL_DEBRID_API_KEY=
TG_API_ID=
TG_API_HASH=
TG_SESSION=
CLOUDFLARE_R2_BUCKET=
```

---

### 2.3 cinepro (Scraper Backend)
| Özellik | Değer |
|---|---|
| Framework | @omss/framework |
| Dil | TypeScript (ESM) |
| Port | 3000 |
| Deploy | Docker (127.0.0.1:3000, sadece embed-api erişir) |

**Ne yapar:**
- Film/dizi sitelerini scrape eder → doğrudan m3u8/mp4 URL döner
- TMDB ID alır, provider'ları paralel sorgular
- Source URL'leri kendi proxy'sinden geçirir (header injection için)
- Üçüncü taraf proxy wrapper'larını çözer (thirdPartyProxies.ts)
- Sonuçları memory cache'e atar (TTL: 1 saat), Redis opsiyonel

**API:**
```
GET /v1/movies/:tmdbId
GET /v1/tv/:tmdbId/seasons/:season/episodes/:episode
GET /health
```

**Aktif Provider'lar (13 adet):**
| Provider | Base URL | İçerik |
|---|---|---|
| VidSrc | vsembed.ru | Film + Dizi |
| Icefy | streams.icefy.top | Film + Dizi |
| Peachify | — | Film + Dizi |
| VidNest | — | Film + Dizi |
| VidRock | — | Film + Dizi |
| Popr | — | Film + Dizi |
| VixSrc | — | Film + Dizi |
| VidZee | — | Film + Dizi |
| StreamMafia | workers.dev proxy | Film + Dizi |
| CineSu | — | Film + Dizi |
| RGShows | — | Film + Dizi |
| FMovies4U | — | Film + Dizi |
| 02MovieDownloader | — | Film + Dizi |

**Proxy Pattern Çözücü (thirdPartyProxies.ts):**
- Bazı provider'lar URL'i proxy wrapper'ına sarıyor
- Örn: `https://hlsproxy3.asiaflix.net/m3u8-proxy?url=https%3A%2F%2Freal-server.com%2Fvideo.m3u8`
- Çözücü bu wrapper'ı kaldırır, asıl URL'i alır
- Bilinen wrapper'lar: hls1.vid1.site, madplay.site, hlsproxy3.asiaflix.net, streams.smashystream.top
- Wildcard pattern'lar tüm workers.dev proxy'lerini kapsar

**streamPatterns.ts:**
- Framework'e "bu domain'leri stream URL olarak işle" der
- pixeldrain, wasabisys, hakunaymatata, streamflixserver, workers.dev vb.

**Kritik ENV:**
```
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
TMDB_API_KEY=           # ZORUNLU — bu olmadan hiçbir şey çalışmaz
CORS_ORIGIN=http://embed-api:3001
CACHE_TYPE=memory       # prod'da redis önerilir
```

---

## 3. Reklam Durumu

### Server 1 (cinepro + embed-api + kendi player'ımız)
**Tamamen reklamsız.**
- Cinepro provider'lar sadece ham m3u8/mp4 URL çeker — kaynak sitenin kendi player'ı (ve reklamları) hiç açılmaz
- Kaynak sitenin embed iframe'i yerine doğrudan stream URL'i alınıyor
- Kendi player'ımız (player-v3.html) temiz, sıfırdan yazılmış
- VAST desteği var ama `AD_VAST_URL` boş bırakılırsa reklam çalmaz
- AD_BUMPER varsayılan olarak kapalı (`AD_BUMPER_ENABLED=false`)

### Server 2-5 (üçüncü taraf iframeler)
**Harici sitenin kendi reklamları gelebilir.**
- vidsrc, autoembed, multiembed, vidnest siteleri kendi iframelerini gönderir
- Bu iframelerin içindeki reklamlar bizim kontrolümüzde değil
- Kullanıcı Server 1'de (kendi altyapımızda) izlerse sıfır reklam görür

---

## 4. Docker Compose

```yaml
# /embed-analyzer/docker-compose.yml (mevcut)
services:
  cinepro:          # scraper — port 3000 (sadece iç ağ)
  embed-api:        # embed backend — port 3001 (sadece iç ağ)
```

**Eksik (eklenmesi gereken):**
```yaml
  nyumatflix:       # frontend — port 3002
  postgres:         # embed-api DB — port 5432 (sadece iç ağ)
  redis:            # cinepro cache (opsiyonel)
```

NyumatFlix için alternatif: **Vercel'e deploy et** (daha kolay, ücretsiz tier yeterli)

---

## 5. Bağlantı Şeması (Production)

```
İnternet
  │
  ▼
Cloudflare (DNS + DDoS koruması)
  │
  ▼
VPS / Nginx (SSL termination, reverse proxy)
  ├── siteadin.com      → NyumatFlix :3000 (veya Vercel'e yönlendirme)
  ├── embed.siteadin.com → embed-api :3001
  └── (cinepro :3000 — sadece iç ağ, dışarı kapalı)
  │
  ▼
Docker Compose (internal bridge network)
  ├── cinepro    (127.0.0.1:3000)
  ├── embed-api  (127.0.0.1:3001)
  ├── postgres   (127.0.0.1:5432)
  └── redis      (127.0.0.1:6379) — opsiyonel
```

---

## 6. Deploy Öncelik Sırası

1. **TMDB API key** al → `cinepro/.env`'e yaz
2. **Neon Postgres** hesabı aç → NyumatFlix `DATABASE_URL` + `PROD_DATABASE_URL`
3. **Resend** hesabı aç → `AUTH_RESEND_KEY` (email magic link)
4. **`AUTH_SECRET`** üret: `openssl rand -hex 32`
5. **`HMAC_SECRET`** üret: `openssl rand -hex 32`
6. **Production URL'leri** güncelle: `NEXT_PUBLIC_EMBED_API_URL=https://embed.siteadin.com`
7. **Drizzle migration** çalıştır: `cd NyumatFlix && npx drizzle-kit push`
8. **Docker Compose** ayağa kaldır: `docker compose up -d`
9. **NyumatFlix** deploy: Vercel'e push (veya compose'a ekle)
10. **Nginx** yapılandır: `siteadin.com` → 3000, `embed.siteadin.com` → 3001

---

## 7. Önemli Dosyalar

| Dosya | Ne İşe Yarar |
|---|---|
| `embed-api/src/config.ts` | Tüm env değişkenleri tek yerden |
| `embed-api/src/cinepro/client.ts` | cinepro'ya HTTP çağrı, source seçimi |
| `embed-api/src/player/player-v3.html` | Kendi HTML5 player'ımız |
| `embed-api/src/protection/fingerprint.ts` | Canvas fingerprint kodu |
| `cinepro/src/thirdPartyProxies.ts` | Proxy wrapper çözücüler |
| `cinepro/src/streamPatterns.ts` | Stream URL pattern'ları |
| `NyumatFlix/lib/stores/server-store.ts` | Server 1-5 tanımları + seçim mantığı |
| `NyumatFlix/db/schema.ts` | Neon Postgres şeması (Drizzle) |
| `NyumatFlix/auth.ts` | NextAuth — Resend magic link |
| `docker-compose.yml` | cinepro + embed-api (NyumatFlix eksik) |
| `DEPLOY-REHBERI.md` | VPS, Nginx, OPSEC tam rehber |
