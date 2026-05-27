# UI Kararlarını Sabitlemek: Hedef Kitleyi Anlamak ve “Doğru”yu Bulmak

Sorun: Siteyi yapıyorsun, 2 dakika sonra UI’yı beğenmiyorsun, değiştiriyorsun. Her siteye aynı kurallar uygulanamaz; karşıdaki müşterinin ihtiyacına ve “beyin yapısına” göre tasarım olmalı — ama bunu nereden anlayacaksın, hangisi en doğru olacak?

Bu dokümanda: (1) Hedef kitleyi netleştirerek “kimin beynine” hitap ettiğini anlama, (2) O kitleye göre UI kararlarını bilinçli verme, (3) Sürekli değiştirmeyi azaltacak bir süreç özetleniyor.

---

## 1. “Doğru” tek değil — bağlam ve kitle belirler

- **Tek bir “en doğru” UI yok.** Doğru olan, **hedeflediğin kullanıcı + iş hedefi + bağlam**a göre değişir.
- Aynı ürün bile farklı kitlelere (ör. SMS servisi: geliştirici vs. sıradan kullanıcı) farklı arayüz ister.
- Bu yüzden önce **“Bu site kim için?”** sorusunu net cevaplamak gerekir; UI kararları bundan sonra gelir.

---

## 1.1 Tek sitede 3 UI olamaz — herkes farklıyken ne yapmak doğru? (Kaba dışarıdan bakış)

- **Gerçek:** Tek bir sitede üç ayrı arayüz (hiperaktif / normal / yavaş için üç farklı tema veya layout) sunamazsın. Hem teknik hem tutarlılık hem bakım açısından **bir site = bir ana UI** olur.
- **Gerçek:** Herkesin hissi, kafası, kişiliği farklı. Hiperaktif / normal / yavaş sadece örnekti; aslında onlarca farklı tip var. Hepsi için ayrı ekran yapılamaz.

**O zaman ne yapmak doğru?**

1. **Bir “birincil kitle” seç.** Sitede tek bir UI olacaksa, o UI’yı **en çok kime** göre tasarlayacağını netleştir: trafikte veya gelirde en büyük paya sahip segment, ya da en çok önemsediğin kullanım (örn. “hemen numara alan”). Bu “ortalama” veya “çoğunluk” kullanıcı değil; **bilinçle seçtiğin birincil hedef**.
2. **UI’yı ona göre kur.** Renk, layout, widget yeri, metin miktarı hep bu birincil kitleye (ve onun dikkat stiline) göre. Diğer tipleri “aynı sitede ikinci bir UI” ile tatmin etmeye çalışma.
3. **Diğerlerini dışlama; “kullanılabilir” bırak.** Birincil kitleye göre tasarladığın ekran, diğer tipler için ideal olmayabilir ama **tamamen kullanılamaz** olmasın: gereksiz karmaşa ekleme (yavaş olan da tamamlasın), gereksiz yavaşlatma da ekleme (hızlı olan da tamamlasın). Yani **birincil için optimize et, diğerleri için en azından tamir etme**.
4. **“Herkesi memnun et” hedefini bırak.** Herkesin kafası farklı; tek ekranda herkesi memnun etmek mümkün değil. Doğru olan: **bir segmenti net seçip onu memnun etmek**. Geri kalanı “kullanabilsin yeter” seviyesinde tutmak.

**Özet (kaba kural):** Tek site = tek UI. Herkes farklı → **birincil kitleyi seç, UI’yı ona göre yap; diğerleri için ayrı UI açma, sadece deneyimi kırma.**

---

## 2. Hedef kitleyi anlamak (nereden anlayacaksın?)

Aşağıdakileri **yazıya dök** (bir sayfa yeterli). Tahmin de olabilir; önemli olan netleştirmek.

| Soru | Örnek cevap (GetSMSNow) | Senin projede |
|------|-------------------------|----------------|
| **Kim kullanacak?** (yaş, rol, teknik seviye) | 18–35, geliştirici veya “hesap doğrulama yapan” sıradan kullanıcı | |
| **Neden geliyor?** (tek cümle) | “Hızlıca sanal numara alıp SMS kodu almak” | |
| **Ne kadar sık?** | Tek seferlik veya ayda 1–2 kez | |
| **Nerede / nasıl kullanıyor?** (mobil, masaüstü, acele mi?) | Çoğunlukla masaüstü, bazen acele | |
| **Rakipleri nereden biliyor?** | Google, forum, “receive sms” araması | |
| **En büyük korkusu / şüphesi?** | “Numara çalışmaz”, “güvenilir mi?” | |
| **En büyük beklentisi?** | “Hızlı, tek tıkla numara, kodu hemen göreyim” | |

