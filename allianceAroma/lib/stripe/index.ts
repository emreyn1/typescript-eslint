import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

// Cloudflare Workers use Fetch API; node:https is not available.
// createFetchHttpClient() ensures Stripe works on Workers (avoids "connection to Stripe" retry errors).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
  httpClient: Stripe.createFetchHttpClient(),
})
