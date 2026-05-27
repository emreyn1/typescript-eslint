# Google OAuth: Testing → Verified (Production)

Şu an Google OAuth "Testing" modunda. Herkesin giriş yapabilmesi için "Published" (Verified) yapman gerekiyor.

---

## 1. Google Cloud Console'a git

1. [console.cloud.google.com](https://console.cloud.google.com)
2. Projeni seç (OAuth credentials oluşturduğun proje)

---

## 2. OAuth consent screen

1. **APIs & Services** → **OAuth consent screen**
2. **User type:** External seçili olmalı
3. **Publishing status:** "Testing" → **"PUBLISH APP"** butonuna tıkla

---

## 3. Yayına geçmeden önce kontrol et

| Alan | Gerekli |
|------|---------|
| **App name** | Var |
| **User support email** | Var |
| **Developer contact** | Var |
| **Privacy policy URL** | Gerekli (örn. `https://getsmsnow.com/privacy-policy`) |
| **Terms of service URL** | Önerilir (örn. `https://getsmsnow.com/terms-of-service`) |

Eksikse tamamla.

---

## 4. Publish App

1. **PUBLISH APP** butonuna tıkla
2. **Confirm** ile onayla

---

## 5. Ne olur?

- **Sensitive scopes yoksa:** Uygulama hemen "In production" olur, herkes giriş yapabilir
- **Sensitive scopes varsa:** (örn. Google Drive, Gmail) Google doğrulaması ister; bu süreç 1–4 hafta sürebilir

Sadece email, profile, openid kullanıyorsan genelde ek doğrulama gerekmez.

---

## 6. Test kullanıcıları (Testing modunda)

Testing modundayken sadece **Test users** listesindeki hesaplar giriş yapabilir. Yeni kullanıcı eklemek için:

1. OAuth consent screen
2. **Test users** bölümü
3. **+ ADD USERS** → email adreslerini ekle

---

## Özet

1. OAuth consent screen → **PUBLISH APP**
2. Privacy policy URL ekle (yoksa)
3. Onayla → "In production" olur
4. Herkes giriş yapabilir (sensitive scope yoksa)
