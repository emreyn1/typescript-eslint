# embed-api Değerlendirme ve Karar Notu

> Kullanıcının 2 sorusuna net cevap: (1) embed-api hazır mı? (2) Gönderilen 2 plan en iyi iki plan mı?
> Bu belge kod değiştirmez, sadece denetim + karşılaştırma + karar ağacıdır.

---

## KISA CEVAP (önce bunu oku)

```
1. embed-api hazır mı?
   HAYIR. Kod iskeleti %70, konfig %0, production %0.
   Tek bir film bile servis edilebilecek durumda değil.

2. Gönderilen 2 plan "en iyi iki plan" mı?
   HAYIR.
   - Plan 1 ("En İyi Kombinasyon") kendi içinde iki farklı mimariyi
     karıştırıyor (iframe vs gerçek scraper) — aynı şey değiller.
   - Plan 2 ("Lean Startup") zaten mevcut embed-api kodunun
     production hâli, "yeni plan" değil.

   Doğru çerçeve:
   - Başlangıç  → Yol A (Pure Aggregator)
   - Ölçek      → Yol B (Proxy Streamer) ≈ Plan 2
   - İddialı    → Yol C (Hybrid) ≈ Plan 1 ama temizlenmiş
```

---

## 1. embed-api HAZIRLIK DENETİMİ

### 1.1 Yazılmış modüller ve iş görme oranı

```
MODUL                               DURUM    NOT
embed-api/src/providers/index.ts     %100    5 iframe kaynağı (vidsrc, 2embed, autoembed, multiembed, vidsrc2)
                                             → SADECE URL döndürüyor, scrape etmiyor
embed-api/src/pipeline/torrent.ts    %90     YTS + EZTV + Real-Debrid unrestrict
                                             → webtorrent fallback eksik (magnet'i işleyemiyor)
embed-api/src/pipeline/remux.ts      %100    ffmpeg ile MP4 → HLS, .ts→.jpg Cloudflare hilesi
embed-api/src/pipeline/catalog.ts    %100    Cache → Telegram → Torrent öncelik sırası
embed-api/src/db/index.ts            %100    content_cache + coin_balances + watch_sessions + referral
embed-api/src/routes/embed.ts        %100    /embed/movie/:id, /embed/tv/:id/:s/:e, /embed?tmdb=...
embed-api/src/routes/api.ts          %100    /sources, /resolve, /heartbeat, /coins, /referral, /health
embed-api/src/player/player-v2.html  %100    hls.js tabanlı player
embed-api/src/cdn/cloudflare.ts      %100    R2 upload (S3 SDK)
embed-api/src/telegram/client.ts     %80     Session MANUEL oluşturulmalı, otomatik giriş yok
embed-api/src/protection/hmac.ts     %100    HMAC token
embed-api/src/protection/fingerprint.ts %100 Browser fingerprint + anti-debug script
embed-api/src/ads/bumper.ts           %30    Stub, VAST yok
```

### 1.2 Konfigürasyon eksikleri

`embed-api/.env.example` satır satır:

```
DOLU       BOŞ          NOT
PORT       HMAC_SECRET          → openssl rand -hex 32 ile üret
HOST       TMDB_API_KEY         → themoviedb.org/signup (ücretsiz)
URL_TTL    ALLOWED_ORIGINS      → domain alındıktan sonra
DB_URL     TG_API_ID            → my.telegram.org
           TG_API_HASH          → my.telegram.org
           TG_SESSION           → manuel script çalıştırılıp alınır
           TG_CHANNEL_ID        → Telegram kanalı oluşturulmalı
           CLOUDFLARE_ACCOUNT_ID
           CLOUDFLARE_R2_ACCESS_KEY
           CLOUDFLARE_R2_SECRET_KEY
           CLOUDFLARE_R2_BUCKET
           CLOUDFLARE_R2_PUBLIC_URL
           REAL_DEBRID_API_KEY  → $3/ay, kripto ödeme, KYC yok
           TURNSTILE_*          → opsiyonel
           AD_VAST_URL          → opsiyonel
```

