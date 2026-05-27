import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShoppingBag, Users, Trophy, Building2, ArrowRight, Star } from "lucide-react"
import { JoinNowButton } from "@/components/affiliate/join-now-button"

export const metadata: Metadata = {
  title: "Business Opportunity",
  description:
    "Discover 4 ways to earn with Alliance Aroma. Join our affiliate program, build your network, and turn your passion for fragrances into income.",
}

const earningMethods = [
  {
    icon: ShoppingBag,
    title: "Direct Selling",
    subtitle: "20–40% Discount",
    description:
      "Purchase products at exclusive wholesale prices and sell at retail for immediate profit. The more you sell, the deeper your discount — up to 40% off.",
  },
  {
    icon: Users,
    title: "Uni-Level Incentives",
    subtitle: "10-Level Commissions",
    description:
      "Earn commissions on your entire team's sales across 10 levels deep. Build your network once and earn residual income month after month.",
  },
  {
    icon: Trophy,
    title: "Ranking Incentives",
    subtitle: "8 Achievement Ranks",
    description:
      "Unlock escalating rewards as you hit sales milestones — from Achiever to Global Director. Each rank brings bigger bonuses and exclusive perks.",
  },
  {
    icon: Building2,
    title: "Franchising Incentives",
    subtitle: "100,000 AED Stockist",
    description:
      "Qualify for our franchising program and become an official Alliance Aroma stockist. Operate your own point of sale with full brand support.",
  },
]

const packages = [
  { name: "Bronze", price: "500 AED", products: "Starter selection", highlight: false },
  { name: "Gold", price: "1,000 AED", products: "Enhanced selection", highlight: true },
  { name: "Diamond", price: "2,000 AED", products: "Premium full range", highlight: false },
]

const commissionTable = [
  { level: 1, bronze: "10%", gold: "10%", diamond: "10%" },
  { level: 2, bronze: "5%", gold: "5%", diamond: "5%" },
  { level: 3, bronze: "3%", gold: "3%", diamond: "3%" },
  { level: 4, bronze: "—", gold: "2%", diamond: "2%" },
  { level: 5, bronze: "—", gold: "2%", diamond: "2%" },
  { level: 6, bronze: "—", gold: "—", diamond: "1%" },
  { level: 7, bronze: "—", gold: "—", diamond: "1%" },
  { level: 8, bronze: "—", gold: "—", diamond: "1%" },
  { level: 9, bronze: "—", gold: "—", diamond: "1%" },
  { level: 10, bronze: "—", gold: "—", diamond: "1%" },
]

const rankings = [
  { rank: "Achiever", sales: "5,000 AED", reward: "Recognition + Certificate" },
  { rank: "Bronze Leader", sales: "15,000 AED", reward: "500 AED bonus" },
  { rank: "Silver Leader", sales: "30,000 AED", reward: "1,000 AED bonus" },
  { rank: "Gold Leader", sales: "60,000 AED", reward: "2,500 AED bonus + trip" },
  { rank: "Platinum Leader", sales: "120,000 AED", reward: "5,000 AED bonus + luxury gift" },
  { rank: "Diamond Director", sales: "250,000 AED", reward: "10,000 AED bonus + car allowance" },
  { rank: "Executive Director", sales: "500,000 AED", reward: "25,000 AED + profit sharing" },
  { rank: "Global Director", sales: "1,000,000 AED", reward: "50,000 AED + equity partnership" },
]

export default function AffiliateProgramPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center lg:px-8 lg:py-32">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Alliance Aroma Business Opportunity
          </p>
          <h1 className="font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
            Turn Your Network
            <br />
            Into Income
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Alliance Aroma offers a premium business model built around luxury fragrances by Genie
            Collection. Whether you sell directly, build a team, or qualify for our franchise
            program — there are multiple paths to financial freedom.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <JoinNowButton />
            <Button asChild variant="outline" size="lg" className="min-w-[180px]">
              <Link href="/collection">Explore Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4 Ways to Earn */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            The Model
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">4 Ways to Earn</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Our compensation plan rewards you at every level — from your first sale to leading a
            global organization.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {earningMethods.map((method) => (
            <Card key={method.title} className="group border-border bg-card transition-shadow hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-accent/10">
                  <method.icon className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="font-serif text-lg">{method.title}</CardTitle>
                <p className="text-xs font-medium uppercase tracking-widest text-accent">
                  {method.subtitle}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {method.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl bg-border" />

      {/* Packages */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Get Started
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">Choose Your Package</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Select the package that fits your ambitions. Every package includes premium Genie
            Collection fragrances and full business support.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.name}
              className={`relative border-border bg-card text-center transition-shadow hover:shadow-lg ${
                pkg.highlight ? "ring-2 ring-accent" : ""
              }`}
            >
              {pkg.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    <Star className="h-3 w-3" /> Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pt-8">
                <CardTitle className="font-serif text-2xl">{pkg.name}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{pkg.products}</p>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-3xl text-foreground">{pkg.price}</p>
                <p className="mt-1 text-xs text-muted-foreground">one-time investment</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/packages">
              View Package Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl bg-border" />

      {/* Commission Table */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Compensation
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">10-Level Commission Rates</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Earn commissions on your team&apos;s sales across up to 10 levels, depending on your
            package tier.
          </p>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Level</TableHead>
                    <TableHead className="text-center text-muted-foreground">Bronze</TableHead>
                    <TableHead className="text-center text-muted-foreground">Gold</TableHead>
                    <TableHead className="text-center font-medium text-accent">Diamond</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionTable.map((row) => (
                    <TableRow key={row.level} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        Level {row.level}
                      </TableCell>
                      <TableCell className="text-center text-sm text-foreground">
                        {row.bronze}
                      </TableCell>
                      <TableCell className="text-center text-sm text-foreground">
                        {row.gold}
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium text-accent">
                        {row.diamond}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="mx-auto max-w-7xl bg-border" />

      {/* Ranking Rewards */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Recognition
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">Ranking Rewards</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Climb through 8 achievement ranks and unlock increasingly prestigious rewards, bonuses,
            and exclusive opportunities.
          </p>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Rank</TableHead>
                    <TableHead className="text-muted-foreground">Required Team Sales</TableHead>
                    <TableHead className="text-muted-foreground">Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((r, i) => (
                    <TableRow key={r.rank} className="border-border">
                      <TableCell className="text-foreground">
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                          {i + 1}
                        </span>
                        <span className="font-medium">{r.rank}</span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{r.sales}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.reward}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8 lg:py-28">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Ready to Start?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">
            Your Journey Begins Here
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Join thousands of entrepreneurs building their fragrance business with Alliance Aroma.
            Create your account today and choose the package that matches your ambition.
          </p>
          <div className="mt-10">
            <JoinNowButton className="min-w-[200px]" />
          </div>
        </div>
      </section>
    </>
  )
}
