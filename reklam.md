# Reklam Entegrasyon Planı

## Mimari: Reklam nereye, nasıl eklenir

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                     KULLANICI İSTEĞİ                           │
  │              "Inception izlemek istiyorum"                      │
  └──────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  FILM SİTESİ (NyumatFlix)                                      │
  │                                                                  │
  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐  ┌───────────┐ │
  │  │ Pop-under│  │ Banner   │  │ VPN Affiliate  │  │ In-page   │ │
  │  │ (arka    │  │ (sidebar │  │ (footer +      │  │ Push      │ │
  │  │  sekme)  │  │  300×250)│  │  /vpn sayfası) │  │ (köşe)    │ │
  │  └──────────┘  └──────────┘  └────────────────┘  └───────────┘ │
  │                                                                  │
  │  ┌──────────────────────────────────────────────┐               │
  │  │ "Şimdi İzle" butonu tıklandı                 │               │
  │  │ → Interstitial reklam (5 sn tam sayfa)       │               │
  │  │ → Sonra embed player açılır                  │               │
  │  └──────────────────────┬───────────────────────┘               │
  └─────────────────────────┼───────────────────────────────────────┘
                            │
                            ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  EMBED SERVİSİ (embed-api) — server-side reklam enjeksiyonu     │
  │                                                                  │
  │  Telegram → VPS → ffmpeg remux → m3u8 playlist oluştur          │
  │                                                                  │
  │  #EXTM3U                                                        │
  │  #EXTINF:10.0,                                                  │
  │  /v/hmac/seg_000.jpg   ← PRE-ROLL REKLAM (10 sn)               │
  │  #EXTINF:10.0,                                                  │
  │  /v/hmac/seg_001.jpg   ← film                                  │
  │  #EXTINF:10.0,                                                  │
  │  /v/hmac/seg_002.jpg   ← film                                  │
  │  ...                                                            │
  │  #EXTINF:10.0,                                                  │
  │  /v/hmac/seg_270.jpg   ← MID-ROLL REKLAM (45. dk)              │
  │  #EXTINF:10.0,                                                  │
  │  /v/hmac/seg_271.jpg   ← film devam                            │
  │  ...                                                            │
  │                                                                  │
  │  Tüm segmentler: aynı domain, aynı uzantı, aynı format         │
  │  → Adblock ayırt edemez → ENGELLENEMEZ                          │
  └──────────────────────────────────────────────────────────────────┘
```

---

## Reklam tipleri ve kullanılacak servisler

### 1. Pop-under → HilltopAds

```
Nerede:     Film sitesinde, kullanıcı herhangi bir yere tıklayınca
Nasıl:      Arka planda yeni reklam sekmesi açılır
Sıklık:     Sayfa başına 1 kez (fazlası kullanıcı kaçırır)
CPM:        $1.5-5 (Tier 1), $0.3-1.5 (Tier 3)
Neden:      Streaming'de en yüksek gelirli format
Ödeme:      Haftalık, kripto destekler

Entegrasyon:
  <script src="//hilltopads.com/tag.min.js"
          data-zone="ZONE_ID" async></script>
```

### 2. Server-side bumper (pre-roll + mid-roll) → Kendi sistemimiz

```
Nerede:     Embed player içinde, HLS segmenti olarak
Nasıl:      m3u8 playlist'e reklam video segmentleri eklenir
Sıklık:     Pre-roll: her film başı (1 adet, 5-15 sn)
            Mid-roll: 60+ dk filmlerde 1, 120+ dk filmlerde 2
CPM:        $3-8 (Tier 1), $0.5-2 (Tier 3) — %100 gösterim
Neden:      Adblock-proof, engellenemez, en güvenilir gelir
Ödeme:      Direkt advertiser ile anlaşma (kripto)

Reklam segmenti hazırlama:
  ffmpeg -i reklam_video.mp4 \
    -c:v libx264 -c:a aac -b:v 2M \
    -f hls -hls_time 10 \
    -hls_segment_filename 'ad_%03d.ts' \
    ad_playlist.m3u8

