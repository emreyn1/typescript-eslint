# Affiliate + İzle & Kazan Sistemi

> 10 seviyeli referral + izleme ödülü — film sitesi ve embed servisi için.

---

## Genel Bakış

```
İki sistem birlikte çalışır:

1. REFERRAL (Affiliate)
   → Kullanıcı arkadaşını davet eder
   → Arkadaş üye olur/izler → davet eden puan kazanır
   → 10 seviye derinlikte zincirleme komisyon
   → Viral büyüme motoru

2. İZLE & KAZAN (Watch-to-Earn)
   → Kullanıcı film/dizi izler → puan kazanır
   → Puanlar VIP (reklamsız) saat, kripto, veya embed kredisine dönüşür
   → Kullanıcıyı geri getirme motoru (retention)

Her ikisi de aynı puan sistemi üzerinde çalışır: "Coin" (veya istediğin isim).
```

---

## Puan Ekonomisi

```
1 Coin = yaklaşık $0.001 (1000 Coin = $1)

KAZANMA YOLLARI:
  İzleme:          1 Coin / 10 dakika izleme (max 30 Coin/gün)
  Kayıt bonusu:    50 Coin (ilk kayıtta)
  Günlük giriş:    5 Coin
  Referral:        Aşağıdaki tabloya bak

HARCAMA YOLLARI:
  VIP 1 saat:      100 Coin (reklamsız 1 saat izleme)
  VIP 1 gün:       500 Coin
  VIP 1 ay:        5,000 Coin
  Kripto çekim:    10,000 Coin minimum ($10) → USDT/Monero

MALİYET ANALİZİ:
  Bir kullanıcı günde max 30 Coin kazanır = $0.03/gün
  Bu kullanıcının reklam geliri = ~$0.04-0.10/gün (pop-under + impression)
  Net: Kullanıcı başına günde $0.01-0.07 kâr (puan verdikten sonra bile)
  Puanlar reklamsız izlemeye harcanırsa → reklam maliyeti $0 (sadece bant genişliği)
```

---

## 10 Seviyeli Referral Sistemi

```
Seviye   İlişki                    Komisyon     Örnek
──────────────────────────────────────────────────────────────
1        Direkt davet ettiğin       %20          Sen → Ali
2        Ali'nin davet ettiği       %10          Sen → Ali → Veli
3        Veli'nin davet ettiği      %5           Sen → Ali → Veli → Ayşe
4                                   %3
5                                   %2
6                                   %1
7                                   %0.5
8                                   %0.5
9                                   %0.25
10                                  %0.25
──────────────────────────────────────────────────────────────
Toplam seviye başına max:           %42.5        (teorik, pratikte daha az)

Komisyon neyin üzerinden:
  → Davet edilen kişinin KAZANDIĞI puanların yüzdesi
  → Doğrudan senin bakiyene eklenir
  → Davet edilenin puanı AZALMAZ (komisyon sistemden karşılanır)

ÖRNEK SENARYO:
  Sen 10 kişi davet ettin (Seviye 1).
  Her biri 5 kişi davet etti (Seviye 2). → 50 kişi.
  Her biri 3 kişi davet etti (Seviye 3). → 150 kişi.

  Toplam ağın: 10 + 50 + 150 = 210 kişi.

  Her kişi günde 30 Coin kazanıyorsa:
    Seviye 1: 10 × 30 × %20 = 60 Coin/gün
    Seviye 2: 50 × 30 × %10 = 150 Coin/gün
    Seviye 3: 150 × 30 × %5 = 225 Coin/gün
    TOPLAM: 435 Coin/gün = ~$0.44/gün = ~$13/ay

  1000 kişilik ağ → ~$60/ay pasif gelir
  10000 kişilik ağ → ~$600/ay pasif gelir

BU KULLANICIYI MOTİVE EDER:
  "Arkadaşlarını davet et, onlar izledikçe sen kazan."
  Kullanıcı kendi çıkarı için siteyi yayar → ücretsiz pazarlama.
```

---

## Teknik Implementasyon

### Veritabanı şeması (Drizzle ORM ile)

