# Kurulum Rehberi — Film Sitesi + Embed Servisi

> Sıfırdan production'a kadar adım adım. İki yöntem: Lokal geliştirme ve VPS deploy.

---

## Ön Gereksinimler

```
Lokal geliştirme için:
  ✓ Node.js 20+ (https://nodejs.org)
  ✓ Git
  ✓ PostgreSQL (lokal veya Docker ile)
  ✓ Bir kod editörü (Cursor, VS Code, vb.)

VPS deploy için (ek olarak):
  ✓ AlexHost VPS (veya benzeri) — Ubuntu 22.04+
  ✓ 2 domain (biri site, biri embed) — Njalla ile al, kripto ile öde
  ✓ Cloudflare hesabı (ücretsiz)
  ✓ Docker + Docker Compose (VPS'e kurulacak)
```

---

## BÖLÜM A: Lokal Geliştirme (kendi bilgisayarında test)

### Adım 1: Proje dosyalarını hazırla

```bash
cd /Users/eceseckin/embed-analyzer
```

Proje yapın zaten şu şekilde:
```
embed-analyzer/
├── NyumatFlix/        ← Film sitesi (Next.js)
├── embed-api/         ← Embed servisi (Fastify)
└── docker-compose.yml ← İkisini birlikte çalıştır
```

### Adım 2: TMDB API key al

```
1. https://www.themoviedb.org/signup adresinden hesap aç
2. https://www.themoviedb.org/settings/api adresine git
3. "API Key (v3 auth)" bölümündeki key'i kopyala
4. Bu key ücretsiz, kredi kartı gerektirmez
```

### Adım 3: Embed servisi kur ve çalıştır

```bash
# 3a. embed-api klasörüne gir
cd embed-api

# 3b. Bağımlılıkları kur
npm install

# 3c. .env dosyasını oluştur
cp .env.example .env

# 3d. HMAC secret üret ve .env'e yaz
# macOS/Linux:
echo "HMAC_SECRET=$(openssl rand -hex 32)" >> .env

# 3e. Geliştirme modunda başlat
npm run dev
```

Başarılı çıktı:
```
Embed API running on http://0.0.0.0:3001
```

Test et (yeni terminal aç):
```bash
# API test — Fight Club (TMDB ID: 550)
curl "http://localhost:3001/api/v1/sources?tmdb=550"

# Beklenen çıktı:
# {"sources":[{"id":"vidsrc","name":"VidSrc"},...],"token":"...","count":5}

# Player test — tarayıcıda aç:
# http://localhost:3001/embed/movie/550

# Landing page test:
# http://localhost:3001/
```

### Adım 4: PostgreSQL kur

```bash
# Yöntem A: Docker ile (önerilen)
docker run -d \
  --name streamvault-db \
  -e POSTGRES_DB=streamvault \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine

# Yöntem B: Homebrew ile (macOS)
brew install postgresql@16
brew services start postgresql@16
createdb streamvault
```

### Adım 5: Film sitesini kur ve çalıştır

```bash
# 5a. NyumatFlix klasörüne gir
cd ../NyumatFlix

# 5b. Bağımlılıkları kur (bun veya npm)
# Bun ile (hızlı):
bun install
# veya npm ile:
npm install

# 5c. .env.local dosyasını oluştur
cp .env.example .env.local

# 5d. .env.local dosyasını düzenle — şu değerleri doldur:
```

`.env.local` dosyasında doldurulacak değerler:
```env
# ZORUNLU — Adım 2'de aldığın TMDB key
TMDB_API_KEY=buraya_tmdb_keyini_yaz

# ZORUNLU — rastgele secret üret
AUTH_SECRET=buraya_openssl_rand_hex_32_yaz

# Veritabanı — Adım 4'teki PostgreSQL
DATABASE_URL=postgres://postgres:postgres@localhost:5432/streamvault

# Branding — istediğin ismi yaz
NEXT_PUBLIC_SITE_NAME=StreamVault
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Embed servisi — Adım 3'te başlattığın
NEXT_PUBLIC_EMBED_API_URL=http://localhost:3001

# Resend — şimdilik boş bırak, login çalışmaz ama site çalışır
AUTH_RESEND_KEY=
AUTH_URL=http://localhost:3000
```

```bash
# 5e. Secret üret
openssl rand -hex 32
# Çıkan değeri .env.local'deki AUTH_SECRET'a yapıştır

# 5f. Veritabanı tablolarını oluştur
npx drizzle-kit push

# 5g. Geliştirme modunda başlat
bun run dev
# veya: npm run dev
```

