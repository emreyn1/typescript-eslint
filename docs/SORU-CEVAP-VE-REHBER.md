# Sık Sorulan Sorular & Tek Kişi Rehberi

> Bu belge ilk kez production'a çıkan bir kişi için hazırlandı.
> Real-life deneyim yok varsayımıyla yazıldı.

---

## 1. API DOKÜMANI

### Nerede?

`embed.movieon.to` açıldığında API dokümantasyonu otomatik gösterilir.
Bu sayfa `embed-api/src/routes/site.ts` dosyasında tanımlı.

### Film sitesine de koymalı mıyım?

**EVET, koymalısın.** Neden:

1. **Trafik çeker** — geliştiriciler API arıyor, "free movie API" diye Google'layan insanlar senin siteye gelir
2. **Backlink sağlar** — geliştiriciler bloklarında/projelerinde API linki paylaşır
3. **Güven verir** — "bu site ciddi, API'si bile var" algısı

Film sitesinde (movieon.to) nasıl koyarsın:
- Navbar'a "API" linki ekle → `https://embed.movieon.to` sayfasına yönlendir
- VEYA film sitesinde `/api-docs` sayfası oluştur, aynı içeriği göster
- En basiti: navbar'da "API" butonu → yeni sekmede `embed.movieon.to` açılır

---

## 2. SUNUCU YÜKÜ — ÇÖKECEK Mİ?

### Kısa cevap: HAYIR, çökmez (başlangıçta).

### Uzun cevap:

**Sen video host ETMİYORSUN.** Bu çok önemli. CinePro sadece proxy — video dosyaları StreamMafia, VidRock, Wasabi gibi **başkalarının sunucularında**. Senin VPS'in sadece:

1. Kullanıcıdan istek alır
2. CinePro'ya sorar "hangi kaynaklar var?"
3. Kaynak URL'lerini player'a verir
4. Player direkt kaynak sunucudan video çeker

```
Kullanıcı → senin VPS (hafif JSON işlemi) → CinePro (kaynak bul)
         ↓
Player → StreamMafia/VidRock/Wasabi CDN (ağır video trafik)
         ↑
         Bu trafik SENİN VPS'inden GEÇMİYOR
```

**İstisna:** HLS proxy URL'leri CinePro üzerinden geçiyor. Bu durumda video trafiği VPS'ten geçer. Ama bu sadece header ekleme — video dosyasını kendi diskinden serve etmiyor.

### Kaç kullanıcı kaldırır?

```
Hetzner CX22 (2 vCPU, 4GB RAM):

  JSON API isteği:         ~500 req/sn (sadece kaynak listesi)
  HLS proxy (video akışı): ~50-100 eşzamanlı izleyici
  Toplam günlük:           ~50K-100K ziyaret rahat

  KARŞILAŞTIRMA:
  100 eşzamanlı izleyici = günde ~5000-10000 benzersiz ziyaretçi
  Bu seviye ay 6-8'e kadar gelmez.
```

### Peki ya bir anda çok kullanıcı gelirse?

Gerçekçi senaryolar ve çözümleri:

```
SENARYO 1: Reddit'te viral post (5K ziyaret/saat)
  → VPS yükü: %30-50 CPU
  → Sonuç: Site ÇÖKMEZ, biraz yavaşlar
  → Çözüm: Zaten Cloudflare önde — statik içerik cache'lenir

SENARYO 2: Büyük bir influencer paylaştı (20K ziyaret/saat)
  → VPS yükü: %80-100 CPU
  → Sonuç: Bazı istekler timeout olabilir, site YAVAŞLAR ama ÇÖKMEZ
  → Acil çözüm: Hetzner panelinden VPS'i CX32'ye yükselt (5 dk)

SENARYO 3: DDoS saldırısı
  → Cloudflare bunu otomatik engeller (ücretsiz planda bile)
  → "Under Attack Mode" aç → captcha gösterir
  → Sonuç: Site KORUNUR
```

### Ölçekleme planı (büyüdükçe):

```
Ay 1-6:   CX22 ($5/ay)  → 50K/gün rahat
Ay 6-12:  CX32 ($15/ay) → 200K/gün rahat
Ay 12+:   2 VPS         → embed-api ayrı, film sitesi ayrı
          VEYA           → Cloudflare Workers'a taşı (serverless)
```

### Rate limiting zaten var:

embed-api'de `120 req/min/IP` limiti ayarlı. Tek kullanıcı sunucuyu ezemez.

---

## 3. REKLAMSIZ BAŞLANGICTA YÜK OLUR MU?

**HAYIR.** Reklam olmaması sunucu yükünü **azaltır**, artırmaz:

