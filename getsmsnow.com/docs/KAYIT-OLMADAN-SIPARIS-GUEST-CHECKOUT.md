# Kayıt Olmadan Sipariş (Guest Checkout) – Artılar, Eksiler, Nasıl Yapılır

Sitede “kayıt olmadan sipariş” (guest checkout) eklemek hem avantaj hem dezavantaj getirir. Aşağıda özet ve uygulama notları var.

---

## 1. Avantajlar (neden iyi olabilir?)

- **Dönüşüm artar:** Kayıt engeli kalktığı için “hemen numara alayım” diyen kullanıcılar tamamlar; birçok rakip (receive-smss vb.) da düşük eşikle büyüdü.
- **SEO ve paylaşım:** “Kayıt yok, hemen dene” mesajı blog/toplulukta daha kolay anlatılır ve link paylaşılır.
- **İlk deneyim:** Yeni kullanıcı önce deneyip beğenirse sonra kayıt olabilir; “önce kayıt ol” engeli kalkar.
- **Rakiplerle uyum:** En hızlı tanınan sitelerde “ücretsiz / kayıtsız deneme” ortak nokta; sizde de olursa aynı kitleye hitap edersiniz.

Kısaca: Evet, birçok senaryoda **kayıt olmadan sipariş daha iyi olur** (dönüşüm ve algı açısından).

---

## 2. Dezavantajlar ve riskler

| Dezavantaj | Açıklama |
|------------|----------|
| **Bakiye yok** | Şu an sipariş bakiyeden düşülüyor. Misafir kullanıcının bakiyesi olmayacağı için **sipariş başına ödeme** (ödeme al → sonra numara aç) akışı gerekir; yani ayrı bir “guest payment” akışı. |
| **Sipariş takibi** | Misafir siparişi bir **token/link** ile göstermen gerekir (örn. `/order/abc123`). Link kaybolursa kullanıcı numaraya erişemez; “linki kaybettim” destek talebi artar. |
| **Suistimal** | Kayıt olmadan sipariş spam/bot için daha kolay: farklı IP’lerden tek seferlik siparişler. **Rate limit**, **CAPTCHA** (Turnstile zaten var) ve gerekirse e-posta/telefon doğrulama güçlendirilmeli. |
| **Destek / şikayet** | Hesap yok; “hangi sipariş?” demek için sadece order token veya e-posta kalır. Müşteri eşleştirmek biraz daha zahmetli. |
| **Yasal / fatura** | Bazı bölgelerde fatura veya “alıcı bilgisi” istenebilir; misafir için fatura adresi toplamak veya “faturasız” bırakmak politikası netleştirilmeli. |
| **Teknik iş** | İki akış olur: (1) Kayıtlı: bakiye ile sipariş. (2) Misafir: önce ödeme (Paddle/Cryptomus tek sipariş), sonra sipariş oluşturma ve sonuç sayfası. API, webhook ve sayfa mantığı ikiye ayrılır. |

Özet: Dezavantajlar **yönetilebilir**; rate limit, güçlü CAPTCHA, token ile sayfa ve net politika ile kontrol edilir.

---

## 3. Nasıl yapılır? (kısa teknik özet)

Mevcut akış: **Giriş zorunlu → Bakiye var → Sipariş bakiyeden düşülüyor.**

Misafir akışı için:

1. **Fiyatı göster, ödeme al (bakiye yok)**  
   Misafir ülke/hizmet seçer → tek siparişlik tutar hesaplanır → “Öde ve numara al” ile **Paddle** veya **Cryptomus** üzerinden **o tutar için** ödeme başlatılır. Ödeme `guest_order_id` (veya `order_token`) ile ilişkilendirilir; bakiye kullanılmaz.

2. **Ödeme tamamlanınca sipariş**  
   Webhook’ta (Paddle/Cryptomus) ödeme onaylanınca:  
   - SMSPool’da sipariş açılır (orderSms).  
   - Sonuç bir **guest order** kaydına yazılır (`guest_orders` veya `orders` tablosunda `user_id = null`, `guest_token = abc123`).  
   - Kullanıcıya **tek seferlik link** verilir: `https://site.com/order/abc123` (veya success sayfasında token ile).

