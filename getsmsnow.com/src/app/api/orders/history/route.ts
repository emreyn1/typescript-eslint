import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (!supabase) {
      return NextResponse.json({ orders: [] });
    }

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const { data: orders, count } = await supabase
      .from("orders")
      .select("id, provider_order_id, country_id, service_id, phone_number, status, sms_code, amount, created_at", { count: "exact" })
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    return NextResponse.json({
      orders: orders ?? [],
      total: count ?? 0,
      page,
      pages: Math.ceil((count ?? 0) / limit),
    });
  } catch {
    return NextResponse.json({ orders: [], total: 0, page: 1, pages: 0 });
  }
}
