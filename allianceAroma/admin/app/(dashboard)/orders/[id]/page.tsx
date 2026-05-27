import { requireAdmin } from "@/lib/auth/admin-check"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

async function updateOrderStatus(formData: FormData) {
  "use server"
  await requireAdmin()
  const admin = createAdminClient()
  const orderId = formData.get("orderId") as string
  const newStatus = formData.get("status") as string

  await admin
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  revalidatePath(`/orders/${orderId}`)
}

export default async function OrderDetailPage({ params }: Props) {
  await requireAdmin()
  const admin = createAdminClient()
  const { id } = await params

  const { data: order } = await admin
    .from("orders")
    .select("*, profiles(full_name, email)")
    .eq("id", id)
    .single()

  if (!order) notFound()

  const { data: items } = await admin
    .from("order_items")
    .select("*, products(name, slug)")
    .eq("order_id", id)

  const { data: commissions } = await admin
    .from("commissions")
    .select("*, profiles(full_name, email)")
    .eq("order_id", id)
    .order("level", { ascending: true })

  const statuses = ["pending", "paid", "shipped", "delivered", "cancelled"]

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/orders"
          className="text-sm text-[hsl(var(--muted-foreground))] hover:underline"
        >
          &larr; Orders
        </Link>
        <h1 className="text-2xl font-bold">Order Detail</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Info */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-white p-6">
          <h2 className="mb-4 font-semibold">Order Information</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Order ID</dt>
              <dd className="font-mono text-xs">{order.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Customer</dt>
              <dd>{(order as any).profiles?.full_name || "Unknown"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Email</dt>
              <dd>{(order as any).profiles?.email || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Total</dt>
              <dd className="font-semibold">
                {formatPrice(Number(order.total))}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Date</dt>
              <dd>{new Date(order.created_at).toLocaleString()}</dd>
            </div>
            {order.stripe_payment_id && (
              <div className="flex justify-between">
                <dt className="text-[hsl(var(--muted-foreground))]">
                  Stripe ID
                </dt>
                <dd className="font-mono text-xs">
                  {order.stripe_payment_id}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Status Update */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-white p-6">
          <h2 className="mb-4 font-semibold">Update Status</h2>
          <p className="mb-3 text-sm">
            Current status:{" "}
            <StatusBadge status={order.status} />
          </p>
          <div className="flex flex-wrap gap-2">
            {statuses
              .filter((s) => s !== order.status)
              .map((s) => (
                <form key={s} action={updateOrderStatus}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    className="rounded-md border border-[hsl(var(--border))] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[hsl(var(--accent))]"
                  >
                    Mark as {s}
                  </button>
                </form>
              ))}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-6 rounded-lg border border-[hsl(var(--border))] bg-white">
        <div className="border-b border-[hsl(var(--border))] px-6 py-4">
          <h2 className="font-semibold">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-left">
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Product
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Qty
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Unit Price
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {(!items || items.length === 0) ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    No items
                  </td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-b border-[hsl(var(--border))] last:border-0"
                  >
                    <td className="px-6 py-3">
                      {item.products?.name || "Deleted product"}
                    </td>
                    <td className="px-6 py-3">{item.quantity}</td>
                    <td className="px-6 py-3">
                      {formatPrice(Number(item.unit_price))}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {formatPrice(item.quantity * Number(item.unit_price))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commissions */}
      <div className="mt-6 rounded-lg border border-[hsl(var(--border))] bg-white">
        <div className="border-b border-[hsl(var(--border))] px-6 py-4">
          <h2 className="font-semibold">Commissions from this Order</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-left">
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Level
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Affiliate
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Amount
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {(!commissions || commissions.length === 0) ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    No commissions
                  </td>
                </tr>
              ) : (
                commissions.map((c: any) => (
                  <tr
                    key={c.id}
                    className="border-b border-[hsl(var(--border))] last:border-0"
                  >
                    <td className="px-6 py-3">Level {c.level}</td>
                    <td className="px-6 py-3">
                      {c.profiles?.full_name || "Unknown"}{" "}
                      <span className="text-[hsl(var(--muted-foreground))]">
                        ({c.profiles?.email})
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {formatPrice(Number(c.amount))}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
    processing: "bg-orange-100 text-orange-800",
  }
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  )
}