```typescript
// db/schema.ts'e eklenecek tablolar

export const referralCodes = pgTable("referral_code", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),   // 8 haneli benzersiz kod: "A3X9K2M1"
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const referralTree = pgTable("referral_tree", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  referrerId: text("referrerId").notNull().references(() => users.id),
  level: integer("level").notNull(),       // 1-10
  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => [unique().on(table.userId, table.referrerId)]);

export const coinBalance = pgTable("coin_balance", {
  userId: text("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  totalEarned: integer("totalEarned").notNull().default(0),
  totalSpent: integer("totalSpent").notNull().default(0),
  totalWithdrawn: integer("totalWithdrawn").notNull().default(0),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const coinTransactions = pgTable("coin_transaction", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),            // pozitif: kazanç, negatif: harcama
  type: text("type").notNull()
    .$type<"watch" | "referral" | "signup_bonus" | "daily_login" | "vip_purchase" | "withdrawal">(),
  sourceUserId: text("sourceUserId"),              // referral komisyonu ise kimden geldi
  referralLevel: integer("referralLevel"),          // referral ise hangi seviye (1-10)
  description: text("description"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const watchSessions = pgTable("watch_session", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: integer("contentId").notNull(),
  mediaType: text("mediaType").notNull().$type<"movie" | "tv">(),
  watchedMinutes: integer("watchedMinutes").notNull().default(0),
  coinsEarned: integer("coinsEarned").notNull().default(0),
  fingerprint: text("fingerprint"),                // doğrulama için
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const withdrawals = pgTable("withdrawal", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),             // Coin miktarı
  usdAmount: text("usdAmount").notNull(),          // Dolar karşılığı
  currency: text("currency").notNull().$type<"usdt" | "xmr" | "btc">(),
  walletAddress: text("walletAddress").notNull(),
  status: text("status").notNull().default("pending")
    .$type<"pending" | "processing" | "completed" | "rejected">(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  processedAt: timestamp("processedAt"),
});
```

### Referral kayıt akışı

```
Kullanıcı siteye gelir: https://streamvault.example/?ref=A3X9K2M1

1. ref parametresi cookie'ye kaydedilir (30 gün)
2. Kullanıcı üye olur (magic link veya bir sonraki adımda eklenecek Google/Discord login)
3. Kayıt anında:
   a) ref cookie'sinden referral kodu okunur
   b) Davet edenin userId'si bulunur
   c) referral_tree tablosuna eklenir:
      - Seviye 1: yeni kullanıcı → davet eden
      - Seviye 2: yeni kullanıcı → davet edenin davet edeni
      - ... Seviye 10'a kadar
   d) Yeni kullanıcıya 50 Coin kayıt bonusu verilir
   e) Davet edene 50 × %20 = 10 Coin referral bonusu verilir
   f) Yeni kullanıcı için benzersiz referral kodu üretilir

Referral zinciri nasıl oluşturulur (kayıt anında):
  → Davet eden kişinin kendi referral zincirini oku (seviye 1-9)
  → Her birini +1 seviye yaparak yeni kullanıcıya ekle
  → Sonuç: yeni kullanıcının 10 seviye üstüne kadar bağlantısı var
```

p### İzle & Kazan doğrulama

```
SORUN: Kullanıcı videoyu açıp bırakabilir, bot hesap açabilir.
ÇÖZÜM: Çok katmanlı doğrulama.

1. Heartbeat sistemi:
   → Player her 60 saniyede bir sunucuya sinyal gönderir
   → Sinyal içeriği: { userId, contentId, timestamp, fingerprint }
   → 10 dakikada 10 heartbeat gelmezse → izleme sayılmaz
   → Heartbeat'ler tarayıcı focus kontrolü yapar (tab arka plandaysa göndermez)

2. Fingerprint doğrulama:
   → Her heartbeat'te fingerprint gönderilir
   → Aynı fingerprint ile birden fazla hesap varsa → ödül verilmez
   → Canvas + WebGL + timezone + dil kombinasyonu

3. Turnstile challenge:
   → Her 30 dakikada bir Cloudflare Turnstile görünür
   → Çözülmezse izleme puanı durur (video durmaz, sadece puan)
   → Bot'lar Turnstile'ı çözemez

4. Günlük limit:
   → Maksimum 30 Coin/gün (300 dakika = 5 saat izleme)
   → Limit aşılırsa puan verilmez, video normal oynar
   → Bu hem fraud'u önler hem de puan ekonomisini korur

5. IP bazlı rate limit:
   → Aynı IP'den max 3 hesap kazanabilir
   → VPN kullanımı fingerprint ile tespit edilir (WebRTC leak check)
```

