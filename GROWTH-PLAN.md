# Büyüme Planı — 4 İş Birimi

Bu plan **doğrudan lansman** (waitlist yok) varsayar: trafik ve dönüşüm kanallarını erken açar, otomasyon + freelancer rutinine uyumludur.

---

## 1. Genel yaklaşım: Direct launch

- **Waitlist yok:** Ürün veya içerik yüzeyi canlı; ölçüm (analytics, conversion events) ilk günden açık.
- **Neden:** Erken gerçek trafik sinyali; A/B ve içerik-ürün uyumu hızlı öğrenilir; pazarlama otomasyonuna gerçek kuyruk beslenir.
- **Risk kontrolü:** Yumuşak lansman (organik + düşük bütçeli test) ile başla; ölçekleme **GROWTH-PLAN** içindeki tetiklere bağlı.

---

## 2. Lansman günü kontrol listesi (iş birimi başına)

### 2.1 Film / Embed site

- [ ] Production URL, SSL, temel SEO (title, meta, OG image).
- [ ] Analytics + search console (veya eşdeğeri) doğrulandı.
- [ ] TMDB (veya kullandığın kaynak) attribution / API kullanımı uyumlu.
- [ ] İlk 5–10 yayın: trend + evergreen karışık; internal link yapısı net.
- [ ] SocialTargeter: en az 1 haftalık zamanlanmış gönderi.
- [ ] Telegram (varsa): hoş geldin mesajı + yayın akışı.

### 2.2 No-KYC Card site

- [ ] Kayıt / KYC akışı (veya bilinçli no-KYC politikası) dokümante; yasal uyarılar yerinde.
- [ ] Ödeme ve kart teslimatı için destek kanalı (e-posta / ticket) canlı.
- [ ] Conversion events: `signup_started`, `signup_completed`, `card_ordered` (veya senin funnel’ın).
- [ ] İlk içerik: 3 “privacy hook” + 1 ürün özeti sayfası.
- [ ] Sosyal: sakin ton; hype veya “guaranteed” iddialarından kaçın.

### 2.3 SMS verification site

- [ ] Fiyatlandırma ve stok/ülke kapsamı sayfada net.
- [ ] Sipariş akışı uçtan uca test (sandbox veya düşük maliyetli gerçek sipariş).
- [ ] İlk karşılaştırma veya “use case” içeriği yayında.
- [ ] Destek SLA notu (ör. “yanıt süresi”) — güven için kısa tut.

### 2.4 Browser games

- [ ] Oyun URL’leri, yükleme süresi, mobil/desktop smoke test.
- [ ] DAP ölçümü: günlük unique veya oyun içi event (basit bile olsa).
- [ ] İlk etkinlik/takvim gönderisi + Discord/Telegram duyurusu.
- [ ] İlk hafta için 1 küçük turnuva veya “challenge” (isteğe bağlı ama ölçülebilir).

---

## 3. Haftalık rutin (otomasyon uyumlu)

| Rol | Görev |
|-----|--------|
| **Sen (~45 dk)** | Pazartesi: metrik + onay. Çarşamba: VA çıktısı. Cuma: öncelik notu. (Detay: `AUTO-MARKETING.md`) |
| **Freelancer** | Günlük taslaklar + takvim doldurma + haftalık özet. |
| **Otomasyon** | SocialTargeter + Telegram; ExifTool pipeline yayın öncesi. |

**Her iş birimi için sabit çıktı:** haftada minimum X gönderi + 1 “anchor” içerik (blog, karşılaştırma tablosu, etkinlik duyurusu) — X değerini aşağıdaki 30/60/90 hedeflerine göre ayarla.

---

## 4. 30 / 60 / 90 gün hedefleri

Rakamlar **başlangıç baseline’ına göre ayarlanmalı**; aşağıdakiler yeni veya küçük ölçek için makul varsayımlar.

### 4.1 Film / Embed

| Dönem | Ziyaretçi (ör. unique / ay) | Reklam geliri (ör.) |
|--------|-----------------------------|----------------------|
| **30 gün** | 3k–15k (organik + sosyal) | $50–300 (reklam yoğunluğuna bağlı) |
| **60 gün** | 10k–40k | $200–1k |
| **90 gün** | 25k–80k | $500–3k |

