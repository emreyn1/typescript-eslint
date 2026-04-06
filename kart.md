# No-KYC Sanal Kart Servisi — Kapsamlı Plan

## Pazar ve iş modeli

```
Hedef kitle:
  → Kripto kullanıcıları (fiat harcama ihtiyacı)
  → Privacy-odaklı kullanıcılar (VPN, hosting, domain ödemeleri)
  → Freelancer / dijital göçebeler (uluslararası ödeme)
  → Reklam yöneticileri (Google Ads, Meta Ads ayrı kart ihtiyacı)
  → Abonelik yönetimi (Spotify, ChatGPT, Adobe, Booking)
  → Sanction altındaki ülke vatandaşları (Rusya, İran, vb.)

Pazar büyüklüğü:
  → Kripto kart işlem hacmi: 2025'te $18B → 2030'da $42B+
  → No-KYC segment: toplam pazarın ~%15-20'si (~$3B+)
  → Rakip sayısı az, talep yüksek, marjlar yüksek
```

---

## nokyc.cards nasıl çalışıyor (reverse-engineered)

```
BIN check sonuçları (bincheck.list):

  NEXUS kartları  → Wallester (Estonia, EU lisanslı EMI)
  OMNI kartları   → Sunrate Solutions Limited (Hong Kong)

nokyc.cards kendisi kart üretmiyor. Reseller/white-label olarak
Wallester ve Sunrate'in API'lerini kullanıyor:

  Kullanıcı → nokyc.cards → kripto ödeme → Wallester/Sunrate API
                                          → kart oluştur → kullanıcıya ver

  nokyc.cards'ın yaptığı:
    ✓ Web sitesi + dashboard
    ✓ Kripto ödeme kabul (BTC, ETH, USDT, XMR, SOL)
    ✓ Markup koyarak satış ($2.50/kart + top-up spread)
    ✓ Müşteri desteği (Telegram)

  nokyc.cards'ın YAPMADIĞI:
    ✗ Kart üretimi (Wallester/Sunrate yapıyor)
    ✗ Visa/MC ağına bağlanma (BIN sponsor yapıyor)
    ✗ PCI DSS compliance (issuer yapıyor)
    ✗ Settlement/clearing (issuer yapıyor)
```

---

## Tek kart mı, iki kart mı?

```
SORU: Tek kartta hem online hem offline (Apple/Google Pay) olabilir mi?

CEVAP: Şu an reseller olarak İKİ KART modeli daha gerçekçi.

Neden tek kart zor:
  → Online-only BIN'ler: ucuz, yüksek limit, hızlı issuance
  → Offline (tokenization) BIN'ler: daha pahalı, daha fazla compliance
  → Wallester online'da güçlü ama offline tokenization sınırlı
  → Sunrate offline'da güçlü ama online-only'de Wallester kadar ucuz değil
  → Visa/MC kuralları: Apple Pay tokenization için issuer'ın ek
    sertifikasyon alması gerekir (her issuer'da yok)

Tek kart ne zaman mümkün:
  → Marqeta (ABD) veya Stitch (Güney Afrika) ile — ikisinde de
    online + offline + Apple/Google Pay tek entegrasyonda
  → AMA: daha pahalı, kurumsal süreç, minimum hacim beklentisi
  → Ölçeklenince (10K+ kart) geçiş yapılabilir

BİZİM STRATEJİ: nokyc.cards gibi 2 kart ile başla
  → NEXUS (online) = Wallester  → ucuz, hızlı, yüksek marj
  → OMNI (online + offline)     = Sunrate → Apple/Google Pay destekli
  → Hacim büyüyünce → Marqeta ile tek karta geç
```

---

## Neden Wallester + Sunrate (ve neden Marqeta değil)

