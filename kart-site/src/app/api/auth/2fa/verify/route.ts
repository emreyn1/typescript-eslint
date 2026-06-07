import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { verifyTOTP } from '@/lib/totp';
import { z } from 'zod';

const verifySchema = z.object({
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = verifySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Please start 2FA setup first' },
        { status: 400 }
      );
    }

    const isValid = verifyTOTP(user.twoFactorSecret, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    console.error('2FA verify error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
