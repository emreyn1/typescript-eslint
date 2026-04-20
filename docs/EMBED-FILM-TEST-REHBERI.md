# Embed-API + NyumatFlix Lokal Test Rehberi

> Kendi cihazinda 15 dakikada test. OPSEC sorun yok cunku **internete acilmiyor**, sadece localhost'ta calisir.

---

## OPSEC NOTU

```
LOKAL TEST = OPSEC SORUNU YOK
  → Sadece localhost (127.0.0.1) — disaridan erisilemez
  → IP, isim, kimlik kimseye gitmez
  → Reklam scriptleri yuklesen bile onlar SADECE senin tarayicinda calisir
  → Adsterra/ExoClick test'ten para SAYMAZ ama hata vermez

NE ZAMAN OPSEC ONEMLI:
  → Internete actigin an (Vercel, VPS, custom domain)
  → O zaman VM + VPN + residential proxy + anonim domain gerekli
```

---

## ON HAZIRLIK (5 dakika)

### 1. PostgreSQL kur (Mac)
```bash
brew install postgresql@16
brew services start postgresql@16
createdb streamvault
```

Veya zaten varsa:
```bash
psql -U postgres -c "CREATE DATABASE streamvault;"
```

### 2. TMDB API key al (ucretsiz)
- https://www.themoviedb.org/signup → kayit ol
- Settings → API → "Request API key" → Developer
- v3 auth API key kopyala (~10 saniyede gelir)

---

## EMBED-API CALISTIRMA (5 dakika)

### 1. .env dosyasi olustur
```bash
cd /Users/eceseckin/embed-analyzer/embed-api
cp .env.example .env
```

### 2. .env'yi duzenle
```env
PORT=3001
HOST=0.0.0.0

HMAC_SECRET=test_secret_change_me_later_1234567890abcdef
URL_TTL_SECONDS=7200

ALLOWED_ORIGINS=http://localhost:3000

EMBED_DOMAIN=localhost:3001
SITE_DOMAIN=localhost:3000

DATABASE_URL=postgresql://postgres@localhost:5432/streamvault

HLS_CACHE_PATH=/tmp/hls-cache

# Phase 2 — bos birak
TG_API_ID=
TG_API_HASH=
TG_SESSION=
TG_CHANNEL_ID=
TMDB_API_KEY=BURAYA_TMDB_KEY_KOY
TORRENT_PIPELINE_ENABLED=false
```

### 3. Calistir
```bash
npm install
npm run dev
```

Beklenen cikti:
```
Server listening on 0.0.0.0:3001
DB initialized
```

### 4. Test et
```bash
curl http://localhost:3001/health
```

---

## NYUMATFLIX CALISTIRMA (5 dakika)

### 1. .env dosyasi
```bash
cd /Users/eceseckin/embed-analyzer/NyumatFlix
cp .env.example .env.local
```

### 2. .env.local'i duzenle
```env
TMDB_API_KEY=BURAYA_TMDB_KEY_KOY

NEXT_PUBLIC_EMBED_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Reklam test icin — simdilik bos birak
NEXT_PUBLIC_AD_POP_ZONE=
NEXT_PUBLIC_AD_NATIVE_ZONE=

OPENAI_API_KEY=
```

### 3. Calistir
```bash
npm install
npm run dev
```

Tarayicida ac: **http://localhost:3000**

---

## REKLAM TEST (lokal)

### Adsterra hesap ac (ileride):
- adsterra.com → Publisher → Sign Up
- Email yeterli, telefon GEREKMEZ
- Site ekle → kategori sec → onay 24 saat
- Pop-under zone olustur → zone ID al

### Lokal test icin sahte zone:
```env
NEXT_PUBLIC_AD_POP_ZONE=12345678
NEXT_PUBLIC_AD_NATIVE_ZONE=87654321
```
Bu fake ID'ler — script yuklenir, hata vermez ama reklam gosterilmez. Gercek test icin Adsterra hesabi gerekli.

### Pop-under nasil eklenir (NyumatFlix'e):
`app/layout.tsx` veya `app/(home)/layout.tsx` icine ekle:
```tsx
{process.env.NEXT_PUBLIC_AD_POP_ZONE && (
  <Script
    src={`//www.profitabledisplaynetwork.com/${process.env.NEXT_PUBLIC_AD_POP_ZONE}/invoke.js`}
    strategy="afterInteractive"
  />
)}
```

---

## TEST AKISI

```
1. Tarayicida http://localhost:3000 ac
2. Anasayfada filmler gorunmeli (TMDB'den)
3. Bir filme tıkla → detay sayfasi
4. "Watch" / "Play" butonu → embed player acilir
5. Network tab'inda http://localhost:3001/embed/... istegi gormelisin
6. Console'da hata varsa → embed-api logs'a bak (terminalde calisiyordu)
```

---

## SORUN GIDERME

### "ECONNREFUSED localhost:5432"
PostgreSQL calismiyor:
```bash
brew services start postgresql@16
```

### "TMDB 401 Unauthorized"
TMDB key yanlis veya henuz aktif degil — hesap acildiktan 1-2 dk bekle.

### NyumatFlix beyaz ekran
Console'a bak. `NEXT_PUBLIC_EMBED_API_URL` dogru mu? Embed-api calisiyor mu?

### Embed player'da video gelmiyor
Dogal — Telegram pipeline + R2 daha bos. Sadece UI test ediyorsun. Gercek video icin Phase 2 (Telegram channel + Real-Debrid).

---

## SONRAKI ADIM (Phase 2 — gercek video)

```
1. Telegram API ID/Hash al → my.telegram.org
2. Telegram channel olustur (private), film yukle
3. embed-api → /providers → TG channel ID koy
4. Cloudflare R2 hesabi ac (HLS chunks burada saklanir)
5. Real-Debrid hesap (torrent → HLS donusumu icin)
6. Domain al (Njalla, XMR ile) → film sitesini deploy et
7. Adsterra/ExoClick hesap → reklam zone ID'leri ekle
```

---

## REKLAM PROVIDER LISTESI (en iyi)

```
1. Adsterra      → Pop-under, banner, native — KYC YOK, kripto odeme
2. HilltopAds    → Pop-under, in-page push — KYC YOK, kripto
3. ExoClick      → Pop-under, banner — adult dahil
4. PopAds        → Sadece pop-under — yuksek odeme
5. PropellerAds  → Multi-format — biraz daha sıki

ONERI: Adsterra ile basla (en kolay onay), PopAds ekle (yedek)
ODEMELER: USDT/BTC, $5 minimum withdraw, haftalik
```

---

## OZET KOMUT LISTESI

```bash
brew services start postgresql@16
createdb streamvault

cd embed-api
cp .env.example .env
# .env'yi duzenle (TMDB key + HMAC secret koy)
npm install && npm run dev

# YENI TERMINAL
cd NyumatFlix
cp .env.example .env.local
# .env.local'i duzenle (TMDB key koy)
npm install && npm run dev

# Tarayici: http://localhost:3000
```

Hepsi bu. 15 dakikada test ortamin hazir.
