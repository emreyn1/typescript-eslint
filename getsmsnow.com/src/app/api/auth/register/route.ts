import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyTurnstileToken } from "@/lib/turnstile";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { verificationCodeEmail } from "@/lib/email-templates";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateReferralCode(): string {
  return "GS" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username, turnstileToken } = body as {
      email?: string;
      password?: string;
      username?: string;
      turnstileToken?: string;
    };
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
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
      return NextResponse.json(
        {
          error:
            "Auth not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your deployment environment (e.g. Vercel).",
        },
        { status: 503 }
      );
    }

    const { data: existing } = await supabase.from("users").select("id").eq("email", normalizedEmail).single();
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    // Invalidate previous codes so only the latest is valid (same as send-code)
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
        purpose: "register",
      });
      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM ?? "GetSMSNow <onboarding@resend.dev>",
        to: normalizedEmail,
        subject,
        html,
      });
      if (sendError) {
        console.error("[Resend] Failed to send verification email:", sendError);
        return NextResponse.json(
          { error: "Failed to send verification email. Please check your email address or try again later." },
          { status: 500 }
        );
      }
    } else {
      console.log("[DEV] Verification code for", normalizedEmail, ":", code);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode();
    const { error: userError } = await supabase.from("users").insert({
      email: normalizedEmail,
      name: username || normalizedEmail.split("@")[0],
      password_hash: passwordHash,
      referral_code: referralCode,
    });

    if (userError) {
      console.error("[register] User insert failed:", userError);
      return NextResponse.json(
        { error: "Registration failed. Please try again or use a different email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Check your email for verification code" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
