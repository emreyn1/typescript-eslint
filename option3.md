# Option 3: Multi-Source Adaptive Stream + Tiered Cache

> Option 1 ve Option 2'nin kritik zayıflıklarını çözen, sıfır tek-nokta-arıza mimarisi.

---

## Neden Option 3?

Option 1 ve 2 aynı temel hatayı paylaşıyor: **debrid servislerini production backend olarak kullanmak**. Bu ANALYSIS.md §9.0.2'de 7 maddede belgelenen ciddi riskler taşıyor (ToS ihlali, rate limit, ban, tek IP, SPOF). Option 3 bu bağımlılığı tamamen kaldırıyor.

İkinci hata: **HLS encode zorunluluğu**. 70K film encode etmek yıllar alır. Option 3 bunu da ortadan kaldırıyor — MP4 doğrudan stream.

---

## Temel Prensipler

```
1. HİÇBİR tüketici servisine (RD, AllDebrid, TorBox) production bağımlılığı YOK
2. HLS encode YOK — MP4 doğrudan stream (tarayıcı native <video> ile oynatır)
3. Tek nokta arıza YOK — her katmanın fallback'i var
4. İlk günden %100 katalog mevcut (70K film + 30K dizi metadata)
5. Popüler içerik anında, niş içerik 10-60 sn startup
```

---

## Mimari

