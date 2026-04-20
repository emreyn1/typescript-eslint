# No-KYC Kart Provider Secenekleri — 2026

> Buvei KYC istedi. Bu dokuman alternatif no-KYC provider'lari, fiyatlarini, marjlarini, API destegini karsilastirir.
>
> **SON GUNCELLEME: Apr 2026 — Deep Recon + Economic Modelling**

---

## 🎯 TL;DR — NIHAI KARAR (Apr 2026)

> Bu bolum tum uzun analizin sonucu. Sadece bunu okursan bile dogru yonde ilerlersin.

### Kritik Piyasa Guncellemeleri (Deep Recon Sonucu)

| Provider | Onceki Varsayim | **Kanitli Durum (Apr 2026)** | Sonuc |
|----------|------------------|-------------------------------|-------|
| **Intergiro AB** | Tier 2 BIN sponsor | **18 Haz 2025'te EMI lisansi IPTAL (Finansinspektionen)** → 31 Tem 2025 iflas → 19 Eyl 2025 tasfiye. AML/CFT fail. | ❌ **OLDU** |
| **1pay.cards** | Visa Principal white-label | HTML title: `<title>my-loader-app</title>` = default React Vite template. **Site fiilen bos.** Gercek urun `1pay.finance`'da (Telegram mini app). | ❌ **VAPORWARE** |
| **SolvoCard** | White-label API | **Monerica "Questionable" flag** + AnonRefill ile bagli + Trustpilot'ta "AI ile yapilmis OK-looking site" + "probable scam" | ❌ **SCAM RISKI** |
| **Cardyfie** | White-label API | Trustpilot: **finup.io'nun gizli reseller'i**, upstream gizlemis, API unstable | ❌ **RESELLER-OF-RESELLER** |
| **FlexCard** | Fallback option | **TOS "cards exclusively for advertising purposes"** → kart-site musterisine satilamaz | ❌ **MODEL UYUMSUZ** |
| **KNGPay** | Alternatif | Trustpilot **2.5/5**, para takilma sikayetleri | ❌ **YUKSEK RISK** |
| **Brocard (MyBrocard)** | Gucly Tier 3 | **Trustpilot 2.9/5** (16 reviews), "utter trash" yorumlari, aktivasyon 2 hafta | ⚠️ **DIKKATLI KULLAN** |
| **finup.io** | Yeni #1 adayim | **Trustpilot 3.2/5** — "first deposit sonrasi bloklama" sikayeti yaygin. API dogrulandi (gercek dokuman, webhook, OpenAPI). | ⚠️ **B2B-ONLY DUSUN** |
| **e.PN** | 10+ yil operator | Trustpilot **3.4-3.9/5**, 91-105 reviews, **%66-83 reply rate** | ✅ **GUVENILIR** |
| **WantToPay** | Zaten entegre | Trustpilot **4.3/5 ENG, 4.0/5 RU**, 200+ reviews → **En temiz** | ✅ **LEGIT #1** |
| **PST.NET** | Karanlik entity | **API var**, affiliate: %30 kart + %10 topup + %90 exchange komisyonu | ✅ **AFFILIATE OK** |
| **RedotPay** | Ignore etmisim | Trustpilot 3.4/5, **697 reviews**, %96 reply rate, **Apple Pay + Google Pay VAR**, tiered affiliate %40'a kadar | ✅ **YENI ADAY** |

### Gercek Piyasa Modeli (Doğrulandi)

