# PrivacyCards — Rakip Analizi, Yapılan Düzeltmeler & İyileştirme Planı

## 1. Bu Oturumda Düzeltilen Kritik Sorunlar

### CRITICAL Fixes

| # | Sorun | Çözüm |   
|---|-------|-------|
| 1 | **Auth yok** — Login/Register placeholder idi | NextAuth v5 + Credentials provider kuruldu. `src/auth.ts`, session yönetimi, bcrypt şifreleme |
| 2 | **`x-user-id` header güven modeli** — herkes başkası olabiliyordu | Tüm API route'lardan kaldırıldı, `auth()` ile server-side session doğrulama eklendi |
| 3 | **Kart alımı atomik değil** — bakiye düşülmeden kart oluşturuluyordu | `deduct_balance` RPC önce çağrılıyor, hata olursa `add_balance` ile refund yapılıyor |
| 4 | **Dashboard çalışmıyordu** — auth header göndermiyordu | `useSession()` ile auth state kontrolü, `/api/user/balance` endpoint'i eklendi |

### HIGH Fixes

| # | Sorun | Çözüm |
|---|-------|-------|
| 5 | **Webhook idempotency yok** — duplicate IPN = çift bakiye | `payments.provider_id` UNIQUE kontrolü + in-memory Set ile çift işlem engellendi |
| 6 | **Referral stats JWT decode** — signature doğrulamadan user ID çıkarıyordu | `auth()` ile server-side session kullanıma geçildi |

### MEDIUM Fixes

| # | Sorun | Çözüm |
|---|-------|-------|
| 7 | **Rate limiting yok** | `middleware.ts` — IP bazlı rate limiting (register: 5/dk, cards: 15/dk, topup: 10/dk) |
| 8 | **Input validation yok** | Zod schema eklendi (cards, topup, register, referral) |
| 9 | **DB FK eksik** | `002_auth_and_fixes.sql` — referral tablolarına FK constraint'ler eklendi |
| 10 | **SessionProvider eksik** | `layout.tsx` → `Providers` wrapper eklendi |

---

## 2. Rakip Siteler Analizi

### Ana Rakipler

| Site | Öne Çıkan Özellikler | Ödeme Yöntemleri | Fiyatlandırma |
|------|----------------------|------------------|---------------|
| **EzzoCard.com** | No-KYC, anında teslim, çoklu para birimi, API | Crypto (BTC, ETH, USDT, XMR) | $5-$20 kart ücreti |
| **BitPay Card** | Büyük marka, yaygın kabul, mobil uygulama | Crypto + fiat çevirme | Aylık ücret var |
| **PlasBit** | No-KYC Visa, fiziksel kart, ATM çekme | Crypto | $5 sanal, $50 fiziksel |
| **Pyypl** | MENA bölgesi odaklı, Apple/Google Pay | Crypto + bank transfer | Ücretsiz sanal |
| **Reloadly** | API-first, B2B, gift card + topup | Crypto + fiat | API fiyatlandırma |
| **Paycek** | EU odaklı, SEPA, Visa | Crypto | €5 kart ücreti |
| **Privacy.com** | ABD odaklı, merchant-locked kartlar, browser extension | Bank account (ABD only) | Ücretsiz (KYC gerekli) |

### Rakiplerde Olup Bizde Olmayan Özellikler

#### Yüksek Öncelik (1-3 gün)

| Özellik | Rakip | Tahmini Süre |
|---------|-------|--------------|
| **Kart detaylarını göster/gizle toggle** (CVV, tam numara) | EzzoCard, PlasBit | 0.5 gün |
| **Kart bakiye top-up** (kartın kendisine para yükleme) | EzzoCard, PlasBit | 1 gün |
| **İşlem geçmişi** (kart bazlı transaction list) | Privacy.com, PlasBit | 1 gün |
| **Kart silme / kapatma** | Tüm rakipler | 0.5 gün |
| **Multiple kart desteği** (label ile ayırt etme) | Privacy.com, EzzoCard | Mevcut ama UI iyileştirmeli |
| **Top-up amount seçenekleri** ($10, $25, $50, $100) | PlasBit | 0.5 gün |

#### Orta Öncelik (3-7 gün)

| Özellik | Rakip | Tahmini Süre |
|---------|-------|--------------|
| **Spending limitleri** (günlük/aylık) | Privacy.com | 2 gün |
| **Merchant-locked kartlar** (tek site için) | Privacy.com | 2 gün |
| **Auto-topup** (bakiye düşünce otomatik yükleme) | PlasBit | 1 gün |
| **Email bildirimler** (kart kullanımı, top-up) | EzzoCard | 1.5 gün |
| **API erişimi** (programatik kart oluşturma) | Reloadly, EzzoCard | 3 gün |
| **Multi-currency kartlar** (USD, EUR, GBP) | EzzoCard, PlasBit | 2 gün |
| **Kart etiketleme** (Netflix kartı, Amazon kartı) | Privacy.com | 0.5 gün |

#### Düşük Öncelik (7-14 gün)

