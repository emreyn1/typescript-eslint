# Seçenekler — Ödeme Yöntemleri, Fiat Gateway'ler & Pop-under Reklam Ağları

Bu dosya 4 iş birimi için tüm ödeme ve reklam seçeneklerini tek yerde toplar.

İlişkili dokümanlar:
- `korunma.md` — OPSEC kuralları, reklam ağı OPSEC analizi, para akışı, residential proxy
- `OPSEC-VE-EKLER.md` — Telegram OPSEC, Phase 2 yol haritası, reklam sağlayıcıları, eklenecekler
- `LANSMAN-REHBERI.md` — ENV değerleri, başlatma sırası, Supabase kurulumu

---

## 0. Rakip Analizi — Rakipler Fiat İçin Ne Kullanıyor?

### SMS Siteleri (Rakipler)

| # | Rakip | Fiat Gateway | Kripto Gateway | Apple/Google Pay | PayPal | Not |
|---|-------|-------------|---------------|-----------------|--------|-----|
| 1 | **SMSPool** | **Stripe** (Visa, MC) | XMR, BTC, ETH + 50 coin (Coinbase Commerce) | EVET (Stripe ile) | HAYIR | En gelişmiş: Stripe ile Apple Pay, Google Pay, iDeal, UnionPay, SEPA. ProxySto.re ile nakit bile kabul ediyor. |
| 2 | **SMS-MAN** | **Kart** (Visa/MC — PCI DSS ile), **Advcash**, **Payeer**, **Qiwi** | BTC, USDT + diğerleri (Coinbase Commerce) | EVET (Apple Pay) | HAYIR | UK şirketi. Kart ödemeleri Stripe benzeri PCI DSS uyumlu işlemci ile. Payoneer da var. |
| 3 | **5SIM** | **Kart** (Visa/MC/MIR — şu an çoğu ülkede geçici kapalı), **Perfect Money**, **Payeer** | BTC, ETH, USDT + diğerleri | HAYIR | HAYIR | Rusya merkezli. Kart ödemeleri çoğu ülkede askıya alındı, sadece kripto güvenilir. |
| 4 | **OnlineSim** | **Kart** (Stripe üzerinden), **Banka havale** | BTC, ETH, USDT (kripto ile %1-3 indirim) | HAYIR | HAYIR | Singapur şirketi. Trustpilot'ta sahte ödeme sayfası uyarıları var. |
| 5 | **SMSCode.gg** | **E-cüzdan** (DANA, OVO, ShopeePay, GoPay — Duitku üzerinden) | BTC, ETH, USDT (Heleket üzerinden) | HAYIR | HAYIR | Endonezya odaklı, kart/PayPal YOK. Sadece QRIS + kripto. |

**Sonuç:** SMS sektöründe fiat için **Stripe** açık ara lider. SMSPool en kapsamlı — Stripe ile Visa/MC + Apple Pay + Google Pay + iDeal + SEPA hepsini tek seferde sunuyor. Ama Stripe tam KYC istiyor (şirket, adres, vergi no).

### No-KYC Kart Siteleri (Rakipler)

