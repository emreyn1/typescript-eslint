"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Turnstile from "react-turnstile";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const passwordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const codeSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  code: z.string().min(6, { message: "Enter the 6-digit code" }),
});

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"password" | "code">("password");
  const [codeSent, setCodeSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const justVerified = searchParams.get("verified") === "1";

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { email: "", code: "" },
  });

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the security check");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        turnstileToken: turnstileToken ?? undefined,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password. If you just registered, verify your email first.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const onCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the security check");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await signIn("email-code", {
        email: values.email,
        code: values.code,
        turnstileToken: turnstileToken ?? undefined,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid or expired code. If you just registered, verify your email first.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const sendCode = async () => {
    const email = mode === "password" ? passwordForm.getValues("email") : codeForm.getValues("email");
    if (!email) {
      setError("Enter your email first");
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the security check");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken: turnstileToken ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCodeSent(true);
      setMode("code");
      codeForm.setValue("email", email);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  const onTelegramAuth = useCallback(async (user: { id: string; first_name?: string; last_name?: string; username?: string; photo_url?: string; auth_date?: number; hash?: string }) => {
    if (!user.hash) {
      setError("Invalid Telegram data");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const verifyRes = await fetch("/api/auth/telegram-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(data.error ?? "Verification failed");
      const res = await signIn("telegram-token", {
        token: data.token,
        redirect: false,
      });
      if (res?.error) {
        setError("Telegram login failed");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  }, [callbackUrl, router]);

  // Telegram: show unless explicitly "DISABLED". Bot name from env or fallback "GetSMSNowBot".
  const botNameRaw = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME?.trim();
  const showTelegram = botNameRaw !== "DISABLED";
  const botName = showTelegram ? (botNameRaw && botNameRaw !== "" ? botNameRaw : "GetSMSNowBot") : null;

  useEffect(() => {
    (window as unknown as { onTelegramAuth?: typeof onTelegramAuth }).onTelegramAuth = onTelegramAuth;
  }, [onTelegramAuth]);

  // Telegram Login Widget: inject script with data-* on the same tag (required by Telegram docs).
  const telegramContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!botName || !telegramContainerRef.current) return;
    const container = telegramContainerRef.current;
    if (container.querySelector("script[data-telegram-login]")) return;
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth");
    script.setAttribute("data-request-access", "write");
    container.appendChild(script);
    return () => {
      container.querySelector("script[data-telegram-login]")?.remove();
    };
  }, [botName]);

  return (
    <div className="header-gradient min-h-screen py-12">
      <div className="container-custom max-w-md mx-auto">
        <div className="bg-background rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-1">Login to Your Account</h1>
            <p className="text-muted-foreground">Sign in with your preferred method</p>
            {justVerified && (
              <p className="mt-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-lg py-2 px-3">
                Email verified! You can now log in.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-3 h-11 border-border bg-background hover:bg-muted"
              onClick={() => signIn("google", { callbackUrl })}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            {botName && (
              <div ref={telegramContainerRef} className="flex justify-center min-h-[44px]" id="telegram-login-container" />
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
          </div>

          {mode === "password" ? (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 mt-6">
                <FormField
                  control={passwordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between text-sm">
                  <Link href="/forgot-password" className="text-GetSMSNow-blue hover:text-GetSMSNow-blue/80">
                    Forgot password?
                  </Link>
                  <button type="button" onClick={sendCode} className="text-GetSMSNow-blue hover:text-GetSMSNow-blue/80">
                    Login with code instead
                  </button>
                </div>
                {turnstileSiteKey && (
                  <div className="flex justify-center">
                    <Turnstile
                      sitekey={turnstileSiteKey}
                      onVerify={setTurnstileToken}
                      theme="auto"
                    />
                  </div>
                )}
                {error && (
                  <div className="space-y-1">
                    <p className="text-sm text-red-500">{error}</p>
                    <Link href="/verify-email" className="text-sm text-GetSMSNow-blue hover:underline">
                      Verify your email →
                    </Link>
                  </div>
                )}
                <Button type="submit" className="w-full bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...codeForm}>
              <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-6 mt-6">
                <FormField
                  control={codeForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={codeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification code</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between text-sm">
                  <button type="button" onClick={() => { setMode("password"); setCodeSent(false); }} className="text-GetSMSNow-blue hover:text-GetSMSNow-blue/80">
                    Use password instead
                  </button>
                  {!codeSent && (
                    <button type="button" onClick={sendCode} className="text-GetSMSNow-blue hover:text-GetSMSNow-blue/80">
                      Send code
                    </button>
                  )}
                  {codeSent && <span className="text-muted-foreground">Code sent</span>}
                </div>
                {turnstileSiteKey && (
                  <div className="flex justify-center">
                    <Turnstile
                      sitekey={turnstileSiteKey}
                      onVerify={setTurnstileToken}
                      theme="auto"
                    />
                  </div>
                )}
                {error && (
                  <div className="space-y-1">
                    <p className="text-sm text-red-500">{error}</p>
                    <Link href="/verify-email" className="text-sm text-GetSMSNow-blue hover:underline">
                      Verify your email →
                    </Link>
                  </div>
                )}
                <Button type="submit" className="w-full bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </Button>
              </form>
            </Form>
          )}

          <div className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/registration" className="text-GetSMSNow-blue hover:text-GetSMSNow-blue/80 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="header-gradient min-h-screen py-12 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
