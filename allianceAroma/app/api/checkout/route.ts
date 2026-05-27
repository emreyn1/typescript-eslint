import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { products } from "@/lib/data/products"
import { z } from "zod"

const MAX_QUANTITY_PER_ITEM = 10

const CheckoutItemSchema = z.object({
  productId: z.string(),
  size: z.number(),
  quantity: z.number().int().positive().max(MAX_QUANTITY_PER_ITEM),
})

const CheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1).max(20),
  referralCode: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CheckoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { items, referralCode } = parsed.data

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    let subtotal = 0
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        throw new Error(`Product not found`)
      }

      const sizeOption = product.sizes.find((s) => s.ml === item.size)
      if (!sizeOption) {
        throw new Error(`Invalid product configuration`)
      }

      subtotal += sizeOption.price * item.quantity

      return {
        price_data: {
          currency: "aed",
          product_data: {
            name: product.name,
            description: `${sizeOption.ml}ml`,
            metadata: { product_id: product.id },
          },
          unit_amount: Math.round(sizeOption.price * 100),
        },
        quantity: item.quantity,
      }
    })

    const FREE_SHIPPING_THRESHOLD = 200
    const SHIPPING_COST = 25
    const TAX_RATE = 0.05

    const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const taxAmount = Math.round(subtotal * TAX_RATE * 100)

    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "aed",
          product_data: {
            name: "VAT (5%)",
            description: "Value Added Tax",
            metadata: { product_id: "tax" },
          },
          unit_amount: taxAmount,
        },
        quantity: 1,
      })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      ...(shippingAmount > 0
        ? {
            shipping_options: [
              {
                shipping_rate_data: {
                  display_name: "Standard Shipping",
                  type: "fixed_amount" as const,
                  fixed_amount: { amount: shippingAmount * 100, currency: "aed" },
                },
              },
            ],
          }
        : {
            shipping_options: [
              {
                shipping_rate_data: {
                  display_name: "Free Shipping",
                  type: "fixed_amount" as const,
                  fixed_amount: { amount: 0, currency: "aed" },
                },
              },
            ],
          }),
      success_url: `${siteUrl}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        referral_code: referralCode || "",
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
