# OPSEC, Kripto, Hesap Yonetimi ve Operasyon Rehberi

> Tum projeler icin (kart-site, getsmsnow, embed, nyumatflix) tek kaynak.

---

## 1. GROK KONUSMASI ANALIZI

### Dogru Olan Noktalar:
- Dark mode varsayilan olmali — bu nis icin standart
- Minimal kayit, hizli "time-to-value" — %100 dogru
- Mobile-first + desktop onemli — dogru
- Trust badge'ler (No KYC, Instant, Crypto Only) — zorunlu
- Her site bagimsiz ama arka planda ortak altyapi — en iyi strateji
- Progressive disclosure (yeni kullanici basit, power user gelismis) — dogru
- SMS sitesi en kolay para doner — dogru

### Yanlis veya Abartili Noktalar:
- "ShadowForge / PhantomHub" isimleri — cok "hacker" hissi, musteyi korkutur
- "Canlı sayaç: 12.458 numbers sold today" — sahte gorunu riski, basta yapma
- "3 siteyi tek platform altinda birlestir" — BASLANGIÇTA yanlis, buyuyunce dusunulur
- "Takım lazım" — hayir, tek kisi MVP cikabilir (bizim projeler bunu kanitliyor)
- "Monero en oncelikli olsun" — hayir, NOWPayments ile tum kriptolar desteklenmeli

### Bizim Siteler Nasil Gorunmeli:

```
KART SITESI (ornek: VeilCard)
├── Ana sayfa: temiz, koyu tema, 2 kart tipi (NEXUS + OMNI)
├── Buyuk CTA: "Get Your Card" 
├── Trust: "No KYC • Instant • Crypto Funded • Visa/MC"
├── Fiyat tablosu acik ve net
├── Register/Login → Dashboard → Buy Card → Kart bilgileri
└── Minimal, 3-4 sayfa yeterli

SMS SITESI (getsmsnow.com)
├── Zaten prod'da, rakip analizi yapildi
├── Eksik: daha iyi onboarding, success rate gosterimi
└── Sonraki adim: KART-RAKIP-ANALIZI dokumani takip et

EMBED + FILM SITELERI
└── Phase 2 — once kart ve SMS tamamlansin
```

---

## 2. SIFRELENMIS DISK + VM KURULUMU

### Yeni AES-256 Disk Olusturma:
1. Disk Utility → File → New Image → Blank Image
2. Size: 50GB, Format: APFS, Encryption: 256-bit AES
3. Image Format: sparse disk image
4. Sifre belirle — Keychain'e KAYDETME
5. .sparseimage dosyasi olusur

### Debian 12 UTM Indirme:
- https://mac.getutm.app/gallery/debian-12
- ARM64, 4GB RAM, 64GB disk
- Login: debian / debian
- Zip'i ac, .utm dosyasini sifrelenmis diske tasi

### Kullanim Rutini:
```
BASLANGIC:
  .sparseimage cift tikla → sifre gir → mount
  UTM ac → VM baslat → Mullvad VPN ac (VM icinde)
  Isini yap

BITIS:
  VM kapat → UTM kapat → Finder'da disk Eject
  Sifresiz erisilemez
```

### Eski Disk Silme:
- Cmd+Opt+Delete = aninda siler (cop kutusuna gitmez)
- TRIM otomatik temizler (Apple Silicon)
- Ekstra: `dd if=/dev/urandom of=~/fillfile bs=1m count=5000 && rm ~/fillfile`
- Yeni VM sifrelenmis diskte = eski veri onemli degil

---

## 3. ANONIM HESAP ZINCIRI (TELEFON GEREKMEZ)

### VPN + OTP Sorunu:
VPN acikken Google/WhatsApp/bazi platformlar OTP gondermiyor.
COZUM: Telefon/Google gerektiren platformlari KULLANMA.

### Hesap Olusturma Sirasi:

