# Kart Provider Karşılaştırması — Otomatik Müşteriye Teslim Edilebilir Seçenekler

> Son güncelleme: Nisan 2026
> Kriter: REST API ile programatik kart oluşturma, kripto fonlama, KYC/KYB yok veya minimal, kart-site'a entegre edilebilir.

---

## 1. Uygun Providerlar (API + No-KYC + Kripto)

### #1 — Buvei (buvei.com) ★ ÖNERİLEN

| Özellik | Detay |
|---------|-------|
| API | Full REST API, iyi dökümante, sandbox mevcut |
| Kart oluşturma | Anında Visa/Mastercard, bulk issuance destekli |
| KYC (biz) | Minimal — kayıt + form, 1-2 gün onay |
| KYC (müşteri) | YOK — biz issuer olarak gözüküyoruz |
| Fonlama | USDT (TRC-20, ERC-20) |
| Multi-BIN | 20+ BIN desteği (ABD, AB, global) |
| Reloadable | EVET |
| White-label | EVET — kendi markan ile kart çıkartabilirsin |
| Ek özellikler | Freeze/unfreeze, limit ayarlama, webhook, real-time tracking, transaction query |
| Başvuru | buvei.com/developer → form doldur → 1-2 gün API key |

### #2 — Wanttopay (wanttopay.net) — MEVCUT ENTEGRASYON

| Özellik | Detay |
|---------|-------|
| API | REST API mevcut (apiKey auth) — dökümantasyon sınırlı |
| Kart oluşturma | PAN, CVV, expiry döner |
| KYC (biz) | YOK — email ile kayıt |
| KYC (müşteri) | Prepaid/Easy/Smart için YOK, Pro için EVET |
| Fonlama | USDT (TRC-20) |
| Reloadable | EVET (Smart tipi) |
| Ana kanal | Telegram bot (@WanttopayBot), API ikincil |
| Sorun | API key edinme süreci belirsiz, dökümantasyon yetersiz |
| Mevcut durum | `src/lib/wanttopay.ts` dosyasında entegre, API key ile test edilmedi |

### #3 — Ezzocard (ezzocard.finance) — YEDEK

| Özellik | Detay |
|---------|-------|
| API | JSON API mevcut (`POST /ai-agent/process.php`) |
| Kart oluşturma | Anında Visa/Mastercard |
| KYC (biz) | YOK |
| KYC (müşteri) | YOK |
| Fonlama | BTC, ETH, USDT, LTC, SOL, TRX |
| Reloadable | **HAYIR** — tek kullanımlık prepaid kartlar |
| Fiyat aralığı | $5 — $1000 face value |
| Toptan indirim | EVET — düzenli müşterilere progressive discount |
| Sorun | Non-reloadable = müşteri kart alır, harcar, kart biter |

### #4 — Cardyfie (cardyfie.com) — İLERİSİ İÇİN

| Özellik | Detay |
|---------|-------|
| API | Full REST API + Sandbox (`POST /api/sandbox/v1/card/issue`) |
| White-label | EVET |
| KYC (biz) | Business Plan gerekli — sales ile görüşme şart |
| KYC (müşteri) | Belirsiz — "verify your identity" ibaresi var |
| Fonlama | Belirsiz — muhtemelen banka + kripto |
| Fiyat | Contact sales — şeffaf değil |
| Durum | Profesyonel ama fiyat/KYC belirsizliği var |

---

## 2. Elenen Providerlar

| Provider | Neden Elendi |
|----------|-------------|
| **AnoCard** | API yok — sadece Telegram bot ile manuel kart oluşturma. Programatik entegrasyon yapılamaz |
| **PlasBit** | API yok. Dashboard/mobil uygulama üzerinden manuel işlem |
| **Bitnob** | API mevcut ama müşteri KYC zorunlu (kimlik belgesi, BVN vs.). İş modelimize uymuyor |
| **UQPAY / FlashCard** | Enterprise çözüm, KYC/KYB zorunlu, şirket kurulumu gerekli |
| **Privacy.com** | Sadece ABD, SSN + banka hesabı gerekli. Global müşteriye hizmet veremez |
| **Stripe Issuing / Marqeta** | KYC/KYB zorunlu, şirket gerekli |

---

## 3. Karşılaştırma Tablosu

| | Buvei | Wanttopay | Ezzocard | Cardyfie |
|---|---|---|---|---|
| **API kalitesi** | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ |
| **KYC (biz)** | Minimal | Yok | Yok | Business plan |
| **KYC (müşteri)** | Yok | Yok (Smart) | Yok | Belirsiz |
| **Kripto fonlama** | USDT | USDT | BTC/ETH/USDT/LTC | Belirsiz |
| **Reloadable** | Evet | Evet | **Hayır** | Evet |
| **Multi-BIN** | 20+ BIN | Sınırlı | Sınırlı | Muhtemelen |
| **White-label** | Evet | Hayır | Hayır | Evet |
| **Webhook** | Evet | Belirsiz | Hayır | Evet |
| **Sandbox** | Evet | Hayır | Hayır | Evet |
| **Entegrasyon süresi** | 1-2 gün | Hazır (test gerek) | 1 gün | Belirsiz |

