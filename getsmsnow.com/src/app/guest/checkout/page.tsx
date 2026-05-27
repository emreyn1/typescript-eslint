"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import countries from "@/data/countries";
import services from "@/data/services";
import Turnstile from "react-turnstile";
import { Wallet } from "lucide-react";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function GuestCheckoutContent() {
  const searchParams = useSearchParams();
  const countryId = searchParams.get("country") ?? "";
  const serviceId = searchParams.get("service") ?? "";

  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const country = countries.find((c) => c.id === countryId);
  const service = services.find((s) => s.id === serviceId);

  useEffect(() => {
    if (!countryId || !serviceId) return;
    const params = new URLSearchParams({ countryId, serviceId });
    fetch(`/api/sms/price?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Price unavailable"))))
      .then((data: { price?: number }) => {
        setPrice(typeof data?.price === "number" ? data.price : null);
      })
      .catch(() => setPrice(null));
  }, [countryId, serviceId]);

  const handlePay = async () => {
    if (!countryId || !serviceId || price == null || price <= 0) {
      setError("Select country and service first.");
      return;
    }
    if (!acceptTerms || !acceptPrivacy) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the security check.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/guest/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryId,
          serviceId,
          acceptTerms: true,
          acceptPrivacy: true,
          email: email.trim() || undefined,
          paymentMethod: "nowpayments",
          turnstileToken: turnstileToken ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");

      const url = typeof data.url === "string" ? data.url.trim() : "";

      if (url) {
        window.location.href = url;
      } else {
        setError("Payment URL not received.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!countryId || !serviceId) {
    return (
      <div className="header-gradient min-h-screen py-12">
        <div className="container-custom max-w-md mx-auto text-center">
          <p className="text-muted-foreground">Select country and service from the homepage first.</p>
          <Button asChild className="mt-4">
            <Link href="/">Go to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="header-gradient min-h-screen py-12">
      <div className="container-custom max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-2">Checkout as guest</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Pay once and get your number. No registration required.
        </p>

        <div className="rounded-lg border bg-card p-4 mb-4">
          <div className="flex items-center gap-3">
            {country?.flag && (
              <Image src={country.flag} alt={country.name} width={24} height={18} className="object-cover rounded" />
            )}
            <span className="font-medium">{country?.name ?? countryId}</span>
            <span className="text-muted-foreground">·</span>
            <span>{service?.name ?? serviceId}</span>
          </div>
          <p className="mt-2 text-lg font-semibold">
            Amount: ${price != null ? price.toFixed(2) : "—"} USD
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <p className="text-sm font-medium">Payment method</p>
          <div className="flex items-center gap-2 rounded-lg border border-GetSMSNow-blue bg-GetSMSNow-blue/10 px-3 py-2 text-sm text-GetSMSNow-blue w-fit">
            <Wallet className="h-4 w-4" />
            Crypto (BTC, USDT, ETH, LTC + 300 coins)
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 mb-4 text-sm italic text-muted-foreground">
          <p className="mb-3">
            To continue, you must agree to the documents below.
          </p>
          <label className="flex items-start gap-3 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-input accent-GetSMSNow-blue"
            />
            <span>
              I agree with the{" "}
              <Link href="/terms-of-service" className="text-GetSMSNow-blue hover:underline" target="_blank">
                Terms of Service
              </Link>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-input accent-GetSMSNow-blue"
            />
            <span>
              I agree with the{" "}
              <Link href="/privacy-policy" className="text-GetSMSNow-blue hover:underline" target="_blank">
                Privacy and cookie policy
              </Link>
            </span>
          </label>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium block mb-1">Your e-mail (optional)</label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">We'll send your order link here if you provide it.</p>
        </div>

        {turnstileSiteKey && (
          <div className="flex justify-center mb-4">
            <Turnstile
              sitekey={turnstileSiteKey}
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              theme="auto"
            />
          </div>
        )}

        <Button
          onClick={handlePay}
          disabled={loading || price == null || !acceptTerms || !acceptPrivacy}
          className="w-full bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90"
        >
          {loading ? "Processing..." : `Pay $${price != null ? price.toFixed(2) : "—"}`}
        </Button>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-GetSMSNow-blue hover:underline">Log in</Link>
          {" or "}
          <Link href="/registration" className="text-GetSMSNow-blue hover:underline">Register</Link>
          {" for balance and order history."}
        </p>
      </div>
    </div>
  );
}

export default function GuestCheckoutPage() {
  return (
    <Suspense fallback={<div className="header-gradient min-h-screen py-12 flex items-center justify-center">Loading...</div>}>
      <GuestCheckoutContent />
    </Suspense>
  );
}
