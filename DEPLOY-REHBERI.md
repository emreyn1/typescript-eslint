# Full Deploy Rehberi — 4 Proje, Tek VPS, OPSEC

Bu rehber tum 4 projeyi (getsmsnow.com, kart-site, NyumatFlix, embed-api) sifirdan deploy etmek icin gereken her adimi icerir.

---

## 0. Domain Transfer: getsmsnow.com Namecheap'ten Cikarmali miyiz?

### Risk Analizi

**Mevcut durum:** getsmsnow.com Namecheap'te kayitli, WHOIS privacy acik.

**Soru:** Devlet gucleri domain'in daha once nereden alindigini izleyebilir mi?

**Cevap: EVET, izlenebilir.** Ama bu risk sanildigindan dusuk:

| Tehdit | Detay | Risk Seviyesi |
|--------|-------|---------------|
| **WHOIS gecmis arsivleri** | DomainTools, WhoisXML API, SecurityTrails gibi servisler 2011'den bu yana WHOIS snapshotlari tutuyor. 2018 oncesi kayitlar GDPR oncesi — tam isim/adres gorunur. 2018 sonrasi kayitlar cogunlukla "redacted for privacy" olarak gozukur. **Namecheap WHOIS privacy actiysa, arsivlerde de "WhoisGuard Protected" yazar.** | DUSUK (privacy aciksa) |
| **Namecheap subpoena** | Devlet gucleri (ABD/AB) mahkeme emri (subpoena) ile Namecheap'ten gercek kayit bilgilerini isteyebilir. Namecheap ABD'de kayitli (ICANN accredited), yasal taleplere uymak ZORUNDA. | ORTA |
| **Transfer sonrasi iz** | Domain'i Njalla'ya transfer etsen bile, DomainTools gibi arsivlerde "registrar: Namecheap → registrar: Njalla" gecisi gorunur. Yani "once Namecheap'teydi" bilgisi KALICI. Ama gercek kayit bilgileri sadece Namecheap'in ic kayitlarinda (subpoena ile erisilebilir). | DUSUK-ORTA |
| **ICANN transfer kayitlari** | ICANN, domain transfer islemlerini takip eder. Registrar degisiklikleri kayit altindadir. | DUSUK (rutin islem) |

### Tavsiye

**SMS sitesi icin transfer GEREKSIZ.** Cunku:

1. SMS verification servisi yasal bir is — rakipler (5sim.net, smspool.net, smspva.com) hepsi normal registrar'larla calisiyor
2. WHOIS privacy zaten acik — kamuya bilgin gorunmuyor
3. Transfer yapsan bile Namecheap'in ic kayitlari silinmiyor — subpoena ile yine erisilebilir
4. Transfer sureci sirasinda 5-7 gun WHOIS privacy kapanmak ZORUNDA (ICANN kurali) — bu gecici aciklik daha buyuk risk
5. Boyle ekstra islem yaparak dikkat cekmek, hic bir sey yapmamaktan daha riskli

**OPSEC gereken projeler (film, kart) icin:** Yeni domain'leri DOGRUDAN Njalla'dan al. Transfer etme, sifirdan kaydet.

### Eger Yine de Transfer Etmek Istersen (Baska Domain Icin)

**On kosullar:**
- Domain en az 60 gun once kayit edilmis olmali
- Son 60 gun icinde baska bir transfer yapilmamis olmali

**Adimlar:**

1. **Njalla'da transfer baslat:**
   - https://njal.la → "Domains" → domain adini gir → "Transfer" sec
   - Kripto ile ode (1 yillik uzatma dahil)

2. **Namecheap'te hazirlık:**
   - Domain List → Manage → Sharing & Transfer sekmesi
   - "Registrar Lock" → **Unlock** (kilit ac)
   - "WhoisGuard" → **Gecici olarak kapat** (transfer icin zorunlu, ICANN kurali)
   - "Auth Code" → **Send Code** tikla → EPP kodu email'ine gelecek

3. **Njalla'ya EPP kodunu gir:**
   - Transfer formunda auth/EPP kodunu yapistir
   - Onayla

4. **Onay email'ini onayla:**
   - Namecheap'ten gelen transfer onay email'ini onayla
   - VEYA 5 gun bekle (otomatik onay)

5. **Transfer tamamlandi (5-7 gun):**
   - Njalla artik domain'in registrant'i (kendi bilgileriyle)
   - DNS'i Njalla'dan yonet veya Cloudflare'e yonlendir

**Transfer sirasinda site kapalir mi?** Hayir. DNS ayarlari korunur, site calismaya devam eder. Sadece registrar degisir.

---

## 1. Genel Mimari

```
Mac (ana makine)
 └── UTM VM (Debian 12, encrypted sparsebundle icinde)
      ├── Mullvad VPN (her zaman acik)
      ├── SSH → Servury VPS
      └── Residential proxy → sosyal medya hesaplari

Servury VPS (Netherlands, D-200)
 ├── Docker Compose
 │    ├── getsmsnow.com      → :3003
 │    ├── kart-site           → :3002
 │    ├── NyumatFlix          → :3000
 │    ├── embed-api           → :3001
 │    ├── bombom              → :3010
 │    ├── wildones            → :3011
 │    ├── chess-signal        → :3012
 │    └── postgres            → :5432
 ├── Nginx reverse proxy + rate limiting
 ├── Let's Encrypt SSL (certbot, auto-renew)
 ├── UFW + Docker iptables fix
 └── fail2ban
```

---

## 2. UTM OPSEC VM Kurulumu (Mac)

### 2.1 UTM Indir
- https://mac.getutm.app (ucretsiz)
- Mac App Store'dan da alinabilir ($9.99)
- macOS 12+ gerekli (Apple Silicon veya Intel)

### 2.2 Encrypted Sparsebundle Olustur

```bash
hdiutil create -size 30g -encryption AES-256 -stdinpass \
  -type SPARSEBUNDLE -fs APFS -volname "OPS" \
  ~/Desktop/ops-vault.sparsebundle
```

Guclu sifre gir (20+ karakter, harf+rakam+sembol). Mount et:

```bash
hdiutil attach ~/Desktop/ops-vault.sparsebundle -stdinpass
```

Kapatmak icin:

```bash
hdiutil detach /Volumes/OPS
```

### 2.3 Debian 12 VM Indir ve Kur

- **URL:** https://mac.getutm.app/gallery/debian-12
- **Boyut:** 2.5 GiB
- **Spec:** ARM64, 4 GiB RAM, 64 GiB Disk, GPU Accelerated
- **Login:** `debian` / `debian`

