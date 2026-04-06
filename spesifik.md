# Spesifik Gelir Modeli — Phase 1 → 2 → 3

> Her fazda nereden, nasıl, ne kadar para kazanılır — somut rakamlar ve entegrasyon detayları.

---

## Phase 1: Aggregator (€5-10/ay maliyet)

Phase 1'de tek gelir kaynağın **kendi sitendeki reklamlar**. Video iframe'in içindeki reklamlar
upstream provider'ın (vidsrc, 2embed), senin değil. Sen sadece kendi sayfandaki alan üzerinden
kazanırsın.

### 1.1 Pop-under reklam (ana gelir kaynağı)

Kullanıcı sayfada bir yere tıkladığında arka planda yeni bir reklam sekmesi açılır.
Streaming sitelerinde en yüksek gelir getiren format.

```
Ad Network          Kabul        Min Trafik   CPM (Tier 1)   CPM (Tier 3)   Ödeme
─────────────────────────────────────────────────────────────────────────────────────
HilltopAds          Streaming    Yok          $1.5-5.0       $0.3-1.5       Haftalık
Adcash              Streaming    Yok          $1.0-3.0       $0.2-1.0       NET-30
Monetag             Streaming    Yok          $0.8-2.5       $0.2-0.8       NET-7
PopCash             Streaming    Yok          $0.5-2.0       $0.1-0.5       Günlük
Clickadu            Streaming    Yok          $1.0-3.5       $0.3-1.2       NET-7

Tier 1: ABD, UK, Almanya, Kanada, Avustralya, Fransa
Tier 3: Türkiye, Hindistan, Brezilya, Endonezya, Pakistan

ÖNEMLİ: Sadece tek pop-under koy (sayfa başına 1 kez).
Fazla pop-under = kullanıcı kaçar + ad network ban eder.
```

**Entegrasyon (3 satır kod):**
```html
<!-- HilltopAds pop-under — <head> içine koy -->
<script src="//example-hilltopads.com/tag.min.js"
        data-zone="ZONE_ID_BURAYA" async></script>
```

**Tahmini gelir:**
```
1,000 günlük ziyaretçi × 2 sayfa/ziyaret = 2,000 impression/gün
CPM $1.5 (ortalama, karışık trafik) = $3/gün = ~$90/ay

5,000 günlük ziyaretçi = ~$450/ay
10,000 günlük ziyaretçi = ~$900/ay
```

### 1.2 In-page push notification

Sayfanın köşesinde küçük bildirim tarzı reklam kutusu çıkar. Pop-up engellenmez çünkü
sayfa içi element — adblock bypass. Kullanıcıyı rahatsız etmez.

```
Ad Network     CPM (Tier 1)   CPM (Tier 3)
───────────────────────────────────────────
Monetag        $0.3-1.0       $0.05-0.3
RichAds        $0.5-1.5       $0.1-0.5
```

**Entegrasyon:**
```html
<!-- Monetag in-page push — </body> öncesine koy -->
<script src="//example-monetag.com/inpage.js"
        data-site-id="SITE_ID" async></script>
```

**Tahmini gelir:**
```
5,000 günlük ziyaretçi × CPM $0.3 = ~$45/ay (ek gelir)
```

### 1.3 Banner reklam (sidebar / film detay sayfası)

Film detay sayfasında veya sidebar'da 300×250 veya 728×90 banner.
En düşük gelirli format ama sürekli görünür.

```
Ad Network     CPM (Tier 1)   CPM (Tier 3)
───────────────────────────────────────────
Adcash         $0.2-0.8       $0.05-0.2
HilltopAds     $0.3-1.0       $0.1-0.3
```

**Entegrasyon:**
```html
<!-- Adcash banner — film detay sayfasında sidebar'a koy -->
<div id="adcash-banner">
  <script src="//example-adcash.com/banner.js"
          data-zone="ZONE_ID" data-size="300x250" async></script>
</div>
```

**Tahmini gelir:**
```
5,000 günlük ziyaretçi × 3 sayfa × CPM $0.2 = ~$27/ay (ek gelir)
```

### 1.4 VPN affiliate (pasif gelir)

Streaming siteleri VPN affiliate'in altın madeni çünkü kullanıcılar zaten
"VPN kullanmalı mıyım?" diye düşünüyor. Dönüşüm oranı çok yüksek.

