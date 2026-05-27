import { NextRequest, NextResponse } from "next/server";
import { checkSms } from "@/lib/sms-provider";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

async function handleCheck(orderId: string, userId?: string) {
  const data = await checkSms(orderId);

  if (data.sms && supabase && userId) {
    await supabase
      .from("orders")
      .update({ sms_code: data.sms, status: "completed" })
      .eq("provider_order_id", orderId)
      .eq("user_id", userId);
  }

  return data;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const orderId = req.nextUrl.searchParams.get("order_id") || req.nextUrl.searchParams.get("orderId") || "";
  if (!orderId) return NextResponse.json({ error: "order_id required" }, { status: 400 });

  if (supabase) {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("provider_order_id", orderId)
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
  }

  try {
    const data = await handleCheck(orderId, session.user.id);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await req.json();
  const orderId = body.orderId || body.order_id || "";
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  if (supabase) {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("provider_order_id", orderId)
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
  }

  try {
    const data = await handleCheck(orderId, session.user.id);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
