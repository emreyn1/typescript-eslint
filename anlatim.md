# embed-api Deploy & Film Sitesine Bağlama — Adım Adım

## Önce: Nasıl Çalışıyor?

```
Kullanıcı poster'a tıklar
        ↓
embed-api'ye istek gelir
        ↓
1. HLS cache'de var mı?        → kendi player'ı açar ✓
2. Telegram'da kayıtlı mı?    → indir + remux + cache ✓
3. TORRENT_PIPELINE_ENABLED?  → YTS/EZTV → Real-Debrid → remux ✓
4. Bulunamadı                  → "Content Unavailable" sayfası
```

> **embed-api hiçbir zaman başka embed sağlayıcının iframe'ini döndürmez.**
> Kendi içeriğini üretir veya "bulunamadı" der.
>
> NyumatFlix (film izleme sitesi) Phase 1 olarak kalmaya devam edebilir — 
> VidSrc/2Embed iframe'lerini embed-api'ye gerek kalmadan direkt kullanır.

Reklam değişkenleri boş bırakılırsa **hiç reklam çıkmaz**.

---

## Torrent Pipeline Kurulumu (Opsiyonel ama Önerilir)

Minimum gereksinim: sadece `TMDB_API_KEY` + `TORRENT_PIPELINE_ENABLED=true`

```env
TMDB_API_KEY=xxxxx          # themoviedb.org → ücretsiz
TORRENT_PIPELINE_ENABLED=true
REAL_DEBRID_API_KEY=        # opsiyonel, €3/ay — hızı 10x artırır
```

**TMDB_API_KEY olmadan** torrent pipeline açılamaz (IMDB ID çevirisi için gerekli).  
**Real-Debrid olmadan** sadece magnet bulunur, ffmpeg ile remux yapılamaz.  
**Her ikisi varsa** → YTS/EZTV → magnet → Real-Debrid HTTP → ffmpeg → HLS → R2.

---

## Seçenek A — Lokal Test (En Hızlı, 5 Dakika)

### 1. embed-api'yi başlat

```bash
cd embed-api
cp .env.example .env
```

`.env` dosyasında şunu değiştir:
```
HMAC_SECRET=herhangi-bir-uzun-rastgele-yazi-buraya
ALLOWED_ORIGINS=http://localhost:3000
```
Database, Telegram, R2 gibi şeylere **dokunma** — boş kalabilir, Phase 1 çalışır.

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:3001` açılıyorsa embed-api hazır.
Test: `http://localhost:3001/embed/movie/550` → Fight Club player açılmalı.

### 2. NyumatFlix'i başlat

```bash
cd NyumatFlix
cp .env.example .env.local
```

`.env.local`'da minimum doldurulması gerekenler:
```
TMDB_API_KEY=tmdb_den_aldığın_key         # themoviedb.org/settings/api (ücretsiz)
AUTH_SECRET=herhangi-bir-uzun-yazi         # openssl rand -hex 32
AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://...               # lokal postgres şartsız: aşağıya bak
AUTH_RESEND_KEY=re_xxx                    # resend.com (ücretsiz 3000/ay)
NEXT_PUBLIC_EMBED_API_URL=http://localhost:3001
```

**Database olmadan test etmek istiyorsan:** NyumatFlix'in izleme sayfası auth gerektirmez.
Sadece `DATABASE_URL` ve `PROD_DATABASE_URL`'u aynı şeye yaz:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/streamvault
PROD_DATABASE_URL=postgres://postgres:postgres@localhost:5432/streamvault
```
ve Docker ile Postgres aç:
```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=streamvault postgres:16-alpine
```

```bash
npm install
npx drizzle-kit push    # tabloları oluştur
npm run dev
```

`http://localhost:3000` → film sitesi açılır, player embed-api'yi kullanır.

---

## Seçenek B — Railway Deploy (Kalıcı Canlı Test)