3. **Numara ve SMS görüntüleme**  
   ` /order/[token]` sayfası: token ile guest order’ı bulur; numara ve gelen SMS’leri (SMSPool check API) gösterir. **Login zorunlu olmaz.** Sayfa sadece token ile erişilebilir; token bilinmezse erişim yok.

4. **Ödeme öncesi antlaşma alanı (görseldeki gibi – gerekli)**  
   Ödeme butonuna basmadan **önce** kullanıcının aşağıdakileri kabul etmesi gerekir (grizzlysms örneğindeki gibi):  
   - **“Kullanım koşulları / Public offer ile kabul ediyorum”** – tıklanabilir link + checkbox.  
   - **“Kişisel veriler ve çerez politikası ile kabul ediyorum”** – Gizlilik Politikası + çerez metni linki + checkbox.  
   İki checkbox da işaretlenmeden “Öde” / “PAY” butonu devre dışı veya tıklanınca uyarı verilir. Böylece:  
   - Tüketici hakları ve uzaktan satış yönetmeliklerine uyum sağlanır.  
   - Ödeme alındıktan sonra “koşulları kabul etmedim” itirazı azalır.  
   İsteğe bağlı: **E-posta** alanı (sipariş linki veya makbuz göndermek için); zorunlu yapılabilir veya opsiyonel bırakılabilir.

5. **Güvenlik**  
   - Turnstile (veya benzeri) misafir ödeme/sipariş adımında zorunlu.  
   - IP / cihaz bazlı rate limit (örn. aynı IP’den dakikada max 2–3 misafir siparişi).  
   - İsteğe bağlı: misafir için e-posta isteyip linki e-posta ile de göndermek (kayıt yok, sadece link iletimi).

6. **Veritabanı**  
   - `orders` tablosunda `user_id` nullable yapılabilir; `guest_token` (unique) eklenir.  
   - Veya ayrı `guest_orders` tablosu: `guest_token`, `smspool_order_id`, `phone_number`, `amount`, `status`, `created_at`, `payment_metadata` (paddle/cryptomus id).  
   - Ödeme webhook’larında `guest_order_id` / `order_token` ile eşleştirme yapılır.

---

## 4. Öneri

- **Evet, kayıt olmadan sipariş eklemek** dönüşüm ve “hemen dene” algısı için **genelde daha iyi**.  
- Dezavantajlar: bakiye yerine “ödeme al → sipariş aç” mantığı, token ile sayfa, rate limit ve CAPTCHA ile sınırlanır.  
- İlk adım: Sadece **misafir için tek siparişlik ödeme + `/order/[token]` sayfası** ile başlayıp; suistimal görülürse rate limit / ek doğrulama sıkılaştırılabilir.

Bu doküman, “kayıt olmadan sipariş yapsak daha iyi olmaz mı, dezavantajı var mı?” sorusuna cevap ve kısa uygulama rehberi niteliğindedir.

---

## Uygulama notu (yapıldı)

- **Migration:** `supabase/migrations/003_guest_orders.sql` çalıştırılmalı (Supabase SQL Editor veya `supabase db push`).
- **Akış:** Ana sayfa / SMS aktivasyon sayfasında giriş yapmadan “GET NUMBER” → `/guest/checkout?country=...&service=...` → tutar, ödeme öncesi şartlar + gizlilik checkbox’ları, e-posta (opsiyonel), Cryptomus/Paddle seçimi → öde → Cryptomus’ta ödeme sayfasına veya Paddle overlay’e gider → ödeme sonrası `/order/[token]` sayfasında numara ve SMS gösterilir.
- **Cookie banner:** Site genelinde gösterilir; “Accept all cookies” ile kapatılır, tercih `localStorage`’da saklanır.
