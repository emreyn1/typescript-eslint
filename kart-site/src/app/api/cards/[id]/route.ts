import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const card = await prisma.card.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Decrypt sensitive data for owner
    let decryptedCardNumber = card.cardNumber;
    let decryptedCvv = card.cvv;

    try {
      decryptedCardNumber = decrypt(card.cardNumber);
      decryptedCvv = decrypt(card.cvv);
    } catch {
      // If decryption fails, data might be unencrypted (legacy)
    }

    return NextResponse.json({
      ...card,
      cardNumber: decryptedCardNumber,
      cvv: decryptedCvv,
    });
  } catch (error) {
    console.error('Card fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const card = await prisma.card.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    let newStatus = card.status;

    switch (action) {
      case 'freeze':
        if (card.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Card is not active' },
            { status: 400 }
          );
        }
        newStatus = 'FROZEN';
        break;
      case 'unfreeze':
        if (card.status !== 'FROZEN') {
          return NextResponse.json(
            { error: 'Card is not frozen' },
            { status: 400 }
          );
        }
        newStatus = 'ACTIVE';
        break;
      case 'cancel':
        if (card.status === 'CANCELLED') {
          return NextResponse.json(
            { error: 'Card is already cancelled' },
            { status: 400 }
          );
        }
        newStatus = 'CANCELLED';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedCard = await prisma.card.update({
      where: { id: params.id },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      card: updatedCard,
    });
  } catch (error) {
    console.error('Card update error:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}
