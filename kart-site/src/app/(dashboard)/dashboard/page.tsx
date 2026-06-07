import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCardDisplay } from '@/components/credit-card';
import { BalanceCards } from '@/components/balance-cards';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [user, wallets, cards, recentTransactions, referralStats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true, name: true, email: true },
    }),
    prisma.wallet.findMany({
      where: { userId: session.user.id },
      orderBy: { type: 'asc' },
    }),
    prisma.card.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.referral.count({
      where: { referrerId: session.user.id, status: 'COMPLETED' },
    }),
  ]);

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Active Cards',
      value: cards.filter((c) => c.status === 'ACTIVE').length.toString(),
      icon: CreditCard,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
    },
    {
      title: 'Referrals',
      value: referralStats.toString(),
      icon: Users,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || session.user.email?.split('@')[0]}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/deposit" className="gap-2">
              <ArrowDownLeft className="h-4 w-4" />
              Deposit
            </Link>
          </Button>
          <Button variant="gradient" asChild>
            <Link href="/cards" className="gap-2">
              <Plus className="h-4 w-4" />
              New Card
            </Link>
          </Button>
        </div>
      </div>

      <BalanceCards wallets={wallets} className="mb-8" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/40 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Cards</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/cards" className="gap-1">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {cards.length === 0 ? (
                <div className="py-12 text-center">
                  <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-4 text-muted-foreground">No cards yet</p>
                  <Button variant="gradient" asChild>
                    <Link href="/cards">Get Your First Card</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {cards.slice(0, 2).map((card) => (
                    <CreditCardDisplay
                      key={card.id}
                      cardNumber={card.cardNumber}
                      cardHolder={card.cardHolder}
                      expiryMonth={card.expiryMonth}
                      expiryYear={card.expiryYear}
                      cvv={card.cvv}
                      balance={Number(card.balance)}
                      type={card.type}
                      status={card.status}
                      className="mx-auto max-w-full"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/transactions" className="gap-1">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((tx) => {
                    const isIncoming =
                      tx.type === 'TOPUP' || tx.type === 'REFERRAL_BONUS' || tx.type === 'REFUND';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between border-b border-border/40 py-3 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-lg p-2 ${
                              isIncoming
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {isIncoming ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {tx.description || tx.type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`font-semibold ${
                            isIncoming ? 'text-emerald-500' : 'text-red-500'
                          }`}
                        >
                          {isIncoming ? '+' : '-'}
                          {formatCurrency(Number(tx.amount))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/40 bg-gradient-to-br from-emerald-500/10 to-teal-500/5">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-2">
                  <Users className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="font-semibold">Referral Program</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Invite friends and earn $5 for each successful referral!
              </p>
              <div className="mb-4 rounded-lg border border-border/40 bg-background/50 p-3">
                <p className="mb-1 text-xs text-muted-foreground">Your Referral Code</p>
                <p className="font-mono text-lg font-bold">{user?.referralCode}</p>
              </div>
              <Button variant="gradient" className="w-full" asChild>
                <Link href="/referral">View Details</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link href="/deposit">
                    <ArrowDownLeft className="h-4 w-4" />
                    Deposit Funds
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link href="/withdraw">
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link href="/exchange">
                    <TrendingUp className="h-4 w-4" />
                    Exchange
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
