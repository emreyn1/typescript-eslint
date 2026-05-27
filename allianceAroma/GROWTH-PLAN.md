# Büyüme Planı — Prod-Ready Direkt Launch

> Waitlist yok. Ürün hazır olunca direkt yayına al. Bu dokümanda 3 ürün tipi için plan + otomasyon stratejileri.

---

## Genel Yaklaşım

| Adım | Ne zaman | Ne yap |
|------|----------|--------|
| 1 | Prod-ready olunca | Direkt launch, waitlist atla |
| 2 | Launch günü | Tüm kanallara aynı gün post |
| 3 | Sonrası | Otomasyon + rutin takip |

---

## Otomasyon Stratejisi (Verim Kaybetmeden)

### Kullanılabilecek Araçlar

| Görev | Araç | Otomasyon | Maliyet |
|-------|------|-----------|---------|
| Sosyal planlama | Buffer, Later, Hootsuite | Haftalık içerik tek seferde planla | Ücretsiz tier |
| Reddit | Reddit API / Manuel | Template + copy-paste | - |
| Telegram | Telegram Bot API (duyuru) | Otomatik "yeni içerik" mesajı | - |
| E-posta | Resend, Loops, Mailchimp | Bülten otomasyonu | Ücretsiz tier |
| Metrik takibi | Google Sheets, Airtable | Haftalık manuel giriş | Ücretsiz |
| İçerik taslağı | ChatGPT, Notion AI | Şablon üretimi | - |

### Otomasyon Sınırları

| Otomatik yapılabilir | Manuel kalmalı |
|----------------------|----------------|
| İçerik planlama (zamanlama) | Gerçek yorum, sohbet, cevap |
| Bülten gönderimi | Toplulukta etkileşim |
| Metrik toplama | Partnership görüşmeleri |
| Template mesajlar | Kişiselleştirilmiş DM |

---

# ÜRÜN 1: SMS Sitesi (Smspool, GrizzlySMS)

## Launch Günü Checklist (Prod-Ready Direkt)

- [ ] Site canlı
- [ ] API dokümantasyonu hazır
- [ ] Ödeme/test akışı çalışıyor
- [ ] Reddit: 1 post (r/cryptocurrency veya r/privacytoolsIO)
- [ ] Telegram: 3–5 ilgili gruba duyuru
- [ ] X/Twitter: Launch tweet + thread

## Haftalık Rutin (Otomasyon Uyumlu)

| Gün | Sabah (15 dk) | Öğle (10 dk) | Akşam (15 dk) |
|-----|---------------|--------------|---------------|
| Pzt | Reddit 2 yorum (template) | - | Telegram 2 grup |
| Sal | Buffer'a 3 post planla | - | GitHub güncelle |
| Çar | Reddit 1 post | - | Partnership 1 DM |
| Per | SEO blog taslağı | - | Telegram 2 grup |
| Cum | Metrik kontrol | - | Hafta özeti |

## Template Mesajlar (Copy-Paste)

```
[Reddit Post - SMS Site]
Title: Free SMS verification API for developers — no signup for first 5 numbers
Body: Built [X] for testing OTP flows. First 5 numbers free. Feedback welcome.
Link: [URL]
```

```
[Telegram - SMS Site]
Hey, launched [site name] — virtual numbers for SMS verification. 
Devs: API ready. First 5 free. [link]
```

---

# ÜRÜN 2: Film Sitesi (Fmovies, River)

## Launch Günü Checklist (Prod-Ready Direkt)

- [ ] Site canlı, ilk içerik yüklü
- [ ] Reddit: r/Piracy veya ilgili subreddit'e post
- [ ] Telegram: Film/dizi gruplarına duyuru
- [ ] TikTok/Reels: 1 launch videosu
- [ ] SEO: Ana sayfa + 5–10 popüler film sayfası

## Haftalık Rutin (Otomasyon Uyumlu)

| Gün | Sabah (15 dk) | Öğle (10 dk) | Akşam (15 dk) |
|-----|---------------|--------------|---------------|
| Pzt | Reddit 1 post | - | Telegram duyuru (yeni eklenenler) |
| Sal | TikTok 1 video planla | - | Reddit 2 yorum |
| Çar | SEO: 3 film sayfası | - | Telegram 2 grup |
| Per | TikTok çek + yayınla | - | Reddit 2 yorum |
| Cum | Metrik kontrol | - | Hafta özeti |

## Template Mesajlar

```
[Reddit - Film Site]
Title: [Site name] — minimal ads, fast streaming, [X] titles
Body: Just launched. Focus on [niche: e.g. Turkish subs]. Feedback welcome.
Link: [URL]
```

```
[Telegram - Film Site]
📽️ New: [Film/Dizi adı] added
🔗 [link]
```

---

# ÜRÜN 3: No KYC Kart Sitesi (nokyc.cards)

## Launch Günü Checklist (Prod-Ready Direkt)

- [ ] Site canlı, ödeme akışı çalışıyor
- [ ] Reddit: r/cryptocurrency, r/Bitcoin
- [ ] Telegram: Kripto grupları
- [ ] X/Twitter: Launch thread
- [ ] Referral programı aktif

## Haftalık Rutin (Otomasyon Uyumlu)

| Gün | Sabah (15 dk) | Öğle (10 dk) | Akşam (15 dk) |
|-----|---------------|--------------|---------------|
| Pzt | Reddit 2 yorum | - | X 2 tweet |
| Sal | Telegram 3 grup | - | Blog taslağı |
| Çar | Reddit 1 post | - | Partnership 1 DM |
| Per | X thread yaz | - | Telegram 2 grup |
| Cum | Metrik kontrol | - | Referral özeti |

## Template Mesajlar

```
[Reddit - No KYC Card]
Title: No KYC prepaid card — load with crypto, spend anywhere
Body: Built for privacy. [X] supported. [link]
```

```
[X/Twitter - No KYC Card]
🧵 Thread: Why I built a no-KYC card

1/ Most cards require ID. We don't.
2/ Load with BTC/ETH. Use anywhere.
3/ [link]
```

---

# Ortak Otomasyon Akışı (3 Ürün)

## Haftalık Tek Seferde Yapılacaklar (Pazar/Cumartesi)

| Görev | Süre | Araç |
|-------|------|------|
| Buffer/Later'a 7 günlük post planla | 30 dk | Buffer |
| Reddit post taslakları hazırla | 20 dk | Notion/Sheets |
| Telegram mesaj şablonları güncelle | 10 dk | Notion |
| Metrikleri Sheets'e gir | 15 dk | Google Sheets |

## Günlük Minimum (Toplam ~40 dk)

- 1 platformda 1–2 etkileşim (yorum/post)
- 1 içerik (video/tweet) veya 1 partnership DM

---

# Metrik Takip Şablonu

| Metrik | SMS | Film | No KYC |
|--------|-----|------|--------|
| Haftalık ziyaretçi | | | |
| Kayıt / kullanıcı | | | |
| Gelir (varsa) | | | |
| En iyi kanal | | | |
| En kötü kanal | | | |

---

# Özet: Prod-Ready Direkt Launch

1. **Waitlist yok** — hazır olunca direkt yayınla
2. **Launch günü** — tüm kanallara aynı gün post
3. **Otomasyon** — planlama + template + metrik; etkileşim manuel
4. **Rutin** — günde ~40 dk, haftada 1 planlama bloğu

---

# Kusursuz Planlama Sistemi

> Tek kişi olarak 3 ürünü aynı anda yönetmek için yapısal bir sistem gerekli.
> Aşağıdaki sistem "asla unutma, asla atla, asla zaman harca" prensibine dayanır.

---

## ADIM 1: Haftalık Planlama Bloğu (Pazar, 1.5 saat)

Bu tek oturum tüm haftayı belirler. Haftanın geri kalanında "şimdi ne yapayım?" sorusu olmaz.

### 1a. Geçen haftayı değerlendir (20 dk)

| Soru | Yaz |
|------|-----|
| Hangi kanal en çok trafik/kayıt getirdi? | |
| Hangi kanal hiç sonuç vermedi? | |
| Hedefler tuttu mu? (ziyaretçi, kayıt, gelir) | |
| Bu hafta neyi farklı yapmalıyım? | |

### 1b. Bu haftanın hedeflerini belirle (10 dk)

Her ürün için 1 ana hedef:

| Ürün | Bu haftanın hedefi | Metrik |
|------|---------------------|--------|
| SMS | ör. Reddit'ten 50 ziyaretçi | Analytics kontrol |
| Film | ör. 3 yeni TikTok, 100 view | TikTok analytics |
| No KYC | ör. 2 partnership DM → 1 cevap | DM takibi |

### 1c. İçerik üretimi (30 dk)

Tüm haftanın içeriklerini tek seferde üret:

| Gün | SMS | Film | No KYC |
|-----|-----|------|--------|
| Pzt | Reddit yorum x2 | Reddit post | Reddit yorum x2 |
| Sal | Tweet x2 | TikTok script | Tweet x2 |
| Çar | Reddit post | Telegram duyuru | Reddit post |
| Per | Blog taslağı | TikTok script | X thread |
| Cum | - | - | - |

### 1d. Buffer/Later'a yükle (20 dk)

