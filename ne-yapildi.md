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



> Nor Tack:
bitane akilliya bana yaptirdiklarini yaotir o zaman akillanirim

> Nor Tack:
Gcash ve comera pay ai b2b saas

> Nor Tack:
Bu drone seyisi bu elektrikle sarj olan drone ve bu internet sifrelerini bulan seyisi ve bu tekerlegin sensorunun sifrelenmemesi gibi seylerin o aracin konumunj soylemesi gibi ve bu deniz alti seyaaisiisi

Ek olarak bu portfolyo ve ajans sitemde yaptigim siteler hakkinda saglam yalan atmali mesela kocta calisti gibisinden veya ulusal bir calisma gibisinden










cok fazla guzelcik seyler var bu hayatimda cok fazla kez zamanimi calan bu kahpece seyler



# Ne Yapıldı — Özet (Kafa Rahat)

Bu dosya repodaki ana işleri tek yerde toplar. Detay için ilgili klasör ve `.md` dosyalarına bak.

---

## Embed & film sitesi

| Ne | Durum |
|----|--------|
| **embed-api** | Fastify: embed route’lar, HLS cache, Telegram → remux, opsiyonel torrent (YTS/EZTV + Real-Debrid), R2, server-side bumper reklam, DB, referral/coin API |
| **NyumatFlix** | Film/dizi sitesi: reklam slotları, referral/VIP sayfaları, env düzenlemeleri |
| **Upstream iframe** | embed-api artık başka embed sağlayıcı iframe’i döndürmüyor; içerik yoksa “unavailable” sayfası |

---

## Diğer iş birimleri

| Proje | Ne |
|-------|-----|
| **getsmsnow.com** | SMSCode API’ye geçiş, route/migration isimleri |
| **kart-site** | No-KYC kart akışı iskeleti (Wanttopay + NOWPayments) |
| **chess-lichess-fork** | Lichess fork planı (`SETUP.md`), WebRTC modülü, **signaling-server** + `client-patch/video-chat.ts` |

---

## Oyunlar (yeni)

| Oyun | Port | Not |
|------|------|-----|
| **bombom** | 3010 | Bomberman tarzı multiplayer (Socket.io + canvas) |
| **wildones** | 3011 | Topçu / sıra tabanlı arena (Socket.io + canvas) |
| **chess-signal** | 3012 | Lichess için WebRTC signaling (Docker Compose’ta `chess-signal`) |

---

## Dokümanlar (referans)

- `ANALYSIS.md`, `option9.md`, `spesifik.md`, `reklam.md`, `kart.md`, `5-isanaliz.md`
- `adim.md`, `anlatim.md`, `deploy-rehber.md`, `ajans.md`, `oyunlar.md`

---

## Altyapı

- **docker-compose.yml**: `site`, `embed`, `kart`, `db` + `bombom`, `wildones`, `chess-signal`

---

*Son güncelleme: bu oturumda oyunlar ve chess signaling eklendi; embed-api torrent pipeline ve iframe kaldırma önceki oturumlarda yapılmıştı.*