Bunları doldurdukça “beyin yapısı” dediğin şey aslında: **niyet, korku, beklenti ve bağlam**. UI’yı buna göre seçersin.

---

## 3. Kitle → UI kararları (hangi kitle ne ister?)

Kaba örnekler (senin kitle tanımına göre ayarlayacaksın):

| Kitle tipi | Ne ön planda? | UI çıkarımı (kısa) |
|------------|----------------|---------------------|
| **Acele, tek seferlik** | Hız, az adım, net fiyat | Büyük CTA, az metin, form kısa, renkler net |
| **Güven odaklı** | “Bu site güvenilir mi?” | Logo, ödeme güveni, referanslar, sade ve “ciddi” görünüm |
| **Teknik / API kullanan** | Kontrol, bilgi, API doc | Dashboard, tablolar, ayarlar, daha “araç” hissi |
| **Fiyat duyarlı** | “En ucuza” | Fiyat önde, karşılaştırma, indirim / paket vurgusu |
| **İlk kez / kararsız** | “Ne yapacağım?” | Kısa açıklama, adım adım, “Nasıl çalışır?” bölümü |

GetSMSNow için örnek: “Hızlıca numara + SMS” diyorsan → **hız ve az adım** öncelik; süslü animasyon veya uzun metinler ikinci planda kalır. “Güvenilir mi?” diyorsa → footer’da ödeme logoları, şartlar linki, sade layout mantıklı.

---

## 4. Bilişsel / dikkat stili: Hiperaktif, normal, yavaş — UI ne olmalı?

Kullanıcıların **dikkat ve işlem hızı** farklı; aynı ekran birine “sıkıcı” birine “dağınık” gelir. Kitle çoğunlukla hangi stildeyse, renk, layout ve widget yerleşimi ona göre seçilir.

### 4.1 Üç kaba tip (bilişsel stil)

| Tip | Özellik (kısa) | Renk / ton tercihi | Layout / widget tercihi | Ne kullanılmalı? |
|-----|----------------|---------------------|-------------------------|-------------------|
| **Hiperaktif / hızlı** | Çok uyaran ister, hızlı tara, uzun metin kaçar, “hemen sonuç” | Canlı renkler (mavi, turuncu vurgu), net kontrast, hareket/animasyon tolere eder | Ana aksiyon ortada, az sidebar; tek sütun veya merkez odaklı; widget’lar dikkat dağıtmasın veya sağda | Büyük CTA, kısa metin, tek odak, hızlı yükleme |
| **Normal / dengeli** | Ne çok sade ne çok kalabalık; bilgi ve aksiyon dengesi | Orta tonlar, mavi/yeşil güven veren; vurgu rengi belirgin ama abartısız | **Solda veya yanda sabit widget** (örn. sepet, özet, adımlar) sık kullanılır; F-pattern okuma | Sol sidebar veya sol blokta “özet / adımlar”; orta yoğunluk |
| **Yavaş / deliberate (slow)** | Adım adım ilerler, okur, karar vermek için süre ister | Sakin renkler (gri, pastel, soft mavi); az parıltı | Sol veya solda widget ile “rehber” hissi; çok bilgi tek ekranda olmasın, bölümlere ayrılsın | Adım göstergesi, “Nasıl çalışır?”, sol panelde ilerleme / özet |

**Örnekler:**  
- Hiperaktif kitleye: **Mavi** veya canlı ana renk, ortada tek büyük “Get number” butonu, sidebar yok veya minimal.  
- Normal / yavaş kitleye: **Solda widget** (seçilen ülke/hizmet özeti, fiyat, adımlar), sakin arka plan, metin biraz daha fazla.

### 4.2 Renk ve layout özeti (stile göre)

| Stil | Renk | Widget / sidebar |
|------|------|-------------------|
| Hiperaktif | Mavi / canlı vurgu, yüksek kontrast | Az veya yok; varsa sağda veya altında, ana aksiyon ortada |
| Normal | Mavi/yeşil güven tonu, orta kontrast | **Solda widget** (özet, adımlar, sepet) sık tercih edilir |
| Yavaş (slow) | Sakin, pastel veya soft; az vurgu | Solda rehber/özet widget; sayfa bölümlü, adım adım |

---