| Özellik | Rakip | Tahmini Süre |
|---------|-------|--------------|
| **Fiziksel kart** desteği | PlasBit | Wanttopay bağımlı |
| **Apple Pay / Google Pay** entegrasyonu | PlasBit, Pyypl | Wanttopay bağımlı |
| **Kripto cashback** programı | BitPay | 3 gün |
| **Dark/Light tema** toggle | Bazı rakipler | 1 gün |
| **Çok dilli destek** (EN, TR, AR, RU) | EzzoCard | 2 gün |
| **Support ticket sistemi** | Tüm büyük rakipler | 2 gün |
| **2FA güvenlik** | PlasBit | 1 gün |

---

## 3. Mevcut Avantajlarımız

| Avantaj | Açıklama |
|---------|----------|
| **Tamamen No-KYC** | Sadece email + şifre ile kayıt, kimlik yok |
| **Anında teslim** | Kart numarası saniyeler içinde |
| **Kripto ödeme** (300+ coin) | NOWPayments ile geniş kripto desteği |
| **3 seviye referral** | Rakiplerin çoğunda 1 seviye; bizde 3 seviye (10%, 5%, 3%) |
| **Temiz dark UI** | Modern, minimal, mobil uyumlu |
| **Düşük fiyat** | Basic $8, Smart $15 — rakiplerden ucuz |
| **Güvenlik** | HMAC webhook doğrulama, rate limiting, atomik işlemler |

---

## 4. Veritabanı Şeması

### Mevcut Tablolar (000 + 001 + 002)
```
users             — id, email, password_hash, balance, referral_code
cards             — id, user_id (FK), provider_card_id, type, last_four, status
payments          — id, user_id (FK), amount, provider, provider_id (idempotency), status
balance_transactions — id, user_id (FK), type, amount, ref_id, description
referral_codes    — id, user_id (FK), code (UNIQUE)
referral_links    — id, referrer_id (FK), referred_id (FK), code
referral_commissions — id, referrer_id (FK), amount, level, status
```

### Önerilen Yeni Tablolar
```
card_transactions   — kart bazlı işlem geçmişi
spending_limits     — günlük/aylık harcama limitleri
api_keys            — B2B API erişimi
notifications       — email/push bildirimler
support_tickets     — müşteri destek
```

### Migration Sırası
1. `000_core_schema.sql`
2. `001_referral_system.sql`
3. `002_auth_and_fixes.sql`

---

## 5. Dosya Yapısı (Güncel)

```
kart-site/
├── src/
│   ├── auth.ts                          ★ YENİ — NextAuth yapılandırması
│   ├── middleware.ts                     ★ YENİ — Rate limiting
│   ├── components/
│   │   └── providers.tsx                ★ YENİ — SessionProvider
│   ├── app/
│   │   ├── layout.tsx                   ★ GÜNCELLENDİ — Providers eklendi
│   │   ├── page.tsx                     Landing page
│   │   ├── login/page.tsx               ★ GÜNCELLENDİ — NextAuth signIn()
│   │   ├── register/page.tsx            ★ GÜNCELLENDİ — Register API + auto-login
│   │   ├── dashboard/page.tsx           ★ GÜNCELLENDİ — Auth + balance + cards
│   │   ├── buy-card/page.tsx            Kart satın alma
│   │   ├── referral/page.tsx            ★ GÜNCELLENDİ — NextAuth session
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts   ★ YENİ
│   │       │   └── register/route.ts        ★ YENİ
│   │       ├── cards/route.ts               ★ GÜNCELLENDİ — Auth + atomik
│   │       ├── payments/
│   │       │   ├── topup/route.ts           ★ GÜNCELLENDİ — Auth
│   │       │   └── webhook/route.ts         ★ GÜNCELLENDİ — Idempotency
│   │       ├── user/
│   │       │   └── balance/route.ts         ★ YENİ
│   │       └── referral/
│   │           ├── route.ts                 ★ GÜNCELLENDİ — Zod validation
│   │           └── stats/route.ts           ★ GÜNCELLENDİ — Auth
│   └── lib/
│       ├── supabase.ts
│       ├── supabase-browser.ts
│       ├── nowpayments.ts               Signature verification mevcut
│       ├── wanttopay.ts                 Kart API client
│       └── utils.ts
├── supabase/migrations/
│   ├── 000_core_schema.sql
│   ├── 001_referral_system.sql
│   └── 002_auth_and_fixes.sql           ★ YENİ
├── .env.example                          ★ GÜNCELLENDİ — placeholder değerler
└── docs/
    └── KART-RAKIP-ANALIZI-VE-IYILESTIRMELER.md  ★ YENİ — bu dosya
```

---

## 6. Toplam İş Tahmini

| Kategori | Süre |
|----------|------|
| Bu oturumda yapılanlar | Tamamlandı |
| Yüksek öncelik özellikler | 3-4 gün |
| Orta öncelik özellikler | 7-10 gün |
| Düşük öncelik özellikler | 7-14 gün |
| **Toplam (tüm özellikler)** | **17-28 gün** |

---

## 7. Hemen Sonraki Adımlar

1. **.env.local doldur** — Supabase, Wanttopay, NOWPayments, AUTH_SECRET
2. **Migration'ları çalıştır** — Supabase SQL Editor'da 000 → 001 → 002 sırasıyla
3. **Local test** — `npm run dev` ile login/register/dashboard/buy-card test et
4. **Deploy** — `vercel --prod` veya Docker ile VPS'e
5. **NOWPayments webhook test** — Küçük miktar ($1-2) ile test top-up yap
