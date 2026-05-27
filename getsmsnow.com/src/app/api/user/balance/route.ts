import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }
    const { data } = await supabase
      .from("users")
      .select("balance, referral_code")
      .eq("id", session.user.id)
      .single();
    return NextResponse.json({
      balance: Number(data?.balance ?? 0),
      referralCode: data?.referral_code ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
