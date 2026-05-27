# Cookie Banner (Çerez Widget’ı) ve Ödeme Öncesi Onaylar – Neden Gerekli?

Bu dokümanda: (1) Ödeme öncesi antlaşma alanı neden gerekli, (2) Sitede cookie widget (çerez bildirimi) neden gerekli ve ne işe yarar, kısaca açıklanıyor.

---

## 1. Ödeme almadan hemen önce antlaşmaları kabul alanı (1. görsel)

**Evet, gerekli.** Kayıt olmadan sipariş (guest checkout) yapacaksanız, **Öde / PAY** butonuna basılmadan önce kullanıcının aşağıdakileri açıkça kabul etmesi gerekir:

- **Kullanım koşulları / Public offer** (“Hizmet sözleşmesi / kamuya açık teklif ile kabul ediyorum”)  
- **Gizlilik ve çerez politikası** (“Kişisel veriler ve çerez politikasını okudum, kabul ediyorum”)

**Neden gerekli?**

| Sebep | Açıklama |
|-------|----------|
| **Yasal uyum** | AB (GDPR), UK ve birçok ülkede, ödeme öncesi sözleşme ve gizlilik metinlerine **açık onay** (checkbox) almak gerekir. Aksi halde “onay vermeden para aldınız” iddiası olabilir. |
| **Tüketici koruma** | Uzaktan satış yönetmelikleri, mesafeli sözleşmelerde “bilgilendirme ve onay” ister. Checkbox’lar bu onayın kanıtıdır. |
| **Sizin korumanız** | “Koşulları okumadım / kabul etmedim” itirazını azaltır; “ödeme öncesi kabul ettim” kaydı kalır. |
| **Rakiplerle uyum** | Birçok SMS / ödeme sitesi (ör. grizzlysms) aynı modeli kullanır: iki checkbox işaretlenmeden ödeme yapılamaz. |

**Nasıl uygulanır?**

- Ödeme sayfasında (misafir akışında) iki checkbox:  
  - “I agree with [Terms of Service / Public offer]” (link: `/terms-of-service`)  
  - “I agree with [Privacy and cookie policy]” (link: `/privacy-policy`)  
- Her iki kutu işaretlenmeden **Öde** butonu disabled veya tıklanınca “Lütfen koşulları kabul edin” uyarısı.  
- İsteğe bağlı: **E-posta** alanı (sipariş linki veya makbuz için); zorunlu veya opsiyonel yapılabilir.

---

## 2. Cookie widget (2. görseldeki gibi) – Ne için gerekli?

**Kısa cevap:** AB (GDPR), UK ve benzeri yerlerde **çerez kullanıyorsanız** kullanıcıyı bilgilendirip, gerekiyorsa **onay almanız** beklenir. Bu yüzden sitede bir **cookie banner / widget** (çerez bildirimi) kullanmak hem yasal hem şeffaflık açısından doğrudur.

### Cookie widget ne işe yarar?

| Amaç | Açıklama |
|------|----------|
| **Bilgilendirme** | “Sitede çerez kullanıyoruz” mesajını ilk ziyarette veya sayfa altında gösterir. |
| **Onay (consent)** | Zorunlu olmayan çerezler (reklam, analitik vb.) için “Tümünü kabul et” veya “Ayarlar” ile seçim yaptırır. Zorunlu çerezler (oturum, güvenlik) için genelde ayrıca onay gerekmez ama bilgi verilir. |
| **Politika linki** | “Daha fazla bilgi: Gizlilik Politikası” linki ile çerez türleri ve süreleri Gizlilik sayfasında anlatılır. |
| **Kayıt** | Kullanıcı “Kabul et” veya “Ayarlar” seçimini (localStorage / cookie) saklar; bir daha aynı cihazda banner’ı gereksiz yere tekrar göstermemek için kullanılır. |

### GetSMSNow’da hangi çerezler var?

- **Oturum / kimlik doğrulama:** NextAuth, giriş oturumu (zorunlu).  
- **Üçüncü taraf:** Cloudflare Turnstile (CAPTCHA), Paddle (ödeme) – bunlar da çerez veya benzeri veri bırakabilir.  
- **Analitik:** Google Analytics vb. kullanılıyorsa “isteğe bağlı” sayılır; onay gerekir.

Bu nedenle en azından **“Çerez kullanıyoruz, detay için Gizlilik Politikası”** diyen bir banner + **“Kabul et”** (ve isteğe bağlı “Ayarlar”) butonu eklenmesi önerilir.

### 2. görseldeki gibi bir widget’ın öğeleri

- **Başlık:** “We use cookies to make your experience secure and convenient.”  
- **Kısa açıklama:** Verilerin üçüncü taraflarla paylaşılmadığı, site işlevi için kullanıldığı; “Tümünü kabul et” veya sitede gezinmeye devam ederek onay verebileceği.  
- **Link:** “Gizlilik Politikası’nda çerezler hakkında daha fazla bilgi.”  
- **Butonlar:** “Accept all cookies” (birincil), “Settings” (isteğe bağlı, çerez türü seçimi).  

Banner, kullanıcı “Kabul et” veya “Ayarlar” ile seçim yapana kadar sayfa altında veya modal olarak gösterilir; seçim saklanır ve tekrar gösterilmez.

---

## 3. Özet

- **Ödeme öncesi antlaşma alanı:** Evet, **gerekli**. Misafir ödemesinde “Kullanım koşulları” ve “Gizlilik/çerez politikası” için iki checkbox, ödeme butonundan önce zorunlu olmalı (1. görseldeki gibi).  
- **Cookie widget:** Evet, **önerilir / birçok bölgede gerekli**. Çerez kullandığınızı söyleyen, Gizlilik Politikası’na link veren ve “Kabul et” (ve istenirse “Ayarlar”) sunan bir banner (2. görseldeki gibi) ekleyin.  

İsterseniz bir sonraki adımda: (1) misafir ödeme sayfasına checkbox’lı antlaşma alanı, (2) site genelinde gösterilecek basit bir cookie banner bileşeni taslağı çıkarılabilir.

---

## Cookie banner’ı açmak / kapatmak (enable/disable)

| .env.local veya Vercel’de ne yazarsan | Cookie widget (banner) |
|---------------------------------------|-------------------------|
| **Hiç yazmazsan** (değişken yok) | **Açılır** (gösterilir). Varsayılan budur. |
| `NEXT_PUBLIC_COOKIE_BANNER_ENABLED=true` | **Açılır** (gösterilir). |
| `NEXT_PUBLIC_COOKIE_BANNER_ENABLED=false` | **Açılmaz** (gösterilmez). |
| `NEXT_PUBLIC_COOKIE_BANNER_ENABLED=0` | **Açılmaz** (gösterilmez). |

**Özet:** Banner’ı **kapatmak** için: `NEXT_PUBLIC_COOKIE_BANNER_ENABLED=false` ekle. **Açık** tutmak için değişkeni yazma veya `true` yaz.
