# Güvenlik Karşılaştırması – Rakip ve Büyük Firmalara Göre

GetSMSNow güvenliği, rakip SMS siteleri (smspool.net, grizzly, tiger-sms) ve büyük ödeme firmaları (Stripe, PayPal) ile karşılaştırıldı. **Sonuç: Bazı alanlarda güçlüyüz, birçok alanda zayıfız.**

---

## Genel Değerlendirme

| Kategori | Biz | Rakip SMS siteleri | Stripe/PayPal seviyesi |
|---------|-----|---------------------|------------------------|
| Webhook imzası | ✅ Var | Genelde var | ✅ Zorunlu |
| Auth zorunluluğu | ✅ Var | Var | ✅ Var |
| Rate limiting | ❌ Yok | Çoğunda var | ✅ Var |
| CAPTCHA | ❌ Yok | Çoğunda var | ✅ Var |
| WAF / DDoS | ❌ Yok | Cloudflare vb. | ✅ Var |
| RLS (DB) | ❌ Yok | Karışık | ✅ Var |
| IP whitelist (webhook) | ❌ Yok | Bazılarında | ✅ Önerilir |
| Monitoring/alerting | ❌ Yok | Var | ✅ Var |
| 2FA/MFA | ❌ Yok | Bazılarında | ✅ Var |

**Özet:** Ödeme webhook’ları ve kritik endpoint’lerde auth **güçlü**. Ama rate limit, CAPTCHA, WAF, monitoring **yok** – bu alanlarda rakiplerin ve büyük firmaların gerisindeyiz.

---

## ✅ GÜÇLÜ TARAFLARIMIZ (Teker Teker)

### 1. Webhook imza doğrulaması
- **Cryptomus:** MD5 hash, `sign` alanı zorunlu
- **NOWPayments:** HMAC-SHA512, `x-nowpayments-sig` zorunlu (boşsa 401)
- **Paddle:** HMAC-SHA256, `paddle-signature` header
- **Durum:** Stripe/PayPal seviyesinde – sahte webhook ile bakiye eklenemez

### 2. Auth zorunluluğu
- `/api/smspool/order`, `check`, `balance` – session gerekli
- `/api/orders/cancel` – auth + ownership kontrolü
- `/api/cryptomus/create-invoice`, `nowpayments/create-invoice`, `paddle/create-transaction` – auth gerekli
- `/api/user/balance` – auth gerekli
- **Durum:** Para ve sipariş ile ilgili endpoint’ler korumalı

### 4. Idempotency (webhook)
- Cryptomus, NOWPayments, Paddle – `already processed` kontrolü
- Aynı webhook iki kez gelse bakiye iki kez eklenmiyor
- **Durum:** Büyük firmalarla uyumlu

### 5. Güvenlik header’ları
- `X-Frame-Options: SAMEORIGIN` – clickjacking
- `X-Content-Type-Options: nosniff` – MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `poweredByHeader: false`
- **Durum:** Temel web güvenliği sağlanıyor

### 6. Gizli anahtarlar
- `.env` / `.env.local` `.gitignore` içinde
- API key’ler sadece server-side
- `NEXT_PUBLIC_*` sadece URL, bot adı gibi güvenli değerler
- **Durum:** Sızıntı riski düşük

### 7. SQL enjeksiyonu
- Supabase parametreli sorgular
- Ham SQL string birleştirme yok
- **Durum:** Enjeksiyon riski düşük

### 8. Telegram auth
- HMAC-SHA256 ile hash doğrulama
- Sahte widget verisi kabul edilmiyor
- **Durum:** OAuth benzeri güvenlik

### 9. Düzeltilmiş kritik açıklar
- NOWPayments: İmza boşken 401
- SMSPool cancel: Endpoint kaldırıldı, sadece auth’lu `/api/orders/cancel`
- SMSPool balance: Auth zorunlu
- **Durum:** Bilinen kritik açıklar kapatıldı

---

## ❌ ZAYIF TARAFLARIMIZ (Teker Teker)

### 1. Rate limiting YOK
- **Risk:** Brute-force (şifre, kod), toplu kayıt, API abuse, DDoS
- **Rakipler:** Cloudflare WAF, Upstash Redis vb. ile limit
- **Stripe:** Her endpoint için rate limit
- **Yapılacak:** `/api/auth/*`, `/api/smspool/*` için IP bazlı limit (örn. 5/dk send-code, 3/saat register)

### 2. CAPTCHA YOK
- **Risk:** Bot kayıt, bot sipariş, spam
- **Rakipler:** reCAPTCHA, hCaptcha, Turnstile
- **Yapılacak:** Kayıt ve sipariş formlarında CAPTCHA

