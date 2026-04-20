import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const Schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash(password, 12);

    const refCode = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email: normalizedEmail,
        password_hash: hash,
        referral_code: refCode,
      })
      .select("id, email")
      .single();

    if (error) {
      return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }

    await supabase.from("referral_codes").insert({
      user_id: user.id,
      code: refCode,
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Registration failed" }, { status: 500 });
  }
}
