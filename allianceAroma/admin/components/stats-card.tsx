import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
}

export function StatsCard({ title, value, description, icon: Icon }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</p>
        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
      )}
    </div>
  )
}
