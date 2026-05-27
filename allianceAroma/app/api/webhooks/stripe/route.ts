import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { sendOrderConfirmation } from "@/lib/email"
import { products } from "@/lib/data/products"
import Stripe from "stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function resolveProductId(lineItem: Stripe.LineItem): string | null {
  const product = lineItem.price?.product
  const metaId =
    typeof product === "object" && product && "metadata" in product
      ? (product.metadata as Record<string, string>)?.product_id
      : null
  if (metaId && metaId !== "tax") return metaId

  const desc = lineItem.description || ""
  const found = products.find(
    (p) => desc.includes(p.name) || p.name.includes(desc.split(" - ")[0])
  )
  return found?.id || null
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const total = (session.amount_total || 0) / 100
  const paymentId = session.payment_intent as string

  if (!userId) {
    console.error("No user_id in session metadata")
    return
  }

  const { data: existingOrder } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("stripe_payment_id", paymentId)
    .maybeSingle()

  if (existingOrder) return

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  })

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: userId,
      total,
      status: "paid",
      stripe_payment_id: paymentId,
    })
    .select("id")
    .single()

  if (orderError || !order) {
    console.error("Failed to create order:", orderError)
    throw new Error(`Order creation failed: ${orderError?.message}`)
  }

  const productItems = lineItems.data.filter((item) => {
    const product = item.price?.product
    const metaId =
      typeof product === "object" && product && "metadata" in product
        ? (product.metadata as Record<string, string>)?.product_id
        : null
    return metaId !== "tax"
  })

  if (productItems.length > 0) {
    const items = productItems.map((item) => ({
      order_id: order.id,
      product_id: resolveProductId(item),
      quantity: item.quantity || 1,
      unit_price: (item.amount_total || 0) / 100 / (item.quantity || 1),
    }))

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(items)
    if (itemsError) {
      console.error("Failed to insert order items:", itemsError)
    }
  }

  const { error: commissionError } = await supabaseAdmin.rpc(
    "calculate_commissions",
    { p_order_id: order.id, p_order_total: total }
  )

  if (commissionError) {
    console.error("Commission calculation failed:", commissionError)
  }

  if (session.customer_email) {
    try {
      await sendOrderConfirmation({
        to: session.customer_email,
        orderNumber: order.id,
        total: `${total.toFixed(2)} AED`,
        items: productItems.map((item) => ({
          name: item.description || "Product",
          quantity: item.quantity || 1,
          price: `${((item.amount_total || 0) / 100).toFixed(2)} AED`,
        })),
      })
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError)
    }
  }
}

async function handleRefundOrDispute(paymentIntentId: string) {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("stripe_payment_id", paymentIntentId)
    .maybeSingle()

  if (!order) {
    console.error("No order found for refunded payment:", paymentIntentId)
    return
  }

  const { error } = await supabaseAdmin.rpc("cancel_order_commissions", {
    p_order_id: order.id,
  })

  if (error) {
    console.error("Failed to cancel commissions:", error)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook signature verification failed:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutCompleted(session)
      break
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge
      const piId = typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id
      if (piId) await handleRefundOrDispute(piId)
      break
    }

    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute
      const chargeId = typeof dispute.charge === "string"
        ? dispute.charge
        : dispute.charge?.id
      if (chargeId) {
        const charge = await stripe.charges.retrieve(chargeId as string)
        const piId = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id
        if (piId) await handleRefundOrDispute(piId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
