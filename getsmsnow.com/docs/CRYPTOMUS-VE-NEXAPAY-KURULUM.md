# Cryptomus ve NexaPay – Kısa Kurulum Rehberi

Bu dokümanda **Cryptomus** (kripto) ve **NexaPay** (kart/Apple Pay → kripto ödeme) için nereden hangi değerler alınır, ne yapılır özetleniyor.

---

## 1. Cryptomus (Kripto ödemeler)

**Durum:** Projede entegre. Sadece env ve panel ayarları yapılacak.

### Nereden giriş / kayıt
- **Site:** [cryptomus.com](https://cryptomus.com)
- Merchant hesabı aç, giriş yap.

### Hangi değerler nereden alınır

| Değer | Nereden | `.env.local` / Vercel |
|-------|---------|------------------------|
| **Merchant ID** | Giriş → **Business** → **Merchants** → projeni seç → **Merchant settings** (veya **Settings**). UUID formatında "Merchant ID" kopyala. | `CRYPTOMUS_MERCHANT_ID=...` |
| **Payment API Key** | Aynı **Merchant settings** sayfasında. Domain doğrulama ve merchant moderasyonu bittikten sonra "Payment API Key" / "API key" oluşturup kopyala. | `CRYPTOMUS_API_KEY=...` |

### Yapılacaklar (sırayla)

1. **Kayıt / giriş:** cryptomus.com → Merchant hesabı.
2. **Domain doğrulama:** Merchant settings içinde domain’i (örn. `getsmsnow.com`) ekle ve doğrula (DNS veya dosya ile – panelde yazar).
3. **Moderasyon:** Gerekirse merchant onayı bekle; onay sonrası API key kullanılabilir.
4. **KYC:** Cryptomus KYC istiyor; kişisel cüzdan / merchant tarafında tamamla (Settings → Personal → KYC vb.).
5. **Env:** `.env.local` ve production (Vercel) için:
   ```bash
   CRYPTOMUS_MERCHANT_ID=buraya-uuid-yapistir
   CRYPTOMUS_API_KEY=buraya-api-key-yapistir
   ```
6. **Callback (webhook) URL:** Cryptomus panelinde callback / webhook URL alanı varsa şunu gir:
   ```text
   https://getsmsnow.com/api/cryptomus/webhook
   ```
   (Canlı domain’in ne ise onu kullan; localhost sadece test için.)
7. **Test:** Dashboard’da Top Up → Cryptomus seç → küçük tutarla dene.

### Projede nerede kullanılıyor
- API: `src/app/api/cryptomus/create-invoice/route.ts` (fatura oluşturur)
- Webhook: `src/app/api/cryptomus/webhook/route.ts` (ödeme tamamlanınca bakiye günceller)
- Lib: `src/lib/cryptomus.ts`
- Tablo: `cryptomus_payments` (Supabase)

---

## 2. NexaPay (Kart / Apple Pay → Kripto ödeme)

**Durum:** Projede **henüz entegre değil.** Aşağıdakiler ekleyeceğin zaman kullanılacak bilgiler.

### Ne işe yarar
- Müşteri **kart, Apple Pay, Google Pay** ile öder.
- Sen ödemeyi **kripto** (USDT, USDC, BTC, ETH vb.) olarak alırsın.
- Tek platformda hem kart hem kripto; hızlı onboarding iddiası var.

### Nereden giriş / kayıt
- **Site:** [nexapay.one](https://nexapay.one) (veya resmi domain ne ise)
- Merchant / seller kaydı aç.

### Hangi değerler nereden alınacak

NexaPay entegrasyonu projeye eklendi. Şu anki model: **hosted checkout link template**.

| Değer | Nereden | Env |
|-------|---------|-----|
| **Checkout URL template** | NexaPay paneli / destekten “merchant checkout URL formatı” | `NEXAPAY_CHECKOUT_URL_TEMPLATE` |
| **Webhook secret** (opsiyonel ama önerilir) | NexaPay webhook ayarları | `NEXAPAY_WEBHOOK_SECRET` |
| **Webhook URL** | Senin API endpoint’in | `https://getsmsnow.com/api/nexapay/webhook` |

`NEXAPAY_CHECKOUT_URL_TEMPLATE` içinde kullanılabilen placeholder’lar:
`{amount}`, `{currency}`, `{order_id}`, `{email}`, `{customer_id}`, `{success_url}`, `{return_url}`, `{callback_url}`.

Örnek:
```bash
NEXAPAY_CHECKOUT_URL_TEMPLATE=https://nexapay.one/pay?amount={amount}&currency={currency}&order_id={order_id}&email={email}&success_url={success_url}&callback_url={callback_url}
NEXAPAY_WEBHOOK_SECRET=your-secret
```

### Projede aktif olan parçalar

1. **Top-up API:** `src/app/api/nexapay/create-payment/route.ts`
2. **Webhook API:** `src/app/api/nexapay/webhook/route.ts`
3. **Guest payment API:** `src/app/api/guest/create-payment/route.ts` (paymentMethod: `nexapay`)
4. **Veritabanı:** `supabase/migrations/004_nexapay_payments.sql`
5. **UI:** Dashboard top-up ve guest checkout ekranlarında Paddle yerine NexaPay seçeneği

### Yapılacaklar (senin tarafında)

1. nexapay.one (veya resmi adres) üzerinden kayıt ol.
2. Dashboard / destekten **checkout URL template** ve mümkünse **webhook secret** al.
3. Webhook URL olarak şunu (veya kendi domain’inle) ver:
   ```text
   https://getsmsnow.com/api/nexapay/webhook
   ```
4. `.env.local` veya Vercel’e ekle:
   ```bash
   NEXAPAY_CHECKOUT_URL_TEMPLATE=...
   NEXAPAY_WEBHOOK_SECRET=...
   ```

---

## Özet tablo

| Platform   | Ne için           | Zorunlu env                          | Webhook URL (senin sitede)        |
|-----------|-------------------|--------------------------------------|-----------------------------------|
| **Cryptomus** | Kripto ödeme      | `CRYPTOMUS_MERCHANT_ID`, `CRYPTOMUS_API_KEY` | `.../api/cryptomus/webhook`       |
| **NexaPay**   | Kart (hosted checkout) | `NEXAPAY_CHECKOUT_URL_TEMPLATE`, `NEXAPAY_WEBHOOK_SECRET` | `.../api/nexapay/webhook` |

---

## Referans linkler

- **Cryptomus:**  
  - [cryptomus.com](https://cryptomus.com)  
  - [API Keys](https://doc.cryptomus.com/business/general/getting-api-keys)  
  - [Merchant API](https://doc.cryptomus.com/merchant-api/)
- **NexaPay:**  
  - [nexapay.one](https://nexapay.one) – kayıt ve dashboard; API dokümanı sitede veya destekten iste.

Not: NexaPay’in gerçek API/parametre adları merchant hesabına göre değişebilir. Template + webhook modeli hızlı entegrasyon içindir; resmi API detayına göre alan adları güncellenebilir.
