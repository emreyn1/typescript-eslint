# OPSEC + Deploy + Ödeme — Pratik Plan

Grok konuşmasındaki 3 konu + bizim 7 projeyi birleştiren master plan.

---

## Konu 1: VPS + Deploy (Dokunulmaz Kurulum)

### Hosting seçimi (öncelik sırasıyla)

| Sağlayıcı | Nerede | Neden | Ödeme |
|-----------|--------|-------|-------|
| **FlokiNET** | Iceland/Romania | Free speech odaklı, anonim signup (sadece email), DDoS koruması | BTC, XMR |
| **Njalla** | Sweden (gizli) | Domain **seni tamamen gizler** (kendi adına kayıt), VPS de var | BTC, XMR, LTC |
| **1984.is** | Iceland | Güçlü privacy yasaları, ucuz | BTC |
| **AlexHost** | Moldova | Ucuz, hızlı, crypto kabul — ama panel girişinde IP logluyor | BTC, USDT |

> **AlexHost yeterli** ama panel'e **her zaman VPN ile** gir. Bir kez gerçek IP ile girersen anonimlik biter.

### Domain

- **Njalla** ile al — WHOIS'te senin adın, IP'n, ülken görünmez. Njalla kendi adına kaydeder.
- Her proje için ayrı domain, hepsini Njalla'dan al.

### Kurulum sırası (VPS aldıktan sonra, ilk 30 dakika)

```bash
# 1. VPN AÇIK OLDUĞUNDAN EMİN OL — gerçek IP ile asla bağlanma

# 2. SSH güvenliği (ilk giriş)
ssh root@IP_ADRESI

# Port değiştir
sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Root login kapat, key-only
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Yeni kullanıcı
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh

systemctl restart sshd

# 3. Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 2222/tcp   # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw enable

# 4. Fail2ban
apt install -y fail2ban
systemctl enable fail2ban

# 5. Otomatik güncelleme
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# 6. Docker + Docker Compose
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy

# 7. Nginx + Certbot
apt install -y nginx certbot python3-certbot-nginx
```

### Uygulama deploy

```bash
# deploy kullanıcısı ile
su - deploy

# Private repo'dan çek
git clone git@github.com:SENIN_HESAP/projeler.git
cd projeler

# .env dosyalarını ELLE oluştur — repo'ya asla koyma
nano embed-api/.env
nano kart-site/.env.local
# ...

# Docker ile ayağa kaldır
docker compose up -d

# Nginx reverse proxy
# /etc/nginx/sites-available/embed.conf:
#   server_name embed.domain.com;
#   location / { proxy_pass http://127.0.0.1:3001; }
```

### Port → domain eşleştirmesi

| Proje | İç port | Domain örneği |
|-------|---------|--------------|
| NyumatFlix | 3000 | filmsite.com |
| embed-api | 3001 | embed.filmsite.com |
| kart-site | 3002 | kartsite.com |
| getsmsnow | 3003 | getsmsnow.com |
| bombom | 3010 | bombom.io |
| wildones | 3011 | wildones.gg |
| chess-signal | 3012 | chess.domain.com |

Her biri ayrı Nginx server block + Let's Encrypt SSL.

---

## Konu 2: VPN / Proxy Stratejisi

### Temel kural: **katmanlı çalış**

```
Sen → VPN (shared, 200+ kişi aynı IP) → VPS panel / geliştirme
Sen → VPN → Tor → hassas işlemler (domain kayıt, wallet)
Sen → Residential proxy → marketing (Google Ads, sosyal medya)
```

### VPN seçimi

| VPN | Neden |
|-----|-------|
| **Mullvad** | No-log, anonim kayıt (numara bile yok), 5€/ay, XMR kabul |
| **IVPN** | No-log, BTC/XMR, WireGuard |
| **ProtonVPN** | Swiss law, free tier var |

> **Aynı VPN server'ı** her zaman kullan. IP sürekli değişirse Google hesap kilitler.

### Marketing için ayrı profil

Google hesabı VPN görünce kilitliyor — çözüm:

1. Marketing için **ayrı VM** (VirtualBox veya UTM) — farklı browser fingerprint
2. O VM'de **residential proxy** kullan (datacenter IP ban yer)
3. Hesabı ilk kez residential proxy ile aç, 2FA kur (authenticator, SMS değil)
4. Sonra hep **aynı exit IP** ile gir

### Browser fingerprint

