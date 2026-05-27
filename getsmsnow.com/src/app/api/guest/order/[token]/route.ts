import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/** Public: get guest order by token (no auth). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }
    if (!supabase) {
      return NextResponse.json({ error: "Service not configured" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("guest_orders")
      .select("guest_token, country_id, service_id, amount, status, phone_number, provider_order_id, created_at")
      .eq("guest_token", token)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
