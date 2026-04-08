# 5 İş Birimi Analizi

## Genel bakış

```
#   İŞ               DURUM           GELİR POTANSİYELİ   ZORLUK   ÖNCELİK
────────────────────────────────────────────────────────────────────────────────
1   Film/Dizi Sitesi  Proje hazır     ★★★★★              ★★★     #1
    (NyumatFlix)      (Phase 1 başla)

2   Embed Servisi     Proje hazır     ★★★★★              ★★★★    #2
    (embed-api)       (Phase 2'de)

3   No-KYC Kart       Plan hazır      ★★★★★              ★★★     #3
    Servisi           (kart.md)

4   SMS Doğrulama     Site canlı      ★★★                ★★      #4
    (getsmsnow.com)   (smspool API)

5   Chess Oyunu       MVP hazır       ★★★ (fork ile)     ★★      #5
    (Lichess fork)    Fork+rebrand+WebRTC
```

---

## 1. Film/Dizi Sitesi (NyumatFlix)

### Ne

TMDB kataloglu film/dizi sitesi. Kullanıcı poster tıklar, embed player'da izler.
Phase 1'de upstream embed (vidsrc, 2embed), Phase 2'de kendi embed servisi.

### Mevcut durum

```
✅ NyumatFlix projesi hazır (Next.js 15 + Tailwind + shadcn/ui)
✅ OPSEC headers ekli (middleware.ts, next.config.mjs)
✅ Branding konfigüre edilebilir (.env)
✅ Embed servisi sunucu olarak ekli (server-store.ts)
✅ Reklam slot'ları hazır (ad-slots.tsx)
✅ Docker + docker-compose hazır
✅ .env.example tüm değişkenlerle hazır
```

### Gelir modeli

```
Phase 1 (aggregator):
  Pop-under (Adsterra) + banner (Adcash) + VPN affiliate (NordVPN)
  5K/gün = ~$772/ay

Phase 2 (kendi player):
  + server-side bumper (adblock-proof) + interstitial
  10K/gün = ~$4,194/ay

Phase 3 (tam embed):
  + PPD embed + VIP üyelik + referral
  25K/gün = ~$17,500/ay
```

### En iyi API/servis seçimi

```
Video kaynağı:    VidSrc.cc, 2Embed, SuperEmbed (Phase 1, ücretsiz)
CDN:              Cloudflare edge cache (fake ext, ücretsiz)
Depolama:         Telegram (sınırsız, ücretsiz)
Reklam:           Adsterra (#1) + PopAds (#2) + HilltopAds (#3)
Ödeme:            NOWPayments (kripto VIP abonelik)
Analytics:        Umami (self-hosted, ücretsiz)
```

### Öneri

```
HEMEN BAŞLA. En düşük maliyet, en hızlı gelir.
Phase 1 için gereken: domain ($5) + VPS ($5/ay) + TMDB API key (ücretsiz).
İlk hafta canlıya alınabilir.
```

---

## 2. Embed Servisi (embed-api)

### Ne

VOE/Filemoon gibi kamu embed servisi. Başka siteler senin embed linkini kullanır.
Server-side reklam enjeksiyonu ile adblock-proof gelir.

### Mevcut durum

```
✅ Fastify projesi hazır (src/server.ts)
✅ API routes (sources, resolve, health)
✅ Embed player HTML (hls.js + Plyr)
✅ HMAC signed URLs + fake extensions
✅ Fingerprint + anti-debug koruması
✅ Provider fallback (VidSrc, 2Embed, SuperEmbed, AutoEmbed)
✅ OPSEC headers (Server: nginx, Referrer-Policy, vb.)
✅ Landing page (primesrc tarzı)
✅ Dockerfile + docker-compose
```

### Gelir modeli

```
Phase 2'de aktif olur (film sitesi Phase 1'den sonra):
  Server-side bumper pre-roll + mid-roll
  Pop-under (embed sayfasında)
  PPD: başka siteler embed'ini kullanır → sen reklam gösterirsin

  10 site × 1K/gün trafik = 10K izleme/gün
  RPM $0.25 = $2,500/ay (sıfır ek maliyet, CF cache'ten)
```

