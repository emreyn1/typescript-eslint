"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/data/faq";

interface FaqProps {
  /** Set false on /faq page so we don't show "View all on dedicated page". */
  showViewAllLink?: boolean;
  /** Optional id for the section (e.g. "faq" for anchor scroll). */
  id?: string;
}

export default function Faq({ showViewAllLink = true, id }: FaqProps) {
  return (
    <section id={id} className="py-16 md:py-24 scroll-mt-20">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Frequently Asked Questions F.A.Q.</h2>
          {showViewAllLink && (
            <Link
              href="/faq"
              className="text-sm text-GetSMSNow-blue hover:text-GetSMSNow-blue/80 font-medium"
            >
              View all FAQ on dedicated page →
            </Link>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left font-medium text-primary">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
