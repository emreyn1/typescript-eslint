import type { Metadata } from "next"
import { AddressesContent } from "@/components/account/addresses-content"

export const metadata: Metadata = {
  title: "My Addresses",
  description: "Manage your saved shipping addresses for Alliance Aroma.",
}

export default function AddressesPage() {
  return <AddressesContent />
}
