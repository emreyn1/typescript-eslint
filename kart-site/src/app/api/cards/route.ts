import { NextRequest, NextResponse } from "next/server";
import { createCard } from "@/lib/wanttopay";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import { z } from "zod";

const CreateCardSchema = z.object({
  type: z.enum(["basic", "smart"]),
  label: z.string().max(50).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!supabase) {
      return NextResponse.json([]);
    }

    const { data } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await req.json();
    const parsed = CreateCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { type, label } = parsed.data;
    const cardCost = type === "basic" ? 8 : 15;

    // 1. Check balance
    const { data: user } = await supabase
      .from("users")
      .select("balance")
      .eq("id", session.user.id)
      .single();

    const currentBalance = Number(user?.balance ?? 0);
    if (currentBalance < cardCost) {
      return NextResponse.json(
        { error: "Insufficient balance", required: cardCost, current: currentBalance },
        { status: 402 },
      );
    }

    // 2. Deduct balance FIRST (atomic via RPC)
    try {
      await supabase.rpc("deduct_balance", {
        p_user_id: session.user.id,
        p_amount: cardCost,
      });
    } catch {
      return NextResponse.json({ error: "Balance deduction failed" }, { status: 402 });
    }

    // 3. Create card with provider
    let card;
    try {
      card = await createCard({ type, label });
    } catch (providerErr) {
      // Refund on provider failure
      await supabase.rpc("add_balance", {
        p_user_id: session.user.id,
        p_amount: cardCost,
      });
      throw providerErr;
    }

    // 4. Save card to DB
    await supabase.from("cards").insert({
      user_id: session.user.id,
      provider_card_id: card.id,
      type,
      label: label || `${type} card`,
      last_four: card.card_number.slice(-4),
      status: "active",
    });

    return NextResponse.json(card);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
