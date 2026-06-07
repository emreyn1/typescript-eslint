import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateTOTPSecret, generateTOTPUri } from '@/lib/totp';
import QRCode from 'qrcode';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, twoFactorEnabled: true },
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

    const secret = generateTOTPSecret();
    const uri = generateTOTPUri(secret, user.email);

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret },
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(uri);

    return NextResponse.json({
      secret,
      qrCode,
      uri,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