```
nokyc.cards dahil bu segment neden Wallester + Sunrate kullanıyor:

                    Wallester        Sunrate          Marqeta
                    (Estonia)        (Hong Kong)      (ABD)
────────────────────────────────────────────────────────────────
Başlangıç maliyeti  Ücretsiz         Düşük           Yüksek
                    (300 kart free)                   (setup fee +
                                                      min commit)

Kart başı maliyet   €0.10-0.35       Düşük-orta      Pay-as-you-go
                                                      (daha pahalı)

Kar marjı           ★★★★★           ★★★★            ★★☆
                    Çok yüksek       Yüksek           Orta
                    (%50-100 markup) (%40-70)         (%20-40)

Onboarding hızı     Hızlı            Hızlı           Yavaş
                    (günler)         (1-2 hafta)      (haftalar-aylar)

Online performans   ★★★★★           ★★★★            ★★★★★
Apple/Google Pay    ★★★             ★★★★★           ★★★★★
No-KYC esnekliği    ★★★★            ★★★★★           ★★★
API kalitesi        ★★★★            ★★★             ★★★★★
Ölçeklenebilirlik   ★★★             ★★★             ★★★★★

SONUÇ:
  Başlangıç (0-10K kart): Wallester + Sunrate → maksimum kar marjı
  Büyüme (10K+ kart):     Marqeta'ya geçiş → profesyonel altyapı

  nokyc.cards hâlâ Wallester + Sunrate çünkü:
    1. Maliyet düşük → satış fiyatının %50-100'ü kâr
    2. Launch hızlı → haftalar içinde canlıya alınır
    3. No-KYC akışı kolay → sen KYB yap, kullanıcıya KYC yansımasın
    4. "Yeterince iyi" — bu segment için Marqeta overkill
```

---

## Tüm issuer seçenekleri (sıralı)

```
SIRA  ISSUER           KONUM      KAR MARJI  ONLINE  OFFLİNE  NO-KYC  NOTES
─────────────────────────────────────────────────────────────────────────────
#1    Wallester        Estonia    ★★★★★     ★★★★★  ★★★     ★★★★   300 kart ücretsiz,
                                                                      en düşük maliyet,
                                                                      white-label güçlü

#2    Sunrate          Hong Kong  ★★★★      ★★★★   ★★★★★  ★★★★★  Google/Apple Pay
                                                                      en iyi, fiziksel
                                                                      hizmetler için ideal

#3    Marqeta          ABD        ★★★       ★★★★★  ★★★★★  ★★★    En profesyonel,
                                                                      ölçek için en iyi,
                                                                      başlangıçta pahalı

#4    Stitch           G.Afrika   ★★★★      ★★★★   ★★★★   ★★★★   Unified platform,
                                                                      card+wallet+payment
                                                                      tek entegrasyon

#5    Intergiro        EU         ★★★★      ★★★★   ★★★    ★★★★   Wallester alternatifi,
      (ConnectPay)                                                    EU regulated

#6    Paymentology     Global     ★★★       ★★★★   ★★★★   ★★★    Global coverage,
                                                                      real-time processing

#7    Wanttopay        —          ★★★★      ★★★★   ★★     ★★★★★  En kolay API,
                                                                      reseller odaklı,
                                                                      kripto native

Diğer no-KYC odaklı (reseller değil, direkt satış):
  → Bing Card, Ezzocard, Digitap, Zypto, Laso Finance
  → Bunlar kendi satışını yapıyor, white-label/reseller programı yok
  → Rakip olarak not al ama partner olarak kullanma
```

---

## Rakip analizi

```
Servis         Kart ücreti  Top-up        KYC    Issuer           Özellikler
──────────────────────────────────────────────────────────────────────────────────
nokyc.cards    $2.50        BTC,ETH,USDT  Yok    Wallester +      Nexus (online)
(Bingcard)                  SOL,XMR              Sunrate          Omni (offline)
                                                                   3DS, Apple Pay

OkiCard        ~$3          USDT          Yok    Bilinmiyor       Telegram bot,
                                                                   60 sn'de hazır

Starpay        %0.2 akt.    SOL,USDT      Yok    Bilinmiyor       Solana tabanlı
               %2.5 top-up                                         2-5 dk'da hazır

Veil Cards     $3-5         Kripto        Yok    Bilinmiyor       Merchant locking
                                                                   fiziksel kart var

Spendge        $2-4         USDT,USDC     Yok    Bilinmiyor       17K+ kullanıcı
                                                                   300K+ kart

Halocard       $12/ay       Kripto+fiat   Var    US-based         Sınırsız harcama
                                                                   KYC zorunlu
```

