# Paddle Kurulum: Default Payment Link ve Test / Production

Bu dokümanda Paddle ödemesinin çalışması için gerekli **Default Payment Link** ayarı ve **test (sandbox) / canlı (production)** moduna geçiş anlatılıyor.

---

## 1. "Default Payment Link has not yet been defined" hatası

Paddle’da **transaction** oluşturabilmek için hesabınızda **Default payment link** tanımlanmış olmalı. Tanımlı değilse:

- `POST /api/paddle/create-transaction` **500** döner
- Checkout açıldığında Paddle şu mesajı gösterebilir:  
  *"A Default Payment Link has not yet been defined within the Paddle Dashboard for this account, find this under checkout settings."*

### Ne yapmalı?

1. [Paddle Dashboard](https://developer.paddle.com) → **Checkout** → **Checkout settings**
2. **Default payment link** alanına, checkout’un açılacağı sayfanın URL’ini yazın.  
   Örnekler:
   - Production: `https://getsmsnow.com/dashboard` veya `https://getsmsnow.com/pay`
   - Sandbox (test): `https://getsmsnow.com/dashboard` veya `http://localhost:3000/dashboard`
3. Bu sayfa **Paddle.js** yüklü ve onaylı bir domain olmalı (sandbox’ta domain hemen onaylı sayılır).
4. **Save** ile kaydedin.

Kaynak: [Paddle – Set your default payment link](https://developer.paddle.com/build/transactions/default-payment-link)

---

## 2. Test modundan (sandbox) çıkma – Production’a geçiş

Ödemeleri **gerçek para** ile almak için Paddle’ı **production** modunda kullanmanız gerekir.

### Ortam değişkeni

| Değer        | API base                         | Açıklama              |
|-------------|-----------------------------------|------------------------|
| `sandbox`   | `https://sandbox-api.paddle.com`  | Test modu, canlı para yok |
| `production`| `https://api.paddle.com`          | Canlı ödeme            |

### Yapılacaklar

1. **`.env` / Vercel (production) ortamında:**
   ```bash
   PADDLE_ENV=production
   ```
2. **Paddle Dashboard’da production hesabını kullanın:**  
   Sandbox ve canlı hesaplar ayrıdır. Production API key ve webhook secret’ı **canlı** Paddle hesabından alın.
3. **Production’da da Default payment link** tanımlayın:  
   Checkout settings’te **Default payment link** alanını production site URL’inizle (örn. `https://getsmsnow.com/dashboard`) doldurun.
4. **Webhook:**  
   [developer.paddle.com](https://developer.paddle.com) → **Webhooks** → Notification URL:  
   `https://getsmsnow.com/api/paddle/webhook`  
   Event: `transaction.completed`  
   Webhook secret’ı `PADDLE_WEBHOOK_SECRET` ile aynı yapın.

Özet: Test modundan çıkmak = `PADDLE_ENV=production` + production API key/secret + production’da Default payment link ve webhook ayarı.

---

## 3. Özet checklist

- [ ] Paddle Dashboard → **Checkout** → **Checkout settings** → **Default payment link** dolu (sandbox ve/veya production için)
- [ ] Default payment link sayfası Paddle.js içeriyor ve (production’da) domain onaylı
- [ ] Canlı ödeme için: `PADDLE_ENV=production`, production API key ve webhook secret
- [ ] Webhook URL: `https://getsmsnow.com/api/paddle/webhook`

---

## 4. Sayfa sürekli yenileniyor (dashboard?_ptxn=...)

**Belirti:** Paddle Top Up tıklanınca adres `https://.../dashboard?_ptxn=txn_...` oluyor ve sayfa sürekli refresh oluyor.

**Neden:** Default payment link bu sayfaya yönlendiriyor; URL’de `_ptxn` varken Paddle.js veya SPA davranışı aynı sayfayı tekrar yükleyebiliyor ve döngü oluşuyor. Ayrıca redirect kullanmak yerine checkout’u aynı sayfada açmak daha doğru.

**Projede yapılanlar:**

- **Redirect kaldırıldı:** Paddle için artık `dashboard?_ptxn=...` adresine yönlendirme yok. API’den `transaction_id` gelince aynı sayfada `Paddle.Checkout.open({ transactionId })` ile overlay açılıyor.
- **Paddle her sayfada yüklü:** Paddle.js root layout’ta (`PaddleInit`) yüklendiği için dashboard açıldığında hazır; tıklayınca overlay hemen açılabiliyor.
- **URL temizleme:** Eğer kullanıcı doğrudan `.../dashboard?_ptxn=...` ile gelirse (paylaşılan link vb.), checkout bir kez açılıyor, ardından `history.replaceState` ile adres çubuğundan `_ptxn` kaldırılıyor; böylece refresh döngüsü engelleniyor.

Kaynak: [Pass a transaction to a checkout](https://developer.paddle.com/build/transactions/pass-transaction-checkout)

İlgili genel prod dokümanı: [ADIM-ADIM-PRODUCTION.md](./ADIM-ADIM-PRODUCTION.md).