### 3. WAF / DDoS koruması YOK
- **Risk:** SQL injection denemeleri, XSS, volumetrik saldırı
- **Rakipler:** Cloudflare (ücretsiz plan bile koruma sağlar)
- **Yapılacak:** Cloudflare önüne almak veya benzeri WAF

### 4. Webhook IP whitelist YOK
- **Risk:** İmza bilgisi sızdıysa (zero-day, config leak) sahte webhook
- **Stripe/PayPal:** IP whitelist önerilir
- **Yapılacak:** Cryptomus, NOWPayments, Paddle’ın webhook IP’lerini dokümantasyondan alıp sadece onları kabul et

### 5. Supabase RLS YOK
- **Risk:** Service role key sızdıysa tüm tablolar açık
- **Not:** Şu an tüm erişim server-side, RLS bypass edilir; ama defense-in-depth için RLS eklenebilir
- **Yapılacak:** `users`, `orders`, `balance_transactions` için RLS policy (opsiyonel, karmaşık)

### 6. Content-Security-Policy YOK
- **Risk:** XSS, inline script injection
- **Büyük firmalar:** Sıkı CSP header
- **Yapılacak:** `Content-Security-Policy` header eklenmesi

### 7. Brute-force koruması YOK (auth)
- **Risk:** Şifre deneme, kod deneme (6 haneli = 1M kombinasyon)
- **Yapılacak:** Rate limit + kod deneme sayısı sınırı (örn. 5 yanlış = 15 dk kilitleme)

### 8. Transaction / atomiklik YOK
- **Risk:** Bakiye düşüldü, sipariş kaydı hata verdi → tutarsızlık
- **Yapılacak:** Supabase transaction veya advisory lock

### 9. Monitoring / alerting YOK
- **Risk:** Saldırı veya hata oluşunca fark edememek
- **Rakipler:** Sentry, Datadog, CloudWatch
- **Yapılacak:** Sentry veya benzeri hata izleme

### 10. Disposable email engeli YOK
- **Risk:** Toplu sahte hesap
- **Yapılacak:** tempmail.com, guerrillamail.com vb. domain listesi

### 11. Honeypot YOK
- **Risk:** Basit botlar formu doldurup kayıt açabiliyor
- **Yapılacak:** Görünmez form alanı

### 12. 2FA/MFA YOK
- **Risk:** Hesap ele geçirilirse bakiye çalınabilir
- **Büyük firmalar:** 2FA zorunlu veya önerilir
- **Yapılacak:** TOTP (Google Authenticator) – orta/uzun vadeli

---

## Zero-Day ve Bakiye Çalınması Senaryosu

**“Zero-day ile tüm bakiyemi alırlarsa?”**

| Saldırı türü | Bizim durum | Açıklama |
|--------------|-------------|----------|
| **Webhook imzası bypass** | Zayıf | İmza algoritmasında zero-day olursa sahte webhook ile bakiye eklenebilir. **Azaltma:** IP whitelist, monitoring |
| **Auth bypass** | Orta | NextAuth/Supabase zero-day gerekir. **Azaltma:** Rate limit, 2FA |
| **DB doğrudan erişim** | Zayıf | Service role key sızdıysa tüm veri açık. **Azaltma:** RLS, key rotation, env güvenliği |
| **API abuse** | Zayıf | Rate limit yok; toplu istek ile servis yavaşlatılabilir veya SMSPool limiti tüketilebilir. **Azaltma:** Rate limit, WAF |

**Özet:** Zero-day riski her sistemde var. Bizim en büyük zafiyetler: **rate limit yok**, **webhook IP whitelist yok**, **monitoring yok**. Bunlar eklenirse hem normal saldırılara hem de olası zero-day’lere karşı dayanıklılık artar.

---

## Öncelik Sırası (Zayıflıkları Kapatmak İçin)

| Öncelik | Yapılacak | Zorluk | Etki |
|---------|-----------|--------|------|
| 1 | Rate limiting (auth + smspool) | Orta | Yüksek |
| 2 | Cloudflare (WAF + DDoS) | Düşük | Yüksek |
| 3 | CAPTCHA (kayıt, sipariş) | Düşük | Orta |
| 4 | Webhook IP whitelist | Düşük | Orta |
| 5 | Sentry (monitoring) | Düşük | Orta |
| 6 | Transaction (bakiye + sipariş) | Orta | Orta |
| 7 | Disposable email + honeypot | Düşük | Düşük |
| 8 | CSP header | Düşük | Düşük |
| 9 | 2FA | Yüksek | Orta |

---

*Son güncelleme: Şubat 2025*
