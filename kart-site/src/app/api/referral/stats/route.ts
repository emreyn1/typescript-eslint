import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";

type CommissionRow = {
  amount: string | number | null;
  level: number | null;
  status: string | null;
  created_at: string | null;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

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
    supabase.from("referral_codes").select("code").eq("user_id", userId).single(),
    supabase.from("referral_links").select("referred_id, created_at").eq("referrer_id", userId),
    supabase.from("referral_commissions").select("amount, level, status, created_at").eq("referrer_id", userId).order("created_at", { ascending: false }).limit(20),
  ]);

  const commissions = (commissionsResult.data ?? []) as CommissionRow[];
  const sumLevel = (n: number) =>
    commissions.filter((c) => c.level === n).reduce((s, c) => s + Number(c.amount ?? 0), 0);

  return NextResponse.json({
    code: codeResult.data?.code ?? userId.slice(0, 8).toUpperCase(),
    directRefs: linksResult.data?.length ?? 0,
    referrals: linksResult.data?.length ?? 0,
    totalEarned: sumLevel(1) + sumLevel(2) + sumLevel(3),
    commissions: { level1: sumLevel(1), level2: sumLevel(2), level3: sumLevel(3) },
    recentCommissions: commissions,
  });
}