### En iyi API/servis seçimi

```
HLS remux:        ffmpeg -c copy (remux, encoding yok)
Player:           hls.js + Plyr (ücretsiz, open-source)
CDN:              Cloudflare edge cache (fake .jpg/.woff2 uzantıları)
Depolama:         Telegram MTProto API (sınırsız, ücretsiz)
VPS cache:        NVMe 80 GB LRU cache
Reklam:           Server-side bumper (kendi SSAI sistemi)
Koruma:           HMAC-SHA256 signed URLs + Cloudflare Turnstile
```

### Öneri

```
Film sitesi Phase 1'den gelir gelmeye başlayınca (5K/gün trafik)
Phase 2'ye geçiş yaparak embed servisi aktifleştir.
Kendi player'dan oynayan filmler → server-side bumper → adblock-proof gelir.
Film sitesinden bağımsız olarak başka sitelere de embed sat.
```

---

## 3. No-KYC Kart Servisi

### Ne

nokyc.cards benzeri anonim kripto sanal kart servisi. Kullanıcı kripto ile ödeyip
anında Visa sanal kart alır. Online ve offline (Apple/Google Pay) kullanım.

### Mevcut durum

```
✅ Kapsamlı plan hazır (kart.md)
✅ İssuer analizi tamamlandı (Wallester, Sunrate, Wanttopay)
✅ Gelir modeli ve fiyatlandırma belirli
✅ Teknik mimari çizildi
✅ DB şeması hazır
⬜ Kod yazılmadı (henüz)

Fork seçeneği: Visacardpay (GitHub: Doki12154/Visacardpay)
  → Kripto kart dağıtım platformu (THPAY/WildCard benzeri)
  → Visa/MC sanal+fiziksel kart yönetimi
  → USDT otomatik yükleme
  → 50+ kripto, 20+ fiat para birimi
  → Sınırsız seviye acente/bayi sistemi
  → KYC kapatılabilir ✅
  → Apple Pay / Google Pay desteği
  → API (3. parti entegrasyon)
  → Lisans: Apache 2.0 (ticari kullanım serbest)

  FAKAT önemli farklar (Lichess fork'undan farklı):
  → ThinkPHP 6.0 + PHP 8.0 (bizim stack DEĞİL, biz Node.js/TS)
  → 4 yıldız, 0 fork — çok yeni, test edilmemiş
  → Kart üretimi yine harici API gerektirir (Wanttopay/Wallester)
  → Açık kaynak proje Visa lisansı veremez

  Sonuç: Dashboard + acente sistemi olarak FAYDALI
         ama kart üretimi için yine API lazım
```

### Gelir modeli

```
Nexus (online): $3 satış, $0 maliyet = $3 kâr (%100)
Omni (offline):  $22 satış, $15 maliyet = $7 kâr (%47)
+ top-up spread: %3-5 her yüklemede
+ aylık bakım: $6/ay (Omni kartlar)

Ay 1:  100 kart  = ~$650/ay
Ay 6:  2,000 kart = ~$8,600/ay
Ay 12: 10,000 kart = ~$41,000/ay
```

### En iyi API/servis seçimi — SIFIRDAN BAŞLARKEN

