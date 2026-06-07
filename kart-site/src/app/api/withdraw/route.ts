import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { verifyTOTP } from '@/lib/totp';
import { rateLimit, RATE_LIMITS, getRateLimitKey } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

const withdrawSchema = z.object({
  walletType: z.enum(['USD', 'EUR', 'USDT']),
  amount: z.number().positive().min(20),
  address: z.string().min(30).max(50),
  twoFactorCode: z.string().length(6).optional(),
});

const WITHDRAW_FEE = 2;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = rateLimit(
      getRateLimitKey(session.user.id, 'withdraw'),
      RATE_LIMITS.withdraw
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many withdrawal requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { walletType, amount, address, twoFactorCode } = withdrawSchema.parse(body);

    // Get user with 2FA status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true, twoFactorSecret: true },
    });

    // Verify 2FA if enabled
    if (user?.twoFactorEnabled) {
      if (!twoFactorCode) {
        return NextResponse.json(
          { error: '2FA code required' },
          { status: 400 }
        );
      }

      if (!user.twoFactorSecret || !verifyTOTP(user.twoFactorSecret, twoFactorCode)) {
        await logAudit({
          userId: session.user.id,
          action: '2fa_verify_failed',
          details: { action: 'withdraw' },
          req: request,
        });
        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 400 }
        );
      }
    }

    // Validate TRC20 address format (basic validation)
    if (!address.startsWith('T') || address.length !== 34) {
      return NextResponse.json(
        { error: 'Invalid TRC20 address format' },
        { status: 400 }
      );
    }

    const netAmount = amount - WITHDRAW_FEE;

    if (netAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount too low after fees' },
        { status: 400 }
      );
    }

    // Process withdrawal
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: {
          userId_type: {
            userId: session.user.id,
            type: walletType,
          },
        },
      });

      if (!wallet || Number(wallet.balance) < amount) {
        throw new Error('Insufficient balance');
      }

      // Debit wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      // Create withdrawal transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: wallet.id,
          type: 'WITHDRAWAL',
          status: 'PENDING',
          amount: amount,
          fee: WITHDRAW_FEE,
          currency: walletType,
          description: `Withdrawal to ${address.slice(0, 8)}...${address.slice(-4)}`,
          metadata: JSON.stringify({
            address,
            netAmount,
            fee: WITHDRAW_FEE,
          }),
        },
      });

      return transaction;
    });

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: 'withdraw_request',
      details: {
        amount,
        walletType,
        address: `${address.slice(0, 8)}...${address.slice(-4)}`,
        transactionId: result.id,
      },
      req: request,
    });

    return NextResponse.json({
      success: true,
      transaction: result,
      message: 'Withdrawal request submitted. Processing may take up to 24 hours.',
    });
  } catch (error) {
    console.error('Withdraw error:', error);

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
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
