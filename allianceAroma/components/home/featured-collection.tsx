"use client"

import { getFeaturedProducts } from "@/lib/data/products"
import { ProductCard } from "@/components/layout/product-card"
import Link from "next/link"

export function FeaturedCollection() {
  const featured = getFeaturedProducts()

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">Curated Selection</p>
        <h2 className="font-serif text-3xl md:text-4xl text-balance">Featured Fragrances</h2>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
        >
          View all fragrances
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </section>
  )
}
