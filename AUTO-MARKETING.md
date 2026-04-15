# Otomatik Pazarlama Rehberi (4 Marka)

Bu rehber, **allianceAroma** tarzı bir yapıyı özetler: küçük bir çekirdek ekip (sen), **Filipinli VA / freelancer** ile içerik üretimi, **otomasyon** ile dağıtım ve **dört iş birimi** için tekrarlanabilir bir pazarlama makinesi.

---

## 1. Genel mimari (metin diyagram)

```
                    ┌─────────────────────────────────────┐
                    │                 SEN                  │
                    │  strateji, onay, metrik, bütçe, OPSEC │
                    └──────────────┬──────────────────────┘
                                   │
                    iş tanımı, şablon, takvim, KPI
                                   ▼
                    ┌─────────────────────────────────────┐
                    │            FREELANCER / VA           │
                    │  4 marka için sosyal içerik, trend,    │
                    │  kısa metin, görsel brief, rapor       │
                    └──────────────┬──────────────────────┘
                                   │
                    ham içerik + onay kuyruğu
                                   ▼
                    ┌─────────────────────────────────────┐
                    │              OTOMASYON               │
                    │  SocialTargeter, Telegram Bot,       │
                    │  şablonlar, metadata temizliği       │
                    └──────────────┬──────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  Film / Embed   │  │  No-KYC Card    │  │  SMS Verify     │
    │  (içerik + SEO) │  │  (gizlilik)     │  │  (karşılaştırma)│
    └─────────────────┘  └─────────────────┘  └─────────────────┘
              │
              ▼
    ┌─────────────────┐
    │  Browser Games  │
    │  (etkinlik DAP) │
    └─────────────────┘
```

**Akış özeti:** Sen kuralları ve marka sesini sabitlersin; freelancer haftalık içerik üretir; otomasyon zamanlar ve yayınlar; her marka kendi içerik kancasıyla beslenir (aşağıda).

---

## 2. Freelancer stratejisi

### 2.1 Nerede bulunur

| Kanal | Not |
|--------|-----|
| **OnlineJobs.ph** | Uzun vadeli VA için en iyi fiyat/performans; İngilizce, saat dilimi uyumu planlanabilir. |
| **Fiverr** | Paket bazlı, hızlı deneme; sürekli VA yerine proje bazlı. |
| **Upwork** | Daha pahalı; kalite filtresi güçlü; deneyimli sosyal medya uzmanı aramak için. |
| **r/forhire** | Reddit; düşük maliyet, risk yüksek; kısa süreli veya niş denemeler için. |

### 2.2 En mantıklı seçim: OnlineJobs.ph

- **Bütçe:** yaklaşık **$200–300/ay** tam zamanlı veya yarı zamanlı Filipino VA (sosyal + araştırma + rapor).
- **Neden:** İngilizce çıktı kalitesi genelde yeterli; maliyet ABD/EU freelancer’ına göre düşük; aynı kişi 4 markayı tek şablonda yönetebilir.

### 2.3 İş ilanı şablonu (İngilizce)

Aşağıdaki metni OnlineJobs.ph / Upwork’e uyarlayarak kullan.

```text
Title: Social Media Manager — 4 Brands (Templates + Scheduling Provided)

We run four separate digital products (film/embed content, privacy-focused card service, SMS verification, browser games). We need one reliable person to execute our playbook, not invent strategy from scratch.

What you’ll do:
- Research trends and draft short posts (English) per brand voice guidelines
- Prepare post copy + image briefs; we use Canva templates you will reuse
- Load approved posts into our scheduling tool (SocialTargeter) and/or Telegram channels per SOP
- Weekly metrics screenshot + 5-bullet summary (what worked, what to try next)

Requirements:
- Fluent English writing (social-first, not academic)
- Experience with X, Reddit, Facebook, Telegram, and at least one of: TikTok / Instagram
- Comfortable following checklists and brand docs; attention to detail
- Available for overlap with [YOUR TIMEZONE] for a 30-min weekly call

Nice to have:
- Basic Canva edits (text swap, resize)
- Familiarity with TMDB, gaming communities, or fintech/privacy topics (we’ll train)

Tools we use:
- SocialTargeter (scheduling), Telegram, Canva, Google Sheets for the content calendar

Compensation:
- $[AMOUNT]/month for [FULL-TIME / PART-TIME] — trial period [30] days

To apply:
- Send 3 sample posts for three different brands (can be fictional products) + links to accounts you’ve managed
```

### 2.4 Ödeme yöntemleri

- **Wise:** Düşük ücret, Filipin’e banka transferi için pratik; faturalandırma için işlem kaydı tut.
- **Kripto (USDT vb.):** Freelancer kabul ediyorsa hızlı; kur ve compliance riskini sen yönet; küçük tutarlarla başla.

### 2.5 Freelancer günlük görev listesi (İngilizce checklist — SOP olarak ver)

