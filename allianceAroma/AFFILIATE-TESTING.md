# Alliance Aroma — Affiliate Sistemi Test Rehberi & Komisyon Ayarlari

> Bu dokuman affiliate/komisyon sistemini nasil test edeceginizi ve gelecekte komisyon oranlarini/degerlerini nereden degistirecegizini aciklar.

---

## BOLUM 1: Suanki Komisyon Oranlari (Temsili Degerler)

| Seviye | Oran | Aciklama |
|--------|------|----------|
| 1 | 10% | Direkt referral — linki paylasan kisi |
| 2 | 5% | Referral'in referral'i |
| 3 | 3% | |
| 4 | 2% | |
| 5 | 2% | |
| 6 | 1% | |
| 7 | 1% | |
| 8 | 1% | |
| 9 | 1% | |
| 10 | 1% | |
| **Toplam** | **27%** | Bir siparise dagitilan max komisyon |

> **ONEMLI:** Bu oranlar suanki degerlerdir. Gercek/nihai degerler belirlendiginde asagidaki "Nereden Degistirilir" bolumune bak.

---

## BOLUM 2: Nereden Degistirilir?

Komisyon oranlari **IKI yerde** tanimlidir. Degisiklik yapilirken **HER IKISI DE** guncellenmelidir:

### 2a: Veritabani (Gercek Hesaplama)

**Dosya:** `supabase/migrations/001_initial_schema.sql`

`calculate_commissions` fonksiyonu icindeki satir:

```sql
v_level_rates DECIMAL[] := ARRAY[0.10, 0.05, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01];
```

> Bu satirda dizideki degerleri degistir. Ornegin 1. seviyeyi %15 yapmak icin `0.10` yerine `0.15` yaz.

**Canli veritabaninda degistirmek icin:**

```sql
CREATE OR REPLACE FUNCTION public.calculate_commissions(
  p_order_id UUID,
  p_buyer_id UUID,
  p_order_total DECIMAL
)
RETURNS VOID AS $$
DECLARE
  v_level_rates DECIMAL[] := ARRAY[0.15, 0.05, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01];
  -- ... fonksiyonun geri kalani ayni ...
$$;
```

Supabase Dashboard → SQL Editor'de calistir.

### 2b: Frontend (Gosterim Amacli)

**Dosya:** `lib/config/commissions.ts`

```typescript
export const COMMISSION_RATES = [
  0.10, // Level 1
  0.05, // Level 2
  0.03, // Level 3
  0.02, // Level 4
  0.02, // Level 5
  0.01, // Level 6
  0.01, // Level 7
  0.01, // Level 8
  0.01, // Level 9
  0.01, // Level 10
] as const
```

> Bu degerler sadece dashboard'da goruntuleme icin kullanilir. Gercek hesaplama her zaman veritabanindaki fonksiyon tarafindan yapilir. Ancak uyumlu olmalari **zorunludur**.

### Ornek: Oranlari Degistirme Adim Adim

1. Yeni oranlari belirle (ornegin: 15%, 7%, 5%, 3%, 3%, 2%, 2%, 1%, 1%, 1%)
2. `supabase/migrations/001_initial_schema.sql` dosyasinda `v_level_rates` satirini guncelle
3. Supabase Dashboard → SQL Editor'de `CREATE OR REPLACE FUNCTION` ile fonksiyonu guncelle
4. `lib/config/commissions.ts` dosyasinda ayni degerleri gir
5. Frontend'i yeniden deploy et

---

## BOLUM 3: Para Birimi (AED)

Para birimi su anda **AED (Birlesik Arap Emirlikleri Dirhami)** olarak ayarli.

| Degisken | Dosya | Aciklama |
|----------|-------|----------|
| `CURRENCY_CODE` | `lib/utils.ts` | `"AED"` — para birimi kodu |
| `CURRENCY_SYMBOL` | `lib/utils.ts` | `"AED"` — gosterim sembolü |
| `formatPrice()` | `lib/utils.ts` | `Intl.NumberFormat` ile formatlar |
| `currency: "aed"` | `app/api/checkout/route.ts` | Stripe checkout para birimi |
| `TAX_RATE` | `lib/context/cart-context.tsx` | `0.05` (UAE %5 KDV) |
| `FREE_SHIPPING_THRESHOLD` | `lib/context/cart-context.tsx` | `200` AED |
| `SHIPPING_COST` | `lib/context/cart-context.tsx` | `25` AED |

---

## BOLUM 4: Affiliate Sistemi Test Plani

### Onkosullar
- Supabase projesi kurulu ve migration'lar calistirilmis
- Site lokalde (`pnpm dev`) veya canlida calisiyor
- Stripe test mode aktif

### Test 1: Referral Kodu ile Kayit (Email)

1. Bir kullanici olustur (User A) — kayit sırasinda "Affiliate olarak katil" secenegini isaretle
2. Supabase → `profiles` tablosunda User A'nin `referral_code` degerini kontrol et
3. `?ref=USER_A_CODE` URL'ini kopyala
4. Yeni bir tarayici/gizli pencere ac
5. `http://localhost:3000?ref=USER_A_CODE` adresine git
6. Yeni bir kullanici olustur (User B) — email + sifre ile
7. Supabase → `profiles` tablosunda:
   - User B'nin `referrer_id` = User A'nin `id` olmali
   - User B'nin `referrer_path` User A'nin ID'sini icermeli

**Beklenen:** User B basariyla User A'ya baglanmis

### Test 2: Referral Kodu ile Google/Facebook Kayit

