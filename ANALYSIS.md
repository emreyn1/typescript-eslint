# Video Embed Ekosistemi — Kapsamlı Analiz Raporu

> **Tarih:** 29 Mart 2026
> **Analiz edilen:** 7 embed provider (PrimeSrc, Filemoon, StreamWish, Upcloud, Vidcloud, Akcloud, VOE)
> **Veri kaynağı:** mitmproxy network capture + kaynak kod analizi (player.js, embed HTML)
> **İzlenen içerik:** Avatar: Fire and Ash (TMDB #83533)

---

## İçindekiler

1. [Genel Mimari](#1-genel-mimari)
2. [Provider Detayları](#2-provider-detayları)
3. [CDN Altyapısı](#3-cdn-altyapısı)
4. [Reklam ve Analitik](#4-reklam-ve-analitik)
5. [Koruma Mekanizmaları](#5-koruma-mekanizmaları)
6. [Segment Gizleme Teknikleri](#6-segment-gizleme-teknikleri)
7. [Karşılaştırma Tabloları](#7-karşılaştırma-tabloları)
8. [Sıfırdan En İyi Nasıl Yapılır?](#8-sıfırdan-en-iyi-nasıl-yapılır)

---

## 1. Genel Mimari

Tüm provider'lar **3 katmanlı** bir zincir paylaşıyor:

```
Katman 1 — Aggregator (ör. rivestream.org, movieorca.com)
  │  Film/dizi kataloğu, arama, UI
  │  Kullanıcı embed provider seçer veya otomatik atanır
  │
  ▼
Katman 2 — Embed Resolver (primesrc.me)
  │  TMDB/IMDB ID → sunucu listesi (/api/v1/s)
  │  Sunucu key → upstream oynatıcı URL (/api/v1/l)
  │  Cloudflare Turnstile bot koruması
  │
  ▼
Katman 3 — Oynatıcı + CDN (her provider farklı)
  │  Kendi domain'inde oynatıcı sayfası (JWPlayer veya özel)
  │  HLS manifest (.m3u8) oluşturma
  │  Video segmentlerini CDN'den teslim etme
  │  Reklam enjeksiyonu
```

### İstek akışı (tüm provider'larda ortak)

```
1. Kullanıcı siteye gider (movieorca / rivestream)
2. Site, primesrc.me/api/v1/s?tmdb=X&type=movie çağırır
3. Sunucu listesi döner (key, isim, kalite, dil)
4. Kullanıcı sunucu seçer veya ilk sunucu otomatik seçilir
5. primesrc.me/api/v1/l?key=Y çağrılır
6. Cloudflare Turnstile çözülür (bot koruması)
7. JSON'da "link" alanı → upstream oynatıcı URL'si döner
8. Oynatıcı sayfası iframe olarak yüklenir
9. Oynatıcı kendi API'si ile video kaynağını çözer
10. HLS manifest + segment URL'leri alınır
11. Video oynar, reklamlar gösterilir
```

---

## 2. Provider Detayları

### 2.1 PrimeSrc / PrimeVid

| Özellik | Değer |
|---------|-------|
| **Embed domain** | `primesrc.me` |
| **Oynatıcı domain** | `primevid.click` |
| **Backend** | Elixir/Phoenix |
| **Oynatıcı** | Özel React SPA + player.js iframe API |
| **Video CDN** | `p16-sg.tiktokcdn.com` (ByteDance/Alibaba Singapur) |
| **HLS yapısı** | `master.m3u8` → `index-f1-v1.m3u8` (720p), `index-f2-v1.m3u8` (1080p) |
| **Segment süresi** | 2 saniye |
| **Segment URL** | `https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/<32-char-hex>` |
| **URL imzası** | Yok — segment URL'leri süresiz ve imzasız |
| **Altyazı** | Kendi sunucusundan `.vtt` |
| **Ses izleri** | Ayrı ses playlist'i (Norveççe, İngilizce) |
| **Reklam** | Google IMA/DFP, Yandex Metrica (99122182), adexchangeclear, adbpage |
| **Koruma** | Cloudflare Turnstile (site key: `0x4AAAAAACox-LngVREu55Y4`) |
| **Zayıflık** | TikTok CDN bağımlılığı, imzasız URL'ler, `flusteredexam.com` anti-debug beacon |
| **Fallback** | `vidsrcme.ru/embed/...` (kodda sabit) |

**API zinciri:**
```
/api/v1/s?tmdb=83533&type=movie  →  sunucu listesi (key, isim, kalite)
/spiderman?l=9XprE               →  bot kontrolü (boş yanıt, cf_clearance gerekli)
/api/v1/l?key=9XprE              →  { "link": "https://primevid.click/..." }
primevid.click/api/v1/info?id=X  →  video metadata
primevid.click/api/v1/video?id=X →  oynatıcı konfigürasyonu
primevid.click/api/v1/player?t=  →  şifreli player config (5+ kez polling)
```

**Aggregator detayı (rivestream.org):**
```
/api/backendfetch?requestID=VideoProviderServices&secretKey=rive
  → mevcut provider listesi (flowcast, asiacloud, primevids)
/api/backendfetch?requestID=movieVideoProvider&id=83533&service=primevids&secretKey=MC00YTgzNDM=
  → secretKey base64: "0-4a8343"
```

---

### 2.2 Filemoon

| Özellik | Değer |
|---------|-------|
| **Embed domain** | `bysejikuar.com` (embed sayfası), `f75s.com` (API + player) |
| **Oynatıcı** | JWPlayer v8.26 + HLS.js |
| **Video CDN** | `edge2-waw-sprintcdn.r66nv9ed.com` (SprintCDN, Varşova) |
| **HLS yapısı** | `master.m3u8` → `index-v1-a1.m3u8` (tek kalite) |
| **Segment format** | `seg-{N}-v1-a1.ts` (standart `.ts`) |
| **URL imzası** | HMAC token (`t`), başlangıç (`s`), süre (`e`=10800s/3 saat), dosya ID (`f`), sunucu ID (`srv`), ASN (`asn`), hız limiti (`sp`) |
| **Thumbnail** | `img-place.com` (poster resimleri) |
| **Reklam** | adexchangeclear, usrpubtrk, adbpage, iClick (jnbhi/oyo4d), RTMark, GA4 (`G-TY1B74WN3B`) |
| **Koruma** | Cloudflare Turnstile (primesrc üzerinde) + özel challenge/attest akışı |

**Özel koruma akışı (3 adım):**
```
POST /api/videos/access/challenge    →  sunucu challenge verir
POST /api/videos/access/attest       →  tarayıcı attestation gönderir (fingerprint)
POST /api/videos/{id}/embed/playback →  HLS URL döner (sadece attest başarılıysa)
```

**Ek API'ler:**
```
/api/videos/{id}/embed/details   →  video metadata
/api/videos/{id}/embed/settings  →  oynatıcı ayarları
/api/videos/{id}/embed/view      →  izlenme sayacı
/api/videos/{id}/embed/heartbeat →  periyodik heartbeat (oynatma devam ediyor mu)
```

**İki domain mimarisi:** `bysejikuar.com` ve `f75s.com` aynı SPA asset'lerini (aynı hash'li dosya isimleri) sunuyor. Domain rotasyonu veya fallback mekanizması.

---

### 2.3 StreamWish

| Özellik | Değer |
|---------|-------|
| **Public domain** | `streamwish.to` (yönlendirme) |
| **Gerçek oynatıcı** | `hglamioz.com` |
| **Oynatıcı** | JWPlayer v8 + HLS.js |
| **Video CDN** | `ngr2dnwrdasv7gvg.greenmountainventures.shop` (Cloudflare) |
| **HLS yapısı** | `master.txt` → `index-v1-a1.txt` (tek kalite 720p) |
| **Segment format** | `seg-{N}-v1-a1.woff2` — `.woff2` uzantısı (font dosyası gibi) |
| **URL imzası** | Token + ASN + IP bağlı |
| **Thumbnail** | `huntrexus.com` |
| **Reklam** | Adcash/iClick (4 zone), Google IMA/DFP/GA4, Yandex Metrica (102872415), gambling affiliate (Betssongroup), SMS scam (smsraha.ee) |
| **Koruma** | Cloudflare Turnstile + bot detection (usrpubtrk) |

**Segment gizleme detayı:**
- Playlist dosyaları `.m3u8` yerine **`.txt`** uzantılı
- Video segmentleri `.ts` yerine **`.woff2`** uzantılı (font dosyası gibi)
- Content-Type hâlâ `video/MP2T` (gerçek tip)
- CDN domain rastgele: `greenmountainventures.shop` (rotasyona tabi)
- CORS: sadece `https://hglamioz.com` kabul edilir

**Video API:**
```
GET /dl?op=view&file_code=8unzy967zw6r&hash=...&embed=1&adb=0&hls4=1
  → op: işlem tipi
  → file_code: dosya kimliği
  → hash: zamanlı erişim hash'i
  → adb: adblock tespit durumu (0=yok, 1=var)
  → hls4: HLS v4 formatı iste
```

---

### 2.4 Upcloud

| Özellik | Değer |
|---------|-------|
| **Oynatıcı domain** | `streameeeeee.site` |
| **Oynatıcı** | JWPlayer v8.36.7 + HLS.js |
| **Playlist CDN** | `stormfox27.live` (Cloudflare) |
| **Segment CDN** | `icynebula71.pro` (Cloudflare) — ayrı domain |
| **HLS yapısı** | `playlist.m3u8` → `1080/index.m3u8`, `720/index.m3u8`, `360/index.m3u8` |
| **Segment format** | `seg-{N}-v1-a1.{fake_ext}` — her segmente farklı uzantı |
| **URL imzası** | Şifreli token path + base64 dosya adı |
| **Altyazı** | `cca.megafiles.store` (VTT) |
| **Reklam** | iClick, ParkLogic, ShareThis, OneSignal push, AnimeCrush banner, Facebook Comments |
| **Koruma** | Google reCAPTCHA v2 invisible + `_k` token |

**Segment gizleme (en yaratıcı):**
```
seg-1-v1-a1.jpg    ← resim gibi görünüyor
seg-2-v1-a1.html   ← HTML sayfası gibi
seg-6-v1-a1.js     ← JavaScript dosyası gibi
seg-9-v1-a1.css    ← CSS dosyası gibi
seg-13-v1-a1.txt   ← metin dosyası gibi
```
Gerçek Content-Type: hepsi `video/MP2T`. Otomatik tarayıcılar ve content filter'lar için neredeyse görünmez.

**Base64 path gizleme:**
```
/file1/<token>/MTA4MA==/aW5kZXgubTN1OA==.m3u8
  → MTA4MA==    = "1080"
  → aW5kZXgubTN1OA== = "index.m3u8"
```

**Dual-CDN mimarisi:** Playlist'ler `stormfox27.live`'dan, segmentler `icynebula71.pro`'dan gelir. İkisi de Cloudflare arkasında.

---

### 2.5 Vidcloud

| Özellik | Değer |
|---------|-------|
| **Oynatıcı domain** | `streameeeeee.site` (Upcloud ile aynı platform) |
| **Oynatıcı** | JWPlayer v8.36.7 (`cdid=vidcloud-player`) |
| **Video CDN** | `eu13.raffaellocdn.net:2223` (Raffaello CDN) |
| **HLS yapısı** | `playlist.m3u8` → `720/index.m3u8` (3 kalite mevcut) |
| **Segment format** | Standart `seg-{N}-v1-a1.ts` |
| **URL imzası** | 256 karakter hex token path içinde |
| **Koruma** | reCAPTCHA invisible + `_k` token |

**Özel CDN detayı:** Port **2223** (standart 443 yerine). Bu, port tabanlı filtrelemeyi atlatmaya yönelik.

**API (Upcloud ile aynı):**
```
/embed-1/v3/e-1/getSources?id={videoId}&_k={key}
  → Şifreli/obfuscated m3u8 URL döner
```

---

### 2.6 Akcloud

| Özellik | Değer |
|---------|-------|
| **Oynatıcı domain** | `streameeeeee.site` (aynı platform) |
| **Oynatıcı** | JWPlayer v8.36.7 (`cdid=vidcloud-player`) |
| **Video CDN** | `akmzed.cloud` (Cloudflare) |
| **HLS yapısı** | `/_v1_akmzed/{signed_token}/{base64_filename}.m3u8` |
| **Segment format** | Şifreli/imzalı path'ler |
| **URL imzası** | İmzalı path + base64 dosya adı |
| **Koruma** | reCAPTCHA invisible + `_k` token + rate limit (10 req/60s) |

**Rate limiting:** `ratelimit-policy: 10;w=60` — 60 saniyede maksimum 10 istek.

---

### 2.7 VOE

| Özellik | Değer |
|---------|-------|
| **Public domain** | `voe.sx` |
| **Gerçek oynatıcı** | `dianaavoidthey.com` (DGA-tarzı rastgele domain) |
| **Oynatıcı** | JWPlayer v8.40.2 + HLS.js |
| **Video CDN** | `cdn-lwlvsywuuq2ifiqn.edgeon-bandwidth.com` (Edgeon/Limelight) |
| **HLS yapısı** | `/engine/hls2-c/01/16854/{hash}_,n,.urlset/master.m3u8` |
| **URL imzası** | HMAC token (`t`), başlangıç (`s`), süre (`e`=14400s/4 saat), dosya ID (`f`), edge node (`node`), IP prefix (`i`), ASN (`asn`), hız limiti (`sp`), istek token (`rq`) |
| **Koruma** | Turnstile + FingerprintJS BotD + detect-gpu (VM tespiti) |
| **Reklam** | Google IMA/DFP, iClick, Twitter pixel, gambling (Coolbet), adexchangeclear, FingerprintJS |

**En kapsamlı URL imzası:**
```
master.m3u8?t=LTqJOWvl9QaTfCz12wLxBe3KQY50TjQ4-3GnTxu2CrM
            &s=1774806048       (başlangıç timestamp)
            &e=14400            (süre: 4 saat)
            &f=84271905         (dosya ID)
            &node=pI2T3nZbnS/mGxI9adFw4fyTnu5fEPDGaHDmyLOikzs=
            &i=194.127          (IP prefix)
            &sp=2500            (hız limiti kbps)
            &asn=43357          (ISP ASN)
            &q=n                (kalite)
            &rq=rrQPpAh2JO4lyhrkPFXxlLecfJU7jBUOe5U7wD0i  (istek token)
```

**Triple-layer koruma:**
1. Cloudflare Turnstile — bot/insan ayrımı
2. FingerprintJS BotD — WebDriver, CDP, headless tarayıcı tespiti
3. detect-gpu — sanal makine ve emülatör tespiti (GPU benchmark)

**DGA domain rotasyonu:** `dianaavoidthey.com` gibi rastgele İngilizce kelimelerden oluşan domain'ler kullanılıyor. Periyodik olarak değiştirilir; domain tabanlı engellemeyi zorlaştırır.

---

## 3. CDN Altyapısı

| Provider | CDN | Tür | Konum | Ödeme modeli | Not |
|----------|-----|-----|-------|-------------|-----|
| **PrimeSrc** | `p16-sg.tiktokcdn.com` | ByteDance iç altyapısı | Singapur (Alibaba Cloud) | Yetkisiz/ücretsiz | Sürdürülemez, her an kapanabilir |
| **Filemoon** | SprintCDN (`r66nv9ed.com`) | Ticari CDN | Varşova | Ücretli | HMAC imzalı URL'ler |
| **StreamWish** | Cloudflare (`greenmountainventures.shop`) | Cloudflare CDN | Tallinn | Ücretli | Rastgele domain, `.woff2` gizleme |
| **Upcloud** | Cloudflare (`stormfox27.live` + `icynebula71.pro`) | Cloudflare CDN, dual domain | Değişken | Ücretli | Playlist ve segment ayrı domain |
| **Vidcloud** | Raffaello CDN (`raffaellocdn.net:2223`) | Ticari CDN | Avrupa | Ücretli | Non-standart port 2223 |
| **Akcloud** | Cloudflare (`akmzed.cloud`) | Cloudflare CDN | Değişken | Ücretli | İmzalı path + rate limit |
| **VOE** | Edgeon/Limelight (`edgeon-bandwidth.com`) | Ticari CDN | Değişken | Ücretli | Per-user subdomain, en kapsamlı imza |

### TikTok CDN detayı (PrimeSrc)

```
Host:    p16-sg.tiktokcdn.com
Path:    /obj/tos-alisg-avt-0068/<32-char-hex>
Anlam:
  p16-sg     → Platform 16, Singapur edge
  obj        → Object storage
  tos        → TikTok Object Storage
  alisg      → Alibaba Cloud Singapur bölgesi
  avt-0068   → Bucket/partition numarası
  <hex>      → Obje kimliği
```

Bu kamuya açık bir CDN ürünü değil. Upload mekanizması bilinmiyor. Muhtemel senaryolar:
- ByteDance'in başka bir ürünü (CapCut, Lark) üzerinden dolaylı yükleme
- Korumasız/eski bucket'a doğrudan erişim
- İçeriden sızmış credential

---

## 4. Reklam ve Analitik

### Provider başına reklam ağları

| Ağ | PrimeSrc | Filemoon | StreamWish | Upcloud | Vidcloud | Akcloud | VOE |
|----|----------|----------|------------|---------|----------|---------|-----|
| Google IMA/DFP | ✓ | - | ✓ | - | - | - | ✓ |
| Google Analytics | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Yandex Metrica | ✓ (99122182) | - | ✓ (102872415) | - | - | - | - |
| Adcash/iClick | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| adexchangeclear | ✓ | ✓ | ✓ | - | - | - | ✓ |
| RTMark | - | ✓ | ✓ | ✓ | - | - | - |
| adbpage (adblock tespit) | ✓ | ✓ | ✓ | - | - | - | ✓ |
| usrpubtrk | ✓ | ✓ | ✓ | - | - | - | ✓ |
| ShareThis | - | - | - | ✓ | ✓ | ✓ | - |
| OneSignal Push | - | - | - | ✓ | - | - | - |
| Facebook Comments | - | - | - | ✓ | ✓ | ✓ | - |
| Twitter/X pixel | - | - | - | - | - | - | ✓ |
| FingerprintJS | - | - | - | - | - | - | ✓ |
| Gambling affiliate | - | - | ✓ | - | - | - | ✓ |

### Yandex Metrica detayı

PrimeSrc'de **en yoğun tracker**: 56 istek/oturum. Toplanan veriler:
- Sayfa görüntüleme (`/watch/99122182`)
- Click map (`/clmap/99122182`) — x/y koordinatları ile tıklama haritası
- Reklam görüntüleme (`advert` parametreleri)

### Google reklam zinciri

```
Google Tag Manager → Google Analytics (GA4) → Google IMA SDK → securepubads.g.doubleclick.net
  → ippd=primesrc.me (yayıncı domain olarak bildirilir)
  → Google bu domain'i "embed servisi" olarak görür
  → İçeriğin telif durumu otomatik tespit edilmez
```

---

## 5. Koruma Mekanizmaları

### Provider başına koruma

| Mekanizma | PrimeSrc | Filemoon | StreamWish | Upcloud | Vidcloud | Akcloud | VOE |
|-----------|----------|----------|------------|---------|----------|---------|-----|
| Cloudflare Turnstile | ✓ | ✓ (primesrc) | ✓ (primesrc) | - | - | - | ✓ |
| Google reCAPTCHA | - | - | - | ✓ | ✓ | ✓ | - |
| FingerprintJS BotD | - | - | - | - | - | - | ✓ |
| detect-gpu (VM tespit) | - | - | - | - | - | - | ✓ |
| Challenge/Attest | - | ✓ | - | - | - | - | - |
| Service Worker FP | - | ✓ | - | - | - | - | - |
| İmzalı URL (HMAC) | - | ✓ (3 saat) | ✓ | ✓ | ✓ | ✓ | ✓ (4 saat) |
| IP/ASN bağlama | - | ✓ | ✓ | - | - | - | ✓ |
| Rate limiting | - | - | - | - | - | ✓ (10/60s) | - |
| Adblock tespit | ✓ | ✓ | ✓ | - | - | - | ✓ |
| Bot detection (usrpubtrk) | ✓ | ✓ | ✓ | - | - | - | ✓ |
| DGA domain rotasyonu | - | - | - | - | - | - | ✓ |
| Segment uzantı gizleme | - | - | ✓ (.woff2) | ✓ (karma) | - | - | - |
| Non-standart port | - | - | - | - | ✓ (2223) | - | - |
| CORS kısıtlaması | - | - | ✓ | ✓ | - | ✓ | - |

### Cloudflare Turnstile akışı (detay)

```
1. turnstile/v0/api.js yüklenir (site key: 0x4AAAAAACox-LngVREu55Y4)
2. /cdn-cgi/challenge-platform/h/g/cmg/1  → challenge manager
3. /cdn-cgi/challenge-platform/h/g/flow/ov1/... → akış doğrulama
4. /cdn-cgi/challenge-platform/h/g/pat/... → pattern verification
5. /cdn-cgi/challenge-platform/h/g/d/... → veri toplama
6. /cdn-cgi/challenge-platform/h/g/rc/... → sonuç callback
7. cf_clearance cookie'si verilir
```

### usrpubtrk bot detection (detay)

POST `/ut/hb.php` ile gönderilen veriler:
- WebDriver varlığı kontrolü
- Chrome DevTools Protocol (CDP) tespiti
- Otomatik tarayıcı global değişkenleri (`window.cdc`)
- Firefox UA uyumsuzlukları
- CSS render anomalileri
- Headless permission API kontrolü
- WebRTC varlığı
- Şüpheli kullanıcı input kalıpları

---

## 6. Segment Gizleme Teknikleri

### Karşılaştırma

| Provider | Playlist uzantısı | Segment uzantısı | Path gizleme | Etkinlik |
|----------|-------------------|-------------------|--------------|----------|
| PrimeSrc | `.m3u8` (standart) | uzantısız (hex path) | Yok | Düşük |
| Filemoon | `.m3u8` (standart) | `.ts` (standart) | Yok | Düşük |
| StreamWish | **`.txt`** | **`.woff2`** (font) | Token path | Yüksek |
| Upcloud | `.m3u8` (base64) | **`.jpg/.html/.js/.css/.txt`** (karma) | Base64 path | Çok yüksek |
| Vidcloud | `.m3u8` | `.ts` (standart) | 256-char hex token | Orta |
| Akcloud | `.m3u8` (base64) | Şifreli path | İmzalı token path | Yüksek |
| VOE | `.m3u8` | `.ts` (standart) | Per-user subdomain | Orta |

### Upcloud'un karma uzantı stratejisi

Her segment **farklı** bir web dosyası uzantısı alıyor:
```
seg-1  → .jpg   (resim gibi)
seg-2  → .html  (sayfa gibi)
seg-6  → .js    (script gibi)
seg-9  → .css   (stil gibi)
seg-13 → .txt   (metin gibi)
```

Bu teknik otomatik content scanner'ları, CDN kurallarını ve ağ filtreleme sistemlerini atlatmaya yönelik. Gerçek Content-Type her zaman `video/MP2T`.

---

## 7. Karşılaştırma Tabloları

### Platform ailesi

**Upcloud, Vidcloud ve Akcloud aynı platform:**
- Üçü de `streameeeeee.site` üzerinde
- Aynı `getSources` API'si
- Aynı `_k` token mekanizması
- Aynı JW Player 8.36.7
- JWPlayer ID: `vidcloud-player`
- Fark: sadece CDN backend'i

### Güvenlik seviyesi sıralaması (en güçlüden en zayıfa)

```
1. VOE          — Turnstile + FingerprintJS + detect-gpu + imzalı URL + DGA domain
2. Filemoon     — Challenge/Attest + Service Worker FP + imzalı URL
3. Akcloud      — reCAPTCHA + _k token + imzalı path + rate limit + CORS
4. Upcloud      — reCAPTCHA + _k token + base64 path + fake uzantı + dual CDN
5. StreamWish   — Turnstile + imzalı URL + .woff2 gizleme + bot detection
6. Vidcloud     — reCAPTCHA + _k token + hex token + port 2223
7. PrimeSrc     — Turnstile + cf_clearance — ama imzasız segment URL'leri
```

### Sürdürülebilirlik sıralaması

```
1. VOE          — Kendi CDN, DGA domain, en kapsamlı imza
2. Filemoon     — Ticari CDN (SprintCDN), challenge/attest
3. Akcloud      — Cloudflare CDN, imzalı path
4. Upcloud      — Dual Cloudflare CDN, fake uzantı
5. Vidcloud     — Raffaello CDN, standart yapı
6. StreamWish   — Cloudflare CDN, iyi gizleme ama rastgele domain
7. PrimeSrc     — TikTok CDN bağımlılığı, kontrol yok, her an kırılabilir
```

---

## 8. Sıfırdan En İyi Nasıl Yapılır?

Analiz edilen 7 provider'ın güçlü/zayıf yönlerinden çıkan derslerle, **sıfırdan kurulacak en iyi mimari** aşağıdaki gibi olurdu.

### 8.1 Genel mimari

```
┌────────────────────────────────────────────────────────┐
│                    Frontend (SPA)                       │
│  Next.js / Nuxt.js / SvelteKit                         │
│  Film kataloğu, arama, kullanıcı yönetimi              │
│  Server-side rendering (SEO + hız)                     │
└──────────────────────┬─────────────────────────────────┘
                       │ iframe embed
┌──────────────────────▼─────────────────────────────────┐
│                  Embed API Katmanı                      │
│  Cloudflare Workers veya Fastly Compute                 │
│  İçerik ID → imzalı manifest URL üretimi                │
│  Rate limiting, IP/ASN doğrulama                        │
│  Turnstile / hCaptcha bot koruması                      │
└──────────────────────┬─────────────────────────────────┘
                       │ imzalı URL
┌──────────────────────▼─────────────────────────────────┐
│               HLS Manifest Katmanı                      │
│  Dinamik m3u8 üretimi (edge'de)                         │
│  Per-kullanıcı imzalı segment URL'leri                  │
│  Adaptive bitrate (360p, 720p, 1080p, 4K)              │
│  Ayrı ses izleri + altyazı referansları                 │
└──────────────────────┬─────────────────────────────────┘
                       │ imzalı segment URL
┌──────────────────────▼─────────────────────────────────┐
│                  CDN / Storage                          │
│  Cloudflare R2 (depolama, egress ücretsiz)              │
│  veya Bunny Storage + Bunny CDN                         │
│  veya S3 + CloudFront (signed URL)                      │
│  Segment dosyaları: şifreli veya imzalı path            │
└────────────────────────────────────────────────────────┘
```

### 8.2 Video pipeline

```
Kaynak dosya (MP4/MKV)
  │
  ▼
FFmpeg encode (veya bulut: AWS MediaConvert, Mux)
  │  → Adaptive bitrate: 360p, 720p, 1080p
  │  → Codec: H.264 (uyumluluk) veya H.265 (verimlilik)
  │  → Ses: AAC-LC, opsiyonel çoklu dil izi
  │  → Segment süresi: 4-6 saniye (2s çok kısa, 10s çok uzun)
  │
  ▼
HLS paketleme
  │  → master.m3u8 + kalite variant'ları
  │  → Opsiyonel: #EXT-X-KEY ile AES-128 şifreleme
  │  → Opsiyonel: DRM (Widevine L1/L3, FairPlay)
  │
  ▼
Object storage'a yükleme
  │  → R2: $0.015/GB/ay depolama, egress ücretsiz
  │  → Bunny: $0.005/GB depolama, $0.01/GB egress
  │  → S3: $0.023/GB/ay depolama + CloudFront egress
  │
  ▼
CDN dağıtımı
  → Signed URL (süre + IP + ASN bağlı)
  → Edge cache (hot content için)
```

### 8.3 URL imzalama (VOE modelinden esinlenme)

```
Manifest URL:
  /hls/{content_id}/master.m3u8
    ?t=<HMAC-SHA256 imza>
    &s=<başlangıç timestamp>
    &e=<süre saniye, ör. 7200>
    &ip=<kullanıcı IP hash>
    &asn=<ISP ASN>

Segment URL (manifest içinde):
  /seg/{content_id}/{quality}/{segment_number}
    ?t=<segment-seviyesi HMAC>
    &s=<timestamp>
    &e=<süre>

İmza üretimi (Cloudflare Worker'da):
  const data = `${contentId}:${quality}:${segNum}:${ip}:${asn}:${start}:${expire}`;
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
```

### 8.4 Koruma katmanları (analiz edilen en iyilerden)

```
Katman 1: Bot koruması
  → Cloudflare Turnstile (ücretsiz, etkili)
  → Veya hCaptcha (alternatif)
  → İlk embed yüklemesinde çözülür

Katman 2: API güvenliği
  → Rate limiting (Cloudflare Workers ile)
  → Referer / Origin doğrulama
  → Session token (kısa ömürlü, tek kullanımlık)

Katman 3: Video güvenliği
  → İmzalı URL (HMAC, süre + IP bağlı)
  → Opsiyonel AES-128 segment şifreleme
  → Opsiyonel DRM (profesyonel içerik için)

Katman 4 (opsiyonel): Segment gizleme
  → Uzantı randomizasyonu (.woff2, .png, .css gibi)
  → Base64 path gizleme
  → Rastgele CDN subdomain
```

### 8.5 Neden hiçbiri Cloudflare R2 / Workers kullanmıyor?

Analiz edilen 7 provider'ın **hiçbiri** video depolama veya embed API için Cloudflare R2 veya Workers kullanmıyor. Bunun teknik ve operasyonel nedenleri var:

#### Cloudflare'i nasıl kullanıyorlar vs nasıl kullanmıyorlar

```
Cloudflare'i KULLANIYORLAR (reverse proxy olarak):
  ✓ StreamWish   → greenmountainventures.shop (server: cloudflare)
  ✓ Upcloud      → stormfox27.live, icynebula71.pro (server: cloudflare)
  ✓ Akcloud      → akmzed.cloud (server: cloudflare)
  ✓ PrimeSrc     → primevid.click (server: cloudflare)
  ✓ Filemoon     → bysejikuar.com (server: cloudflare)

Cloudflare'i KULLANMIYORLAR (depolama/storage olarak):
  ✗ Hiçbiri R2 kullanmıyor
  ✗ Hiçbiri Workers'da manifest üretmiyor
  ✗ Hiçbiri Cloudflare Stream kullanmıyor
```

Yani Cloudflare'i **kalkan** (origin IP gizleme, DDoS koruması, cache) olarak kullanıyorlar ama **depo** olarak kullanmıyorlar. Nedenleri:

#### Neden R2 / Workers değil?

| Neden | Açıklama | Provider örneği |
|-------|----------|-----------------|
| **DMCA uyumu** | Cloudflare ABD merkezli ve DMCA takedown'lara çok hızlı yanıt veriyor. R2'de depolanan içerik şikayet gelince **saatler içinde** silinir. | Hepsi — bu yüzden depolamayı Cloudflare'den ayırıyorlar |
| **Hesap izlenebilirliği** | R2 hesabı ödeme bilgisi gerektirir; doğrudan kağıt izi oluşturur. Reverse proxy için ise ücretsiz plan yeterli, anonim kayıt mümkün. | Hepsi |
| **TOS Bölüm 2.8** | Cloudflare'in Free/Pro planlarında büyük medya dosyası sunmak yasak (Self-Serve Subscription Agreement §2.8). R2 bundan muaf ama Cloudflare dikkatli izliyor. | PrimeSrc — TikTok CDN'i tercih ediyor |
| **Tek nokta riski** | R2'de tüm içerik = Cloudflare hesap kapatılırsa **her şey** gider. Başka CDN = sadece o domain gider, içerik hâlâ depolarda. | VOE — Edgeon CDN, hesap bağımsız |
| **Domain rotasyonu** | Cloudflare proxy arkasında domain değiştirmek kolay (DNS değişikliği). Ama R2 bucket'ı hesaba bağlı, domain değişince bucket değişmez. | StreamWish — random domain rotasyonu |
| **"Bulletproof" hosting** | Bazı provider'lar DMCA'ya yavaş yanıt veren hosting kullanıyor (genelde Doğu Avrupa, Asya). Cloudflare böyle bir hizmet sunmuyor. | Filemoon (SprintCDN, Varşova) |

#### Provider'ların gerçek depolama stratejileri

| Provider | Depolama | Cloudflare rolü | Neden bu seçim |
|----------|----------|-----------------|----------------|
| **PrimeSrc** | TikTok CDN (ByteDance obje deposu) | Sadece manifest proxy | Sıfır maliyet, anonim upload |
| **Filemoon** | SprintCDN (Polonya) | Embed sayfası proxy | AB dışı DMCA yavaşlığı |
| **StreamWish** | Bilinmeyen origin (CF arkasında) | Proxy + cache | Random domain ile origin gizleme |
| **Upcloud** | Bilinmeyen origin (CF arkasında, dual domain) | Proxy + cache | Playlist ve segment ayrı origin |
| **Vidcloud** | Raffaello CDN (port 2223) | Yok (doğrudan CDN) | Non-standart port ile gizleme |
| **Akcloud** | Bilinmeyen origin (CF arkasında) | Proxy + cache | İmzalı path + rate limit |
| **VOE** | Edgeon/Limelight CDN | Turnstile için CF | Büyük ticari CDN, per-user subdomain |

#### Önemli ayrım: Cloudflare proxy ≠ Cloudflare storage

```
Cloudflare PROXY (ücretsiz, hepsi kullanıyor):
  → DNS'i Cloudflare'e yönlendir
  → Origin IP gizlenir
  → DDoS koruması, WAF, cache
  → Domain kapatılırsa: yeni domain aç, aynı origin'e yönlendir
  → Hesap kapatılırsa: yeni hesap aç, 5 dakikada geri gel

Cloudflare R2 STORAGE (ücretli, hiçbiri kullanmıyor):
  → İçerik Cloudflare'in disklerinde
  → DMCA gelince Cloudflare siler
  → Hesap kapatılırsa: TÜM İÇERİK KAYBOLUR
  → Yedek yoksa geri dönüş yok
```

### 8.6 Bu bilgiye göre gerçekçi stack seçenekleri

İki farklı senaryo için iki farklı stack:

#### Senaryo A: Meşru platform (lisanslı/kendi içerik)

Bu durumda DMCA/takedown endişesi olmadığı için Cloudflare R2 en iyi seçim:

```
Frontend:       Next.js 15 (App Router, SSR)
Embed API:      Cloudflare Workers (TypeScript)
Video storage:  Cloudflare R2 (egress ücretsiz)
CDN:            Cloudflare (R2 ile entegre)
Encode:         FFmpeg (self-hosted) veya Coconut.co / Mux (managed)
Oynatıcı:       Shaka Player veya Video.js + hls.js
Bot koruması:   Cloudflare Turnstile
URL imzalama:   HMAC-SHA256 (Worker'da, VOE modeli)
Veritabanı:     PostgreSQL + Redis
Analitik:       Plausible veya self-hosted Umami
Reklam:         Google IMA SDK (VAST/VPAID)
```

**Maliyet (100TB/ay):** ~$20/ay (R2 egress ücretsiz)

#### Senaryo B: Analiz edilen provider'ların gerçekte kullandığı stack

Bu stack'i "en iyi pratik" olarak değil, "gerçekte ne yapıyorlar" olarak belgeliyoruz:

```
Frontend:       Custom SPA (React/Vue, minified + obfuscated)
Embed API:      Elixir/Phoenix veya Node.js (kendi sunucu, CF proxy arkasında)
Video storage:  Ayrı origin sunucu (bulletproof hosting veya TikTok CDN abuse)
CDN proxy:      Cloudflare FREE plan (sadece reverse proxy, storage değil)
                + Rastgele domain (greenmountainventures.shop, dianaavoidthey.com)
Encode:         Muhtemelen FFmpeg (kendi sunucularında)
Oynatıcı:       JWPlayer 8.x (lisanssız/cracked kullanım şüphesi)
Bot koruması:   Cloudflare Turnstile + FingerprintJS + custom challenge/attest
URL imzalama:   HMAC + IP + ASN + süre (VOE en kapsamlı)
Segment gizleme: Fake uzantılar (.woff2, .jpg, .css), base64 path
Veritabanı:     Bilinmiyor (muhtemelen PostgreSQL/MySQL)
Reklam:         Adcash/iClick (ana gelir) + Google IMA (yan gelir) + Yandex
Domain stratejisi: Rotasyon — domain kapatılınca yenisi açılır
```

**Maliyet:** Düşük ($50-200/ay sunucu + $0-50 CDN), ama operasyonel maliyet yüksek (domain yönetimi, takedown yanıtlama, hesap yenileme).

### 8.7 Oynatıcı seçimi

| Seçenek | Lisans | HLS | DASH | DRM | Analiz edilen kullanım |
|---------|--------|-----|------|-----|------------------------|
| **JWPlayer** (ticari) | Ücretli | ✓ | ✓ | ✓ | 6/7 provider bunu kullanıyor |
| **hls.js** (açık kaynak) | BSD | ✓ | - | - | JWPlayer'ın HLS backend'i olarak |
| **Shaka Player** (Google) | Apache 2.0 | ✓ | ✓ | ✓ | Hiçbiri kullanmıyor |
| **Video.js** (açık kaynak) | Apache 2.0 | ✓ | ✓ | Plugin | Hiçbiri kullanmıyor |

**Neden hepsi JWPlayer?**
- Hazır UI, kontroller, Chromecast, VAST reklam entegrasyonu
- Tek satır ile kurulum
- HLS.js'i dahili olarak kullanıyor
- Muhtemelen **lisanssız** kullanıyorlar (telemetri `prd.jwpltx.com`'a gidiyor ama ödeme yapılıp yapılmadığı belli değil)

**Meşru kullanım için öneri:** Shaka Player (ücretsiz, DRM dahil) veya Video.js + hls.js. JWPlayer güçlü ama ücretli.

### 8.8 Maliyet karşılaştırması

100TB/ay trafik senaryosu:

| Çözüm | Depolama | Egress | Toplam/ay | DMCA riski | Kim için |
|-------|----------|--------|-----------|------------|----------|
| **Cloudflare R2 + Workers** | ~$15 (1TB) | $0 | ~$20 | İçerik hemen silinir | Meşru platform |
| **Bunny CDN + Storage** | ~$5 (1TB) | ~$1,000 | ~$1,005 | Orta (AB merkezli) | Meşru platform |
| **S3 + CloudFront** | ~$23 (1TB) | ~$8,500 | ~$8,523 | İçerik hemen silinir | Enterprise |
| **Mux** | - | ~$5-12/1000 dk | Değişken | Çok yüksek | Profesyonel |
| **Bulletproof + CF proxy** | ~$50-200 | ~$0 (CF cache) | ~$50-200 | Düşük (yavaş yanıt) | Analiz edilen model |
| **TikTok CDN** | $0 | $0 | $0 | N/A (kontrol yok) | PrimeSrc modeli |

### 8.9 Reklam stratejisi karşılaştırması

| Strateji | Kullanıcı | Avantaj | Dezavantaj |
|----------|-----------|---------|------------|
| **Google IMA/DFP** | PrimeSrc, StreamWish, VOE | Yüksek RPM, programmatic | Policy ihlalinde kalıcı ban |
| **Adcash/iClick** | Hepsi (ana gelir) | Piracy sitelerine toleranslı | Düşük RPM, agresif reklamlar |
| **Yandex Metrica + Ads** | PrimeSrc, StreamWish | Detaylı analitik, Rus pazar | Sınırlı küresel kapsam |
| **Doğrudan affiliate** | StreamWish (gambling), VOE (Coolbet) | Yüksek CPA | Niş, güvenilirlik sorunu |
| **Push notification** | Upcloud (OneSignal) | Geri dönüş trafiği | Kullanıcı deneyimi bozar |

**Gerçek gelir modeli:** Analiz edilen provider'lar **Adcash/iClick'i ana gelir** olarak kullanıyor (piracy dostu), Google IMA'yı **yan gelir** olarak (domain katmanlama ile policy atlatma). Meşru bir platformda sadece **Google IMA + doğrudan satış** yeterli ve çok daha yüksek RPM verir.

### 8.10 Teknoloji stack — nihai öneri

```
MEŞRU PLATFORM İÇİN (önerilen):
──────────────────────────────────
Frontend:         Next.js 15 (SSR, SEO)
Embed API:        Cloudflare Workers (edge'de, düşük latency)
Video storage:    Cloudflare R2 ($0.015/GB, egress ücretsiz)
CDN:              Cloudflare (R2 ile entegre, otomatik)
Encode:           FFmpeg pipeline (GPU ile hızlı) veya Coconut.co
HLS paketleme:    Bento4 mp4dash veya FFmpeg
Oynatıcı:         Shaka Player (ücretsiz, DRM dahil)
Bot koruması:     Cloudflare Turnstile (ücretsiz)
URL imzalama:     HMAC-SHA256 (Worker'da, süre + IP + ASN)
Veritabanı:       PostgreSQL (Neon.tech serverless) + Upstash Redis
Analitik:         Plausible veya self-hosted Umami
Reklam:           Google IMA SDK (VAST/VPAID pre-roll, mid-roll)
Ödeme (opsiyonel): Stripe (abonelik)
```

```
ANALİZ EDİLEN PROVIDER'LARIN FİİLEN KULLANDIĞI:
──────────────────────────────────────────────────
Frontend:         Custom React/Vue SPA (minified + webpack)
Embed API:        Elixir/Phoenix veya Node.js (CF proxy arkasında)
Video storage:    Bulletproof hosting / TikTok CDN / SprintCDN / Edgeon
CDN:              Cloudflare FREE (sadece reverse proxy, storage değil)
Encode:           FFmpeg (kendi sunucu)
Oynatıcı:         JWPlayer 8.x (muhtemelen lisanssız)
Bot koruması:     Turnstile + reCAPTCHA + FingerprintJS + usrpubtrk
URL imzalama:     HMAC + IP + ASN + süre + dosya ID + edge node
Segment gizleme:  Fake uzantı (.woff2/.jpg/.css), base64 path, random domain
Veritabanı:       Bilinmiyor
Reklam:           Adcash/iClick (ana) + Google IMA (yan) + Yandex + affiliate
Domain stratejisi: Sürekli rotasyon (DGA-tarzı isimler)
```

### 8.11 Analiz edilen sistemlerden çıkan dersler

| Ders | Kaynak | Neden önemli |
|------|--------|-------------|
| İmzalı URL şart | VOE, Filemoon | Her segment URL'sine HMAC + süre + IP bağla — hotlink ve scraping engeli |
| Cloudflare = proxy, storage değil | Hepsi | Proxy ücretsiz ve anonim; storage hesap bağlı ve DMCA'ya açık |
| Segment gizleme etkili | StreamWish, Upcloud | Uzantı ve path randomizasyonu content filter'ları atlatır |
| Tek CDN'e bağımlılık tehlikeli | PrimeSrc (TikTok) | Kontrol dışı altyapıya güvenmek sürdürülemez |
| Bot koruması katmanlı olmalı | VOE | Tek Turnstile yetmez; fingerprint + VM detection ekle |
| JWPlayer sektör standardı | 6/7 provider | Hazır UI + VAST + HLS + Chromecast = hızlı kurulum |
| Adcash/iClick ana gelir | Hepsi | Piracy-tolerant reklam ağı; meşru platformda gerek yok |
| Domain rotasyonu zorunlu | Hepsi | Meşru içerikle buna gerek kalmaz — en büyük avantaj |
| Rate limiting basit ama etkili | Akcloud | 10 req/60s gibi kurallar scraping'i yavaşlatır |
| Multi-domain analizi zorlaştırır | StreamWish, Filemoon | Playlist ve segment ayrı domain = daha zor reverse engineering |

---

> **Son not:** Bu rapor tamamen teknik analiz amaçlıdır. Analiz edilen sistemlerin çoğu telif hakları açısından sorunlu içerik dağıtıyor. Meşru bir platform kurmak için lisanslı içerik ve uygun yasal çerçeve şarttır.
