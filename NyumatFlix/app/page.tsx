import { FAQSectionClient } from "@/components/layout/sections/faq-client";
import { HeroSection } from "@/components/layout/sections/hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MovieOn | Watch Movies and TV Shows",
  description:
    "MovieOn is a free movie and tv show stream aggregator. Watch unlimited content.",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": 0,
      "max-image-preview": "large",
      "max-snippet": 150,
    },
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <FAQSectionClient />
    </>
  );
}