Başarılı çıktı:
```
▲ Next.js 15.x.x (Turbopack)
- Local: http://localhost:3000
```

### Adım 6: Test et

```
Tarayıcıda aç: http://localhost:3000

Kontrol listesi:
  ✓ Ana sayfa açılıyor, filmler görünüyor
  ✓ Bir filme tıkla → detay sayfası açılıyor
  ✓ "Watch" butonuna tıkla → video player açılıyor
  ✓ Player'da "Server 1" seçili → kendi embed servisinden geliyor
  ✓ Server 2, 3, 4, 5 → upstream provider'lardan geliyor
  ✓ http://localhost:3001/ → embed servis landing page açılıyor
  ✓ http://localhost:3001/embed/movie/550 → Fight Club player açılıyor
```

---

## BÖLÜM B: VPS'e Deploy (Production)

### Adım 7: AlexHost VPS al

```
1. https://alexhost.com adresine git
2. VPS planı seç:
   - Minimum: 2 vCPU, 4 GB RAM, 80 GB NVMe — ~€16/ay
   - Önerilen: 4 vCPU, 8 GB RAM, 160 GB NVMe — ~€25/ay
3. Konum: Moldova (DMCA-free)
4. OS: Ubuntu 22.04 LTS
5. Ödeme: Kripto (Monero veya BTC)
6. Kişisel bilgi: minimum, sahte olabilir
```

### Adım 8: Domain al (Njalla)

```
1. https://njal.la adresine git
2. 2 domain al:
   - streamvault.example (film sitesi) — gerçek domain adın
   - embed.example (embed servisi) — farklı domain, bağlantı gizle
3. Ödeme: Monero
4. Njalla privacy proxy kullanır — WHOIS'ta senin bilgin görünmez
```

### Adım 9: Cloudflare kur

```
1. https://dash.cloudflare.com → hesap aç
2. Her iki domain'i Cloudflare'e ekle
3. Njalla'daki nameserver'ları Cloudflare'inkilere değiştir:
   - ns1.cloudflare.com (örnek, dashboard'da gösterilecek)
   - ns2.cloudflare.com
4. DNS kayıtları ekle:

   Film sitesi (streamvault.example):
     A    @           → VPS_IP_ADRESI    (Proxy: ON ☁️)
     A    www         → VPS_IP_ADRESI    (Proxy: ON ☁️)

   Embed servisi (embed.example):
     A    @           → VPS_IP_ADRESI    (Proxy: ON ☁️)

5. SSL/TLS → Full (Strict)
6. Speed → Auto Minify → hepsini aç
7. Caching → Caching Level → Standard
```

### Adım 10: VPS'i hazırla

```bash
# 10a. VPS'e SSH ile bağlan
ssh root@VPS_IP_ADRESI

# 10b. Sistem güncelle
apt update && apt upgrade -y

# 10c. Docker kur
curl -fsSL https://get.docker.com | sh

# 10d. Docker Compose kur
apt install docker-compose-plugin -y

# 10e. Güvenlik duvarı kur
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (Cloudflare)
ufw allow 443/tcp   # HTTPS (Cloudflare)
ufw enable

# 10f. Gereksiz portları kapat — 3000 ve 3001 dışarıdan erişilemez,
#      sadece Cloudflare üzerinden gelir
```

### Adım 11: Proje dosyalarını VPS'e yükle

```bash
# Lokal bilgisayarından VPS'e kopyala
# Yöntem A: Git ile (önerilen)
# Önce projeyi private git repo'ya push et, sonra VPS'te clone et

# Yöntem B: SCP ile direkt kopyala
scp -r /Users/eceseckin/embed-analyzer root@VPS_IP_ADRESI:/opt/stream

# VPS'te:
ssh root@VPS_IP_ADRESI
cd /opt/stream
```

### Adım 12: VPS'te environment dosyalarını ayarla

