# Marketing Ajansı Dashboard + Çoklu Marka: İhtiyaç ve Seçenekler

Bu dokümanda: (1) Marketing ajanslarıyla çalışırken ne tür bir dashboard gerektiği, (2) Tek isim değil çoklu marka/site kullanımında dashboard seçenekleri (hazır vs. kendi yapımın), (3) SMSPool vs. Grizzlysms: misafir satışa izin veren / vermeyen farkın olası nedenleri özetleniyor. **Kod yok;** sadece araştırma ve açıklama.

---

## 1. Marketing ajansı için dashboard ihtiyacı

Ajanslar “ne gelmiş, ne gitmiş” görmek ister; raporlama ve şeffaflık beklenir.

| İhtiyaç | Açıklama |
|--------|----------|
| **Temiz görünüm** | Karışık olmayan, okunabilir ekran: gelir, harcama, sipariş sayısı, dönüşüm oranları. |
| **Ne gelmiş** | Toplam gelir, dönem bazlı (günlük/haftalık/aylık), ödeme yöntemine göre (kripto, kart). |
| **Ne gitmiş** | SMSPool’a ödenen maliyet, komisyonlar, iptal/refund. |
| **Sipariş / kullanım** | Kaç sipariş, kaç aktif numara, hangi ülke/hizmet. |
| **Dönüşüm** | Ziyaret → kayıt/guest ödeme → tamamlanan sipariş hızı. |
| **Marka / site ayrımı** | Birden fazla marka veya site varsa, her biri için ayrı özet (çoklu marka). |

Bunlar tek bir “admin” veya “agency” dashboard’unda toplanabilir; ajans kullanıcı adıyla giriş yapıp sadece kendi markasına ait veriyi görebilir (çoklu marka kullanımında).

---

## 2. Çoklu marka / çoklu site: Ne yapabilirsin, hazır var mı?

Senaryo: Tek isim değil; birkaç marka veya site (örn. GetSMSNow, başka bir SMS markası, başka bir niş) yönetiyorsun. Hepsi için tek yerden, temiz bir dashboard istiyorsun.

### 2.1 Seçenekler (kaba)

| Yaklaşım | Açıklama | Artı / eksi |
|----------|----------|-------------|
| **Kendi dashboard’unu geliştir (multi-tenant)** | Veritabanında `tenant_id` veya `brand_id` ile her sipariş/gelir/gideri markaya bağlarsın. Tek panelde marka seçici (dropdown); tüm metrikler marka bazlı filtrelenir. | Tam kontrol, ajansın ihtiyacına göre ekran. Geliştirme ve bakım sende. |
| **Hazır analytics / BI araçları** | Metabase, Retool, Bold BI, Grafana vb. Supabase (veya kendi DB’n) bağlanırsın; marka bazlı raporlar ve dashboard’lar tanımlarsın. Çoklu marka = veride marka alanı + filtre. | Hızlı başlangıç, kod az; şablonlar ve sorguları sen tanımlarsın. |
| **White-label / multi-tenant hazır platform** | Bold BI, Qrvey gibi ürünler: çoklu tenant, marka bazlı veri izolasyonu, gömülü dashboard. Genelde kurumsal ve ücretli. | Hazır çoklu marka ve güvenlik; maliyet ve özelleştirme sınırı. |
| **Her marka için ayrı Supabase + tek “super admin”** | Her markanın kendi Supabase projesi; sen tek bir “super admin” panelde hepsine bağlanıp özet görürsün. | Veri tamamen ayrı; paneli kendin yaparsın veya BI ile birleştirirsin. |

### 2.2 Pratik öneri (araştırma özeti)

- **Küçük ölçek, 2–3 marka:** Kendi admin panelinde `brand_id` ile filtreleyen bir dashboard yeterli. Veriler zaten Supabase’de; “ne gelmiş ne gitmiş” için sipariş, ödeme, balance_transactions tablolarına marka eklenir; ajans veya sen marka seçerek rapor görürsün.
- **Orta ölçek, raporlama ağır:** **Metabase** veya **Retool** ile Supabase’e bağlanıp “Gelir / Gider / Sipariş” dashboard’u oluşturmak hızlı. Çoklu marka = tablolarda `brand_id`, her grafikte marka filtresi.
- **Kurumsal, white-label şart:** Bold BI, Qrvey gibi multi-tenant analytics platformları değerlendirilir; dokümantasyon ve fiyat için sitelerine bakılır.

**Hazır “çoklu marka SMS dashboard” turnkey ürün** araştırmada bulunmuyor; ya kendi panelin (marka alanı + filtre) ya da genel BI/analytics aracı (Metabase, Retool) ile kendi raporlarını marka bazlı kurman gerekiyor.

---

## 3. SMSPool misafir satışa izin vermezken Grizzlysms’in vermesi: Olası nedenler

SMSPool.net kayıt (hesap) açmadan satın almaya izin vermiyor; Grizzlysms (ve benzeri siteler) misafir ödemeye izin veriyor. Resmi gerekçe SMSPool tarafında açıklanmıyor; aşağıdakiler **olası** nedenler.

