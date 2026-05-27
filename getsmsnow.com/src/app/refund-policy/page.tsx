import Hero from "@/components/sections/Hero";

export const metadata = {
  title: "Refund Policy - GetSMSNow",
  description: "GetSMSNow refund policy. Our policy on refunds and cancellations for SMS orders.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <Hero
        title="Refund Policy"
        subtitle="Our policy on refunds and cancellations"
        variant="inner"
        showSearchForm={false}
      />
      <section className="py-16 md:py-20">
        <div className="container-custom max-w-3xl prose prose-neutral dark:prose-invert">
          <p className="text-muted-foreground">Last updated: January 2025</p>

          <h2>1. When Refunds Apply</h2>
          <p>
            You may cancel an active SMS order before receiving the SMS. Upon cancellation, the order amount is refunded to your account balance. This applies when:
          </p>
          <ul>
            <li>You cancel the order manually via the dashboard</li>
            <li>SMS was not received within the rental period</li>
            <li>The number became unavailable or the order failed</li>
          </ul>

          <h2>2. How Cancellation Works</h2>
          <p>
            Use the &quot;Cancel&quot; button on an active order in your dashboard. The system will cancel the order with our provider and credit the full order amount back to your balance. The refund is processed immediately.
          </p>

          <h2>3. Balance Top-Ups</h2>
          <p>
            Deposits to your account balance (via NOWPayments, Paddle, or other payment methods) are generally non-refundable once credited. If you believe a deposit was made in error or duplicated, contact us via Telegram with the transaction details.
          </p>

          <h2>4. No Refund When</h2>
          <p>
            We do not refund when:
          </p>
          <ul>
            <li>You successfully received the SMS and the order completed</li>
            <li>You cancelled after receiving the SMS</li>
            <li>The service was used in violation of our Terms of Service</li>
          </ul>

          <h2>5. Disputes</h2>
          <p>
            If you believe you are entitled to a refund that was not granted, contact us via our Telegram channel (linked in the footer) with your order ID and details. We will review and respond within a reasonable time.
          </p>

          <h2>6. Contact</h2>
          <p>
            For refund requests or questions, use our Telegram channel linked in the footer.
          </p>
        </div>
      </section>
    </>
  );
}
