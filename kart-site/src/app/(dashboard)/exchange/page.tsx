import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ExchangeForm } from './exchange-form';

export default async function ExchangePage() {
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
        <h1 className="text-2xl font-bold">Exchange</h1>
        <p className="text-muted-foreground">Convert between your wallets instantly</p>
      </div>

      <ExchangeForm wallets={wallets} />
    </div>
  );
}
