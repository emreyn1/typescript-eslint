# Deploy & Büyüme Rehberi — 5 Proje

## Neden Railway (embed-api için)?

```
                Vercel              Railway
─────────────────────────────────────────────────
ffmpeg          ❌ yok              ✅ Docker = her şey var
disk yazma      ❌ read-only        ✅ persistent volume
timeout         10s (free) / 60s    sınırsız
long-running    ❌ serverless       ✅ container her zaman açık
Telegram conn   ❌ cold start       ✅ sürekli bağlantı
PostgreSQL      ❌ harici lazım     ✅ tek tıkla eklenti
Docker desteği  ❌                  ✅ Dockerfile direkt deploy
Fiyat           $0 (free tier)      $5 kredi ile başla
```

embed-api'nin FFmpeg ile HLS remux yapması, Telegram'dan dosya indirmesi ve
PostgreSQL'e yazması gerekiyor. Bunların hepsi **sürekli çalışan bir sunucu**
gerektiriyor. Vercel serverless — her istek bağımsız bir fonksiyon, 10 saniyede
biter. embed-api'nin işi 10 saniyede bitmez.

---

## 5 Proje — Nereye Deploy?

```
Proje               Platform        Neden
────────────────────────────────────────────────────────────
NyumatFlix          Vercel          Next.js, Vercel'in kendi framework'ü, ücretsiz
embed-api           Railway         FFmpeg + Docker + Telegram + PostgreSQL gerekli
getsmsnow.com       Vercel          Next.js, zaten Supabase kullanıyor
kart-site           Vercel          Next.js, Supabase + Wanttopay API (hafif)
chess (Lichess)     AlexHost VPS    Scala + MongoDB + Redis + 12GB RAM, Docker Compose
```

İlk 4 proje toplamda **$5/ay** ile başlayabilir (Railway $5 kredi + Vercel ücretsiz).
Chess projesi ayrı bir VPS gerektirir (~€15/ay AlexHost).

---

## Proje Bazında Geliştirilebilecek Şeyler

### 1. NyumatFlix (Film Sitesi)
- Anime desteği (AniList API entegrasyonu)
- Kullanıcı listeleri (watchlist, favorites)
- Yorum sistemi (Disqus veya kendi DB)
- PWA (mobil uygulama gibi çalışma)
- Çoklu dil desteği (i18n)
- TMDB dışında IMDb/Trakt entegrasyonu

### 2. embed-api (Embed Servisi)
- Altyazı desteği (OpenSubtitles API)
- Otomatik torrent indirme pipeline'ı (yeni çıkan filmler)
- Çoklu CDN (Cloudflare + BunnyCDN failover)
- Embed analytics dashboard (hangi film kaç kez izlendi)
- API key sistemi (3. parti sitelere ücretli embed)
- 4K/HDR desteği (ayrı quality tier)

### 3. getsmsnow.com (SMS Servisi)
- Çoklu provider (SMSCode + 5SIM failover)
- Toplu sipariş (API kullanıcıları için)
- Reseller panel (B2B satış)
- Telegram bot ile sipariş
- Otomatik fiyat optimizasyonu (en ucuz provider'ı seç)

### 4. kart-site (No-KYC Kart)
- Wallester/Sunrate geçişi (şirket kurulunca, daha yüksek marj)
- Fiziksel kart desteği
- Kart-arası transfer
- Harcama limitleri ve bildirimler
- Merchant category kısıtlama (güvenlik)

### 5. Chess (Lichess Fork)
- Video chat'i oyun içine entegre et
- Turnuva sistemi (ödüllü)
- Puzzle rush modu
- Mobil uygulama (React Native wrapper)
- Koçluk marketplace

---

## Büyüme Planı

```
Ay 1-2:   NyumatFlix + embed-api canlıya al (Vercel + Railway)
          İlk reklamları koy (Adsterra popunder)
          Hedef: 1K günlük ziyaretçi

Ay 3-4:   Gelir $50+/ay olunca embed-api'ye içerik eklemeye başla
          Top 500 film Telegram'a yükle + HLS remux
          kart-site'ı canlıya al
          Hedef: 5K günlük ziyaretçi

Ay 5-6:   Kendi embed'ini kullanan dış siteler bul
          API key sistemi kur, ücretli embed sat
          AlexHost VPS'e taşın (Railway'den daha ucuz)
          Chess fork'u canlıya al
          Hedef: $500+/ay gelir

Ay 7-12:  Tüm içeriği kendi altyapıdan sun (upstream iframe'leri kaldır)
          VIP abonelik sistemi aktif et
          Referral programı ile organik büyüme
          İkinci VPS ekle (load balancing)
          Hedef: $2K+/ay gelir
```
