# Paddle, Cryptomus ve NOWPayments: Ne Yapılacak (Tek Tek) + Widget Bilgisi

Bu dokümanda **Paddle**, **Cryptomus** (crypto, aktif) ve **NOWPayments** (crypto, artık kullanılmıyor) için yapılacaklar adım adım listeleniyor. Ayrıca **linke atmak yerine kendi sitede gösterebileceğin widget/embed** seçenekleri ve **client key / env** ihtiyacı açıklanıyor.

---

## Paddle client key – Gerek var mı, isim ne?

- **Şu anki akış (linke yönlendirme):** Kullanıcı “Top Up” deyince API transaction oluşturuyor, tarayıcı Paddle’ın checkout sayfasına gidiyor. Bu akışta **client-side token gerekmez.** Sadece `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_ENV` yeterli; kodda client token kullanılmıyor.
- **İleride Paddle widget (inline/overlay) kullanırsan:** Checkout’u kendi sayfanda göstermek için Paddle.js kullanırsın. O zaman tarayıcıda bir **client-side token** lazım. Paddle Dashboard → **Developer tools** → **Authentication** → **Client-side token** oluştur, `.env.local` içine şunu ekle:
  ```bash
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_xxxx   # veya live_xxxx (production)
  ```
  İsim **NEXT_PUBLIC_PADDLE_CLIENT_TOKEN** olsun; tarayıcıda okunacağı için `NEXT_PUBLIC_` şart. Bu değişken `.env.example` içinde opsiyonel olarak tanımlı; widget’a geçtiğinde kodu buna göre yazacağız.

**Özet:** Client key’e **şu an ihtiyacın yok.** Sadece ileride “checkout’u sitede widget gibi göstereceğim” dersen o zaman alıp `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` olarak koyacaksın.

---

## A) Paddle – Ne yapılacak (tek tek)