1. .zip'i `/Volumes/OPS/` icine cikar
2. .utm dosyasini UTM'e surukle
3. VM'i baslat, login ol

### 2.4 VM Ilk Kurulum

```bash
passwd
# Guclu sifre sec (20+ karakter)

sudo apt update && sudo apt upgrade -y

sudo apt install -y curl wget git openssh-client tmux vim ufw \
  wireguard resolvconf gnupg2 rsync htop net-tools

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable
```

### 2.5 Mullvad VPN Kur

**Mullvad hesap ac (VM icinden veya Mac'ten):**

1. https://mullvad.net → "Get started"
2. Hesap numarasi olustur (email/isim istenmez)
3. Kripto ile ode: BTC veya XMR (5 EUR/ay)
4. Account → WireGuard configuration → Config dosyasi indir
   - Ulke: genellikle Sweden veya Netherlands sec
   - Dosya ismi ornek: `mullvad-se-sto-wg-001.conf`

**VM icinde kur:**

```bash
sudo cp mullvad-se-sto-wg-001.conf /etc/wireguard/wg0.conf
sudo chmod 600 /etc/wireguard/wg0.conf
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0

# Dogrula:
curl https://am.i.mullvad.net/connected
# "You are connected to Mullvad" donmeli
```

### 2.6 SSH Key Olustur

```bash
ssh-keygen -t ed25519 -C "ops-$(date +%Y%m%d)" -f ~/.ssh/vps_key
# PASSPHRASE KOY (15+ karakter)

cat ~/.ssh/vps_key.pub
# Bu ciktiyi kopyala — VPS kurulumunda kullanilacak
```

SSH config olustur (kolaylik icin):

```bash
cat >> ~/.ssh/config << 'EOF'
Host vps
  HostName VPS_IP_BURAYA
  User deploy
  IdentityFile ~/.ssh/vps_key
  ServerAliveInterval 60
EOF
```

Artik `ssh vps` yazarak baglabilirsin.

---

## 3. VPS Satin Al — Servury

### Neden Servury?

| Ozellik | Deger |
|---------|-------|
| Kimlik | SIFIR (email bile yok, 32-char token) |
| VPS + Proxy | Tek platform |
| Lokasyon | 7 (NYC, Montreal, London, NL, Paris, Frankfurt, Singapore) |
| LUKS encryption | Var (Montreal donanimi, sadece sen sifreyi bilirsin) |
| Odeme | XMR, BTC, ETH, LTC, USDT, kart |
| Trustpilot | 5/5 |
| Log politikasi | Sifir log (Apache logs → /dev/null) |

### Onerilen Plan: D-200 (Netherlands)

- 4x Ryzen 7 5800X, 8 GB DDR4, 80 GB NVMe
- 1Gbps, unmetered bandwidth
- **$31.18/ay**

### Siparis Adimlari

1. https://servury.com/servers/ adresine git
2. **Netherlands** lokasyonunu sec (Avrupa trafigi icin en iyi)
3. **D-200** planini sec ($31.18/ay)
4. OS: **Debian 12**
5. Hostname: istedigin bir sey (ornek: `web01`)
6. Kripto ile ode (XMR en anonim, BTC/ETH/USDT de olur)
7. **32-char credential** alacaksin — guvenlı bir yere kaydet (KeePassXC veya sifrelenmis not)
8. VPS birkac dakika icinde hazir olacak — SSH bilgileri verilecek

### Residential Proxy (Ayni Platformdan)

1. https://servury.com/proxies/ → **Residential Proxy** sekmesi
2. 10 GB al ($2.42/GB = ~$24.20)
3. HTTP/SOCKS5, rotating veya sticky secenekleri var
4. Ulke secimi: ABD veya UK (sosyal medya hesaplari icin)
5. Kullanim: Reddit, X (Twitter), Instagram, TikTok hesaplari
6. Her is birimi icin farkli sticky IP kullan

---

## 4. Domain Kaydi — Njalla

### Yeni Domainler (kart + film + embed)

1. https://njal.la adresine git
2. Hesap ac (email veya XMPP yeterli, KYC yok)
3. Kripto ile ode (BTC/XMR)
4. Domainler:
   - `kartsitesi.com` — Kart sitesi
   - `filmsitesi.com` — Film sitesi
   - `embed.filmsitesi.com` — subdomain, ucret yok
5. Maliyet: ~15-19 EUR/domain/yil (.com 18.75 EUR)

### DNS Ayarlari

Her domain icin Njalla DNS panelinde:

| Tip | Host | Deger | TTL |
|-----|------|-------|-----|
| A | @ | VPS_IP | 300 |
| A | www | VPS_IP | 300 |
| A | embed | VPS_IP | 300 (sadece filmsitesi.com icin) |

### getsmsnow.com (mevcut, Namecheap'te)

Namecheap DNS panelinde:

| Tip | Host | Deger | TTL |
|-----|------|-------|-----|
| A | @ | VPS_IP | 300 |
| A | www | VPS_IP | 300 |

### DNS Propagation Kontrol

Ayar yaptiktan sonra kontrol et:

```bash
dig +short smssitenadi.com
# VPS IP donmeli

# Veya web'den: https://dnschecker.org
```

Yayilma 5 dakika ile 48 saat arasinda surebilir (TTL=300 ile genellikle 5-10 dk).

---

## 5. VPS Ilk Kurulum

UTM VM icinden SSH at:

```bash
ssh root@VPS_IP
# Servury'den gelen sifre ile gir
```

### 5.1 Sistem Guncelle ve Temel Araclar

```bash
apt update && apt upgrade -y
apt install -y ufw fail2ban nginx certbot python3-certbot-nginx \
  git curl wget htop tmux unattended-upgrades
```

### 5.2 Otomatik Guvenlik Guncellemeleri

```bash
dpkg-reconfigure -plow unattended-upgrades
# "Yes" sec — guvenlik yamalari otomatik kurulacak
```

### 5.3 Docker Kur

```bash
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
systemctl enable docker
```

### 5.4 Deploy Kullanicisi Olustur

```bash
adduser deploy
# Guclu sifre sec
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 5.5 SSH Guclendir

```bash
cat > /etc/ssh/sshd_config.d/hardening.conf << 'EOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowUsers deploy
EOF

systemctl restart sshd
```

**DIKKAT:** Bu adiamdan sonra root ile giris yapamazsin. `deploy` kullanicisi ile SSH key'inle baglanacaksin. Test et:

```bash
# Baska bir terminalden (kapatmadan once):
ssh -i ~/.ssh/vps_key deploy@VPS_IP
# Calisiyor mu? Evet → devam et
```

### 5.6 Firewall (UFW + Docker Fix)

Docker varsayilan olarak UFW'yi BYPASS eder (docker-proxy iptables'i dogrudan yonetir). Bunu engellemek icin:

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw default deny incoming
ufw default allow outgoing
ufw enable

# Docker'in UFW'yi bypass etmesini engelle:
cat >> /etc/docker/daemon.json << 'EOF'
{
  "iptables": false
}
EOF

systemctl restart docker
```

**Not:** `"iptables": false` ayarladiginda Docker container'lari SADECE localhost'tan erisilebilir olur. Nginx reverse proxy uzerinden disariya acilirlar — bu istedigimiz durum.

### 5.7 Fail2ban

```bash
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 3600
EOF

systemctl enable fail2ban
systemctl restart fail2ban
```

---

## 6. Payment Gateway Test

### 6.1 NOWPayments (Kripto — Oncelikli, Guvenilir)

**A) Sandbox Test (para harcanmaz)**

