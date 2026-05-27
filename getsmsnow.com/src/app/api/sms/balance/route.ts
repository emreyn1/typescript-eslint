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
      return NextResponse.json({ balance: 0 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("balance")
      .eq("id", session.user.id)
      .maybeSingle();

    return NextResponse.json({ balance: Number(user?.balance ?? 0) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