- Tüm tweet'leri → Buffer'a planla
- TikTok scriptlerini → Notion'a yaz
- Reddit postlarını → Sheets'e taslak olarak kaydet
- Telegram mesajlarını → hazır tut

### 1e. Partnership listesi güncelle (10 dk)

| Ürün | Bu hafta DM atacağım kişi/proje | Platform | Durum |
|------|----------------------------------|----------|-------|
| SMS | | | |
| Film | | | |
| No KYC | | | |

---

## ADIM 2: Günlük Rutin (40 dk, sabit saat)

Saat sabitle (ör. her gün 10:00 veya 21:00). Aynı saatte başla, bitir.

### Günlük akış (her gün aynı sıra)

```
[5 dk] Metriklere göz at (Analytics, Supabase, Stripe)
   ↓
[10 dk] Bugünün planlanmış postunu yayınla/kopyala
   ↓
[15 dk] 1 platformda etkileşim (yorum, cevap, sohbet)
   ↓
[5 dk] 1 partnership DM veya follow-up
   ↓
[5 dk] Yarın ne yapılacak → Notion/Sheets'te işaretle
```

### Günlük "sadece bunu yap" kuralı

| Gün | SMS | Film | No KYC |
|-----|-----|------|--------|
| Pzt | Reddit | Reddit | Reddit |
| Sal | Buffer post | TikTok çek | X tweet |
| Çar | Telegram | Telegram | Telegram |
| Per | Blog / SEO | TikTok çek | X thread |
| Cum | Metrik + özet | Metrik + özet | Metrik + özet |
| Cmt | Boş (catch-up varsa) | Boş | Boş |
| Paz | PLANLAMA BLOĞU | PLANLAMA BLOĞU | PLANLAMA BLOĞU |

---

## ADIM 3: İçerik Üretim Sistemi (Batch)

### Prensip: "1 otur, 7 gün üret"

| İçerik | Nasıl batch yapılır |
|--------|----------------------|
| Tweet / X postları | 7 tweet yaz, Buffer'a yükle |
| Reddit postları | 3 post taslağı yaz, Sheets'e kaydet |
| TikTok videoları | 2–3 video tek seferde çek |
| Blog yazıları | 1 uzun yazı yaz, parçalara böl |
| Telegram duyuruları | 5 mesaj hazırla, bot ile zamanla |

### İçerik kaynakları (fikir tükenmemesi için)

| Kaynak | Nasıl kullanılır |
|--------|-------------------|
| Rakip siteler | Ne paylaşıyorlar? Benzerini yap |
| Reddit soruları | Sık sorulan sorulara cevap → içerik |
| Google Trends | Trend konular → içerik |
| Kullanıcı geri bildirimi | Şikayet/övgü → içerik |

---

## ADIM 4: Metrik Takip Sistemi

### Google Sheets tablosu (haftalık güncelle)

```
| Hafta | Ürün | Ziyaretçi | Kayıt | Gelir | En iyi kanal | Aksiyon |
|-------|------|-----------|-------|-------|--------------|---------|
| H1    | SMS  |           |       |       |              |         |
| H1    | Film |           |       |       |              |         |
| H1    | NoKYC|           |       |       |              |         |
| H2    | SMS  |           |       |       |              |         |
```

### Karar kuralları

| Durum | Aksiyon |
|-------|---------|
| Kanal 2 haftadır 0 sonuç | Kes veya değiştir |
| Kanal sürekli büyüyor | Daha fazla zaman ayır |
| Tüm kanallar düşük | Ürün/mesaj problemi olabilir, geri bildirim topla |
| 1 kanal dominant | Diğerlerini azalt, buna odaklan |

---

## ADIM 5: Otomasyon Derinleştirme

### Telegram bot (film sitesi için)

```
Yeni film/dizi eklendiğinde:
  → Bot otomatik mesaj atar: "📽️ [Film adı] eklendi → [link]"
  → Kanal: kendi Telegram kanalın
```

### Buffer / Later otomasyonu

```
Pazar günü:
  → 7 günlük tweet/post yükle
  → Otomatik yayınlanır, dokunmana gerek yok
```

### Google Sheets + formül

```
Haftalık büyüme otomatik hesaplanır:
  = (Bu hafta ziyaretçi - Geçen hafta) / Geçen hafta * 100
```

### E-posta bülteni (Loops / Mailchimp)

```
Otomatik:
  → Yeni kayıt → hoş geldin e-postası
  → Haftalık → "bu hafta eklenenler" e-postası
```

---

## ADIM 6: Hata Yapma Rehberi (Yapılmaması Gerekenler)

| Hata | Neden kötü | Ne yap |
|------|------------|--------|
| 3 ürüne eşit zaman ayırma | Biri daha hızlı büyür; ona odaklan | 60/20/20 oranı |
| Her gün farklı strateji | Tutarlılık > deney | 2 hafta aynı planı uygula, sonra değerlendir |
| Metriklere bakmama | Neyin işe yaradığını bilemezsin | Cuma günü 5 dk metrik |
| Toplulukta spam | Ban + kötü izlenim | Değer ver, sonra tanıt |
| Mükemmeliyetçilik | Hiçbir şey yayınlanmaz | %80 iyi → yayınla |
| Her platformda olma | Enerji dağılır | Ürün başına max 2–3 platform |

---

## ADIM 7: 30 Günlük Yol Haritası

### Hafta 1: Launch + ilk trafik

| Gün | Görev |
|-----|-------|
| 1 | 3 ürünü de yayınla |
| 1 | Her ürün için 1 Reddit post + 3 Telegram grubu |
| 2–3 | Gelen yorumlara cevap ver |
| 4–5 | TikTok/Reels ilk video (film sitesi) |
| 6–7 | Metrik kontrol + 2. hafta planı |

### Hafta 2: Tutarlılık + derinleşme

| Gün | Görev |
|-----|-------|
| 8–9 | En iyi kanala 2x zaman ayır |
| 10–11 | Partnership ilk DM'ler |
| 12–13 | SEO: blog yazıları başla |
| 14 | Metrik kontrol + 3. hafta planı |

### Hafta 3: Optimizasyon

| Gün | Görev |
|-----|-------|
| 15–16 | İşe yaramayan kanalı kes |
| 17–18 | En iyi kanalda içerik artır |
| 19–20 | Referral programını aktifleştir/güçlendir |
| 21 | Metrik kontrol + 4. hafta planı |

### Hafta 4: Ölçeklendirme kararı

| Gün | Görev |
|-----|-------|
| 22–24 | En çok büyüyen ürüne %60 zaman ayır |
| 25–26 | Diğer 2 ürün: minimal efor (otomasyon) |
| 27–28 | Ay sonu büyük metrik değerlendirmesi |
| 29–30 | 2. ay planını yaz |

---

## Ay Sonu Değerlendirme Şablonu

| Soru | SMS | Film | No KYC |
|------|-----|------|--------|
| Toplam ziyaretçi | | | |
| Toplam kayıt | | | |
| Toplam gelir | | | |
| En etkili kanal | | | |
| En büyük sorun | | | |
| 2. ay öncelik | | | |
| Devam mı, pivot mi? | | | |

---

## Altın Kurallar

1. **Pazar = planlama günü.** Atlanmaz.
2. **Günlük 40 dk sabit saat.** Rutini kır → momentum kaybolur.
3. **2 hafta aynı plan.** Sonra değerlendir. Erken değiştirme.
4. **Metrik yoksa karar yok.** Her şeyi ölç.
5. **1 ürün öne çıkarsa → ona yüklen.** 3'e eşit dağıtma.
6. **%80 yeterli.** Yayınla, geliştir, tekrar yayınla.

---

# İçerik Kaynakları: Ne Paylaşılacak, Görsel Nereden Alınacak

> Her ürün için spesifik: ne paylaşılacak, hangi platformda, görsel/video nereden.

---

## ÜRÜN 1: SMS Sitesi — İçerik Planı

### Ne paylaşılacak?

| İçerik türü | Örnek | Platform |
|-------------|-------|----------|
| Kullanım rehberi | "5 dakikada SMS doğrulama nasıl yapılır" | Reddit, Blog |
| API örnek kodu | Python/Node.js snippet | GitHub, Reddit, X |
| Fiyat karşılaştırması | "[Site] vs SMSPool vs GrizzlySMS" | Blog, Reddit |
| Ekran görüntüsü | Dashboard, numara listesi | Reddit, X, Telegram |
| "Bunu biliyor muydun?" | "WhatsApp doğrulama 50+ ülkede" | X, Telegram |
| Müşteri deneyimi | "İlk 1000 kullanıcı hikayesi" | X thread, Reddit |

### Görseller nereden?

| Görsel türü | Kaynak | Not |
|-------------|--------|-----|
| Ekran görüntüsü | Kendi sitenden screenshot | Ücretsiz |
| Mockup (telefon, laptop) | Shots.so, Mockuphone.com | Ücretsiz |
| Banner/sosyal görsel | Canva (ücretsiz tier) | Template'ler var |
| Kod snippet görseli | Carbon.now.sh, Ray.so | Ücretsiz |
| İkon/illüstrasyon | Undraw.co, Flaticon | Ücretsiz |

---