1. https://sandbox.nowpayments.io → "Create Account"
2. Email + sifre (Tuta/ProtonMail kullan)
3. Email'i dogrula
4. Dashboard → **Store Settings** → Outcome wallet: herhangi bir kripto adresi gir (sandbox)
5. **API Keys** → "Add new key" → Sandbox API key'i kopyala
6. **IPN Secret** → olustur ve kopyala
7. Postman ile test: https://documenter.getpostman.com/view/7907941/T1LSCRHC

Test cagrilari:
```bash
# API durumu kontrol
curl -X GET https://api-sandbox.nowpayments.io/v1/status \
  -H "x-api-key: SANDBOX_API_KEY"

# Invoice olustur
curl -X POST https://api-sandbox.nowpayments.io/v1/invoice \
  -H "x-api-key: SANDBOX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"price_amount":5,"price_currency":"usd","order_id":"test-001","order_description":"Test payment"}'
```

**B) Production (kucuk hacim)**

1. https://nowpayments.io → ayni email ile kayit ol
2. Store Settings → **gercek** wallet (USDT TRC-20 onerilen — dusuk fee)
3. API Key + IPN Secret olustur
4. **IPN callback URL:** `https://DOMAIN/api/nowpayments/webhook`
5. $5 test odemesi yap (kendi cuzdanindan)

### 6.2 NexaPay (Fiat Kart — YUKSEK RISK)

**UYARI:** NexaPay (nexapay.one) hakkinda ciddi scam gostergeleri:
- Domain yasi: 5 ay (Kasim 2025)
- ScamAdviser trust skoru: 0/100
- Hicbir finans otoritesinde lisans yok (FCA, SEC, ASIC, CySEC)
- WHOIS bilgileri gizli
- Reddit r/PaymentProcessing'de scam uyarilari
- Trustpilot'taki olumlu yorumlar son 2 ayda (sahte olabilir)

**Test Proseduru (kaybetmeyi goze aldigin miktarla):**

1. **Yeni** bir USDT (TRC-20) cuzdan adresi olustur (Trust Wallet veya benzer, ana cuzdanin DEGIL)
2. https://nexapay.one → "Get Started" veya "Login"
3. Hesap olustur: Email + USDT wallet adresi
4. KYC istenmeyecek (bu da risk isareti)
5. Dashboard'dan **Payment Link** olustur ($5 USD)
6. Linki ac, kendi kredi kartinla ode
7. USDT cuzdanina gelip gelmedigini kontrol et (1-30 dk beklenmeli)
8. **GELMEZSE:** NexaPay'i birak. `.env` dosyalarindan `NEXAPAY_*` degerlerini BOS birak. Kod zarar vermez.
9. **GELIRSE:** API key'i al, `.env`'e yaz. NexaPay entegrasyonu otomatik aktif olur.

### 6.3 Cryptomus (Kripto — Ikincil)

1. https://cryptomus.com → hesap ac
2. Merchant → API → Merchant ID + API Key al
3. Cekim icin KYC gerekecek (ama odeme KABUL icin gerekmez)
4. Minimum odeme: ~0.5 USDT (coinklere gore degisir)

---

## 7. Supabase Tablolari

### getsmsnow.com

1. https://supabase.com → proje olustur (veya mevcut projeyi ac)
2. **Settings → API** → URL ve service_role key'i kopyala
3. **SQL Editor** → New Query
4. `getsmsnow.com/supabase/migrations/001_initial_schema.sql` icerigini yapistir
5. **Run**

Olusturulan tablolar: `users`, `verification_codes`, `orders`, `guest_orders`, `cryptomus_payments`, `nowpayments_payments`, `nexapay_payments`, `balance_transactions`, `referral_codes`, `referral_links`, `referral_commissions`

### kart-site

1. Ayni veya farkli Supabase projesi kullanabilirsin
2. `kart-site/supabase/migrations/001_referral_system.sql` calistir

---

## 8. Env Dosyalari

Her proje icin `.env.local` (veya `.env`) olustur. Kaynak: her projenin `.env.example` dosyasi.

### getsmsnow.com/.env.local

```bash
NEXT_PUBLIC_SITE_URL=https://getsmsnow.com
AUTH_SECRET=BURAYA_RANDOM_32_BYTE_BASE64

# Google OAuth (opsiyonel — kullanmayacaksan bos birak)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Telegram Login (opsiyonel — @BotFather ile ayarla)
NEXT_PUBLIC_TELEGRAM_BOT_NAME=
TELEGRAM_BOT_TOKEN=

# Email — resend.com → API Keys
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=GetSMSNow <noreply@getsmsnow.com>

# Supabase — supabase.com → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxx

# SMS Providers (en az birini doldur)
SMSPOOL_API_KEY=              # smspool.net → API Keys
SMSCODE_API_TOKEN=            # smscode.gg → Dashboard → API

# Kripto Odeme
NOWPAYMENTS_API_KEY=          # nowpayments.io → API Keys
NOWPAYMENTS_IPN_SECRET=       # nowpayments.io → Store Settings → IPN Secret
CRYPTOMUS_MERCHANT_ID=        # cryptomus.com → Merchant → API
CRYPTOMUS_API_KEY=            # cryptomus.com → Merchant → API

# Fiat Odeme (NexaPay — $5 test sonucuna gore)
NEXAPAY_API_KEY=              # nexapay.one (bos birakirsan devre disi)
NEXAPAY_WEBHOOK_SECRET=       # nexapay.one

# Cloudflare Turnstile — dash.cloudflare.com → Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

NEXT_PUBLIC_COOKIE_BANNER_ENABLED=false
```

