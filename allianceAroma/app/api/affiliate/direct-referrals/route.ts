import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const BodySchema = z.object({
  parentId: z.string().uuid(),
})

/**
 * Proxies get_direct_referrals RPC (session from cookies).
 * Same behavior as client-side supabase.rpc; avoids flaky browser → supabase.co paths.
 */
export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parentId" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data, error } = await supabase.rpc("get_direct_referrals", {
      p_parent_id: parsed.data.parentId,
    })

    if (error) {
      console.error("get_direct_referrals RPC:", error)
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          hint:
            error.message?.includes("function") || error.code === "PGRST202"
              ? "Run supabase/migrations/007_fix_rls_recursion.sql on this project."
              : undefined,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (e) {
    console.error("POST /api/affiliate/direct-referrals:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
