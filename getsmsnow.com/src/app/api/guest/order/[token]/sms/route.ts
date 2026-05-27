import { NextRequest, NextResponse } from "next/server";
import { checkSms } from "@/lib/sms-provider";
import { supabase } from "@/lib/supabase";

/** Public: check SMS for guest order by token (no auth). */
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

    const { data: guestOrder } = await supabase
      .from("guest_orders")
      .select("provider_order_id, status")
      .eq("guest_token", token)
      .single();

    if (!guestOrder?.provider_order_id) {
      return NextResponse.json({ error: "Order not found or no number yet" }, { status: 404 });
    }

    const result = (await checkSms(guestOrder.provider_order_id)) as {
      status?: number;
      sms?: string;
      full_sms?: string;
    };

    if (supabase && (result?.sms || result?.full_sms || result?.status === 3)) {
      await supabase
        .from("guest_orders")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("guest_token", token);
    }

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
