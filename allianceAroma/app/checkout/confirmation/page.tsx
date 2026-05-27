import type { Metadata } from "next"
import { Suspense } from "react"
import { ConfirmationContent } from "@/components/checkout/confirmation-content"

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your order has been placed successfully.",
}

export default function ConfirmationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center lg:px-8">
      <Suspense fallback={<div className="animate-pulse text-muted-foreground">Loading...</div>}>
        <ConfirmationContent />
      </Suspense>
    </div>
  )
}
