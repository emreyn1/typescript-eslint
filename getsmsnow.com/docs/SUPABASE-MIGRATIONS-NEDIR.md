# supabase/migrations Klasörü Nedir?

## Neden Var?

Bu klasör **veritabanı şemasını** (tablolar, indeksler) SQL dosyaları olarak tutar. Böylece:

1. **Versiyon kontrolü** – Şema değişiklikleri Git ile takip edilir
2. **Tekrarlanabilirlik** – Yeni ortamda aynı tablolar oluşturulabilir
3. **Dokümantasyon** – Hangi tabloların olduğu net görülür

## Dosyalar Ne Yapıyor?

| Dosya | İçerik |
|-------|--------|
| `001_initial.sql` | users, referrals, orders, balance_transactions, verification_codes, cryptomus_payments, telegram_login_tokens |
| `002_nowpayments_paddle_payments.sql` | nowpayments_payments, paddle_payments |

**Not:** Bu migration'lar şu an **manuel** çalıştırılıyor (Supabase Dashboard → SQL Editor). Supabase CLI kullanıyorsan `supabase db push` ile de uygulanabilir.

## Supabase Auth Kullanmıyoruz

Bu projede **Supabase Auth kullanılmıyor**. Sadece **Supabase Postgres** (veritabanı) kullanılıyor. Auth tarafı NextAuth + custom credentials ile yapılıyor. Bu yüzden migration'larda `auth.users` yok; kendi `users` tablomuz var.