1. **Hesap:** [developer.paddle.com](https://developer.paddle.com) → Hesap oluştur (sandbox ile başlayabilirsin).
2. **API Key:** Developer tools → **Authentication** → API Key oluştur → `.env.local` içine `PADDLE_API_KEY=...` yaz.
3. **Client-side token (opsiyonel, widget için):** Developer tools → **Authentication** → Client-side token oluştur. Inline/overlay checkout için gerekir.
4. **Default payment link (zorunlu):**  
   **Checkout** → **Checkout settings** → **Default payment link** alanına sayfa URL’ini yaz (örn. `https://getsmsnow.com/dashboard` veya test için `http://localhost:3000/dashboard`) → **Save**.  
   Bu yoksa transaction oluşmaz, 500 hatası alırsın.
5. **Webhook:** **Webhooks** → Notification URL: `https://getsmsnow.com/api/paddle/webhook` → Event: `transaction.completed` → Webhook secret oluştur → `.env.local` içine `PADDLE_WEBHOOK_SECRET=...` yaz.
6. **Ortam:** Test için `PADDLE_ENV=sandbox`, canlı için `PADDLE_ENV=production`. Canlıda production API key ve production hesabında da Default payment link + webhook tanımlı olmalı.

Detay: [PADDLE-KURULUM-VE-TEST-PRODUCTION.md](./PADDLE-KURULUM-VE-TEST-PRODUCTION.md).

---

## B) Cryptomus – Ne yapılacak (tek tek) *(crypto, aktif)*

1. **Hesap:** [cryptomus.com](https://cryptomus.com) → Merchant hesabı oluştur / giriş yap.
2. **Merchant ID ve API Key:**  
   - **Business** → **Merchants** → projeni seç → **Merchant settings** (veya **Settings** sekmesi).  
   - **Merchant ID** (UUID) ve **Payment API Key**’i kopyala.  
   - `.env.local` içine ekle:  
     `CRYPTOMUS_MERCHANT_ID=...`  
     `CRYPTOMUS_API_KEY=...`
3. **Domain / moderasyon:** Cryptomus’ta domain doğrulama ve merchant moderasyonu gerekebilir; onay sonrası API key kullanılabilir.
4. **Webhook:** Kodda webhook URL otomatik: `https://getsmsnow.com/api/cryptomus/webhook` (site URL’ine göre). Cryptomus panelinde **Callback URL** alanına bu adresi yazman gerekebilir (dokümana göre).
5. **Canlıda:** Aynı `CRYPTOMUS_MERCHANT_ID` ve `CRYPTOMUS_API_KEY` production ortamında da kullan; Vercel’de bu env’leri tanımla.

**Özet – Cryptomus için gerekli bilgiler:**

| Bilgi | Nereden | Env değişkeni |
|-------|---------|----------------|
| Merchant ID | Cryptomus → Business → Merchants → [proje] → Merchant settings | `CRYPTOMUS_MERCHANT_ID` |
| Payment API Key | Aynı sayfada (moderasyon sonrası) | `CRYPTOMUS_API_KEY` |
| Webhook URL | Sitenin API’si | `https://getsmsnow.com/api/cryptomus/webhook` (panelde callback olarak gir) |

Dokümantasyon: [Cryptomus API Keys](https://doc.cryptomus.com/business/general/getting-api-keys), [Merchant API](https://doc.cryptomus.com/merchant-api/).

---

## C) NOWPayments – Ne yapılacak (tek tek) *(artık kullanılmıyor; referans)*

1. **Hesap:** [account.nowpayments.io](https://account.nowpayments.io) → Kayıt ol.
2. **API Key:** Hesap içinden **API Key** al → `.env.local` içine `NOWPAYMENTS_API_KEY=...` yaz.
3. **IPN (webhook):** **Payment Settings** → **IPN (Instant Payment Notification)** → **IPN Callback URL:** `https://getsmsnow.com/api/nowpayments/webhook` → **IPN Secret** oluştur → `.env.local` içine `NOWPAYMENTS_IPN_SECRET=...` yaz.
4. **Canlıda:** Aynı API key ve IPN URL’ini production ortamında da kullan (domain’i kendi siten yap).

Detay: [ENV-KURULUM-REHBERI.md](./ENV-KURULUM-REHBERI.md) ve [ADIM-ADIM-PRODUCTION.md](./ADIM-ADIM-PRODUCTION.md).

---

## D) Widget var mı? (Linke atmak yerine kendi sitede)

**Evet, ikisi için de kendi sitende gösterebileceğin seçenekler var.**

### Paddle – Inline / Overlay Checkout (widget gibi, kendi sitede)

- **Var.** Kullanıcıyı Paddle’ın sayfasına yönlendirmek zorunda değilsin; checkout’u **kendi sayfanda** gösterebilirsin.
- **İki tür:**
  - **Overlay:** Sayfanın üstünde açılan pencere (modal). Birkaç satır Paddle.js kodu ile açılır.
  - **Inline:** Checkout, sayfada belirlediğin bir alanın içine gömülür (gerçek anlamda “widget”).
- **Nasıl:** Sayfaya **Paddle.js** ekleyip bir **client-side token** ile `Paddle.Initialize({ token: "..." })` yapıyorsun. Ödeme için:
  - Ya API ile transaction oluşturup dönen `transactionId` ile `Paddle.Checkout.open({ transactionId: "..." })` çağırıyorsun,
  - Ya da `Paddle.Checkout.open({ items: [...] })` ile direkt item/price veriyorsun.
- **Inline için:** `displayMode: "inline"` ve `frameTarget: "checkout-container"` gibi ayarlarla checkout’u bir `<div id="checkout-container">` içinde gösterirsin.
- Dokümantasyon: [Build inline checkout](https://developer.paddle.com/build/checkout/build-branded-inline-checkout), [Build overlay checkout](https://developer.paddle.com/build/checkout/build-overlay-checkout).

Özet: Linke atmak yerine kendi sitede widget gibi (inline veya overlay) kullanmak mümkün; Paddle bunu destekliyor.

---

### NOWPayments – Payment Widget (embed, kendi sitede)

- **Var.** “Payment Widget” ile ödemeyi kendi sitene gömebilirsin; kullanıcı siteden çıkmadan ödeme yapar.
- **Nasıl:** NOWPayments hesabında **Payment Solutions** → **Create Payment Link** → **Widget** seçeneği → Verilen **embed kodu**nu sitenin HTML’ine (veya React/Next.js’te uygun yere) yapıştırıyorsun. Widget tasarımını ve hangi alanların (isim, e-posta vb.) görüneceğini panelden özelleştirebiliyorsun.
- **Env / ekstra bir şey:** Mevcut **NOWPAYMENTS_API_KEY** ve **NOWPAYMENTS_IPN_SECRET** widget için **ekstra tanımlaman gerekmiyor.** Bunlar zaten API invoice oluşturma ve webhook için kullanılıyor. NOWPayments’ın verdiği widget embed kodu kendi içinde gerekli link/ID’yi taşır; ayrıca `.env`’e widget’a özel yeni bir key koyman gerekmez. (Widget’ı “paste embed code” ile kullanıyorsan dashboard’daki ayarlar yeterli; eğer ileride kendi React bileşeninde API ile invoice oluşturup widget’ı dinamik açarsan yine aynı NOWPAYMENTS_API_KEY ve IPN kullanılır.)
- Genel bilgi: [NOWPayments Payment Widget](https://nowpayments.io/payment-widget), [Widget guide](https://nowpayments.io/blog/widget-guide-nowpayments).

Özet: NOWPayments widget için **NOWPAYMENTS_API_KEY** ve **NOWPAYMENTS_IPN_SECRET** dışında ekstra env değişkeni yok; widget embed’i dashboard’dan alıyorsun.

---

## Özet tablo

| Ödeme      | Linke atma zorunlu mu? | Kendi sitede widget/embed |
|-----------|-------------------------|----------------------------|
| **Paddle**    | Hayır                    | Evet – Inline veya Overlay (Paddle.js + client-side token) |
| **Cryptomus** | Hayır (ödeme sayfasına yönlendirme) | Cryptomus’un kendi ödeme sayfası kullanılıyor |
| **NOWPayments** | Hayır *(pasif)*        | Evet – Payment Widget (embed kodu) |

İstersen mevcut akışı (şu an linke yönlendirme) koruyup sadece dokümantasyonu böyle bırakabilirsin; ileride inline/overlay veya NOWPayments widget’a geçmek istediğinde bu doc’taki adımlar ve linkler referans olur.
