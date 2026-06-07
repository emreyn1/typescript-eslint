'use client';

import { motion } from 'framer-motion';
import { CreditCard, ShoppingBag, Wallet } from 'lucide-react';

const steps = [
  {
    step: '1',
    icon: Wallet,
    title: 'Fund with Crypto',
    description:
      'Send BTC, ETH, USDT, or any of 100+ supported coins to your deposit address.',
  },
  {
    step: '2',
    icon: CreditCard,
    title: 'Get Your Card',
    description:
      'Your virtual card is created instantly. View the number, expiry, and CVV in your dashboard.',
  },
  {
    step: '3',
    icon: ShoppingBag,
    title: 'Start Spending',
    description:
      'Use it online, add to Apple Pay or Google Pay, or enter details manually at checkout.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-28 bg-muted/20" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Three steps from crypto to spending
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-14 left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5 relative z-10 border border-primary/20">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center z-20">
                {step.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