Secret olusturmak icin:

```bash
openssl rand -base64 32
# Cikan degeri AUTH_SECRET'e yapistir
```

### kart-site/.env.local

```bash
NEXT_PUBLIC_SITE_URL=https://kartsitesi.com
NEXT_PUBLIC_SITE_NAME=PrivacyCards
AUTH_SECRET=BURAYA_FARKLI_RANDOM_HEX

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx

WANTTOPAY_API_KEY=            # wanttopay.com → API
WANTTOPAY_API_URL=https://api.wanttopay.com/v1

NOWPAYMENTS_API_KEY=
NOWPAYMENTS_IPN_SECRET=

NEXAPAY_API_KEY=
NEXAPAY_WEBHOOK_SECRET=
```

### embed-api/.env

```bash
PORT=3001
HOST=0.0.0.0

# openssl rand -hex 32
HMAC_SECRET=BURAYA_RANDOM_HEX_64
URL_TTL_SECONDS=7200

ALLOWED_ORIGINS=https://filmsitesi.com
EMBED_DOMAIN=embed.filmsitesi.com
SITE_DOMAIN=filmsitesi.com

# docker-compose otomatik set eder (DB_PASSWORD env'den)
DATABASE_URL=postgresql://postgres:DB_SIFRE_BURAYA@db:5432/streamvault

HLS_CACHE_PATH=/tmp/hls-cache

# Cloudflare Turnstile (opsiyonel)
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET=

# Reklam (opsiyonel)
AD_VAST_URL=
AD_BUMPER_ENABLED=false
```

### NyumatFlix/.env.local

```bash
# TMDB API Key — themoviedb.org → Settings → API
TMDB_API_KEY=xxxxxxxxxxxx

NEXT_PUBLIC_EMBED_API_URL=https://embed.filmsitesi.com
NEXT_PUBLIC_SITE_URL=https://filmsitesi.com

# Reklam zone ID'leri (Phase 2 — simdilik bos birakilabilir)
NEXT_PUBLIC_AD_POP_ZONE=
NEXT_PUBLIC_AD_NATIVE_ZONE=

# AI Film Oneri Chatbot (opsiyonel)
OPENAI_API_KEY=
```

---

## 9. Deploy

### 9.1 Kodu VPS'e Aktar

**Yontem A: Git clone (onerilen)**

```bash
ssh vps
cd /home/deploy

# Public repo ise:
git clone https://github.com/KULLANICI/embed-analyzer.git app

# Private repo ise deploy key olustur:
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key.pub
# Bu public key'i GitHub → repo → Settings → Deploy keys → Add deploy key
# Sonra:
GIT_SSH_COMMAND="ssh -i ~/.ssh/deploy_key" git clone git@github.com:KULLANICI/embed-analyzer.git app
```

**Yontem B: Rsync (git kullanmadan)**

```bash
# Mac'ten (UTM VM icinden):
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.git' \
  /path/to/embed-analyzer/ deploy@VPS_IP:/home/deploy/app/
```

### 9.2 Env Dosyalarini Olustur

```bash
cd /home/deploy/app
nano getsmsnow.com/.env.local    # Yukaridaki degerleri yapistir
nano kart-site/.env.local
nano embed-api/.env
nano NyumatFlix/.env.local
```

### 9.3 Docker Build ve Calistir

```bash
cd /home/deploy/app
export DB_PASSWORD=$(openssl rand -hex 16)
echo "DB_PASSWORD=$DB_PASSWORD" >> .env
echo "Sifre: $DB_PASSWORD"
# Bu sifreyi bir yere kaydet!

docker compose build --parallel
# 5-15 dakika surebilir (ilk build)

docker compose up -d

# Kontrol:
docker compose ps
# Tum servisler "Up" olmali

# Loglar:
docker compose logs -f --tail=50
# Hata var mi kontrol et, Ctrl+C ile cik
```

### 9.4 Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/apps
```

Icerik:

```nginx
# Rate limiting zone tanimlari
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

