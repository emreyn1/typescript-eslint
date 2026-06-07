import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click Get Started, enter your email and password. No KYC required for virtual cards.',
      },
      {
        q: 'How do I fund my account?',
        a: 'Go to Deposit, select an amount, and pay with any supported cryptocurrency via Cryptomus.',
      },
      {
        q: 'How fast do I get my card?',
        a: 'Virtual cards are issued instantly after you have sufficient balance and complete purchase.',
      },
    ],
  },
  {
    category: 'Cards & Spending',
    items: [
      {
        q: 'Where can I use my card?',
        a: 'Anywhere Visa is accepted online. Apple Pay and Google Pay supported where available.',
      },
      {
        q: 'What are spending limits?',
        a: 'Limits vary by card type. Nexus 3D: $5,000/day. OMNI Lite: $10,000/day. OMNI Pro: $25,000/day. See pricing page for details.',
      },
      {
        q: 'Can I freeze my card?',
        a: 'Yes. From My Cards you can freeze or unfreeze your card instantly for security.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    items: [
      {
        q: 'Is KYC required?',
        a: 'Standard virtual cards require only email registration. We prioritize privacy by design.',
      },
      {
        q: 'How is my data protected?',
        a: 'We use encryption, minimize data retention, and never sell your information.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'Which cryptocurrencies are accepted?',
        a: 'BTC, ETH, USDT, USDC, LTC, SOL, XMR, and 100+ more via Cryptomus.',
      },
      {
        q: 'Are there top-up fees?',
        a: '2% platform fee on all crypto deposits. Blockchain network fees also apply.',
      },
    ],
  },
];

export const metadata = {
  title: 'FAQ | PryCard',
  description: 'Frequently asked questions about PryCard virtual crypto cards.',
};

export default function FAQPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Can&apos;t find your answer? Our support team is here to help.
          </p>
        </div>

        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-lg font-semibold mb-4 text-primary">{section.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((item, i) => (
                  <AccordionItem key={item.q} value={`${section.category}-${i}`}>
                    <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center glass-card rounded-2xl p-8">
          <p className="text-muted-foreground mb-4">Still need help?</p>
          <Button variant="gradient" asChild>
            <Link href="/about#contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
