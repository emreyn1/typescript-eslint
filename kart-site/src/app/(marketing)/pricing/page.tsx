import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CARD_VARIANTS } from '@/lib/card-types';

export const metadata = {
  title: 'Pricing | PryCard - Virtual Crypto Cards from $15',
  description: 'Transparent pricing for PryCard virtual Visa cards. Cards from $15, 2% deposit fee, $2 withdrawal fee. No hidden charges.',
};

const plans = [
  {
    name: CARD_VARIANTS.NEXUS_3D.name,
    price: CARD_VARIANTS.NEXUS_3D.price,
    monthlyFee: CARD_VARIANTS.NEXUS_3D.monthlyFee,
    description: CARD_VARIANTS.NEXUS_3D.description,
    features: [
      'Instant virtual card',
      '3D Secure enabled',
      'Works at 50M+ merchants',
      'No monthly fee',
      `Daily limit: $${CARD_VARIANTS.NEXUS_3D.limits.daily.toLocaleString()}`,
      '3 years validity',
    ],
    cta: 'Get Nexus 3D',
    popular: true,
  },
  {
    name: CARD_VARIANTS.OMNI_LITE.name,
    price: CARD_VARIANTS.OMNI_LITE.price,
    monthlyFee: CARD_VARIANTS.OMNI_LITE.monthlyFee,
    description: CARD_VARIANTS.OMNI_LITE.description,
    features: [
      'Instant virtual card',
      '3D Secure enabled',
      'Higher daily limits',
      'Priority support',
      `Daily limit: $${CARD_VARIANTS.OMNI_LITE.limits.daily.toLocaleString()}`,
      '3 years validity',
    ],
    cta: 'Get OMNI Lite',
    popular: false,
  },
  {
    name: CARD_VARIANTS.OMNI_PRO.name,
    price: CARD_VARIANTS.OMNI_PRO.price,
    monthlyFee: CARD_VARIANTS.OMNI_PRO.monthlyFee,
    description: CARD_VARIANTS.OMNI_PRO.description,
    features: [
      'Instant virtual card',
      '3D Secure enabled',
      'Maximum limits',
      'VIP support',
      `Daily limit: $${CARD_VARIANTS.OMNI_PRO.limits.daily.toLocaleString()}`,
      'Cashback rewards',
    ],
    cta: 'Get OMNI Pro',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No hidden fees. Pay once for your card, top up with crypto anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-border/40 ${plan.popular ? 'border-primary/50 glow-sm' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground"> one-time</span>
                  {plan.monthlyFee > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      + ${plan.monthlyFee}/month
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? 'gradient' : 'outline'} className="w-full" asChild>
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Deposit Fees</h3>
            <p className="text-sm text-muted-foreground">
              2% processing fee on all crypto deposits. Minimum deposit: $10.
              Maximum: $10,000 per transaction.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Withdrawal Fees</h3>
            <p className="text-sm text-muted-foreground">
              $2 flat fee per withdrawal. Minimum withdrawal: $20.
              Withdrawals are processed to USDT TRC20.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
