import { NextRequest, NextResponse } from "next/server";
import { verifyIpnSignature } from "@/lib/nowpayments";
import { supabase } from "@/lib/supabase";

const PROCESSED = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const signature = req.headers.get("x-nowpayments-sig") || "";
    if (!verifyIpnSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const paymentId = String(body.payment_id ?? "");
    const paymentStatus = String(body.payment_status ?? "");
    const orderId = String(body.order_id ?? "");
    const amount = Number(body.price_amount ?? 0);

    if (!paymentId || !orderId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    if (PROCESSED.has(paymentId)) {
      return NextResponse.json({ status: "already_processed" });
    }

    if (paymentStatus !== "finished" && paymentStatus !== "confirmed") {
      return NextResponse.json({ status: `ignored: ${paymentStatus}` });
    }

    if (!supabase) {
      return NextResponse.json({ error: "DB not configured" }, { status: 503 });
    }

    // Idempotency check in DB
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("provider_id", paymentId)
      .maybeSingle();

    if (existing) {
      PROCESSED.add(paymentId);
      return NextResponse.json({ status: "already_processed" });
    }

    const parts = orderId.split("_");
    const userId = parts[1];

    if (!userId) {
      return NextResponse.json({ error: "Invalid order_id" }, { status: 400 });
    }

    await supabase.rpc("add_balance", {
      p_user_id: userId,
      p_amount: amount,
    });

    await supabase.from("payments").insert({
      user_id: userId,
      amount,
      currency: "USD",
      provider: "nowpayments",
      provider_id: paymentId,
      status: "completed",
    });

    PROCESSED.add(paymentId);
    return NextResponse.json({ status: "ok" });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Webhook error" }, { status: 500 });
  }
}
