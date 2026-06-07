'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  RefreshCw,
} from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: any;
  fee: any;
  currency: string;
  description: string | null;
  createdAt: Date;
  wallet: { type: string } | null;
  card: { cardNumber: string } | null;
}

interface TransactionsListProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  total: number;
}

const TYPE_LABELS: Record<string, string> = {
  TOPUP: 'Deposit',
  CARD_PURCHASE: 'Card Purchase',
  CARD_LOAD: 'Card Load',
  WITHDRAWAL: 'Withdrawal',
  REFERRAL_BONUS: 'Referral Bonus',
  REFUND: 'Refund',
  EXCHANGE: 'Exchange',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-500',
  COMPLETED: 'bg-emerald-500/10 text-emerald-500',
  FAILED: 'bg-red-500/10 text-red-500',
  CANCELLED: 'bg-gray-500/10 text-gray-500',
};

export function TransactionsList({
  transactions,
  currentPage,
  totalPages,
  total,
}: TransactionsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    router.push(`/transactions?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/transactions?${params.toString()}`);
  };

  const getIcon = (type: string) => {
    const isIncoming = type === 'TOPUP' || type === 'REFERRAL_BONUS' || type === 'REFUND';
    if (type === 'EXCHANGE') return RefreshCw;
    if (type === 'CARD_PURCHASE' || type === 'CARD_LOAD') return CreditCard;
    return isIncoming ? ArrowDownLeft : ArrowUpRight;
  };

  const isIncoming = (type: string) => {
    return type === 'TOPUP' || type === 'REFERRAL_BONUS' || type === 'REFUND';
  };

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Transaction History</CardTitle>
          <div className="flex gap-2">
            <Select
              value={searchParams.get('type') || 'all'}
              onValueChange={(v) => updateFilter('type', v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="TOPUP">Deposit</SelectItem>
                <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                <SelectItem value="CARD_PURCHASE">Card Purchase</SelectItem>
                <SelectItem value="CARD_LOAD">Card Load</SelectItem>
                <SelectItem value="EXCHANGE">Exchange</SelectItem>
                <SelectItem value="REFERRAL_BONUS">Referral</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={searchParams.get('status') || 'all'}
              onValueChange={(v) => updateFilter('status', v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {transactions.map((tx) => {
                const Icon = getIcon(tx.type);
                const incoming = isIncoming(tx.type);

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b border-border/40 py-4 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-lg p-2.5 ${
                          incoming
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.description || TYPE_LABELS[tx.type] || tx.type}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {new Date(tx.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {tx.wallet && (
                            <>
                              <span>•</span>
                              <span>{tx.wallet.type}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          incoming ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {incoming ? '+' : '-'}
                        {formatCurrency(Number(tx.amount))}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                          STATUS_COLORS[tx.status]
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * 10 + 1}-
                {Math.min(currentPage * 10, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