```
Program        Komisyon           Cookie    Min Ödeme    Ödeme
──────────────────────────────────────────────────────────────
NordVPN        %100 ilk ay +      30 gün    $10          Aylık
               %30 tekrar
Surfshark      %40 satış +        30 gün    $100         Aylık
               %30 tekrar
ExpressVPN     $13-36/satış       90 gün    $100         Aylık
PureVPN        %100 ilk ay +      90 gün    $100         Aylık
               %35 tekrar

NordVPN 2 yıllık plan satışı → ~$50-70 ilk komisyon + aylık tekrar.
```

**Entegrasyon:**
```
→ Site footer'ına "Güvenliğiniz için VPN kullanmanızı öneriyoruz" banner'ı
→ Film izleme sayfasına küçük "VPN ile güvenle izleyin" rozeti
→ Ayrı /vpn sayfası: "En İyi VPN'ler" karşılaştırma tablosu (affiliate linkli)

Her satış = $40-70 tek seferlik + aylık tekrar komisyon.
```

**Tahmini gelir:**
```
5,000 günlük ziyaretçi → ~%0.1 dönüşüm = 5 satış/ay
5 × $50 = $250/ay (başlangıçta)

10,000 günlük → 10 satış/ay = $500/ay
50,000 günlük → 50 satış/ay = $2,500/ay + tekrar komisyonlar birikir
```

### 1.5 Kripto bağış (opsiyonel ek gelir)

```
→ Footer'da "Bizi destekleyin" + Monero/BTC adresi
→ Düşük beklenti ama sıfır efor: ayda $0-50
```

### Phase 1 toplam gelir tahmini

```
Trafik            Pop-under   In-page   Banner   VPN Aff.   Toplam
──────────────────────────────────────────────────────────────────────
1K/gün (Ay 1)     $90         $9        $5       $50        ~$154/ay
5K/gün (Ay 2-3)   $450        $45       $27      $250       ~$772/ay
10K/gün (Ay 4-6)  $900        $90       $54      $500       ~$1,544/ay

Maliyet: €5-10/ay
Net kâr (5K/gün): ~$700+/ay → Phase 2'ye geçiş koşulu sağlanır
```

---

## Phase 2: Hibrit — kendi player + upstream iframe (€20-40/ay maliyet)

Phase 1'deki TÜM gelir kanalları devam eder. Ek olarak:

### 2.1 Video pre-roll reklam (BÜYÜK fark)

Phase 1'de iframe içindeki reklamları kontrol edemiyorsun. Phase 2'de
popüler filmler kendi player'ından (hls.js + Plyr) oynar → video
başlamadan önce kendi reklamını gösterebilirsin.

```
İki yöntem:

A) Client-side — Google IMA SDK veya VAST tag
   → Adcash/HilltopAds VAST endpoint'i al
   → Player video başlamadan önce 15-30 sn reklam gösterir
   → Kullanıcı "Reklamı geç" diyebilir (5 sn sonra)
   → CPM: $3-8 (Tier 1), $0.5-2 (Tier 3)
   → DEZAVANTAJ: Adblock engelleyebilir

B) Server-side bumper — adblock-proof
   → Reklam videosunu m3u8 playlist'in başına segment olarak ekle
   → hls.js açısından normal video segmenti — adblock görmez
   → CPM: aynı ama %100 görüntülenme (adblock bypass)
   → AVANTAJ: gelir 2-3x artar (adblock kullananlar da görür)
```

**Server-side bumper implementasyonu:**
```
Reklam segmenti oluştur (1-3 sn):
  ffmpeg -i reklam.mp4 -c copy -f hls -hls_time 3 ad_segment.ts

m3u8 playlist'e enjekte et:
  #EXTM3U
  #EXTINF:3.0,
  /cdn/{hmac}/ad_001.jpg        ← reklam segmenti (.jpg olarak serve)
  #EXTINF:10.0,
  /cdn/{hmac}/seg_001.jpg       ← gerçek film segmenti
  #EXTINF:10.0,
  /cdn/{hmac}/seg_002.jpg
  ...

Kullanıcı açısından: video açılır, 3 sn reklam oynar, film başlar.
Adblock açısından: hepsi aynı domain'den .jpg dosyaları — engelleyemez.
```

