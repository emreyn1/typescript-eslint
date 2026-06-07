'use client';

import { useState } from 'react';
import { Wallet } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowDownUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ExchangeFormProps {
  wallets: Wallet[];
}

const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, USDT: 1.0 },
  EUR: { USD: 1.09, USDT: 1.09 },
  USDT: { USD: 1.0, EUR: 0.92 },
};

export function ExchangeForm({ wallets }: ExchangeFormProps) {
  const [fromWallet, setFromWallet] = useState<string>('USD');
  const [toWallet, setToWallet] = useState<string>('EUR');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const fromWalletData = wallets.find((w) => w.type === fromWallet);
  const fromBalance = fromWalletData ? Number(fromWalletData.balance) : 0;
  const amountNum = parseFloat(amount) || 0;
  const rate = EXCHANGE_RATES[fromWallet]?.[toWallet] || 1;
  const receiveAmount = amountNum * rate;

  const handleSwap = () => {
    const temp = fromWallet;
    setFromWallet(toWallet);
    setToWallet(temp);
    setAmount('');
  };

  const handleMaxClick = () => {
    setAmount(fromBalance.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum > fromBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (fromWallet === toWallet) {
      toast.error('Please select different wallets');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWallet,
          toWallet,
          amount: amountNum,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process exchange');
      }

      toast.success(`Successfully exchanged ${formatCurrency(amountNum)} to ${formatCurrency(receiveAmount, toWallet === 'USDT' ? 'USD' : toWallet)}`);
      setAmount('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card className="border-border/40 bg-card/50">
        <CardHeader>
          <CardTitle>Exchange Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>From</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-emerald-500"
                  onClick={handleMaxClick}
                >
                  MAX
                </Button>
              </div>
              <Select value={fromWallet} onValueChange={setFromWallet}>
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
              <Input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Available: {formatCurrency(fromBalance, fromWallet === 'USDT' ? 'USD' : fromWallet)}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleSwap}
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toWallet} onValueChange={setToWallet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets
                    .filter((w) => w.type !== fromWallet)
                    .map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.type}>
                        {wallet.type} - {formatCurrency(Number(wallet.balance), wallet.type === 'USDT' ? 'USD' : wallet.type)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-2xl font-bold">
                  {formatCurrency(receiveAmount, toWallet === 'USDT' ? 'USD' : toWallet)}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span>
                  1 {fromWallet} = {rate.toFixed(4)} {toWallet}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={loading || amountNum <= 0 || amountNum > fromBalance || fromWallet === toWallet}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Exchange Now
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
