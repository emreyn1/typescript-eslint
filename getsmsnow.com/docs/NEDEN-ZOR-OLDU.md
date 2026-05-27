# Neden Çok Zor Oldu?

Bu projeyi sıfırdan yaparken neden bu kadar zorlandık? Bu dokümanda **zorluğun nedenleri**ni açıklıyoruz – teknik, entegrasyon, öğrenme eğrisi ve insan faktörü.

---

## 1. Çok Fazla Parça, Hepsi Birbirine Bağlı

Tek bir "login" veya "ödeme" değil; **onlarca sistem** aynı anda çalışmak zorunda:

| Parça | Bağımlılık |
|-------|------------|
| Kayıt | Supabase + Resend + verification_codes + users tablosu |
| Giriş | NextAuth + Supabase + credentials provider + session |
| Bakiye yükleme | Cryptomus/NOWPayments/Paddle + webhook + Supabase + idempotency |
| Sipariş | SMSPool API + bakiye kontrolü + orders tablosu + balance_transactions |
| İptal | SMSPool cancel + bakiye iade + ownership kontrolü |

**Bir yerde hata = zincir kırılıyor.** Örneğin Resend hata verirse kayıt tamamlanmıyor; webhook imzası yanlışsa ödeme gelmiyor.

---

## 2. Her Servisin Kendi Kuralları Var

- **Google OAuth:** Redirect URI tam eşleşmeli, Testing/Production modu, consent screen
- **Telegram:** Bot + domain doğrulama, widget farklı ortamda farklı davranıyor
- **Resend:** Domain doğrulama, bazı Gmail adreslerine ulaşmıyor, API hata formatı
- **Cryptomus / NOWPayments / Paddle:** Her birinin webhook imza algoritması farklı
- **SMSPool:** Ülke kodları, servis ID’leri, cancel süresi belirsiz

**Ortak standart yok.** Her servisi ayrı ayrı öğrenmek, ayrı ayrı debug etmek gerekiyor.

---

## 3. Görünmeyen Hatalar

- E-posta gelmiyor ama API "success" dönüyor (Resend `error` kontrol etmiyorduk)
- Kod doğru ama "invalid" diyor (register/send-code arasında invalidation tutarsızlığı)
- Webhook geliyor ama imza uyuşmuyor (JSON key sırası, encoding)
- Localhost’ta çalışıyor, production’da çalışmıyor (env, redirect URI)

**Hata mesajları yetersiz.** Çoğu zaman "neden?" sorusunun cevabı dokümantasyonda veya deneme-yanılma ile bulunuyor.

---

## 4. Güvenlik Her Adımda Düşünülmeli

- Hangi endpoint auth istiyor?
- Webhook gerçekten o sağlayıcıdan mı geldi?
- Bakiye iki kez eklenebilir mi?
- Kod brute-force edilebilir mi?

**Bir açık = ciddi risk.** NOWPayments webhook’ta imza kontrolü yoktu → sahte ödeme kredisi. SMSPool cancel herkese açıktı → yetkisiz iptal. Bunları sonradan fark ettik ve düzelttik.

---

## 5. Sıfırdan = Hazır Çözüm Yok

Clerk, Supabase Auth gibi hazır auth kullansaydık e-posta doğrulama, kod gönderimi hazır gelirdi. Biz **kendi akışımızı** kurduk:

- verification_codes tablosu
- register → send-code → verify-email akışı
- Kod invalidation, expiry, format normalizasyonu

**Esneklik var, ama her detayı kendin yazıyorsun.** Ve her detayda hata çıkabiliyor.

---

## 6. Dokümantasyon ve Örnekler Eksik / Dağınık

- SMSPool cancel süresi net değil
- Cryptomus webhook imza örneği PHP, biz JS kullanıyoruz
- NextAuth v5 + Supabase + custom credentials – hazır örnek az
- Telegram widget + custom backend – çoğu örnek sadece client-side

**"Nasıl yapılır?" sorusunun cevabı parça parça.** Stack Overflow, GitHub, resmi docs karıştırmak gerekiyor.

---

## 7. Para ve Kullanıcı Verisi – Hata Affetmez

Bakiye yanlış eklenirse veya sipariş kaybolursa **gerçek para, gerçek kullanıcı** etkileniyor. Bu yüzden:

- Transaction kullanmalı
- Idempotency olmalı
- Webhook imzası mutlaka doğrulanmalı
- Her edge case düşünülmeli

**"Çalışıyor" yetmez; "güvenli ve tutarlı" olmalı.**

---

## 8. Özet – Zorluğun Kaynakları

| Neden | Açıklama |
|-------|----------|
| **Parça sayısı** | 10+ servis, hepsi birbirine bağlı |
| **Standart yok** | Her API farklı format, farklı kural |
| **Sessiz hatalar** | API "success" der, gerçekte olmamış olur |
| **Güvenlik** | Her endpoint, her webhook ayrı risk |
| **Sıfırdan** | Hazır auth/ödeme yerine kendi implementasyonumuz |
| **Dokümantasyon** | Eksik, dağınık, örnekler farklı dil/stack |
| **Para/veri** | Hata affetmez, ekstra dikkat gerekli |

---

*Bu zorluklar aşıldı; proje çalışır durumda. Ama bir sonraki projede Clerk/Supabase Auth gibi hazır çözümler değerlendirilebilir – özellikle auth için.*
