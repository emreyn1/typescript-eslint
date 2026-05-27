# Bulunanlar – GetSMSNow Kod İncelemesi

Yapılan implementasyonun incelenmesi sonucu tespit edilen durumlar.

---

## ✅ Yerli Yerinde Olanlar

| Alan | Durum |
|------|--------|
| **Supabase schema** | users, orders, balance_transactions, referrals, verification_codes, cryptomus_payments, telegram_login_tokens tam |
| **Auth** | Google, Telegram (Widget + verify), E-posta/şifre, E-posta/kod |
| **Cryptomus** | Invoice oluşturma, webhook ile bakiye ekleme, idempotency (already processed) |
| **Sipariş** | Auth zorunlu, bakiye kontrolü, bakiyeden düşüm, DB kaydı |
| **İptal/iade** | `cancelSms` + bakiye iade, referrals tablosu var |
| **Dashboard** | Bakiye, Top Up, referral link (Copy), sipariş listesi, iptal |
| **Yasal sayfalar** | Privacy, Terms, Refund yazıldı |
| **Navbar** | Session’a göre Login/Register veya Dashboard/Logout |

---

## ⚠️ Eksik / Düzeltilmesi Gerekenler

### 1. Referral sistemi pasif

- `referral_code` ve `referrals` tablosu var ama:
  - Kayıtta `?ref=CODE` ile gelen referral link işlenmiyor
  - Referral linki kayıt sayfasına yönlendirmiyor
  - Referral komisyonu hesaplanmıyor

**Yapılacak:** `registration?ref=CODE` URL desteği, kayıt sırasında `referrals` tablosuna insert.

---

### 2. ~~Kayıt mesajı yanıltıcı~~ (Güncellendi)

- **Şu an:** E-posta doğrulama kodu zorunlu; `email_verified` olmadan giriş yapılamıyor. "Check your email for verification code" mesajı doğru.

---

### 3. Forgot password placeholder

- Şu an sadece demo (setTimeout ile fake success)

**Yapılacak:** Gerçek şifre sıfırlama (Resend + token tablosu).

---

### 4. Sipariş akışında race condition riski

- İki eşzamanlı sipariş aynı anda bakiye kontrolünden geçebilir; ikisi de yeterli görür.

**Öneri:** Supabase transaction veya advisory lock ile bakiye güncellemesini atomik yap.

---

### 5. Cryptomus webhook imza doğrulaması

- JSON parse → sign kaldır → `JSON.stringify` ile hash hesaplanıyor; bu sırada key order değişebilir ve imza eşleşmeyebilir.

**Öneri:** Cryptomus’un gönderdiği raw body’den sign çıkarılıp doğrulama; Cryptomus dokümantasyonuna göre kontrol edilmeli.

---

### 6. Order API – SMSPool hata sonrası state

- `orderSms` başarısız olursa bakiye düşülmüyor (doğru).
- Ancak `orderSms` başarılı, DB güncellemesi hata verirse bakiye düşülmüş ama sipariş kaydı olmayabilir.

**Öneri:** Bakiye güncellemesi + sipariş kaydı tek transaction içinde yapılmalı.

---

### 7. Görseller / meta eksik

- `favicon.ico`, `apple-touch-icon.png`, `og.png` hâlâ eksik (YAPILACAKLAR’da işaretli).

---

### 8. Google provider – boş credentials

- `GOOGLE_CLIENT_ID ?? ""` → boş string ile Google provider hata verebilir.

**Öneri:** Google credentials yoksa provider’ı hiç ekleme veya env kontrolü ile disabled yap.

---

### 9. Profil / şifre değiştirme

- Dashboard’da profil veya şifre değiştirme ekranı yok (YAPILACAKLAR’da işaretli).

---

## 🟡 İyileştirme Önerileri

| Öneri | Öncelik |
|-------|---------|
| Rate limiting (order, price API) | Yüksek |
| CAPTCHA (kayıt, giriş, sipariş) | Yüksek |
| Resend yokken `console.log` ile kod (development) | Var |
| Telegram widget – `NEXT_PUBLIC_TELEGRAM_BOT_NAME` yoksa gizleme | Var |
| RLS (Supabase) – API zaten user kontrolü yapıyor | Düşük |

---

## Özet

Temel akışlar (auth, sipariş, ödeme, iptal, dashboard) çalışır durumda. Öncelikli eksikler:

1. Referral link’inin kayıtla entegrasyonu  
2. Gerçek Forgot password  
3. Sipariş akışında race condition’a karşı transaction  
4. Cryptomus webhook imza doğrulamasının güvenilir hale getirilmesi  
5. Favicon ve meta görseller  

---

*Detay için: [YAPILACAKLAR.md](YAPILACAKLAR.md), [PRODUCTION-READY.md](PRODUCTION-READY.md)*



# Bulunanlar – Düzeltilmesi Gereken Noktalar

GetSMSNow projesi gözden geçirmesinde tespit edilen eksiklikler ve iyileştirme önerileri.

---

## 1. Referral takibi eksik

**Durum:** Referral linki dashboard’da `?ref=CODE` formatında gösteriliyor ama hiçbir yerde işlenmiyor.

**Eksikler:**
- Registration sayfası URL’deki `ref` parametresini okumuyor
- Register API’si `ref` parametresini almıyor
- `referrals` tablosuna kayıt yapan kod yok
- Referral komisyonu hesaplama yok

**Yapılacaklar:**
- [ ] Registration sayfasında `useSearchParams()` ile `ref` parametresini oku
- [ ] Register API’ye `ref` parametresi ekle
- [ ] Kayıt sırasında `ref` geçerliyse `referrals` tablosuna `referrer_id` ve `referred_id` insert et
- [ ] Referral komisyonu mantığını tanımla ve (opsiyonel) sipariş sonrası komisyon hesaplama ekle