```
REKLAMLI:
  Sayfa yüklenir → Adsterra script yüklenir → 3. parti JS çalışır
  → ekstra HTTP istekleri → pop-under açılır → daha fazla bant genişliği

REKLAMSIZ:
  Sayfa yüklenir → player yüklenir → video oynar
  → daha az HTTP isteği → daha hızlı → daha iyi UX
```

Reklamsız başlangıç sunucu için en iyi senaryo.

---

## 4. .MD DOSYALARI — HANGİSİ GEREKLİ?

### Şu an ihtiyacın olan dosyalar (SADECE bunlara bak):

```
ZORUNLU (oku ve takip et):
  docs/MOVIEON-DEPLOY-VE-PARA.md     ← VPS deploy + para kazanma fazları
  docs/EMBED-3-PLAN.md               ← 3 plan karşılaştırması (Plan D seçildi)
  docs/EMBED-BILGI-BANKASI.md        ← Teknik referans (sorun olunca bak)

OPSIYONEL (lazım olunca bak):
  docs/OPSEC-VE-OPERASYON-REHBERI.md ← OPSEC detayları
  CONTENT-CALENDAR.md                ← Sosyal medya içerik takvimi
  GROWTH-PLAN.md                     ← Büyüme stratejisi
```

### Artık GEREKMİYOR (tarihsel, arşiv):

```
ARŞİV (silme ama açma):
  option1.md - option9.md     → Eski planlar, EMBED-3-PLAN.md bunların yerine geçti
  ANALYSIS.md                 → Rakip analizi, BILGI-BANKASI'na özetlendi
  reklam.md                   → MOVIEON-DEPLOY-VE-PARA.md'ye taşındı
  secenekler.md               → EMBED-3-PLAN.md'ye taşındı
  5-isanaliz.md               → Eski iş analizi
  DEPLOY-REHBERI.md           → Eski deploy rehberi, MOVIEON-DEPLOY yeni versiyonu
  deploy-rehber.md            → Duplikat
  SIMDI-NE-YAPACAKSIN.md      → Eski todo
  YAPILACAKLAR.md             → Eski todo
  ne-yapildi.md               → Tarihsel kayıt
  adim-adim.md, adim.md       → Eski adımlar
  anlatim.md, konusma.md      → Notlar
  spesifik.md                 → Eski teknik notlar
  UI.md                       → Eski UI planı
  ajans.md, company.md        → Eski araştırmalar
```

### Bir kişinin takip etmesi gereken sıra:

```
1. docs/MOVIEON-DEPLOY-VE-PARA.md  → "Ne yapacağım?" sorusunun cevabı
2. docs/EMBED-3-PLAN.md             → "Hangi mimariyi kullanıyorum?" 
3. CONTENT-CALENDAR.md              → "Sosyal medyada ne paylaşacağım?"
4. docs/EMBED-BILGI-BANKASI.md      → "Bir şey bozuldu, nasıl çözerim?"
```

**Geri kalan ~40 dosyayı AÇMA.** Zaman kaybı.

---

## 5. BİR KİŞİ BUNLARı YAPABİLİR Mİ?

### Kısa cevap: EVET, yapabilirsin.

### Gerçekçi zaman tablosu (tek kişi):

```
HAFTA 1: DEPLOY (en önemli)
  Pzt: VPS al + Docker kur (2 saat)
  Sal: Domain DNS + Cloudflare (1 saat)
  Çar: cinepro + embed-api deploy (3 saat)
  Per: Nginx + SSL + test (2 saat)
  Cum: Film sitesi (basit versiyon) (4 saat)
  ────────────────────────────────────
  Toplam: ~12 saat (2 saat/gün = 1 hafta)

HAFTA 2-8: PAZARLAMA (paralel)
  Günde 30-45 dk:
    - Reddit'te 2-3 yorum/post (15 dk)
    - Twitter'da 1 tweet (5 dk)
    - Telegram kanalına 3 film ekle (10 dk)
    - SEO iyileştirme (haftada 1 saat)

HAFTA 8+: REKLAM AÇMA
  Adsterra hesap aç (30 dk)
  Script ekle (15 dk)
  ────────────────────────────────────
  Toplam: 45 dk
```

### Günlük rutin (site canlıyken):

```
Sabah (15 dk):
  - UptimeRobot bildirimleri kontrol et
  - Cloudflare analytics'e bak (dünkü trafik)

Öğle (30 dk):
  - Reddit'te 2-3 yorum yaz
  - Twitter'da 1 film önerisi paylaş
  - Telegram'a 3 film ekle

Haftalık (1 saat):
  - CinePro kaynak kontrolü: curl embed.movieon.to/api/v1/cinepro/sources?tmdb=27205
    → 30+ kaynak geliyorsa OK, 15'e düştüyse provider kırılmış
  - VPS disk/RAM kontrol: htop, df -h
  - Reklam geliri kontrol (Faz 2'den sonra)

Aylık (2 saat):
  - VPS güncelleme: apt update && apt upgrade
  - Docker image güncelle: docker compose pull && docker compose up -d
  - İçerik takvimi bir sonraki ay planla
```

