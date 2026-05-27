import Hero from "@/components/sections/Hero";

export const metadata = {
  title: "Terms of Service - GetSMSNow",
  description: "GetSMSNow terms of service. Rules governing the use of our SMS activation and virtual number services.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Hero
        title="Terms of Service"
        subtitle="Terms governing the use of GetSMSNow services"
        variant="inner"
        showSearchForm={false}
      />
      <section className="py-16 md:py-20">
        <div className="container-custom max-w-3xl prose prose-neutral dark:prose-invert">
          <p className="text-muted-foreground">Last updated: January 2025</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By using GetSMSNow, you agree to these Terms of Service. If you do not agree, do not use our services.
          </p>

          <h2>2. Description of Services</h2>
          <p>
            GetSMSNow provides temporary phone numbers for SMS activation and verification. You pay for numbers and receive SMS codes. Prices are displayed before purchase. Payment is deducted from your account balance.
          </p>

          <h2>3. Account and Registration</h2>
          <p>
            You must create an account to use paid services. You are responsible for keeping your credentials secure. You must provide accurate information. We may suspend or terminate accounts that violate these terms.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>
            You may not use our services for illegal activities, fraud, spam, harassment, or to violate any third party&apos;s terms. We reserve the right to refuse service and block accounts that misuse our platform.
          </p>

          <h2>5. Payments and Balance</h2>
          <p>
            You deposit funds into your account balance. Funds are used for SMS orders. Unused balance remains in your account. Refunds are subject to our Refund Policy.
          </p>

          <h2>6. No Warranty</h2>
          <p>
            Our services are provided &quot;as is.&quot; We do not guarantee availability, delivery time, or success of SMS reception. Numbers may become unavailable. We are not liable for losses arising from service unavailability.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            Our liability is limited to the amount you paid for the specific order in question. We are not liable for indirect, incidental, or consequential damages.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            GetSMSNow and its branding are our property. You may not copy, modify, or use our trademarks without permission.
          </p>

          <h2>9. Termination</h2>
          <p>
            We may terminate your account at any time for violation of these terms. You may close your account by contacting us. Unused balance may be refunded per our Refund Policy.
          </p>

          <h2>10. Changes</h2>
          <p>
            We may update these terms. Continued use after changes constitutes acceptance. Significant changes will be communicated via email or site notice.
          </p>

          <h2>11. Contact</h2>
          <p>
            For questions, contact us via our Telegram channel linked in the footer.
          </p>
        </div>
      </section>
    </>
  );
}
