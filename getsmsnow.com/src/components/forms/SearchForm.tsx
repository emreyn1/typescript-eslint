"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import countries, { Country } from "@/data/countries";
import services, { Service } from "@/data/services";
import periods, { Period } from "@/data/periods";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  variant?: "home" | "inner";
}

export default function SearchForm({ variant = "home" }: SearchFormProps) {
  const { data: session } = useSession();
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [pricePerSms, setPricePerSms] = useState<number | null>(null);
  const price = useMemo(() => {
    if (pricePerSms == null || !selectedPeriod) return null;
    const period = periods.find(p => p.id === selectedPeriod);
    return period ? Number((pricePerSms * period.priceMultiplier).toFixed(2)) : null;
  }, [pricePerSms, selectedPeriod]);

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    if (!countrySearchTerm) {
      return countries;
    }
    return countries.filter(country =>
      country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
    );
  }, [countrySearchTerm]);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!serviceSearchTerm) {
      return services;
    }
    return services.filter(service =>
      service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    );
  }, [serviceSearchTerm]);

  // Group countries for the dropdown
  const groupedCountries = useMemo(() => {
    const popular = filteredCountries.filter(country => country.popular);
    const other = filteredCountries.filter(country => !country.popular);
    return { popular, other };
  }, [filteredCountries]);

  // Group services for the dropdown
  const groupedServices = useMemo(() => {
    const popular = filteredServices.filter(service => service.popular);
    const other = filteredServices.filter(service => !service.popular);
    return { popular, other };
  }, [filteredServices]);

  // Fetch our selling price per SMS (API cost × 1.7) when country + service selected
  useEffect(() => {
    if (!selectedCountry || !selectedService) {
      setPricePerSms(null);
      return;
    }
    const params = new URLSearchParams({ countryId: selectedCountry, serviceId: selectedService });
    fetch(`/api/sms/price?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Price unavailable"))))
      .then((data: { price?: number }) => {
        const perSms = typeof data?.price === "number" ? data.price : undefined;
        if (perSms != null) {
          setPricePerSms(perSms);
          return;
        }
        const service = services.find(s => s.id === selectedService);
        setPricePerSms(service ? service.price : null);
      })
      .catch(() => {
        const service = services.find(s => s.id === selectedService);
        setPricePerSms(service ? service.price : null);
      });
  }, [selectedCountry, selectedService]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="md:col-span-1">
          <div className="flex flex-col">
            <label
              htmlFor="country"
              className="text-xs uppercase font-medium mb-2 text-muted-foreground"
            >
              Country
            </label>
            <Select
              value={selectedCountry}
              onValueChange={setSelectedCountry}
            >
              <SelectTrigger
                id="country"
                className="w-full bg-background"
              >
                <SelectValue placeholder="Select from the list" />
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
              </SelectTrigger>
              <SelectContent>
                <div className="py-2 px-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search countries..."
                      className="pl-8"
                      value={countrySearchTerm}
                      onChange={(e) => setCountrySearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                {groupedCountries.popular.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Popular</SelectLabel>
                    {groupedCountries.popular.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        <div className="flex items-center">
                          <Image
                            src={country.flag}
                            alt={country.name}
                            width={16}
                            height={12}
                            className="mr-2 h-3 w-4 object-cover"
                          />
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {groupedCountries.other.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Other</SelectLabel>
                    {groupedCountries.other.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        <div className="flex items-center">
                          <Image
                            src={country.flag}
                            alt={country.name}
                            width={16}
                            height={12}
                            className="mr-2 h-3 w-4 object-cover"
                          />
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>

            <div className="text-xs mt-2 text-muted-foreground hidden md:block">
              <p>
                Select a country from our list of <strong>120+ countries</strong>, or search to find yours.
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="flex flex-col">
            <label
              htmlFor="service"
              className="text-xs uppercase font-medium mb-2 text-muted-foreground"
            >
              Service
            </label>
            <Select
              value={selectedService}
              onValueChange={setSelectedService}
            >
              <SelectTrigger
                id="service"
                className="w-full bg-background"
              >
                <SelectValue placeholder="Select from the list" />
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
              </SelectTrigger>
              <SelectContent>
                <div className="py-2 px-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search services..."
                      className="pl-8"
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                {groupedServices.popular.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Popular</SelectLabel>
                    {groupedServices.popular.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center">
                          <Image
                            src={service.icon}
                            alt={service.name}
                            width={16}
                            height={16}
                            className="mr-2 h-4 w-4"
                          />
                          <span>{service.name}</span>
                          <span className="ml-auto text-muted-foreground">${service.price.toFixed(2)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {groupedServices.other.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Other</SelectLabel>
                    {groupedServices.other.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center">
                          <Image
                            src={service.icon}
                            alt={service.name}
                            width={16}
                            height={16}
                            className="mr-2 h-4 w-4"
                          />
                          <span>{service.name}</span>
                          <span className="ml-auto text-muted-foreground">${service.price.toFixed(2)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>

            <div className="text-xs mt-2 text-muted-foreground hidden md:block">
              <p>
                Select the service you'd like to activate and receive SMS from
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="flex flex-col">
            <label
              htmlFor="period"
              className="text-xs uppercase font-medium mb-2 text-muted-foreground"
            >
              Period
            </label>
            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger
                id="period"
                className="w-full bg-background"
              >
                <SelectValue placeholder="Select from the list" />
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Activation</SelectLabel>
                  {periods.filter(p => p.isActivation).map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      <div className="flex items-center">
                        <span>{period.name}</span>
                        <span className="ml-auto text-muted-foreground">x{period.priceMultiplier}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Rent</SelectLabel>
                  {periods.filter(p => !p.isActivation).map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      <div className="flex items-center">
                        <span>{period.name}</span>
                        <span className="ml-auto text-muted-foreground">x{period.priceMultiplier}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="text-xs mt-2 text-muted-foreground hidden md:block">
              <p>
                Choose how long you need the number: 10 minutes for activations, or more than 10 minutes for full number rental.
              </p>
            </div>
          </div>
        </div>

        <div className={`flex items-end ${variant === "home" ? "md:col-span-3 lg:col-span-1" : ""}`}>
          <Button
            size="lg"
            className={`w-full ${selectedCountry && selectedService && selectedPeriod ? "bg-GetSMSNow-red hover:bg-GetSMSNow-red/90" : "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"}`}
            asChild={!!(selectedCountry && selectedService && selectedPeriod)}
            disabled={!(selectedCountry && selectedService && selectedPeriod)}
          >
            {selectedCountry && selectedService && selectedPeriod ? (
              session ? (
                <Link href={`/sms-activations/order?country=${selectedCountry}&service=${selectedService}&period=${selectedPeriod ?? ""}`}>
                  GET NUMBER {price !== null && <span className="ml-1">(${price})</span>}
                </Link>
              ) : (
                <Link href={`/guest/checkout?country=${selectedCountry}&service=${selectedService}`}>
                  GET NUMBER {price !== null && <span className="ml-1">(${price})</span>}
                </Link>
              )
            ) : (
              <span>GET NUMBER</span>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 text-sm text-muted-foreground">
          <span>Need help or have any questions?</span>
          <Link
            href="/faq"
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Check out our FAQ
          </Link>
        </div>
        <div className="mt-1 text-sm">
          {session ? null : (
            <span className="text-muted-foreground mr-1">No account? You can pay once and get your number (guest checkout).</span>
          )}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors mr-1"
          >
            Log in
          </Link>
          or
          <Link
            href="/registration"
            className="text-primary hover:text-primary/80 transition-colors ml-1"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
