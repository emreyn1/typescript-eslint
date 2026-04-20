import { NextRequest, NextResponse } from "next/server";
import { createInvoice } from "@/lib/nowpayments";
import { auth } from "@/auth";
import { z } from "zod";

const TopUpSchema = z.object({
  amount: z.number().min(5).max(10000),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = TopUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Minimum top-up is $5" }, { status: 400 });
    }

    const { amount } = parsed.data;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
    const orderId = `topup_${session.user.id}_${Date.now()}`;

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
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
