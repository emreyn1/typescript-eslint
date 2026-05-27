import { NextRequest, NextResponse } from "next/server";

const EMBED_API = process.env.NEXT_PUBLIC_EMBED_API_URL || "http://localhost:3001";

const VIP_PLANS: Record<string, number> = {
  "1h": 50,
  "1d": 200,
  "1w": 1000,
  "1m": 3000,
};

export async function POST(req: NextRequest) {
  const { fp, plan } = await req.json();
  if (!fp || !plan || !VIP_PLANS[plan]) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const cost = VIP_PLANS[plan];

  try {
    const res = await fetch(`${EMBED_API}/api/v1/coins/spend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fp, amount: cost, reason: `vip_${plan}` }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json({ ok: true, plan, cost, ...data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
