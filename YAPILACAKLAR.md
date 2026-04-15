# YAPILACAKLAR — Kisa ve Net

---

## ONCE: Odeme Karari

### Kripto odeme (musteri kripto ile oder)

**NOWPayments** — birincil, zaten entegre

| Ozellik | Deger |
|---------|-------|
| Minimum | **~$2** (LTC, TRX, XLM, XRP ile) |
| Fee | %0.5 |
| KYC | Email ile kayit, merchant KYC yok |
| $2-3 bakiye yukleme | **EVET** — LTC veya TRX ile mumkun |

### Fiat odeme (musteri kart ile oder)

**BucksBus** — yeni entegre edilecek

| Ozellik | Deger |
|---------|-------|
| Minimum | **~$10-20** (onramp provider'a bagli — Simplex, MoonPay vb.) |
| Fee | $0.7/islem + onramp fee (~%3-5) |
| KYC | Email ile kayit, merchant KYC yok |
| $2-3 bakiye yukleme | **HAYIR** — kart ile minimum ~$10-20 (provider limiti) |

### Sonuc

```
$2-3 yukleme isteyenler → kripto ile (NOWPayments, LTC/TRX)
$10+ yukleme isteyenler → kart ile (BucksBus) veya kripto ile
```

Musteriye ikisini de sun: "Pay with Crypto (min $2)" + "Pay with Card (min $10)"

---

## TEST PLANI (para kaybetmeden)

### 1. NOWPayments test (0 risk)

NOWPayments **sandbox** modu var:
```
1. nowpayments.io → hesap ac (email ile)
2. Dashboard → Sandbox mode ON
3. Test API key al
4. getsmsnow.com'da .env'e NOWPAYMENTS_API_KEY=sandbox_key_xxx koy
5. Sahte odeme yap — gercek para harcanmaz
6. Webhook geldi mi, siparis onaylandi mi kontrol et
7. Calisiyor → Production API key'e gec
```

### 2. BucksBus test (max $5 risk)

BucksBus'ta sandbox yok, gercek odeme lazim:
```
1. bucksbus.com → email ile kayit ol
2. Dashboard'dan USDT.TRC20 wallet olustur
3. API key + secret al
4. $5'lik test odemesi yap (kendi kartinla)
5. USDT cuzdanina geldi mi kontrol et
6. Geldi → entegrasyonu yap
7. Gelmedi → BucksBus'i birak, PayGate.to dene
```

### 3. BucksBus olmadi → yedek test (max $5)

```
PayGate.to → signup yok, wallet adresi gir
$5 test → geldi mi kontrol et
```

---

## DEPLOY PLANI (adim adim)

### Adim 0: UTM'den VPS'e kod gonderme

```bash
# UTM (Debian VM) icinde:

# 1. Git kur
sudo apt update && sudo apt install -y git

# 2. SSH key olustur
ssh-keygen -t ed25519 -C "deploy"

# 3. Public key'i VPS'e kopyala
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@VPS_IP

# 4. Repoyu UTM'ye clone'la (host'tan USB veya scp ile)
# Host Mac'ten UTM'ye:
scp -r /Users/eceseckin/embed-analyzer user@UTM_IP:~/embed-analyzer

# 5. UTM'den VPS'e gonder
scp -r ~/embed-analyzer root@VPS_IP:~/embed-analyzer

# VEYA: GitHub/GitLab private repo kullan
# UTM'de: git push → VPS'te: git pull
```

### Adim 1: Servury VPS al

```
1. Mullvad VPN ac (UTM icinde)
2. servury.com → VPS sec
   - 4 GB RAM, 2 vCPU, 80 GB SSD (~$15-20/ay)
   - Debian 12
   - Kripto ile ode (XMR veya BTC)
3. VPS IP adresini not et
4. SSH ile baglan: ssh root@VPS_IP
```

### Adim 2: Residential IP al

```
1. servury.com → Residential proxy sec
2. Kripto ile ode
3. Proxy bilgilerini not et (ip:port:user:pass)
4. Sosyal medya hesaplari icin kullanacaksin (Reddit, Telegram vb.)
```

### Adim 3: VPS'i hazirla

```bash
# SSH ile VPS'e baglan
ssh root@VPS_IP

# Temel kurulum
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git ufw fail2ban

# Firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# Docker UFW fix
echo '{"iptables": false}' > /etc/docker/daemon.json
systemctl restart docker
```

### Adim 4: Domainleri DNS'e bagla

```
Her domain icin A record:
  getsmsnow.com    → VPS_IP
  kartsite.com     → VPS_IP
  nyumatflix.com    → VPS_IP
  embedsite.com    → VPS_IP
```

### Adim 5: Kodu VPS'e gonder + env'leri doldur

```bash
# UTM'den VPS'e (veya git pull)
scp -r ~/embed-analyzer root@VPS_IP:~/embed-analyzer

# VPS'te env dosyalarini doldur
cd ~/embed-analyzer
cp getsmsnow.com/.env.example getsmsnow.com/.env
cp kart-site/.env.example kart-site/.env
cp NyumatFlix/.env.local.example NyumatFlix/.env.local
cp embed-api/.env.example embed-api/.env

# nano veya vim ile her .env'i doldur
# NOWPayments API key, Supabase URL, BucksBus key vb.
```

### Adim 6: Docker build + deploy

```bash
cd ~/embed-analyzer
docker compose up -d --build

# Kontrol
docker compose ps  # 4 servis + db + nginx calisiyor mu
```

### Adim 7: SSL

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d getsmsnow.com -d kartsite.com -d nyumatflix.com -d embedsite.com
```

### Adim 8: Test

```
Tarayicida ac:
  https://getsmsnow.com  → calisiyor mu?
  https://kartsite.com   → calisiyor mu?
  https://nyumatflix.com  → calisiyor mu?
  https://embedsite.com  → calisiyor mu?

Odeme testi:
  NOWPayments → sandbox ile test et
  BucksBus → $5 gercek test
```

### Adim 9: SEO + ilk musteriler

```
1. Her site icin 5 blog yazisi yaz (SEO)
2. Reddit'te 5-10 yardimci yorum birak
3. Telegram gruplarina katil
4. Bekle — ilk musteri 1-7 gun icinde gelir
```

---

## ZAMAN TAHMINI

| Adim | Sure |
|------|------|
| Servury VPS + residential IP al | 30 dk |
| VPS hazirla (docker, ufw, fail2ban) | 30 dk |
| DNS ayarla | 10 dk |
| Kod gonder + env doldur | 30 dk |
| Docker build + deploy | 20 dk |
| SSL | 10 dk |
| Test | 30 dk |
| **TOPLAM** | **~3 saat** |

---

## ENV DOLDURMA REHBERI

### getsmsnow.com/.env

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
NOWPAYMENTS_API_KEY=xxx          ← nowpayments.io dashboard'dan
NOWPAYMENTS_IPN_SECRET=xxx       ← nowpayments.io → IPN settings
BUCKSBUS_API_KEY=xxx             ← bucksbus.com dashboard'dan
BUCKSBUS_API_SECRET=xxx          ← bucksbus.com dashboard'dan
NEXT_PUBLIC_SITE_URL=https://getsmsnow.com
```

### kart-site/.env

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
NOWPAYMENTS_API_KEY=xxx
NOWPAYMENTS_IPN_SECRET=xxx
BUCKSBUS_API_KEY=xxx
BUCKSBUS_API_SECRET=xxx
NEXT_PUBLIC_SITE_URL=https://kartsite.com
```

### NyumatFlix/.env.local

```
TMDB_API_KEY=xxx                 ← themoviedb.org'dan al (ucretsiz)
NEXT_PUBLIC_SITE_URL=https://nyumatflix.com
```

### embed-api/.env

```
DATABASE_URL=postgresql://user:pass@db:5432/embed
PORT=3001
```