## ÜRÜN 2: Film Sitesi — İçerik Planı

### Ne paylaşılacak?

| İçerik türü | Örnek | Platform |
|-------------|-------|----------|
| Yeni eklenen film/dizi | "Bu hafta eklenenler: [liste]" | Telegram, Reddit |
| "Top 10" listeleri | "2026'nın en iyi 10 aksiyon filmi" | TikTok, Reddit |
| Film önerisi | "Bu filmi izlemediysen kaçırıyorsun" | TikTok, Reels, X |
| Sahne klibi | 15–30 sn etkileyici sahne | TikTok, Reels |
| Karşılaştırma | "[Site] vs Netflix — ücretsiz alternatif" | Reddit, X |
| Meme / komik içerik | Film meme'leri | X, Reddit, Telegram |

### Görseller ve video nereden?

| Görsel/Video türü | Kaynak | Not |
|-------------------|--------|-----|
| Film posteri | TMDB API (image.tmdb.org) | Ücretsiz API, hotlink OK |
| Film klibi (TikTok için) | YouTube trailer → kesim | CapCut ile düzenle |
| Thumbnail | Canva + TMDB poster | Ücretsiz |
| Film bilgisi (yıl, tür, puan) | TMDB API, IMDB | Ücretsiz |
| Meme şablonu | Imgflip.com, Kapwing | Ücretsiz |

### TMDB API kullanımı

```
API Key: https://www.themoviedb.org/settings/api (ücretsiz)
Poster URL: https://image.tmdb.org/t/p/w500/[poster_path]
Film bilgisi: https://api.themoviedb.org/3/movie/[id]?api_key=XXX
```

---

## ÜRÜN 3: No KYC Kart — İçerik Planı

### Ne paylaşılacak?

| İçerik türü | Örnek | Platform |
|-------------|-------|----------|
| Kullanım rehberi | "No KYC kartla Spotify nasıl alınır" | Blog, Reddit, X |
| Gizlilik rehberi | "Online gizliliğini koru — adım adım" | Reddit, X thread |
| Karşılaştırma | "[Site] vs nokyc.cards vs diğerleri" | Blog, Reddit |
| Kripto ödeme rehberi | "BTC ile kart yükleme — 2 dakika" | X, Telegram |
| Başarı hikayesi | "KYC olmadan X ülkeden alışveriş" | Reddit, Telegram |
| Haber/gelişme | "X ülke KYC zorunlu kıldı — alternatif" | X, Reddit |

### Görseller nereden?

| Görsel türü | Kaynak | Not |
|-------------|--------|-----|
| Kart mockup | Kendi tasarımın (Canva/Figma) | Gerçek kart gösterme |
| Kripto ikonlar | Cryptoicons.co, CoinGecko | Ücretsiz |
| Gizlilik görselleri | Unsplash (privacy, security) | Ücretsiz |
| Infografik | Canva, Piktochart | Ücretsiz |
| Ekran görüntüsü | Kendi sitenden | Hassas bilgileri gizle |

---

## Ortak Görsel Araçları

| Araç | Ne için | URL | Maliyet |
|------|---------|-----|---------|
| **Canva** | Sosyal medya görseli, banner, thumbnail | canva.com | Ücretsiz tier |
| **Carbon** | Kod snippet görseli | carbon.now.sh | Ücretsiz |
| **Shots.so** | Uygulama/site mockup | shots.so | Ücretsiz |
| **Remove.bg** | Arka plan kaldırma | remove.bg | Ücretsiz (düşük çözünürlük) |
| **Unsplash** | Stok fotoğraf | unsplash.com | Ücretsiz |
| **Undraw** | İllüstrasyon (SVG) | undraw.co | Ücretsiz |
| **CapCut** | Video düzenleme (TikTok) | capcut.com | Ücretsiz |
| **Figma** | UI tasarım, mockup | figma.com | Ücretsiz tier |
| **TMDB** | Film poster/bilgi | themoviedb.org | Ücretsiz API |
| **Imgflip** | Meme oluşturma | imgflip.com | Ücretsiz |

---

# Sahte Hesap Stratejisi (Astroturfing)

> 100 hesapla "kesinlikle öneriyorum" tarzı yorumlar yapma.

## Nasıl çalışır?

```
100 farklı hesap oluştur (Reddit, X, Telegram, forum)
   ↓
Her hesapla organik görünümlü yorum yap:
   "Bu siteyi denedim, gerçekten iyi çalışıyor"
   "Arkadaşım önerdi, memnun kaldım"
   ↓
Güvenilirlik algısı oluşur (social proof)
```

## Detaylı uygulama

### Hesap oluşturma

| Platform | Kaç hesap | Nasıl |
|----------|-----------|-------|
| Reddit | 20–30 | Farklı e-posta, farklı IP (VPN) |
| X/Twitter | 20–30 | Aynı yöntem |
| Telegram | 10–20 | Farklı numara (kendi SMS siten!) |
| Forum/blog yorumları | 20–30 | Disqus, WordPress yorumları |

### Hesap olgunlaştırma (çok önemli)

| Adım | Süre | Ne yap |
|------|------|--------|
| 1 | 1–2 hafta | Hesabı oluştur, alakasız subreddit'lerde yorum yap |
| 2 | 2–3 hafta | Karma kazan, normal görün |
| 3 | 3. haftadan sonra | Ürünü doğal şekilde öner |

**Yeni hesapla direkt reklam = anında ban.**

### Yorum şablonları (doğal görünümlü)

```
[Tarz 1 - Soru cevabı]
"I've been using [site] for a couple weeks now. 
Works fine for [use case]. Not perfect but way better than [rakip]."
```

```
[Tarz 2 - Karşılaştırma]
"Tried [rakip1] and [rakip2] before. [Site] has better [feature]. 
Price is about the same tho."
```

```
[Tarz 3 - Casual]
"oh yeah [site] works. been using it since last month."
```

```
[Tarz 4 - Detaylı]
"Just switched from [rakip] to [site]. Main reasons:
- [Feature 1]  
- [Feature 2]  
- Pricing is better for my use case.  
Not affiliated, just sharing what worked for me."
```

### Yorum kuralları

| Kural | Neden |
|-------|-------|
| Her hesaptan max ayda 1–2 kez ürünü öner | Fazlası şüpheli |
| Her hesabın %80 yorumu alakasız konularda | Hesap organik görünmeli |
| Aynı gün 5 hesapla aynı post'a yorum yapma | Pattern tespiti |
| "Not affiliated" yaz ara sıra | Güvenilirlik |
| Küçük eleştiri de ekle | "%100 mükemmel" şüpheli |
| Her hesabın farklı yazım tarzı olsun | Aynı kişi gibi görünme |

### Riskler

| Risk | Olasılık | Sonuç |
|------|----------|-------|
| Reddit ban | Orta | Hesap kaybı, IP ban |
| X/Twitter ban | Düşük–Orta | Hesap kaybı |
| Toplulukta rezil olma | Düşük | Marka zararı |
| Platform yasal işlem | Çok düşük | ToS ihlali |

### Risk azaltma

- VPN / farklı IP kullan
- Hesapları olgunlaştır (en az 2 hafta)
- Aynı pattern'i tekrarlama
- Agresif değil, doğal ol
- Kendi SMS siteni numara için kullan

---

# Ek Gelişmiş Stratejiler

## 1. Rakip kullanıcılarını çekme

| Adım | Nasıl |
|------|-------|
| Rakibin Reddit/X'te şikayet eden kullanıcılarını bul | "SMSPool down again" gibi aramalar |
| O kullanıcılara cevap ver | "I switched to [site], working fine" |
| Doğal görünsün | Hesap olgunlaşmış olmalı |

## 2. SEO saldırısı (agresif)

| Hedef anahtar kelime | Sayfa türü |
|----------------------|------------|
| "[rakip] alternative" | Blog: "[Rakip] vs [Site] — karşılaştırma" |
| "[rakip] down" | Blog: "[Rakip] çalışmıyor mu? Alternatif" |
| "[rakip] review" | Blog: "[Rakip] dürüst inceleme + alternatif" |
| "free [hizmet]" | Landing page: "Free [hizmet] — no signup" |

## 3. Telegram kanal büyütme

| Adım | Nasıl |
|------|-------|
| Kendi kanalını aç | ör. @smsverify_updates |
| Başka gruplardan kullanıcı çek | Değerli içerikle, spam olmadan |
| Bot ile otomatik duyuru | Yeni numara/film/kart eklendi → otomatik mesaj |
| Kanal değişimi (cross-promo) | Benzer kanallarla karşılıklı tanıtım |

## 4. "Ölü rakip" stratejisi

| Adım | Nasıl |
|------|-------|
| Kapanan/bozulan rakipleri tespit et | Google "[rakip] not working" |
| "[Rakip] alternative" sayfası oluştur | SEO ile o trafiği yakala |
| Reddit/forum'da cevap ver | "Evet [rakip] kapandı, ben [site]'e geçtim" |

## 5. Upvote / like boost

| Platform | Nasıl | Risk |
|----------|-------|------|
| Reddit | Kendi hesaplarınla upvote | Yüksek → çok dikkatli |
| Product Hunt | Arkadaş/tanıdıktan upvote iste | Düşük |
| X/Twitter | Kendi hesaplardan like/retweet | Orta |

