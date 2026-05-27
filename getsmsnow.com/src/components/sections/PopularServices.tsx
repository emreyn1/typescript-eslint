"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import services from "@/data/services";

const popularCombos = [
  { country: "us", countryName: "United States", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/us.svg" },
  { country: "uk", countryName: "United Kingdom", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gb.svg" },
  { country: "de", countryName: "Germany", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/de.svg" },
  { country: "in", countryName: "India", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/in.svg" },
];

const topServices = services.filter((s) => s.popular).slice(0, 6);

export default function PopularServices() {
  const { data: session } = useSession();

  return (
    <section className="py-16 md:py-24">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary">
            Popular Services & Prices
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Real-time prices for the most requested SMS verifications. Pay only when you receive the code.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularCombos.slice(0, 3).flatMap((combo) =>
            topServices.slice(0, 2).map((svc) => {
              const href = session
                ? `/sms-activations/order?country=${combo.country}&service=${svc.id}&period=10min`
                : `/guest/checkout?country=${combo.country}&service=${svc.id}`;
              return (
                <Link
                  key={`${combo.country}-${svc.id}`}
                  href={href}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:shadow-md hover:border-GetSMSNow-blue/40 transition-all group"
                >
                  <Image
                    src={combo.flag}
                    alt={combo.countryName}
                    width={32}
                    height={24}
                    className="h-6 w-8 object-cover rounded"
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <Image
                      src={svc.icon}
                      alt={svc.name}
                      width={20}
                      height={20}
                      className="h-5 w-5 flex-shrink-0"
                    />
                    <span className="text-sm font-medium truncate">{svc.name}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">
                      ${svc.price.toFixed(2)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-GetSMSNow-blue/10 text-GetSMSNow-blue group-hover:bg-GetSMSNow-blue group-hover:text-white transition-colors">
                      Order
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/sms-activations"
            className="text-sm font-medium text-GetSMSNow-blue hover:text-GetSMSNow-blue/80 transition-colors"
          >
            View all 500+ services →
          </Link>
        </div>
      </div>
    </section>
  );
}
