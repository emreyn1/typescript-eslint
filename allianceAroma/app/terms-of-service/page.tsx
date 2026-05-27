import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Alliance Aroma terms of service — rules and conditions for using our website.",
}

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 font-medium">1. Acceptance</h2>
          <p className="text-muted-foreground">
            By using alliancearoma.com, you agree to these terms. If you do not agree, please do not use our site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">2. Products & Orders</h2>
          <p className="text-muted-foreground">
            We sell premium fragrances. Prices are in AED. We reserve the right to correct pricing errors and to limit quantities. Orders are subject to availability.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">3. Affiliate Program</h2>
          <p className="text-muted-foreground">
            Our affiliate program allows you to earn commissions on referred sales. You must comply with our referral rules and not engage in self-referral or fraud. We may modify or suspend the program at any time.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">4. Shipping & Returns</h2>
          <p className="text-muted-foreground">
            Shipping is available within the UAE. Delivery times vary. For returns or refunds, please contact us. Perfume products may be subject to hygiene restrictions for returns.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">5. Privacy & Data</h2>
          <p className="text-muted-foreground">
            Your use of our site is also governed by our{" "}
            <Link href="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>, which explains how we collect, use, and protect your data. By using our site, you consent to our privacy practices.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">6. Account & Security</h2>
          <p className="text-muted-foreground">
            You are responsible for keeping your account credentials secure. You must provide accurate information. We may suspend or terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">7. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            Alliance Aroma and its partners are not liable for indirect, incidental, or consequential damages arising from your use of the site or products. Our liability is limited to the amount you paid for the relevant order.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">8. Governing Law</h2>
          <p className="text-muted-foreground">
            These terms are governed by the laws of the United Arab Emirates. Disputes shall be resolved in the courts of Dubai.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">9. Changes</h2>
          <p className="text-muted-foreground">
            We may update these terms from time to time. Continued use of the site after changes constitutes acceptance. Check this page periodically for updates.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium">10. Contact</h2>
          <p className="text-muted-foreground">
            IBIS Business Center, 3rd Floor Office #64, Al Rigga, Dubai, UAE.
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
