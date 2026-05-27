# Yapılacaklar – GetSMSNow

Production-ready ticaret sitesi için yapılması gerekenler. Tamamladıkça işaretleyebilirsin.

---

## Teknoloji seçimleri (karar verildi)

| Alan | Seçim |
|------|--------|
| **Veritabanı** | Supabase |
| **Auth** | NextAuth.js – Telegram, Google + site içi e-posta/şifre (doğrulama kodu ile) |
| **Ödeme** | Cryptomus |
| **Yasal sayfalar** | Rakip firmaların metinleri referans alınacak; yazıldıktan sonra gözden geçirilecek |

---

## Yapım sırası (öncelik)

1. **Veritabanı ve kullanıcı** (Supabase)
2. **Gerçek kimlik doğrulama** (NextAuth: Telegram, Google, e-posta + doğrulama kodu)
3. **Ödeme ve bakiye** (Cryptomus entegrasyonu)
4. **Yasal sayfalar** (rakipler referans, metin yazımı + gözden geçirme)

---

## ✅ 1. Veritabanı ve kullanıcı (Supabase) – TAMAMLANDI

- [x] Supabase projesi kurulumu (`supabase/migrations/001_initial.sql`)
- [x] Kullanıcı tablosu (users: email, password_hash, balance, referral_code, telegram_id, google_id)
- [x] Sipariş tablosu (orders)
- [x] Bakiye hareketleri tablosu (balance_transactions)
- [x] Referral ilişkisi (referrals tablosu)
- [x] Doğrulama kodu tablosu (verification_codes)
- [x] Supabase client (`src/lib/supabase.ts`)

---

## ✅ 2. Gerçek kimlik doğrulama (NextAuth) – TAMAMLANDI

- [x] NextAuth.js kurulumu (v5)
- [x] **Telegram** ile giriş (Widget + telegram-verify API)
- [x] **Google** ile giriş (Google provider)
- [x] **Site içi kayıt:** e-posta + şifre, doğrulama kodu gönderimi
- [x] **Site içi giriş:** e-posta + şifre veya e-posta ile doğrulama kodu
- [x] Doğrulama kodu gönderme (Resend)
- [x] Supabase ile kullanıcı eşleştirme (signIn callback)
- [ ] Forgot password (henüz placeholder)
- [x] Login/Register sayfaları gerçek auth'a bağlandı

---

## ✅ 3. Ödeme ve bakiye (Cryptomus) – TAMAMLANDI

- [x] Cryptomus API (create-invoice, webhook)
- [x] Bakiye yükleme (dashboard Top Up)
- [x] Webhook ile ödeme onayı → bakiye ekleme
- [x] Sipariş atarken bakiyeden düşüm; yetersiz bakiye kontrolü
- [x] Bakiye hareketleri (topup, spend, refund)

---

## ✅ 4. Yasal sayfalar – TAMAMLANDI

- [x] Gizlilik politikası (Privacy Policy)
- [x] Satış ve kullanım koşulları (Terms of Service)
- [x] İade politikası (Refund Policy)
- [ ] Yasal sayfaların gözden geçirilmesi (hukuk danışmanı önerilir)

---

## İade ve iptal akışı (SMS alınamazsa)

**Evet, kullanıcı iade alabilir.** SMSPool sipariş iptal edildiğinde **parayı iade ediyor** (bizim SMSPool bakiyemize).

**Akış:**
1. Kullanıcı numara aldı, SMS gelmedi (veya iptal etmek istiyor).
2. Biz `cancelSms(orderId)` çağırıyoruz → SMSPool siparişi iptal ediyor ve **bizim SMSPool bakiyemize** parayı geri yatırıyor.
3. Biz de kullanıcının **sitedeki bakiyesine** iade ettiğimiz tutarı (bizim sattığımız fiyat) geri ekliyoruz.

**Yapıldı:**
- [x] Sipariş iptal API'si: Kullanıcı "İptal et" dediğinde `cancelSms` çağrılsın, sonra kullanıcı bakiyesine iade eklenmesi.
- [ ] (Opsiyonel) Zaman aşımı: SMS X dakika içinde gelmezse otomatik iptal + iade.

---

## 🔴 5. Görseller ve meta

- [ ] `public/favicon.ico` (16×16, 32×32, 48×48 – tek .ico)
- [ ] `public/apple-touch-icon.png` (180×180 px)
- [ ] `public/og.png` (1200×630 px – sosyal paylaşım önizlemesi)

---

## 🟠 Yüksek trafik ve güvenlik (önerilen)

- [ ] Rate limiting: `/api/smspool/order`, `/api/smspool/price` (Upstash veya platform limiti)
- [ ] CAPTCHA: Kayıt, giriş, sipariş öncesi (reCAPTCHA v3, Turnstile vb.)
- [ ] Sentry veya benzeri hata izleme
- [ ] E-posta servisi (Resend, SendGrid) – doğrulama kodu ve şifre sıfırlama için

---

## 🛡️ Spam / abuse koruması (önerilen)

*Database'i hacklemeye veya binlerce sahte hesap açmaya çalışanlara karşı.*

- [ ] **Rate limiting (auth):** IP bazlı limit
  - [ ] `/api/auth/register`: 3–5 kayıt / IP / saat
  - [ ] `/api/auth/send-code`: 5 istek / IP / dakika
  - [ ] `/api/auth/verify-email`: 10 istek / IP / dakika
  - [ ] Yöntem: Upstash Redis + `@upstash/ratelimit` veya Cloudflare WAF
- [ ] **CAPTCHA:** Cloudflare Turnstile (ücretsiz) veya reCAPTCHA v3 – kayıt formunda
- [ ] **Disposable email engeli:** tempmail.com, guerrillamail.com vb. domain'leri reddet
- [ ] **Honeypot:** Görünmez form alanı; doldurulursa bot sayıp kaydı iptal et

---

## ✅ Kullanıcı paneli (dashboard) – TAMAMLANDI

- [x] Bakiye, sipariş geçmişi
- [x] Referral linki (Copy butonu)
- [x] Bakiye yükleme (Top Up – Cryptomus)
- [ ] Profil / şifre değiştirme
- [x] Sipariş iptal butonu → iade akışı

---

## 🟡 İsteğe bağlı

- [ ] Çok dilli (i18n)
- [ ] Analytics (GA4, Plausible)
- [ ] Fiyat / ülke cache (kısa TTL)
- [ ] API dokümantasyonu sayfası (Coming Soon kaldırma)

---

*Detay için: [PRODUCTION-READY.md](PRODUCTION-READY.md), [PRODUCTION-READINESS.md](PRODUCTION-READINESS.md)*
