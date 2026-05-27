# Firebase Setup for Vercel Deployment

## 1. Firestore Security Rules

Firebase Console'da (https://console.firebase.google.com) projenize gidin:

1. **Firestore Database** → **Rules** sekmesine gidin
2. Aşağıdaki kuralları yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Games collection - allow read/write for all (MVP için)
    // Production'da authentication ekleyin
    match /games/{gameId} {
      allow read, write: if true;
    }
  }
}
```

3. **Publish** butonuna tıklayın

**Not:** MVP için tüm kullanıcılara açık. Production'da Firebase Authentication ekleyip kuralları güvenli hale getirin.

## 2. Vercel Environment Variables Kontrolü

Vercel Dashboard'da (https://vercel.com) projenize gidin:

1. **Settings** → **Environment Variables** sekmesine gidin
2. Aşağıdaki değişkenlerin **Production**, **Preview**, ve **Development** için ayarlandığından emin olun:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAp4vuz0CkJl7tH9RIyBEE4OWVZal7U0s8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chess-c3a28.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chess-c3a28
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chess-c3a28.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=556982192218
NEXT_PUBLIC_FIREBASE_APP_ID=1:556982192218:web:43bf70b1d7814dc6c63063
NEXT_PUBLIC_METERED_SECRET_KEY=kWWJKFEtGt_sgu9Dpy5kWFykO-ICAyXCX5st6U7uYYYUJ76T
```

3. Her değişken için **Save** butonuna tıklayın
4. **Redeploy** yapın (Settings → Deployments → En son deployment'ın yanındaki üç nokta → Redeploy)

## 3. Firebase Console'da Domain Ekleme (Opsiyonel)

Eğer Firebase Authentication kullanacaksanız:

1. **Authentication** → **Settings** → **Authorized domains**
2. Vercel domain'inizi ekleyin (örn: `play-chess-now.vercel.app`)

## 4. Test Etme

1. Vercel URL'inize gidin
2. "Oda Oluştur" butonuna tıklayın
3. Oda kodunu kontrol edin (görünüyor mu?)
4. İkinci bir tarayıcı/cihazda aynı kodu girip "Odaya Katıl" yapın
5. Bağlantı durumunu kontrol edin
6. Hamle yapıp senkronizasyonu test edin

## Sorun Giderme

### "projects%2Fundefined" hatası
- Vercel'de environment variables'ların doğru ayarlandığından emin olun
- Redeploy yapın

### Firestore erişim hatası
- Security Rules'ın yayınlandığından emin olun
- Browser console'da hata mesajlarını kontrol edin

### WebRTC bağlantı hatası
- Metered TURN key'in doğru olduğundan emin olun (401 hatası alıyorsanız key yanlış)
- STUN fallback çalışıyor, bu yeterli olabilir (aynı ağda test ediyorsanız)