Reklamveren kaynakları:
  → Direkt: Telegram "buy traffic" gruplarından casino/VPN/oyun reklamı
  → AdSpyglass marketplace (25K+/gün trafik sonrası)
  → Kendi VPN affiliate linki video reklam olarak
```

### 3. Interstitial (tam sayfa) → Adcash

```
Nerede:     "Şimdi İzle" butonundan sonra, player açılmadan önce
Nasıl:      5 sn tam sayfa reklam → "Devam et" butonu → player açılır
Sıklık:     Film başına 1 kez
CPM:        $2-6 (Tier 1), $0.5-2 (Tier 3)
Neden:      Yüksek CPM, kullanıcı zaten izlemeye kararlı
Ödeme:      NET-30, kripto destekler

Entegrasyon:
  Adcash interstitial JS SDK → "Şimdi İzle" click handler'ına bağla
```

### 4. Banner (sidebar) → Adcash

```
Nerede:     Film detay sayfasında sağ sidebar (300×250)
Nasıl:      Statik veya dinamik banner alanı
Sıklık:     Sayfa yüklenince sürekli görünür
CPM:        $0.2-1.0 (düşük ama sürekli)
Neden:      Kolay, ek gelir, her sayfada çalışır
Ödeme:      NET-30

Entegrasyon:
  <div id="ad-banner">
    <script src="//adcash.com/banner.js"
            data-zone="ZONE_ID" data-size="300x250" async></script>
  </div>
```

### 5. In-page push → Monetag

```
Nerede:     Sayfanın sağ alt köşesinde bildirim kutusu
Nasıl:      Sayfa içi element, browser push değil → adblock bypass
Sıklık:     Sayfada 30 sn sonra 1 kez
CPM:        $0.3-1.0 (Tier 1)
Neden:      Kullanıcıyı rahatsız etmez, adblock'a dayanıklı
Ödeme:      NET-7

Entegrasyon:
  <script src="//monetag.com/inpage.js"
          data-site-id="SITE_ID" async></script>
```

### 6. VPN affiliate → NordVPN + Surfshark

```
Nerede:     Footer banner + ayrı /vpn karşılaştırma sayfası
Nasıl:      Affiliate link ile yönlendirme
Sıklık:     Sürekli görünür
Komisyon:   NordVPN: %100 ilk ay + %30 tekrar (cookie 30 gün)
            Surfshark: %40 satış + %30 tekrar
Neden:      Streaming kullanıcıları VPN'e yatkın, yüksek dönüşüm
Ödeme:      Aylık, kripto destekler (NordVPN BTC ile ödüyor)

Entegrasyon:
  → Footer: "Güvenliğiniz için VPN öneriyoruz" + affiliate link
  → /vpn: "En İyi 3 VPN" karşılaştırma tablosu
  → Player altı: küçük "VPN ile güvenle izleyin" rozeti
```

---

## Faz bazlı uygulama takvimi

```
PHASE 1 — Aggregator (Gün 1)
├── HilltopAds pop-under         ana gelir
├── Monetag in-page push         ek gelir
├── Adcash sidebar banner        ek gelir
├── NordVPN affiliate            pasif gelir
└── Kripto bağış (footer)        minimal

PHASE 2 — Kendi player (Ay 2-3)
├── Tüm Phase 1 devam
├── Server-side bumper pre-roll  ★ en büyük gelir artışı
├── Server-side bumper mid-roll  ek gelir
├── Adcash interstitial          yüksek CPM
├── Anti-adblock detection       VIP upsell
└── Surfshark affiliate eklenir  ikinci VPN geliri

PHASE 3 — Tam embed servisi (Ay 6+)
├── Tüm Phase 1+2 devam
├── PPD embed geliri             başka siteler embed'ini kullanır
├── Direct advertiser            Telegram ile anlaşma
├── AdSpyglass header bidding    network'leri yarıştır
└── VIP üyelik (reklamsız)       $3-6/ay, kripto ile
```

---

## Gelir tahmini özeti

```
              Pop-   In-page  Banner  VPN     Bumper   Inter-   Direkt/
              under  Push            Aff.    Pre+Mid  stitial  PPD       TOPLAM
