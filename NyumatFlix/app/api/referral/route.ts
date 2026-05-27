import { NextRequest, NextResponse } from "next/server";

const EMBED_API = process.env.NEXT_PUBLIC_EMBED_API_URL || "http://localhost:3001";

export async function GET(req: NextRequest) {
  const fp = req.cookies.get("_fp")?.value || req.headers.get("x-fingerprint") || "";
  if (!fp) {
    return NextResponse.json({ balance: 0, total_earned: 0, total_spent: 0, referralCode: "" });
  }

  try {
    const balanceRes = await fetch(`${EMBED_API}/api/v1/coins/balance?fp=${fp}`);
    const balance = balanceRes.ok ? await balanceRes.json() : { balance: 0, total_earned: 0, total_spent: 0 };
    return NextResponse.json({ ...balance, referralCode: fp.slice(0, 8) });
  } catch {
    return NextResponse.json({ balance: 0, total_earned: 0, total_spent: 0, referralCode: fp.slice(0, 8) });
  }
}

export async function POST(req: NextRequest) {
  const { fp, refCode } = await req.json();
  if (!fp || !refCode) {
    return NextResponse.json({ error: "fp and refCode required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${EMBED_API}/api/v1/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fp, ref: refCode, duration: 0 }),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
