import { Wallet } from '@prisma/client';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Euro, Coins } from 'lucide-react';

interface BalanceCardsProps {
  wallets: Wallet[];
  className?: string;
}

const walletConfig = {
  USD: {
    icon: DollarSign,
    label: 'US Dollar',
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/10 to-teal-500/5',
  },
  EUR: {
    icon: Euro,
    label: 'Euro',
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-500/10 to-indigo-500/5',
  },
  USDT: {
    icon: Coins,
    label: 'Tether USDT',
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-500/10 to-emerald-500/5',
  },
};

export function BalanceCards({ wallets, className }: BalanceCardsProps) {
  const walletTypes = ['USD', 'EUR', 'USDT'] as const;

  return (
    <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {walletTypes.map((type) => {
        const wallet = wallets.find((w) => w.type === type);
        const config = walletConfig[type];
        const balance = wallet ? Number(wallet.balance) : 0;

        return (
          <div
            key={type}
            className={cn(
              'relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br p-6',
              config.bgGradient
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{config.label}</p>
                <p className="mt-1 text-2xl font-bold">
                  {type === 'USDT' ? `${balance.toFixed(2)} USDT` : formatCurrency(balance, type)}
                </p>
              </div>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br',
                  config.gradient
                )}
              >
                <config.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent" />
          </div>
        );
      })}
    </div>
  );
}
