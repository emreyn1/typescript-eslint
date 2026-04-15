# Odeme Platformlari — Para Alma, Cuzdan, Mixer, Swap

Bu dokuman 4 isten gelen paranin nasil alinacagini, nerede tutulacagini ve nasil anonimlestirilecegini kapsar.

---

## 1. Para Akisi (Ozet)

```
Musteri odeme yapar
       │
       ▼
NOWPayments / Cryptomus / NexaPay
       │
       ▼
Senin kripto cuzdanin (USDT TRC-20)
       │
       ▼
USDT → XMR swap (Trocador veya UnstoppableSwap)
       │
       ▼
XMR cuzdanin (Monero — izlenemez)
       │
       ▼
Harcama: XMR ile VPS, domain, proxy ode
         veya XMR → BTC/USDT swap (gerekirse)
```

---

## 2. Kripto Cuzdan — Paralari Nerede Tutacaksin

### Ana Cuzdan: Trust Wallet (USDT TRC-20 icin)

| Ozellik | Deger |
|---------|-------|
| Platform | iOS + Android |
| KYC | YOK |
| Self-custody | EVET (seed phrase sende) |
| Desteklenen aglar | TRC-20, ERC-20, BEP-20, Solana, BTC, ETH, 100+ chain |
| USDT TRC-20 | EVET |
| Maliyet | Ucretsiz |
| Indir | https://trustwallet.com |

**Kurulum:**
1. Indir → Yeni cuzdan olustur
2. 12 kelimelik seed phrase'i KAGIDA yaz (dijital kaydetme)
3. TRC-20 adresini kopyala → NOWPayments/Cryptomus outcome wallet olarak ayarla

### Alternatif Cuzdanlar

| Cuzdan | Icin Ne | KYC | Platform | Not |
|--------|---------|-----|----------|-----|
| **Trust Wallet** | Ana USDT/BTC/ETH cuzdani | Yok | iOS/Android | En genis chain destegi |
| **Exodus** | Masaustu USDT/BTC cuzdani | Yok | Mac/Win/Linux/iOS/Android | Dahili swap ozelligi var |
| **Cake Wallet** | XMR (Monero) ana cuzdani | Yok | iOS/Android | Monero icin en iyi mobil cuzdan |
| **Feather Wallet** | XMR masaustu cuzdani | Yok | Mac/Win/Linux | Hafif, hizli, Tor destekli |
| **Monero GUI** | XMR resmi cuzdani | Yok | Mac/Win/Linux | Tam node veya remote node |

### Minimum Onerilen Kurulum