```
SORUN: Wallester + Sunrate en iyi marjı verir AMA:
  → Wallester: EU/UK'de kayıtlı şirket gerektirir (KYB)
  → Sunrate: enterprise odaklı, şirket + minimum hacim gerekir
  → Her ikisi de sıfırdan başlayan birine uygun DEĞİL

ÇÖZÜM: Wanttopay ile başla

  Wanttopay:
    ✅ Telegram bot ile kayıt (isim + email)
    ✅ Şirket gerekmez
    ✅ API mevcut (white-label kart üretimi)
    ✅ Kripto native (USDT, BTC, ETH, TON, BNB)
    ✅ Trustpilot 4.1/5 (213 değerlendirme)
    ✅ Prepaid: $0 maliyet (online-only)
    ✅ Smart: $15 maliyet (Apple Pay + Google Pay)
    → TEK KART ile hem online hem offline yapılabiliyor

  Wanttopay tier'ları:
    Prepaid  $0   → online-only, $1K/ay limit, Apple Pay ❌
    Easy     $10  → online-only, $4K/ay limit, Apple Pay ❌
    Smart    $15  → online + offline, $50K/ay, Apple Pay ✅, Google Pay ✅
    Pro      $35  → tüm özellikler + Samsung Pay

  Bizim strateji:
    Nexus = Wanttopay Prepaid ($0)  → satış $3  → %100 marj
    Omni  = Wanttopay Smart ($15)   → satış $22 → %47 marj

  Büyüme yolu:
    Wanttopay (şimdi) → offshore şirket kur (gelir gelince)
    → Wallester + Sunrate'e geç (marj %88'e çıkar)
```

### Öneri

```
Film sitesinden sonra 2. öncelik. Wanttopay API entegrasyonu 2-3 hafta.
Film sitesi kullanıcılarına çapraz satış: "VIP için anonim kartla öde"
```

---

## 4. SMS Doğrulama Servisi (getsmsnow.com)




### Ne

Geçici telefon numarası satma servisi. Kullanıcı ülke + servis seçer,
numara alır, SMS kodu alır. Online doğrulama (WhatsApp, Telegram, Tinder, vb.)

### Mevcut durum

```
✅ Site canlı (getsmsnow.com)
✅ 120+ ülke, 12+ popüler servis
✅ 10M+ numara havuzu
✅ API erişimi mevcut
✅ Referral/affiliate programı var
✅ Şu an smspool.net API kullanıyor
```

### Gelir modeli

```
Reseller modeli:
  API'den toptan numara al → markup ile sat
  Maliyet: $0.02-0.10/SMS (servis ve ülkeye göre)
  Satış: $0.10-0.50/SMS
  Marj: %50-80

  Ay 1:  500 doğrulama/gün × $0.15 kâr = ~$2,250/ay
  Ay 6:  2,000/gün × $0.15 = ~$9,000/ay
  Ay 12: 5,000/gün × $0.15 = ~$22,500/ay
```

### smspool.net en iyi API mi?

```
HAYIR. smspool.net iyi ama en iyisi değil. Kapsamlı karşılaştırma:

SAĞLAYICI      FİYAT       API KALİTESİ   GÜVENİLİRLİK   STOK      DURUM
────────────────────────────────────────────────────────────────────────────
SMSCode        $0.005+     ★★★★★         ★★★★★          ★★★★     ★ EN İYİ
(smscode.gg)   REST+Bearer  Modern, docs   Oto-refund      200+ ülke Aktif
               şeffaf       mükemmel       her failed SMS   1000+ srv

HeroSMS        $0.01+      ★★★★          ★★★★           ★★★★★    #2
               REST         İyi            500K+/gün yeni   180+ ülke Aktif
                                           numara ekleniyor  700+ srv

5SIM           $0.05+      ★★★★          ★★★★           ★★★★     #3
(5sim.net)     REST         Temiz UI       İyi              Geniş    Aktif

SMSPool        $0.02+      ★★★           ★★★            ★★★      #4
(smspool.net)  REST+key     Orta           Marketplace      Değişken Aktif
                                           model=dalgalı

SMS-Activate   —           ★★★           —               —        ❌ KAPANDI
(sms-activate) Legacy       Eski API       —               —        29 Ara 2025

ÖNEMLİ: SMS-Activate (en büyük sağlayıcı) 29 Aralık 2025'te kapandı.
Bu pazarda boşluk var → fırsat.

ÖNERİ: smspool.net'ten SMSCode'a geç.
  Neden:
  → Otomatik refund (failed SMS = otomatik iade, müşteri memnuniyeti)
  → Modern REST API (Bearer auth, iyi dokümantasyon)
  → Daha düşük fiyatlar ($0.005'ten başlıyor)
  → Daha güvenilir stok (marketplace değil, yönetilen envanter)
  → smspool marketplace modeli = bazı günler stok yok, kalite dalgalı
```

