import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body as { email?: string; code?: string };
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    // Normalize code: strip spaces/dashes, keep only digits (e.g. "123 456" -> "123456")
    const codeStr = String(code).replace(/\D/g, "");

    if (codeStr.length !== 6) {
      return NextResponse.json({ error: "Enter a valid 6-digit code" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
    }

    // Single active code per email (send-code invalidates previous). Enterprise: no brute-force via multiple codes.
    const { data: vc, error: dbError } = await supabase
      .from("verification_codes")
      .select("id, email, used, expires_at, code")
      .eq("email", normalizedEmail)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dbError) {
      console.error("[verify-email] Supabase error:", dbError);
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
    }

    const dbCode = vc ? String(vc.code).replace(/\D/g, "") : "";
    const codeMatch = vc ? dbCode === codeStr : false;
    const isExpired = vc ? new Date(vc.expires_at) < new Date() : true;

    if (process.env.NODE_ENV === "development") {
      console.log("[verify-email] Debug:", {
        email: normalizedEmail,
        foundRow: !!vc,
        codeMatch,
        isExpired,
        receivedLength: codeStr.length,
        dbCodeLength: dbCode.length,
      });
    }

    if (!vc || !codeMatch || isExpired) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (!existingUser) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    await supabase.from("verification_codes").update({ used: true }).eq("id", vc.id);
    const { error: updateError } = await supabase
      .from("users")
      .update({ email_verified: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("email", normalizedEmail);

    if (updateError) {
      console.error("[verify-email] User update failed:", updateError);
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


