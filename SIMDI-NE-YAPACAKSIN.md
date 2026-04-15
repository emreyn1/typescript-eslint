# SIMDI NE YAPACAKSIN — Adim Adim

UTM kurdun, Debian kurdun, Mullvad kurdun. Buradan devam ediyorsun.

---

## UTM IP LEAK MESELESI — ACIKLAMA

### Sorun ne?

UTM'de VM internete "Emulated VLAN" (varsayilan NAT) uzerinden cikiyor. Bu demek ki:

```
VM icindeki trafik
    → UTM NAT (host Mac'in IP'si ile cikiyor)
        → internet
```

Sen VM icinde Mullvad VPN actiginda:

```
VM icindeki trafik
    → Mullvad tüneli (sifrelenmis)
        → UTM NAT (host Mac'in IP'si ile sifrelenmis paket cikiyor)
            → Mullvad serveri
                → internet
```

**Leak nerede?** Host Mac, VM'in Mullvad sunucusuna baglandigini goruyor (ama icerigi gormuyor, sifreli). ISP'n de Mac'in Mullvad'a baglandigini goruyor. Bu genelde sorun degil cunku:
- Mullvad'a baglanmak yasal
- Icerigi kimse gormuyor

**Gercek risk:** WireGuard baglantisi kurulmadan ONCE (VM acilip VPN henuz baslamamisken) 1-2 saniyelik acik trafik olabilir.

### Cozum: Kill Switch + DNS Leak Korumasi

VM icinde (zaten yaptiysan kontrol et):

```bash
# wg0.conf icinde bu satirlar olmali:
[Interface]
# ... mevcut ayarlar ...
DNS = 10.64.0.1
PostUp = iptables -I OUTPUT ! -o wg0 -m mark ! --mark $(wc -l < /proc/net/if_inet6 2>/dev/null || echo 0) -m addrtype ! --dst-type LOCAL -j REJECT
PreDown = iptables -D OUTPUT ! -o wg0 -m mark ! --mark $(wc -l < /proc/net/if_inet6 2>/dev/null || echo 0) -m addrtype ! --dst-type LOCAL -j REJECT
```

Daha basit kill switch:

```bash
sudo nano /etc/wireguard/wg0.conf
```

`[Interface]` altina ekle:

```
PostUp = iptables -I OUTPUT ! -o wg0 -m addrtype ! --dst-type LOCAL -j REJECT && ip6tables -I OUTPUT ! -o wg0 -m addrtype ! --dst-type LOCAL -j REJECT
PreDown = iptables -D OUTPUT ! -o wg0 -m addrtype ! --dst-type LOCAL -j REJECT && ip6tables -D OUTPUT ! -o wg0 -m addrtype ! --dst-type LOCAL -j REJECT
```

Bu kurallar: VPN tuneli disinda HIC BIR trafige izin vermez. WireGuard dussa bile internet kapanir, leak olmaz.

### UTM Ayari (Ek Guvenlik)

UTM → VM Settings → Network:
- Mode: **Emulated VLAN** (varsayilan, bu dogru)
- Advanced → **Isolate Guest from Host**: ACIK yap
- Bu ayar VM'in host Mac'e erismesini engeller

### Paranoyak Mod (Opsiyonel)

Mac'te de Mullvad calistir (cift VPN):

```
VM trafik → VM Mullvad (Sveden) → Mac Mullvad (Romania) → internet
```

Bu asiri yavaslama yapar, %99 icin gereksiz. Ama paranoyaksan yap.

---

## ENCRYPTED DISK SORUSU — ACIKLAMA

**Soru:** Disk Utility ile AES-256 sifrelenmis disk olusturup icine debian12.utm koysak yeterli mi?

**Cevap: EVET, tamamen yeterli.** Asagida 2 yontem var, ikisi de ayni isi yapar:

| Yontem | Araç | Sonuc |
|--------|------|-------|
| **Sparsebundle** (DEPLOY-REHBERI'deki) | `hdiutil create -encryption AES-256` | Sifrelenmis sanal disk (.sparsebundle) |
| **Disk Utility** (senin sorun) | Disk Utility → New Image → AES-256 | Sifrelenmis sanal disk (.dmg veya .sparsebundle) |

Ikisi de AYNI AES-256 sifrelemesini kullaniyor. Unmount edildiginde icindeki her sey (debian12.utm dahil) okunamaz.

**Disk Utility ile yapmak icin:**
1. Disk Utility ac
2. File → New Image → Blank Image
3. Size: 30 GB (veya ihtiyacin kadar)
4. Format: APFS
5. Encryption: **256-bit AES**
6. Image Format: **sparse disk image** (buyuyen boyut) veya **sparse bundle** (parcali, daha iyi)
7. Sifre gir (20+ karakter)
8. Save
9. Mount et, icine debian12.utm dosyasini tasi

**VM kapatildiginda + disk unmount edildiginde:**
- .utm dosyasi (VM diski, RAM snapshot, ayarlar) tamamen sifrelenmis
- Sifre olmadan okunamaz
- Forensik analiz bile acamaz (AES-256 = askeri seviye)

---

## RAM TEMIZLIGI SORUSU — ACIKLAMA

**Soru:** VPS ve UTM'de de RAM silmek gerekiyor mu, yoksa host yeterli mi?

| Nerede | Gerekli mi | Neden |
|--------|-----------|-------|
| **Host Mac** | EVET | VM'in tum RAM'i host'un fiziksel RAM'inde tutuluyor. Host temizlenince VM'in RAM'i de gider. |
| **VM icinde** | OPSIYONEL | Eger VM'i "Save State" ile kapatiyorsan (suspend), RAM snapshot .utm dosyasina yazilir. Bu durumda sifrelenmis diskteyse sorun yok. |
| **VPS** | HAYIR | VPS'te kalici is yapiyorsun (web server). RAM temizlemenin anlami yok, zaten LUKS encryption + shred ile kapatma yeterli. |

**Pratik:** Host Mac'te `sudo purge` + sifrelenmis diski unmount et. Bu kadar.

---

## ADIM ADIM — SIMDI NE YAPACAKSIN

Asagida her adim sirali. UTM + Debian + Mullvad zaten kurulu.

### ADIM 1: VM'de Kill Switch Kontrol Et (5 dk)

```bash
# VM'e gir
# VPN calisiyormu kontrol et:
curl https://am.i.mullvad.net/connected
# "You are connected to Mullvad" donmeli

# DNS leak testi:
curl https://am.i.mullvad.net/dns
# Mullvad DNS gostermeli, ISP'n degil

# IP kontrol:
curl https://am.i.mullvad.net/ip
# Gercek IP'n degil, Mullvad IP'si donmeli
```

Kill switch yoksa yukardaki PostUp/PreDown satirlarini ekle.

### ADIM 2: Trust Wallet + Cake Wallet Kur (10 dk)

**Trust Wallet (USDT almak icin):**
1. Telefonuna indir: https://trustwallet.com
2. Yeni cuzdan olustur
3. 12 kelimelik seed phrase'i **KAGIDA** yaz
4. Tron (TRC-20) adresini kopyala → bir yere not et

**Cake Wallet (XMR icin):**
1. Telefonuna indir: https://cakewallet.com
2. Monero cuzdani olustur
3. 25 kelimelik seed phrase'i **KAGIDA** yaz
4. XMR adresini kopyala → bir yere not et

### ADIM 3: NOWPayments Sandbox Test (15 dk)

VM icinden yap (Mullvad acik):

1. https://sandbox.nowpayments.io → hesap ac (Tuta/ProtonMail ile)
2. Email dogrula
3. Store Settings → Outcome wallet: Trust Wallet TRC-20 adresi
4. API Keys → yeni key olustur → kopyala
5. IPN Secret → olustur → kopyala
6. Test:

```bash
# Status kontrol
curl -X GET https://api-sandbox.nowpayments.io/v1/status \
  -H "x-api-key: SANDBOX_KEY_BURAYA"

# Invoice olustur
curl -X POST https://api-sandbox.nowpayments.io/v1/invoice \
  -H "x-api-key: SANDBOX_KEY_BURAYA" \
  -H "Content-Type: application/json" \
  -d '{"price_amount":5,"price_currency":"usd","order_id":"test-001"}'
```

URL donerse → NOWPayments calisiyor.

### ADIM 4: NexaPay Manual Test (10 dk, $5 risk)

Bu adimi OPSEC disinda, normal Mac'inden yapabilirsin (kendi kredi kartinla test):

1. https://nexapay.one → hesap ac
2. Dashboard → Payment Link olustur ($5)
3. Linki ac, kendi kartinla ode
4. Trust Wallet'a USDT geldi mi kontrol et (1-30 dk)
5. **GELDIYSE:** NexaPay kullanilabilir, API key al
6. **GELMEDIYSE:** NexaPay birak, env'de bos birak

### ADIM 5: Supabase Tablolari Olustur (5 dk)

1. https://supabase.com → proje ac (veya yeni olustur)
2. Settings → API → URL + service_role key kopyala
3. SQL Editor → New Query

**getsmsnow.com tablolari:**
```
getsmsnow.com/supabase/migrations/001_initial_schema.sql
```
Dosyanin icerigini SQL Editor'e yapistir → Run

**kart-site tablolari:**
```
kart-site/supabase/migrations/001_referral_system.sql
```
Ayni sekilde yapistir → Run

### ADIM 6: Servury VPS Al (15 dk)

VM icinden (Mullvad acik):

1. https://servury.com/servers/
2. Netherlands → D-200 ($31.18/ay)
3. OS: Debian 12
4. XMR ile ode (Cake Wallet'tan)
5. 32-char credential'i kaydet
6. SSH bilgilerini al (IP + root sifre)

### ADIM 7: VPS'e SSH At ve Kurulum Yap (30 dk)

VM icinden:

```bash
# SSH key olustur (daha once yaptiysana atla)
ssh-keygen -t ed25519 -f ~/.ssh/vps_key

# VPS'e baglan
ssh root@VPS_IP_BURAYA

# ---- VPS ICINDE ----

# Guncelle
apt update && apt upgrade -y

# Araclar
apt install -y ufw fail2ban nginx certbot python3-certbot-nginx \
  git curl wget htop tmux unattended-upgrades

# Otomatik guvenlik guncellemeleri
dpkg-reconfigure -plow unattended-upgrades
# "Yes" sec

# Docker
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
systemctl enable docker

# Deploy kullanicisi
adduser deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh

# SSH guclendir
cat > /etc/ssh/sshd_config.d/hardening.conf << 'EOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
AllowUsers deploy
EOF
systemctl restart sshd

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw default deny incoming
ufw enable

# Docker UFW bypass engelle
cat > /etc/docker/daemon.json << 'EOF'
{"iptables": false}
EOF
systemctl restart docker

# Fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
maxretry = 3
bantime = 86400
EOF
systemctl enable fail2ban
systemctl restart fail2ban
```

**DURDUR — baska terminalden test et:**

```bash
ssh -i ~/.ssh/vps_key deploy@VPS_IP
# Calisiyorsa → devam
```

### ADIM 8: Domain DNS Ayarla (10 dk)

**getsmsnow.com (Namecheap):**
- Namecheap → Domain List → Manage → Advanced DNS
- A Record: `@` → VPS_IP
- A Record: `www` → VPS_IP

**Njalla domainleri (kart + film):**
- njal.la → domain → DNS
- A Record: `@` → VPS_IP
- A Record: `www` → VPS_IP
- A Record: `embed` → VPS_IP (sadece film sitesi domaini)

DNS yayilmasini bekle (5-30 dk):
```bash
dig +short getsmsnow.com
# VPS IP donmeli
```

### ADIM 9: Kodu VPS'e Yukle + Env Doldur (20 dk)

```bash
ssh -i ~/.ssh/vps_key deploy@VPS_IP
cd /home/deploy

# Kodu aktar (private repo ise deploy key olustur once)
git clone https://github.com/KULLANICI/embed-analyzer.git app
cd app

# Env dosyalarini olustur
nano getsmsnow.com/.env.local
# DEPLOY-REHBERI.md Bolum 8'den kopyala, degerleri doldur

nano kart-site/.env.local
nano embed-api/.env
nano NyumatFlix/.env.local
```

### ADIM 10: Docker Build + Calistir (15 dk)

```bash
cd /home/deploy/app
export DB_PASSWORD=$(openssl rand -hex 16)
echo "DB sifresi: $DB_PASSWORD"  # kaydet!

docker compose build --parallel
# 10-15 dk surer

docker compose up -d
docker compose ps
# Tum servisler "Up" olmali
```

### ADIM 11: Nginx + SSL (10 dk)

```bash
# Root olarak:
sudo nano /etc/nginx/sites-available/apps
# DEPLOY-REHBERI.md Bolum 9.4'teki nginx config'i yapistir
# Domain adlarini kendi domainlerinle degistir

sudo ln -s /etc/nginx/sites-available/apps /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot --nginx \
  -d getsmsnow.com \
  -d kartsitesi.com \
  -d filmsitesi.com \
  -d embed.filmsitesi.com \
  --non-interactive --agree-tos -m ops@tuta.io
```

### ADIM 12: Canli Test (10 dk)

Tarayicida ac:
- https://getsmsnow.com → acilmali
- https://kartsitesi.com → acilmali
- https://filmsitesi.com → acilmali

Payment gateway webhook URL'lerini ayarla:
- nowpayments.io → Store Settings → IPN URL: `https://getsmsnow.com/api/nowpayments/webhook`
- Cryptomus → Callback URL: `https://getsmsnow.com/api/cryptomus/webhook`

### ADIM 13: Is Bittiginde Temizlik (2 dk)

```bash
# VM icinde:
~/clean.sh
# (DEPLOY-REHBERI.md Bolum 18'deki script)

# VM'i kapat (shutdown, suspend degil):
sudo shutdown -h now
```

Mac'te:
```bash
# Sifrelenmis diski unmount et:
hdiutil detach /Volumes/OPS
# veya Finder'dan eject

# RAM temizle (opsiyonel):
sudo purge
```

---

## OZET ZAMAN CIZELGESI

| Adim | Is | Sure |
|------|-----|------|
| 1 | Kill switch kontrol | 5 dk |
| 2 | Trust Wallet + Cake Wallet | 10 dk |
| 3 | NOWPayments sandbox test | 15 dk |
| 4 | NexaPay $5 test | 10 dk |
| 5 | Supabase tablolari | 5 dk |
| 6 | Servury VPS al | 15 dk |
| 7 | VPS kurulum | 30 dk |
| 8 | Domain DNS | 10 dk |
| 9 | Kod yukle + env doldur | 20 dk |
| 10 | Docker build + calistir | 15 dk |
| 11 | Nginx + SSL | 10 dk |
| 12 | Canli test | 10 dk |
| 13 | Temizlik | 2 dk |
| **TOPLAM** | | **~2.5 saat** |

DNS yayilma suresi haric (5 dk - 48 saat, genelde 10 dk).
