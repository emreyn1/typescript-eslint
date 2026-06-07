'use client';

import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      'Needed a card for a Figma subscription without linking my bank. Sent $50 in USDT, had the card in 3 minutes. Subscription active same day.',
    author: 'Marcus',
    role: 'UI Designer, Berlin',
    useCase: 'Software subscriptions',
    rating: 5,
  },
  {
    quote:
      'I run a small Etsy shop and needed to buy supplies from a US vendor. My local bank charges 5% forex. This card? 2% flat. Saved me $200 last month.',
    author: 'Priya',
    role: 'Etsy Seller, Mumbai',
    useCase: 'International purchases',
    rating: 5,
  },
  {
    quote:
      'Booked a hotel in Portugal for a conference. The hotel wanted a card on file. Loaded €300, checked in, done. No questions from my bank.',
    author: 'Tomasz',
    role: 'Developer, Warsaw',
    useCase: 'Travel bookings',
    rating: 5,
  },
  {
    quote:
      'Support helped me when a merchant double-charged. Got a response in 40 minutes, refund processed next day. Better than my actual bank.',
    author: 'Rachel',
    role: 'Freelance Writer, Toronto',
    useCase: 'Dispute resolution',
    rating: 5,
  },
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-20 sm:py-28" id="testimonials">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Real Users, Real Use Cases</h2>
          <p className="text-muted-foreground">
            See how people actually use their cards
          </p>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-10px)] lg:flex-[0_0_calc(33.333%-14px)]"
              >
                <div className="h-full p-6 rounded-2xl glass-card flex flex-col">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-emerald-400 font-medium mb-2">{t.useCase}</p>
                  <Quote className="h-6 w-6 text-primary/20 mb-2" />
                  <p className="text-muted-foreground mb-5 leading-relaxed flex-1 text-sm">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="border-t border-border/40 pt-4">
                    <p className="font-semibold text-sm">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={scrollPrev}
            className="px-4 py-2 rounded-lg glass text-sm hover:bg-white/5 transition-colors"
            aria-label="Previous"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="px-4 py-2 rounded-lg glass text-sm hover:bg-white/5 transition-colors"
            aria-label="Next"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