---

## Yasal çerçeve: KYC olmadan kart nasıl verilebilir

```
EU AMLD5 (Anti-Money Laundering Directive 5) muafiyeti:

  Aşağıdaki TÜMÜ sağlanırsa KYC zorunluluğu KALKAR:
  ┌──────────────────────────────────────────────────────────┐
  │ 1. Maksimum bakiye:           ≤ €150                     │
  │ 2. Aylık işlem limiti:        ≤ €150                     │
  │ 3. Nakit çekim limiti:        ≤ €50 / işlem              │
  │ 4. Uzaktan ödeme limiti:      ≤ €50 / işlem              │
  │ 5. Sadece mal/hizmet alımı için kullanılabilir            │
  │ 6. Anonim e-para ile fonlanamaz (kripto → fiat dönüşüm   │
  │    sırasında AML taraması BIN sponsor tarafından yapılır) │
  │ 7. İhraççı şüpheli işlemleri izlemeli                    │
  └──────────────────────────────────────────────────────────┘

  Bu muafiyet sayesinde:
    → Email + şifre ile kayıt yeterli
    → Kimlik belgesi, adres, telefon doğrulama GEREKMİYOR
    → Kart anında oluşturulabilir
    → Yasal ve uyumlu (EU genelinde geçerli)

  Daha yüksek limitler için (>€150):
    → Basitleştirilmiş KYC (simplified due diligence) uygulanır
    → Sadece isim + doğum tarihi + ülke yeterli (belge yok)
    → €250'ya kadar çıkılabilir (bazı jurisdiksiyonlarda)

  Tam KYC gereken eşik:
    → €250+ bakiye veya aylık hacim
    → Kimlik belgesi + adres kanıtı + selfie gerekir
```

---

## Reseller modeli: Wallester + Sunrate

### Nasıl çalışır

```
  SEN                          WALLESTER / SUNRATE        VİSA / MC AĞI
  (frontend + müşteri)         (kart issuer)              (ödeme ağı)
  ─────────────────────        ────────────────           ─────────────
  Kullanıcı kayıt (email)      ↓                          ↓
  Kripto ödeme al        →     Kart oluştur API   →       Visa/MC ağına bağla
  Dashboard göster       ←     Kart bilgileri     ←       İşlem onay/red
  Destek ver (Telegram)        Settlement/clearing         Global POS/online

  Sen ne yaparsın:
    → Web sitesi + dashboard (frontend)
    → Kripto ödeme kabul (on-ramp: NOWPayments)
    → Müşteri desteği (Telegram)
    → Fiyatlandırma ve markup belirleme
    → KYB (Know Your Business) bir kez yap → son kullanıcıya KYC yansımaz

  Wallester / Sunrate ne yapar:
    → Kart oluşturma / iptal / dondurma
    → 3D Secure doğrulama
    → İşlem yetkilendirme ve clearing
    → PCI DSS compliance
    → Apple Pay / Google Pay tokenizasyon (Sunrate)
    → BIN sponsor ilişkisi
```

### Wallester + Sunrate başlangıç planı

