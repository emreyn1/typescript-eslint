"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-serif text-3xl">Something went wrong</h1>
            <p className="mt-4 text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