### API Endpoint'leri (embed-api'ye eklenecek)

```
GET  /api/v1/user/balance          → { balance, totalEarned, rank }
GET  /api/v1/user/referral-code    → { code: "A3X9K2M1", link: ".../?ref=A3X9K2M1" }
GET  /api/v1/user/referral-tree    → { level1: 12, level2: 45, ... , totalNetwork: 210 }
GET  /api/v1/user/transactions     → [{ type, amount, date, ... }]
POST /api/v1/watch/heartbeat       → { contentId, fingerprint, timestamp }
POST /api/v1/coins/spend           → { type: "vip_1h" | "vip_1d" | "vip_1m" }
POST /api/v1/coins/withdraw        → { amount, currency, walletAddress }
```

---

## UI Tasarımı

### Film sitesine eklenecek sayfalar

```
/dashboard                → Kullanıcı paneli (bakiye, kazanç grafiği)
/dashboard/referral       → Referral kodu, paylaşım linkleri, ağ haritası
/dashboard/earnings       → İşlem geçmişi, günlük/haftalık/aylık kazanç
/dashboard/withdraw       → Kripto çekim formu
/dashboard/vip            → VIP satın alma (Coin ile veya kripto ile)
```

### Player'a eklenecek UI

```
┌──────────────────────────────────────────────────┐
│  [▶ FİLM OYNUYOR]                                │
│                                                   │
│                                                   │
│                    ┌─────────┐                    │
│                    │ +1 Coin │  ← Her 10 dk'da   │
│                    │   🪙    │    küçük animasyon  │
│                    └─────────┘                    │
│                                                   │
│  ──────────────────●────────── 01:23:45 / 02:01:00│
│  [⏮] [▶] [⏭]  [🔊]  [⚙️]  [🪙 127]  [⛶]        │
└──────────────────────────────────────────────────┘
                                     ↑
                                Coin bakiyesi
                                player'da görünür

Her 10 dakikada bir küçük "+1 Coin" animasyonu çıkar.
Kullanıcı izledikçe kazandığını hisseder.
Giriş yapmamışsa: "Giriş yap ve izleyerek kazan!" mesajı.
```

### Referral paylaşım kartı

```
┌──────────────────────────────────────────────┐
│  🪙 Arkadaşlarını davet et, birlikte kazan!  │
│                                               │
│  Senin kodun: A3X9K2M1                        │
│  [📋 Kopyala]  [📱 WhatsApp]  [💬 Telegram]   │
│                                               │
│  Referral linkin:                              │
│  https://streamvault.example/?ref=A3X9K2M1    │
│  [📋 Kopyala]                                  │
│                                               │
│  Ağın:                                        │
│  ├─ Seviye 1: 12 kişi   (%20 komisyon)        │
│  ├─ Seviye 2: 45 kişi   (%10)                 │
│  ├─ Seviye 3: 89 kişi   (%5)                  │
│  └─ Toplam: 210 kişi                          │
│                                               │
│  Bugünkü referral kazancın: 43 Coin           │
│  Toplam referral kazancın: 12,450 Coin        │
└──────────────────────────────────────────────┘
```

---

## Fraud Önleme

```
RİSK                          ÇÖZÜM
──────────────────────────────────────────────────────────────
Bot hesaplar                   Turnstile + email doğrulama
Aynı kişi çoklu hesap         Fingerprint + IP limit (max 3)
Tab arka planda bırakma        Focus check + heartbeat
Video açıp izlememe            Heartbeat + rastgele Turnstile
Referral kendi kendini davet   Aynı fingerprint/IP kontrolü
Sahte izleme süresi            Server-side süre doğrulama
Çekim fraud'u                  Min 10,000 Coin ($10) + 30 gün bekleme
VPN ile IP atlatma             WebRTC leak + fingerprint kararlılığı

EK KORUMALAR:
  → Yeni hesaplar ilk 7 gün çekim yapamaz
  → Günlük kazanç limiti: 30 Coin (bot'lar için kârsız)
  → Şüpheli aktivite: otomatik hesap dondurma
  → Çekim onayı: manuel kontrol (ilk çekimde)
```