**Dosyalar:** `src/app/registration/page.tsx`, `src/app/api/auth/register/route.ts`

---

## 2. Forgot Password placeholder

**Durum:** Forgot password sayfası sadece demo; gerçek e-posta gönderimi veya şifre sıfırlama yok.

**Yapılacaklar:**
- [ ] `/api/auth/forgot-password` API: e-posta ile token oluştur, `verification_codes` veya benzeri tabloya kaydet, Resend ile link gönder
- [ ] `/reset-password?token=...` sayfası: token doğrula, yeni şifre formu, güncelleme API’si
- [ ] `users` tablosunda `password_reset_token` / `password_reset_expires` veya `verification_codes` ile token yönetimi

**Dosyalar:** `src/app/forgot-password/page.tsx`, `src/app/reset-password/page.tsx`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`

---

## 3. Rate limiting yok

**Durum:** Aşağıdaki endpoint’lerde rate limit yok; spam, bruteforce ve abuse riski var.

**Etkilenen endpoint’ler:**
- `/api/auth/send-code` – e-posta spam
- `/api/auth/register` – toplu kayıt
- `/api/smspool/order` – yoğun istek

**Yapılacaklar:**
- [ ] Upstash Redis veya benzeri rate limit servisi kur
- [ ] Middleware veya route handler’larda IP bazlı limit ekle (örn. send-code: 5/dk, register: 3/saat, order: 30/dk)
- [ ] `src/middleware.ts` içinde veya ilgili route’larda kontrol ekle

**Öneri:** `@upstash/ratelimit` paketi kullanılabilir.

---

## 4. Sipariş race condition / transaction

**Durum:** `orderSms` başarılı olup Supabase update hata verirse, kullanıcı numara almış olur ama bakiye düşmeyebilir.

**Yapılacaklar:**
- [ ] Supabase transaction kullan veya tüm DB işlemlerini tek transaction içinde yap
- [ ] DB update hata verirse SMSPool cancel çağrısı yap (rollback benzeri)
- [ ] Gerekirse retry logic ekle

**Dosyalar:** `src/app/api/smspool/order/route.ts`

---

## 5. Cryptomus webhook imza doğrulaması

**Durum:** JSON key sırası farklı olursa imza uyuşmazlığı olabilir; Cryptomus dokümantasyonu ile karşılaştırma gerekebilir.

**Yapılacaklar:**
- [ ] İlk canlı ödemede webhook imza hatası alınırsa, Cryptomus’un gönderdiği JSON sırasına göre imza hesaplamasını güncelle
- [ ] Dokümantasyondaki PHP örneği ile JS implementasyonunu karşılaştır
- [ ] Gerekirse `JSON.stringify` yerine belirli key sırasıyla serialize et

**Dosyalar:** `src/app/api/cryptomus/webhook/route.ts`

---

## 6. ~~Kayıt ekranı mesajı tutarsızlığı~~ (Güncellendi)

**Durum:** Kayıtta “Check your email for verification code” deniyor ama aslında hesap oluşturuluyor ve kullanıcı şifreyle hemen giriş yapabiliyor. **Şu an:** E-posta doğrulama kodu zorunlu; kodu girmeden giriş yapılamıyor. Mesaj doğru.

**Yapılacaklar (tamamlandı):**
- [ ] Ya mesajı netleştir: “Account created. You can log in with your password. We also sent a code – you can use it for passwordless login.” gibi
- [ ] Ya da gerçek e-posta doğrulama akışı kur: `email_verified = false` ile aç, kodu girmeden tam erişim verme

**Dosyalar:** `src/app/registration/page.tsx`, `src/app/api/auth/register/route.ts`

---

## 7. Order sayfası callbackUrl parametreleri

**Durum:** `countryId` null olduğunda `country=null` string’e dönüyor; callback URL’de bozuk parametre olur.

**Yapılacaklar:**
- [ ] `country=${countryId ?? ""}&service=${serviceId ?? ""}&period=${periodId ?? ""}` gibi null-safe format kullan
- [ ] Veya `undefined` parametreleri URL’e ekleme

**Dosyalar:** `src/app/sms-activations/order/page.tsx`

---

## 8. allowDangerousEmailAccountLinking

**Durum:** Aynı e-posta ile hem e-posta/şifre hem Google ile hesap açıldığında hesaplar birleştiriliyor. E-posta ele geçirilirse hesap bağlantısı risk oluşturabilir.

**Yapılacaklar:**
- [ ] Güvenlik öncelikliyse: `allowDangerousEmailAccountLinking: false` yap; kullanıcıya “Bu e-posta zaten başka bir yöntemle kayıtlı” mesajı göster
- [ ] UX öncelikliyse: mevcut davranışı koru; gerekirse ek doğrulama (e-posta onayı) ekle

**Dosyalar:** `src/auth.ts`

---

## Özet

| # | Konu | Öncelik | Zorluk |
|---|------|---------|--------|
| 1 | Referral takibi | Yüksek | Orta |
| 2 | Forgot password | Yüksek | Orta |
| 3 | Rate limiting | Yüksek | Orta |
| 4 | Sipariş transaction | Orta | Orta |
| 5 | Cryptomus webhook imza | Düşük (sorun çıkarsa) | Düşük |
| 6 | Kayıt mesajı tutarlılığı | Düşük | Düşük |
| 7 | Order callbackUrl null | Düşük | Düşük |
| 8 | Email account linking | Düşük (politika) | Düşük |

---

*Oluşturulma: Proje gözden geçirmesi sonrası*