**Kural:** Reddit'te upvote manipulation = en hızlı ban sebebi. Çok dikkatli ol.

## 6. Affiliate / referral agresif kullanım

| Strateji | Nasıl |
|----------|-------|
| İlk kullanıcılara yüksek komisyon | "%20 komisyon ilk 100 kişiye" |
| "Davet et, ücretsiz kullan" | 3 kişi davet et → 1 ay ücretsiz |
| Leaderboard | "En çok davet eden → ödül" |

## 7. İçerik hırsızlığı (etik gri alan)

| Ne | Nasıl |
|----|-------|
| Rakibin blog yazısını yeniden yaz | Aynı konu, farklı açı, daha iyi SEO |
| Rakibin viral tweet'ini adapte et | Aynı format, kendi ürününle |
| Popüler YouTube videolarına cevap video | "X dedi ama aslında..." |

---

# Tam Otomasyon Akışı (3 Ürün + Sahte Hesaplar)

## Haftalık zaman dağılımı

| Görev | Süre | Sıklık |
|-------|------|--------|
| Planlama (Pazar) | 1.5 saat | Haftalık |
| Günlük rutin (ana hesap) | 40 dk/gün | Günlük |
| Sahte hesap etkileşimi | 30 dk/gün | Günlük |
| İçerik üretimi (batch) | 1 saat | Haftalık |
| Metrik kontrol | 15 dk | Cuma |
| **Toplam haftalık** | **~8 saat** | |

## Günlük akış (detaylı)

```
09:00 - 09:05  Metriklere göz at
09:05 - 09:20  Ana hesaplardan planlanmış post yayınla
09:20 - 09:35  1 platformda gerçek etkileşim
09:35 - 09:40  1 partnership DM

21:00 - 21:15  Sahte hesap 1: Reddit yorum (alakasız konu)
21:15 - 21:30  Sahte hesap 2–3: Telegram/X'te ürün yorumu (doğal)
```

---

# Özet: En İyinin En İyisi

| Strateji | Etkisi | Riski |
|----------|--------|-------|
| Organik topluluk etkileşimi | Yüksek | Yok |
| Sahte hesap social proof | Yüksek | Orta |
| Rakip kullanıcı çekme | Yüksek | Düşük |
| SEO saldırısı | Yüksek (uzun vade) | Yok |
| Referral agresif kullanım | Orta–Yüksek | Düşük |
| Upvote boost | Orta | Yüksek |
| İçerik batch üretimi | Verimlilik | Yok |

**Sıralama (önce yap):**

1. Organik topluluk + içerik (temel)
2. Sahte hesap olgunlaştırma (paralel başla)
3. SEO saldırısı (uzun vade)
4. Rakip kullanıcı çekme (fırsat bulunca)
5. Referral güçlendirme (kullanıcı geldikçe)

---

# Hafta Hafta İçerik Planı (3 Ürün)

> İlk 4 hafta kritik. Her hafta farklı amaç, farklı içerik türü.
> Amaç: platform algoritmalarını öğrenmek, neyin tuttuğunu bulmak, shadow ban'den kaçınmak.

---

## Genel İçerik Stratejisi

```
Hafta 1: TANITIM    → "Ben buyum, bunu yaptım"
Hafta 2: EĞİTİM    → "Nasıl yapılır" + değer ver
Hafta 3: SOCIAL PROOF → Kullanıcı hikayesi, karşılaştırma, sonuçlar
Hafta 4: AGRESIF    → Rakip hedefleme, SEO, referral push
5+ hafta: TEKRARLA  → En çok işe yarayanı 2x yap
```

---

## ÜRÜN 1: SMS Sitesi — Haftalık İçerik Planı

### Hafta 1: Tanıtım (farkındalık)

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | Reddit | "I built an SMS verification API — first 5 numbers free" (r/SideProject) | İlk görünürlük |
| Sal | X | Tweet: "Launched [site]. Virtual numbers for dev testing. Free tier available." | Keşif |
| Çar | Telegram | 3 geliştirici grubuna kısa mesaj | Direkt ulaşım |
| Per | X | Ekran görüntüsü: dashboard, numara listesi | Görsel güven |
| Cum | Reddit | r/webdev veya r/programming'de soru cevapla, altta link | Organik |

### Hafta 2: Eğitim (değer ver)

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | Blog | "How to verify phone numbers in your app — 5 minute guide" | SEO |
| Sal | X | Thread: "SMS verification for devs — 5 things I learned" | Algoritmaya gir |
| Çar | GitHub | README + örnek kod (Python, Node.js) | Geliştirici çek |
| Per | Reddit | r/learnprogramming: birinin sorusuna detaylı cevap + link | Organik |
| Cum | Telegram | "Quick tip: [ülke] numaraları [use case] için en iyisi" | Değer |

### Hafta 3: Social proof

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | X | "1 haftada X kullanıcı — teşekkürler" (gerçek veya yakın sayı) | Güven |
| Sal | Reddit | "[Site] vs SMSPool — dürüst karşılaştırma" | Rakip trafiği çek |
| Çar | Blog | "Why developers are switching from [rakip] to [site]" | SEO |
| Per | Telegram | Kullanıcı DM screenshot (izinle) veya anket sonucu | Social proof |
| Cum | X | "Most requested feature: [feature]. Shipped today." | Aktif geliştirme |

### Hafta 4: Agresif büyüme

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | Blog | "[Rakip] alternative — compare features and pricing" | SEO saldırısı |
| Sal | Reddit | r/cryptocurrency: "Best SMS for crypto signups" | Niş hedefleme |
| Çar | Sahte hesaplar | 3 hesaptan doğal yorum (olgunlaşmış hesaplar) | Social proof |
| Per | X | Partnership duyurusu veya entegrasyon | Güvenilirlik |
| Cum | Tüm platformlar | Metrik değerlendir → en iyi kanalı belirle | Optimizasyon |

---

## ÜRÜN 2: Film Sitesi — Haftalık İçerik Planı

### Hafta 1: Tanıtım

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | Reddit | r/Piracy veya ilgili sub: "New streaming site — no signup, minimal ads" | İlk trafik |
| Sal | TikTok | Video: Sitenin ekran kaydı, "free movies no sign up" | Keşif |
| Çar | Telegram | 5 film/dizi grubuna duyuru | Direkt ulaşım |
| Per | TikTok | Video: "Top 5 movies you can watch right now for free" | Değer |
| Cum | Reddit | Gelen yorumlara cevap, feedback al | Topluluk |

### Hafta 2: Eğitim + değer

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | TikTok | "Underrated movies you probably missed" (film önerisi) | Algoritma |
| Sal | Telegram | "Bu haftanın en çok izlenenleri: [liste]" | Engagement |
| Çar | TikTok | "Movies that hit different at 2am" (mood bazlı) | Viral potansiyel |
| Per | Reddit | Film önerisi thread'ine yorum + site linki | Organik |
| Cum | TikTok | "Free Netflix alternative?" — ekran kaydı | Karşılaştırma |

### Hafta 3: Social proof + topluluk

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | TikTok | "POV: You found a free streaming site with no ads" | Trend format |
| Sal | Telegram | Anket: "Hangi filmi ekleyelim?" | Engagement |
| Çar | Reddit | "1 haftada X ziyaretçi — en çok izlenen filmler" | Social proof |
| Per | TikTok | Kullanıcı yorumu screenshot + teşekkür | Güven |
| Cum | X | Thread: "How I built a free streaming site" | Hikaye |

### Hafta 4: Agresif

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | SEO | "[Film adı] izle", "[Dizi adı] watch online" sayfaları | SEO trafik |
| Sal | TikTok | Trend ses + film clip mashup | Viral denemesi |
| Çar | Sahte hesaplar | Reddit/forum'da doğal öneri | Social proof |
| Per | Telegram | "1000 film aştık — şimdi ne ekleyelim?" | Topluluk |
| Cum | Tüm platformlar | Metrik değerlendir | Optimizasyon |

---

## ÜRÜN 3: No KYC Kart — Haftalık İçerik Planı

### Hafta 1: Tanıtım

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | Reddit | r/cryptocurrency: "No KYC prepaid card — load with BTC" | İlk görünürlük |
| Sal | X | Thread: "Why I built a no-KYC card (3 reasons)" | Hikaye |
| Çar | Telegram | 5 kripto grubuna kısa duyuru | Direkt ulaşım |
| Per | X | Kart mockup görseli + "available now" | Görsel |
| Cum | Reddit | r/Bitcoin veya r/privacy: soru cevapla + link | Organik |

### Hafta 2: Eğitim

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | Blog | "How to get a prepaid card without KYC — step by step" | SEO |
| Sal | X | Thread: "5 things you can do with a no-KYC card" | Değer |
| Çar | Telegram | "Quick guide: BTC → card → Spotify/Netflix" | Kullanım senaryosu |
| Per | Reddit | r/privacy: gizlilik rehberi, altta link | Organik |
| Cum | X | "Most asked question: [soru]. Here's the answer." | Engagement |