─────────────────────────────────────────────────────────────────────────────────
1K/gün (Ay 1)
Phase 1       $90    $9       $5     $50      —        —        —        ~$154

5K/gün (Ay 3)
Phase 2       $450   $45      $27    $250    $950     $375      —       ~$2,097

10K/gün (Ay 6)
Phase 2       $900   $90      $54    $500    $1,900   $750      —       ~$4,194

25K/gün (Ay 12)
Phase 3       $2,250 $225     $135   $1,250  $4,750   $1,875   $5,000  ~$15,485

Maliyet       €10    →        →      →       €30      →        €50/ay
```

---

## Servis seçim gerekçeleri

```
Servis         Neden seçildi
─────────────────────────────────────────────────────────────────────
HilltopAds     Streaming siteleri açıkça kabul eder, minimum trafik
               şartı yok, haftalık ödeme, kripto ödeme destekler.
               Pop-under CPM'leri sektörün en yükseği.

Adcash         İkinci büyük streaming-dostu ağ. Interstitial ve
               banner formatları güçlü. VAST pre-roll desteği var.
               Kripto ödeme yapıyor. NET-30 ödeme.

Monetag        In-page push'ta en kolay entegrasyon. NET-7 ödeme
               (hızlı nakit akışı). Düşük eşik, yeni siteler için ideal.

NordVPN        Streaming kullanıcılarına en yüksek dönüşüm. %100 ilk
               ay komisyon. BTC ile ödeme yapıyor (OPSEC uyumlu).

Surfshark      İkinci VPN olarak portföy çeşitlendirme. %40 satış
               komisyonu. Ödeme kripto destekli.

AdSpyglass     Phase 3'te header bidding ile tüm ağları yarıştırır.
               En yüksek CPM'i otomatik seçer. 25K+/gün trafik
               gerektirir.

Kendi SSAI     Server-side bumper: %100 gösterim garantisi, adblock
               engelleyemez. Direct advertiser ile çalışır. Sıfır
               aracı komisyon. Tam kontrol.
```

---

## Neden server-side bumper engellenemez (özet)

```
Adblock'un çalışma prensibi:
  İstek domain'i reklam listesinde mi? → Engelle
  URL'de /ads/, /banner/, /tracking/ var mı? → Engelle
  Farklı domain'den gelen medya mı? → Engelle

Server-side bumper:
  Domain:       cdn.senin-domain.com     (film ile aynı)
  URL:          /v/hmac/seg_000.jpg      (film ile aynı format)
  Uzantı:       .jpg                     (film ile aynı)
  Content-Type: video/MP2T               (film ile aynı)
  Boyut:        1-5 MB                   (film ile aynı aralık)

  → Adblock'un elinde ayırt edecek HİÇBİR sinyal yok
  → Domain engellerse film de durur
  → URL pattern engellerse film de durur
  → Hulu, Peacock, Paramount+ aynı tekniği kullanıyor
  → Yıllardır hiçbir adblock engelleyemiyor
```

---

## Ödeme alma (OPSEC uyumlu)

```
Kaynak              Ödeme yöntemi
────────────────────────────────────────────
HilltopAds          BTC / USDT (TRC-20)
Adcash              BTC / Wire (anonim şirket)
Monetag             BTC / USDT
NordVPN affiliate   BTC
Surfshark affiliate PayPal (anonim) / Wire
Direct advertiser   USDT / Monero (Telegram ile anlaş)
VIP üyelik          NOWPayments → Monero cüzdan
Kripto bağış        Direkt Monero/BTC adresi

Kural: Kendi adına banka/PayPal hesabı kullanma.
       Tüm gelirler kripto cüzdanına → Monero'ya çevir.
