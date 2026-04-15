/**
 * NOWPayments API client for crypto top-up.
 */

const API_URL = "https://api.nowpayments.io/v1";

function getKey(): string {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) throw new Error("NOWPAYMENTS_API_KEY is not set");
  return key;
}

export async function createInvoice(params: {
  amount: number;
  currency: string;
  orderId: string;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";

  const res = await fetch(`${API_URL}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": getKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: params.amount,
      price_currency: params.currency,
      order_id: params.orderId,
      order_description: "Card top-up",
      ipn_callback_url: `${siteUrl}/api/payments/webhook`,
      success_url: params.successUrl ?? `${siteUrl}/dashboard?topup=success`,
      cancel_url: params.cancelUrl ?? `${siteUrl}/dashboard?topup=cancelled`,
    }),
  });

  if (!res.ok) throw new Error(`NOWPayments error: ${res.status}`);
  return res.json();
}

export function verifyIpnSignature(
  body: Record<string, unknown>,
  signature: string,
): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) return false;

  const crypto = require("node:crypto");
  const sorted = Object.keys(body)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = body[key];
        return acc;
      },
      {} as Record<string, unknown>,
    );

  const expected = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(sorted))
    .digest("hex");

  return expected === signature;
}