```
ADIM 1: TUTA MAIL (anonim email)
  → tutamail.com veya tuta.com
  → VPN ACIK iken kayit ol
  → Telefon GEREKMEZ
  → Ornek: projead2026@tutamail.com

ADIM 2: GITHUB (kod deposu + Supabase login)
  → github.com → Sign Up
  → Tuta email kullan
  → Telefon GEREKMEZ (baslangicta)
  → VPN ACIK iken yapilabilir

ADIM 3: SUPABASE (veritabani)
  → supabase.com → "Continue with GitHub"
  → Google hesabi GEREKMEZ
  → Telefon GEREKMEZ
  → Proje olustur, migration calistir

ADIM 4: NOWPAYMENTS (kripto odeme)
  → nowpayments.io → Sign Up
  → Tuta email ile kayit
  → Telefon GEREKMEZ
  → KYC GEREKMEZ (kripto-only)

ADIM 5: BUVEI (kart provider)
  → buvei.com → Sign Up
  → Email ile kayit
  → Telefon GEREKMEZ
  → $5 hediye kredi gelir

ADIM 6: NJALLA (domain)
  → njalla.com → kayit
  → XMR ile ode
  → Hicbir kimlik bilgisi gerekmez

ADIM 7: SERVURY (VPS)
  → servury.com
  → Kripto ile ode
  → KYC yok
```

**HICBIR ADIMDA TELEFON NUMARASI GEREKMEZ.**

---

## 4. KRIPTO ODEMELERIN BLOCKCHAIN GORUNURLUGU

### Sorun:
NOWPayments uzerinden musteriden gelen BTC/ETH/USDT odemeleri
blockchain'de **herkese acik** gorunur. TrustWallet'e gelen
paralar izlenebilir.

### Cozum Katmanlari:

```
MUSTERI → NOWPayments → [dönüsüm] → SENIN CUZDANIN

Katman 1: NOWPayments otomatik donusum
  → Musteri BTC gonderir, sen XMR olarak alirsin
  → NOWPayments "auto-convert" ozelligi var
  → XMR = izlenemez blockchain

Katman 2: Monero (XMR) kullan
  → Odeme alirken XMR sec
  → XMR blockchain'de gonderici/alici/miktar GORUNMEZ
  → En iyi gizlilik

Katman 3: Cuzdanlari ayir
  → TrustWallet'i is icin KULLANMA
  → Is icin ayri XMR cuzdani:
    - Feather Wallet (masaustu, en guvenli)
    - Cake Wallet (mobil)
  → Kisisel kripton ile karistirma

Katman 4: Gerekirse mixer/swap
  → XMR → BTC cevirmek istersen: ChangeNow, Trocador
  → KYC yok, VPN ile kullan
  → Kucuk miktarlarda yap
```

### Onerilen Akis:

```
NOWPayments'te ayar:
  Outcome Currency: XMR (Monero)
  Outcome Wallet: Feather Wallet adresi (VM icinden olustur)

Musteri ne gonderirse gondersin (BTC, ETH, USDT, LTC)
→ NOWPayments otomatik XMR'ye cevirir
→ Feather Wallet'e gelir
→ Blockchain'de GORUNMEZ

Harcamak istersen:
  XMR → Trocador → BTC/USDT → baska cuzdana
  veya dogrudan XMR kabul eden yerlerde harca
```

### .env'de Degisiklik:
NOWPayments dashboard'unda:
- **Outcome Currency**: XMR sec
- **Outcome Wallet**: Feather Wallet XMR adresi koy
- Kod degisikligi GEREKMEZ — NOWPayments backend'de halleder

---

## 5. MARKETING HESAPLARI — BUYUK SORUN VE COZUMU

### ANA SORUN:
```
Reklam/marketing icin su platformlara ihtiyac var:
  → Google (YouTube, Ads, Search Console)
  → Facebook / Instagram (Meta)
  → X (Twitter)
  → Reddit
  → Telegram
  → TikTok

SORUN ZİNCİRİ:
  Facebook → Google hesabi veya telefon istiyor
  Instagram → Facebook/Meta hesabi istiyor → Google/telefon
  X → Telefon veya email istiyor (telefon tercih ediyor)
  Google → TELEFON NUMARASI ZORUNLU + OTP
  TikTok → Telefon veya email (bazen telefon zorunlu)

VPN + OTP SORUNU:
  Google, VPN acikken OTP GONDERMIYOR.
  WhatsApp, VPN acikken OTP GONDERMIYOR.
  Facebook, VPN acikken supheli aktivite diyor.
  → Yani VPN aciksan numara olsa bile dogrulama YAPAMAZSIN.
```

### COZUM: RESIDENTIAL PROXY + GECICI NUMARA

```
NEDEN VPN DEGIL DE RESIDENTIAL PROXY?

VPN IP'leri → Datacenter IP, platformlar BILIYOR, engelliyor
Residential IP → Gercek ev internet IP'si, platform ayirt EDEMIYOR

Servury residential proxy aldiginda:
  → IP adresi normal bir ev kullanicisi gibi gorunur
  → Google, Facebook, X → OTP gondermekten cekinmez
  → VPN'den FARKLI — platformlar bunu engelleyemez
```