| Neden | Açıklama |
|-------|----------|
| **Suistimal / dolandırıcılık** | Kayıtsız ödeme: aynı kart veya IP ile sınırsız deneme, chargeback, sahte sipariş. Hesap zorunluluğu = e-posta/hesap başına sınır, ban imkânı. SMSPool daha “B2B/API” odaklı olabilir; riski azaltmak için kayıt isteyebilir. |
| **KYC / uyumluluk** | Bazı ödeme veya SMS sağlayıcıları “kim alıyor?” bilgisini ister. Hesap = en azından e-posta ve hesap kimliği. Misafir = anonim; bazı politikalar veya yargı bölgeleri için rahatsız edici. |
| **İş modeli** | SMSPool bakiye yükleme + sipariş modeli kullanıyor; doğal olarak “hesap” gerekiyor. Misafir akışı = sipariş başı ödeme, ayrı bir ürün/akış. SMSPool bu akışı sunmamayı tercih etmiş olabilir. |
| **Yasal ihtiyat** | Bazı ülkelerde “anonim” satış veya belirsiz alıcı kaydı ek kısıt veya sorumluluk getirebilir. Hesap zorunluluğu = “kime sattık” kaydı. Bu tamamen bölgeye ve hukuka bağlı; genel bir “yasal zorunluluk” iddiası yapılamaz. |
| **Teknik / operasyonel tercih** | Destek ve şikayet takibi hesap ile daha kolay; “misafir sipariş” token takibi ve e-posta ile yönetilir. SMSPool operasyonel olarak sadece “hesaplı” modeli seçmiş olabilir. |

**Özet:** SMSPool’un misafir satışa izin vermemesi büyük ihtimalle **suistimal kontrolü**, **iş modeli (bakiye + hesap)** ve **uyumluluk/kayıt tercihi** ile ilgilidir; “yasada misafir yasak” diye genel bir kural yok. Grizzlysms misafir ödemeyi kabul ediyorsa farklı risk iştahı veya ürün tercihi (sipariş başı ödeme + e-posta/checkbox onayı) ile açıklanabilir. Kesin cevap için SMSPool destek veya ToS’larına bakmak gerekir.

---

## 4. Hangi ülkelerde anonimlere / misafire satış serbest? Estonya?

- **AB / GDPR (Estonya dahil):** Avrupa Veri Koruma Kurulu (EDPB) tavsiyesine göre e-ticarette **misafir alım (guest checkout) teşvik ediliyor**; zorunlu hesap açma genelde meşru sayılmıyor (veri minimizasyonu, gizlilik). Yani **anonim sayılabilecek / kayıtsız tek seferlik alım**, AB ülkelerinde (Estonya dahil) **veri koruma açısından uyumlu ve serbest** tarafta. Estonya AB üyesi olduğu için bu çerçeve Estonya için de geçerli; **Estonya’da misafir satış (anonime yakın satış) özgür / uyumlu** tarafta.
- **Genel:** “Anonim satışa izin veren ülkeler” diye tek liste yok; çoğu ülke e-ticarette **tüketici kimliği / satıcı şeffaflığı** ister, ama **alıcı tarafında “hesap açmadan al”** birçok yargıda (özellikle AB) destekleniyor. Tam anonim (hiç kimlik yok) satış ise AML/KYC kuralları olan ülkelerde sınırlı olabilir; “misafir checkout” (e-posta veya ödeme bilgisi ile, hesap açmadan) AB’de serbesttir.
- **Özet:** Estonya’da (ve AB’de) **misafir checkout / kayıtsız tek seferlik satış özgür ve GDPR ile uyumlu** kabul edilir. Tam anonim (hiç kayıt yok) için ülke bazlı AML/KYC kurallarına bakmak gerekir; senin “misafir sipariş” akışın (e-posta opsiyonel, ödeme bilgisi ödeme sağlayıcısında) AB/Estonya bağlamında sorun teşkil etmez.

**Hangi ülkelerde (anonim / misafir satış) serbest değil veya daha kısıtlı? (Kısaca)**  
- **Hindistan:** E-ticaret için KYC / müşteri tespiti yönünde taslak kurallar var.  
- **Avustralya:** AML/CTF kapsamında “designated services” için müşteri kimlik prosedürü zorunlu; tek seferlik işlemde bile tanımlama gerekebilir.  
- **Genel:** AML/KYC’nin sıkı olduğu ülkeler (ör. ABD’de belirli ödeme türleri, bazı Asya ülkeleri) tam anonim satışı sınırlayabilir. “Misafir checkout” (kayıtsız, ödeme bilgisi ödeme sağlayıcısında) çoğu yargıda sorun olmaz; **tam kimliksiz / nakit-benzeri anonim** satış kısıtlı olan yerler: Hindistan (taslak), Avustralya (belirli hizmetler), AML’i ağır uygulayan diğer ülkeler.

---

## 4. Cookie banner’ı kapatmak (ek not)

Cookie banner’ı istemiyorsan **env ile kapatabilirsin:**

- `.env.local` veya Vercel’de: `NEXT_PUBLIC_COOKIE_BANNER_ENABLED=false`
- Değer `false` veya `0` olunca banner sitede hiç gösterilmez. Varsayılan: gösterilir (uyumluluk için).

Bu dokümanda kod yok; sadece araştırma ve açıklama yer alıyor.