### Öneri

```
Site zaten canlı, gelir üretiyor. İyileştirmeler:
  1. API'yi smspool → SMSCode'a geçir (güvenilirlik + maliyet ↓)
  2. Daha fazla servis/ülke ekle
  3. Film sitesi ile çapraz tanıtım
  4. SEO: "receive SMS online", "temporary phone number" anahtar kelimeler
  5. Telegram bot ekle (OkiCard modeli — direkt Telegram'dan numara al)
```

---

## 5. Chess Oyunu (Play-chess-Now)

### Ne

WebRTC tabanlı gerçek zamanlı görüntülü satranç oyunu. İki oyuncu
video chat yaparak satranç oynar. Firebase Firestore ile oyun senkronizasyonu.

### Mevcut durum

```
✅ Next.js 14 + TypeScript + Tailwind CSS
✅ WebRTC video chat (kamera + mikrofon)
✅ Firebase Firestore (oyun state senkronizasyonu)
✅ chess.js + react-chessboard (hamle doğrulama)
✅ TURN server desteği (ExpressTurn.com)
✅ Oda oluşturma + katılma
✅ Piyon terfi, şah-mat, pat tespiti
✅ Vercel'de canlı demo var
```

### Lichess'i base almalı mıyız?

```
EVET. Lichess'i fork et + rebrand + WebRTC ekle.

Lichess açık kaynak (AGPL-3.0). Fork + deploy + rebrand = birkaç gün.
10 yıllık, 500+ contributor'lı, prod-ready bir satranç sunucusu bedava.

Fork ile ne kazanırsın (sıfırdan yazmaya gerek yok):
  ✅ Matchmaking (rastgele eşleşme, ELO bazlı)
  ✅ ELO rating sistemi
  ✅ Tüm zaman kontrolleri (bullet, blitz, rapid, classical)
  ✅ Puzzle / taktik modu (150,000+ puzzle)
  ✅ Turnuva sistemi (Swiss, Arena)
  ✅ Stockfish analizi (tarayıcıda WASM)
  ✅ Açılış explorer'ı
  ✅ Oyun geçmişi + tekrar izleme
  ✅ Çoklu varyant (Chess960, Crazyhouse, KingOfTheHill, vb.)
  ✅ Çok dilli (80+ dil)
  ✅ Mobil responsive
  ✅ Coach/ders sistemi
  ✅ Takım sistemi
  ✅ Forum / topluluk
  ✅ Anti-cheat sistemi
  → Bunları sıfırdan yazmak: 5-10 YIL
  → Fork etmek: 1 GÜN

Sen ne eklersin:
  ✅ WebRTC video chat (Play-chess-Now'dan al, entegre et)
  ✅ Rebrand (logo, isim, renkler, about sayfası)
  ✅ Reklam alanları (Lichess reklamsız, sen eklersin)
  ✅ Premium üyelik (Lichess'te yok, Chess.com'daki gibi)
  → Benzersiz değer: "Video chat ile canlı satranç" — hiçbir yerde yok


Docker ile deploy (lila-docker):
  git clone https://github.com/lichess-org/lila-docker
  ./lila-docker start
  → 5-10 dakikada çalışır, http://localhost:8080/

Minimum sunucu gereksinimleri:
  → 8-12 GB RAM (build için 12 GB, çalışırken 8 GB yeterli)
  → 64-bit CPU
  → Docker Desktop
  → MongoDB + Redis (Docker Compose'da dahil)

AGPL-3.0 lisans ne demek:
  → Fork'unu açık kaynak yapmak ZORUNDASIN
  → Ama sorun değil: değerin kod değil, platform + WebRTC + topluluk
  → Lichess zaten tamamen açık kaynak, herkes görebilir
  → Senin farkın: video chat + reklam geliri + premium üyelik
```

