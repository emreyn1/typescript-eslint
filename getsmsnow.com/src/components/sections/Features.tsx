"use client";

import { Globe, CreditCard, Shield, Rocket, Share2, Code } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Feature {
  id: string;
  title: string;
  description: string;
  Icon: typeof Globe;
}

const features: Feature[] = [
  {
    id: "global-reach",
    title: "Global Reach with Over 120 Countries Supported",
    description: "Access temporary phone numbers from a wide range of countries, allowing you to receive SMS online from anywhere in the world.",
    Icon: Globe,
  },
  {
    id: "pay-per-sms",
    title: "Pay Only When You Receive an SMS Code",
    description: "Our cost-effective pricing model ensures you only pay when you successfully receive an SMS, making it an affordable solution for all your verification needs.",
    Icon: CreditCard,
  },
  {
    id: "privacy",
    title: "High Level of Privacy and Anonymity",
    description: "Maintain your privacy with our secure numbers connected to mobile operators, ensuring your personal information is protected.",
    Icon: Shield,
  },
  {
    id: "easy-setup",
    title: "Easy and Quick Setup and Balance Top Up",
    description: "Get started with GetSMSNow in just a few clicks. Choose a country, select a service, top up your balance and start receiving SMS instantly.",
    Icon: Rocket,
  },
  {
    id: "versatile",
    title: "Versatile Use Cases for Social Networks and Online Services",
    description: "Perfect for social media account creation, online service verifications, app testing, and more, providing a flexible solution for various needs.",
    Icon: Share2,
  },
  {
    id: "api-access",
    title: "API Access for Seamless Integration",
    description: "Integrate GetSMSNow activation services into your own applications effortlessly with our comprehensive API, giving you full control and flexibility.",
    Icon: Code,
  },
];

export default function Features() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Features and Benefits</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.id} className="border-border/40 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                    <feature.Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-lg font-medium text-primary">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