**Tahmini gelir farkı:**
```
Phase 1 (iframe): kullanıcı başına RPM ~$0.04-0.10
Phase 2 (kendi player, server-side bumper): kullanıcı başına RPM ~$0.15-0.40

Kendi player'dan oynayan popüler filmler:
  5,000 günlük izleyici × %60 kendi player × RPM $0.25 = $750/ay (sadece pre-roll)

VS Phase 1'de aynı 5K izleyici → iframe'deki reklamlardan $0 (sen alamıyorsun)
```

### 2.2 Mid-roll reklam (film ortasında)

Film 45+ dakikaysa ortasına bir reklam segmenti daha ekle.
Netflix/Hulu/Amazon da bunu yapıyor artık (2025+).

```
Her mid-roll = ek CPM $2-5 (Tier 1)
2 saatlik filmde 1-2 mid-roll = gelir 2x

DİKKAT: 3'ten fazla mid-roll koyma — kullanıcı kaçar.
Film uzunluğuna göre:
  < 60 dk: sadece pre-roll
  60-120 dk: pre-roll + 1 mid-roll
  > 120 dk: pre-roll + 2 mid-roll
```

### 2.3 Interstitial (tam sayfa reklam)

Kullanıcı "Şimdi İzle" butonuna tıklayınca, player yüklenmeden önce
5 sn tam sayfa reklam göster → sonra player açılır.

```
CPM: $2-6 (Tier 1), $0.5-2 (Tier 3)
Her film izleme = 1 interstitial impression
5,000 izleme/gün × CPM $2.5 = $375/ay
```

### 2.4 Direct advertiser (Phase 2 sonrası)

Trafik 10K+/gün olunca doğrudan reklamveren bulabilirsin:
```
→ Online casino/bahis siteleri: $500-2,000/ay sabit banner
→ VPN markaları: $300-1,000/ay sponsorluk
→ Kripto borsaları: $200-800/ay
→ Adult siteleri: $200-500/ay

Nasıl bulursun:
  → Site footer'ına "Advertise with us" linki + Telegram iletişim
  → Telegram gruplarında "buy traffic" kanalları
  → BuySellAds, AdSpyglass marketplace
```

### Phase 2 toplam gelir tahmini

```
Trafik             Tüm Phase 1   Pre-roll    Mid-roll   Interstitial   Toplam
────────────────────────────────────────────────────────────────────────────────
5K/gün             $772          $750        $200       $375           ~$2,097/ay
10K/gün            $1,544        $1,500      $400       $750           ~$4,194/ay
25K/gün            $3,860        $3,750      $1,000     $1,875         ~$10,485/ay

Maliyet: €20-40/ay
Net kâr (10K/gün): ~$4,100+/ay
```

---

## Phase 3: Tam embed servisi (€30-50/ay maliyet)

Phase 1 + Phase 2'deki TÜM gelir kanalları devam eder. Ek olarak:

### 3.1 PPD — Pay Per Download / Pay Per View (embed servisi olarak)

Artık sen de bir embed provider'sın (VOE/Filemoon gibi). Başka
aggregator siteleri SENİN embed linkini kullanır.

```
Model: Diğer siteler senin embed'ini kullanır → sen reklam gösterirsin
       → impression başına onlara pay verirsin (veya vermezsin)

VOE modeli:
  → Ücretsiz embed sun (reklamlarla)
  → Popüler olunca: premium embed (daha az reklam, daha hızlı) = aylık ücret
  → PPD: izleme başına $0.5-2/1000 views

SENIN embed URL formatın:
  https://senin-domain.com/embed/{film_id}
  → hls.js player + server-side bumper + anti-adblock
  → Başka siteler iframe olarak koyar
  → Her izleme = senin reklam gelirin
```

**Tahmini ek gelir:**
```
10 site senin embed'ini kullanırsa → her biri 1K/gün trafik gönderir
10 × 1,000 = 10K ek günlük izleme
RPM $0.25 × 10K = $2,500/ay (sıfır ek maliyet, Cloudflare cache'ten serve)
```

### 3.2 Premium / VIP üyelik

Ad-free veya daha az reklamlı izleme deneyimi. Kripto ödeme ile anonim.

