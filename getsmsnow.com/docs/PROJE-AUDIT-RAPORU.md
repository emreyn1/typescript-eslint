# GetSMSNow – Proje Audit Raporu

Tam analiz sonucu tespit edilen sorunlar ve düzeltmeler.

---

## Kritik Sorunlar (Düzeltildi)

### 1. Register: User insert hata kontrolü yok
**Sorun:** `supabase.from("users").insert()` sonucu kontrol edilmiyordu. Insert başarısız olsa bile "success" dönüyordu.

**Düzeltme:** Insert sonucu kontrol edildi, hata varsa 500 dönüyor.

### 2. Verify-email: User yoksa bile success dönüyordu
**Sorun:** `update users set email_verified` 0 satır güncellese bile success dönüyordu. Kullanıcı "Email verified" görüp login deneyince hata alıyordu.

**Düzeltme:** Update öncesi user varlığı kontrol edildi.

### 3. Production env eksikliği
**Sorun:** Vercel'de `AUTH_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` eksikse:
- api/auth/session → 500
- api/auth/register → 503 "Auth not configured"

**Çözüm:** Vercel Environment Variables'a eklenmeli (ADIM-ADIM-PRODUCTION.md).

---

## API Uyumluluk Kontrolü

| Servis | Dokümantasyon | Uyum |
|--------|---------------|------|
| **Resend** | `resend.emails.send({ from, to, subject, html })` | ✅ Doğru |
| **Turnstile** | `POST siteverify`, `secret` + `response` (form-urlencoded) | ✅ Doğru |
| **Supabase** | `createClient(url, serviceKey)`, `.from().insert/update/select` | ✅ Doğru |
| **NextAuth v5** | `handlers`, `auth`, `signIn`, `signOut`, `trustHost` | ✅ Doğru |

---

## Auth Akış Özeti

```
Register:
  1. Turnstile verify (TURNSTILE_SECRET_KEY varsa)
  2. Supabase check: email exists?
  3. verification_codes: invalidate old, insert new
  4. Resend: send email (veya dev'de console.log)
  5. users: insert (password_hash, referral_code, email_verified=null)
  → Redirect /verify-email?email=...

Verify-email:
  1. verification_codes: son kullanılmamış kodu bul
  2. Kod eşleşiyor mu, süresi dolmamış mı?
  3. verification_codes: used=true
  4. users: email_verified=now() (user var mı kontrol)
  → Redirect /login?verified=1

Login:
  - credentials: email+password, supabase'den user, bcrypt compare, email_verified gerekli
  - email-code: verification_codes'dan kod, users'dan email_verified
  - google: OAuth
  - telegram: telegram-verify API → token → credentials
```

---

## Bağımlılık Sırası (Çalışması İçin)

1. **Supabase** – Tablolar oluşturulmuş olmalı (001, 002 migration)
2. **AUTH_SECRET** – NextAuth JWT imzalama
3. **NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY** – DB bağlantısı
4. **RESEND_API_KEY** – Email gönderimi (yoksa dev'de console.log)
5. **GOOGLE_CLIENT_ID/SECRET** – Google OAuth (opsiyonel)
6. **TURNSTILE** – Key yoksa atlanır (dev için)

---

## Test Checklist (Local)

- [ ] `.env.local` dolu (en az: AUTH_SECRET, SUPABASE_*, RESEND_*)
- [ ] `npm run dev` çalışıyor
- [ ] /registration → form doldur → Create Account
- [ ] Terminal'de kod görünüyor (RESEND yoksa) veya email geldi
- [ ] /verify-email?email=... → kodu gir → Verify
- [ ] /login → email+password veya email+code ile giriş
- [ ] /dashboard erişilebiliyor

---

## Bilinen Sınırlamalar

- **Turnstile:** Token 5 dakika geçerli, tek kullanımlık. Yavaş form doldurulursa yeniden çözülmeli.
- **Resend:** `onboarding@resend.dev` domain doğrulaması olmadan sadece kayıtlı email'lere gönderir.
- **Session 500:** AUTH_SECRET eksikse oluşur.
