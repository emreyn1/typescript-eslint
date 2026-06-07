import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let wallets = await prisma.wallet.findMany({
      where: { userId: session.user.id },
      orderBy: { type: 'asc' },
    });

    // Create default wallets if they don't exist
    if (wallets.length === 0) {
      const walletTypes = ['USD', 'EUR', 'USDT'] as const;
      
      await prisma.wallet.createMany({
        data: walletTypes.map((type) => ({
          userId: session.user.id,
          type,
          balance: 0,
        })),
      });

      wallets = await prisma.wallet.findMany({
        where: { userId: session.user.id },
        orderBy: { type: 'asc' },
      });
    }

    return NextResponse.json(wallets);
  } catch (error) {
    console.error('Wallets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallets' },
      { status: 500 }
    );
  }
}
