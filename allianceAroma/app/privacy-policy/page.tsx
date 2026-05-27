import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Alliance Aroma privacy policy — how we collect, use, and protect your data.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 font-medium">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information you provide when creating an account (name, email, password), placing orders (shipping address, payment details), and when you sign in with Google or Facebook. We also collect referral and affiliate data if you join our affiliate program.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">2. How We Use Your Data</h2>
          <p className="text-muted-foreground">
            We use your data to process orders, manage your account, run the affiliate program, send transactional emails (order confirmations, password resets), and improve our services. We do not sell your personal information.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">3. Third-Party Services</h2>
          <p className="text-muted-foreground">
            We use Supabase (authentication and database), Stripe (payments), Resend (emails), and analytics tools. These providers have their own privacy policies. When you sign in with Google or Facebook, their policies also apply.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">4. Cookies</h2>
          <p className="text-muted-foreground">
            We use essential cookies for authentication and session management. We may use analytics cookies to understand how visitors use our site.
          </p>
        </section>

        <section id="data-deletion">
          <h2 className="mb-2 font-medium">5. Your Rights & Data Deletion</h2>
          <p className="text-muted-foreground">
            You may request access to, correction of, or deletion of your personal data. To request deletion, contact us at the email below with your account email. We will process your request within 30 days. If you are in the EU/EEA, you have additional rights under GDPR.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">6. Contact</h2>
          <p className="text-muted-foreground">
            For privacy-related questions, contact us at: IBIS Business Center, 3rd Floor Office #64, Al Rigga, Dubai, UAE. Or email via our contact form. See also our{" "}
            <Link href="/terms-of-service" className="underline hover:text-foreground">Terms of Service</Link>.
          </p>
        </section>
      </div>

      <p className="mt-12">
        <Link href="/" className="text-sm text-muted-foreground underline hover:text-foreground">
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