- Ayrı VM'de **Brave** veya **Firefox** kullan
- Her proje için ayrı browser profili
- **Canvas/WebGL fingerprint** farklı olsun

---

## Konu 3: Ödeme (BTC/ETH zorunluluğu)

### Sorun
Müşteriler Monero bilmiyor, BTC/ETH istiyor. Ama ikisi de **chain analysis** ile izlenebilir.

### Pratik çözüm (katmanlı)

```
Müşteri BTC/ETH gönderir
        ↓
BTCPayServer (self-hosted, VPS'te)
        ↓
Non-KYC wallet (Electrum / Sparrow)
        ↓
Atomic Swap → XMR (BTC→Monero)
        ↓
Monero wallet (featherwallet)
        ↓
Harcama / çekme
```

### Araçlar

| Ne | Araç | Not |
|----|------|-----|
| Ödeme kabul | **BTCPayServer** (self-hosted) | VPS'te Docker ile kurulur, no third-party |
| BTC wallet | **Sparrow** veya **Electrum** | Kendi node'una bağla veya Tor ile |
| BTC → XMR | **UnstoppableSwap** veya **Trocador** | Atomic swap, KYC yok |
| XMR wallet | **Feather Wallet** | Tor üzerinden bağlanır |
| Fiat'a çevirme | **Bisq** (P2P) veya **Haveno** | No-KYC, karşılıklı |

### Projelerde ödeme entegrasyonu

| Proje | Ödeme yöntemi | Nasıl |
|-------|--------------|-------|
| kart-site | NOWPayments API → BTC/ETH/XMR | Zaten entegre (`nowpayments.ts`) |
| getsmsnow | Cryptomus webhook | Zaten entegre |
| Oyunlar (skin/coin) | BTCPayServer embed | Yeni: checkout sayfasına koy |
| VIP abonelik | Telegram Stars + crypto | embed-api'de mevcut |

### Kritik kurallar
- **Aynı wallet adresini** birden fazla serviste kullanma
- Her proje için **ayrı wallet**
- Düzenli olarak BTC → XMR swap yap, BTC'de biriktirme
- Exchange'e (Binance vb.) **asla** doğrudan gönderme — KYC = kimlik

---

## Genel OPSEC Checklist

```
[ ] VPN her zaman açık (Mullvad/IVPN)
[ ] VPS panel'e sadece VPN ile giriş
[ ] Her proje ayrı domain (Njalla)
[ ] SSH: key-only, non-default port, root disabled
[ ] Firewall: sadece 80/443/SSH
[ ] .env dosyaları repo'da DEĞİL
[ ] Log'larda kişisel veri YOK (access log'ları temizle/minimize et)
[ ] Marketing: ayrı VM + residential proxy + ayrı browser
[ ] Wallet'lar projelere göre ayrı
[ ] BTC → XMR atomic swap düzenli
[ ] Sosyal medyada gelir/lifestyle paylaşımı YOK
[ ] Kişisel cihazdan iş sunucusuna dokunma YOK
[ ] Backup: encrypted, farklı lokasyonda
```

---

## Zaman Çizelgesi (Önce Ne)

```
Gün 1:   VPN al (Mullvad, XMR ile)
Gün 1:   Domain al (Njalla, XMR ile)
Gün 2:   VPS al (FlokiNET veya AlexHost, BTC/XMR ile)
Gün 2:   VPS güvenlik kurulumu (30 dk)
Gün 3:   Docker + Nginx + SSL
Gün 3:   embed-api + NyumatFlix deploy
Gün 4:   getsmsnow + kart-site deploy
Gün 5:   bombom + wildones deploy
Gün 6:   BTCPayServer kur, wallet'ları ayır
Gün 7:   Test: her site çalışıyor + SSL + hız
Hafta 2: Marketing başlat (ayrı VM + residential proxy)
Hafta 3: İlk gelir → BTC → XMR swap
```

---

## Maliyet (aylık minimum)

| Kalem | Tutar |
|-------|-------|
| VPS (4 vCPU, 8GB RAM) | ~€15-25/ay |
| Domain (Njalla × 4-5) | ~€60/yıl ≈ €5/ay |
| VPN (Mullvad) | €5/ay |
| Residential proxy (marketing) | ~€10-20/ay |
| **Toplam** | **~€35-55/ay** |

> İlk ayda toplam maliyet ~€100 civarı (domain yıllık + ilk ay VPS/VPN).
> Gelir başlayınca kendini karşılar.
