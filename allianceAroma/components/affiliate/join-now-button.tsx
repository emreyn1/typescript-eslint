"use client"

import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/context/auth-context"

interface JoinNowButtonProps {
  className?: string
}

export function JoinNowButton({ className }: JoinNowButtonProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Button size="lg" disabled className={className ?? "min-w-[180px]"}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  const href = user
    ? user.isAffiliate
      ? "/affiliate"
      : "/packages"
    : "/register"

  const label = user
    ? user.isAffiliate
      ? "Go to Dashboard"
      : "View Packages"
    : "Join Now"

  return (
    <Button asChild size="lg" className={className ?? "min-w-[180px]"}>
      <Link href={href}>
        {label} <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  )
}
