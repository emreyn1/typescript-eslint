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
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import Turnstile from "react-turnstile";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  code: z
    .string()
    .transform((s) => s.replace(/\D/g, ""))
    .pipe(z.string().length(6, { message: "Enter the 6-digit code" })),
});

function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailParam || "",
      code: "",
    },
  });

  // Enterprise UX: pre-fill email when coming from registration (?email=...)
  useEffect(() => {
    if (emailParam) form.setValue("email", emailParam);
  }, [emailParam, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          code: values.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      setSuccess(true);
      setTimeout(() => router.push("/login?verified=1"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    const email = form.getValues("email");
    if (!email) {
      setError("Enter your email first");
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the security check first");
      return;
    }
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          turnstileToken: turnstileToken ?? undefined,
          purpose: "register",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send code");
      setError(null);
      form.setValue("code", "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="header-gradient min-h-screen py-12">
        <div className="container-custom max-w-md mx-auto">
          <div className="bg-background rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Email verified!</h1>
            <p className="text-muted-foreground">Your account is now active. Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="header-gradient min-h-screen py-12">
      <div className="container-custom max-w-md mx-auto">
        <div className="bg-background rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-1">Verify your email</h1>
            <p className="text-muted-foreground">
              We sent a 6-digit code to your email. Enter it below to activate your account.
              {emailParam && (
                <span className="block mt-2 text-sm font-medium text-foreground">
                  Code sent to: {emailParam}
                </span>
              )}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        maxLength={8}
                        {...field}
                        disabled={isLoading}
                        className="text-center text-lg tracking-[0.5em] font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {turnstileSiteKey && (
                <div className="flex justify-center">
                  <Turnstile
                    sitekey={turnstileSiteKey}
                    onVerify={setTurnstileToken}
                    theme="auto"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-GetSMSNow-red hover:bg-GetSMSNow-red/90"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify email"}
              </Button>

              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p>
                  Didn&apos;t receive the code? Check your spam folder, then{" "}
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={resending || isLoading}
                    className="text-GetSMSNow-blue hover:underline font-medium"
                  >
                    {resending ? "Sending..." : "Resend code"}
                  </button>
                </p>
                <p className="text-xs">
                  The code is in the email we sent. If you closed this page, open the email and enter the 6-digit code.
                </p>
              </div>

              <Button variant="ghost" asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="header-gradient min-h-screen py-12 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
