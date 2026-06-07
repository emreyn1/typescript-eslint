import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { TransactionsList } from './transactions-list';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { type?: string; status?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const page = parseInt(searchParams.page || '1');
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: any = { userId: session.user.id };

  if (searchParams.type && searchParams.type !== 'all') {
    where.type = searchParams.type;
  }

  if (searchParams.status && searchParams.status !== 'all') {
    where.status = searchParams.status;
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        wallet: true,
        card: true,
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View your complete transaction history</p>
      </div>

      <TransactionsList
        transactions={transactions}
        currentPage={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
