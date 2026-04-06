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
9. [Maks OPSEC + Düşük Bütçe Roadmap](#9-maks-opsec--düşük-bütçe--kamu-embed-sistemi-roadmap)
   - 9.0 [İçerik Nereden Gelir?](#90-i̇çerik-nereden-gelir--depolama-olmadan-binlerce-film)
   - 9.0.2 [70K Film + 30K Dizi — Tam Bağımsız Embed](#902-70k-film--30k-dizi--tam-bağımsız-embed-servisi)
   - 9.1 [OPSEC Kimlik Zinciri](#91-opsec-kimlik-zinciri--sıfır-i̇z)
   - 9.2+ [Mimari, Roadmap, Koruma, Maliyet](#92-mimari--düşük-bütçe-versiyonu)

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

### 8.0 Neden hiçbiri Cloudflare R2 / Workers kullanmıyor?

Benim önerim Cloudflare R2 + Workers idi — ama analiz edilen **7 provider'ın hiçbiri** bunu kullanmıyor. Sebepleri anlamak kritik:

#### OPSEC (Operasyonel Güvenlik) nedenleri

| Neden | Açıklama |
|-------|----------|
| **DMCA uyumu** | Cloudflare ABD şirketi. R2'ye yüklenen telif ihlalli içerik için DMCA notice geldiğinde Cloudflare **hemen kaldırır**. Analiz edilen provider'lar bunu bildiği için kendi depolarını R2'ye koymaz. |
| **Hesap izlenebilirliği** | R2 hesabı açmak için **kredi kartı / ödeme bilgisi** gerekir. Bu bir kağıt izi bırakır. TikTok CDN'i "anonim" kullanmak veya shell company ile SprintCDN almak daha az iz bırakır. |
| **Tek nokta kapanma riski** | Cloudflare hesabı kapatılırsa **tüm içerik** bir anda gider. Dağıtık veya "başkasının" CDN'ini kullanmak bu riski azaltır. |
| **Cloudflare zaten proxy olarak kullanılıyor** | StreamWish, Upcloud, Akcloud Cloudflare'i **CDN/proxy** olarak kullanıyor ama **storage olarak değil**. Asıl dosyalar arkadaki sunucularda; Cloudflare sadece önünde duruyor. Böylece Cloudflare DMCA alsa bile sadece proxy kesilir, dosyalar hâlâ duruyor. |

#### Ticari / teknik nedenler

| Neden | Açıklama |
|-------|----------|
| **Mevcut altyapı** | Bu servisler yıllardır var; kendi sunucu parkları, anlaşmalı CDN'leri mevcut. R2'ye geçiş = tüm pipeline'ı yeniden yazma. |
| **Jurisdiksiyon seçimi** | SprintCDN (Polonya), Raffaello CDN (muhtemelen Doğu Avrupa), Edgeon — bunlar ABD dışı veya DMCA uygulaması daha yavaş olan yargı bölgelerinde. |
| **Bulk anlaşma** | Ticari CDN'lerle **toptan fiyat anlaşması** yapılmış olabilir; R2'nin "ücretsiz egress" avantajı büyük hacimlerde bile yeterli olmayabilir (örn. encode/transcode maliyeti, Workers limitleri). |
| **Port/protokol esnekliği** | Vidcloud port 2223 kullanıyor. R2/Workers sadece 443/80. Özel portlar = daha az filtreleme. |

#### Her provider ne yapıyor ve neden?

| Provider | CDN seçimi | Neden bu CDN? |
|----------|-----------|---------------|
| **PrimeSrc** | TikTok CDN (yetkisiz) | $0 maliyet, hesap gerekmez, anonim. En kırılgan ama en ucuz. |
| **Filemoon** | SprintCDN (Polonya) | Doğu Avrupa CDN, DMCA süreci yavaş, HMAC imzalı URL desteği var. |
| **StreamWish** | Cloudflare (proxy) + arka sunucu | Cloudflare sadece önde; asıl dosyalar kendi sunucusunda. Domain rotasyonu kolay. |
| **Upcloud** | Cloudflare (proxy) + arka sunucu (dual domain) | Playlist ve segment ayrı domain = bir tanesi kapansa diğeri devam eder. |
| **Vidcloud** | Raffaello CDN (port 2223) | Niş CDN, non-standart port, daha az dikkat çeker. |
| **Akcloud** | Cloudflare (proxy) + arka sunucu | Kendi domain'i (`akmzed.cloud`), imzalı path'ler. |
| **VOE** | Edgeon/Limelight | Büyük ticari CDN, per-user subdomain desteği, en kapsamlı imza. |

#### Özet: Cloudflare R2 neden önerilir ama kullanılmaz?

```
Meşru içerik için:  R2 + Workers = en iyi (ucuz, hızlı, güvenilir, legal)
İzinsiz içerik için: R2 = en kötü (DMCA anında kaldırır, hesap iz bırakır)

Bu yüzden analiz edilen provider'lar:
  → Ya başkasının CDN'ini yetkisiz kullanır (TikTok)
  → Ya DMCA'nın yavaş işlediği CDN'leri tercih eder (SprintCDN, Raffaello)
  → Ya Cloudflare'i sadece proxy olarak kullanır (asıl dosyalar arkada)
```

---

### 8.0.1 MediaFlow Proxy kamu embed olarak kullanılabilir mi?

Toplulukta "MediaFlow Proxy'yi herkese açık embed servisi olarak kullan" şeklinde iddialar var. **Pratikte bu çalışmaz.** Sebebleri:

#### MediaFlow Proxy ne yapar, ne yapmaz?

```
MediaFlow'un yaptığı:
  ✓ Upstream URL'lerini proxy'ler (Real-Debrid, torrent, IPTV)
  ✓ DASH → HLS dönüşümü
  ✓ ClearKey DRM çözme
  ✓ Acestream P2P proxy
  ✓ Telegram MTProto streaming
  ✓ IP tabanlı erişim kontrolü

MediaFlow'un YAPMADIĞI:
  ✗ İçerik depolama (storage yok — sadece proxy)
  ✗ Embed player sunma (iframe/oynatıcı yok)
  ✗ CDN dağıtımı (edge node yok, tek sunucu)
  ✗ Reklam entegrasyonu (Google IMA vb.)
  ✗ HLS manifest üretimi (upstream'den olduğu gibi iletir)
  ✗ Video encode/transcode pipeline (GPU transcoding opsiyonel ama üretim seviyesi değil)
```

#### Neden kamu embed olarak çalışmaz?

| Sorun | Detay |
|-------|-------|
| **Bandwidth darboğazı** | Tüm trafik TEK sunucudan geçer. 1000 kullanıcı × 5 Mbps = **5 Gbps** sunucu bant genişliği gerekir. VOE'da Edgeon CDN yüzlerce edge node ile bunu dağıtır; MediaFlow'da dağıtım yok. |
| **Real-Debrid ban politikası** | RD ToS açıkça diyor: "account is for personal use only". Farklı IP'lerden eşzamanlı erişim = hesap askıya alınır. 100 farklı kullanıcının IP'si ile RD'ye gitmek = anında ban. |
| **Upstream rate limiting** | Real-Debrid, torrent tracker'lar veya diğer upstream kaynaklar kişisel kullanım için tasarlanmış. Binlerce eşzamanlı istek = throttle veya ban. |
| **Embed altyapısı yok** | MediaFlow bir HLS URL verir — ama embed iframe, oynatıcı UI, reklam entegrasyonu, altyazı yönetimi hiçbiri yok. Bunların hepsini sıfırdan yazmanız gerekir. |
| **Ölçeklenmez** | MediaFlow tek bir Python/aiohttp process. Yatay ölçekleme (horizontal scaling) tasarlanmamış. Birden fazla instance load-balancer arkasına koysanız bile her instance ayrı upstream bağlantısı açar — bu upstream'i patlatır. |
| **İçerik güvenilirliği** | Upstream (RD) kapanırsa, torrent seed'leri biterse, IPTV kaynağı değişirse = içerik kaybolur. Embed servisleri kendi storage'larına sahip (VOE → Edgeon, Filemoon → SprintCDN). |
| **Maliyet** | "Ücretsiz" gibi görünüyor ama 100 TB/ay bant genişliği = sunucu maliyeti **$500-2000/ay**. R2 egress ücretsiz, Edgeon toptan anlaşmalı. MediaFlow'da bu maliyeti siz karşılarsınız. |

#### Sayılarla karşılaştırma

```
Senaryo: 10,000 eşzamanlı kullanıcı, 720p (3 Mbps)

MediaFlow Proxy:
  Gerekli bant genişliği:  10,000 × 3 Mbps = 30 Gbps (TEK SUNUCU)
  Aylık trafik:            ~10 PB
  Sunucu maliyeti:         Mümkün değil (tek sunucu 30 Gbps kaldıramaz)
  Upstream bağımlılığı:    Real-Debrid → ban (farklı IP'ler)

VOE (Edgeon CDN):
  Gerekli bant genişliği:  Edgeon'un 100+ edge node'una dağıtılmış
  Aylık trafik:            ~10 PB (CDN ile dağıtık)
  CDN maliyeti:            Toptan anlaşma ($0.005-0.02/GB)
  Upstream bağımlılığı:    Kendi storage → kontrol altında
```

#### Sonuç

```
MediaFlow Proxy = kişisel Stremio proxy'si    → MÜKEMMEL (bunun için tasarlandı)
MediaFlow Proxy = kamu embed servisi           → ÇALIŞMAZ (mimari olarak uygun değil)

Neden söylentiler var?
  → Bazı kişiler 5-10 arkadaşa özel link paylaşarak kullanıyor
  → Bu "çalışıyor" ama 5 kişi ≠ kamu embed (10,000+ kullanıcı)
  → Real-Debrid farklı IP'leri henüz tespit etmemişse şanslısınız, ama sürdürülemez
```

---

### 8.0.2 Jellyfin + Gelato + AIOStreams + MediaFlow + Real-Debrid stack'i

Bu stack sıkça öneriliyor. Karşılaştıralım:

#### Bileşenler

| Bileşen | Ne yapıyor | Açık kaynak mı? |
|---------|-----------|-----------------|
| **Jellyfin** | Self-hosted medya sunucusu (Plex alternatifi). Kütüphane yönetimi, transcode, kullanıcı yönetimi. | Evet (GPL) |
| **Gelato** | Stremio'nun tarayıcı tabanlı web client'ı. Eklentilerle içerik keşfi + oynatma. | Evet |
| **AIOStreams** | Stremio eklentisi / aggregator. Birden fazla kaynaktan (torrent indexer, hoster) link toplar. | Evet |
| **MediaFlow Proxy** | Stream URL'lerini proxy'ler. Origin'i gizler, CORS çözer, bazen transcode yapar. | Evet |
| **Real-Debrid** | Ücretli debrid servisi (~€3/ay). Torrent'leri kendi sunucusunda cache'ler, hızlı direkt link verir. | Hayır (ticari servis) |

#### Bu stack ne için tasarlanmış?

```
Amaç:     KİŞİSEL kullanım (kendi izlemeniz)
Ölçek:    1-5 kullanıcı
Model:    "Akıllı istemci" — kaynakları topla, debrid ile çöz, izle
Hosting:  Self-hosted (kendi bilgisayar/sunucu)
Gelir:    Yok (kişisel kullanım)
```

#### Analiz edilen embed provider'lar ne için tasarlanmış?

```
Amaç:     KAMU SERVİSİ (binlerce/milyonlarca kullanıcıya embed)
Ölçek:    10,000 - 1,000,000+ eşzamanlı kullanıcı
Model:    "Sunucu merkezli" — HLS manifest üret, CDN'den dağıt
Hosting:  Dağıtık sunucu + CDN altyapısı
Gelir:    Reklam (Google IMA, Yandex, iClick vb.)
```

#### Karşılaştırma tablosu

| Kriter | Jellyfin/Gelato Stack | Analiz edilen embed provider'lar | Meşru embed platform |
|--------|----------------------|----------------------------------|---------------------|
| **Amaç** | Kişisel izleme | Kamu embed servisi | Kamu embed servisi |
| **Ölçek** | 1-5 kişi | 100K+ kullanıcı | 100K+ kullanıcı |
| **İçerik kaynağı** | Real-Debrid (torrent cache) | Kendi pipeline + CDN | Lisanslı dosyalar |
| **CDN maliyeti** | ~€3/ay (Real-Debrid) | $0-$5K/ay (CDN anlaşmaları) | $20-$1K/ay (R2/Bunny) |
| **Embed olarak sunma** | Zor (Stremio ekosistemi) | Evet (bu iş modeli) | Evet |
| **Çok kullanıcı** | Zor (Jellyfin transcode yükü) | Evet (CDN dağıtık) | Evet (CDN dağıtık) |
| **Hukuki risk** | Orta (kişisel, debrid aracılığıyla) | Yüksek (doğrudan dağıtım) | Yok |
| **Reklam geliri** | Yok | Evet | Evet |
| **Sürdürülebilirlik** | Real-Debrid kapanırsa biter | Domain rotasyonu gerekir | Kalıcı |

#### Jellyfin stack'in limitleri

1. **Embed servisi olarak çalışmaz.** Jellyfin kişisel medya sunucusu; başka sitelere iframe ile embed edilecek şekilde tasarlanmamış.
2. **Real-Debrid tek nokta bağımlılığı.** Real-Debrid kapanırsa veya IP'nizi banlasa tüm içerik gider. Analiz ettiğimiz PrimeSrc'nin TikTok CDN bağımlılığı ile aynı risk.
3. **Ölçeklenmez.** Jellyfin transcode'u sunucu CPU'suna bağlı. 10 kullanıcıda bile yavaşlar. Embed servisleri CDN ile milyonlara hizmet verir.
4. **AIOStreams/Gelato Stremio ekosistemine kilitli.** Kendi API'nizi veya player'ınızı koyamazsınız.

#### Peki en iyi stack hangisi?

**Amaca göre 3 farklı cevap:**

**A) Kişisel izleme (1-5 kişi):**
```
Stremio + AIOStreams + MediaFlow + Real-Debrid
  veya
Jellyfin + *arr stack (Radarr/Sonarr) + Real-Debrid
```
Gelato opsiyonel (Stremio desktop zaten iyi çalışıyor). Bu amaç için **en iyi stack budur**.

**B) Kamu embed servisi (analiz ettiğimiz model):**
```
Analiz edilen en iyi model: VOE
  → Kendi CDN (Edgeon), DGA domain, triple-layer koruma
  → İmzalı URL (IP+ASN+zaman)
  → JWPlayer + FingerprintJS
```
Jellyfin stack'i bu amaç için **hiç uygun değil**.

**C) Meşru embed servisi (kendi lisanslı içerik):**
```
Cloudflare R2 + Workers + Shaka Player
  → Egress ücretsiz, HMAC imzalı URL
  → Turnstile bot koruması
  → Google IMA reklam
```
DMCA riski olmadığı için R2 **en iyi seçim**.

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

---

## 9. Maks OPSEC + Düşük Bütçe — Kamu Embed Sistemi Roadmap

Analiz edilen provider'ların gerçekte nasıl çalıştığına dayanan pratik bir mimari. Teorik "en iyi" değil, bu adamların fiilen kullandığı OPSEC modelini temel alıyor. AlexHost (Moldova, kripto ödeme) sunucu olarak referans alınmıştır.

### 9.0 İçerik Nereden Gelir? — Depolama Olmadan Binlerce Film

80GB NVMe'ye binlerce film sığmaz (tek film 720p HLS ≈ 2-4 GB). Analiz edilen provider'ların her biri bu sorunu farklı çözmüş. 5 model var — bütçeye göre hangisi uygunsa o seçilir:

#### Model A: Aggregator / Resolver (PrimeSrc modeli) — $0 depolama

```
SEN hiçbir video dosyası barındırmıyorsun.
Sadece TMDB ID → mevcut embed provider URL çözümlüyorsun.

Kullanıcı "Avatar izle" der → sen VOE/Filemoon/StreamWish'e yönlendirirsin.

Bu TAM OLARAK PrimeSrc'nin yaptığı şey:
  /api/v1/s?tmdb=83533&type=movie → sunucu listesi döner
  /api/v1/l?key=9XprE → { "link": "https://dianaavoidthey.com/e/xxxxx" }

PrimeSrc'de SIFIR video dosyası var. Sadece resolver + Turnstile + player UI.
```

**Nasıl çalışır:**

```
┌─────────────────────────────────────────┐
│  SENİN SİSTEMİN (AlexHost VPS, €16/ay)  │
│                                          │
│  1. TMDB API ile film/dizi kataloğu      │
│  2. Kullanıcı film seçer                 │
│  3. Backend, bilinen embed URL'lerini    │
│     dener (VOE, Filemoon, SW, vb.)       │
│  4. Çalışan linki iframe'de gösterir     │
│  5. Reklam overlay'i SENİN sayfanda      │
│                                          │
│  Depolama: SIFIR                         │
│  CPU yükü: MİNİMAL (sadece API çağrısı)  │
│  Bandwidth: MİNİMAL (video senden geçmez)│
└─────────────────────────────────────────┘
         │
         │ iframe src="https://voe.sx/e/xxxxx"
         ▼
┌─────────────────────────────────────────┐
│  UPSTREAM PROVIDER (VOE, Filemoon vb.)   │
│  Video onlardan geliyor                  │
│  Onların CDN'i, onların bandwidth'i      │
│  Sen sadece iframe'i embed ediyorsun     │
└─────────────────────────────────────────┘
```

**Upstream link'leri nereden bulunur:**
```
Yöntem 1: Mevcut aggregator API'lerini reverse-engineer et
  → rivestream.org/api/backendfetch gibi endpoint'ler
  → Analiz ettiğimiz gibi secretKey parametreleri çöz

Yöntem 2: Upstream provider API'lerini doğrudan kullan
  → VOE API: voe.sx/api-1-reference-index (dosya arama)
  → Filemoon API: dosya arama endpoint'i
  → TMDB ID → IMDB ID mapping ile arama

Yöntem 3: Manuel/yarı-otomatik link veritabanı
  → İlk 500 popüler film/dizi linklerini elle topla
  → Veritabanında TMDB ID → embed URL eşleştirmesi tut
  → Eksik içerik için upstream'de arama yap
```

**Avantajlar ve dezavantajlar:**

| ✓ Avantaj | ✗ Dezavantaj |
|-----------|-------------|
| Depolama maliyeti $0 | Upstream kapanırsa link ölür |
| Bandwidth maliyeti $0 | Video kalitesini kontrol edemezsin |
| Encode gerekmez | Upstream reklam seninkinin üstüne biner |
| En hızlı başlangıç (1-2 gün) | Upstream'in koruma mekanizması seni de etkiler |
| PrimeSrc 1 yıldır bunu yapıyor | URL'ler sürekli değişir (bakım gerekir) |

---

#### Model B: Telegram Sınırsız Depolama — $0 depolama, kendi kontrolün

```
Telegram = SINIRSIZ ücretsiz bulut depolama.
Dosya başına 4GB limit var (Telegram Premium ile yok).
Dosyalar SÜRESİZ kalır (silinmez, expire olmaz).
Telegram UAE/Dubai merkezli — DMCA süreci çok yavaş.

Bu, PrimeSrc'nin TikTok CDN kullanmasının DAHA GÜVENLİ versiyonu:
  PrimeSrc → TikTok CDN (yetkisiz, her an kapanabilir)
  Bu model → Telegram (meşru API kullanımı, stabil)
```

**Nasıl çalışır:**

```
HAZIRLIK (bir kerelik):
  1. Telegram bot oluştur (BotFather ile, ücretsiz)
  2. Özel/gizli kanal aç (depolama kanalı)
  3. Botu kanala admin olarak ekle
  4. Filmi/diziyi encode et (FFmpeg → HLS segmentleri)
  5. Segmentleri Telegram kanalına yükle (bot ile)
     → Her segment ayrı dosya mesajı
     → file_id kaydet (veritabanında)

OYNATMA (her izlemede):
  1. Kullanıcı film seçer
  2. Backend, veritabanından segment file_id'lerini alır
  3. Dinamik m3u8 üretir (her segment URL'si → proxy endpoint)
  4. Proxy endpoint: Telegram MTProto ile dosyayı çeker → kullanıcıya stream eder
```

**Açık kaynak araçlar (hazır çözümler):**

```
BetterTGStreamer (github.com/TechShreyash/BetterTGStreamer)
  → MP4/MKV → M3U8 HLS dönüşümü
  → Telegram'a yükleme
  → Streaming API
  → MongoDB veritabanı
  → Kalıcı dosya linkleri (expire olmaz)

Unlimited-Storage (github.com/friday2su/Unlimited-Storage)
  → Video → Telegram bulut depolama
  → HLS (m3u8) formatında streaming
  → Çoklu ses izi desteği
  → Çoklu kalite desteği

TG-FileStreamBot (github.com/EverythingSuckz/TG-FileStreamBot)
  → Go ile yazılmış (performanslı)
  → Telegram dosyaları → direkt streaming link
  → v3.2.0 (Şubat 2026, aktif geliştirme)

TelePlay (github.com/subinps/TelePlay)
  → Multi-client paralel indirme (yüksek hız)
  → Web + Android TV uygulaması
  → Sıfır lokal depolama gereksinimi
```

**Mimari (Telegram storage ile):**

```
┌──────────────────────────────────────────────────────┐
│  SENİN SUNUCUN (AlexHost VPS, €16/ay)                 │
│                                                       │
│  ┌─ Node.js API ─────────────────────────────────┐   │
│  │  /api/manifest/:id → dinamik m3u8 üret         │   │
│  │  /stream/:file_id  → Telegram'dan çek + proxy  │   │
│  └────────────────────────────────────────────────┘   │
│                    │                                   │
│                    │ MTProto                            │
│                    ▼                                   │
│  ┌─ Telegram Bot API / MTProto ──────────────────┐   │
│  │  Gizli kanal: -100xxxxxxxxxx                   │   │
│  │  Dosya: seg-0.ts (file_id: CQACAgIAAxk...)     │   │
│  │  Dosya: seg-1.ts (file_id: CQACAgIAAxk...)     │   │
│  │  ...binlerce segment...                        │   │
│  └────────────────────────────────────────────────┘   │
│                                                       │
│  Lokal disk: sadece veritabanı (~50MB SQLite)         │
│  Telegram'da: 10TB+ video (ücretsiz, süresiz)         │
└──────────────────────────────────────────────────────┘
```

**Avantajlar ve dezavantajlar:**

| ✓ Avantaj | ✗ Dezavantaj |
|-----------|-------------|
| Sınırsız depolama, $0 | Tüm trafik sunucudan geçer (proxy) |
| Dosyalar süresiz kalır | Dosya başına 4GB limit (Premium'suz) |
| Telegram çok stabil platform | MTProto hızı: ~20 MB/s (yeterli ama CDN değil) |
| Meşru API kullanımı | Telegram ToS ihlali riski (ama düşük) |
| DMCA süreci çok yavaş (UAE) | Encode'u sen yapmalısın (CPU yükü) |
| Kendi içeriğin, kendi kontrolün | Paralel indirme ile ~50-100 eşzamanlı kullanıcı |

---

#### Model C: Hetzner Storage Box (ucuz bulk depolama) — €4-21/ay

```
Kendi dosyalarını kendi storage'ında tut.
VOE/Filemoon modeli — ama ucuz versiyon.

Hetzner Storage Box fiyatları:
  BX11:  1 TB  = €3.81/ay
  BX21:  5 TB  = €3.99/ay  ← TATLI NOKTA
  BX31: 10 TB  = €20.80/ay
  BX41: 20 TB  = €36.59/ay

5 TB = ~1,500-2,500 film (720p HLS, 2-4 GB/film)
```

**Dikkat:** Hetzner Almanya'da — DMCA/telif taleplerine uyar. Storage Box'ı **doğrudan** public'e açmayın. AlexHost VPS'iniz Hetzner'dan SFTP ile çekip serve etsin — Cloudflare proxy arkasında.

```
┌─ Hetzner Storage Box (5TB, €3.99/ay) ────────────────┐
│  /videos/movie-83533/720p/seg-0.ts                    │
│  /videos/movie-83533/720p/seg-1.ts                    │
│  /videos/movie-83533/480p/...                         │
│  /videos/movie-12345/...                              │
│  ...binlerce film...                                  │
│  Erişim: SFTP/rsync (sadece VPS'iniz bağlanır)        │
└───────────────────────┬──────────────────────────────┘
                        │ SFTP (private network)
┌───────────────────────▼──────────────────────────────┐
│  AlexHost VPS (€16/ay) — Cloudflare proxy arkasında   │
│  1. Kullanıcı istek yapınca segment'i Hetzner'den çek │
│  2. LRU cache'te tut (RAM veya disk, hot content)     │
│  3. İmzalı URL ile serve et                           │
│  4. Popüler içerik cache'te kalır → Hetzner'e gitmez  │
└──────────────────────────────────────────────────────┘
```

---

#### Model D: Upstream Mirror (VOE/Filemoon ekosistemi) — $0 depolama

```
Mevcut file hosting platformlarına yükle, onların CDN'ini kullan.

VOE: 3TB ücretsiz depolama + API ile yükleme
Filemoon: ücretsiz depolama + API ile yükleme
StreamWish: ücretsiz depolama + API ile yükleme

Bu platformlar "video hosting" servisi — sen yükle, onlar host etsin.
Üstelik PPD (Pay-Per-Download) ile SANA para ödüyorlar.
```

**Otomatik multi-upload pipeline:**

```
Kaynak dosya (MP4/MKV)
  │
  ├── VOE API'ye yükle      → embed link al (voe.sx/e/xxx)
  ├── Filemoon API'ye yükle  → embed link al (filemoon.sx/e/xxx)
  └── StreamWish API'ye yükle → embed link al (streamwish.to/e/xxx)
  │
  ▼
Veritabanında: TMDB ID → { voe: "...", filemoon: "...", sw: "..." }
  │
  ▼
Kullanıcı izlemek istediğinde:
  → Birincil: VOE linki göster (en iyi kalite/koruma)
  → VOE çalışmazsa: Filemoon fallback
  → O da olmazsa: StreamWish fallback

WJunction forumlarında bu işi otomatize eden araçlar satılıyor:
  → OxServer: multi-upload + auto-reupload (link ölürse yeniden yükle)
  → Fiyat: $30-100 (bir kerelik)
```

**Avantajlar ve dezavantajlar:**

| ✓ Avantaj | ✗ Dezavantaj |
|-----------|-------------|
| Depolama $0 (onlar barındırıyor) | Encode'u sen yapmalısın |
| CDN onların (bandwidth $0) | Platform kapanırsa linkler ölür |
| PPD geliri (pasif) | Kaliteyi tam kontrol edemezsin |
| Multi-platform redundancy | Yükleme süresi uzun (upload bandwidth) |
| VOE zaten en iyi korumayı sağlıyor | Kendi reklam katmanını eklemen zor |

---

#### Model E: Hibrit (Önerilen Başlangıç Stratejisi)

```
Gün 1-7:    Model A (Aggregator) ile başla
            → Sıfır depolama, sıfır encode
            → Hemen çalışmaya başlar
            → İlk reklam gelirini elde et

Hafta 2-4:  Model B (Telegram) veya Model D (upstream upload) ekle
            → Popüler 100 film/diziyi kendi kontrolüne al
            → Telegram'a yükle VEYA VOE/Filemoon'a yükle
            → Upstream bağımlılığını azalt

Ay 2-3:     Model C (Hetzner Storage) ekle
            → Reklam geliri ile €4/ay Storage Box al (5TB)
            → En popüler içeriği kendi storage'ına taşı
            → Tam kontrol: kalite, reklam, koruma

Ay 6+:      Tam bağımsız
            → Tüm içerik kendi storage'ında
            → Kendi HLS pipeline'ı
            → Upstream'e bağımlılık sıfır
```

**Başlangıç günü depolama ihtiyacı: SIFIR**

```
Model A ile başlangıç (aggregator):
  ┌─────────────────────────────┐
  │  Gereken:                    │
  │  • AlexHost VPS    €16/ay   │
  │  • Njalla domain   €3.75/ay │
  │  • Cloudflare      €0       │
  │  • SQLite DB       ~5 MB    │
  │  • Node.js API     ~50 MB   │
  │  ─────────────────────────  │
  │  Toplam disk: <100 MB       │
  │  Toplam maliyet: ~€20/ay    │
  │  Video depolama: 0 byte     │
  └─────────────────────────────┘
```

#### Model karşılaştırma tablosu

| Kriter | A: Aggregator | B: Telegram | C: Hetzner SB | D: Upstream |
|--------|--------------|-------------|---------------|-------------|
| **Depolama maliyeti** | $0 | $0 | €4-21/ay | $0 |
| **Encode gerekli mi?** | Hayır | Evet | Evet | Evet |
| **Bandwidth yükü** | Minimal | Yüksek (proxy) | Orta (cache) | Minimal |
| **İçerik kontrolü** | Yok | Tam | Tam | Kısıtlı |
| **Reklam kontrolü** | Kısıtlı | Tam | Tam | Kısıtlı |
| **Kalıcılık** | Düşük | Yüksek | Yüksek | Orta |
| **Başlangıç süresi** | 1-2 gün | 1-2 hafta | 2-3 hafta | 1 hafta |
| **Eşzamanlı kullanıcı** | Sınırsız* | 50-100 | 200-500 | Sınırsız* |
| **Kim kullanıyor?** | PrimeSrc | (yeni trend) | VOE, Filemoon | Uploaderlar |

\* Sınırsız = video senden geçmiyor, upstream'in kapasitesine bağlı

#### İçerik kaynağı: dosyalar nereden geliyor?

```
Analiz edilen provider'ların ekosistemi:

  KAYNAK                              YÜKLEME                HOSTING
  ──────                              ──────                 ───────
  Scene grupları                 ┐
  P2P release'ler (RARBG vb.)   ├──→  Uploader toplulukları ──→ VOE
  Usenet                        │     (WJunction forumu)        Filemoon
  Kişisel rip'ler               ┘     OxServer gibi araçlar     StreamWish
                                       Multi-upload bot'ları     ...

  Bu "uploader"lar PPD (Pay-Per-Download) ile para kazanıyor.
  VOE, izlenme başına uploader'a ödüyor.
  Bu yüzden upload teşviki var.
```

---

#### Otomatik İçerik Pipeline — 10 Kaynak ve En İyi 5

Vizyona giren bir film saatler içinde bu sitelerde nasıl oluyor? Tam otomatik pipeline:

```
VİZYONA GİRİŞ / STREAMİNG ÇIKIŞ
  │
  │  (saatler - günler arası)
  ▼
SCENE / P2P RELEASE
  │  → Scene grupları (SPARKS, FGT, FLUX, BHDStudio vb.)
  │  → WEB-DL (Netflix/Disney+ riplerinden)
  │  → CAM/TS (sinema kaydı — düşük kalite, ilk çıkar)
  │  → Remux (Blu-ray'den birebir kopya — en yüksek kalite)
  │
  │  (saniyeler)
  ▼
İNDEXER / TRACKER
  │  → Torrent tracker'lara veya Usenet'e yüklenir
  │  → RSS feed ile anında duyurulur
  │
  │  (saniyeler — Prowlarr/Radarr otomatik yakalar)
  ▼
OTOMATİK İNDİRME (senin sunucunda)
  │  → Radarr/Sonarr + Prowlarr + qBittorrent
  │  → Veya Real-Debrid API (anında cache — indirme bekleme yok)
  │
  │  (dakikalar — FFmpeg encode)
  ▼
HLS ENCODE
  │  → FFmpeg: MP4/MKV → 720p + 480p + 360p HLS segmentleri
  │
  │  (saniyeler)
  ▼
YÜKLEME / SERVE
  │  → Telegram kanalına yükle (Model B)
  │  → Veya kendi disk/storage'a koy (Model C)
  │  → Veritabanına kaydet: TMDB ID → segment mapping
  │
  ▼
KULLANICIYA HAZIR
```

##### 10 İçerik Kaynağı (en iyiden başlayarak)

| # | Kaynak | Tür | Erişim | API | Maliyet | İçerik | Hız |
|---|--------|-----|--------|-----|---------|--------|-----|
| 1 | **1337x** | Public torrent | Açık | Evet (scraper) | $0 | Film + dizi, en geniş kütüphane | Orta |
| 2 | **YTS/YIFY** | Public torrent | Açık | Resmi API var | $0 | Sadece film, küçük dosya boyutu (700MB-2GB) | Orta |
| 3 | **TorrentGalaxy (TGx)** | Public torrent | Açık | Evet (scraper) | $0 | Film + dizi, IMDB entegreli, kaliteli release'ler | Orta |
| 4 | **EZTV** | Public torrent | Açık | Resmi API var | $0 | Sadece TV dizi, en hızlı dizi release'leri | Hızlı |
| 5 | **Real-Debrid** | Debrid servisi | Kayıt | Resmi REST API | ~€3/ay | Torrent cache — magnet ver, anında link al | Çok hızlı |
| 6 | **NZBgeek** | Usenet indexer | Kayıt | Resmi API (Newznab) | $12/yıl | Film + dizi, Radarr/Sonarr native entegrasyon | Çok hızlı |
| 7 | **IPTorrents (IPT)** | Private torrent | Davetiye | RSS + API | ~$20 bağış | En büyük private tracker, 0-day release | Çok hızlı |
| 8 | **TorrentLeech (TL)** | Private torrent | Davetiye | RSS | ~$5 bağış | 0-day release, 18+ yıllık arşiv | Çok hızlı |
| 9 | **BeyondHD (BHD)** | Private torrent | Davetiye | API var | $0 (ratio) | 4K/Remux — en yüksek kalite | Hızlı |
| 10 | **Bitsearch** | Public aggregator | Açık | REST API (ücretsiz) | $0 | Çoklu kaynak arama, 200 req/gün | Orta |

##### Bizim embed servisimiz için EN İYİ 5

Bir embed servisi için gereken kriterler:
- **Otomasyon**: Radarr/Sonarr/API ile tam otomatik olmalı
- **Hız**: Yeni içerik saatler içinde mevcut olmalı
- **Maliyet**: Düşük bütçeye uygun
- **Güvenilirlik**: Kapanma riski düşük
- **İçerik genişliği**: Hem film hem dizi

```
┌────────────────────────────────────────────────────────────────────┐
│                    EN İYİ 5 — EMBED SERVİSİ İÇİN                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ★ 1. REAL-DEBRID (€3/ay)                                         │
│  ─────────────────────────                                         │
│  Neden 1 numara: Magnet linkini ver, anında direkt link al.        │
│  Torrent indirme bekleme yok — RD zaten cache'lemiş.               │
│  %95+ popüler içerik anında hazır (başkası daha önce istemiş).     │
│                                                                    │
│  Otomasyon:                                                        │
│    1337x/TGx'den magnet bul → RD API'ye gönder                    │
│    → /torrents/addMagnet (magnet ekle)                             │
│    → /torrents/selectFiles (dosya seç)                             │
│    → /unrestrict/link (direkt indirme linki al)                    │
│    → wget/aria2c ile indir → FFmpeg encode → serve                 │
│                                                                    │
│  API: api.real-debrid.com/rest/1.0/                                │
│  Rate limit: 250 req/dk                                            │
│  Neden embed için iyi: İndirme hızı 100+ Mbps, bekleme yok        │
│                                                                    │
│  ★ 2. 1337x (ücretsiz)                                            │
│  ──────────────────────                                            │
│  En geniş public torrent kütüphanesi.                              │
│  Film + dizi + anime + belgesel — her şey var.                     │
│  RSS feed ile yeni release'leri otomatik takip.                    │
│                                                                    │
│  Otomasyon araçları:                                               │
│    → Prowlarr: 1337x indexer olarak ekle                           │
│    → torrent-search-api (npm): JS API wrapper                      │
│    → 1337x-API (Python): Playwright + BeautifulSoup scraper        │
│    → Torrent-Api-py: çoklu kaynak API                              │
│                                                                    │
│  Neden embed için iyi: En geniş içerik, $0 maliyet                │
│                                                                    │
│  ★ 3. EZTV (ücretsiz)                                             │
│  ─────────────────────                                             │
│  TV dizileri için en hızlı kaynak.                                 │
│  Yeni bölüm yayınlandıktan dakikalar içinde torrent mevcut.        │
│  API: eztv.re/api/ (resmi, ücretsiz)                               │
│                                                                    │
│  Otomasyon:                                                        │
│    → Sonarr + Prowlarr ile tam otomatik                            │
│    → EZTV RSS: https://eztv.re/ezrss.xml                          │
│    → API: /api/get-torrents?imdb_id=tt1234567                     │
│                                                                    │
│  Neden embed için iyi: Dizi siteleri trafiğin %60+'sı dizi izler  │
│                                                                    │
│  ★ 4. YTS / YIFY (ücretsiz)                                       │
│  ──────────────────────────                                        │
│  Sadece film. Küçük dosya boyutu (720p ≈ 700MB, 1080p ≈ 1.5GB).   │
│  Encode zaten yapılmış — bazen doğrudan kullanılabilir.             │
│  API: yts.mx/api/v2/ (resmi, ücretsiz)                             │
│                                                                    │
│  Otomasyon:                                                        │
│    → API: /api/v2/list_movies.json?query_term=avatar               │
│    → /api/v2/movie_details.json?imdb_id=tt1234567                  │
│    → Direkt torrent URL döner                                      │
│                                                                    │
│  Neden embed için iyi: Encode süresi kısa (dosya zaten küçük),     │
│  disk/bandwidth tasarrufu, çoğu film mevcut                        │
│                                                                    │
│  ★ 5. TORRENTGALAXY (ücretsiz)                                    │
│  ──────────────────────────────                                    │
│  1337x alternatifi ama IMDB puanı/poster entegreli.                │
│  Film + dizi. Kaliteli release'ler (FLUX, ION10 vb.).              │
│  Topluluk aktif, içerik hızlı ekleniyor.                           │
│                                                                    │
│  Otomasyon:                                                        │
│    → Prowlarr'da indexer olarak ekle                               │
│    → Torrent-Api-py ile API erişimi                                │
│    → RSS feed mevcut                                               │
│                                                                    │
│  Neden embed için iyi: IMDB entegrasyonu = TMDB mapping kolay      │
└────────────────────────────────────────────────────────────────────┘
```

##### Tam Otomatik Pipeline (sunucuda çalışan sistem)

```
┌──────────────────────────────────────────────────────────────────┐
│              OTOMASYON SERVİSLERİ (Docker Compose)                │
│              AlexHost VPS üzerinde                                 │
│                                                                   │
│  ┌─ Prowlarr (port 9696) ────────────────────────────────────┐   │
│  │  Indexer hub — tüm kaynakları tek yerden yönet              │   │
│  │  Eklenen indexer'lar:                                       │   │
│  │    → 1337x                                                  │   │
│  │    → EZTV                                                   │   │
│  │    → YTS                                                    │   │
│  │    → TorrentGalaxy                                          │   │
│  │    → Bitsearch                                              │   │
│  │  Otomatik olarak Radarr + Sonarr'a sync eder               │   │
│  └────────────────────────────────────────────────────────────┘   │
│                    │                                              │
│         ┌─────────┴─────────┐                                    │
│         ▼                   ▼                                    │
│  ┌─ Radarr ────────┐ ┌─ Sonarr ────────┐                        │
│  │  (port 7878)     │ │  (port 8989)     │                        │
│  │  FİLM yönetimi   │ │  DİZİ yönetimi   │                        │
│  │                   │ │                   │                        │
│  │  TMDB ile entegre │ │  TVDB ile entegre │                        │
│  │  Film ekle →      │ │  Dizi ekle →      │                        │
│  │  otomatik ara →   │ │  otomatik ara →   │                        │
│  │  en iyi release'i │ │  yeni bölümü      │                        │
│  │  bul → indir      │ │  bul → indir      │                        │
│  └────────┬──────────┘ └────────┬──────────┘                        │
│           │                     │                                │
│           └─────────┬───────────┘                                │
│                     ▼                                            │
│  ┌─ qBittorrent (port 8080) ─────────────────────────────────┐   │
│  │  Torrent istemcisi                                          │   │
│  │  Radarr/Sonarr otomatik gönderir                           │   │
│  │  İndirme tamamlanınca Radarr/Sonarr'a bildirir             │   │
│  │                                                             │   │
│  │  ALTERNATİF: Real-Debrid entegrasyonu                      │   │
│  │  → Radarr/Sonarr → RD API → anında direkt link             │   │
│  │  → qBittorrent'e gerek kalmaz                               │   │
│  └────────────────────────────────────────────────────────────┘   │
│                     │                                            │
│                     ▼ indirme tamamlandı                         │
│  ┌─ Post-Processing Script ──────────────────────────────────┐   │
│  │  1. FFmpeg → HLS encode (720p + 480p + 360p)               │   │
│  │  2. Thumbnail sprite sheet oluştur                          │   │
│  │  3. Altyazı indir (OpenSubtitles API / Bazarr)             │   │
│  │  4. Telegram'a yükle VEYA disk'e kaydet                     │   │
│  │  5. Veritabanına ekle: TMDB ID → segment mapping            │   │
│  │  6. Kaynak dosyayı sil (disk tasarrufu)                     │   │
│  │  7. Webhook → Telegram bot'a bildirim: "X eklendi"          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ Bazarr (port 6767) ─────────────────────────────────────┐    │
│  │  Otomatik altyazı indirme                                  │    │
│  │  OpenSubtitles.org + Subscene entegrasyonu                 │    │
│  │  Türkçe + İngilizce + diğer diller                         │    │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

**Docker Compose (minimal — sadece otomasyon servisleri):**

```yaml
# docker-compose.automation.yml
services:
  prowlarr:
    image: lscr.io/linuxserver/prowlarr:latest
    ports: ["9696:9696"]
    volumes:
      - ./config/prowlarr:/config
    restart: unless-stopped

  radarr:
    image: lscr.io/linuxserver/radarr:latest
    ports: ["7878:7878"]
    volumes:
      - ./config/radarr:/config
      - /data:/data
    restart: unless-stopped

  sonarr:
    image: lscr.io/linuxserver/sonarr:latest
    ports: ["8989:8989"]
    volumes:
      - ./config/sonarr:/config
      - /data:/data
    restart: unless-stopped

  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent:latest
    ports: ["8080:8080"]
    volumes:
      - ./config/qbit:/config
      - /data/downloads:/data/downloads
    restart: unless-stopped

  bazarr:
    image: lscr.io/linuxserver/bazarr:latest
    ports: ["6767:6767"]
    volumes:
      - ./config/bazarr:/config
      - /data:/data
    restart: unless-stopped
```

**Post-processing script (Radarr/Sonarr "Custom Script" olarak):**

```bash
#!/bin/bash
# /app/scripts/post-encode.sh
# Radarr/Sonarr indirme tamamlanınca otomatik çağırır

FILE="$radarr_moviefile_path"  # veya $sonarr_episodefile_path
TMDB_ID="$radarr_movie_tmdbid" # veya $sonarr_series_tvdbid
TITLE="$radarr_movie_title"

OUTDIR="/data/videos/$TMDB_ID"
mkdir -p "$OUTDIR"/{720p,480p,360p,audio,subs}

# 1. HLS encode
ffmpeg -i "$FILE" \
  -filter_complex "[0:v]split=2[v1][v2];[v1]scale=1280:720[v720];[v2]scale=854:480[v480]" \
  -map "[v720]" -c:v libx264 -b:v 2500k -preset fast -profile:v high \
    -f hls -hls_time 4 -hls_list_size 0 \
    -hls_segment_filename "$OUTDIR/720p/seg-%d.ts" "$OUTDIR/720p/index.m3u8" \
  -map "[v480]" -c:v libx264 -b:v 1200k -preset fast -profile:v main \
    -f hls -hls_time 4 -hls_list_size 0 \
    -hls_segment_filename "$OUTDIR/480p/seg-%d.ts" "$OUTDIR/480p/index.m3u8" \
  -map 0:a:0 -c:a aac -b:a 128k \
    -f hls -hls_time 4 -hls_list_size 0 \
    -hls_segment_filename "$OUTDIR/audio/seg-%d.ts" "$OUTDIR/audio/index.m3u8"

# 2. Thumbnail
ffmpeg -i "$FILE" -vf "fps=1/10,scale=160:-1,tile=10x10" "$OUTDIR/thumbs.jpg"

# 3. Veritabanına kaydet
sqlite3 /app/db/content.sqlite \
  "INSERT OR REPLACE INTO videos (tmdb_id, title, path, created_at) \
   VALUES ('$TMDB_ID', '$TITLE', '$OUTDIR', datetime('now'));"

# 4. Kaynak dosyayı sil (disk tasarrufu)
rm -f "$FILE"

# 5. Telegram bildirimi
curl -s "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
  -d "chat_id=${TG_CHAT_ID}" \
  -d "text=✅ Yeni içerik eklendi: $TITLE (TMDB: $TMDB_ID)"
```

**Real-Debrid alternatif akışı (qBittorrent yerine):**

```
Avantaj: Torrent indirme bekleme YOK.
  → RD zaten popüler torrent'leri cache'lemiş
  → Magnet → anında direkt HTTP link
  → 100+ Mbps indirme hızı

Akış:
  1. Prowlarr'dan magnet link al
  2. RD API: POST /torrents/addMagnet → torrent_id
  3. RD API: POST /torrents/selectFiles/{id} → dosya seç
  4. RD API: GET /torrents/info/{id} → link listesi
  5. RD API: POST /unrestrict/link → direkt indirme URL
  6. aria2c ile indir (çok hızlı)
  7. FFmpeg encode → serve

Maliyet: ~€3/ay (RD aboneliği)
Dikkat: RD kişisel kullanım — farklı IP'lerden kullanma (ban riski)
         Ama SEN sunucudan tek IP ile kullanıyorsun → sorun yok
```

##### Kaynak ekleme ek maliyeti

```
                          Maliyet       Otomasyon    İçerik hızı
─────────────────────────────────────────────────────────────────
Public tracker'lar        $0            Prowlarr     Orta (seed bağımlı)
  (1337x, EZTV, YTS, TGx)

Real-Debrid               €3/ay         API          Çok hızlı (anında)

NZBgeek (Usenet)          $12/yıl       Radarr       Çok hızlı (Usenet hızı)

Private tracker           $5-20 bağış   Prowlarr     Çok hızlı (0-day)
  (IPT, TL)               (bir kerelik)

─────────────────────────────────────────────────────────────────
ÖNERİLEN BAŞLANGIÇ:
  Public tracker'lar ($0) + Real-Debrid (€3/ay) = €3/ay
  → Toplam sistem: €20 (altyapı) + €3 (RD) = €23/ay
```

### 9.0.1 Gerçek Hayat Sorunları: Bozuk Dosya, Yanlış İçerik, Disk/Zaman Yetersizliği

Arr stack (Radarr/Sonarr) güzel görünüyor ama pratikte ciddi sorunlar var:

```
SORUN 1: Torrent bozuk / yanlış içerik
  → "Avatar 2" diye indirdin, açtın başka bir film çıktı
  → Dosya yarım inmiş, codec hatalı, ses yok
  → CAM kalite — izlenemez seviyede

SORUN 2: Radarr/Sonarr HER ŞEYİ İNDİRMEK İSTİYOR
  → 100,000 film + 50,000 dizi bölümü = yüz binlerce dosya
  → Tek film ~2-8 GB, 100K film = 200-800 TB indirme
  → 80 GB disk'e sığmaz, encode'a ömür yetmez

SORUN 3: Seed yoksa indirme başlamıyor
  → Eski/niş filmler seed bulamıyor
  → Haftalar bekleyen indirmeler

SORUN 4: Encode süresi
  → 1 film encode (720p+480p) = 30-90 dakika (CPU-only VPS'te)
  → Günde max 15-20 film encode edilebilir
  → 100K film = 5,000-7,000 gün = 15-20 YIL
```

**Çözüm: "Just-in-Time" (JIT) Modeli — Radarr'ı ATLA**

Radarr/Sonarr'ı ön-indirme için kullanmak bu ölçekte çalışmaz. Bunun yerine **kullanıcı istediğinde al** modeli:

```
KLASİK MODEL (çalışmaz):
  100K film önceden indir → encode et → depola → serve et
  ❌ Disk yok, zaman yok, bant genişliği yok

JIT MODEL (çalışır):
  Kullanıcı "Avatar 2" ister →
    1. Cache'te var mı? → EVET → hemen oynat
    2. Cache'te yok →
       a) Upstream embed var mı? (VOE/Filemoon) → EVET → iframe göster (Model A)
       b) Upstream yok →
          Real-Debrid cache'te var mı? → EVET → indir + encode + serve
       c) RD'de de yok →
          Torrent ara → seed var mı? → EVET → indir + encode + serve
       d) Hiçbir yerde yok →
          "Şu an mevcut değil" göster
