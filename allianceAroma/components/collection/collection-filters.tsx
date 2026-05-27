"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface CollectionFiltersProps {
  categories: string[]
  scentFamilies: string[]
  activeCategories: string[]
  activeScentFamilies: string[]
  onCategoryChange: (values: string[]) => void
  onScentFamilyChange: (values: string[]) => void
}

export function CollectionFilters({
  categories,
  scentFamilies,
  activeCategories,
  activeScentFamilies,
  onCategoryChange,
  onScentFamilyChange,
}: CollectionFiltersProps) {
  function toggleFilter(current: string[], value: string, onChange: (v: string[]) => void) {
    if (current.includes(value)) {
      onChange(current.filter((v) => v !== value))
    } else {
      onChange([...current, value])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Category */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-widest">Category</h3>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={activeCategories.includes(cat)}
                onCheckedChange={() => toggleFilter(activeCategories, cat, onCategoryChange)}
              />
              <span className="text-foreground">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Scent Family */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-widest">Scent Family</h3>
        <div className="flex flex-col gap-3">
          {scentFamilies.map((family) => (
            <label key={family} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={activeScentFamilies.includes(family)}
                onCheckedChange={() => toggleFilter(activeScentFamilies, family, onScentFamilyChange)}
              />
              <span className="text-foreground">{family}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