| # | Rakip | Müşteri Nasıl Para Yatırıyor? | KYC | Apple/Google Pay Desteği | Not |
|---|-------|-------------------------------|-----|-------------------------|-----|
| 1 | **SolvoCard** | Sadece kripto (BTC, ETH, USDT, USDC, XMR, SOL + 16 coin) | SIFIR (email) | EVET (kartı Apple/Google Pay'e ekle) | $25 tek seferlik ücret. Kart ile Apple Pay/Google Pay ile ödeme yapılabilir ama yatırma sadece kripto. |
| 2 | **OkiCard** | Sadece kripto (USDT, USDC) — Telegram bot ile | SIFIR | EVET (Apple/Google Pay) | Telegram üzerinden çalışıyor. "Just-in-Time" model — kripto yatır, anında harca. |
| 3 | **ZeroID** | Sadece kripto (USDT, BTC, ETH) | SIFIR | EVET (Apple/Google Pay) | Visa/MC. Telegram + web. İş ödemesi de kabul ediyor. |
| 4 | **Ezzocard** | Sadece kripto (BTC, ETH, USDT, DOGE, LTC, TRX, SOL, BNB) | SIFIR | HAYIR | Anonim prepaid Visa/MC. $50-1000. Fiat YOK. |
| 5 | **PST.NET** | Kripto (USDT TRC20/ERC20, BTC) + Kart (Visa/MC) + Wire (SWIFT/SEPA/ACH) + E-cüzdan (PayPal, GPay, Wise, Skrill, Payeer) | Düşük-Orta ($500+ için KYC) | Kısmen (bazı kartlar) | Reklam harcamaları odaklı. En geniş yatırma seçenekleri ama $500+ harcama için doküman istiyor. |
| 6 | **Privacy.com** | Banka hesabı veya debit kart (sadece ABD) | YÜKSEK (tam KYC, ABD vatandaşı zorunlu) | HAYIR | Tamamen farklı segment — KYC'li, ABD-only, banka bağlantılı. |

**Sonuç:** No-KYC kart sektöründe rakiplerin **hepsi** müşteriden kripto ile para alıyor. Hiçbiri klasik kart/PayPal ile yatırma kabul etmiyor (PST.NET hariç — ama o KYC istiyor). Bu demek ki:
- Kart satış sitesinde müşterinin kripto ile ödemesi **standart** ve **yeterli**
- Fiat eklemek rakiplerden farklılaştırır ve daha fazla müşteri çeker
- Ama fiat gateway = KYC riski → **Sellix en dengeli seçenek** (email KYC, kripto payout)

### Rakip Analizi Özeti

```
SMS Siteleri:
  Lider çözüm = Stripe (SMSPool, SMS-MAN kullanıyor)
  Stripe = KYC gerektirir → OPSEC uyumsuz
  Sellix/CoinGate fiat = arka planda aynı KYC → OPSEC uyumsuz
  OPSEC çözüm = Şimdilik sadece kripto kabul (NOWPayments, BTCPay Server)
  Fiat test = AllPays.co veya PayRam küçük hacimle dene
  
Kart Siteleri:
  Standart = sadece kripto (SolvoCard, OkiCard, ZeroID, Ezzocard)
  Fiat eklemek = rekabet avantajı (rakipler yapmıyor)
  Ama OPSEC-uyumlu fiat gateway kanıtlanmamış → şimdilik kripto-only
```

---

## 1. Mevcut Durum — Projelerde Şu An Ne Var?

### getsmsnow.com (SMS Sitesi) — 4 gateway entegre

| # | Gateway | Tür | API Route | UI'da Aktif mi? | Durum |
|---|---------|-----|-----------|-----------------|-------|
| 1 | **Cryptomus** | Kripto (BTC, USDT, ETH...) | `/api/cryptomus/create-invoice` + `/webhook` | EVET (dashboard top-up + guest checkout) | Çalışıyor |
| 2 | **NexaPay** | Fiat (kart) | `/api/nexapay/create-payment` + `/webhook` | EVET (dashboard top-up + guest checkout) | Kod var ama güvenilirlik şüpheli |
| 3 | **NOWPayments** | Kripto | `/api/nowpayments/create-invoice` + `/webhook` | Route var, UI'da yok | Yedek olarak duruyor |
| 4 | **Paddle** | Fiat (kart + PayPal) | `/api/paddle/create-transaction` + `/webhook` | Route var, UI'da yok | KYC gerektirir, kullanılmıyor |

**Kullanıcı akışı:**
- **Kayıtlı kullanıcı:** Dashboard → Top Up → Cryptomus veya NexaPay seç → ödeme → bakiye yüklenir → SMS satın al
- **Misafir (guest):** Ülke/servis seç → Cryptomus veya NexaPay seç → ödeme → SMS numarası alır

### kart-site (No-KYC Kart Sitesi) — 1 gateway entegre

| # | Gateway | Tür | API Route | UI'da Aktif mi? |
|---|---------|-----|-----------|-----------------|
| 1 | **NOWPayments** | Kripto (BTC, USDT, ETH...) | `/api/payments/topup` + `/webhook` | EVET (dashboard "Top Up with Crypto" butonu) |

**Fiat yöntemi YOK.** Sadece kripto ile bakiye yükleme → bakiye ile kart satın alma.

### NyumatFlix (Film Sitesi) — Phase 2, ödeme yok

Ödeme yöntemi yok (ücretsiz site, gelir reklamdan gelecek).

### embed-api (Embed Servisi) — Phase 2, ödeme yok

Ödeme yöntemi yok (backend servisi, gelir reklam bumper'lardan gelecek).

---

## 2. Fiat Ödeme Seçenekleri — Tam Karşılaştırma

Kripto dışında müşterilerin **kredi kartı, PayPal, Apple Pay, Google Pay** ile ödeyebilmesi için fiat gateway gerekir.

### Tüm değerlendirilen seçenekler

> **KRİTİK NOT (Nisan 2026):** "No-KYC fiat gateway" alanı çok aldatıcı.
> Sellix, CoinGate gibi servisler **kripto-only** kabul için KYC istemez, ama **fiat**
> (kart, PayPal) aktif etmek istediğinde arkadaki Stripe/PayPal benzeri processor'lar
> KYB/KYC devreye sokuyor. AllPays.co ve PayRam gibi yeni servisler bunu fiat onramp
> yöntemiyle (müşteri kripto satın alıyor, sana USDC geliyor) aşmaya çalışıyor.
> Gerçek anlamda "müşteri kart ile öder, sen sıfır KYC ile kripto alırsın" çözümü
> kanıtlanmış ve güvenilir olarak **henüz mevcut değil**.

| # | Gateway | Fiat Kabul | Kripto Kabul | KYC Seviyesi | Gelen Para Kripto Olarak Ödenir mi? | Min. Payout | Komisyon | Apple/Google Pay | OPSEC Notu |
|---|---------|-----------|-------------|-------------|--------------------------------------|------------|----------|------------------|------------|
| 1 | **Sellix** | Kart, PayPal (⚠️) | BTC, ETH, LTC, USDT, XMR + 25 coin | **KRİPTO:** email (sıfır KYC). **FİAT:** KYB/KYC gerekli (Stripe/PayPal processor) | EVET (kripto tarafı) | $5 | %5 + $0.25 (fiat), %2 (kripto) | HAYIR | **Kripto kabul = mükemmel OPSEC.** Fiat kabul = KYB tetikler → OPSEC bozulur |
| 2 | **CoinGate** | Kart (Visa/MC) (⚠️) | BTC, ETH, LTC + 70 coin | **KRİPTO:** email bazlı. **FİAT/ÇEKIM:** tam KYC zorunlu (MiCA lisansı, kimlik, adres, banka) | EVET | 0.001 BTC | %1 (kripto), %5 (kart) | HAYIR | Kripto kabul = OK. Fiat veya para çekme = tam KYC → OPSEC UYUMSUZ |
| 3 | **AllPays.co** | Kart, PayPal, Apple Pay, Google Pay, Venmo, CashApp, Zelle | HAYIR (sadece fiat kabul → USDC settlement) | **SIFIR** KYB (iddia ediliyor) | EVET — USDC (Polygon) olarak wallet'a | ? | %5.9 (Free), %4.25 ($79/ay), %2.75 ($249/ay) | EVET | **ÇOK YENİ (Mart 2026).** Sıfır kullanıcı yorumu. Trust kanıtlanmamış. En geniş fiat yelpazesi ama risk yüksek. |
| 4 | **PayRam** (Card-to-Crypto) | Kart, Apple Pay, Google Pay, 175+ method | BTC, ETH, USDT, USDC + 20 token | **MERCHANT:** sıfır (self-hosted). **MÜŞTERİ:** ilk alışverişte 1 kez KYC (onramp partneri) | EVET — USDC (Base) | ~$5-10 | PayRam: %0, Onramp: ~%3-5 | EVET | Self-hosted = banulanamaz. Ama müşteri KYC var. Kurucu: WazirX co-founder. |
| 5 | **NOWPayments** | HAYIR (sadece kripto) | 300+ coin | Minimal (email). AML tetiklenirse KYC isteyebilir. | — | ~$2 eşdeğeri | %0.5-1 | HAYIR | Kripto-only, fiat yok. Güvenilir, zaten entegre. |
| 6 | **Cryptomus** | HAYIR (sadece kripto) | BTC, USDT, ETH + 20 coin | Email bazlı. **Para çekmek için tam KYC zorunlu.** | — | Coin bazlı (ör. 0.5 USDT) | %0.4-1 | HAYIR | Kripto kabul = OK. Withdrawal = KYC → dikkat. |
| 7 | **NexaPay** | Kart (Visa/MC) | BTC, USDT | ? | EVET | ? | %1-3 | EVET (iddia) | **SCAM/ÇOK YÜKSEK RİSK.** Trust 1/100. Fake review. Yasal entity yok. KULLANMA. |
| 8 | **BTCPay Server** | HAYIR (self-hosted kripto) | BTC, Lightning, XMR | SIFIR (self-hosted) | — | Yok (direkt wallet) | %0 (sıfır komisyon) | HAYIR | EN OPSEC: kendi sunucunda, sıfır üçüncü taraf. Sadece kripto. |
| 9 | **Paddle** | Kart, PayPal, Apple Pay, Google Pay | HAYIR | YÜKSEK (şirket KYC, vergi doğrulama) | HAYIR — banka'ya fiat | $100 | %5 + $0.50 | EVET | OPSEC UYUMSUZ: tam KYC |
| 10 | **Stripe** | Kart, Apple Pay, Google Pay | HAYIR | YÜKSEK (şirket KYC zorunlu) | HAYIR — banka | $100 | %2.9 + $0.30 | EVET | OPSEC UYUMSUZ: tam KYC |

### KYC Gerçeği — Detaylı Açıklama

```
⚠️ SELLİX (fiat tarafı):
  - Email ile hesap aç → kripto kabul et → KYC YOK ✓
  - Fiat gateway'leri (kart, PayPal) aktif et → arkadaki Stripe/PayPal KYB/KYC istiyor ✗
  - Hacim arttıkça → kimlik, şirket belgeleri, adres kanıtı isteniyor ✗
  - SONUÇ: Sellix fiat = Stripe ile aynı KYC. Sadece kripto tarafı OPSEC uyumlu.

⚠️ COINGATE (fiat tarafı):
  - Email ile hesap → kripto kabul et → minimal KYC ✓
  - Fiat kabul veya para çekmek → MiCA lisansı gereği tam KYC zorunlu ✗
  - Self-custody cüzdana 1000€+ çekim → cüzdan sahipliği doğrulaması (Travel Rule) ✗
  - SONUÇ: CoinGate fiat = tam KYC. Sadece kripto tarafı kısmen kullanılabilir.

⚠️ CRYPTOMUS:
  - Kripto kabul et → email KYC ✓
  - Para çekmek → tam KYC doğrulaması zorunlu ✗
  - SONUÇ: Kabul eder ama çekemezsin KYC'siz. Dikkatli kullan.
```

### Öneri sıralaması (OPSEC + kullanışlılık)

```
KRİPTO KABUL (müşteri kripto ile öder):
  1. NOWPayments    → 300+ coin, ~$2 min, zaten entegre. GÜVENİLİR.
  2. BTCPay Server  → Self-hosted, sıfır KYC, sıfır komisyon, BTC+Lightning+XMR.
  3. Sellix (kripto) → 25+ coin, XMR dahil, email KYC. Ek seçenek olarak iyi.
  4. Cryptomus      → Zaten entegre ama para çekme = KYC. DİKKAT.

FİAT KABUL (müşteri kart/PayPal ile öder) — OPSEC UYUMLU:
  ⚠️ Kanıtlanmış ve güvenilir sıfır-KYC fiat gateway MEVCUT DEĞİL (Nisan 2026).
  
  Test edilebilir adaylar (küçük hacimle):
  1. AllPays.co     → Mart 2026, sıfır yorum, en geniş fiat. $10-20 ile test et.
  2. PayRam Onramp  → Self-hosted, müşteri 1 kez KYC yapar. Apple Pay/Google Pay.

FİAT KABUL — OPSEC UYUMSUZ (KYC zorunlu):
  ✗ Sellix fiat    → KYB gerekli (Stripe/PayPal processor).
  ✗ CoinGate fiat  → MiCA gereği tam KYC.
  ✗ Stripe         → Tam KYC.
  ✗ Paddle         → Tam KYC.
  ✗ NexaPay        → SCAM. KULLANMA.
```

### NexaPay hakkında uyarı

NexaPay kodda entegre durumda (hem `getsmsnow.com` dashboard top-up hem guest checkout) ama:
- Trust skoru 1/100 (Gridinsoft, Scamdoc, Scamadviser)
- Reddit'te "SCAM ALERT" flairi ile uyarı thread'leri
- Yasal entity yok, domain yeni, fake 5-star review'lar
- Para iadesi (refund) süreci belirsiz

**Öneri:** NexaPay'i **koddan tamamen çıkar**. Fiat yerine **sadece kripto** seçeneklerini sun (NOWPayments + Cryptomus). AllPays.co veya PayRam küçük hacimle test edilip güvenilirliği kanıtlanırsa, sonradan fiat ekle.

### Fiat → kripto akışı nasıl çalışır? (AllPays / PayRam modeli)

AllPays ve PayRam'ın "fiat onramp" modeli:
```
Müşteri kart/PayPal/Apple Pay ile ödüyor (USD)
        ↓
Müşteri aslında senin adına USDC satın alıyor (onramp partneri aracılığıyla)
        ↓
USDC direkt senin wallet'ına geliyor (AllPays: Polygon, PayRam: Base)
        ↓
Sen USDC → BTC/XMR swap yapıyorsun (ChangeNOW, UnstoppableSwap)
        ↓
Feather Wallet'ta XMR olarak tutuyorsun
```

**Neden farklı:** Klasik gateway (Stripe/Sellix fiat) → merchant hesabına para yatırır → KYC zorunlu.
Onramp modeli → müşteri kripto alıyor → sana direkt gönderiliyor → KYC sadece müşteride.

**Risk:** Bu model yeni ve test edilmemiş. Yüksek decline oranı olabilir. Müşteri "kripto aldığını" fark edebilir.

---

## 3. Her Proje İçin Önerilen Ödeme Kombinasyonu

### getsmsnow.com (SMS Sitesi)

| Katman | Sağlayıcı | Ne İçin | Durum |
|--------|-----------|---------|-------|
| **Kripto (ana)** | NOWPayments (mevcut) | Dashboard top-up + guest checkout | ✅ Entegre |
| **Kripto (yedek)** | Cryptomus (mevcut) | Yedek (⚠️ çekim KYC'li, dikkat) | ✅ Entegre |
| **Kripto (ek)** | Sellix kripto | XMR dahil 25+ coin, email KYC | Eklenebilir |
| **Fiat** | ⚠️ **Şu an güvenilir seçenek yok** | AllPays.co küçük hacimle test et, kanıtlanırsa ekle | Test aşaması |
| **Uzun vade** | BTCPay Server | Self-hosted, sıfır komisyon, BTC+Lightning+XMR | Sonra |

**NexaPay → KALDIR.** Koddan tamamen çıkar.

### kart-site (Kart Sitesi)

| Katman | Sağlayıcı | Ne İçin | Durum |
|--------|-----------|---------|-------|
| **Kripto (ana)** | NOWPayments (mevcut) | Dashboard bakiye yükleme | ✅ Entegre |
| **Fiat** | ⚠️ **Şu an güvenilir seçenek yok** | AllPays.co test edilip çalışırsa ekle | Test aşaması |
| **Uzun vade** | BTCPay Server | Self-hosted, sıfır komisyon | Sonra |

### NyumatFlix + embed-api (Film Sitesi — Phase 2)

| Katman | Sağlayıcı | Ne İçin |
|--------|-----------|---------|
| **Gelir** | Reklam ağları (aşağıda detay) | Pop-under + banner + bumper |
| **VIP abonelik** (opsiyonel) | NOWPayments veya BTCPay Server | Reklamsız izleme (kripto-only) |

---

## 4. Pop-under / Reklam Ağı Seçenekleri — Tam Karşılaştırma

Film sitesi + embed API'den reklam geliri elde etmek için pop-under ve native banner ağları.

### Tüm değerlendirilen ağlar

| # | Ağ | KYC | Devlete Veri Verir mi? | Payout | Min. Payout | CPM (Tier-1 US/EU) | Reklam Türleri | Film/Streaming Kabul | OPSEC Skoru |
|---|-----|-----|----------------------|--------|-------------|-------------------|---------------|---------------------|-------------|
| 1 | **AADS** | SIFIR (email bile yok) | **HAYIR** — hiçbir kişisel veri toplamıyor | BTC (Lightning dahil), günlük | 0.001 BTC | $0.10-0.30 | Banner, native | EVET | ★★★★★ |
| 2 | **TrafficStars** | Düşük (email) | Mahkeme emri ile mümkün ama aktif paylaşım yok | BTC, USDT ($10 min) | $10 | $0.50-2.00 | Pop-under, native, banner, pre-roll | EVET (adult/streaming) | ★★★★☆ |
| 3 | **JuicyAds** | Düşük (email) | Belirtilmemiş | Crypto, Paxum, Wire | $25 | $0.40-1.50 | Pop-under, banner | EVET (adult/streaming) | ★★★★☆ |
| 4 | **ExoClick** | Orta (email + site doğrulama) | Policy'de "legal obligation" geçiyor ama rapor yok | BTC, Wire, Paxum | $20 | $0.30-1.20 | Pop-under, native, banner, video | EVET (adult OK) | ★★★☆☆ |
| 5 | **Adsterra** | Orta-Yüksek (email + site) | **EVET** — "provide law enforcement with information" | BTC, USDT, Wire ($100 min) | $100 | $0.50-2.50 | Pop-under, native, social bar, banner | EVET | ★★☆☆☆ |
| 6 | **HilltopAds** | Orta (email + site) | **EVET** — "comply with legal obligations, court orders" | BTC, Wire, Paxum | $20 | $0.30-1.00 | Pop-under, native | EVET | ★★☆☆☆ |
| 7 | **Clickadu** | Orta (email + site) | **EVET** — "On demand by court order and/or law enforcement" | BTC, USDT, Wire | $100 | $0.40-1.50 | Pop-under, push, in-page push | EVET | ★★☆☆☆ |
| 8 | **PopAds** | Düşük (email) | Belirtilmemiş | PayPal, Wire | $5 | $0.20-0.80 | Sadece popunder | EVET | ★★★☆☆ |
| 9 | **PopCash** | Düşük (email) | Belirtilmemiş | PayPal, Wire, Payoneer | $10 | $0.15-0.60 | Sadece popunder | EVET | ★★★☆☆ |

### Sıralama: EN GÜVENLİ → EN RİSKLİ

```
1. AADS          → Anonim, email bile yok, BTC Lightning, 2011'den beri. Düşük CPM ama SIFIR KYC.
2. TrafficStars  → BTC/USDT payout, düşük KYC, adult/streaming kabul, EN YÜKSEK CPM.
3. JuicyAds      → 2006'dan beri, adult odaklı, crypto payout, iyi gelir.
4. ExoClick      → Streaming/adult kabul, BTC payout. Orta risk.
5. PopAds        → Düşük KYC, popunder odaklı. PayPal riski var.
6. PopCash       → PopAds benzeri, PayPal/Wire. Orta.
7. Adsterra      → İyi CPM ama law enforcement ile işbirliği yapıyor.
8. HilltopAds    → Mahkeme emri ile veri verir.
9. Clickadu      → Aynı risk. Yedek olarak bile düşük öncelik.
```

### Önerilen 3'lü strateji

```
Slot 1 (güvenli ana):     AADS         → Banner + native, BTC Lightning, sıfır KYC
Slot 2 (yüksek gelir):   TrafficStars → Pop-under + native + pre-roll, BTC/USDT
Slot 3 (yedek):          JuicyAds     → Pop-under + banner, crypto payout
```

Bu üçü ile:
- **AADS:** sıfır KYC, sıfır veri toplama → ana güvenlik katmanı
- **TrafficStars:** yüksek CPM ($0.50-2.00), adult/streaming kabul → ana gelir kaynağı
- **JuicyAds:** yedek + çeşitlendirme → TrafficStars sorun yaşarsa devreye girer

### Tahmini aylık gelir (100K sayfa görüntüleme varsayımı)

| Ağ | CPM | Gelir/ay |
|----|-----|----------|
| AADS (banner) | $0.20 | ~$20 |
| TrafficStars (pop-under) | $1.00 | ~$100 |
| JuicyAds (pop-under) | $0.80 | ~$80 |
| **embed-api bumper** (pre-roll, adblock-proof) | $0.50-1.00 | ~$50-100 |
| **TOPLAM** | | **~$250-300/ay** |

1M sayfa görüntüleme ile: **~$2,500-3,000/ay**

---

## 5. Film Sitesi + Embed API'de Reklam Nasıl Uygulanır?

### 5a. Embed API — Backend Reklam (zaten kısmen hazır)

| Bileşen | Durum | Açıklama |
|---------|-------|----------|
| **Bumper Ad** (pre-roll) | KOD HAZIR (`embed-api/src/ads/bumper.ts`) | HLS playlist'inin başına 3-5 sn reklam segment'i enjekte ediyor. Aynı domain, aynı `.jpg` uzantısı → adblocker algılayamaz. |
| **VAST pre-roll** | ENV'de tanımlı (`AD_VAST_URL`) | Dış VAST tag'i ile video oynatıcıya reklam. Ama adblocker engelleyebilir. |
| **Bumper asset** | YAPILACAK | Pre-encode edilmiş 3-5 sn reklam videosu R2'ye yüklenecek. |

**Bumper'ı aktif etmek için:**
```
embed-api/.env:
  AD_BUMPER_ENABLED=true
  BUMPER_AD_PATH=./assets/bumper.ts    (bumper video segment yolu)
```

**Bumper neden güçlü?**
- Aynı domain'den serve edilir (embed.yourdomain.com)
- Aynı URL pattern'i (/hls/bumper/...)
- Aynı dosya uzantısı (.jpg)
- Aynı Content-Type (video/MP2T)
- Adblocker için gerçek içerikten ayırt edilemez
- Google/Chrome adblocker → etkisiz

### 5b. NyumatFlix — Frontend Reklam (YAPILACAK)

| Bileşen | Durum | Açıklama |
|---------|-------|----------|
| **Pop-under script** | ENV tanımlı ama KOD YOK | `NEXT_PUBLIC_AD_POP_ZONE` env'de var, Adsterra/HilltopAds/TrafficStars JS tag'i eklenmeli |
| **Native banner** | ENV tanımlı ama KOD YOK | `NEXT_PUBLIC_AD_NATIVE_ZONE` env'de var, film detay sayfasına gömülmeli |
| **Pre-roll player** | YOK | Video oynatıcıya VAST tag entegrasyonu (opsiyonel, bumper varken gereksiz olabilir) |

**Frontend'e eklenecek kod örneği (TrafficStars pop-under):**
```html
<script type="text/javascript">
  var ts_pop_zone = "ZONE_ID_BURAYA";
  // TrafficStars pop-under script
</script>
<script src="https://d1z2sfbd6fa3yb.cloudfront.net/pop.js"></script>
```

**Frontend'e eklenecek kod örneği (AADS banner):**
```html
<iframe data-aa="ZONE_ID" src="//ad.a-ads.com/ZONE_ID?size=728x90" 
  style="width:728px; height:90px; border:0; padding:0; overflow:hidden;"></iframe>
```

---

## 6. Phase 2 — İçerik Pipeline Seçenekleri

Film sitesi ve embed API'nin Phase 2'de içerik sunmak için pipeline seçenekleri:

### Seçenek A: Telegram + R2 (manuel)

```
İçerik → Telegram private kanal → MTProto API ile çek → FFmpeg HLS encode → Cloudflare R2 → Embed API
```

- **Avantaj:** Telegram'da ücretsiz depolama (2GB/dosya), elle kontrol
- **Dezavantaj:** Manuel süreç, ölçeklenmiyor

### Seçenek B: YTS/EZTV + Real-Debrid (otomatik)

```
TMDB'de trend filmi bul → YTS/EZTV'den torrent → Real-Debrid CDN cache → FFmpeg HLS → R2 → Embed API
```

- **Avantaj:** Otomatik, ölçeklenebilir, Real-Debrid CDN hızlı
- **Dezavantaj:** Real-Debrid €3/ay, torrent kütüphanesi sınırlı

### Seçenek C: İkisi birden (önerilen)

```
Otomatik: YTS/EZTV → Real-Debrid → HLS → R2 (popüler içerik)
Manuel:   Telegram → MTProto → HLS → R2 (özel/nadir içerik)
```

### Gerekli ENV değerleri (Phase 2)

```env
# embed-api/.env — Phase 2 bölümü

# Telegram Content Storage
TG_API_ID=            # my.telegram.org → API Development
TG_API_HASH=          # my.telegram.org → API Development
TG_SESSION=           # MTProto client ile oluşturulur
TG_CHANNEL_ID=        # İçerik kanalının ID'si

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_PUBLIC_URL=

# Torrent Pipeline
TMDB_API_KEY=               # themoviedb.org → ücretsiz
TORRENT_PIPELINE_ENABLED=true
REAL_DEBRID_API_KEY=        # real-debrid.com → €3/ay
```

---

## 7. KULLANILMAYACAK Servisler

| Servis | Neden KULLANMA |
|--------|---------------|
| **NexaPay** | SCAM. Trust 1/100. Fake review. Yasal entity yok. Koddan tamamen çıkar. |
| **Stripe** | Tam KYC, şirket doğrulama, banka hesabı zorunlu |
| **Paddle** | KYC soruyor, adres doğrulama, vergi bilgisi |
| **PayPal direkt** | KYC zorunlu, hesap dondurma riski yüksek |
| **Sellix (fiat tarafı)** | Kripto kabul = OK. Ama fiat gateway aktif etmek = KYB/KYC (Stripe/PayPal processor) |
| **CoinGate (fiat/çekim)** | Kripto kabul = OK. Ama fiat veya para çekmek = MiCA gereği tam KYC |
| **Cryptomus (çekim)** | Kripto kabul = OK. Ama para çekmek = KYC zorunlu. Dikkatli kullan. |
| **Card2Crypto** | Trust 1/100. Scam. Müşteri kripto alım sayfası görüyor. |
| **Google AdSense** | KYC zorunlu, ban riski yüksek, veri paylaşır |
| **PropellerAds** | KYC zorunlu, W-8/W-9 formu istiyor |
| **Monetag** | Kullanıcı verisi toplar, privacy-hostile |
| **Facebook/Meta Ads** | KYC zorunlu, hesap doğrulama |
| **Lemon Squeezy / Gumroad** | Fiat-only payout (banka), tam KYC |

---

## 8. Özet: Aksiyon Planı

### ✅ TAMAMLANDI (Phase 1)

1. ✅ **NexaPay koddan tamamen kaldırıldı** — lib, API routes, UI seçeneklerinden silindi
2. ✅ **Paddle koddan tamamen kaldırıldı** — lib, API routes, PaddleInit bileşeni silindi
3. ✅ **NOWPayments ana kripto gateway olarak aktif edildi** — Guest checkout + Dashboard TopUp'da seçenek
4. ✅ **Cryptomus yedek olarak korundu** — Guest checkout'ta birinci seçenek
5. ✅ **Dashboard aktif edildi** — Balance, order history, TopUp, referral paneli wire edildi
6. ✅ **Auth düzeltildi** — Gerçek password verification (bcrypt), UUID bazlı user.id
7. ✅ **Layout birleştirildi** — Navbar + Footer + CookieBanner root layout'a eklendi
8. ✅ **Homepage yenilendi** — Hero + SearchForm + StatsBar + Features + HowItWorks + TrustIndicators + FAQ + JoinNow
9. ✅ **Footer ödeme ikonları güncellendi** — BTC, ETH, USDT, XMR, LTC (fiat ikonları kaldırıldı)
10. ✅ **Minimum top-up $5** olarak ayarlandı
11. ✅ **.env.example temizlendi** — Sadece aktif servisler listelendi

### Hemen yapılacaklar (kalan)

- **Her iki site:** Şimdilik **sadece kripto** kabul et (NOWPayments + Cryptomus)

### Fiat testi (Phase 1.5 — küçük hacimle)

5. **AllPays.co:** $10-20 ile test et. Çalışırsa ve para gelirse → entegrasyon planla
6. **PayRam:** VPS'e kur, küçük hacimle test et. Müşteri KYC kabul edilebilir mi değerlendir
7. Hangisi kanıtlanırsa → getsmsnow.com ve kart-site'a fiat seçeneği olarak ekle

### Phase 2'de yapılacaklar

8. **embed-api:** `AD_BUMPER_ENABLED=true` yap, bumper video asset'ini R2'ye yükle
9. **NyumatFlix:** TrafficStars pop-under + AADS banner kodunu frontend'e ekle
10. **embed-api:** Telegram + R2 pipeline veya torrent pipeline'ı aktif et
11. Reklam hesaplarını aç: AADS (anonim) + TrafficStars (email) + JuicyAds (email)
12. Opsiyonel: VIP reklamsız izleme aboneliği (BTCPay Server ile)
13. **Uzun vade:** BTCPay Server kur → sıfır komisyon, sıfır KYC, BTC+Lightning+XMR

### Maliyet özeti

| Kalem | Aylık |
|-------|-------|
| Reklam ağı üyeliği | Ücretsiz (publisher tarafı) |
| NOWPayments komisyon | %0.5-1 (satış oldukça) |
| Cryptomus komisyon | %0.4-1 (satış oldukça) |
| AllPays.co (test sonrası) | %5.9/işlem (Free plan) veya $79/ay (Launch) |
| PayRam (test sonrası) | %0 + VPS maliyeti (~$5-10/ay) |
| BTCPay Server (uzun vade) | Ücretsiz (self-hosted) + VPS |
| Real-Debrid (Phase 2) | €3/ay |
| **Sabit maliyet (şimdi)** | **~€3/ay** (sadece Real-Debrid) |

---

## 9. Kripto Minimum Ödeme Tutarları

Müşteri küçük hacimler ödeyeceği için minimum tutarlar önemli:

| Sağlayıcı | Min. Ödeme | Detay |
|-----------|-----------|-------|
| **NOWPayments** | ~$2 (BTC, ETH, LTC, XMR, USDT vb.) | Diğer coinlerde $3-5. API'den canlı kontrol: `GET /min-amount` |
| **Cryptomus** | Coin/ağ bazlı | USDT: 0.5 USDT, BTC: 0.001 BTC. API: `POST /v1/payment/services` → `limit.min_amount` |
| **Sellix (kripto)** | Merchant ayarlar | Dashboard'da min/max sipariş tutarı belirlenebilir |
| **AllPays.co** | Bilinmiyor | Test edilecek |
| **PayRam** | ~$5-10 (onramp partneri) | Card-to-crypto onramp partneri belirler |

**UI önerisi:** Minimum top-up tutarını **$5 USD** olarak ayarla → tüm gateway minimumlarını ve ağ ücretlerini güvenle karşılar.