## 5. Platformu kullanan kitle çoğunlukla hangi tip? Nasıl anlarsın?

“Bu platformu en çok hiperaktif mi kullanıyor, normal mi, yavaş mı?” sorusu **doğrudan sorulmaz**; dolaylı verilerle tahmin edilir veya kısa anketle desteklenir.

### 5.1 Dolaylı göstergeler (veri / davranış)

| Veri / davranış | Ne anlama gelebilir? |
|-----------------|----------------------|
| **Sayfada kalma süresi çok kısa, hemen tıklayıp çıkıyor** | Daha hızlı / “skimmer” kitle; hiperaktif tarafa yakın |
| **Sayfada uzun kalıyor, scroll ediyor, çok okuyor** | Daha yavaş / bilinçli; normal veya slow |
| **Mobil ağırlık yüksek, session kısa** | Hızlı işlem beklenir; hız odaklı UI mantıklı |
| **Masaüstü, uzun session** | Dashboard, sol widget, daha fazla bilgi kaldırır |
| **Giriş sayfasından doğrudan “Get number”a tıklama oranı yüksek** | Net CTA, az metin, ortada buton (hiperaktif tercih) |
| **Fiyat / karşılaştırma sayfalarına çok giriyor** | Karar verene kadar okuyor; normal/slow, sol özet widget faydalı |

**Nereden bakılır?** Google Analytics (veya benzeri): ortalama session süresi, sayfa başına süre, cihaz, event’ler (tıklama, scroll). Hotjar/Clarity gibi heatmap/session replay ile “nerede takılıyor, nereye tıklıyor” izlenir.

### 5.2 Kullanım bağlamından tahmin (SMS / sanal numara siteleri)

| Bağlam | Olası ağırlık | UI çıkarımı |
|--------|----------------|-------------|
| “Hızlıca kod alayım” (tek seferlik doğrulama) | **Hiperaktif / hızlı** ağırlıklı | Mavi/canlı vurgu, ortada CTA, az widget, tek ekranda form |
| “Birkaç servisi karşılaştırıp seçeyim” | Normal / yavaş karışık | Solda özet widget, fiyat net, adım göstergesi |
| API / geliştirici kullanımı | Kontrol ve bilgi; “normal”e yakın | Dashboard, sol menü veya sol panel, tablo/veri |
| Ödeme / kayıt öncesi çok sayfa geziyor | Yavaş / güven odaklı | Sade renk, “Nasıl çalışır?”, sol blokta güven metni |

GetSMSNow gibi “receive SMS” sitelerinde çoğu kullanıcı **“hemen numara alayım”** niyetiyle gelir → davranış **hiperaktif / hızlı** tarafa daha yakın olabilir; bu durumda **mavi/canlı renk, ortada CTA, solda ağır widget yerine sade özet** mantıklı. Eğer “karşılaştırma / güven” ağırlığı artarsa **sol widget + sakin renk** eklenebilir.

### 5.3 Hangi araçlar / yöntemler kullanılır?

| Amaç | Ne kullanılır? |
|------|-----------------|
| **Çoğunluk hangi stilde?** | Analytics (session süresi, sayfa/session, cihaz) + davranış varsayımı (yukarıdaki tablolar). İsteğe bağlı: 1–2 soruluk anket (“Bu siteyi en çok ne için kullanıyorsun?” / “Nasıl karar verirsin?”). |
| **Renk / layout gerçekten işe yarıyor mu?** | A/B test: örn. “mavi CTA vs. sade gri”, “sol widget var vs. yok”. (Google Optimize, Vercel Edge, veya manuel iki varyant.) |
| **Nerede takılıyor, nereye tıklıyor?** | Hotjar, Microsoft Clarity, FullStory gibi heatmap + session replay. Ücretsiz koteler yeterli başlangıç için. |
| **“Beyin tipi” anketi (isteğe bağlı)** | “Sayfayı nasıl kullanırsın?”: (A) Hemen numara seçip devam ederim, (B) Önce fiyatları/ülkeleri karşılaştırırım, (C) Adım adım rehberi okurum. A→hızlı, B→normal, C→yavaş. |

**Pratik sıra:** Önce **kullanım bağlamı + analytics** ile bir varsayım kur (örn. “%60 hızlı kullanıcı”). UI’yı o varsayıma göre yap (mavi, ortada CTA, az sol widget). Sonra **heatmap veya kısa anket** ile kontrol et; gerekirse tek büyük değişiklik (örn. sol widget ekle) ve A/B test.

---

