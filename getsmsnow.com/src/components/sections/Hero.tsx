"use client";

import Image from "next/image";
import SearchForm from "@/components/forms/SearchForm";

interface HeroProps {
  title: string;
  subtitle: string;
  variant?: "home" | "inner";
  /** Set false on content-only pages (e.g. FAQ, Referral) so country/service form is not shown. */
  showSearchForm?: boolean;
}

export default function Hero({ title, subtitle, variant = "home", showSearchForm = true }: HeroProps) {
  return (
    <section className="header-gradient relative pt-8 pb-16 md:pt-12 md:pb-24 overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-primary max-w-4xl">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
            {subtitle}
          </p>
          {variant === "home" && (
            <p className="mt-3 text-sm text-muted-foreground/90">
              Choose country & service → See price → Get number → Receive SMS
            </p>
          )}
        </div>

        {showSearchForm && (
          <div className="relative z-10 mb-10 lg:mb-16">
            <SearchForm variant={variant} />
          </div>
        )}

        {variant === "home" && (
          <div className="relative mt-16">
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              <div className="flex items-center gap-3">
                <Image
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/tinder.svg"
                  alt="Tinder"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
                <div className="text-sm">
                  <span className="font-medium">Tinder</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Image
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/whatsapp.svg"
                  alt="WhatsApp"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
                <div className="text-sm">
                  <span className="font-medium">WhatsApp</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Image
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/telegram.svg"
                  alt="Telegram"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
                <div className="text-sm">
                  <span className="font-medium">Telegram</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 -top-10 w-full h-full opacity-40 curved-line" />
        <div className="absolute left-0 top-40 -bottom-10 w-full h-full opacity-30 curved-line" />
      </div>
    </section>
  );
}
