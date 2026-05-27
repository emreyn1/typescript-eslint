# Logo ve Favicon – Format ve Boyut Önerileri

## Logo (Navbar / Footer)

| Format | Öneri | Not |
|--------|--------|-----|
| **SVG** | ✅ En iyi | Her çözünürlükte net, küçük dosya. Varsa bunu kullan (örn. `public/logo.svg`). |
| **PNG** | ✅ İyi | Şeffaf arka plan için. Retina için 2x: **340×80 px** (Navbar ~170×40), **240×80 px** (Footer ~120×40). |

- **Dosya:** `public/logo.png` veya `public/logo.svg`
- **Oran:** Mevcut kullanım yatay (genişlik > yükseklik). En fazla ~170px genişlikte gösteriliyor.
- **SVG kullanırsan:** Navbar/Footer’daki `<img src="/logo.png">` → `src="/logo.svg"` yap.

---

## Favicon

Tarayıcı sekmesi ve bookmark için:

| Dosya | Format | Boyut | Nereye |
|-------|--------|--------|--------|
| **favicon.ico** | ICO | 16×16, 32×32, 48×48 (tek .ico içinde) | `public/favicon.ico` |
| **icon.svg** | SVG | Serbest (tek renk/şeffaf) | `public/icon.svg` (opsiyonel, modern tarayıcılar) |
| **apple-touch-icon.png** | PNG | **180×180** | `public/apple-touch-icon.png` |

- **favicon.ico:** Eski tarayıcılar ve varsayılan “site ikonu”. Çoğu araç (Favicon.io, RealFaviconGenerator) 16+32+48 üretir.
- **Apple Touch Icon:** iOS “Add to Home Screen”. 180×180 PNG, yuvarlatılmış köşe eklemen gerekmez (sistem ekler).

---

## OG Image (Sosyal paylaşım)

- **Dosya:** `public/og.png`
- **Boyut:** **1200×630 px**
- **Format:** PNG veya JPG
- Paylaşımda (Facebook, Twitter, LinkedIn) bu görsel kullanılıyor.

---

## Özet – Hazırlayıp Koyacağın Dosyalar

1. **Logo:** `logo.svg` (tercih) veya `logo.png` (340×80 px 2x)
2. **Favicon:** `favicon.ico` (16+32+48), `public/` altına
3. **Apple:** `apple-touch-icon.png` (180×180), `public/` altına
4. **OG:** `og.png` (1200×630), `public/` altına (isteğe bağlı ama önerilir)

Bu dosyaları `public/` içine koyduğunda layout’taki mevcut metadata ile uyumlu çalışır.
