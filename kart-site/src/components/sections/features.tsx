'use client';

import { motion } from 'framer-motion';
import {
  EyeOff,
  Globe,
  Lock,
  RefreshCw,
  Shield,
  Wallet,
  Zap,
  Clock,
} from 'lucide-react';

const features = [
  {
    icon: EyeOff,
    title: 'No Documents Required',
    description: 'Get started with just an email. No ID uploads, no selfies, no waiting.',
  },
  {
    icon: Lock,
    title: 'Encrypted Storage',
    description: 'Card details and balances are encrypted. We can\'t see your spending.',
  },
  {
    icon: Shield,
    title: 'No Data Selling',
    description: 'Your information is never shared with advertisers or third parties.',
  },
  {
    icon: Zap,
    title: 'Instant Issuance',
    description: 'Card ready in under 60 seconds after your first deposit clears.',
  },
  {
    icon: RefreshCw,
    title: 'Reload Anytime',
    description: 'Top up with BTC, ETH, USDT, and 100+ other cryptocurrencies.',
  },
  {
    icon: Globe,
    title: 'Works Everywhere',
    description: 'Accepted at any merchant that takes Visa or Mastercard online.',
  },
  {
    icon: Wallet,
    title: 'Flexible Limits',
    description: 'Start with standard limits. Request higher tiers as you need them.',
  },
  {
    icon: Clock,
    title: 'Long Validity',
    description: 'Cards valid for up to 3 years. No monthly maintenance fees.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section className="py-20 sm:py-28" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for <span className="text-gradient">Privacy</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Spend crypto without giving up your personal information
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group p-5 rounded-2xl glass-card hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1.5 text-sm">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
