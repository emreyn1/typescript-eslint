"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export type SignUpResult = { success: boolean; error?: string; message?: string }
export type LoginResult = { success: boolean; error?: string }

async function verifyTurnstile(token: string | null): Promise<boolean> {
  if (!token || !process.env.TURNSTILE_SECRET_KEY) return !process.env.TURNSTILE_SECRET_KEY
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    })
    const data = (await res.json()) as { success?: boolean }
    return !!data.success
  } catch {
    return false
  }
}

export async function signUp(formData: FormData): Promise<SignUpResult> {
  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const isAffiliate = formData.get("isAffiliate") === "true"
  const referralCode = (formData.get("referralCode") as string)?.trim() || null
  const turnstileToken = (formData.get("turnstileToken") as string)?.trim() || null

  if (process.env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstile(turnstileToken)
    if (!ok) return { success: false, error: "Verification failed. Please try again." }
  }

  if (!name || name.length < 2) {
    return { success: false, error: "Name must be at least 2 characters." }
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Invalid email address." }
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." }
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        is_affiliate: isAffiliate,
        referral_code: referralCode,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already exists")) {
      return { success: false, error: "An account with this email already exists." }
    }
    return { success: false, error: error.message }
  }

  if (data?.user && !data.user.identities?.length) {
    return { success: false, error: "An account with this email already exists." }
  }

  revalidatePath("/", "layout")
  return {
    success: true,
    message: "Verification email sent. Please check your inbox and click the link to activate your account.",
  }
}

export async function login(formData: FormData): Promise<LoginResult> {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email and password are required." }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return { success: false, error: "Please verify your email first. Check your inbox for the confirmation link." }
    }
    return { success: false, error: "Invalid email or password." }
  }

  if (!data.user) {
    return { success: false, error: "Invalid email or password." }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function logout(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

