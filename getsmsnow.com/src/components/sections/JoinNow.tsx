"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function JoinNow() {
  return (
    <section className="py-16 md:py-24 bg-GetSMSNow-light-blue/30">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">
            Sign up now to start receiving phone messages with our virtual number service
          </h2>

          <div className="mt-6 mb-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <h3 className="text-muted-foreground mb-0">Sign up with:</h3>
            <Button
              size="lg"
              className="bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90"
              asChild
            >
              <Link href="/registration" className="px-6">
                <Mail className="mr-2 h-5 w-5" />
                Email
              </Link>
            </Button>
            <span className="text-muted-foreground text-sm">or</span>
            <Link
              href="/referral-program"
              className="text-sm font-medium text-GetSMSNow-red hover:text-GetSMSNow-red/80"
            >
              Join Referral / Affiliate Program →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
