# Brainstorm: Şartlar / Gizlilik Onayı – Kim, Nerede, Ne Zaman? (Sadece araştırma, kod yok)

Bu dokümanda: Kayıtlı kullanıcı zaten şartlar ve gizlilik kabul ettiği için, **ödeme öncesi antlaşma alanını sadece kayıtsız (misafir) siparişlerde** göstermenin neden mantıklı olduğu özetleniyor. Kodlama yok; sadece mantık ve kapsam.

---

## 1. Mevcut durum (kayıt)

- **Kayıt sayfasında** (`/registration`) kullanıcıdan **tek checkbox** isteniyor:  
  **“I agree to the Terms of Service and Privacy Policy”** (her ikisi de linkli).  
- Bu işaretlenmeden kayıt tamamlanmıyor (zod `acceptTerms: true` zorunlu).  
- Yani **kayıtlı her kullanıcı**, hesap açarken şartlar ve gizlilik politikasını kabul etmiş sayılıyor.

**Sonuç:** Kayıtlı kullanıcı için “ilk onay” zaten **kayıt anında** alınmış durumda.

---

## 2. Kim nerede onay veriyor / vermeli?

| Kullanıcı tipi | Şartlar / Gizlilik onayı nerede? | Ödeme öncesi tekrar checkbox gerekir mi? |
|----------------|----------------------------------|------------------------------------------|
| **Kayıtlı** | Kayıt sırasında (tek checkbox: ToS + Privacy). | **Hayır.** Zaten kayıtta kabul etti; bakiye ile sipariş veya top-up’ta aynı sözleşmeye tekrar onay aldırmak yasal açıdan gerekmez ve UX’i gereksiz ağırlaştırır. |
| **Misafir (kayıtsız)** | Kayıt yok → hiçbir yerde onay vermedi. | **Evet.** İlk ve tek “sözleşme + ödeme” anı, misafir ödeme sayfası. Burada iki checkbox (şartlar + gizlilik/çerez) zorunlu olmalı; aksi halde ödeme alındığı halde “kabul etmedim” iddiası olur. |

Özet: **Ödeme öncesi antlaşma alanı sadece misafir (kayıtsız) sipariş akışında** eklenmeli. Kayıtlı kullanıcı için ekstra checkbox gerekmez.

---

## 3. Neden “sadece misafir” mantıklı?

- **Yasal:** Kayıtlı kullanıcı sözleşmeyi kayıtta kabul etti; aynı hizmet için her ödemede tekrar onay toplamak zorunlu değil. Misafir için ise önceden onay yok, bu yüzden ödeme öncesi onay **zorunlu**.  
- **UX:** Kayıtlı kullanıcıya her top-up veya siparişte aynı checkbox’ları göstermek tekrarlayıcı ve sinir bozucu; misafir için tek seferlik, makul.  
- **Tutarlılık:** Rakipler de benzer: “ödeme sayfasında checkbox” genelde **kayıt olmadan ödeme** alan sitelerde; kayıtlı kullanıcıya ayrıca gösterilmez.

---

## 4. Cookie banner (çerez widget’ı) – Kapsam

- Cookie banner **ziyaretçi / kullanıcı ayrımı yapmadan** tüm sitede gösterilir (ilk ziyarette veya consent kaydı yoksa).  
- Hem **misafir** hem **kayıtlı** kullanıcı siteye girdiğinde çerez kullanımından haberdar edilip “Kabul et” / “Ayarlar” ile onay alınır.  
- Yani: **Ödeme öncesi checkbox’lar = sadece misafir.** **Cookie banner = herkes**, ama sadece çerez bilgilendirme/onayı için; ödeme akışına özel değil.

---

## 5. İleride düşünülebilecek istisna (şimdilik yok)

- **Şartlar / gizlilik metni önemli şekilde değişirse:** Bazı siteler “güncel şartları kabul et”i bir sonraki girişte veya ilk ödeme öncesi gösterir. Bu, MVP’de zorunlu değil; ileride “versiyonlu onay” veya “yeniden onay” istersen eklenebilir.  
- Şu anki brainstorm: **Kayıtlı = kayıtta onay yeterli; misafir = ödeme öncesi onay zorunlu.**

---

## 6. Özet tablo (neyi nerede uygulayacağız)

| Özellik | Kim için? | Nerede? |
|---------|-----------|---------|
| **Şartlar + Gizlilik/çerez checkbox’ları (ödeme öncesi)** | Sadece **misafir** (kayıtsız sipariş) | Misafir ödeme sayfası (guest checkout); “Öde” butonundan hemen önce. |
| **Cookie banner (çerez bildirimi)** | **Tüm ziyaretçiler** (misafir + kayıtlı) | Site geneli; ilk ziyaret veya consent yoksa (örn. sayfa altı veya modal). |
| **Kayıt sırasında ToS + Privacy** | **Kayıtlı** (zaten var) | `/registration` – değişiklik yok. |

---

Bu doküman sadece **araştırma / brainstorm** aşamasıdır; kodlama kararları buna göre sonraki adımda alınacak.