```
┌──────────────────────────────────────────────────────────────────┐
│  KATMAN 0 — KATALOG (1. gün hazır, €0)                           │
│  ─────────────────────────────────────                            │
│  73K film magnet hash  ← YTS API scrape (25 dk)                  │
│  30K+ dizi magnet hash ← EZTV API scrape (2 saat)               │
│  TMDB metadata         ← TMDB API (birkaç saat)                 │
│  SQLite DB ~500 MB — her filmin magnet'i + poster + bilgisi      │
│                                                                   │
│  Kullanıcı 70K film + 30K dizi görür. Hepsi tıklanabilir.       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  KATMAN 1 — SERVE (kullanıcı tıkladığında)                        │
│  ─────────────────────────────────────────                        │
│  Cloudflare (ücretsiz proxy) → AlexHost VPS → Node.js/Fastify    │
│                                                                   │
│  Akış (öncelik sırasıyla):                                        │
│                                                                   │
│  ① Yerel NVMe cache (80 GB) — hot buffer                         │
│     → En son izlenen ~100 film burada                             │
│     → Varsa → anında serve (0 gecikme)                            │
│                                                                   │
│  ② Hetzner Storage Box (1-5 TB) — warm cache                     │
│     → Top 1,500-7,000 film (popülerlerin tamamı)                 │
│     → SFTP/SMB mount → 2-4 sn startup                            │
│                                                                   │
│  ③ Telegram gizli kanal — cold archive                            │
│     → Sınırsız, kalıcı, $0                                       │
│     → MTProto stream → 2-5 sn startup                            │
│                                                                   │
│  ④ Torrent sequential stream — on-demand fallback                 │
│     → qBittorrent + Mullvad VPN                                   │
│     → Sequential download: ilk parçalar 5-30 sn'de gelir         │
│     → İlk 2-5 MB gelince → HTTP Range ile serve başlar           │
│     → Kullanıcı izlerken indirme devam eder                      │
│     → Tamamlanınca → Telegram'a cache (gelecek için)             │
│                                                                   │
│  Hiçbir katmanda yoksa (seed'siz, çok eski):                     │
│  ⑤ "Bu içerik şu an mevcut değil" mesajı                         │
│     → İstek kuyruğuna ekle, bulunursa bildir                     │
│     → Bu durum katalogdaki %1-3 niş içerik için                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  KATMAN 2 — ARKA PLAN WORKER'LARI (7/24)                         │
│  ────────────────────────────────────────                         │
│                                                                   │
│  Worker A: Proaktif Cache Doldurucu                               │
│    → TMDB popular/trending listesini tara                         │
│    → Cache'te olmayan filmleri indir (qBit + VPN)                │
│    → Telegram'a yükle + Hetzner'a kopyala (popülerse)            │
│    → Hız: ~30-50 film/gün (VPN download, encode yok)            │
│                                                                   │
│  Worker B: Yeni Çıkış Takipçisi                                   │
│    → Her 6 saatte TMDB now_playing + on_the_air                  │
│    → YTS/EZTV'de yeni release var mı?                            │
│    → Varsa → indir → cache'le                                    │
│                                                                   │
│  Worker C: Organik Cache Builder                                  │
│    → Kullanıcının izlediği film torrent'ten geldiyse             │
│    → İndirme bitince → Telegram'a yükle                          │
│    → DB güncelle: tg_file_id                                     │
│    → Sonraki istekler anında (Tier ③'ten)                        │
│                                                                   │
│  Worker D: LRU Disk Yöneticisi                                    │
│    → NVMe 80 GB dolunca en eski dosyaları sil                    │
│    → Hetzner box dolunca en az izlenen dosyaları sil             │
│    → (Telegram'da her şey kalır — kalıcı arşiv)                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  KATMAN 3 — KORUMA                                                │
│  ─────────────────                                                │
│  Cloudflare Turnstile (bot koruması)                              │
│  Custom fingerprint.js (canvas, WebGL, GPU, timezone)             │
│  HMAC-SHA256 imzalı URL (per-user, 2 saat TTL)                   │
│  IP + ASN binding (VOE tarzı)                                     │
│  Rate limiting (IP başına 20 req/dk)                              │
│  CORS: sadece kendi domain'inden                                  │
│  Referer kontrolü                                                 │
│  Segment URL'lerinde fake uzantı rotasyonu (.jpg, .css, .woff2)  │
│  Anti-adblock detection + bait element                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  KATMAN 4 — REKLAM                                                │
│  ─────────────────                                                │
│  Cache'li içerik: server-side bumper (1-3 sn pre-roll)           │
│  Torrent stream: client-side IMA (video hazırlanırken göster)    │
│  Adcash/iClick entegrasyonu                                       │
│  Anti-adblock + gelir optimizasyonu                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Torrent Sequential Stream — nasıl çalışır?

Bu Option 3'ün en kritik farkı. Debrid kullanmadan, torrent'i doğrudan stream ediyoruz.

```
Kullanıcı niş bir filme tıkladı (cache'te yok):

  1. DB'den magnet hash al
  2. qBittorrent API: torrent ekle, sequential download AÇ
     → Sequential = dosyanın başından sonuna sırayla indir
     → Normal torrent: rastgele parça indirir (izlenemez)
     → Sequential: ilk parçaları önce indirir (izlenebilir)

  3. İlk 2-5 MB inince (genelde 5-30 sn):
     → HTTP 200 OK, Content-Type: video/mp4
     → Range request desteği ile serve başla
     → Kullanıcı videoyu görmeye başlar

  4. İndirme arka planda devam eder:
     → Kullanıcı izlerken indirme hep önde gider
     → 720p video bitrate: ~3 Mbps = ~375 KB/s
     → Torrent download hızı (iyi seed): 2-10 MB/s
     → İndirme her zaman oynatmadan hızlı → buffering yok

  5. Film tamamen inince:
     → Telegram'a yükle (gelecek için cache)
     → Hetzner'a kopyala (popülerse)
     → NVMe'den bir süre sonra sil (LRU)

  Gerekli araçlar:
    → qBittorrent (headless, Web API) + Mullvad VPN (WireGuard)
    → Node.js: qBittorrent API ile entegrasyon
    → HTTP Range proxy: indirilen dosyayı kullanıcıya serve et
```

**Torrent sequential vs debrid karşılaştırma:**

```
                        Debrid (RD/AD)          Torrent Sequential
Startup süresi          1-4 sn (cached)         5-30 sn (seed'e bağlı)
                        30-120 sn (uncached)     5-30 sn (aynı)
Ban riski               YÜKSEK (ToS ihlali)     SIFIR (VPN arkasında)
Rate limit              VAR (dakikada 60)        YOK
Ölçekleme               İMKANSIZ (tek IP)        KOLAY (VPN bağlantı ekle)
Maliyet                 €3-16/ay per hesap       €5/ay sabit (Mullvad)
Seed'siz torrent        Çözebilir (kendi cache)  Çözemez
OPSEC                   İz bırakır (hesap)       Sıfır iz (Mullvad, no-KYC)
Güvenilirlik            Hesap ban = servis durur  VPN her zaman çalışır
```

**Debrid sadece opsiyonel hızlandırıcı:**
İlk 1-2 ay RD kullanılabilir (proaktif cache'i hızlandırmak için). Ama mimari RD olmadan da tam çalışır. RD ban yerse hiçbir şey bozulmaz.

---

## Startup senaryoları (kullanıcı ne görür?)

```
SENARYO A — Popüler film (Hetzner/Telegram'da):
  → Tıkla → 1-3 sn → video oynar ✓
  → Trafik: %60-80 (top 5K film)

SENARYO B — Orta popülerlikte (Telegram'da):
  → Tıkla → 2-5 sn → video oynar ✓
  → Trafik: %15-30

SENARYO C — Niş film (cache'te yok, torrent seed'li):
  → Tıkla → loading spinner (5-30 sn) → video oynar
  → Loading sırasında reklam gösterilebilir
  → Trafik: %5-10

SENARYO D — Çok eski/nadir (seed'siz):
  → Tıkla → "Bu içerik şu an mevcut değil"
  → İstek kuyruğuna eklenir
  → Trafik: %1-3

Popüler içerikte (A+B) deneyim VOE kadar iyi.
Niş içerikte (C) Stremio gibi — kabul edilebilir.
Çok nadir içerikte (D) hiçbir servis de sunamıyor.
```

---

## Pre-launch hazırlık (2-4 hafta)

```
Hafta 1:
  → YTS API scrape: 73K film magnet hash (25 dk)
  → EZTV API scrape: 30K+ dizi magnet hash (2 saat)
  → TMDB metadata: poster, overview, genres (birkaç saat)
  → Sonuç: katalog veritabanı hazır, site açılabilir

  → qBittorrent + Mullvad VPN kurulumu
  → Top 200 TMDB film indirmeye başla
  → Hız: ~30-50 film/gün (VPN, 700MB/film)

Hafta 2:
  → ~300 film indirildi → Hetzner + Telegram'a yükle
  → Embed player + API tamamla
  → Koruma katmanı (Turnstile + HMAC) entegre et
  → Test: farklı cache tier'lardan oynatma

Hafta 3:
  → ~500 film hazır (trafiğin %80'ini karşılar)
  → Torrent sequential stream test et
  → Reklam entegrasyonu
  → Soft launch (küçük kullanıcı grubu)

Hafta 4:
  → ~700 film hazır
  → Production launch
  → Worker'lar 7/24 cache doldurmaya devam eder
```

---

## Maliyet

```
SABİT MALİYET:
  AlexHost VPS U4:       €16/ay (4 core, 8GB RAM, 80GB NVMe)
  Mullvad VPN:           €5/ay  (no-KYC, Monero ile ödenebilir)
  Njalla domain:         €3.75/ay (yıllık €45 ÷ 12)
  Hetzner Storage Box:   €3.81/ay (BX11, 1 TB) → büyütülebilir
  Cloudflare:            €0
  Telegram:              €0
  ─────────────────────
  TOPLAM:                €28.56/ay

OPSİYONEL (ilk 1-2 ay hızlandırıcı):
  Real-Debrid:           €3/ay (proaktif cache için)
  → Ban yerse veya 2 ay sonra → bırak, fark etmez

ÖLÇEKLENDİRME (büyüyünce):
  2. VPS (paralel worker):     +€16/ay
  Hetzner BX21 (5 TB):        +€9.10/ay (BX11 yerine)
  Hetzner BX41 (10 TB):       +€16.90/ay
  BunnyCDN (isteğe bağlı):    +€10/ay (video delivery optimize)
```

---

## Tech stack detay

```
FRONTEND:
  → Next.js 15 (SSR + ISR) — TMDB katalog, arama, detay sayfaları
  → Tailwind CSS — hızlı, responsive UI
  → Deployment: aynı VPS veya ayrı Vercel (ücretsiz tier)

OYNATICI:
  → Native <video> tag (MP4 doğrudan stream için)
  → hls.js (opsiyonel, HLS stream varsa)
  → Plyr wrapper (güzel UI, altyazı, kalite seçimi)
  → Custom overlay: reklam, anti-adblock, logo

BACKEND:
  → Node.js + Fastify (hızlı, düşük overhead)
  → SQLite (katalog DB, ~500 MB) — PostgreSQL gereksiz bu ölçekte
  → qBittorrent Web API entegrasyonu
  → Telegram MTProto (gramjs veya pyrogram wrapper)
  → Hetzner SFTP client

TORRENT:
  → qBittorrent-nox (headless daemon)
  → Mullvad VPN (WireGuard, kill switch)
  → Sequential download mode
  → API: http://localhost:8080/api/v2/

CACHE:
  → NVMe disk: LRU eviction, 80 GB
  → Hetzner Storage Box: SFTP mount veya sshfs
  → Telegram: pyrogram/gramjs ile upload/download
  → Redis (opsiyonel): URL imza cache, session store

KORUMA:
  → Cloudflare Turnstile (ücretsiz)
  → Custom fingerprint.js
  → HMAC-SHA256 URL imzalama (Node.js crypto)
  → Express-rate-limit veya Fastify rate limit

MONITORING:
  → Uptime Kuma (self-hosted, ücretsiz)
  → Telegram bot alert (disk, bandwidth, hata)
  → Log: IP hash'le, 24 saatte sil
```

---

## Option 1/2 ile karşılaştırma

| Kriter | Option 1 | Option 2 | **Option 3** |
|--------|----------|----------|------------|
| **Debrid bağımlılığı** | Yüksek (3-4 hesap) | Yüksek (3-4 hesap) | **Sıfır** (opsiyonel) |
| **Ban riski** | Yüksek | Yüksek | **Sıfır** |
| **HLS encode** | Zorunlu | Zorunlu | **Yok** (MP4 direct) |
| **1. gün erişilebilirlik** | %100 (RD varken) | %100 (RD varken) | **%100** (torrent fallback) |
| **Popüler içerik startup** | 2-4 sn | 2-4 sn | **1-5 sn** |
| **Niş içerik startup** | 30-120 sn (RD) | 30-120 sn (RD) | **5-30 sn** (torrent seq) |
| **Ölçekleme** | İmkansız (RD tek IP) | İmkansız | **Kolay** (VPS/VPN ekle) |
| **SPOF** | RD ban = servis durur | RD ban = servis durur | **Yok** (her tier bağımsız) |
| **Başlangıç maliyeti** | €40-60/ay | €45-70/ay | **€29/ay** |
| **6 ay sonra maliyet** | €60-90/ay | €65-100/ay | **€35-50/ay** |
| **OPSEC** | Orta (debrid hesaplar iz) | Orta | **Yüksek** (Mullvad no-KYC) |
| **Bakım zorluğu** | Yüksek (debrid rotator) | Çok yüksek | **Orta** |
| **Multi-quality** | HLS ABR (360/720/1080) | HLS ABR | **Tek kalite** (dezavantaj) |
| **Viral spike** | Zayıf (RD rate limit) | Orta (JIT) | **İyi** (torrent = dağıtık) |

---

## Bilinen zayıflıklar (dürüst değerlendirme)

```
1. TEK KALİTE: MP4 doğrudan stream = adaptive bitrate yok.
   Kullanıcı ya 720p ya 1080p izler, otomatik geçiş yok.
   → Çözüm: YTS hem 720p hem 1080p sunuyor, DB'de ikisini tut,
     kullanıcıya kalite butonu ver.
   → Uzun vadede: popüler filmler için arka planda HLS encode
     (sadece top 5K, tam kütüphane değil).

2. SEED'SİZ TORRENT: Çok eski/niş filmler seed'siz olabilir.
   → Katalogdaki %1-3 → "mevcut değil" gösterilir.
   → RD opsiyonel olarak sadece bu %1-3 için tutulabilir.

3. TORRENT STARTUP SÜRESİ: Niş içerikte 5-30 sn bekleme.
   → Loading sırasında reklam göster (dezavantajı gelire çevir).
   → Popüler içerikte bu sorun yok (cache'ten anında).

4. TELEGRAM HESAP RİSKİ: Büyük hacimde upload ban tetikleyebilir.
   → Birden fazla bot + kanal kullan (load balance).
   → Yükleme hızını throttle et (günde max 100-200 dosya/bot).
   → Premium hesap kullan (daha yüksek limitler).

5. HETZNER DMCA: Hetzner Almanya'da, DMCA uyguluyor.
   → Hetzner'da sadece popüler cache tut (hızlı serve için).
   → DMCA gelirse dosyayı Hetzner'dan sil, Telegram'dan serve et.
   → Kalıcı arşiv HER ZAMAN Telegram'da (Hetzner expendable).

6. BANT GENİŞLİĞİ: AlexHost 100 Mbps = ~33 eşzamanlı 720p.
   → İlk aşama için yeterli (günde birkaç bin izleme).
   → Büyüyünce: 2. VPS + GeoDNS veya BunnyCDN eklenir.
```

---

## Neden Option 3 daha iyi?

```
Option 1/2'nin ölümcül sorunu:
  → Debrid servisleri tüketici ürünü. Kamu embed servisi için tasarlanmamış.
  → Ban yersen, alternatif yok. Tüm "failover" debrid'lerin aynı riski var.
  → Ölçeklenemez. 100 kullanıcıdan sonra çökmeye başlar.

Option 3'ün çözümü:
  → Torrent = merkezi olmayan. Kimse seni banlayamaz.
  → VPN = anonim. İz bırakmaz, no-KYC.
  → Multi-tier cache = her katman bağımsız çalışır.
  → Bir katman çökerse diğerleri devam eder.
  → Ölçekleme basit: VPS ekle, VPN bağlantısı ekle.

Trade-off:
  → Niş içerikte biraz daha uzun startup (5-30 sn vs debrid 2-4 sn).
  → Ama: debrid ban sonrası 0 sn vs sonsuz bekleme (servis çöker).
  → Güvenilirlik her zaman hızdan önemlidir.
```

---

## Implementasyon zaman çizelgesi

```
Hafta 1:   Katalog DB + temel API + VPS kurulumu
Hafta 2:   Embed player + torrent sequential stream entegrasyonu
Hafta 3:   Telegram cache + Hetzner cache + koruma katmanı
Hafta 4:   Reklam entegrasyonu + test + soft launch
Hafta 5-8: Worker'lar cache doldurur, production stabilize
Ay 3:      ~3,000 film cache'te, trafiğin %90'ı anında
Ay 6:      ~10,000 film cache'te, ölçekleme değerlendirmesi
```