```
Tier        Fiyat         Özellikler
────────────────────────────────────────────────────
Ücretsiz    $0            Pre-roll + mid-roll + pop-under
VIP         $3/ay         Sadece 1 pre-roll, mid-roll yok, pop-under yok
Ultra       $6/ay         Sıfır reklam + 4K öncelik + hızlı sunucu

Ödeme yöntemleri:
  → Kripto: Monero, BTC, LTC, USDT (NOWPayments veya CoinGate API)
  → Telegram Stars (Telegram ödeme sistemi, düşük komisyon)

Avantaj: Tekrar eden gelir. 100 VIP üye × $3 = $300/ay garantili.

Neden kripto: Anonim ödeme = OPSEC korunur. Stripe/PayPal DMCA riski.
```

**Entegrasyon:**
```
→ Kullanıcı kayıt: email (opsiyonel) + şifre
→ Ödeme: NOWPayments widget → kripto gönder → webhook → DB'de VIP flag
→ Player: VIP flag varsa reklam segmentlerini atla
→ Otomatik: 30 gün sonra VIP expire → tekrar ödeme gerekir

NOWPayments API:
  POST https://api.nowpayments.io/v1/invoice
  { "price_amount": 3, "price_currency": "usd", "pay_currency": "xmr" }
  → Kullanıcıya Monero adresi göster → ödeme gelince webhook tetiklenir
```

### 3.3 Smartlink / direct link monetizasyon

Bazı ad network'leri "smartlink" verir — tek bir URL'ye yönlendirme yapar,
kullanıcının ülkesine/cihazına göre en iyi teklifi gösterir.

```
Kullanım yeri:
  → "İndirme linki" butonu (gerçekte film indirme yok, smartlink'e yönlendir)
  → Video altı "Tam HD İndir" sahte butonu
  → CPM: $5-15 (Tier 1)

Network: Monetag SmartLink, Adcash SmartLink, Clickadu
DİKKAT: Aşırı kullanma — kullanıcı güveni kaybedilir.
```

### Phase 3 toplam gelir tahmini

```
Trafik            Phase 1+2    PPD embed   VIP Üyelik   SmartLink   Toplam
──────────────────────────────────────────────────────────────────────────────
10K/gün           $4,194       $2,500      $300         $500        ~$7,494/ay
25K/gün           $10,485      $5,000      $900         $1,250      ~$17,635/ay
50K/gün           $20,970      $10,000     $2,000       $2,500      ~$35,470/ay

Maliyet: €30-50/ay
Net kâr (25K/gün): ~$17,500+/ay
```

---

## Gelir büyüme yol haritası

```
        Ay 1        Ay 3        Ay 6         Ay 12        Ay 18
        ─────       ─────       ──────       ──────       ──────
Trafik  1K/gün      5K/gün      15K/gün      30K/gün      50K+/gün
Faz     Phase 1     Phase 1→2   Phase 2      Phase 2→3    Phase 3
Gelir   ~$150/ay    ~$800/ay    ~$6,000/ay   ~$12,000/ay  ~$25,000+/ay
Maliyet €10/ay      €15/ay      €30/ay       €40/ay       €50/ay
Net     ~$140       ~$785       ~$5,970      ~$11,960     ~$24,950+

Kritik eşikler:
  1K/gün → kendi kendini finanse eder
  5K/gün → Phase 2'ye geç (kendi player)
  15K/gün → tam zamanlı gelir seviyesi
  30K/gün → Phase 3'e geç (tam embed servisi)
```

---

## Hangi ad network'ü ne zaman kullan

```
Phase 1 (başlangıç, < 5K/gün):
  → HilltopAds (pop-under) — streaming kabul eder, min trafik yok, haftalık ödeme
  → Monetag (in-page push) — kolay entegrasyon, NET-7 ödeme
  → NordVPN affiliate — pasif, yüksek komisyon

Phase 2 (büyüme, 5K-25K/gün):
  → Yukarıdaki tümü devam
  → Adcash (VAST pre-roll) — video reklam için
  → Server-side bumper (kendi reklam enjeksiyonu) — adblock bypass
  → Direct advertiser aramaya başla

Phase 3 (olgunluk, 25K+/gün):
  → Yukarıdaki tümü devam
  → AdSpyglass (header bidding) — tüm network'leri yarıştır, en yüksek CPM'i al
  → PPD embed geliri
  → VIP üyelik (kripto)
  → Direct advertiser portfolio
```

