import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function bearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const t = h.slice(7).trim();
  return t || null;
}

async function resolveUserId(token: string): Promise<string | null> {
  if (supabase) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user?.id) return null;
    return user.id;
  }
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const payload = JSON.parse(
      Buffer.from(part, "base64url").toString("utf8"),
    ) as { sub?: string };
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

type CommissionRow = {
  amount: string | number | null;
  level: number | null;
  status: string | null;
  created_at: string | null;
};

export async function GET(req: NextRequest) {
  const token = bearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await resolveUserId(token);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({
      code: userId.slice(0, 8).toUpperCase(),
      directRefs: 0,
      referrals: 0,
      totalEarned: 0,
      commissions: { level1: 0, level2: 0, level3: 0 },
      recentCommissions: [] as CommissionRow[],
    });
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
      .select("amount, level, status, created_at")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const commissions = (commissionsResult.data ?? []) as CommissionRow[];
  const sumLevel = (n: number) =>
    commissions
      .filter((c) => c.level === n)
      .reduce((s, c) => s + Number(c.amount ?? 0), 0);
  const level1 = sumLevel(1);
  const level2 = sumLevel(2);
  const level3 = sumLevel(3);
  const referralCount = linksResult.data?.length ?? 0;

  return NextResponse.json({
    code: codeResult.data?.code ?? userId.slice(0, 8).toUpperCase(),
    directRefs: referralCount,
    referrals: referralCount,
    totalEarned: level1 + level2 + level3,
    commissions: { level1, level2, level3 },
    recentCommissions: commissions,
  });
}
