# Supabase Auth'a Geçiş Rehberi

Bu doküman, mevcut NextAuth + custom auth sisteminden **Supabase Auth**'a geçiş için adım adım kılavuzdur.

---

## Hızlı Uygulama Sırası

Geçişi yaparken bu sırayı takip et:

1. **Supabase Dashboard** – Auth providers aç, redirect URL ekle
2. **Paketler** – `@supabase/ssr` kur
3. **Client dosyaları** – `src/lib/supabase/client.ts` ve `src/lib/supabase/server.ts` oluştur
4. **Auth callback** – `src/app/auth/callback/route.ts` ekle
5. **Migration** – `003_supabase_auth.sql` çalıştır (profiles tablosu)
6. **Login/Register** – Sayfaları Supabase Auth çağrılarına çevir
7. **API route'lar** – `auth()` yerine `supabase.auth.getUser()` kullan
8. **Middleware** – Session kontrolü ekle
9. **NextAuth kaldır** – `next-auth`, `auth.ts`, `api/auth/[...nextauth]` sil

---

## Ön Hazırlık

### Mevcut Sistem Özeti

- **NextAuth** – Session, credentials, OAuth (Google, Telegram)
- **Supabase** – Sadece Postgres (users, orders, vb.)
- **Resend** – Email doğrulama kodu
- **Custom** – verification_codes, password_hash, telegram_login_tokens

### Supabase Auth ile Değişecekler

| Şu an | Supabase Auth ile |
|-------|-------------------|
| users tablosu (kendi) | auth.users + public.profiles (veya users) |
| password_hash, email_verified | auth.users içinde |
| verification_codes | Supabase magic link / OTP |
| Google OAuth | Supabase Auth providers |
| Telegram | Custom (Supabase Auth'ta yok, kalacak) |
| NextAuth session | Supabase session (getSession) |

---

## Adım 1: Supabase Projesinde Auth Ayarları

### 1.1 Dashboard → Authentication → Providers

- **Email:** Açık (Sign up, Confirm email)
- **Google:** Açık – Client ID ve Secret ekle (Google Cloud Console'dan)
- **Magic Link:** İstersen aç (şifresiz giriş)

### 1.2 Authentication → URL Configuration

- **Site URL:** `https://getsmsnow.com` (production) veya `http://localhost:3000` (dev)
- **Redirect URLs:** 
  - `http://localhost:3000/**`
  - `https://getsmsnow.com/**`

### 1.3 Email Templates (Opsiyonel)

- Authentication → Email Templates
- Confirm signup, Magic link, Reset password vb. şablonları düzenle

---

## Adım 2: Supabase Client Kurulumu

```bash
npm install @supabase/supabase-js @supabase/ssr
```

`.env.local` (anon key kullan – Supabase Dashboard → Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Not:** `SUPABASE_SERVICE_ROLE_KEY` admin/API işleri için kalsın; Auth client tarafında `anon` kullan.

---

## Adım 3: Client Dosyaları

### `src/lib/supabase/client.ts` (Client Component için)

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### `src/lib/supabase/server.ts` (Server Component, API route, Route Handler için)

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component'tan çağrıldığında ignore edilebilir
          }
        },
      },
    }
  );
}
```

---

## Adım 4: Veritabanı Şeması

Supabase Auth kullanınca `auth.users` otomatik gelir. Bizim `users` tablosunu **profiles** veya **auth.users ile ilişkili** yapıya çevirmemiz gerekir.

### 4.1 Yeni Migration: `003_supabase_auth.sql`

```sql
-- auth.users zaten Supabase tarafından yönetiliyor
-- Bizim users tablosu: balance, referral_code ile genişletilmiş profil

-- profiles: auth.users ile 1:1 ilişki
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  image TEXT,
  balance DECIMAL(12, 4) DEFAULT 0 NOT NULL,
  referral_code TEXT UNIQUE,
  telegram_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- auth.users insert olduğunda profile oluştur (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, image)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4.2 Mevcut Tabloları Güncelle

`orders`, `balance_transactions`, `referrals` vb. `user_id` yerine `auth.users(id)` ile ilişkilendir. `users` tablosunu kaldırıp `profiles` kullan.

