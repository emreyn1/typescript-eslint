# UK Ltd Sirket Kurma Rehberi

---

## VERGI SORUSU: Kar almadimi gostererek %0 vergi olur mu?

**Kisa cevap: Stripe ile para aliyorsan sirket dormant degil — aktif ticaret yapiyorsun.**

Ama vergini minimuma indirebilirsin:

```
Gelir (Stripe'tan gelen):              $5,000
Giderler (gercek, kanitlanabilir):
  - VPS hosting                          -$200
  - Domain yenileme                       -$50
  - Wise Business ucreti                   -$0
  - 1stFormations yillik paket            -$100
  - Yazilim/araclar                       -$100
  - Freelancer odemesi (varsa)            -$500
                                    ─────────
Net kar:                                $4,050
Vergi (%19):                             $770
```

**$5,000 gelirde ~$770 vergi.** Giderlerin ne kadar fazlaysa vergi o kadar az.

**ONEMLI:** Sahte gider gosterme. HMRC kontrol edebilir. Gercek giderleri dus, yeter.

**Ilk yil £1,000'dan az karin varsa:** Vergi neredeyse sifir (£1,000 trading allowance var).

---

---

## ADRES KANITI: Kira/fatura odemiyorsan ne yapacaksin?

**Sorun degil.** Kira veya fatura senin adina olmak zorunda degil. Kabul edilen alternatifler:

| Belge | Detay |
|-------|-------|
| **Banka ekstresi (hesap ozeti)** | Son 3 ay icinde, adin + adresin gorunmeli. EN KOLAY yontem. Bankanin mobil uygulamasindan PDF indir. |
| **Devlet/resmi mektup** | Vergi dairesi, SSK, herhangi bir devlet kurumundan son 3 ay icinde gelen mektup |
| **Universite/okul yazisi** | Ogrenciysen okuldan adresini gosteren resmi yazi |
| **Saglik kurumu mektubu** | Hastane/doktor randevu mektubu (son 3 ay) |
| **Isveren yazisi** | Antetli kagida adin + adresin yazili yazi |

**En kolay yol: Banka hesap ozeti.** Banka hesabin mutlaka vardir. Mobilden son 3 ayin PDF'ini indir, bu yeter.

Kira sozlesmesi veya fatura **gerekmez**. 1stFormations ve Stripe icin banka ekstresi yeterli.

---

## 1stFormations vs IncorpUK: Tam Karsilastirma

### IncorpUK Paketleri

| Paket | Fiyat | Toplam (+ £100 CH) | Onemli ozellikler |
|-------|-------|-------------------|-------------------|
| Basic | £130 | **£230** | Sirket + registered office + HMRC UTR. Service address YOK. |
| StartUp | £180 | **£280** | + Director service address + startup perks |
| Entrepreneur | £250 | **£350** | + Virtual business address + ucretsiz VAT. Secretary YOK. |
| Founders Choice | £400 | **£500** | + Company Secretary + grafik toolkit + trademark indirimi |

### 1stFormations Paketleri

| Paket | Fiyat | Toplam (+ £100 CH) | Onemli ozellikler |
|-------|-------|-------------------|-------------------|
| eSeller | £89.99 | **£190** | Sirket + 3x Londra adresi. Secretary YOK, VAT YOK. |
| Non-Residents | £99.99 | **£200** | + Full Company Secretary + ucretsiz VAT + domain |

### Ayni ozellikleri karsilastir

Senin ihtiyaclarin: Sirket + adresler + Company Secretary + VAT + banka referansi

