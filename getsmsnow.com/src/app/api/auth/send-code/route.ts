import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { Resend } from "resend";
import { verificationCodeEmail } from "@/lib/email-templates";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, turnstileToken, purpose } = body as {
      email?: string;
      turnstileToken?: string;
      purpose?: "register" | "login";
    };
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const normalizedEmail = String(email).toLowerCase().trim();

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json({ error: "Security check required" }, { status: 400 });
      }
      const valid = await verifyTurnstileToken(turnstileToken);
      if (!valid) {
        return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
      }
    }

    if (!supabase) {
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    // Enterprise: invalidate previous unused codes so only the latest code is valid.
    await supabase.from("verification_codes").update({ used: true }).eq("email", normalizedEmail).eq("used", false);
    await supabase.from("verification_codes").insert({
      email: normalizedEmail,
      code,
      expires_at: expiresAt.toISOString(),
    });

    if (resend) {
      const { subject, html } = verificationCodeEmail({
        code,
        recipientEmail: normalizedEmail,
        purpose: purpose ?? "login",
      });
      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM ?? "GetSMSNow <onboarding@resend.dev>",
        to: normalizedEmail,
        subject,
        html,
      });
      if (sendError) {
        console.error("[Resend] Failed to send code:", sendError);
        return NextResponse.json(
          { error: "Failed to send verification code. Please check your email address or try again later." },
          { status: 500 }
        );
      }
    } else {
      console.log("[DEV] Login code for", normalizedEmail, ":", code);
    }

    return NextResponse.json({ success: true, message: "Code sent" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send code";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