---

## Entegrasyon öncelik sırası (ilk gün ne koy)

```
GÜN 1 — Hemen koy (10 dk):
  ✓ HilltopAds pop-under (ana gelir)
  ✓ NordVPN affiliate banner (footer + /vpn sayfası)

HAFTA 1 — Ekle (30 dk):
  ✓ Monetag in-page push
  ✓ Adcash sidebar banner (film detay sayfası)
  ✓ Kripto bağış adresi (footer)

AY 1 — Trafik gelince:
  ✓ A/B test: HilltopAds vs Adcash pop-under (hangisi daha çok kazandırıyor?)
  ✓ İkinci VPN affiliate ekle (Surfshark)

AY 2-3 — Phase 2'ye geçerken:
  ✓ VAST pre-roll (kendi player'ında)
  ✓ Server-side bumper sistemi
  ✓ Anti-adblock detection
```

---

## Anti-adblock stratejisi (geliri 2-3x artırır)

Streaming sitelerinde kullanıcıların %40-60'ı adblock kullanır.
Bu büyük gelir kaybı. Çözüm:

```
Katman 1: Tespit
  → Bait element (görünmez div, reklam class'ı ile)
  → Adblock varsa div yok olur → tespit edildi

Katman 2: Nazik uyarı
  → "Adblocker tespit edildi. Sitemizi desteklemek için kapatın."
  → Kullanıcıya 5 sn beklet, sonra izlemeye devam etsin
  → %20-30'u kapatır

Katman 3: Server-side bypass (Phase 2+)
  → Reklam segmentleri film segmentiyle aynı domain + aynı format
  → Adblock fark edemez → %100 gösterim
  → Bu tek başına geliri 2x artırır

Katman 4: VIP upsell
  → "Reklamsız izlemek ister misiniz? VIP: $3/ay"
  → Adblock kullanan kullanıcıyı ödeme yapan kullanıcıya çevir
```

---

## Ödeme alma — anonim kalarak

```
OPSEC-uyumlu ödeme yöntemleri:

Ad Network ödemeleri:
  → Bitcoin (Adcash, HilltopAds, Monetag destekliyor)
  → Kripto → anonim cüzdan → Monero'ya çevir → nakit

VPN affiliate ödemeleri:
  → PayPal (anonim/sahte isim hesabı) veya
  → Kripto (NordVPN BTC ile ödüyor)

VIP üyelik ödemeleri:
  → NOWPayments → direkt kripto cüzdanına
  → Monero tercih et (tamamen izlenemez)

Direct advertiser:
  → Kripto ile anlaş (Telegram üzerinden)
  → USDT (TRC-20) yaygın

Önemli: ASLA kendi adına banka hesabı/PayPal kullanma.
```

---

## Server-side bumper reklam neden ENGELLENEMEZ — teknik kanıt

Bu bölüm, dünyanın en iyi mühendislik ekibinin bile server-side bumper reklamları
neden kaldıramayacağını teknik olarak açıklar.

### Geleneksel reklam nasıl çalışır (engellenmesi KOLAY)

```
Kullanıcı → Senin siten → player.js yüklenir
                         → player.js Google IMA SDK'yı çağırır:
                            <script src="https://imasdk.googleapis.com/js/sdkloader/ima3.js">
                         → IMA SDK reklam sunucusuna istek atar:
                            GET https://pubads.g.doubleclick.net/gampad/ads?...
                         → Reklam videosu farklı domain'den gelir:
                            https://redirector.googlevideo.com/videoplayback?...
                         → Reklam oynar → sonra film başlar

ADBLOCK BU AKIŞI NASIL ENGELLER:
  1. imasdk.googleapis.com domain'ini engelle → SDK hiç yüklenmez
  2. pubads.g.doubleclick.net domain'ini engelle → reklam isteği hiç gitmez
  3. redirector.googlevideo.com engelle → reklam videosu hiç gelmez
  4. "ads" kelimesi geçen URL'leri engelle → double kill

  Neden kolay: Reklam ve içerik FARKLI DOMAIN'lerden geliyor.
  Adblock sadece domain listesine bakıyor. İş bitti.
```

