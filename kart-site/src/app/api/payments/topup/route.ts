import { NextRequest, NextResponse } from "next/server";
import { createInvoice } from "@/lib/nowpayments";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { amount } = body as { amount: number };

    if (!amount || amount < 5) {
      return NextResponse.json({ error: "Minimum top-up is $5" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
    const orderId = `topup_${userId}_${Date.now()}`;

    const invoice = await createInvoice({
      amount,
      currency: "usd",
      orderId,
      successUrl: `${siteUrl}/dashboard?topup=success`,
      cancelUrl: `${siteUrl}/dashboard?topup=cancelled`,
    });

    return NextResponse.json({
      invoice_url: invoice.invoice_url,
      order_id: orderId,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
