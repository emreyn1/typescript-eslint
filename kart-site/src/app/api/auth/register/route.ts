import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import { generateReferralCode } from '@/lib/utils';
import { rateLimit, RATE_LIMITS, getRateLimitKey } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = rateLimit(
      getRateLimitKey(ip, 'register'),
      RATE_LIMITS.register
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    let referrerId: string | null = null;
    if (validatedData.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: validatedData.referralCode },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Create user with default wallets
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          referralCode: generateReferralCode(),
          referredBy: referrerId,
        },
      });

      // Create default wallets
      await tx.wallet.createMany({
        data: [
          { userId: newUser.id, type: 'USD', balance: 0 },
          { userId: newUser.id, type: 'EUR', balance: 0 },
          { userId: newUser.id, type: 'USDT', balance: 0 },
        ],
      });

      // Create referral if applicable
      if (referrerId) {
        await tx.referral.create({
          data: {
            referrerId,
            referredId: newUser.id,
            bonus: 5,
            status: 'PENDING',
          },
        });
      }

      return newUser;
    });

    // Audit log
    await logAudit({
      userId: user.id,
      action: 'register',
      details: { email: user.email, referredBy: referrerId },
      req: request,
    });

    return NextResponse.json(
      { message: 'Account created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
