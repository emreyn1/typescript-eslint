# movieon.to — Deploy Rehberi & Para Kazanma Stratejisi

> Domain: **movieon.to**
> Embed: **embed.movieon.to** (embed-api, Fastify)
> Scraper: **CinePro** (aynı VPS, sadece localhost erişimi)
> Film sitesi: **movieon.to** (NyumatFlix, Next.js — Vercel veya aynı VPS)

---

## MEVCUT DURUM ÖZETİ

```
✅ YAPILDI:
  embed-api/.env            → movieon.to için yapılandırıldı
  cinepro/.env              → production mode, localhost-only erişim
  HMAC_SECRET               → Üretildi (64 char hex)
  CORS                      → Sadece movieon.to izinli
  CinePro                   → embed-api'ye entegre edildi
  Player v3                 → Çoklu kaynak, kalite seçici, fallback
  Reklam                    → Phase 1: KAPALI (kullanıcı kazanma dönemi)

⬜ YAPILACAK (bu rehberi takip et):
  VPS satın al + kurulum
  Domain DNS ayarları
  Nginx reverse proxy
  SSL sertifika
  Docker deploy
  Film sitesi (Next.js) oluştur veya deploy et
  SEO temel
  Phase 2'de reklam aç
```

---

## BÖLÜM 1: VPS DEPLOY (OPSEC UYUMLU)

### Adım 1: VPS Al

```
Sağlayıcı:  Hetzner Cloud (hetzner.com)
Plan:       CX22 (2 vCPU, 4GB RAM, 40GB disk) — €4.35/ay
Lokasyon:   Helsinki (Finlandiya) veya Falkenstein (Almanya)
OS:         Ubuntu 24.04 LTS
Ödeme:      Kripto (Hetzner Bitcoin kabul ediyor)

NOT: Hetzner hesabı açarken anonim bilgi kullanabilirsin.
     Doğrulama isterse pasaport GEREKMEZ — sadece adres + isim.
```

### Adım 2: Domain DNS (movieon.to)

```
movieon.to zaten varsa → Cloudflare'e taşı
movieon.to yoksa → Njalla'dan al ($15/yıl, XMR ile)

Cloudflare DNS ayarları (orange cloud ON = proxy aktif):
  A     movieon.to         → VPS_IP    (Proxied ☁️)
  A     embed.movieon.to   → VPS_IP    (Proxied ☁️)
  A     www.movieon.to     → VPS_IP    (Proxied ☁️)

Cloudflare SSL: Full (strict)
Cloudflare Security Level: Medium
```

### Adım 3: VPS İlk Kurulum

```bash
# SSH ile bağlan
ssh root@VPS_IP

# Güncelle
apt update && apt upgrade -y

# Docker kur
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# Firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Swap ekle (4GB RAM yetmezse)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Adım 4: Proje Dosyalarını VPS'e Kopyala

```bash
# Lokalde (kendi makinende)
rsync -avz --exclude='node_modules' --exclude='.git' \
  embed-api/ root@VPS_IP:/opt/movieon/embed-api/

rsync -avz --exclude='node_modules' --exclude='.git' \
  cinepro/ root@VPS_IP:/opt/movieon/cinepro/
```

### Adım 5: Docker Compose

VPS'te `/opt/movieon/docker-compose.yml` oluştur:

```yaml
version: "3.8"
services:
  cinepro:
    build: ./cinepro
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    env_file: ./cinepro/.env
    networks:
      - internal

  embed-api:
    build: ./embed-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:3001:3001"
    env_file: ./embed-api/.env
    depends_on:
      - cinepro
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

```bash
cd /opt/movieon
docker compose up -d --build
docker compose logs -f  # kontrol et
```

### Adım 6: Nginx Reverse Proxy + SSL

```bash
apt install -y nginx certbot python3-certbot-nginx

# /etc/nginx/sites-available/movieon.to
```

Nginx config:
```nginx
# embed.movieon.to → embed-api (port 3001)
server {
    listen 80;
    server_name embed.movieon.to;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # iframe izin
        add_header X-Frame-Options "ALLOWALL";
        add_header Content-Security-Policy "frame-ancestors *";
    }
}

# movieon.to → film sitesi (Next.js, port 3002 VEYA Vercel)
server {
    listen 80;
    server_name movieon.to www.movieon.to;

    location / {
        # Eğer aynı VPS'te Next.js çalışıyorsa:
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/movieon.to /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Cloudflare proxy KAPALI iken SSL al (sonra tekrar aç)
certbot --nginx -d movieon.to -d www.movieon.to -d embed.movieon.to
```