### Bir kişinin yapamayacağı şeyler (şimdilik gerekli DEĞİL):

```
✗ Kendi scraper yazmak (CinePro hallediyor)
✗ Video host etmek (CinePro proxy hallediyor)
✗ CDN yönetmek (Cloudflare hallediyor)
✗ DDoS koruması (Cloudflare hallediyor)
✗ Reklam optimizasyonu (SmartCPM hallediyor)
```

---

## 6. FİLM SİTESİNE "API" KATEGORİSİ KOYMALI MIYIM?

### EVET, kesinlikle koy. Neden:

1. **Geliştiriciler API arıyor** — "free movie API" Google'da aylık 10K+ arama
2. **Diğer embed siteleri bunu yapıyor** — vidsrc.to, 2embed, autoembed hepsi API sayfası gösteriyor
3. **Organik backlink** — geliştiriciler projelerinde API linkini paylaşır
4. **Trafik diversifikasyonu** — sadece film izleyici değil, geliştirici de çekersin

### Nasıl koyarsın:

```
movieon.to navbar:
  [Home]  [Movies]  [TV Shows]  [API]  [Search]

API tıklanınca:
  → embed.movieon.to açılır (yeni sekmede)
  → Orası zaten API dokümantasyonu gösteriyor (güncelledik)
```

Veya film sitesinde `/api` sayfası oluşturup aynı içeriği gösterebilirsin. İkisi de çalışır.

---

## 7. CONTENT CALENDAR — HANGİ GÜN NE PAYLAŞILACAK?

`CONTENT-CALENDAR.md` zaten 1233 satırlık detaylı bir takvim. Ama çok uzun.

### Basitleştirilmiş haftalık rutin:

```
PAZARTESİ:
  Reddit: r/freemovies'e film önerisi
  Twitter: "Monday movie pick 🎬" tweet

SALI:
  Telegram: 3 yeni film ekle
  Reddit: r/piracy'de yorum yaz (link VERME, sadece yardım et)

ÇARŞAMBA:
  Twitter: "Top 5 movies on [genre]" thread
  Telegram: 3 yeni film ekle

PERŞEMBE:
  Reddit: r/cordcutters'da yorum yaz
  Twitter: Film sahne klibi + link

CUMA:
  Reddit: Film önerisi post
  Telegram: 5 hafta sonu filmi ekle
  Twitter: "Weekend watchlist" tweet

CUMARTESİ-PAZAR:
  Sadece Telegram'a film ekle (5 dk)
  Reddit yorumlara cevap ver (5 dk)
```

### Altın kurallar:

```
1. Reddit'te ASLA doğrudan link SPAM yapma
   → "I found this site" değil, "there are free options out there" de
   → Profildeki bio'ya link koy, insanlar oradan bulur

2. İlk 2 hafta hiç link paylaşma
   → Sadece yorum yaz, karma kazan, güven oluştur
   → 3. haftadan sonra doğal şekilde bahset

3. Her post'ta farklı film öner
   → "Watch Inception free" değil
   → "Just watched Inception for the 5th time, still holds up"

4. Telegram kanalı: günde 3-5 film, poster + link
   → Kanal ismi: "Free HD Movies" gibi genel
   → Bio'da movieon.to linki
```

---

## 8. ÖNCELİK SIRASI — ŞİMDİ NE YAPACAKSIN?

```
Bu hafta:
  1. ☐ VPS al (Hetzner, 5 dk, $5)
  2. ☐ Domain DNS ayarla (Cloudflare, 15 dk)
  3. ☐ VPS'e Docker kur (30 dk)
  4. ☐ cinepro + embed-api deploy et (1 saat)
  5. ☐ Nginx + SSL (30 dk)
  6. ☐ Test: embed.movieon.to/watch/movie/27205 çalışıyor mu?

Sonraki hafta:
  7. ☐ Film sitesi oluştur (basit Next.js, 4-6 saat)
  8. ☐ movieon.to'ya deploy et
  9. ☐ SEO: sitemap.xml, robots.txt, Google Search Console

Sonraki haftalar:
  10. ☐ Reddit hesap aç, karma kazan (2 hafta)
  11. ☐ Twitter hesap aç, film önerileri paylaş
  12. ☐ Telegram kanal aç, günde 3-5 film ekle

Ay 2 (3K/gün trafik gelince):
  13. ☐ Adsterra hesap aç → pop-under ekle
```

**Tek kural:** 1-6 bitmeden 7-12'ye GEÇME. Deploy olmadan pazarlama yapma.
