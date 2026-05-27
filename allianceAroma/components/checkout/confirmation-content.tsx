"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context/cart-context"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

type Status = "loading" | "paid" | "failed"

export function ConfirmationContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [status, setStatus] = useState<Status>("loading")

  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed")
      return
    }

    let cancelled = false

    async function verify() {
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`)
        if (cancelled) return
        if (res.ok) {
          const data = await res.json()
          if (data.paid) {
            setStatus("paid")
            clearCart()
          } else {
            setStatus("failed")
          }
        } else {
          setStatus("failed")
        }
      } catch {
        if (!cancelled) setStatus("failed")
      }
    }

    verify()
    return () => { cancelled = true }
  }, [sessionId, clearCart])

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center py-20">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Verifying your payment...</p>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center">
        <XCircle className="mb-6 h-16 w-16 text-red-500" />
        <h2 className="font-serif text-3xl">Payment Not Verified</h2>
        <p className="mt-4 text-muted-foreground">
          We could not verify your payment. If you believe this is an error, please contact support.
        </p>
        <Button asChild className="mt-6">
          <Link href="/collection">Browse Collection</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <CheckCircle2 className="mb-6 h-16 w-16 text-green-600" />
      <h2 className="font-serif text-3xl">Order Confirmed</h2>
      <p className="mt-4 text-muted-foreground">
        Thank you for your purchase! You will receive a confirmation email shortly.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild variant="outline">
          <Link href="/collection">Continue Shopping</Link>
        </Button>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/affiliate">View Affiliate Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
