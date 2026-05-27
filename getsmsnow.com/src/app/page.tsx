import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Faq from "@/components/sections/Faq";
import JoinNow from "@/components/sections/JoinNow";
import TrustIndicators from "@/components/sections/TrustIndicators";
import StatsBar from "@/components/sections/StatsBar";
import PopularServices from "@/components/sections/PopularServices";

export default function Home() {
  return (
    <>
      <Hero
        title="Instant SMS Verification — 120+ Countries"
        subtitle="Get a real non-VoIP phone number in seconds. Receive SMS for any service. Pay only when you get the code — crypto accepted, no KYC."
        variant="home"
      />
      <StatsBar />
      <PopularServices />
      <Features />
      <HowItWorks />
      <TrustIndicators />
      <Faq id="faq" />
      <JoinNow />
    </>
  );
}
