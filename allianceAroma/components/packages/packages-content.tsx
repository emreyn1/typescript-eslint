"use client"

import Link from "next/link"
import { Check, Package, Share2, Banknote, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PACKAGES, type PackageConfig } from "@/lib/config/packages"
import { formatPrice } from "@/lib/utils"

const HIGHLIGHTS: Record<string, boolean> = { diamond: true }

function PackageCard({ pkg, isLoggedIn }: { pkg: PackageConfig; isLoggedIn: boolean }) {
  const highlighted = HIGHLIGHTS[pkg.id]

  return (
    <Card
      className={`relative flex flex-col border-border bg-card ${
        highlighted
          ? "ring-2 ring-accent shadow-lg scale-[1.02] lg:scale-105"
          : ""
      }`}
    >
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 text-[10px] uppercase tracking-widest">
          Most Popular
        </Badge>
      )}

      <CardHeader className="pb-4 pt-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {pkg.id}
        </p>
        <CardTitle className="mt-2 font-serif text-2xl md:text-3xl text-card-foreground">
          {pkg.name}
        </CardTitle>
        <div className="mt-4">
          <span className="font-serif text-4xl text-card-foreground">
            {formatPrice(pkg.price)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {pkg.discount}% discount — worth {formatPrice(pkg.totalProductValue)}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6">
        <Separator className="bg-border" />

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Included Products
          </p>
          <ul className="space-y-2">
            {pkg.products.map((p) => (
              <li key={p.size} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                {p.quantity}× {p.size} bottles
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatPrice(p.unitPrice)} each
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Commission Preview
          </p>
          <div className="grid grid-cols-5 gap-1.5 text-center text-[11px]">
            {pkg.commissions.slice(0, 5).map((c, i) => (
              <div key={i} className="rounded bg-muted px-1 py-1.5">
                <span className="block text-muted-foreground">L{i + 1}</span>
                <span className="font-medium text-foreground">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded bg-muted px-3 py-2 text-sm">
          <span className="text-muted-foreground">Max monthly income</span>
          <span className="font-serif font-medium text-card-foreground">
            {pkg.maxMonthlyIncome.toLocaleString()} AED
          </span>
        </div>

        <div className="mt-auto pt-2">
          <Button
            asChild
            className={`w-full ${
              highlighted
                ? "bg-accent text-accent-foreground hover:bg-accent/90"
                : ""
            }`}
            size="lg"
          >
            <Link href={isLoggedIn ? "/account" : "/register"}>
              {isLoggedIn ? "View Account" : "Get Started"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const STEPS = [
  {
    icon: Package,
    title: "Choose Your Package",
    description:
      "Select the package that fits your goals — Bronze, Gold, or Diamond. Each includes premium fragrances at a steep discount.",
  },
  {
    icon: Share2,
    title: "Share Your Link",
    description:
      "Get your unique referral link and share it with your network. Every sale through your link earns you commissions.",
  },
  {
    icon: Banknote,
    title: "Earn Commissions",
    description:
      "Earn fixed AED commissions across 10 levels of referrals. Build a team and watch your passive income grow.",
  },
]

export function PackagesContent() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
      {/* Hero */}
      <div className="mb-16 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Alliance Aroma
        </p>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-balance">
          Choose Your Package
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Start your fragrance business with premium products at exclusive
          wholesale pricing. Earn commissions across 10 levels when your network
          grows.
        </p>
      </div>

      {/* Package Cards */}
      <div className="grid gap-6 md:grid-cols-3 md:items-start lg:gap-8">
        {PACKAGES.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} isLoggedIn={!!user} />
        ))}
      </div>

      {/* How It Works */}
      <div className="mt-24 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Getting Started
        </p>
        <h2 className="font-serif text-3xl md:text-4xl">How It Works</h2>

        <div className="mx-auto mt-12 grid max-w-4xl gap-10 md:grid-cols-3">
          {STEPS.map((step, idx) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                <step.icon className="h-6 w-6" />
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Step {idx + 1}
              </p>
              <h3 className="mt-3 font-serif text-lg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Commission Comparison Table */}
      <div className="mt-24">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Full Breakdown
            </p>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl">
            Commission Comparison
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
            Fixed AED amounts earned per package sale across all 10 levels of
            your referral network.
          </p>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Level</TableHead>
                    {PACKAGES.map((pkg) => (
                      <TableHead
                        key={pkg.id}
                        className={`text-right ${
                          HIGHLIGHTS[pkg.id]
                            ? "text-accent font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {pkg.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 10 }, (_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell className="text-sm text-foreground font-medium">
                        Level {i + 1}
                      </TableCell>
                      {PACKAGES.map((pkg) => (
                        <TableCell
                          key={pkg.id}
                          className={`text-right text-sm ${
                            HIGHLIGHTS[pkg.id]
                              ? "text-accent font-medium"
                              : "text-foreground"
                          }`}
                        >
                          {formatPrice(pkg.commissions[i])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  <TableRow className="border-border bg-muted/50">
                    <TableCell className="text-sm font-semibold text-foreground">
                      Total per sale
                    </TableCell>
                    {PACKAGES.map((pkg) => {
                      const total = pkg.commissions.reduce((a, b) => a + b, 0)
                      return (
                        <TableCell
                          key={pkg.id}
                          className={`text-right text-sm font-semibold ${
                            HIGHLIGHTS[pkg.id] ? "text-accent" : "text-foreground"
                          }`}
                        >
                          {formatPrice(total)}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="mt-20 text-center">
        <h2 className="font-serif text-2xl md:text-3xl">
          Ready to Start Earning?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Join hundreds of affiliates building their fragrance business with
          Alliance Aroma.
        </p>
        <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href={user ? "/account" : "/register"}>
            {user ? "View Account" : "Get Started Today"}
          </Link>
        </Button>
      </div>
    </div>
  )
}
