# OPSEC Korunma Rehberi — Pratik & Spesifik

4 iş birimi (Film/Embed, Kart, SMS, Oyunlar) için araç bazlı, adım adım korunma planı.

---

## 1. Katmanlı Kimlik Yapısı

**Kural: Gerçek kimlik ile iş kimliği arasında SIFIR bağlantı.**

### E-mail oluşturma

| Adım | Ne yapılır | Araç |
|------|-----------|------|
| 1 | Mullvad VPN aç (Estonia veya Romania server) | Mullvad |
| 2 | Tor Browser aç (VPN üzerinden) | Tor Browser |
| 3 | tuta.com veya proton.me'ye git | - |
| 4 | Kayıt ol: sahte isim, sahte doğum tarihi | - |
| 5 | Telefon doğrulaması isterse → SMSCode ile tek seferlik numara al | smscode.gg |
| 6 | Bu email'i SADECE bu iş için kullan, kişisel hiçbir yerde kullanma | - |

Her iş birimi için **ayrı email**:
```
filmsite-ops@tuta.com       → NyumatFlix + embed-api
kartservis-ops@tuta.com     → kart-site
smsservis-ops@proton.me     → getsmsnow.com
oyunlar-ops@tuta.com        → bombom + wildones
```

### Google hesabı sorunu

Google 2026'da hesap açarken **telefon numarası** istiyor, VPN IP'lerini tanıyıp kilitliyor, ve bazen **telefon üzerinden (cihazda) doğrulama** zorunlu kılıyor. Tam çözüm:

#### Temel kural: Google'ı mümkün olduğunca KULLANMA

| Durum | Yapılacak |
|-------|----------|
| Google Ads | **KULLANMA.** KYC istiyor, ban atıyor, veri paylaşıyor. |
| Google Analytics | **KULLANMA.** Cloudflare Analytics (ücretsiz, anonim) veya Plausible (self-hosted) kullan. |
| Gmail gerekliyse | Aşağıdaki prosedürü uygula |
| YouTube kanalı gerekiyorsa | Aşağıdaki prosedürü uygula |
| Google OAuth (getsmsnow.com login) | Opsiyonel -- kullanıcılar kendi Google hesaplarıyla giriyor, senin OPSEC'ini etkilemez |

#### Google hesap açma prosedürü (OPSEC uyumlu)

**Gerekli malzemeler:**
- Residential proxy (Servury, NorthProxy veya OrionProxies) -- VPN ile AÇMA
- Temiz browser profili (Firefox ayrı profil veya Mullvad Browser)
- SMS doğrulama için tek seferlik numara (getsmsnow.com veya smscode.gg)

**Adım adım:**

