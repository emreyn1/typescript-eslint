/**
 * Unified SMS provider — auto-selects SMSPool or SMSCode based on env vars.
 * Priority: SMSPOOL_API_KEY > SMSCODE_API_TOKEN
 */

// ─── SMSPool ────────────────────────────────────────────────────────────────

const SMSPOOL_BASE = "https://api.smspool.net";

async function smspoolPost(path: string, body: Record<string, string> = {}) {
  const key = process.env.SMSPOOL_API_KEY!;
  const form = new URLSearchParams({ ...body, key });
  const res = await fetch(`${SMSPOOL_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) throw new Error(`SMSPool ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Record<string, unknown>>;
}

const smspoolCountryMap: Record<string, string> = { uk: "GB" };
function toSmspoolCountry(id: string): string {
  return smspoolCountryMap[id.toLowerCase()] ?? id.toUpperCase();
}

const smspoolServiceMap: Record<string, string> = {
  whatsapp: "1012", telegram: "907", facebook: "329", tinder: "926",
  google: "395", instagram: "457", tiktok: "924", snapchat: "846",
  uber: "951", airbnb: "28", discord: "273", linkedin: "523",
};
function toSmspoolService(id: string): string {
  return smspoolServiceMap[id.toLowerCase()] ?? id;
}

// ─── SMSCode ────────────────────────────────────────────────────────────────

const SMSCODE_BASE = "https://api.smscode.gg/v1";

async function smscodeApi<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const token = process.env.SMSCODE_API_TOKEN!;
  const res = await fetch(`${SMSCODE_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`SMSCode ${res.status}: ${await res.text()}`);
  return res.json();
}

const smscodeCountryMap: Record<string, string> = { uk: "GB" };
function toSmscodeCountry(id: string): string {
  return smscodeCountryMap[id.toLowerCase()] ?? id.toUpperCase();
}
function toSmscodeService(id: string): string { return id.toLowerCase(); }

// ─── Unified interface ──────────────────────────────────────────────────────

function provider(): "smspool" | "smscode" {
  if (process.env.SMSPOOL_API_KEY) return "smspool";
  if (process.env.SMSCODE_API_TOKEN) return "smscode";
  throw new Error("No SMS provider configured — set SMSPOOL_API_KEY or SMSCODE_API_TOKEN");
}

export async function getBalance(): Promise<{ balance: number }> {
  if (provider() === "smspool") {
    const d = await smspoolPost("request/balance");
    return { balance: Number(d.balance) || 0 };
  }
  return smscodeApi("/balance");
}

export async function getCountries() {
  if (provider() === "smspool") {
    const d = await smspoolPost("country/retrieve_all");
    return { countries: Array.isArray(d) ? d : [] };
  }
  return smscodeApi<{ countries: unknown[] }>("/countries");
}

export async function getServices() {
  if (provider() === "smspool") {
    const d = await smspoolPost("service/retrieve_all");
    return { services: Array.isArray(d) ? d : [] };
  }
  return smscodeApi<{ services: unknown[] }>("/services");
}

export async function getPrice(countryId: string, serviceId: string): Promise<{ price: number }> {
  if (provider() === "smspool") {
    const d = await smspoolPost("request/price", {
      country: toSmspoolCountry(countryId),
      service: toSmspoolService(serviceId),
    });
    const raw = d.price ?? d.cost ?? d.amount ?? 0;
    return { price: Number(raw) || 0 };
  }
  const c = toSmscodeCountry(countryId);
  const s = toSmscodeService(serviceId);
  return smscodeApi(`/price?country=${c}&service=${s}`);
}

export async function orderSms(
  countryId: string,
  serviceId: string,
  opts?: { maxPrice?: number; pricingOption?: number },
) {
  if (provider() === "smspool") {
    const body: Record<string, string> = {
      country: toSmspoolCountry(countryId),
      service: toSmspoolService(serviceId),
    };
    if (opts?.maxPrice != null) body.max_price = String(opts.maxPrice);
    if (opts?.pricingOption != null) body.pricing_option = String(opts.pricingOption);
    const d = await smspoolPost("purchase/sms", body);
    if (d.success === 0 || d.success === "0") {
      throw new Error(String(d.message ?? d.error ?? "SMSPool order failed"));
    }
    return {
      order_id: String(d.order_id ?? ""),
      number: String(d.number ?? d.phone ?? d.phonenumber ?? ""),
      expires_at: d.expires_at as string | undefined,
      cost: d.cost ?? d.price,
    };
  }
  const c = toSmscodeCountry(countryId);
  const s = toSmscodeService(serviceId);
  const result = await smscodeApi<{ order_id: string; phone: string; expires_at?: string }>(
    "/order", "POST", { country: c, service: s, max_price: opts?.maxPrice },
  );
  return { ...result, number: result.phone };
}

export async function checkSms(orderId: string) {
  if (provider() === "smspool") {
    const d = await smspoolPost("sms/check", { orderid: orderId });
    const status = Number(d.status);
    return {
      status: status === 3 ? "completed" : status === 2 ? "cancelled" : "waiting",
      sms: d.sms ? String(d.sms) : undefined,
      full_sms: d.full_sms ? String(d.full_sms) : undefined,
      code: d.sms ? String(d.sms) : undefined,
    };
  }
  return smscodeApi<{ status: string; code?: string; sms?: string; full_sms?: string }>(
    `/order/${orderId}`,
  );
}

export async function cancelSms(orderId: string): Promise<{ ok: boolean }> {
  if (provider() === "smspool") {
    const d = await smspoolPost("sms/cancel", { orderid: orderId });
    return { ok: d.success === 1 || d.success === "1" };
  }
  return smscodeApi("/order/" + orderId + "/cancel", "POST");
}
