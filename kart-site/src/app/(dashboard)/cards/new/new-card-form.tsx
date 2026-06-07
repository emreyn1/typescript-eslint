'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Check, CreditCard } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { CARD_VARIANTS, CardVariantId } from '@/lib/card-types';

interface NewCardFormProps {
  wallets: Wallet[];
}

export function NewCardForm({ wallets }: NewCardFormProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<CardVariantId>('NEXUS_3D');
  const [walletType, setWalletType] = useState<string>('USD');
  const [cardHolder, setCardHolder] = useState('');
  const [loading, setLoading] = useState(false);

  const variant = CARD_VARIANTS[selectedVariant];
  const selectedWallet = wallets.find((w) => w.type === walletType);
  const balance = selectedWallet ? Number(selectedWallet.balance) : 0;
  const canAfford = balance >= variant.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardHolder.trim()) {
      toast.error('Please enter cardholder name');
      return;
    }

    if (!canAfford) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant: selectedVariant,
          walletType,
          cardHolder: cardHolder.toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to issue card');
      }

      toast.success('Card issued successfully!');
      router.push('/cards');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">Select Card Type</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {Object.values(CARD_VARIANTS).map((v) => (
              <Card
                key={v.id}
                className={cn(
                  'cursor-pointer border-2 transition-all hover:border-primary/50',
                  selectedVariant === v.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border/40'
                )}
                onClick={() => setSelectedVariant(v.id as CardVariantId)}
              >
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br',
                        v.gradient
                      )}
                    >
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    {selectedVariant === v.id && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold">{v.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold">${v.price}</span>
                    {v.monthlyFee > 0 && (
                      <span className="text-sm text-muted-foreground">
                        + ${v.monthlyFee}/mo
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-border/40 bg-card/50">
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardHolder">Cardholder Name</Label>
                <Input
                  id="cardHolder"
                  placeholder="JOHN DOE"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Name as it will appear on the card
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet">Pay from Wallet</Label>
                <Select value={walletType} onValueChange={setWalletType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.type}>
                        {wallet.type} - {formatCurrency(Number(wallet.balance), wallet.type === 'USDT' ? 'USD' : wallet.type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Available: {formatCurrency(balance, walletType === 'USDT' ? 'USD' : walletType)}
                </p>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={loading || !canAfford || !cardHolder.trim()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Issue Card for ${variant.price}
              </Button>

              {!canAfford && (
                <p className="text-center text-sm text-red-500">
                  Insufficient balance. Please deposit funds first.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24 border-border/40 bg-card/50">
          <CardHeader>
            <CardTitle>{variant.name} Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {variant.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border/40 pt-4">
              <h4 className="mb-2 font-medium">Limits</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily</span>
                  <span>{formatCurrency(variant.limits.daily)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly</span>
                  <span>{formatCurrency(variant.limits.monthly)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Transaction</span>
                  <span>{formatCurrency(variant.limits.perTransaction)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4">
              <h4 className="mb-2 font-medium">Pricing</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issuance Fee</span>
                  <span>${variant.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Fee</span>
                  <span>{variant.monthlyFee > 0 ? `$${variant.monthlyFee}` : 'Free'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
