import { NextRequest, NextResponse } from "next/server";
import { verifyIpnSignature } from "@/lib/nowpayments";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get("x-nowpayments-sig") || "";

    if (!verifyIpnSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (body.payment_status !== "finished") {
      return NextResponse.json({ status: "ignored" });
    }

    const orderId = body.order_id as string;
    const amount = body.price_amount as number;

    // Parse user ID from order_id (format: topup_userId_timestamp)
    const parts = orderId.split("_");
    const userId = parts[1];

    if (supabase && userId) {
      await supabase.rpc("add_balance", {
        p_user_id: userId,
        p_amount: amount,
      });

      await supabase.from("payments").insert({
        user_id: userId,
        amount,
        currency: "USD",
        provider: "nowpayments",
        provider_id: String(body.payment_id),
        status: "completed",
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