```

**Tam akış diyagramı:**

```
Kullanıcı "Film X" ister
  │
  ▼
┌─ ADIM 1: Lokal cache kontrol ─────────────────────────────┐
│  SELECT * FROM videos WHERE tmdb_id = X                    │
│  → Bulundu + dosyalar sağlam → HEMEN OYNAT                │
│  → Bulunamadı → ADIM 2'ye geç                             │
└────────────────────────────────────────────────────────────┘
  │
  ▼
┌─ ADIM 2: Upstream embed kontrol (Model A fallback) ───────┐
│  Bilinen embed provider'ları dene:                         │
│    → VOE: embed URL var mı?                                │
│    → Filemoon: embed URL var mı?                           │
│    → StreamWish: embed URL var mı?                         │
│  → Bulundu → iframe ile göster (kendi reklam overlay'in    │
│              ile birlikte)                                  │
│  → Bulunamadı → ADIM 3'e geç                              │
│                                                            │
│  AVANTAJ: Depolama/encode gerekmez, anında oynar           │
│  NOT: Arka planda ADIM 3'ü tetikle (gelecek için encode)   │
└────────────────────────────────────────────────────────────┘
  │
  ▼
┌─ ADIM 3: Real-Debrid instant check ──────────────────────┐
│  POST api.real-debrid.com/rest/1.0/torrents/instantAvail  │
│  → Magnet hash'ini gönder                                 │
│  → "cached" = true → anında indir (100+ Mbps)             │
│  → "cached" = false → ADIM 4'e geç                        │
│                                                            │
│  %95+ popüler içerik RD cache'te zaten var                │
└────────────────────────────────────────────────────────────┘
  │
  ▼
