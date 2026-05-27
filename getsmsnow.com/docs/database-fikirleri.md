# Veritabanı Fikirleri – GetSMSNow ve Kariyer İçin

Bu dosya: SQL/PostgreSQL deneyimi olmayan biri için temel kavramlar, VPS vs. hosting, SQL vs. NoSQL ve iş başvurusu için önemli noktalar.

---

## 1. Kendi PostgreSQL + Vercel: Çalışır mı?

### Kısa cevap: **Hayır, Vercel tek başına PostgreSQL çalıştıramaz.**

| Hosting | PostgreSQL | Durum |
|---------|-------------|--------|
| **Vercel** | ❌ | Vercel sadece serverless fonksiyon ve statik dosya sunar. Veritabanı sunucusu çalıştırmaz. |
| **VPS** (DigitalOcean, Hetzner, AWS EC2 vb.) | ✅ | Kendi sunucunda PostgreSQL kurup çalıştırırsın. |

### Akış nasıl olur?

- **Frontend + API:** Vercel (Next.js)
- **Veritabanı:** Ayrı bir yerde (VPS, Supabase, Neon, Railway vb.)

```
[Vercel: Next.js]  ──HTTP──►  [PostgreSQL: başka sunucuda]
```

### Seçenekler (PostgreSQL için)

| Seçenek | Açıklama |
|---------|----------|
| **Supabase** | Hosted PostgreSQL + ek özellikler. Veritabanı senin VPS’inde değil, onların bulutunda. |
| **Neon** | Serverless PostgreSQL. Vercel ile uyumlu. |
| **Railway / Render** | Basit deploy + PostgreSQL. |
| **Kendi VPS** | DigitalOcean Droplet, Hetzner Cloud vb. Üzerinde PostgreSQL kurup kendin yönetirsin. |

---

## 2. VPS Zorunlu mu?

**Hayır.** PostgreSQL kullanmak için VPS zorunlu değil.

- **Hosted / managed:** Supabase, Neon, Railway → VPS yok, onlar sunucuyu yönetir.
- **VPS:** Kendi sunucunda PostgreSQL kurup, güvenlik, yedekleme, güncelleme senin sorumluluğunda.

Proje için seçilen **Supabase**, hosted bir PostgreSQL hizmeti; VPS gerektirmez.

---

## 3. SQL vs. NoSQL – Fark Ne?

### SQL (PostgreSQL, MySQL, SQLite)

- **Yapı:** Tablolar, satırlar, sütunlar. Veriler önceden tanımlı şemaya uyar.
- **İlişkiler:** `JOIN` ile tablolar arası bağlantı.
- **Sorgu:** SQL dili (`SELECT`, `WHERE`, `GROUP BY` vb.).
- **Örnek:** Kullanıcı, sipariş, bakiye hareketleri ayrı tablolarda; `user_id` ile ilişkilendirilir.

```
users          orders           balance_transactions
------         ------           --------------------
id             id               id
email          user_id ────────► user_id
balance        amount           amount
               status           type
```

### NoSQL (MongoDB, Firebase, Redis)

- **Yapı:** Genelde döküman (JSON benzeri) veya key-value. Şema esnek.
- **İlişkiler:** Verilerde referans tutulur; JOIN yok, uygulama tarafında birleştirirsin.
- **Sorgu:** Genelde API / SDK ile (MongoDB query, Firebase SDK vb.).
- **Örnek:** Kullanıcı dökümanı içinde `orders` dizisi tutulabilir.

```json
{
  "id": "user123",
  "email": "x@x.com",
  "balance": 50,
  "orders": [
    { "id": "o1", "amount": 5, "status": "active" }
  ]
}
```

### SQL vs. NoSQL – Kısa Karşılaştırma

| Konu | SQL | NoSQL |
|------|-----|-------|
| **Şema** | Sabit / değişmesi zor | Esnek |
| **İlişkiler** | JOIN ile net ve güçlü | Referans + uygulama mantığı |
| **Paralel işlem** | Transaction ve ACID | Genelde daha zayıf |
| **Ölçeklendirme** | Dikey + sharding (karmaşık) | Yatay (bazı DB’lerde kolay) |
| **Bu proje** | Uygun (bakiye, sipariş, işlem tutarlılığı) | Mümkün ama daha riskli |

GetSMSNow gibi bakiye, sipariş, iade akışı olan projede **SQL (PostgreSQL)** daha uygun; tutarlılık ve transaction desteği için.

---

## 4. PostgreSQL Temel Kavramları (İş Görüşmesi İçin)

