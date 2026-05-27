import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single()

  if (
    !profile ||
    (profile.role !== "admin" && profile.role !== "super_admin")
  ) {
    redirect("/login?error=unauthorized")
  }

  if (
    ADMIN_EMAILS.length > 0 &&
    !ADMIN_EMAILS.includes(profile.email.toLowerCase())
  ) {
    redirect("/login?error=unauthorized")
  }

  return { user, profile }
}
