import type { Metadata } from "next"
import { PackagesContent } from "@/components/packages/packages-content"

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Choose your Alliance Aroma starter package. Bronze, Gold, or Diamond — unlock premium fragrances at exclusive discounts and earn commissions across 10 levels.",
}

export default function PackagesPage() {
  return <PackagesContent />
}
