import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: 'Why do I need an adblocker if MovieOn is "ad-free"?',
    answer:
      "We do not host any content on our servers. We only provide links to third-party sources. These third parties may inject scripts into their iframes to display ads. We recommend using an adblocker to block these ads — MovieOn itself is ad-free!",
    value: "item-0",
  },
  {
    question: "Is MovieOn free to use?",
    answer:
      "Yes! MovieOn is completely free. No registration, no subscription, no hidden fees.",
    value: "item-3",
  },
  {
    question: "How does MovieOn work?",
    answer:
      "MovieOn aggregates streaming sources from multiple providers. When you click play, we find the best available source automatically.",
    value: "item-4",
  },
  {
    question: "What is the best way to watch movies and TV shows?",
    answer:
      "MovieOn! With 10+ providers and automatic quality selection, you get the best streaming experience for free.",
    value: "item-5",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg font-extralight text-primary text-center mb-2 tracking-wider">
          Got a Question?
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-light">
          Frequently Asked Questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="AccordionRoot">
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem
            key={value}
            value={value}
            className={cn("border-none ring-[0.3px] ring-primary/50")}
          >
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
