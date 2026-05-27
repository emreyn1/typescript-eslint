"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export interface User {
  id: string
  name: string
  email: string
  isAffiliate: boolean
  referralCode: string | null
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, isAffiliate: boolean, referralCode?: string | null) => Promise<{ success: boolean; error?: string; message?: string }>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  logout: () => Promise<void>
  becomeAffiliate: () => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const REFERRAL_STORAGE_KEY = "AllianceAroma-referral"
const REFERRAL_LINKED_KEY = "AllianceAroma-referral-linked"
const USER_CACHE_KEY = "AllianceAroma-user-cache"

function cacheUser(u: User | null) {
  try {
    if (u) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_CACHE_KEY)
  } catch { /* quota exceeded or SSR */ }
}

function getCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function userFromMetadata(su: SupabaseUser): User {
  const meta = su.user_metadata || {}
  return {
    id: su.id,
    name: meta.full_name || meta.name || su.email?.split("@")[0] || "User",
    email: su.email || "",
    isAffiliate: !!meta.is_affiliate,
    referralCode: null,
  }
}

async function tryLinkReferral(userId: string) {
  try {
    const referralCode = localStorage.getItem(REFERRAL_STORAGE_KEY)
    const alreadyLinked = localStorage.getItem(REFERRAL_LINKED_KEY)

    if (!referralCode || alreadyLinked === userId) return

    const res = await fetch("/api/link-referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.linked || data.reason === "already_linked") {
        localStorage.setItem(REFERRAL_LINKED_KEY, userId)
      }
    }
  } catch {
    // Non-critical
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const linkAttempted = useRef(false)
  const profileFetched = useRef<string | null>(null)

  const setAndCache = useCallback((u: User | null) => {
    setUser(u)
    cacheUser(u)
  }, [])

  const enrichWithProfile = useCallback(async (su: SupabaseUser, base: User): Promise<User> => {
    if (profileFetched.current === su.id) return base
    profileFetched.current = su.id

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code, is_affiliate")
        .eq("id", su.id)
        .single()

      if (profile) {
        const enriched = {
          ...base,
          referralCode: profile.referral_code ?? base.referralCode,
          isAffiliate: profile.is_affiliate || base.isAffiliate,
        }
        setAndCache(enriched)
        return enriched
      }
    } catch {
      // Profile may not exist yet
    }
    return base
  }, [supabase, setAndCache])

  useEffect(() => {
    let mounted = true

    async function init() {
      const cached = getCachedUser()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const instant = cached?.id === session.user.id ? cached : userFromMetadata(session.user)
        if (mounted) {
          setAndCache(instant)
          setIsLoading(false)
        }
        const enriched = await enrichWithProfile(session.user, instant)
        if (mounted && !linkAttempted.current) {
          linkAttempted.current = true
          tryLinkReferral(enriched.id)
        }
      } else {
        if (mounted) {
          setAndCache(null)
          setIsLoading(false)
        }
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === "SIGNED_OUT") {
        setAndCache(null)
        profileFetched.current = null
        return
      }

      if (session?.user) {
        const instant = userFromMetadata(session.user)
        setAndCache(instant)
        setIsLoading(false)

        await enrichWithProfile(session.user, instant)

        if ((event === "SIGNED_IN" || event === "USER_UPDATED") && !linkAttempted.current) {
          linkAttempted.current = true
          tryLinkReferral(instant.id)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, enrichWithProfile, setAndCache])

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return { success: false, error: "Please verify your email first. Check your inbox for the confirmation link." }
      }
      return { success: false, error: "Invalid email or password." }
    }
    if (!data.user) return { success: false, error: "Invalid email or password." }

    const instant = userFromMetadata(data.user)
    setAndCache(instant)
    enrichWithProfile(data.user, instant)
    return { success: true }
  }

  async function register(
    name: string,
    email: string,
    password: string,
    isAffiliate: boolean,
    referralCode?: string | null
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          is_affiliate: isAffiliate,
          referral_code: referralCode || null,
        },
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
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

    return {
      success: true,
      message: "Verification email sent. Please check your inbox and click the link to activate your account.",
    }
  }

  async function signInWithGoogle(): Promise<void> {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async function signInWithFacebook(): Promise<void> {
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async function becomeAffiliate(): Promise<{ success: boolean; error?: string }> {
    if (!user) return { success: false, error: "Not authenticated" }
    if (user.isAffiliate) return { success: true }

    const controller = new AbortController()
    const kill = setTimeout(() => controller.abort(), 25_000)

    try {
      // Server route: same RPC + JWT as client, but request goes Browser → your app → Supabase
      // (fixes many cases where direct supabase.co from the browser never completes).
      const res = await fetch("/api/affiliate/activate", {
        method: "POST",
        credentials: "same-origin",
        signal: controller.signal,
      })

      const body = (await res.json().catch(() => ({}))) as {
        error?: string
        hint?: string
        success?: boolean
      }

      if (!res.ok) {
        const msg = [body.error, body.hint].filter(Boolean).join(" ")
        return {
          success: false,
          error: msg || `Activation failed (${res.status})`,
        }
      }

      const updated: User = { ...user, isAffiliate: true }
      setAndCache(updated)
      profileFetched.current = null
      enrichWithProfile(
        { id: user.id, email: user.email, user_metadata: {} } as unknown as SupabaseUser,
        updated,
      )
      return { success: true }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return {
          success: false,
          error:
            "Request timed out. If migration 007 is already applied, check your network, disable VPN/ad blockers for this site, or try another browser.",
        }
      }
      return { success: false, error: err instanceof Error ? err.message : "Failed to activate affiliate" }
    } finally {
      clearTimeout(kill)
    }
  }

  async function logout(): Promise<void> {
    setAndCache(null)
    linkAttempted.current = false
    profileFetched.current = null
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, login, register, signInWithGoogle, signInWithFacebook, logout, becomeAffiliate, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
