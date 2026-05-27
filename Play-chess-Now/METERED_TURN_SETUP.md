# Metered TURN Setup (Opsiyonel)

## WebRTC için TURN Server

WebRTC bağlantıları için TURN server gerekli (özellikle farklı ağlardan bağlanırken). Metered TURN ücretsiz bir seçenek.

## 🔑 Metered TURN Key Nasıl Alınır?

### 1. Hesap Oluştur
1. https://www.metered.ca/stun-turn adresine git
2. **"Sign Up"** veya **"Get Started"** butonuna tıkla
3. Email ile kayıt ol (ücretsiz)
4. Email doğrulaması yap

### 2. API Key Al
1. Dashboard'a giriş yap
2. **"API Keys"** veya **"Credentials"** sekmesine git
3. **"Create API Key"** butonuna tıkla
4. Key adı ver (örn: "Chess Game")
5. API key'i kopyala (uzun bir string olacak)

### 3. Environment Variables Ekle

`.env.local` dosyasına **her iki değişkeni de** ekle:
```env
NEXT_PUBLIC_METERED_DOMAIN=your-domain.metered.live
NEXT_PUBLIC_METERED_SECRET_KEY=your-api-key-here
```

**Örnek (senin değerlerin):**
```env
NEXT_PUBLIC_METERED_DOMAIN=naber.metered.live
NEXT_PUBLIC_METERED_SECRET_KEY=OlX6F4mEY5xdUkSB2S4-eoi-XCIPSXF_yGbSG3lpDwGiuem7
```

Vercel'de de aynı şekilde **her iki değişkeni de** ekle.

## ⚠️ Önemli Notlar

- **Opsiyonel:** Metered TURN key olmadan da çalışır (STUN fallback var)
- **Aynı ağda test:** Eğer aynı WiFi'de test ediyorsan, STUN yeterli
- **Farklı ağlar:** Farklı internet bağlantılarından test ediyorsan, TURN gerekli
- **Ücretsiz limit:** Metered TURN'ün ücretsiz limiti var (genelde yeterli)

## 🔄 Alternatif: Google STUN (Zaten Aktif)

Kod zaten Google STUN server'larını kullanıyor:
- `stun:stun1.l.google.com:19302`
- `stun:stun2.l.google.com:19302`

Bu, aynı ağda veya NAT arkasında olmayan cihazlar için yeterli.

## 🧪 Test Etme

1. Metered TURN key olmadan test et
2. Eğer bağlantı kurulamazsa, key ekle
3. Browser console'da `401 Unauthorized` hatası görürsen, key yanlış demektir

