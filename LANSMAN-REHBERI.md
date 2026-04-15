# Lansman Rehberi — ENV Değerleri & Başlatma

Bu dosya 4 projeyi canlıya almak için gereken **tüm env değerlerini**, nereden alınacağını ve hangi sırayla başlatılacağını anlatır.

---

## Başlatma Sırası

```
Phase 1 (hemen):  getsmsnow.com  +  kart-site
Phase 2 (sonra):  embed-api  +  NyumatFlix (film sitesi)
```

Phase 1 projeleri bağımsız çalışır, dış bağımlılık yok.
Phase 2 projeleri Telegram content pipeline, R2 CDN ve torrent entegrasyonu gerektirir.

---

## Phase 1 — getsmsnow.com (SMS Sitesi)

**Dosya:** `getsmsnow.com/.env.local`
**Kopyala:** `cp getsmsnow.com/.env.example getsmsnow.com/.env.local`

| Değişken | Nereden alınır | Zorunlu mu? |
|----------|---------------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Kendi domain'in (ör. `https://getsmsnow.com`) | EVET |
| `AUTH_SECRET` | Terminal: `openssl rand -base64 32` | EVET |
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client ID | Opsiyonel (Google login istersen) |
| `GOOGLE_CLIENT_SECRET` | Aynı yer, Client ID'nin yanında | Opsiyonel |
| `NEXT_PUBLIC_TELEGRAM_BOT_NAME` | [@BotFather](https://t.me/BotFather) → `/newbot` → bot username | Opsiyonel (Telegram login istersen) |
| `TELEGRAM_BOT_TOKEN` | @BotFather → bot oluşturduktan sonra verdiği token | Opsiyonel |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys | EVET (email doğrulama için) |
| `RESEND_FROM` | Resend'de doğrulanmış domain veya `onboarding@resend.dev` (test) | EVET |
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) → Proje → Settings → API → URL | EVET |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` (secret) | EVET |
| `SMSPOOL_API_KEY` | [smspool.net](https://smspool.net) → Dashboard → API Keys | EVET (ana SMS sağlayıcı) |
| `SMSCODE_API_TOKEN` | [smscode.gg](https://smscode.gg) → Dashboard → API | Opsiyonel (yedek sağlayıcı) |
| `NOWPAYMENTS_API_KEY` | [nowpayments.io](https://nowpayments.io) → API Keys | EVET (kripto ödeme) |
| `NOWPAYMENTS_IPN_SECRET` | NOWPayments → Payment Settings → IPN Secret | EVET |
| `CRYPTOMUS_MERCHANT_ID` | [cryptomus.com](https://cryptomus.com) → Merchant → Dashboard | Opsiyonel (2. kripto sağlayıcı) |
| `CRYPTOMUS_API_KEY` | Cryptomus → API Settings | Opsiyonel |
| `PADDLE_API_KEY` | [developer.paddle.com](https://developer.paddle.com) | Opsiyonel (kart + PayPal) |
| `PADDLE_WEBHOOK_SECRET` | Paddle → Developer → Notifications | Opsiyonel |
| `PADDLE_ENV` | `sandbox` (test) veya `production` (canlı) | Opsiyonel |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle → Developer → Client Token | Opsiyonel |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → Add Site | Opsiyonel (CAPTCHA) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile → Site → Secret Key | Opsiyonel |

### Supabase Tablo Kurulumu

```sql
-- Supabase SQL Editor'de çalıştır:
-- getsmsnow.com/supabase/migrations/ altındaki tüm .sql dosyalarını sırayla çalıştır
```

### Başlatma

```bash
cd getsmsnow.com
cp .env.example .env.local
# ↑ değerleri doldur
npm install
npm run build
npm start
# veya Docker ile:
docker compose up sms -d
```

---

## Phase 1 — kart-site (No-KYC Kart Sitesi)

**Dosya:** `kart-site/.env.local`
**Kopyala:** `cp kart-site/.env.example kart-site/.env.local`

| Değişken | Nereden alınır | Zorunlu mu? |
|----------|---------------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Kendi domain'in (ör. `https://privacycards.com`) | EVET |
| `NEXT_PUBLIC_SITE_NAME` | Site adı (ör. `PrivacyCards`) | EVET |
| `AUTH_SECRET` | Terminal: `openssl rand -hex 32` | EVET |
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) → Proje → Settings → API → URL | EVET |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` (public) | EVET |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` (secret) | EVET |
| `WANTTOPAY_API_KEY` | [wanttopay.com](https://wanttopay.com) → API Dashboard | EVET (kart oluşturma) |
| `WANTTOPAY_API_URL` | `https://api.wanttopay.com/v1` (sabit) | EVET |
| `NOWPAYMENTS_API_KEY` | [nowpayments.io](https://nowpayments.io) → API Keys | EVET (kripto bakiye yükleme) |
| `NOWPAYMENTS_IPN_SECRET` | NOWPayments → Payment Settings → IPN | EVET |

### Supabase Tablo Kurulumu

```sql
-- Supabase SQL Editor'de çalıştır:
-- kart-site/supabase/migrations/ altındaki tüm .sql dosyalarını sırayla çalıştır
```

### Başlatma

```bash
cd kart-site
cp .env.example .env.local
# ↑ değerleri doldur
npm install
npm run build
npm start
# veya Docker ile:
docker compose up kart -d
```

---

## Phase 2 — embed-api (Embed Servisi)

**Dosya:** `embed-api/.env`
**Kopyala:** `cp embed-api/.env.example embed-api/.env`

| Değişken | Nereden alınır | Zorunlu mu? |
|----------|---------------|-------------|
| `PORT` | `3001` (sabit) | EVET |
| `HOST` | `0.0.0.0` (sabit) | EVET |
| `HMAC_SECRET` | Terminal: `openssl rand -hex 32` | EVET |
| `URL_TTL_SECONDS` | `7200` (varsayılan) | EVET |
| `ALLOWED_ORIGINS` | Film sitesinin URL'si (ör. `https://yourdomain.com`) | EVET |
| `EMBED_DOMAIN` | Embed için domain (ör. `embed.yourdomain.com`) | EVET |
| `SITE_DOMAIN` | Film sitesi domaini (ör. `yourdomain.com`) | EVET |
| `DATABASE_URL` | Docker'da otomatik set edilir; standalone'da PostgreSQL URI | EVET |
| `HLS_CACHE_PATH` | `/tmp/hls-cache` (varsayılan) | EVET |
| `TURNSTILE_SITE_KEY` | Cloudflare Turnstile | Opsiyonel |
| `TURNSTILE_SECRET` | Cloudflare Turnstile | Opsiyonel |
| `AD_VAST_URL` | VAST reklam sağlayıcından | Opsiyonel |
| `AD_BUMPER_ENABLED` | `true` / `false` | Opsiyonel |

### Phase 2 Ek Değişkenler (sonra doldurulacak)

| Değişken | Nereden alınır |
|----------|---------------|
| `TG_API_ID` + `TG_API_HASH` | [my.telegram.org](https://my.telegram.org) → API Development |
| `TG_SESSION` | MTProto client ile oluşturulur |
| `TG_CHANNEL_ID` | İçerik depolama kanalının ID'si |
| `CLOUDFLARE_R2_*` | [dash.cloudflare.com](https://dash.cloudflare.com) → R2 → API Tokens |
| `TMDB_API_KEY` | [themoviedb.org](https://www.themoviedb.org) → Settings → API |
| `TORRENT_PIPELINE_ENABLED` | `true` (aktif edince) |
| `REAL_DEBRID_API_KEY` | [real-debrid.com](https://real-debrid.com/apitoken) — €3/ay |

### Başlatma

```bash
cd embed-api
cp .env.example .env
# ↑ değerleri doldur
npm install
npm run build  # npx tsc
npm start
# veya Docker ile:
docker compose up embed db -d
```

---

## Phase 2 — NyumatFlix (Film Sitesi)

**Dosya:** `NyumatFlix/.env.local`
**Kopyala:** `cp NyumatFlix/.env.example NyumatFlix/.env.local`

| Değişken | Nereden alınır | Zorunlu mu? |
|----------|---------------|-------------|
| `TMDB_API_KEY` | [themoviedb.org](https://www.themoviedb.org) → Settings → API → API Key (v3) | EVET |
| `NEXT_PUBLIC_EMBED_API_URL` | Embed API'nin canlı URL'si (ör. `https://embed.yourdomain.com`) | EVET |
| `NEXT_PUBLIC_SITE_URL` | Film sitesinin URL'si (ör. `https://yourdomain.com`) | EVET |
| `NEXT_PUBLIC_AD_POP_ZONE` | Adsterra/HilltopAds pop-under zone ID | Opsiyonel |
| `NEXT_PUBLIC_AD_NATIVE_ZONE` | Adsterra/HilltopAds native banner zone ID | Opsiyonel |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) → API Keys | Opsiyonel (AI chatbot) |

### Başlatma

```bash
cd NyumatFlix
cp .env.example .env.local
# ↑ değerleri doldur
npm install --legacy-peer-deps
npm run build
npm start
# veya Docker ile:
docker compose up site embed db -d
```

---

## Tüm Sistemi Docker ile Başlatma

### Phase 1 (SMS + Kart)

```bash
# Root dizinde:
docker compose up sms kart db -d

# Kontrol:
docker compose ps
curl http://localhost:3003  # SMS sitesi
curl http://localhost:3002  # Kart sitesi
```

### Phase 1 + Phase 2 (Hepsi)

```bash
docker compose up -d

# Kontrol:
curl http://localhost:3000  # Film sitesi
curl http://localhost:3001  # Embed API
curl http://localhost:3002  # Kart sitesi
curl http://localhost:3003  # SMS sitesi
curl http://localhost:3010  # BomBom
curl http://localhost:3011  # WildOnes
```

### Oyunlar (her zaman hazır, env gerektirmez)

```bash
docker compose up bombom wildones chess-signal -d
```

---

## Domain + SSL (VPS'te)

```bash
# Nginx + Certbot kurulumu (VPS'te)
apt install nginx certbot python3-certbot-nginx

# Her site için Nginx config:
# /etc/nginx/sites-available/getsmsnow.com
server {
    server_name getsmsnow.com www.getsmsnow.com;
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# SSL:
certbot --nginx -d getsmsnow.com -d www.getsmsnow.com

# Aynısını diğer siteler için tekrarla:
# kart-site    → :3002
# NyumatFlix   → :3000
# embed-api    → :3001
```

---

## Hızlı Kontrol Listesi

- [ ] `getsmsnow.com/.env.local` — tüm EVET alanlar dolduruldu
- [ ] `kart-site/.env.local` — tüm EVET alanlar dolduruldu
- [ ] Supabase tabloları oluşturuldu (migration SQL'leri çalıştırıldı)
- [ ] `docker compose up sms kart db -d` çalışıyor
- [ ] Domain'ler DNS'e eklendi (Njalla/Cloudflare)
- [ ] Nginx reverse proxy ayarlandı
- [ ] SSL sertifikaları alındı (certbot)
- [ ] Phase 2: `embed-api/.env` dolduruldu
- [ ] Phase 2: `NyumatFlix/.env.local` dolduruldu
- [ ] Phase 2: `docker compose up -d` ile hepsi çalışıyor
