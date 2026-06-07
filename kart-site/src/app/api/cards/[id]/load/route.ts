import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const loadCardSchema = z.object({
  walletType: z.enum(['USD', 'EUR', 'USDT']),
  amount: z.number().positive().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { walletType, amount } = loadCardSchema.parse(body);

    // Get card
    const card = await prisma.card.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (card.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Card is not active' },
        { status: 400 }
      );
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId_type: {
          userId: session.user.id,
          type: walletType,
        },
      },
    });

    if (!wallet || Number(wallet.balance) < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Process load
    await prisma.$transaction(async (tx) => {
      // Debit wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      // Credit card
      await tx.card.update({
        where: { id: card.id },
        data: { balance: { increment: amount } },
      });

      // Create transaction
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: wallet.id,
          cardId: card.id,
          type: 'CARD_LOAD',
          status: 'COMPLETED',
          amount,
          currency: walletType,
          description: `Load card ending in ${card.cardNumber.slice(-4)}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Card loaded successfully',
    });
  } catch (error) {
    console.error('Card load error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to load card' },
      { status: 500 }
    );
  }
}