## 5.4 Müşteri yokken A/B test yok — kar topu etkisi ve “en iyi” UI’ya nasıl ulaşılır?

### Sorun

- **A/B test** yapmak için iki varyantı yeterli sayıda kullanıcıya göstermen gerekir. Müşteri yokken veya çok azken A/B anlamlı sonuç vermez; bu yüzden **ilk aşamada A/B’ye güvenemezsin**.
- **Kar topu etkisi:** İlk kullanıcılar deneyimi **çok beğenirse** arkadaş/getiri ile 100 kişi getirebilir; **az beğenirse** belki 1 kişi. Aradaki fark **en az 25 kat** bile olabilir. Yani **en doğru UI’yı ilk andan itibaren vermek** büyümeyi 1 aya sıkıştırabilir; **biraz daha kötü** bir UI aynı büyümeyi 6 ay veya 2 yıla yayar. İlk izlenim ve ilk kullanıcı deneyimi bu yüzden kritik.

### Müşteri yokken “en iyi” UI nasıl yapılır?

A/B ile kanıtlayamayacağın için **tek, bilinçli bahse** dayanırsın: birincil kitle + niş kuralları + rakip/benchmark + ilk kullanıcılardan derin geri bildirim.

| Adım | Ne yapılır? |
|------|-------------|
| **1. Birincil kitleyi tek cümlede sabitle** | “Bu site [kim] için; [tek ana niyet].” Örn: “Hızlıca SMS kodu almak isteyen, tek seferlik veya seyrek kullanan kişi.” |
| **2. Nişte 2–3 lideri incele** | Aynı veya yakın nişte büyüyen (receive-sms, 5sim vb.) sitelerin ana sayfasını aç: renk, CTA yeri, sol/sağ widget, metin miktarı. “Neden bu çalışıyor olabilir?” diye not al; kopyala değil, **tarif çıkar**. |
| **3. Baskın stili seç (veri yokken tahmin)** | Kullanım bağlamına göre: “hemen numara” → hızlı stile göre (mavi/canlı, ortada CTA, az widget). “Karşılaştırıp seçeyim” → normal/yavaş (solda özet, sakin renk). Bu dokümandaki tablolara göre **tek** stil seç. |
| **4. Tek UI tarifini uygula** | Seçtiğin stile göre renk, layout, buton metni, adım sayısı hep **tutarlı** olsun. Birincil kitle + stil dışına “şunu da ekleyelim” deme; tek tarif. |
| **5. Launch; ilk 5–20 kullanıcıda derin soru** | A/B değil: **nitel görüşme**. “Nerede neredeyse vazgeçiyordun?” / “İlk baktığında ne anladın?” / “Bir arkadaşına nasıl anlatırsın?” Bu 5–10 konuşma, sayfalarca A/B’den daha değerli; **neden** belli olur. |
| **6. Bir tur büyük iterasyon** | Geri bildirime göre **en çok tekrarlanan** acıyı çöz: bir ekranı sadeleştir, bir CTA’yı netleştir, bir adımı kaldır. Sonra tekrar yayına al; ikinci dalga kullanıcılarda aynı soruları sor. A/B yok; **tek versiyon, derin öğrenme, bir büyük düzeltme**. |
| **7. Trafik arttıkça A/B anlamlı olur** | Yüzlerce/ binlerce ziyaretçi gelince “mavi CTA vs. turuncu” gibi A/B testleri yapılabilir. O zamana kadar stratejin: **birincil kitle + tek stil + benchmark + ilk kullanıcılardan nitel geri bildirim**. |

### Özet (müşteri yokken en iyi UI/UX)

- **Kar topu:** İlk kullanıcılar çok beğenirse büyüme hızlanır (örn. 1 ay); az beğenirse yavaşlar (6 ay–2 yıl). Fark 25x+ olabilir; ilk UI kararı bu yüzden çok önemli.
- **A/B müşteri yokken yapılamaz.** Bu yüzden “en iyi” UI = **tek, bilinçli bahis**: birincil kitle + nişte liderleri inceleyip tarif çıkarma + bu dokümandaki stile göre tek layout/renk + **ilk 5–20 kullanıcıda “nerede neredeyse vazgeçiyordun?”** sorusu + bir tur büyük iterasyon.
- **En iyi UI/UX’e yaklaşmak** = Veri yokken tahmini minimize etmek: net birincil kitle, net stil, rakip benchmark, ilk kullanıcılarla derin konuşma. A/B sonra devreye girer.

---