| Cuzdan | Amac |
|--------|------|
| **Trust Wallet** | USDT/BTC al (NOWPayments, Cryptomus, NexaPay'den) |
| **Cake Wallet** | XMR al (swap sonrasi) + XMR harca |

Bu 2 cuzdan yeterli. Geri kalani opsiyonel.

---

## 3. Swap ve Mixer — USDT/BTC'yi XMR'a Cevirme

**Neden XMR (Monero)?** Monero blockchain'i tamamen opak — gonderici, alici ve miktar gizli. BTC/USDT chain analysis ile izlenebilir, XMR izlenemez. Bu yuzden gelen parayi XMR'a ceviriyorsun.

### Yontem 1: Trocador.app (ONERILEN — en kolay)

| Ozellik | Deger |
|---------|-------|
| Tip | Swap aggregator (30+ exchange karsilastirir) |
| KYC | YOK (Trocador'da, partner exchange'lere bagli) |
| Hesap | GEREKMEZ |
| Tor | EVET (.onion adresi var) |
| Desteklenen ciftler | BTC→XMR, ETH→XMR, USDT→XMR, LTC→XMR, 100+ coin |
| Fee | %0.5 Trocador + exchange spread (%1-3 toplam) |
| Minimum | Genelde $10-50 (exchange'e gore) |
| Sure | 5-30 dakika |
| Trustpilot | 4.9/5 (264 yorum) |
| KYCnot.me | 4.6/5 |
| URL | https://trocador.app |
| Tor | http://trocadorfyhlu27aefre5u7zri66gudtzdyelymftvr4yjwcxhfaqsid.onion |

**Kullanim:**
1. trocador.app'i ac (tercihen Tor ile)
2. "Send" = USDT (TRC-20), "Receive" = XMR
3. Miktari gir
4. Partner listesinden **"A" veya "B" rated** + **"No KYC"** filtrele
5. En iyi rate'i sec
6. USDT gonder adresini al, Trust Wallet'tan gonder
7. 5-30 dk bekle, XMR Cake Wallet'a gelir

### Yontem 2: UnstoppableSwap / eigenwallet (BTC → XMR, en guvenli)

| Ozellik | Deger |
|---------|-------|
| Tip | P2P atomic swap (tamamen trustless) |
| KYC | YOK, ASLA |
| Hesap | GEREKMEZ |
| Nasil calisir | BTC 2-of-2 multisig'e kilitlenir, XMR kilitlenir, takas yapilir |
| Fee | ~%0.25 (maker spread) |
| Sure | 10-15 dakika |
| Dezavantaj | Sadece BTC→XMR (USDT desteklemez) |
| Platform | Mac/Win/Linux GUI |
| URL | https://unstoppableswap.net |
| GitHub | https://github.com/UnstoppableSwap/core |

**Kullanim:**
1. eigenwallet GUI indir (unstoppableswap.net)
2. Bir maker sec (rate ve likiditeye gore)
3. BTC miktarini gir
4. BTC gonder → 10 dk bekle → XMR cuzdanina gelir
5. Tamamen Tor uzerinden calisir

### Yontem 3: Majestic Bank (direkt, basit)

| Ozellik | Deger |
|---------|-------|
| Tip | Direkt instant swap |
| KYC | YOK |
| Hesap | GEREKMEZ |
| Desteklenen | BTC↔XMR, LTC↔XMR, WOW↔XMR |
| Fee | %2-4 spread |
| URL | https://majesticbank.sc |
| Tor | EVET (.onion var) |

Daha pahali ama en basit: adres gir, BTC gonder, XMR gelir.

---

## 4. Hangi Durumda Hangisini Kullan

| Durum | Kullan | Neden |
|-------|--------|-------|
| USDT geldi (NOWPayments/Cryptomus) | **Trocador** (USDT→XMR) | USDT destekliyor, en iyi rate |
| BTC geldi | **UnstoppableSwap** (BTC→XMR) | Tamamen trustless, en guvenlı |
| Kucuk miktar, hizli | **Trocador** veya **Majestic Bank** | Basit, hizli |
| Buyuk miktar ($1000+) | **UnstoppableSwap** + **Trocador** parcalayarak | Tek seferde buyuk islem dikkat ceker |
| Acil, Tor lazim | **Majestic Bank** (.onion) | En basit Tor swap |

---

## 5. XMR Aldiktan Sonra — Harcama

| Ne icin | Nasil |
|---------|-------|
| VPS odeme (Servury) | Direkt XMR ile ode |
| Domain (Njalla) | Direkt XMR ile ode |
| Mullvad VPN | Direkt XMR ile ode |
| Residential proxy (Servury) | Direkt XMR ile ode |
| BTC/USDT lazimsa | Trocador ile XMR→BTC/USDT swap yap |
| Fiat lazimsa (nadir) | XMR→BTC→P2P satis (Bisq, Robosats, LocalMonero) |

---

## 6. YAPMA Listesi

| YAPMA | Neden |
|-------|-------|
| Geliri dogrudan exchange'e (Binance, Coinbase) gonderme | KYC + chain analysis → kimligin aciga cikar |
| Ayni BTC adresini tekrar tekrar kullanma | Adres iliskilendirme (UTXO analiz) |
| Swap'i kendi IP'nden yapma | VPN veya Tor kullan |
| Tek seferde cok buyuk miktar swap yapma | $500-1000 parcalara bol |
| USDT'yi uzun sure tutma | TRC-20 USDT dondurulabilir (Tether blacklist), hemen XMR'a cevir |
| Seed phrase'i dijital ortamda saklama | KAGIDA yaz, sifrelenmis yerde tut |

---

## 7. Platform Ozet Tablosu

| Platform | Ne Icin | KYC | Fee | URL |
|----------|---------|-----|-----|-----|
| **Trust Wallet** | USDT/BTC/ETH cuzdan | Yok | Ucretsiz | trustwallet.com |
| **Cake Wallet** | XMR cuzdan | Yok | Ucretsiz | cakewallet.com |
| **Trocador** | USDT/BTC/ETH → XMR swap | Yok | %1-3 | trocador.app |
| **UnstoppableSwap** | BTC → XMR atomic swap | Yok | %0.25 | unstoppableswap.net |
| **Majestic Bank** | BTC/LTC → XMR swap | Yok | %2-4 | majesticbank.sc |
| **Feather Wallet** | XMR masaustu cuzdan | Yok | Ucretsiz | featherwallet.org |
| **NOWPayments** | Musteri odemesi kabul | Email | %0.5/tx | nowpayments.io |
| **Cryptomus** | Musteri odemesi kabul | Email (cekim=KYC) | %0.5-1 | cryptomus.com |
| **NexaPay** | Fiat kart odemesi kabul | Email | ~%3-5 | nexapay.one |

---

## 8. Adim Adim Baslatma

1. **Trust Wallet** indir → cuzdan olustur → TRC-20 adresini not et
2. **Cake Wallet** indir → XMR cuzdani olustur → XMR adresini not et
3. **NOWPayments** hesap ac → outcome wallet = Trust Wallet TRC-20 adresi
4. **Cryptomus** hesap ac → payout wallet = Trust Wallet TRC-20 adresi
5. Siteler canli → musteriler ode → USDT Trust Wallet'a gelir
6. USDT gelince → **Trocador** ile USDT→XMR swap → Cake Wallet'a
7. XMR ile VPS/domain/proxy ode

**Toplam kurulum suresi: 15 dakika.**