### Hafta 3: Social proof

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | X | "X cards issued this week — thanks for the trust" | Güven |
| Sal | Blog | "[Site] vs nokyc.cards — honest comparison" | SEO + rakip |
| Çar | Telegram | Kullanıcı geri bildirimi + teşekkür | Social proof |
| Per | Reddit | "Switched from [rakip] — here's why" (sahte veya gerçek) | Karşılaştırma |
| Cum | X | "New feature: [feature] — you asked, we built" | Aktif geliştirme |

### Hafta 4: Agresif

| Gün | Platform | İçerik | Amaç |
|-----|----------|--------|------|
| Pzt | SEO | "[rakip] alternative", "no kyc card [year]" | SEO saldırısı |
| Sal | X | Referral program duyurusu: "%20 komisyon" | Referral push |
| Çar | Sahte hesaplar | 3 hesaptan doğal yorum | Social proof |
| Per | Telegram | "Referral leaderboard — en çok davet eden = ödül" | Viral mekanik |
| Cum | Tüm platformlar | Metrik değerlendir | Optimizasyon |

---

# Shadow Ban Korunma Rehberi

> Shadow ban = içeriğin kimseye gösterilmez ama bildirim almassın. Sessiz ölüm.

---

## Platform bazlı shadow ban sebepleri ve korunma

### Reddit

| Sebep | Korunma |
|-------|---------|
| Yeni hesapla çok post/link | İlk 2 hafta sadece yorum yap, link paylaşma |
| Aynı linki tekrar tekrar atma | Farklı subreddit'lerde farklı açılarla paylaş |
| Upvote manipulation | Kendi hesaplarınla upvote YAPMA (en riskli) |
| Hesaplar arasında pattern | Farklı IP, farklı saat, farklı yazım tarzı |
| Self-promotion oranı | Toplam yorumların max %10'u kendi linkin olsun |

**Reddit shadow ban testi:** Gizli modda kendi profiline bak. "User not found" = shadow ban.

### TikTok

| Sebep | Korunma |
|-------|---------|
| İlk videolarda link paylaşma | İlk 5 video: link YOK, sadece içerik |
| Telif hakkı müzik/video | CapCut stok sesler veya trending sesler kullan |
| Aynı içeriği tekrar yükleme | Her video farklı olsun |
| "Follow for more" / CTA spam | Doğal bitir, agresif CTA yapma |
| Hesap çok yeni + çok aktif | İlk 3 gün: günde max 1 video |

**TikTok shadow ban testi:** Video yükle → 1 saat sonra view sayısı 0 ise muhtemelen shadow ban.

**TikTok shadow ban kurtulma:**
1. 2–3 gün hiç post atma
2. Trend sesleri kullanarak 1 kısa video at
3. Hashtag kullanımını değiştir
4. Wi-Fi yerine mobil veri ile yükle

### X / Twitter

| Sebep | Korunma |
|-------|---------|
| Çok fazla mention/reply spam | Günde max 10–15 reply |
| Aynı mesajı farklı kişilere gönderme | Her mesajı kişiselleştir |
| Çok hızlı takip/takipten çıkma | Günde max 50 follow |
| Link-only tweet'ler | Tweet'lerin %70'i link olmadan olsun |
| Yeni hesap + agresif aktivite | İlk hafta: sadece like, retweet, kısa yorum |

**X shadow ban testi:** https://shadowban.yuzurisa.com veya gizli modda tweet'ini ara.

### Telegram

| Sebep | Korunma |
|-------|---------|
| Gruplara spam mesaj | Her gruba günde max 1–2 mesaj |
| Çok fazla gruba aynı anda katılma | Günde max 5 yeni grup |
| Direkt reklam | Önce sohbete katıl, değer ver, sonra paylaş |
| Bot davranışı | Mesaj aralıkları rastgele olsun |

---

## Genel shadow ban korunma kuralları

| Kural | Açıklama |
|-------|----------|
| **Yavaş başla** | Her platformda ilk hafta düşük aktivite |
| **%80 değer, %20 tanıtım** | 5 içerikten 4'ü değerli, 1'i kendi ürünün |
| **Pattern kırma** | Aynı saatte, aynı formatta, aynı linki paylaşma |
| **Farklı cihaz/IP** | Sahte hesaplar için VPN, farklı tarayıcı |
| **Engagement odaklı** | Algoritma engagement'ı sever; soru sor, tartışma başlat |
| **Sil-baştan hazırlığı** | Her platform için yedek hesap hazır tut |

---

# Kesin Çalışan Yöntemi Bulma Sistemi

> Hiçbir strateji %100 garanti değil. Ama sistematik test ile "senin için çalışanı" bulabilirsin.

---

## Test döngüsü

```
DENE (2 hafta aynı strateji)
   ↓
ÖLÇ (metrikler: trafik, kayıt, gelir)
   ↓
KARŞILAŞTIR (hangi kanal daha iyi?)
   ↓
KARAR VER
   ├── İşe yarıyor → 2x zaman ayır
   ├── Belirsiz → 1 hafta daha dene
   └── İşe yaramıyor → Kes, yeni kanal dene
```

## Haftalık A/B test planı

### Nasıl çalışır?

Her hafta 1 değişken test et, diğer her şeyi aynı tut.

| Hafta | Test edilen | A versiyonu | B versiyonu | Ölçülen metrik |
|-------|-------------|-------------|-------------|----------------|
| 1 | Platform | Reddit | Telegram | Kayıt sayısı |
| 2 | İçerik türü | Eğitim videosu | Karşılaştırma postu | Tıklama oranı |
| 3 | CTA | "Try free" | "No signup needed" | Dönüşüm |
| 4 | Saat | Sabah 10:00 | Akşam 21:00 | Engagement |

### Test sonucu kayıt şablonu

```
| Test # | Tarih | Ne test edildi | A sonucu | B sonucu | Kazanan | Sonraki adım |
|--------|-------|----------------|----------|----------|---------|--------------|
| 1      |       |                |          |          |         |              |
| 2      |       |                |          |          |         |              |
```

## "Kesin çalışan" nasıl bulunur?

| Adım | Ne yap | Süre |
|------|--------|------|
| 1 | 5 farklı kanalı dene | 2 hafta |
| 2 | En iyi 2'yi seç | - |
| 3 | Bu 2 kanalda 3 farklı içerik türü dene | 2 hafta |
| 4 | En iyi içerik türünü seç | - |
| 5 | Bu kanal + içerik türünde 3 farklı CTA dene | 1 hafta |
| 6 | Kazanan kombinasyonu buldun → ölçekle | Sürekli |

### Sonuç: "Kazanan formül"

```
[En iyi platform] + [en iyi içerik türü] + [en iyi CTA] + [en iyi saat]
= Senin kazanan formülün
```

Örnek: "Reddit + karşılaştırma postu + 'try free' CTA + Salı 21:00"

Bu formülü bulduktan sonra:
- Bu kanala %60 zaman ayır
- Diğer kanallar %40
- Her ay formülü yeniden test et (platform değişir)

---

# İçerik Üretimi: Manuel mi, Yardımlı mı?

> Kısa cevap: %50 yardımlı, %50 manuel. Ama hangi parça hangisi olacak önemli.

---

## Ne AI ile yapılabilir, ne manuel olmalı?

| Görev | AI yardımı | Manuel | Neden |
|-------|------------|--------|-------|
| Blog yazısı taslağı | ChatGPT ile yaz | Düzenle, kişiselleştir | AI hızlı ama sıkıcı yazar |
| Tweet / X postu | ChatGPT ile 10 tane üret | En iyi 3'ü seç, düzenle | Batch üretim verimli |
| Reddit yorumu | YAPMA | Tamamen manuel | Reddit AI içeriği tespit eder, ban riski |
| TikTok script | ChatGPT ile taslak | Kendi sesinle çek | Senaryo AI, performans sen |
| Blog SEO başlığı | ChatGPT + SEO aracı | Final kararı sen ver | AI iyi önerir ama kontrol gerek |
| Telegram mesajı | Template yaz | Kopyala + hafif değiştir | Hızlı ama robotik olmasın |
| E-posta bülteni | ChatGPT ile taslak | Düzenle, kişiselleştir | Ton önemli |
| Karşılaştırma tablosu | ChatGPT ile oluştur | Doğrula, güncelle | Rakip bilgisi değişir |
| Meme / komik içerik | YAPMA | Tamamen manuel | AI mizahı kötü |

## AI içerik üretim akışı

```
Adım 1: ChatGPT'ye brief ver
   → "Write 7 tweets about [ürün]. Tone: casual, dev-friendly. Include 1 CTA."
   → 2 dakika

Adım 2: 7 tweet'ten 3–4 tanesini seç
   → 1 dakika

Adım 3: Kendi tarzına göre düzenle
   → Emoji ekle/çıkar, CTA değiştir, kişisel dokunuş
   → 3 dakika

Adım 4: Buffer'a yükle
   → 2 dakika

Toplam: ~8 dakika = 1 haftanın tweet'leri hazır
```

## ChatGPT prompt şablonları

### Tweet üretimi

```
Write 7 tweets for [ürün adı]. 
Product: [kısa açıklama]
Tone: casual, slightly technical
Rules:
- Max 200 characters each
- 2 tweets with links, 5 without
- 1 thread idea
- No emojis except 1-2 per tweet
- Include subtle CTA in 3 of them
```

