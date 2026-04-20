# NyumatFlix / embed-api — Bilgi Bankası & Dersler

> Bu belge embed/film projesi hakkında öğrenilen TÜM dersleri, teknik bulguları,
> karar gerekçelerini ve unutulmaması gereken detayları içerir.
> Her karar bir "neden" ile birlikte kaydedilmiştir.
> Bu dosyayı sil veya unutma — gelecekteki her kararın temeli burada.

---

## İÇİNDEKİLER

1. [Mimari Kararlar](#1-mimari-kararlar)
2. [Scraping Mekanizması](#2-scraping-mekanizması)
3. [Player Karşılaştırması](#3-player-karşılaştırması)
4. [Reklam Stratejisi](#4-reklam-stratejisi)
5. [CDN & Hosting](#5-cdn--hosting)
6. [Real-Debrid Dersleri](#6-real-debrid-dersleri)
7. [OPSEC Notları](#7-opsec-notları)
8. [CinePro Teknik Detaylar](#8-cinepro-teknik-detaylar)
9. [Provider Koruma Mekanizmaları](#9-provider-koruma-mekanizmaları)
10. [Gelir Modelleri](#10-gelir-modelleri)
11. [Yapılmış Hatalar](#11-yapılmış-hatalar)
12. [Kullanılan Araçlar](#12-kullanılan-araçlar)
13. [Referans Dosya Haritası](#13-referans-dosya-haritası)
14. [CDN Hijacking & İzinsiz CDN Kullanımı](#14-cdn-hijacking--izinsiz-cdn-kullanımı)
15. [Reklam Derin Analizi](#15-reklam-derin-analizi)
16. [HLS vs DASH vs MP4 — Format Karşılaştırması](#16-hls-vs-dash-vs-mp4--format-karşılaştırması)
17. [Provider URL Yapıları & Domain Pattern'leri](#17-provider-url-yapıları--domain-patternleri)

---

## 1. MİMARİ KARARLAR

### 1.1 Neden iframe değil kendi player?

**Karar:** Kendi player'ımızı kullanmak (iframe embed KULLANMAMAK).

**Gerekçe:**
- iframe kullanırsan reklam geliri iframe sahibine gider
- Kullanıcı IP'si 3. taraf provider'a sızar
- Brand value sıfır — kullanıcı "vidsrc" sanıyor
- Takedown riski sana kalır, gelir gitmez → en kötü dünya

**Not:** `providers/index.ts`'teki 5 iframe URL (VidSrc, 2Embed, AutoEmbed, MultiEmbed, VidSrc.cc) sadece SON çare fallback olarak tutulmalı.

### 1.2 Neden CinePro?

**Karar:** Kendi scraper yazmak yerine CinePro açık kaynak projesini kullanmak.

**Gerekçe:**
- Kendi scraper yazmak = 5-7 gün + haftalık bakım
- CinePro zaten 10 provider'ı destekliyor
- OMSS framework üzerine kurulu, provider eklemek kolay
- Community sürekli güncelliyor
- TypeScript, test yazılmış, production-ready

**Kaynak:** `cinepro-org/core` GitHub repo, `cinepro/` dizininde klonlanmış.

### 1.3 Neden Fastify (embed-api backend)?

**Karar:** Next.js API routes yerine ayrı Fastify backend.

**Gerekçe:**
- embed iframe olarak kullanılacak → ayrı domain lazım
- Rate limiting, HMAC, fingerprint gibi güvenlik katmanları
- HLS segment proxy'si CPU-yoğun, Next.js serverless'a uygun değil
- Fastify 5 en hızlı Node.js framework'ü

### 1.4 3 Katmanlı Fallback Zinciri (Plan F)

```
Cache → CinePro → Real-Debrid → Telegram → iframe
  ↑         ↑          ↑            ↑          ↑
anlık    10 prov.    torrent     exclusive   son çare
```

Her katman başarısız olursa bir sonrakine düşer. Bu yapı sayesinde %99.5+ içerik erişilebilirliği hedefleniyor.

---

## 2. SCRAPING MEKANİZMASI

### 2.1 Nasıl çalışıyor?

Embed provider'lar 3 seviye koruma kullanıyor, hiçbiri gerçek DRM değil:

**Seviye 1 — Header Kontrolü (en basit):**
- Sadece Referer/Origin header'ı kontrol
- Çözüm: Doğru header'ları gönder
- Örnek: VidSrc, VixSrc

**Seviye 2 — Şifrelenmiş API (orta):**
- API cevabını AES ile şifreler
- AMA anahtar JavaScript kodunda hardcoded
- Çözüm: Anahtarı kopyala, aynı decrypt fonksiyonunu yaz
- Örnekler ve anahtarları:
  - StreamMafia: `AES-256-GCM`, key = `Z9#rL!v2K*5qP&7mXw`
  - FMovies4U: `AES (CryptoJS)`, key = base64 decode `Zk0wdjFlczRVXzIwMjZf...`
  - VidRock: `AES-CBC`, passphrase = `x7k9mPqT2rWvY8zA5bC3nF6hJ2lK4mN9`
  - Vidzee: Çift katman `AES-GCM` + `AES-CBC`, key = `4f2a9c7d1e8b3a6f0d5c2e9a7b1f4d8c`

**Seviye 3 — Çok Adımlı Redirect Zinciri (en karmaşık):**
- 3+ ardışık sayfa yüklemesi, her birinden token/URL çıkarma
- Çözüm: Her adımı sırayla taklit et
- Örnek: VidSrc → iframe src → prorcp URL → m3u8 URL
  - Domain placeholder'lar: `{v1}` = neonhorizonworkshops.com, `{v4}` = cloudnestra.com

**NEDEN HEPSİ ÇÖZÜLÜYOR:**
Frontend'de çalışan her şey tersine mühendislikle çözülebilir. Gerçek DRM (Widevine L1) olmadığı sürece anahtar kullanıcıya zaten gönderilmek zorunda.

### 2.2 VoE / Filemoon / StreamWish farkı

Bu siteler **file hoster**, embed aggregator DEĞİL.
- TMDB ID ile film bulamazsın
- Her video için ayrı upload linki lazım
- Korumalar: packed JS (`eval(function(p,a,c,k,e,d)...)`), base64+XOR
- CinePro'daki aggregator'ler zaten alt katmanda bunları kullanıyor

Hiyerarşi:
```
CinePro → Aggregator (VidSrc, StreamMafia...) → Hoster (VoE, Filemoon...) → CDN (Wasabi, CF Workers)
```

### 2.3 CinePro Provider'ları (Nisan 2026)

```
PROVIDER           TİP          KORUMA              KAYNAK TİPLERİ
02MovieDownloader  HTML+API     Header              MP4, MKV (direkt link)
StreamMafia        Şifreli API  AES-256-GCM         HLS + MP4 (çoklu kalite)
VidSrc             Multi-step   3 adım redirect     HLS (m3u8)
VidRock            Şifreli API  AES-CBC              HLS + MP4
Vidzee             Şifreli API  AES-GCM+CBC          HLS + MP4
VixSrc             API          Header               HLS
Icefy              API          Header               HLS + MP4
FMovies4U          Şifreli API  AES (CryptoJS)       HLS + MP4
RgShows            HTML         Regex                MP4
UEmbed             HTML         Header               HLS + MP4
```

---

## 3. PLAYER KARŞILAŞTIRMASI

### 3.1 Değerlendirilen seçenekler

| Player | HLS | DASH | DRM | Reklam | UI | Boyut | Lisans | Durum |
|--------|-----|------|-----|--------|-----|-------|--------|-------|
| hls.js + Plyr | ✓ | - | - | Harici | Güzel | ~30KB | MIT | player-v2.html'de kullanıldı |
| Video.js + plugin | ✓ | ✓ | Plugin | ✓ (videojs-ima) | Klasik | ~150KB | Apache 2.0 | Değerlendirildi, ağır |
| Shaka Player | ✓ | ✓ | ✓ | Harici | Basit | ~130KB | Apache 2.0 | DRM lazım olursa |
| Vidstack | ✓ | ✓ | - | Plugin | Modern | ~45KB | MIT | **ÖNERİLEN** |
| JWPlayer | ✓ | ✓ | ✓ | ✓ | Pro | ~250KB | Ücretli | Çok pahalı |

### 3.2 Neden Vidstack?

- **Modern & hafif** (45KB vs Video.js 150KB)
- **React/Tailwind uyumlu**, headless component'ler
- **TypeScript-first** — tam tip desteği
- **HLS + DASH** dahili entegrasyon
- **Ücretsiz (MIT)** — Plyr'ın halefisi
- **SSR-ready** — Next.js ile sorunsuz

### 3.3 Mevcut player'lar

- `player.html` — Eski, kullanılmıyor
- `player-v2.html` — hls.js + Plyr, **Plan E'de aktif**
- `player-v3.html` — hls.js + custom controls, **Plan D/F'de aktif**
  - Çoklu kaynak seçici (HLS/MP4/MKV)
  - Kalite seçici (HLS level switching)
  - Otomatik en iyi kaynak seçimi
  - Keyboard shortcut (space, arrows, f, m)
  - PiP, fullscreen
  - Otomatik fallback (kaynak başarısızsa sonrakine geç)

---

## 4. REKLAM STRATEJİSİ

### 4.1 Reklam tipleri ve gelir karşılaştırması

| Tip | RPM ($) | UX Etkisi | Kontrol | Önerilen |
|-----|---------|-----------|---------|----------|
| Pop-under | $2-8 | Yüksek | Kolay | ✓ Ana gelir |
| VAST pre-roll | $3-12 | Orta | Orta | ✓ Player içi |
| Banner | $0.5-2 | Düşük | Kolay | ✓ Ek gelir |
| Page-push | $1-4 | Orta | Kolay | Opsiyonel |
| Click hijack | $5-15 | Çok yüksek | Zor | ✗ Riskli |
| Bumper | $1-3 | Düşük | Zor | Opsiyonel |

### 4.2 Önerilen kombinasyon

```
Katman 1: Adsterra pop-under (sayfa yükleme → yeni pencere)
Katman 2: HilltopAds VAST pre-roll (video başlamadan 15-30sn reklam)
Katman 3: Adsterra banner (sidebar/footer, 728x90 veya 300x250)
```

### 4.3 "Film sitesi 3-4 kez redirect yapıyor" meselesi

Rakipler play tuşuna basınca 3-4 yeni pencere açıyor. Bu **pop-under chain**:
- İlk 3-4 tıklama → her biri farklı reklam ağına yönlendirir
- 4. tıklamada gerçek video oynar
- Bounce rate çok yüksek ama RPM de yüksek ($5-15)
- **Biz bunu yapmayacağız** — 1 pop-under + 1 pre-roll yeterli, UX öncelikli

### 4.4 Reklam ağları

| Ağ | KYC | Ödeme | Min. Trafik | Not |
|----|-----|-------|-------------|-----|
| Adsterra | Yok | Kripto, PayPal | 5K/gün | ✓ İlk tercih |
| HilltopAds | Yok | Kripto | 3K/gün | ✓ VAST için |
| PopAds | Yok | PayPal | 1K/gün | Alternatif |
| ExoClick | Basit | Kripto | 5K/gün | NSFW traffic |

---

## 5. CDN & HOSTING

### 5.1 TikTok CDN meselesi (YAPMA)

PrimeSrc gibi bazı embed siteleri TikTok CDN credential'larını kullanıyordu.
- Bu **çalınmış/sızdırılmış credential** ile çalışıyordu
- Herhangi bir anda kapanabilir, yasal risk çok yüksek
- **Sonuç: KULLANMA.** Kendi CDN'ini kur.

### 5.2 CDN karşılaştırması

| CDN | Storage | Egress | 100TB/ay | Not |
|-----|---------|--------|----------|-----|
| Cloudflare R2 | $0.015/GB | $0 | ~$20 | ✓ En ucuz |
| Bunny CDN | $0.005/GB | $0.01/GB | ~$1005 | Hızlı ama pahalı |
| AWS S3+CF | $0.023/GB | $0.085/GB | ~$8523 | Enterprise |
| Wasabi | $0.007/GB | $0 (ilk TB) | ~$70 | R2 alternatifi |

**Karar:** Cloudflare R2 (egress ücretsiz, free tier CDN).

### 5.3 VPS seçimi

| Plan | RAM | Disk | Bant | Fiyat | Kullanım |
|------|-----|------|------|-------|----------|
| CX11 | 2GB | 20GB | 20TB | $5/ay | Plan D |
| CX21 | 4GB | 40GB | 20TB | $7/ay | Plan E |
| CX31 | 8GB | 80GB | 20TB | $15/ay | Plan F |

**Sağlayıcı:** Hetzner (kripto kabul ediyor, Almanya/Finlandiya DC).

---

## 6. REAL-DEBRID DERSLERİ

### 6.1 Performans

- **Cache'li içerik:** 1-2 saniye (link anında gelir)
- **Cache'siz içerik:** 30-120 saniye (torrent indirir, sonra link verir)
- **API rate limit:** Resmi limit yok ama saniyede 5+ istek atarsan throttle
- **Tek VPS IP:** RD açısından sorun değil — hep aynı IP = tek kullanıcı

### 6.2 Ban riski

- 100 concurrent kullanıcı tek hesaptan → **ban riski düşük** (hep aynı IP)
- Çoklu farklı IP'den tek hesap → **ban riski yüksek**
- Çözüm: VPS'te tek IP, kullanıcılar VPS üzerinden stream alır

### 6.3 Hesap yönetimi

- $3/ay, kripto ödeme, KYC yok
- Email burner olabilir
- 3 hesap rotation: farklı email + farklı ödeme kaynağı
- **DİKKAT:** Email sızarsa 3 hesap birden gidebilir → her hesap için ayrı email servisi

### 6.4 İçerik kaynakları

```
YTS API      — Film (torrent, genelde 1080p/2160p)
EZTV API     — Dizi (torrent, bölüm bazlı)
1337x        — Her şey (HTML scrape lazım)
```

---

## 7. OPSEC NOTLARI

### 7.1 Minimum OPSEC (Plan D)

```
✓ Njalla domain (XMR, sahte kimlik gerektirmez)
✓ Cloudflare proxy (gerçek VPS IP gizli)
✓ Hetzner VPS (kripto ödeme)
✗ VPN gerekmez (CinePro scraping VPS'te çalışır)
```

### 7.2 Orta OPSEC (Plan E)

```
Yukarıdakiler +
✓ RD hesapları ayrı email'lerle
✓ R2 bucket ayrı CF hesabıyla
✓ Domain rotation (2-3 domain hazır tut)
```

### 7.3 Tam OPSEC (Plan F)

```
Yukarıdakiler +
✓ Mullvad VPN (VPS'te WireGuard)
✓ IPRoyal residential proxy (scraping için)
✓ Ayrı kimlik/email/ödeme zinciri
✓ RAM wiping (swap, clipboard)
✓ Telegram ayrı hesap + session
```

### 7.4 DMCA senaryoları

| Plan | Ne host ediyor? | DMCA riski | Cevap |
|------|-----------------|------------|-------|
| D | Hiçbir şey (proxy) | Düşük | Domain rotate |
| E | HLS segmentler (R2/disk) | Orta | R2 content sil, domain rotate |
| F | HLS + Telegram dosyalar | Yüksek | R2 purge + domain rotate + TG channel değiş |

---

## 8. CINEPRO TEKNİK DETAYLAR

### 8.1 Kurulum

```bash
cd cinepro
cp .env.example .env
# TMDB_API_KEY (v3!) ve HOST=0.0.0.0 doldur
npm install
npm run dev
# → 10 provider register olur, port 3000'de çalışır
```

### 8.2 TMDB API Key

- **v3 key** lazım (kısa, alfanumerik)
- **v4 key** = JWT token, ÇALIŞMAZ
- v4 JWT'den v3 key çıkarmak: JWT payload'ındaki ilk segment decode et

### 8.3 Test URL'leri

```
Film:   http://localhost:3000/v1/movies/27205          (Inception, ~36 kaynak)
Film:   http://localhost:3000/v1/movies/550             (Fight Club)
Film:   http://localhost:3000/v1/movies/157336          (Interstellar)
Dizi:   http://localhost:3000/v1/tv/1396/seasons/1/episodes/1  (Breaking Bad S01E01)
```

### 8.4 Kaynak tipleri ve tarayıcı uyumu

```
HLS (.m3u8)  → Tarayıcıda direkt oynamaz, hls.js lazım
MP4          → Tarayıcıda direkt oynar ✓
MKV          → Tarayıcıda OYNAMAZ, indirmeye çalışır
```

### 8.5 HLS nasıl çalışıyor?

HLS = HTTP Live Streaming. Parçalı format:
1. `.m3u8` manifest dosyası = segment listesi
2. `.ts` segment dosyaları = 2-10 saniyelik video parçaları
3. Player (hls.js) manifest'i okur → segmentleri sırayla indirir → birleştirir
4. Adaptive bitrate: bant genişliğine göre kalite otomatik ayarlanır

CinePro proxy'si m3u8 içindeki segment URL'lerini kendi proxy URL'lerine yeniden yazar → kullanıcı her parçayı CinePro üzerinden çeker.

### 8.6 CinePro fragility (kırılganlık)

Provider'lar 2 kategoride:
- **JSON API tabanlı** (StreamMafia, VidRock): Daha dayanıklı, API formatı nadiren değişir
- **HTML regex tabanlı** (VidSrc, RgShows): Kırılgan, site layout değişince regex fail olur

Haftalık kontrol gerekli: `GET /v1/movies/27205` → kaç kaynak geldi? Normalde 30+ ise 15'e düştüyse bir provider kırılmış demek.

---

## 9. PROVIDER KORUMA MEKANİZMALARI

### 9.1 Koruma seviyeleri özet tablosu

| Provider | Seviye | Yöntem | Anahtar/Detay |
|----------|--------|--------|---------------|
| VidSrc | 3 | Multi-step redirect | iframe → prorcp → m3u8 |
| StreamMafia | 2 | AES-256-GCM | `Z9#rL!v2K*5qP&7mXw` |
| VidRock | 2 | AES-CBC | `x7k9mPqT2rWvY8zA5bC3nF6hJ2lK4mN9` |
| FMovies4U | 2 | AES (CryptoJS) | Base64 key in code |
| Vidzee | 2 | AES-GCM + AES-CBC | `4f2a9c7d1e8b3a6f0d5c2e9a7b1f4d8c` |
| VixSrc | 1 | Header check | Referer kontrolü |
| 02MovieDownloader | 1 | Header check | User-Agent + Referer |
| RgShows | 1 | Header check | Basit regex |

### 9.2 Neden gerçek koruma değil?

- DRM (Widevine L1) kullanmıyorlar — lisans ücreti var
- Anahtarlar frontend JavaScript'te — tarayıcının da çözmesi lazım
- Obfuscation != encryption — minify/uglify geri çözülebilir
- Token'lar sunucu tarafında üretilmiyor — client-side hesaplanıyor

---

## 10. GELİR MODELLERİ

### 10.1 Reklam geliri (ana gelir)

```
Kaynak:  Adsterra pop-under + HilltopAds VAST pre-roll
RPM:     $2-8 (Türkiye/MENA trafik) → $5-15 (US/EU trafik)
Formül:  Günlük ziyaret × RPM / 1000 × 30 = aylık gelir

Örnek:
  10K/gün × $5 RPM = $50/gün = $1500/ay
  50K/gün × $8 RPM = $400/gün = $12000/ay (teorik üst sınır)
```

### 10.2 Premium/coin sistemi (ek gelir, mevcut kodda var)

- `coin_balances`, `coin_transactions`, `watch_sessions` tabloları hazır
- Watch-to-earn: 1 coin/dakika, günlük 100 coin cap
- Referral sistemi hazır
- Premium içerik (Telegram exclusive) coin ile erişim

### 10.3 Gerçekçi beklentiler

```
Ay 1-3:   $0-200 (trafik oluşturma dönemi)
Ay 3-6:   $200-800 (SEO + organik büyüme)
Ay 6-12:  $800-3000 (olgunlaşma)
Ay 12+:   $2000-8000 (tam ölçek, Plan F ile)
```

---

## 11. YAPILMIŞ HATALAR

### 11.1 Plyr eski ve yavaş

- İlk player player-v2.html'de Plyr kullanıldı
- Plyr geliştirilmesi yavaşladı, bazı HLS event'lerini düzgün handle etmiyor
- **Ders:** Vidstack veya custom controls kullan

### 11.2 iframe fallback'i ana plan yapmak

- İlk tasarımda `providers/index.ts` (iframe URL listesi) ana kaynak olarak düşünüldü
- iframe = reklam geliri kaybı + OPSEC sızıntısı
- **Ders:** iframe sadece SON çare fallback

### 11.3 TMDB v4 key vs v3 key karıştırmak

- CinePro v3 key istiyor, telegram-bot/.env'de v4 JWT vardı
- Server sessizce crash oldu, hata mesajı yoktu
- **Ders:** TMDB key formatını kontrol et (kısa = v3, JWT = v4)

### 11.4 Tek plan yapıp "en iyi" demek

- Plan 1 ("En İyi Kombinasyon") aslında iki farklı mimariyi karıştırıyordu
- Plan 2 ("Lean Startup") aslında mevcut kodun deploy hali, "yeni plan" değildi
- **Ders:** Her planı bağımsız değerlendir, karıştırma

### 11.5 MKV'yi tarayıcıda oynatmaya çalışmak

- MKV tarayıcıda oynamaz, indirmeye çalışır
- Sadece MP4 ve HLS (hls.js ile) tarayıcıda çalışır
- **Ders:** Player'da source seçerken MP4/HLS tercih et, MKV'yi filtrele veya son sıraya koy

### 11.6 CinePro proxy URL'sini elle kopyalamak

- Uzun URL'ler kopyalanırken kesiliyor veya bozuluyor
- **Ders:** test-player.html gibi bir UI kullan, URL kopyalama ile uğraşma

---

## 12. KULLANILAN ARAÇLAR

| Araç | Kullanım | Dosya/Konum |
|------|----------|-------------|
| CinePro Core | Multi-source scraper | `cinepro/` |
| Fastify 5 | embed-api backend | `embed-api/src/server.ts` |
| hls.js | HLS playback | player-v2/v3.html |
| Plyr | Player UI (eski) | player-v2.html |
| PostgreSQL | DB (content_cache, coins) | `embed-api/src/db/index.ts` |
| Cloudflare R2 | CDN storage | `embed-api/src/cdn/cloudflare.ts` |
| ffmpeg | MP4 → HLS remux | `embed-api/src/pipeline/remux.ts` |
| FlareSolverr | CF anti-bot bypass | Plan F'de kullanılacak |
| Real-Debrid | Torrent unrestrict | `embed-api/src/pipeline/torrent.ts` |
| Docker | Containerization | `embed-api/Dockerfile` |
| Nginx | Reverse proxy | Deploy sırasında |
| Mullvad | VPN (OPSEC) | Plan F |
| IPRoyal | Residential proxy | Plan F |
| Njalla | Anonim domain | Tüm planlar |
| Adsterra | Pop-under reklam | Tüm planlar |
| HilltopAds | VAST pre-roll | Tüm planlar |

---

## 13. REFERANS DOSYA HARİTASI

### Ana Proje Yapısı

```
embed-analyzer/
├── embed-api/                    Fastify backend
│   ├── src/
│   │   ├── server.ts             Ana sunucu (Fastify 5)
│   │   ├── config.ts             Tüm env değişkenleri
│   │   ├── cinepro/
│   │   │   └── client.ts         CinePro API istemcisi
│   │   ├── routes/
│   │   │   ├── api.ts            /api/v1/* (sources, resolve, coins, referral)
│   │   │   ├── embed.ts          /embed/* (player-v2 serve)
│   │   │   ├── cinepro.ts        /watch/* + /api/v1/cinepro/* (player-v3 serve)
│   │   │   ├── hls.ts            /hls/* (HMAC segment proxy)
│   │   │   └── site.ts           Landing page
│   │   ├── pipeline/
│   │   │   ├── catalog.ts        Cache → Telegram → Torrent öncelik
│   │   │   ├── torrent.ts        YTS + EZTV + RD unrestrict
│   │   │   └── remux.ts          ffmpeg MP4 → HLS
│   │   ├── player/
│   │   │   ├── player.html       Eski player (kullanılmıyor)
│   │   │   ├── player-v2.html    hls.js + Plyr (Plan E)
│   │   │   └── player-v3.html    hls.js + custom (Plan D/F)
│   │   ├── protection/
│   │   │   ├── fingerprint.ts    Browser fingerprint
│   │   │   └── hmac.ts           Session token
│   │   ├── providers/
│   │   │   └── index.ts          5 iframe fallback URL
│   │   ├── cdn/
│   │   │   └── cloudflare.ts     R2 upload
│   │   ├── telegram/
│   │   │   └── client.ts         TG dosya gönder/al
│   │   ├── ads/
│   │   │   └── bumper.ts         VAST stub
│   │   └── db/
│   │       └── index.ts          PostgreSQL pool + schema
│   ├── Dockerfile                Docker multi-stage
│   ├── .env                      Aktif config
│   └── .env.example              Referans config
│
├── cinepro/                      CinePro scraper
│   ├── src/
│   │   ├── server.ts             OMSS framework sunucusu
│   │   └── providers/            10 scraping provider
│   │       ├── streammafia/      AES-256-GCM decrypt
│   │       ├── vidrock/          AES-CBC encrypt
│   │       ├── vidsrc/           Multi-step redirect
│   │       ├── vidzee/           AES-GCM+CBC
│   │       ├── fmovies4u/        AES CryptoJS
│   │       ├── vixsrc/           Header-based
│   │       ├── icefy/            Header-based
│   │       ├── rgshows/          Regex-based
│   │       ├── uembed/           Header-based
│   │       └── 02moviedownloader/ Direkt link
│   ├── .env                      TMDB key + host
│   ├── test-player.html          Browser test UI
│   └── compose.yml               Docker (Redis opsiyonel)
│
└── docs/
    ├── EMBED-3-PLAN.md           ← 3 plan karşılaştırması (bu sefer oluşturuldu)
    ├── EMBED-BILGI-BANKASI.md    ← BU DOSYA
    ├── EMBED-API-DEGERLENDIRME-VE-KARAR.md  Eski plan analizi (Plan 1/2, Yol A/B/C)
    └── EMBED-FILM-TEST-REHBERI.md  Lokal test rehberi
```

### Önemli .md Dosyaları (root)

```
secenekler.md          Ödeme + reklam + Phase 2 opsiyonları
reklam.md              Reklam entegrasyon mimarisi
5-isanaliz.md          5 iş birimi analizi
option1-9.md           Farklı mimari planlar (tarihsel)
ANALYSIS.md            Rakip embed site analizi (mitmproxy)
GROWTH-PLAN.md         Büyüme stratejisi
CONTENT-CALENDAR.md    İçerik takvimi
affiliate.md           Affiliate stratejisi
LANSMAN-REHBERI.md     Lansman planı
```

---

## 14. CDN HİJACKİNG & İZİNSİZ CDN KULLANIMI

### 14.1 Terminoloji — İngilizce'de ne deniyor?

Bu tür izinsiz yapılar için kullanılan terimler:

| Terim | Anlamı | Kullanım |
|-------|--------|----------|
| **CDN Hijacking** | Başkasının CDN altyapısını izinsiz kullanmak | PrimeSrc → TikTok CDN |
| **CDN Leeching** | CDN bandwidth'ini izinsiz sömürmek | Credential leak üzerinden upload |
| **Bandwidth Theft** | Bant genişliği hırsızlığı | Başkasının sunucu trafiğini kullanma |
| **Hotlinking** | Başka sitedeki dosyaya direkt link verme | `<img src="baskasinin-cdn.com/foto.jpg">` |
| **Parasitic Hosting** | Asalak barındırma — başkasının altyapısında yaşama | Free tier/leak exploit |
| **Resource Squatting** | Kaynak işgali | Açık bucket'lara upload |
| **CDN Abuse** | CDN'i kötüye kullanma | ToS ihlali ile içerik host etme |
| **Infrastructure Leeching** | Altyapı sömürüsü | Genel üst kavram |
| **Credential Stuffing (CDN)** | Çalıntı/sızmış CDN key'leriyle upload | TikTok gibi vakalar |

### 14.2 PrimeSrc — TikTok CDN Vakası (Detaylı Analiz)

PrimeSrc isimli embed provider, TikTok'un dahili CDN altyapısını film barındırmak için kullanıyordu:

```
Host:    p16-sg.tiktokcdn.com
Path:    /obj/tos-alisg-avt-0068/<32-char-hex>
```

**Nasıl çalışıyordu:**
- `p16-sg` = Platform 16, Singapur edge node
- `tos` = TikTok Object Storage (dahili depolama)
- `alisg` = Alibaba Cloud Singapur bölgesi
- `avt-0068` = Bucket/partition numarası

**Upload nasıl yapıldı?** Kesin bilinmiyor, olası yollar:
1. ByteDance'in başka bir ürünü (CapCut, Lark) üzerinden dolaylı upload
2. Korumasız/eski bucket'a doğrudan PUT isteği
3. İçeriden sızmış credential (en olası)

**Neden kullanılıyordu:**
- $0 maliyet — ne storage ne bandwidth ücreti
- Anonim — hesap açmaya gerek yok
- Hızlı — TikTok'un global CDN altyapısı (düşük latency)

**Neden YAPILMAMALI:**
- **Sürdürülemez** — TikTok credential'ları rotate ederse tüm içerik gider
- **Yasal risk** — Computer Fraud & Abuse Act (ABD), Computer Misuse Act (İngiltere) kapsamında suç
- **Sıfır kontrol** — URL format değişikliği, rate limit, IP ban her an olabilir
- **Bağımlılık** — tüm altyapı tek bir 3. tarafın insafında

### 14.3 Diğer provider'lar ne kullanıyor?

| Provider | CDN | Tür | Neden? |
|----------|-----|-----|--------|
| **PrimeSrc** | TikTok CDN | İzinsiz (hijack) | $0, anonim, kırılgan |
| **Filemoon** | SprintCDN (Polonya) | Ticari anlaşma | DMCA yavaş, HMAC desteği |
| **StreamWish** | Cloudflare (proxy) + arka sunucu | Ticari | CF sadece önde, dosyalar arkada |
| **Upcloud** | Cloudflare (dual domain) | Ticari | Playlist/segment ayrı domain |
| **Vidcloud** | Raffaello CDN (port 2223) | Ticari niş | Non-standard port, az dikkat çeker |
| **VOE** | Edgeon/Limelight | Ticari büyük | Per-user subdomain, kapsamlı imza |

### 14.4 "Açık CDN" veya sızmış credential var mı?

**Kısa cevap: Hayır, güvenilir ve sürdürülebilir bir "açık CDN" yok.**

Detay:
- TikTok vakası bir **anomali** — normalde büyük CDN'lerin bucket'ları korumalı
- AWS S3, Google Cloud Storage, Azure Blob → varsayılan olarak private
- Cloudflare R2 → public bucket yapabilirsin ama hesabın izlenebilir
- "Açık bucket" tarayıcıları (GrayhatWarfare vb.) var ama:
  - Bulduğun bucket her an kapatılabilir
  - Yasal risk çok yüksek (unauthorized access)
  - Upload yapabilsen bile DELETE hakkı yoksa yönetemezsin

**Sonuç: Kendi CDN'ini kullan.** R2 ($0 egress) veya Wasabi ($7/TB) en ucuz yasal seçenekler.

---

## 15. REKLAM DERİN ANALİZİ

### 15.1 En çok para kazandıran reklam türleri (sıralı)

```
SIRA  TİP                    CPM (Tier 1)  CPM (Tier 3)  NEDEN?
──────────────────────────────────────────────────────────────────
#1    Server-side bumper      $3-8          $0.5-2        Adblock-proof, %100 gösterim
#2    Pop-under (stacking)    $1.5-5        $0.3-1.5      %100 tetiklenme, en yüksek hacim
#3    VAST pre-roll           $3-12         $0.5-3        Video reklam, yüksek CPM
#4    Interstitial            $2-6          $0.5-2        Tam sayfa, yüksek dikkat
#5    Click hijack            $5-15         $2-5          En yüksek CPM ama UX yıkıcı
#6    In-page push            $0.3-1.0      $0.1-0.3      Düşük ama sürekli
#7    Banner (display)        $0.2-1.0      $0.05-0.2     En düşük, görünmezlik sorunu
```

### 15.2 VAST Pre-roll — Detaylı Açıklama

**VAST = Video Ad Serving Template** — IAB standardı video reklam protokolü.

```
Nasıl çalışır:
  1. Player yüklenir
  2. Video başlamadan önce VAST tag URL'sine istek atar
  3. VAST sunucu XML döndürür (reklam video URL + tracking pixel'ler)
  4. Player reklam videosunu oynatır (5-30 sn)
  5. "Skip Ad" butonu gösterilir (opsiyonel, genelde 5 sn sonra)
  6. Reklam biter → asıl video oynar
  7. Player tracking pixel'lere istek atar (impression, quartile, complete)
```

**VAST tag örneği:**
```xml
<VAST version="4.2">
  <Ad>
    <InLine>
      <AdTitle>Casino Ad</AdTitle>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:15</Duration>
            <MediaFiles>
              <MediaFile type="video/mp4" width="1920" height="1080">
                https://ad-server.com/casino-ad.mp4
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
```

**Entegrasyon yolları:**
1. **Google IMA SDK** — en yaygın, hls.js/Vidstack ile uyumlu
2. **video.js + videojs-ima plugin** — Video.js kullanıyorsan
3. **Manuel fetch + overlay** — VAST XML parse et, kendi player'ında oynat

**VAST tag nereden alınır:**
- Adsterra → VAST zone oluştur
- HilltopAds → VAST tag al
- Direct advertiser → Telegram gruplarından casino/VPN reklamcısı bul
- Google Ad Manager (DFP) — KYC gerektirir, embed siteleri için uygun değil

### 15.3 Server-Side Ad Insertion (SSAI) / Bumper — Neden engellenemez?

Bu teknik Hulu, Peacock, Paramount+ gibi büyük platformların kullandığı yöntem:

```
Normal reklam (client-side):
  Player → ads.google.com/vast.xml    ← Adblock ENGELLER (farklı domain)
  Player → ad-cdn.com/casino.mp4      ← Adblock ENGELLER (reklam CDN'i)

Server-side bumper:
  Player → cdn.senin-domain.com/v/hmac/seg_000.jpg    ← Film mi reklam mı?
  Player → cdn.senin-domain.com/v/hmac/seg_001.jpg    ← Film mi reklam mı?
  Player → cdn.senin-domain.com/v/hmac/seg_002.jpg    ← Film başlıyor

  Adblock'un elinde ayırt edecek HİÇBİR sinyal yok:
    ✗ Domain aynı (senin CDN'in)
    ✗ URL formatı aynı (.jpg uzantılı segment)
    ✗ Content-Type aynı (video/MP2T)
    ✗ Boyut aynı (1-5 MB)
    → Domain'i engellerse film de durur
    → URL pattern engellerse film de durur
```

**Nasıl uygulanır:**
```bash
# 1. Reklam videosunu HLS segmentlerine dönüştür
ffmpeg -i reklam.mp4 \
  -c:v libx264 -c:a aac -b:v 2M \
  -f hls -hls_time 10 \
  -hls_segment_filename 'ad_%03d.ts' \
  ad_playlist.m3u8

# 2. Segment'leri .jpg olarak yeniden adlandır (embed-api'nin formatı)
for f in ad_*.ts; do mv "$f" "${f%.ts}.jpg"; done

# 3. m3u8 playlist'e film segmentlerinden ÖNCE ekle
cat ad_playlist.m3u8 film_playlist.m3u8 > combined.m3u8
```

### 15.4 Pop-under Stacking — Rakipler nasıl yapıyor?

```
VOE / Filemoon / StreamWish stratejisi:

  Play butonuna tıkla (1. tıklama)
    ├── Pop-under #1 (Adsterra)    → $2.25 CPM  → arka planda açılır
    ├── Pop-under #2 (PopAds)      → $4.00 CPM  → arka planda açılır
    ├── Pop-under #3 (HilltopAds)  → $2.00 CPM  → arka planda açılır
    └── Video oynatılır

  Herhangi bir 2. tıklama (pause, fullscreen, seek)
    ├── Pop-under #4 (Clickadu)    → $1.50 CPM  → arka planda açılır
    └── Artık tıklama = pop-under YOK (UX korunur)

  Tek izleme oturumu toplam:
    4 pop-under × ortalama $2.5 CPM = $10 eCPM
    10K/gün × $10/1000 = $100/gün = $3000/ay (sadece pop-under'dan)
```

### 15.5 Click Hijack — Ne ve neden kullanmayacağız?

**Click hijack:** Kullanıcının tıklamasını yakalayıp farklı bir hedefe yönlendirme.

```
Nasıl çalışır:
  1. Kullanıcı "Play" butonuna tıklar
  2. Tıklama aslında görünmez bir iframe/link'e gider
  3. Yeni pencerede reklam sitesi açılır
  4. Kullanıcı geri gelir, tekrar tıklar
  5. 3-4 denemeden sonra gerçek video oynar
```

**CPM:** $5-15 (en yüksek) ama:
- UX tamamen yıkılır
- Kullanıcı güvenini kaybedersin
- Google Safe Browsing listesine girme riski
- Reklam ağı hesabı kapatma riski
- **Sonuç: KULLANMA.**

### 15.6 Pop-under Ağ Karşılaştırması (8 ağ)

```
SIRA  AĞ          CPM(T1)     CPM(T3)     ÖDEME     KRİPTO  STREAMING  NOT
────────────────────────────────────────────────────────────────────────────
#1    Adsterra    $2.25-5     $0.80-1.5   Haftalık  ✅      ✅         SmartCPM, anti-adblock
#2    PopAds      $4-6        $2-4        Günlük    ✅ BTC  ✅         En yüksek T1 CPM
#3    HilltopAds  $2-5        $0.5-1.5    Haftalık  ✅      ✅         Streaming odaklı #1
#4    ExoClick    $2-4        $0.5-1.5    Haftalık  ❌      ✅         NSFW traffic
#5    Clickadu    $1-3.5      $0.3-1.2    NET-7     ✅      ✅         İyi T3 CPM
#6    Monetag     $1-2.5      $0.2-0.8    NET-7     ✅      ✅         In-page push'ta güçlü
#7    Adcash      $1-3        $0.2-1.0    NET-30    ✅      ✅         Smart bidding
#8    PopCash     $0.5-2      $0.1-0.5    Günlük    ❌      ✅         Düşük CPM
```

**Önerilen kombinasyon (3 katmanlı pop-under + bumper):**
```
1. Adsterra pop-under    → en yüksek ortalama CPM + anti-adblock
2. PopAds pop-under      → en yüksek Tier 1 CPM, günlük BTC ödeme
3. HilltopAds pop-under  → stabil, streaming odaklı
4. Server-side bumper    → adblock-proof, ek katman

Tahmini gelir (10K/gün trafik):
  Adsterra:    10K × $3 CPM   = $30/gün = $900/ay
  PopAds:      10K × $4 CPM   = $40/gün = $1200/ay
  HilltopAds:  10K × $2 CPM   = $20/gün = $600/ay
  Bumper:      10K × $3 CPM   = $30/gün = $900/ay
  ─────────────────────────────────────────────
  TOPLAM:                                 ~$3600/ay
```

### 15.7 Reklam ödeme alma (OPSEC uyumlu)

```
Kaynak              Ödeme yöntemi
────────────────────────────────────────────
Adsterra            BTC / USDT (TRC-20) / Wire
PopAds              BTC (günlük!)
HilltopAds          BTC / USDT (TRC-20)
Monetag             BTC / USDT
Adcash              BTC / Wire
Direct advertiser   USDT / Monero (Telegram ile anlaş)

KURAL: Kendi adına banka/PayPal hesabı KULLANMA.
       Tüm gelirler kripto cüzdanına → Monero'ya çevir.
```

---

## 16. HLS vs DASH vs MP4 — FORMAT KARŞILAŞTIRMASI

### 16.1 Format tablosu

| Format | Uzantı | Adaptive | DRM | Tarayıcı desteği | Latency | Not |
|--------|--------|----------|-----|-------------------|---------|-----|
| **HLS** | .m3u8 + .ts | ✓ | FairPlay | Safari native, diğerleri hls.js ile | 10-30s | Apple standardı, en yaygın |
| **DASH** | .mpd + .m4s | ✓ | Widevine | Chrome/Edge native, diğerleri dash.js | 5-15s | Google standardı, daha esnek |
| **MP4** | .mp4 | ✗ | ✗ | Tüm tarayıcılar | 0 | Progressive download, adaptive yok |
| **MKV** | .mkv | ✗ | ✗ | HİÇBİR tarayıcı | - | İndirme gerektirir, VLC ile açılır |
| **WebM** | .webm | ✗ | ✗ | Chrome/Firefox | 0 | VP8/VP9 codec, niş kullanım |

### 16.2 HLS parçalı yapısı

```
film.m3u8 (master playlist)
  ├── 1080p.m3u8 → seg_000.ts, seg_001.ts, seg_002.ts ...
  ├── 720p.m3u8  → seg_000.ts, seg_001.ts, seg_002.ts ...
  └── 480p.m3u8  → seg_000.ts, seg_001.ts, seg_002.ts ...

Her segment: 2-10 saniye video
Toplam: 2 saatlik film = ~720 segment (10s/segment)

Adaptive bitrate:
  - Bant genişliği yüksek → 1080p segment indir
  - Bant genişliği düştü → otomatik 720p'ye geç
  - Kullanıcı fark etmez (buffer sayesinde kesintisiz)
```

### 16.3 CinePro proxy'si HLS'i nasıl handle ediyor?

```
1. Kullanıcı player'da play'e basar
2. Player → CinePro proxy → kaynak sunucu'dan master.m3u8 alır
3. CinePro m3u8 içindeki TÜM segment URL'lerini kendi proxy URL'lerine yazar
   Örnek:
     Orijinal: https://cdn.streammafia.to/seg_000.ts
     Yeniden:  http://localhost:3000/v1/proxy?data=...encoded...
4. Player her segmenti CinePro proxy üzerinden çeker
5. CinePro her segment isteğinde doğru Referer/Origin header'ını ekler
6. Kaynak sunucu segmenti verir → CinePro → player
7. Player segmentleri birleştirir → kesintisiz video

Kullanıcı açısından: tek URL, sürekli video
Arka planda: yüzlerce HTTP isteği, her biri proxied
```

---

## 17. PROVIDER URL YAPILARI & DOMAIN PATTERN'LERİ

### 17.1 Provider domain inventory (Nisan 2026)

Bu domain'ler CinePro provider'larının kodlarında hardcoded:

```
PROVIDER           ANA DOMAIN                EMBED/API DOMAIN
StreamMafia        embedmafia.in             nhd.streammafia.to
VidSrc             vsembed.ru                cloudnestra.com, wanderlynest.com
VidRock            vidrock.net               sub.vdrk.site, proxy.vidrock.store
Vidzee             (API endpoint)            (değişken)
FMovies4U          (API endpoint)            (değişken)
VixSrc             (API endpoint)            (değişken)
02MovieDownloader  (direkt link)             toxix.buzz, wasabisys.com
RgShows            (API endpoint)            (değişken)

CDN DOMAIN'LERİ (video dosyalarının geldiği yerler):
  s3.ap-southeast-1.wasabisys.com    (Wasabi S3, Singapur)
  hub.toxix.buzz                      (02MovieDownloader CDN)
  lucky-surf-a164.earth14.workers.dev (Cloudflare Workers)
  throbbing.hydrastreaming.lat        (StreamMafia HLS)
  hls2.vdrk.site                      (VidRock HLS)
  67streams.*                         (VidRock alternatif)
  lok-lok.cc                          (VidRock alternatif)
```

### 17.2 VidSrc domain placeholder sistemi

VidSrc m3u8 URL'lerinde domain'ler placeholder olarak saklanır:
```
{v1} = neonhorizonworkshops.com
{v2} = wanderlynest.com
{v3} = orchidpixelgardens.com
{v4} = cloudnestra.com
```

Bu domain'ler düzenli olarak değişir — VidSrc scraper'ının en kırılgan noktası.

---

## SON SÖZ

Bu belge, projenin tüm teknik ve stratejik birikimini içerir. Yeni bir karar vermeden önce:

1. **Bu dosyayı oku** — aynı hatayı tekrar yapma
2. **EMBED-3-PLAN.md'yi oku** — hangi plan uygun?
3. **Kodu değiştirmeden önce ilgili bölümü kontrol et** — zaten çözülmüş olabilir

Güncelleme tarihi: Nisan 2026
