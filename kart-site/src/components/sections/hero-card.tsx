'use client';

import { CreditCard } from 'lucide-react';
import { VisaLogo, MastercardLogo } from '@/components/icons/card-brands';

export function HeroCard() {
  return (
    <div className="relative w-full max-w-md">
      <div className="animate-float">
        <div className="relative w-full aspect-[1.586/1] rounded-2xl p-5 sm:p-6 text-white overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 shadow-2xl shadow-emerald-500/20 border border-white/10 glow">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-card-shine" />
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative h-full flex flex-col justify-between min-h-[180px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-7 w-7 text-emerald-400" />
                <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                  Virtual Card
                </span>
              </div>
              <div className="flex items-center gap-2">
                <VisaLogo className="h-5 w-auto text-white/90" />
                <MastercardLogo className="h-5 w-auto" />
              </div>
            </div>

            <div>
              <p className="text-xs opacity-60">Available Balance</p>
              <p className="text-2xl sm:text-3xl font-bold">$2,450.00</p>
            </div>

            <div className="space-y-3">
              <p className="text-lg sm:text-xl tracking-[0.2em] font-mono">•••• •••• •••• 8842</p>
              <div className="flex items-end justify-between text-sm">
                <div>
                  <p className="text-xs opacity-60 mb-0.5">Card Holder</p>
                  <p className="font-medium tracking-wide">CARD USER</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60 mb-0.5">Expires</p>
                  <p className="font-mono">09/28</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
