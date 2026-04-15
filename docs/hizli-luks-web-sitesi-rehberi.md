# Hızlı ve Lüks Web Sitesi Üretimi — Rehber (2026)

Bu doküman, **yüksek kaliteli / “pahalı görünen”** web arayüzlerini mümkün olduğunca hızlı çıkarmak için iki kaynağın birleşimidir:

1. **Grok önerileri** (genel akış: AI + no-code hibrit, R3F, Spline, Lovable/Bolt vb.)
2. **Pratik “best-of-best” öneriler** (Awwwards tarzı sitelerde tekrar eden stack, MeshTransmission, GSAP + Lenis, referans siteler)

Tarih: Nisan 2026. Stack sürümleri projeye göre güncellenmelidir.

---

## İçindekiler

1. [Hedef ve gerçekçi beklenti](#1-hedef-ve-gerçekçi-beklenti)
2. [Önerilen stack (kodlu — ana hat)](#2-önerilen-stack-kodlu--ana-hat)
3. [Grok’un vurguladığı yöntemler](#3-grokun-vurguladığı-yöntemler)
4. [Best-of-best: lüks hissi veren parçalar](#4-best-of-best-lüks-hissi-veren-parçalar)
5. [No-code / low-code hızlı yollar](#5-no-code--low-code-hızlı-yollar)
6. [AI ile “vibe coding” akışı](#6-ai-ile-vibe-coding-akışı)
7. [Bir günlük üretim planı](#7-bir-günlük-üretim-planı)
8. [Performans ve kalite kontrol listesi](#8-performans-ve-kalite-kontrol-listesi)
9. [Referans siteler ve öğrenilecekler](#9-referans-siteler-ve-öğrenilecekler)
10. [Paket ve komut özeti](#10-paket-ve-komut-özeti)

---

## 1. Hedef ve gerçekçi beklenti

| Hedef | Süre (yaklaşık) | Not |
|--------|-----------------|-----|
| Tek güçlü hero + scroll + temiz UI | 1 gün | Orta seviye React + 3D bilgisiyle gerçekçi |
| Tam ajans kalitesi (Lusion, Resn sınıfı) | Haftalar | Özel shader, optimizasyon, içerik, QA |
| Hızlı tanıtım / landing (kodsuz) | Yarım gün | Spline + Framer veya benzeri |

**Kural:** Tek sayfada **bir** güçlü 3D/efekt + geri kalanı hızlı ve okunaklı UI. Her bölüme 3D koymak hem süreyi hem performansı bozar.

---

## 2. Önerilen stack (kodlu — ana hat)

Bu kombinasyon, 2024–2026 döneminde “premium” etkileşimli sitelerde sık görülür.

| Katman | Araç | Rol |
|--------|------|-----|
| Framework | **Next.js 15+** (App Router) | SSR/SEO, deploy (Vercel vb.), kod bölme |
| 3D | **Three.js** + **React Three Fiber (R3F)** | 3D sahneyi React bileşeni gibi yönetme |
| 3D yardımcılar | **@react-three/drei** | Işık, ortam, kontroller, `MeshTransmissionMaterial`, `Float`, `Environment` |
| Post-processing | **@react-three/postprocessing** | Bloom, depth of field, vignette — “sinematik” görünüm |
| Scroll / zaman çizelgesi | **GSAP** + **ScrollTrigger** | Scroll’a bağlı kamera, opacity, metin reveal |
| Smooth scroll | **Lenis** | Akıcı kaydırma; GSAP ile entegre edilebilir |
| UI motion | **Framer Motion** (veya Motion) | Sayfa / bileşen geçişleri, layout animasyonları |
| Stil | **Tailwind CSS** | Hızlı layout, responsive, glass sınıfları |
| Bileşen tabanı | **shadcn/ui** (isteğe bağlı) | Erişilebilir, özelleştirilebilir UI blokları |

Bu repodaki `portfolyo-M/my-app` örneğinde benzer paketler zaten tanımlı olabilir (`@react-three/fiber`, `drei`, `postprocessing`, `lenis`, `framer-motion`, `gsap` vb.) — yeni proje açarken bu listeyi kontrol edin.

---

## 3. Grok’un vurguladığı yöntemler

Özet (orijinal sohbet / `grok.md` ile uyumlu):

1. **R3F + Drei + GSAP + Tailwind + shadcn**  
   - Three.js’i ham yazmak yerine R3F ile sahne grafiğini bileşenleştirmek.  
   - Drei ile tekerleği yeniden icat etmemek (ışık, HDR ortam, kontroller).

2. **AI destekli geliştirme (“vibe coding”)**  
   - Cursor Composer / Claude Code ile çok dosyalı düzenleme.  
   - Net prompt: framework, kütüphaneler, referans site hissi, performans kuralları.

3. **Spline → embed**  
   - 3D’yi tarayıcıda tasarlayıp React/Next veya Framer’a gömme.  
   - Tasarımcı ağırlıklı ekiplerde hız kazandırır.

4. **No-code / AI site üreticileri**  
   - Lovable, Bolt vb. ile iskelet site; 3D ve animasyonu sonra elle veya R3F ile güçlendirme.  
   - **Uyarı:** Çıktı genelde “MVP”; lüks his ve performans için elden geçmek gerekir.

5. **Performans**  
   - WebGPU ekosistemi büyüyor; çoğu prod hâlâ WebGL.  
   - Düşük cihazda 3D kapatıp statik görsel/video fallback.

---

## 4. Best-of-best: lüks hissi veren parçalar

### 4.1 MeshTransmissionMaterial (cam / kristal)

Drei içindeki **MeshTransmissionMaterial** (veya eşdeğeri API), tek mesh ile “yüksek bütçeli” cam/kristal hissi verebilir. Parametreler (chromaticAberration, thickness, distortion vb.) ile oynanır.

**Ne zaman:** Hero’da tek güçlü obje; çok mesh + çok ışık bir günde şişer.

### 4.2 Post-processing

Bloom + hafif DOF + vignette, “film” hissi. Paket: `@react-three/postprocessing` + `postprocessing`.

**Ne zaman:** Desktop’ta açık; mobilde kapatma veya sadeleştirme düşünülebilir.

### 4.3 Shader tabanlı arka plan

Soyut, yumuşak gradient’ler (Linear, Stripe, Vercel tarzı). Seçenekler:

- Hazır **Shader Gradient** tarzı bileşenler / örnekler  
- Özel GLSL (daha uzun sürer)

### 4.4 Metin reveal (GSAP)

Başlığı satır / harf bazında `stagger` ile açmak, premium landing’lerde sık görülür. **ScrollTrigger** ile bölüm görünürken tetiklenir.

### 4.5 Tipografi ve “boşluk”

- Az ama iddialı font (ör. **Geist**, veya proje fontu)  
- Geniş margin, sınırlı renk paleti, koyu tema + tek vurgu rengi  
- **Glassmorphism:** `backdrop-blur` + düşük opaklık arka plan + ince border  

---

## 5. No-code / low-code hızlı yollar

| Yöntem | Artı | Eksi |
|--------|------|------|
| **Spline + Framer** | Çok hızlı, kod minimum | Özelleştirme ve performans tavanı |
| **Spline + Next (`@splinetool/react-spline`)** | Orta yol: tasarım Spline, sayfa Next | Spline sahne boyutu / yükleme |
| **Webflow + 3D embed** | Tasarımcı dostu | Aylık maliyet, karmaşık 3D sınırlı |

**Ne zaman no-code:** Marka landing’i, kampanya sayfası, portfolyo teaser.

**Ne zaman kod:** Ürün sitesi, tekrar kullanılan bileşenler, sıkı Lighthouse hedefi, tam kontrol.

---

## 6. AI ile “vibe coding” akışı

1. **Repo iskeleti:** `create-next-app`, TypeScript, Tailwind, App Router.  
2. **Bağımlılıklar:** `three`, `@react-three/fiber`, `@react-three/drei`, gerekirse `postprocessing`, `lenis`, `gsap`, `framer-motion`.  
3. **Prompt’a ekleyin:**  
   - “Canvas sadece client’ta; Next.js’te `dynamic(..., { ssr: false })`”  
   - “dpr max 2, mobilde hafiflet”  
   - “Tek hero 3D sahne; gereksiz mesh yok”  
   - “Erişilebilirlik: prefers-reduced-motion’da animasyon azalt”  
4. **Çıktıyı mutlaka elle:** Lighthouse, gerçek telefon, gereksiz re-render temizliği.

---

## 7. Bir günlük üretim planı

| Blok | Süre | İçerik |
|------|------|--------|
| Sabah | 2–3 saat | Proje + font + renk + tek Canvas sahnesi (model veya procedural + ışık + ortam) |
| Öğle | 2–3 saat | Lenis + GSAP ScrollTrigger; hero sonrası bölümler; metin reveal |
| Öğleden sonra | 2 saat | shadcn/Tailwind ile grid, CTA, footer; glass kartlar |
| Akşam | 1–2 saat | Mobil düzen, 3D fallback veya kalite düşürme, deploy |

Bu plan **deneyim varsayar**; sıfırdan öğrenen için süre katlanır.

---

## 8. Performans ve kalite kontrol listesi

- [ ] 3D bundle **lazy load** (`dynamic` / route bazlı code splitting).  
- [ ] `devicePixelRatio` üst sınırı (ör. 2).  
- [ ] Dokunmatik cihazda orbit/scroll çakışması test edildi.  
- [ ] Texture’lar mümkünse sıkıştırılmış (KTX2 / uygun boyut).  
- [ ] `useFrame` içinde gereksiz state güncellemesi yok.  
- [ ] **Lighthouse** (LCP, CLS); 3D ağır ise ilk ekranda statik placeholder.  
- [ ] `prefers-reduced-motion` ile agresif animasyonlar kısıldı.  
- [ ] CSP / güvenlik başlıkları prod’da (özellikle harici script/embed varsa).

---

## 9. Referans siteler ve öğrenilecekler

| Site | Odak |
|------|------|
| [lusion.co](https://lusion.co) | Scroll + 3D + malzeme kalitesi |
| [linear.app](https://linear.app) | Minimal lüks, tipografi, hız |
| [stripe.com](https://stripe.com) | Animasyon disiplini, içerik + motion dengesi |
| [aristidebenoist.com](https://aristidebenoist.com) | Portfolyo, sade ama güçlü etkileşim |
| [dennissnellenberg.com](https://dennissnellenberg.com) | Scroll narrative, sade palet |

Bu siteleri “kopyala” değil; **1–2 tekniği** (ör. tek hero malzemesi + scroll reveal) seçip uygula.

---

## 10. Paket ve komut özeti

### Tipik kurulum (örnek)

```bash
npx create-next-app@latest my-luxury-site --typescript --tailwind --app
cd my-luxury-site
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing
npm install gsap lenis framer-motion
# İsteğe bağlı: shadcn-ui kurulumu (resmi CLI)
```

### Next.js + Canvas

3D içeren bileşenleri **SSR dışında** tutun; aksi halde `window` / WebGL hataları oluşur.

```tsx
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });
```

### Grok vs bu doküman — tek cümle

- **Grok:** Hız için AI + no-code + R3F karışımı; geniş çerçeve.  
- **Bu doküman:** Aynı çerçeveyi **ürünleştirilebilir** hale getirir: net stack, lüks his veren spesifik teknikler, kontrol listesi ve gerçekçi süre.

---

## İlgili dosyalar (repo içi)

- `portfolyo-M/grok.md` — Grok çıktısının ham notu  
- `portfolyo-M/my-app/package.json` — Örnek bağımlılık seti (projeye göre değişir)

---

*Bu doküman proje dokümantasyonu içindir; araç fiyatları ve üçüncü taraf şartları zamanla değişebilir.*