# getsmsnow.com
server {
    listen 80;
    server_name getsmsnow.com www.getsmsnow.com;

    client_max_body_size 10M;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        limit_req zone=general burst=50 nodelay;
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# kart-site
server {
    listen 80;
    server_name kartsitesi.com www.kartsitesi.com;
    client_max_body_size 10M;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        limit_req zone=general burst=50 nodelay;
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# NyumatFlix (film sitesi)
server {
    listen 80;
    server_name filmsitesi.com www.filmsitesi.com;
    client_max_body_size 50M;

    location / {
        limit_req zone=general burst=50 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# embed-api
server {
    listen 80;
    server_name embed.filmsitesi.com;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/apps /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
# "syntax is ok" donmeli
sudo systemctl reload nginx
```

### 9.5 SSL Sertifikasi (Let's Encrypt)

```bash
sudo certbot --nginx \
  -d getsmsnow.com \
  -d kartsitesi.com \
  -d filmsitesi.com \
  -d embed.filmsitesi.com \
  --non-interactive --agree-tos -m ops@tuta.io
```

Certbot otomatik olarak Nginx config'i HTTPS'e guncelleyecek ve 443 port'unu ekleyecek.

**Otomatik yenileme kontrol:**

```bash
sudo certbot renew --dry-run
# Hata yoksa otomatik yenileme calisiyor (systemd timer)
```

---

## 10. Post-Deploy Yapilandirma

### 10.1 Payment Gateway Webhook URL'lerini Ayarla

Deploy sonrasinda her payment gateway'in dashboard'inda webhook URL'lerini guncelle:

| Gateway | URL | Nerede ayarlanir |
|---------|-----|------------------|
| NOWPayments | `https://getsmsnow.com/api/nowpayments/webhook` | nowpayments.io → Store Settings → IPN Callback URL |
| NexaPay | `https://getsmsnow.com/api/nexapay/webhook` | nexapay.one → Dashboard → Webhook URL |
| Cryptomus | `https://getsmsnow.com/api/cryptomus/webhook` | cryptomus.com → Merchant → Callback URL |

kart-site icin de ayni sekilde kendi domain'ini kullan.

### 10.2 Cloudflare Turnstile Ayarla

1. https://dash.cloudflare.com → Turnstile
2. Site ekle: `getsmsnow.com`
3. Site Key ve Secret Key'i `.env.local`'a yaz

### 10.3 Resend Email Ayarla

1. https://resend.com → hesap ac
2. API Keys → Create API Key
3. Domain dogrulama: DNS'e TXT/CNAME kayitlari ekle (resend gosterecek)
4. API key'i `.env.local`'a yaz

---

## 11. Guncelleme ve Yeniden Deploy

Kod degisikligi yaptiginda:

```bash
ssh vps
cd /home/deploy/app

# Kodu guncelle
git pull origin main
# veya rsync ile

# Sadece degisen servisleri yeniden build et
docker compose build sms kart
# veya tum servisleri:
docker compose build --parallel

# Yeniden baslat (sifir-downtime degil ama hizli)
docker compose up -d

# Loglardan hata kontrol
docker compose logs -f --tail=20 sms
```

---

## 12. Yedekleme

### Postgres DB Yedekleme

```bash
# Manuel yedek
docker compose exec db pg_dumpall -U postgres > backup-$(date +%Y%m%d).sql

# Otomatik yedek (cron):
crontab -e
# Su satiri ekle (her gun saat 03:00):
0 3 * * * cd /home/deploy/app && docker compose exec -T db pg_dumpall -U postgres | gzip > /home/deploy/backups/db-$(date +\%Y\%m\%d).sql.gz

mkdir -p /home/deploy/backups
```

### Env Dosyalari Yedekleme

```bash
# Env dosyalarini sifrelenmis sekilde yedekle
tar czf - getsmsnow.com/.env.local kart-site/.env.local embed-api/.env NyumatFlix/.env.local | \
  gpg --symmetric --cipher-algo AES256 > env-backup-$(date +%Y%m%d).tar.gz.gpg
```

---

## 13. Izleme ve Log

### Container Durumu

```bash
docker compose ps
docker stats --no-stream
```

### Disk Kullanimi

```bash
df -h
docker system df
# Eski image'lari temizle:
docker system prune -a --volumes
```

### Nginx Loglari

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Fail2ban Durumu

```bash
sudo fail2ban-client status sshd
```

---

## 14. Son Kontrol Listesi

### Altyapi
- [ ] UTM VM kuruldu, Mullvad VPN calisiyor (`curl am.i.mullvad.net/connected`)
- [ ] Servury VPS aktif, SSH baglantisi var (`ssh vps`)
- [ ] Domain DNS'leri VPS IP'ye yonlendirildi (`dig +short domain.com`)
- [ ] UFW aktif (22, 80, 443 acik)
- [ ] fail2ban calisiyor
- [ ] Docker "iptables: false" ayarli

### Veritabani
- [ ] Supabase tablolari olusturuldu (getsmsnow — 12 tablo)
- [ ] Supabase tablolari olusturuldu (kart-site)

### Odeme
- [ ] NOWPayments sandbox testi basarili
- [ ] NOWPayments production $5 testi basarili
- [ ] NOWPayments IPN callback URL ayarlandi
- [ ] NexaPay $5 payment link testi yapildi (sonuc: ...)
- [ ] Cryptomus Merchant ID ve API Key alindi

### Deploy
- [ ] Env dosyalari VPS'te olusturuldu (4 proje)
- [ ] `docker compose build --parallel` basarili
- [ ] `docker compose up -d` — tum container'lar "Up"
- [ ] Nginx config aktif, `nginx -t` basarili
- [ ] SSL sertifikalari alindi (`certbot --nginx`)
- [ ] SSL otomatik yenileme calisiyor (`certbot renew --dry-run`)

### Canli Test
- [ ] getsmsnow.com browser'da aciliyor (HTTPS)
- [ ] kartsitesi.com browser'da aciliyor
- [ ] filmsitesi.com browser'da aciliyor
- [ ] embed.filmsitesi.com browser'da aciliyor
- [ ] Kayit + giris calisiyor (getsmsnow)
- [ ] Guest checkout calisiyor
- [ ] Odeme testi: NOWPayments top-up → bakiye artiyor
- [ ] Odeme testi: NexaPay kart ile (varsa)
- [ ] Webhook'lar calisiyor (bakiye guncelleniyor)
- [ ] Referral kodu otomatik olusturuluyor (yeni kayit)
- [ ] Turnstile CAPTCHA calisiyor

### OPSEC
- [ ] VPS'e sadece UTM VM icinden (VPN uzerinden) erisildi
- [ ] SSH sadece key-based, root kapatildi
- [ ] Domain'ler birbirine baglanamaz (farkli registrar/IP? veya Cloudflare proxy)
- [ ] Sosyal medya hesaplari residential proxy ile olusturuldu

---

## 15. Toplam Maliyet

| Kalem | Fiyat |
|-------|-------|
| Servury VPS (D-200, NL) | $31.18/ay |
| Residential Proxy (Servury, 10GB) | ~$24/ay |
| Domainler (Njalla, 2-3x) | ~38-57 EUR/yil |
| getsmsnow.com (Namecheap, mevcut) | ~$10/yil |
| Mullvad VPN | 5 EUR/ay |
| Supabase | Free tier |
| NOWPayments | %0.5 per tx |
| NexaPay test | $5 (tek seferlik) |
| Resend email | Free tier (3000 email/ay) |
| Cloudflare Turnstile | Ucretsiz |
| **TOPLAM** | **~$65/ay + ~60 EUR/yil domain** |

---

## 16. Sorun Giderme

### Docker build basarisiz
```bash
docker compose logs <servis-adi>
docker compose build <servis-adi> --no-cache
# Bellek yetmiyorsa: swap ekle
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
```

### Site acilmiyor
```bash
docker compose ps                       # Container'lar calisiyor mu?
curl -I http://127.0.0.1:3003          # Lokal erisim var mi?
sudo nginx -t                           # Nginx config dogru mu?
sudo certbot certificates               # SSL gecerli mi?
sudo journalctl -u nginx -f            # Nginx hata loglari
```

### Webhook gelmiyor
- NOWPayments: `https://getsmsnow.com/api/nowpayments/webhook`
- NexaPay: `https://getsmsnow.com/api/nexapay/webhook`
- VPS firewall: port 443 acik mi? (`ufw status`)
- Nginx loglari: `sudo tail -f /var/log/nginx/access.log | grep webhook`
- Container loglari: `docker compose logs -f sms | grep webhook`

### Supabase baglanti hatasi
- `.env.local`'da `NEXT_PUBLIC_SUPABASE_URL` dogru mu? (`https://xxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` dogru mu? (Settings → API'den kopyala)
- Tablolar olusturuldu mu? (SQL Editor'de kontrol et)

### Docker disk dolu
```bash
docker system prune -a --volumes
# Kullanilmayan tum image, container, volume'lari siler
```

### Container surekli restart ediyor
```bash
docker compose logs <servis-adi> --tail=100
# Env degiskeni eksik mi? Port cakismasi mi? Build hatasi mi?
```

---

## 17. Dipnot — Hangi Dokumana Ne Zaman Bakacaksin

Bu rehber deploy'un A'dan Z'sine her seyi kapsiyor. Ama bazi konular baska dosyalarda daha derinlemesine isleniyor. Asagida **ne zaman hangisine bakman gerektigini** net olarak yaziyorum.

### DEPLOY SIRASINDA LAZIM OLACAK DOKUMANLAR

| # | Dosya | Ne Zaman Bakacaksin | Icerik Ozeti |
|---|-------|---------------------|--------------|
| 1 | **`korunma.md`** | UTM VM kurarken, email/hesap acmadan ONCE | Katmanli kimlik yapisi, email olusturma adim adim (Tuta/Proton), Tor+VPN kullanimi, metadata silme (ExifTool), para akisi rotasyonu, reklam agi OPSEC analizi (ExoClick, Adsterra, PopAds, HilltopAds, TrafficStars), residential proxy kullanim detaylari, sosyal medya hesap acma kurallari. **Bu rehberdeki Bolum 2-3'un OPSEC detay katmani.** |
| 2 | **`OPSEC-VE-EKLER.md`** | Telegram hesabi acmadan ONCE + Phase 2 planlarken | Telegram hesabi OPSEC ile nasil acilir (numara, VPN, 2FA), her is birimi icin ayri hesap stratejisi, Phase 2 yol haritasi (embed + film icin Telegram content pipeline, R2 CDN, torrent entegrasyonu), eklenecek ozellikler listesi. |
| 3 | **`secenekler.md`** | Odeme gateway secimi yapilirken (NOWPayments vs NexaPay vs Cryptomus karari) | Rakip analizi (SMSPool, SMS-MAN, 5SIM ne kullaniyor), tum fiat/kripto gateway'lerin detayli karsilastirma tablosu (KYC, fee, minimum, Apple Pay destegi), pop-under reklam aglari karsilastirmasi. **Karar veremezsen bu dosyaya bak.** |
| 4 | **`LANSMAN-REHBERI.md`** | **ESKI versiyon — bu DEPLOY-REHBERI.md onu kapsadi.** Yine de env degerleri listesi icin referans olabilir | Phase 1 vs Phase 2 ayrimi, env degerlerinin nereden alinacagi (Supabase, NOWPayments, Cryptomus, Resend), Supabase tablo kurulumu. Bu dosyadaki her sey artik burada (Bolum 7-8) daha guncel sekilde var. |

### DEPLOY SIRASINDA + HEMEN SONRA LAZIM OLACAK DOKUMANLAR

| # | Dosya | Ne Zaman Bakacaksin | Icerik Ozeti |
|---|-------|---------------------|--------------|
| 5 | **`odemeplatformlari.md`** | Ilk odeme geldiginde, para cekerken | Kripto cuzdan secimi (Trust Wallet + Cake Wallet), USDT→XMR swap (Trocador, UnstoppableSwap, Majestic Bank), para akisi, YAPMA listesi, adim adim kurulum. **Parani nasil alacaksin — tamami burada.** |
| 5b | **`SIMDI-NE-YAPACAKSIN.md`** | HEMEN SIMDI, ilk is olarak | UTM IP leak aciklamasi + kill switch, encrypted disk aciklamasi, RAM temizligi aciklamasi, 13 adimlik baslangic plani (2.5 saat). **Buradan basla.** |
| 6 | **`CONTENT-CALENDAR.md`** | Siteler canli olduktan sonra, sosyal medyaya baslarken | 30 gunluk icerik takvimi (4 is birimi), platform bazli kopyala-yapistir hazir metinler (Ingilizce), TikTok/Reddit/Telegram/X icin gun gun paylasimlari, hashtag'ler, video senaryolari. |
| 7 | **`marketing-plan.md`** | Icerik takvimiyle birlikte | 30 gunluk viral marketing plani, ucretsiz araclar (SocialTargeter, Canva, ExifTool, TMDB API), gunde 1 saat stratejisi. |
| 8 | **`AUTO-MARKETING.md`** | Isler buyudugunde, VA/freelancer almaya baslarken | Otomasyon + Filipinli VA ile pazarlama makinesi kurulumu, is tanimlari, sablonlar, KPI'lar. |
| 9 | **`GROWTH-PLAN.md`** | Ilk trafik geldikten sonra | Buyume plani, direct launch stratejisi, olcekleme tetikleri, A/B test ve conversion optimizasyonu. |
| 9 | **`reklam.md`** | Phase 2'de film/embed sitesine reklam eklerken | Reklam entegrasyon plani: pop-under, VAST, bumper ad mimarisi, ExoClick/Adsterra/HilltopAds entegrasyonu, pre-roll + mid-roll + post-roll akisi. |
| 10 | **`docs/hizli-luks-web-sitesi-rehberi.md`** | UI/UX iyilestirme yapacaksan | Three.js, GSAP, Lenis, R3F, Spline ile luks web sitesi uretim rehberi, Awwwards tarzı stack. |

### BAKMAN GEREKMEYEN DOKUMANLAR

Bu dosyalar ya eski planlama notlari, ya kisisel notlar, ya da ilgisiz konular. Deploy sirasinda bunlara hic bakma:

- `ne-yapildi.md` — kisisel gorev listesi/notlar
- `sinyaller.md`, `10-20.md`, `20-30.md` — kripto trading sinyalleri (ilgisiz)
- `option1.md` ... `option9.md`, `optin4.md` — eski alternatif plan notlari (kararlar verildi, artik gecersiz)
- `adim.md`, `adim-adim.md` — eski is plan taslagi
- `3konu.md`, `5-isanaliz.md`, `spesifik.md`, `anlatim.md` — eski planlama
- `kart.md` — eski kart sitesi notlari (proje zaten hazir)
- `affiliate.md`, `ajans.md`, `oyunlar.md` — eski fikirler
- `ANALYSIS.md`, `UI.md`, `deploy-rehber.md` (kucuk harfli) — eski/duplike
- `korunma.html` — korunma.md'nin HTML versiyonu
- `allianceAroma/*` — farkli proje (parfum sitesi)
- `portfolyo-M/*` — portfolyo projesi
- `Play-chess-Now/*` — satranc projesi (deploy rehberi kapsaminda degil)

### PROJE-SPESIFIK ENV REFERANSI

Env dosyalarini doldururken her projenin `.env.example` dosyasina bak:

| Proje | Env Referans Dosyasi |
|-------|---------------------|
| getsmsnow.com | `getsmsnow.com/.env.example` |
| kart-site | `kart-site/.env.example` |
| embed-api | `embed-api/.env.example` |
| NyumatFlix | `NyumatFlix/.env.example` |

### SUPABASE MIGRATION REFERANSI

| Proje | SQL Dosyasi |
|-------|-------------|
| getsmsnow.com | `getsmsnow.com/supabase/migrations/001_initial_schema.sql` |
| kart-site | `kart-site/supabase/migrations/001_referral_system.sql` |

---

## 18. OPSEC Oturum Temizligi — Her Is Sonrasi RAM/Swap/Clipboard Silme

**KURAL: UTM VM'de is bittiginde KAPAMADAN ONCE asagidaki temizligi yap.**

### 18.1 Neden Gerekli?

RAM'de sifrelenmemis veriler kalir: tarayici sekmelerinde acik oturum tokenlari, pano'da kopyalanmis API key'ler, terminal gecmisinde sifireler. VM'i kapatsan bile host Mac'in swap dosyasinda iz kalabilir. "Cold boot" saldirisinda donmus RAM'den veri okunabilir.

### 18.2 Tarayici Verilerini Sil (VM icinde)

```bash
# Firefox (VM'deki varsayilan tarayici)
rm -rf ~/.mozilla/firefox/*.default-release/{cookies.sqlite,webappsstore.sqlite,formhistory.sqlite,places.sqlite,sessionstore.jsonlz4}

# Chromium/Brave (eger kuruluysa)
rm -rf ~/.config/chromium/Default/{Cookies,History,Login\ Data,Web\ Data}
rm -rf ~/.config/BraveSoftware/Brave-Browser/Default/{Cookies,History,Login\ Data,Web\ Data}
```

Ya da **tarayiciyi her zaman Private/Incognito modda kullan** — kapaninca otomatik siler.

### 18.3 Clipboard (Pano) Temizle

```bash
# X11 clipboard temizle
xclip -selection clipboard < /dev/null 2>/dev/null
xsel --clipboard --clear 2>/dev/null

# Wayland icin
wl-copy ""
```

### 18.4 Terminal Gecmisini Sil

```bash
history -c && history -w
rm -f ~/.bash_history ~/.zsh_history
unset HISTFILE
```

### 18.5 Swap Temizle

```bash
# Swap'i kapat, sifirla, tekrar ac
sudo swapoff -a
sudo dd if=/dev/zero of=/swapfile bs=1M count=$(free -m | awk '/Swap/{print $2}') 2>/dev/null
sudo mkswap /swapfile
sudo swapon -a
```

### 18.6 RAM'deki Kalan Verileri Temizle

```bash
# Kullanilmayan sayfa once (page cache) bosalt
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches

# RAM'i sifirlamak icin bos veri yaz (VM'nin tum bos RAM'ini doldurur)
sudo dd if=/dev/zero of=/tmp/zero.fill bs=1M 2>/dev/null; sudo rm -f /tmp/zero.fill
```

### 18.7 Tek Komutla Hepsini Yap (Script)

VM icinde bu scripti olustur:

```bash
cat > ~/clean.sh << 'SCRIPT'
#!/bin/bash
echo "[*] Tarayici verileri siliniyor..."
rm -rf ~/.mozilla/firefox/*.default-release/{cookies.sqlite,webappsstore.sqlite,formhistory.sqlite,places.sqlite,sessionstore.jsonlz4} 2>/dev/null
rm -rf ~/.config/chromium/Default/{Cookies,History,Login\ Data,Web\ Data} 2>/dev/null

echo "[*] Clipboard temizleniyor..."
xclip -selection clipboard < /dev/null 2>/dev/null
xsel --clipboard --clear 2>/dev/null

echo "[*] Terminal gecmisi siliniyor..."
history -c && history -w
rm -f ~/.bash_history ~/.zsh_history

echo "[*] Cache bosaltiliyor..."
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null

echo "[*] Swap temizleniyor..."
sudo swapoff -a 2>/dev/null
sudo dd if=/dev/zero of=/swapfile bs=1M count=$(free -m | awk '/Swap/{print $2}') 2>/dev/null
sudo mkswap /swapfile > /dev/null 2>&1
sudo swapon -a 2>/dev/null

echo "[*] RAM bosluklari sifirlaniyor..."
sudo dd if=/dev/zero of=/tmp/zero.fill bs=1M 2>/dev/null
sudo rm -f /tmp/zero.fill

echo "[OK] Temizlik tamamlandi. VM'i simdi kapatabilirsin."
SCRIPT
chmod +x ~/clean.sh
```

Kullanim: is bittiginde `~/clean.sh` calistir, sonra VM'i kapat.

### 18.8 Mac Host Tarafi (VM Kapatildiktan Sonra)

```bash
# Mac'te swap/paging dosyalarini temizle (opsiyonel, paranoyak mod)
# Bu komut Mac'i yavaslatabilir, sadece cok hassas islerden sonra yap
sudo purge

# Encrypted sparsebundle'i unmount et
hdiutil detach /Volumes/OPS
```

**Sparsebundle unmount edildiginde AES-256 sifreleme devreye girer — icindeki VM ve tum verileri okunamaz hale gelir.** Bu en onemli adim.

---

## 19. Kart Sitesi — Issuer Banka Bilgileri

kart-site projesinde 2 tip kart satilacak. Issuer bankalari:

### NEXUS Kart (Online-Only)

| Ozellik | Deger |
|---------|-------|
| **Issuer** | **Wallester** |
| **Ulke** | Estonya (EU) |
| **Lisans** | EU lisansli EMI (Electronic Money Institution) |
| **Ag** | Visa |
| **Tip** | Virtual, online-only |
| **KYC** | Yok (kullanici tarafinda) |
| **Limit** | ≤ €150 bakiye |
| **Maliyet (sana)** | ~€0.10–0.35/kart |
| **Satis fiyati** | $3/kart |
| **Kar marji** | ~%88 |
| **Ozellik** | Hizli issuance, dusuk maliyet, online alisveris icin |

### OMNI Kart (Online + Offline)

| Ozellik | Deger |
|---------|-------|
| **Issuer** | **Sunrate Solutions Limited** |
| **Ulke** | Hong Kong |
| **Ag** | Mastercard |
| **Tip** | Virtual, online + offline |
| **KYC** | Yok (kullanici tarafinda) |
| **Apple Pay / Google Pay** | EVET |
| **Maliyet (sana)** | ~$2–3/kart |
| **Satis fiyati** | $8/kart |
| **Kar marji** | ~%62-75 |
| **Ozellik** | Apple Pay/Google Pay destekli, offline POS odeme, daha yuksek limit |

### API Entegrasyonu

| Kart | API | Dokumantas yon |
|------|-----|--------------|
| NEXUS | Wallester API | https://wallester.com (B2B BIN Sponsorship) |
| OMNI | Sunrate API | https://www.sunrate.com |
| Alternatif (mevcut) | Wanttopay API | kart-site projesi simdilik bunu kullaniyor |

**Not:** Phase 1'de kart-site Wanttopay API kullanacak (`.env.example`'da zaten var). Wallester ve Sunrate entegrasyonu islem hacmi arttiginda (Phase 2+) KYB (Know Your Business) sureci sonrasinda eklenecek.

---

## 20. Baslatma Oncelik Sirasi — Diger Dokumanlar

Asagida dokumanlar **tam olarak hangi sirayla, ne zaman okunacak** yaziliyor. Bosuna okuma yapma.

### ADIM 1: DEPLOY ONCESI (simdi, sifirdan baslarken)

Bu rehberi (`DEPLOY-REHBERI.md`) bastan sona takip et. Ek olarak sadece su 2 dokumana ihtiyacin var:

| Sira | Dosya | Ne Icin | Uzunluk | Ne Kadar Oku |
|------|-------|---------|---------|--------------|
| 1.1 | **`korunma.md`** | Email olusturma, residential proxy ayarlari, metadata silme kurallari | 690 satir | **Bolum 1-3** yeterli (ilk 200 satir) — kimlik yapisi, email, VPN. Gerisi (para akisi, reklam OPSEC) Phase 2 icin. |
| 1.2 | **`OPSEC-VE-EKLER.md`** | Telegram hesabi acma adimlari | 227 satir | **Bolum 1** yeterli (ilk 50 satir) — Telegram OPSEC. Gerisi Phase 2 yol haritasi. |

### ADIM 2: ENV DOLDURURKEN (VPS kurulduktan sonra)

| Sira | Dosya | Ne Icin | Ne Kadar Oku |
|------|-------|---------|--------------|
| 2.1 | **Her projenin `.env.example`** dosyasi | Hangi deger nereye | Tamamini oku (kisa dosyalar, 15-50 satir) |
| 2.2 | **`secenekler.md`** | Odeme gateway secimi icin karar veremezsen | Bolum 0 (rakip analiz tablosu) + Bolum 3 (karar matrisi) — toplam ~100 satir |

### ADIM 3: SITELER CANLIYA ALINDIKTAN SONRA (1. gun)

| Sira | Dosya | Ne Icin | Ne Kadar Oku |
|------|-------|---------|--------------|
| 3.1 | **`CONTENT-CALENDAR.md`** | Sosyal medyaya ilk paylasimlar | **Gun 1-10** bolumleri (her is birimi icin ilk 10 gunluk paylasimlar) — ~300 satir |
| 3.2 | **`marketing-plan.md`** | Ucretsiz araclar ve gunluk rutin | **Bolum "Araclar"** + **Gun 1-3 plani** — ~100 satir |

### ADIM 4: ILK HAFTA SONRASI (7. gun)

| Sira | Dosya | Ne Icin | Ne Kadar Oku |
|------|-------|---------|--------------|
| 4.1 | **`GROWTH-PLAN.md`** | Buyume tetikleri ve olcekleme | Tamamini oku (151 satir, kisa) |
| 4.2 | **`CONTENT-CALENDAR.md`** | Gun 10-30 plani | Kaldigi yerden devam |

### ADIM 5: AY 2+ (PHASE 2)

| Sira | Dosya | Ne Icin | Ne Kadar Oku |
|------|-------|---------|--------------|
| 5.1 | **`reklam.md`** | Film/embed sitesine pop-under + VAST reklam ekleme | Tamamini oku (462 satir) |
| 5.2 | **`OPSEC-VE-EKLER.md`** (Bolum 2+) | Phase 2 yol haritasi: Telegram content pipeline, R2 CDN | Bolum 2-3 (satir 50-227) |
| 5.3 | **`AUTO-MARKETING.md`** | VA/freelancer ile pazarlama otomasyonu | Tamamini oku (188 satir) |
| 5.4 | **`korunma.md`** (Bolum 4+) | Reklam agi OPSEC, para akisi rotasyonu | Satir 200-690 |
| 5.5 | **`kart.md`** | Wallester/Sunrate entegrasyonu, BIN sponsorship basvurusu | Tamamini oku (714 satir) |
| 5.6 | **`docs/hizli-luks-web-sitesi-rehberi.md`** | Sitelerin UI'ini luks hale getirmek icin | Ihtiyac duyarsan (222 satir) |

### ASLA BAKMA (gereksiz dosyalar — tekrar)

`ne-yapildi.md`, `sinyaller.md`, `10-20.md`, `20-30.md`, `option1-9.md`, `optin4.md`, `adim.md`, `adim-adim.md`, `3konu.md`, `5-isanaliz.md`, `spesifik.md`, `anlatim.md`, `affiliate.md`, `ajans.md`, `oyunlar.md`, `ANALYSIS.md`, `UI.md`, `deploy-rehber.md` (kucuk harfli eski), `korunma.html`, `ffilm.html`, `allianceAroma/*`, `portfolyo-M/*`, `Play-chess-Now/*`

---

**KESIN SONUC:**

Bu `DEPLOY-REHBERI.md` artik 20 bolum, deploy'un her adimini kapsiyor:

- **Bolum 0:** Domain transfer risk analizi
- **Bolum 1-5:** Altyapi (UTM, VPS, domain, SSH, firewall)
- **Bolum 6-8:** Odeme testleri, Supabase, env dosyalari
- **Bolum 9:** Docker build + Nginx + SSL
- **Bolum 10-13:** Post-deploy, guncelleme, yedekleme, izleme
- **Bolum 14-16:** Kontrol listesi, maliyet, sorun giderme
- **Bolum 17:** Diger dokumanlara referans tablosu
- **Bolum 18:** RAM/Swap/Clipboard temizleme (OPSEC)
- **Bolum 19:** Kart issuer banka bilgileri (Wallester + Sunrate)
- **Bolum 20:** Diger dokumanlari hangi sirayla, ne zaman okuyacaksin

**Eksik birsey YOK. Tek bu dosyayi takip et, adim adim ilerle.**
