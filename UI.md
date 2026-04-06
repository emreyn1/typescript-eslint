**Option 7 için UI/UX önerisi** (2026 trendlerine uygun, hem **film sitesi** hem de **embed streaming sitesi** olarak)

Senin sistemin iki farklı kullanım senaryosuna hizmet ediyor:

- **Film sitesi modu**: Keşif, arama, kategoriler, listeler, öneriler ağırlıklı (Netflix/Prime Video benzeri).
- **Embed modu**: Temiz, hızlı video player sayfası (reklam + hızlı yüklenme + minimal distraction).

İkisini de aynı codebase’te yapabilirsin (React/Next.js + Tailwind öneririm), ama kullanıcı deneyimi ve performans açısından ayrı düşünmek lazım.

### Genel UI Prensipleri (2026 için)
- **Dark Mode zorunlu** — Sinema hissi verir, göz yormaz, thumbnail’ler daha parlak çıkar. Layered dark (saf siyah değil, derin gri tonlar: #0a0a0a, #121212, #1a1a1a) kullan.
- **Responsive** — Mobile > Desktop > Tablet öncelikli (çoğu trafik mobilden gelir).
- **Hız odaklı** — Lazy loading, skeleton loaders, minimal JS, image optimization (WebP/AVIF).
- **Micro-animations** — Hover’larda hafif scale + glow, sayfa geçişlerinde smooth fade, video başladığında UI’nin yavaşça kaybolması.
- **Accent renk** — Kırmızı (#ef233c veya neon kırmızı) veya mavi-turuncu gradient’ler (sci-fi/retrofuturism trendi). Çok fazla renk kullanma.
- **Typography** — Başlıklarda bold sans-serif (Inter, Satoshi, PP Mori), film isimlerinde biraz daha büyük ve cinematic font.

### 1. Ana Sayfa / Film Sitesi Modu (Keşif Arayüzü)
- **Hero Section**: Büyük trending film/dizi carousel (auto-play + pause on hover). Poster büyük, üzerine gradient overlay + film adı + “Şimdi İzle” butonu.
- **Rows / Horizontal Scroll**: “Popüler Bu Hafta”, “Sana Özel”, “Aksiyon”, “Yeni Eklenenler”, “Viral” gibi kategoriler. Her row’da card’lar (poster + title + rating + year).
- **AI-powered personalization**: Kullanıcı giriş yaptıysa “Senin için önerilenler” row’u (Gemini Embedding 2 + recommendation’dan gelen veriye göre).
- **Sidebar veya üst menü**: Kategoriler, Türler, Yıllar, Ülkeler, Mood-based filtre ( “Rahatlatıcı”, “Gerilim”, “Komedi” gibi – 2026’da semantic filtre trendi).
- **Search bar**: Üstte büyük, odaklanınca genişleyen + öneri dropdown (multimodal search: “cyberpunk neon posterli film” gibi).
- **Bento grid veya asymmetric layout** — 2026 trendi, bazı row’ları farklı boyutlarda göster.

**Performans ipucu**: İlk yüklemede sadece 8-10 row göster, scroll’da infinite loading + predictive prefetch.

### 2. Detay Sayfası (Film/Dizi Sayfası)
- Büyük poster + backdrop (üstte hero).
- Bilgiler: Konu özeti, IMDB/TMDB rating, süre, yönetmen, oyuncular (hover’da kısa bio).
- “Benzer İçerikler” carousel’i (multimodal similarity ile).
- İzleme butonu: “Şimdi İzle” → direkt player sayfasına veya embed moduna geçer.
- Trailer oynatma (küçük pencere veya aynı sayfada).

### 3. Embed / Video Player Sayfası (En Kritik Kısım)
Bu sayfa **mümkün olduğunca temiz** olmalı çünkü açılma hızı burada kritik.

- **Video Player**: Tam ekran ağırlıklı (HLS player – Video.js veya hls.js). Kontroller: Play/pause, volume, quality selector (auto + manuel), subtitle, theater mode, picture-in-picture.
- **UI Otomatik Gizlenme**: Video oynayınca 3-4 saniye sonra player UI’si fade out olur (Netflix tarzı).
- **Yan panel (isteğe bağlı)**: 
  - Sağda “Benzer filmler” mini listesi (küçük posterler).
  - Veya altta “Sonraki bölüm” / “Önerilen” (dizi için).
- **Reklam entegrasyonu**: Pre-roll, mid-roll veya non-intrusive banner (server-side bumper ile).
- **Minimal header/footer**: Sadece logo + arama + kullanıcı ikon. Player’da header gizli.
- **Mobile optimizasyon**: Tam ekran otomatik, dokunmatik kontroller büyük.

**Açılma hızı için**:
- Player sayfası mümkün olduğunca az JS ve component yüklesin.
- Skeleton loader’lar çok iyi yapılmış olsun (poster ve player alanı gri animasyonlu).
- Lazy load yan paneli.

### 4. Ekstra Modern Dokunuşlar (Option 7’ye yakışır)
- **Micro-interactions**: Poster hover’da hafif zoom + glow + “Quick Play” butonu çıkar.
- **Kinetic typography**: Ana başlıklara hafif animasyon (2026 trendi).
- **Neon / Retrofuturism accent**: Bazı butonlarda veya trending badge’lerde neon efekt (ama abartmadan).
- **Accessibility**: Yüksek kontrast, klavye navigasyonu, screen reader desteği.
- **Tema toggle**: Dark / Light (ama default dark olsun).

### Teknik Tavsiyeler
- **Framework**: Next.js 15 (App Router) + Tailwind CSS + shadcn/ui veya Radix primitives (hızlı ve temiz component’lar için).
- **State**: Zustand veya React Query.
- **Player**: hls.js + custom controls (veya Bitmovin/Video.js eğer bütçe varsa).
- **Animasyon**: Framer Motion (hafif tut).
- **SEO**: Film detay sayfaları SSR, schema markup (Movie schema) ekle.

**Kısaca Özet**:
- **Film sitesi** → Keşif odaklı, zengin row’lar, personalization, cinematic dark tema.
- **Embed sitesi** → Minimal, hızlı, video odaklı, distraction-free player.

Büyük rakipler (Netflix, Prime, yerel embed siteleri) tam da bu dengeyi kuruyor: Keşif sayfası eğlenceli ve zengin, izleme sayfası ise olabildiğince temiz.

Şimdi ne istiyorsun?
**A)** Bu UI’nin **detaylı component breakdown’ı** + örnek sayfa yapısı (kod seviyesinde mantık)
**B)** **Figma / Tasarım rehberi** tarzı wireframe açıklaması (ana sayfa + player sayfası)
**C)** Option 7’ye bu UI’yi nasıl entegre ederiz + frontend tech stack önerisi

Sadece **A, B veya C** yaz.

Veya belirli bir sayfayı (ana sayfa / player) daha derin anlatayım mı?