### ADIM ADIM: GOOGLE HESABI OLUSTURMA

```
ONHAZIRLIK:
  1. Servury'den residential proxy al (kripto ile)
  2. VM icinde proxy'yi ayarla (SOCKS5 veya HTTP)
     → Firefox: Settings → Network → Manual Proxy
     → veya sistem genelinde: export https_proxy=...
  3. Mullvad VPN'i KAPAT (proxy yeterli, VPN ile carpismaz)

ADIM 1: Gecici numara al
  → getsmsnow.com (kendi siten) veya smspool.net
  → "Google" servisini sec
  → Ulke: ABD veya Ingiltere (en yuksek basari orani)
  → ~$0.30 - $1.00
  → Numara gelince BEKLE, hemen kullan

ADIM 2: Google "QR kod tara" engelini as
  → Google bazen "telefonundan su QR kodu tara" diyor
  → Bu yeni cihaz dogrulama, ATLANAMAZ gibi gorunur ama:

  YONTEM A: "Try another way" / "Baska yontem dene" tikla
    → Bazen SMS secenegi cikar, gecici numara ile dogrula

  YONTEM B: User-Agent degistir (en garanti)
    → Firefox → about:config → general.useragent.override
    → Su degeri yapistir:
      Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36
    → Eski Chrome versiyonu QR SORMAZ, SMS/telefon dogrulama gosterir
    → Hesap actiktan sonra user-agent'i sifirla (degeri sil)

  YONTEM C: Mobil tarayici simule et
    → Firefox → F12 → Responsive Design Mode → telefon sec (iPhone/Pixel)
    → Google mobilde QR SORMAZ, direkt SMS OTP sorar

  YONTEM D: Android emulator (en garanti)
    → VM icinde Waydroid veya Android-x86 kur
    → Google hesabini Android uzerinden ac
    → QR HIC SORMUYOR, direkt SMS OTP

ADIM 3: Google hesabi olustur
  → accounts.google.com → "Create account"
  → Rastgele isim-soyisim (gercek olmasin)
  → Gmail adresi sec (rastgele)
  → Sifre belirle (guclu, farkli)
  → Telefon numarasi iste → gecici numarayi gir
  → !! RESIDENTIAL PROXY ACIK OLMALI — yoksa OTP gelmez !!
  → OTP gelince gir, dogrula

ADIM 3: Hesabi guvene al
  → 2FA ekle: Google Authenticator DEGIL → Aegis veya Ente Auth
  → Recovery email: Tuta mail adresini koy
  → Recovery phone: EKLEME veya gecici numara birak

ADIM 4: Telefon numarasini kaldir
  → myaccount.google.com → Security → Phone
  → Numarayi sil (artik 2FA authenticator'dan geliyor)
  → Gecici numara zaten 15-20 dk sonra gecersiz olacak

ADIM 5: Bu hesabi SADECE marketing icin kullan
  → VM icinden giris yap (residential proxy ile)
  → Host cihazdan GIRIS YAPMA
  → Kisisel Google hesabinla AYNI TARAYICIDA OLMA
  → Her giris residential proxy uzerinden olsun
```

### ADIM ADIM: FACEBOOK / INSTAGRAM HESABI

```
Facebook ikisi icin de gerekli (Instagram = Meta).

ADIM 1: Residential proxy ACIK olmali (Servury)

ADIM 2: Gecici numara al
  → getsmsnow.com → "Facebook" servisi sec
  → ABD veya Ingiltere numarasi

ADIM 3: facebook.com → Kayit ol
  → Rastgele isim (gercek gorunen ama sahte)
  → Gecici numara ile dogrula
  → VEYA: Once Google hesabi olusturduysan Gmail ile kayit ol
  → Profil resmi ekle (AI-generated yuz: thispersondoesnotexist.com)

ADIM 4: Instagram baglantisi
  → Instagram'a Facebook hesabi ile giris yap
  → Veya ayri email ile kayit ol

ADIM 5: Hesabi isindir (onemli!)
  → Ilk 1-2 hafta REKLAM YAPMA
  → Normal paylasimlarda bulun, birkac kisi takip et
  → Yoksa hesap "bot" olarak isaretlenir ve kapanir

!! DIKKAT: Facebook en zor platform. Hesap kapanma riski yuksek.
   Birden fazla yedek hesap olustur. !!
```

### ADIM ADIM: X (TWITTER) HESABI