### Gelir modeli (Lichess fork ile)

```
Lichess fork = Lichess'in TÜM özellikleri + reklam + premium.
Lichess kendisi reklamsız ve bağış modeliyle çalışıyor.
Sen ise reklam + premium ile monetize edeceksin (Chess.com modeli).

Gelir kaynakları:
  → Reklam: pop-under + banner (Adsterra, oyun arası/oyun sonu)
  → Premium üyelik: $4.99/ay
    - Reklamsız deneyim
    - Sınırsız puzzle
    - Gelişmiş analiz (daha derin Stockfish)
    - Video chat önceliği (daha iyi TURN sunucu)
    - Özel turnuvalar
  → Turnuva giriş ücreti (kripto ile, ödüllü turnuvalar)
  → Koçluk marketplace (komisyon: %15-20)

Lichess fork avantajı:
  → Lichess kullanıcıları reklam görmez ama SENİN siten gösterir
  → Chess.com $100M+/yıl gelir üretiyor — aynı model, farklı marka
  → Video chat = fark yaratıcı özellik (Chess.com'da bile yok)

Gelir tahmini (fork ile, daha gerçekçi):
  1K/gün:   reklam $100 + premium 20×$5 = $200/ay
  10K/gün:  reklam $1,000 + premium 200×$5 = $2,000/ay
  50K/gün:  reklam $5,000 + premium 1,000×$5 = $10,000/ay
```

### Uygulama planı

```
ADIM 1: Fork + deploy (Gün 1-2)
  git clone https://github.com/lichess-org/lila-docker
  ./lila-docker start
  → localhost:8080'de Lichess çalışıyor

ADIM 2: Rebrand (Gün 2-5)
  → Site adı, logo, favicon değiştir
  → Renk şeması değiştir (CSS/Sass)
  → About/Terms/Privacy sayfaları yeniden yaz
  → Footer'daki Lichess referanslarını güncelle
  → Kendi domain'e bağla

ADIM 3: WebRTC video chat ekle (Gün 5-14)
  → Play-chess-Now projesindeki WebRTC kodunu al:
    - hooks/useWebRTC.ts
    - components/VideoStream.tsx
    - components/ConnectionStatus.tsx
  → Lichess'in oyun sayfasına entegre et
  → TURN sunucu yapılandırması (Metered.ca veya kendi)
  → "Video ile oyna" toggle butonu ekle

ADIM 4: Monetizasyon (Gün 10-14)
  → Reklam alanları ekle (oyun arası banner, lobby pop-under)
  → Premium üyelik sistemi (Lichess Patron'u genişlet)
  → Kripto ödeme (NOWPayments)

ADIM 5: Deploy (Gün 14-18)
  → AlexHost VPS (12 GB RAM, ~€15-20/ay)
  → Docker Compose ile deploy
  → Cloudflare arkasına al
  → Domain: Njalla ile anonim kayıt

GEREKSİNİMLER:
  VPS: 12 GB RAM, 4 vCPU (~€15-20/ay)
  Domain: Njalla (~$15/yıl)
  TURN sunucu: Metered.ca free tier veya kendi (coturn)
  Toplam: ~€20-25/ay
```

### Öneri

```
Lichess fork ile proje ÖNCELİK YÜKSELIR.
Sıfırdan yazmak → düşük öncelik (gelir potansiyeli düşük)
Fork + rebrand → orta öncelik (gelir potansiyeli artar, efor düşük)

Benzersiz değer: dünyanın ilk "video chat'li satranç platformu"
  → Lichess'te yok
  → Chess.com'da yok
  → Niş ama viral potansiyeli var (sosyal medyada paylaşılabilir)
  → Twitch/YouTube satranç yayıncıları ilgi gösterebilir
```

---

## Öncelik sıralaması ve yol haritası