┌─ ADIM 4: Torrent arama (son çare) ──────────────────────┐
│  1337x / YTS / TGx / EZTV API ile ara                    │
│  → Seeder > 5 olan en iyi kaliteyi seç                   │
│  → qBittorrent'e gönder                                  │
│  → İndirme başlar (dakikalar-saatler)                    │
│  → Kullanıcıya: "Hazırlanıyor, X dakika kaldı"          │
│  → Tamamlanınca → encode → cache'e al                    │
└──────────────────────────────────────────────────────────┘
```

**Kalite doğrulama (bozuk/yanlış dosya tespiti):**

```bash
#!/bin/bash
# verify.sh — indirilen dosyanın doğruluğunu kontrol et

FILE="$1"
EXPECTED_TMDB_ID="$2"

# 1. Dosya açılabiliyor mu?
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=codec_type,width,height \
  -of json "$FILE" > /tmp/probe.json 2>/dev/null

if [ $? -ne 0 ]; then
  echo "FAIL: Dosya açılamıyor (bozuk)"
  exit 1
fi

# 2. Video stream var mı?
HAS_VIDEO=$(jq '.streams[] | select(.codec_type=="video")' /tmp/probe.json)
if [ -z "$HAS_VIDEO" ]; then
  echo "FAIL: Video stream yok"
  exit 1