**NOT:** Cloudflare kullanıyorsan SSL sertifika gerekmez — Cloudflare'in "Full" modu yeterli. `certbot` sadece Cloudflare KULLANMIYORSAN lazım.

---

## BÖLÜM 2: PARA KAZANMA STRATEJİSİ — 3 FAZ

### FAZ 1: KULLANICI KAZANMA (Ay 0-2) — REKLAM YOK

```
HEDEF:     İlk 1000+ günlük ziyaretçi
STRATEJİ:  Sıfır reklam, mükemmel UX, kullanıcı güveni kazan
SÜRE:      6-8 hafta
GELİR:     $0 (bilinçli seçim)

NEDEN REKLAM YOK?
  - İlk izlenim = kalıcı izlenim
  - Reklamsız site = "bu site gerçekten bedava ve temiz" algısı
  - Reddit/Twitter'da "no ads" diye paylaşılır → organik büyüme
  - Rakiplerin %100'ü reklam dolu → differentiator

CONFIG:
  embed-api/.env:
    AD_VAST_URL=                (boş = reklam yok)
    AD_BUMPER_ENABLED=false     (bumper kapalı)

PAZARLAMA (paralel):
  □ Reddit: r/freemovies, r/piracy, r/cordcutters
  □ Twitter/X: Film önerisi thread'leri, bio'da link
  □ Telegram: Film kanalı aç, günde 3-5 film paylaş
  □ SEO: sitemap.xml, Google Search Console, meta taglar
  □ Mantra: "Free HD movies, no ads, no signup"
```

### FAZ 2: YUMUŞAK MONETİZASYON (Ay 2-4) — TEK REKLAM KATMANI

```
HEDEF:     İlk gelir + kullanıcıyı kaçırmamak
TETİKLEYİCİ: Günlük 3K+ benzersiz ziyaretçi
STRATEJİ:  Sadece 1 pop-under (oturum başına 1 kez, agresif değil)
GELİR:     $150-500/ay

HANGİ ŞİRKET İLK?
  → Adsterra (adsterra.com)

NEDEN ADSTERRA İLK?
  1. En düşük minimum trafik (5K/gün değil, daha düşükle kabul ediyor)
  2. SmartCPM — otomatik en yüksek teklifi seçer
  3. Anti-adblock — adblock kullananlardan da gelir
  4. Kripto ödeme (BTC/USDT) — OPSEC uyumlu
  5. Haftalık ödeme, min $5
  6. Streaming siteleri KABUL EDİYOR

ADSTERRA KAYIT:
  1. adsterra.com → Sign Up → Publisher
  2. Site ekle: movieon.to
  3. "Social Bar" veya "Popunder" zone oluştur
  4. Script tag'i al
  5. Film sitesine ekle (Next.js layout'a)

CONFIG DEĞİŞİKLİĞİ:
  Film sitesi (Next.js) layout.tsx'e:
    <script src="//your-adsterra-script.js" async></script>

  embed-api/.env: HENÜZ DEĞİŞTİRME (player'da reklam yok)

GELİR TAHMİNİ:
  3K/gün × $1.5 CPM = $4.5/gün = ~$135/ay (Tier 3 trafik)
  3K/gün × $3.0 CPM = $9.0/gün = ~$270/ay (Tier 1 trafik)
```

### FAZ 3: TAM MONETİZASYON (Ay 4+) — ÇOKLU REKLAM KATMANI

