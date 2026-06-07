'use client';

import { motion } from 'framer-motion';
import { EyeOff, Lock, ServerOff, ShieldCheck } from 'lucide-react';

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Minimal Data Collection',
    description: 'We only ask for what\'s needed to issue your card',
  },
  {
    icon: Lock,
    title: 'Encrypted at Rest',
    description: 'Your card details are never stored in plain text',
  },
  {
    icon: ServerOff,
    title: 'No Tracking',
    description: 'We don\'t log your transactions or browsing',
  },
  {
    icon: EyeOff,
    title: 'Anonymous Funding',
    description: 'Pay with crypto—no bank account linked',
  },
];

export function PrivacyPillars() {
  return (
    <section className="py-20 sm:py-28 border-y border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Your Privacy Comes <span className="text-gradient">First</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We built this service for people who value their financial privacy.
            No unnecessary data collection. No selling your info.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center p-6 rounded-2xl glass-card"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <pillar.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
