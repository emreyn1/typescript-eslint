import Hero from "@/components/sections/Hero";
import Faq from "@/components/sections/Faq";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, DollarSign, MailQuestion, PiggyBank, Smartphone, Users } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Earn Money with SIM Cards - GetSMSNow",
  description: "Monetize your SIM cards with GetSMSNow. Start earning by providing SMS services with our specialized software and expert support.",
};

export default function EarnWithSimPage() {
  return (
    <>
      <Hero
        title="Earn Money with SIM Cards"
        subtitle="Monetize Your SIM Cards Effortlessly with Our Specialized Software and Expert Support"
        variant="inner"
        showSearchForm={false}
      />

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-center">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Turn Your Unused SIM Cards Into Passive Income</h2>
              <p className="text-muted-foreground mb-6">
                Do you have unused SIM cards lying around? With SMS, you can turn them into a source of
                passive income by providing SMS verification services to our users.
              </p>
              <p className="text-muted-foreground mb-6">
                Our platform connects people who need temporary phone numbers with providers like you who
                have SIM cards available. You earn money every time your SIM card is used for verification.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <Check className="h-5 w-5 text-green-500" />
                <p className="text-primary font-medium">Get paid for each SMS your SIM cards receive</p>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Check className="h-5 w-5 text-green-500" />
                <p className="text-primary font-medium">Easy setup with our specialized software</p>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Check className="h-5 w-5 text-green-500" />
                <p className="text-primary font-medium">Technical support available 24/7</p>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <Check className="h-5 w-5 text-green-500" />
                <p className="text-primary font-medium">Weekly payments to your preferred method</p>
              </div>
              <Button
                asChild
                className="bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90"
              >
                <Link href="/registration">
                  Start Earning Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="md:w-1/2">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1627163439134-7a8c47e08208?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Earn with SIM Cards"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute top-4 right-4 bg-GetSMSNow-red text-white px-4 py-2 rounded-full font-bold">
                  Earn up to $500/month
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-GetSMSNow-light-blue/30">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">How It Works</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Join our network of SIM card providers in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative border-border/40 hover:shadow-md transition-shadow overflow-hidden">
              <div className="absolute top-0 left-0 w-12 h-12 bg-GetSMSNow-blue text-white flex items-center justify-center font-bold text-xl rounded-br-lg">
                1
              </div>
              <CardContent className="pt-14">
                <div className="flex justify-center mb-6">
                  <Smartphone className="h-16 w-16 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-primary text-center mb-3">Register Your SIM Cards</h3>
                <p className="text-muted-foreground text-center">
                  Sign up as a provider and register your SIM cards with our platform. Each SIM card needs to be active and able to receive SMS messages.
                </p>
              </CardContent>
            </Card>

            <Card className="relative border-border/40 hover:shadow-md transition-shadow overflow-hidden">
              <div className="absolute top-0 left-0 w-12 h-12 bg-GetSMSNow-blue text-white flex items-center justify-center font-bold text-xl rounded-br-lg">
                2
              </div>
              <CardContent className="pt-14">
                <div className="flex justify-center mb-6">
                  <MailQuestion className="h-16 w-16 p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-medium text-primary text-center mb-3">Connect SIMs to Our System</h3>
                <p className="text-muted-foreground text-center">
                  Install our specialized software on a device with your SIM cards. Our system will automatically manage incoming SMS messages.
                </p>
              </CardContent>
            </Card>

            <Card className="relative border-border/40 hover:shadow-md transition-shadow overflow-hidden">
              <div className="absolute top-0 left-0 w-12 h-12 bg-GetSMSNow-blue text-white flex items-center justify-center font-bold text-xl rounded-br-lg">
                3
              </div>
              <CardContent className="pt-14">
                <div className="flex justify-center mb-6">
                  <DollarSign className="h-16 w-16 p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-primary text-center mb-3">Earn Money Automatically</h3>
                <p className="text-muted-foreground text-center">
                  Your SIM cards are now available for users. Each time a user receives an SMS through your SIM card, you earn money, tracked in your dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Why Choose SMS as Your Partner?</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              We provide everything you need to maximize your earnings from SIM cards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <PiggyBank className="h-12 w-12 p-2 text-GetSMSNow-blue" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-primary mb-2">Competitive Commission Rates</h3>
                <p className="text-muted-foreground">
                  We offer some of the highest commission rates in the industry. You can earn up to 70% of the fee for each SMS received, depending on the service and country.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Users className="h-12 w-12 p-2 text-GetSMSNow-blue" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-primary mb-2">Large User Base</h3>
                <p className="text-muted-foreground">
                  With thousands of users needing SMS verification services daily, your SIM cards will be in constant demand, maximizing your earning potential.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Smartphone className="h-12 w-12 p-2 text-GetSMSNow-blue" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-primary mb-2">Advanced Software Solution</h3>
                <p className="text-muted-foreground">
                  Our software supports various setups, from single phones to multi-SIM gateways, and works with most Android devices and specialized SMS hardware.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <MailQuestion className="h-12 w-12 p-2 text-GetSMSNow-blue" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-primary mb-2">Dedicated Support Team</h3>
                <p className="text-muted-foreground">
                  Our technical support team is available 24/7 to help you set up your SIM cards and resolve any issues that may arise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-GetSMSNow-light-blue/30">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2 lg:w-3/5">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
                Frequently Asked Questions about Earning with SIM Cards
              </h2>

              <div className="space-y-6">
                <div className="rounded-lg border border-border/40 bg-background p-6">
                  <h3 className="text-lg font-medium text-primary mb-2">How much can I earn with my SIM cards?</h3>
                  <p className="text-muted-foreground">
                    Earnings depend on several factors, including your country, the number of SIM cards you provide, and the demand for services. On average, providers earn between $1-2 per day per active SIM card. With 10-20 SIM cards, you could earn $300-$800 per month.
                  </p>
                </div>

                <div className="rounded-lg border border-border/40 bg-background p-6">
                  <h3 className="text-lg font-medium text-primary mb-2">What technical equipment do I need?</h3>
                  <p className="text-muted-foreground">
                    You'll need active SIM cards and either Android phones or a specialized SMS gateway device that can hold multiple SIM cards. Our software runs on most Android devices (version 5.0 or higher) or on Windows for SMS gateways.
                  </p>
                </div>

                <div className="rounded-lg border border-border/40 bg-background p-6">
                  <h3 className="text-lg font-medium text-primary mb-2">How do I get paid?</h3>
                  <p className="text-muted-foreground">
                    We offer multiple payment methods including PayPal, bank transfer, Bitcoin, and other cryptocurrencies. Payments are processed weekly for all earnings above the minimum threshold of $10.
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 lg:w-2/5 flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md">
                <h3 className="text-xl font-bold text-primary mb-4 text-center">Ready to Start Earning?</h3>
                <p className="text-muted-foreground mb-6 text-center">
                  Join our network of SIM card providers and start earning passive income today.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-GetSMSNow-blue text-white flex items-center justify-center font-bold text-xs">1</div>
                    <p className="text-sm">Register on our platform</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-GetSMSNow-blue text-white flex items-center justify-center font-bold text-xs">2</div>
                    <p className="text-sm">Download our specialized software</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-GetSMSNow-blue text-white flex items-center justify-center font-bold text-xs">3</div>
                    <p className="text-sm">Connect your SIM cards</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-GetSMSNow-blue text-white flex items-center justify-center font-bold text-xs">4</div>
                    <p className="text-sm">Start earning money</p>
                  </div>
                </div>

                <Button
                  className="w-full mt-8 bg-GetSMSNow-red hover:bg-GetSMSNow-red/90"
                  asChild
                >
                  <Link href="/registration">
                    Register as Provider
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Our Global Provider Network</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Join providers from over 80 countries who are already earning with SMS
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <Image
                src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/us.svg"
                alt="United States"
                width={60}
                height={45}
                className="mb-2 h-10 w-auto shadow-sm"
              />
              <p className="text-sm font-medium text-primary">United States</p>
              <p className="text-xs text-muted-foreground">1200+ providers</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gb.svg"
                alt="United Kingdom"
                width={60}
                height={45}
                className="mb-2 h-10 w-auto shadow-sm"
              />
              <p className="text-sm font-medium text-primary">United Kingdom</p>
              <p className="text-xs text-muted-foreground">850+ providers</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/de.svg"
                alt="Germany"
                width={60}
                height={45}
                className="mb-2 h-10 w-auto shadow-sm"
              />
              <p className="text-sm font-medium text-primary">Germany</p>
              <p className="text-xs text-muted-foreground">780+ providers</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/fr.svg"
                alt="France"
                width={60}
                height={45}
                className="mb-2 h-10 w-auto shadow-sm"
              />
              <p className="text-sm font-medium text-primary">France</p>
              <p className="text-xs text-muted-foreground">650+ providers</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/in.svg"
                alt="India"
                width={60}
                height={45}
                className="mb-2 h-10 w-auto shadow-sm"
              />
              <p className="text-sm font-medium text-primary">India</p>
              <p className="text-xs text-muted-foreground">1100+ providers</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/br.svg"
                alt="Brazil"
                width={60}
                height={45}
                className="mb-2 h-10 w-auto shadow-sm"
              />
              <p className="text-sm font-medium text-primary">Brazil</p>
              <p className="text-xs text-muted-foreground">580+ providers</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/id.svg"
                alt="Indonesia"
                width={60}
                height={45}
                className="mb-2 h-10 w-auto shadow-sm"
              />
              <p className="text-sm font-medium text-primary">Indonesia</p>
              <p className="text-xs text-muted-foreground">490+ providers</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ng.svg"
                alt="Nigeria"
                width={60}
                height={45}
                className="mb-2 h-10 w-auto shadow-sm"
              />
              <p className="text-sm font-medium text-primary">Nigeria</p>
              <p className="text-xs text-muted-foreground">420+ providers</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              And many more countries worldwide. We're constantly expanding to new regions!
            </p>
            <Button
              asChild
              className="bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90"
            >
              <Link href="https://t.me/GetSMSNow" target="_blank" rel="noopener noreferrer">
                Contact Us via Telegram
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Faq />
    </>
  );
}