```

---

## Pop-under: neden herkes kullanıyor ve en iyi sağlayıcı

Her embed provider (VOE, Filemoon, StreamWish, Vidoza) aynı şeyi yapıyor:
kullanıcı Play'e tıklar → 2-5 pop-under açılır → video oynar. Tesadüf değil.

```
Neden pop-under #1 gelir kaynağı:

  1. %100 tetiklenme → kullanıcı filmi izlemek İÇİN tıklamak ZORUNDA
     Banner: kullanıcı görmezden gelebilir → %0.1 CTR
     Pop-under: tıklama = impression → %100 CTR

  2. En yüksek CPM → aynı trafik, 3-5x daha fazla gelir
     Banner:     $0.2-1.0 CPM
     In-page:    $0.3-1.0 CPM
     Pop-under:  $1.5-5.0 CPM  ← 5x fark

  3. Kullanıcı alışık → streaming izleyicileri bunu "bedelini ödeme"
     olarak kabul ediyor, siteyi terk etmiyor

  4. Stacking → rakipler 1 değil 2-5 pop-under açıyor
     Her tıklamada birden fazla ağın pop-under'ı tetiklenir
     5 pop-under × $2 CPM = $10 eCPM (tek tıklamadan)
```

### Rakipler nasıl yapıyor

```
VOE / Filemoon / StreamWish stratejisi:

  Play butonuna tıkla
    ├── Pop-under #1 (HilltopAds)     → açılır
    ├── Pop-under #2 (Monetag)        → açılır
    ├── Pop-under #3 (Clickadu)       → açılır
    └── Video oynatılır

  İkinci tıklama (pause/resume, fullscreen, seek):
    ├── Pop-under #4 (Adcash)         → açılır
    └── Artık tıklama = pop-under yok (kullanıcı deneyimi korunur)

  Toplam: 3-4 pop-under / izleme oturumu
```

### Kapsamlı pop-under ağ karşılaştırması (8 ağ)

```
Ağ           CPM(T1)    CPM(T3)    Ödeme      Min$   Kripto  Streaming  Hacim
─────────────────────────────────────────────────────────────────────────────────
Adsterra     $2.25-5    $0.80-1.5  Haftalık   $5     ✅      ✅ #3      12B/ay
ExoClick     $2-4       $0.5-1.5   Haftalık   $20    ❌      ✅ #4      8B/gün
PopAds       $4-6       $2-4       Günlük     $5     ✅ BTC  ✅         2B/gün
HilltopAds   $2-5       $0.5-1.5   Haftalık   $50    ✅      ✅ #1      —
Monetag      $1-2.5     $0.2-0.8   NET-7      $5     ✅      ✅         —
Clickadu     $1-3.5     $0.3-1.2   NET-7      $10    ✅      ✅         —
Adcash       $1-3       $0.2-1.0   NET-30     $25    ✅      ✅         10B/ay
PopCash      $0.5-2     $0.1-0.5   Günlük     $10    ❌      ✅         —
```

### Detaylı analiz: ExoClick, PopAds, Adsterra

```
EXOCLICK
  Artılar:
    → 8 milyar/gün impression — dünyanın en büyük entertainment ağı
    → 20+ reklam formatı (pop-under, native, video, push, banner)
    → Mükemmel fill rate (boş impression bırakmaz)
    → Haftalık ödeme, $20 min
    → Detaylı hedefleme (OS, tarayıcı, dil, cihaz)
    → Real-time istatistik paneli
  Eksiler:
    → Kripto ödeme YOK (PayPal, Paxum, Payoneer, Wire)
    → OPSEC riski: kimlik doğrulama gerekebilir ödeme için
    → Adult/entertainment odaklı → mainstream reklamveren az
  Verdict: Fill rate kralı ama kripto yokluğu OPSEC için sorun

POPADS
  Artılar:
    → En yüksek CPM'ler: $4-6 (Tier 1), $2-4 (Tier 3)
    → GÜNLÜK ödeme — nakit akışı en hızlı
    → $5 minimum — anında çekim
    → Bitcoin destekli ✅
    → Anında onay, trafik şartı yok
    → 2010'dan beri aktif, köklü
  Eksiler:
    → Agresif redirect şikayetleri (kullanıcı deneyimi kötüleşebilir)
    → Fill rate dalgalanması (bazı günler düşük)
    → Sadece pop formatları (banner/native/video yok)
    → Bazı tarayıcılar PopAds domain'ini engellemeye başladı
  Verdict: En yüksek CPM + günlük BTC ödeme ama kalite dalgalı

