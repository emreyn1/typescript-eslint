"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

interface AffiliateContextType {
  referralCode: string | null
  referrerName: string | null
  clearReferral: () => void
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined)

const REFERRAL_STORAGE_KEY = "AllianceAroma-referral"
const REFERRAL_EXPIRY_KEY = "AllianceAroma-referral-expiry"
const COOKIE_DAYS = 30

async function fetchReferrerInfo(code: string): Promise<{ id: string; name: string } | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase.rpc("get_referrer_info", { p_code: code })
    if (data && data.id) return data
    return null
  } catch {
    return null
  }
}

async function trackReferralClick(code: string, affiliateId: string) {
  try {
    const supabase = createClient()
    await supabase.from("referral_clicks").insert({
      affiliate_id: affiliateId,
      referral_code: code,
    })
  } catch {
    // Non-critical
  }
}

export function AffiliateProvider({ children }: { children: ReactNode }) {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referrerName, setReferrerName] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const rawRef = params.get("ref")
    const refParam =
      rawRef &&
      rawRef.trim() !== "" &&
      rawRef.trim().toLowerCase() !== "null" &&
      rawRef.trim().toLowerCase() !== "undefined"
        ? rawRef.trim()
        : null

    if (refParam) {
      const expiry = Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000
      localStorage.setItem(REFERRAL_STORAGE_KEY, refParam)
      localStorage.setItem(REFERRAL_EXPIRY_KEY, expiry.toString())
      setReferralCode(refParam)
      fetchReferrerInfo(refParam).then((info) => {
        setReferrerName(info?.name ?? null)
        if (info?.id) trackReferralClick(refParam, info.id)
      })

      params.delete("ref")
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname
      window.history.replaceState({}, "", newUrl)
    } else if (params.has("ref")) {
      /* Invalid ref e.g. ?ref=null — strip from URL without storing */
      params.delete("ref")
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }

    if (!refParam) {
      try {
        const stored = localStorage.getItem(REFERRAL_STORAGE_KEY)
        const expiry = localStorage.getItem(REFERRAL_EXPIRY_KEY)
        const storedInvalid =
          !stored ||
          stored.trim() === "" ||
          stored.toLowerCase() === "null" ||
          stored.toLowerCase() === "undefined"
        if (storedInvalid && stored) {
          localStorage.removeItem(REFERRAL_STORAGE_KEY)
          localStorage.removeItem(REFERRAL_EXPIRY_KEY)
        } else if (stored && expiry) {
          if (Date.now() < parseInt(expiry, 10)) {
            setReferralCode(stored)
            fetchReferrerInfo(stored).then((info) => setReferrerName(info?.name ?? null))
          } else {
            localStorage.removeItem(REFERRAL_STORAGE_KEY)
            localStorage.removeItem(REFERRAL_EXPIRY_KEY)
          }
        }
      } catch {
        // ignore
      }
    }
  }, [])

  function clearReferral() {
    setReferralCode(null)
    setReferrerName(null)
    localStorage.removeItem(REFERRAL_STORAGE_KEY)
    localStorage.removeItem(REFERRAL_EXPIRY_KEY)
  }

  return (
    <AffiliateContext.Provider value={{ referralCode, referrerName, clearReferral }}>
      {children}
    </AffiliateContext.Provider>
  )
}

export function useAffiliate() {
  const context = useContext(AffiliateContext)
  if (!context) {
    throw new Error("useAffiliate must be used within an AffiliateProvider")
  }
  return context
}