### Blog yazısı

```
Write a 800-word blog post:
Title: "[Rakip] vs [Senin site] — Honest Comparison"
Structure:
- Intro (why this matters)
- Feature comparison table
- Pricing comparison
- When to use which
- Conclusion with soft CTA
Tone: neutral, slightly favoring [senin site]
```

### Reddit yorumu

```
KULLANMA. Reddit yorumları %100 manuel ol.
Reddit kullanıcıları AI içeriği anında fark eder.
```

### TikTok script

```
Write a 30-second TikTok script:
Topic: "[konu]"  
Hook (first 2 seconds): Something surprising or controversial
Body: 3 quick points
CTA: Subtle, not pushy
Style: Gen-Z casual, fast-paced
```

## İçerik üretim batch rutini (Pazar günü)

```
10:00 - 10:15  ChatGPT ile 7 tweet üret → düzenle → Buffer'a yükle
10:15 - 10:30  ChatGPT ile 3 Telegram mesajı üret → düzenle → Notion'a kaydet
10:30 - 11:00  ChatGPT ile 1 blog taslağı → düzenle → yayınla veya planla
11:00 - 11:15  TikTok script yaz (AI taslak + kendi düzenleme)
11:15 - 11:30  Reddit post taslakları (tamamen manuel)
```

---

# Platform Spesifik Dikkat Listesi

> Her platformun kendi kuralları, algoritması ve tuzakları var.

---

## Reddit

| Konu | Detay |
|------|-------|
| **Karma gereksinimi** | Çoğu subreddit min. 50–100 karma ister |
| **Hesap yaşı** | Bazı sub'lar 30 gün ister |
| **Self-promotion kuralı** | Max %10 kendi linkin olsun |
| **En iyi saatler** | 08:00–10:00 EST (Amerikan kitle) |
| **En iyi gün** | Salı, Çarşamba |
| **Post formatı** | Uzun, detaylı, değer veren postlar iyi performans gösterir |
| **Tehlike** | Mod'lar agresif; kurallara uy |

## TikTok

| Konu | Detay |
|------|-------|
| **İlk 3 saniye** | Hook olmazsa kaydırılırsın |
| **Video uzunluğu** | 15–45 sn en iyi performans |
| **Hashtag** | 3–5 tane, 1 niche + 1 genel + 1 trending |
| **Yükleme sıklığı** | Günde 1–3 video ideal |
| **Ses** | Trending ses kullan → algoritma sever |
| **En iyi saatler** | 19:00–22:00 yerel saat |
| **İlk 1 saat** | Video yüklendikten sonra 1 saat kritik; engagement gelirse push edilir |

## X / Twitter

| Konu | Detay |
|------|-------|
| **Thread performansı** | Thread'ler tek tweet'ten 3–5x daha iyi |
| **Görsel** | Görselli tweet'ler 2x daha fazla engagement |
| **En iyi saatler** | 09:00–11:00, 20:00–22:00 |
| **Hashtag** | Max 2 hashtag, fazlası spam görünür |
| **Reply strategy** | Büyük hesaplara erken reply → keşif |
| **Pinned tweet** | En iyi içeriğini pinle |

## Telegram

| Konu | Detay |
|------|-------|
| **Grup vs kanal** | Kanal = duyuru (tek yön); grup = sohbet |
| **Mesaj sıklığı** | Kanalda günde 1–3, grupta daha az |
| **Bot kullanımı** | Welcome bot, auto-post bot faydalı |
| **Cross-promotion** | Benzer kanallarla karşılıklı tanıtım |
| **Dosya/görsel** | Telegram görselleri iyi gösterir, kullan |

---

# Her Şeye Hazırlıklı Olma Checklist

> Murphy yasası: Ters gidebilecek her şey ters gidecektir. Hazırlıklı ol.

---

## Hesap/platform riskleri

| Risk | Hazırlık |
|------|----------|
| Ana hesap ban | Her platform için 1 yedek hesap (olgunlaşmış) |
| Shadow ban | Test yöntemi bil, 2–3 gün bekle + strateji değiştir |
| Subreddit ban | 2–3 farklı subreddit'te aktif ol |
| Domain ban (Reddit) | Kısa link servisi (bit.ly) KULLANMA → daha çok ban; bunun yerine self-post yaz, link yorumda |
| Telegram'dan atılma | Grup kurallarını oku, admin'le iletişimde ol |
| TikTok hesap kaybı | İçerikleri lokalde yedekle, yeni hesapla devam |

## Teknik riskler

| Risk | Hazırlık |
|------|----------|
| Site down | Uptime monitoring (UptimeRobot — ücretsiz) |
| DB dolu | Haftalık storage kontrolü |
| Ödeme sistemi bozuk | Stripe test modu ile haftalık kontrol |
| SEO penaltı | Google Search Console izle |
| DDoS | Cloudflare ücretsiz plan (zaten aktif) |

## İş riskleri

| Risk | Hazırlık |
|------|----------|
| Rakip aynı şeyi yapıyor | Farklılaştırıcı özellik belirle (hız, fiyat, UX) |
| Yasal sorun | ToS hazırla, yasal uyarı koy |
| Kullanıcı şikayeti | Hızlı cevap ver, çöz, herkese açık göster |
| Gelir yok | 2. ayda gelir yoksa pivot/strateji değiştir |

---

# Son Kontrol: Eksik Kalan Var mı?

| Konu | Durumu |
|------|--------|
| Hafta hafta içerik planı (3 ürün) | Eklendi |
| Shadow ban korunma (4 platform) | Eklendi |
| Kesin çalışan yöntemi bulma sistemi | Eklendi |
| A/B test planı | Eklendi |
| İçerik üretimi: AI vs manuel | Eklendi |
| ChatGPT prompt şablonları | Eklendi |
| Platform spesifik kurallar | Eklendi |
| Sahte hesap stratejisi | Önceki bölümde var |
| Görsel kaynakları | Önceki bölümde var |
| Template mesajlar | Önceki bölümde var |
| Otomasyon araçları | Önceki bölümde var |
| 30 günlük yol haritası | Önceki bölümde var |
| Metrik takip | Önceki bölümde var |
| Risk/hazırlık checklist | Eklendi |
| Gelişmiş stratejiler | Önceki bölümde var |
| Batch üretim rutini | Eklendi |

---

# Fiyatlandırma Stratejisi (3 Ürün)

> Fiyat = en güçlü büyüme aracı. Yanlış fiyat = kullanıcı gelmez. Doğru fiyat = viral olur.

---

## ÜRÜN 1: SMS Sitesi

### Fiyatlandırma modeli

| Plan | Fiyat | Ne dahil | Amaç |
|------|-------|----------|------|
| **Free** | $0 | 5 numara / gün | Kullanıcı çek, denesin |
| **Starter** | $3–5 / ay | 50 numara / ay | Bireysel kullanıcı |
| **Pro** | $15–20 / ay | 500 numara / ay + API | Geliştirici |
| **Pay-as-you-go** | $0.05–0.15 / numara | Limitsiz | Büyük hacimler |

### Fiyatlandırma kuralları

| Kural | Neden |
|-------|-------|
| Free tier ŞART | Kullanıcı denemeden para vermez |
| Rakipten %10–20 ucuz başla | Fiyat avantajı = ilk kullanıcılar |
| İlk 100 kullanıcıya lifetime indirim | Early adopter ödüllendir |
| Kripto ödeme kabul et | Hedef kitle kripto kullanıyor |

### Rakip fiyatları (referans)

| Rakip | Fiyat aralığı |
|-------|---------------|
| SMSPool | $0.10–0.50 / numara |
| GrizzlySMS | $0.05–0.30 / numara |
| 5sim | $0.05–0.20 / numara |

**Strateji:** Rakiplerin alt bandında başla, kullanıcı gelince yavaş artır.

---

## ÜRÜN 2: Film Sitesi

### Gelir modeli

| Gelir kaynağı | Tahmini gelir | Nasıl |
|---------------|---------------|-------|
| **Reklam (pop-up, banner)** | $1–5 / 1000 görüntüleme | Reklam ağı (PopAds, Adsterra, PropellerAds) |
| **Premium (reklamsız)** | $2–5 / ay | Opsiyonel üyelik |
| **Donation** | Değişken | "Buy me a coffee" tarzı |

### Reklam ağları

| Ağ | Kabul şartı | CPM (tahmini) |
|----|-------------|---------------|
| **Adsterra** | Düşük trafik kabul eder | $0.50–3.00 |
| **PropellerAds** | Düşük trafik kabul eder | $0.50–2.00 |
| **PopAds** | Pop-up odaklı | $1.00–5.00 |
| **Google AdSense** | İçerik politikası sıkı, kabul etmeyebilir | $1.00–4.00 |

**Not:** Film sitelerini çoğu büyük reklam ağı kabul etmez. Adsterra ve PropellerAds daha esnek.

### Fiyatlandırma kuralları

| Kural | Neden |
|-------|-------|
| Site ücretsiz olmalı | Film sitelerinde ödeme bariyeri = kullanıcı kaybı |
| Reklam sayısı max 2–3 / sayfa | Çok reklam = kullanıcı kaçar |
| Premium opsiyonel | "Reklamsız izle" seçeneği |