| Ihtiyac | 1stFormations Non-Residents (£200) | IncorpUK esiti |
|---------|-----------------------------------|----------------|
| Sirket kurulumu | ✓ | ✓ (hepsi) |
| 3x Londra adresi | ✓ (Covent Garden WC2) | ✓ Entrepreneur'dan itibaren (£350) |
| Company Secretary | **✓ DAHIL** | Sadece Founders Choice'da (£500) |
| Ucretsiz VAT kaydi | ✓ | Entrepreneur'dan itibaren (£350) |
| Banka referansi | ✓ (WorldFirst) | ✓ (hepsi) |
| Domain | ✓ (.co.uk 1 yil) | ✗ |
| HMRC UTR | ✓ | ✓ (hepsi) |
| Stripe/PayPal rehberlik | Genel | Detayli (IncorpUK'nin artisi) |

### Yillik yenileme maliyeti

| | 1stFormations | IncorpUK |
|---|--------------|----------|
| 2. yil | ~£311 (adresler £161 + secretary £149.99) | Bilinmiyor (net fiyat yok) |
| Companies House confirmation | £13 | £13 |

### SONUC: Hangisini sec?

**1stFormations Non-Residents = £200** → Secretary + VAT + 3 adres dahil
**IncorpUK ayni ozellikleri almak icin = £500** (Founders Choice)

**1stFormations Non-Residents £200'e, IncorpUK ancak £500'de yetisiyor.**

IncorpUK'nin tek gercek artisi: Non-resident odakli destek ve Stripe/PayPal basvuru rehberligi daha detayli. Ama bu £300 farka degmez — Stripe basvurusunu kendin yapabilirsin (zaten bu dokumanda adim adim yazili).

### KESIN TAVSIYE: 1stFormations Non-Residents Package (£200)

Neden:
- **En dusuk fiyat** ayni ozellikler icin
- **Company Secretary dahil** (£149.99 deger) — yillik dosyalamalari onlar yapar
- **VAT kaydi ucretsiz** — ileride lazim olursa bedava
- **Covent Garden WC2 adresi** — prestijli Londra adresi
- **22,000+ Trustpilot yorumu**, 4.8/5 puan — en guvenilir
- **Domain dahil** (.co.uk 1 yil)

eSeller (£190) da var ama £10 fazlasiyla Non-Residents'ta Company Secretary + VAT aliyorsun. £10 farkla £220 degerinde ekstra hizmet.

### BILINEN RISKLER VE COZUMLERI

**Risk 1: Stripe non-resident'lardan ekstra belge isteyebilir**

Stripe bazen director'in kendi ulkesindeki adresini reddedebiliyor. Cozum:
- Basvurudan ONCE sitenin canli ve calisiyor olmasi SART (bos/placeholder site olmasin)
- Business description net yaz: "Online digital services — SMS verification and virtual card sales"
- SIC code tutarli olsun (62020 veya 62090)
- Banka ekstresi hazir olsun (son 3 ay, adin + adresin gorunur)
- Reddedilirse: Stripe destek'e yazip ek belge gonder, cogu durumda 2. denemede onaylanir
- Alternatif: Wise Business'in kendi Stripe entegrasyonu var, onu dene

**Risk 2: 2. yil yenileme ucreti yuksek (~£311)**

Ilk yil £200, 2. yil ~£311. Bu "hidden cost" degil ama bilinmeli. Cozumler:
```
Secim 1: Sadece ihtiyacin olanlari yenile
  - Registered Office (zorunlu): £39/yil
  - Service Address: £26/yil → toplam £65/yil (secretary iptal)

Secim 2: Full yenileme
  - 3 adres: £161/yil
  - Company Secretary: £149.99/yil → toplam £311/yil

Secim 3: 2. yil baska provider'a gec
  - Sadece registered office adresini ucuz bir yerden al (~£30-50/yil)
  - Companies House'da adres degisikligi bildir (ucretsiz)
```
Tavsiye: Ilk yil full paket kullan. 2. yilda gelir durumuna gore secretary'yi iptal edip sadece adresleri yenile (£65/yil).

**Risk 3: Stripe tamamen reddederse ne olur?**

Cok nadir ama olabilir. B plani:
- PayPal Business (ayni UK Ltd ile) → kart kabul edebilirsin
- Wise Business uzerinden manuel banka transferi kabul et
- Kripto odeme (NOWPayments) devam etsin
- 1-2 ay sonra Stripe'a tekrar basvur (daha fazla islem gecmisi ile)

---

## SIRKET KURMA ADIMLARI

### Gerekli seyler (onceden hazirla)

- Pasaport (gecerli)
- Adres kaniti (son 3 ay — banka ekstresi en kolay, yukaridaki tabloya bak)
- Email adresi
- Sirket adi (onceden dusun, benzersiz olmali)

---

### Adim 1: Sirket adi sec

1. https://find-and-update.company-information.service.gov.uk/company-name-availability ac
2. Istedigin ismi yaz, baskasinin kullanip kullanmadigini kontrol et
3. Uygun ise ilerle

Ornekler:
```
"SwiftDigital Services Ltd"
"NovaPay Solutions Ltd"
"TechBridge Digital Ltd"
```

Tavsiye: Genel bir isim sec, tek bir ise baglanma ("SMS" veya "Card" gibi kelimeler koyma).

---

### Adim 2: 1stFormations'da kayit ol

1. https://www.1stformations.co.uk/package/non-residents/ ac
2. **"Non-Residents Package"** sec (£99.99 + £100 Companies House fee = **£199.99 toplam**)
   - Icinde: Sirket kurulusu + 3x Londra adresi + Company Secretary + VAT kaydi + domain + banka referansi
   - Neden bu paket? Yukaridaki karsilastirma tablosuna bak.

---

### Adim 3: Formu doldur

1stFormations'da:
```
1. Sirket adi gir
2. Director bilgileri:
   - Adin, soyadin
   - Dogum tarihi
   - Uyruk
   - Ev adresin (kendi ulkendeki adres, gizli tutulur)
   - Service address: 1stFormations saglayacak (UK adresi)

3. Shareholder bilgileri:
   - Ayni kisi (sen)
   - 1 adet share, £1 deger

4. SIC code (is kodu):
   - 62020 — "Information technology consultancy activities"
   - VEYA 62090 — "Other information technology service activities"
   - Genel tut, tek bir ise baglama

5. Odeme yap (kart ile)
```

---

### Adim 4: ID dogrulama

Kasim 2025'den beri Companies House ID dogrulama **zorunlu**:

```
1. 1stFormations seni yonlendirecek
2. Pasaportunu tarat/fotografini cek
3. Selfie cek (canli dogrulama)
4. 5-10 dakika suruyor
5. Otomatik onaylanir (genelde aninda)
```

---

### Adim 5: Sirket hazir (3-5 gun)

1stFormations sana email ile gonderecek:
```
✓ Certificate of Incorporation (sirket kuruluş belgesi)
✓ Company Registration Number
✓ Registered Office Address (UK adresi)
✓ Memorandum & Articles of Association
✓ Share Certificate
```

Bu belgeleri sakla — Stripe ve banka icin lazim.

---

### Adim 6: UTR numarasi al

Sirket kurulduktan sonra HMRC otomatik olarak mektup gonderir:
```
- 10 haneli UTR (Unique Taxpayer Reference)
- 1stFormations'in UK adresine gelir
- 1stFormations sana dijital olarak iletir
- 2-3 hafta surebilir
- Stripe icin SART DEGIL ama vergi icin lazim
```

---

### Adim 7: Wise Business hesabi ac

1. https://wise.com/business/ ac
2. "Open a business account" tikla
3. Bilgileri gir:
   ```
   - Business type: Private Limited Company
   - Country of registration: United Kingdom
   - Company name: [sirket adin]
   - Company number: [Companies House'dan gelen numara]
   - Director bilgileri: [senin bilgilerin]
   ```
4. Belgeler yukle:
   - Pasaport
   - Certificate of Incorporation
5. **1-2 gunde onaylanir**
6. GBP + USD + EUR hesap numaralarin hazir

---

### Adim 8: Stripe hesabi ac

1. https://dashboard.stripe.com/register ac
2. Ulke: **United Kingdom** sec
3. Bilgileri gir:
   ```
   - Business type: Private limited company (Ltd)
   - Legal business name: [sirket adin]
   - Company number: [Companies House numara]
   - Business address: [1stFormations'in verdigi UK adresi]
   - Business website: [sitenin URL'si — calisiyor olmali!]
   - Industry: "Software" veya "Digital services"
   - Business description: "Online digital services platform"
   ```
4. Kisisel bilgiler:
   ```
   - Adin, dogum tarihin
   - Ev adresin (kendi ulkendeki)
   - Pasaport yukle
   - Adres kaniti yukle (son 3 ay)
   ```
5. Banka bilgileri:
   ```
   - Wise Business'in GBP sort code + account number'ini gir
   ```
6. **1-2 gunde aktif**

---

### Adim 9: PayPal Business hesabi ac (opsiyonel)

1. https://www.paypal.com/uk/business ac
2. "Sign Up" tikla
3. Bilgileri gir:
   ```
   - Business type: Private Limited Company
   - Company name + number
   - Pasaport + adres kaniti yukle
   ```
4. Wise Business'i baglantili banka olarak ekle
5. **1-3 gunde aktif**

---

## ZAMAN CIZELGESI

| Gun | Ne yapilir |
|-----|-----------|
| Gun 1 | 1stFormations'da sirket basvurusu + ID dogrulama |
| Gun 3-5 | Sirket onaylandi, belgeler geldi |
| Gun 5 | Wise Business basvurusu |
| Gun 6-7 | Wise onaylandi |
| Gun 7 | Stripe basvurusu |
| Gun 8-9 | Stripe aktif, kart kabul edebiliyorsun |
| Gun 9 | PayPal Business basvurusu (opsiyonel) |
| Gun 10-12 | PayPal aktif |
| Hafta 3-4 | UTR numarasi gelir (vergi icin, acil degil) |

**Toplam: ~10 gunde Stripe + PayPal + Wise aktif.**

---

## MALIYET OZETI

| Kalem | Ucret | Tek seferlik/Yillik |
|-------|-------|-------------------|
| 1stFormations Non-Residents Package | £200 (~$250) | Tek seferlik |
| Wise Business | $0 | Ucretsiz |
| Stripe | $0 | Islem basi %1.5+%0.20 |
| PayPal | $0 | Islem basi %2.9+£0.30 |
| Companies House yillik confirmation | £13 (~$17) | Yillik |
| **TOPLAM ilk yil** | **~$270** | |

---

## SONRA NE YAPILIR

```
Stripe aktif olunca:
  1. getsmsnow.com'a "Pay with Card" butonu ekle
  2. kart-site'a "Pay with Card" butonu ekle
  3. Stripe checkout entegrasyonu (Next.js icin cok kolay)
  4. Test odemesi yap
  5. Canli al
```

---

## OPSEC NOTU

UK Ltd = yasal kimligin. Bu sirket uzerinden:
- getsmsnow.com (SMS) → kullanabilirsin (smspool.net de Hollanda sirketi ile Stripe kullaniyor)
- kart-site → kullanabilirsin
- NyumatFlix (film) → KULLANMA (telif hakki riski, Stripe hesabini kapatir)
- embed-api → KULLANMA (NyumatFlix ile bagli)

Film sitesi icin kripto odeme (NOWPayments) + reklam geliri (pop-under) kullan, Stripe'a baglama.






VERGILERRRRRRRR_________------------------____________________________





Buyuk gelirde vergini yasal yollarla minimize etmenin tum yontemleri:

1. Ekipman ve Teknoloji (AIA — %100 ayni yil dusulur)

Laptop                          $3-5K
Monitör (2 tane al, "dual screen")  $1-2K
Telefon (is telefonu)           $1-1.5K
Tablet (test cihazi)            $500-1K
Klavye, mouse, dock, kablolar   $300-500
Yedekleme diski / NAS           $300-500
Webcam + mikrofon (toplanti)    $200-400
Sandalye (ergonomik, is icin)   $500-1K
Masa                            $300-700
UPS (kesintisiz guc kaynagi)    $200-400
2. Yazilim Abonelikleri (yillik, %100 gider)

Cursor / IDE                    $200/yil
GitHub / GitLab                 $100/yil
Domain yenilemeleri             $50-100/yil
VPS / hosting                   $200-600/yil
Cloudflare Pro                  $240/yil
Vercel / Netlify Pro            $240/yil
Figma / tasarim araci           $150/yil
ChatGPT / AI araclar            $240/yil
VPN (is icin)                   $100/yil
Antivirüs / güvenlik yazilimi  $100/yil
Proje yonetim araci (Linear vs) $100/yil
3. Evden Calisma Giderleri ("Use of Home as Office")

Secim A: Basitleştirilmis yontem
  - HMRC flat rate: £6/hafta = £312/yil (kanit gerekmez)
Secim B: Gercek oran hesabi
  - Ev toplam m²: 80m²
  - Calisma odasi: 10m² = %12.5
  - Internet faturasi %12.5'i
  - Elektrik faturasi %12.5'i
  - Isitma faturasi %12.5'i
  - Kira bile bu oranda dusulur (kira senin adina olmasa bile hesaplanir)
4. Seyahat ve Egitim

Is ile ilgili seyahat          → ucak, otel, taksi
Is toplantisi yemekleri        → %100 (musteri ile)
Online kurslar (Udemy vs.)     → is ile ilgiliyse %100
Konferans biletleri            → %100
Kitaplar (teknik)              → %100
5. Profesyonel Hizmetler

Muhasebeci ucreti              $400-600/yil
1stFormations yenileme         $200-400/yil
Hukuk danismanligi             → gerekirse %100
Tercume hizmeti                → %100
6. Pazarlama ve Reklam

Google Ads                     → %100
Sosyal medya reklamlari        → %100
SEO araci (Ahrefs, Semrush)    → %100/yil
Logo / grafik tasarim          → %100
7. BUYUK GELIR ICIN EN ETKILI STRATEJI: Director Salary + Dividends

Bu en onemli kisim. Sirket sana iki sekilde odeme yapabilir:

Yontem 1: Her seyi kar olarak birakmak (KOTU)
  Gelir: £80,000
  Giderler: -£15,000
  Kar: £65,000
  Corporation Tax (%19): £12,350 → cebine £52,650
Yontem 2: Maas + Temettü kombinasyonu (AKILLI)
  Gelir: £80,000
  Giderler: -£15,000
  Director maasi: -£12,570 (UK tax-free allowance)
  Kalan kar: £52,430
  Corporation Tax (%19): £9,962
  Temettü: £42,468
  Temettü vergisi: £0 (ilk £1,000 vergisiz)
                   %8.75 (£1,001 — £50,270 arasi)
  
  Toplam vergi: ~£13,590 → cebine £51,410
  AMA: Maasi "gider" olarak dusurdun, 
  corporation tax azaldi.
  Temettü vergisi NI (National Insurance) icermiyor.
  Net tasarruf: ~£2,000-4,000/yil
Kisaca buyuk gelir stratejisi:

1. Kendine £12,570 maas ode (vergisiz esik)
2. Gercek giderleri maksimize et (ekipman, yazilim, ev ofis)
3. Kalan kari temettü olarak al (%8.75 vergi)
4. £300-500'e muhasebeci tut — kendini 10x odetir
YAPMA listesi:

Sahte gider uydurmak (HMRC ciddi ceza keser)
Kisisel harcamalari sirket gideri gostermek
Ailene "is icin" maas odeyip gider gostermek (HMRC bunu bilir)
Kripto gelirini gizlemek (Stripe/Wise kayitlari acik)