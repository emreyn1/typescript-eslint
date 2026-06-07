import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true },
    });

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      include: {
        referred: {
          select: { email: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter((r) => r.status === 'COMPLETED').length,
      pendingReferrals: referrals.filter((r) => r.status === 'PENDING').length,
      totalEarnings: referrals
        .filter((r) => r.status === 'COMPLETED')
        .reduce((sum, r) => sum + Number(r.bonus), 0),
    };

    return NextResponse.json({
      referralCode: user?.referralCode,
      referrals,
      stats,
    });
  } catch (error) {
    console.error('Referral fetch error:', error);
    return NextResponse.json(
      { error: 'Referans bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
