# GetSMSNow — Rakip Analizi & İyileştirme Planı

> Son güncelleme: 16 Nisan 2026  
> İncelenen rakipler: SMSPool.net, 5sim.net, sms-activate.org, GrizzlySMS.com, SMSCode.gg, VerifySMS.app, TextVerified

---

## 1. Mevcut Durum Özeti

### Bu Oturumda Düzeltilen Kritik Hatalar

| # | Hata | Etki | Çözüm |
|---|------|------|-------|
| 1 | Kod `smscode.gg` API'sine gidiyordu ama `.env`'de `SMSPOOL_API_KEY` vardı | **Tüm SMS işlemleri çalışmıyordu** — fiyat, sipariş, kontrol, iptal hepsi hata veriyordu | Yeni `src/lib/sms-provider.ts` — hangi API key varsa onu kullanan unified provider |
| 2 | `/api/sms/check` sadece GET destekliyordu, UI POST gönderiyordu | SMS durumu hiç kontrol edilemiyordu | POST handler eklendi |
| 3 | `/api/orders/cancel` yanlış response kontrolü (`success !== 1` vs `ok`) | Sipariş iptali her zaman başarısız oluyordu | `!cancelResult.ok` olarak düzeltildi |
| 4 | `/api/sms/price` mapping kullanmıyordu | Fiyatlar yanlış veya boş geliyordu | `sms-provider.ts` içinde otomatik mapping |
| 5 | Features'ta "80 Countries", Hero'da "120+" — tutarsız | Güven kaybı | Hepsi "120+" olarak düzeltildi |
| 6 | Homepage "GET NUMBER" butonu `/sms-activations`'a gidiyordu | Kullanıcı seçimlerini kaybediyordu, tekrar seçmek zorunda kalıyordu | Direkt sipariş/checkout'a yönlendirme |

### Temizlenen Ölü Kod (~1020 satır silindi)

- `src/lib/cryptomus.ts`, `nexapay.ts`, `smspool.ts`, `smspool-mapping.ts`, `smscode.ts`, `smscode-mapping.ts`
- `src/app/api/cryptomus/` (create-invoice + webhook)
- `src/app/api/nexapay/` (create-payment + webhook)
- `src/app/api/smspool/` (balance, check, countries, order, price, services)

---

## 2. Eklenen Yeni Özellikler

### 2a. Veritabanı Tabloları (SQL hazır, Supabase SQL Editor'de çalıştır)

**`002_enterprise_tables.sql`**

| Tablo | Açıklama | Neden Gerekli |
|-------|----------|---------------|
| `api_keys` | Developer API key yönetimi (hash, prefix, aktif/pasif) | SMSPool, SMSCode, GrizzlySMS, 5sim — hepsinde var. Geliştiriciler otomasyon yapar |
| `promo_codes` | İndirim/promosyon kodları (%, sabit, min tutar, max kullanım) | Pazarlama için kritik — yeni kullanıcı çekme |
| `promo_redemptions` | Hangi kullanıcı hangi kodu kullandı | Kötüye kullanım önleme |
| `activity_logs` | Güvenlik audit log'u (action, IP, detay) | Enterprise standart — hesap güvenliği |
| `users` ALTER | username, avatar_url, preferred_country, telegram_id, locale | Profil zenginleştirme |

**`003_competitive_features.sql`**

| Tablo | Açıklama | Neden Gerekli |
|-------|----------|---------------|
| `user_favorites` | Sık kullanılan servis/ülke yıldızlama | sms-activate'in en çok kullanılan özelliği |
| `user_webhooks` | API kullanıcılarına SMS geldiğinde webhook çağrısı | sms-activate, 5sim — otomasyon için şart |
| `deposits` | Yatırım geçmişi (tutar, yöntem, durum) | Tüm rakiplerde var — finansal şeffaflık |
| `notifications` | Uygulama içi bildirimler | VerifySMS push notification ile fark yaratıyor |
| `notification_preferences` | Email bildirim tercihleri (SMS, deposit, refund, marketing) | Enterprise standart |
| `service_stats` | Ülke+servis bazında başarı oranı ve sipariş sayısı | SMSPool "9,457 orders" göstererek güven sağlıyor |
| `support_tickets` | Uygulama içi destek sistemi | Telegram'a bağımlılığı azaltır |
| `users` ALTER | loyalty_tier, total_spent, cashback_balance | sms-activate cashback sistemi — kullanıcı tutma |
| `rate_limits` | IP bazlı rate limit takibi | Güvenlik — brute force önleme |

