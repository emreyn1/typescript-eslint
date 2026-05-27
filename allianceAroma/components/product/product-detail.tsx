"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, Minus, Plus, ShoppingBag, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/context/cart-context"
import { toast } from "sonner"
import { getRelatedProducts, mockReviews, type Product } from "@/lib/data/products"
import { ProductCard } from "@/components/layout/product-card"
import { formatPrice } from "@/lib/utils"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const related = getRelatedProducts(product)

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize.ml, selectedSize.price)
    }
    toast.success(`${product.name} (${selectedSize.ml}ml) added to cart`)
    setQuantity(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/collection" className="hover:text-foreground transition-colors">Collection</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Main product area */}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Product image */}
        <div className="overflow-hidden rounded-sm bg-transparent">
          <div className="relative aspect-square">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${product.imageGradient[0]}, ${product.imageGradient[1]})`,
                }}
              >
                <div className="text-center text-white/80">
                  <p className="font-serif text-6xl tracking-wider lg:text-8xl">
                    {product.name.split(" ").map((w) => w[0]).join("")}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.5em]">{product.brand}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.brand}</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{product.tagline}</p>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "fill-muted text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({mockReviews.length} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-2xl">{formatPrice(selectedSize.price)}</span>
            {product.originalPrice && selectedSize.ml === product.sizes[0].ml && (
              <span className="text-base text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <Separator className="my-6 bg-border" />

          {/* Size selector */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest">Size</p>
            <div className="flex gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size.ml}
                  onClick={() => setSelectedSize(size)}
                  className={`flex flex-col items-center rounded-sm border px-6 py-3 text-sm transition-colors ${
                    selectedSize.ml === size.ml
                      ? "border-accent bg-accent/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  <span className="font-medium">{size.ml}ml</span>
                  <span className="mt-0.5 text-xs">{formatPrice(size.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-sm border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(quantity + 1, 10))}
                disabled={quantity >= 10}
                className="p-3 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 tracking-wider"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          {/* Description */}
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Scent info badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              {product.category}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              {product.scentFamily}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="scent" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="scent"
              className="rounded-none border-b-2 border-transparent px-6 pb-3 text-sm data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Scent Profile
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent px-6 pb-3 text-sm data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent px-6 pb-3 text-sm data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Reviews ({mockReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scent" className="mt-8">
            <div className="grid gap-8 md:grid-cols-3">
              <NoteColumn title="Top Notes" subtitle="First impression (0-30 min)" notes={product.topNotes} />
              <NoteColumn title="Heart Notes" subtitle="The character (30 min - 4 hrs)" notes={product.middleNotes} />
              <NoteColumn title="Base Notes" subtitle="The lasting memory (4+ hrs)" notes={product.baseNotes} />
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-8">
            <div className="max-w-2xl">
              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              <Separator className="my-6 bg-border" />
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="text-foreground">{product.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="text-foreground">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scent Family</span>
                  <span className="text-foreground">{product.scentFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Sizes</span>
                  <span className="text-foreground">{product.sizes.map((s) => `${s.ml}ml`).join(", ")}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <div className="max-w-2xl flex flex-col gap-6">
              {mockReviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < review.rating ? "fill-accent text-accent" : "fill-muted text-muted"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.author}</span>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{review.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 text-center font-serif text-2xl md:text-3xl">You May Also Like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NoteColumn({ title, subtitle, notes }: { title: string; subtitle: string; notes: string[] }) {
  return (
    <div className="rounded-sm bg-secondary p-6 text-center">
      <h3 className="font-serif text-lg">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      <Separator className="my-4 bg-border" />
      {notes.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li key={note} className="text-sm text-foreground">
              {note}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm italic text-muted-foreground">Discover on first wear</p>
      )}
    </div>
  )
}
