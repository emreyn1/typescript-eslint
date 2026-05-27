import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Faq from "@/components/sections/Faq";
import JoinNow from "@/components/sections/JoinNow";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "SMS Activations - GetSMSNow | Receive SMS Online",
  description: "Activate online services quickly and safely with GetSMSNow numbers. Use temporary phone numbers for easy verification on any platform.",
};

export default function SmsActivationsPage() {
  return (
    <>
      <Hero
        title="Receive SMS online - Secure and Reliable with GetSMSNow"
        subtitle="Activate Your Online Services Effortlessly with Temporary Phone Numbers"
        variant="inner"
      />

      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-center">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">SMS Activations</h2>
              <p className="text-muted-foreground mb-6">
                GetSMSNow offers seamless and secure SMS activation services with temporary phone numbers from over 120 countries.
              </p>
              <p className="text-muted-foreground mb-6">
                Whether you need to activate social media accounts, verify online services, or ensure privacy, our platform provides the perfect solution.
              </p>
              <p className="text-muted-foreground">
                With GetSMSNow, you can receive SMS online, free of charge, and pay only when you successfully receive an SMS code.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80"
                  alt="SMS Activations - receive verification codes on your device"
                  width={500}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Features />

      <HowItWorks />

      <section className="py-16 md:py-20 bg-GetSMSNow-light-blue/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Sign up with:</h2>
            <div className="mt-6">
              <Link
                href="/registration"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90 rounded-md transition-colors"
              >
                Email
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Faq />
    </>
  );
}
