export const metadata = {
  title: 'Privacy Policy | PryCard',
  description: 'How PryCard protects your privacy and handles your data.',
};

export default function PrivacyPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: May 2026</p>

        <section className="space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Our Commitment</h2>
            <p>
              PryCard is built on a privacy-first foundation. We minimize data collection,
              encrypt sensitive information, and do not sell your personal data to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Information We Collect</h2>
            <p>
              We collect only what is necessary to operate the service: email address for account
              access, transaction records required for card operations, and payment references for
              crypto top-ups.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Data Retention</h2>
            <p>
              We retain data only as long as required for legal compliance and service operation.
              You may request account deletion by contacting support.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Security</h2>
            <p>
              All sensitive data is encrypted in transit and at rest. We use industry-standard
              security practices including secure payment processing via Cryptomus.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
            <p>
              For privacy-related inquiries, contact us through our support channels listed on the
              About page.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
