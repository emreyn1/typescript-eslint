# Oyun Projeleri — Fork Analizi & Roadmap

## Genel Bakış

| Oyun | Tür | En İyi Fork Tabanı | Zorluk |
|---|---|---|---|
| Wild Ones | 2D artillery, turn-based multiplayer | Phaser 3 + Colyseus | Orta |
| BomBom.io | Bomberman / bombalı arena | UniCT/Bomberman (Phaser + Socket.io) | Kolay |
| Lichess (Chess) | Satranç + WebRTC video | lila-docker | Zor |

---

## 1. Wild Ones Klonu

### Ne bu oyun?
Facebook'ta oynanan 2D top-down arena oyunu. Hayvan karakterler, sıra tabanlı topçu savaşı, silah geliştirme, skin sistemi.

### Hazır fork var mı?
**Orijinal oyunun server emülatörü:**
- `github.com/krutt/Wild-Ones` — 2011 client ile çalışan Node.js emülatörü
- `github.com/1driss/wo-heroes` — WO:PW (Wild Ones Private Wars) dosyaları
- **Problem:** Flash tabanlı, eski client gerekiyor. Modern browser'da çalışmıyor.

**Modern alternatif (sıfırdan daha iyi):**
[TOSIOS](https://github.com/halftheopposite/tosios) — TypeScript + Colyseus + PIXI.js ile yazılmış, production-ready multiplayer IO shooter.

### Önerilen Stack
```
Frontend:  Phaser 3 (TypeScript)     → sprite, fizik, animasyon
Backend:   Colyseus 0.15             → room yönetimi, state sync
Physics:   Matter.js (Phaser içinde) → mermi yörüngesi, patlama
Deploy:    Railway.app               → WebSocket desteği var
```

### Ne eklenir?
- Hayvan karakterler (free sprite pack: itch.io)
- Silah sistemi (bomba, füze, dinamit)
- Sıra sistemi (turn timer)
- Skin shop (Stripe veya coin sistemi)
- Lobby + özel oda
- Mobil touch kontrol

### Tahmini süre (fork + özelleştirme)
```
TOSIOS fork + temel Wild Ones mekanik: 3-4 hafta
Skin shop + coin sistemi:              1-2 hafta
Mobil uyum:                           1 hafta
```

---

## 2. BomBom.io Klonu

### Ne bu oyun?
Bomberman tarzı 2D arena oyunu — grid tabanlı hareket, bomba koyma, duvar yıkma, çok oyunculu rekabet. Bombom.io versiyonu 3D aerial bombing (uçak + şehir) da var.

### Hangisini yapalım?
**Seçenek A — Bomberman stili (2D, grid):** Daha kolay, daha klasik, daha geniş kitle.
**Seçenek B — Aerial bombing (3D):** Daha unique ama daha zor geliştirme.

**Öneri: Seçenek A** — Bomberman tarzı, web'de çok oynanan, monetize etmesi kolay.

### En İyi Fork: `UniCT-WebDevelopment/Bomberman`
```
github.com/UniCT-WebDevelopment/Bomberman
```
- Node.js + Express + Socket.io + Phaser
- Private room desteği
- Custom avatar
- In-game chat
- Docker ile deploy edilebilir
- MIT lisansı

### Alternatif: `DmytroVasin/bomber`
- Phaser.js + Socket.io
- 3 oyuncuya kadar
- Power-up sistemi (hız, bomba sayısı, patlama yarıçapı)
- Daha temiz kod tabanı

### Ne eklenir?
- Hesap sistemi (nickname + avatar seçimi)
- Leaderboard
- Skin shop
- Mobil joystick
- Reklamlı ücretsiz / reklamsız premium model

### Tahmini süre
```
Fork + Türkçe UI:                2-3 gün
Skin shop + hesap sistemi:       1 hafta
Mobil uyum + leaderboard:        1 hafta
Deploy + domain:                 1 gün
```

---

## 3. Lichess Fork (Chess + Görüntülü Konuşma)

### Mevcut durum
`chess-lichess-fork/` klasöründe:
- `SETUP.md` — klonlama + rebranding planı
- `webrtc-module/webrtc.ts` — WebRTC peer connection kodu
- `webrtc-module/useWebRTC.ts` — React hook (referans)
- `.env.example` — gerekli env değişkenleri

**Lichess'in kendisi (lila-docker) henüz klonlanmadı.** SETUP.md'de nasıl yapılacağı yazıyor.

### Lichess'i klonlamak için
```bash
git clone --recurse-submodules https://github.com/lichess-org/lila-docker.git
cd lila-docker
./lila-docker run   # ilk çalıştırma ~20 dakika sürer
```
**Gereksinim:** 12GB RAM, 20GB disk, Docker.

### WebRTC Entegrasyon Planı
Lichess WebSocket altyapısını signaling olarak kullan:

```
Kullanıcı A ↔ Lichess WS sunucusu ↔ Kullanıcı B
              (offer/answer taşır)
                      ↓
              WebRTC peer-to-peer
              (video/ses direkt)
```

**TURN sunucusu:** ExpressTurn.com — ücretsiz tier 500MB/ay, yeterli.

### Rebranding
- İsim, logo, renkler: `SETUP.md` §4'te detaylı
- AGPL-3.0 lisansı: kaynak kodu public yapmak zorunlu (veya satmak)

### Tahmini süre (klonlama → yayın)
```
lila-docker kurulumu + rebranding:  3-5 gün
WebRTC modülü Lichess'e entegrasyon: 1-2 hafta
TURN sunucusu + test:               2-3 gün
```

---

## Öncelik Sırası

```
1. BomBom (en kolay, en hızlı para — 2 haftada live)
2. Wild Ones (orta zorluk, yüksek retention — 1 ay)
3. Lichess + WebRTC (yüksek zorluk, güçlü diff — 1-2 ay)
```

---

## Ortak Altyapı

Üç oyun da aynı altyapıyı paylaşabilir:

```
Railway.app (WebSocket backend)
  ├── bombom-api    (Socket.io + Node.js)
  ├── wildones-api  (Colyseus)
  └── chess-api     (Lichess lila-ws)

Cloudflare
  ├── DNS + DDoS koruması
  └── Static asset CDN

PostgreSQL (Railway add-on)
  ├── Kullanıcı hesapları
  ├── Coin/skin sistemi
  └── Leaderboard
```

### Oyun sitesi için gelir modeli
```
Ücretsiz oyna            → Reklam (HilltopAds pop-under)
Skin satışı              → Coin paketi (Stripe/crypto)
Premium abonelik         → Reklamsız + özel skin + oda
Turnuva giriş ücreti     → Ödüllü turnuvalar
```
