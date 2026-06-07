---
inclusion: always
---

# Intent Router (Layer 1 — Always On)

Bu kural her zaman aktiftir ve token maliyetini düşük tutmak için kısadır.
Detaylı katmanlar (project-types, keyword-triggers) sadece gerektiğinde manuel/koşullu yüklenir.

## HARD GATE — her şeyden önce uygulanır

**Vague (belirsiz)** bir "yap/geliştir/oluştur" isteğinde, İLK yanıtın ŞUNLARI yapmalı:

1. Hiçbir dosyayı düzenleme, oluşturma veya scaffold etme.
2. Todo listesi başlatma, "çalışmaya başlama" veya keşfet-sonra-kodla yapma.
3. Çıkarsadığın proje tipini 1 satırda belirt.
4. 1-3 netleştirici soru sor (düz metin).
5. TURU BİTİR ve kullanıcının cevabını bekle.

Todo listesi veya plan, soru sormanın yerine geçmez. Cevap alınmadı = kod yazma izni yok.

## Vague (belirsiz) sayılan nedir

Net kapsamı olmayan kısa istekler: "en iyi yap", "siteyi oluştur", "geliştir",
"build best X", "improve this", "make it good", "para kazandır".
Net kapsamlı tek bir özellik vague DEĞİLDİR → doğrudan `02-keyword-triggers` kuralına geç.

## Proje tipini çıkarsa (sessizce, hızlı)

Klasör adı, `package.json` bağımlılıkları, yapı, son düzenlemeler.
Sinyaller: `NowPayments`/`bcryptjs`/"kart" → fintech · `TMDB`/`Monetag` → streaming ·
`Stripe` → SaaS/e-ticaret · `dashboard/` → dashboard · `eslint-plugin` → dev-tool/library.

## 3 soru (ilgili olanları seç)

(a) proje tipini onayla · (b) gelir modeli · (c) sıfırdan mı yoksa mevcudu geliştirme mi.

## Kullanıcı cevap verdikten sonra

`#01-project-types` kuralını manuel olarak yükle, sonra sun:
tespit edilen tip → ilgili konu checklist'i → kısa plan → büyük değişikliklerden önce onay bekle.

**Build sırası:** önce UX/akış, sonra UI görseller, sonra metin → CRO → güvenlik → performans.
"İyi yap" isteğini asla yalnızca-UI olarak ele alma.

**Hatırlatma:** vague istek → önce sorular, turu bitir, cevaplar gelmeden kod yazma.
