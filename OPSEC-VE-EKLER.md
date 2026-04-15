# OPSEC, Telegram & Phase 2 Rehberi

Bu dosya Telegram hesabını güvenli açmayı, Phase 2 (embed + film) yol haritasını ve projelere eklenecek şeyleri kapsar.
Temel OPSEC kuralları → `korunma.md` dosyasında. Bu dosya onun üstüne ek pratik bilgilerdir.

---

## 1. Telegram Hesabı OPSEC ile Nasıl Açılır

Her iş birimi için **ayrı Telegram hesabı** gerekir.

### Adım adım

| # | Adım | Detay |
|---|------|-------|
| 1 | **Numara al** | smscode.gg veya smspool.net'ten Telegram aktivasyonu için tek seferlik numara. Ülke: UK, NL veya PL seç (ABD numaraları Telegram'da sık ban yer). ~$0.50 |
| 2 | **VPN aç** | Mullvad VPN → Romania veya Estonia server. Kill switch AÇIK. |
| 3 | **Telegram Desktop indir** | telegram.org'dan. Android emülatör (Bluestacks vb.) kullanma — fingerprint riski. |
| 4 | **Kayıt ol** | Numara gir → SMS kodu gelir (smscode/smspool'dan oku) → Kayıt. Sahte isim + sahte profil fotoğrafı kullan. |
| 5 | **2FA aç** | Settings → Privacy → Two-Step Verification → Güçlü şifre koy. Bu kritik — numarayı kaybetsen bile hesap senindir. |
| 6 | **Username ata** | Her iş birimi için net username: `@getsmsnow_support`, `@privacycards_io`, `@streamvault_films` |
| 7 | **Profili tamamla** | Bio: sitenin URL'si + kısa açıklama. Profil fotoğrafı: Canva ile anonim logo. |
| 8 | **Cloud password (2FA recovery email)** | OPSEC email (tuta.com/proton.me) ile recovery ekle — ama dikkat: Telegram bunu doğrulama amaçlı bile olsa gösterir. |

### İş birimi → Telegram eşlemesi

```
getsmsnow.com  → @GetSMSNow_bot / @getsmsnow_channel
                  Numara: smscode.gg'den UK numarası
                  VPN: Mullvad Romania

kart-site      → @PrivacyCards_bot / @privacycards_channel
                  Numara: smscode.gg'den NL numarası
                  VPN: Mullvad Estonia

NyumatFlix     → @StreamVault_bot / @streamvault_channel
(Phase 2)        Numara: smscode.gg'den PL numarası
                  VPN: Mullvad Romania

Oyunlar        → @ArcadeVault_bot / @arcadevault_channel
                  Numara: smscode.gg'den UK numarası
                  VPN: Mullvad Estonia
```

### Kanal oluşturma

```
1. Hesaba gir (VPN açık)
2. ☰ → New Channel → İsim + açıklama gir
3. Public channel → link at (ör. t.me/getsmsnow_channel)
4. İlk mesajı at: "Welcome! 🔒 ..." + site linki
5. Kanal açıklamasına site URL'si + destek botu ekle
```

### Bot oluşturma (@BotFather)

```
1. @BotFather'a yaz: /newbot
2. Bot adı: GetSMSNow Support
3. Username: GetSMSNow_support_bot
4. Token'ı al → .env dosyasına koy
5. /setdomain → sitenin URL'sini ekle (Telegram Login Widget için)
6. /setcommands → start - Start, help - Help, order - Order SMS
```

### Dikkat edilecekler

- **ASLA** aynı cihazda 2 farklı iş biriminin Telegram hesabını açma
- **ASLA** kişisel Telegram hesabınla iş hesabı arasında mesaj atma
- Her hesap farklı VPN server kullanmalı
- Numara kaybolursa 2FA şifresiyle giriş yapabilirsin
- Telegram desktop'ta proxy de ayarlanabilir: Settings → Advanced → Proxy → SOCKS5

---

## 2. Phase 2 — Embed + Film Sitesi Yol Haritası

Phase 1 (SMS + Kart) canlıya alındıktan sonra:

### Phase 2a: Embed API Content Pipeline

| Adım | Ne yapılır | Gerekli |
|------|-----------|---------|
| 1 | Telegram API key al | [my.telegram.org](https://my.telegram.org) → API Development → api_id + api_hash |
| 2 | İçerik depolama kanalı oluştur | Private kanal, bot admin yap |
| 3 | MTProto session oluştur | `telegram-bot/` içindeki Telethon/gramJS ile |
| 4 | R2 bucket oluştur | [dash.cloudflare.com](https://dash.cloudflare.com) → R2 → Create Bucket |
| 5 | R2 API key al | R2 → Manage R2 API Tokens |
| 6 | R2 public URL ayarla | R2 → Bucket → Settings → Custom Domain |
| 7 | Real-Debrid hesap aç | [real-debrid.com](https://real-debrid.com) → €3/ay → API token al |
| 8 | TMDB API key al | [themoviedb.org](https://www.themoviedb.org/settings/api) → Ücretsiz |
| 9 | `.env` dosyasına ekle | `embed-api/.env` → Phase 2 bölümünü doldur |
| 10 | `TORRENT_PIPELINE_ENABLED=true` yap | Pipeline aktif olur |

### Phase 2b: Film Sitesi Canlıya Alma

| Adım | Ne yapılır |
|------|-----------|
| 1 | TMDB API key al (ücretsiz) |
| 2 | `NyumatFlix/.env.local` doldur |
| 3 | Embed API URL'sini ayarla |
| 4 | Reklam zone'larını ayarla (Adsterra/HilltopAds) |
| 5 | İsteğe bağlı: OpenAI API key ekle (AI chatbot) |
| 6 | Domain + Nginx + SSL |
| 7 | `docker compose up site embed db -d` |

### Reklam Sağlayıcıları (OPSEC uyumlu)

| Sağlayıcı | KYC | Ödeme | Neden |
|-----------|-----|-------|-------|
| **AADS** | SIFIR KYC | BTC direkt | En anonim, CPM düşük ama ban yok |
| **Adsterra** | Minimal (site URL, email) | BTC, USDT, WebMoney | İyi CPM, pop-under + native, OPSEC email ile kayıt olabilir |
| **HilltopAds** | Minimal | BTC, Capitalist | Pop-under uzmanı, film siteleri için ideal |
| **TrafficStars** | Email | BTC, wire | Premium traffic, CPM yüksek |

---

## 3. Projelere Eklenecekler (Değer Katanlar)

### Kısa vadede (lansmandan sonra 1-2 hafta)

| Proje | Ne eklenir | Etki |
|-------|-----------|------|
| **getsmsnow.com** | Canlı destek widget (Tawk.to — ücretsiz) | Güven ↑, dönüşüm ↑ |
| **getsmsnow.com** | Sipariş geçmişi sayfası | Tekrar alım ↑ |
| **kart-site** | FAQ sayfası (SSS) | SEO + destek yükü ↓ |
| **kart-site** | Kart bakiye kontrolü sayfası | Kullanıcı deneyimi ↑ |
| **Tüm siteler** | Cloudflare Analytics (ücretsiz, cookie-free) | Ölçüm, anonim |
| **Tüm siteler** | Status page (upptime.js veya Betteruptime free) | Güven ↑ |

### Orta vadede (1-2 ay)

| Proje | Ne eklenir | Etki |
|-------|-----------|------|
| **getsmsnow.com** | Toplu sipariş (bulk SMS) | Enterprise müşteri |
| **getsmsnow.com** | API erişimi (reseller) | B2B gelir |
| **kart-site** | Kart kullanan ülkelerin listesi | SEO + bilgilendirme |
| **kart-site** | Otomatik kart yenileme | Retention ↑ |
| **NyumatFlix** | Watchlist / favoriler | Engagement ↑ |
| **NyumatFlix** | "Benzer filmler" önerisi | Time on site ↑ |
| **Oyunlar** | Turnuva sistemi + ödül | DAU ↑ |
| **Oyunlar** | Chat sistemi (Socket.io) | Community ↑ |

### Uzun vadede (3+ ay)

| Proje | Ne eklenir | Etki |
|-------|-----------|------|
| **Tüm siteler** | Affiliate dashboard iyileştirme | Organik büyüme |
| **getsmsnow.com** | eSIM satışı | Yeni gelir kanalı |
| **kart-site** | Çoklu kart yönetimi | Premium kullanıcı |
| **NyumatFlix** | Watch party (birlikte izleme) | Viral potansiyel |

---

## 4. Sosyal Medya Hesapları

### Reddit

| # | Adım |
|---|------|
| 1 | VPN (Mullvad) + Residential Proxy (Servury/NorthProxy) |
| 2 | Yeni hesap: rastgele isim (ör. `DigitalPrivacyFan_42`) |
| 3 | Proton Mail veya Tuta email ile kayıt |
| 4 | İlk 1 hafta: karma kas (yorumlar, upvote). Reklam YAPMA. |
| 5 | 2. haftadan sonra: ilgili subreddit'lerde organik paylaşım |
| 6 | Subreddit hedefleri: r/privacy, r/cryptocurrency, r/piracy, r/cordcutters |

### X (Twitter)

| # | Adım |
|---|------|
| 1 | Residential Proxy ile hesap aç (VPN IP = anında ban) |
| 2 | SMSCode'dan doğrulama numarası al |
| 3 | Canva ile profil fotoğrafı + banner yap (metadata temizle: `exiftool -all= foto.jpg`) |
| 4 | İlk hafta: follow, like, retweet. Direkt reklam YAPMA. |
| 5 | İçerikler: `CONTENT-CALENDAR.md` ve `content_templates.json`'dan |

### Instagram / TikTok

| # | Adım |
|---|------|
| 1 | Residential Proxy + Android emülatör VEYA fiziksel telefon (en güvenli) |
| 2 | Yeni hesap, OPSEC email |
| 3 | Film sitesi için: film klipleri + AI voiceover (ElevenLabs free tier) |
| 4 | SMS sitesi için: "How to protect privacy" kısa videolar |
| 5 | Metadata temizleme: `ffmpeg -i video.mp4 -map_metadata -1 -c copy clean.mp4` |

### Metadata Temizleme (HER paylaşımdan önce)

```bash
# Fotoğraflar:
exiftool -all= -overwrite_original *.jpg *.png

# Videolar:
ffmpeg -i input.mp4 -map_metadata -1 -c:v copy -c:a copy output.mp4

# PDF'ler:
exiftool -all= document.pdf
```

---

## 5. Telegram Bot Otomasyonu

Mevcut `telegram-bot/` dizininde:

| Dosya | Ne yapar |
|-------|---------|
| `bot.py` | TMDB film öneri botu + günlük kanal postu |
| `auto_post.py` | 4 marka multi-kanal otomatik paylaşım |
| `content_templates.json` | Reddit/X/Telegram içerik şablonları |

### Başlatma

```bash
cd telegram-bot
pip install -r requirements.txt  # veya: pip install python-telegram-bot requests

# .env dosyasını doldur:
cp .env.example .env
# BOT_TOKEN, TMDB_API_KEY, CHANNEL_* değerlerini gir

# Bot'u çalıştır:
python bot.py

# Auto-poster'ı cron ile zamanla:
crontab -e
# Her gün 10:00'da çalıştır:
0 10 * * * cd /path/to/telegram-bot && python auto_post.py >> /var/log/autopost.log 2>&1
```

---

## 6. Güvenlik Özeti — Hızlı Kontrol

- [ ] Her iş birimi için ayrı email (tuta.com / proton.me)
- [ ] Her iş birimi için ayrı Telegram hesabı (farklı numara)
- [ ] VPN her zaman açık (Mullvad, kill switch ON)
- [ ] Sosyal medya = residential proxy (datacenter IP ban yer)
- [ ] Domain = Njalla veya Cloudflare (whois gizli)
- [ ] VPS = FlokiNET veya 1984.is (crypto ile ödeme)
- [ ] Tüm görsellerin metadata'sı temizlendi (exiftool)
- [ ] Tüm videoların metadata'sı temizlendi (ffmpeg)
- [ ] Browser fingerprint izolasyonu (VM veya ayrı profil)
- [ ] .env dosyaları git'e eklenmedi (.gitignore'da)
- [ ] Gerçek kimlikle iş kimliği arasında SIFIR bağlantı
