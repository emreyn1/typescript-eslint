"use client"

import Script from "next/script"

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js"

export function TurnstileWidget({
  theme = "light",
  size = "normal",
}: {
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "compact"
} = {}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!siteKey) return null

  return (
    <>
      <Script src={TURNSTILE_SCRIPT} strategy="lazyOnload" />
      <div
        className="cf-turnstile [&_iframe]:min-h-[65px]"
        data-sitekey={siteKey}
        data-theme={theme}
        data-size={size}
      />
    </>
  )
}

export function getTurnstileToken(): string | null {
  if (typeof document === "undefined") return null
  const el = document.querySelector<HTMLTextAreaElement>('[name="cf-turnstile-response"]')
  return el?.value || null
}
