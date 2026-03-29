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

### 8.5 Oynatıcı seçimi

| Seçenek | Lisans | HLS | DASH | DRM | Not |
|---------|--------|-----|------|-----|-----|
| **hls.js** (açık kaynak) | BSD | ✓ | - | - | Hafif, özelleştirilebilir |
| **Shaka Player** (Google) | Apache 2.0 | ✓ | ✓ | ✓ | DRM desteği dahil |
| **Video.js** (açık kaynak) | Apache 2.0 | ✓ | ✓ | Plugin | Geniş ekosistem |
| **JWPlayer** (ticari) | Ücretli | ✓ | ✓ | ✓ | Analiz edilen 6/7 provider bunu kullanıyor |

**Öneri:** Meşru kullanımda **Shaka Player** (ücretsiz, DRM dahil) veya **Video.js + hls.js plugin**. JWPlayer güçlü ama ücretli ve telemetri gönderiyor.

### 8.6 Maliyet karşılaştırması

100TB/ay trafik senaryosu (orta ölçekli site):

| Çözüm | Depolama | Egress | Toplam/ay | Not |
|-------|----------|--------|-----------|-----|
| **Cloudflare R2 + Workers** | ~$15 (1TB) | $0 | ~$20 | En ucuz, egress ücretsiz |
| **Bunny CDN + Storage** | ~$5 (1TB) | ~$1,000 | ~$1,005 | Çok hızlı, ama egress var |
| **S3 + CloudFront** | ~$23 (1TB) | ~$8,500 | ~$8,523 | Pahalı ama enterprise-grade |
| **Mux** | - | ~$5-12/1000 dk | Değişken | Managed, encode dahil |
| **TikTok CDN** | $0 | $0 | $0 | Yetkisiz, her an kapanabilir |

**Öneri:** Maliyet/kontrol dengesi için **Cloudflare R2 + Workers**. Egress ücretsiz olması büyük avantaj.

### 8.7 Reklam entegrasyonu (meşru)

```
1. Google Ad Manager (DFP) + IMA SDK
   → Pre-roll, mid-roll, post-roll video reklamları
   → VAST/VPAID standardı
   → Programmatic gelir

2. Opsiyonel: Yandex Metrica
   → Detaylı kullanıcı analitik
   → Click map, scroll map

3. Opsiyonel: Self-serve reklam paneli
   → Doğrudan reklam veren ile çalışma
   → Daha yüksek RPM
```

### 8.8 Teknoloji stack önerisi

```
Frontend:       Next.js 15 (App Router, SSR)
Embed API:      Cloudflare Workers (TypeScript)
Video storage:  Cloudflare R2
CDN:            Cloudflare (R2 ile entegre, egress ücretsiz)
Encode:         FFmpeg (self-hosted) veya Mux (managed)
Oynatıcı:       Shaka Player veya Video.js + hls.js
Bot koruması:   Cloudflare Turnstile
URL imzalama:   HMAC-SHA256 (Worker'da)
Veritabanı:     PostgreSQL (içerik kataloğu) + Redis (oturum/cache)
Analitik:       Plausible veya self-hosted Umami (GDPR uyumlu)
Reklam:         Google IMA SDK
```

### 8.9 Analiz edilen sistemlerden çıkan dersler

| Ders | Kaynak | Uygulama |
|------|--------|----------|
| İmzalı URL şart | VOE, Filemoon | Her segment URL'sine HMAC + süre + IP bağla |
| Segment gizleme etkili | StreamWish, Upcloud | Uzantı ve path randomizasyonu content filter'ları atlatır |
| Tek CDN'e bağımlılık tehlikeli | PrimeSrc (TikTok) | Kendi storage + CDN kullan |
| Bot koruması gerekli | Hepsi | Turnstile veya reCAPTCHA embed API'nin önünde |
| Domain rotasyonu sürdürülemez | Hepsi | Meşru içerikle domain rotasyonuna gerek kalmaz |
| Multi-domain dikkat dağıtır | StreamWish, Filemoon | Playlist ve segment ayrı domain = daha zor analiz ama daha karmaşık bakım |
| Rate limiting basit ama etkili | Akcloud | 10 req/60s gibi kurallar scraping'i yavaşlatır |

---

> **Son not:** Bu rapor tamamen teknik analiz amaçlıdır. Analiz edilen sistemlerin çoğu telif hakları açısından sorunlu içerik dağıtıyor. Meşru bir platform kurmak için lisanslı içerik ve uygun yasal çerçeve şarttır.
