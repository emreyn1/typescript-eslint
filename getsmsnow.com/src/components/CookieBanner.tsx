"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "getsmsnow_cookie_consent";

/** Set NEXT_PUBLIC_COOKIE_BANNER_ENABLED=false to hide the banner site-wide. */
function isCookieBannerEnabled(): boolean {
  if (typeof window !== "undefined") {
    const v = (process.env.NEXT_PUBLIC_COOKIE_BANNER_ENABLED ?? "true").toLowerCase();
    return v !== "false" && v !== "0";
  }
  const v = (process.env.NEXT_PUBLIC_COOKIE_BANNER_ENABLED ?? "true").toLowerCase();
  return v !== "false" && v !== "0";
}

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const enabled = isCookieBannerEnabled();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setAccepted(stored === "true");
    } catch {
      setAccepted(false);
    }
  }, [mounted]);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setAccepted(true);
  };

  if (!enabled || !mounted || accepted) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 shadow-lg"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="container-custom max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-medium text-foreground">
            We use cookies to make your experience on our site secure and convenient.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            These data are not shared with third parties and are used solely to improve the site&apos;s functionality.{" "}
            <Link href="/privacy-policy" className="text-GetSMSNow-blue hover:underline">
              Learn more in our Privacy Policy
            </Link>
            .
          </p>
        </div>
        <Button
          onClick={handleAccept}
          className="shrink-0 bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90"
        >
          Accept all cookies
        </Button>
      </div>
    </div>
  );
}
