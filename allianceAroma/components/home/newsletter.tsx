"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setIsSubmitting(true)
    try {
      toast.success("Welcome to the Alliance Aroma circle. We'll be in touch.")
      setEmail("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-lg text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">Stay Connected</p>
        <h2 className="font-serif text-3xl md:text-4xl text-balance">Join the Alliance Aroma Circle</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Be the first to discover new fragrances, receive exclusive offers, and gain access to members-only
          events.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border-border bg-card text-foreground placeholder:text-muted-foreground"
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 tracking-wider"
          >
            Subscribe
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          By subscribing, you agree to our{" "}
          <Link href="/privacy-policy" className="underline hover:text-foreground">
            privacy policy
          </Link>
          . Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
