import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Do I need KYC to get a card?',
    answer:
      'Our platform is designed for privacy-first users. Card issuance requires only an email account. We do not require identity verification for standard virtual cards.',
  },
  {
    question: 'Which cryptocurrencies are supported?',
    answer:
      'We support 100+ cryptocurrencies including Bitcoin, Ethereum, USDT, USDC, Litecoin, Solana, Monero, and many more via our Cryptomus integration.',
  },
  {
    question: 'How fast is card delivery?',
    answer:
      'Virtual cards are generated instantly after your account is funded. Physical cards, when available, ship within 7-14 business days.',
  },
  {
    question: 'Where can I use my card?',
    answer:
      'Your Visa virtual card works at millions of merchants worldwide—online stores, subscriptions, and anywhere Visa is accepted.',
  },
  {
    question: 'Is my transaction data stored?',
    answer:
      'We operate on a privacy-by-design model. We minimize data retention and never sell your information to third parties.',
  },
  {
    question: 'What are the fees?',
    answer:
      'Virtual cards start at $15. Crypto top-ups have a 2% platform fee. Network fees apply only to blockchain transactions.',
  },
];

export function FAQ() {
  return (
    <section className="py-20 sm:py-32 bg-muted/20" id="faq">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Everything you need to know before getting started
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="text-center text-sm text-muted-foreground mt-8">
          More questions?{' '}
          <Link href="/faq" className="text-primary hover:underline">
            View full FAQ
          </Link>{' '}
          or{' '}
          <Link href="/about#contact" className="text-primary hover:underline">
            contact support
          </Link>
        </p>
      </div>
    </section>
  );
}
