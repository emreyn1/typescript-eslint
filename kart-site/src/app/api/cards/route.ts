import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateCardNumber, generateCVV, generateExpiryDate } from '@/lib/utils';
import { CARD_VARIANTS, CardVariantId } from '@/lib/card-types';
import { encrypt } from '@/lib/encryption';
import { z } from 'zod';

const cardPurchaseSchema = z.object({
  variant: z.enum(['NEXUS_3D', 'OMNI_LITE', 'OMNI_PRO']),
  walletType: z.enum(['USD', 'EUR', 'USDT']),
  cardHolder: z.string().min(2).max(50),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cards = await prisma.card.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Cards fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { variant, walletType, cardHolder } = cardPurchaseSchema.parse(body);

    const cardVariant = CARD_VARIANTS[variant as CardVariantId];
    if (!cardVariant) {
      return NextResponse.json({ error: 'Invalid card variant' }, { status: 400 });
    }

    const price = cardVariant.price;

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId_type: {
          userId: session.user.id,
          type: walletType,
        },
      },
    });

    if (!wallet || Number(wallet.balance) < price) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    const expiry = generateExpiryDate();
    const cardNumber = generateCardNumber();
    const cvv = generateCVV();

    // Encrypt sensitive data
    const encryptedCardNumber = encrypt(cardNumber);
    const encryptedCvv = encrypt(cvv);

    const result = await prisma.$transaction(async (tx) => {
      // Create card with encrypted data
      const card = await tx.card.create({
        data: {
          userId: session.user.id,
          cardNumber: encryptedCardNumber,
          expiryMonth: expiry.month,
          expiryYear: expiry.year,
          cvv: encryptedCvv,
          cardHolder: cardHolder.toUpperCase(),
          type: 'VIRTUAL',
          variant: variant,
          status: 'ACTIVE',
          dailyLimit: cardVariant.limits.daily,
          monthlyLimit: cardVariant.limits.monthly,
        },
      });

      // Debit wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: price } },
      });

      // Create transaction
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: wallet.id,
          type: 'CARD_PURCHASE',
          status: 'COMPLETED',
          amount: price,
          currency: walletType,
          description: `${cardVariant.name} card purchase`,
        },
      });

      return card;
    });

    return NextResponse.json(
      { message: 'Card created successfully', card: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Card creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}