```
HEDEF:     Maksimum gelir
TETİKLEYİCİ: Günlük 10K+ benzersiz ziyaretçi
STRATEJİ:  3 pop-under + VAST pre-roll + banner
GELİR:     $1500-5000/ay

REKLAM STACK (sırayla ekle):

  KATMAN 1 — Pop-under #1: Adsterra (zaten var)
    CPM: $2.25-5 (T1), $0.80-1.5 (T3)
    Ödeme: Haftalık, BTC/USDT
    Tetikleme: İlk tıklama

  KATMAN 2 — Pop-under #2: PopAds (popad.com)
    CPM: $4-6 (T1), $2-4 (T3) — EN YÜKSEK
    Ödeme: Günlük(!), BTC
    Tetikleme: İkinci tıklama
    KAYIT: Sadece site onayı, KYC yok

  KATMAN 3 — Pop-under #3: HilltopAds (hilltopads.com)
    CPM: $2-5 (T1), $0.5-1.5 (T3)
    Ödeme: Haftalık, BTC/USDT
    Tetikleme: Üçüncü tıklama
    Streaming siteler için #1 ağ

  KATMAN 4 — VAST Pre-roll (player içi video reklam)
    Kaynak: HilltopAds VAST tag VEYA direkt advertiser
    CPM: $3-8 (T1)
    embed-api/.env değişikliği:
      AD_VAST_URL=https://your-hilltopads-vast-tag
      AD_BUMPER_ENABLED=true

  KATMAN 5 — Banner (sidebar/footer)
    Kaynak: Adsterra banner zone
    CPM: $0.2-1.0
    Konum: Film sayfası sidebar, ana sayfa footer
    En düşük gelir ama sıfır UX etkisi

  OPSIYONEL — Server-side Bumper (adblock-proof)
    ffmpeg ile reklam video → HLS segment
    m3u8'e film segmentlerinden ÖNCE eklenir
    Adblock ENGELLEYEMEz (aynı domain, aynı format)
    CPM: $3-8 (kendi advertiser'ınla anlaş)

GELİR TAHMİNİ (10K/gün):
  Adsterra pop-under:    10K × $3   = $30/gün = $900/ay
  PopAds pop-under:      10K × $4   = $40/gün = $1200/ay
  HilltopAds pop-under:  10K × $2   = $20/gün = $600/ay
  VAST pre-roll:         10K × $3   = $30/gün = $900/ay
  Banner:                10K × $0.5 = $5/gün  = $150/ay
  ──────────────────────────────────────────────────────
  TOPLAM:                                       ~$3750/ay
```

---

## BÖLÜM 3: REKLAM ENTEGRASYON KOMUTLARI

### Faz 2: Adsterra Pop-under (film sitesine)

Film sitesi (Next.js) `app/layout.tsx` veya `_document.tsx`:
```html
<!-- Adsterra Pop-under — oturum başına 1 kez -->
<script
  src="//www.highperformanceformat.com/ZONE_ID"
  data-cfasync="false"
  async
></script>
```

### Faz 3: Player'a VAST Pre-roll (embed-api'ye)

```bash
# embed-api/.env dosyasını güncelle:
AD_VAST_URL=https://www.videosprofitnetwork.com/watch.xml?key=YOUR_KEY
AD_BUMPER_ENABLED=true

# embed-api'yi yeniden başlat
docker compose restart embed-api
```

### Faz 3: Pop-under Stacking (film sitesine)

```html
<!-- Pop-under #1: Adsterra (zaten var) -->
<script src="//www.highperformanceformat.com/ADSTERRA_ZONE" async></script>

<!-- Pop-under #2: PopAds -->
<script src="//c1.popads.net/pop.js" data-uid="POPADS_UID" async></script>

<!-- Pop-under #3: HilltopAds -->
<script src="//hilltopads.com/tag.min.js" data-zone="HILLTOP_ZONE" async></script>
```

---

## BÖLÜM 4: OPSEC KONTROLÜ

### Mevcut OPSEC durumu

```
✅ YAPILDI:
  CinePro → sadece localhost (127.0.0.1) erişim
  CORS → sadece movieon.to izinli
  HMAC → üretildi, session token koruması
  Cloudflare proxy → VPS IP gizli
  Fingerprint + anti-debug → player'da aktif
  X-Frame-Options → ALLOWALL (iframe embed)
  Security headers → nosniff, no-referrer, permissions-policy
  Server header → "nginx" olarak maskelendi (Fastify gizli)

⬜ VPS'TE YAPILACAK:
  □ UFW firewall aktif (sadece 22, 80, 443)
  □ SSH key-only auth (password kapalı)
  □ fail2ban kur (brute force koruması)
  □ Docker network isolation (cinepro dışarıdan erişilemez)
  □ Swap şifreleme (opsiyonel, Plan F için)
```

### OPSEC Zayıflıkları (dikkat)