### 1. railway.app'e giriş yap
- GitHub ile giriş yap
- Proje oluştur → "Deploy from GitHub repo"

### 2. embed-api için Railway servisi aç

**GitHub'a push et:**
```bash
cd embed-api
git init
git add .
git commit -m "embed-api initial"
git remote add origin https://github.com/KULLANICI_ADI/embed-api.git
git push -u origin main
```

Railway'de:
- "New Service" → "GitHub Repo" → `embed-api` seç
- Railway Dockerfile'ı otomatik algılar
- "Add PostgreSQL" → aynı projeye Postgres eklentisi ekle

### 3. Environment variables ekle

Railway dashboard → Variables:
```
PORT=3001
HMAC_SECRET=openssl rand -hex 32 ile üret
ALLOWED_ORIGINS=https://NyumatFlix-deploylanan-domain.vercel.app
DATABASE_URL=${{Postgres.DATABASE_URL}}    # Railway otomatik doldurur
AD_BUMPER_ENABLED=false
```

Telegram, R2, Turnstile → **boş bırak**, Phase 1 çalışır.

### 4. Deploy et

Railway "Deploy" butonuna bas. 2-3 dakikada build + start olur.
Railway sana bir URL verir: `https://embed-api-xxx.railway.app`

Test: `https://embed-api-xxx.railway.app/embed/movie/550` → player görünmeli.

### 5. NyumatFlix'i Vercel'e deploy et

```bash
cd NyumatFlix
# Vercel CLI ile:
npx vercel

# Ya da vercel.com → "New Project" → GitHub repo seç
```

Vercel'de Environment Variables:
```
TMDB_API_KEY=...
AUTH_SECRET=...
AUTH_URL=https://senin-film-siten.vercel.app
DATABASE_URL=Railway'deki Postgres URL'i
PROD_DATABASE_URL=Railway'deki Postgres URL'i
AUTH_RESEND_KEY=...
NEXT_PUBLIC_EMBED_API_URL=https://embed-api-xxx.railway.app
NEXT_PUBLIC_SITE_NAME=İstediğin İsim
```

Deploy → `https://senin-film-siten.vercel.app` → filme tıkla → player açılır.

---

## Özet: Minimum Gereksinimler

| Şey | Gerekli mi? | Nereden? |
|-----|-------------|----------|
| TMDB API Key | ✅ Evet | themoviedb.org (ücretsiz) |
| AUTH_SECRET | ✅ Evet | `openssl rand -hex 32` |
| HMAC_SECRET | ✅ Evet | `openssl rand -hex 32` |
| AUTH_RESEND_KEY | ✅ Evet (login için) | resend.com (ücretsiz) |
| PostgreSQL | ✅ Evet | Railway eklentisi veya lokal Docker |
| Telegram | ❌ Hayır | Phase 2'de gerekir |
| Cloudflare R2 | ❌ Hayır | Phase 2'de gerekir |
| Reklam ID'leri | ❌ Hayır | Boş bırak |
| Turnstile | ❌ Hayır | Boş bırak |

---

## Sorun Giderme

**embed-api açılmıyor:**
→ `npm run dev` çıktısında hata mesajına bak
→ Çoğu zaman `DATABASE_URL` bağlanamıyor; PostgreSQL çalışıyor mu?

**Film player açılmıyor:**
→ `http://localhost:3001/embed/movie/550` direkt aç
→ Açılıyorsa sorun NyumatFlix'in embed-api'ye ulaşamaması (CORS)
→ embed-api `.env`'de `ALLOWED_ORIGINS=http://localhost:3000` var mı?

**"Invalid Request" player'da çıkıyor:**
→ embed-api'nin eski bir build'i yüklenmiş olabilir
→ `npm run dev`'i yeniden başlat

**Vercel'de "DATABASE_URL missing":**
→ Vercel dashboard → Settings → Environment Variables → kontrol et
→ `PROD_DATABASE_URL` da doldurulmuş olmalı (aynı değer)
