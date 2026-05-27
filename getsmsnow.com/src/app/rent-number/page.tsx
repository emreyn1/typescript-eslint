import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Faq from "@/components/sections/Faq";
import Image from "next/image";

export const metadata = {
  title: "Rent Temporary Phone Numbers - GetSMSNow",
  description: "Rent secure and private temporary phone numbers for SMS verification with GetSMSNow. Easy, anonymous, and reliable for long-term use.",
};

export default function RentNumberPage() {
  return (
    <>
      <Hero
        title="Rent Temporary Phone Numbers - Reliable and Private with GetSMSNow"
        subtitle="Rent Numbers for Extended Use and Secure Online Verifications"
        variant="inner"
      />

      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-center">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Temporary Number Rent</h2>
              <p className="text-muted-foreground mb-6">
                GetSMSNow offers reliable and secure temporary phone number rental services, perfect for extended use in online verifications, service activations, and maintaining privacy.
              </p>
              <p className="text-muted-foreground mb-6">
                Whether you need a number for a few hours or several days, our platform provides flexible rental options with numbers from over 80 countries.
              </p>
              <p className="text-muted-foreground">
                With GetSMSNow, you can rent numbers to receive SMS online without sharing your personal number, ensuring your privacy is protected.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80"
                  alt="Rent a temporary number for SMS verification"
                  width={500}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Features and Benefits</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-border/40 rounded-lg hover:shadow-sm transition-shadow">
              <h3 className="text-lg font-medium mb-3 text-primary">Flexible Rental Durations for wide use</h3>
              <p className="text-sm text-muted-foreground">
                Choose from a variety of rental durations to suit your needs, whether it's for a few hours or several days, ensuring you have the number as long as you need it
              </p>
            </div>

            <div className="p-6 border border-border/40 rounded-lg hover:shadow-sm transition-shadow">
              <h3 className="text-lg font-medium mb-3 text-primary">Global Access with Numbers from Over 80 Countries</h3>
              <p className="text-sm text-muted-foreground">
                Rent temporary phone numbers from a wide range of countries, enabling you to receive SMS online from anywhere in the world
              </p>
            </div>

            <div className="p-6 border border-border/40 rounded-lg hover:shadow-sm transition-shadow">
              <h3 className="text-lg font-medium mb-3 text-primary">High Level of Privacy and Anonymity</h3>
              <p className="text-sm text-muted-foreground">
                Maintain your privacy with our secure numbers connected to mobile operators, ensuring your personal information is protected.
              </p>
            </div>

            <div className="p-6 border border-border/40 rounded-lg hover:shadow-sm transition-shadow">
              <h3 className="text-lg font-medium mb-3 text-primary">Cost-Effective and User-Oriented Solution</h3>
              <p className="text-sm text-muted-foreground">
                Pay only for the duration you need, making it an affordable option for extended use cases such as app testing, online service verifications, and more
              </p>
            </div>

            <div className="p-6 border border-border/40 rounded-lg hover:shadow-sm transition-shadow">
              <h3 className="text-lg font-medium mb-3 text-primary">Easy and Quick Setup and Balance Top Up</h3>
              <p className="text-sm text-muted-foreground">
                Get started with GetSMSNow in just a few clicks. Choose a country, select a service, top up your balance and start receiving SMS instantly.
              </p>
            </div>

            <div className="p-6 border border-border/40 rounded-lg hover:shadow-sm transition-shadow">
              <h3 className="text-lg font-medium mb-3 text-primary">API Access for Seamless Integration</h3>
              <p className="text-sm text-muted-foreground">
                Integrate GetSMSNow activation services into your own applications effortlessly with our comprehensive API, giving you full control and flexibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      <Faq />
    </>
  );
}
