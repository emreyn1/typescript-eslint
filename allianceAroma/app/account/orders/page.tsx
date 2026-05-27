import type { Metadata } from "next"
import { OrdersContent } from "@/components/account/orders-content"

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your Alliance Aroma order history and track shipments.",
}

export default function OrdersPage() {
  return <OrdersContent />
}
