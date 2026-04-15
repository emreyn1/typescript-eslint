# Fiat-to-Crypto Gateway Karsilastirma — No-KYC Merchant Secenekleri

Son guncelleme: Nisan 15 2026

---

## ACIK GERCEK

Sirket kurmadan fiat (kart) kabul edip kripto olarak almak isteyen bir merchant icin piyasada **gercekten guvenilir** secenek sayisi COK AZ. Listelenen 15+ gateway'in cogu ya tam KYC istiyor, ya merchant gateway degil, ya da scam/suphelii.

Kullanilabilecek **3 gercek secenek** var. Bunlarin hepsinde ortak mantik ayni: **Musteri → lisansli onramp partner (MoonPay/Simplex/Banxa vb.) uzerinden kart ile oder → onramp partner fiat'i kripto'ya cevirir → kripto senin cuzdanina gelir.** Sen KYC yapmiyorsun, onramp partneri musteriden yapiyor.

---

## KESIN KARAR

| # | Gateway | Guvenilirlik | Fee | Fiat Kabul | KARAR |
|---|---------|-------------|-----|-----------|-------|
| 1 | **BucksBus** | **EN YUKSEK** — 2022'den beri aktif, UAE sirketi, 3000+ islem yapan merchantlar, Bitcointalk/SourceForge gercek yorumlar | %0.07 (kripto) + onramp fee (~%3-5 fiat) | Kart (Visa/MC), Apple/Google Pay (Simplex, MoonPay, Banxa, Transak, Mercuryo, Stripe, wert vb.) | **BIRINCIL SECENEK** |
| 2 | **PayRam** | YUKSEK — WazirX kurucu ortagi, self-hosted, acik kaynak, $100M+ settled. Ama bagimsiz yorum 0 | %0 PayRam + onramp fee (~%3-5) | Kart, Apple/Google Pay, banka, 175+ yontem | SELF-HOST isteyenler icin |
| 3 | **PayGate.to** | ORTA — ScamAdviser 1/5 ama altinda MoonPay/Transak. GitHub acik, WooCommerce plugin | %1.5 flat + provider fee | Visa/MC, Apple/Google Pay, SEPA | YEDEK |

---

## 1. BucksBus — BIRINCIL ONERILEN