```
ADIM 1: Wallester partner hesabı aç (Gün 1-5)
  → wallester.com → Business / Partner programı başvurusu
  → KYB (iş doğrulama) tamamla
  → API key ve sandbox erişimi al
  → 300 virtual kart ücretsiz (başlangıç paketi)
  → White-label kart programı konfigüre et
  → Test: sandbox'ta kart oluştur, işlem simüle et

ADIM 2: Sunrate partner hesabı aç (Gün 3-10, paralel)
  → sunrate.com → Commercial Card / Partnership başvurusu
  → KYB tamamla (Hong Kong üzerinden)
  → API erişimi ve dokümantasyon al
  → Google Pay / Apple Pay tokenization test et
  → Offline POS işlem testi

ADIM 3: Web sitesi oluştur (Gün 5-15)
  → Next.js + Tailwind + shadcn/ui (NyumatFlix ile aynı stack)
  → Sayfalar:
    /               → Landing page: "No ID. No KYC. Instant Delivery."
    /cards           → 2 kart tipi karşılaştırma (Nexus vs Omni)
    /register        → Sadece email + şifre (KYC yok)
    /login           → Giriş
    /dashboard       → Kartlarım, bakiye, işlem geçmişi
    /dashboard/topup → Kripto ile yükleme
    /dashboard/new   → Yeni kart oluştur (tip seç → ödeme → anında kart)

ADIM 4: Kripto ödeme entegrasyonu (Gün 12-16)
  → NOWPayments API (embed serviste de kullandığımız)
  → Desteklenen coinler: BTC, ETH, USDT, XMR, SOL, LTC
  → Akış:
    Kullanıcı Nexus kart istiyor ($50 bakiyeli)
    → Fiyat: $50 + $3 aktivasyon + %3 spread = $54.50
    → NOWPayments invoice oluştur ($54.50)
    → Kullanıcı kripto gönderir → webhook tetiklenir
    → Wallester API: kart oluştur → kart bilgileri dashboard'da

ADIM 5: Kart API entegrasyonu (Gün 14-20)
  → NEXUS kartlar: Wallester API
    POST /cards → { type: "virtual", currency: "EUR", limit: 150 }
    → Yanıt: kart no, CVV, exp date, BIN (Estonia)

  → OMNI kartlar: Sunrate API
    POST /cards → { type: "virtual", currency: "USD", tokenization: true }
    → Yanıt: kart no, CVV, exp date, BIN (Hong Kong)
    → + Apple Pay / Google Pay provisioning token

ADIM 6: Lansman (Gün 20-25)
  → Domain: Njalla ile anonim kayıt
  → Hosting: Cloudflare Pages (frontend) + AlexHost (backend API)
  → Telegram destek kanalı + bot aç
  → BitcoinTalk, Reddit, Telegram gruplarında tanıtım
  → İlk 100 kullanıcıya ücretsiz Nexus kart kampanyası
```

---

## Kart tipleri

```
NEXUS — Online-only (Wallester, Estonia)
────────────────────────────────────────
  Issuer:       Wallester (EU lisanslı EMI, Estonia)
  Ağ:           Visa
  Tip:          Sanal Prepaid
  Kullanım:     Sadece online ödemeler
  Hedef:        Dijital hizmetler, abonelikler, yazılım, reklam hesapları
  Örnekler:     Spotify, ChatGPT, Adobe, Google Ads, Meta Ads,
                VPN, hosting, domain, Steam, Netflix
  3D Secure:    ✅
  Apple Pay:    ❌ (online-only BIN, tokenization yok)
  Google Pay:   ❌
  NFC/POS:      ❌
  KYC:          Yok (AMLD5 ≤€150 muafiyeti)
  Limit:        €150 bakiye / €150 aylık (no-KYC)
                €500+ simplified KYC ile
  Fiyat:        $3 aktivasyon (maliyet: €0.10-0.35)
  Aylık:        $0 (düşük limitli)
  Top-up:       Kripto (BTC, ETH, USDT, XMR, SOL)
  Avantaj:      En ucuz, en hızlı, en yüksek marj
  Marj:         $3 satış - $0.35 maliyet = $2.65 kâr/kart (%88)


OMNI — Online + Offline (Sunrate, Hong Kong)
─────────────────────────────────────────────
  Issuer:       Sunrate Solutions Limited (Hong Kong)
  Ağ:           Visa / Mastercard
  Tip:          Sanal Prepaid (tokenization destekli)
  Kullanım:     Online + offline (fiziksel mağaza, POS)
  Hedef:        Fiziksel hizmetler, seyahat, alışveriş
  Örnekler:     Airbnb, Booking.com, Amazon, mağazalar,
                restoranlar, süpermarketler (Apple/Google Pay ile)
  3D Secure:    ✅
  Apple Pay:    ✅ (NFC temassız ödeme)
  Google Pay:   ✅ (NFC temassız ödeme)
  NFC/POS:      ✅ (telefondan temassız ödeme)
  KYC:          Yok (düşük limitlerde)
  Limit:        $150-500 (KYC seviyesine göre)
  Fiyat:        $8 aktivasyon (maliyet daha yüksek, offline BIN)
  Aylık:        $2/ay
  Top-up:       Kripto (BTC, ETH, USDT, XMR, SOL)
  Avantaj:      Her yerde kullanılabilir (online + mağaza + POS)
  Marj:         $8 satış - $2-3 maliyet = $5-6 kâr/kart (%62-75)


KARŞILAŞTIRMA:
  ┌──────────────────────────────────────────────────────┐
  │ Özellik           NEXUS            OMNI              │
  │ ──────────────────────────────────────────────────── │
  │ Online ödeme      ✅               ✅                │
  │ Apple/Google Pay  ❌               ✅                │
  │ Mağaza/POS        ❌               ✅                │
  │ Fiyat             $3 (ucuz)        $8 (daha pahalı)  │
  │ Marj              %88              %62-75            │
  │ Issuer            Wallester (EU)   Sunrate (HK)      │
  │ En iyi için       Abonelik,        Seyahat,          │
  │                   dijital hizmet   fiziksel alışveriş │
  └──────────────────────────────────────────────────────┘

  Kullanıcıya mesaj:
    "Online için Nexus — ucuz ve hızlı"
    "Her yerde kullanmak için Omni — Apple Pay destekli"
```

