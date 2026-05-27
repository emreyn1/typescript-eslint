"use client"

import { useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { products, categories, scentFamilies } from "@/lib/data/products"
import { ProductCard } from "@/components/layout/product-card"
import { CollectionFilters } from "@/components/collection/collection-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, X } from "lucide-react"

type SortOption = "featured" | "price-asc" | "price-desc" | "rating"

export function CollectionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const activeCategories = searchParams.getAll("category")
  const activeScentFamilies = searchParams.getAll("scentFamily")
  const sort = (searchParams.get("sort") as SortOption) || "featured"
  const searchQuery = searchParams.get("q") || ""

  function updateParams(key: string, values: string[]) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    values.forEach((v) => params.append(key, v))
    router.push(`/collection?${params.toString()}`, { scroll: false })
  }

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "featured") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    router.push(`/collection?${params.toString()}`, { scroll: false })
  }

  function clearAllFilters() {
    router.push("/collection", { scroll: false })
  }

  function setSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("q", value)
    } else {
      params.delete("q")
    }
    router.push(`/collection?${params.toString()}`, { scroll: false })
  }

  function removeFilter(key: string, value: string) {
    const current = key === "category" ? activeCategories : activeScentFamilies
    updateParams(
      key,
      current.filter((v) => v !== value)
    )
  }

  const filtered = useMemo(() => {
    let result = [...products]

    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (activeCategories.length > 0) {
      result = result.filter((p) => activeCategories.includes(p.category))
    }
    if (activeScentFamilies.length > 0) {
      result = result.filter((p) => activeScentFamilies.includes(p.scentFamily))
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return result
  }, [activeCategories, activeScentFamilies, sort, searchQuery])

  const hasFilters = activeCategories.length > 0 || activeScentFamilies.length > 0 || searchQuery.length > 0
  const allActiveFilters = [
    ...activeCategories.map((v) => ({ key: "category", value: v })),
    ...activeScentFamilies.map((v) => ({ key: "scentFamily", value: v })),
  ]

  const filterProps = {
    categories: [...categories] as string[],
    scentFamilies: [...scentFamilies] as string[],
    activeCategories,
    activeScentFamilies,
    onCategoryChange: (values: string[]) => updateParams("category", values),
    onScentFamilyChange: (values: string[]) => updateParams("scentFamily", values),
  }

  return (
    <div className="flex gap-8">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <CollectionFilters {...filterProps} />
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search fragrances..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card pl-10 pr-10 text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile filter trigger */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-background p-6">
                <SheetTitle className="text-sm uppercase tracking-widest">Filters</SheetTitle>
                <div className="mt-6">
                  <CollectionFilters {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>
            <p className="text-sm text-muted-foreground">
              {filtered.length} fragrance{filtered.length !== 1 && "s"}
            </p>
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44 bg-card text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground">
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {allActiveFilters.map((f) => (
              <Badge
                key={`${f.key}-${f.value}`}
                variant="secondary"
                className="gap-1 bg-secondary text-secondary-foreground"
              >
                {f.value}
                <button onClick={() => removeFilter(f.key, f.value)} aria-label={`Remove ${f.value} filter`}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Product grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-serif text-xl">No fragrances found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters to discover more scents.
            </p>
            <Button variant="outline" onClick={clearAllFilters} className="mt-4">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