| Ozellik | Deger |
|---------|-------|
| URL | https://bucksbus.com |
| Kurulus | **2022**, Ajman Free Zone, UAE |
| Tip | Non-custodial gateway + fiat onramp aggregator |
| Merchant KYC | **YOK** — sadece email ile kayit |
| Musteri KYC | Onramp provider yapar (Simplex, MoonPay vb. — musteri ilk seferinde 2 dk KYC) |
| Fiat yontemler | Visa, MC, Apple Pay, Google Pay (provider'a bagli) |
| Onramp providerlar | **Simplex, MoonPay, Banxa, Transak, Mercuryo, wert, Revolut, Topper, Switchere, Stripe** |
| Kripto kabul | BTC, ETH, USDT (ERC-20/TRC-20/POLY), USDC (POLY/ERC-20), POL, TRX, LTC |
| Settlement | Direkt senin non-custodial cuzdanina |
| Fee (kripto odeme) | **$0.7/islem flat** veya **%0.07** (hacime gore tarife) |
| Fee (fiat onramp) | BucksBus ucreti + onramp provider ucreti (~%3-5 toplam) |
| Kurulum | Email kayit → API key al → entegre et |
| API | REST API, HTTP Basic Auth, docs: docs.bucksbus.com |
| Plugin | WooCommerce (v1.2.5, Ocak 2026 guncelleme) |
| White-label | VAR — kendi branding'in ile odeme sayfasi |
| Destek | 24/7, ilk 3 ay ucretsiz, sonra $50/ay (fee < $50 ise) |

### Neden en guvenilir

- **2022'den beri aktif** — NexaPay (5 ay), AllPays (1 ay), PayRam (fiat onramp 1 ay) ile karsilastir
- **Gercek kullanici yorumlari:**
  - Bitcointalk: Online casino 2+ ay kullanmis, memnun
  - SourceForge: 5/5 (2 yorum), "3000+ islem hatasiz"
  - Trustpilot: Claimed profile, 5/5 (1 yorum)
- **Ajman Free Zone (UAE)** — kayitli sirket, adres var
- **Non-custodial** — paranin icinden gecmiyor, dogrudan cuzdanina
- **API dokumantasyonu acik** — docs.bucksbus.com
- **WooCommerce plugin** — WordPress.org'da, acik kaynak
- **GitHub** kamuya acik

### Fiat API endpoint

```
POST https://api.bucksbus.com/int/payment/fiat

{
  "payment_type": "FIXED_AMOUNT",
  "amount": 10.00,
  "asset_id": "USDT.TRC20",
  "fiat_asset_id": "USD",
  "fiat_provider": "simplex",
  "country": "US",
  "reverse": "REVERSE"  // musteri onramp fee'yi oder
}

→ Response: { "payment_url": "https://..." }  // musteri bu URL'ye yonlendirilir
```

---

## 2. PayRam — SELF-HOST ISTEYENLER ICIN

| Ozellik | Deger |
|---------|-------|
| URL | https://payram.com |
| Kurucu | Siddharth Menon (WazirX kurucu ortagi) |
| Tip | Self-hosted, non-custodial, acik kaynak |
| Merchant KYC | **YOK** — cuzdan adresi gir, 5 dk'da canli |
| Musteri KYC | Ilk seferinde evet (onramp partner yapar) |
| Fiat yontemler | Kart, Apple/Google Pay, banka, 175+ yontem, 190+ ulke |
| Settlement | USDC (Base chain) → kendi cuzdanina |
| Fee | PayRam %0. Onramp partner ~%3-5 |
| Kurulum | VPS'ine Docker ile kur (5-10 dk) |
| Smart contract audit | QuillAudits |
| Dezavantaj | Fiat onramp Mart 2026'da cikti, sadece Base chain, 0 bagimsiz yorum |

**Ne zaman tercih edilir:** Kendi sunucunda tam kontrol istiyorsan ve teknik bilgin varsa. Zaten VPS kuruyorsun, PayRam'i da ayni sunucuya Docker ile kurabilirsin.

---

## 3. PayGate.to — YEDEK

| Ozellik | Deger |
|---------|-------|
| URL | https://paygate.to |
| Tip | Aggregator (MoonPay, Transak, Mercuryo, wert, Banxa, Stripe altyapisi) |
| Merchant KYC | **YOK** — signup yok, wallet adresi yeterli |
| Musteri KYC | Provider yapar (instant, 2 dk) |
| Settlement | USDC (Polygon), ETH, USDT, POL |
| Fee | %1.5 flat + provider fee |
| Kurulum | WooCommerce/WHMCS plugin veya API |
| Dezavantaj | ScamAdviser 1/5 (5 yorum), domain 10 ay, WHOIS gizli |

**Yorum:** Altinda lisansli provider'lar (MoonPay vb.) kullaniyor — bu kisminda sorun yok. Ama PayGate'in kendisi guven vermiyor. BucksBus ayni isi daha guvenilir yapiyor.

---

## KULLANMAYACAKLARIN — KESIN LISTE

| Gateway | Neden HAYIR |
|---------|-------------|
| **NexaPay** | ScamAdviser 0/100, domain 5 ay, tum "incelemeler" sponsorlu/sahte, lisans yok |
| **AllPays.co** | %5.9-10 fee COK PAHALI, Mart 2026'da kuruldu, 0 bagimsiz yorum |
| **Stripe** | Tam KYC + KYB zorunlu, sirket belgesi sart |
| **MoonPay** | Merchant gateway degil, consumer onramp. Merchant KYC zorunlu |
| **Banxa** | Tam KYC/KYB zorunlu |
| **Crypto.com** | Exchange, KYC zorunlu, payment gateway degil |
| **Revolut** | Banka, tam KYC zorunlu |
| **Binance Pay** | Exchange-based, tam KYC/KYB zorunlu |
| **Klever.io** | Wallet/DeFi platformu, merchant payment gateway degil |
| **Sellix** | Fiat icin KYB zorunlu (Stripe altyapisi) |
| **CoinGate** | Fiat + cekim icin tam KYC (MiCA lisansi) |
| **Paddle** | Tam KYC + sirket dogrulamasi |

---

## FINAL PLAN

```
Kripto odeme (musteri kripto ile oduyor):
  → NOWPayments (%0.5 fee, 300+ coin) — zaten entegre
  → Cryptomus (yedek, %0.5-1) — zaten entegre

Fiat odeme (musteri kart ile oduyor):
  → BucksBus ($0.7/txn + onramp fee)
     - Email ile kayit ol
     - API key al
     - getsmsnow.com ve kart-site'a entegre et
     - Musteri kart ile oder → Simplex/MoonPay/Banxa cevirir → USDT/USDC cuzdanina gelir
```

### Entegrasyon Adimi

1. https://bucksbus.com → email ile kayit
2. Dashboard'dan non-custodial wallet olustur (USDT TRC-20 veya USDC Polygon)
3. API Key + Secret al
4. `getsmsnow.com` ve `kart-site`'a BucksBus entegrasyonu yap:
   - `/src/lib/bucksbus.ts` — API client
   - `/src/app/api/bucksbus/create-payment/route.ts` — odeme olusturma
   - `/src/app/api/bucksbus/webhook/route.ts` — odeme bildirimi
   - UI'da "Pay with Card" butonu → BucksBus fiat endpoint'ine yonlendir
5. Test: Kucuk miktar ($5-10) ile gercek odeme yap, cuzdana geldigini dogrula

---

## FON KORUMA STRATEJISI — Gateway Bizi Dolandirirsa Ne Yapariz

### Risk Analizi

```
Kripto-to-kripto (NOWPayments/Cryptomus):
  Musteri → blockchain → senin cuzdan
  Risk: DUSUK — on-chain dogrulanabilir, arada custodian yok

Fiat onramp (BucksBus fiat endpoint):
  Musteri kart → Simplex/MoonPay → kripto cevirir → senin cuzdan
  Risk: ORTA — donusum sirasinda onramp provider fonlari tutuyor
  Olasi sorun: Provider cevirdi ama BucksBus sana iletmedi,
              veya provider cevirmeyi birakti, veya BucksBus kapandi
```

### KURAL 1: Odemeyi ASLA webhook'a guvenip onaylama — on-chain dogrula

```
YANLIS AKIS:
  Webhook "paid" diyor → siparis onayla → urunu ver
  (gateway sahte webhook gonderebilir, veya webhook gelir ama para gelmez)

DOGRU AKIS:
  Webhook "paid" diyor → blockchain'de txid'yi dogrula →
  cuzdandaki bakiyeyi kontrol et → siparis onayla → urunu ver
```

Yani: webhook geldiginde, icindeki `txid` (transaction hash) ile blockchain explorer API'sinden
(Tron: api.trongrid.io, Polygon: api.polygonscan.com, BTC: blockchain.info)
islemin gercekten cuzdanina gelip gelmedigini dogrula. Dogrulanmadan urunu verme.

### KURAL 2: Circuit Breaker — otomatik gateway kapatma

```
Son 1 saat icinde:
  - 5+ odeme webhook'u geldi AMA on-chain dogrulanamadi
  - VEYA odeme basari orani %70'in altina dustu
  → OTOMATIK: Bu gateway'i devre disi birak
  → OTOMATIK: Yedek gateway'e gec (NOWPayments kripto-only)
  → OTOMATIK: Sana Telegram bildirimi gonder
```

### KURAL 3: Kucuk tutarlarla basla, buyut

```
Hafta 1: Gunluk max $50 islem (test donemi)
Hafta 2: Gunluk max $200
Hafta 3+: Her sey yolundaysa limit kaldir

Her hafta sonu: Toplam gelen vs beklenen karsilastir
Fark %5'ten fazlaysa → gateway'i durdur, arastir
```

### KURAL 4: Cift gateway her zaman aktif

```
Birincil fiat: BucksBus
Yedek fiat:    PayGate.to veya PayRam
Kripto:        NOWPayments (birincil) + Cryptomus (yedek)

BucksBus cokerse → otomatik PayGate.to'ya gec
NOWPayments cokerse → otomatik Cryptomus'a gec

Gecis suresi: 0 (kod icinde fallback mantigi)
Musteri hic bir sey farketmez
```

### KURAL 5: Gunluk otomatik mutabakat (reconciliation)

```bash
# Her gun 00:00 UTC'de cron job:
# 1. DB'deki "paid" siparisleri listele
# 2. Blockchain'den cuzdana gelen islemleri listele
# 3. Karsilastir:
#    - DB'de "paid" ama blockchain'de yok = ALARM
#    - Blockchain'de var ama DB'de yok = kayip islem
# 4. Fark varsa Telegram'a bildirim gonder
```

### KURAL 6: Urun teslimini geciktir (dijital urunler icin)

SMS numara/kart gibi dijital urunlerde:
```
Odeme geldi → 2 dakika bekle → on-chain dogrula →
  1 confirmation (Polygon: ~2sn, Tron: ~3sn, BTC: ~10dk)
  → teslim et
```

BTC icin 1 confirmation beklemek yeterli (kucuk tutarlar icin).
Buyuk tutarlar ($100+) icin 2-3 confirmation bekle.

### KURAL 7: Zarar limiti (stop-loss)

```
Eger herhangi bir 24 saatlik donemde:
  - Dogrulanmamis odeme toplami > $100 olursa
  → TUM fiat gateway'lerini kapat
  → Sadece kripto-to-kripto kabul et (NOWPayments)
  → Manual olarak durumu incele
```

### OZET: En kotu senaryo ve korunma

| Senaryo | Sonuc | Korunma |
|---------|-------|---------|
| BucksBus kapaniyor | Fiat odeme durur | Yedek gateway (PayGate/PayRam) otomatik devreye girer |
| BucksBus paralari yemiyor | Para gelmiyor ama webhook "paid" diyor | On-chain dogrulama + circuit breaker yakalar |
| Onramp provider (Simplex/MoonPay) sorun cikarir | Fiat → kripto donusumu basarisiz | Musteri odeme sayfasinda hata gorur, siparis "pending" kalir, urun verilmez |
| Tum gateway'ler coker | Hic odeme alinamiyor | Sadece kripto-to-kripto (NOWPayments) ile devam — musteriye "Pay with crypto" goster |
| Buyuk miktar kaybi ($500+) | Ciddi zarar | Gunluk $50 limit + circuit breaker + reconciliation bu durumu onler — max kayip 1 gunluk islem hacmi |

**ALTIN KURAL: Blockchain'de gormediysen, para gelmemistir. Webhook'a ASLA kör guvenme.**

---

### Neden NexaPay yerine BucksBus

| | NexaPay | BucksBus |
|--|---------|---------|
| Kurulus | 2025 (5 ay) | **2022 (3+ yil)** |
| ScamAdviser | 0/100 | Listelenmemis (nötr) |
| Gercek yorum | 0 (hepsi sponsorlu) | **Bitcointalk + SourceForge + Trustpilot** |
| Sirket | Bilinmiyor | **Ajman Free Zone, UAE (kayitli)** |
| Islem gecmisi | Kanitlanamaz | **3000+ islem (merchant yorumu)** |
| API docs | Var | **Var (docs.bucksbus.com)** |
| Onramp | Kendi altyapisi (?) | **Simplex, MoonPay, Banxa, Transak, Mercuryo, Stripe** |