---

## ÜRÜN 3: No KYC Kart

### Fiyatlandırma modeli

| Gelir kaynağı | Miktar | Açıklama |
|---------------|--------|----------|
| **Kart ücreti** | $5–15 / kart | Tek seferlik |
| **Yükleme komisyonu** | %1–3 | Her yüklemede |
| **Aylık bakım ücreti** | $1–2 / ay | Opsiyonel |
| **Döviz çevirme** | %1–2 | USD dışı harcamalarda |

### Rakip fiyatları (referans)

| Rakip | Kart ücreti | Yükleme komisyonu |
|-------|-------------|-------------------|
| nokyc.cards | ~$10–15 | %2–3 |
| Ezzocard | ~$5–10 | %3–5 |

### Fiyatlandırma kuralları

| Kural | Neden |
|-------|-------|
| İlk kart ücretsiz veya indirimli | Deneme bariyerini kaldır |
| Yükleme komisyonunu düşük tut | Tekrar kullanım artır |
| Referral komisyonunu yüksek tut | Viral büyüme |
| Kripto ödeme zorunlu | Hedef kitle profili |

---

# Rakip Analiz Çerçevesi

> Rakipleri tanımadan savaşamazsın. Her ürün için sistematik rakip analizi.

---

## Rakip analiz şablonu

Her ürün için bu tabloyu doldur:

```
| Kriter          | Rakip 1      | Rakip 2      | Rakip 3      | BİZİM SİTE   |
|-----------------|--------------|--------------|--------------|---------------|
| Site adı        |              |              |              |               |
| URL             |              |              |              |               |
| Aylık trafik    |              |              |              |               |
| Fiyat           |              |              |              |               |
| Güçlü yanlar    |              |              |              |               |
| Zayıf yanlar    |              |              |              |               |
| UX/Tasarım      | /10          | /10          | /10          | /10           |
| Hız             | /10          | /10          | /10          | /10           |
| Özellikler      |              |              |              |               |
| Ödeme yöntemleri|              |              |              |               |
| Müşteri desteği |              |              |              |               |
| SEO durumu      |              |              |              |               |
| Sosyal medya    |              |              |              |               |
| Ne eksik?       |              |              |              |               |
```

## Trafik nasıl öğrenilir?

| Araç | Ne gösterir | Maliyet |
|------|-------------|---------|
| **SimilarWeb** | Tahmini trafik, kaynak, ülke | Ücretsiz (sınırlı) |
| **SEMrush** | SEO, anahtar kelime, trafik | Ücretli ($100+/ay) |
| **Ahrefs** | Backlink, SEO, trafik | Ücretli ($99+/ay) |
| **Google** | "[rakip] traffic" ara | Ücretsiz |
| **Reddit/forum** | Kullanıcı şikayetleri = zayıf nokta | Ücretsiz |

## Rakip izleme rutini (ayda 1 kez)

| Görev | Süre |
|-------|------|
| SimilarWeb ile trafik kontrol | 10 dk |
| Rakip sitede yeni özellik var mı? | 15 dk |
| Reddit/X'te rakip hakkında şikayet ara | 10 dk |
| Fiyat değişikliği var mı? | 5 dk |
| Kendi konumunu güncelle | 5 dk |

---

# Para Gelince: Bütçe Dağılımı

> İlk gelir geldiğinde nereye harcayacağını bilmek kritik.

---

## Gelir aşamaları ve bütçe

### Aşama 1: $0–100 / ay

| Harcama | Miktar | Neden |
|---------|--------|-------|
| Hosting / infra | $0–10 | Ücretsiz tier yeterli |
| Reklam | $0 | Henüz erken |
| Araçlar | $0 | Ücretsiz tier'lar |
| **Toplam** | **$0–10** | |

**Strateji:** Her şeyi ücretsiz araçlarla yap. Geliri biriktir.

### Aşama 2: $100–500 / ay

| Harcama | Miktar | Neden |
|---------|--------|-------|
| Hosting | $5–20 | Workers Paid veya küçük VPS |
| Reklam testi | $50–100 | Reddit Ads veya Google Ads denemesi |
| Araçlar | $0–20 | SEO aracı veya e-posta servisi |
| **Toplam** | **$55–140** | |

**Strateji:** Gelirin %30'unu reklama, %20'sini altyapıya, %50'sini biriktir.

### Aşama 3: $500–2000 / ay

| Harcama | Miktar | Neden |
|---------|--------|-------|
| Hosting | $20–50 | Güçlü VPS veya managed hosting |
| Reklam | $100–500 | Kanıtlanmış kanala yatırım |
| SEO araçları | $30–50 | Ahrefs Lite veya SEMrush |
| İçerik üretimi | $50–100 | Freelancer (opsiyonel) |
| **Toplam** | **$200–700** | |

**Strateji:** En iyi kanalı bulduysan → reklam bütçesini oraya yığ.

### Aşama 4: $2000+ / ay

| Harcama | Miktar | Neden |
|---------|--------|-------|
| Tam zamanlı odaklan | - | Bu artık asıl işin olabilir |
| Reklam | $500+ | Ölçeklendir |
| Yardımcı / freelancer | $200–500 | İçerik, destek, operasyon |
| Altyapı | $50–100 | Güçlü sunucu, CDN |

---

## Bütçe dağılım kuralı

```
Gelirin %30 → Büyüme (reklam, içerik)
Gelirin %20 → Altyapı (hosting, araçlar)
Gelirin %10 → Yedek (acil durum)
Gelirin %40 → Biriktir veya yeni ürün
```

---

# İlk Gelir Sonrası Ölçeklendirme

> İlk $100 geldi. Şimdi ne yapılır?

---

## Ölçeklendirme adımları

### Adım 1: Neyin çalıştığını doğrula

| Soru | Cevap |
|------|-------|
| Gelir hangi üründen? | |
| Hangi kanaldan geldi? | |
| Tekrarlanabilir mi? | |
| Büyütülebilir mi? | |

### Adım 2: Kazanan ürüne odaklan

| Durum | Aksiyon |
|-------|---------|
| 1 ürün gelir getiriyor, 2'si getirmiyor | Gelir getirene %60 zaman, diğerlerine %20 |
| 2 ürün gelir getiriyor | İkisine %40, 3.'ye %20 |
| 3'ü de gelir getiriyor | Her birine %33 (nadir senaryo) |
| Hiçbiri gelir getirmiyor (1 ay sonra) | Pivot: ürünü değiştir veya hedef kitleyi değiştir |

### Adım 3: Büyüme kaldıracı bul

| Kaldıraç | Açıklama |
|----------|----------|
| **Daha fazla aynı** | İşe yarayan kanalda 2x içerik |
| **Reklam** | İşe yarayan kanala para koy (Reddit Ads, Google Ads) |
| **Referral boost** | Komisyonu artır, "davet et" kampanyası |
| **Yeni pazar** | Farklı dil / ülke / niş |
| **Fiyat optimizasyonu** | A/B test: farklı fiyat → daha fazla gelir mi? |

### Adım 4: Otomasyon artır

| Gelir düzeyi | Otomasyona ekle |
|-------------|-----------------|
| $100+ | E-posta otomasyonu (hoş geldin, bülten) |
| $300+ | Telegram bot (otomatik duyuru) |
| $500+ | Freelancer: haftada 2–3 blog yazısı |
| $1000+ | Sosyal medya yöneticisi (part-time) |

---

# Yasal Uyarılar ve Dikkat Edilmesi Gerekenler

> Bu 3 ürünün hepsi yasal gri alanlarda. Bilmek ve hazırlıklı olmak şart.

---

## ÜRÜN 1: SMS Sitesi

| Risk | Detay | Korunma |
|------|-------|---------|
| Dolandırıcılık aracı olarak kullanım | Kimlik hırsızlığı, sahte hesap | ToS'ta "yasadışı kullanım yasaktır" yaz |
| Telekomünikasyon yasaları | Bazı ülkelerde sanal numara düzenlemesi | Yasal olan ülkelerde faaliyet göster |
| Platform ihlali | WhatsApp/Telegram vb. sanal numara engelleyebilir | "Test amaçlı" olarak pazarla |

### Minimum yasal koruma

- [ ] Terms of Service sayfası (site üzerinde)
- [ ] "Bu hizmet test ve doğrulama amaçlıdır" uyarısı
- [ ] Kötüye kullanım raporlama mekanizması
- [ ] Şirket bilgisi (gerçek veya offshore)

## ÜRÜN 2: Film Sitesi

| Risk | Detay | Korunma |
|------|-------|---------|
| Telif hakkı (DMCA) | İçerik sahipleri DMCA notice gönderebilir | DMCA takedown sayfası koy, hızla kaldır |
| Domain seized | ABD/AB mahkemesi domain'i kapatabilir | .to, .cc gibi offshore domain kullan |
| Hosting kapatma | Hosting sağlayıcısı hesabı kapatabilir | Offshore hosting (AlexHost, FlokiNET) |
| Reklam ağı reddi | Yasal içerik politikası | Adsterra, PropellerAds gibi esnek ağlar |

### Minimum yasal koruma