---

## Gelir modeli

```
GELİR KAYNAĞI       AÇIKLAMA                              TAHMİNİ MARJ
─────────────────────────────────────────────────────────────────────────
Kart aktivasyonu     $3-35 / kart (maliyetin üstüne markup)  %50-80
                     Maliyet: $0-15 (API sağlayıcıya)
                     Satış: $3-35 (kullanıcıya)
                     → Kart başı net: $1.50 - $20

Top-up spread        Kripto→fiat dönüşüm farkı               %3-5
                     NOWPayments fiat alır, sana kripto verir
                     Sen kullanıcıya %3-5 markup koyarsın
                     → $100 yükleme = $3-5 komisyon

Aylık bakım ücreti   $3-6/ay (Standart ve Premium kartlar)   %100
                     API sağlayıcı aylık ücret alabilir ($0-2)
                     → Kart başı net: $1-6/ay

Interchange payı     İşlem hacminin %0.5-1.5'i               Değişken
                     BIN sponsor interchange alır → sana pay verir
                     → $100K aylık işlem hacmi = $500-1,500/ay

FX ücreti            Farklı para birimi işlemlerinde %1-3     %1-3
                     Kullanıcı EUR kart ile USD ödeme yapar
                     → Otomatik, ek efor gerektirmez

Premium abonelik     VIP özellikler (yüksek limit, öncelik)   %100
                     $10-20/ay

Reklam gelirleri     Landing page'de pop-under + banner       Ek gelir
                     (reklam.md'deki strateji ile aynı)
```

### Gelir projeksiyonu

```
                     Ay 1        Ay 3         Ay 6          Ay 12
                     ─────       ─────        ──────        ──────
Yeni Nexus/ay        80          250          600           2,000
Yeni Omni/ay         20          80           200           1,000
Aktif toplam kart    100         500          2,000         10,000

Nexus aktivasyon     $240        $750         $1,800        $6,000
Omni aktivasyon      $160        $640         $1,600        $8,000
Top-up komisyon      $150        $750         $3,000        $15,000
Aylık bakım (Omni)   $20         $160         $600          $4,000
Interchange payı     $50         $250         $1,000        $5,000
FX ücreti            $30         $150         $600          $3,000
─────────────────────────────────────────────────────────────────────
TOPLAM GELİR         $650        $2,700       $8,600        $41,000

Maliyet:
  Wallester API      $0*         $50          $200          $800
  Sunrate API        $40         $160         $400          $2,000
  Hosting+domain     $10         $15          $25           $40
  (* ilk 300 kart ücretsiz)
─────────────────────────────────────────────────────────────────────
NET KAR              $600        $2,475       $7,975        $38,160
```

