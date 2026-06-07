import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Copy, Users, Gift, TrendingUp } from 'lucide-react';
import { ReferralCopyButton } from './referral-copy-button';

export default async function ReferralPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [user, referrals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true },
    }),
    prisma.referral.findMany({
      where: { referrerId: session.user.id },
      include: {
        referred: {
          select: { email: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const completedReferrals = referrals.filter((r) => r.status === 'COMPLETED');
  const pendingReferrals = referrals.filter((r) => r.status === 'PENDING');
  const totalEarnings = completedReferrals.reduce((sum, r) => sum + Number(r.bonus), 0);

  const referralLink = `${process.env.NEXTAUTH_URL || 'https://kartpay.com'}/register?ref=${user?.referralCode}`;

  const stats = [
    {
      title: 'Total Referrals',
      value: referrals.length.toString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Completed',
      value: completedReferrals.length.toString(),
      icon: Gift,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(totalEarnings),
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">
          Invite friends and earn $5 for each successful referral
        </p>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/40 bg-gradient-to-br from-emerald-500/10 to-teal-500/5">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/40 bg-background/50 p-4">
              <p className="mb-2 text-xs text-muted-foreground">Referral Code</p>
              <p className="font-mono text-2xl font-bold">{user?.referralCode}</p>
            </div>

            <div className="rounded-lg border border-border/40 bg-background/50 p-4">
              <p className="mb-2 text-xs text-muted-foreground">Referral Link</p>
              <p className="break-all text-sm">{referralLink}</p>
            </div>

            <ReferralCopyButton link={referralLink} code={user?.referralCode || ''} />

            <div className="rounded-lg bg-emerald-500/10 p-4 text-sm">
              <p className="font-medium text-emerald-500">How it works:</p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground">
                <li>Share your referral link with friends</li>
                <li>They sign up and make their first deposit</li>
                <li>You both receive $5 bonus!</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No referrals yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share your link to start earning!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between border-b border-border/40 py-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {referral.referred.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(referral.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          referral.status === 'COMPLETED'
                            ? 'text-emerald-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {referral.status === 'COMPLETED'
                          ? `+${formatCurrency(Number(referral.bonus))}`
                          : 'Pending'}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                          referral.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {referral.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
