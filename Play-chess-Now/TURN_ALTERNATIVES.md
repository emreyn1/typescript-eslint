# Ücretsiz TURN Server Alternatifleri

## 1. Cloudflare TURN (Önerilen - En Kolay)

**Avantajlar:**
- ✅ İlk 1,000 GB/ay ücretsiz
- ✅ Kolay entegrasyon
- ✅ Güvenilir ve hızlı
- ✅ API key ile çalışır

**Kurulum:**
1. Cloudflare Dashboard'a git: https://dash.cloudflare.com
2. "Workers" → "Turn" bölümüne git
3. API key al
4. Environment variable ekle: `NEXT_PUBLIC_CLOUDFLARE_TURN_KEY`

**API:**
```javascript
// Cloudflare TURN endpoint
const response = await fetch('https://api.cloudflare.com/client/v4/accounts/{account_id}/turn/credentials', {
  headers: {
    'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`
  }
});
```

---

## 2. XirSys (Ücretsiz Plan)

**Avantajlar:**
- ✅ Ücretsiz plan var
- ✅ REST API
- ✅ Kolay entegrasyon

**Kurulum:**
1. XirSys'e kayıt ol: https://xirsys.com
2. Free plan seç
3. API credentials al
4. Environment variables ekle

**API:**
```javascript
// XirSys TURN endpoint
const response = await fetch('https://global.xirsys.net/_turn/{channel}', {
  method: 'PUT',
  headers: {
    'Authorization': 'Basic ' + btoa(USERNAME + ':' + SECRET)
  }
});
```

---

## 3. Twilio STUN/TURN (Ücretsiz Trial)

**Avantajlar:**
- ✅ $20 ücretsiz kredi
- ✅ Güvenilir
- ✅ İyi dokümantasyon

**Kurulum:**
1. Twilio hesabı oluştur: https://www.twilio.com
2. $20 ücretsiz kredi al
3. TURN credentials al
4. Environment variables ekle

**Not:** Trial sonrası ücretli

---

## 4. Kendi TURN Sunucusu (Coturn)

**Avantajlar:**
- ✅ Tamamen ücretsiz
- ✅ Sınırsız kullanım
- ✅ Tam kontrol

**Dezavantajlar:**
- ❌ Sunucu gerekli
- ❌ Kurulum ve bakım
- ❌ Daha teknik

**Kurulum:**
- Ubuntu'da Coturn kurulumu: https://github.com/coturn/coturn
- VPS gerekli (DigitalOcean, AWS, vs.)

---

## Öneri

**MVP için:** Cloudflare TURN (1,000 GB/ay ücretsiz, kolay entegrasyon)
**Production için:** Kendi TURN sunucusu (Coturn) veya Cloudflare