```text
Daily (Mon–Fri) — ~2–3 hours depending on contract

1. Check SocialTargeter queue: any failed posts? Fix or flag.
2. Film brand: scan trending titles / TMDB “trending” — 1 post idea + draft.
3. Card brand: 1 privacy/crypto-regulation or “financial privacy tip” hook — draft.
4. SMS brand: 1 comparison or “use case” post (speed, coverage, use-case) — draft.
5. Games brand: 1 event / patch / community highlight — draft.
6. Paste all drafts into the shared sheet; tag “READY_FOR_REVIEW”.
7. Telegram: if today’s auto-posts need manual pin/comment, do per runbook.
8. End of day: 3-line summary in Slack/Telegram to owner.

Weekly:
- Fill next week’s calendar slots in SocialTargeter (after approval).
- Export basic metrics (followers, clicks if available) into the weekly tab.
```

---

## 3. Otomasyon araçları

| Araç | Rol |
|------|-----|
| **SocialTargeter** | Ücretsiz; çoklu platform (9+) zamanlama; freelancer’ın ana dağıtım noktası. |
| **Telegram Bot API** | Kanallara otomatik gönderim (RSS, webhook, onaylı kuyruk); serverless veya küçük bir worker ile bağlanabilir. |
| **Canva** | Marka şablonları; VA sadece metin ve görsel değiştirir; tutarlılık. |
| **ExifTool** | Görsel/video metadata temizliği (**OPSEC**); konum, kamera, tarih sızıntısını kapatır. Yayın öncesi batch: `exiftool -all= -overwrite_original *.jpg` (iş akışına göre uyarla). |

**OPSEC notu:** Freelancer’a ham ofis/cihaz fotoğrafı kullanmamasını; yalnızca stok + marka varlıkları + ExifTool sonrası export söyle.

---

## 4. Senin haftalık rutinin (~45 dk)

| Gün | Süre | Yapılacak |
|-----|------|-----------|
| **Pazartesi** | ~15 dk | Metrikleri gözden geçir (traffic, engagement, Telegram büyümesi). Onay bekleyen içerikleri tek seferde onayla veya reddet; kısa geri bildirim notu yaz. |
| **Çarşamba** | ~15 dk | Freelancer çıktısı: takvim dolu mu, dil tonu doğru mu, yanlış marka karışması var mı? Gerekirse SOP’u tek madde ile güncelle. |
| **Cuma** | ~15 dk | Gelecek haftanın odağı: hangi marka “push” haftası (ör. Film — yeni sezon; SMS — kampanya). Freelancer’a tek paragraflık öncelik notu. |

Toplam: **~45 dk/hafta** rutin + aylık bir kez araç faturaları ve freelancer performans değerlendirmesi.

---

## 5. Marka bazlı özgüllükler

Strateji metinleri **İngilizce** tutulmalı (uluslararası erişim). Aşağıda içerik kancaları ve kaynaklar.

### 5.1 Film / Embed sitesi

- **Hooks:** Trending movies/series, “this week on streaming”, franchise anniversaries, award season, director retrospectives.
- **Data:** **TMDB API** — `trending/movie/week`, `trending/tv/week`, `movie/{id}/similar` for content ideas; always respect TMDB attribution rules.
- **Execution:** Short threads + link to site/embed pages; avoid copyright imagery (posters) where policy unclear — use licensed assets or text-first.

### 5.2 No-KYC Card sitesi

- **Hooks:** Privacy news (regulation headlines rewritten neutrally), “why separate spending identity matters”, travel/anonymous checkout use cases, security hygiene (not financial advice).
- **Tone:** Calm, factual, no hype; disclaimers where required by your counsel.
- **Content types:** Carousel “myth vs fact”, Reddit-style long comments adapted to X/LinkedIn.

### 5.3 SMS verification sitesi

- **Hooks:** Service comparison tables (speed, countries, use case), “when to use temp vs long-term number”, app-specific guides (generic names, no trademark abuse).
- **SEO/social bridge:** “How to verify [platform] without sharing primary number” — keep compliant with platform ToS messaging.

### 5.4 Browser games

- **Hooks:** Tournament and **event calendar** (season start, double XP, community tournament, patch highlights).
- **Community:** Discord/Telegram teaser posts; countdown posts; highlight clips (metadata cleaned).

---

## 6. Hızlı başlangıç sırası

1. Marka sesi dokümanı (1 sayfa/marka) + yasak kelimeler listesi.  
2. Canva şablon seti (4 varyant).  
3. SocialTargeter hesapları ve kanal bağlantıları.  
4. İş ilanı + 30 günlük deneme VA.  
5. Haftalık onay kuyruğu (Sheet veya Notion) + Cuma öncelik notu alışkanlığı.

Bu dosya **GROWTH-PLAN.md** ile birlikte kullanılmalıdır (launch, KPI, ölçek tetikleri).
