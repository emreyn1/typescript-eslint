import type { Metadata } from "next"
import { Suspense } from "react"
import { CollectionContent } from "@/components/collection/collection-content"

export const metadata: Metadata = {
  title: "Collection",
  description: "Explore the full AllianceAroma fragrance collection. Filter by category, scent family, and price.",
}

export default function CollectionPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          The Collection
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-balance">Our Fragrances</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Each scent in our collection is a masterful composition of the world&apos;s finest
          ingredients, designed to become your signature.
        </p>
      </div>
      <Suspense fallback={<div className="animate-pulse py-12 text-center text-muted-foreground">Loading collection...</div>}>
        <CollectionContent />
      </Suspense>
    </div>
  )
}