### Server-side bumper nasıl çalışır (engellenmesi İMKANSIZ)

```
Kullanıcı → Senin siten → player'a m3u8 playlist verilir:

  #EXTM3U
  #EXT-X-TARGETDURATION:10
  #EXTINF:3.0,
  https://cdn.senin-domain.com/cdn/a7f2b9e1/seg_000.jpg     ← REKLAM (3 sn)
  #EXTINF:10.0,
  https://cdn.senin-domain.com/cdn/a7f2b9e1/seg_001.jpg     ← FİLM segment 1
  #EXTINF:10.0,
  https://cdn.senin-domain.com/cdn/a7f2b9e1/seg_002.jpg     ← FİLM segment 2
  #EXTINF:10.0,
  https://cdn.senin-domain.com/cdn/a7f2b9e1/seg_003.jpg     ← FİLM segment 3
  ...

HER SEGMENT:
  Domain:       cdn.senin-domain.com     (hepsi aynı)
  URL pattern:  /cdn/{hmac}/seg_XXX.jpg  (hepsi aynı format)
  Uzantı:       .jpg                     (hepsi aynı)
  Content-Type: video/MP2T               (hepsi aynı)
  Boyut:        ~1-5 MB                  (hepsi benzer)
  HTTP status:  200                      (hepsi aynı)

SORU: seg_000.jpg reklam mı yoksa film mi?
CEVAP: FARK EDİLEMEZ. İkisi de aynı domain, aynı format, aynı uzantı,
       aynı header, aynı boyut aralığında binary video verisi.
```

### Neden en iyi ekip bile başarısız olur — 7 saldırı vektörü analizi

```
SALDIRI 1: Domain bazlı engelleme
  → Reklam ve film AYNI domain'den geliyor (cdn.senin-domain.com)
  → Domain'i engellersen film de oynatılmaz
  → SONUÇ: İmkansız

SALDIRI 2: URL pattern analizi
  → /cdn/a7f2b9e1/seg_000.jpg (reklam)
  → /cdn/a7f2b9e1/seg_001.jpg (film)
  → Pattern: tamamen aynı. Sadece segment numarası farklı.
  → "seg_000 her zaman reklam" denilemez çünkü:
    - Her kullanıcıya farklı m3u8 üretilir (HMAC farklı)
    - Reklam segment numarası rastgele olabilir
    - Mid-roll reklamlar filmin ortasındaki herhangi bir segment olabilir
  → SONUÇ: İmkansız

SALDIRI 3: Segment boyutuna göre filtreleme
  → Reklam segmenti: ~500 KB - 3 MB (3 sn video)
  → Film segmenti:   ~1 MB - 5 MB (10 sn video)
  → Boyutlar örtüşüyor. Kesin ayrım yapılamaz.
  → Kısa film sahnesi de 500 KB olabilir.
  → SONUÇ: İmkansız (false positive çok yüksek)

SALDIRI 4: Segment süresine göre filtreleme (EXTINF)
  → Reklam: #EXTINF:3.0 (3 saniye)
  → Film:   #EXTINF:10.0 (10 saniye)
  → "3 saniyelik segmentleri atla" denilebilir mi?
  → KARŞI ÖNLEM: Reklam segmentini 10 saniye yap (7 sn siyah ekran + 3 sn reklam)
    veya reklam segmentini parçala: 3 × 1 sn segment = normal görünür
  → Ayrıca filmin son segmenti de 3 sn olabilir → onu da atlar
  → SONUÇ: Kolayca atlatılabilir, güvenilir değil

SALDIRI 5: m3u8 playlist'i değiştirme (client-side)
  → "İlk segmenti sil, geri kalanını oynat" yaklaşımı
  → KARŞI ÖNLEM: m3u8 her istekte sunucu tarafında üretilir
  → Playlist'i client-side değiştirsen bile:
    a) Hangi segmentin reklam olduğunu bilmiyorsun (hepsi aynı görünüyor)
    b) Yanlış segmenti silersen filmin başı kaybolur
  → Mid-roll reklamlar filmin 45. dakikasında olabilir → hangisi?
  → SONUÇ: İmkansız (hangi segment reklam bilinmiyor)

SALDIRI 6: Video içeriğini analiz etme (ML/AI)
  → Teorik: Her segmenti indir → decode et → "bu reklam mı?" AI modeli çalıştır
  → Pratik sorunlar:
    a) Real-time decode + inference = BÜYÜK CPU/GPU yükü
    b) Reklam video segmenti 10-bit H.264 → decode etmek gerekir
    c) Bu işlem sırasında video donma yapar (kullanıcı deneyimi çöker)
    d) Reklam içeriği sürekli değişir → model sürekli güncellenmeli
    e) Browser extension'da ML model çalıştırmak = tarayıcı çöker
    f) 3 saniyelik segment için 3+ saniye analiz = anlamsız
  → SONUÇ: Teorik olarak mümkün, pratikte imkansız

SALDIRI 7: Tarayıcı extension ile hls.js'i hook'lama
  → "hls.js'in segment yükleme fonksiyonunu yakala, ilk segmenti atla"
  → KARŞI ÖNLEM:
    a) hls.js minified + obfuscated → fonksiyon isimleri değişir her build'de
    b) Player integrity check: hls.js'in kodu değiştirilmişse → çalışmayı durdur
    c) Reklam segmenti index değişken: bazen 0, bazen 3, bazen 15 (mid-roll)
    d) Player kodu WebWorker'da çalışabilir → extension erişemez
  → Extension yapsan bile hangi segmenti atlayacağını bilmiyorsun
  → SONUÇ: Spesifik bir site için geçici çözüm olabilir,
           ama genel bir adblock olarak imkansız
```

