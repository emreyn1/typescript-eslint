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
import { Loader2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface WithdrawFormProps {
  wallets: Wallet[];
  twoFactorEnabled: boolean;
}

const WITHDRAW_FEE = 2; // $2 flat fee
const MIN_WITHDRAW = 20;

export function WithdrawForm({ wallets, twoFactorEnabled }: WithdrawFormProps) {
  const [walletType, setWalletType] = useState<string>('USDT');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedWallet = wallets.find((w) => w.type === walletType);
  const balance = selectedWallet ? Number(selectedWallet.balance) : 0;
  const amountNum = parseFloat(amount) || 0;
  const receiveAmount = Math.max(0, amountNum - WITHDRAW_FEE);

  const handleMaxClick = () => {
    setAmount(balance.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amountNum < MIN_WITHDRAW) {
      toast.error(`Minimum withdrawal is $${MIN_WITHDRAW}`);
      return;
    }

    if (amountNum > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!address) {
      toast.error('Please enter a wallet address');
      return;
    }

    if (twoFactorEnabled && !twoFactorCode) {
      toast.error('Please enter your 2FA code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletType,
          amount: amountNum,
          address,
          twoFactorCode: twoFactorEnabled ? twoFactorCode : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process withdrawal');
      }

      toast.success('Withdrawal request submitted successfully');
      setAmount('');
      setAddress('');
      setTwoFactorCode('');
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
          <CardTitle>Withdrawal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="wallet">From Wallet</Label>
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

            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address (TRC20)</Label>
              <Input
                id="address"
                placeholder="T..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Only send to TRC20 compatible addresses
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Amount</Label>
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
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min={MIN_WITHDRAW}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span>{formatCurrency(amountNum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span>-{formatCurrency(WITHDRAW_FEE)}</span>
              </div>
              <div className="border-t border-border/40 pt-2 flex justify-between font-medium">
                <span>You receive</span>
                <span className="text-emerald-500">{formatCurrency(receiveAmount)}</span>
              </div>
            </div>

            {twoFactorEnabled && (
              <div className="space-y-2">
                <Label htmlFor="2fa">2FA Code</Label>
                <Input
                  id="2fa"
                  placeholder="000000"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            )}

            {!twoFactorEnabled && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-4 text-sm text-amber-500">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">2FA not enabled</p>
                  <p className="text-amber-500/80">
                    Enable two-factor authentication in Settings for added security.
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={loading || amountNum < MIN_WITHDRAW || amountNum > balance}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Withdrawal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
