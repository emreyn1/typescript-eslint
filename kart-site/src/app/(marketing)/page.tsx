import { Hero } from '@/components/sections/hero';
import { TrustBar } from '@/components/sections/trust-bar';
import { Stats } from '@/components/sections/stats';
import { Features } from '@/components/sections/features';
import { PrivacyPillars } from '@/components/sections/privacy-pillars';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Testimonials } from '@/components/sections/testimonials';
import { FAQ } from '@/components/sections/faq';
import { CTA } from '@/components/sections/cta';

export const metadata = {
  title: 'PryCard - Crypto to Virtual Visa Card in 60 Seconds | No KYC',
  description: 'Convert BTC, ETH, USDT to a virtual Visa card instantly. No KYC required. Use anywhere Visa is accepted online. Cards from $15.',
  openGraph: {
    title: 'PryCard - Crypto to Virtual Visa Card in 60 Seconds',
    description: 'Convert BTC, ETH, USDT to a virtual Visa card instantly. No KYC required.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Stats />
      <Features />
      <PrivacyPillars />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