ADSTERRA
  Artılar:
    → $2.25-9.60 CPM aralığı (coğrafyaya göre çok yüksek)
    → Gelirin %60'ı popunder'dan — bu formatta uzman
    → Anti-adblock recovery: +%35 ekstra impression ✅
    → Kripto ödeme ✅
    → $5 minimum, haftalık ödeme
    → 12 milyar/ay impression — dev hacim
    → Streaming siteleri kabul → #3 sıralama
    → SmartCPM: otomatik en yüksek teklifi seçer
  Eksiler:
    → İlk $100 için bekleme süresi (ilk ödeme gecikmesi)
    → Q1'de CPM %15 düşüşü (mevsimsellik)
  Verdict: En dengeli seçenek — yüksek CPM + kripto + anti-adblock
```

### Güncellenmiş sıralama (kapsamlı araştırma sonucu)

```
SIRA  AĞ           NEDEN
─────────────────────────────────────────────────────────────────────
#1    Adsterra      En yüksek ortalama CPM ($2.25-9.60), anti-adblock
                    recovery (+%35 impression), kripto ödeme, haftalık,
                    streaming kabul, SmartCPM otomatik optimizasyon.
                    Tek eksi: ilk ödeme gecikmesi.

#2    PopAds        En yüksek Tier 1 CPM ($4-6), günlük BTC ödeme,
                    $5 min. Nakit akışı en hızlı. Ama fill rate
                    dalgalı ve agresif redirect riski var.

#3    HilltopAds    Streaming için #1 sıralama, haftalık kripto ödeme,
                    min trafik yok. Güvenilir ve stabil.

#4    ExoClick      8B/gün hacim — fill rate garantisi. Ama kripto
                    ödeme yok → OPSEC sorunu.

#5    Clickadu      İyi Tier 3 CPM'ler, kripto ödeme, NET-7.

#6    Monetag       Kolay entegrasyon, in-page push'ta güçlü.

#7    Adcash        Çok yönlü ama NET-30 ödeme yavaş.

#8    PopCash       Günlük ödeme ama CPM düşük, kripto yok.
```

### Bizim strateji (güncellenmiş)

```
Embed player'da (Phase 2+):

  İlk Play tıklaması:
    → Adsterra pop-under #1       (en yüksek CPM + anti-adblock)
    → PopAds pop-under #2         (en yüksek Tier 1 CPM)
    → Video başlar

  İkinci tıklama:
    → HilltopAds pop-under #3     (stabil, streaming odaklı)
    → Sonraki tüm tıklamalar: pop-under yok

  Toplam: 3 pop-under / oturum

  + Server-side bumper pre-roll   (adblock-proof, ek katman)
  + Interstitial (Play öncesi)    (Adsterra interstitial formatı)

  Neden bu sıra:
    → Adsterra ilk: anti-adblock recovery sayesinde adblock
      kullananlardan bile impression alıyor (+%35 gelir)
    → PopAds ikinci: en yüksek CPM, günlük BTC ödeme
    → HilltopAds üçüncü: stabil fill rate, streaming uzmanı
    → ExoClick hariç: kripto ödeme yok = OPSEC riski
    → Server-side bumper: rakiplerde genelde yok, bize ekstra avantaj

  Stack gelir tahmini (10K/gün izleyici):
    Adsterra pop-under:   10K × CPM $3   = $30/gün = $900/ay
    PopAds pop-under:     10K × CPM $4   = $40/gün = $1,200/ay
    HilltopAds pop-under: 10K × CPM $2   = $20/gün = $600/ay
    Bumper pre-roll:      10K × CPM $3   = $30/gün = $900/ay
    ──────────────────────────────────────────────────────────
    Toplam pop+bumper:                              ~$3,600/ay
    + interstitial, banner, VPN affiliate           ~$1,500/ay
    ──────────────────────────────────────────────────────────
    TOPLAM:                                         ~$5,100/ay
```