**Önemli:** Mevcut veri varsa migration script ile `users` → `profiles` + `auth.users` eşlemesi yapılmalı (manuel veya script).

---

## Adım 5: Auth Akışları

### 5.1 Email + Şifre Kayıt

```ts
"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "secure-password",
  options: {
    data: { name: "John" }
  }
});
// Email confirmation açıksa kullanıcıya link gider
```

### 5.2 Email + Şifre Giriş

```ts
"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

### 5.3 Google OAuth

```ts
"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: { access_type: "offline", prompt: "consent" },
  },
});
```

### 5.4 Auth Callback Route

OAuth (Google) girişinden sonra bu route'a yönlendirilir. Session'ı cookie'ye yazar.

`src/app/auth/callback/route.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
```

**Önemli:** Supabase Dashboard → Authentication → URL Configuration → Redirect URLs'e ekle:
- `https://getsmsnow.com/auth/callback`
- `http://localhost:3000/auth/callback`

---

## Adım 6: Session Kullanımı

### Server Component / API

```ts
import { createServerClient } from "@supabase/ssr";

const supabase = createServerClient(...);
const { data: { user } } = await supabase.auth.getUser();
```

### Client Component

```ts
const { data: { user } } = await supabase.auth.getUser();
// veya
supabase.auth.onAuthStateChange((event, session) => { ... });
```

---

## Adım 7: Telegram (Özel Durum)

Supabase Auth'ta **Telegram provider yok**. İki seçenek:

1. **Custom token:** Mevcut telegram-verify API'yi koru; doğrulama sonrası `supabase.auth.setSession()` veya custom JWT ile oturum aç (Supabase custom token desteği varsa).
2. **Tamamen kaldır:** Sadece Email + Google kullan.

---

## Adım 8: Balance, Orders, Referrals

Bu tablolar `user_id` ile `auth.users(id)` veya `profiles(id)` referans edecek. API route'larda:

```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const userId = user.id;
```

---

## Adım 9: NextAuth Kaldırma

1. `next-auth` paketini kaldır
2. `auth.ts`, `api/auth/[...nextauth]` sil veya devre dışı bırak
3. Login/Register sayfalarını Supabase Auth çağrılarına çevir
4. Middleware'de `getSession()` yerine Supabase `getUser()` kullan

---

## Adım 10: Middleware

Session yenileme ve korumalı sayfa kontrolü. `src/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value }) => supabaseResponse.cookies.set(name, value));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Giriş yok ve /dashboard veya /sms-activations/order gibi korumalı sayfadaysa → login'e yönlendir
  if (!user && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/sms-activations/order"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(url);
    redirect.cookies.setAll(supabaseResponse.cookies.getAll());
    return redirect;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

---

## Özet Checklist

- [ ] Supabase Auth providers (Email, Google) aç
- [ ] Redirect URLs ayarla
- [ ] `profiles` tablosu + trigger oluştur
- [ ] Mevcut `users` verisini migrate et (varsa)
- [ ] Login/Register sayfalarını Supabase Auth'a çevir
- [ ] Auth callback route ekle
- [ ] Middleware güncelle
- [ ] API route'larda `getUser()` kullan
- [ ] NextAuth kaldır
- [ ] Telegram: custom kalacak veya kaldırılacak

---

## Dikkat Edilecekler

1. **Email confirmation:** Supabase varsayılan olarak email doğrulama ister; kapatılabilir.
2. **Magic link:** Şifresiz giriş için kullanılabilir.
3. **RLS:** `profiles`, `orders` vb. için Row Level Security mutlaka tanımla.
4. **Mevcut kullanıcılar:** `users` → `auth.users` + `profiles` migration'ı dikkatli yap; şifreler Supabase formatında değilse yeniden kayıt gerekebilir.
5. **İki client:** Auth için `createClient()` (anon key), orders/balance yazmak için mevcut `supabase` (service_role) kullan. API route'ta önce `createClient()` ile `getUser()`, sonra `user.id` ile `supabase` (service_role) ile veri yaz.

---

## Referanslar

- [Supabase Auth – Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Auth – Social Login (OAuth)](https://supabase.com/docs/guides/auth/social-login)
