"use client"

import Link from "next/link"
import { Minus, Plus, X, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/context/cart-context"
import { useAffiliate } from "@/lib/context/affiliate-context"
import { formatPrice } from "@/lib/utils"

export function CartContent() {
  const { items, removeItem, updateQuantity, itemCount, subtotal, shipping, tax, total } = useCart()
  const { referralCode, referrerName } = useAffiliate()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="font-serif text-2xl">Your bag is empty</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover our collection and find your signature scent.
        </p>
        <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/collection">Browse Collection</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      {/* Cart items */}
      <div className="lg:col-span-2">
        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.selectedSize}`}
              className="flex gap-4 border-b border-border pb-6 last:border-0"
            >
              <div className="h-28 w-20 shrink-0 overflow-hidden rounded-sm bg-transparent">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-contain p-2"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${item.product.imageGradient[0]}, ${item.product.imageGradient[1]})`,
                    }}
                  >
                    <span className="font-serif text-lg text-white/80">
                      {item.product.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {item.product.brand}
                    </p>
                    <Link
                      href={`/collection/${item.product.slug}`}
                      className="font-serif text-base hover:text-accent transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.selectedSize}ml</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.selectedSize)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-sm border border-border">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, Math.min(item.quantity + 1, 10))}
                      disabled={item.quantity >= 10}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.priceAtSelection * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div>
        <div className="rounded-sm border border-border bg-card p-6">
          <h2 className="font-serif text-lg">Order Summary</h2>
          <Separator className="my-4 bg-border" />
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
              <span className="text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT (5%)</span>
              <span className="text-foreground">{formatPrice(tax)}</span>
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

          <Button
            asChild
            className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90 tracking-wider"
            size="lg"
          >
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>

          {shipping > 0 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Free shipping on orders over 200 AED
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