### 2b. Yeni UI Bileşenleri

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| Popular Services & Prices | `src/components/sections/PopularServices.tsx` | Ana sayfada en popüler ülke+servis kombinasyonları, fiyat ve "Order" butonu. SMSPool tarzı sosyal kanıt |
| Quick Re-order | `src/app/dashboard/page.tsx` | Dashboard'da son siparişlerden tek tıkla tekrar sipariş. Rakiplerde standart |

---

## 3. Rakiplerde Olup Henüz Eklenmemiş Özellikler

### YÜKSEK Öncelik (İlk Sprint)

| # | Özellik | Kimde Var | Açıklama | Tahmini Süre |
|---|---------|-----------|----------|--------------|
| 1 | **Canlı stok/müsaitlik gösterimi** | SMSPool, 5sim, sms-activate | Hangi ülke+servis için numara var/yok göster. "Available" / "Out of stock" badge'i | 1-2 gün |
| 2 | **Sipariş sayısı gösterimi** | SMSPool | Her ülke+servis kartında "9,457 orders" — sosyal kanıt, güven artırır | 0.5 gün |
| 3 | **Gerçek API dokümantasyonu** | SMSPool, 5sim, SMSCode | Şu an "Coming Soon" yazıyor. REST API docs: auth, endpoints, örnekler | 2-3 gün |
| 4 | **Telegram Bot ile sipariş** | GrizzlySMS | Telegram Mini App veya Bot üzerinden direkt numara al | 2-3 gün |

### ORTA Öncelik (İkinci Sprint)

| # | Özellik | Kimde Var | Açıklama | Tahmini Süre |
|---|---------|-----------|----------|--------------|
| 5 | **Operatör/pool seçimi** | sms-activate, SMSPool | "Budget" vs "Premium" pool — ucuz ama riskli vs pahalı ama garantili | 1-2 gün |
| 6 | **Toplu sipariş (batch)** | sms-activate | Bir seferde 10-50 numara al — power user'lar için | 1-2 gün |
| 7 | **Çoklu dil desteği (gerçek)** | sms-activate, 5sim | Dil dropdown'u var ama çalışmıyor. next-intl veya i18n entegrasyonu | 3-5 gün |
| 8 | **Profil ayarları sayfası** | Herkes | `/settings` — avatar, tercih edilen ülke, bildirim ayarları, API key yönetimi | 1-2 gün |
| 9 | **Deposit/ödeme geçmişi sayfası** | Herkes | `/dashboard/deposits` — ne kadar yatırıldı, hangi yöntemle, ne zaman | 0.5 gün |
| 10 | **Cashback/loyalty UI** | sms-activate | Bronze → Silver → Gold tier gösterimi, cashback oranları | 1-2 gün |

### DÜŞÜK Öncelik (Üçüncü Sprint)

| # | Özellik | Kimde Var | Açıklama | Tahmini Süre |
|---|---------|-----------|----------|--------------|
| 11 | **Ücretsiz numaralar bölümü** | sms-activate | Test amaçlı ücretsiz numaralar — trafik çeker | 1 gün |
| 12 | **Blog/SEO sayfaları** | SMSCode, GrizzlySMS | `/blog/whatsapp-verification-guide` tarzında organik SEO | 2-3 gün |
| 13 | **Trustpilot/review entegrasyonu** | SMSPool | Gerçek kullanıcı yorumlarını ana sayfada göster | 0.5 gün |
| 14 | **Status/uptime sayfası** | Enterprise standart | `status.getsmsnow.com` — Betteruptime veya benzeri | 0.5 gün |
| 15 | **Numara yeniden aktivasyon** | sms-activate | Süresi dolan numarayı tekrar al (ek ücretli) | 1 gün |
| 16 | **Multiservice** | sms-activate | 1 numara ile birden fazla servis doğrula | 2 gün |
| 17 | **Native mobil uygulama** | VerifySMS | iOS/Android — push notification, Face ID | 2-4 hafta |

