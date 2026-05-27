# Alliance Aroma — Musteri Devir Rehberi

> Bu dokuman, siteyi kendi hesaplarinla demo amacli kurduktun sonra musteriye devir ederken hangi degerlerin degistirilmesi gerektigini ve nelere dikkat edilmesi gerektigini aciklar.

---

## KISA CEVAP

**Hayir, sorun olmaz.** Tum servislerdeki hesaplari ve env degerlerini degistirmek SEO'yu veya sitenin calismasini ETKILEMEZ — asagidaki kurallara uyuldugu surece.

---

## DEGISTIRILECEK DEGERLER VE ETKILERI

### Sorunsuz Degisir (Sifir Etki)

| Deger | Neden Sorun Olmaz |
|-------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Veritabani baglantisi, disa acik degil. Yeni Supabase projesi = yeni temiz DB. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side anahtar, tarayicida gorulur ama RLS ile korunur. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side, disaridan erisimiz yok. |
| `STRIPE_SECRET_KEY` | Server-side, SEO ile ilgisi yok. |
| `STRIPE_WEBHOOK_SECRET` | Server-side, SEO ile ilgisi yok. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Sadece Stripe.js yuklemek icin, SEO etkisi yok. |
| `RESEND_API_KEY` | E-posta gonderim anahtari, SEO ile ilgisi yok. |
| `SENTRY_AUTH_TOKEN` | Build-time source map yuklemek icin, SEO ile ilgisi yok. |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Hata raporlama, SEO ile ilgisi yok. |
| Google OAuth (Supabase Dashboard) | Auth provider, SEO ile ilgisi yok. |
| Facebook OAuth (Supabase Dashboard) | Auth provider, SEO ile ilgisi yok. |

### Dikkatli Degistirilmeli (Asagidaki Notlara Uy)

| Deger | Dikkat Edilecek |
|-------|-----------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Eski proje verileri kaybolur. Sorun degil — musteri sifirdan baslar. |
| `NEXT_PUBLIC_SENTRY_DSN` | Eski hata raporlari kaybolur. Sorun degil — musteri kendi hata takibini gorur. |
| `RESEND_FROM_EMAIL` | Musterinin kendi domaini ile domain dogrulamasi yapilmali (DNS kayitlari). |
| `NEXT_PUBLIC_SITE_URL` | Domain ayni kaliyorsa degismeye gerek yok. |

---

## KESINLIKLE SEO'YU ETKILEMEZ

Asagidakiler tamamen backend/altyapi degerleri — arama motorlari bunlari GORMEZ:

- Supabase URL ve anahtarlari
- Stripe anahtarlari
- Resend API key
- Sentry DSN
- PostHog key
- OAuth provider ayarlari