```
⚠️ Hetzner hesabı izlenebilir → kripto ile öde
⚠️ Cloudflare hesabı email'e bağlı → anonim email kullan
⚠️ TMDB API key → ücretsiz ama email ile kayıt gerekti
⚠️ Adsterra hesabı → site onayı var, email gerekli
   → Hepsi için ayrı burner email kullan (protonmail/tutanota)
```

---

## BÖLÜM 5: FİLM SİTESİ (movieon.to) — NE LAZIM?

Film sitesi (NyumatFlix) bu workspace'te **henüz yok**. İki seçenek:

### Seçenek A: Basit (2-3 gün)
TMDB API ile film listesi + embed iframe. Tek sayfa:
- Ana sayfa: Trending/Popular filmler (TMDB API)
- Film sayfası: Poster + açıklama + embed player (iframe → embed.movieon.to)
- Arama

### Seçenek B: Full (5-7 gün)
Next.js 15 + Tailwind + shadcn/ui ile tam site:
- Ana sayfa: Hero banner, trending, yeni eklenenler
- Film/dizi sayfası: Detay + player + öneriler
- Kategoriler, arama, watchlist
- Responsive (mobil uyumlu)

**ÖNERİ:** Seçenek A ile hemen başla, trafik gelince B'ye yükselt.

---

## BÖLÜM 6: LAUNCH CHECKLIST

```
ÖNCE (VPS'te):
  □ Hetzner VPS al (CX22, kripto ile)
  □ movieon.to domain DNS → Cloudflare
  □ VPS kurulum (Docker, Nginx, UFW)
  □ cinepro deploy (docker, localhost:3000)
  □ embed-api deploy (docker, localhost:3001)
  □ Nginx reverse proxy + SSL
  □ Test: curl https://embed.movieon.to/watch/movie/27205

SONRA (film sitesi):
  □ Film sitesi oluştur (Seçenek A veya B)
  □ movieon.to'ya deploy et
  □ Test: https://movieon.to → film seç → embed player açılır → video oynar
  □ sitemap.xml + robots.txt
  □ Google Search Console kayıt

PAZARLAMA (hemen):
  □ Reddit hesap aç (r/freemovies, r/piracy)
  □ Twitter/X hesap aç (film önerileri)
  □ Telegram kanal aç (günde 3-5 film paylaş)
  □ Bio'da: "Free HD movies at movieon.to — no ads, no signup"

FAZ 2 TETİKLEYİCİ (3K/gün ziyaretçi):
  □ Adsterra hesap aç → pop-under zone → film sitesine ekle
  □ embed-api reklam HENÜZ AÇMA

FAZ 3 TETİKLEYİCİ (10K/gün ziyaretçi):
  □ PopAds hesap aç → ikinci pop-under
  □ HilltopAds hesap aç → VAST tag al
  □ embed-api/.env: AD_VAST_URL + AD_BUMPER_ENABLED=true
  □ Server-side bumper hazırla (opsiyonel)
```

---

## BÖLÜM 7: HIZLI REFERANS

### Şirketler ve ne zaman kullanılacak

```
ŞİRKET       NE ZAMAN          NE İÇİN              ÖDEME       KYC
──────────────────────────────────────────────────────────────────────
Adsterra     Faz 2 (3K/gün)   Pop-under #1          BTC/USDT    Yok
PopAds       Faz 3 (10K/gün)  Pop-under #2          BTC günlük  Yok
HilltopAds   Faz 3 (10K/gün)  Pop-under #3 + VAST   BTC/USDT    Yok
Cloudflare   Hemen             DNS proxy + CDN        Kredi kartı Basit
Hetzner      Hemen             VPS                    BTC         Basit
Njalla       Hemen (yoksa)     Domain                 XMR         Yok
```

### Domain yapısı

```
movieon.to            → Film sitesi (Next.js)
embed.movieon.to      → Embed API (Fastify) — player serve eder
(internal) :3000      → CinePro (sadece localhost, dışarıdan erişilemez)
```

### Port haritası (VPS içi)

```
:22    SSH
:80    Nginx (HTTP → HTTPS redirect)
:443   Nginx (HTTPS → proxy)
:3000  CinePro (localhost only)
:3001  embed-api (localhost only)
:3002  Film sitesi - Next.js (localhost only)
```
