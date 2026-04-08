# Ajans Olarak Çalışmak — Pratik Rehber

## Freelancer ≠ Ajans

| | Freelancer | Ajans |
|---|---|---|
| Kim satıyor? | Sen | Marka |
| Kim yapıyor? | Sen | Ekip (veya sen + AI) |
| Fiyat tabanı | Saatlik ücret | Proje değeri |
| Kapasite | 1 proje | N proje paralel |
| Büyüme | Linear | Exponential |

Tek kişilik ajans olunur. Bunun adı **boutique agency** veya **studio**.

---

## Niş: Ne Sunuyorsun?

Genel yazılım ajansı kurma — rekabet kalabalık, fark zor.
Senin doğal niş'in şu an belliydi:

> **"Streaming infrastructure & monetization"**

Daha net pazarlama dili:
- "Film/dizi sitesi kuruyoruz — backend, CDN, reklam"
- "Embed servis altyapısı — HLS, adblock-proof monetization"
- "Browser tabanlı multiplayer oyun platformu"

Üçü de aynı stüdyo altında olabilir çünkü hepsi aynı teknik stack (Node.js, WebSocket, CDN, deployment).

---

## Müşteri Profili

### Tier 1 — Hızlı para
- Film/dizi sitesi açmak isteyen ama teknik bilgisi olmayanlar
- Mevcut sitelerin "embed bozuluyor" problemi yaşayanlar
- Küçük IPTV operatörleri (Türkiye'de çok sayıda)

### Tier 2 — Büyük para
- Dijital ajansların "yapamadım" dediği video altyapısı projeleri
- Yabancı streaming startup'ları (Upwork üzerinden)
- Oyun şirketleri: "web versiyonu yapar mısın?"

---

## Fiyatlandırma

### Proje bazlı (tek seferlik)
```
Embed altyapısı kurulumu:       €1.500 – €4.000
Film sitesi (NyumatFlix tabanlı): €800 – €2.000
Multiplayer oyun (clone):       €2.000 – €6.000
Tam platform (site + embed):    €3.500 – €8.000
```

### Retainer (aylık tekrar eden)
```
Hosting + bakım:     €200 – €400/ay
Yeni özellik paketi: €500 – €1.000/ay
```
Retainer hedefin olsun. 5 müşteri × €300 = €1.500/ay pasif gelir.

---

## İlk Müşteriyi Nasıl Bulursun?

### 1. Upwork — En hızlı yol
- Kategori: "Video Streaming", "WebRTC", "Game Development"
- İlk 3 proje ucuza al, 5 yıldız al, ardından fiyatı artır
- Profil başlığı: *"HLS Video Infrastructure & Browser Game Developer"*

### 2. Doğrudan DM
- Türkiye'deki film/dizi sitelerini bul (torrent/film arama)
- "Embed altyapınız optimize değil, şu sorunlar var" diyerek DM at
- Çözümü ücretsiz göster, kurulumu ücretli teklif et

### 3. Reddit / Discord
- r/gamedev, r/webdev, r/entrepreneur
- "I built a zero-cost HLS CDN using Telegram + Cloudflare R2" blog yazısı
- Bu tür yazılar müşteri getirir

### 4. Product Hunt / Hacker News
- İlk projeyi canlıya alınca launch yap
- HN'de "Show HN: I built a self-hosted embed service..." post at

---

## Ajans Görünümü (Tek Kişi)

### Domain + E-posta
```
studioadi.dev
hello@studioadi.dev (Protonmail veya Zoho)
```

### Site yapısı (3 sayfa yeterli)
```
/ → Ne yapıyoruz (niş, 2 cümle)
/work → Case study'ler (NyumatFlix, embed-api, oyunlar)
/contact → Form veya Calendly
```

### Dil
"We build" kullan, "I build" değil. Şirket gibi konuş.

### Case Study formatı
```
Müşteri: Anonim streaming sitesi
Sorun: Embed kaynakları yavaş, adblock bypass yok
Çözüm: HLS remux pipeline + server-side bumper reklam
Sonuç: %40 daha az CDN maliyeti, reklam geliri %3x arttı
```

---

## Konferans / Topluluk

### Ne zaman gitmeye değer?
- En az 1 proje production'da çalışıyor olsun
- Sayıların olsun: "X kullanıcı, Y GB/gün video"

### Hangi konferanslar?
| Konferans | Konu | Ne sunulabilir? |
|---|---|---|
| [Demuxed](https://demuxed.com) | Video streaming | "Zero-cost HLS CDN" talk |
| [JSGameDev Summit](https://jsgamedev.com) | Browser oyunları | Phaser + Colyseus mimarisi |
| [JS Nation](https://jsnation.com) | JavaScript | WebRTC, real-time sistemler |
| Türkiye — Devnot | Genel yazılım | Embed servis analizi |

### Konferanstan önce: Blog yaz
Medium veya kendi sitenizde tek bir teknik yazı, konferanstan daha fazla görünürlük sağlar.

**İyi başlıklar:**
- *"How I Built a Zero-Cost Video CDN Using Telegram + Cloudflare R2"*
- *"Server-Side Ad Injection into HLS: The Adblock-Proof Method"*
- *"Reverse Engineering 7 Video Embed Providers"*

---

## 6 Aylık Yol Haritası

```
Ay 1:  NyumatFlix + embed-api Phase 1 canlıya al
Ay 2:  İlk Upwork projesini al, teslim et
Ay 3:  Case study yaz, ajans sitesini aç
Ay 4:  İlk blog yazısı → Reddit/HN'de paylaş
Ay 5:  2. ve 3. müşteri, retainer teklifi yap
Ay 6:  Phase 2 embed-api (torrent pipeline) canlıya al
```

---

## Araçlar

| İhtiyaç | Araç | Maliyet |
|---|---|---|
| Proje yönetimi | Notion veya Linear | Ücretsiz |
| Sözleşme | Bonsai veya And.co | Ücretsiz (basic) |
| Fatura | Wave veya Stripe | Ücretsiz/Düşük |
| İletişim | ProtonMail | Ücretsiz |
| Video call | Cal.com + Google Meet | Ücretsiz |
| Teklif | Notion page | Ücretsiz |