```
ÖNCELİK 1: Film Sitesi (NyumatFlix)
  → Hafta 1-2: Domain + VPS + Cloudflare + deploy
  → Hafta 2-3: Reklam entegrasyonu (Adsterra pop-under + NordVPN)
  → Ay 1: İlk gelir ($150+/ay)
  → Neden #1: En düşük maliyet, en hızlı gelir, diğer işlerin temeli

ÖNCELİK 2: Embed Servisi (embed-api)
  → Ay 2-3: Film sitesi 5K/gün trafiğe ulaşınca Phase 2'ye geç
  → Kendi player + server-side bumper
  → Film sitesinden bağımsız embed satışı başlat
  → Neden #2: Film sitesiyle birlikte çalışır, adblock-proof gelir

ÖNCELİK 3: No-KYC Kart Servisi
  → Ay 2-3: Wanttopay API entegrasyonu (2-3 hafta geliştirme)
  → Film sitesi kullanıcılarına çapraz satış
  → Neden #3: Yüksek marj, ekosistem sinerjisi, ama ayrı geliştirme gerekir

ÖNCELİK 4: SMS Servisi (getsmsnow.com)
  → Zaten canlı, gelir üretiyor
  → API'yi SMSCode'a geçir
  → SEO ve pazarlama ile büyüt
  → Neden #4: Zaten çalışıyor, sadece iyileştirme gerekir

ÖNCELİK 5: Chess Oyunu (Lichess fork)
  → Hafta 3-4: Lichess fork + Docker deploy + rebrand
  → Hafta 4-5: WebRTC video chat entegre et (Play-chess-Now'dan)
  → Ay 2: Reklam + premium üyelik ekle
  → Neden #5: Efor düşük (fork), benzersiz (video chat), viral potansiyel
```

---

## Ekosistem sinerjisi

```
  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │ Film Sitesi  │◄──►│ Embed Servis │◄──►│ Kart Servisi │
  │ (#1)         │    │ (#2)         │    │ (#3)         │
  └──────┬───────┘    └──────────────┘    └──────┬───────┘
         │                                       │
         │         ┌──────────────┐               │
         ├────────►│ SMS Servisi  │◄──────────────┤
         │         │ (#4)         │               │
         │         └──────────────┘               │
         │                                        │
         │         ┌──────────────┐               │
         └────────►│ Chess Oyunu  │               │
                   │ (#5)         │               │
                   └──────────────┘

  Çapraz satış akışları:
    Film → Kart:   "VIP ödeme için anonim kart al"
    Film → SMS:    "Hesap doğrulama için numara al"
    Kart → Film:   "Reklamsız izle, kartla öde"
    SMS → Film:    Ana sayfada film sitesi tanıtımı
    Embed → Kart:  "Reklam gelirini anonim karta çek"
    Chess → Film:  "Oyun arası film izle" (düşük sinerji)

  Ortak altyapı:
    → Tüm projeler: Next.js + TypeScript + Tailwind
    → Tüm projeler: Cloudflare CDN + AlexHost VPS
    → Tüm projeler: Kripto ödeme (NOWPayments)
    → Tüm projeler: Anonim domain (Njalla)
    → Tüm projeler: Telegram destek
```

---

## Toplam gelir projeksiyonu

```
                  Ay 1      Ay 3       Ay 6        Ay 12
                  ─────     ─────      ──────      ──────
Film Sitesi       $154      $772       $4,194      $17,500
Embed Servisi     —         —          $2,500      $7,500
Kart Servisi      —         $650       $8,600      $41,000
SMS Servisi       $300      $2,250     $9,000      $22,500
Chess Oyunu       —         $200       $2,000      $10,000
──────────────────────────────────────────────────────────
TOPLAM            $454      $3,872     $26,294     $98,500

Toplam maliyet:   $15/ay    $70/ay     $175/ay     $325/ay

NOT: Kart servisi en yüksek potansiyele sahip ama
     en geç başlıyor (API entegrasyonu gerekir).
     Film sitesi en hızlı gelir getirir.
     Chess fork'u düşük eforla orta gelir potansiyeli taşıyor.
```