---

## Embed servisi için referral

```
Embed servisi (primesrc gibi) için farklı bir referral modeli:

SENARYO: Başka site sahibi senin embed'ini kullanıyor.
  → Site sahibine kendi referral kodu ver
  → Embed URL'ine ref parametresi ekle:
    https://embed.example/embed/movie/550?ref=SITE_OWNER_CODE
  → O site üzerinden gelen her izleyici → site sahibinin ağına eklenir
  → Site sahibi hem izleme puanı kazanır hem de izleyicilerin puanlarından komisyon alır

AVANTAJ: Site sahipleri senin embed'ini kullanmak için motive olur.
  → "Senin embed'ini kullan, izleyicilerin izledikçe sen de kazan"
  → PPD (Pay Per View) modeli ama puan bazlı
  → Daha çok site senin embed'ini kullanır → daha çok trafik → daha çok reklam geliri

EMBED URL FORMATI:
  Standart:   https://embed.example/embed/movie/550
  Affiliate:  https://embed.example/embed/movie/550?ref=SITE_OWNER_CODE

  ref parametresi varsa:
    → Player'daki her heartbeat'te ref kodu da gönderilir
    → İzleme puanı ref sahibine de komisyon olarak verilir
    → Site sahibi dashboard'unda kaç izleme geldiğini görür
```

---

## Kripto çekim sistemi

```
Desteklenen paralar:
  → USDT (TRC-20) — en yaygın, düşük komisyon
  → Monero (XMR) — tamamen anonim
  → Bitcoin (BTC) — Lightning Network ile hızlı

Minimum çekim: 10,000 Coin = $10
Çekim süresi: 24-72 saat (manuel onay)
Çekim komisyonu: %5 (operasyonel maliyet)

AKIŞ:
  1. Kullanıcı /dashboard/withdraw sayfasına gider
  2. Miktar ve kripto türü seçer
  3. Cüzdan adresini girer
  4. "Çekim Talep Et" butonuna tıklar
  5. Sistem otomatik kontrol yapar:
     - Bakiye yeterli mi?
     - Hesap 30 günden eski mi?
     - Fraud skoru düşük mü?
  6. Onaylanırsa → "pending" statüsüne geçer
  7. Admin panelinde kontrol → onay → kripto gönderimi

ÖDEME KAYNAĞI:
  Çekim talepleri reklam gelirinden karşılanır.
  Puan ekonomisi dengelidir:
    → Kullanıcı 30 Coin/gün kazanır = $0.03/gün
    → Kullanıcının reklam değeri = $0.04-0.10/gün
    → Fark ($0.01-0.07) senin kârın
    → Çoğu kullanıcı puanları VIP'e harcar (sana maliyet $0)
    → Sadece %5-10'u kripto çeker (reklam gelirinden karşılanır)
```

---

## Puanların reklam gelirine etkisi

```
SENARYO: 10,000 günlük aktif kullanıcı

Puan sistemi OLMADAN:
  Reklam geliri: 10K × $0.06 = $600/gün = $18,000/ay
  Kullanıcı büyümesi: organik + SEO = yavaş

Puan sistemi İLE:
  Reklam geliri: 10K × $0.06 = $600/gün
  Puan maliyeti: 10K × $0.03 = -$300/gün
  NET: $300/gün = $9,000/ay

  AMA: Referral sistemi ile büyüme 3-5x hızlanır.
  3 ay sonra: 30K-50K günlük kullanıcı (referral etkisi)
  30K × ($0.06 - $0.03) = $900/gün = $27,000/ay

  Sonuç: Puan sistemi kısa vadede geliri yarıya düşürür,
         ama 3-6 ayda kullanıcı sayısını 3-5x artırarak
         toplam geliri 1.5-3x artırır.

EK FAYDA:
  → Kullanıcı retention artar (her gün giriş yapma motivasyonu)
  → Kullanıcı hesap açar (anonim izleyici → kayıtlı kullanıcı)
  → Kayıtlı kullanıcı = daha değerli reklam hedefleme
  → Kullanıcı başkalarına aktif olarak paylaşır (ücretsiz pazarlama)
```

