# KartSite - Sanal Kart Platformu

Modern, güvenli ve kullanıcı dostu sanal kart yönetim platformu.

## Özellikler

- **Sanal & Fiziksel Kartlar**: Anında sanal kart oluşturma, fiziksel kart siparişi
- **Kripto Ödeme**: Bitcoin, Ethereum, USDT ve diğer kripto paralarla bakiye yükleme
- **Referans Programı**: Arkadaşlarınızı davet edin, her biri için $5 kazanın
- **Güvenli Altyapı**: NextAuth.js ile güvenli kimlik doğrulama
- **Modern UI**: Tailwind CSS ve Radix UI ile responsive tasarım

## Teknolojiler

- **Framework**: Next.js 14 (App Router)
- **Dil**: TypeScript
- **Veritabanı**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Form Validation**: Zod + React Hook Form
- **Ödeme**: NowPayments (Kripto)

## Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL
- pnpm/npm/yarn

### Adımlar

1. **Bağımlılıkları yükleyin**:
```bash
cd kart-site
npm install
```

2. **Ortam değişkenlerini ayarlayın**:
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kartsite"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
NOWPAYMENTS_API_KEY="your-api-key"
NOWPAYMENTS_IPN_SECRET="your-ipn-secret"
```

3. **Veritabanını oluşturun**:
```bash
npm run db:push
```

4. **Geliştirme sunucusunu başlatın**:
```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Proje Yapısı

```
kart-site/
├── prisma/
│   └── schema.prisma      # Veritabanı şeması
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard sayfası
│   │   ├── login/         # Giriş sayfası
│   │   ├── register/      # Kayıt sayfası
│   │   ├── cards/         # Kart yönetimi
│   │   ├── buy-card/      # Kart satın alma
│   │   ├── topup/         # Bakiye yükleme
│   │   └── referral/      # Referans programı
│   ├── components/        # React bileşenleri
│   │   ├── ui/            # UI primitives
│   │   └── layout/        # Layout bileşenleri
│   ├── lib/               # Utility fonksiyonlar
│   └── types/             # TypeScript tipleri
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Cards
- `GET /api/cards` - Kullanıcının kartlarını listele
- `POST /api/cards` - Yeni kart oluştur
- `POST /api/cards/load` - Karta bakiye yükle

### Payments
- `POST /api/payments/topup` - Bakiye yükleme işlemi başlat
- `POST /api/payments/webhook` - NowPayments webhook

### Referral
- `GET /api/referral` - Referans bilgilerini getir

### User
- `GET /api/user/balance` - Kullanıcı bakiyesini getir

## Güvenlik

- CSRF koruması (NextAuth.js)
- Rate limiting (önerilir: production'da ekleyin)
- Input validation (Zod)
- SQL injection koruması (Prisma)
- XSS koruması (React)
- Secure headers (middleware)

## Deployment

### Vercel

```bash
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Lisans

MIT
