"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAuth } from "@/lib/context/auth-context"
import { TurnstileWidget, getTurnstileToken } from "@/components/auth/turnstile-widget"
import { Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
    </svg>
  )
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, signInWithGoogle, signInWithFacebook } = useAuth()
  const [serverError, setServerError] = useState(searchParams.get("error") || "")
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setServerError("")

    const token = getTurnstileToken()
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (siteKey) {
      if (!token) {
        setServerError("Please complete the verification.")
        return
      }
      const verifyRes = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const { success } = await verifyRes.json()
      if (!success) {
        setServerError("Verification failed. Please try again.")
        return
      }
    }

    const result = await login(values.email, values.password)

    if (result.success) {
      const redirect = searchParams.get("redirect") || "/"
      router.replace(redirect)
    } else {
      setServerError(result.error || "Login failed")
    }
  }

  async function handleGoogleLogin() {
    setServerError("")
    setOauthLoading("google")
    try {
      await signInWithGoogle()
    } catch {
      setServerError("Failed to connect with Google. Please try again.")
      setOauthLoading(null)
    }
  }

  async function handleFacebookLogin() {
    setServerError("")
    setOauthLoading("facebook")
    try {
      await signInWithFacebook()
    } catch {
      setServerError("Failed to connect with Facebook. Please try again.")
      setOauthLoading(null)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <Link href="/" className="font-serif text-2xl tracking-[0.3em]">AllianceAroma</Link>
        <h1 className="mt-6 font-serif text-2xl">Welcome Back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-sm bg-destructive/10 p-3 text-center text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full border-border bg-card text-foreground hover:bg-secondary"
          onClick={handleGoogleLogin}
          disabled={oauthLoading !== null || form.formState.isSubmitting}
        >
          {oauthLoading === "google" ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-5 w-5" />
          )}
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full border-border bg-[#1877F2] text-white hover:bg-[#166FE5]"
          onClick={handleFacebookLogin}
          disabled={oauthLoading !== null || form.formState.isSubmitting}
        >
          {oauthLoading === "facebook" ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <FacebookIcon className="mr-2 h-5 w-5" />
          )}
          Continue with Facebook
        </Button>
      </div>

      <div className="relative my-6">
        <Separator className="bg-border" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground">
          or
        </span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="mt-1.5 bg-card text-foreground border-border"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="mt-1.5 bg-card text-foreground border-border"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <TurnstileWidget theme="light" size="normal" />

          <Button
            type="submit"
            className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 tracking-wider"
            size="lg"
            disabled={form.formState.isSubmitting || oauthLoading !== null}
          >
            {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <Separator className="my-6 bg-border" />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
