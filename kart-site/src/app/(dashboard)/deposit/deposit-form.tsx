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
import { Loader2, Copy, QrCode } from 'lucide-react';

interface DepositFormProps {
  wallets: Wallet[];
}

const CRYPTO_OPTIONS = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'USDT_TRC20', label: 'USDT (TRC20)' },
  { value: 'USDT_ERC20', label: 'USDT (ERC20)' },
  { value: 'LTC', label: 'Litecoin (LTC)' },
];

export function DepositForm({ wallets }: DepositFormProps) {
  const [walletType, setWalletType] = useState<string>('USD');
  const [crypto, setCrypto] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    address: string;
    amount: string;
    qrCode: string;
    expiresAt: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) < 10) {
      toast.error('Minimum deposit is $10');
      return;
    }

    if (!crypto) {
      toast.error('Please select a cryptocurrency');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payments/cryptomus/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          walletType,
          crypto,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setPaymentData(data);
      toast.success('Payment created! Send crypto to the address below.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (paymentData?.address) {
      navigator.clipboard.writeText(paymentData.address);
      toast.success('Address copied to clipboard');
    }
  };

  if (paymentData) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="border-border/40 bg-card/50">
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              {paymentData.qrCode ? (
                <img
                  src={paymentData.qrCode}
                  alt="Payment QR Code"
                  className="h-48 w-48 rounded-lg"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-muted">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground">Send exactly</Label>
              <p className="text-2xl font-bold">{paymentData.amount}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">To this address</Label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-muted p-3 text-sm break-all">
                  {paymentData.address}
                </code>
                <Button variant="outline" size="icon" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-amber-500/10 p-4 text-sm text-amber-500">
              <p className="font-medium">Important:</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>Send only the exact amount shown above</li>
                <li>Payment expires at {new Date(paymentData.expiresAt).toLocaleString()}</li>
                <li>Your balance will be credited after confirmation</li>
              </ul>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPaymentData(null)}
            >
              Create New Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card className="border-border/40 bg-card/50">
        <CardHeader>
          <CardTitle>Deposit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="wallet">Destination Wallet</Label>
              <Select value={walletType} onValueChange={setWalletType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD Wallet</SelectItem>
                  <SelectItem value="EUR">EUR Wallet</SelectItem>
                  <SelectItem value="USDT">USDT Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crypto">Pay with</Label>
              <Select value={crypto} onValueChange={setCrypto}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({walletType})</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100.00"
                min="10"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Minimum deposit: $10</p>
            </div>

            <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Payment Address
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