```
ADIM 1: Residential proxy ACIK

ADIM 2: x.com → Kayit ol
  → Email ile kayit (Tuta mail veya yeni Gmail)
  → Bazen telefon istiyor → gecici numara kullan
  → Residential proxy ile OTP gelir

ADIM 3: Hesabi isindir
  → 1 hafta normal kullanim (retweet, begen, takip et)
  → Sonra kendi iceriklerini paylas

ADIM 4: Twitter Blue/Premium ALMA
  → Odeme bilgisi istiyor, OPSEC kirar
  → Ucretsiz hesap yeterli
```

### ADIM ADIM: REDDIT HESABI

```
!! REDDIT EN KOLAY — TELEFON VE GOOGLE GEREKMEZ !!

ADIM 1: VPN ACIK kalabilir (Reddit VPN engellemez)
ADIM 2: reddit.com → Sign Up → Email ile (Tuta mail)
ADIM 3: Telefon GEREKMEZ
ADIM 4: Karma kas:
  → r/AskReddit, r/memes gibi buyuk subreddit'lere yorum yap
  → 1-2 hafta, 100+ karma topla
  → Sonra kendi sitelerini tanitabilirsin
  → r/privacy, r/VPN, r/crypto gibi yerlerde paylas
```

### ADIM ADIM: TELEGRAM HESABI

```
ADIM 1: Gecici numara al
  → getsmsnow.com → "Telegram" servisi sec
  → Herhangi bir ulke (~$0.20-$0.50)

ADIM 2: Telegram masaustu uygulamasi (VM icinde)
  → Numara ile kayit ol
  → OTP SMS ile gelir (VPN acikken bile Telegram OTP gonderir)

ADIM 3: Gizlilik ayarlari
  → Settings → Privacy → Phone Number → Nobody
  → Settings → Privacy → Last Seen → Nobody
  → Username belirle (numara yerine bu gorunecek)

ADIM 4: Gecici numara suresi dolunca bile hesap KALIR
  → Telegram bir kez dogruladiktan sonra numara gerekmez
  → 2FA ekle (sifre): Settings → Privacy → Two-Step Verification
```

### ADIM ADIM: TIKTOK HESABI

```
ADIM 1: Residential proxy ACIK (TikTok VPN algilar)

ADIM 2: tiktok.com → Sign Up
  → Email ile kayit (Tuta veya Gmail)
  → Bazen telefon istiyor → gecici numara
  → Yas 18+ sec

ADIM 3: Hesabi isindir (2-3 gun normal kullan)
ADIM 4: Icerik yukle
```

### OZET TABLO:

```
PLATFORM     | TELEFON  | GOOGLE  | VPN ENGEL | COZUM
-------------|----------|---------|-----------|------------------
Google       | ZORUNLU  | -       | EVET      | Residential proxy + gecici numara
Facebook     | ZORUNLU  | Opsiyonel| EVET     | Residential proxy + gecici numara
Instagram    | Facebook | Facebook| EVET      | Facebook uzerinden
X (Twitter)  | Bazen    | Hayir   | BAZEN     | Email veya gecici numara
Reddit       | HAYIR    | Hayir   | HAYIR     | Tuta email yeterli
Telegram     | ZORUNLU  | Hayir   | HAYIR     | Gecici numara (VPN ile calısır)
TikTok       | Bazen    | Hayir   | EVET      | Residential proxy + email/numara
```

### KRITIK KURALLAR:

```
1. RESIDENTIAL PROXY SART — VPN ile Google/FB/TikTok hesap ACILMAZ
2. Her platform icin FARKLI gecici numara kullan (ayni numarayi paylasma)
3. Hesaplari ISINDIRMADAN reklam yapma (1-2 hafta normal kullan)
4. Tum hesaplara SADECE VM icinden giris yap
5. Host cihazdan HICBIR is hesabina giris YAPMA
6. Yedek hesaplar olustur (ozellikle Facebook, kapanma riski yuksek)
7. AI profil resimleri kullan (thispersondoesnotexist.com)
8. Metadata temizle: paylasacagin gorsel/videoda EXIF verisi sil
   → exiftool -all= dosya.jpg (VM icinde kur: sudo apt install exiftool)
9. Gecici numaralar 15-20 dk gecerli — hizli islem yap
10. 2FA icin HER YERDE Aegis/Ente Auth kullan, SMS 2FA KULLANMA
```

---

## 6. TEST vs PROD — OPSEC NE ZAMAN BASLAR?

