# Yaşadıklarımız – GetSMSNow Proje Günlüğü

Bu projeyi **sıfırdan** yaptık. Her adımda ne yaptık, ne yaşadık, hangi sorunlarla karşılaştık ve nasıl çözdük – hepsini burada topluyoruz.

---

## Proje Özeti

**GetSMSNow** – Geçici telefon numaraları ile SMS alma servisi. Kullanıcılar bakiye yükleyip ülke ve servis seçerek numara alıyor, gelen SMS’i görüntülüyor.

**Teknoloji:** Next.js 15, TypeScript, Tailwind CSS, Supabase, NextAuth.js, SMSPool API, Resend, Cryptomus, NOWPayments, Paddle.

---

## 1. Başlangıç – Proje Kurulumu

### Ne yaptık
- Next.js 15 projesi oluşturduk
- TypeScript, Tailwind CSS yapılandırdık
- SMSPool API entegrasyonu için temel yapıyı kurduk
- Ülke ve servis listelerini, fiyatlandırmayı (%70 marj) ayarladık

### Yaşadıklarımız
- SMSPool API dokümantasyonu ile mapping (ülke kodları, servis ID’leri) uğraştık
- `smspool-mapping.ts` ile kendi ID’lerimizi SMSPool’un ID’lerine çevirdik

---

## 2. Veritabanı – Supabase

### Ne yaptık
- Supabase projesi oluşturduk
- `001_initial.sql` migration: users, orders, balance_transactions, referrals, verification_codes, telegram_login_tokens
- `002_nowpayments_paddle_payments.sql`: Ödeme tabloları (NOWPayments, Paddle)
- Service role key ile server-side Supabase client

### Yaşadıklarımız
- Hangi tabloları oluşturacağımızı planladık (bakiye, sipariş, referral, doğrulama kodu)
- PostgreSQL vs NoSQL kararı – bakiye ve sipariş için transaction gerekli, SQL seçtik

---

## 3. Kimlik Doğrulama (Auth) – En Zor Kısım

### Ne yaptık
- NextAuth.js v5 kurulumu
- **Google OAuth:** Google Cloud Console’da OAuth client, redirect URI
- **Telegram Login Widget:** @BotFather ile bot, `/setdomain`, telegram-verify API
- **E-posta + şifre:** Kayıt, giriş, bcrypt ile şifre hash
- **E-posta doğrulama kodu:** Resend ile 6 haneli kod gönderimi, verification_codes tablosu
- `email_verified` zorunlu – kodu girmeden giriş yapılamıyor

### Yaşadıklarımız
- **E-posta doğrulama kodu gelmiyordu** – Bazı Gmail adreslerine (örn. eceseckin166@gmail.com) kod ulaşmıyordu; Resend domain doğrulaması, spam klasörü kontrolü
- **"Invalid or expired code"** – Doğru kodu yazmamıza rağmen hata: register ve send-code arasında kod invalidation tutarsızlığı vardı; register’da da önceki kodları invalidate ettik
- **Resend hata kontrolü** – API hata döndüğünde sessizce geçiyorduk; artık `sendError` kontrol ediyoruz
- **Kod formatı** – Kullanıcı "123 456" yapıştırınca form reddediyordu; zod transform ile sadece rakamları alıyoruz
- **Google OAuth "Testing" modu** – Sadece test kullanıcıları giriş yapabiliyordu; OAuth consent screen’de PUBLISH APP yaptık
- **allowDangerousEmailAccountLinking** – Aynı e-posta ile hem şifre hem Google hesabı birleştiriliyor; güvenlik vs UX trade-off

---

## 4. Ödeme Sistemi

### Ne yaptık
- **Cryptomus:** Kripto ödeme, create-invoice, webhook ile bakiye ekleme
- **NOWPayments:** Alternatif kripto, IPN webhook
- **Paddle:** Kredi kartı, Apple Pay, PayPal
- Top Up sayfası, bakiye yükleme, balance_transactions kaydı
- Sipariş atarken bakiyeden düşüm, yetersiz bakiye kontrolü

### Yaşadıklarımız
- **Webhook imza doğrulaması** – Her sağlayıcının farklı formatı; Cryptomus, Paddle, NOWPayments için ayrı ayrı implementasyon
- **NOWPayments:** `x-nowpayments-sig` boş olduğunda webhook işleniyordu – kritik güvenlik açığı; signature zorunlu yaptık
- **Idempotency** – Aynı webhook iki kez gelirse bakiye iki kez eklenmemeli; `already processed` kontrolü

---

## 5. Sipariş ve İptal Akışı

### Ne yaptık
- SMSPool’a sipariş gönderme (order), SMS kontrolü (check)
- Kullanıcı "İptal et" dediğinde SMSPool cancel + kullanıcı bakiyesine iade
- `/api/smspool/cancel` herkese açıktı – kaldırdık; sadece `/api/orders/cancel` (auth + ownership)
- `/api/smspool/balance` herkese açıktı – auth zorunlu yaptık

### Yaşadıklarımız
- **SMSPool cancel süresi** – Dokümanda net değil; 20 dakika–5 gün arası (numara havuzuna göre)
- **Race condition riski** – İki eşzamanlı sipariş bakiye kontrolünden geçebilir; transaction önerildi

---

## 6. Yasal Sayfalar

### Ne yaptık
- Privacy Policy, Terms of Service, Refund Policy yazdık
- Rakiplerin metinlerini referans aldık

### Yaşadıklarımız
- Hukukçu gözden geçirmesi henüz yapılmadı

---

## 7. SEO ve Meta

### Ne yaptık
- JSON-LD: Organization, WebSite, FAQPage
- Open Graph, Twitter Card
- robots.txt, sitemap.xml
- 404 sayfası

### Yapılacak
- favicon.ico, apple-touch-icon.png, og.png – dosyalar eksik

---

## 8. Güvenlik

### Düzeltilen açıklar
1. NOWPayments webhook – imza zorunlu
2. SMSPool cancel – yetkisiz erişim kapatıldı
3. SMSPool balance – auth zorunlu

### Yapılacak
- Rate limiting (auth, smspool API)
- CAPTCHA (kayıt, sipariş)
- Disposable email engeli
- Honeypot

---

## 9. Dokümantasyon

### Ne yaptık
- YAPILACAKLAR, BULUNANLAR, PRODUCTION-READY, PRODUCTION-READINESS
- ENV-KURULUM-REHBERI, GOOGLE-OAUTH-VERIFIED, GUVENLIK-KONTROL
- SENIN-YAPACAKLARIN, INDEX
- Tüm .md dosyalarını docs/ altında topladık

---

## Özet – Ne Öğrendik?

| Konu | Öğrendiğimiz |
|------|--------------|
| Auth | NextAuth çok provider destekliyor ama her biri ayrı config; e-posta doğrulama kendi implementasyonumuz |
| Ödeme | Webhook imzası her sağlayıcıda farklı; mutlaka doğrula |
| Güvenlik | Her endpoint’i "auth gerekli mi?" diye sorgula |
| E-posta | Resend iyi ama domain doğrulama, spam klasörü dikkat |
| Supabase | Migration’lar SQL Editor’de manuel çalıştırıldı; service role key asla client’a |

---

## Eklemek İstediklerin

Aşağıya kendi yaşadıklarını ekleyebilirsin – hangi gün ne yaptın, hangi hatayı aldın, nasıl çözdün:

---

*Son güncelleme: Şubat 2025*