---

## VIP Abonelik Paketleri (aylık satış)

```
Paket           Fiyat (Kripto)    Fiyat (Coin)    Tasarruf
──────────────────────────────────────────────────────────────
VIP 1 saat      —                 100 Coin         —
VIP 1 gün       $0.50             500 Coin         —
VIP 1 hafta     $2.00             2,000 Coin       %43
VIP 1 ay        $3.99             5,000 Coin       %67
VIP 3 ay        $8.99             12,000 Coin      %70
VIP 1 yıl       $24.99            40,000 Coin      %78

VIP ne verir:
  ✓ Sıfır reklam (pre-roll, mid-roll, pop-under — hepsi kapalı)
  ✓ Öncelikli sunucu (cache'li içerik önce VIP'lere)
  ✓ 1080p/4K öncelik (bandwidth önceliği)
  ✓ VIP rozeti (profilde ve yorumlarda)
  ✓ Erken erişim (yeni filmler VIP'lere 1 gün önce)
```

### VIP neden ekonomiyi kurtarır

```
Reklam geliri ile VIP geliri karşılaştırması:

  Reklamlı kullanıcı:
    Günlük reklam geliri: $0.06
    Aylık gelir: $1.80
    Puan maliyeti: -$0.90 (30 Coin/gün)
    NET: $0.90/ay per kullanıcı

  VIP kullanıcı (aylık $3.99):
    Aylık gelir: $3.99
    Reklam maliyeti: $0 (reklam yok)
    Puan maliyeti: -$0.90 (hâlâ Coin kazanır)
    NET: $3.09/ay per kullanıcı  → 3.4x DAHA KARLI

  VIP kullanıcı (Coin ile satın alan):
    Gelir: $0 (doğrudan)
    Ama: 5,000 Coin harcanır → bu Coin'ler çekilmez
    → Potansiyel çekim maliyeti $5 azalır
    → Kullanıcı sistemde kalır (retention)
    NET: $5 potansiyel çekim tasarrufu

SONUÇ: Kullanıcıların %10'u VIP alırsa:
  10,000 kullanıcı:
    9,000 reklamlı × $0.90/ay = $8,100
    1,000 VIP × $3.09/ay       = $3,090
    TOPLAM: $11,190/ay

  VIP olmadan:
    10,000 × $0.90/ay = $9,000/ay

  FARK: +$2,190/ay (+24%) ve büyüdükçe VIP oranı artar.
```

### VIP satış stratejisi

```
1. "DENEME VERSİYONU" — ilk VIP satış tetikleyicisi
   → Yeni üyeye 1 günlük ücretsiz VIP ver
   → Reklamsız deneyimi tatıp geri dönmek istemezler
   → "VIP süren doldu. Devam etmek ister misin? Sadece $3.99/ay"

2. "REKLAM SABIRINI TEST ET" — adblock kullananlar için
   → Adblock tespit edildiğinde:
     "Adblocker'ınız aktif. İki seçenek:
      A) Adblocker'ı kapatın (ücretsiz izleyin)
      B) VIP alın — $3.99/ay ile reklamsız izleyin
      C) 5,000 Coin ile VIP satın alın"
   → Adblock kullananların %5-15'i VIP alır

3. "COIN ILE AL" — harcanacak yer
   → Coin biriktiren kullanıcılar çekim yerine VIP'e harcar
   → Çekim komisyon maliyeti ($10 minimum + %5 komisyon) yüzünden
     VIP almak daha "karlı" hisseder kullanıcıya
   → Coin → VIP dönüşüm oranı: %60-70 (çekim: %30-40)
   → Senin için ideal: çekim $0 maliyet, VIP de $0 maliyet

4. "REFERRAL VIP BONUSU"
   → 10 kişi davet eden → 1 aylık ücretsiz VIP
   → 50 kişi davet eden → 3 aylık ücretsiz VIP
   → Bu VIP'in sana maliyeti $0 (sadece reklam göstermiyorsun)
   → Ama kullanıcı 50 kişi davet etti = 50 yeni kullanıcı = $90/ay reklam geliri

5. "YILLIK İNDİRİM" — uzun vadeli bağlama
   → $24.99/yıl = $2.08/ay (aylık $3.99'un yarısı)
   → Kullanıcı 1 yıl boyunca kilitlenir
   → Ön ödeme = garantili gelir
```

