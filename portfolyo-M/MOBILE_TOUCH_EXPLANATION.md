# 📱 Mobil Dokunma Düzenlemesi - Detaylı Açıklama

## 🎯 Problem
Mobil cihazlarda `onMouseEnter` ve `onMouseLeave` event'leri çalışmaz çünkü:
- Mobil cihazlarda "hover" kavramı yoktur
- Touch event'leri farklı çalışır
- Kullanıcı dokunarak etkileşim kurar

## ✅ Çözüm: Hybrid Yaklaşım

### 1. **Mobil Algılama (Device Detection)**
```typescript
const [isMobile, setIsMobile] = React.useState(false);

React.useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 1024); // lg breakpoint
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

**Ne yapıyor?**
- Ekran genişliğini kontrol eder
- 1024px altı = mobil/tablet
- Resize event'ini dinler (ekran döndürme vs.)

### 2. **Toggle Fonksiyonu (Aç/Kapa)**
```typescript
const handleToggle = () => {
  if (isMobile) {
    setHovered(!hovered); // Mevcut durumun tersini yap
  }
};
```

**Ne yapıyor?**
- Mobilde: Kartı aç/kapa (toggle)
- Desktop'ta: Çalışmaz (hover kullanılır)

### 3. **Event Handler'ları Birleştirme**
```typescript
<div
  // Desktop için hover
  onMouseEnter={() => !isMobile && setHovered(true)}
  onMouseLeave={() => !isMobile && setHovered(false)}
  
  // Mobil için click
  onClick={handleToggle}
  
  // Mobil için touch (daha hızlı tepki)
  onTouchStart={handleToggle}
  
  className="... cursor-pointer touch-manipulation"
>
```

**Event'lerin Açıklaması:**

| Event | Ne Zaman Çalışır | Ne Yapar |
|-------|------------------|----------|
| `onMouseEnter` | Desktop'ta mouse üzerine gelince | Kartı açar |
| `onMouseLeave` | Desktop'ta mouse ayrılınca | Kartı kapatır |
| `onClick` | Mobilde dokununca | Kartı açar/kapatır (toggle) |
| `onTouchStart` | Mobilde dokunma başlayınca | Daha hızlı tepki verir |

### 4. **CSS İyileştirmeleri**
```css
cursor-pointer        /* Tıklanabilir olduğunu gösterir */
touch-manipulation   /* Mobilde daha iyi dokunma tepkisi */
```

## 🔄 Çalışma Mantığı

### Desktop (≥1024px):
```
Mouse üzerine gel → Kart açılır
Mouse ayrılır → Kart kapanır
```

### Mobil (<1024px):
```
Dokun → Kart açılır (eğer kapalıysa)
Tekrar dokun → Kart kapanır (eğer açıksa)
```

## 💡 Önemli Noktalar

### 1. **Conditional Logic**
```typescript
onMouseEnter={() => !isMobile && setHovered(true)}
```
- `!isMobile` kontrolü: Sadece desktop'ta çalışır
- Mobilde hover event'leri tetiklenmez

### 2. **State Management**
```typescript
const [hovered, setHovered] = React.useState(false);
```
- Tek bir state hem hover hem click için kullanılır
- Kod tekrarı önlenir

### 3. **Performance**
```typescript
useEffect(() => {
  // Sadece mount ve resize'da çalışır
  // Her render'da çalışmaz
}, []);
```

## 🎨 Alternatif Yaklaşımlar

### Yaklaşım 1: Media Query Hook
```typescript
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
};

const isMobile = useMediaQuery('(max-width: 1023px)');
```

### Yaklaşım 2: CSS-Only (Pointer Media Query)
```css
@media (hover: hover) {
  /* Sadece hover destekleyen cihazlarda */
  .card:hover { ... }
}

@media (hover: none) {
  /* Touch cihazlarda */
  .card:active { ... }
}
```

## 🚀 Best Practices

1. **Her zaman her iki event'i de ekle**
   - `onClick` + `onTouchStart` (mobil)
   - `onMouseEnter` + `onMouseLeave` (desktop)

2. **Conditional rendering kullan**
   - Mobilde farklı UI gösterebilirsin

3. **Touch delay'i önle**
   - `touch-manipulation` CSS property'si
   - `onTouchStart` kullan (onClick'ten daha hızlı)

4. **Accessibility**
   - `role="button"` ekle
   - `aria-expanded` kullan
   - Keyboard navigation ekle

## 📚 Öğrenme Kaynakları

- [MDN: Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [MDN: Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [CSS: touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)