---

## 4. Neden Buvei İlk Sırada?

### Wanttopay'e göre avantajları:

1. **Dökümantasyon**: Buvei'nin API dökümantasyonu açık ve detaylı. Wanttopay'in API'si resmi olarak dökümante edilmemiş, apislist.com gibi 3. parti kaynaklardan öğreniliyor.

2. **Sandbox/Test ortamı**: Buvei sandbox sunuyor — gerçek para harcamadan test edebilirsin. Wanttopay'de bu yok.

3. **Multi-BIN desteği**: 20+ farklı BIN ile kartlar oluşturabilirsin. Bu, ödeme başarı oranını ciddi artırır (bazı siteler belirli BIN'leri reddeder). Wanttopay'de BIN seçimi sınırlı.

4. **White-label**: Müşteri "Buvei" değil, senin markanı görür. Wanttopay'de bu mümkün değil.

5. **Webhook desteği**: Kart işlemleri, bakiye değişiklikleri real-time bildirim alırsın. Otomasyon için kritik.

6. **Ölçeklenebilirlik**: Bulk issuance, takım yönetimi, transaction reporting — büyüdükçe altyapı yetişir.

7. **Güvenilirlik**: Kurumsal yapı, Google/App Store'da uygulama, $5 ücretsiz kredi ile başla.

### Wanttopay'in avantajı:

- **Zaten entegre**: `wanttopay.ts` kodda hazır. API key alınırsa 0 geliştirme süresiyle canlıya alınabilir.
- **Bilinen yapı**: Telegram bot ile iletişim kolay, destek hızlı.

### Neden Ezzocard yedek?

- Kartlar **non-reloadable** — müşteri bir kez kullanır, kart biter. Reloadable kart modeli (bakiye yükle, harca, tekrar yükle) bizim iş modelimize daha uygun.
- Ama tek kullanımlık kart satmak isteyen müşteriler için ek seçenek olarak sunulabilir.

---

## 5. Fiyatlandırma Detayları

### Buvei

| Kalem | Ücret |
|-------|-------|
| Kayıt | Ücretsiz ($5 kart açma kredisi hediye) |
| Kart oluşturma | Düşük (kesin rakam API başvurusu sonrası) |
| İşlem ücreti | Şeffaf, gizli ücret yok |
| FX (döviz) | Rekabetçi oran |
| Aylık bakım | Belirtilmemiş (muhtemelen yok veya düşük) |
| Fonlama | USDT TRC-20/ERC-20, düşük komisyon |

**Bizim satış fiyatımız**: Basic $8, Smart $15 → Maliyete göre %50-100 margin hedeflenebilir.

### Wanttopay

| Kart Tipi | Oluşturma Ücreti | Aylık Bakım | Top-up Komisyon | 3DS | Reloadable |
|-----------|-------------------|-------------|-----------------|-----|------------|
| Easy | Düşük | Yok | — | Hayır | Hayır |
| Prepaid | Düşük | Yok | — | Hayır | Hayır |
| **Smart** | **$25.30** | **$6/ay (Plus abonelik)** | **%9** | **Evet** | **Evet** |
| Pro (HK) | Daha yüksek | $6/ay | %9 | Evet | Evet |
| Pro (USA) | Daha yüksek | $6/ay | %9 | Evet | Evet |

**Sorun**: Smart kart $25.30 oluşturma + $6/ay bakım → bizim $15'lık satış fiyatıyla **zarar ederiz**. Easy/Prepaid tipi ucuz ama reloadable değil ve 3DS yok.

### Ezzocard

| Kart Tipi | Fiyat | Süre | Reloadable | 3DS |
|-----------|-------|------|------------|-----|
| Standart Visa | $5-$20 (face value'ya göre) | 24 ay | Hayır | Bazılarında yok |
| Pink (Mastercard) | $100-$1000 | 6 ay | Hayır | Sınırlı |
| Magenta (Visa) | $100-$1000 | 6 ay | Hayır | Sınırlı |
| Azure (CAD) | $200-$999 | — | Hayır | Sınırlı |

**Toptan indirim**: Düzenli alımlarda progressive discount. Destek ile iletişime geçilmeli.

### Cardyfie

| Plan | Detay |
|------|-------|
| Individual | Sandbox erişimi, sınırlı |
| Business | Production erişimi, yüksek limitler, API — fiyat için sales ile görüşme |

---

## 6. Kart Başarı Oranı Karşılaştırması

| Provider | Desteklenen Servisler | Başarı Oranı (tahmini) | Neden? |
|----------|----------------------|------------------------|--------|
| **Buvei** | Google Ads, Meta Ads, TikTok, AWS, Netflix, Spotify, Amazon, genel e-ticaret | **%85-95** | Multi-BIN routing ile en uygun BIN seçilir, reddedilme azalır |
| **Wanttopay Smart** | Booking, Airbnb, Cloudflare, Patreon, Apple Pay (kısmi) | **%60-75** | Sınırlı BIN, bazı servislerde "doesn't fit" |
| **Wanttopay Easy** | Daha az servis destekli | **%40-60** | 3DS yok, birçok site reddeder |
| **Ezzocard** | PayPal, Google Play, GoDaddy, eBay, Skype | **%60-70** | Non-reloadable prepaid, bazı siteler reddeder |

> Not: Başarı oranları servise göre değişir. Wanttopay'in kendi test tablosunda birçok servis "🚫" (doesn't fit) veya "➖" (test edilmedi) olarak işaretli. Buvei 20+ BIN ile bu sorunu minimize eder.

---

## 7. Bizim İşe Uygunluk Özeti

### Neden Buvei bizim işe en uygun:

1. **No-KYC iş modeli**: Müşteriye KYC sormuyoruz → provider da müşteriye KYC sormamalı → Buvei ✓
2. **Kripto fonlama**: NOWPayments'tan gelen geliri USDT olarak direkt Buvei'ye yönlendirebiliriz → sıfır fiat temas
3. **Reloadable kartlar**: Müşteri bir kez kart alıp tekrar tekrar bakiye yükleyebilir → recurring revenue
4. **API kalitesi**: Profesyonel REST API, mevcut `wanttopay.ts` şablonuyla 1-2 günde `buvei.ts` yazılır
5. **Multi-BIN**: Müşterilerin kartları daha az reddedilir → daha az destek talebi, daha mutlu müşteri
6. **White-label**: "PrivacyCards" markası altında kart çıkartırız, Buvei görünmez
7. **Maliyet**: Wanttopay Smart'ın $25.30 + $6/ay maliyetine karşın Buvei'nin düşük maliyeti → daha yüksek margin
8. **Ölçekleme**: 100 müşteriden 10.000'e çıktığında altyapı sorun çıkarmaz

### Strateji:

```
Phase 1 (Hemen):
  → Buvei'ye API başvurusu yap (buvei.com/developer)
  → Wanttopay Telegram bot'a yaz, API key iste
  → Hangisi önce gelirse onu entegre et

Phase 2 (1-2 hafta):
  → İkinci provider'ı da entegre et (yedeklik)
  → Ezzocard'ı tek kullanımlık kart seçeneği olarak ekle

Phase 3 (Büyüme):
  → Cardyfie white-label değerlendir
  → Wallester/Sunrate (şirket kurulumu sonrası) enterprise çözüm
```

---

## Dipnotlar

### [1] Wanttopay Fiyat Sorunu
Wanttopay Smart kart maliyeti ($25.30 oluşturma + $6/ay bakım + %9 top-up komisyon) bizim $15'lık satış fiyatını aşıyor. Easy/Prepaid tipleri ucuz ama 3DS ve reloadable desteği yok. Bu nedenle **Wanttopay ile kar marjı çok düşük veya negatif** olabilir.

### [2] Ezzocard Non-Reloadable Sınırlaması
Ezzocard kartları tek kullanımlık. Müşteri $50'lık kart alır, harcar, kart biter. Yeni alışveriş = yeni kart. Bu model bazı müşteriler için uygundur (gizlilik odaklı tek seferlik alımlar) ama ana iş modelimiz reloadable kartlar olmalı.

### [3] Buvei API Başvuru Süreci
1. buvei.com'da hesap oluştur
2. Dashboard → API Management → başvuru formu doldur
3. Proje adı, tahmini aylık hacim, kullanım amacı belirt
4. 1-2 iş günü içinde API key gelir
5. Sandbox'ta test et → production'a geç

### [4] Multi-BIN Neden Önemli?
Farklı online servisler farklı BIN'leri kabul eder veya reddeder. Örneğin:
- Netflix ABD BIN kabul eder, Hong Kong BIN reddedebilir
- Google Ads belirli ülke BIN'lerini tercih eder
- 20+ BIN ile en uygun BIN'i seçerek ödeme başarı oranı %85-95'e çıkar

### [5] White-Label Neden Önemli?
Müşteri kart detaylarında "Buvei" değil "PrivacyCards" görür. Bu:
- Marka güveni artırır
- Müşteri doğrudan Buvei'ye gidip bizi bypass edemez
- Profesyonel görünüm sağlar

### [6] OPSEC Notu
Her provider için **ayrı NOWPayments hesabı** kullan. getsmsnow.com ve kart-site aynı hesabı paylaşmasın. Provider'lara kayıt olurken Mullvad VPN + residential IP kullan.
