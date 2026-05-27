# Vercel + Supabase + Resend Kurulumu

## 1. Supabase Dashboard Ayarları

### Auth → URL Configuration
- **Site URL:** `https://your-app.vercel.app` (Vercel domain)
- **Redirect URLs:** Şunları ekle:
  - `https://your-app.vercel.app/auth/callback`
  - `https://your-app.vercel.app/**`
  - `http://localhost:3000/auth/callback` (local dev için)

### Auth → Email
- **Confirm email:** Açık (email verification zorunlu)

### Auth → SMTP Settings (Resend)
- **Enable Custom SMTP:** Açık
- **Sender email:** `noreply@yourdomain.com` (Resend'de verify edilmiş domain)
- **Sender name:** `AllianceAroma`
- **Host:** `smtp.resend.com`
- **Port:** `465`
- **Username:** `resend`
- **Password:** Resend API Key (`re_xxxx`)

---

## 2. Vercel Environment Variables

Vercel Dashboard → Project → Settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | All |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | Production |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Preview (opsiyonel) |

**Önemli:** `NEXT_PUBLIC_SITE_URL` production'da Vercel domain olmalı. Aksi halde verification email linki yanlış domain'e gider.

---

## 3. Migration Çalıştırma

```bash
# Supabase CLI ile
npx supabase db push

# Veya Supabase Dashboard → SQL Editor → migration dosyasını yapıştır
```

---

## 4. Çalışma Kontrolü

1. **Kayıt:** `/register` → Email + şifre → "Verification email sent" mesajı
2. **Email:** Resend üzerinden gelen mail (spam kontrol et)
3. **Link tıkla:** `https://your-app.vercel.app/auth/callback?code=xxx` → Ana sayfaya yönlendirme
4. **Giriş:** Artık login çalışır

---

## Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| "Invalid redirect URL" | Supabase → Auth → URL Configuration → Redirect URLs'e domain ekle |
| Email gelmiyor | Resend dashboard'da log kontrol et; Supabase SMTP ayarlarını doğrula |
| "Email not confirmed" | Verification linkine tıklandı mı? Link doğru domain'de mi? |
| Build'de Supabase hatası | `.env.local` veya Vercel env'de key'ler tanımlı mı? |
