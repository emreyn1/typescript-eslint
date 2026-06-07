import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DepositForm } from './deposit-form';

export default async function DepositPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const wallets = await prisma.wallet.findMany({
    where: { userId: session.user.id },
    orderBy: { type: 'asc' },
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Deposit Funds</h1>
        <p className="text-muted-foreground">Add funds to your wallet using cryptocurrency</p>
      </div>

      <DepositForm wallets={wallets} />
    </div>
  );
}