| # | Adım | Detay |
|---|------|-------|
| 1 | **Residential proxy aç** | Servury/NorthProxy'den ABD veya UK residential IP al. Google VPN/datacenter IP'lerini hemen tanıyor. |
| 2 | **Temiz browser profili** | Firefox → `about:profiles` → "Create a New Profile". Eklenti: uBlock Origin. WebRTC leak'i kapat (`media.peerconnection.enabled` = false). |
| 3 | **Google hesap oluştur** | accounts.google.com → "Create account" → Sahte isim, sahte doğum tarihi |
| 4 | **Telefon doğrulama** | Google numara isteyecek → smscode.gg veya smspool.net'ten ABD/UK numara al → SMS kodunu oku → Doğrula |
| 5 | **"Telefonda doğrula" ekranı çıkarsa** | Bu Google'ın "cihaz üzerinde doğrulama" zorlaması. Çözümler: |
| | | **Çözüm A:** Android emülatör (Genymotion/BlueStacks) + residential proxy ile Google Play'e gir → Hesabı orada doğrula |
| | | **Çözüm B:** Ucuz ikinci el Android telefon al (nakit, KYC'siz) → Prepaid SIM tak (no-KYC) → Hesabı telefonda aç → Doğruladıktan sonra telefonu kapat |
| | | **Çözüm C:** Farklı zamanda farklı IP ile tekrar dene -- bazen telefon doğrulaması atlanıyor |
| 6 | **Hesabı koru** | 2FA aç (TOTP app, Aegis Authenticator -- Google Authenticator değil). Recovery email olarak tuta.com adresini ver. Recovery telefon KOYMA. |
| 7 | **Kullanım disiplini** | Bu hesaba HER ZAMAN aynı residential proxy üzerinden gir. Kişisel hiçbir yerde kullanma. |

#### Telefon numarası olmadan alternatifler

| Yöntem | Açıklama | Başarı oranı |
|--------|----------|-------------|
| **Android emülatör** | Genymotion Cloud veya local BlueStacks. Residential proxy + sahte cihaz fingerprint ile Google Play'e gir, hesap aç. Telefon doğrulaması genelde atlanıyor. | %70-80 |
| **Eski Android telefon** | İkinci el ucuz telefon (nakit al, KYC yok). No-KYC prepaid SIM (Lyca Mobile, Lebara gibi bazı Avrupa SIM'leri hâlâ KYC'siz satılıyor). Hesabı telefonda aç, doğrula, sonra telefonu kapat. | %95+ |
| **Google Workspace** | Kendi domain'in varsa (Njalla ile aldığın) Google Workspace for Business açabilirsin. Telefon doğrulaması daha az agresif. Ama $7/ay ve domain ile bağlantı oluşuyor. | %90 |
| **Outlook/ProtonMail** | Google'ı hiç kullanma. Proton veya Tuta ile her şeyi yap. YouTube/Google Ads gerekmiyorsa en güvenli yol bu. | %100 (Google bypass) |

#### No-KYC SIM kartı nereden alınır

| Kaynak | Ülke | KYC | Not |
|--------|------|-----|-----|
| **Lyca Mobile** | UK/EU (bazı ülkeler) | Hayır (online sipariş, nakit top-up) | UK numarası, SMS alır. Amazon'dan da alınabilir. |
| **Lebara** | UK/EU | Hayır (bazı ülkelerde) | Benzer durum |
| **T-Mobile prepaid** | ABD | Mağazadan nakit ile hayır | Walmart'tan nakit ile al |
| **TextNow / Google Voice** | ABD | Email ile | Ücretsiz US numara ama Google bunu bazen reddediyor |
| **eSIM.me / silent.link** | Global | Hayır (kripto ile) | Anonim eSIM, BTC/XMR ile ödeme. SMS doğrulama için ideal. |
| **smscode.gg / smspool.net** | Global | Hayır | Tek seferlik numara. Google doğrulaması için %60-70 çalışıyor (bazı numaraları Google reddediyor). |

**En güvenilir yol:** silent.link'ten anonim eSIM al (BTC/XMR ile) → Ucuz ikinci el telefona tak → Google hesabını orada aç → Doğrula → Telefonu kapat ve sakla.

#### Her iş birimi için Google hesabı (gerekiyorsa)

```
filmsite.ops.2026@gmail.com    → NyumatFlix YouTube kanalı (varsa)
  → Residential proxy: ABD IP, her zaman aynı
  → Açılış: Android emülatör + smscode.gg numara

kartsite.ops.2026@gmail.com    → Kart sitesi (gerekirse)
  → Residential proxy: UK IP

smssite.ops.2026@gmail.com     → getsmsnow.com Google OAuth config
  → Residential proxy: ABD IP
```

**KRİTİK:** Bu Google hesaplarını SADECE iş amaçlı kullan. Kişisel Google hesabınla aynı cihazda, aynı browser'da, aynı IP'de ASLA açma.

### Browser fingerprint izolasyonu

Her iş birimi için ayrı VM:

```
VM-1 (UTM/Parallels): Film sitesi yönetimi
  → Mullvad Romania server
  → Firefox (ayrı profil)
  → Bookmark: admin panel, Adsterra, Njalla

VM-2: Kart sitesi yönetimi
  → Mullvad Estonia server
  → Brave Browser
  → Bookmark: NOWPayments, Wanttopay

VM-3: Marketing
  → Residential proxy (IPRoyal)
  → Chrome (temiz profil)
  → Bookmark: Reddit, Telegram Web, X
```

**VM'ler arası ASLA**: aynı browser, aynı email, aynı VPN server, aynı bookmark.

---

## 2. VPN / Proxy Katmanları

### Araç seçimi

| Katman | Araç | Neden | Maliyet |
|--------|------|-------|---------|
| Günlük yönetim | **Mullvad VPN** | Log tutmuyor (2023 İsveç polis baskını: boş döndü), hesap numarası ile çalışır, email istemiyor | 5 EUR/ay (XMR ile) |
| Hassas işlem (domain, wallet) | **Mullvad + Tor** | Çift katman: VPN kaparsa Tor korur, Tor çıkışı görünürse VPN arkasında | Ücretsiz (Tor) |
| Marketing / sosyal medya | **Residential Proxy** (aşağıda detay) | Datacenter IP ban yer, residential IP gerçek ev gibi görünür | $1-7/GB |
| Yedek VPN | **IVPN** | Mullvad alternatifi, aynı seviye privacy, farklı jurisdiction (Gibraltar) | $6/ay |

### Residential Proxy — Hangisi, Nereden, Nasıl?

Sosyal medya (Reddit, X, Telegram Web) ve reklam hesabı yönetimi için **residential proxy zorunlu**. VPN IP'leri Google/Reddit/X tarafından tanınır ve ban yer. Residential IP = gerçek ev interneti gibi görünür.

| # | Sağlayıcı | KYC | Crypto | Fiyat | IP Havuzu | Neden iyi |
|---|-----------|-----|--------|-------|-----------|-----------|
| 1 | **Servury** | **SIFIR** (email bile yok) | BTC, ETH, USDT + kart | $2.49/GB | 85M+ IP | En anonim: kayıt bile gerektirmez, login credential generate et, kullan |
| 2 | **NorthProxy** | Sadece email | BTC, ETH, LTC, DOGE + 7 crypto daha | $2/GB | 10M+ IP, 190 ülke | Crypto'da sıfır fee, sticky session, sosyal medya için optimize |
| 3 | **OrionProxies** | Sadece email | BTC, ETH, LTC, USDT | $1/GB | 10M+ IP, 195 ülke | En ucuz, "fully anonymous purchases" |
| 4 | **FloppyData** | Sadece email | 50+ crypto | $1/GB | Belirtilmemiş | 50+ crypto kabul, düşük fiyat |
| 5 | **IPRoyal** | Email + opsiyonel KYC | BTC, ETH + kart | $7/GB | 32M+ IP | En büyük havuz, güvenilir marka ama pahalı |

**Öneri sırası:**
```
1. Servury    → SIFIR KYC, email bile yok, crypto ile al. EN ANONİM.
2. NorthProxy → Email ile kayıt, 11 crypto, $2/GB, sticky session (sosyal medya için ideal)
3. OrionProxies → $1/GB en ucuz, crypto, anonim
```

**Nasıl kullanılır?**
```
1. Marketing VM'ini aç (VM-3)
2. Mullvad VPN ile servury.com veya northproxy.io'ya git
3. Crypto ile ödeme yap (email gerektirmiyorsa hiç verme)
4. SOCKS5 veya HTTP proxy bilgilerini al
5. Browser proxy ayarlarına gir (Firefox: Settings → Network → Manual Proxy)
6. Ülke: US veya DE seç (Tier-1 = daha yüksek reklam CPM + daha güvenilir sosyal medya)
7. Sticky session: sosyal medya hesabı yönetimi için AÇIK (aynı IP'yi 10-30 dk tut)
8. Rotating: web scraping / SEO için AÇIK (her istekte farklı IP)
```

**Korunma sağlar mı?**
- Residential proxy senin gerçek IP'ni tamamen gizler → site/platform senin gerçek konumunu görmez
- Ama: proxy sağlayıcısı senin gerçek IP'ni biliyor (VPN arkasından bağlanırsan onu da gizlersin)
- **En güvenli kombinasyon:** Mullvad VPN → Residential Proxy → Hedef site (çift katman)

### Mullvad kurulum

```
1. mullvad.net'e Tor Browser ile git
2. "Generate account" → 16 haneli numara al (email YOK)
3. XMR ile öde (Monero cüzdanından doğrudan)
4. WireGuard protokolü seç (daha hızlı)
5. Kill switch: AÇIK (Ayarlar → "Block when disconnected")
6. DNS leak protection: AÇIK
7. Server: Romania veya Estonia (sabit tut, sürekli değiştirme)
```

### Ne zaman hangi katman?

```
VPS panel girişi          → Mullvad (kill switch ON)
Domain satın alma         → Mullvad + Tor Browser
Wallet işlemleri          → Mullvad + Tor Browser
Reklam hesabı yönetimi   → Mullvad (aynı server, sabit IP)
Reddit/X post atma        → Residential proxy + ayrı VM
Kod geliştirme (lokal)   → VPN opsiyonel (sunucuya bağlanmıyorsan)
```

---

## 3. Hosting ve Domain

### VPS

| Sağlayıcı | Lokasyon | Neden | Ödeme |
|-----------|----------|-------|-------|
| **FlokiNET** | Iceland / Romania | Privacy odaklı, anonim signup (sadece email), DDoS koruması | BTC, XMR |
| **1984.is** | Iceland | Güçlü privacy yasaları, ucuz | BTC |
| **Njalla VPS** | Gizli | Domain ile aynı yerden, tek panel | XMR |

**VPS'e ilk bağlantı sonrası güvenlik (30 dakika):**
```bash
# Mullvad VPN AÇIK durumda bağlan
ssh root@VPS_IP -p 22

# 1. SSH güvenliği
sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
adduser deploy && usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
systemctl restart sshd

# 2. Firewall
ufw default deny incoming && ufw default allow outgoing
ufw allow 2222/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw enable

# 3. Brute force koruması + otomatik güncelleme
apt install -y fail2ban unattended-upgrades
systemctl enable fail2ban
dpkg-reconfigure -plow unattended-upgrades

# 4. Nginx log'larını kapat
sed -i 's|access_log.*|access_log /dev/null;|' /etc/nginx/nginx.conf
```

### Domain

| Sağlayıcı | Özellik | Maliyet |
|-----------|---------|---------|
| **Njalla** | WHOIS'te SEN YOK. Njalla kendi adına kaydeder. XMR kabul. | ~15 EUR/yıl |

**Domain kayıt adımları:**
```
1. Mullvad VPN + Tor Browser aç
2. njal.la'ya git
3. Hesap oluştur (sadece email gerekli → Tuta email kullan)
4. XMR ile öde
5. Domain al (.to, .cc, .io — ucuz ve hızlı)
6. Cloudflare'e DNS olarak ekle (gerçek VPS IP gizlenir)
```

Her proje için ayrı domain:
```
filmsite.to         → NyumatFlix
embed.filmsite.to   → embed-api (subdomain)
kartservis.cc       → kart-site
getsmsnow.com       → SMS (mevcut)
bombom.io           → BomBom oyunu
wildones.gg         → Wild Ones oyunu
```

### CDN

**Cloudflare** (ücretsiz plan):
- Proxy modu ON → gerçek VPS IP gizli
- SSL: Full (Strict)
- Firewall rules: ülke bazlı engelleme opsiyonel
- Analytics: Cloudflare'inki yeterli, Google Analytics YOK

**Dikkat:** Cloudflare 2026'da İtalya Piracy Shield nedeniyle piracy sitelerine karşı sertleşti. Yedek CDN: **BunnyCDN** ($0.01/GB, crypto kabul etmiyor ama anonim hesapla kullanılabilir).

---

## 4. Para Akışı ve Korunma (İş Bazlı)

### Genel akış (tüm projeler için)

```
Gelir (BTC/USDT) geliyor
        ↓
Hemen BTC → XMR atomic swap
(UnstoppableSwap veya Trocador.app)
        ↓
Monero wallet (Feather Wallet, Tor üzerinden)
        ↓
Küçük parçalara böl (10-20K USD chunk)
        ↓
Harcama: P2P (Haveno/Bisq) ile küçük küçük fiat'a çevir
ASLA: Türkiye bankasına büyük çekim
ASLA: KYC exchange'e (Binance vb.) doğrudan gönderme
```

### Araçlar

| Araç | Ne için | Maliyet |
|------|---------|---------|
| **Feather Wallet** | Monero cüzdan (Tor built-in) | Ücretsiz |
| **UnstoppableSwap** | BTC → XMR atomic swap (aracısız) | ~%1 fee |
| **Trocador.app** | Multi-coin → XMR swap | ~%0.5-1 fee |
| **Haveno** | P2P XMR ↔ fiat (Bisq'in Monero versiyonu) | Ücretsiz |
| **BTCPayServer** | Self-hosted ödeme kabul (VPS'te Docker ile) | Ücretsiz |

### Reklam Ağları — Detaylı OPSEC Analizi

**Devlete veri verir mi?** Privacy policy'lerinden çıkan sonuç:

| # | Ağ | Devlete veri verir mi? | KYC | Payout | CPM (Tier-1) | Öneri |
|---|-----|----------------------|-----|--------|-------------|-------|
| 1 | **AADS** (a-ads.com) | **HAYIR** — "We don't collect users' personal data", email bile istemiyor, anonim hesap açılır | Yok | BTC (Lightning dahil), 0.001 BTC min, günlük | $0.10-0.30 | EN GÜVENLİ |
| 2 | **TrafficStars** | Mahkeme emri ile mümkün ama policy'de aktif paylaşım yok | Düşük | BTC/USDT ($10 min) | $0.50-2.00 | EN ÇOK PARA |
| 3 | **JuicyAds** | Belirtilmemiş, 2006'dan beri adult odaklı | Düşük | Crypto/Paxum/Wire | $0.40-1.50 | İYİ GELİR |
| 4 | **ExoClick** | Policy'de "legal obligation" geçiyor ama aktif paylaşım raporu yok | Orta | BTC/Wire/Paxum | $0.30-1.20 | KABUL EDİLEBİLİR |
| 5 | **Adsterra** | **EVET** — Privacy policy: "provide law enforcement with information necessary for criminal prosecution", KYC/AML kontrolleri aktif | Orta-Yüksek | BTC/USDT/Wire ($100 min) | $0.50-2.50 | DİKKATLİ KULLAN |
| 6 | **HilltopAds** | **EVET** — "release data to comply with legal obligations, court orders" | Orta | BTC/Wire/Paxum | $0.30-1.00 | DİKKATLİ KULLAN |
| 7 | **Clickadu** | **EVET** — "On demand by court order and/or law enforcement" | Orta | BTC/USDT/Wire | $0.40-1.50 | DİKKATLİ KULLAN |

### Sıralama: EN GÜVENLİ → EN RİSKLİ

```
1. AADS          → Anonim, email bile yok, BTC Lightning, 2011'den beri. Düşük CPM ama SIFİR KYC.
2. TrafficStars  → BTC/USDT payout, düşük KYC, adult/streaming kabul, iyi CPM.
3. JuicyAds      → 2006'dan beri, adult odaklı, crypto payout, iyi gelir.
4. ExoClick      → Streaming/adult kabul, BTC payout. Orta risk.
5. Adsterra      → İyi para ama law enforcement ile işbirliği yapıyor. Anonim email + VPN ile kullan.
6. HilltopAds    → Mahkeme emri ile veri verir. Anonim hesapla kullan.
7. Clickadu      → Aynı risk. Yedek olarak tut.
```

### Önerilen strateji: 3 ağı aynı anda kullan

```
Slot 1 (güvenli):    AADS       → Banner, BTC Lightning, anonim
Slot 2 (yüksek CPM): TrafficStars → Pop-under + native, BTC/USDT
Slot 3 (yedek):      JuicyAds   → Pop-under + banner, crypto payout
```

Bu üçü ile:
- AADS: sıfır KYC, sıfır veri toplama = **ana güvenlik katmanı**
- TrafficStars: yüksek CPM, adult/streaming kabul = **ana gelir kaynağı**
- JuicyAds: yedek + çeşitlendirme = **gelir düşerse devreye girer**

### Film Sitesi + Embed

| Kalem | Araç | Detay |
|-------|------|-------|
| Ana reklam | **TrafficStars** | Pop-under + native. BTC/USDT payout ($10 min). En yüksek CPM. |
| Güvenli reklam | **AADS** | Banner. Anonim, email yok, BTC Lightning. Düşük CPM ama sıfır risk. |
| Yedek reklam | **JuicyAds** | Pop-under + banner. Crypto payout. |
| Server-side reklam | embed-api bumper | Adblock-proof, HLS içine gömülü. Kendi reklam segmentini serve et. |
| VIP abonelik | NOWPayments veya BTCPayServer | Crypto-only ödeme. |

**ASLA KULLANMA:** Google AdSense, PropellerAds (KYC zorunlu), Monetag (veri toplar).

Reklam hesabı açma adımları:
```
1. VM-1'i aç (Film sitesi VM)
2. Mullvad Romania server'a bağlan
3. AADS: a-ads.com → hesap bile açmadan ad unit oluştur (tamamen anonim)
4. TrafficStars: trafficstars.com → anonim email ile kayıt, BTC payout seç
5. JuicyAds: juicyads.com → anonim email ile kayıt, crypto payout seç
6. Her payout için YENİ BTC adresi kullan
7. Gelen BTC → hemen XMR swap (UnstoppableSwap)
```

### Kart Sitesi

| Kalem | Araç |
|-------|------|
| Müşteri ödemesi | **NOWPayments** (mevcut entegre) → BTC/ETH/XMR |
| Gelir yönlendirme | NOWPayments ayarlarında payout wallet'ı XMR olarak seç |
| Wanttopay kaydı | Anonim email + Mullvad VPN ile |

### SMS Servisi

| Kalem | Araç |
|-------|------|
| Müşteri ödemesi | **Cryptomus** (mevcut entegre) → BTC/USDT |
| Gelir çevirme | Cryptomus → BTC → UnstoppableSwap → XMR |
| SMSCode API | Anonim email ile kayıt |

### Oyunlar

| Kalem | Araç |
|-------|------|
| Reklam | AADS banner (düşük trafik = düşük gelir, düşük risk) |
| Skin/coin satışı | **BTCPayServer** (self-hosted, VPS'te Docker ile) |
| Payout | BTC → XMR swap (aynı akış) |

---

## 5. Sosyal Medya ve Marketing OPSEC 

### 5.1 Metadata Temizleme (ZORUNLU)

Her paylaştığın görsel ve videoda **EXIF metadata** bulunur: GPS koordinatları, cihaz modeli, işletim sistemi, yazılım versiyonu, tarih/saat, bazen kullanıcı adı. Bu tek başına kimliğini açığa çıkarabilir.

**Araçlar:**

| Araç | Platform | Ne yapar | Komut |
|------|----------|----------|-------|
| **ExifTool** | macOS/Linux | Tüm metadata'yı siler (fotoğraf + video) | `exiftool -all= dosya.jpg` |
| **mat2** | Linux | Metadata siler (PDF, görsel, video, ses) | `mat2 dosya.png` |
| **FFmpeg** | Tüm | Video metadata temizleme | `ffmpeg -i input.mp4 -map_metadata -1 -c copy clean.mp4` |
| **Scrambled Exif** | Android | Paylaşmadan önce otomatik siler | Play Store'dan yükle |
| **ImageOptim** | macOS | Görsel optimize + metadata sil | GUI ile sürükle bırak |

**Paylaşım öncesi ZORUNLU adımlar:**

```
1. Görseli/videoyu oluştur veya indir
2. METADATA SİL:
   - Görsel: exiftool -all= *.jpg *.png *.webp
   - Video:  ffmpeg -i input.mp4 -map_metadata -1 -c copy clean.mp4
3. Dosya adını değiştir (IMG_20260407_123456.jpg → film-oneri.jpg)
   Çünkü dosya adında tarih/cihaz bilgisi olabilir
4. Temizlendiğini doğrula: exiftool clean.jpg (boş çıkmalı)
5. Ancak şimdi paylaş
```

**Toplu temizleme scripti (her hafta kullan):**

```bash
#!/bin/bash
# metadata-temizle.sh — tüm paylaşılacak dosyaları temizler
cd ~/marketing-content/
exiftool -all= -overwrite_original *.jpg *.png *.webp 2>/dev/null
for f in *.mp4 *.mov *.webm; do
  [ -f "$f" ] && ffmpeg -i "$f" -map_metadata -1 -c copy "clean_$f" -y && mv "clean_$f" "$f"
done
echo "Tüm metadata temizlendi."
```

### 5.2 Nerede reklam yapılır?

| Platform | Nasıl | Risk |
|----------|-------|------|
| **Reddit** | Throwaway hesap, residential proxy ile. Film subreddit'lerinde organik yorum + link. | Düşük |
| **Telegram** | Kanal aç, bot ile otomatik paylaşım. Film/dizi haberleri + site linki. | Çok düşük |
| **X/Twitter** | Anonim hesap, residential proxy ile. Film önerileri paylaş, redirect link kullan. | Orta |
| **Discord** | Film/oyun sunucularına katıl, organik paylaşım. | Düşük |
| **SEO** | Kaliteli içerik (film review, oyun rehberi). Uzun vadeli organik trafik. | En düşük |

### KULLANILMAYACAK platformlar

| Platform | Neden |
|----------|-------|
| Google Ads | KYC zorunlu, ban riski yüksek, veri paylaşır |
| Facebook/Meta Ads | KYC zorunlu, hesap doğrulama, ödeme izleme |
| TikTok Ads | Aynı KYC sorunları |

### 5.3 Post atma prosedürü

```
1. VM-3'ü (Marketing VM) aç
2. Residential proxy'ye bağlan (Servury veya NorthProxy, sticky session)
3. Reddit/X/Telegram'a anonim hesapla gir
4. Gönderi at: DOĞRUDAN site linki değil → URL shortener (kutt.it self-hosted)
   veya redirect domaini kullan (ör. flm.to → filmsite.to)
5. Aynı gönderide birden fazla site linkini karıştırma
6. Her platform için ayrı hesap, ayrı email, ayrı proxy IP
7. METADATA SİLİNMİŞ görsel/video kullan (5.1'e bak)
8. Post atma sıklığı: günde 2-3 max, spam gibi görünme
```

### 5.4 Hesap oluşturma (sosyal medya)

```
1. Residential proxy AÇ (Servury/NorthProxy, marketing VM'de)
2. Tor Browser veya Brave (temiz profil)
3. Reddit/X'e git → kayıt ol
4. Email: sms-marketing@tuta.com (ayrı email)
5. Telefon doğrulaması → SMSCode tek seferlik numara
6. 2FA: Authenticator app (Aegis veya Bitwarden TOTP), SMS değil
7. Hesabı birkaç gün "ısıt" (normal yorum, upvote) sonra link paylaş
```

### 5.5 Sosyal Medya Marketing Planı

Detaylı 30 günlük plan (4 iş birimi, gün gün, template'ler, araçlar): **`marketing-plan.md`**

Özet:
- Pazar: 2 saat toplu üretim + haftalık zamanlama
- Pazartesi-Cumartesi: günde 45-60 dk
- Araçlar: SocialTargeter (ücretsiz, 9+ platform), Canva (görseller), Telegram Bot API
- İlk 7 gün: sıfır link, hesap ısıtma → karma/takipçi kazan
- Gün 8-14: yumuşak tanıtım → değer odaklı postlarda doğal link
- Gün 15-21: viral içerik → tartışma, karşılaştırma, meme
- Gün 22-30: cross-platform ölçeklendirme + topluluk

Altın kurallar:
```
1. %80 değer / %20 tanıtım → spam = ban = tüm efor çöp
2. Reddit: 9:00-12:00 EST paylaş (+730% upvote)
3. X: thread > tek tweet (3x engagement), reply > post (150x ağırlık)
4. Her paylaşımdan ÖNCE metadata sil (5.1)
5. Hesaplar birbirine bağlanmasın (ayrı email, ayrı proxy, ayrı VM)
```

---

## 6. Kullanıcı Verisi ve Log Politikası

### Sunucuda tutulMAyacaklar

| Veri | Durum |
|------|-------|
| Ziyaretçi IP adresi | TUTULMAYACAK |
| User-agent / fingerprint | TUTULMAYACAK |
| İzleme geçmişi | TUTULMAYACAK |
| Kullanıcı hesabı / login | YOK (mümkünse) |
| Cookie takibi | Sadece zorunlu oturum cookie'si |
| Google Analytics | YOK |
| Matomo / Umami | YOK |

### Nginx log kapatma

```nginx
# /etc/nginx/nginx.conf
access_log /dev/null;
error_log /dev/null crit;
```

### Uygulama seviyesi

```javascript
// embed-api/src/server.ts — Fastify logger
const app = Fastify({
  logger: {
    level: 'error', // sadece hata logla, access log yok
    transport: undefined, // dosyaya yazma
  },
});
```

### Analytics alternatifi

**Cloudflare Analytics** (ücretsiz, proxy modunda otomatik):
- Sayfa görüntüleme, benzersiz ziyaretçi (aggregate, anonim)
- IP veya kullanıcı bazlı değil
- Sunucunda hiçbir şey tutmana gerek yok

---

## 7. Exit Stratejisi

### Zaman sınırı

**6-9 ay** (Grok'un da önerisi). Uzun vadede büyüyen site = büyüyen risk.

### Exit tetikleyicileri (bunlardan biri olursa HEMEN çık)

| Sinyal | Aksiyon |
|--------|---------|
| Domain bloke edildi | Mirror'a geçme, EXIT yap |
| Hosting firmasından uyarı geldi | Parayı çek, sunucuyu sil |
| Reklam hesabı incelemede | Payout bekle, yeni hesap açma |
| Benzer siteler haberlerde kapandı | 48 saat içinde exit planını başlat |
| Aylık gelir 30K+ USD'ye ulaştı | Dikkat çekme eşiği, planlı exit başlat |

### Exit adımları

```
1. Tüm reklam gelirini çek → BTC → XMR swap
2. XMR'ı farklı wallet'lara böl (5-10K chunk)
3. VPS'teki tüm veriyi sil (shred komutu ile):
   shred -vfz -n 5 /var/log/* && rm -rf /home/deploy/*
4. VPS hesabını kapat (veya expire olmasını bekle)
5. Domain'leri bırak (yenileme)
6. Tüm ilgili email hesaplarını sil
7. VM'leri sil
8. Reklam hesaplarını kapat
9. 3 ay hiçbir şey yapma (cooling period)
```

---

## 8. Yakalanma Vektörleri ve Önlem Tablosu

| # | Vektör | Tehlike | Çözüm | Risk seviyesi |
|---|--------|---------|-------|---------------|
| 1 | **Para akışı** | Reklam geliri → chain analysis ile izleme | BTC/USDT gelir gelir gelmez → XMR swap. ASLA exchange'e doğrudan. | YÜKSEK |
| 2 | **Domain WHOIS** | Kim kayıt ettirdi → gerçek isim | Njalla (kendi adına kaydeder) + XMR ödeme | DÜŞÜK |
| 3 | **VPS IP sızması** | Gerçek sunucu IP'si açığa çıkar | Cloudflare proxy ON, VPS IP hiçbir yerde açıkta değil | DÜŞÜK |
| 4 | **Admin panel girişi** | IP log → gerçek konum | Mullvad + kill switch, HER ZAMAN | ORTA |
| 5 | **Browser fingerprint** | Farklı sitelerde aynı cihaz tespiti | Her iş için ayrı VM, ayrı browser profili | DÜŞÜK |
| 6 | **Reklam hesabı** | Provider veri paylaşırsa → email/IP | AADS (sıfır KYC) + TrafficStars (düşük KYC) kullan. Anonim email + VPN ile açılmış hesap. | DÜŞÜK-ORTA |
| 7 | **Sosyal medya** | Post geçmişi → pattern analizi | Throwaway hesap + residential proxy + ayrı VM | DÜŞÜK |
| 8 | **Banka/fiat çekim** | Büyük çekim → banka soruşturma | ASLA direkt banka. P2P + küçük parçalar + Haveno | YÜKSEK |
| 9 | **Cihaz ele geçirme** | Polis operasyonu → disk inceleme | FileVault (macOS) / LUKS (Linux) full disk encryption. Log YOK. | ORTA |
| 10 | **Sosyal mühendislik** | Arkadaş/aile bilgi sızdırma, lifestyle gösterisi | KİMSEYE söyleme. Gelir gösterisi yapma. Lüks tüketim yok. | YÜKSEK |

### En tehlikeli 3 vektör (öncelikli koru)

1. **Para akışı** → Her geliri ANINDA XMR'a çevir
2. **Banka/fiat** → P2P, küçük parçalar, cooling period
3. **Sosyal mühendislik** → Sessiz kal, gösteriş yapma

---

## 9. Araç ve Maliyet Tablosu

| Araç | Ne için | Maliyet (aylık) |
|------|---------|----------------|
| **Mullvad VPN** | Tüm yönetim | 5 EUR |
| **Njalla** | Domain (x5) | ~6 EUR (75 EUR/yıl) |
| **FlokiNET VPS** | Hosting (4vCPU, 8GB) | ~20 EUR |
| **Servury** | Residential proxy (sıfır KYC) | ~10 EUR |
| **Tuta Mail** | Anonim email (x4 hesap) | Ücretsiz |
| **SMSCode** | Telefon doğrulama (tek seferlik) | ~2 EUR/numara |
| **Feather Wallet** | Monero cüzdan | Ücretsiz |
| **UnstoppableSwap** | BTC → XMR | %1 fee (işlem bazlı) |
| **BTCPayServer** | Self-hosted ödeme kabul | Ücretsiz |
| **Cloudflare** | CDN + DNS + Analytics | Ücretsiz |
| **Tor Browser** | Hassas işlemler | Ücretsiz |
| **UTM / Parallels** | VM izolasyonu | Ücretsiz (UTM) |
| **AADS** | Banner reklam (EN ANONİM, KYC yok) | Ücretsiz (publisher) |
| **TrafficStars** | Pop-under + native (EN ÇOK PARA) | Ücretsiz (publisher) |
| **JuicyAds** | Yedek pop-under + banner | Ücretsiz (publisher) |
| **Servury/NorthProxy** | Residential proxy (marketing) | ~10-15 EUR |
| | | |
| **TOPLAM SABİT** | | **~41-51 EUR/ay** |

---

## 10. Günlük Checklist

Her gün iş başında:

```
[ ] Mullvad VPN açık mı? (kill switch ON)
[ ] Doğru VM'de miyim? (iş karıştırma)
[ ] Doğru VPN server'ında mıyım?
[ ] Browser'da kişisel hesap açık değil mi?
[ ] .env dosyaları repo'da DEĞİL mi?
```

Her hafta:

```
[ ] Reklam gelirlerini BTC → XMR swap yap
[ ] VPS güvenlik güncellemelerini kontrol et
[ ] Domain durumunu kontrol et (bloke var mı?)
[ ] Reklam hesabında uyarı var mı?
[ ] Haberlerde benzer site kapanması var mı?
```

Her ay:

```
[ ] Tüm wallet bakiyelerini gözden geçir
[ ] Gereksiz log dosyalarını temizle
[ ] VPN hesabını yenile (XMR ile)
[ ] Exit stratejisi hala geçerli mi? Tetikleyici var mı?
```

---

## 11. Cihaz Güvenliği

### macOS

```
FileVault: Açık (full disk encryption)
Firmware password: Ayarla (Recovery Mode koruması)
Otomatik login: KAPALI
Ekran kilidi: 1 dakika sonra
Find My Mac: KAPALI (konum sızdırır)
iCloud: İş için KULLANMA
```

### Tarayıcı

```
Varsayılan: Brave veya Firefox (her VM'de ayrı)
Eklentiler: uBlock Origin, Privacy Badger
JavaScript: Hassas işlemlerde NoScript
WebRTC: Devre dışı (about:config → media.peerconnection.enabled = false)
```

### İletişim

```
Ekiple iletişim (varsa): Signal veya SimpleX Chat
ASLA: WhatsApp, Telegram kişisel hesap, SMS
```
