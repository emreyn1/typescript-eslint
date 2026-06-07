import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const exchangeSchema = z.object({
  fromWallet: z.enum(['USD', 'EUR', 'USDT']),
  toWallet: z.enum(['USD', 'EUR', 'USDT']),
  amount: z.number().positive().min(1),
});

const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, USDT: 1.0 },
  EUR: { USD: 1.09, USDT: 1.09 },
  USDT: { USD: 1.0, EUR: 0.92 },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fromWallet, toWallet, amount } = exchangeSchema.parse(body);

    if (fromWallet === toWallet) {
      return NextResponse.json(
        { error: 'Cannot exchange to the same wallet' },
        { status: 400 }
      );
    }

    const rate = EXCHANGE_RATES[fromWallet]?.[toWallet];
    if (!rate) {
      return NextResponse.json(
        { error: 'Invalid exchange pair' },
        { status: 400 }
      );
    }

    const receiveAmount = amount * rate;

    // Perform atomic exchange
    const result = await prisma.$transaction(async (tx) => {
      // Get source wallet
      const sourceWallet = await tx.wallet.findUnique({
        where: {
          userId_type: {
            userId: session.user.id,
            type: fromWallet,
          },
        },
      });

      if (!sourceWallet || Number(sourceWallet.balance) < amount) {
        throw new Error('Insufficient balance');
      }

      // Debit source wallet
      await tx.wallet.update({
        where: { id: sourceWallet.id },
        data: { balance: { decrement: amount } },
      });

      // Credit destination wallet (upsert in case it doesn't exist)
      await tx.wallet.upsert({
        where: {
          userId_type: {
            userId: session.user.id,
            type: toWallet,
          },
        },
        create: {
          userId: session.user.id,
          type: toWallet,
          balance: receiveAmount,
        },
        update: {
          balance: { increment: receiveAmount },
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: sourceWallet.id,
          type: 'EXCHANGE',
          status: 'COMPLETED',
          amount: amount,
          currency: fromWallet,
          description: `Exchange ${amount} ${fromWallet} to ${receiveAmount.toFixed(2)} ${toWallet}`,
          metadata: JSON.stringify({
            fromWallet,
            toWallet,
            rate,
            receiveAmount,
          }),
        },
      });

      return transaction;
    });

    return NextResponse.json({
      success: true,
      transaction: result,
      received: receiveAmount,
    });
  } catch (error) {
    console.error('Exchange error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Insufficient balance') {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process exchange' },
      { status: 500 }
    );
  }
}
