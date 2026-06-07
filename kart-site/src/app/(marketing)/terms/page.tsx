export const metadata = {
  title: 'Terms of Service | PryCard',
  description: 'Terms and conditions for using PryCard virtual crypto cards.',
};

export default function TermsPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: May 2026</p>

        <section className="space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Acceptance of Terms</h2>
            <p>
              By creating an account and using PryCard services, you agree to these Terms of
              Service. If you do not agree, do not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Service Description</h2>
            <p>
              PryCard provides virtual and physical prepaid Visa cards funded via cryptocurrency.
              Cards are subject to issuer network rules and applicable regulations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">User Responsibilities</h2>
            <p>
              You are responsible for maintaining account security, complying with applicable laws,
              and using cards only for lawful purposes. Prohibited uses include fraud, money
              laundering, and unauthorized transactions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Fees and Refunds</h2>
            <p>
              Card issuance fees are non-refundable once a card is generated. Crypto top-ups are
              final upon blockchain confirmation. Refunds may be issued at our discretion for
              failed card issuance.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Limitation of Liability</h2>
            <p>
              PryCard is provided &ldquo;as is.&rdquo; We are not liable for indirect damages, network
              outages, or third-party merchant disputes beyond our reasonable control.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
