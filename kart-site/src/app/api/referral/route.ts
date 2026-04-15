import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: string; refCode?: string };
  const { userId, refCode } = body;
  if (!userId || !refCode) {
    return NextResponse.json(
      { error: "userId and refCode required" },
      { status: 400 },
    );
  }

  if (!supabase) {
    return NextResponse.json({ ok: true, message: "DB not configured" });
  }

  const { data: referrer } = await supabase
    .from("referral_codes")
    .select("user_id")
    .eq("code", refCode)
    .single();

  if (!referrer?.user_id) {
    return NextResponse.json(
      { error: "Invalid referral code" },
      { status: 400 },
    );
  }
  if (referrer.user_id === userId) {
    return NextResponse.json(
      { error: "Cannot refer yourself" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("referral_links").insert({
    referrer_id: referrer.user_id,
    referred_id: userId,
    code: refCode,
  });

  if (error?.code === "23505") {
    return NextResponse.json({ ok: true, existing: true });
  }

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, existing: false });
}
