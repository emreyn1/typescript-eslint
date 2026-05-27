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
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Turnstile from "react-turnstile";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (_values: z.infer<typeof formSchema>) => {
    if (turnstileSiteKey && !turnstileToken) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="header-gradient min-h-screen py-12">
      <div className="container-custom max-w-md mx-auto">
        <div className="bg-background rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-1">Forgot Password</h1>
            <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
          </div>

          {isSuccess ? (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 rounded-lg p-4 mb-6">
                <p>Reset instructions have been sent to your email.</p>
                <p className="mt-2 text-sm">Please check your inbox and follow the instructions to reset your password.</p>
              </div>

              <Button
                asChild
                className="w-full bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90"
              >
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Login
                </Link>
              </Button>
            </div>
          ) : (
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

                {turnstileSiteKey && (
                  <div className="flex justify-center">
                    <Turnstile sitekey={turnstileSiteKey} onVerify={setTurnstileToken} theme="auto" />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90"
                  disabled={isLoading || (!!turnstileSiteKey && !turnstileToken)}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm text-muted-foreground mt-6">
                  <Link
                    href="/login"
                    className="text-GetSMSNow-blue hover:text-GetSMSNow-blue/80 transition-colors font-medium flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
