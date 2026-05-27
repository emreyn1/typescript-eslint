"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MousePointerClick, ShoppingCart, DollarSign, TrendingUp, Copy, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { AffiliateChart } from "@/components/affiliate/affiliate-chart"
import { NetworkTree } from "@/components/affiliate/network-tree"
import { formatPrice } from "@/lib/utils"
import { COMMISSION_RATES } from "@/lib/config/commissions"
import { getCurrentRank, getNextRank, RANKINGS } from "@/lib/config/rankings"
import { Progress } from "@/components/ui/progress"
import { Award, ChevronRight } from "lucide-react"

interface CommissionRow {
  id: string
  level: number
  amount: number
  order_total: number
  status: string
  created_at: string
}

interface AffiliateStats {
  totalEarnings: number
  pendingEarnings: number
  totalConversions: number
  totalClicks: number
  monthlyEarnings: { month: string; earnings: number }[]
  recentCommissions: CommissionRow[]
  allCommissions: CommissionRow[]
}

type PaymentFilter = "all" | "pending" | "processing" | "paid" | "cancelled"

export function AffiliateDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all")
  /** Fallback when auth context has not yet loaded referral_code from profiles */
  const [profileReferralCode, setProfileReferralCode] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) router.push("/login")
    else if (!user.isAffiliate) router.push("/account")
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user?.isAffiliate || !user.id) return

    let cancelled = false

    async function fetchData() {
      try {
        const supabase = createClient()

        const timeout = <T,>(p: PromiseLike<T>, ms = 8000): Promise<T> =>
          Promise.race([
            Promise.resolve(p),
            new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
          ])

        const [commissionsRes, clicksRes] = await Promise.all([
          timeout(
            supabase
              .from("commissions")
              .select("id, level, amount, order_total, status, created_at")
              .eq("affiliate_id", user!.id)
              .order("created_at", { ascending: false })
          ),
          timeout(
            supabase
              .from("referral_clicks")
              .select("id", { count: "exact", head: true })
              .eq("affiliate_id", user!.id)
          ),
        ])

        if (cancelled) return

        const commissions: CommissionRow[] = commissionsRes.data ?? []
        const totalClicks = clicksRes.count ?? 0

        const totalEarnings = commissions.reduce((sum, c) => sum + Number(c.amount), 0)
        const pendingEarnings = commissions
          .filter((c) => c.status !== "paid" && c.status !== "cancelled")
          .reduce((sum, c) => sum + Number(c.amount), 0)
        const totalConversions = commissions.filter((c) => c.status !== "cancelled").length

        const monthMap = new Map<string, number>()
        for (const c of commissions) {
          if (c.status === "cancelled") continue
          const d = new Date(c.created_at)
          const key = `${d.toLocaleString("en", { month: "short" })} ${d.getFullYear()}`
          monthMap.set(key, (monthMap.get(key) ?? 0) + Number(c.amount))
        }
        const monthlyEarnings = Array.from(monthMap.entries())
          .map(([month, earnings]) => ({ month, earnings }))
          .reverse()
          .slice(-6)

        setStats({
          totalEarnings,
          pendingEarnings,
          totalConversions,
          totalClicks,
          monthlyEarnings,
          recentCommissions: commissions.slice(0, 10),
          allCommissions: commissions,
        })
      } catch (err) {
        console.error("Failed to load affiliate data:", err)
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (!user?.id || user.referralCode) {
      setProfileReferralCode(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single()
      if (!cancelled && data?.referral_code) {
        setProfileReferralCode(data.referral_code)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id, user?.referralCode])

  if (authLoading || dataLoading || !user?.isAffiliate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const effectiveReferralCode =
    (user.referralCode && String(user.referralCode).trim() !== "" ? user.referralCode : null) ??
    (profileReferralCode && profileReferralCode.trim() !== "" ? profileReferralCode : null)

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const referralUrl = effectiveReferralCode
    ? `${origin}?ref=${encodeURIComponent(effectiveReferralCode)}`
    : origin

  const conversionRate = stats && stats.totalClicks > 0
    ? ((stats.totalConversions / stats.totalClicks) * 100).toFixed(1)
    : "0.0"

  async function copyLink() {
    if (!effectiveReferralCode) {
      toast.error("Referral code is not ready yet. Refresh the page in a moment.")
      return
    }
    try {
      await navigator.clipboard.writeText(referralUrl)
      toast.success("Referral link copied to clipboard")
    } catch {
      toast.error("Could not copy. Please select and copy the link manually.")
    }
  }

  const statsCards = [
    {
      title: "Total Clicks",
      value: (stats?.totalClicks ?? 0).toLocaleString(),
      icon: MousePointerClick,
    },
    {
      title: "Conversions",
      value: (stats?.totalConversions ?? 0).toLocaleString(),
      icon: ShoppingCart,
    },
    {
      title: "Total Earnings",
      value: formatPrice(stats?.totalEarnings ?? 0),
      icon: DollarSign,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Affiliate Dashboard</p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl">
          Welcome, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track your referrals, commissions, and earnings in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-serif text-2xl text-card-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ranking Section */}
      {(() => {
        const totalSales = stats?.totalEarnings ?? 0
        const currentRank = getCurrentRank(totalSales)
        const nextRank = getNextRank(totalSales)
        const progressPercent = nextRank
          ? Math.min((totalSales / nextRank.requiredSales) * 100, 100)
          : 100
        const remaining = nextRank ? nextRank.requiredSales - totalSales : 0

        return (
          <Card className="mt-8 border-border bg-card">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Award className="h-5 w-5 text-accent" />
              <CardTitle className="font-serif text-lg text-card-foreground">
                Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                {/* Current rank + progress */}
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Current Rank
                    </p>
                    <p className="mt-1 font-serif text-2xl text-card-foreground">
                      {currentRank ? currentRank.name : "No Rank Yet"}
                    </p>
                  </div>

                  {nextRank && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatPrice(totalSales)} / {formatPrice(nextRank.requiredSales)}
                        </span>
                        <span className="flex items-center gap-1">
                          Next: <span className="font-medium text-foreground">{nextRank.name}</span>
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(remaining)} more in network sales to reach{" "}
                        <span className="font-medium text-foreground">{nextRank.name}</span>
                        {nextRank.reward > 0 && (
                          <span className="text-accent"> — {formatPrice(nextRank.reward)} reward</span>
                        )}
                      </p>
                    </div>
                  )}

                  {!nextRank && currentRank && (
                    <p className="text-sm text-accent font-medium">
                      You've reached the highest rank!
                    </p>
                  )}
                </div>

                {/* All ranks checklist */}
                <div className="min-w-[220px]">
                  <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    All Ranks
                  </p>
                  <ul className="space-y-1.5">
                    {RANKINGS.map((rank) => {
                      const achieved = totalSales >= rank.requiredSales
                      return (
                        <li
                          key={rank.id}
                          className={`flex items-center gap-2 text-sm ${
                            achieved ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {achieved ? (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-accent">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border" />
                          )}
                          <span className={achieved ? "font-medium" : ""}>
                            {rank.name}
                          </span>
                          <span className="ml-auto text-xs">
                            {formatPrice(rank.reward)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      <Card className="mt-8 border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-card-foreground">Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Share this link with your audience. You earn a {COMMISSION_RATES[0] * 100}% direct commission on every sale.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-sm border border-border bg-muted px-4 py-2.5">
              <p className="truncate text-sm font-mono text-foreground">{referralUrl}</p>
            </div>
            <Button
              onClick={copyLink}
              variant="outline"
              size="icon"
              className="shrink-0"
              disabled={!effectiveReferralCode}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy link</span>
            </Button>
            {effectiveReferralCode ? (
              <Button asChild variant="outline" size="icon" className="shrink-0">
                <a href={referralUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Open link</span>
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="shrink-0" disabled aria-label="Open link">
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Referral code:{" "}
            <span className="font-medium text-accent">{effectiveReferralCode ?? "—"}</span> — 30-day attribution
            window (stored in browser)
          </p>
          {!effectiveReferralCode && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
              Loading your referral code… If this persists, refresh the page or contact support.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <Card className="border-border bg-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-card-foreground">Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <AffiliateChart data={stats?.monthlyEarnings ?? []} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-card-foreground">Payout Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direct Commission</span>
                <span className="font-medium text-foreground">{COMMISSION_RATES[0] * 100}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Levels</span>
                <span className="font-medium text-foreground">{COMMISSION_RATES.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payout Schedule</span>
                <span className="font-medium text-foreground">Monthly</span>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Earnings</span>
                <span className="font-medium text-accent">
                  {formatPrice(stats?.pendingEarnings ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lifetime Earnings</span>
                <span className="font-serif text-lg font-medium text-foreground">
                  {formatPrice(stats?.totalEarnings ?? 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-card-foreground">Recent Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentCommissions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No commissions yet. Share your referral link to start earning!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Level</TableHead>
                  <TableHead className="text-right text-muted-foreground">Order Total</TableHead>
                  <TableHead className="text-right text-muted-foreground">Commission</TableHead>
                  <TableHead className="text-right text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentCommissions.map((c) => (
                  <TableRow key={c.id} className="border-border">
                    <TableCell className="text-sm text-foreground">
                      {new Date(c.created_at).toLocaleDateString("en-AE", { year: "numeric", month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      Level {c.level} ({(COMMISSION_RATES[c.level - 1] ?? 0) * 100}%)
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground">{formatPrice(Number(c.order_total))}</TableCell>
                    <TableCell className="text-right text-sm text-accent font-medium">
                      {formatPrice(Number(c.amount))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={c.status === "paid" ? "default" : "secondary"}
                        className={
                          c.status === "paid"
                            ? "bg-accent/10 text-accent"
                            : c.status === "processing"
                              ? "bg-secondary text-secondary-foreground"
                              : c.status === "cancelled"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                        }
                      >
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="mt-8 border-border bg-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="font-serif text-lg text-card-foreground">Payment History</CardTitle>
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "processing", "paid", "cancelled"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setPaymentFilter(status)}
                  className={`rounded-sm px-3 py-1 text-xs font-medium transition-colors ${
                    paymentFilter === status
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const all = stats?.allCommissions ?? []
            const filtered = paymentFilter === "all" ? all : all.filter((c) => c.status === paymentFilter)
            const totalPending = all.filter((c) => c.status === "pending" || c.status === "processing").reduce((s, c) => s + Number(c.amount), 0)
            const totalPaid = all.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0)

            if (filtered.length === 0) {
              return (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No {paymentFilter === "all" ? "" : paymentFilter + " "}payments found.
                </p>
              )
            }

            return (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Level</TableHead>
                      <TableHead className="text-right text-muted-foreground">Order Total</TableHead>
                      <TableHead className="text-right text-muted-foreground">Commission</TableHead>
                      <TableHead className="text-right text-muted-foreground">Status</TableHead>
                      <TableHead className="text-right text-muted-foreground">Paid Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id} className="border-border">
                        <TableCell className="text-sm text-foreground">
                          {new Date(c.created_at).toLocaleDateString("en-AE", { year: "numeric", month: "short", day: "numeric" })}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          Level {c.level} ({(COMMISSION_RATES[c.level - 1] ?? 0) * 100}%)
                        </TableCell>
                        <TableCell className="text-right text-sm text-foreground">{formatPrice(Number(c.order_total))}</TableCell>
                        <TableCell className="text-right text-sm font-medium text-accent">{formatPrice(Number(c.amount))}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={c.status === "paid" ? "default" : "secondary"}
                            className={
                              c.status === "paid"
                                ? "bg-accent/10 text-accent"
                                : c.status === "processing"
                                  ? "bg-secondary text-secondary-foreground"
                                  : c.status === "cancelled"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-muted text-muted-foreground"
                            }
                          >
                            {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {c.status === "paid"
                            ? new Date(c.created_at).toLocaleDateString("en-AE", { year: "numeric", month: "short", day: "numeric" })
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Separator className="my-4 bg-border" />
                <div className="flex flex-wrap justify-end gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Pending: </span>
                    <span className="font-medium text-foreground">{formatPrice(totalPending)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Paid: </span>
                    <span className="font-medium text-accent">{formatPrice(totalPaid)}</span>
                  </div>
                </div>
              </>
            )
          })()}
        </CardContent>
      </Card>

      {/* My Network */}
      <Card className="mt-8 border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-card-foreground">My Network</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkTree />
        </CardContent>
      </Card>
    </div>
  )
}
