# SMSPool Cancel Süresi (İptal Penceresi)

## Araştırma Özeti

SMSPool API dokümantasyonunda **cancel (iptal) için kesin bir süre belirtilmemiştir**.

### Bulunan Bilgiler

1. **API Dokümantasyonu (Postman)**
   - `sms/cancel` endpoint'i sadece `orderid` alıyor
   - Response: `{"success":1}` veya `{"success":0}`
   - Süre/timeout ile ilgili hiçbir parametre veya açıklama yok

2. **SMSPool FAQ**
   - "We automatically refund all your orders that can be refunded; hence, it will only show delete when you remove it from your dashboard."
   - Yani refund edilebilir siparişlerde otomatik iade var; refund edilemeyen siparişlerde sadece "delete" gösterilir

3. **Numara Ömrü (FAQ)**
   - "Temporary numbers are only active for a limited time **anywhere from 20 minutes up to 5 days** depending on the number pool."
   - Numara havuzuna göre 20 dakika ile 5 gün arası aktif

4. **Benzer Servis (5SIM)**
   - 5SIM kurallarında: "5-30 dakika arasında (servise göre) SMS gelmezse iptal ve iade"

### Önerilen Yaklaşım

- **Güvenli varsayım:** Numara en az 20 dakika aktif olduğu için, cancel penceresi genelde **20 dakika** veya daha kısa olabilir
- **En net bilgi için:** SMSPool desteğe sormak gerekir:
  - Email: support@smspool.net
  - Ticket: https://www.smspool.net/ticket/create

### Uygulama İçin

- **`expires_in`** – SMSPool `purchase/sms` response’unda saniye cinsinden süre döner (örn. 599 saniye ≈ 10 dk)
- Bu değer cancel penceresini göstermek için kullanılabilir
- `expires_in` yoksa sabit **20 dakika** veya **15 dakika** countdown kullanılabilir (konversatif)
- Cancel API çağrısı başarısız olursa (`success: 0`), kullanıcıya "Bu sipariş artık iptal edilemez" mesajı gösterilebilir