### Test asamasinda OPSEC sart mi?
HAYIR. Test sirasinda kisisel hesaplarini kullanabilirsin.

### Ayni NOWPayments API key'i birden fazla sitede kullanilir mi?
EVET. Sorun olmaz. Webhook URL'leri farkli, order_id formatlari farkli.
Tek hesaptan iki site icin odeme alabilirsin.

### Prod'a gecerken ne degisecek?
```
TEST (simdi)              →    PROD (gelecekte)
─────────────────────────────────────────────────
Kisisel email             →    Tuta Mail (anonim)
Kisisel GitHub            →    Yeni GitHub (Tuta ile)
Mevcut Supabase           →    Yeni Supabase projesi
Mevcut NOWPayments        →    Yeni NOWPayments hesabi
Vercel (.vercel.app)      →    Servury VPS + Njalla domain
Kisisel IP                →    Residential proxy + VPN
```

### Guclu birimler eski test'ten yeni prod'a baglanti kurabilir mi?
HAYIR. Cunku:
- API key degisir
- Domain degisir
- IP adresi degisir
- Email degisir
- VPS saglayici degisir
- Hicbir ortak teknik nokta kalmaz

Tek kosul: Vercel'deki test deploy'u SIL, eski Supabase projesini SIL.

### VERCEL TEST DEPLOY

Sakincasi yok, su sartlarla:
- Kendi domain'ini baglama, .vercel.app subdomain kullan
- Gercek musteri verisi girme
- Prod'a gecince Vercel deploy'u sil

Deploy komutu:
```bash
cd kart-site
vercel --prod
```

---

## 7. PROD DEPLOY PLANI (SERVURY VPS)

```
1. Njalla'dan domain al (XMR)
2. Servury'den VPS al (kripto)
3. VPS kur: Debian 12 + Node 22 + Nginx + Certbot
4. DNS: Njalla → VPS IP
5. Projeyi VPS'e gonder + build
6. Nginx reverse proxy + SSL
7. Systemd ile surekli calistir
8. NOWPayments webhook URL'i guncelle
```

---

## 8. PARA AKISI OZET

```
MUSTERI
  ↓ BTC/ETH/USDT/LTC gonderir
  ↓
NOWPAYMENTS
  ↓ Otomatik XMR'ye cevirir
  ↓
FEATHER WALLET (senin, VM icinde)
  ↓ Izlenemez (Monero)
  ↓
HARCAMA:
  ├── XMR kabul eden yerlerde dogrudan harca
  ├── Trocador → BTC/USDT → baska cuzdana
  └── Servury/Njalla/Buvei odemelerinde kullan
```

---

## KONTROL LISTESI

### Altyapi:
- [ ] Sifrelenmis disk olustur (AES-256)
- [ ] Debian 12 UTM indir, diske koy
- [ ] Tuta Mail hesabi ac
- [ ] GitHub hesabi ac (Tuta ile)
- [ ] Servury residential proxy al (kripto ile)

### Platform Hesaplari (is icin):
- [ ] Supabase'e GitHub ile giris, proje olustur
- [ ] NOWPayments hesabi ac, outcome=XMR ayarla
- [ ] Feather Wallet kur (VM icinde), XMR adresi al
- [ ] Buvei'ye kayit ol, API basvurusu yap
- [ ] Njalla'dan domain al (XMR)
- [ ] Servury VPS al (kripto)

### Marketing Hesaplari (residential proxy + gecici numara ile):
- [ ] Google/Gmail hesabi ac (residential proxy + gecici numara)
- [ ] Facebook hesabi ac (residential proxy + gecici numara)
- [ ] Instagram hesabi ac (Facebook uzerinden)
- [ ] X (Twitter) hesabi ac (email veya gecici numara)
- [ ] Reddit hesabi ac (Tuta email, VPN ile olur)
- [ ] Telegram hesabi ac (gecici numara, VPN ile olur)
- [ ] TikTok hesabi ac (residential proxy + email)
- [ ] Tum hesaplari 1-2 hafta isindir (reklam YAPMA)

### Deploy:
- [ ] Kart sitesini Vercel'e test deploy et
- [ ] Kart sitesini VPS'e deploy et (prod)
- [ ] NOWPayments webhook URL guncelle
- [ ] Test odeme yap

### EXIF / Metadata:
- [ ] VM'ye exiftool kur: sudo apt install libimage-exiftool-perl
- [ ] Her paylasim oncesi: exiftool -all= dosya.jpg