### Tablo, sütun, satır

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  balance DECIMAL(12, 4) DEFAULT 0
);
```

- **Tablo:** Veri yapısının tanımı.
- **Sütun:** Alan (email, balance vb.).
- **Satır:** Kayıt (her kullanıcı bir satır).

### Temel sorgular

```sql
-- Tüm kullanıcılar
SELECT * FROM users;

-- E-posta ile filtreleme
SELECT * FROM users WHERE email = 'x@x.com';

-- Yeni kayıt
INSERT INTO users (email, balance) VALUES ('x@x.com', 0);

-- Güncelleme
UPDATE users SET balance = balance + 10 WHERE id = '...';

-- Silme
DELETE FROM users WHERE id = '...';
```

### İlişkiler (foreign key)

```sql
-- orders tablosunda user_id, users.id'ye referans verir
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(12, 4)
);
```

### Transaction (ACID)

```sql
BEGIN;
  UPDATE users SET balance = balance - 10 WHERE id = '...';
  INSERT INTO orders (user_id, amount) VALUES ('...', 10);
COMMIT;  -- İkisi de başarılı olursa kalıcı
-- ROLLBACK;  -- Hata olursa geri al
```

- **ACID:** Atomiklik, tutarlılık, izolasyon, dayanıklılık.
- Bakiye düşümü + sipariş kaydı tek transaction içinde yapılmalı.

### Index

```sql
CREATE INDEX idx_users_email ON users(email);
```

- Sık kullanılan sütunlarda sorgu hızını artırır.

---

## 5. Supabase’de Kullandığımız Yapı (Özet)

Bu projede Supabase üzerinden PostgreSQL kullanıyoruz:

- `users` – Kullanıcılar, bakiye, referral_code
- `orders` – SMS siparişleri
- `balance_transactions` – Bakiye hareketleri (topup, spend, refund)
- `referrals` – Referans ilişkileri
- `verification_codes` – E-posta doğrulama kodları
- `cryptomus_payments`, `nowpayments_payments`, `paddle_payments` – Ödeme takibi

`supabase` client ile `supabase.from("users").select(...)` gibi sorgular atıyoruz; altta SQL çalışıyor.

---

## 6. Kariyer İçin Öneriler

### SQL / PostgreSQL

- Temel CRUD.
- `JOIN` (özellikle `LEFT JOIN`, `INNER JOIN`).
- `GROUP BY`, `COUNT`, `SUM`, `AVG`.
- Transaction, `BEGIN` / `COMMIT` / `ROLLBACK`.
- Index ne zaman ve neden kullanılır?

### Pratik

- Projede `supabase/migrations/001_initial.sql` ve `002_nowpayments_paddle_payments.sql` dosyalarını incele.
- SQL Editor’de (Supabase veya pgAdmin) bu sorguları çalıştırıp sonuçları incele.
- `src/lib/supabase.ts` ve `src/app/api/*` içindeki sorgu örneklerini takip et.

### Görüşmede anlatılacaklar

- “PostgreSQL kullandım; tablolar, ilişkiler, index kurdum.”
- “Bakiye ve sipariş için transaction kullanmam gerektiğini biliyorum.”
- “Supabase ile hosted PostgreSQL kullandım; VPS’e gerek kalmadı.”

---

## 7. Özet Tablo

| Soru | Cevap |
|------|-------|
| Vercel PostgreSQL çalıştırır mı? | Hayır. |
| VPS şart mı? | Hayır; Supabase gibi hosted PostgreSQL yeterli. |
| SQL vs. NoSQL? | Bu proje için SQL; tutarlılık ve transaction desteği için. |
| PostgreSQL deneyimi için? | Migration dosyalarını ve API sorgularını incele; SQL Editor ile deney yap. |

---



## 8. MongoDB Nedir?

### Genel

- **NoSQL** döküman veritabanı.
- Veriler **JSON benzeri** (BSON) dökümanlarda tutulur.
- **Collection** ≈ tablo, **document** ≈ satır, ama yapı esnek.

### PostgreSQL ile Karşılaştırma

| Konu | PostgreSQL | MongoDB |
|------|------------|---------|
| **Veri modeli** | Tablo / satır / sütun | Collection / document |
| **Şema** | Sabit (migration ile değişir) | Esnek (her döküman farklı alan içerebilir) |
| **Sorgu** | SQL | MongoDB Query Language (MQL) / API |
| **İlişkiler** | JOIN, foreign key | Embedded docs veya referans + `$lookup` |
| **Transaction** | Güçlü (ACID) | Var (4.0+), ama NoSQL’de daha az vurgulanır |
| **Ölçeklendirme** | Dikey, sharding zor | Yatay (replica set, sharding) daha kolay |

### MongoDB Temel Sorgular

```javascript
// Collection'a insert
db.users.insertOne({ email: "x@x.com", balance: 0 });

// Tümünü listele
db.users.find();

// Filtreleme
db.users.find({ email: "x@x.com" });

// Güncelleme
db.users.updateOne(
  { email: "x@x.com" },
  { $inc: { balance: 10 } }
);

// Silme
db.users.deleteOne({ email: "x@x.com" });
```

### Ne Zaman MongoDB?

- Hızlı prototip, şema sık değişiyor.
- İç içe / hirarşik veri (ör. blog yazısı + yorumlar).
- Çok büyük okuma yükü, yatay ölçeklendirme önemli.
- Transaction ve çok katı tutarlılık gerektirmeyen senaryolar.

### Ne Zaman PostgreSQL?

- Para, bakiye, sipariş gibi kritik veri.
- Karmaşık JOIN, raporlama.
- ACID ve transaction vazgeçilmez.

---

## 9. Deneyim Kazanmak İçin Proje Önerileri

Her iki veritabanında da pratik yapmak için kısa proje fikirleri:

---

### PostgreSQL Projeleri

| Proje | Zorluk | Öğreneceklerin |
|-------|--------|----------------|
| **1. Kişisel Bütçe Takibi** | Kolay | `users`, `categories`, `transactions`, JOIN, SUM, GROUP BY |
| **2. Basit E-ticaret** | Orta | `users`, `products`, `orders`, `order_items`, foreign key, transaction |
| **3. TODO + Proje Yönetimi** | Kolay | `users`, `projects`, `tasks`, ilişkiler, filtreleme |
| **4. Blog / CMS** | Orta | `users`, `posts`, `comments`, `tags`, many-to-many |
| **5. GetSMSNow’u derinleştir** | Orta | Mevcut tabloları incele, transaction ekle, raporlama sorguları yaz |

**Önerilen başlangıç: Kişisel Bütçe Takibi**
- Supabase / Neon ile ücretsiz PostgreSQL.
- Gelir–gider kaydı, kategori bazlı toplamlar.
- `GROUP BY`, `SUM`, `WHERE` pratiği.

---

### MongoDB Projeleri

| Proje | Zorluk | Öğreneceklerin |
|-------|--------|----------------|
| **1. Not Uygulaması** | Kolay | Collection, CRUD, embedded documents (not + etiketler) |
| **2. Basit Sosyal Feed** | Orta | `users`, `posts`, `comments`, `$lookup` veya embedded |
| **3. Ürün Katalogu** | Kolay | Esnek şema, farklı alanlar (t-shirt vs. laptop) |
| **4. Log / Event Depolama** | Orta | Yüksek yazma, TTL index, zaman bazlı sorgular |
| **5. Chat / Mesajlaşma** | Orta | `conversations`, `messages`, embedded veya referans |

**Önerilen başlangıç: Not Uygulaması**
- MongoDB Atlas (ücretsiz tier).
- Notlar + etiketler (embedded veya ayrı collection).
- `find`, `updateOne`, `$push`, `$pull` pratiği.

---

### Hibrit Yaklaşım (İkisini de Kullan)

| Proje | PostgreSQL | MongoDB |
|-------|------------|---------|
| **E-ticaret + Öneri Sistemi** | Sipariş, bakiye, kullanıcı | Ürün görüntüleme, tıklama, event log |
| **Blog + Analytics** | Yazılar, kullanıcılar, yorumlar | Sayfa görüntüleme, davranış event’leri |

---

### Önerilen Sıra

1. **PostgreSQL:** Kişisel Bütçe Takibi (1–2 gün) → CRUD, JOIN, GROUP BY.
2. **MongoDB:** Not Uygulaması (1–2 gün) → CRUD, embedded docs.
3. **İkisini birlikte:** Basit bir full-stack proje (ör. blog + analytics).

---

## 10. Hızlı Başlangıç Kaynakları

| Veritabanı | Hosted Ücretsiz | Öğrenme |
|------------|-----------------|---------|
| **PostgreSQL** | Supabase, Neon | [PostgreSQL Tutorial](https://www.postgresqltutorial.com/) |
| **MongoDB** | MongoDB Atlas | [MongoDB University](https://learn.mongodb.com/) (ücretsiz) |

---

*İlgili: [SENIN-YAPACAKLARIN.md](SENIN-YAPACAKLARIN.md), [BULUNANLAR.md](BULUNANLAR.md)*
