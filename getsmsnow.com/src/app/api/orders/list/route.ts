import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!supabase) {
      return NextResponse.json({ orders: [] });
    }

    const { data: orders } = await supabase
      .from("orders")
      .select("id, provider_order_id, country_id, service_id, amount, status, phone_number, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({ orders: orders ?? [] });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
