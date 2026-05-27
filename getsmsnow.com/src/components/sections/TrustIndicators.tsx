"use client";

import {
  ShieldCheck,
  RefreshCw,
  Clock,
  Headphones,
  Wallet,
  Lock,
} from "lucide-react";

const indicators = [
  {
    icon: ShieldCheck,
    title: "Pay Only on Success",
    description:
      "You are only charged when you actually receive the SMS code. No code = no charge.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Refund Guarantee",
    description:
      "If the SMS is not delivered within the time window, your balance is automatically refunded.",
  },
  {
    icon: Clock,
    title: "Available 24/7",
    description:
      "Our numbers and systems are online around the clock. Get verified any time, any day.",
  },
  {
    icon: Wallet,
    title: "Crypto-Friendly",
    description:
      "Pay with BTC, ETH, USDT, USDC and 300+ other cryptocurrencies. No bank account needed.",
  },
  {
    icon: Lock,
    title: "Zero KYC Required",
    description:
      "No ID upload, no selfies, no personal data. Start using the service immediately.",
  },
  {
    icon: Headphones,
    title: "Telegram Support",
    description:
      "Real human support via Telegram. Get help within minutes, not days.",
  },
];

export default function TrustIndicators() {
  return (
    <section className="py-16 md:py-24 bg-muted/20">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary">
            Why Customers Choose Us
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            We built GetSMSNow to be the most reliable and privacy-respecting
            SMS verification service available.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {indicators.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-GetSMSNow-blue/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-GetSMSNow-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
