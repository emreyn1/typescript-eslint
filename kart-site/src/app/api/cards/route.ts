import { NextRequest, NextResponse } from "next/server";
import { createCard, listCards } from "@/lib/wanttopay";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (supabase) {
      const { data } = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return NextResponse.json(data ?? []);
    }

    const cards = await listCards();
    return NextResponse.json(cards);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, label } = body as { type: "basic" | "smart"; label?: string };

    if (!type || !["basic", "smart"].includes(type)) {
      return NextResponse.json({ error: "Invalid card type" }, { status: 400 });
    }

    // Check user balance for card purchase
    const cardCost = type === "basic" ? 8 : 15;
    if (supabase) {
      const { data: user } = await supabase
        .from("users")
        .select("balance")
        .eq("id", userId)
        .single();
      if ((user?.balance ?? 0) < cardCost) {
        return NextResponse.json(
          { error: "Insufficient balance", required: cardCost },
          { status: 402 },
        );
      }
    }

    const card = await createCard({ type, label });

    if (supabase) {
      // Deduct balance
      await supabase.rpc("deduct_balance", {
        p_user_id: userId,
        p_amount: cardCost,
      });

      // Save card reference
      await supabase.from("cards").insert({
        user_id: userId,
        provider_card_id: card.id,
        type,
        label: label || `${type} card`,
        last_four: card.card_number.slice(-4),
        status: "active",
      });
    }

    return NextResponse.json(card);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
