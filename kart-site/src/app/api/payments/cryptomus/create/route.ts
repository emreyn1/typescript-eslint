import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createPayment } from '@/lib/cryptomus';
import { z } from 'zod';
import crypto from 'crypto';

const createPaymentSchema = z.object({
  amount: z.number().positive().min(10),
  walletType: z.enum(['USD', 'EUR', 'USDT']),
  crypto: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, walletType, crypto: cryptoCurrency } = createPaymentSchema.parse(body);

    const orderId = `DEP_${crypto.randomUUID()}`;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Ensure wallet exists
    await prisma.wallet.upsert({
      where: {
        userId_type: {
          userId: session.user.id,
          type: walletType,
        },
      },
      create: {
        userId: session.user.id,
        type: walletType,
        balance: 0,
      },
      update: {},
    });

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId_type: {
          userId: session.user.id,
          type: walletType,
        },
      },
    });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        walletId: wallet?.id,
        type: 'TOPUP',
        status: 'PENDING',
        amount,
        currency: walletType,
        reference: orderId,
        description: `Deposit ${amount} ${walletType} via ${cryptoCurrency}`,
        metadata: JSON.stringify({
          cryptoCurrency,
          walletType,
        }),
      },
    });

    // Check if Cryptomus is configured
    if (!process.env.CRYPTOMUS_MERCHANT_ID || !process.env.CRYPTOMUS_API_KEY) {
      // Return mock data for development
      return NextResponse.json({
        address: 'TDevelopmentAddressForTestingOnly123456',
        amount: `${amount} ${cryptoCurrency}`,
        qrCode: '',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        transactionId: transaction.id,
        orderId,
      });
    }

    // Create Cryptomus payment
    const payment = await createPayment({
      amount,
      currency: cryptoCurrency,
      orderId,
      callbackUrl: `${baseUrl}/api/payments/cryptomus/webhook`,
      successUrl: `${baseUrl}/deposit?status=success`,
      failUrl: `${baseUrl}/deposit?status=failed`,
    });

    // Update transaction with payment details
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        metadata: JSON.stringify({
          cryptoCurrency,
          walletType,
          paymentUuid: payment.uuid,
          paymentAddress: payment.address,
          paymentNetwork: payment.network,
        }),
      },
    });

    return NextResponse.json({
      address: payment.address,
      amount: `${payment.payer_amount} ${payment.payer_currency}`,
      qrCode: '', // Cryptomus doesn't provide QR, generate client-side if needed
      expiresAt: new Date(payment.expired_at * 1000).toISOString(),
      paymentUrl: payment.url,
      transactionId: transaction.id,
      orderId,
    });
  } catch (error) {
    console.error('Create payment error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
