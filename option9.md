# Option 9: HLS Remux + Cloudflare Edge CDN

> Tüm option'ların kaçırdığı iki temel teknik gerçeği kullanan, operasyonel olarak basit, tek kişinin kurup çalıştırabileceği production-grade kamu embed servisi.

---

## Option 1-8'in ortak körlüğü

Sekiz option boyunca iki kritik teknik gerçek görmezden gelindi:

### Körlük 1: Encode vs Remux

Tüm option'lar "HLS encode" deyince FFmpeg'in videoyu yeniden sıkıştırmasını (re-encode) kastediyor. Bu CPU-yoğun ve yavaş: film başına 30-60 dakika.

Ama YTS dosyaları **zaten** H.264/AAC kodekli MP4. HLS de H.264/AAC — sadece farklı konteyner (.ts segmentleri). Codec **aynı**. Yani:

```
ENCODE (yeniden sıkıştırma):
  ffmpeg -i film.mp4 -c:v libx264 -c:a aac -f hls output.m3u8
  → CPU %100, film başına 30-60 dk
  → 70K film = 6 YIL (tek VPS)
  → 5K film = 5 AY

REMUX (yeniden paketleme, aynı codec):
  ffmpeg -i film.mp4 -c copy -f hls -hls_time 10 -hls_list_size 0 output.m3u8
  → CPU %2-5, film başına 15-30 SANİYE
  → Sadece I/O (okuma + yazma)
  → Kalite kaybı: SIFIR (aynı video verisi)
  → 70K film = ~20 GÜN (tek VPS)
  → 5K film = ~1.5 GÜN
```

`-c copy` demek: "Codec'i kopyala, yeniden encode etme." Sonuç HLS segmentleri — hls.js ile oynatılabilir, adaptive bitrate destekli (YTS'den 720p + 1080p magnet var, ikisini de remux et → master.m3u8'de iki kalite).

**Bu tek fark, Option 4-8'in "encode yükü" dediği problemi tamamen yok ediyor.**

### Körlük 2: Cloudflare edge caching

ANALYSIS.md'de belgeledik:
- StreamWish segmentleri `.woff2` uzantısıyla sunuyor
- Upcloud segmentleri `.jpg`, `.css`, `.js`, `.html`, `.txt` uzantısıyla sunuyor

Bu sadece gizleme değil. Cloudflare ücretsiz plan şu uzantıları **otomatik olarak edge'de cache'liyor**: `.js`, `.css`, `.jpg`, `.png`, `.gif`, `.ico`, `.svg`, `.woff`, `.woff2` ve daha birçoğu.

Yani `.ts` segmentini `.jpg` olarak sun → Cloudflare dünya genelinde 300+ edge lokasyonunda cache'liyor → ücretsiz global CDN.

```
İlk izleyici:
  Kullanıcı → Cloudflare edge (İstanbul) → origin VPS (Moldova) → segment
  → Cloudflare bu segmenti İstanbul edge'inde cache'liyor

İkinci+ izleyici (aynı bölge):
  Kullanıcı → Cloudflare edge (İstanbul) → cache'ten anında serve
  → Origin VPS'e HİÇ gitmez
  → Bant genişliği kullanımı: SIFIR

Popüler film = binlerce izleyici = segment bir kez origin'den çekilir,
sonra tüm dünyada Cloudflare edge'lerinden serve edilir.

Bu, VOE'nun Edgeon CDN ile yaptığının AYNISI — ama ücretsiz.
```

**Bu tek fark, tüm option'ların "100 Mbps VPS = max 33 kullanıcı" darboğazını çözüyor.**

---

## Neden Option 7/8 gerçekçi değil

Option 7 ve 8 kağıt üstünde etkileyici ama pratikte çalışmaz:

