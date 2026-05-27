import { NextRequest, NextResponse } from "next/server";
import { getPrice } from "@/lib/sms-provider";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { createInvoice as createNowInvoice } from "@/lib/nowpayments";
import { supabase } from "@/lib/supabase";
import crypto from "node:crypto";

const PRICE_MULTIPLIER = 1.7;

function generateGuestToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Service not configured" }, { status: 503 });
    }

    const body = await req.json();
    const {
      countryId,
      serviceId,
      acceptTerms,
      acceptPrivacy,
      email,
      paymentMethod,
      turnstileToken,
    } = body as {
      countryId?: string;
      serviceId?: string;
      acceptTerms?: boolean;
      acceptPrivacy?: boolean;
      email?: string;
      paymentMethod?: string;
      turnstileToken?: string;
    };

    if (acceptTerms !== true || acceptPrivacy !== true) {
      return NextResponse.json(
        { error: "You must accept the Terms of Service and Privacy Policy" },
        { status: 400 }
      );
    }
    if (!countryId || !serviceId) {
      return NextResponse.json(
        { error: "countryId and serviceId are required" },
        { status: 400 }
      );
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json({ error: "Security check required" }, { status: 400 });
      }
      const valid = await verifyTurnstileToken(turnstileToken);
      if (!valid) {
        return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
      }
    }

    const priceResult = await getPrice(countryId, serviceId);
    const apiCost = Number(priceResult.price) || 0;
    const ourPrice = Math.round(apiCost * PRICE_MULTIPLIER * 100) / 100;
    if (ourPrice <= 0) {
      return NextResponse.json({ error: "Price not available for this country/service" }, { status: 400 });
    }

    const guestToken = generateGuestToken();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getsmsnow.com";

    const { error: insertError } = await supabase.from("guest_orders").insert({
      guest_token: guestToken,
      country_id: countryId,
      service_id: serviceId,
      amount: ourPrice,
      status: "pending_payment",
      email: typeof email === "string" && email.trim() ? email.trim() : null,
      payment_provider: "nowpayments",
    });

    if (insertError) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderId = `guest-${guestToken}`;
    const successUrl = `${siteUrl}/order/${guestToken}`;

    const nowResult = await createNowInvoice({
      amount: ourPrice,
      currency: "USD",
      orderId,
      orderDescription: `GetSMSNow guest order - ${countryId}/${serviceId}`,
    });

    await supabase
      .from("guest_orders")
      .update({ payment_order_id: orderId, updated_at: new Date().toISOString() })
      .eq("guest_token", guestToken);

    return NextResponse.json({
      url: nowResult?.invoiceUrl,
      guest_token: guestToken,
      order_id: orderId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Payment error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
