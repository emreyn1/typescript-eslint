import Link from 'next/link';
import { ArrowRight, Bitcoin, Shield, Sparkles, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroCard } from '@/components/sections/hero-card';
import { VisaLogo, MastercardLogo } from '@/components/icons/card-brands';

export function Hero() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 min-h-[85vh] flex items-center">
      <div className="absolute inset-0 hero-gradient grid-pattern -z-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-6 text-emerald-400">
              <Zap className="h-4 w-4" />
              Card ready in 60 seconds — No ID required
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.15] text-white">
              Crypto to Card.{' '}
              <span className="text-gradient">No KYC.</span>
              <br className="hidden sm:block" />
              {' '}60 Seconds.
            </h1>

            <p className="text-lg text-zinc-400 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Send BTC, ETH, or USDT. Get a virtual Visa instantly.
              Use it anywhere online — subscriptions, shopping, travel.
            </p>

            {/* Pricing anchor - CRO critical */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="text-2xl font-bold text-white">$15</span>
                <span className="text-zinc-500">card fee</span>
              </div>
              <div className="w-px h-6 bg-zinc-700" />
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="text-2xl font-bold text-white">$0</span>
                <span className="text-zinc-500">monthly</span>
              </div>
              <div className="w-px h-6 bg-zinc-700" />
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="text-2xl font-bold text-white">2%</span>
                <span className="text-zinc-500">load fee</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs text-zinc-400">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                No KYC
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs text-zinc-400">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                Instant Delivery
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-zinc-400">
                <VisaLogo className="h-4 w-auto text-white" />
                <MastercardLogo className="h-4 w-auto" />
                Worldwide
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="xl" variant="gradient" asChild>
                <Link href="/register" className="gap-2">
                  Get Your Card — $15
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/pricing">See All Pricing</Link>
              </Button>
            </div>

            {/* Micro-commitment / risk reversal */}
            <p className="mt-4 text-xs text-zinc-500 text-center lg:text-left">
              No account needed to check prices. Cancel anytime.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end animate-fade-in-up">
            <HeroCard />
          </div>
        </div>
      </div>
    </section>
  );
}