---

## Teknik mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                        KULLANICI                                 │
│            Web dashboard / Telegram bot                          │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLOUDFLARE (CDN + WAF + DDoS koruması)                         │
│  → Pages: statik frontend (Next.js export)                      │
│  → Workers: API proxy + rate limiting                           │
│  → Turnstile: bot koruması                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND API (VPS — AlexHost / FlokiNET)                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth servisi  │  │ Kart servisi │  │ Ödeme servisi│          │
│  │              │  │              │  │              │          │
│  │ Email+şifre  │  │ Oluştur      │  │ NOWPayments  │          │
│  │ 2FA (TOTP)   │  │ Listele      │  │ webhook      │          │
│  │ Session      │  │ Dondur/İptal │  │ Bakiye       │          │
│  │ API key      │  │ Bilgi göster │  │ Top-up       │          │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘          │
│                           │                  │                   │
│                    ┌──────▼──────────────────▼───────┐          │
│                    │         PostgreSQL DB           │          │
│                    │  users, cards, transactions,    │          │
│                    │  balances, audit_log            │          │
│                    └────────────────────────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │ API calls
              ┌──────────┴──────────┐
              ▼                     ▼
┌──────────────────────┐  ┌──────────────────────┐
│  KART API SAĞLAYICI  │  │  KRİPTO ÖDEME        │
│  (Wanttopay / Buvei) │  │  (NOWPayments)       │
│                      │  │                      │
│  POST /cards/create  │  │  POST /v1/invoice    │
│  GET  /cards/{id}    │  │  Webhook: paid       │
│  POST /cards/freeze  │  │  GET  /v1/status     │
│  GET  /transactions  │  │                      │
│                      │  │  BTC,ETH,USDT,XMR    │
│  → Visa/MC ağı       │  │  SOL,LTC,DOGE        │
└──────────────────────┘  └──────────────────────┘
```

### Tech stack

```
Frontend:
  → Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
  → Cloudflare Pages'te deploy (ücretsiz, global CDN)
  → SSR yok, full static export (OPSEC: sunucu IP gizli)

Backend:
  → Fastify (Node.js) — embed-api ile aynı stack
  → Drizzle ORM + PostgreSQL
  → Redis (session + rate limiting)
  → Docker + Docker Compose

