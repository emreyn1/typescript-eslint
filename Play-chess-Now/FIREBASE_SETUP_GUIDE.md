# Firebase Kurulum Rehberi - Adım Adım

## 🔥 1. Firebase Console'da Proje Oluşturma/Kontrol

### Yeni Proje Oluşturma:
1. https://console.firebase.google.com adresine git
2. **"Add project"** veya **"Create a project"** butonuna tıkla
3. Proje adını gir (örn: `chess-game` veya `chessrtcmvp`)
4. Google Analytics'i aç/kapat (isteğe bağlı)
5. **"Create project"** butonuna tıkla
6. Birkaç saniye bekle, proje hazır olunca **"Continue"** tıkla

### Mevcut Projeyi Kullanma:
- Eğer zaten bir projen varsa, sol üstten projeyi seç

---

## 📱 2. Web App Ekleme

1. Firebase Console'da projenin ana sayfasında
2. **</> (Web)** ikonuna tıkla (veya **"Add app"** → **"Web"**)
3. App nickname gir (örn: `Chess Game Web`)
4. **"Register app"** butonuna tıkla
5. **ÖNEMLİ:** Config bilgilerini kopyala (aşağıdaki gibi görünecek):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Bu bilgileri bir yere kaydet (bir sonraki adımda kullanacağız)

---

## 🗄️ 3. Firestore Database Oluşturma

1. Sol menüden **"Firestore Database"** seç
2. **"Create database"** butonuna tıkla
3. **"Start in test mode"** seç (MVP için yeterli)
4. Location seç (en yakın bölgeyi seç, örn: `europe-west1`)
5. **"Enable"** butonuna tıkla

### Security Rules Ayarla:
1. **"Rules"** sekmesine git
2. Aşağıdaki kuralları yapıştır:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read, write: if true;
    }
  }
}
```

3. **"Publish"** butonuna tıkla

---

## 🔑 4. Metered TURN Key (Opsiyonel - WebRTC için)

Eğer Metered TURN kullanmak istiyorsan:
1. https://www.metered.ca/stun-turn adresine git
2. Ücretsiz hesap oluştur
3. Dashboard'dan API key'i al
4. Veya Google STUN kullan (zaten kodda var, fallback olarak çalışıyor)

---

## 📝 5. .env.local Dosyasını Güncelle

Proje klasöründe `.env.local` dosyasını aç ve Firebase config bilgilerini gir:

```env
# Firebase Configuration (2. adımdan aldığın bilgiler)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (apiKey değeri)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com (authDomain değeri)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id (projectId değeri)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com (storageBucket değeri)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789 (messagingSenderId değeri)
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123 (appId değeri)

# Metered TURN (Opsiyonel - boş bırakabilirsin, STUN kullanılır)
NEXT_PUBLIC_METERED_SECRET_KEY=
```

**Örnek:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chess-game-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chess-game-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chess-game-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321
NEXT_PUBLIC_FIREBASE_APP_ID=1:987654321:web:xyz789
NEXT_PUBLIC_METERED_SECRET_KEY=
```

---

## 🚀 6. Vercel'de Environment Variables Güncelle

1. https://vercel.com adresine git
2. Projeni seç
3. **Settings** → **Environment Variables** sekmesine git
4. **Her bir değişkeni** aşağıdaki gibi ekle:

   - **Name:** `NEXT_PUBLIC_FIREBASE_API_KEY`
   - **Value:** (Firebase'den aldığın `apiKey` değeri)
   - **Environment:** Production, Preview, Development (hepsini işaretle)
   - **Add** butonuna tıkla

5. Aynı şekilde diğer değişkenleri de ekle:
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_METERED_SECRET_KEY` (opsiyonel)

6. **ÖNEMLİ:** Tüm değişkenleri ekledikten sonra:
   - **Deployments** sekmesine git
   - En son deployment'ın yanındaki **üç nokta (⋯)** → **"Redeploy"** seç
   - **"Redeploy"** butonuna tıkla

---

## ✅ 7. Test Etme

1. Local'de test:
   ```bash
   npm run dev
   ```
   - http://localhost:3000 adresine git
   - "Oda Oluştur" butonuna tıkla
   - Oda kodu görünüyor mu kontrol et

2. Vercel'de test:
   - Vercel URL'ine git (örn: `https://your-project.vercel.app`)
   - Aynı testleri yap
   - Browser console'u aç (F12) ve hata var mı kontrol et

---

## 🐛 Sorun Giderme

### "projects%2Fundefined" hatası:
- Environment variable'ların doğru ayarlandığından emin ol
- `.env.local` dosyasında `NEXT_PUBLIC_` prefix'i var mı kontrol et
- Vercel'de redeploy yaptın mı?

### Firestore erişim hatası:
- Security Rules'ın yayınlandığından emin ol
- Browser console'da hata mesajlarını kontrol et

### WebRTC bağlantı hatası:
- Metered TURN key boş bırakılabilir (STUN fallback çalışır)
- Aynı ağda test ediyorsan STUN yeterli olur

---

## 📋 Kontrol Listesi

- [ ] Firebase projesi oluşturuldu
- [ ] Web app eklendi ve config bilgileri alındı
- [ ] Firestore database oluşturuldu
- [ ] Security Rules ayarlandı ve publish edildi
- [ ] `.env.local` dosyası güncellendi
- [ ] Vercel'de environment variables eklendi
- [ ] Vercel'de redeploy yapıldı
- [ ] Local'de test edildi
- [ ] Vercel'de test edildi

**Hazır! 🎉**