```bash
# 12a. Embed servisi .env
cat > embed-api/.env << 'EOF'
PORT=3001
HOST=0.0.0.0
HMAC_SECRET=BURAYA_OPENSSL_RAND_HEX_32_YAZ
URL_TTL_SECONDS=7200
ALLOWED_ORIGINS=https://streamvault.example
EMBED_DOMAIN=embed.example
SITE_DOMAIN=streamvault.example
EOF

# 12b. Film sitesi .env.local
cat > NyumatFlix/.env.local << 'EOF'
TMDB_API_KEY=senin_tmdb_keyin
AUTH_SECRET=BURAYA_BASKA_BIR_OPENSSL_RAND_HEX_32_YAZ
AUTH_URL=https://streamvault.example
DATABASE_URL=postgres://postgres:guclu_sifre_yaz@db:5432/streamvault
PROD_DATABASE_URL=postgres://postgres:guclu_sifre_yaz@db:5432/streamvault
NEXT_PUBLIC_SITE_NAME=StreamVault
NEXT_PUBLIC_SITE_URL=https://streamvault.example
NEXT_PUBLIC_APP_URL=https://streamvault.example
NEXT_PUBLIC_EMBED_API_URL=https://embed.example
AUTH_RESEND_KEY=
EOF

# 12c. Docker compose .env
cat > .env << 'EOF'
TMDB_API_KEY=senin_tmdb_keyin
AUTH_SECRET=ayni_secret
HMAC_SECRET=ayni_hmac_secret
SITE_NAME=StreamVault
SITE_URL=https://streamvault.example
EMBED_DOMAIN=embed.example
DB_PASSWORD=cok_guclu_sifre_yaz
EOF

# 12d. Secret'ları üret
openssl rand -hex 32  # AUTH_SECRET için
openssl rand -hex 32  # HMAC_SECRET için
openssl rand -hex 16  # DB_PASSWORD için
```

### Adım 13: NyumatFlix için Dockerfile oluştur

```bash
cat > NyumatFlix/Dockerfile << 'DOCKERFILE'
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* package-lock.json* ./
RUN npm install --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
DOCKERFILE
```

NyumatFlix next.config.mjs'e standalone output ekle:
```bash
# next.config.mjs dosyasında experimental bloğuna ekle:
# output: "standalone",
```

### Adım 14: Nginx reverse proxy kur

```bash
# 14a. Nginx kur
apt install nginx -y

# 14b. Film sitesi config
cat > /etc/nginx/sites-available/site << 'NGINX'
server {
    listen 80;
    server_name streamvault.example www.streamvault.example;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# 14c. Embed servisi config
cat > /etc/nginx/sites-available/embed << 'NGINX'
server {
    listen 80;
    server_name embed.example;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Embed iframe izni — tüm sitelerden erişilebilir
        add_header X-Frame-Options "ALLOWALL";
        add_header Content-Security-Policy "frame-ancestors *";
    }
}
NGINX

# 14d. Site'ları aktifleştir
ln -s /etc/nginx/sites-available/site /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/embed /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# 14e. Nginx'i test et ve yeniden başlat
nginx -t && systemctl restart nginx
```

### Adım 15: Docker Compose ile her şeyi başlat

```bash
cd /opt/stream

# 15a. docker-compose.yml'ı güncelle — nginx kullanıyoruz, portları sadece localhost'a aç
# docker-compose.yml'daki ports kısımlarını şu şekilde değiştir:
#   ports: ["127.0.0.1:3000:3000"]  (site)
#   ports: ["127.0.0.1:3001:3001"]  (embed)
#   ports: ["127.0.0.1:5432:5432"]  (db)

# 15b. Build et ve başlat
docker compose up -d --build

# 15c. Logları kontrol et
docker compose logs -f site    # Film sitesi logları
docker compose logs -f embed   # Embed servisi logları
docker compose logs -f db      # Veritabanı logları

# 15d. Veritabanı tablolarını oluştur
docker compose exec site npx drizzle-kit push

# 15e. Çalıştığını doğrula
curl http://127.0.0.1:3000    # Film sitesi
curl http://127.0.0.1:3001    # Embed servisi
```

### Adım 16: Cloudflare üzerinden erişimi test et

```
Tarayıcıda:
  https://streamvault.example     → Film sitesi açılmalı
  https://embed.example           → Embed landing page açılmalı
  https://embed.example/embed/movie/550  → Fight Club player açılmalı

Her ikisi de Cloudflare proxy arkasında:
  → Gerçek VPS IP'si gizli
  → SSL sertifikası Cloudflare'den (ücretsiz)
  → DDoS koruması aktif
```

---

## BÖLÜM C: Reklam Entegrasyonu

### Adım 17: HilltopAds hesabı aç

```
1. https://hilltopads.com/publishers/registration adresine git
2. Hesap aç (email yeterli, kimlik sormuyor)
3. Site ekle: streamvault.example
4. Onay bekle (genelde 24-48 saat)
5. Onaylandıktan sonra:
   - Pop-under zone oluştur → Zone ID al
   - Banner zone oluştur (300x250) → Zone ID al
```

