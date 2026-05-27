import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function getSafeRedirect(next: string | null): string {
  if (!next) return "/"
  try {
    const url = new URL(next, "http://placeholder")
    if (url.protocol !== "http:" && url.protocol !== "https:") return "/"
    return url.pathname + url.search + url.hash
  } catch {
    return "/"
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = getSafeRedirect(searchParams.get("next"))
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  if (error) {
    const message = encodeURIComponent(errorDescription || error)
    return NextResponse.redirect(`${origin}/login?error=${message}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("exchangeCodeForSession failed:", exchangeError.message)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
