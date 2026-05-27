# Google OAuth ile session.user.id Neden UUID? – Derin Analiz

## Soru

- Supabase `users.id` = UUID.
- `auth.ts` içinde `token.sub = user.id`.
- Google OAuth’ta `user.id`’nin provider’dan (Google sub) geleceği varsayıldı; o zaman session’da Google ID olur, DB’deki UUID ile eşleşmez, çalışmaması gerekir.
- Buna rağmen session’da UUID görülüyor. Neden?

---

## Auth.js Kaynak Kod Akışı

### 1. OAuth callback: `getUserAndAccount` (@auth/core)

**Dosya:** `node_modules/@auth/core/lib/actions/callback/oauth/callback.js` (satır 216–234)

```javascript
export async function getUserAndAccount(OAuthProfile, provider, tokens, logger) {
    const userFromProfile = await provider.profile(OAuthProfile, tokens);
    const user = {
        ...userFromProfile,
        // Yorum: "user's id is intentionally not set based on the profile id,
        // the user should remain independent of the provider"
        id: crypto.randomUUID(),   // <-- BURASI
        email: userFromProfile.email?.toLowerCase(),
    };
    return { user, account: { ... } };
}
```

Yani Auth.js, OAuth provider’dan gelen profile’ı kullanırken **bilerek** `user.id`’yi Google sub ile değil, **yeni bir `crypto.randomUUID()`** ile set ediyor. Amaç: kullanıcıyı provider’a bağımlı olmaktan çıkarmak; provider id’si zaten `account.providerAccountId`’de tutuluyor.

Sonuç: JWT’ye giden `user` objesinin `id`’si = **Auth.js’in ürettiği rastgele UUID**, Google sub değil.

---

### 2. Adapter yoksa: `handleLoginOrRegister`

**Dosya:** `node_modules/@auth/core/lib/actions/callback/handle-login.js` (satır 24–26)

```javascript
if (!adapter) {
    return { user: _profile, account: _account };
}
```

Bizim projede **adapter yok**. Bu durumda dönen `user`, yukarıdaki adımdan gelen `userFromProvider`; yani **yine aynı Auth.js UUID’li user**.

---

### 3. JWT’ye yazılan `sub`

**Dosya:** `node_modules/@auth/core/lib/actions/callback/index.js` (satır 70–76)

```javascript
const { user, session, isNewUser } = await handleLoginOrRegister(..., userFromProvider, ...);
const defaultToken = {
    name: user.name,
    email: user.email,
    picture: user.image,
    sub: user.id?.toString(),   // Auth.js UUID
};
const token = await callbacks.jwt({ token: defaultToken, user, account, ... });
```

Bizim `auth.ts` JWT callback’inde: `token.sub = user.id`. Buradaki `user` aynı obje; yani **`token.sub` = Auth.js’in ürettiği UUID**.

---

## Cevap: Neden session’da UUID görüyorsun?

Çünkü Auth.js, Google (ve diğer OAuth) girişlerinde **provider id’yi (Google sub) kullanmıyor**; bilinçli olarak `user.id = crypto.randomUUID()` atıyor. Bu yüzden:

- Session’daki `user.id` / `token.sub` **her zaman UUID formatında** (Auth.js random UUID).
- Bu değer **Google sub değil**; önceki “Google ID olur” varsayımı yanlıştı.

---

## Asıl problem: Bu UUID Supabase `users.id` ile aynı mı?

**Hayır.**

- Auth.js: Her OAuth callback’te **yeni bir** `crypto.randomUUID()` üretiyor.
- Bizim taraf: `signIn` callback’te Supabase’e insert/update yapıyoruz; **id’yi biz üretmiyoruz**, Supabase `gen_random_uuid()` veya mevcut satırın `id`’sini kullanıyor.
- Auth.js’e “benim DB user id’m bu” diye bir şey geri vermiyoruz; adapter olmadığı için Auth.js’in gördüğü tek `user` objesi kendi ürettiği UUID’li obje.

Yani:

- **Session’daki id:** Auth.js’in o istekte ürettiği UUID (örn. `09c3b979-5b6d-42b6-805c-e4828151de50`).
- **Supabase’deki id:** İlk kayıtta `gen_random_uuid()` veya mevcut kullanıcının `id`’si (farklı bir UUID).

Bunlar **aynı olmak zorunda değil**; çoğu durumda **farklı** olur.

---

## Bu yüzden “Referral code not available” ve ödeme 500’ü mantıklı

- Dashboard: `eq("id", session.user.id)` ile sorgu → Session’daki UUID çoğu zaman Supabase’deki hiçbir `users.id` ile eşleşmez → `user` null → balance/referral boş.
- Ödeme: `user_id: session.user.id` ile insert → Bu UUID `users` tablosunda yoksa FK hatası → 500.

Yani “auth çalışıyor” = JWT geçerli, sayfa login’e düşmüyor. Ama **session’daki id ile DB’deki user eşleşmediği** için referral ve ödeme bozuk.

---

## Senin testte gördüğün UUID

Sen `09c3b979-5b6d-42b6-805c-e4828151de50` gibi bir değer gördün. Bu:

1. **Auth.js’in o callback’te ürettiği UUID** ise → Supabase’de bu id’ye sahip bir user olmayabilir; referral/ödeme bu yüzden patlar.
2. **Tesadüfen** Supabase’de de aynı id’ye sahip bir user varsa (örn. eski bir test verisi) → O zaman o user bulunur, her şey o kullanıcı için “çalışıyor” gibi görünebilir.

Kontrol için: Supabase’de `users` tablosunda `id = '09c3b979-5b6d-42b6-805c-e4828151de50'` olan bir satır var mı bak. Yoksa session id ile DB id gerçekten uyuşmuyor demektir.

---

## Ne yapmalı?

JWT callback’te, Google (ve gerekirse diğer OAuth) girişlerinde **kendi user’ımızı bulup** `token.sub`’ı ona göre set etmeliyiz:

- Örnek: `account.provider === "google"` iken Supabase’de `google_id = account.providerAccountId` veya `email = token.email` ile user’ı bul; `token.sub = dbUser.id`.
- Böylece session’daki id **her zaman** Supabase `users.id` olur; referral ve ödeme API’leri doğru user’a bağlanır.

Bu mantık ayrı bir dokümanda veya `auth.ts` yorumu olarak eklenebilir; gerekirse bir sonraki adımda `auth.ts` için somut patch önerisi yazılabilir.
