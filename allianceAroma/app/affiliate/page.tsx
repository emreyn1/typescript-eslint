import type { Metadata } from "next"
import { AffiliateDashboard } from "@/components/affiliate/affiliate-dashboard"

export const metadata: Metadata = {
  title: "Affiliate Dashboard",
  description: "Track your referrals, commissions, and earnings.",
}

export default function AffiliatePage() {
  return <AffiliateDashboard />
}
