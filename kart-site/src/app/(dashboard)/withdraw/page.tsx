import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { WithdrawForm } from './withdraw-form';

export default async function WithdrawPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [wallets, user] = await Promise.all([
    prisma.wallet.findMany({
      where: { userId: session.user.id },
      orderBy: { type: 'asc' },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true },
    }),
  ]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Withdraw Funds</h1>
        <p className="text-muted-foreground">Withdraw your funds to an external wallet</p>
      </div>

      <WithdrawForm wallets={wallets} twoFactorEnabled={user?.twoFactorEnabled || false} />
    </div>
  );
}
