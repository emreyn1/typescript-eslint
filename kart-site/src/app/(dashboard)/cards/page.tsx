import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCardDisplay } from '@/components/credit-card';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const CARD_VARIANTS = {
  NEXUS_3D: { name: 'Nexus 3D', price: 15, color: 'emerald' },
  OMNI_LITE: { name: 'OMNI Lite', price: 25, color: 'blue' },
  OMNI_PRO: { name: 'OMNI Pro', price: 50, color: 'purple' },
};

export default async function CardsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const cards = await prisma.card.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Cards</h1>
          <p className="text-muted-foreground">Manage your virtual and physical cards</p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/cards/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Issue New Card
          </Link>
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted/50 p-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No cards yet</h3>
            <p className="mb-6 text-center text-muted-foreground">
              Issue your first virtual card to start making payments
            </p>
            <Button variant="gradient" asChild>
              <Link href="/cards/new">Issue Your First Card</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.id} className="border-border/40 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{CARD_VARIANTS[card.variant as keyof typeof CARD_VARIANTS]?.name || card.variant}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      card.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : card.status === 'FROZEN'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {card.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CreditCardDisplay
                  cardNumber={card.cardNumber}
                  cardHolder={card.cardHolder}
                  expiryMonth={card.expiryMonth}
                  expiryYear={card.expiryYear}
                  cvv={card.cvv}
                  balance={Number(card.balance)}
                  type={card.type}
                  status={card.status}
                  className="mb-4"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/cards/${card.id}`}>Details</Link>
                  </Button>
                  <Button variant="gradient" size="sm" className="flex-1" asChild>
                    <Link href={`/cards/${card.id}/load`}>Load Funds</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
