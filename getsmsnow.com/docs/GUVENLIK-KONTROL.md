# Güvenlik Kontrol Özeti

Son kontrol tarihi: 2025-02

## ✅ Düzeltilen Açıklar

### 1. NOWPayments Webhook – İmza Zorunluluğu (Kritik)
- **Sorun:** `x-nowpayments-sig` header boş olduğunda webhook işleniyordu.
- **Risk:** Sahte POST ile sahte ödeme kredisi.
- **Çözüm:** Signature yoksa 401 dönüyor.

### 2. SMSPool Cancel API – Yetkisiz Erişim (Kritik)
- **Sorun:** `/api/smspool/cancel` auth gerektirmiyordu; herhangi biri orderId ile SMSPool’da iptal yapabiliyordu.
- **Risk:** DB senkronizasyonu olmadan iptal; kullanıcı bakiyesi kaybı.
- **Çözüm:** Endpoint kaldırıldı. Sadece `/api/orders/cancel` kullanılıyor (auth + ownership kontrolü).

### 3. SMSPool Balance API – Açık Erişim
- **Sorun:** `/api/smspool/balance` herkese açıktı.
- **Risk:** SMSPool bakiyesi herkese görünüyordu.
- **Çözüm:** Auth zorunlu hale getirildi.

---

## ✅ Kontrol Edilen Alanlar

| Alan | Durum |
|------|-------|
| `.env` / `.env.local` | `.gitignore` içinde |
| Gizli anahtarlar | Sadece `process.env` ile server-side |
| `NEXT_PUBLIC_*` | Sadece URL, bot adı gibi güvenli değerler |
| Webhook imzaları | Cryptomus, Paddle, NOWPayments doğruluyor |
| Auth | Order, cancel, check, balance, invoice – auth zorunlu |
| Supabase | Service role key sadece server’da |
| SQL enjeksiyonu | Supabase parametreli sorgular kullanıyor |

---

## ⚠️ Öneriler

1. **Rate limiting:** `/api/smspool/*` için rate limit eklenmeli (örn. Cloudflare WAF).
2. **SMSPool balance:** Production’da sadece admin rolüne açılmalı.
3. **AUTH_SECRET:** NextAuth için mutlaka güçlü bir secret kullanın: `openssl rand -base64 32`

---

## .env Değerlerini Girerken

- `SMSPOOL_API_KEY` – SMSPool dashboard’dan 32 karakter
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase Dashboard > Settings > API
- `AUTH_SECRET` – `openssl rand -base64 32`
- Ödeme webhook secret’ları – Her sağlayıcının dashboard’ından alın
- `TELEGRAM_BOT_TOKEN` – @BotFather’dan

**Güvenli:** `.env` dosyası Git’e commit edilmemeli; `.env.example` sadece şablon olarak kullanılmalı.