Güvenlik:
  → Cloudflare Turnstile (bot koruması)
  → TOTP 2FA (Google Authenticator)
  → HMAC signed API requests
  → IP rate limiting (Redis)
  → AES-256 ile kart bilgileri şifreleme (DB'de)

OPSEC:
  → Domain: Njalla (anonim)
  → Hosting: AlexHost (Moldova, kripto ödeme)
  → Tüm ödemeler: kripto
  → Destek: Telegram (anonim)
  → Logging: minimal, PII yok
```

---

## Veritabanı şeması

```sql
-- Kullanıcılar
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret   TEXT,
  balance_usd   DECIMAL(10,2) DEFAULT 0,
  tier          TEXT DEFAULT 'basic',  -- basic, standard, premium
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Kartlar
CREATE TABLE cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  provider_card_id TEXT NOT NULL,       -- Wanttopay'daki kart ID
  card_type       TEXT NOT NULL,        -- basic, standard, premium
  last_four       TEXT NOT NULL,        -- 7890
  bin             TEXT NOT NULL,        -- 425678
  currency        TEXT DEFAULT 'USD',
  balance         DECIMAL(10,2) DEFAULT 0,
  status          TEXT DEFAULT 'active', -- active, frozen, expired, cancelled
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- İşlemler
CREATE TABLE transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  card_id     UUID REFERENCES cards(id),
  type        TEXT NOT NULL,    -- topup, purchase, refund, fee
  amount      DECIMAL(10,2) NOT NULL,
  currency    TEXT DEFAULT 'USD',
  merchant    TEXT,
  status      TEXT DEFAULT 'pending', -- pending, completed, failed, reversed
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Kripto ödemeleri
CREATE TABLE crypto_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  provider_id     TEXT NOT NULL,       -- NOWPayments invoice ID
  amount_usd      DECIMAL(10,2) NOT NULL,
  amount_crypto   DECIMAL(18,8),
  crypto_currency TEXT NOT NULL,       -- BTC, ETH, USDT, XMR
  status          TEXT DEFAULT 'waiting', -- waiting, confirming, confirmed, failed
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Fiyatlandırma stratejisi

```
                    MALİYET          SATIŞ FİYATI    NET KAR     MARJ
                    (issuer'a)       (kullanıcıya)
───────────────────────────────────────────────────────────────────────
Nexus kart          €0.10-0.35       $3              $2.65       %88
Omni kart           $2-3             $8              $5-6        %62-75
Top-up spread       %0-1             %3-5 markup     %2-5        —
Aylık bakım (Omni)  $0-1             $2/ay           $1-2/ay     —
FX dönüşüm          %0.5             %2-3            %1.5-2.5    —

Benchmark (rakipler):
  nokyc.cards: Nexus $2.50, Omni fiyat bilinmiyor
  OkiCard: ~$3/kart, %3-5 top-up spread
  Starpay: %0.2 aktivasyon + %2.5 top-up
  Spendge: $2-4/kart

Stratejimiz:
  → Nexus: $3 (nokyc.cards ile eşit, marj çok yüksek)
  → Omni: $8 (Apple Pay premium'u haklı kılar)
  → Top-up: %3 (rakiplerle eşit)
  → İlk Nexus kart ücretsiz kampanyası (kullanıcı çekimi)
  → Wallester'ın 300 ücretsiz kart paketi sayesinde ilk
    300 Nexus kart neredeyse sıfır maliyetli
```

---

## Pazarlama ve kullanıcı kazanımı

```
KANAL 1: Kripto forumları ve topluluklar
  → BitcoinTalk announcement thread
  → Reddit: r/cryptocurrency, r/privacy, r/degoogle
  → Telegram: kripto grupları, privacy grupları
  → Twitter/X: kripto influencer'lar ile anlaşma
  → Maliyet: $0-500/ay

KANAL 2: SEO
  → "no kyc card", "crypto debit card", "anonymous visa card"
  → "buy virtual card with bitcoin", "prepaid card no id"
  → Blog yazıları: "5 Best No-KYC Cards 2026" (kendi siteni #1 koy)
  → Maliyet: $0 (zaman yatırımı)

KANAL 3: Affiliate / referral
  → Kullanıcı referral linki paylaşır → yeni kayıt = $1 bonus
  → %10 top-up komisyonu referral yapana
  → affiliate.md'deki çok katmanlı referral sistemi uyarlanabilir
  → Maliyet: gelirden pay

KANAL 4: Çapraz satış (kendi ekosistemimiz)
  → Film sitesi kullanıcılarına: "VIP ödeme için anonim kart al"
  → Embed servisi müşterilerine: "reklam gelirini anonim karta çek"
  → Maliyet: $0

KANAL 5: Telegram bot
  → @SenınKartBot ile direkt Telegram'dan kart oluşturma
  → OkiCard bunu yapıyor, çok etkili
  → Telegram'da paylaşımı kolay, viral potansiyeli yüksek
```

---

## Faz bazlı lansman planı

```
PHASE 1: MVP — Nexus only (Hafta 1-3, $0 maliyet)
──────────────────────────────────────────────────
  ✓ Wallester partner hesabı + API entegrasyonu
  ✓ Sadece Nexus kart ($3, online-only, no-KYC, ≤€150)
  ✓ Kripto top-up (NOWPayments: BTC, USDT, XMR)
  ✓ Next.js dashboard + Cloudflare Pages
  ✓ AlexHost backend (Fastify API)
  ✓ Telegram destek kanalı
  ✓ İlk 300 kart Wallester ücretsiz → sıfır maliyet ile başla
  → Gelir: kart ücreti ($2.65/kart net) + top-up spread (%3)

PHASE 2: Omni eklenir (Ay 2-3)
────────────────────────────────
  ✓ Sunrate partner hesabı + API entegrasyonu
  ✓ Omni kart eklenir ($8, Apple/Google Pay destekli)
  ✓ Telegram bot (@KartBot) — Telegram'dan direkt kart al
  ✓ Referral sistemi (affiliate.md'den uyarla)
  ✓ Otomatik bakiye/işlem bildirimleri (Telegram)
  ✓ İşlem geçmişi ve raporlama dashboard'u
  → Gelir: + Omni kartlar + aylık bakım + interchange payı

PHASE 3: Büyüme (Ay 4-6)
─────────────────────────
  ✓ Yüksek limitli kartlar (simplified KYC ile €500+)
  ✓ Toplu kart oluşturma (iş/reklam hesapları için)
  ✓ B2B API erişimi (başka siteler senin kartını satsın)
  ✓ Multi-currency desteği (EUR, GBP, TRY)
  ✓ Disposable (tek kullanımlık) kartlar
  → Gelir: + B2B API geliri + premium kart marjı

PHASE 4: Marqeta geçişi (Ay 12+, 10K+ kart)
─────────────────────────────────────────────
  ○ Marqeta ile partner anlaşması
  ○ Tek kart ile hem online hem offline
  ○ Wallester + Sunrate'e bağımlılık azalır
  ○ Daha profesyonel spend control + fraud detection
  ○ Ölçekte maliyet düşer, özellik artar
  → Bu adım sadece 10K+ aktif kart varsa mantıklı
```

---

## Risk ve çözümler

```
RİSK                              ÇÖZÜM
──────────────────────────────────────────────────────────────────────
Wallester hesabı kapatılır        Intergiro veya ConnectPay backup
                                  (EU alternatifi, benzer API)

Sunrate hesabı kapatılır          Paymentology backup (global,
                                  offline destekli)

BIN sponsor AML sorunu yaşar      Düşük limitli kartlara odaklan
                                  (≤€150, AMLD5 muafiyeti içinde kal)

Rakipler fiyat kırar              Hizmet kalitesi ile farklan:
                                  hızlı destek, Telegram bot, çapraz
                                  ekosistem (film sitesi + embed + kart)

Visa/MC no-KYC kartları yasaklar  AMLD5 muafiyeti EU yasasına dayanır,
                                  ≤€150 prepaid kartlar korunuyor.
                                  Fiziksel olmayan, düşük limitli
                                  kartlar kısa/orta vadede güvende.

Chargebackler / fraud             Nexus: €150 limit = düşük risk
                                  Omni: biraz yüksek ama limit var
                                  Otomatik fraud detection kuralları
                                  + Wallester/Sunrate kendi fraud
                                  sistemlerini de çalıştırıyor

OPSEC ihlali                      Domain: Njalla (anonim)
                                  Hosting: AlexHost (kripto ödeme)
                                  Tüm gelirler: kripto cüzdan
                                  İletişim: sadece Telegram
                                  Logging: minimal, PII kaydetme
                                  KYB: offshore şirket ile yap
```

---

## Ekosistem sinerjisi

```
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │  Film Sitesi │     │ Embed Servis│     │ Kart Servisi│
  │ (NyumatFlix) │     │ (embed-api) │     │ (kart.md)   │
  └──────┬───────┘     └──────┬──────┘     └──────┬──────┘
         │                    │                    │
         ├────────────────────┼────────────────────┤
         │           ÇAPRAZ SATIŞ                  │
         ▼                    ▼                    ▼

  Film sitesi kullanıcısı:
    "VIP üyelik iste? Anonim kartla öde → kart.sitemiz.com"

  Embed müşterisi:
    "Reklam gelirini anonim karta çekmek iste? → kart.sitemiz.com"

  Kart kullanıcısı:
    "Film izlemek iste? → film.sitemiz.com (VIP ile reklamsız)"

  3 ürün birbirini besler:
    → Film sitesi trafik getirir → embed gelir üretir
    → Embed geliri → kart servisinde harcanır
    → Kart servisi → VIP film üyeliği satın alır
    → Döngü: her ürün diğerinin müşteri kaynağı
```
