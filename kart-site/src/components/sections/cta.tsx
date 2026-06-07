import Link from 'next/link';
import { ArrowRight, Shield, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-16 text-center glow">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Your Card in 60 Seconds
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              No ID. No bank account. No waiting.
              Just crypto and a working card.
            </p>

            {/* Value stack */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <span><strong className="text-white">$15</strong> one-time</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span><strong className="text-white">60 sec</strong> delivery</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span><strong className="text-white">No KYC</strong> required</span>
              </div>
            </div>

            <Button size="xl" variant="gradient" asChild>
              <Link href="/register" className="gap-2">
                Get Your Card — $15
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <p className="mt-4 text-xs text-zinc-500">
              Accepted at 50M+ merchants worldwide. Works with Apple Pay & Google Pay.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
