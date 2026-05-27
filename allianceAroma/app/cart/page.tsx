import type { Metadata } from "next"
import { CartContent } from "@/components/cart/cart-content"

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your shopping bag and proceed to checkout.",
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
      <h1 className="mb-10 text-center font-serif text-3xl md:text-4xl">Shopping Bag</h1>
      <CartContent />
    </div>
  )
}
