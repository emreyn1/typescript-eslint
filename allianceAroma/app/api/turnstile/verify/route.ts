import { NextRequest, NextResponse } from "next/server"

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const token = body?.token

  if (!token || typeof token !== "string") {
    return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 })
  }

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY not configured")
    return NextResponse.json({ success: false, error: "Server misconfigured" }, { status: 500 })
  }

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    })

    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] }
    return NextResponse.json({ success: data.success ?? false })
  } catch (err) {
    console.error("Turnstile verify error:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