*Not:* Film nişinde içerik hacmi ve trend yakalama, ziyaretçi ile doğrusal değil; TMDB-trend + düzenli yayın ile üst banda yaklaşılır.

### 4.2 No-KYC Card

| Dönem | Kullanıcı (kayıtlı) | Verilen kart (veya aktif kart) |
|--------|---------------------|--------------------------------|
| **30 gün** | 100–500 | 20–100 |
| **60 gün** | 400–2k | 100–500 |
| **90 gün** | 1k–5k | 300–1.5k |

*Not:* Regülasyon ve ödeme ortağı limitleri üst sınırı kesebilir; hedefleri funnel gerçeklerine göre revize et.

### 4.3 SMS verification

| Dönem | Sipariş / gün (ortalama) |
|--------|---------------------------|
| **30 gün** | 5–30 |
| **60 gün** | 20–80 |
| **90 gün** | 50–200 |

*Not:* Arbitraj ve kanal kalitesi günlük oynaklığı yüksek; 7 günlük hareketli ortalamayı KPI yap.

### 4.4 Browser games

| Dönem | Günlük aktif oyuncu (DAP) |
|--------|---------------------------|
| **30 gün** | 50–500 |
| **60 gün** | 200–2k |
| **90 gün** | 500–5k |

*Not:* Tek oyun mu portföy mü; DAP tanımını (unique/session) dokümante et.

---

## 5. Ölçek tetikleri (ne zaman daha fazla yatırım)

Aşağıdakilerden **biri** sürekli 2–4 hafta doğrulanırsa bütçe / zaman artır:

| Tetik | Aksiyon |
|--------|---------|
| Film: organik trafik haftalık **>%15** büyüme, RPM stabil | İçerik frekansı + VA saatleri artır; hedefli ücretli test (küçük bütçe). |
| Card: kayıt → kart **dönüşümü** iyileşiyor, chargeback düşük | Destek + onboarding iyileştirmesi; sınırlı ücretli acquisition. |
| SMS: sipariş başına **marj** ve yenileme sağlıklı | Stok/ülke genişletme; karşılaştırma içeriğine SEO bütçesi. |
| Games: DAP + session length birlikte artıyor | Etkinlik takvimi, küçük ödüllü turnuva, topluluk moderatörü. |

**Tetik yoksa:** maliyeti düşür; SOP ve dönüşüm ölçümünü sıkılaştır; yeni kanal açma.

---

## 6. Gelir kilometre taşları (özet)

| Aşama | Anlam |
|--------|--------|
| **M1 — “Ramen positive”** | Hosting + VA + araçlar çıktıktan sonra her iş birimi pozitif katkı veya net burn < kabul eşiği. |
| **M2 — “Tek iş birimi taşır”** | En güçlü iş birimi aylık sabit giderleri tek başına karşılar. |
| **M3 — “Portföy”** | En az 2 iş birimi aynı çeyrekte anlamlı nakit katkı; biri deney/büyüme için yeniden yatırım havuzu oluşturur. |

Spesifik tutarlar şirket içi burn’a bağlı; çeyrek sonlarında **brüt marj** ve **birim ekonomisi** (sipariş başı, kullanıcı başı) ile netleştir.

---

## 7. Maliyet optimizasyonu notları

- **VA:** OnlineJobs.ph ile tek kişi 4 marka; deneme süresi olmadan uzun sözleşme yapma.  
- **Araçlar:** SocialTargeter ücretsiz katman; ücretli yükseltme ancak yayın hacmi dolduğunda.  
- **Creative:** Canva takım lisansı vs. tek hesap — marka ihtiyacına göre.  
- **Ödeme:** Wise ile toplu ödeme günü; kripto sadece anlaşılmış ve düşük riskli.  
- **Reklam:** Organik + freelancer tabanı oturmadan yüksek harcama yapma; küçük test, ölç, ölçekle.  
- **Infra:** Statik / edge önbellek; görsel CDN; gereksiz API çağrılarını TMDB vb. için cache’le.  
- **Yasal / uyum:** Card ve SMS’te iade/chargeback maliyeti erken modellenmeli; “ucuz trafik” kaynaklarından kaçın.

---

## 8. Dosyalar arası bağlantı

- Operasyonel pazarlama detayı: **`AUTO-MARKETING.md`**
- Bu dosyayı her 30 günde bir hedeflere göre güncelle; metrikleri tek bir dashboard veya sheet’te topla.
