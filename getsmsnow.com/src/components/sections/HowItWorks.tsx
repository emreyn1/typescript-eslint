"use client";

import { Globe, Wallet, MessageCircle } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Choose a Country and Service",
    description: "Select a country from our list and the service you need a temporary number for.",
  },
  {
    number: 2,
    title: "Register and top up your account",
    description: "Sign up and add credits to your account to start using our services",
  },
  {
    number: 3,
    title: "Rent Number and Receive SMS",
    description: "Get your SMS messages instantly on our platform using the number provided.",
  },
] as const;

const stepIcons = [Globe, Wallet, MessageCircle];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-GetSMSNow-light-blue/30">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">How It Works</h2>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4">
          {steps.map((step, index) => {
            const IconComponent = stepIcons[index];
            return (
            <div
              key={`step-${step.number}`}
              className="flex flex-col items-center text-center md:w-1/3 relative"
            >
              <div className="mb-6 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm relative">
                <IconComponent size={32} className="shrink-0 text-GetSMSNow-red" strokeWidth={2} />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-GetSMSNow-red text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {step.number}
                </div>
              </div>

              <h3 className="text-lg font-medium mb-2 text-primary">
                Step {step.number}
                <span className="block text-base">{step.title}</span>
              </h3>

              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>

              {/* Connector line between steps (visible on desktop only) */}
              {step.number < steps.length && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 border-t-2 border-dashed border-muted" />
              )}
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
}