### Adım 18: Reklam kodlarını siteye ekle

```
NyumatFlix/.env.local dosyasına ekle:
  NEXT_PUBLIC_AD_POPUNDER_ZONE=hilltopads_zone_id_buraya
  NEXT_PUBLIC_AD_SIDEBAR_ZONE=hilltopads_banner_zone_id
```

### Adım 19: VPN affiliate başvuru yap

```
1. https://nordvpn.com/affiliates/ → başvur
   veya
   https://www.surfshark.com/affiliates → başvur
2. Onaylandıktan sonra affiliate linkini al
3. .env.local'e ekle:
   NEXT_PUBLIC_VPN_AFFILIATE_URL=https://nordvpn.com/ref/senin-kodu
```

---

## BÖLÜM D: Bakım ve İzleme

### Adım 20: Otomatik yeniden başlatma

```bash
# Sistem açıldığında Docker Compose otomatik başlasın
systemctl enable docker

# Docker Compose servisleri zaten restart: unless-stopped ile çalışıyor
# Sunucu yeniden başlarsa otomatik açılır
```

### Adım 21: Basit monitoring

```bash
# Uptime Kuma kur (ücretsiz monitoring)
docker run -d \
  --name uptime-kuma \
  --restart unless-stopped \
  -p 127.0.0.1:3002:3001 \
  louislam/uptime-kuma:1

# Tarayıcıda: http://VPS_IP:3002
# Monitor ekle:
#   - https://streamvault.example (film sitesi)
#   - https://embed.example/api/v1/health (embed servisi)
# Bildirim: Telegram bot ile uyarı al
```

### Adım 22: Log temizliği (OPSEC)

```bash
# Haftalık log temizleme cron job'u ekle
crontab -e

# Şu satırı ekle:
0 3 * * 0 docker compose -f /opt/stream/docker-compose.yml logs --no-log-prefix > /dev/null 2>&1 && docker system prune -f > /dev/null 2>&1

# Nginx loglarını da temizle
0 3 * * * truncate -s 0 /var/log/nginx/access.log /var/log/nginx/error.log
```

---

## BÖLÜM E: OPSEC Kontrol Listesi

```
Deploy öncesi kontrol et:
  ✓ .env dosyaları .gitignore'da
  ✓ TMDB key .env'de, kodda değil
  ✓ Branding NyumatFlix/Nyumatflix değil, kendi adın
  ✓ Umami analytics yok (kaldırıldı)
  ✓ Domain Njalla üzerinden alındı (WHOIS gizli)
  ✓ VPS kripto ile ödendi
  ✓ Cloudflare proxy açık (gerçek IP gizli)
  ✓ SSH sadece key ile (parola devre dışı)
  ✓ Gereksiz portlar kapalı (ufw)
  ✓ Server header: "nginx" (gerçek teknoloji gizli)
  ✓ X-Powered-By header yok
  ✓ Loglar düzenli temizleniyor
  ✓ GitHub repo PRIVATE (veya yok)

Deploy sonrası kontrol et:
  ✓ https://streamvault.example çalışıyor
  ✓ https://embed.example çalışıyor
  ✓ https://embed.example/embed/movie/550 player açılıyor
  ✓ Browser DevTools → Network → Response Headers:
    - Server: nginx ✓
    - X-Powered-By: yok ✓
    - Strict-Transport-Security: var ✓
    - X-Content-Type-Options: nosniff ✓
  ✓ https://whatismyip.com'da VPS IP'si DEĞİL Cloudflare IP'si görünüyor
  ✓ dig streamvault.example → Cloudflare IP gösteriyor, VPS IP değil
```

---

## Hızlı Başlangıç Özeti (TL;DR)

```
# 1. Embed servisi
cd embed-api
npm install
cp .env.example .env
npm run dev                    # → http://localhost:3001

# 2. Veritabanı
docker run -d --name db -e POSTGRES_DB=streamvault \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16-alpine

# 3. Film sitesi
cd ../NyumatFlix
npm install --legacy-peer-deps
cp .env.example .env.local
# .env.local'i düzenle: TMDB_API_KEY ve AUTH_SECRET doldur
npx drizzle-kit push
npm run dev                    # → http://localhost:3000

# 4. Test
# http://localhost:3000         → Film sitesi
# http://localhost:3001         → Embed servisi
# http://localhost:3001/embed/movie/550 → Fight Club player

# 5. VPS deploy
docker compose up -d --build   # Her şey tek komut
```
