import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const LinkReferralSchema = z.object({
  referralCode: z.string().min(1).max(50),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = LinkReferralSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const { data, error } = await supabase.rpc("link_referral_to_user", {
      p_user_id: user.id,
      p_referral_code: parsed.data.referralCode,
    })

    if (error) {
      console.error("Failed to link referral:", error)
      return NextResponse.json(
        { error: "Failed to link referral" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}