### Ödeme yöntemleri

```
KRİPTO (anonim, OPSEC-uyumlu):
  → NOWPayments API entegrasyonu
  → Desteklenen: USDT (TRC-20), Monero (XMR), BTC, LTC, ETH
  → Ödeme akışı:
    1. Kullanıcı paketi seçer
    2. NOWPayments widget açılır
    3. Kullanıcı kripto gönderir
    4. Webhook → DB'de VIP aktif
    5. Otomatik, anında aktifleşme

TELEGRAM STARS (alternatif):
  → Telegram ödeme sistemi
  → Düşük komisyon (~%5)
  → Kullanıcı Telegram üzerinden öder
  → Telegram Bot → webhook → VIP aktif

COIN ILE:
  → Hiç dış ödeme yok
  → Kullanıcı /dashboard/vip'den seçer
  → Bakiyeden düşer → VIP aktif
  → En kolay, en çok tercih edilen yöntem
```

### Revize edilmiş ekonomik denge

```
Senaryo: 10,000 günlük aktif kullanıcı, 3 ay sonrası

Kullanıcı dağılımı:
  %70 ücretsiz (reklamlı):     7,000 kişi
  %20 Coin-VIP (Coin ile):     2,000 kişi
  %10 Kripto-VIP (para ile):   1,000 kişi

GELİR:
  Reklamlı: 7,000 × $0.06/gün × 30 = $12,600/ay
  Kripto-VIP: 1,000 × $3.99/ay       = $3,990/ay
  Coin-VIP: gelir $0 ama çekim maliyeti -$10,000 azalır
  TOPLAM GELİR: ~$16,590/ay

MALİYET:
  Puan dağıtımı: 10,000 × $0.038/gün × 30 = $11,400/ay
  (Ama VIP alanların %60'ı Coin harcar → gerçek çekim maliyeti düşük)
  Gerçek çekim talebi: ~2,000 kişi × $5/ay = $10,000/ay teorik
  Coin-VIP'e harcanan: -$6,000 (çekilmez)
  Gerçek çekim maliyeti: ~$4,000/ay

  Sunucu maliyeti: ~$50/ay
  TOPLAM MALİYET: ~$4,050/ay

NET KÂR: ~$12,540/ay  ✓

Karşılaştırma:
  VIP + referral SİSTEMİ ile:  $12,540/ay (10K kullanıcı)
  Sadece reklam (puan yok):     $18,000/ay (10K kullanıcı)

  AMA referral etkisi ile 3 ayda 10K → 30K:
  VIP + referral (30K):         $37,620/ay  ← KAZANAN
  Sadece reklam (10K):          $18,000/ay

  6 ayda 10K → 50K+:
  VIP + referral (50K):         $62,700/ay
  Sadece reklam (10K→15K):      $27,000/ay
```

---

## Implementasyon önceliği

```
Hafta 1: Temel altyapı
  → DB şeması (yukarıdaki tablolar)
  → Referral kod üretimi + kayıt akışı
  → Coin bakiye sistemi
  → /dashboard sayfası (bakiye görüntüleme)

Hafta 2: İzle & Kazan
  → Player heartbeat sistemi
  → İzleme süresi → Coin dönüşümü
  → Player UI'da Coin gösterimi
  → Günlük limit kontrolü

Hafta 3: Referral sistemi
  → 10 seviye zincir oluşturma
  → Komisyon hesaplama
  → /dashboard/referral sayfası
  → Paylaşım linkleri (WhatsApp, Telegram, kopya)

Hafta 4: Çekim ve VIP
  → VIP satın alma (Coin ile)
  → Kripto çekim formu + NOWPayments entegrasyonu
  → Admin onay paneli
  → Fraud kontrolleri

Hafta 5: Embed affiliate
  → Embed URL'ine ref parametresi desteği
  → Site sahibi dashboard'u
  → Embed referral komisyon sistemi
```