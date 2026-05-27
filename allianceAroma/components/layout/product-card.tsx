"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context/cart-context"
import { toast } from "sonner"
import type { Product } from "@/lib/data/products"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const defaultSize = product.sizes[0]
    addItem(product, defaultSize.ml, defaultSize.price)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link href={`/collection/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-sm bg-transparent">
        <div className="relative aspect-[3/4] transition-transform duration-500 group-hover:scale-105">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div
              className="flex h-full w-full items-end justify-center p-6"
              style={{
                background: `linear-gradient(135deg, ${product.imageGradient[0]}, ${product.imageGradient[1]})`,
              }}
            >
              <span className="font-serif text-3xl tracking-wider text-white/80 drop-shadow-lg">
                {product.name.split(" ").map((w) => w[0]).join("")}
              </span>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <Button
            onClick={handleAddToCart}
            className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>

        {product.originalPrice && (
          <span className="absolute left-3 top-3 bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
            Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{product.brand}</p>
        <h3 className="font-serif text-lg leading-tight">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.sizes[0].ml}ml</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-medium">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
