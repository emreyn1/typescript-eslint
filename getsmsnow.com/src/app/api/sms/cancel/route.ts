import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { cancelSms } from "@/lib/sms-provider";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await req.json();
  const orderId = body.order_id || body.orderId || "";
  if (!orderId) return NextResponse.json({ error: "order_id required" }, { status: 400 });

  if (supabase) {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("provider_order_id", orderId)
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!order) {
      return NextResponse.json({ error: "Order not found or not yours" }, { status: 404 });
    }
  }

  try {
    const data = await cancelSms(orderId);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Cancel failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
