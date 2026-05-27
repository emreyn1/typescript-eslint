import { NextRequest, NextResponse } from "next/server";
import { orderSms } from "@/lib/sms-provider";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const OrderSchema = z.object({
  country: z.string().min(1).max(10).optional(),
  countryId: z.string().min(1).max(10).optional(),
  service: z.string().min(1).max(50).optional(),
  serviceId: z.string().min(1).max(50).optional(),
  maxPrice: z.number().positive().max(1000).optional(),
  max_price: z.number().positive().max(1000).optional(),
  pricingOption: z.number().int().min(0).max(10).optional(),
  pricing_option: z.number().int().min(0).max(10).optional(),
}).refine(
  (d) => !!(d.country || d.countryId) && !!(d.service || d.serviceId),
  { message: "country and service required" }
);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const countryId = parsed.data.country || parsed.data.countryId;
  const serviceId = parsed.data.service || parsed.data.serviceId;
  if (!countryId || !serviceId) {
    return NextResponse.json({ error: "country and service required" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    // 1. Fetch price first
    const { getPrice } = await import("@/lib/sms-provider");
    const priceData = await getPrice(countryId, serviceId);
    const cost = Number(priceData?.price) || 0;

    if (cost <= 0) {
      return NextResponse.json({ error: "Could not determine price" }, { status: 400 });
    }

    // 2. Check balance
    const { data: user } = await supabase
      .from("users")
      .select("balance")
      .eq("id", session.user.id)
      .single();

    const currentBalance = Number(user?.balance ?? 0);
    if (currentBalance < cost) {
      return NextResponse.json(
        { error: `Insufficient balance. Need $${cost.toFixed(2)}, have $${currentBalance.toFixed(2)}` },
        { status: 402 }
      );
    }

    // 3. Deduct balance BEFORE placing order (pre-auth)
    const newBalance = Math.round((currentBalance - cost) * 100) / 100;
    await supabase
      .from("users")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", session.user.id);

    // 4. Place order with SMS provider
    let data;
    try {
      data = await orderSms(countryId, serviceId, {
        maxPrice: parsed.data.maxPrice ?? parsed.data.max_price ?? cost * 1.1,
        pricingOption: parsed.data.pricingOption ?? parsed.data.pricing_option,
      });
    } catch (orderErr) {
      // Order failed → refund the deducted balance
      await supabase
        .from("users")
        .update({ balance: currentBalance, updated_at: new Date().toISOString() })
        .eq("id", session.user.id);

      throw orderErr;
    }

    // 5. Save order to DB
    await supabase.from("orders").insert({
      user_id: session.user.id,
      provider_order_id: data.order_id,
      country_id: countryId,
      service_id: serviceId,
      amount: cost,
      status: "active",
      phone_number: data.number || null,
    });

    // 6. Log the transaction
    await supabase.from("balance_transactions").insert({
      user_id: session.user.id,
      type: "purchase",
      amount: -cost,
      ref_id: data.order_id,
      description: `SMS order: ${serviceId} / ${countryId}`,
    });

    return NextResponse.json({
      order_id: data.order_id,
      number: data.number,
      cost,
      expires_at: data.expires_at,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