fi

# 3. Süre kontrolü (TMDB API'den beklenen süreyle karşılaştır)
DURATION=$(jq -r '.format.duration' /tmp/probe.json | cut -d. -f1)
EXPECTED=$(curl -s "https://api.themoviedb.org/3/movie/$EXPECTED_TMDB_ID?api_key=KEY" \
  | jq '.runtime * 60')

DIFF=$(( DURATION - EXPECTED ))
DIFF=${DIFF#-}  # mutlak değer

if [ "$DIFF" -gt 600 ]; then  # 10 dakikadan fazla fark
  echo "FAIL: Süre uyuşmuyor (beklenen: ${EXPECTED}s, gelen: ${DURATION}s)"
  echo "Muhtemelen yanlış içerik"
  exit 1
fi

# 4. Çözünürlük kontrolü
WIDTH=$(jq -r '.streams[] | select(.codec_type=="video") | .width' /tmp/probe.json)
if [ "$WIDTH" -lt 640 ]; then
  echo "WARN: Düşük çözünürlük (${WIDTH}px) — CAM olabilir"
  exit 2  # encode et ama düşük kalite olarak işaretle
fi

# 5. Dosya boyutu mantıklı mı?
SIZE=$(jq -r '.format.size' /tmp/probe.json)
SIZE_MB=$((SIZE / 1048576))
if [ "$SIZE_MB" -lt 100 ]; then
  echo "FAIL: Dosya çok küçük (${SIZE_MB}MB) — muhtemelen fake"
  exit 1
fi

echo "OK: Doğrulama başarılı (${DURATION}s, ${WIDTH}px, ${SIZE_MB}MB)"
exit 0
```

**Bu doğrulama neyi yakalar:**

| Kontrol | Ne tespit eder | Otomatik aksiyon |
|---------|---------------|-----------------|
| ffprobe açılama | Bozuk/yarım dosya | Sil, başka kaynak dene |
| Video stream yok | Sahte dosya (exe/zip) | Sil, kaynağı kara listeye al |
| Süre farkı >10dk | Yanlış film/dizi | Sil, başka release dene |
| Çözünürlük <640px | CAM/TS kalite | "Düşük kalite" olarak işaretle |
| Boyut <100MB | Sahte/trailer | Sil, başka kaynak dene |
| Boyut vs süre oranı | Aşırı düşük bitrate | "Düşük kalite" uyarısı |

**Disk yönetimi — LRU cache stratejisi:**

```
80 GB NVMe'de tüm filmler durmaz.
Ama HEPSI aynı anda izlenmez.

LRU (Least Recently Used) cache:
  → En son izlenen 20-30 film disk'te tutulur
  → 7 gündür izlenmeyen film silinir
  → Tekrar istenirse → RD/torrent'ten yeniden alınır

Örnek:
  80 GB disk = ~25 film (720p HLS, ~3GB/film)
  Günlük ortalama 10 farklı film izlenir
  Cache hit oranı: ~%60-70 (popüler filmler tekrar tekrar izlenir)

  Cache miss olursa:
    → Upstream embed fallback (Model A) → anında oynar
    → Arka planda encode başlar → 30-60 dk sonra kendi kopyamız hazır

Telegram storage (Model B) ile birleşince:
  → Encode edilmiş HLS segmentleri Telegram'da kalıcı
  → Disk'ten silinen film → Telegram'dan tekrar çekilir (cache refill)
  → Telegram = kalıcı arşiv, disk = hızlı cache
```

```
SONUÇ — PRATİK SİSTEM (kısa vadeli versiyon — upstream bağımlı):

  Katman 1: Upstream fallback (VOE/Filemoon iframe)
  Katman 2: Real-Debrid JIT (talep üzerine)
  Katman 3: Telegram kalıcı arşiv
  Katman 4: Lokal disk LRU cache

  ⚠️  SORUN: VOE/Filemoon yarın API'yi kapatabilir,
  domain değiştirebilir veya sizi engelleyebilir.
  Upstream'e bağımlılık = tek nokta kırılganlığı.
```

### 9.0.2 70K Film + 30K Dizi — Tam Bağımsız Embed Servisi

Başka embed servisinden içerik çekilmeyecek. Kullanıcı postere tıklar, film/dizi anında açılır. 70,000 film + 30,000 dizi. Tam bağımsız, tam otomatik.

#### Neden önceki yaklaşımlar çalışmaz

```
70K filmi HLS encode etmek:
  70,000 film × 45 dk encode = 2,187 gün = 6 YIL (tek VPS)
  SONUÇ: HLS ön-encode bu ölçekte İMKANSIZ.

Çözüm: HLS encode'u ATLA — MP4 doğrudan stream.
  Modern tarayıcılar MP4 (H.264) dosyasını DOĞRUDAN oynatır.
  YTS zaten 73,855 filmi küçük MP4 olarak sunuyor (720p ~700MB).
  Yeniden encode etmeye GEREK YOK. Olduğu gibi stream et.
```

#### 1. gün: veritabanı (birkaç saatte hazır)

```
ADIM 1 — YTS API scrape (25 dakika):
  GET yts.mx/api/v2/list_movies.json?limit=50&page=1..1478
  → 73,855 film: imdb_id, title, year, magnet_hash (720p+1080p)
  → GitHub hazır araç: yts_scrape, yts-to-radarr

ADIM 2 — EZTV API scrape (1-2 saat):
  eztv-crawler npm: getShows() → tüm diziler + bölüm magnet'leri
  → 30K+ dizi: imdb_id, season, episode, magnet_hash

ADIM 3 — TMDB metadata (birkaç saat):
  Her imdb_id → tmdb_id, poster, overview, genres, runtime

SONUÇ: 1 günde 70K film + 30K dizi kataloğu hazır.
       Hiçbir dosya indirilmedi — sadece magnet hash veritabanı (~500MB SQLite).
```

#### Anında oynatma — Real-Debrid backend CDN olarak

```
KULLANICI POSTERE TIKLAR
  │
  ▼
┌─ API: /api/play/{tmdb_id} ──────────────────────────────────┐
│                                                               │
│  1. DB'den magnet_hash al                                     │
│                                                               │
│  2. Telegram cache var mı?                                    │
│     → EVET → Telegram MTProto stream (1-2 sn) ✓              │
│     → YOK → adım 3                                           │
│                                                               │
│  3. RD instant check:                                         │
│     POST /torrents/instantAvailability → hash gönder          │
│     → CACHED (%90-95) → RD direkt HTTP link (<1 sn)          │
│       → Proxy ile kullanıcıya serve et (2-4 sn) ✓            │
│       → ARKA PLANDA: dosyayı Telegram'a cache'le             │
│     → NOT CACHED (%5) → RD'ye magnet ekle → indirme başlat   │
│       → 30-120 sn sonra hazır → proxy → serve                │
│       → Telegram'a cache'le                                   │
│                                                               │
│  HİÇBİR SENARYODA "mevcut değil" YOK.                        │
│  Hash'i olan HER içerik oynatılabilir.                        │
└──────────────────────────────────────────────────────────────┘

MP4 serve — HTTP Range request ile:
  → Range: bytes=0-999999 → ilk 1MB → video hemen başlar
  → Tarayıcı seek → Range: bytes=50000000- → o noktadan devam
  → Content-Type: video/mp4
  → HLS encode YOK, hls.js gerekmez, native <video> tag yeterli
```

#### Telegram cache — zamanla dolur

```
Her ilk kez izlenen film arka planda Telegram'a cache'lenir:
  → RD'den indirirken aynı anda Telegram kanalına yükle
  → DB güncelle: tmdb_id → tg_file_id
  → Sonraki izlemeler: RD'ye gerek yok, direkt Telegram

Organik cache büyüme: günde ~100-300 film (izlendikçe)
Proaktif worker: günde ~500+ film (TMDB trend/popular tarama)

Transfer hızı (encode YOK — sadece download+upload):
  RD indirme ~100 Mbps → film 700MB → 58 sn
  Telegram yükleme ~10 MB/s → 70 sn
  Toplam per film: ~2.5 dakika
  Günde tek VPS: ~576 film, 2 VPS: ~1,150 film

  70K film ÷ 576/gün = 4 ay (tek VPS, 7/24)
  70K film ÷ 1,150/gün = 2 ay (2 VPS)

3 arka plan worker sürekli çalışır:
  Worker 1 (her 4 saat): TMDB trending → cache'te yoksa indir
  Worker 2 (her gece): TMDB popular sıradaki 100 → indir
  Worker 3 (her 6 saat): TMDB now_playing → yeni filmler
```

#### Dizi yönetimi

```
DB yapısı:
  episodes: tmdb_id | season | episode | magnet_hash | tg_file_id

Kullanıcı: dizi seç → sezon seç → bölüm seç → oynat
EZTV API zaten bölüm bazında magnet verir.
Sezon paketi varsa: 1 torrent → tüm bölümler → her biri ayrı Telegram dosyası.
```

#### Sayısal özet

```
┌──────────────────────────────────────────────────────────────────┐
│  70K FİLM + 30K DİZİ                                             │
│                                                                   │
│  KATALOG (1. gün):                                                │
│    73K film hash  ← YTS API (25 dk)                               │
│    30K+ dizi hash ← EZTV API (1-2 saat)                          │
│    Metadata       ← TMDB API (birkaç saat)                       │
│                                                                   │
│  ERİŞİLEBİLİRLİK (1. günden):                                    │
│    %100 — hash'i olan HER şey oynatılabilir                       │
│    Popüler (%95): 2-4 sn (RD cache hit)                           │
│    Nadir (%5): 30-120 sn (RD torrent indirme)                     │
│    Telegram cache sonrası: 1-2 sn (anında)                        │
│                                                                   │
│  DEPOLAMA (Telegram, $0):                                         │
│    70K film × 700 MB = ~49 TB                                     │
│    600K bölüm × 300 MB = ~180 TB                                  │
│    Toplam ~229 TB → Telegram'da sınırsız, kalıcı, $0             │
│                                                                   │
│  CACHE DOLMA:                                                     │
│    1 ay: ~20K film Telegram'da                                    │
│    3 ay: ~50K film                                                │
│    4-5 ay: 70K film tamamı                                        │
│                                                                   │
│  MALİYET: €23/ay (VPS €16 + RD €3 + domain €3.75)                │
│  ENCODE: YOK (MP4 doğrudan stream)                                │
│  BAŞKA EMBED: SIFIR bağımlılık                                    │
└──────────────────────────────────────────────────────────────────┘
```

#### Nihai mimari

```
┌──────────────────────────────────────────────────────────────────┐
│  VERİTABANI (1. gün, ~500 MB)                                    │
│  73K film + 30K dizi: tmdb_id → magnet_hash → tg_file_id(null)  │
├──────────────────────────────────────────────────────────────────┤
│  SERVE — kullanıcı tıkladığında                                   │
│  Cloudflare → AlexHost VPS → Node.js                              │
│  tg_file_id var → Telegram stream (1-2 sn)                       │
│  tg_file_id yok → RD instant link → proxy (2-4 sn)               │
│                    + arka planda Telegram'a cache                  │
│  Player: native <video> MP4 + imzalı URL + Turnstile             │
├──────────────────────────────────────────────────────────────────┤
│  WORKER'LAR (7/24)                                                │
│  Trend takip + popüler doldurucu + yeni çıkış tarayıcı           │
│  RD indir → Telegram'a yükle (encode YOK)                        │
│  ~576 film/gün tek VPS, 70K tamamı 4 ayda                        │
├──────────────────────────────────────────────────────────────────┤
│  DEPOLAMA: Telegram (229 TB, $0)                                  │
│  MALİYET: €23/ay | BAĞIMLILIK: SIFIR                              │
└──────────────────────────────────────────────────────────────────┘
```

#### Real-Debrid neden çalışmaz — kritik riskler

Yukarıdaki mimari Real-Debrid'i "backend CDN" olarak kullanıyor. Kağıt üzerinde güzel, pratikte **ciddi sorunlar** var:

```
┌──────────────────────────────────────────────────────────────────┐
│  SORUN 1: TEK IP KISITLAMASI                                     │
│                                                                   │
│  RD hesabı aynı anda SADECE 1 IP'den kullanılabilir.              │
│  Sunucumuz tek IP → sorun yok gibi görünüyor.                     │
│  AMA: aynı anda 2. bir sunucu eklersen → hesap kilitlenir.       │
│  Ölçekleme = imkansız (tek VPS'e mahkumsun).                      │
│                                                                   │
│  Çözüm denemesi: 2 RD hesabı = 2×€3 = €6/ay                     │
│  Ama: RD aynı kişiye 2 hesap açmayı yasaklıyor.                  │
│  Tespit edilirse → iki hesap da ban.                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  SORUN 2: ToS İHLALİ — KAMU SERVİSİ YASAK                        │
│                                                                   │
│  RD Terms of Service, madde 4:                                    │
│    "The service is for personal use only."                        │
│    "Reselling or sharing your account is prohibited."             │
│                                                                   │
│  Bizim kullanım: kamu embed servisi = binlerce kullanıcı.         │
│  Bu açıkça ToS ihlali. RD tespit ederse:                          │
│    → Hesap anında ban                                             │
│    → Ödenen para iade yok                                         │
│    → Tüm cache'lenmemiş içerik erişilemez olur                   │
│                                                                   │
│  Tespit yöntemleri:                                               │
│    → Anormal API kullanımı (günde binlerce istek)                 │
│    → Anormal bant genişliği (günde TB'larca indirme)              │
│    → Otomatik pattern (7/24 sürekli indirme)                      │
│    → Aynı hash'lerin tekrar tekrar çözülmesi                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  SORUN 3: API RATE LIMIT                                          │
│                                                                   │
│  RD API limitleri:                                                │
│    → /torrents/instantAvailability: dakikada ~60 istek            │
│    → /torrents/addMagnet: dakikada ~30 istek                      │
│    → /unrestrict/link: dakikada ~60 istek                         │
│                                                                   │
│  100 eşzamanlı kullanıcı = dakikada 100 API çağrısı              │
│  → Rate limit'e anında çarparsın                                  │
│  → 429 Too Many Requests → kullanıcılar video izleyemez           │
│                                                                   │
│  1000 eşzamanlı kullanıcı = tamamen çöker                         │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  SORUN 4: BANT GENİŞLİĞİ DARBOĞAZI                               │
│                                                                   │
│  RD → sunucu → kullanıcı zincirinde TÜM trafik sunucudan geçer. │
│                                                                   │
│  1 kullanıcı 720p stream = ~3 Mbps                                │
│  VPS bant genişliği = 100 Mbps (AlexHost)                         │
│  Maksimum eşzamanlı: 100 Mbps ÷ 3 Mbps = ~33 kullanıcı          │
│                                                                   │
│  33 kullanıcıdan fazlası = buffering, kalite düşüşü, timeout     │
│  1000 kullanıcı için: 3 Gbps bant genişliği gerekir              │
│  → AlexHost'ta böyle plan yok, olsa bile €200+/ay                 │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  SORUN 5: TEK NOKTA ARIZA (SPOF)                                  │
│                                                                   │
│  RD çökerse / bakımdaysa / ban yersen:                             │
│    → Telegram'da cache'lenmemiş HİÇBİR içerik oynatılamaz        │
│    → 1. gün: 0 içerik cache → %100 RD bağımlı                    │
│    → 1. ay: ~20K cache → hâlâ 50K film RD'ye bağımlı             │
│    → RD 2023'te 3 gün çökmüştü → 3 gün boyunca servis durur     │
│                                                                   │
│  RD bir tüketici servisi, SLA yok, uptime garantisi yok.          │
│  Hesap banlama kararına itiraz mekanizması yok.                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  SORUN 6: CACHE HIT GERÇEKTE %90 DEĞİL                           │
│                                                                   │
│  "RD'de %90-95 cache hit" varsayımı sadece POPÜLERler için.      │
│                                                                   │
│  70K filmlik katalogda:                                           │
│    Top 5K film:  %90-95 RD cache hit ✓                            │
│    5K-20K arası: %60-70 cache hit                                 │
│    20K-70K:      %20-40 cache hit (eski, niş filmler)             │
│    Genel ortalama: ~%50-60 cache hit                              │
│                                                                   │
│  30K dizide durum daha kötü:                                      │
│    Popüler diziler: %80 cache                                     │
│    Eski/niş diziler: %10-30 cache                                 │
│    → Cache miss = RD torrent indirmeli = 1-5 dk bekleme           │
│    → Seed'siz torrent = hiç indirilemez (timeout)                 │
│                                                                   │
│  Sonuç: Kullanıcıların önemli bir kısmı bekleme yaşar.           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  SORUN 7: PROAKTİF CACHE = 576 FİLM/GÜN HESABI YANILTICI        │
│                                                                   │
│  Hesap: film başına 2.5 dk (indir+yükle) → 576/gün               │
│  GERÇEK:                                                          │
│    → RD indirme sıraya girer (eşzamanlı limit var)               │
│    → Büyük dosyalar (4-8 GB MKV): 5-10 dk indirme                │
│    → Telegram yükleme: 2 GB dosya limitli, büyük dosya split     │
│    → Telegram rate limit: ~30 mesaj/dakika per bot                │
│    → Hata retry'lar (bozuk torrent, eksik dosya)                  │
│    → Gerçekçi hız: ~200-300 film/gün                              │
│    → 70K film: 7-12 ay (tek VPS)                                  │
└──────────────────────────────────────────────────────────────────┘
```

**RD'siz alternatif — tamamen bağımsız mimari:**

```
RD riskleri çok yüksekse, RD'yi tamamen çıkar:

  Seçenek A: Doğrudan torrent indirme
    → qBittorrent + VPN (Mullvad €5/ay)
    → Seed'li torrentleri doğrudan sunucuya indir
    → Avantaj: RD'ye sıfır bağımlılık
    → Dezavantaj: VPN gerekli, daha yavaş, seed'siz = imkansız

  Seçenek B: Birden fazla debrid servisi (failover)
    → RD (€3) + AllDebrid (€3) + Premiumize (€10)
    → Biri ban yerse diğerine geç
    → Dezavantaj: maliyet artar, hepsi aynı riski taşır

  Seçenek C: Tamamen Telegram-only
    → Sadece Telegram gruplarından/kanallarından içerik topla
    → Zaten binlerce film/dizi Telegram'da paylaşılıyor
    → forward_bot ile otomatik topla → kendi kanalına kopyala
    → Dezavantaj: düzensiz, kalite kontrolü zor, telif riski

  Seçenek D: Hybrid (önerilen gerçekçi yol)
    → İlk 5-10K popüler film: RD ile hızlıca cache'le (1-2 ay)
    → RD ban yedikten sonra: qBittorrent+VPN ile devam et
    → Organik cache: kullanıcılar izledikçe Telegram'a cache
    → Uzun vadede RD'ye ihtiyaç kalmaz (Telegram kütüphanesi dolar)

  Maliyet karşılaştırma:
    RD yolu:    €23/ay ama ban riski var
    VPN yolu:   €26/ay (VPS €16 + VPN €5 + domain €4) ama bağımsız
    Hybrid:     €28/ay ilk 2 ay, sonra €21/ay (RD bırak)
```

**Sonuç:** Real-Debrid kısa vadeli hızlandırıcı olarak kullanılabilir, ama uzun vadeli temel olarak GÜVENİLMEZ. Mimarinin RD olmadan da çalışabilecek şekilde tasarlanması şart.

#### Açık kaynak projeler — en yakın olanlar

Aşağıdaki projeler bizim mimarimizin farklı parçalarını zaten açık kaynak olarak sunuyor. Hiçbiri tek başına tam bir "embed servisi" değil, ama birleştirilince neredeyse tamamını kapsıyor.

**Tier 1 — Doğrudan kullanılabilir (mimarimizin çekirdek parçaları):**

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  1. TelePlay (subinps/TelePlay)                                   │
│     ★ EN YAKIN PROJE — Telegram'dan video stream                  │
│     → Telegram dosyalarını İNDİRMEDEN multi-client paralel        │
│       download ile stream eder (bizim Telegram proxy katmanı)     │
│     → Web App + Android TV + mobil uygulama                       │
│     → ExoPlayer, PiP mode, file browser                          │
│     → MIT lisans, Kotlin+TypeScript+Python                        │
│     → v1.0.2 (Mart 2026, aktif geliştirme)                       │
│     → github.com/subinps/TelePlay                                │
│     → BİZİM İÇİN: Telegram stream katmanını olduğu gibi al      │
│                                                                   │
│  2. Telegram-Stremio (weebzone/Telegram-Stremio)                  │
│     ★ TMDB METADATA + TELEGRAM DEPOLAMA                           │
│     → Telegram dosyalarını Stremio ile stream eder                │
│     → IMDB/TMDB metadata entegrasyonu                             │
│     → Multi-token load balancer (birden fazla bot)                │
│     → MongoDB, FastAPI, PyroFork                                  │
│     → Subscription yönetimi, admin paneli                         │
│     → Dosya süresi dolmaz (kalıcı depolama)                      │
│     → 188 yıldız, GPL-3.0                                        │
│     → github.com/weebzone/Telegram-Stremio                       │
│     → BİZİM İÇİN: Metadata + DB yapısı + load balancer mantığı  │
│                                                                   │
│  3. Unlimited-Storage (friday2su/Unlimited-Storage)               │
│     ★ TELEGRAM + HLS = BİZİM TAM MİMARİ                          │
│     → Videoları Telegram'a yükler (sınırsız depolama)             │
│     → HLS (m3u8) formatında stream eder                           │
│     → Çoklu ses izi + çoklu kalite desteği                        │
│     → Embed player dahil                                          │
│     → github.com/friday2su/Unlimited-Storage                      │
│     → BİZİM İÇİN: En yakın tam proje. HLS+Telegram birleşimi    │
│                                                                   │
│  4. BetterTGStreamer (TechShreyash/BetterTGStreamer)               │
│     → MP4/MKV → M3U8 HLS dönüşümü (Telegram'da)                 │
│     → 3 ayrı servis: Bot + API + DB                               │
│     → Cloudflare Workers, MongoDB                                  │
│     → Remote URL upload (FTP, GDrive, OneDrive)                   │
│     → Kalıcı linkler, sınırsız yükleme                            │
│     → MIT lisans (ARŞİVLENMİŞ — Mayıs 2024)                     │
│     → github.com/TechShreyash/BetterTGStreamer                    │
│     → BİZİM İÇİN: Mimari referans, fork'lanabilir                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Tier 2 — Otomasyon pipeline'ı için:**

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  5. GoStream (MrRobotoGit/gostream)                               │
│     ★ TMDB + TORRENT OTOMATİK KEŞİF                              │
│     → TMDB trending/popular'dan otomatik film keşfi               │
│     → Torrentio ile en iyi torrent bulma (4K DV öncelik)         │
│     → FUSE sanal dosya sistemi — torrent'i canlı stream          │
│     → Kalite yükseltme: 1080p → 4K HDR otomatik                  │
│     → TV dizisi haftalık senkron                                  │
│     → ~700K peer blocklist (gizlilik)                             │
│     → Go, tek binary, GPL-2.0                                    │
│     → github.com/MrRobotoGit/gostream                            │
│     → BİZİM İÇİN: Worker 1-2-3 mantığı zaten yapılmış           │
│                                                                   │
│  6. CineFlow (szilab/CineFlow)                                   │
│     → TMDB otomatik keşif + Jackett torrent arama                │
│     → Jellyfin entegrasyonu                                       │
│     → Transmission download client                                │
│     → Akıllı kütüphane yönetimi                                  │
│     → YAML config                                                 │
│     → github.com/szilab/CineFlow                                 │
│     → BİZİM İÇİN: Radarr/Sonarr alternatifi, daha hafif         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Tier 3 — Embed servisi altyapısı:**

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  7. PyHLS (ZingyTomato/PyHLS)                                     │
│     ★ JWT TOKEN + HLS + OTOMATİK ENCODE                           │
│     → Upload → otomatik HLS encode (FFmpeg)                       │
│     → JWT token ile her segment imzalı                            │
│     → Zamanlı erişim (1dk-7gün)                                   │
│     → Dinamik playlist üretimi                                    │
│     → İç/dış ID ayrımı, path traversal koruması                  │
│     → Docker, Python 3.7+                                         │
│     → github.com/ZingyTomato/PyHLS                               │
│     → BİZİM İÇİN: Koruma katmanı (HMAC/JWT) referansı           │
│                                                                   │
│  8. Streamabol (runabol/streamabol)                               │
│     → MP4 → HLS on-the-fly dönüşüm (encode yok, remux)          │
│     → HMAC-SHA256 imzalı URL'ler                                  │
│     → Remote URL'den direkt stream                                │
│     → Go, tek binary, Docker                                      │
│     → MIT lisans (Mart 2025)                                      │
│     → github.com/runabol/streamabol                               │
│     → BİZİM İÇİN: On-the-fly HLS (MOD 2) tam olarak bu         │
│                                                                   │
│  9. AVShack (sparks-and-magic/avshack)                            │
│     → VOD sunucusu: MP4 → HLS                                    │
│     → Embed hls.js player dahil                                   │
│     → REST API + Web frontend                                     │
│     → SQLite veritabanı                                           │
│     → github.com/sparks-and-magic/avshack                        │
│     → BİZİM İÇİN: Embed player + API yapısı referansı           │
│                                                                   │
│  10. MediaOnion (jeoliva/mediaonion)                              │
│     → On-the-fly MP4 → HLS packaging                              │
│     → Otomatik ses izi çıkarma                                    │
│     → Adaptive bitrate                                            │
│     → Kubernetes-ready, Prometheus metrics                        │
│     → Node.js                                                     │
│     → github.com/jeoliva/mediaonion                               │
│     → BİZİM İÇİN: Production-grade HLS packaging referansı      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Birleştirme planı — açık kaynak Frankenstein:**

```
Bizim 70K+30K embed servisi = bu projelerin birleşimi:

  Telegram stream     → TelePlay veya Unlimited-Storage (çekirdek)
  Metadata + DB       → Telegram-Stremio (TMDB/IMDB entegrasyon)
  Otomasyon pipeline  → GoStream (TMDB keşif + torrent bulma)
  HLS dönüşüm        → Streamabol (on-the-fly, encode yok)
  Koruma              → PyHLS (JWT/HMAC imzalı segment URL)
  Embed player        → AVShack (hls.js embed)
  Real-Debrid         → RealDebridTelegram (RD → Telegram köprüsü)

Tam sıfırdan yazmak yerine:
  1. Unlimited-Storage'ı fork'la (Telegram+HLS çekirdek)
  2. GoStream'in TMDB keşif mantığını entegre et
  3. Streamabol'un HMAC URL imzalama kodunu al
  4. PyHLS'in JWT token sistemini adapte et
  5. RD API entegrasyonunu ekle
  6. Kendi embed player'ını yaz (hls.js + native <video>)

  Tahmini entegrasyon süresi: 2-4 hafta (tek geliştirici)
```

---

### 9.1 OPSEC Kimlik Zinciri — Sıfır İz

Analiz edilen 7 provider'ın hiçbirinde gerçek isim/adres yok. Aynı modeli uygulayan tam zincir:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        KİMLİK KATMANI                                    │
│                                                                          │
│  E-posta:    ProtonMail veya Tuta (kimlik gerekmez, ücretsiz)            │
│              → Tor Browser üzerinden kayıt                               │
│              → Bu e-posta SADECE altyapı kaydı için kullanılır           │
│                                                                          │
│  Domain:     Njalla (njal.la)                                            │
│              → Domain'i kendi adına alır, siz yönetirsiniz               │
│              → WHOIS'te Njalla'nın bilgileri görünür                     │
│              → .com/.net = 15€/yıl, .click/.lol = 15€/yıl               │
│              → Ödeme: Monero (en anonim) veya BTC                        │
│                                                                          │
│  Hosting:    AlexHost (alexhost.com) — Moldova                           │
│              → DMCA'ya "lenient" yaklaşım (ABD DMCA'sı geçersiz)         │
│              → Kimlik doğrulaması yok                                    │
│              → Ödeme: Kripto (BTC, ETH, USDT)                            │
│              → VPS U4: €16/ay (4 vCore, 8GB RAM, 80GB NVMe, 100Mbps)    │
│                                                                          │
│  Alternatif: FlokiNET (flokinet.is) — İzlanda/Romanya                   │
│              → Daha güçlü DMCA direnci (İzlanda hukuku)                  │
│              → Romania VPS I: €7.99/ay (1 core, 20GB, 3TB BW)           │
│              → Iceland VPS I: €10.99/ay                                  │
│              → Ödeme: BTC, PayPal                                        │
│                                                                          │
│  CDN proxy:  Cloudflare (ücretsiz plan)                                  │
│              → SADECE proxy (storage değil — bkz. §8.0)                  │
│              → Gerçek sunucu IP'sini gizler                              │
│              → DDoS koruması dahil                                       │
│              → Kayıt: ProtonMail adresi ile                              │
│                                                                          │
│  Ödeme:      Monero (XMR) → en anonim kripto                             │
│              → AlexHost/FlokiNET/Njalla hepsi kabul ediyor               │
│              → BTC kullanılacaksa: Bisq veya no-KYC exchange             │
│              → KESİNLİKLE kredi kartı / banka havalesi kullanılmaz       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Analiz edilen provider'larla karşılaştırma:**

| Katman | VOE | StreamWish | PrimeSrc | Bu model |
|--------|-----|-----------|----------|----------|
| **Domain** | DGA rotasyonu (`dianaavoidthey.com`) | Rastgele domain (`greenmountainventures.shop`) | Sabit (`primesrc.me`) | Njalla arkasında sabit domain |
| **Hosting** | Bilinmiyor (muhtemelen offshore) | Bilinmiyor | Bilinmiyor | AlexHost Moldova / FlokiNET İzlanda |
| **CDN** | Edgeon (ticari anlaşma) | Cloudflare (proxy) | TikTok CDN (yetkisiz) | Cloudflare (proxy) + sunucu direkt |
| **Ödeme** | Bilinmiyor | Bilinmiyor | Bilinmiyor | Monero / BTC (no-KYC) |
| **WHOIS** | Privacy guard | Privacy guard | Privacy guard | Njalla (kendi adına kayıt) |

### 9.2 Mimari — Düşük Bütçe Versiyonu

Pahalı CDN anlaşması yerine analiz ettiğimiz **StreamWish/Upcloud modeli**: Cloudflare ücretsiz plan proxy olarak, segmentler sunucudan direkt.

```
┌──────────────────────────────────────────────────────────────────┐
│                  AGGREGATOR SİTE (opsiyonel)                      │
│  Başka bir VPS veya aynı sunucu üzerinde                          │
│  Next.js / Nuxt — TMDB API ile katalog                            │
│  Embed iframe'i çağırır                                           │
└───────────────────────────┬──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                    EMBED SUNUCU (AlexHost VPS)                    │
│                                                                   │
│  ┌─── Cloudflare Proxy (ücretsiz) ─────────────────────────┐     │
│  │  → Gerçek IP gizli                                       │     │
│  │  → DDoS koruması                                         │     │
│  │  → SSL termination                                       │     │
│  │  → Turnstile bot koruması                                │     │
│  └─────────────────────────────────────────────────────────┘     │
│                            │                                      │
│  ┌─── Node.js / Go API ───────────────────────────────────┐     │
│  │  POST /api/init     → Turnstile + FP doğrula → token    │     │
│  │  GET  /api/manifest → imzalı m3u8 üret                   │     │
│  │  GET  /hls/:id/*    → dinamik m3u8 + imzalı segment URL  │     │
│  │  GET  /seg/:token   → segment dosyası serve (imza kontrol)│     │
│  └─────────────────────────────────────────────────────────┘     │
│                            │                                      │
│  ┌─── Disk Storage ───────────────────────────────────────┐     │
│  │  /data/videos/{content_id}/720p/seg-{N}.ts              │     │
│  │  /data/videos/{content_id}/480p/seg-{N}.ts              │     │
│  │  /data/videos/{content_id}/360p/seg-{N}.ts              │     │
│  │  /data/videos/{content_id}/audio/seg-{N}.ts             │     │
│  │  /data/videos/{content_id}/subs/{lang}.vtt              │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌─── Embed Oynatıcı (static) ────────────────────────────┐     │
│  │  hls.js + özel UI (minimal, JWPlayer gibi)               │     │
│  │  Turnstile widget                                         │     │
│  │  Fingerprint + bot detection script                       │     │
│  │  Anti-adblock                                             │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

**Neden bu mimari?**

| Karar | Neden |
|-------|-------|
| **Tek sunucu** | Bütçe darboğazı. VOE gibi ayrı CDN anlaşması pahalı. Cloudflare ücretsiz plan bandwidth sınırı yok (proxy olarak). |
| **Cloudflare proxy** | Analiz edilen 4/7 provider bunu yapıyor (StreamWish, Upcloud, Akcloud + kendi arkası). IP gizleme + DDoS koruması + SSL = $0. |
| **Disk storage** | Object storage yerine lokal disk. AlexHost VPS'te 80GB NVMe var; ek disk eklenebilir. S3/R2 gibi harici servis = ek iz + ek maliyet. |
| **hls.js** | Shaka Player'dan daha hafif. JWPlayer gibi ücretli değil. 6/7 provider JWPlayer kullanıyor ama ücretli + telemetri. |
| **Segment serve direkt** | CDN yerine Cloudflare cache + sunucu direkt. Cloudflare ücretsiz planda bile video caching yapıyor (popular dosyalar). |

### 9.3 Roadmap — 5 Faz (Bütçe Odaklı)

---

#### Faz 1: Altyapı Kurulumu (Gün 1-3)

```
Ön hazırlık (sıfır maliyet):
  ┌─ [ ] ProtonMail hesabı aç (Tor Browser üzerinden)
  │      → Bu adres SADECE altyapı kayıtları için
  │      → Kişisel e-posta ile KESİNLİKLE karıştırma
  │
  └─ [ ] Monero (XMR) temin et
         → No-KYC exchange: Bisq, LocalMonero, TradeOgre
         → Veya BTC → XMR atomic swap

Sunucu (AlexHost VPS — kripto ile):
  ┌─ [ ] AlexHost VPS U4 satın al (€16/ay, kripto ödeme)
  │      → 4 vCore, 8GB RAM, 80GB NVMe, 100 Mbps unlimited
  │      → OS: Debian 12 veya Ubuntu 24.04 LTS
  │      → Konum: Moldova (DMCA-resistant)
  │
  ├─ [ ] İlk sunucu hardening
  │      → SSH key-only auth (parola giriş kapalı)
  │      → fail2ban kurulumu
  │      → UFW: sadece 80, 443, SSH portu açık
  │      → unattended-upgrades aktif
  │
  └─ [ ] Ek disk (gerekirse)
       → AlexHost'ta ek NVMe: ~€5/100GB
       → Veya 2. VPS sadece storage olarak

Domain (Njalla — kripto ile):
  ┌─ [ ] 3 domain al (Njalla, Monero ile)
  │      → embed-domain.click      (embed oynatıcı)         15€/yıl
  │      → cdn-domain.lol          (segment CDN subdomain'i) 15€/yıl
  │      → spare-domain.net        (yedek / rotasyon)        15€/yıl
  │
  └─ [ ] Neden 3 domain?
       → Filemoon modeli: embed ve CDN ayrı domain
       → StreamWish modeli: bir tanesi kapanırsa yedek hazır
       → Domain ayrımı: analiz edilen 5/7 provider bunu yapıyor

Cloudflare (ücretsiz plan):
  ┌─ [ ] Cloudflare hesabı aç (ProtonMail ile)
  │      → Ücretsiz plan (unlimited bandwidth proxy)
  │
  ├─ [ ] embed-domain.click → Cloudflare'e ekle
  │      → Proxy modu ON (turuncu bulut)
  │      → SSL: Full (Strict)
  │      → Gerçek IP asla açığa çıkmaz
  │
  ├─ [ ] cdn-domain.lol → Cloudflare'e ekle
  │      → Aynı ayarlar
  │      → Wildcard DNS: *.cdn-domain.lol → sunucu IP (proxy ON)
  │
  └─ [ ] Cloudflare Turnstile site key al
       → embed-domain.click için
       → Managed mode (otomatik karar)
       → Ücretsiz (sınırsız kullanım)
```

**Faz 1 maliyeti:**
```
AlexHost VPS U4:        €16/ay
Njalla domain ×3:       €45/yıl = €3.75/ay
Cloudflare:             €0
ProtonMail:             €0
─────────────────────────────────
Toplam:                 ~€20/ay
```

---

#### Faz 2: Video Pipeline + Storage (Hafta 1-2)

```
Hedef: Dosyaları HLS'e çevir ve sunucuya yükle

Sunucuya FFmpeg kur:
  ┌─ [ ] apt install ffmpeg
  │      → Debian/Ubuntu'da hazır paket
  │      → GPU encode yok (VPS'te GPU yok, CPU yeterli)
  │
  └─ [ ] Encode script'i yaz (encode.sh)

       #!/bin/bash
       INPUT="$1"
       ID="$2"
       OUTDIR="/data/videos/$ID"
       mkdir -p "$OUTDIR"/{720p,480p,360p,audio,subs}

       ffmpeg -i "$INPUT" \
         -filter_complex "[0:v]split=3[v1][v2][v3]; \
           [v1]scale=1280:720[v720]; \
           [v2]scale=854:480[v480]; \
           [v3]scale=640:360[v360]" \
         -map "[v720]" -c:v libx264 -b:v 2500k -preset medium -profile:v high \
           -f hls -hls_time 4 -hls_list_size 0 \
           -hls_segment_filename "$OUTDIR/720p/seg-%d.ts" "$OUTDIR/720p/index.m3u8" \
         -map "[v480]" -c:v libx264 -b:v 1200k -preset medium -profile:v main \
           -f hls -hls_time 4 -hls_list_size 0 \
           -hls_segment_filename "$OUTDIR/480p/seg-%d.ts" "$OUTDIR/480p/index.m3u8" \
         -map "[v360]" -c:v libx264 -b:v 800k -preset medium -profile:v main \
           -f hls -hls_time 4 -hls_list_size 0 \
           -hls_segment_filename "$OUTDIR/360p/seg-%d.ts" "$OUTDIR/360p/index.m3u8" \
         -map 0:a:0 -c:a aac -b:a 128k -ac 2 \
           -f hls -hls_time 4 -hls_list_size 0 \
           -hls_segment_filename "$OUTDIR/audio/seg-%d.ts" "$OUTDIR/audio/index.m3u8"

       # Thumbnail sprite sheet (seek preview)
       ffmpeg -i "$INPUT" -vf "fps=1/10,scale=160:-1,tile=10x10" \
         "$OUTDIR/thumbs.jpg"

       echo "Encode complete: $ID"

Disk yapısı:
  /data/videos/
    ├── movie-83533/
    │   ├── 720p/
    │   │   ├── index.m3u8
    │   │   ├── seg-0.ts
    │   │   ├── seg-1.ts
    │   │   └── ...
    │   ├── 480p/
    │   ├── 360p/
    │   ├── audio/
    │   ├── subs/
    │   │   ├── en.vtt
    │   │   └── tr.vtt
    │   └── thumbs.jpg
    └── movie-12345/
        └── ...

İçerik aktarımı (kaynak dosyaları sunucuya alma):
  → SFTP veya rsync ile güvenli transfer
  → Lokal encode: sunucuda encode et, kaynağı sil
  → Veya uzaktan encode edip segmentleri yükle
```

---

#### Faz 3: Embed API + Oynatıcı (Hafta 2-4)

```
Hedef: VOE seviyesinde korumalı embed oynatıcı + API

Teknoloji: Node.js (Fastify) — hafif, hızlı, tek sunucuya uygun

Proje yapısı:
  /app/
    ├── server.js              (Fastify API + segment serve)
    ├── lib/
    │   ├── hmac.js            (URL imzalama)
    │   ├── fingerprint.js     (bot detection doğrulama)
    │   ├── manifest.js        (dinamik m3u8 üretimi)
    │   └── ratelimit.js       (IP bazlı rate limiting)
    ├── public/
    │   ├── embed.html         (oynatıcı sayfası)
    │   ├── player.js          (hls.js + özel UI)
    │   ├── fp.js              (fingerprint + bot detection)
    │   └── style.css
    ├── data/videos/           (HLS segmentleri)
    └── db/
        └── content.sqlite     (içerik metadata — lightweight)
```

**API endpoint'leri (VOE + Filemoon hibrit):**

```
POST /api/embed/init
  ├── Input:  { content_id, turnstile_token, fingerprint_hash }
  ├── Doğrula: Turnstile → Cloudflare API ile kontrol
  ├── Doğrula: Fingerprint → bilinen bot hash'leri ile karşılaştır
  ├── Üret:   session_token (JWT, 30 dk, IP + ASN bağlı)
  └── Output: { session_token, expires_at }

GET /api/manifest/:content_id
  ├── Header:  Authorization: Bearer <session_token>
  ├── Doğrula: JWT geçerli mi? IP aynı mı?
  ├── Üret:    Dinamik master.m3u8
  │            → Her segment URL'si ayrı HMAC imzalı
  │            → Uzantı randomizasyonu (Upcloud modeli)
  └── Output:  m3u8 playlist

GET /seg/:signature/:filename
  ├── Doğrula: HMAC imza geçerli mi?
  ├── Doğrula: Süre dolmuş mu? IP aynı mı?
  ├── Serve:   /data/videos/... den dosya oku
  ├── Header:  Content-Type: video/MP2T
  │            (uzantı ne olursa olsun gerçek tip budur)
  │            Cache-Control: private, max-age=300
  └── Output:  .ts segment dosyası
```

**URL imzalama (VOE'dan daha iyi):**

```javascript
// VOE: t, s, e, f, node, i, sp, asn, q, rq (10 parametre)
// Bizim: aynıları + sessionId + segmentNum (12 parametre)

function signSegmentUrl(contentId, quality, segNum, clientIp, asn, sessionId) {
  const now = Math.floor(Date.now() / 1000);
  const expire = 7200; // 2 saat
  const payload = [
    contentId, quality, segNum,
    clientIp, asn, now, expire, sessionId
  ].join(':');

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('base64url');

  // Uzantı randomizasyonu (Upcloud modeli)
  const fakeExts = ['.woff2', '.jpg', '.png', '.css', '.js', '.svg', '.txt'];
  const ext = fakeExts[segNum % fakeExts.length];

  return `/seg/${signature}/${base64url(contentId)}/${quality}/s${segNum}${ext}`
       + `?s=${now}&e=${expire}`;
}
```

**Dinamik m3u8 üretimi (her kullanıcıya özel):**

```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:4
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:4.000,
https://abc123.cdn-domain.lol/seg/xK9mPq.../YWJj/720p/s0.woff2?s=1711756800&e=7200
#EXTINF:4.000,
https://def456.cdn-domain.lol/seg/Lm8nRw.../YWJj/720p/s1.jpg?s=1711756800&e=7200
#EXTINF:4.000,
https://ghi789.cdn-domain.lol/seg/Pq3sTu.../YWJj/720p/s2.css?s=1711756800&e=7200
```

Her segment:
- Farklı subdomain (`abc123`, `def456` — wildcard DNS ile)
- Farklı uzantı (`.woff2`, `.jpg`, `.css`)
- Ayrı HMAC imza
- IP + ASN bağlı (başkası açamaz)

**Embed oynatıcı (hls.js tabanlı):**

```
embed.html şablonu:
  1. Turnstile widget render
  2. Kullanıcı "insan" onayı → /api/embed/init çağır
  3. Session token al
  4. /api/manifest/:id çağır → m3u8 URL al
  5. hls.js ile video oynat
  6. Reklam katmanı (VAST pre-roll)
  7. Anti-adblock kontrolü
```

---

#### Faz 4: Koruma Katmanları (Hafta 3-5)

```
5 katmanlı koruma (analiz edilen en iyilerden derleme):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KATMAN 1: Cloudflare (otomatik, $0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  → DDoS koruması (L3/L4/L7)
  → IP gizleme (gerçek sunucu IP açığa çıkmaz)
  → SSL termination
  → Bot fight mode ON (ücretsiz planda var)
  → Browser Integrity Check ON
  → Hotlink protection ON

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KATMAN 2: Turnstile CAPTCHA (VOE modeli, $0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  → Embed sayfa yüklendiğinde managed challenge
  → Sunucu tarafında token doğrulama (Cloudflare API)
  → Başarısızsa → video yüklenmez
  → Invisible mode (kullanıcı genelde görmez)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KATMAN 3: Bot Detection (VOE modeli, $0 — açık kaynak)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  fp.js — tarayıcıda çalışan script:

  a) Tarayıcı parmak izi:
     → Canvas fingerprint (hash)
     → WebGL renderer + vendor string
     → AudioContext fingerprint
     → navigator.languages + timezone
     → screen.width/height + colorDepth
     → deviceMemory + hardwareConcurrency

  b) Headless / otomasyon tespiti:
     → navigator.webdriver === true → BOT
     → window.cdc_adoQpoasnfa76pfcZLmcfl → Selenium
     → window.__nightmare → Nightmare.js
     → navigator.permissions.query({name:'notifications'})
       → Notification.permission === 'denied' && !user_interacted → BOT

  c) VM / emülatör tespiti (VOE'nun detect-gpu yaklaşımı):
     → WebGL getParameter(RENDERER)
     → "llvmpipe" / "SwiftShader" / "VirtualBox" / "VMware" → VM
     → GPU benchmark: basit WebGL render, süre > threshold → VM

  d) DevTools tespiti (analiz ettiğimiz sitelerin yaptığı):
     → console.log zamanlama farkı (DevTools açıksa yavaşlar)
     → window.outerHeight - window.innerHeight > 200 → DevTools açık
     → debugger statement trap

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KATMAN 4: İmzalı URL + Segment Gizleme
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  → HMAC-SHA256 per-segment imza (Faz 3'te detay)
  → IP + ASN bağlama
  → 2 saat süre limiti
  → Uzantı randomizasyonu: .woff2/.jpg/.css/.js/.svg/.txt
  → Wildcard subdomain rotasyonu: *.cdn-domain.lol
  → Base64 path'ler

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KATMAN 5: Rate Limiting + CORS (Akcloud modeli)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  → Rate limit: 5 manifest/dk, 60 segment/dk per IP
  → CORS: sadece embed-domain.click kabul edilir
  → Referer kontrolü: boş veya yanlış referer → 403
  → User-Agent kontrolü: bilinen bot UA'ları → 403
```

**Karşılaştırma — provider'lar vs bizim koruma:**

| Koruma | VOE | Filemoon | Bizim |
|--------|-----|---------|-------|
| Cloudflare proxy | ✓ | ✓ | ✓ |
| Turnstile | ✓ | ✓ (via primesrc) | ✓ |
| FingerprintJS | ✓ (Pro — ücretli) | - | Açık kaynak eşdeğeri ($0) |
| detect-gpu | ✓ | - | ✓ |
| DevTools tespit | - | - | ✓ (ek katman) |
| Challenge/Attest | - | ✓ (3 adım) | Sadeleştirilmiş (2 adım) |
| İmzalı URL | ✓ (10 param) | ✓ (7 param) | ✓ (12 param — en kapsamlı) |
| Segment gizleme | - | - | ✓ (Upcloud modeli) |
| Rate limit | - | - | ✓ (Akcloud modeli) |
| CORS | - | - | ✓ (StreamWish modeli) |

---

#### Faz 5: Reklam + Operasyon (Hafta 4-6)

```
Reklam (gelir kaynağı — sürdürülebilirlik için şart):

  Tier 1 — Kolay başlangıç:
  ┌─ [ ] Adcash / iClick (hilltopads.com)
  │      → Analiz edilen 5/7 provider bunu kullanıyor
  │      → Onay süreci kolay, domain geçmişi gerekmez
  │      → Pop-under + video pre-roll
  │      → CPM: $0.50-3.00 (geo'ya bağlı)
  │
  └─ [ ] VAST tag entegrasyonu
       → hls.js oynatıcıya pre-roll reklam
       → Adcash VAST URL → oynatıcıda render

  Tier 2 — Büyüdükçe:
  ┌─ [ ] Google Ad Manager (DFP)
  │      → Daha yüksek CPM ama onay süreci uzun
  │      → IMA SDK ile entegrasyon
  │
  └─ [ ] Doğrudan reklam (VPN, gambling, kripto)
       → Bu nichede doğrudan reklam veren çok
       → CPM: $5-15 (doğrudan anlaşma)

  Anti-adblock:
  ┌─ [ ] Bait element detection
  │      → <div id="ad-test" style="..."> oluştur
  │      → offsetHeight === 0 → adblock aktif
  │      → Overlay göster: "Reklam engelleyiciyi kapat"
  │
  └─ [ ] Server-side ad injection (gelişmiş)
       → m3u8 üretirken reklam segment'i araya ekle
       → Adblock atlatılamaz (video segment gibi görünür)

Operasyonel güvenlik (sürekli):
  ┌─ [ ] Domain rotasyonu stratejisi
  │      → 3 domain hazır (Faz 1'de alındı)
  │      → Biri kapanırsa DNS'i yedek domain'e çevir
  │      → Cloudflare'de 2. domain zaten hazır
  │      → Kullanıcıları Telegram kanalı ile bilgilendir
  │
  ├─ [ ] Sunucu yedekleme
  │      → Encode edilmiş segmentler → 2. VPS'e rsync (günlük)
  │      → Veritabanı dump → şifreli yedek (GPG)
  │      → Felaket senaryosu: 1 saat içinde 2. sunucuda ayağa kalk
  │
  ├─ [ ] Log hijyeni
  │      → Access log'ları 24 saat tutulur, sonra silinir
  │      → IP log'ları hash'lenir (gerçek IP kaydedilmez)
  │      → Error log'ları 7 gün
  │
  ├─ [ ] HMAC key rotasyonu
  │      → Her 30 günde SECRET_KEY değişir
  │      → Eski key 2 saat daha geçerli (graceful transition)
  │
  └─ [ ] Monitoring
       → Uptime Kuma (sunucu üzerinde, $0)
       → Alert: Telegram bot ile
       → Disk doluluk uyarısı (%80'de alert)
       → Bandwidth uyarısı (günlük ortalama takibi)
```

### 9.4 Maliyet — Gerçek Bütçe

```
                         Başlangıç    6 ay sonra     1 yıl sonra
                         (MVP)        (büyüme)       (olgunluk)
───────────────────────────────────────────────────────────────────
AlexHost VPS U4          €16/ay       €16/ay ×2      €16/ay ×3
  (4 core, 8GB, 80GB)                 (2. encode     (3. yedek
                                       sunucu)        sunucu)

Njalla domain ×3         €3.75/ay     €3.75/ay       €5/ay (ek domain)

Cloudflare               €0           €0             €0
Turnstile                €0           €0             €0
Let's Encrypt SSL        €0           €0             €0
FFmpeg                   €0           €0             €0
hls.js                   €0           €0             €0
Node.js                  €0           €0             €0
SQLite                   €0           €0→PostgreSQL   PostgreSQL
Uptime Kuma              €0           €0             €0
───────────────────────────────────────────────────────────────────
TOPLAM                   ~€20/ay      ~€36/ay        ~€53/ay
                         (~$22)       (~$40)         (~$58)
```

**VOE ile maliyet karşılaştırması:**

```
VOE:     €5,000-20,000/ay (Edgeon CDN + altyapı tahmini)
Filemoon: €2,000-10,000/ay (SprintCDN + sunucular tahmini)
Bizim:    €20/ay başlangıç

Fark:    Cloudflare ücretsiz proxy = CDN maliyeti $0
         AlexHost Moldova = Hetzner/OVH'nin 1/4 fiyatı
         Açık kaynak her şey = lisans maliyeti $0
         Kripto ödeme = banka izi $0
```

### 9.5 Teknoloji Stack — Final

```
Sunucu OS:          Debian 12 (minimal, stabil)
Runtime:            Node.js 22 LTS (Fastify framework)
Oynatıcı:          hls.js v1.5+ (BSD lisans, $0)
Video encode:       FFmpeg 7.x (self-hosted, CPU-only)
Storage:            Lokal NVMe disk (/data/videos/)
Veritabanı:         SQLite (başlangıç) → PostgreSQL (büyüdükçe)
Cache:              Node.js in-memory LRU (başlangıç) → Redis (büyüdükçe)
Bot koruması:       Cloudflare Turnstile + özel fp.js + detect-gpu
URL imzası:         HMAC-SHA256 (12 parametre, per-segment)
Segment gizleme:    Uzantı randomizasyonu + wildcard subdomain + base64 path
Anti-adblock:       Bait detection + server-side ad injection
Reklam:             Adcash/iClick (başlangıç) → Google DFP (büyüdükçe)
Monitoring:         Uptime Kuma + Telegram bot alert
Yedekleme:          rsync → 2. VPS (günlük, şifreli)
Domain kayıt:       Njalla (Monero ile)
Hosting:            AlexHost Moldova (kripto ile)
DNS/Proxy:          Cloudflare ücretsiz plan
Ödeme:              Monero (XMR) — tüm altyapı ödemeleri
İletişim:           Telegram kanal (kullanıcı bildirimleri)
```

### 9.6 VOE vs Bu Sistem — Son Karşılaştırma

| Kriter | VOE | Bu sistem |
|--------|-----|-----------|
| **Güvenlik seviyesi** | 9/10 | 9/10 (aynı katmanlar, açık kaynak) |
| **Ölçek kapasitesi** | 100K+ eşzamanlı | 500-2000 eşzamanlı (başlangıç) |
| **CDN** | Edgeon (enterprise) | Cloudflare proxy (ücretsiz) |
| **OPSEC** | İyi (DGA domain) | Çok iyi (Njalla + kripto + Moldova) |
| **Maliyet** | ~€10,000/ay | ~€20/ay |
| **Domain dayanıklılığı** | DGA rotasyonu | 3 yedek domain (Njalla) |
| **Oynatıcı** | JWPlayer (ücretli) | hls.js (ücretsiz) |
| **Segment gizleme** | Yok | Upcloud modeli (en iyi) |
| **Büyüme yolu** | Dikey (daha pahalı CDN) | Yatay (ek VPS ekleme) |

### 9.7 Ölçekleme Yolu

```
Aşama 1 — MVP (€20/ay):
  → Tek AlexHost VPS, 500-2000 eşzamanlı kullanıcı
  → 100 Mbps = ~50 kullanıcı × 720p eşzamanlı (gerçekçi)
  → Cloudflare cache ile bu sayı 3-5x artar

Aşama 2 — Büyüme (€40/ay):
  → 2. VPS: encode worker + yedek
  → CDN domain ayrımı (Filemoon modeli)
  → SQLite → PostgreSQL geçişi

Aşama 3 — Ciddi trafik (€100-200/ay):
  → 3-5 VPS farklı lokasyonlarda
  → GeoDNS ile kullanıcıyı en yakın sunucuya yönlendir
  → BunnyCDN ekleme ($0.01/GB — segment serve için)
  → Redis cache katmanı

Aşama 4 — VOE seviyesi (€500+/ay):
  → Dedicated sunucular (AlexHost dedi, €26/ay'dan başlıyor)
  → Ticari CDN anlaşması (BunnyCDN veya KeyCDN toptan)
  → Otomatik encode pipeline (kuyruk sistemi)
  → Yönetim paneli (içerik yükleme, istatistik)
```

### 9.8 Zaman Çizelgesi

```
Gün 1-3:    Altyapı kurulumu (hesaplar + sunucu + domain)      Faz 1
Hafta 1-2:  Video pipeline (FFmpeg encode + disk yapısı)        Faz 2
Hafta 2-4:  Embed API + oynatıcı (Node.js + hls.js)            Faz 3
Hafta 3-5:  Koruma katmanları (5 katman)                        Faz 4
Hafta 4-6:  Reklam + operasyon                                  Faz 5
─────────────────────────────────────────────────────────────────────
MVP:        ~3-4 hafta (tek geliştirici)
Tam ürün:   ~6-8 hafta
İlk gelir:  ~2. ayda (reklam onayı + trafik)
```

---

> **Son not:** Bu rapor tamamen teknik analiz amaçlıdır. Analiz edilen sistemlerin çoğu telif hakları açısından sorunlu içerik dağıtıyor. Meşru bir platform kurmak için lisanslı içerik ve uygun yasal çerçeve şarttır.
cmd + shift + g finder da kolayca aramak

/Applications/Utilities eger spotlight ile arama yapamiyorsak

Telegram'da Uçtan Uca Şifreleme (E2EE) Var mı?Hayır, yok.  

Saved Messages (kendine kaydetme) normal bir Cloud Chat'tir.
Cloud Chat'lerde uçtan uca şifreleme (E2EE) yoktur. Sadece client-server şifreleme (MTProto) vardır.
Telegram sunucuları mesajları/filmleri okuyabilir (teoride yasal talep, hack veya iç erişim durumunda).



