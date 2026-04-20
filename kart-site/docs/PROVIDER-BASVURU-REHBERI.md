# Provider Basvuru ve Test Rehberi

> Buvei, WantToPay ve diger provider'lara nasil basvurulur, test edilir, entegre edilir.

---

## 1. BUVEI — GUVENILIRLIK ANALIZI

### Trust Skorlari

| Kaynak | Skor | Yorum |
|--------|------|-------|
| Scamadviser | **82/100** | "Very likely not a scam but legit and reliable" |
| Gridinsoft | **79/100** | "Trusted but Verify" — PCI DSS uyumlu |
| DNSFilter | **Guvenli** | Malware/phishing yok |
| Kaspersky | **Temiz** | Tehdit algilama yok |
| Google Safebrowsing | **Temiz** | |
| BitDefender | **Temiz** | |
| ESET | **Temiz** | |
| Sophos | **Temiz** | |

### Pozitif Sinyaller
- SSL sertifikasi gecerli
- PCI DSS uyumlu (kart verisi guvenligi)
- GoDaddy uzerinden kayitli domain (24 ay+)
- Google Play + App Store uygulamasi var
- 20+ BIN destegi ile genis merchant kapsami
- Blog icerikleri 2025-2026 arasi surekli guncelleniyor (3.2K+ goruntulenme)
- Kayit aninda $5 ucretsiz kart kredi hediyesi

### Negatif / Dikkat
- Tranco'da dusuk siralama (niche market — normal)
- Domain 24 ay (nispeten yeni ama VCC sektoru icin standart)
- Webroot tek uyari (diger 26 provider temiz)
- Reddit'te henuz yaygin kullanici yorumu yok

### Sonuc
**Buvei orta-yuksek guvenilirlikte.** SolvoCard, PST.NET gibi rakiplerle ayni seviyede. Ilk testte **kucuk miktar ($20-50)** ile baslamak yeterli. Fonlari karta yukleyip bir online islem denemek riski minimize eder.

---

## 2. BUVEI — BASVURU ADIMLARI

### Adim 1: Hesap Olusturma (2 dakika)

1. https://buvei.com adresine git
2. **Sign Up** tikla
3. Email + sifre gir
4. Email dogrulama linkine tikla
5. Dashboard'a giris yap
6. **$5 ucretsiz kart kredi** otomatik tanimlanir

### Adim 2: Cuzdana Para Yukle (5-10 dakika)

1. Dashboard'da **Wallet** sekmesine git
2. Desteklenen fonlama yontemleri:
   - **USDT (TRC-20)** — onerilen, dusuk gas fee
   - **USDT (ERC-20)** — yuksek gas fee
3. Gosterilen adrese USDT gonder
4. On-chain confirmation sonrasi bakiye aninda guncellenir
5. **Minimum top-up**: $5

### Adim 3: Ilk Kart Olustur (1 dakika)

1. **Cards** sekmesine git
2. BIN bolgesini sec (US BIN onerilen — global kabul)
3. Kart tipini sec (Visa veya Mastercard)
4. **Issue Card** tikla
5. Gir:
   - Kart adi (ornek: "Test Card 1")
   - Yukleme miktari (ornek: $20)
   - Adet (1)
6. **Create Card** tikla
7. Aninda gorursun:
   - Kart numarasi
   - Son kullanma tarihi
   - CVV
   - Islem gecmisi
   - Bakiye

### Adim 4: Test Islemi Yap

1. Herhangi bir online siteye git (Amazon, Netflix trial, vs.)
2. Kart bilgilerini gir
3. 3D Secure gelirse dashboard'dan onayla
4. Islem sonucunu kontrol et

### Adim 5: API Erisimi Basvurusu (1-2 is gunu)

1. Dashboard'da **API Management** sekmesine git
2. Basvuru formunu doldur:
   - **Proje adi**: "VCC Reseller Platform"
   - **Tahmini aylik harcama**: $500-5000
   - **Kullanim amaci**: "Virtual card reseller — automated issuance for customers"
3. **Submit** tikla
4. 1-2 is gunu icinde onay + API Key gelir
5. API Key ile entegrasyona basla

### Alternatif: Developer Gorusmesi

Daha hizli erisim icin:
1. https://buvei.com/developer adresine git
2. Formu doldur:
   - Name, Company, Email, Country
   - Platforms for Card Usage
   - Average Number of Cards per Month
   - Average Spend Per Month
   - Contact (Telegram onerilen)
3. **Submit Appointment** — gorusme planlaniyor
4. Gorusmede white-label + API detaylari konusulur

### Buvei API Endpointleri (Beklenen)

```
POST /create_card        — yeni sanal kart olustur
GET  /transaction_history — islem gecmisini getir
PATCH /set_limit          — kart limitini ayarla / dondur
POST /topup_card          — karta bakiye yukle
GET  /card_details        — kart bilgilerini getir
POST /freeze_card         — karti dondur
POST /close_card          — karti kapat
```

---

## 3. WANTTOPAY — MEVCUT DURUM

### API Erisimi: YOK (Public)

WantToPay **public API sunmuyor**. Tum islemler Telegram mini-app uzerinden:

```
@WantToPayBot → Menu → Open App → Log In → My Wallet → Add Card
```

### Postman ile Test: MUMKUN DEGIL

WantToPay'in bilinen REST API endpoint'i yok. Sebebi:
- Telegram Mini App icinde WebView olarak calisiyor
- Backend API'leri dogrudan erisime kapali
- Authenticate Telegram session token gerektiriyor

### pryvero.net ve Digerleri Nasil Kullaniyor?

