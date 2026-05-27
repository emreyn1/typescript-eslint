import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { cancelSms } from "@/lib/sms-provider";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await req.json();
    const orderId = body.orderId || body.order_id;
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    // 1. Fetch order — must belong to this user and be active
    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, provider_order_id, amount, status")
      .eq("provider_order_id", orderId)
      .eq("user_id", session.user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "active" && order.status !== "pending") {
      return NextResponse.json({ error: "Order already completed or cancelled" }, { status: 400 });
    }

    // 2. Cancel with SMS provider
    const cancelResult = await cancelSms(order.provider_order_id);
    if (!cancelResult.ok) {
      return NextResponse.json(
        { error: "Provider could not cancel this order." },
        { status: 400 }
      );
    }

    // 3. Mark order as cancelled
    await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", order.id);

    // 4. Refund balance (add back the exact amount that was deducted)
    const refundAmount = Number(order.amount) || 0;
    if (refundAmount > 0) {
      const { data: user } = await supabase
        .from("users")
        .select("balance")
        .eq("id", session.user.id)
        .single();

      const currentBalance = Number(user?.balance ?? 0);
      const newBalance = Math.round((currentBalance + refundAmount) * 100) / 100;

      await supabase
        .from("users")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", session.user.id);

      // 5. Log refund transaction
      await supabase.from("balance_transactions").insert({
        user_id: session.user.id,
        type: "refund",
        amount: refundAmount,
        ref_id: orderId,
        description: "Order cancelled — refund",
      });
    }

    return NextResponse.json({ success: true, refund: refundAmount });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Cancel failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
