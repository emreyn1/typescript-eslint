/**
 * NOWPayments API client for balance top-up.
 * Docs: https://documenter.getpostman.com/view/7907941/S1a32n38
 */

const NOWPAYMENTS_URL = "https://api.nowpayments.io/v1";

function getConfig() {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error("NOWPAYMENTS_API_KEY required");
  return { apiKey };
}

export interface CreateInvoiceParams {
  amount: number;
  currency: string;
  orderId: string;
  orderDescription?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createInvoice(params: CreateInvoiceParams) {
  const { apiKey } = getConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getsmsnow.com";

  const body = {
    price_amount: params.amount,
    price_currency: params.currency.toLowerCase(),
    order_id: params.orderId,
    order_description: params.orderDescription ?? "Balance top-up",
    ipn_callback_url: `${siteUrl}/api/nowpayments/webhook`,
    success_url: params.successUrl ?? `${siteUrl}/dashboard?payment=success`,
    cancel_url: params.cancelUrl ?? `${siteUrl}/dashboard?payment=cancelled`,
  };

  const res = await fetch(`${NOWPAYMENTS_URL}/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    invoice_id?: number;
    invoice_url?: string;
    order_id?: string;
    order_description?: string;
    price_amount?: number;
    price_currency?: string;
    pay_currency?: string;
    pay_amount?: number;
    [key: string]: unknown;
  };

  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? "NOWPayments error");
  }

  return {
    invoiceId: data.invoice_id,
    invoiceUrl: data.invoice_url,
    orderId: data.order_id,
  };
}

export function verifyIpnSignature(
  body: Record<string, unknown>,
  receivedSig: string
): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) return false;

  const { createHmac } = require("crypto") as typeof import("crypto");
  const sorted = Object.keys(body)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = body[key];
      return acc;
    }, {});

  const hmac = createHmac("sha512", secret)
    .update(JSON.stringify(sorted))
    .digest("hex");

  return hmac === receivedSig;
}
