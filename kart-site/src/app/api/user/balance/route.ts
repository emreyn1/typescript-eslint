import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabase) {
    return NextResponse.json({ balance: 0 });
  }

  const { data } = await supabase
    .from("users")
    .select("balance")
    .eq("id", session.user.id)
    .maybeSingle();

  return NextResponse.json({ balance: Number(data?.balance ?? 0) });
}
