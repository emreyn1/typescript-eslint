import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "AllianceAroma <noreply@alliancearoma.com>"

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function sendOrderConfirmation(params: {
  to: string
  orderNumber: string
  total: string
  items: { name: string; quantity: number; price: string }[]
}) {
  const itemRows = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(item.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${escapeHtml(item.price)}</td>
        </tr>`
    )
    .join("")

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Order Confirmed — ${params.orderNumber}`,
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0;border-bottom:2px solid #B8860B">
          <h1 style="font-size:24px;font-weight:400;letter-spacing:4px;margin:0">ALLIANCEAROMA</h1>
        </div>
        <div style="padding:32px 24px">
          <h2 style="font-size:20px;font-weight:400;margin:0 0 8px">Thank you for your order</h2>
          <p style="color:#666;margin:0 0 24px">Order <strong>${escapeHtml(params.orderNumber)}</strong> has been confirmed.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead>
              <tr style="border-bottom:2px solid #1a1a1a">
                <th style="padding:8px 0;text-align:left">Item</th>
                <th style="padding:8px 0;text-align:center">Qty</th>
                <th style="padding:8px 0;text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="text-align:right;padding:16px 0;font-size:18px;font-weight:600">
            Total: ${escapeHtml(params.total)}
          </div>
          <p style="color:#666;font-size:13px;margin:24px 0 0">
            We'll send you a shipping confirmation once your order is on its way.
          </p>
        </div>
        <div style="text-align:center;padding:24px;background:#FAF9F6;font-size:12px;color:#999">
          &copy; ${new Date().getFullYear()} AllianceAroma. All rights reserved.
        </div>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(params: {
  to: string
  name: string
  referralCode: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "Welcome to AllianceAroma",
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0;border-bottom:2px solid #B8860B">
          <h1 style="font-size:24px;font-weight:400;letter-spacing:4px;margin:0">ALLIANCEAROMA</h1>
        </div>
        <div style="padding:32px 24px">
          <h2 style="font-size:20px;font-weight:400;margin:0 0 16px">Welcome, ${escapeHtml(params.name)}</h2>
          <p style="color:#666;line-height:1.6">
            Thank you for joining AllianceAroma. Discover our exquisite collection of artisanal fragrances
            crafted from the world's finest ingredients.
          </p>
          <div style="background:#FAF9F6;border:1px solid #eee;border-radius:4px;padding:20px;margin:24px 0;text-align:center">
            <p style="margin:0 0 8px;font-size:13px;color:#666">YOUR REFERRAL CODE</p>
            <p style="margin:0;font-size:24px;font-weight:600;letter-spacing:2px;color:#B8860B">${escapeHtml(params.referralCode)}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#666">Share with friends &amp; earn commissions on every purchase</p>
          </div>
        </div>
        <div style="text-align:center;padding:24px;background:#FAF9F6;font-size:12px;color:#999">
          &copy; ${new Date().getFullYear()} AllianceAroma. All rights reserved.
        </div>
      </div>
    `,
  })
}
