# Vercel Deployment Guide

## ✅ Proje Hazır!

Build başarılı, Vercel'e deploy edilebilir.

## 🚀 Deployment Adımları

### 1. Vercel'e Git
- https://vercel.com adresine git
- GitHub ile giriş yap (veya hesap oluştur)

### 2. Projeyi Deploy Et
- "Add New Project" butonuna tıkla
- GitHub repo'nu seç (veya manuel upload)
- Framework: **Next.js** (otomatik algılanır)
- Root Directory: `.` (kök dizin)

### 3. Environment Variables Ekle
Vercel dashboard'da "Environment Variables" bölümüne şunları ekle:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAp4vuz0CkJl7tH9RIyBEE4OWVZal7U0s8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chess-c3a28.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chess-c3a28
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chess-c3a28.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=556982192218
NEXT_PUBLIC_FIREBASE_APP_ID=1:556982192218:web:43bf70b1d7814dc6c63063
NEXT_PUBLIC_METERED_SECRET_KEY=kWWJKFEtGt_sgu9Dpy5kWFykO-ICAyXCX5st6U7uYYYUJ76T
```

**Önemli:** Her birini ayrı ayrı ekle, Production, Preview ve Development için işaretle.

### 4. Deploy!
- "Deploy" butonuna tıkla
- 2-3 dakika bekle
- ✅ Hazır!

## 📝 Notlar

- **Firebase Rules:** Firestore security rules'u kontrol et
- **Domain:** Vercel otomatik domain verir (örn: `chessrtcmvp.vercel.app`)
- **Custom Domain:** İstersen kendi domain'ini ekleyebilirsin

## 🔧 Sorun Giderme

### Build Hatası
- Environment variables'ları kontrol et
- Vercel console'da build log'larına bak

### Firebase Bağlantı Hatası
- Firebase console'da API key'in aktif olduğunu kontrol et
- Firestore rules'u public yap (test için):
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
  ```

## ✅ Deployment Sonrası

1. Site çalışıyor mu kontrol et
2. "Oda Oluştur" butonunu test et
3. Oda kodu görünüyor mu kontrol et
4. İki cihazdan test et (telefon + bilgisayar)

**Hazır! 🎉**