1. Test 1'deki gibi User A'nin referral linkini ac
2. Google veya Facebook ile kaydol (User C)
3. Auth callback sonrasi kontrol et:
   - `profiles` tablosunda User C'nin `referrer_id` = User A olmali
   - Yoksa, sayfa yuklendikten sonra `link-referral` API'si otomatik baglayacak

**Beklenen:** OAuth kullanıcisi da referral zincirine eklenmis

### Test 3: Siparis ve Komisyon Hesaplama

1. User B olarak giris yap
2. Sepete bir urun ekle (ornegin 85ml — 120 AED)
3. Checkout'a git, Stripe test karti ile ode:
   ```
   Kart: 4242 4242 4242 4242
   Son Kullanma: 12/30
   CVC: 123
   ```
4. Odeme sonrasi Supabase'de kontrol et:
   - `orders` tablosunda yeni bir siparis
   - `commissions` tablosunda User A icin bir komisyon:
     - `level`: 1
     - `amount`: 12.00 (120 AED * %10)
     - `status`: `pending`

**Beklenen:** Level 1 komisyon dogru hesaplanmis

### Test 4: Cok Seviyeli Komisyon

1. User B'nin referral kodu ile User D olustur
2. User D'nin referral kodu ile User E olustur
3. User E bir siparis versin (120 AED)
4. Supabase `commissions` tablosunda:
   - User D: Level 1 = 12.00 AED (%10)
   - User B: Level 2 = 6.00 AED (%5)
   - User A: Level 3 = 3.60 AED (%3)

**Beklenen:** 3 seviye boyunca komisyonlar dogru

### Test 5: Self-Referral Korumasi

1. User A olarak giris yap
2. `?ref=USER_A_CODE` URL'i ile siparis vermeye calis
3. Komisyon tablosunda User A kendisine komisyon olusturmamali

**Beklenen:** Kendi referral kodunla kendin icin komisyon olusturulamaz

### Test 6: Affiliate Dashboard

1. User A olarak giris yap
2. `/affiliate` sayfasina git
3. Kontrol et:
   - Referral linki gorunuyor mu? ✓
   - Toplam kazanc dogru mu? ✓
   - Son komisyonlar listeleniyor mu? ✓
   - Grafik veri gosteriyor mu? ✓

**Beklenen:** Dashboard gercek Supabase verilerini gosteriyor

### Test 7: Iade/Dispute Sonrasi Komisyon Iptali

1. Stripe Dashboard → Test Payments → son odemeyi bul
2. **Refund** tikla
3. Supabase'de `commissions` tablosunda ilgili kayitlarin `status`'u `cancelled` olmali

**Beklenen:** Iade yapilinca komisyonlar iptal ediliyor

### Test 8: Idempotency (Tekrar Webhook)

1. Stripe Dashboard → Developers → Webhooks → son eventi sec
2. **Resend** tikla
3. Supabase'de `orders` ve `commissions` tablolarinda yeni kayit olusmamasini kontrol et

**Beklenen:** Ayni event tekrar geldiginde duplikasyon olmaz

---

## BOLUM 5: Stripe Test vs Canli Gecis

### Test Degerleri (Simdiki Durum)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Canli Degerlere Gecis

1. Stripe Dashboard → sag ustte Test/Live toggle'i **Live**'a cevir
2. **Developers → API keys** sayfasindan canli anahtarlari kopyala:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```
3. **Developers → Webhooks** → canli endpoint ekle, signing secret'i al:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_live_...
   ```
4. Cloudflare Dashboard → Workers → Environment Variables'da guncelle
5. Yeniden deploy et

> **UYARI:** Canli geciste tum test siparisleri/komisyonlari silinmez. Temiz baslangic icin Supabase'de `TRUNCATE orders, order_items, commissions CASCADE;` calistirabilirsin (sadece test verisi varsa!).

---

## BOLUM 6: Sorun Giderme

| Sorun | Cozum |
|-------|-------|
| Dashboard "Loading..." kalıyor | `profiles.is_affiliate` = `true` mi kontrol et |
| Komisyon hesaplanmiyor | Stripe webhook URL dogru mu? `orders` tablosunda kayit var mi? |
| Referral baglantisi calismiyor | `?ref=CODE` sonrasi `localStorage`'da `AllianceAroma-referral` var mi? |
| OAuth sonrasi referral baglanmiyor | Auth callback'te `link-referral` API cagrisi basarili mi? Browser console'u kontrol et |
| "No commissions yet" | Hic siparis yok veya bu kullanicinin alt agacinda kimse siparis vermemis |
| Duplike komisyonlar | Migration 003'teki unique index eksik olabilir, SQL'i tekrar calistir |

---

## BOLUM 7: Gelecek Degisiklikler — Hizli Referans

| Degisiklik | Etkilenen Dosyalar |
|------------|-------------------|
| Komisyon oranlarini degistir | `001_initial_schema.sql` (DB), `lib/config/commissions.ts` (frontend) |
| Para birimini degistir | `lib/utils.ts`, `app/api/checkout/route.ts`, `lib/context/cart-context.tsx` |
| Urun fiyatlarini degistir | `lib/data/products.ts` |
| Vergi oranini degistir | `lib/context/cart-context.tsx` → `TAX_RATE` |
| Kargo ucretini degistir | `lib/context/cart-context.tsx` → `SHIPPING_COST`, `FREE_SHIPPING_THRESHOLD` |
| Yeni urun ekle | `lib/data/products.ts`, gorsel: `public/products/` |
| Paket sistemi ekle | Yeni DB migration, yeni komisyon hesaplama fonksiyonu |
