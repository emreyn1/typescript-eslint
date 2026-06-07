import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWebhook, getPaymentStatus } from '@/lib/cryptomus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sign = request.headers.get('sign') || '';

    // Verify webhook signature (skip in development if not configured)
    if (process.env.CRYPTOMUS_API_KEY) {
      if (!verifyWebhook(body, sign)) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const { order_id, status, amount } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // Find transaction by reference
    const transaction = await prisma.transaction.findUnique({
      where: { reference: order_id },
      include: { wallet: true },
    });

    if (!transaction) {
      console.error('Transaction not found:', order_id);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Skip if already processed
    if (transaction.status === 'COMPLETED' || transaction.status === 'FAILED') {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    const newStatus = getPaymentStatus(status);

    // Update transaction status
    await prisma.$transaction(async (tx) => {
      const existingMetadata = transaction.metadata ? JSON.parse(transaction.metadata as string) : {};
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          metadata: JSON.stringify({
            ...existingMetadata,
            webhookStatus: status,
            webhookAmount: amount,
            processedAt: new Date().toISOString(),
          }),
        },
      });

      // Credit wallet if payment completed
      if (newStatus === 'COMPLETED' && transaction.walletId) {
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: {
            balance: { increment: transaction.amount },
          },
        });

        // Check and complete referral bonus if this is user's first deposit
        const user = await tx.user.findUnique({
          where: { id: transaction.userId },
          select: { referredBy: true },
        });

        if (user?.referredBy) {
          const existingDeposits = await tx.transaction.count({
            where: {
              userId: transaction.userId,
              type: 'TOPUP',
              status: 'COMPLETED',
              id: { not: transaction.id },
            },
          });

          // First deposit - complete referral
          if (existingDeposits === 0) {
            const referral = await tx.referral.findFirst({
              where: {
                referredId: transaction.userId,
                status: 'PENDING',
              },
            });

            if (referral) {
              // Complete referral
              await tx.referral.update({
                where: { id: referral.id },
                data: {
                  status: 'COMPLETED',
                  claimedAt: new Date(),
                },
              });

              // Credit referrer's USD wallet
              const referrerWallet = await tx.wallet.upsert({
                where: {
                  userId_type: {
                    userId: referral.referrerId,
                    type: 'USD',
                  },
                },
                create: {
                  userId: referral.referrerId,
                  type: 'USD',
                  balance: referral.bonus,
                },
                update: {
                  balance: { increment: referral.bonus },
                },
              });

              // Create referral bonus transaction
              await tx.transaction.create({
                data: {
                  userId: referral.referrerId,
                  walletId: referrerWallet.id,
                  type: 'REFERRAL_BONUS',
                  status: 'COMPLETED',
                  amount: referral.bonus,
                  currency: 'USD',
                  description: 'Referral bonus',
                },
              });
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
