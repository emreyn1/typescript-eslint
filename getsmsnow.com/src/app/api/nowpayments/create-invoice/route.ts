import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createInvoice } from "@/lib/nowpayments";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { amount } = body as { amount?: number };
    if (typeof amount !== "number" || amount < 5 || amount > 10000) {
      return NextResponse.json(
        { error: "Amount must be between 5 and 10000 USD" },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
    }

    const orderId = `topup-now-${session.user.id}-${Date.now()}`;
    const { error: insertError } = await supabase.from("nowpayments_payments").insert({
      order_id: orderId,
      user_id: session.user.id,
      amount: amount,
      currency: "USD",
      status: "pending",
    });
    if (insertError) {
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
    }

    const result = await createInvoice({
      amount,
      currency: "USD",
      orderId,
      orderDescription: `GetSMSNow balance top-up $${amount}`,
    });

    return NextResponse.json({
      url: result?.invoiceUrl,
      invoice_id: result?.invoiceId,
      order_id: orderId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Payment error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
