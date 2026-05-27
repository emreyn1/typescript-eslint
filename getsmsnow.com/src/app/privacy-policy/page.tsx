import Hero from "@/components/sections/Hero";

export const metadata = {
  title: "Privacy Policy - GetSMSNow",
  description: "GetSMSNow privacy policy. How we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Hero
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your information"
        variant="inner"
        showSearchForm={false}
      />
      <section className="py-16 md:py-20">
        <div className="container-custom max-w-3xl prose prose-neutral dark:prose-invert">
          <p className="text-muted-foreground">Last updated: January 2025</p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly: email address, payment information (processed by third-party payment providers), and usage data (orders, balance transactions). When you sign in with Google or Telegram, we receive your profile data (name, email, photo) from those providers.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use your information to provide our SMS activation and virtual number services, process payments, manage your account and balance, send verification codes and transactional emails, and improve our services. We do not sell your personal data to third parties.
          </p>

          <h2>3. Data Storage and Security</h2>
          <p>
            Your data is stored on secure servers. We use industry-standard measures to protect your information. Passwords are hashed; payment data is handled by our payment providers (NOWPayments, Paddle) and is not stored by us.
          </p>

          <h2>4. Third-Party Services</h2>
          <p>
            We use Supabase (database), NextAuth (authentication), Resend (email), NOWPayments and Paddle (payments), and SMSPool (SMS delivery). Each has its own privacy policy. We use Google and Telegram for sign-in, which are subject to their respective policies.
          </p>

          <h2>5. Cookies and Similar Technologies</h2>
          <p>
            We use session cookies for authentication. You can disable cookies in your browser, but some features may not work.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data. Contact us via our Telegram channel for requests.
          </p>

          <h2>7. Children</h2>
          <p>
            Our services are not intended for users under 18. We do not knowingly collect data from minors.
          </p>

          <h2>8. Changes</h2>
          <p>
            We may update this policy. Changes will be posted on this page with an updated date.
          </p>

          <p className="text-muted-foreground mt-8">
            For questions, contact us via our Telegram channel linked in the footer.
          </p>
        </div>
      </section>
    </>
  );
}
