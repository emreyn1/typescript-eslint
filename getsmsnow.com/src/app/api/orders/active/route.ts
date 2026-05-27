import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ orders: [] });
    }
    if (!supabase) {
      return NextResponse.json({ orders: [] });
    }

    const tenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: orders } = await supabase
      .from("orders")
      .select("id, provider_order_id, country_id, service_id, phone_number, status, sms_code, created_at")
      .eq("user_id", session.user.id)
      .in("status", ["active", "pending"])
      .gte("created_at", tenMinAgo)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({ orders: orders ?? [] });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