### Karşılaştırma tablosu

```
Saldırı Vektörü          Client-side reklam    Server-side bumper
──────────────────────────────────────────────────────────────────
Domain engelleme          ✅ Kolay (farklı)     ❌ İmkansız (aynı)
URL pattern analizi       ✅ Kolay (/ads/)      ❌ İmkansız (aynı)
Content-Type kontrolü     ✅ Kolay (farklı)     ❌ İmkansız (aynı)
JavaScript hook           ✅ Kolay (IMA SDK)    ❌ İmkansız (yok)
Boyut filtreleme          ⚠️ Zor               ❌ İmkansız
m3u8 düzenleme            ⚠️ Zor               ❌ İmkansız
ML video analizi          ⚠️ Teorik             ⚠️ Teorik ama pratik değil
Sonuç                     %95+ engellenebilir   %0 engellenebilir
```

### Gerçek dünyadan kanıt

```
Bu tekniği kullananlar:
  → Hulu: 2016'dan beri server-side ad insertion (SSAI) kullanıyor
  → Peacock (NBC): SSAI ile reklam gösteriyor
  → Paramount+: aynı sistem
  → YouTube TV: benzer mekanizma (farklı implementasyon)
  → VOE/Filemoon: ANALYSIS.md'de belgeledik — segment bazlı reklam

  Bu şirketlerin reklamlarını engelleyen bir adblock VAR MI?
  → HAYIR. Yıllardır yok. Çünkü teknik olarak imkansız.

  uBlock Origin, AdGuard, Brave Shield — hiçbiri Hulu'nun
  server-side reklamlarını engelleyemiyor. Aynı teknik.
```

### Ek koruma katmanları (paranoya modu)

```
1. Segment şifreleme (AES-128):
   → HLS AES-128 encryption ile segmentler şifrelenir
   → Anahtar sunucudan alınır → adblock araya giremez
   → Reklam segmenti de şifreli → decode etmeden analiz edilemez

2. Dinamik reklam yerleştirme:
   → Her istek için farklı pozisyonda reklam segmenti
   → Pre-roll (başta), mid-roll (ortada), post-roll (sonda)
   → Pozisyon kullanıcı bazında değişir → pattern çıkarılamaz

3. Token doğrulama:
   → Her segment isteğinde HMAC token kontrolü
   → Token olmadan segment verilmez
   → Token kullanıcı IP + fingerprint'e bağlı
   → Başka bir istemci ile segment indirilemez

4. Reklam segmentini film gibi gösterme:
   → Reklam videosu film tarzında encode edilir
   → Aynı codec, aynı bitrate, aynı çözünürlük
   → Binary düzeyinde ayırt edilemez
```
