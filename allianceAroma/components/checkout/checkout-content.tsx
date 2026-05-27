"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/context/cart-context"
import { useAffiliate } from "@/lib/context/affiliate-context"
import { useAuth } from "@/lib/context/auth-context"
import { ShoppingBag, Lock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"

export function CheckoutContent() {
  const { items, subtotal, shipping, tax, total, itemCount } = useCart()
  const { referralCode, referrerName } = useAffiliate()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="font-serif text-2xl">Nothing to check out</p>
        <p className="mt-2 text-sm text-muted-foreground">Add some items to your bag first.</p>
        <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/collection">Browse Collection</Link>
        </Button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="font-serif text-2xl">Sign in to continue</p>
        <p className="mt-2 text-sm text-muted-foreground">You need to be logged in to place an order.</p>
        <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  async function handleCheckout() {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            size: item.selectedSize,
            quantity: item.quantity,
          })),
          referralCode: referralCode || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed")
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Checkout URL not available")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong"
      toast.error(message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="flex flex-col gap-6">
          <section className="rounded-sm border border-border bg-card p-6">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-widest">Order Items</h2>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-transparent">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(135deg, ${item.product.imageGradient[0]}, ${item.product.imageGradient[1]})`,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex flex-1 items-start justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.selectedSize}ml &middot; Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.priceAtSelection * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-sm border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You will be redirected to Stripe&apos;s secure payment page to complete your purchase.
              </p>
            </div>
          </section>

          <Button
            onClick={handleCheckout}
            size="lg"
            disabled={isSubmitting}
            className="bg-accent text-accent-foreground hover:bg-accent/90 tracking-wider disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to payment...
              </>
            ) : (
              `Proceed to Payment — ${formatPrice(total)}`
            )}
          </Button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24 rounded-sm border border-border bg-card p-6">
          <h2 className="font-serif text-lg">Order Summary</h2>
          <Separator className="my-4 bg-border" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({itemCount})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT (5%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
          </div>

          <Separator className="my-4 bg-border" />

          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span className="font-serif text-lg">{formatPrice(total)}</span>
          </div>

          {referralCode && referrerName && (
            <div className="mt-4 rounded-sm bg-accent/10 p-3 text-center text-xs">
              <span className="text-muted-foreground">Referred by </span>
              <span className="font-medium text-accent">{referrerName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