## 6. Sürekli değiştirmeyi azaltmak (süreç)

- **Kilidi koy:** “Hedef kitle + bilişsel stil varsayımı + 3–5 UI önceliği” bir dokümanda sabitlensin. Her UI değişikliği öncesi sor: “Bu, hedef kitle ve stile (hiperaktif / normal / yavaş) uyumlu mu?” Değilse yapma; uyumluysa yap.
- **“Beğenmedim” yerine “neden?”:** “UI’yı beğenmedim” deyince tek cümle ekle: “Çünkü [X kitle] [Y ihtiyacı] karşılanmıyor” veya “Çünkü [Z] kafa karıştırıyor.” Bu, ya kitle/stil tanımını güncellemeyi ya da gerçek bir UX problemi çözmeyi sağlar; rastgele değişimi azaltır.
- **Tek bir “doğru” aramayı bırak:** Doğru = “hedef kitleye + baskın dikkat stiline en uygun seçenek”. Kitle + stil filtren; filtreyi netleştir, sonra 1–2 yönde ilerle.
- **Küçük test:** Mümkünse 5–10 kişiye “Bu sayfada ne yapardın? Nerede takıldın?” diye sor. İsteğe bağlı: “Hemen devam mı edersin, yoksa önce karşılaştırır mısın?” ile hızlı / normal / yavaş dağılımı kestir.

---

## 7. Pratik checklist (her yeni site veya büyük UI kararı öncesi)

1. [ ] **Hedef kitleyi 3–5 cümleyle yaz** (kim, neden geliyor, ne bekliyor, neyden çekiniyor).
2. [ ] **Baskın bilişsel stili tahmin et:** Hiperaktif / normal / yavaş (analytics, bağlam veya 1–2 soruluk anket ile).
3. [ ] **Stile göre renk + layout kararı ver:** Hiperaktif → mavi/canlı, ortada CTA, az sol widget. Normal/yavaş → sakin renk, **solda widget** (özet, adımlar), bölümlü içerik.
4. [ ] **Bu kitle için 3 UI önceliği seç** (örn: hız, güven, sade görünüm).
5. [ ] **Değişiklik yaparken sor:** “Bu, kitle + stile uyumlu mu?” Uyumlu değilse ya kitle/stil tanımını güncelle ya da değişikliği yapma.
6. [ ] **“Beğenmedim” dediğinde:** Nedeni kitle veya stil cümlesine çevir; “çünkü [X] kullanıcısı [Y]’yi anlamıyor” veya “çünkü hızlı kitleye sol widget ağır geliyor” gibi.

---

## 8. Özet

- **Doğru UI** = hedef kitle + **baskın dikkat stili** (hiperaktif / normal / yavaş) + iş hedefine en uygun olan.
- **Hiperaktif** → mavi/canlı renk, ortada aksiyon, az veya sağda widget; **normal / yavaş** → sakin renk, **solda widget**, adım adım veya özet paneli.
- **Platformu kullanan kitle çoğunlukla hangi tip?** = Analytics (süre, tıklama, cihaz) + kullanım bağlamı (örn. “hemen numara” → hızlı) + isteğe bağlı kısa anket veya heatmap ile tahmin edilir.
- **Ne kullanılır?** = Google Analytics (veya benzeri), Hotjar / Clarity (heatmap, replay), A/B test (renk veya sol widget var/yok), 1–2 soruluk stil anketi.
- **Tek sitede 3 UI yok; herkes farklı** = Birincil kitleyi seç, tek UI’yı ona göre kur; diğerlerini ayrı arayüzle tatmin etme, sadece deneyimi kırma. “Herkesi memnun et” yerine “bir segmenti net memnun et.”
- **Kar topu + müşteri yokken A/B yok** = İlk kullanıcılar çok beğenirse büyüme hızlanır (1 ay), az beğenirse yavaşlar (6 ay–2 yıl); fark 25x+ olabilir. Müşteri yokken A/B anlamlı değil; “en iyi” UI = birincil kitle + niş benchmark + tek stil tarifi + **ilk 5–20 kullanıcıda “nerede neredeyse vazgeçiyordun?”** nitel geri bildirimi + bir tur büyük iterasyon. A/B trafik arttıktan sonra.

İstersen bir sonraki adımda GetSMSNow için somut bir “Hedef kitle + baskın stil + 3 UI önceliği + renk/widget kuralı” paragrafı yazıp, buna göre “bu sayfada ne yapılır / yapılmaz” kurallarını çıkarabiliriz.
