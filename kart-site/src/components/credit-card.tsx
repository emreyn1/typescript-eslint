'use client';

import { cn, formatCardNumber, maskCardNumber, formatCurrency } from '@/lib/utils';
import { CreditCard as CardIcon, Eye, EyeOff, Snowflake } from 'lucide-react';
import { useState } from 'react';

interface CreditCardProps {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  balance: number | string;
  type: string;
  status: string;
  className?: string;
  enableFlip?: boolean;
}

export function CreditCardDisplay({
  cardNumber,
  cardHolder,
  expiryMonth,
  expiryYear,
  cvv,
  balance,
  type,
  status,
  className,
  enableFlip = true,
}: CreditCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const isActive = status === 'ACTIVE';
  const isFrozen = status === 'FROZEN';

  const gradientClass = isActive
    ? 'from-slate-900 via-slate-800 to-emerald-950'
    : isFrozen
      ? 'from-slate-600 via-slate-700 to-slate-800'
      : 'from-gray-700 via-gray-800 to-gray-900 opacity-70';

  const cardFace = (
    <div
      className={cn(
        'relative w-full aspect-[1.586/1] rounded-2xl p-6 text-white overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/10',
        `bg-gradient-to-br ${gradientClass}`
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-card-shine" />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-400/25 to-transparent rounded-full blur-2xl" />

      <div className="relative h-full flex flex-col justify-between min-h-[180px]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CardIcon className="h-8 w-8 text-emerald-400" />
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">
              {type === 'VIRTUAL' ? 'Virtual Card' : 'Physical Card'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isFrozen && <Snowflake className="h-5 w-5 text-cyan-300" />}
            <span className="text-sm font-bold italic opacity-90">VISA</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {showDetails ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs opacity-60">Balance</p>
          <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
        </div>

        <div className="space-y-4">
          <p className="text-xl tracking-[0.2em] font-mono">
            {showDetails ? formatCardNumber(cardNumber) : maskCardNumber(cardNumber)}
          </p>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs opacity-60 mb-1">Card Holder</p>
              <p className="font-medium tracking-wide text-sm">{cardHolder}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-60 mb-1">Expires</p>
              <p className="font-mono text-sm">
                {expiryMonth}/{expiryYear}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-60 mb-1">CVV</p>
              <p className="font-mono text-sm">{showDetails ? cvv : '•••'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const cardBack = (
    <div
      className={cn(
        'relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden border border-white/10 shadow-2xl',
        `bg-gradient-to-br ${gradientClass}`
      )}
    >
      <div className="absolute top-6 left-0 right-0 h-10 bg-black/40" />
      <div className="relative h-full flex flex-col justify-end p-6">
        <div className="p-3 rounded bg-white/10 backdrop-blur">
          <p className="text-xs opacity-60 mb-1">CVV</p>
          <p className="font-mono text-lg tracking-widest">{showDetails ? cvv : '•••'}</p>
        </div>
        <p className="text-xs opacity-50 mt-4 text-center">
          Authorized signature not required for virtual use
        </p>
      </div>
    </div>
  );

  if (!enableFlip) {
    return (
      <div className={cn('relative w-full max-w-md transition-transform hover:scale-[1.02]', className)}>
        {cardFace}
      </div>
    );
  }

  return (
    <div
      className={cn('relative w-full max-w-md cursor-pointer group', className)}
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(!flipped)}
      onKeyDown={(e) => e.key === 'Enter' && setFlipped(!flipped)}
      role="button"
      tabIndex={0}
      aria-label="Flip card"
    >
      <div
        className="relative w-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div style={{ backfaceVisibility: 'hidden' }}>{cardFace}</div>
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {cardBack}
        </div>
      </div>
      <p className="text-xs text-center text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to flip card
      </p>
    </div>
  );
}