Uc olasilik:
1. **Ozel API anlasmasi**: Yuksek hacimli reseller'lara ozel API veriyorlar (bize de verebilirler — support'a sormak gerek)
2. **Ayni sirketin baska markasi**: WTP Technology Limited altinda farkli Telegram botlari
3. **Manuel / yari-otomatik**: Telegram bot uzerinden toplu siparis + script

### WantToPay'i Manuel Test Etmek

1. Telegram'da `@WantToPayBot` ac
2. **Menu** → **Open App** tikla
3. **Start** → **Log In**
4. **My Wallet** bolumine gir
5. **Add Card** (+) tikla
6. Kart tipini sec:
   - **Prepaid** ($7.90 - $89,250 arasi, non-reloadable)
   - **Easy** ($9.90, reloadable, %2.5 islem ucreti)
   - **Pro** ($34.90, reloadable, $0.50 islem ucreti)
7. Odeme yap (USDT, MIR, SBP, P2P)
8. Kart bilgileri aninda gelir

### WantToPay'a API Erisimi Istegi

1. Telegram'da `@WantToPaySupportBot` ac
2. Mesaj gonder:

```
Hello, we are a virtual card reseller platform and interested in
API access for automated card issuance and management.

We expect ~100-500 cards/month initially.

Could you provide information about:
- API availability and documentation
- Bulk pricing for resellers
- Integration options

Thank you.
```

3. Destek saatleri: **05:00 - 17:00 UTC** (hafta sonlari dahil)
4. Muhtemelen ozel anlasma veya reddedecekler

---

## 4. KARSILASTIRMA: BASVURU ZORLUGU

| | **Buvei** | **WantToPay** | **SolvoCard** | **PST.NET** | **Cardyfie** |
|---|---|---|---|---|---|
| Kayit | Email, 2 dk | Telegram bot | Waitlist | KYC zorunlu | Email + dogrulama |
| API erisimi | Dashboard'dan basvur, 1-2 gun | Yok (ozel anlasma?) | Waitlist | Var ama KYC | Contact sales |
| Ilk kart suresi | **5 dakika** | 10 dakika | Belirsiz | 1-3 gun (KYC) | Belirsiz |
| Test maliyeti | **$5 (hediye kredi)** | $7.90 min | $25 min | $7 min | Belirsiz |
| Fonlama | USDT TRC-20 | USDT, MIR, SBP | BTC,ETH,XMR,USDT | USDT, BTC, SWIFT | Belirsiz |
| Postman test | API alinca evet | Hayir | Waitlist | KYC sonrasi | Sandbox var |

---

## 5. ONERILEN AKSIYON PLANI

### Bugun (30 dakika):
- [ ] Buvei'ye kayit ol: https://buvei.com
- [ ] $20-30 USDT TRC-20 gonder
- [ ] 1 test karti olustur ($10-20)
- [ ] Amazon veya baska bir sitede test odeme yap
- [ ] Sonucu degerlendir (onaylandi/reddedildi)

### Bu hafta (2-3 gun):
- [ ] Buvei API Management'tan basvuru yap
- [ ] WantToPay support'a API erisimi sor (`@WantToPaySupportBot`)
- [ ] SolvoCard waitlist'e basvur: https://solvocard.com/whitelabel
- [ ] API Key gelince kart-site entegrasyonuna basla

### API gelince (1 hafta):
- [ ] `src/lib/wanttopay.ts` → `src/lib/buvei.ts` olarak yeniden yaz
- [ ] Postman collection olustur (Buvei endpointleri)
- [ ] Webhook entegrasyonu kur (islem bildirimleri)
- [ ] Staging ortamda test et

---

## 6. RISK YONETIMI

### Kucuk Basla
- Ilk hafta max **$50** yukle
- 3-5 test karti olustur
- Farkli merchant'larda dene (e-commerce, SaaS, reklam)
- Decline olursa BIN degistirmeyi dene

### Fonlari Koruma
- Tum bakiyeyi Buvei'de birakma
- Ihtiyac kadar yukle, fazlasini cek
- Birden fazla kart olusturup riskleri dagit

### Provider Cokerse
- Buvei primary, WantToPay backup olarak tut
- SolvoCard waitlist'ten cikinca ucuncu secenek
- Musteri fonlari her zaman kendi Supabase DB'de takip et

---

## 7. KODDA NE DEGISECEK

Buvei API geldiginde `kart-site` kodundaki degisiklikler:

```
kart-site/src/lib/
├── wanttopay.ts       → buvei.ts olarak degisecek
├── card-provider.ts   → (yeni) abstraction layer (WantToPay + Buvei)
```

API fonksiyonlari ayni kalacak:
- `createCard()` — kart olustur
- `getCard()` — kart bilgisi getir
- `listCards()` — kartlari listele
- `topupCard()` — bakiye yukle
- `freezeCard()` — dondur
- `getTransactions()` — islem gecmisi

Sadece HTTP endpoint'ler ve auth header degisecek.

---

## SONUC

| Soru | Cevap |
|------|-------|
| Buvei guvenilir mi? | **Evet, 82/100 trust skoru, PCI DSS uyumlu, 26/27 guvenlik taramasi temiz** |
| WantToPay API veriyor mu? | **Hayir (public degil), ozel anlasma sorulabilir** |
| WantToPay Postman ile test edilir mi? | **Hayir, sadece Telegram Mini App uzerinden** |
| Buvei'ye nasil basvurulur? | **buvei.com → Sign Up → Wallet → Card → API Management** |
| Ilk test ne kadar surer? | **5-10 dakika (kayit + $5 hediye kredi + kart)** |
| En dusuk test maliyeti? | **$0 (hediye kredi ile) veya $5 USDT ile** |
