import { NextRequest, NextResponse } from "next/server";
import { verifyIpnSignature } from "@/lib/nowpayments";
import { supabase } from "@/lib/supabase";

const PROCESSED_IDS = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const sig = req.headers.get("x-nowpayments-sig") ?? "";
    if (!verifyIpnSignature(body, sig)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const paymentId = String(body.payment_id ?? "");
    const paymentStatus = String(body.payment_status ?? "");
    const orderId = String(body.order_id ?? "");
    const priceAmount = Number(body.price_amount ?? 0);

    if (!paymentId || !orderId) {
      return NextResponse.json({ error: "Missing payment data" }, { status: 400 });
    }

    if (PROCESSED_IDS.has(paymentId)) {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    if (paymentStatus !== "finished" && paymentStatus !== "confirmed") {
      return NextResponse.json({ ok: true, message: `Status: ${paymentStatus}` });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: existingPayment } = await supabase
      .from("nowpayments_transactions")
      .select("id")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (existingPayment) {
      PROCESSED_IDS.add(paymentId);
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    const isTopUp = orderId.startsWith("topup_");
    const isGuest = orderId.startsWith("guest_");

    if (isTopUp) {
      const userId = orderId.replace("topup_", "").split("_")[0];
      if (!userId) {
        return NextResponse.json({ error: "Invalid order_id format" }, { status: 400 });
      }

      const { data: user } = await supabase
        .from("users")
        .select("id, balance")
        .eq("id", userId)
        .maybeSingle();

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const currentBalance = Number(user.balance ?? 0);
      const newBalance = Math.round((currentBalance + priceAmount) * 100) / 100;

      await supabase
        .from("users")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", userId);

      await supabase.from("balance_transactions").insert({
        user_id: userId,
        type: "deposit",
        amount: priceAmount,
        ref_id: paymentId,
        description: `NOWPayments crypto top-up ($${priceAmount})`,
      });
    }

    if (isGuest) {
      await supabase
        .from("guest_orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("payment_order_id", orderId);
    }

    await supabase.from("nowpayments_transactions").insert({
      payment_id: paymentId,
      order_id: orderId,
      payment_status: paymentStatus,
      price_amount: priceAmount,
      price_currency: String(body.price_currency ?? "usd"),
      pay_amount: Number(body.pay_amount ?? 0),
      pay_currency: String(body.pay_currency ?? ""),
      raw_data: body,
    });

    PROCESSED_IDS.add(paymentId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Webhook error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
