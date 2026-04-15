# Yapmak Istediklerim 
wolfteam
albion online

Senolytics

Anti-necrotic

Kök hücre yenileme ve gen tedavisi

porno sitesi ifsa nisinde

casinp sitesi gercek manada 

yada biraz belki cp 

veya tor sitesi



cok fazla guzelcik seyler var bu hayatimda cok fazla kez zamanimi calan bu kahpece seyler



# Ne Yapıldı — Özet (Kafa Rahat)

Bu dosya repodaki ana işleri tek yerde toplar. Detay için ilgili klasör ve `.md` dosyalarına bak.

---

## Embed & film sitesi

| Ne | Durum |
|----|--------|
| **embed-api** | Fastify: embed route'lar, HLS cache, Telegram → remux, torrent (YTS/EZTV + Real-Debrid), R2, server-side bumper reklam, DB, referral/coin API, `/api/v1/referral/stats`, `/api/v1/referral/link` |
| **NyumatFlix** | Tam Next.js 15: TMDB, film/dizi/arama sayfaları, embed-api iframe player, referral dashboard, VIP, AI chatbot, reklam slotları |
| **Upstream iframe** | embed-api başka embed iframe'i döndürmüyor; içerik yoksa "unavailable" |

---

## Diğer iş birimleri

| Proje | Durum |
|-------|-------|
| **getsmsnow.com** | Tam Next.js 15: SMSCode API, sipariş/polling, referral sistemi, landing/order/dashboard |
| **kart-site** | No-KYC kart (Wanttopay + NOWPayments), referral API + SQL migration |
| **chess-lichess-fork** | Lichess fork planı, WebRTC modülü, signaling-server + client-patch |

---

## Oyunlar

| Oyun | Port | Not |
|------|------|-----|
| **bombom** | 3010 | Bomberman multiplayer (Socket.io + canvas) |
| **wildones** | 3011 | Topçu arena (Socket.io + canvas) |
| **chess-signal** | 3012 | Lichess WebRTC signaling |

---

## Affiliate / Referral

| Proje | Frontend | Backend API | DB |
|-------|----------|-------------|----|
| NyumatFlix | `/referral` | `/api/referral` → embed-api proxy | embed-api DB |
| embed-api | — | `/api/v1/referral/stats`, `link`, coins, heartbeat | PostgreSQL |
| kart-site | `/referral` | `/api/referral/stats` | Supabase |
| getsmsnow.com | — | `/api/referral` | Supabase |

---

## Sosyal Medya Otomasyon

| Bileşen | Durum |
|---------|-------|
| **telegram-bot/bot.py** | Film öneri botu + günlük kanal postu |
| **telegram-bot/auto_post.py** | 4 marka multi-kanal otomatik paylaşımcı + haftalık takvim |
| **content_templates.json** | Reddit/X/Telegram içerik şablonları |
| **CONTENT-CALENDAR.md** | 30 günlük TikTok/Reddit/X/Telegram içerikleri |
| **marketing-plan.md** | Viral marketing stratejisi + template'ler |
| **AUTO-MARKETING.md** | Freelancer + otomasyon mimarisi |
| **GROWTH-PLAN.md** | Lansman kontrol listesi |

---

## AI Chatbot

| Proje | Bileşen | Detay |
|-------|---------|-------|
| NyumatFlix | `/api/recommend` | TMDB + opsiyonel OpenAI film öneri |
| NyumatFlix | `ChatWidget` | Sağ alt köşe chat, film arama + öneri |

---

## Dokümanlar

- `ANALYSIS.md`, `option9.md`, `spesifik.md`, `reklam.md`, `kart.md`, `5-isanaliz.md`
- `adim.md`, `anlatim.md`, `deploy-rehber.md`, `ajans.md`, `oyunlar.md`
- `korunma.md`, `marketing-plan.md`, `CONTENT-CALENDAR.md`, `AUTO-MARKETING.md`, `GROWTH-PLAN.md`

---

## Altyapı

**docker-compose.yml** (8 servis):
`site` (:3000), `embed` (:3001), `kart` (:3002), `sms` (:3003), `bombom` (:3010), `wildones` (:3011), `chess-signal` (:3012), `db` (PostgreSQL 16)

**Docker test sonucu:** Tüm 8 servis `docker compose build` + `docker compose up -d` ile başarılı. HTTP 200 doğrulandı (chess-signal hariç — WebSocket sunucusu, root path yok). `.dockerignore` dosyaları eklendi.

---

*Son güncelleme: Tüm 4 iş birimi + 3 oyun + DB birlikte build edildi, Docker'da test edildi, çalışıyor.*