Ek: `TORRENT_PIPELINE_ENABLED=false` → catalog.ts:82'de default kapalı, bu
flag açılmadan RD+torrent akışı hiç devreye girmiyor.

### 1.3 Operasyonel eksikler (koddan bağımsız)

```
- Deploy yok: lokal çalışır, internete bağlı değil
- Cloudflare proxy yok: VPS IP direkt görünür → OPSEC açık
- Domain yok: Njalla XMR veya alternatif
- Reklam hesabı yok: Adsterra / HilltopAds / PopAds
- Pre-cache worker yok: Popüler 500 film önceden RD+ffmpeg'e sokulmalı
  → İlk izlemede 30-60 sn gecikme var (RD download + ffmpeg başlangıç)
- TV için per-episode cache stratejisi: her bölüm ayrı cache key, popüler
  dizilerde tam sezon pre-cache gerek
- Monitoring yok: scraper kırılırsa, RD hesabı banlanırsa haberin olmaz
- Takedown rotation planı yok: DMCA geldiğinde domain + CF hesabı nasıl
  değişecek?
```

### 1.4 Tek cümlelik özet

**"Kod iskeleti %70, konfig %0, production %0 — bu hâliyle tek bir film
bile servis edemez, ama seçilecek yola göre 3-40 gün arasında hazır hâle
getirilebilir."**

---

## 2. GÖNDERİLEN 2 PLANIN ELEŞTİRİSİ

### 2.1 Plan 1 — "En İyi Kombinasyon"

**Özeti:** Multi-source scraping (Yöntem 1) + RD+torrent (Yöntem 3) +
Telegram (Yöntem 7), pop-under + VAST + banner reklamlar, $25-50/ay
maliyetle 1M ziyaret.

**Sorunları:**

1. **"Multi-source scraping" iki farklı şeyi karıştırıyor:**
   - (a) `providers/index.ts`'teki gibi iframe URL döndürmek → kolay, yazılmış,
     ama reklam geliri yok
   - (b) vidsrc/2embed sayfasını HTTP ile çek, HTML parse et, final
     `.m3u8` URL'sini çıkar, kendi proxy'inden stream et → 2-3 hafta
     ek iş, yazılmamış
   - Plan bu ikisini aynı kutuya koyuyor. Hangisi kastediliyor?