---

## 4. Bizim Rakiplerden Üstün Olduğumuz Noktalar

| Özellik | Rakipler | Biz |
|---------|----------|-----|
| **Guest checkout** (kayıtsız ödeme) | Çoğunda yok — kayıt zorunlu | Var — kayıt olmadan ödeyip numara al |
| **Modern dark UI** | Çoğu eski/karmaşık tasarım | Temiz, modern, responsive |
| **Crypto-only basitlik** | Karışık ödeme, KYC sorunları | Net: 300+ kripto, no KYC, no bank |
| **Referral sistemi** | Bazılarında yok | 10 haneli kod, komisyon takibi |
| **Turnstile bot koruması** | Bazılarında yok | Cloudflare Turnstile entegre |
| **Otomatik iade (webhook)** | Değişken — bazıları ticket istiyor | NOWPayments webhook ile otomatik |
| **Çoklu login** | Çoğu sadece email | Google + Telegram + Email/Password + Email Code |

---

## 5. Toplam İş Tahmini

| Sprint | İçerik | Süre |
|--------|--------|------|
| Sprint 1 (Yüksek) | Canlı stok, sipariş sayısı, API docs, Telegram bot | 6-9 gün |
| Sprint 2 (Orta) | Pool seçimi, batch, çoklu dil, profil, deposit, cashback | 8-14 gün |
| Sprint 3 (Düşük) | Ücretsiz numaralar, blog, Trustpilot, status, reactivation, multiservice | 8-12 gün |
| **Toplam** | | **~22-35 gün** |

---

## 6. Veritabanı Kurulum Sırası

Supabase SQL Editor'de sırasıyla çalıştır:

```
1. supabase/migrations/001_initial_schema.sql          — temel tablolar
2. supabase/migrations/002_enterprise_tables.sql        — API keys, promo, audit log
3. supabase/migrations/003_competitive_features.sql     — favorites, webhooks, deposits, notifications, stats, tickets, loyalty, rate limits
```

> Not: 002 ve 003 opsiyoneldir — site bunlar olmadan da çalışır. Ama enterprise seviyesinde olmak istiyorsan hepsini çalıştır.

---

## 7. Dosya Yapısı Özeti

```
src/
├── lib/
│   ├── sms-provider.ts          ← YENİ: unified SMS provider (SMSPool + SMSCode)
│   ├── nowpayments.ts           ← kripto ödeme
│   ├── supabase.ts              ← veritabanı
│   ├── turnstile.ts             ← bot koruması
│   ├── email-templates.ts       ← email şablonları
│   └── utils.ts
├── components/
│   └── sections/
│       ├── PopularServices.tsx   ← YENİ: ana sayfa popüler servisler
│       ├── Features.tsx          ← düzeltildi: 120+
│       ├── Hero.tsx
│       ├── StatsBar.tsx
│       ├── HowItWorks.tsx
│       ├── TrustIndicators.tsx
│       ├── Faq.tsx
│       └── JoinNow.tsx
├── app/
│   ├── api/
│   │   ├── sms/                  ← tümü güncellendi: sms-provider kullanıyor
│   │   ├── nowpayments/          ← kripto ödeme
│   │   ├── guest/                ← misafir checkout
│   │   ├── orders/               ← sipariş yönetimi (cancel düzeltildi)
│   │   ├── auth/                 ← kimlik doğrulama
│   │   ├── referral/             ← referral sistemi
│   │   └── user/                 ← kullanıcı bakiye
│   ├── dashboard/
│   │   ├── page.tsx              ← güncellendi: Quick Re-order eklendi
│   │   ├── TopUpBalance.tsx
│   │   └── OrdersList.tsx
│   └── page.tsx                  ← güncellendi: PopularServices eklendi
└── data/
    ├── countries.ts
    ├── services.ts
    └── periods.ts

supabase/migrations/
├── 001_initial_schema.sql
├── 002_enterprise_tables.sql     ← YENİ
└── 003_competitive_features.sql  ← YENİ
```
