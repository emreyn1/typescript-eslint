import Hero from "@/components/sections/Hero";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift, Share2, DollarSign, Users, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Referral Program - GetSMSNow",
  description: "Invite friends and earn rewards with the GetSMSNow referral program. Share your link and get commission on every purchase.",
};

export default function ReferralProgramPage() {
  return (
    <>
      <Hero
        title="Referral Program"
        subtitle="Invite Friends, Earn Together"
        variant="inner"
        showSearchForm={false}
      />

      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-muted-foreground text-lg">
              Share GetSMSNow with your friends and earn a commission on every purchase they make. The more you refer, the more you earn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border/40">
              <CardContent className="pt-6">
                <Share2 className="h-10 w-10 text-GetSMSNow-red mb-4" />
                <h3 className="font-semibold text-lg mb-2">1. Share your link</h3>
                <p className="text-muted-foreground text-sm">Get your unique referral link from your account and share it with friends.</p>
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardContent className="pt-6">
                <Users className="h-10 w-10 text-GetSMSNow-red mb-4" />
                <h3 className="font-semibold text-lg mb-2">2. Friends sign up</h3>
                <p className="text-muted-foreground text-sm">When they register and use our service, they become your referrals.</p>
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardContent className="pt-6">
                <DollarSign className="h-10 w-10 text-GetSMSNow-red mb-4" />
                <h3 className="font-semibold text-lg mb-2">3. Earn commission</h3>
                <p className="text-muted-foreground text-sm">You earn a percentage of what your referrals spend on GetSMSNow.</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Log in to your account to get your referral link and start earning.
            </p>
            <Button asChild className="bg-GetSMSNow-red hover:bg-GetSMSNow-red/90">
              <Link href="/login" className="inline-flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Get your referral link
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