**Arama motorlari sadece sunlari gorur:**
- HTML icerik (degismiyor)
- Meta taglari: title, description, OG tags (kodda sabit, env'e bagli degil)
- JSON-LD structured data (kodda sabit)
- `robots.txt` ve `sitemap.xml` (kodda sabit)
- Sayfa URL'leri (domain ayni kaldigi surece degismiyor)

---

## GSC (Google Search Console) HAKKINDA

Google Search Console bir env degeri DEGILDIR. Tamamen Google tarafinda yonetilir.

### Senin demo hesabinla GSC'ye eklersen:

1. **Musteriye devretme secenekleri:**
   - GSC → Settings → Users and permissions → musteri emailini **Owner** olarak ekle
   - Sonra kendi hesabini kaldir
   - **VEYA** musteri kendi GSC hesabindan domaini tekrar ekler (Cloudflare DNS dogrulama 2 dk surer)

2. **SEO etkisi:** SIFIR. GSC sahipligini degistirmek:
   - Siralama etkilemez
   - Indexleme etkilemez
   - Sayfa performansi etkilemez
   - GSC sadece bir IZLEME aracir, siralama faktoru degildir

### Tavsiye:
GSC'yi musterinin kendi Google hesabiyla kurmasi daha temiz. Sen demo icin kurma — gerek yok.

---

## MUSTERIYE DEVIR ADIMLARI

### Adim 1: Musteri Kendi Hesaplarini Olusturur

Musteri asagidaki servislerde kendi hesabini acar:
- [ ] Supabase (yeni proje)
- [ ] Stripe (kendi sirket bilgileriyle)
- [ ] PostHog
- [ ] Resend
- [ ] Sentry
- [ ] Google Cloud Console (OAuth icin)
- [ ] Facebook Developers (OAuth icin)

### Adim 2: Veritabanini Migrate Et

Musterinin yeni Supabase projesinde SQL Editor'de 3 migration dosyasini sirayla calistir:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_self_referral_protection.sql`
3. `supabase/migrations/003_security_hardening.sql`

> Demo sirasinda olusturulan test kullanicilari/siparisler TASINMAZ. Yeni Supabase = temiz baslangic.

### Adim 3: Supabase Auth Ayarlari

Musterinin Supabase Dashboard'unda:
- Authentication → URL Configuration → Site URL: `https://alliancearoma.com`
- Redirect URL'lere `https://alliancearoma.com/auth/callback` ekle
- Google ve Facebook provider'lari musterinin kendi OAuth bilgileriyle kur

### Adim 4: Resend Domain Dogrulamasi

Musteri kendi Resend hesabinda `alliancearoma.com` domainini ekler. Cloudflare DNS'te:
- MX kaydi
- TXT kaydi (SPF)
- CNAME kaydi (DKIM)

> Bu kayitlar senin demo kurulumundakilerden FARKLI olacak. Eski kayitlari silip yenilerini eklemek gerekir.

### Adim 5: Env Degerlerini Degistir

Cloudflare Pages → Settings → Environment Variables:
- Tum degerleri musterinin kendi hesap bilgileriyle degistir
- **Save** → **Redeploy** (Deployments → son deployment → Retry)

### Adim 6: Stripe Webhook Guncelle

Musterinin Stripe Dashboard'unda:
- Webhook endpoint URL'inin dogru oldugunu kontrol et
- Yeni webhook secret'i env'e gir

### Adim 7: Canli Test

- Site yukluyor mu?
- Kayit + giris calisiyor mu?
- Google/Facebook OAuth calisiyor mu?
- Odeme calisiyor mu?
- Email (siparis onay) gidiyor mu?

---

## EGER DOMAIN DEGISIRSE

Domain degisirse (ornegin `alliancearoma.com` → `alliancearoma.ae`):

1. `NEXT_PUBLIC_SITE_URL` env degerini guncelle
2. Supabase Auth → Site URL ve Redirect URL'leri guncelle
3. Google OAuth → Authorized redirect URI guncelle
4. Facebook OAuth → Valid OAuth redirect URI guncelle
5. Stripe webhook URL guncelle
6. Resend domain dogrulamasini yeni domain icin tekrarla
7. Cloudflare Pages → Custom domains → yeni domaini ekle
8. GSC'de yeni domaini dogrula
9. Eski domainden 301 redirect kur (varsa)

> **SEO notu:** Domain degisikligi siralama kaybi yapabilir. Ayni domain kalirsa HICBIR sey etkilenmez.

---

## SONUC

| Senaryo | SEO Etkisi | Site Calismasi |
|---------|-----------|----------------|
| Env degerleri degistirmek (ayni domain) | Yok | Sorunsuz |
| GSC sahipligi degistirmek | Yok | - |
| Supabase projesi degistirmek | Yok | Migration'lari tekrar calistir |
| Stripe hesabi degistirmek | Yok | Webhook'u tekrar kur |
| OAuth provider degistirmek | Yok | Supabase'de tekrar kur |
| Domain degistirmek | VAR (gecici siralama kaybi) | Tum URL'leri guncelle |

**Kural:** Domain ayni kaldigi surece, arka plan servislerini degistirmek SEO'yu KESINLIKLE etkilemez.
