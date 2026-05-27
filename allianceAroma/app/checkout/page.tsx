import type { Metadata } from "next"
import { CheckoutContent } from "@/components/checkout/checkout-content"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order securely.",
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
      <h1 className="mb-10 text-center font-serif text-3xl md:text-4xl">Checkout</h1>
      <CheckoutContent />
    </div>
  )
}
