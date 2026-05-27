import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabase } from "@/lib/supabase";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function verifyTelegramAuth(dataCheckString: string, hash: string): Record<string, string> | null {
  if (!TELEGRAM_BOT_TOKEN) return null;
  const secretKey = crypto.createHash("sha256").update(TELEGRAM_BOT_TOKEN).digest();
  const check = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (check !== hash) return null;
  const obj: Record<string, string> = {};
  for (const line of dataCheckString.split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0) obj[line.slice(0, eq)] = line.slice(eq + 1);
  }
  return obj;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Receives Telegram Login Widget auth data, verifies hash, returns one-time token for Credentials sign-in.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hash, ...authData } = body as Record<string, string>;
    if (!hash) return NextResponse.json({ error: "Missing hash" }, { status: 400 });

    const sorted = Object.keys(authData)
      .filter((k) => k !== "hash")
      .sort()
      .map((k) => `${k}=${authData[k]}`)
      .join("\n");
    const verified = verifyTelegramAuth(sorted, hash);
    if (!verified) return NextResponse.json({ error: "Invalid Telegram auth" }, { status: 401 });

    if (!TELEGRAM_BOT_TOKEN) return NextResponse.json({ error: "Telegram not configured" }, { status: 503 });
    if (!supabase) return NextResponse.json({ error: "Auth not configured" }, { status: 503 });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await supabase.from("telegram_login_tokens").insert({
      token,
      telegram_id: verified.id,
      first_name: verified.first_name ?? null,
      last_name: verified.last_name ?? null,
      username: verified.username ?? null,
      photo_url: verified.photo_url ?? null,
      expires_at: expiresAt.toISOString(),
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
