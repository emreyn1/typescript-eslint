import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Activates affiliate status via RPC on the server (session from cookies).
 * Avoids browser → Supabase direct calls that can hang (extensions, IPv6, proxies)
 * while still using the user's JWT (anon key + RLS / SECURITY DEFINER behave the same).
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data, error } = await supabase.rpc("activate_affiliate")

    if (error) {
      console.error("activate_affiliate RPC:", error)
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

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error("POST /api/affiliate/activate:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