2. **iframe seçersen ne olur:**
   - Reklam geliri iframe sahibine gider (vidsrc kendi pop-under'ını basar)
   - Kullanıcı IP'si 3. tarafa sızar (senin OPSEC'in değil vidsrc'nin
     OPSEC'i geçerli)
   - Brand value sıfır (kullanıcı player'ı "vidsrc'den" sanıyor)
   - Takedown riski sana kalır, reklam kontrolü gitmez → en kötü dünya

3. **Gerçek scraper seçersen ne olur:**
   - Cloudflare/anti-bot atlatma: FlareSolverr gerekli (workspace'te
     `flaresolverr-final.js` mevcut, ama embed-api'ye bağlı değil)
   - Kaynak layout değişince scraper kırılır → haftalık bakım
   - DMCA + kaynak ToS ihlali (RD'den daha riskli, çünkü RD yasal gri,
     kaynak scrape direkt ihlal)

4. **Maliyet hesabı doğru ama ölçek yanıltıcı:**
   - "$25-50/ay = 1M ziyaret" — VPS bant genişliği açısından doğru
   - Ama 1M ziyaret almak: SEO + backlink + domain rotation + takedown
     yönetimi = **12-18 ay iş**, plan bunu atlıyor

5. **"Telegram sadece exclusive için" — gereksiz karmaşa:**
   - Eğer RD+torrent çalışıyorsa, Telegram ne sağlıyor?
   - "Exclusive içerik" üretmek ayrı bir iş modeli
   - Başlangıçta Telegram katmanı sadece karmaşa ekler

### 2.2 Plan 2 — "Lean Startup"

**Özeti:** 3x Real-Debrid rotation + YTS+EZTV+1337x + ffmpeg proxy +
Adsterra pop-under + Linkvertise, $20/ay maliyetle 300K ziyaret/ay =
$2400/ay net.

**Sorunları:**

1. **"Yeni plan" değil, mevcut kodun deploy hâli:**
   - `pipeline/torrent.ts` + `pipeline/remux.ts` + `catalog.ts` bu
     mimarinin %85'i
   - Eksik: 1337x scraper (sadece YTS+EZTV var), 3x RD rotation
     (tek hesap kodlu), Linkvertise, Adsterra zone, deploy

2. **Gelir tahmini iyimser:**
   - Adsterra pop-under RPM (revenue per mille): $0.5 - $3
   - Türkiye/MENA traffic alt banttan → 300K ziyaret = $150-900/ay
   - $2400/ay için gerekli: US/EU traffic + 3-4 reklam katmanı +
     iyi yerleşim + yüksek bounce oranı kabul etmek
   - Gerçekçi başlangıç bandı: **$400-1200/ay**

3. **RD hesap bankı OPSEC açığı:**
   - "3 RD hesap rotation" → 3 farklı email + 3 ödeme kaynağı lazım
   - Email sızıntısı olursa 3 hesap birden kaybolur
   - Plan bunun operasyonel yükünü göstermiyor

4. **"Stream içine ffmpeg ile pre-roll inject" — teknik tuzak:**
   - ffmpeg concat ile pre-roll injection mümkün ama her stream için
     ayrı process + disk I/O yükü
   - 100 eşzamanlı izleyici = 100 ffmpeg process = $5 VPS yetmez
   - VAST tag client-side (hls.js içine) daha temiz, plan bunu söylemiyor

### 2.3 Sonuç — 2 plan neden "en iyi iki" değil

| Plan   | Tutarlılık | Yenilik | Gerçekçilik | Karmaşıklık |
|--------|------------|---------|-------------|-------------|
| Plan 1 | Düşük (iki mimari karışık) | Kısmen | Orta | Çok yüksek |
| Plan 2 | Yüksek | Yok (mevcut kod) | Orta-iyi | Orta |

"En iyi iki" demek yerine **tek bir spektrum** var: başlangıçtan iddialıya
doğru **A → B → C**. Aşağıda bunu açıyorum.

---

## 3. ÜÇ GERÇEKÇİ YOL — KARŞILAŞTIRMA

### 3.1 YOL A — Pure Aggregator

```
KİM İÇİN:    $10/ay max bütçe, 3-5 gün iş, düşük risk test
GELİR:       Ay 3'te $50-200, ay 12'de $500-1500/ay
RİSK:        Çok düşük (sen dosya host etmiyorsun, iframe embed)
BAKIM:       Haftada 1 saat (ölü kaynak değiştirme)
OPSEC:       Düşük — kullanıcı IP'si iframe sahiplerine sızar
```

**Mimari:**

```
TMDB ID → providers/index.ts → 5 iframe URL listesi
       → NyumatFlix UI'da kullanıcı kaynak seçer
       → iframe açılır, video vidsrc/2embed'den gelir
       → Senin sayfanda: Adsterra pop-under + Linkvertise interstitial
```

**Mevcut koddan kullanılanlar:**
- `providers/index.ts` — aynen
- `routes/embed.ts` — aynen
- `player/player-v2.html` — iframe wrapper'a dönüştür (küçük değişiklik)
- `protection/` — isteğe bağlı

**Kullanılmayan kod (atıl):** `pipeline/`, `telegram/`, `cdn/`,
`db/` → content_cache hariç hepsi atıl.

**İş listesi (3-5 gün):**
1. VPS al (Hetzner $5/ay) — 1 saat
2. Domain al (Njalla $15/yıl, XMR) — 1 saat
3. Cloudflare ücretsiz proxy kur — 2 saat
4. embed-api deploy (Docker veya systemd) — 3 saat
5. NyumatFlix deploy (Vercel veya Cloudflare Pages) — 2 saat
6. Adsterra hesap + zone al — 24 saat onay + 1 saat entegrasyon
7. Linkvertise hesap + cloaking URL — 2 saat
8. player'a iframe + pop-under script inject — 1 gün
9. Test + SEO temel (sitemap, robots.txt, meta) — 1 gün

**Maliyet (aylık):**
```
Hetzner VPS CX11     $5
Domain (Njalla)      $1.25 ($15/yıl)
Cloudflare proxy     $0 (free tier)
Adsterra             $0 (reklam verenden gelir)
------------------------------------
TOPLAM               ~$6/ay
```

**Gelir bandı (gerçekçi):**
```
Ay 3 (5K ziyaret/gün):    $50-200
Ay 6 (15K ziyaret/gün):   $200-500
Ay 12 (40K ziyaret/gün):  $500-1500
```

**Takedown senaryosu:** iframe'i DMCA takip etmez (sen host etmiyorsun),
sadece domain'e şikayet gelir → Cloudflare "abuse report" yönlendirir,
Njalla sahte kimlik istemez → domain ayakta kalır.

### 3.2 YOL B — Proxy Streamer (Plan 2'nin temiz hâli)

```
KİM İÇİN:    $25-50/ay bütçe, 10-14 gün iş, orta-güçlü gelir
GELİR:       Ay 3'te $200-600, ay 12'de $1000-3000/ay
RİSK:        Orta (RD hesabı KYC yok ama email bağlı, VPS IP'n trafik
             gönderiyor)
BAKIM:       Haftada 2-3 saat
OPSEC:       Orta — RD IP'si arada, Cloudflare proxy önünde
```

**Mimari:**

```
TMDB ID → TMDB external_ids → IMDB ID
       → YTS API (film) / EZTV API (dizi) / 1337x scraper (opsiyonel)
       → Best magnet seçimi
       → Real-Debrid unrestrict → direkt HTTP URL
       → ffmpeg -c copy → HLS (.ts→.jpg segmentler)
       → Cloudflare R2 upload VEYA lokal /hls/ serve
       → player-v2.html hls.js ile oynatır
       → Adsterra pop-under (sayfa) + VAST pre-roll (player içinde)
       → Linkvertise cloaking (opsiyonel)
```

**Mevcut koddan kullanılanlar:**
- `pipeline/torrent.ts` — %90 kullanılır, webtorrent fallback eklenir
- `pipeline/remux.ts` — %100 aynen
- `pipeline/catalog.ts` — %100, `TORRENT_PIPELINE_ENABLED=true` yapılır
- `db/index.ts` — content_cache tamamen kullanılır
- `cdn/cloudflare.ts` — opsiyonel (küçük başla local serve)
- `routes/embed.ts` + `routes/hls.ts` — aynen
- `player/player-v2.html` — VAST tag eklenir
- `protection/` — aynen

**Kullanılmayan kod:** `telegram/`, `providers/index.ts` iframe listesi
(fallback olarak tutulabilir)

**İş listesi (10-14 gün):**

```
1. Ortam + config (1 gün)
   - TMDB key al
   - Real-Debrid $3 hesap aç (kripto)
   - Cloudflare R2 bucket (opsiyonel)
   - Njalla domain
   - HMAC secret üret

2. Kod düzeltmeleri (2 gün)
   - pipeline/catalog.ts:101 "magnet fallback null" — ya webtorrent
     sequential reader ekle, ya RD'yi zorunlu yap
   - providers/index.ts'i fallback chain'e dönüştür (RD başarısızsa
     iframe'e düş)

3. Pre-cache worker (2 gün)
   - Popüler 500 film listesi (TMDB trending + IMDB top)
   - Cron: her gece yeni 20 filmi RD+ffmpeg'den geçir, cache'e koy
   - Monitoring: başarısızları log'la, retry

4. Reklam entegrasyonu (2 gün)
   - Adsterra pop-under script (sayfa)
   - VAST tag (player-v2.html içinde hls.js + ima-sdk)
   - Linkvertise cloaking layer (opsiyonel)

5. Deploy (2 gün)
   - Hetzner VPS CX21 ($7, daha büyük disk)
   - Docker compose: postgres + embed-api + ffmpeg
   - Cloudflare proxy (orange cloud ON)
   - SSL (Cloudflare flexible veya Let's Encrypt)
   - NyumatFlix production build + Vercel/Pages

6. Test + bug fix (2-3 gün)
   - 10 popüler film test
   - 3 farklı dizi, 5 bölüm test
   - Yavaş RD hesabı senaryosu
   - ffmpeg crash recovery
   - R2 maliyet ölçümü (1 film kaç GB, hedge et)
```

**Maliyet (aylık):**
```
Hetzner VPS CX21           $7
Real-Debrid (1 hesap)      $3
Cloudflare R2 (100 film)   $5 (storage $0.015/GB, egress free)
Domain (Njalla)            $1.25
NyumatFlix hosting         $0 (Vercel free)
------------------------------------
MİNİMUM                    ~$17/ay

Eklemeler (opsiyonel):
  RD rotation (+2 hesap)   +$6
  1337x proxy scraper      +$5
  Monitoring (Uptimerobot) $0
------------------------------------
ÖLÇEKLİ                    ~$28/ay
```

**Gelir bandı:**
```
Ay 3 (5K ziyaret/gün):     $200-600
Ay 6 (15K ziyaret/gün):    $500-1500
Ay 12 (40K ziyaret/gün):   $1000-3000
```

Not: Gelir Yol A'dan yüksek çünkü **reklam geliri tamamen senin**
(iframe sahibi yok).

**Takedown senaryosu:** sen video host ediyorsun (R2 veya VPS disk),
DMCA sana gelir → Cloudflare sana forward eder → R2 content takedown
edebilir. Domain + R2 + VPS **ayrı ayrı** takedown'a maruz. Rotation:
domain 2-3'lü havuz, R2 yerine Wasabi/Storj yedek.

### 3.3 YOL C — Hybrid (Plan 1'in temiz hâli)

```
KİM İÇİN:    $50-100/ay, 25-40 gün iş, takım veya tam zamanlı
GELİR:       Ay 6'da $1500-3000, ay 12'de $3000-8000/ay (teorik)
RİSK:        Orta-yüksek (scraping DMCA + ToS ihlali)
BAKIM:       Haftada 8-12 saat (scraper sürekli kırılır)
OPSEC:       Yüksek risk gerektirdiği için VPN + residential proxy +
             ayrı kimlik zorunlu
```

**Mimari:**

```
Kullanıcı film istedi
  ↓
Öncelik 1: Cache'de var mı? → HLS serve (anlık)
  ↓ yoksa
Öncelik 2: Popüler ise scraper tetikle
  - vidsrc HTML çek (FlareSolverr ile, CF atlatma)
  - HTML parse → m3u8 URL
  - Kendi proxy'den stream (kullanıcı senin domain'inden çekiyor)
  - Arkaplanda cache'e al
  ↓ scraper kırılmışsa
Öncelik 3: RD + torrent (Yol B)
  ↓ yoksa
Öncelik 4: Telegram exclusive (sadece premium katmanı için)
  ↓ hiçbiri yoksa
"Content Unavailable" sayfası
```

**Mevcut koddan kullanılanlar:** Yol B'nin hepsi + `telegram/client.ts`
+ **yeni yazılacak** scraper modülü

**Yeni yazılacak kısımlar:**
- `src/scrapers/vidsrc.ts` — HTML fetch + m3u8 parser
- `src/scrapers/2embed.ts`
- `src/scrapers/filemoon.ts`
- `src/scrapers/streamtape.ts`
- `src/scrapers/flaresolverr.ts` — CF atlatma wrapper
- `src/scrapers/health.ts` — her scraper'ın sağlık skorunu tut, düşük
  skorluyu fallback'e düşür
- `src/routes/proxy.ts` — m3u8'i kendi domain'inden stream et

**İş listesi (25-40 gün):**

```
1. Yol B'nin tamamı (10-14 gün)

2. FlareSolverr entegrasyonu (3 gün)
   - Docker container
   - Session pool
   - Rate limit + cooldown

3. Her kaynak için HTML parser (5-7 gün)
   - vidsrc: sourcesource variable parse
   - 2embed: JWPlayer config extract
   - filemoon: packed JS unpacker
   - streamtape: obfuscated src regex

4. Scraper sağlık izleme (2 gün)
   - Her kaynak son 100 isteğin başarı oranı
   - %60'ın altına inince otomatik devre dışı
   - Admin panel: /admin/scrapers (basit)

5. m3u8 proxy endpoint (2 gün)
   - /hls/proxy/:hash/index.m3u8 → orijinal m3u8'i fetch, segment
     URL'lerini yeniden yaz, kendi domain'inden serve
   - Segment cache (Cloudflare ücretsiz CDN)

6. Telegram exclusive pipeline (2 gün)
   - Sadece senin yüklediğin film için
   - Premium kullanıcı ayrımı (coin sistemi zaten var)

7. OPSEC sertleştirme (2-3 gün)
   - VPS'te VPN client (Mullvad WireGuard)
   - Residential proxy havuzu (scraping için)
   - Ayrı identity/ödeme kaynağı
```

**Maliyet (aylık):**
```
Yol B maliyeti             $28
FlareSolverr VPS           $5
Residential proxy          $25 (IPRoyal, Soax vb)
VPN (Mullvad)              $5
------------------------------------
TOPLAM                     ~$63/ay
```

**Gelir bandı (dikkat: scraper kırılmaları gelir düşürür):**
```
Ay 6 (30K ziyaret/gün):    $1500-3000
Ay 12 (80K ziyaret/gün):   $3000-8000 (teorik üst sınır)
```

**Takedown senaryosu:** en ağır. Hem sen host ediyorsun, hem kaynak
sitelerin ToS'unu ihlal ediyorsun → kaynak siteler Cloudflare'e report
atabilir + DMCA gelir + RD hesabın banlanabilir + reklam ağı hesabın
kapanabilir. Bu yol **kimlik tamamen ayrı** olmadan denenmez.

---

## 4. KARAR AĞACI

```
Soru 1: Bütçen ve zamanın ne?
  ├─ $10/ay, 1 hafta → YOL A
  ├─ $30/ay, 2 hafta → YOL B
  └─ $70/ay, 1-2 ay + takım → YOL C

Soru 2: Ne kadar risk tolere edebilirsin?
  ├─ "DMCA gelirse kapatırım"           → YOL A
  ├─ "Domain rotate ederim, devam"      → YOL B
  └─ "Ayrı kimlikle yürütebilirim"      → YOL C

Soru 3: Bakıma ne kadar vakit ayıracaksın?
  ├─ Haftada < 2 saat                   → YOL A
  ├─ Haftada 2-3 saat                   → YOL B
  └─ Haftada 8-12 saat (veya eleman)    → YOL C

Soru 4: Karar veremiyorsan?
  → YOL A'dan başla
  → Trafik $200/ay'ı geçince YOL B'ye geç
  → B'nin kodu zaten %85 hazır, 2 hafta swap
  → C'ye çıkmaya ancak B'de $2000/ay geçtikten sonra karar ver
```

---

## 5. MEVCUT KODUN HER YOLDAKİ KADER HARİTASI

```
DOSYA                          YOL A    YOL B    YOL C
───────────────────────────────────────────────────────
providers/index.ts             AKTIF    fallback fallback
pipeline/torrent.ts            atıl     AKTIF    AKTIF
pipeline/remux.ts              atıl     AKTIF    AKTIF
pipeline/catalog.ts            atıl     AKTIF    AKTIF (genişler)
db/index.ts                    kısmi    AKTIF    AKTIF
cdn/cloudflare.ts              atıl     opsiyon  AKTIF
telegram/client.ts             atıl     atıl     AKTIF
routes/embed.ts                AKTIF    AKTIF    AKTIF
routes/hls.ts                  atıl     AKTIF    AKTIF
routes/api.ts                  kısmi    AKTIF    AKTIF
player-v2.html                 iframe   hls      hls+proxy
protection/                    opsiyon  AKTIF    AKTIF
ads/bumper.ts                  değişir  VAST     VAST
```

**Önemli:** hangi yolu seçersen seç, **mevcut kodun en az %30'u
kullanılıyor**, hiçbir yol "sıfırdan yaz" demiyor. Yol B seçersen
yazılan kodun neredeyse tamamı kullanılıyor.

---

## 6. DOĞRUDAN 2 SORUNUN CEVABI

```
SORU: embed-api hazır mı?
CEVAP:
  Kod: %70 hazır (iskelet yazılmış, testler yok)
  Konfig: %0 (hiçbir API key yok)
  Deploy: %0 (lokal bile çalışmıyor, .env boş)
  Reklam: %0 (bumper stub var, gerçek entegrasyon yok)
  → NET: Hiçbir kullanıcıya servis edemez. Seçilecek yola göre
    3 gün (A) - 2 hafta (B) - 1.5 ay (C) iş var.

SORU: Bu 2 plan en iyi iki plan mı?
CEVAP:
  HAYIR, "en iyi iki" değiller.
  - Plan 1 ("En İyi Kombinasyon") iki farklı mimariyi karıştırıyor;
    içinden iframe-only ve gerçek-scraper olmak üzere iki ayrı plan
    çıkıyor. Tutarlı değil.
  - Plan 2 ("Lean Startup") mevcut embed-api kodunun production
    versiyonu, tutarlı ama "yeni plan" değil.
  - Doğru çerçeve: TEK spektrum, 3 seçenek:
      A (iframe aggregator)  → Plan 1'in iframe kolu
      B (proxy streamer)     ≈ Plan 2 + mevcut kod
      C (hybrid scraper)     ≈ Plan 1'in tam versiyonu, ama
                               temizlenmiş ve bakım yükü açık
  - Tavsiye: A'dan başla, B'ye ölçekle, C'ye ancak gerçekten
    para geliyorsa geç.
```

---

## 7. SONRAKİ ADIM

Bu belge "hangi yola gidilecek" sorusunu kapatmak için hazırlandı.
Karar verdikten sonra aşağıdaki dosyalardan **birini** üret:

- `docs/YOL-A-AGGREGATOR-DEPLOY.md`  (3-5 günlük deploy rehberi)
- `docs/YOL-B-PROXY-STREAMER-REFACTOR.md`  (10-14 günlük refactor + deploy)
- `docs/YOL-C-HYBRID-ROADMAP.md`  (25-40 günlük yol haritası)

Her biri: gün gün görev listesi + komutlar + dosya değişiklikleri +
rollback planı + monitoring.

---

**Son söz:** "Hangi plan en iyisi?" yanlış soru. Doğru soru:
"Ne kadar iş yapmaya hazırım ve ne kadar riski kabul ediyorum?"
Onu cevapladığın an yol kendiliğinden çıkıyor.
