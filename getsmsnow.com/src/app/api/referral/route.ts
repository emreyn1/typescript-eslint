import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [codeResult, linksResult, commissionsResult] = await Promise.all([
    supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("referral_links")
      .select("referred_id, created_at")
      .eq("referrer_id", userId),
    supabase
      .from("referral_commissions")
      .select("amount, status, created_at")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const totalEarned =
    commissionsResult.data?.reduce(
      (sum: number, c: any) => sum + Number(c.amount),
      0,
    ) || 0;

  return NextResponse.json({
    code: codeResult.data?.code || null,
    referrals: linksResult.data?.length || 0,
    totalEarned,
    recentCommissions: commissionsResult.data || [],
  });
}

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { userId, refCode } = body;

  if (!userId || !refCode) {
    return NextResponse.json(
      { error: "userId and refCode required" },
      { status: 400 },
    );
  }

  const { data: referrer } = await supabase
    .from("referral_codes")
    .select("user_id")
    .eq("code", refCode)
    .single();

  if (!referrer) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
  }

  if (referrer.user_id === userId) {
    return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });
  }

  const { error } = await supabase.from("referral_links").insert({
    referrer_id: referrer.user_id,
    referred_id: userId,
    code: refCode,
  });

  if (error?.code === "23505") {
    return NextResponse.json({ ok: true, existing: true });
  }

  return NextResponse.json({ ok: true, existing: false });
}