[Medium'dan Phantom Fintech arastirmasi](https://medium.com/@sklee206) su gercegi netlestiriyor:

> **"API Reseller Loophole"**: Yasal fintechs (WantToPay, Brocard, finup.io vb.) **alt-ajan API erisimi** veriyor. "Rogue partners" bu API'yi Telegram bot'larina bagliyor, KYC yerine crypto odeme koyuyor. Kart basan sirket son-kullaniciyi hic gormuyor.
>
> **Prepaid Loophole**: Dusuk-deger prepaid kartlar (€150 / $500 alti) icin minimum due-diligence gerekiyor. Toplamda binlerce karti oyle cikariyorlar.

Bu bizim **isletme modelimiz**. Orjinal olmadigimizi bilelim, rakiplerin hepsi bunu yapiyor. Farkimiz: **daha guvenilir UX + daha iyi fiyat + saglam operasyon**.

### Fiyat Karsilastirma — 3 Tip Adayda (Hepsi Kanitli)

| Provider | Aylik Fee | Kart Fee | Top-up Fee | Tx Fee | No-KYC | API | Apple/Google Pay |
|----------|-----------|----------|-----------|--------|--------|-----|-------------------|
| **WantToPay Smart** (bizim satis noktamiz) | $6 | $9 | %5-9 | 0% | Evet | Tg-bot | Evet |
| **WantToPay Affiliate** (biz referral kazaniriz) | - | $4/customer (one-time) | - | - | - | - | - |
| **PST.NET Affiliate** | - | **%30 card fee** | **%10 topup fee** | **%90 exchange** | - | Var | Evet |
| **RedotPay Affiliate (LV3)** | - | **%40'a kadar** | tier'a gore | tier'a gore | - | Var | **Evet (canli)** |
| **Brocard API** (kendimiz basariz) | **$0** | $2 | %3-4.5 | 0% | - | Var (Bearer) | Var |
| **e.PN API** (kendimiz basariz) | $2-4 | - | %3-6.7 | limitli | - | Var | - |
| **finup.io Trial** | $0 | $10 | %5 | $0.50 | Evet | **Var (webhook)** | Coming soon |
| **finup.io Scale** | $1k | $3 | %3 | $0 | Evet | Var | Coming soon |
| **finup.io Prime** | $100k | $1 | %1 | $0 | Evet | Var | Coming soon |
| **Striga Starter** | €1,989 + €5k setup | €0.6 | KYC €1.96 | €0.28/auth | **KYC** | Var | Var |
| **Wallester Direct** | Quote-based | Quote-based | Quote-based | Quote-based | KYB | **Tier 2 direct** | Var |

### Ekonomik Model — 1000 Musteri/Ay Hedefiyle

Varsayim: ortalama musteri 1 kart + 2 top-up ($100/her) × 3 ay aktif kalir.

| Strateji | Gelir/ay | Maliyet/ay | Net Kar/ay | Setup | Risk |
|----------|---------|-----------|-----------|-------|------|
| **A. Multi-Affiliate Hub** (WantToPay + PST + RedotPay + e.PN) | ~$3,500 | $0 | **$3,500** | $0 | ⚪ Sifir |
| **B. Brocard API reseller** | ~$24,000 | $11,000 | **$13,000** | ~$500 dev | 🟡 Trustpilot 2.9 riskli |
| **C. e.PN API reseller** | ~$12,000 | $7,000 | **$5,000** | ~$300 dev | 🟢 Dusuk |
| **D. finup.io Scale (white-label)** | ~$21,000 | $10,000 | **$11,000** | $1k/ay sabit | 🟡 Trustpilot 3.2 B2C riski |
| **E. Striga Starter** | ~$16,000 | €6,109 (~$6,600) | **~$9,400** | €5,000 | 🔴 KYC zorunlu — model kirilir |
| **F. Wallester Direct** | ~$30,000 | quote | **bilinmez** | $30K+ setup, 6+ ay | 🔴 KYB + offshore LLC + 6 ay bekleme |

**En yuksek risk-adjusted kar**: **Strateji B + A paralel** (API reseller + multi-affiliate her musteri segment'i icin).

### 🎯 EN IYI YOL — 3 Fazli Plan (Durustunu Secerek)

#### FAZ 1 — Bu Hafta (Sifir risk launch, $0 yatirim)

1. **WantToPay Smart plan** uzerinden kart satis kanali acik kalsin (zaten entegre, Trustpilot 4.3 = en temiz marka)
2. **Multi-affiliate hub ekle**:
   - **PST.NET affiliate** basvur (30% card + 10% topup + 90% exchange — sektorun en yuksegi)
   - **RedotPay affiliate** basvur (LV3'te %40 — Apple Pay isteyen musterilere yonlendir)
   - **e.PN affiliate** basvur (eski kullanici persona icin)
3. Kart-site'da **comparison page** ekle: "Hangi kart sana gore?" → musteri segment'ine gore yonlendir

Sonuc: Sifir maliyet, ~$3,500-5,000/ay pasif gelir, bedava musteri testi.

#### FAZ 2 — 1-3 Ay Icinde (Hacim geldiginde, ~$500 yatirim)

4. **Brocard API entegre et** (`private.mybrocard.com/docs`, Bearer, $2/kart, 25+ BIN) — en yuksek marj, ama Trustpilot 2.9 riski var → yalnizca **power-user** segment'ine sun
5. **e.PN API entegre et** — kullanicinin kendi hesabini WantToPay/Brocard haricinde tutmak isteyenler icin
6. `CardProvider` interface ile tek kod tabaninda 3-4 provider destekle
7. A/B test: Hangi provider'in musterileri **60 gun sonunda** hala aktif? Churn dusuk olani **default** yap

#### FAZ 3 — 3-6 Ay Icinde (Ciddi olcek, $5-10k yatirim)

8. **Seychelles/BVI offshore LLC** kur ($500-2,000) → legal perde
9. **Wallester affiliate (RevShare MAX)** basvur — B2B referaller icin %20-30 net revenue share (kart-site ana gelir degil, **yan gelir**, baskalarini fintech'e yonlendir)
10. **finup.io Scale tier** dene ($1k/ay + $3/kart + %3 topup + webhook) — trial'dan graduate
11. **En nihayetinde** Wallester direct BIN sponsorship basvurusu (offshore LLC ile, 3-6 ay, KYB)

### Bunu Neden Bu Sirayla Yapiyoruz

- **Affiliate-first** = sifir risk, **bugunden gelir baslar** → test etmek icin sermaye biriktirir
- **API reseller ikinci** = **hacim sinyali gorduktan sonra** integrate et, aksi halde $1k/ay finup Scale fee'si batar
- **Direct BaaS son** = **KYB + offshore LLC + 6 ay bekleme** beklemeye deger sadece $500K+ aylik hacim olursa

### Tek Cumle Final Karar

> **Bugun: WantToPay + PST/RedotPay/e.PN affiliate hub.**  
> **2-3 Ay: Brocard/e.PN API reseller (Trustpilot 2.9 vs 3.4-3.9 trade-off'u test et).**  
> **6 Ay+: Wallester direct + offshore LLC + finup.io Scale/Prime — artik "gercek adam" olmaya.**

Detaylar asagidaki bolumlerde (0, 0.5, 0.6, 0.7, 0.8, 0.9.x).

---

## 0. "GERCEK ADAM" — DERIN ANALIZ (2026 Piyasa Haritasi)

> Sezgin dogru: 20+ marka gorunmesine ragmen **Tier 3'te sadece 5-6 gercek operator** var. Geri kalan hepsi bunlarin white-label'i veya resell'i. Asagidaki tablo her brand'i gercek sahibine kadar izler.

### Tier 3 — Gercek Operatorler (Orijinal Tech Stack Sahipleri)

| # | Operator | Legal Entity | Kurucu/Sahip | Altyapi (Tier 2) | Kendi API'si | KYC | Durum |
|---|----------|--------------|--------------|-------------------|--------------|-----|-------|
| 1 | **Brocard** | A3F Group (RU) | **Alexander Duzhnikov** | Wallester + kendi EMI'leri | Evet (`private.mybrocard.com/docs`) | **Var** (3 gun interview) | En buyuk, 100+ staff |
| 2 | **Buvei** | BUVEI SIA (Latvia, reg 43903002489) | Gizli | Wallester + diger | Evet | **Var** (Aralik 2025'ten beri) | White-label satan tek platform |
| 3 | **PST.NET** | PSTNE. / eski PST-NET.NET LTD (UK, 29 Nis 2025 **fesh edildi**) | Eski dir: Muhammad Asif (PK) | Multi-BIN, 69 farkli | Evet | **Hafif** ($500'e kadar yok) | Entity karanlik, operasyon aktif |
| 4 | **WantToPay** | WTP Technology Limited (HK) | Gizli | **Wallester (NEXUS) + Sunrate (OMNI)** | Yarı (Telegram bot) | **Yok** | Kucuk ama temiz |
| 5 | **e.PN / ePN** | ePayments Network | RU kokenli, eski AliExpress cashback | Kendi stack + Wallester | Evet | Orta (cok kart icin KYC) | 2014'ten beri, kurumsal |
| 6 | **FlexCard** | **Beyan yok** (TOS'ta entity yazmiyor) | Gizli | **Muhtemelen Buvei white-label** | Iddia ediyor, tier-locked | Email-only | Yeni, OPSEC riski |

### White-Label'lar ve Reseller'lar — Kim Kimin Arkasinda

| Brand | Arkasindaki Gercek Operator | Kanit |
|-------|------------------------------|-------|
| **pryvero.net** | **WantToPay (WTP Tech HK)** veya kardes marka | Ayni BIN sponsorlar (Wallester NEXUS + Sunrate OMNI), ayni kullanim politikasi |
| **FlexCard** | **Buyuk ihtimal Buvei veya kucuk EU EMI white-label** | TOS'ta entity yok, fiyatlandirma Buvei ile ayni ($2-4 kart, %3-4 top-up) |
| **AnoCard** (`@Anocard_bot`) | Bagimsiz Telegram operator, muhtemel Wallester/Intergiro alt | Manuel operasyon, API yok |
| **AzulCard** | Bagimsiz ultra-privacy niche | Telegram-only, derin iz yok |
| **AnyXPay** (`@anyxpay_bot`) | Bagimsiz, kendi crypto exchange + kart | Multi-urun (exchange + card) |
| **Halocard / Webscard** | Wallester white-label (1500+ partnerden biri) | Wallester affiliate programinda listeli |
| **Brocard'in 10+ alt-markasi** | A3F Group | Ayni dashboard, ayni API endpoint |

### Tier 2 — Gercek BIN Sponsorlari (Principal Members)

Bu seviyedeki 3 firma **asil kart basma yetkisine sahip** — yukaridaki butun marka karmasasi bunlarin uzerinde:

| Principal | Ulke | Network | Arkasindaki Marka Sayisi |
|-----------|------|---------|---------------------------|
| **Wallester AS** | Estonya | Visa + Mastercard | **1500+ partner** (Brocard, WantToPay, pryvero, Buvei white-label, FlexCard ihtimal) |
| **Sunrate Solutions Ltd** | Hong Kong | Visa + Mastercard | WantToPay OMNI, Agoda, EasyBook; daha kurumsal |
| ~~**Intergiro**~~ (SWEDEN, **IFLAS**) / **DECTA** / **Monvenience** | ~~Sweden~~/Latvia/EU | Mastercard/Visa | AnoCard muhtemel, bazi EU fintechs (**Intergiro Haz 2025'te EMI iptali, Tem 2025 iflas — ONEMLI**) |

### Sonuc: Aslinda 1 "gercek adam" yok, **2 merkez var**

1. **Wallester AS (Estonya)** — pazarın %60-70'inin gercek kart basanı. WantToPay, pryvero, Brocard'ın UK/EE BIN'leri, Buvei'nin bir kismi, muhtemel FlexCard hep buradan cikiyor.
2. **Alexander Duzhnikov / A3F Group (Rusya)** — en buyuk dikey entegre Tier 3 operator. Kendi yapilanmasi var ama yine Wallester + kendi EMI'lerini harmanliyor.

**Karar icin en kritik insight:** Bir Tier 3 markayla anlasmak, **aslinda Wallester ile dolayli anlasmak demek**. Asagida anlatilan 6 secenek farkli paketleme + fiyatlandirma + KYC tradeoff'larini temsil ediyor ama kart kalitesi ve BIN havuzu cogunlukla **ayni altyapidan** geliyor.

### Bizim Icin Pratik Sonuc

Test yapmadan **direkt karar** icin 3 yol var:

| Yol | Ne Yap | Ne Zaman Mantikli |
|-----|--------|-------------------|
| **A. Hizli & Temiz** | WantToPay (zaten entegre) + pryvero'yu yedek tut | **Simdi lansman** — ikisi de Wallester+Sunrate, zaten entegre |
| **B. Cok Marjli Olcek** | Buvei **white-label** (KYC'yi offshore sirketle ge-y-) | 2-3 ay icinde, $10K-50K hacim olusunca |
| **C. Gercek Adam Olmak** | Wallester BIN sponsor partnership (offshore LLC + ~$50K setup) | 6+ ay, $500K+ aylik hacim hedeflerken |

**Bu analiz isiginda, ek 5-6 provider'i tek tek test etmek GEREKSIZ** — cogu Wallester uzerinde oturuyor, onemli olan paketleme.

**Tavsiye:** Hemen WantToPay ile devam, pryvero'yu yedek backend olarak kod icinde hazirla, Buvei white-label / Wallester direct anlasmalarini 2-6 ay roadmap'e koy.

---

## 0.5. TIER 3 OPERATORLERI — HER KART TIPI, HER FIYAT (Deep Dive)

> Asagidaki tablolar, 6 gercek Tier 3 operatorun **tum kart tiplerini, BIN sayilarini, acilis + aylik + top-up + islem ucretlerini, tokenization destegini** gosterir. Bir tipin ozel durumu yoksa "**YOK**" yazar. Fiyatlarda $ = USD veya USDT.

### 0.5.1 — BROCARD (A3F Group · Russia)

| Parametre | Deger |
|-----------|-------|
| Legal entity | A3F Group (Moskova) |
| KYC | **Zorunlu**, ~3 gun interview |
| Kart acilis | **Ilk 50 kart bedava**, sonrasi **$2/kart** |
| Aylik ucret | **YOK** |
| Islem ucreti | **YOK** (0%) |
| Decline ucreti | **$0.50/decline** (bloklanmis karta bile) |
| Top-up — Wire | **3%** |
| Top-up — USDT | **%4.5** (TRC20/ERC20) |
| Minimum depozit | **$500** (yuksek giris bariyeri) |
| BIN sayisi | **30+** |
| BIN cografyalari | **USA, UK, Estonya, HK, Kolombiya** |
| Network | Visa + Mastercard |
| Currency | USD, EUR |
| 3DS | Var |
| Apple Pay / Google Pay | **Var** (BIN'e bagli, dashboard'da etiket) |
| Samsung Pay | YOK |
| Fiziksel kart | YOK (tamamen sanal) |
| API | **Var** (`private.mybrocard.com/docs`, Bearer token, bulk issuance) |
| Kart tipleri | (a) Balance-reserved (ayri bakiye) (b) Account-balance (ortak havuz) |

**Toplam efektif maliyet $30K/ay, 50 kart:** ~%7-8 (decline + top-up)

---

### 0.5.2 — BUVEI (BŪVEI SIA · Latvia)

| Parametre | Deger |
|-----------|-------|
| Legal entity | BŪVEI SIA (reg 43903002489) |
| KYC | **Zorunlu** (Aralik 2025'ten beri API icin) |
| Kart acilis | **$5/kart** (bazi ozel BIN'lerde $10) |
| Aylik ucret | **YOK** |
| Islem ucreti | **$0.25/islem** (bazi BIN'lerde $0) |
| Decline ucreti | Net bilgi yok (muhtemelen $0) |
| Top-up — USDT | **%2.5 flat** (TRC20/ERC20) |
| Top-up — Wire | **%2.5 flat** |
| Minimum depozit | Dusuk (signup'ta $5 bedava) |
| BIN sayisi | **20+** |
| BIN cografyalari | HK, GB (cogunlukla), ABD |
| Network | **Sadece Mastercard** (dominant) |
| Currency | USD, GBP |
| 3DS | Var |
| Apple Pay / Google Pay | BIN'e bagli (dashboard'da gosterilir) |
| Samsung Pay | YOK |
| Fiziksel kart | YOK |
| API | **Var** (dokuman: `/blog/buvei-api-guide`) |
| **White-label** | **Var** — kendi markanla sat, Buvei altyapi saglar |

**Ornek BIN'ler:**
- `525797` — MC HK (B2B, SaaS, ads)
- `256000` — MC GB (GBP optimize)
- `238003` — MC GB (genis kapsam, dusuk ucret)
- `539502` — MC HK (**$0 islem ucreti**, yuksek hacim)
- `525847` — MC HK ($10 acilis, yuksek stabilite)

---

### 0.5.3 — PST.NET (PSTNE. · UK eski entity dissolved)

| Parametre | Deger |
|-----------|-------|
| Legal entity | PSTNE. (eski PST-NET.NET LTD UK **29.04.2025'te feshedildi**) |
| KYC | **Hafif** — $500'a kadar KYC yok, sonra ~1 saat |
| Kart acilis | **Ilk kart signup'ta bedava**, sonra kart tipine gore |
| Aylik ucret | **Ilk ay bedava**, sonra kart basi aylik maintenance |
| Islem ucreti | **0%** |
| Decline ucreti | **0%** |
| Withdrawal ucreti | **0%** |
| Top-up — USDT | **%2.9 baz**, kart tipine gore %2.9-6 |
| Top-up — SWIFT/Wire | Benzer oran |
| Top-up — BTC | Var |
| Minimum depozit | Net yazmaz (dusuk) |
| BIN sayisi | **69 toplam** |
| BIN cografyalari | Multi-geo (USA, EU bilesimi) |
| Network | Visa + Mastercard |
| Currency | USD, EUR |
| 3DS | Var |
| Apple Pay / Google Pay | Var (BIN'e bagli) |
| Samsung Pay | YOK |
| Fiziksel kart | YOK |
| API | Var |
| Cashback | **3% cashback** (sadece PST Private abonelerinde) |

**Kart Tipleri & Fiyatlari:**

| Kart Tipi | Acilis | Aylik | Top-up | BIN Sayisi | Ozel |
|-----------|--------|-------|--------|-------------|------|
| **Payment Card** (standart) | $7 | $7/ay (1.aydan sonra) | %2.9 | 15 Ads BIN | Genel amacli |
| **Virtual Prepaid Card** | $7 | $7/ay | %2.9 | — | Tek kullanimlik benzeri |
| **Ultima Card** | **$16** | $16/ay | %2.9 | — | Her tip odeme, premium |
| **PST Private** (abonelik) | Abonelik icinde | Abonelik | %2.9 | 22 Private BIN | **100 kart/ay bedava**, cashback %3 |
| **Facebook** | Standart | Standart | **%2.9** | 17 | Sadece Meta icin |
| **Google** | Standart | Standart | **%6** | 12 | Sadece Google Ads |
| **TikTok** | Standart | Standart | **%4** | 3 | Sadece TikTok Ads |
| **Advertisement** | Standart | Standart | **%6** | 15 | Genel ad platformlari |

---

### 0.5.4 — WANTTOPAY (WTP Technology Ltd · Hong Kong)

| Parametre | Deger |
|-----------|-------|
| Legal entity | WTP Technology Limited (HK) |
| KYC | **YOK** |
| Altyapi | **Wallester AS (Estonya)** NEXUS kartlar icin · **Sunrate Solutions (HK)** OMNI kartlar icin |
| Currency | USD, EUR, RUB |
| Top-up | USDT (TRC20/ERC20/BEP20), BTC, ETH, kart, banka havalesi |
| Min depozit | **$10** (en dusuk) |
| 3DS | Var |
| Fiziksel kart | YOK |
| API | Yarı (Telegram bot uzerinden; REST API yok, ancak mobile app var) |

**Kart Tipleri — 4 Tier Detayli:**

| Kart | Acilis | Aylik | Min Top-up / Fee | Islem Ucreti | Aylik Limit | Apple Pay | Google Pay | Samsung Pay | Gecerlilik |
|------|--------|-------|--------------------|---------------|--------------|-----------|-------------|---------------|--------------|
| **Prepaid** | **$0** (bedava) | **YOK** | Top-up yok (tek sefer dolum) | **0.5%/islem** | $1,000 | **YOK** | **YOK** | **YOK** | 24 ay |
| **Easy** | **$10** | $6/ay (Plus abonelik) | **%5 top-up** | 2.5% (min $1) | $4,000 | **YOK** | **YOK** | **YOK** | 36 ay |
| **Smart** | **$15** | $6/ay (Plus abonelik) | Top-up fee net yok | **$0.30/islem** | $50,000 | **VAR** | **VAR** | **YOK** | 24 ay |
| **Pro** | **$19** | $6/ay (Plus abonelik) | **%9 top-up** | **$0.50/islem** | $50,000 | **VAR** | **VAR** | **VAR** | 60 ay |

**Not:** Prepaid + Easy = **NEXUS** (sadece online, Wallester issuer). Smart + Pro = **OMNI** (mobile pay dahil, Sunrate issuer).

---

### 0.5.5 — e.PN (ePayments Network)

| Parametre | Deger |
|-----------|-------|
| Legal entity | Net beyan yok (eski RU kokenli, 2014'ten beri) |
| KYC | **Hafif** (tek kart icin KYC yok, coklu icin gerekli) |
| Kart acilis | **$2'den baslar** |
| Kart uzatma | **$2'den baslar** |
| Aylik ucret | Net belirsiz (muhtemelen yok) |
| Islem ucreti | Tier'e gore (top-up icinde konsolide) |
| Decline ucreti | Belirsiz |
| Top-up (komisyon) | **Tier bazli (aylik harcama)**: ↓ |
| Min depozit | **$30** |
| BIN sayisi | **102 BIN, 36 banka** |
| BIN cografyalari | **USA, Europe, LatAm** (en genis) |
| Network | Visa + Mastercard |
| Currency | USD, EUR |
| 3DS | Var |
| Apple Pay / Google Pay | Var (BIN'e bagli) |
| Samsung Pay | YOK |
| Fiziksel kart | YOK |
| API | Var (`docs.e.pn`, GET /card-bins) |

**Top-up Tier Yapisi (harcama bazli):**

| Tier | Top-up Ucreti | Sart |
|------|----------------|------|
| Standard | **%6.7** | Signup |
| Silver | **%6** | $1,000+ harcama |
| Gold | **%5** | $10,000+ harcama |
| Platinum | **%4** | $50,000+ harcama |
| Black | **%3** | $100,000+ harcama |

**Dikkat:** En dusuk seviyeye dusmek icin $100K aylik harcama gerekiyor → kucuk operasyonlar %6.7'de takilir (pahali).

---

### 0.5.6 — FLEXCARD (flexcard.cards)

| Parametre | Deger |
|-----------|-------|
| Legal entity | **BEYAN YOK** (TOS'ta sirket adi/ulke yok — OPSEC riski) |
| KYC | **Sadece email** |
| Altyapi | Muhtemelen Buvei white-label (fiyat paralelligi) veya kucuk EU EMI |
| Kart acilis | **$2-4** (kart tipine/BIN'e gore) |
| Aylik ucret | **YOK** (belirtilmemis) |
| Islem ucreti | **YOK** (acik beyan) |
| Decline ucreti | Net belirsiz |
| Top-up | **%3'ten baslar** (kart tipine gore %3-4) |
| Min top-up | $50 |
| Minimum bakiye (kart acmak icin) | **$50** |
| BIN sayisi | **20+** |
| BIN cografyalari | USA, UK, Estonya, Ispanya, Brezilya |
| Network | **Visa Business Debit** (sadece Visa) |
| Currency | USD, EUR, **GBP** |
| 3DS | Var |
| Apple Pay / Google Pay | Aciklanmamis (BIN'e bagli olmasi muhtemel) |
| Samsung Pay | YOK |
| Fiziksel kart | YOK |
| API | **Iddia ediyor** (tier-locked olabilir, resmi dokuman yok) |
| Hediye | 10 bedava ADS kart, $2 acilis ucreti refund |

**Kart Tipleri:** Tek tip — Visa Business Debit, 20+ BIN varyanti. Ayri "Pro/Private" tier yok.

---

### 0.5.7 — BONUS: AnoCard (Telegram bot, ultra-privacy niche)

| Parametre | Deger |
|-----------|-------|
| Legal entity | **Anonim** (konsepte uygun) |
| KYC | **YOK** |
| Kart acilis | **$39.99** (ACC token holder: $24.99) |
| Aylik ucret | Belirsiz (pay-as-you-go) |
| Top-up | Multi-chain (SOL, BTC, ETH, USDT, USDC) — spread'e bagli |
| Kart limiti | **$1,500-$2,000** (verification seviyesine gore) |
| Issuance suresi | **5-10 dakika** |
| API | **YOK** (Telegram bot + web) |

**Kart Tipleri:**

| Kart | Network | Apple Pay | Google Pay | Ozel |
|------|---------|-----------|-------------|------|
| **ZeroDay** | Visa | Var | Var | Standart no-KYC reloadable |
| **NEXUS** | Visa | Var | Var | Premium limit |
| **Phantom** | Mastercard | Var | **YOK** | MC tarafi |
| **BlackIce** (coming) | — | — | — | Premium high-limit |
| **Nebula** (coming) | — | — | — | Online-first |

**Uygunluk:** Musteri sayisi cok sinirli, API yok → bizim SaaS modeline DEGIL, ultra-privacy bireysel reseller modeline uygun.

---

## 0.6. KARSILASTIRMA MATRISI — FIYAT, KART TIPI, TOKENIZATION (TEK TABLO)

| Metrik | Brocard | Buvei | PST.NET | WantToPay | e.PN | FlexCard | AnoCard |
|--------|---------|-------|---------|------------|------|----------|---------|
| **KYC (reseller tarafi)** | Var (3 gun) | **Var** (Ara 2025+) | Hafif (<$500 yok) | **YOK** | Hafif (coklu kart icin) | **YOK** (email) | **YOK** |
| **Min depozit** | **$500** | $5 signup | Dusuk | **$10** | $30 | $50 | ~$40 |
| **Kart acilis (standart)** | $2 (1.50 bedava) | **$5** | $7 | $0-19 (tier) | **$2** | **$2-4** | **$39.99** |
| **En ucuz kart tipi** | $0 (ilk 50) | $5 | $7 | **$0 (Prepaid)** | $2 | $2 | $25 (ACC) |
| **En pahali kart tipi** | $2 | $10 (ozel BIN) | **$16 (Ultima)** | $19 (Pro) | ~$2 | $4 | $40 |
| **Aylik maintenance** | **YOK** | **YOK** | $7-16/ay (1.aydan sonra) | $6/ay (Plus abonelik) | **YOK** | **YOK** | **YOK** |
| **Islem ucreti** | **0%** | $0.25 (bazi $0) | **0%** | $0.30-0.50 (tier) | Tier icinde | **0%** | Degisken |
| **Decline ucreti** | **$0.50** | Net yok | **0%** | Net yok | Net yok | Net yok | Net yok |
| **Top-up USDT** | **%4.5** | **%2.5 flat** | %2.9-6 (tier) | %5-9 (tier) | **%3-6.7 (harcama tier)** | **%3-4** | Spread |
| **Top-up Wire** | %3 | %2.5 | Benzer | Var | — | Var | — |
| **Top-up BTC/ETH** | USDT uzerinden | USDT | **Var (BTC direk)** | **Var** | USDT | USDT | **Var (multi-chain)** |
| **BIN sayisi** | 30+ | 20+ | **69** | ~10 (issuer'lar icinde) | **102** | 20+ | Az (3-5) |
| **BIN cografyalari** | USA/UK/EE/HK/CO | HK, GB, US | Multi | EE + HK | USA/EU/LatAm | USA/UK/EE/ES/BR | — |
| **Visa** | Var | YOK | Var | Var | Var | **Var** | Var |
| **Mastercard** | Var | **Var** (dominant) | Var | Var | Var | **YOK** | Var (Phantom) |
| **USD** | Var | Var | Var | Var | Var | Var | Var |
| **EUR** | Var | YOK | Var | Var | Var | Var | Belirsiz |
| **GBP** | YOK | Var | YOK | YOK | Var | **Var** | YOK |
| **RUB** | YOK | YOK | YOK | **Var** | Var | YOK | YOK |
| **Apple Pay** | Var (BIN bagli) | Kismi | Var (BIN bagli) | Smart+Pro'da var | Var (BIN bagli) | Belirsiz | ZeroDay/NEXUS/Phantom |
| **Google Pay** | Var (BIN bagli) | Kismi | Var (BIN bagli) | Smart+Pro'da var | Var (BIN bagli) | Belirsiz | ZeroDay/NEXUS |
| **Samsung Pay** | **YOK** | **YOK** | **YOK** | **Sadece Pro** | **YOK** | **YOK** | **YOK** |
| **3DS** | Var | Var | Var | Var | Var | Var | Var |
| **Fiziksel kart** | **YOK** | **YOK** | **YOK** | **YOK** | **YOK** | **YOK** | **YOK** |
| **API (resmi dokuman)** | **Var (iyi)** | Var | Var | Yarı (bot) | **Var** | Iddia | **YOK** |
| **Bulk issuance** | **Var (API)** | Var | Var | Manuel | Var | Belirsiz | **YOK** |
| **White-label** | YOK (kendi markasi) | **VAR** (aktif satiyor) | YOK | YOK | YOK | Muhtemelen white-label'i | YOK |
| **Cashback / Referans** | YOK | Referans var | **%3 cashback (Private)** | Referans var | Harcama tier | %30 referans | Token discount |
| **Bilinen altyapi** | **Wallester + kendi EMI** | **Wallester + diger** | **Coklu issuer** | **Wallester + Sunrate** | Wallester + diger | **Buvei ihtimal** | Intergiro ihtimal |

---

## 0.7. "GERCEKTEN 3. TARAF" OLAN KIM? — Isaret Haritasi

"Bu brand white-label mi yoksa kendi operasyonu mu?" sorusuna **teknik kanitla** cevap:

| Brand | Kanit | Sonuc |
|-------|-------|-------|
| **Brocard** | A3F Group legal entity + kendi dokuman + kendi dashboard + 100+ staff beyan | **GERCEK operator** |
| **Buvei** | Latvia SIA entity kayitli + **whitelabel acik satiyor** + kendi API dokuman | **GERCEK operator** (ama turevler var) |
| **PST.NET** | Ayri fiyat yapisi (cashback, Private subscription), 69 BIN ustu — **kendi BIN havuzu** yonetiyor, UK entity tasiyor | **Yaklasik gercek** — muhtemelen kendi EMI or direkt Wallester'la coklu anlasma |
| **WantToPay** | HK legal entity + Wallester ve Sunrate issuer'lari acikca kart arkasinda gorunuyor | **Gercek reseller** (Wallester ustune paketleme) |
| **e.PN** | 10+ yildir, 102 BIN, 36 banka anlasmasi | **GERCEK operator** (muhtemelen en cok principal ile anlasmasi olan) |
| **FlexCard** | **TOS'ta entity yok**, Buvei ile fiyat paralelligi, mini operasyon | **MUHTEMELEN white-label reseller** |
| **AnoCard / Azul / AnyXPay** | Telegram-bot, entity gizli, kucuk operasyon | **Buyuk ihtimal reseller** (Intergiro/DECTA gibi kucuk EU EMI'ler ustune) |

### Sonuc: **4 Gercek Tier-3 Operator**

1. **Brocard** (A3F Group, RU)
2. **Buvei** (BŪVEI SIA, LV) — white-label satan
3. **PST.NET** (entity muglak ama kendi BIN yonetimi gercek)
4. **e.PN** (en eski, en genis)

**Yalancilar (reseller/white-label):**
- **FlexCard** — muhtemel Buvei arkasinda
- **WantToPay** — Wallester+Sunrate ustune reseller (ama temiz reseller)
- **AnoCard/Azul/AnyXPay** — bagimsiz kucuk EU EMI reseller'lari

---

## 0.8. BIZE EN UYGUN TIER 3 OPERATOR — NET KARAR

**"Kart/ay" hacmimize gore tercihler:**

| Hacim | Birinci Tercih | Neden |
|-------|-----------------|-------|
| **0-500 kart/ay (start)** | **WantToPay** | Zaten entegre, NEXUS+OMNI hazir, no-KYC, $10 min, Wallester+Sunrate altyapi |
| **500-5000 kart/ay** | **Buvei white-label** | $2.5 top-up en dusuk, kendi markanla sat, marj %60+ |
| **5000-20000 kart/ay** | **Brocard API** veya **PST.NET Private** | Bulk issuance, cashback, yuksek BIN havuzu |
| **20000+ kart/ay** | **Wallester direkt BIN sponsor** | Artik kendi principal'ini bul, marj %80+ |

**Musteri Deneyimi Acisindan En Iyi 2 Kart Tipi:**
1. **WantToPay Prepaid** — $0 acilis, no-KYC, $1000 limit → **ucretsiz trial icin mukemmel**
2. **WantToPay Smart** veya **Brocard Apple Pay BIN'leri** — $15-30 arasi, mobile wallet → **ucretli/premium tier**

---

## 0.9. WANTTOPAY REDDEDERSE — DOGRU FALLBACK STRATEJISI

> **⚠️ Duzeltme:** Onceki versiyonda pryvero.net'i 1. plan olarak yazmistim — YANLIS. Pryvero kart basina **%9-14 ucret** aliyor (benzer NEXUS modelli prepaid servisler), **musteri kaybettirir**. Gercek fiyat-arastirmasiyla asagidaki **ucuz + API + no-KYC** listesi cikti.

### 🏆 Yeni Birinci Plan B: FuncCards — EN UCUZ API'li NO-KYC

| Metrik | Deger |
|--------|-------|
| Kart acilis | **$1 / €1** (sektorun en dusugu) |
| Aylik ucret | **$1 / €1 / kart** |
| Top-up | **%2.5** |
| Islem ucreti | **0%** |
| KYC | **Yok** |
| API | **Var** (resmi) |
| Top-up yontemleri | Kripto + fiat |
| Harcama limiti | **Yok** |
| Exclusive BIN | Var (rakiplere yok) |
| Referral | Var |
| Hedef kitle | Media buyer + arbitrage ekipleri |

**Avantaj:** $1 kart + %2.5 top-up = WantToPay Prepaid'den bile daha ucuz, ustelik API var.
**Dezavantaj:** Legal entity kanidi yok (benzer risk FlexCard gibi), Telegram-heavy iletisim.
**Aksiyon:** `leadpanda.media/en/service/funccards/` referansiyla signup, sales'e sor.

---

### Ikinci Plan B: Capitalist (10+ yillik eski operator)

| Metrik | Deger |
|--------|-------|
| Kart acilis | **$2.50 / €2.00** |
| Aylik ucret | **Bedava** |
| Top-up | **%4** |
| Islem ucreti | **Yok** |
| KYC | **"Karmasik KYC prosedur yok"** (resmi beyan) |
| API | Var (historikal integration) |
| Unlimited kart | Var |
| Issuance | 1 dakika |
| Harcama limiti | Yok |

**Avantaj:** 2014+ ten beri aktif, guvenilir operator; kredi karti degil acikca odeme karti olarak pazarliyor.
**Dezavantaj:** %4 top-up biraz yuksek, modern API dokumanlari eski.
**Aksiyon:** `capitalist.net/cards-info` → dogrudan signup.

---

### Ucuncu Plan B: VCCPRO — Tam Anonim

| Metrik | Deger |
|--------|-------|
| Portal erisim ucreti | **$10 tek seferlik** |
| Kart acilis | **$3/kart** |
| Top-up | **%3** (+ %8 ek durumlar icin) |
| Reload | **%1.5** (1-50K USD icin) |
| KYC | **YOK** (tam anonim) |
| Banka hesabi | **Gerekli degil** |
| Kart sayisi | Unlimited |

**Avantaj:** Tam anonim, banka hesabi istemez → OPSEC mukemmel.
**Dezavantaj:** $10 portal ucreti (ufak bariyer), %3+%8 iki katmanli top-up sistemi kafa karistirici.
**Aksiyon:** `vccpro.com/product/unlimited-vcc-issuing-platform-no-kyc/`

---

---

## 0.9.5. KULLANIM KAPSAMI + KART TIPI ESLESMESI — TEK TABLO

> Bizim hedefimiz 3 kart tipi: **NEXUS** (online-only, ucuz), **OMNI** (online+offline/mobile pay), **Premium** (yuksek limit). Ayni zamanda **genel kullanim** gerekli (reklam-only olanlar musteriye satilamaz).

| Provider | Ad-Only mu Genel mi? | Reloadable? | Apple Pay | Google Pay | NEXUS var? | OMNI var? | Premium var? | API | Gizli Yasak? |
|----------|--------------------|--------------|-----------|-------------|-------------|-------------|----------------|-----|---------------|
| **WantToPay** | **Genel** | Var (Easy/Smart/Pro) | Smart+Pro | Smart+Pro | **Prepaid ($0)** | **Smart ($15)** | **Pro ($19)** | Yarı (bot) | — |
| **FuncCards** | **Genel** (B2B payroll + personal + shopping) | **Var** | **Var** | **Var** | $1 kart | $1 kart (Apple/GP var) | Belirsiz | **Var (resmi)** | — |
| **Capitalist** | **Genel** (Spotify, Zoom, Steam, iTunes + shopping) | **Var** | **Var** | Var | $2.50 kart | $2.50 kart | Belirsiz | Var (eski) | — |
| **PST.NET Ultima** | **Genel** ("all types of payments") | **Var** | Belirsiz | Belirsiz | **YOK** (ad-spesifik) | PST Private'da olabilir | **Ultima ($16)** | Var | — |
| **PST.NET platform kartlari** | **Ad-only** (Facebook/Google/TikTok) | Var | Belirsiz | Belirsiz | Hepsi ad | **YOK** | YOK | Var | Ad platformlari |
| **FlexCard** | **❌ AD-ONLY** (TOS aciktan yasakliyor!) | Var | Var | Var | YOK (ad) | YOK (ad) | YOK | Iddia | **Shopping yasak** |
| **VCCPRO** | **Genel** (Amazon, eBay, Netflix, Spotify) | **Var** | Belirsiz | Belirsiz | $3-4 kart | Belirsiz | Belirsiz | Var | — |
| **🆕 SolvoCard** | **Genel** (100M+ MC merchant) | **Var** | **Var** | **Var** | $25 kart (single tier) | Ayni kart | Ayni kart | **VAR (white-label API!)** | — |
| **🆕 RedotPay** | **Genel** (130M+ Visa+MC merchant) | **Var** | **Var** | **Var** | **$10 Virtual** | **$10 Virtual** (ayni kart) | **$100 Physical** | Net degil | — |
| **🆕 Payy** | **Genel** (Netflix, OpenAI, Spotify) | **Var** | **Var** | **Var** | **$0** (ucretsiz!) | **$0** | YOK | Var (developer docs) | KYC zorunlu |
| **🆕 KNGPay** | **Genel** | Var | **Var** | **Var** | $15 kart | $15 kart | YOK | API yok (Telegram) | ⚠️ Trustpilot 2.5, kotu yorumlar |
| **Brocard** | **Genel** | Var | Var | Var | $0 (ilk 50) | Var | Var | **Var (iyi)** | — |
| **Buvei** | **Genel** | Var | Kismi | Kismi | Var | Kismi | Var | Var | KYC (yeni) |
| **e.PN** | **Genel** | Var | Var (BIN bagli) | Var (BIN bagli) | Var | Var | Var | Var | — |
| **AnoCard** | **Genel** (ultra-privacy) | Var | ZeroDay/NEXUS/Phantom | ZeroDay/NEXUS | $40 kart | Var | BlackIce (coming) | **YOK** | — |
| **Pryvero.net** | Genel | Var | Var | Var | NEXUS | OMNI | Var | Net degil | **%14 kart ucreti — pahali** |

### Kritik Bulgular

1. **FlexCard elendi** — TOS acikca "cards exclusively for advertising purposes" diyor. Shopping/SaaS/subscription icin kullanim **yasak**. Musteriye kart-site'de **satamayiz**.
2. **PST.NET platform kartlari (Facebook/Google/TikTok)** ad-only → **genel kullanim icin sadece Ultima ve Payment Card** isimize yarar.
3. **SolvoCard** yeni en iyi adayimiz — white-label API, no-KYC consumer, Apple+Google Pay, reloadable. Bizim tam olarak istedigimiz sey.
4. **RedotPay** ucuz ($10 kart, %2.2 toplam fee, $1M gunluk limit) ama API belirsiz.
5. **Payy ucretsiz ama KYC istiyor** (ID dogrulama) — consumer tarafinda sansimiz dusuk.
6. **KNGPay tavsiye edilmez** — Trustpilot 2.5 yildiz, para takilma sikayetleri yaygin.

---

## 0.9.6. TOP 3 REVIZE — "ONLINE + OFFLINE + GENEL + UCUZ + API"

Yukaridaki tablo isiginda, **WantToPay reddedilirse** gercek en iyi 3 alternatif:

### 🥇 #1 SolvoCard — White-Label API Kralı

| Ozellik | Deger |
|---------|-------|
| Consumer tier | **$25 kart + %5 top-up + $1 per top-up** |
| Consumer KYC | **YOK** (sadece email) |
| White-label API | **VAR** — hours-not-months setup |
| Apple/Google Pay | **VAR** (white-label'da wallet provisioning built-in) |
| Reloadable | **VAR** (BTC, ETH, USDT, USDC, XMR, SOL) |
| Kart limiti | $25,000 aylik |
| Merchant | 100M+ Mastercard |
| Gecerlilik | 5 yil |
| 3DS | Var |

**Neden 1.:** Kart-site'de aslen istediğimiz yapi = **bir white-label API'dan kendi markamiz altinda kart basmak**. SolvoCard tam olarak bunu sunuyor. Consumer tarafi zaten aktif (bugun test edebiliriz), white-label tarafi 2-3 hafta icinde ayaga kalkar.

**Aksiyon:** `solvocard.com/whitelabel` → sales contact, ayni zamanda consumer signup + test.

---

### 🥈 #2 RedotPay — Dusuk Ucretli Yuksek Limitli

| Ozellik | Deger |
|---------|-------|
| Virtual kart | **$10 tek seferlik**, sıfır yillik ucret |
| Transaction fee | **%2.2 toplam** (%1 crypto conversion + %1.2 FX) |
| Gunluk limit | **$1,000,000** (en yuksek) |
| Tx limit | $100,000 |
| Apple/Google Pay | **VAR** (virtual + physical) |
| Reloadable | **VAR** (USDT, USDC, BTC, ETH) |
| Fiziksel kart | **$100** (2% ATM fee, $50K/ay limit) |
| KYC | Virtual icin **hafif (2 dk ID upload)**, fiziksel icin tam KYC |
| Merchant | 130M+ Visa+Mastercard |
| Ulke | 50+ (APAC, LATAM, EEA) |

**Neden 2.:** $10/kart en ucuz consumer-tier. %2.2 islem ucreti sektorun en dusugu. API konusu net degil ama iyi incelenmeli.

**Aksiyon:** App.redotpay.com → hesap ac, API dokuman iste.

---

### 🥉 #3 FuncCards — Alternatif Ucuz + API

| Ozellik | Deger |
|---------|-------|
| Kart | **$1/kart + $1/ay** |
| Top-up | **%2.5** |
| Islem fee | **0%** |
| KYC | **YOK** |
| API | **VAR (resmi dokuman)** |
| Apple/Google Pay | **VAR** (NFC tap + Apple/Google wallet) |
| Genel kullanim | **EVET** (B2B + personal + shopping + payroll) |
| Reloadable | **VAR** |

**Neden 3.:** En ucuz isletim maliyeti — $1/kart aylik $1 = %2-3 marj bile karli. API + Apple/Google Pay bonus.

**Aksiyon:** `funccards.com` → signup, API key al.

---

### Sonuc: Senin 3 Kart Tipi Icin Kim Neyi Karsiliyor?

| Kart Tipimiz | En Ucuz Karsilayan | Alternatif |
|--------------|---------------------|------------|
| **NEXUS** (online-only, ucuz) | **FuncCards $1** | WantToPay Prepaid $0 · RedotPay $10 |
| **OMNI** (online + Apple/Google Pay) | **RedotPay $10** (Apple+Google Pay dahil) | SolvoCard $25 · FuncCards $1 (GP destegi var) |
| **Premium** (yuksek limit, tokenization) | **RedotPay** ($1M/gun limit) | WantToPay Pro $19 · SolvoCard $25 |

**3 kart tipini de TEK provider'dan almak istersen:** **RedotPay** veya **SolvoCard** en temiz cozum. Ama maliyet optimize edersen: **FuncCards (NEXUS) + SolvoCard/RedotPay (OMNI+Premium)** karmasi en karli.

---

---

## 0.9.7. RESELLER'IN WHITE-LABEL PLATFORMUNU BULMA — Recon Rehberi

> Amac: "Pryvero hangi **white-label SaaS platformunun** musterisi?" sorusuna cevap. Issuer banka (Wallester/Sunrate) zaten belli — bizim arananimiz arada oturan **BaaS middleware** (Buvei, SolvoCard, 1PAY Cards, Monvenience, PalWallet, Cardyfie, vs.). Bunu bulursak biz de ayni middleware'i kullanip **pryvero'nun yaptigi seyi daha iyi fiyatlandirmayla** yapariz.

### Tier Yapisi — Neyi Ariyoruz?

```
Tier 1: Visa / Mastercard (card scheme)
Tier 2: Principal Member / Issuer (Wallester, Sunrate, DECTA, Intergiro)  ← ZATEN BILINIYOR
Tier 2.5: WHITE-LABEL BaaS PLATFORM (Buvei, SolvoCard, 1PAY, Monvenience)  ← BULMAK ISTEDIGIMIZ
Tier 3: Reseller Brand (pryvero, wanttopay, flexcard)                     ← MARKA KATMANI
```

### Pryvero.net Icin Hizli Recon — Sonuclar (Apr 2026)

Yapilan: `dig + curl + openssl + favicon md5 + HTML scan`

| Bulgu | Deger | Anlami |
|-------|-------|--------|
| **A record** | `40.160.6.128` (DDoS-Guard) | CIS-kokenli operator (DDoS-Guard popular Russian/Ukrainian panel provider) |
| **NS records** | `ns1.ddos-guard.net` / `ns2.ddos-guard.net` | Gercek IP'yi gizliyor, host lokasyonu tespit edilemez |
| **MX (mail)** | Zoho Mail | Ucuz + hizli kurulum, profesyonel BaaS entegrasyonu yok |
| **SSL cert** | Let's Encrypt E7, sadece `pryvero.net` + `www` SAN | Shared cert degil, tenant identifier yok |
| **Subdomain'ler** | `app.` `api.` `dashboard.` `my.` — **HICBIRI YOK** | Tum app tek domain'de, muhtemelen Flutter SPA |
| **HTML tech stack** | **Flutter web** (`flutter_bootstrap.js`) | **KRITIK SINYAL** — Flutter cok nadir bir tercih |
| **Anti-scraping** | `noindex, nofollow, noarchive`, right-click disabled, text selection disabled | Brand maksimum gizlilik istiyor |
| **Chat widget** | **Tawk.to ID: `698ec7056a23191c33fb50c0`** | **FINGERPRINT!** Bu ID'yi baska markada bulursak → ayni operator |
| **Favicon hash** | `8eec510e57f5f732fd2cce73df7b73ef` | Diger markalarla karsilastirilabilir (test edildi: wanttopay/buvei/solvocard/1pay/flexcard ile **farkli** favicon — pryvero branding'i ogun yapmis) |

### Kritik Hipotez: Pryvero = WantToPay Kardes/Ayni Kod Tabani?

**Kanit zinciri:**
1. Pryvero **Flutter web app** → Flutter mobile+web shared codebase, nadir tercih
2. **WantToPay mobile app'i Google Play'de mevcut** → muhtemelen de Flutter (cross-platform)
3. Pryvero NEXUS = Wallester, OMNI = Sunrate → **WantToPay ile ayni issuer kombinasyonu**
4. Pryvero kart kullanim politikalari WantToPay ile birebir ortusuyor
5. Her ikisi de CIS-kokenli

**Guclu hipotez:** Pryvero, WantToPay'in kendi uretimi **ikinci markasi** veya WantToPay'in **white-label musterisi** (WantToPay kendisi de white-label satiyor olabilir). Eski "Pryvero" brand'i 2026 basinda turuyor — WantToPay'in yeni **premium brand** deneyi olabilir.

**Dogrulayici son adim (sana onerim):** Pryvero'da $30 kart al, alirken HAR export yap. Bak:
- **Tawk.to ID match?** WantToPay'in chat widget'inda ayni ID varsa → **ayni operator**, dogrulandi
- **USDT deposit address match?** Ayni adres iki markada da gorunuyorsa → shared custody
- **main.dart.js hash match?** Flutter bundle ayniysa → tamamen ayni codebase

---

### Beyaz Etiket Platform Bulmak Icin 16 Teknik (Herhangi Bir Reseller Icin)

| # | Teknik | Ne Ifsa Eder |
|---|--------|--------------|
| 1 | **DNS CNAME** (`dig api.<marka>.com CNAME`) | `api.<marka>.com CNAME tenant-123.buvei.io` → direkt ifsa |
| 2 | **Subdomain enum** (amass, subfinder, crt.sh) | `tenant.platform.com` tipi subdomainler |
| 3 | **SSL cert SAN list** | Shared cert durumunda diger tenant'lar da SAN'da listelenir |
| 4 | **Ana IP / hosting ASN** (`whois <IP>`) | AWS/Hetzner/DDoS-Guard/Cloudflare → lokasyon ve sekilsel operator bilgisi |
| 5 | **HTTP response header'lari** (`Server`, `X-Powered-By`, custom `X-Platform`) | Platform stack fingerprint |
| 6 | **JS bundle filename/hash** (webpack chunk names, sourcemap URL) | `@buvei/sdk` gibi import paths leak edebilir |
| 7 | **Favicon MD5 hash** | Platform default favicon'u degistirilmediyse direkt ifsa (test edildi — bu durumda ise yaramadi) |
| 8 | **Chat widget tenant ID** (Tawk.to, Intercom, Crisp, Tidio) | Her widget'in unique ID'si var, **ayni ID = ayni operator** (Tawk ID: `698ec7056a23191c33fb50c0` bulundu) |
| 9 | **Google Analytics / GTM ID** (`UA-xxx` / `G-xxx` / `GTM-xxx`) | HTML kaynak kodunda gorunur, kardes markalari ifsa eder |
| 10 | **Mobile app signing cert + package name** (Play Store / APK analiz) | Flutter APK + apktool ile cikarilir, paket adi ifsa eder (`com.wanttopay.app` vs `com.pryvero.app`) |
| 11 | **BIN registry "Program Manager" field** | Visa/MC BIN lookup bazen Program Manager'i gosterir (`bindb.com`, `iinlist.com`) |
| 12 | **USDT/USDC deposit address clustering** | Ayni hot wallet'i paylasan markalar → shared custody = shared platform |
| 13 | **3DS ACS domain** (kart kullanirken) | `acs.buvei.com` gibi direkt ifsa |
| 14 | **Apple/Google Pay tokenization flow** (Safari Web Inspector / charles) | TSP domain issuer + platform stack'i verir |
| 15 | **Webhook source IP range** | Reseller kendi webhook'una gelen IP = platform'in webhook delivery range'i |
| 16 | **Privacy Policy / DPA sub-processor listesi** | GDPR-compliant olanlar platform'u listelemek zorunda |

---

### Adim Adim Action Plan — Pryvero Icin

**Hedef:** 1-2 gunde %80 guvenle pryvero'nun kullandigi platform'u tespit et.

#### Asama 1 — Fonsuz Recon (30 dakika, ucretsiz)

```bash
# DDoS-Guard arkasi oldugu icin direkt IP bulamiyoruz ama
# Subdomain + SSL SAN + Tawk.to + GTM/GA kontrolu yeterli

# Tawk.to ID (698ec7056a23191c33fb50c0) - bu ID'yi baska marka sitelerinde ara
curl -s https://wanttopay.net/ | grep -o "tawk.to[^'\"]*" | head -5
curl -s https://buvei.com/ | grep -o "tawk.to[^'\"]*" | head -5
curl -s https://solvocard.com/ | grep -o "tawk.to[^'\"]*" | head -5
curl -s https://1pay.cards/ | grep -o "tawk.to[^'\"]*" | head -5
# Ayni ID varsa → operator bulundu!

# GTM / GA ID cikart
curl -s https://pryvero.net/ | grep -oE "(UA|G|GTM)-[A-Z0-9-]+"
```

#### Asama 2 — $30 Test Kart Alimi (2 saat)

1. Mullvad UP + burner email (Zoho veya Tuta) + USDT 30 USD
2. Pryvero signup → deposit 20 USDT
3. Browser DevTools **Network tab**, filtre `Fetch/XHR`, **Preserve log** isaretle
4. Issue card → HAR export (Save all as HAR with content)
5. `main.dart.js` dosyasini indir, string'leri tara:
   ```bash
   # Flutter web bundle
   curl -o main.dart.js https://pryvero.net/main.dart.js
   strings main.dart.js | grep -iE "(buvei|solvocard|1pay|monvenience|palwallet|cardyfie|wanttopay|wtp)" | head -20
   # Bulunan string → dogrudan platform
   ```

#### Asama 3 — Kart ile Dogrulama (1 saat)

1. **BIN lookup** — kart numarasi ilk 6 rakam:
   ```bash
   curl https://lookup.binlist.net/525797
   # "bank.name" alaninda Wallester geliyor → issuer onay
   # Bazi BIN registry'lerde "Program Manager" alani da var → white-label ifsa
   ```
2. **$1 test alisveris** yap → 3DS acilirsa ACS domain'ine bak
3. **Apple Pay'e ekle** → tokenization istegi sirasinda giden host'u logla (Mac'te iPhone'u USB'den bagla + Safari Develop menusu)

#### Asama 4 — Dogrulanan Bulgulara Gore Karar

| Bulgu | Karar |
|-------|-------|
| Tawk.to ID / GTM ID WantToPay'de de var | Pryvero = WantToPay sister brand. Biz de WantToPay API'sini kullaniriz — zaten entegre. |
| main.dart.js'de "buvei" / "solvocard" / "1pay" string'i var | Pryvero o platform'un tenant'i. Biz ayni platform'a **direkt** basvuru yapariz, reseller'a gerek yok. |
| API endpoint `api.X.com` X bilinen BaaS | Direkt ifsa — ayni platformu kullaniriz. |
| Tespit edilemez (yeterince gizli) | Platform niche/hybrid, muhtemelen Wallester'in kucuk bir kurumsal musterisi veya kendi yazdiklari yigin |

---

### Bilinen BaaS Middleware'ler — Direk Basvurabilecegimiz Listesi

Asagidakilerden hangisi pryvero'nun backend'i cikarsa, biz direkt onlara basvurabiliriz:

| Platform | Durum | Fiyat Seviyesi | No-KYC Tier |
|----------|-------|-----------------|----------------|
| **Buvei White-Label** | Aktif satiyor | Orta ($1000+/ay muhtemel) | Yok (KYC sirket icin) |
| **SolvoCard White-Label API** | Aktif satiyor, hours-not-months | Orta-Dusuk | Var (consumer) |
| **1PAY Cards White-Label** | Aktif satiyor, Visa Principal | Dusuk ($0-500/ay tier'lar) | **Evet** ("no-KYC-ready") |
| **Monvenience White-Label** | Turnkey, Visa+MC | Orta | Degisken |
| **PalWallet API** | MiCA-licensed, enterprise | Yuksek | Var |
| **Cardyfie White-Label API** | Aktif, pricing gizli | Orta (quote bazli) | Var |
| **Striga** | Crypto-odakli, enterprise | Yuksek | KYC var |

**Sezgisel tahmin:** Pryvero'nun backend'i buyuk ihtimal **1PAY Cards** veya **WantToPay'in kendi white-label paketi**. Her ikisi de no-KYC + Telegram-automation profilinde.

---

### Pratik Aksiyon — Bugun/Yarin

1. **30 dakikada** Asama 1'i (Tawk.to ID arama) yap — belki 30 dakikada cevap bulursun
2. **2 saatte** Asama 2'yi ($30 test kart + main.dart.js strings) yap
3. Bulguyu dogrulanirsa → ayni platform'a direkt basvuru at
4. Dogrulanmazsa → **1PAY Cards white-label**'a basvur (en yakin profil eslesmesi), **SolvoCard**'i paralelde test et

Bu recon'u kart-site'nin `CardProvider` interface'ini kurarken arka planda yapabilirsin — **ayni anda yurur**.

---

### Pryvero.net Hakkinda Duzeltme (Gereksiz — pahali)

### Ne Tur Sinyaller Altyapiyi Ifsa Eder?

| Sinyal | Nerede Gorunur | Ifsa Ettigi |
|--------|----------------|-------------|
| **API domain'leri** | DevTools Network tab (XHR/Fetch) | `api.pryvero.net` → proxy'liyor mu? `api.wallester.com` dogrudan gorunuyor mu? |
| **Card BIN (ilk 6 rakam)** | Kart olusturulduktan sonra UI'da | BIN lookup (`binlist.net`, `bindb.com`) → **issuer bank** tam olarak |
| **3DS challenge URL'si** | Kart dogrulama sirasinda acilan iframe URL'si | ACS (Access Control Server) sahibi → issuer'in 3DS saglayicisi |
| **Apple/Google Pay TSP** | Mobile wallet'a kart eklerken giden istekler | Token Service Provider (Marqeta, Galileo, Stripe Issuing, Wallester) |
| **JS SDK dosya adlari** | DevTools Sources tab | Ornek: `marqeta-sdk.js`, `galileo.js`, `wallester-widget.js` dosya adlari |
| **SSL cert CN/SAN** | Browser lock icon → certificate details | Bazi durumlarda shared cert → issuer'in domain'i cert'te |
| **HTTP response header'lari** | Network tab → Headers | `Server`, `X-Powered-By`, `Via`, `X-Request-Id` format ile issuer fingerprint |
| **DNS CNAME** | `dig api.pryvero.net CNAME` | `api.pryvero.net CNAME api.wallester.com` gibi direkt ifsa |
| **WebSocket hostlari** | Network tab → WS filter | Real-time notification'lar genelde issuer'a gider |
| **Webhook'larin donen Origin** | Webhook'u IP'si analiz → reverse DNS → sirket | Transaction notification'in kimden geldigi |
| **Receipt/statement MCC** | Kart kullaniminda donen merchant category | Direkt issuer MCC hattini takip eder |

---

### Adim Adim Recon Plani (Pryvero Ornek)

#### 1. Ortam Hazirligi
```bash
# Mullvad UP + burner email + USDT wallet + test fonu (10-20 USD yeterli)
# Chrome/Firefox DevTools veya daha iyisi: mitmproxy
pip install mitmproxy
mitmweb --mode transparent --listen-port 8080
```

#### 2. Browser DevTools Ile Kart Alimi
1. `pryvero.net` → signup
2. Deposit 10 USDT → **Network tab'i ac**, filtre: `Fetch/XHR`
3. "Issue Card" tiklamadan **Clear** → tiklayinca akan tum istekleri yakala
4. **Export HAR** (Network tab sag tik → Save all as HAR)

#### 3. HAR Dosyasini Analiz Et
```bash
# HAR'dan unique domain'leri cikart
cat pryvero.har | jq '.log.entries[].request.url' | awk -F'/' '{print $3}' | sort -u

# Beklenen cikti: disarda olmayan domain'ler varsa backend onlar
# Ornek:
#   api.pryvero.net      <- wrapper (muhtemelen)
#   cdn.pryvero.net      <- kendi
#   wallester.com        <- ISSUER (eger gorunuyorsa direkt ifsa)
#   api.sunrate.com      <- ISSUER
#   3ds.wallester.com    <- 3DS
```

#### 4. Kart BIN Analizi
Kart olusturuldugunda donen **ilk 6 rakam** → hemen `binlist.net` sorgula:
```bash
curl https://lookup.binlist.net/525797
# Donus:
# {
#   "scheme": "mastercard",
#   "bank": { "name": "Wallester AS", "url": "wallester.com" },
#   "country": { "name": "Estonia" }
# }
```
**Bu tek adim bile %80 isi bitirir** — BIN → issuer → reseller zinciri netlesir.

#### 5. 3DS Challenge URL Incelemesi
Kart kullanirken (test merchant'a $1 odeme) 3DS sayfasi acilacak. URL'ye bak:
- `3ds.wallester.com/challenge/...` → Wallester'in kendi ACS'i
- `acs.gpayments.com/...` → 3rd-party ACS (GPayments, Netcetera, Modirum)
- `3ds.sunrate.com/...` → Sunrate'in ACS'i

#### 6. Apple/Google Pay Tokenization
iPhone'da "Add to Apple Wallet" tusu → **Safari Web Inspector** (Mac'te baglayinca) kayit tut. Tokenization istegi su domain'lerden birine gider:
- `mdes.mastercard.com` + issuer agent domain
- `vtsapi.visa.com` + issuer TSP host

#### 7. DNS CNAME Kontrolu (En Hizli)
```bash
dig api.pryvero.net CNAME
dig api.wanttopay.net CNAME
dig api.flexcard.cards CNAME
# Bazen direkt issuer'a CNAME gorunur
```

---

### Pryvero Icin Sonuc (Zaten Bildiklerimiz + Onay)

Network log yapmadan bile **pryvero'nun kart kullanim kilavuzlarindan** cikan bilgi:

| Kart Tipi | Issuer (Kanıtli) | Network | Kanit |
|-----------|--------------------|---------|-------|
| **NEXUS** | **Wallester AS (Estonya)** | Visa | Kullanim politikasi Wallester'in kendi teknik dokumanlari ile %100 ortusur |
| **OMNI** | **Sunrate Solutions (HK)** | Visa + MC | OMNI kartlarin Apple Pay + Samsung Pay destegi Sunrate'in spesifik feature set'i |

**Pryvero = WantToPay ile ayni arkayi kullaniyor.** Pratik olarak **pryvero'dan kart alip network loglamanin sana yeni bir sey ogretmeyecek** — Wallester ve Sunrate zaten biliniyor.

---

### Peki Ayni Altyapiyi Biz Nasil Kullaniriz?

**A. Reseller kaliş (kolay, bugun):**
- **WantToPay** (Wallester NEXUS + Sunrate OMNI) → zaten entegre
- **SolvoCard white-label API** (muhtemelen farkli issuer, ama API'si net)
- Yani ayni altyapiyi **dolayli kullanmak** icin alternatif reseller kullan

**B. Direkt Principal Member ile anlas (zor, aylar):**
| Principal | Uygulama Zorlugu | Avantaj |
|-----------|------------------|---------|
| **Wallester AS (Estonya)** | Orta — 1500+ partner, KYB zorunlu, offshore sirketle 3-6 ay | En genis BIN havuzu, Apple/Google Pay hazir |
| **Sunrate (HK)** | Zor — kurumsal odakli (Agoda, EasyBook tier), $500K+ hacim bekleniyor | Samsung Pay + Sunrate OMNI feature set |
| **DECTA (Latvia)** | Orta — daha erisilebilir, Mastercard principal | Mastercard odakli, EU acceptance |
| **Intergiro (Sweden)** | Orta — embedded finance odakli | Modern API, developer-friendly |

**Aksiyon onerisi:**
1. **Bugun**: SolvoCard white-label API ve WantToPay consumer tier ikisini paralelde test et
2. **1 ay icinde**: Seychelles/BVI LLC kur (OPSEC icin offshore) — $500-2000
3. **2-3 ay icinde**: Offshore LLC ile **Wallester affiliate program'a** basvur (`wallester.com/affiliate-program`) → ayda $100+ revshare
4. **6+ ay icinde**: Hacim olusunca Wallester **BIN sponsor partnership** (full white-label, kendi BIN'lerinle) — bu noktada **artik kimsenin reseller'i degilsin**, resmen pryvero/wanttopay'in yaptigini yapan yeni bir markasin

---

## 0.9.8. DURUST KARAR — DEEP RECON SONRASI (Apr 2026)

> Tum adaylari `curl` + `dig` + `openssl` + `strings` + GTM/GA/Tawk/SiteGPT ID taramasi ile test ettim. Onceki onerilerimin 3 tanesi hatali cikti, duzeltiyorum.

### Mass Fingerprint Scan — Tum Markalar Ayni Operator mi?

| Marka | Tech stack / Marketing | Fingerprint ID'leri |
|-------|----------------------|---------------------|
| pryvero.net | Flutter SPA + DDoS-Guard | Tawk.to `698ec7056a23191c33fb50c0` |
| wanttopay.net | **Webflow** (`694996e037aa67c737cd0977`) | GA `G-FVQJFXVWLQ` + GTM `GTM-NP9KF54C` + **SiteGPT** `39e3d71a-f1f2-4661-bf6a-0f05b67bb3e6` |
| pst.net | Webflow/React | GTM `GTM-W4V3TQH` |
| flexcard.cards | React | GTM `GTM-M7W5P95R` |
| ano.cards | React | GA `G-25X2WWB712` |
| **finup.io** | **Webflow** (`67619a4019c1eac5945f9d4f`) | GTM `GTM-PGNP92DK` + kendi marka |
| funccards.com | React/Next | GTM `GTM-NMBP9GHH` |

**Sonuc:** Hicbir ID eslesmiyor. Pryvero'nun Tawk.to ID'si hicbir yerde yok, WantToPay'in SiteGPT ID'si de farkli.

**Kritik duzeltme:** Pryvero WantToPay'in kardesi DEGIL. Her ikisi de Wallester+Sunrate kullaniyor ama **farkli operatorler** (Wallester'in 1500+ partneri arasindan ikisi). Pryvero muhtemelen **direkt Wallester partner'i** — orta katman yok.

---

### Onceki Onerilerimin Durust Revizyonu

| Provider | Onceki Tavsiyem | **Deep Recon Sonucu** | Karar |
|----------|------------------|-------------------|-------|
| **SolvoCard** | 🥇 #1 white-label API | **"Questionable" flag** (monerica.com), AnonRefill ile bagli, Trustpilot yorumlarinda "probable scam" + "AI ile yapilmis OK-looking site" | ❌ **KULLANMA** |
| **1PAY Cards** | 🥈 Visa Principal white-label | HTML `<title>my-loader-app</title>` — **default React Vite template**, site bos, API yok | ❌ **VAPORWARE** |
| **KNGPay** | Alternatif | **Trustpilot 2.5**, para takilma sikayetleri yaygin | ❌ **RISKLI** |
| **FlexCard** | Fallback | **TOS: "cards exclusively for advertising purposes"** — kart-site musterisine satilamaz | ❌ **MODEL UYUMSUZ** |
| **Cardyfie** | White-label aday | **Trustpilot yorumu: finup.io reseller'i**, upstream gizlemis, API unstable, OTP/refund sorunlari | ❌ **RESELLER-OF-RESELLER** |
| **pryvero.net** | Plan B | **%14 kart fee** + WantToPay kardesi hipotezim de dogrulanmadi | ❌ **PAHALI + belirsiz** |

### 🎯 YENI GERCEK TIER 1 PLATFORM: finup.io

Onceki arastirmada bu platformu atlamisim. Deep recon'da **Cardyfie'nin upstream'i** oldugu Trustpilot yorumunda geciyor — yani aktif operasyon var.

| Kanit | Deger |
|-------|-------|
| Marketing sitesi | Webflow (`cdn.prod.website-files.com/67619a4019c1eac5945f9d4f`) — profesyonel |
| Analytics | GTM `GTM-PGNP92DK` — kurulmus, canli operasyon |
| **Resmi fiyat sayfasi** (finup.io/en/pricing) | 3 tier acik yayinlanmis: Trial $0/ay, Scale $1k/ay, Prime $100k/ay |
| Kart fee | $10 (Trial) → $3 (Scale) → **$1 (Prime)** |
| Top-up fee | %5 (Trial) → **%3 (Scale)** → **%1 (Prime)** |
| Transaction fee | Trial $0.5 → Scale/Prime **sifir** |
| BIN sayisi | 20+ |
| Crypto top-up | USDT, BTC, ETH, LTC, TRX + 5 digeri |
| KYC | Kart tarafi: **yok** (sirket tarafi: normal KYB) |
| Apple/Google Pay | "Coming soon" (henuz yok) |
| Min deposit | $50 |
| Promosyon | `DOLLARCARD` kodu ile ilk kart $1 |

**Bu niye daha once gozumden kacmis:** Finup.io **reseller brand'lar arasinda adini gizliyor**, Cardyfie gibi white-label musterileri onu upstream olarak vermiyor. Trustpilot sikayetiyle ortaya cikti.

**Neden en iyi aday:**
- ✅ Fiyat transparan, public web sayfasi
- ✅ Hacim artinca kar marji %70+ (Prime tier)
- ✅ Trial tier ile **bugun $0** test edilir
- ✅ Gercek operator (Cardyfie'ye servis veriyor → operasyonu ispat)
- ⚠️ Apple/Google Pay yok (OMNI sart degilse sorun degil)
- ⚠️ $1k ve $100k sabit aylik → hacim olusmadan Trial'da kal

---

### 🎯 Revize Edilmis 3-Adimli Strateji

**Adim 1 — Bu hafta (zero-risk launch):**
- **WantToPay entegrasyonu ile canliya cik** (zaten yaptik, HK entity + Webflow + 4 yil aktif = gercek)
- Paralelde **finup.io Trial hesap ac** ($0/ay), API dokumani al, sandbox'ta test et
- `DOLLARCARD` kodu ile $1'a test kart cikar, tum endpoint'leri ornekle

**Adim 2 — 1-2 ay (hacim olunca):**
- Ayda 300+ kart gectiginde **finup.io Scale tier** ($1k/ay + $3/kart + %3 top-up) → kar marji onemli olcude acilir
- CardProvider arayuzu sayesinde tek konfig degisikligiyle WantToPay'den finup.io'ya gec

**Adim 3 — 3-6 ay (olcek olunca):**
- **finup.io Prime tier** ($100k/ay + $1/kart + %1) — sektor lideri fiyat
- VEYA offshore LLC ile **Wallester direct partnership** (6+ ay surec, $30K+ setup, en uzun vadeli dusuk maliyet)

---

### Bize En Onemli Filtre

Herkesin "I'm a white-label API platform" demesi kontrol edilmeli. Deep recon'dan cikan kurallar:

- ✅ **Webflow/React marketing + public fiyat sayfasi + Trustpilot >3.5** → gercek
- ❌ **Default Vite template (`my-loader-app`)** → vaporware (1PAY)
- ❌ **Monerica "Questionable" flag + AnonRefill bagi** → scam riski (SolvoCard)
- ❌ **Ad-only TOS** → kart-site modeline uymaz (FlexCard)
- ❌ **Reseller-of-reseller admit etmemesi** → istikrarsiz katmanlama (Cardyfie)
- ❌ **Trustpilot <3.0** → para takilma riski (KNGPay)

Bu filtreden gecen gercek platformlar: **WantToPay (reseller brand)**, **finup.io (white-label)**, **Buvei (white-label, KYC)**, **Monvenience (enterprise BaaS)**, **Wallester (Tier 2 direct, uzun vadeli)**.

---

### Pryvero.net Hakkinda Duzeltme (Gereksiz — pahali)

| Pryvero Gercek Fiyati | Deger |
|-----------------------|-------|
| NEXUS card loaded fee | **%14** (veya $100 $NEXUS token tutarsan %9) |
| Kart limiti | $1,000 (dusuk) |
| Verification | 30 dakika |
| Apple/Google Pay | Var |

**Karar:** Pryvero yeri **iptal**. Musteriye $100 yuklesen $14 bize kar olmaz — zararlı.

---

### Senaryo A — Hesap acilisi kabul olmazsa (ulke/IP/business type reddi)

**Duzeltilmis sirali:**
1. **FuncCards** — $1 kart + %2.5 top-up, API var, no-KYC
2. **Capitalist** — $2.50 + %4 top-up, 10+ yillik guvenilir operator
3. **PST.NET** — 1. kart bedava, $500'a kadar KYC yok, %2.9 top-up
4. **FlexCard** — email-only, %3 top-up, $2-4 kart
5. **VCCPRO** — tam anonim, $3 kart + %3 reload

**Varlikli (Brocard personal)** — 50 kart bedava, personal tier no-KYC oldugu iddia ediliyor (dogrulanacak), ama $500 min depozit var

**Plan C: FlexCard**
- **Sebep:** Email-only kayit, reddedilme olasiligi cok dusuk, %3 top-up (WantToPay Pro %9'dan cok daha iyi)
- **Avantaj:** $2-4 kart, 20+ BIN (USA/UK/EE/ES/BR), 10 bedava ADS kart trial
- **Dezavantaj:** TOS'ta legal entity yok (OPSEC acisindan takip edilemez ama kotu gunde para tahsilat yok), Mastercard yok, Apple/Google Pay beyan edilmemis
- **Aksiyon:** `flexcard.cards/accounts/signup/` → email + sifre, ozel API erisim iste (Telegram support)

### Senaryo B — WantToPay hacim veya fiyat yeterli gelmezse

**Plan B: PST.NET + PST Private abonelik**
- **Sebep:** Kart basina %3 cashback + ayda 100 bedava kart + 69 BIN (en genis) + resmi API
- **Avantaj:** Facebook icin %2.9, islem ucreti **0%**, decline ucreti **0%** — 50+ kart/ay hacimde marj patlar
- **Dezavantaj:** $7 acilis, aylik maintenance var, $500 ustu hafif KYC
- **Aksiyon:** `pst.net` → ilk kart bedava, $500'a kadar KYC'siz test et, karliysa Private'a gec

**Plan C: Buvei white-label** (offshore sirketle)
- **Sebep:** En dusuk top-up (%2.5 flat) + white-label lisansi = kendi markanla sat, marj %70+
- **Hazirlik:** Seychelles/BVI/Belize IBC ($500-2000 setup, $1000/yil), Buvei KYC'sini sirket uzerinden gec
- **Zamanlama:** 2-3 hafta (sirket kurulumu) + 1 hafta (Buvei integration)
- **Aksiyon:** `buvei.com/white-label` → sales, offshore sirket evraklarini sun

### Senaryo C — Hem WantToPay hem pryvero reddederse (altyapi seviyesinde reddedilme)

Bu **Wallester/Sunrate tarafindan redd** anlamina gelir — yani ayni sistemdeki diger markalar da benzer riski tasir.

**Plan B: Brocard** (A3F Group)
- **Sebep:** Farkli altyapi kombinasyonu (kendi EMI + Wallester), en buyuk stabil operatoru
- **Dezavantaj:** **KYC interview zorunlu** (3 gun), $500 minimum depozit, %4.5 USDT top-up (yuksek)
- **OPSEC cozumu:** Offshore sirket evraklariyla KYC'yi gec, hesap sirket adina
- **Aksiyon:** `mybrocard.com` → sales interview, sirket evraklariyla bireysel hesap yerine corporate ac

**Plan C: e.PN**
- **Sebep:** 10+ yildir operatorluk, 102 BIN 36 banka — reddedilme olasiligi en dusuk
- **Dezavantaj:** Kucuk hacimde %6.7 top-up cok pahali; $1K+ harcamadan sonra %6'ya diser
- **Strateji:** Sadece **ust-tier musterilere ($100+ top-up)** yonlendir → %4-6 top-up kabul edilebilir
- **Aksiyon:** `epn.net` → signup, ilk $30 depozit ile test

### Senaryo D — Hepsinden reddedilirsek (ultra OPSEC problemi)

**Plan B: Telegram Bot Hybrid**
- **AnoCard** (`@Anocard_bot`) — ZeroDay/NEXUS/Phantom karti, **$40/kart** ama **%100 no-KYC**
- **Azul Card** — benzer kucuk operator
- **AnyXPay** (`@anyxpay_bot`) — exchange + card kombinasyonu
- **Modeli:** SaaS API olmadigi icin **musteriye Telegram yonlendirme modeli** kur (kart-site'de "Bot ile al" butonu), commission'ini affiliate link ile al
- **Hedef kitle:** Ultra-privacy musteriler, $500+ fiyat odeyebilenler
- **Marj:** %40-50 (yuksek kart maliyeti dusuyor)

**Plan C: DIY Wallester direkt** (uzun donem)
- Offshore LLC + $30-50K setup fee + KYB + 3-6 ay onay
- Kendi BIN sponsor'un olur, hic kimseden reddedilmezsin
- Bu noktada artik "gercek adam" sen olursun

---

### Hizli Karar Agaci

```
WantToPay reddi nedir?
│
├─ "Hesap acilamadi" (ulke/IP/type)
│  └─> pryvero.net → kabul olmazsa → FlexCard → kabul olmazsa → PST.NET
│
├─ "Fiyat/hacim yeterli gelmedi"
│  └─> PST.NET Private (orta hacim) → Buvei white-label (buyuk hacim)
│
├─ "Altyapi seviyesinde reddi" (Wallester/Sunrate)
│  └─> Brocard (corporate KYC) → e.PN (tier-based) → sertlesirse DIY Wallester
│
└─ "Tum API tabanli reddi" (OPSEC/regulatory)
   └─> AnoCard/Azul/AnyXPay Telegram hybrid → DIY Wallester principal
```

### Kod Tarafinda Hazirlik

Bu fallback stratejisini calistirmak icin **tek bir `CardProvider` interface** gerekli. Mevcut WantToPay entegrasyonunu bu interface'e sarmalayip, yedeklerle swap edilebilir hale getir:

```typescript
interface CardProvider {
  name: "wanttopay" | "pryvero" | "flexcard" | "pst" | "buvei" | "brocard" | "epn";
  createCard(opts: { userId: string; amount: number; binPreference?: string }): Promise<Card>;
  topUp(amount: number, txHash: string): Promise<void>;
  getCard(cardId: string): Promise<Card>;
  listBins(): Promise<Bin[]>;
}
```

Env'de `ACTIVE_CARD_PROVIDER=wanttopay` switch ile **kod degisikligi olmadan** provider degistirilir. Reddedilme oldugunda sadece env degistirilip yeni adapter implement edilir (1-2 gun is).

---

## 1. DURUM OZETI

Buvei ile toplantida **KYC istediler**. OPSEC'e aykiri. Baska secenekler lazim.

Hedefler:
- **No-KYC** (veya ucretsiz signup + hafif email dogrulama)
- **API erisimi** (otomatik kart olusturma icin)
- **Dusuk toptan maliyet** (yuksek marj)
- **Multi-BIN** (yuksek onay orani)
- **NEXUS/OMNI modeli** icin tokenization opsiyonu

---

## 2. EN IYI 6 SECENEK — SIRALAMA

### 🥇 #1 FlexCard — EN UCUZ + API + NO-KYC

| Ozellik | Deger |
|---------|-------|
| KYC (biz) | **Sadece email** (2 dakika) |
| KYC (musteri) | Yok |
| Kart ucreti | **$2-4** (en dusuk) |
| Top-up | %3-4 |
| Minimum yatirim | $50 |
| BIN sayisi | **20+** (Estonya, UK, Ispanya, Brezilya, ABD) |
| Kart tipi | Visa Business Debit |
| API | **Var** — otomasyon destekli |
| Takim yonetimi | Var (Owner/Manager/Teammate) |
| Referral | **%30 komisyon** |
| Hediye kartlar | Ilk $50 yatirimda **10 ucretsiz kart** |
| 3DS | Var |
| Fonlama | USDT, USDC, banka |
| Platform destegi | Facebook, Google, TikTok, Twitter, Shopify, Zoom, vs. |
| Apple/Google Pay | BIN'e bagli |

**Neden 1. sirada:**
- **En ucuz**: $2-4/kart = yuksek marj
- **API var** ve email-only kayit
- Multi-BIN (5+ ulke)
- 10 ucretsiz hediye kart ile sifir maliyetli test
- 30% referral ile ekstra gelir

**Kar marji ornegi** ($10 karti $15'e satarsan):
- Maliyet: $2-4 kart + $2 top-up = $4-6
- Satis: $15
- **Kar: $9-11 (marj %60-73)**

---

### 🥈 #2 PST.NET — ENTERPRISE DESTEKLI (ilk kart no-KYC)

| Ozellik | Deger |
|---------|-------|
| KYC (biz) | **Ilk $500'a kadar KYC yok**, sonra ~1 saat dogrulama |
| Kart ucreti | $7 (Ultima) - $10 (Advertisement) |
| Top-up | %2.9-6 (kart tipine gore) |
| BIN sayisi | **69** (sektorun en genisi) |
| Kart tipi | Visa + Mastercard |
| API | **Free API access** (Private plan) |
| 100 ucretsiz kart | Var (Private plan) |
| %3 cashback | Facebook/Google/TikTok reklamlari icin |
| Fonlama | 18 kripto + SEPA/SWIFT + kredi karti |
| White-label | **Evet** |
| Apple/Google Pay | BIN'e bagli |

**Neden 2. sirada:**
- 69 BIN = en yuksek cesitlilik
- Ilk test'te KYC istenmiyor ($500 altinda)
- API dokumantasyonu olgun ve kararli
- White-label cok guclu

**Dezavantaj**: $500 ustune cikinca KYC zorunlu. Ama ilk 3-6 ay bu bir sorun olmaz.

---

### 🥉 #3 AnoCard — TELEGRAM BOT + YUKSEK MARJ

| Ozellik | Deger |
|---------|-------|
| KYC | **No-KYC secenegi var** |
| Kart ucreti | $39.99 (normal) / $24.99 (ACC token holder) |
| Kart tipleri | ZeroDay (Visa), **NEXUS (Visa)**, Phantom (Mastercard) |
| Apple/Google Pay | **Evet** (tumu destekler) |
| Reloadable | Evet |
| Prefunded | $10 |
| API | Telegram bot + dashboard |
| Fonlama | Kripto |

**Neden 3. sirada:**
- Kart adlari **NEXUS** ve **Phantom** — bizim aradigimiz model
- Apple/Google Pay destegi default
- No-KYC net

**Dezavantaj**: Kart maliyeti yuksek ($39.99). Marj icin $55-70'e satmak gerek.

---

### 🏅 #4 Azul Card — TAMAMEN ANONIM

| Ozellik | Deger |
|---------|-------|
| KYC | **Sifir** — email/telefon bile istenmiyor |
| Kart ucreti | $20 (tek seferlik, $2000 harcadiktan sonra iade) |
| Top-up | **%4** |
| Islem ucreti | **$0.25** (sabit) |
| Islem limiti | $20,000 |
| Fonlama | Kripto |
| Apple/Google Pay | Evet |
| Referral | **%40** |
| Arayuz | Tamamen Telegram bot |

**Neden 4. sirada:**
- **En agresif no-KYC** (telefon/email bile yok)
- Yuksek referral (%40)
- $20 baslangic maliyeti makul

**Dezavantaj**: API yok (sadece Telegram bot), otomasyon zor.

---

### #5 AnyXPay — TIER'LI TELEGRAM

| Ozellik | Deger |
|---------|-------|
| KYC | Yok (Basic/Pro), **KYC var** (Premium) |
| Kart ucreti | **50 USDT** (tum tipler) |
| Top-up | **%4** |
| Limitler | MasterCard Basic: $1M/ay, Pro: $1M/ay, Infinity: $6M/ay |
| Apple/Google Pay | Evet |
| API | Telegram mini-app |
| Fonlama | Kripto |

**Neden 5.**: Yuksek limitler ama API yok.

---

### #6 Card2Crypto (Alternatif Model)

| Ozellik | Deger |
|---------|-------|
| Model | White-label odeme gateway (kart degil) |
| Maliyet | **$299-899 tek seferlik** |
| Aylik ucret | Yok |
| Marj | **%15'e kadar** |
| KYC | Yok |
| Settlement | USDC (aninda) |
| Entegrasyon | WooCommerce, WHMCS plugin |

**Neden farkli**: Kart satmiyoruz, odeme gateway. Ama reseller modelinde ek gelir kaynagi olabilir.

---

## 3. NIHAI KARSILASTIRMA TABLOSU

| Provider | KYC | Kart Ucreti | Top-up | API | Apple/GPay | Marj Potansiyeli |
|----------|-----|-------------|--------|-----|------------|------------------|
| **FlexCard** | Email | **$2-4** | %3-4 | **Evet** | BIN'e bagli | **%60-73** |
| **PST.NET** | $500 altinda yok | $7-10 | %2.9-6 | **Evet** | BIN'e bagli | %50-65 |
| **AnoCard** | No-KYC opsiyonu | $24.99-39.99 | %? | Telegram | **Evet** | %30-45 |
| **Azul Card** | **Sifir** | $20 | %4 | Hayir | Evet | %40-55 |
| **AnyXPay** | Yok (Basic) | 50 USDT | %4 | Hayir | Evet | %35-50 |
| ~~Buvei~~ | ~~KYC istedi~~ | ~~$5-10~~ | ~~%2.5~~ | ~~Evet~~ | ~~Evet~~ | ~~Iptal~~ |

---

## 4. ONERILEN STRATEJI: HIBRIT MODEL

Tek provider'a bagimli kalma, **2-3 provider** paralel calistir:

### Seviye 1: Giris Kartlari (Online-Only / NEXUS)
**Provider: FlexCard**
- Kart maliyeti: $2-4
- Musteri fiyati: **$8-10**
- Marj: **$6-8 (%60-80)**
- Kullanim: Stripe, SaaS, Netflix, reklam, domain, digital goods
- Aylik hedef: **100-500 kart**

### Seviye 2: Premium Kartlar (Online+Offline / OMNI)
**Provider: PST.NET veya AnoCard**
- Kart maliyeti: $7-25
- Musteri fiyati: **$20-45**
- Marj: **$13-20 (%55-65)**
- Kullanim: Booking, Airbnb, Amazon, Apple Pay, Google Pay
- Aylik hedef: **50-200 kart**

### Seviye 3: Anonim Kartlar (Ultra-Privacy)
**Provider: Azul Card (manuel)**
- Kart maliyeti: $20
- Musteri fiyati: **$50-75** (premium fiyat!)
- Marj: **$30-55 (%60-75)**
- Kullanim: Tamamen anonim kullanim isteyen musteriler
- Aylik hedef: **20-50 kart** (niche ama yuksek marj)

---

## 5. MUSTERI CEKMEK ICIN STRATEJI

### A) UCRETSIZ DENEME KARTI
- FlexCard'dan 10 ucretsiz kart al (ilk yatirimda)
- Musterilere **"Ilk kart $1"** veya **"Kayit olana 1 ucretsiz deneme karti"** ver
- Onlara platformu gosterir, %60+ geri doner

### B) FIYAT ATAKLIGI
- Rakipler ($10-20 arasi)
- Biz: **$8 NEXUS**, **$20 OMNI**
- pryvero.net'in altinda fiyatlandir

### C) NIS KATEGORILERI
- **Reklam Media Buyer Paketi**: 10 kart $60 (normal $80)
- **Dropshipper Paketi**: 5 Visa + 5 Mastercard $45
- **SaaS Abone Paketi**: 3 kart $20 (Netflix, Spotify, ChatGPT)

### D) REFERRAL SYSTEM
- %20 lifetime komisyon (rakipler %10-15 veriyor)
- Referral linki dashboard'da

### E) SPEED & UX
- Kart olusturma: **<30 saniye**
- Rakipler: 2-5 dakika
- "En hizli no-KYC kart" konumu

---

## 6. HEMEN YAPMAN GEREKENLER

### Bugun (30 dk):
- [ ] FlexCard'a kayit ol (email only, 2 dk)
- [ ] $50 yatir, 10 ucretsiz karti al
- [ ] 2-3 karti test et (Netflix, Amazon, bir SaaS)
- [ ] API belgelerini incele

### Yarin (1 saat):
- [ ] PST.NET'e kayit ol (Private plan)
- [ ] Ilk karti $500 altinda al (KYC yok)
- [ ] 100 ucretsiz kart listesini dene
- [ ] API key'i al

### Bu Hafta:
- [ ] Azul Card Telegram bot'a kayit ol
- [ ] Manuel olarak 1 kart al ve test et
- [ ] 3 provider'dan hangisi en yuksek onay orani veriyor karar ver
- [ ] kart-site kodunda `card-provider.ts` abstraction katmani yaz

### Onumuzdeki 2 Hafta:
- [ ] FlexCard API entegrasyonu tamamla (primary)
- [ ] PST.NET API entegrasyonu ekle (secondary)
- [ ] Azul Card manuel satis icin admin panel ekle
- [ ] Launch

---

## 7. KOD DEGISIKLIKLERI

```typescript
// kart-site/src/lib/card-provider.ts (YENI DOSYA)

interface CardProvider {
  createCard(opts: CreateOpts): Promise<Card>;
  topupCard(id: string, amount: number): Promise<void>;
  getCard(id: string): Promise<Card>;
  listCards(): Promise<Card[]>;
}

import { flexcard } from "./flexcard";
import { pstnet } from "./pstnet";
import { azul } from "./azul";

export function getProvider(tier: "nexus" | "omni" | "anonymous"): CardProvider {
  switch (tier) {
    case "nexus":     return flexcard;  // ucuz, online-only
    case "omni":      return pstnet;    // premium, Apple/Google Pay
    case "anonymous": return azul;      // ultra-privacy, manual
  }
}
```

---

## 8. SONUC

**Buvei yerine:**
- **Birincil: FlexCard** (en ucuz, API, no-KYC)
- **Ikincil: PST.NET** (premium, 69 BIN, ilk $500 KYC yok)
- **Ucuncul: AnoCard veya Azul Card** (anonim musteri segmenti)

Bu kombinasyonla:
- **Marj**: %60-80
- **Musteri cekme**: Fiyat + hiz + referral
- **OPSEC**: Tam (email only)
- **API otomasyonu**: Mumkun
- **Risk dagitimi**: 3 provider = 1 duserse digerleri calisir