- [ ] DMCA sayfası: "Telif hakkı ihlali bildirimi için [e-posta]"
- [ ] "Bu site içerik barındırmaz, sadece 3. parti kaynaklara yönlendirir" uyarısı
- [ ] Cloudflare arkasında ol (gerçek IP gizle)
- [ ] WHOIS privacy aktif
- [ ] Offshore domain (.to, .cc, .st)
- [ ] Offshore hosting

## ÜRÜN 3: No KYC Kart

| Risk | Detay | Korunma |
|------|-------|---------|
| Kara para aklama (AML) | Düzenleyiciler soruşturma açabilir | İşlem limitleri koy (ör. max $500/ay) |
| Finans düzenlemeleri | Ülkeye göre lisans gerekebilir | Düzenlenmemiş jurisdiksiyonda faaliyet |
| Kart sağlayıcı riski | BIN sağlayıcısı hizmeti kesebilir | Birden fazla sağlayıcı ile çalış |
| Kullanıcı dolandırıcılığı | Çalıntı kripto ile yükleme | İşlem izleme, şüpheli aktivite raporlama |

### Minimum yasal koruma

- [ ] Terms of Service: "Yasadışı kullanım yasaktır"
- [ ] AML politikası (basit de olsa)
- [ ] İşlem limitleri
- [ ] Şirket: offshore (BVI, Seychelles, Panama)
- [ ] Kullanıcı sözleşmesi

---

## Genel yasal önlemler (3 ürün)

| Önlem | Neden |
|-------|-------|
| **Offshore şirket** | Kişisel sorumluluktan korunma |
| **WHOIS privacy** | Domain'den kimlik tespiti engelle |
| **Cloudflare** | Gerçek sunucu IP'sini gizle |
| **ProtonMail** | İletişim için anonim e-posta |
| **Kripto ödeme** | Gelir takibini zorlaştır |
| **Farklı ülke hostingi** | Mahkeme kararlarından korunma |

---

# Analytics Kurulumu (Spesifik)

> Neyi ölçmezsen yönetemezsin. Her ürün için hangi araç nereye kurulacak.

---

## Temel araçlar

| Araç | Ne ölçer | Maliyet | Kurulum |
|------|----------|---------|---------|
| **Google Analytics 4** | Trafik, sayfa görüntüleme, kaynak | Ücretsiz | `<head>`'e script ekle |
| **Google Search Console** | SEO performansı, arama sorguları | Ücretsiz | DNS doğrulama |
| **PostHog** | Kullanıcı davranışı, funnel | Ücretsiz (1M event/ay) | Script ekle |
| **UptimeRobot** | Site çalışıyor mu? | Ücretsiz (50 monitör) | URL ekle |
| **Plausible** | Hafif, gizlilik odaklı analytics | $9/ay veya self-host | Script ekle |

## Her ürün için analytics

### SMS Sitesi

| Ölçülecek | Araç | Neden |
|-----------|------|-------|
| Toplam ziyaretçi | GA4 | Genel büyüme |
| Kayıt sayısı | Supabase dashboard | Kullanıcı büyümesi |
| API çağrı sayısı | Kendi dashboard | Kullanım |
| Ödeme / gelir | Stripe dashboard | Gelir |
| SEO sıralaması | Search Console | Organik trafik |
| Uptime | UptimeRobot | Güvenilirlik |

### Film Sitesi

| Ölçülecek | Araç | Neden |
|-----------|------|-------|
| Toplam ziyaretçi | GA4 | Genel büyüme |
| Sayfa / oturum | GA4 | Engagement |
| En çok izlenen film | GA4 event tracking | İçerik stratejisi |
| Reklam geliri | Reklam ağı dashboard | Gelir |
| SEO sıralaması | Search Console | Organik trafik |
| Bounce rate | GA4 | UX kalitesi |

### No KYC Kart

| Ölçülecek | Araç | Neden |
|-----------|------|-------|
| Toplam ziyaretçi | GA4 | Genel büyüme |
| Kart satış sayısı | Kendi dashboard | Gelir |
| Yükleme hacmi | Kendi dashboard | Kullanım |
| Referral kayıtları | Supabase | Viral büyüme |
| Conversion rate | GA4 funnel | Optimizasyon |

## Analytics kurulum checklist

- [ ] Google Analytics 4 → 3 site
- [ ] Google Search Console → 3 site
- [ ] UptimeRobot → 3 site
- [ ] Stripe / ödeme dashboard → ilgili siteler
- [ ] Haftalık metrik Google Sheets'e giriş rutini

---

# Pivot Kararı: Ne Zaman Vazgeçilir?

> Her ürün tutmayabilir. Ne zaman devam, ne zaman bırak?

---

## Karar kriterleri

| Süre | Durum | Karar |
|------|-------|-------|
| 2 hafta | Hiç trafik yok | Tanıtım stratejisini değiştir (ürünü değil) |
| 1 ay | Trafik var ama kayıt/gelir yok | Ürün veya fiyat problemi; UX/fiyat değiştir |
| 2 ay | Kayıt var ama gelir yok | Monetizasyon modelini değiştir |
| 3 ay | Hiçbir ilerleme yok | Ürünü bırak veya tamamen pivot et |

## Pivot seçenekleri

| Pivot türü | Açıklama |
|------------|----------|
| **Hedef kitle değiştir** | Aynı ürün, farklı kitleye sat |
| **Özellik pivot** | Yan özellik ana ürün olsun |
| **Kanal pivot** | Farklı platformda dene |
| **Fiyat pivot** | Ücretsiz → ücretli veya tam tersi |
| **Tamamen bırak** | Bu ürün çalışmıyor → yeni ürüne geç |

## Bırakma kararı öncesi kontrol

| Soru | Evet ise |
|------|----------|
| En az 3 farklı kanal denedim mi? | Hayır → daha dene |
| En az 2 farklı fiyat denedim mi? | Hayır → daha dene |
| Kullanıcı geri bildirimi aldım mı? | Hayır → al, sonra karar ver |
| Rakipler büyüyor mu? | Evet → pazar var, senin stratejin yanlış |
| Rakipler de küçülüyor mu? | Evet → pazar ölüyor, bırak |

---

# Ölçeklendirme: 1 Kişiden Takıma

> Tek kişi olarak başlarsın. Büyüyünce yardım gerekir.

---

## Ne zaman yardım al?

| Gelir | Ne yapılır |
|-------|------------|
| $0–500 / ay | Tek kişi, her şeyi sen yap |
| $500–1000 / ay | Freelancer: haftada 2–3 blog yazısı veya video |
| $1000–3000 / ay | Part-time yardımcı: sosyal medya + destek |
| $3000+ / ay | Full-time düşün veya co-founder ara |

## Nerede yardım bulunur?

| Platform | Ne için | Maliyet |
|----------|---------|---------|
| **Fiverr** | Blog yazısı, logo, görsel | $5–50 / iş |
| **Upwork** | Geliştirici, içerik yazarı | $10–50 / saat |
| **Reddit (r/forhire)** | Her türlü freelancer | Değişken |
| **Twitter/X** | Co-founder, partner | Ücretsiz |
| **Arkadaş çevresi** | İlk yardımcı | Revenue share |

## Delege etme önceliği

| Önce delege et (kolay, tekrarlayan) | Son delege et (kritik, stratejik) |
|--------------------------------------|-----------------------------------|
| Blog yazısı | Fiyatlandırma kararları |
| Sosyal medya postları | Ürün yönü |
| Müşteri desteği | Partnership görüşmeleri |
| Görsel tasarım | Strateji ve planlama |
| SEO optimizasyonu | Finansal kararlar |

---

# Final Kontrol: Tam Liste

| Konu | Durumu |
|------|--------|
| Genel yaklaşım | Var |
| Otomasyon stratejisi + araçlar | Var |
| 3 ürün launch checklist | Var |
| 3 ürün haftalık rutin | Var |
| Template mesajlar | Var |
| Ortak otomasyon akışı | Var |
| Metrik takip şablonu | Var |
| Kusursuz planlama sistemi (7 adım) | Var |
| Altın kurallar | Var |
| İçerik kaynakları + görsel araçları | Var |
| Sahte hesap stratejisi | Var |
| Gelişmiş stratejiler (7 tane) | Var |
| Hafta hafta içerik planı (3 ürün x 4 hafta) | Var |
| Shadow ban korunma (4 platform) | Var |
| Kesin çalışan yöntemi bulma (A/B test) | Var |
| İçerik üretimi: AI vs manuel | Var |
| ChatGPT prompt şablonları | Var |
| Platform spesifik kurallar | Var |
| Risk/hazırlık checklist | Var |
| Batch üretim rutini | Var |
| **Fiyatlandırma stratejisi (3 ürün)** | Eklendi |
| **Rakip analiz çerçevesi** | Eklendi |
| **Para gelince bütçe dağılımı** | Eklendi |
| **İlk gelir sonrası ölçeklendirme** | Eklendi |
| **Yasal uyarılar (3 ürün)** | Eklendi |
| **Analytics kurulumu (spesifik)** | Eklendi |
| **Pivot kararı: ne zaman vazgeçilir** | Eklendi |
| **Ölçeklendirme: takıma geçiş** | Eklendi |

---

*Son güncelleme: 2026-03*