```
SORUN 1: RAM yetersiz
  Mistral-7B quantized (4-bit): ~4-6 GB RAM
  Qdrant Vector DB: ~2-4 GB RAM (100K vektör)
  Node.js + Fastify: ~500 MB
  qBittorrent: ~500 MB
  FFmpeg (remux/encode): ~1-2 GB
  Redis: ~500 MB
  PostgreSQL: ~500 MB
  Toplam: 9-14 GB → 32 GB VPS lazım (€35/ay)
  Ve hepsi aynı anda çalışırken performans çöker.

SORUN 2: Karmaşıklık
  LLM inference + Vector DB + predictive model + per-title encode
  + multimodal embedding + anomaly detection
  = Bir ekip 6 ayda yapar. Tek kişi? 1 yıl+.
  Bu süre boyunca embed servis lansman bile göremez.

SORUN 3: Gereksiz
  VOE — analizimizde 1 numara — AI kullanmıyor.
  Edgeon CDN + imzalı URL + FingerprintJS. Hepsi bu.
  320K+ video, milyonlarca kullanıcı. Sıfır AI/ML.
  Başarı karmaşıklıktan değil, operasyonel güvenilirlikten geliyor.
```

---

## Option 9 Mimarisi

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  KATALOG (1. gün hazır)                                               │
│  ──────────────────────                                               │
│  YTS API scrape → 73K film (imdb_id, magnet 720p+1080p)  [25 dk]    │
│  EZTV API scrape → 30K+ dizi (imdb_id, S/E, magnet)      [2 saat]   │
│  TMDB API → poster, title, overview, genres, runtime       [birkaç sa]│
│  SQLite DB: ~500 MB                                                   │
│  Kullanıcı 70K film + 30K dizi görür. Hepsi tıklanabilir.           │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  SERVE — kullanıcı tıkladığında                                       │
│  ──────────────────────────────                                       │
│                                                                       │
│  Kullanıcı → Cloudflare edge → (cache hit?) → anında serve           │
│                    │                                                   │
│                    └── cache miss → origin VPS (AlexHost)             │
│                                                                       │
│  Origin VPS akışı (öncelik sırası):                                   │
│                                                                       │
│  ① NVMe hot cache (80 GB)                                             │
│     → Son izlenen ~100 filmin HLS segmentleri                         │
│     → Varsa → serve + Cloudflare edge'e cache bırak                  │
│     → Startup: <1 sn                                                  │
│                                                                       │
│  ② Hetzner Storage Box (1-5 TB)                                       │
│     → Top 1,500-7,000 filmin HLS segmentleri (remux'lanmış)          │
│     → SFTP fetch → serve → Cloudflare cache                          │
│     → Startup: 1-3 sn                                                │
│                                                                       │
│  ③ Telegram gizli kanal — cold archive                                │
│     → MP4 dosyalar (remux'lanmamış ham dosya)                         │
│     → MTProto fetch → on-the-fly remux pipe → serve                  │
│     → Startup: 2-5 sn                                                │
│                                                                       │
│  ④ Torrent sequential download — on-demand                            │
│     → qBittorrent + Mullvad VPN (WireGuard)                           │
│     → Sequential mode: ilk parçalar önce gelir                        │
│     → İlk 2-5 MB gelince → on-the-fly remux → serve                  │
│     → Arka planda: tamamla → remux → Telegram'a yükle                │
│     → Startup: 8-30 sn (seed'e bağlı)                                │
│                                                                       │
│  ⑤ Mevcut değil (seed'siz, çok nadir, %1-2)                          │
│     → "Bu içerik şu an mevcut değil" + istek kuyruğu                 │
│                                                                       │
│  SEGMENT FORMAT:                                                       │
│  Gerçek: .ts (HLS segment, H.264/AAC)                                 │
│  Sunulan: .jpg uzantısı (Cloudflare cache + gizleme)                  │
│  Content-Type header: video/MP2T (hls.js için doğru)                  │
│  Cache-Control: public, max-age=31536000 (1 yıl)                      │
│  → Cloudflare edge otomatik cache'ler                                  │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ADAPTIVE BITRATE — remux ile mümkün                                  │
│  ────────────────────────────────────                                  │
│                                                                       │
│  YTS her film için 720p + 1080p sunuyor.                               │
│  İkisini de remux et → master.m3u8:                                    │
│                                                                       │
│  #EXTM3U                                                               │
│  #EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720              │
│  720p/index.m3u8                                                       │
│  #EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080             │
│  1080p/index.m3u8                                                      │
│                                                                       │
│  hls.js otomatik olarak kullanıcının bant genişliğine göre seçer.     │
│  Yavaş internet → 720p. Hızlı internet → 1080p. Otomatik geçiş.     │
│  ENCODE OLMADAN adaptive bitrate. Sadece remux.                        │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ARKA PLAN WORKER'LARI                                                │
│  ─────────────────────                                                │
│                                                                       │
│  Worker A: Proaktif Remux + Cache                                      │
│    → TMDB trending/popular'dan cache'te olmayanları bul               │
│    → qBittorrent + VPN ile indir (720p + 1080p)                       │
│    → Remux: ffmpeg -c copy -f hls (15-30 sn per film)                 │
│    → Segmentleri Hetzner'a yükle + DB güncelle                        │
│    → Ham MP4'ü Telegram'a yedekle                                     │
│    → Hız: ~80-120 film/gün (indirme darboğaz, remux değil)           │
│                                                                       │
│  Worker B: Yeni Çıkış Takipçisi                                       │
│    → TMDB now_playing + on_the_air (her 6 saat)                       │
│    → Yeni release varsa → indir → remux → cache                      │
│                                                                       │
│  Worker C: Organik Cache Builder                                       │
│    → Kullanıcı torrent'ten izlediğinde (Tier ④)                      │
│    → İndirme bitince → remux → Hetzner + Telegram                    │
│    → Sonraki istekler Tier ②'den (1-3 sn)                            │
│    → Popüler segmentler zaten Cloudflare edge'de cache'li            │
│                                                                       │
│  Worker D: LRU + Disk Yönetimi                                        │
│    → NVMe 80 GB dolunca → en eski segmentleri sil                    │
│    → Hetzner box dolunca → en az izlenen filmleri sil                │
│    → Telegram'da HER ŞEY kalır (kalıcı arşiv, $0)                   │
│    → Cloudflare edge cache'i yönetilmez (otomatik, ücretsiz)         │
│                                                                       │
│  Worker E: Magnet Güncelleyici                                         │
│    → Haftalık YTS/EZTV API rescan                                     │
│    → Yeni release'ler → DB'ye ekle                                    │
│    → Eski magnet'lerin seed durumunu kontrol et                       │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  KORUMA (ANALYSIS.md'deki rakip tekniklerinden)                        │
│  ──────                                                               │
│  Cloudflare Turnstile — bot koruması (ücretsiz)                       │
│  Custom fingerprint.js — canvas, WebGL, GPU, timezone, plugins        │
│  HMAC-SHA256 imzalı URL — per-user, IP+ASN bind, 2 saat TTL          │
│  Segment URL: /cdn/{hmac}/{file_id}.jpg (fake .jpg uzantı)            │
│  CORS: sadece kendi embed domain'inden                                │
│  Referer kontrolü                                                     │
│  Rate limit: IP başına 30 req/dk                                      │
│  DevTools tespit: VOE tarzı anti-debug (debugger; + timing check)     │
│  Fake uzantı rotasyonu: her m3u8'de farklı uzantı (.jpg/.css/.woff2) │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  REKLAM                                                               │
│  ──────                                                               │
│  Cache'li (Tier ①②): server-side bumper (1-3 sn pre-roll)            │
│    → Reklam segmenti m3u8'e enjekte edilir                            │
│    → Adblock'lar engelleyemez (segment gibi görünür)                  │
│  Cache'siz (Tier ③④): client-side IMA pre-roll                       │
│    → Loading süresi boyunca reklam göster                             │
│    → Dezavantajı gelire çevir                                        │
│  Anti-adblock: bait element + detection script                        │
│  Network: Adcash/iClick (ana) + HilltopAds (yedek)                   │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  PLAYER                                                               │
│  ──────                                                               │
│  hls.js — HLS oynatma + adaptive bitrate otomatik geçiş              │
│  Plyr wrapper — güzel UI (kalite seçici, altyazı, ses izi)           │
│  Altyazı: OpenSubtitles API → .vtt (dil bazında)                     │
│  Seek preview: thumbnail sprite sheet (opsiyonel, popüler filmler)   │
│  PiP (Picture-in-Picture) desteği                                    │
│  Theater mode                                                         │
│  Mobile: tam ekran otomatik, büyük dokunmatik kontroller             │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  FRONTEND (UI.md'den)                                                  │
│  ────────                                                             │
│  Next.js 15 (App Router, SSR + ISR)                                   │
│  Tailwind CSS + shadcn/ui component'ları                              │
│  Dark mode (layered: #0a0a0a → #121212 → #1a1a1a)                    │
│  Hero carousel (trending), horizontal row'lar (kategoriler)           │
│  Lazy load + skeleton loader + image WebP/AVIF                        │
│  Arama: debounced instant search + TMDB autocomplete                  │
│  Film detay: poster + backdrop + özet + "Şimdi İzle" butonu          │
│  Embed page: minimal, player-odaklı, distraction-free                 │
│  Responsive: mobile-first                                             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Cloudflare edge cache nasıl çalışıyor — detay

```
1. Segment dosyasını .jpg uzantısıyla sun:
   /cdn/a1b2c3d4e5f6.jpg
   (gerçekte: seg-001.ts, H.264 video segment)

2. HTTP response header'ları:
   Content-Type: video/MP2T
   Cache-Control: public, max-age=31536000, immutable
   → "immutable" = içerik değişmez, sonsuza kadar cache'le

3. Cloudflare davranışı:
   → .jpg uzantısı → ücretsiz planda otomatik cache
   → İlk istek: origin'den çek, edge'de sakla
   → Sonraki istekler (aynı POP): edge'den serve (origin'e gitmez)
   → Farklı bölgeden istek: o bölgenin edge'i origin'den çeker, cache'ler
   → Zamanla popüler segmentler dünya genelinde cache'li

4. Sonuç:
   Popüler film = segmentler birçok edge'de cache'li
   → Origin bant genişliği kullanımı: neredeyse sıfır
   → Etkili bant genişliği: Cloudflare'in kapasitesi (Tbps seviyesi)
   → 100 Mbps VPS limiti artık darboğaz değil

5. Cache invalidation (gerekirse):
   → Segment dosya adı hash-based (içerik değişmez)
   → Yeni versiyon = yeni dosya adı → eski cache doğal olarak expire olur
   → Cloudflare API ile purge da mümkün

Rakiplerin bunu nasıl kullandığı (ANALYSIS.md'den):
   StreamWish: .woff2 uzantısı → Cloudflare edge cache
   Upcloud: .jpg/.css/.js uzantıları → Cloudflare edge cache
   → İkisi de Cloudflare arkasında, ikisi de fake uzantı kullanıyor
   → Şimdi NEDEN fake uzantı kullandıkları anlaşıldı:
     gizleme + ücretsiz CDN, tek taşla iki kuş
```

---

## On-the-fly remux pipe — cache'te olmayan içerik için

```
Telegram'daki MP4 veya torrent'ten gelen MP4 doğrudan HLS'e çevrilir:

  // Node.js pseudo-code
  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',          // stdin'den MP4 oku
    '-c', 'copy',            // codec'i kopyala (encode yok)
    '-f', 'hls',             // HLS formatında çıkar
    '-hls_time', '10',       // 10 saniyelik segmentler
    '-hls_flags', 'delete_segments+append_list',
    '-hls_segment_filename', '/tmp/seg-%03d.ts',
    '/tmp/index.m3u8'
  ]);

  // Telegram'dan veya torrent'ten okunan data → ffmpeg stdin'e pipe
  telegramStream.pipe(ffmpeg.stdin);

  // İlk segment hazır olduğunda (~10 sn video = 1-2 sn işlem):
  // → m3u8 manifest'i kullanıcıya sun
  // → hls.js ilk segmenti ister → serve et
  // → Video oynar, geri kalanı arka planda remux edilir

Bu işlem:
  → CPU: %2-5 (sadece konteyner değişimi)
  → RAM: ~50 MB
  → Gecikme: ilk segment 1-2 sn'de hazır
  → Toplam film remux: 15-30 sn (arka planda tamamlanır)
```

---

## Remux hız hesabı — tüm kütüphane

```
Tek film remux süresi: ~25 sn (I/O bound)
Darboğaz: İNDİRME, remux değil

İndirme + remux toplam süre (per film):
  qBittorrent + VPN ile 700 MB film indirme: ~3-5 dk (iyi seed)
  Remux: ~25 sn
  Hetzner'a upload (segmentler): ~1-2 dk
  Telegram'a yedek upload (MP4): ~1-2 dk
  Toplam: ~6-9 dk per film

Günlük kapasite (tek VPS, 7/24):
  24 saat × 60 dk ÷ 7.5 dk = ~192 film/gün (paralel olmadan)
  2 paralel indirme ile: ~300+ film/gün

Cache dolma takvimi:
  Hafta 1:   ~500 film remux'lanmış (top TMDB popular)
             → Trafiğin %70-80'i bu 500 filmden gelir
  Ay 1:      ~5,000 film → trafiğin %90-95'i
  Ay 2:      ~10,000 film → trafiğin %98'i
  Ay 4-5:    ~30,000 film → büyük çoğunluk
  Ay 8-10:   ~70,000 film → tam kütüphane

Karşılaştırma:
  Full encode: 70K film = 6 YIL
  Partial encode (Option 4-6): 5-10K film = 3-5 AY
  Remux (Option 9): 70K film = ~8-10 AY (ama 1. ayda %95 trafik karşılanıyor)
```

---

## Maliyet

```
SABİT:
  AlexHost VPS U4:          €16/ay  (4 core, 8 GB RAM, 80 GB NVMe)
  Mullvad VPN:              €5/ay   (WireGuard, no-KYC, Monero)
  Njalla domain (×2):       €3.75/ay (yıllık ÷ 12)
  Hetzner Storage Box BX11: €3.81/ay (1 TB) → büyütülebilir
  Cloudflare:               €0      (ücretsiz plan, edge cache dahil)
  Telegram:                 €0      (sınırsız cold archive)
  hls.js + Plyr:            €0      (açık kaynak)
  ────────────────────────
  TOPLAM:                   €28.56/ay

ÖLÇEKLENDİRME:
  Hetzner BX21 (5 TB):     +€5.29/ay  (1 TB yerine)
  Hetzner BX41 (10 TB):    +€13.09/ay
  2. VPS (paralel worker): +€16/ay
  BunnyCDN (opsiyonel):    +€10/ay (Cloudflare yetmezse)

OPSİYONEL HIZLANDIRICI (ilk 1-2 ay):
  Real-Debrid:              €3/ay (daha hızlı indirme için)
  → Mimari RD olmadan tam çalışır. Ban = sıfır etki.
```

---

## Tüm option'larla karşılaştırma

| Kriter | Opt 1/2 | Opt 3 | Opt 4/5 | Opt 6 | Opt 7/8 | **Opt 9** |
|--------|---------|-------|---------|-------|---------|-----------|
| Debrid bağımlılık | Yüksek | Sıfır | Düşük | Yüksek | Orta | **Sıfır** |
| HLS/ABR | Var | Yok | Kısmi | Var | Var | **Var (remux)** |
| Encode süresi | Yıllar | 0 | Aylar | Aylar | Aylar | **0 (remux sn)** |
| Bant genişliği çözümü | Yok | Yok | Yok | Yok | "Edge AI" | **CF edge cache** |
| Popüler startup | 2-4 sn | 1-5 sn | 1-4 sn | 1-3.5 sn | 0.8-2.5 sn | **<1-3 sn** |
| Niş startup | 30-120 sn | 5-30 sn | 5-30 sn | 4-12 sn | 3-7 sn | **8-30 sn** |
| Başlangıç maliyet | €40-60 | €29 | €35-55 | €48-75 | €55-95 | **€29** |
| 6 ay maliyet | €60-90 | €35-50 | €45-70 | €45-65 | €50-80 | **€34-50** |
| Karmaşıklık | Orta | Düşük | Orta | Yüksek | Aşırı | **Düşük-Orta** |
| Tek kişi yapabilir mi | Evet | Evet | Evet | Zor | Hayır | **Evet** |
| SPOF | RD ban | Yok | Kısmi | RD ban | Kısmi | **Yok** |
| Ölçekleme | İmkansız | VPS ekle | VPS ekle | VPS ekle | Pahalı | **CF edge + VPS** |

---

## Option 9'un Option 3'ten farkı (dürüst karşılaştırma)

Option 3 doğru yöndeydi ama iki kritik eksik vardı:

```
Option 3 eksik 1: ABR yok
  → MP4 doğrudan stream = tek kalite
  → Yavaş internette buffering, hızlıda israf
  → Kullanıcı kalite seçemiyor
  ✓ Option 9: Remux ile HLS → ABR var, 0 encode maliyeti

Option 3 eksik 2: Bant genişliği çözülmemiş
  → 100 Mbps VPS = max 33 eşzamanlı izleyici
  → Büyüyünce tıkanır, çözüm olarak "BunnyCDN ekle" (€10+/ay)
  ✓ Option 9: Cloudflare edge cache → ücretsiz, pratik olarak sınırsız
```

## Option 9'un Option 7/8'den farkı (dürüst karşılaştırma)

```
Option 7/8 iyi olan: Predictive cache fikri (popüleri önceden yükle)
  ✓ Option 9'da da var: Worker A TMDB trending/popular takip ediyor
  ✗ Ama AI/ML modeli GEREKMİYOR. TMDB popularity score zaten sıralıyor.
    LLM ile "tahmin" yerine TMDB API'nin verdiği popularity_score'u kullan.
    Aynı sonuç, sıfır karmaşıklık.

Option 7/8 gereksiz olan: Vector DB, per-title encode, multimodal embedding
  → 70K film sıralamak için Qdrant/Milvus kurmaya gerek yok
  → SQLite + TMDB popularity_score + kendi izlenme sayacı = yeterli
  → ORDER BY popularity DESC, watch_count DESC
  → Bu sorgu 1 ms'de döner. Vector similarity 50 ms'de döner.
```

---

## Bilinen zayıflıklar (dürüst)

```
1. NİŞ İÇERİK STARTUP: 8-30 sn (torrent sequential).
   → Popüler içerikte sorun yok (cache + CF edge → <3 sn).
   → Niş'te loading sırasında reklam göster.
   → Hiçbir rakip de niş içerikte anında açmıyor.
   → VOE bile niş'te 3-8 sn (upstream'den çeker).

2. SEED'SİZ TORRENT: Katalogdaki %1-2 → "mevcut değil".
   → İstek kuyruğu: çok istenirse RD ile dene (opsiyonel).
   → Gerçekte: bu %1-2 zaten neredeyse hiç izlenmiyor.

3. TELEGRAM RİSKİ: Büyük hacim upload ban tetikleyebilir.
   → Çoklu bot (5-10 bot, her biri farklı kanal).
   → Throttle: bot başına günde max 150 dosya.
   → Telegram Premium: daha yüksek limitler.
   → Ban olursa: yeni bot oluştur, eski file_id'ler hâlâ çalışır
     (Telegram'da dosya silinmez, bot ban'ı file erişimini kesmez).

4. HETZNER DMCA: Almanya'da, DMCA uyguluyor.
   → Hetzner SADECE warm cache. Expendable.
   → DMCA gelirse: Hetzner'daki dosyayı sil, Telegram'dan serve et.
   → Kalıcı arşiv HER ZAMAN Telegram'da.
   → Hetzner'sız da çalışır (Tier ③→④ devreye girer, biraz yavaşlar).

5. CLOUDFLARE HESAP RİSKİ: CF hesap kapatırsa edge cache gider.
   → Olasılık düşük: CF sadece proxy, içerik CF'de depolanmıyor.
   → CF hesap kapatsa: doğrudan VPS IP'den serve et (yavaşlar ama çalışır).
   → Yedek CF hesabı hazır tut (farklı ProtonMail ile).

6. YTS MAGNETLERİN ÖMRÜ: Çok eski magnet'ler seed'siz kalabilir.
   → Worker E haftalık seed kontrolü yapıyor.
   → Seed'siz olanları "unavailable" olarak işaretle.
   → Alternatif magnet ara (1337x, TGx).
```

---

## Tech stack özet

```
Frontend:    Next.js 15 + Tailwind + shadcn/ui (dark mode, Netflix-style)
Backend:     Node.js + Fastify
DB:          SQLite (~500 MB katalog)
Player:      hls.js + Plyr (ABR + altyazı + kalite seçici)
Torrent:     qBittorrent-nox + Mullvad VPN (WireGuard)
Remux:       FFmpeg (ffmpeg -c copy -f hls)
Hot cache:   NVMe disk (80 GB, LRU)
Warm cache:  Hetzner Storage Box (1-5 TB, SFTP)
Cold:        Telegram gizli kanal (sınırsız, $0)
CDN:         Cloudflare ücretsiz (edge cache, .jpg uzantı trick)
Koruma:      Turnstile + fingerprint + HMAC-SHA256 + CORS + rate limit
Reklam:      Server-side bumper (cache'li) + client IMA (cache'siz)
Monitoring:  Uptime Kuma + Telegram bot alert
OPSEC:       Njalla domain + AlexHost Moldova + Mullvad no-KYC + Monero
```

---

## Fazlı implementasyon — sıfır yatırımdan tam embed servisine

Fmovies, cinextma, nyumatflix gibi projeler hiçbir şey indirmiyor. TMDB kataloğu gösterip
ücretsiz embed API'lerinden iframe koyuyorlar. Bu "aggregator" modeli. Biz de buradan
başlayıp, gelir geldikçe kendi altyapımıza geçebiliriz.

### Phase 1: Aggregator — sıfır depolama, sıfır indirme (Hafta 1-2, €5-10/ay)

```
YAPILAN:
  → Next.js 15 site: TMDB API ile 70K film + 30K dizi kataloğu göster
  → Her film/dizi sayfasında ücretsiz embed provider'ın iframe'ini koy
  → Hiçbir şey indirilmiyor, depolanmıyor, encode edilmiyor
  → Sadece bir katalog sitesi + iframe

EMBED PROVIDER'LAR (ücretsiz, API key gereksiz):
  1. VidSrc:     https://vidsrc.store/embed/movie/{tmdb_id}
                 https://vidsrc.store/embed/tv/{tmdb_id}/{season}/{episode}
  2. 2Embed:     https://www.2embed.stream/embed/movie/{tmdb_id}
                 https://www.2embed.stream/embed/tv/{tmdb_id}/{s}/{e}
  3. VidSrc.cc:  https://vidsrc.cc/v2/embed/movie/{tmdb_id}
  4. AutoEmbed:  https://autoembed.cc/embed/movie/{tmdb_id}

  Her film için 3-4 provider iframe'i "Sunucu 1, Sunucu 2, Sunucu 3" olarak göster.
  Biri çalışmazsa kullanıcı diğerini seçer.
  Bu tam olarak fmovies/cinextma/primesrc'nin yaptığı model.

MALİYET:
  Vercel ücretsiz tier veya ucuz VPS: €0-5/ay
  Domain: €5/ay (veya ücretsiz .pages.dev)
  Toplam: €5-10/ay

GELİR:
  Reklam (site üzerinde, iframe dışında):
    → Banner reklamlar (Adcash, HilltopAds)
    → Pop-under
    → Native ads
  Embed provider'ların kendi reklamları iframe içinde ayrıca çalışır.
  Sen sadece kendi sitenin reklam gelirini alırsın.

BU FAZ NE KADAR SÜRER:
  Trafik gelene ve aylık €50-100+ reklam geliri olana kadar.
  Genelde 1-3 ay (SEO + sosyal medya paylaşımı ile).
```

### Phase 2: Hibrit — kendi player'ını ekle, popülerleri cache'le (€20-40/ay)

```
KOŞUL: Phase 1'den aylık €50+ gelir gelmeye başladı.

YAPILAN:
  → AlexHost VPS al (€16/ay)
  → Mullvad VPN (€5/ay)
  → Top 500-1000 popüler filmi indir + remux + Hetzner'a koy
  → Bu filmler için KENDİ embed player'ını kullan (hls.js + Plyr)
  → Geri kalan 69K film hâlâ upstream iframe'den oynar

AVANTAJ:
  → Popüler filmler kendi player'ından → TAM reklam kontrolü
  → Server-side bumper reklam = çok daha yüksek RPM
  → Upstream iframe: reklamını sen kontrol edemezsin, düşük gelir
  → Kendi player: RPM 3-5x daha yüksek
  → Cloudflare edge cache → popüler filmler ücretsiz CDN'den serve

AKIŞ:
  Kullanıcı filme tıklar
    → DB'de kendi cache'imizde var mı? (remux'lanmış HLS)
       EVET → kendi player'ımız (hls.js, tam reklam kontrolü)
       HAYIR → upstream iframe (vidsrc/2embed, sınırlı reklam kontrolü)

  Arka planda Worker'lar çalışır:
    → TMDB trending/popular + kendi izlenme sayacı
    → En çok izlenen filmleri indir → remux → cache
    → Her gün kendi cache'in büyür
    → Zamanla iframe oranı düşer, kendi player oranı artar
```

### Phase 3: Tam embed servisi — Option 9 full (€30+/ay)

```
KOŞUL: Aylık €200+ gelir, 5,000+ film cache'te.

YAPILAN:
  → Option 9'un tam mimarisi devreye girer
  → Hetzner Storage Box (5-10 TB)
  → Tüm filmler kendi cache'inden serve edilir
  → Upstream iframe tamamen kaldırılır
  → Tam reklam kontrolü, tam koruma, tam bağımsızlık
  → Hatta başka sitelere kendi embed linkini sunabilirsin (PPD modeli)

Bu aşamada sen de bir embed provider olursun (VOE/Filemoon gibi).
```

### Fazlar arası karşılaştırma

```
                Phase 1          Phase 2           Phase 3
                (Aggregator)     (Hibrit)          (Tam Embed)
─────────────────────────────────────────────────────────────
Maliyet         €5-10/ay         €20-40/ay         €30-50/ay
Depolama        0                1-5 TB            5-20 TB
İndirme         Yok              Popüler 1-5K      Tamamı 70K+
Reklam kontrolü Düşük (iframe)   Orta (hibrit)     Tam
RPM             $0.5-2           $2-5              $3-8
Karmaşıklık     Çok düşük        Orta              Orta-yüksek
Lansman süresi  1-2 hafta        +2-3 hafta        +1-2 ay
Bağımsızlık     Düşük (iframe)   Orta              Tam
Risk            Embed kapanır    Daha az            Minimum

GEÇİŞ MANTIĞı:
  Phase 1 → Phase 2: Gelir €50+/ay olunca
  Phase 2 → Phase 3: Gelir €200+/ay + cache 5K+ film olunca
  Her fazda önceki faz çalışmaya devam eder (fallback olarak)
```

### Phase 1 implementasyon detayı (hemen başla)

```
Gün 1:
  → Next.js 15 projesi oluştur
  → TMDB API key al (ücretsiz)
  → Ana sayfa: TMDB trending/popular filmler (poster grid)
  → Arama: TMDB search API

Gün 2:
  → Film detay sayfası: /movie/{tmdb_id}
    → TMDB'den poster, özet, rating, oyuncular
    → "Şimdi İzle" butonu → embed sayfasına git
  → Dizi detay: /tv/{tmdb_id} → sezon/bölüm listesi

Gün 3:
  → Embed/player sayfası: /watch/{type}/{tmdb_id}
    → 3-4 ücretsiz embed provider'ın iframe'i
    → "Sunucu 1 | Sunucu 2 | Sunucu 3" tab'ları
    → Biri çalışmazsa diğerini seç

  Kod (basitleştirilmiş):
    const providers = [
      { name: 'Sunucu 1', url: `https://vidsrc.store/embed/${type}/${id}` },
      { name: 'Sunucu 2', url: `https://www.2embed.stream/embed/${type}/${id}` },
      { name: 'Sunucu 3', url: `https://vidsrc.cc/v2/embed/${type}/${id}` },
    ];

    <iframe src={selectedProvider.url} allowFullScreen />

Gün 4-5:
  → Dark mode UI (Tailwind, shadcn/ui)
  → Reklam entegrasyonu (Adcash banner + pop-under)
  → Vercel'e deploy (ücretsiz) veya Cloudflare Pages
  → Domain bağla

Gün 6-7:
  → SEO: film sayfaları SSR, schema markup
  → Sosyal medya paylaşımı başlat
  → Google Search Console'a ekle

TOPLAM: 1 hafta. Maliyet: €5-10/ay. Sonuç: 70K film + 30K dizi izlenebilir site.
```
