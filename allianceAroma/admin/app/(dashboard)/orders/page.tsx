import { requireAdmin } from "@/lib/auth/admin-check"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function OrdersPage({ searchParams }: Props) {
  await requireAdmin()
  const admin = createAdminClient()
  const { status } = await searchParams

  let query = admin
    .from("orders")
    .select("id, total, status, created_at, stripe_payment_id, user_id, profiles(full_name, email)")
    .order("created_at", { ascending: false })

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  const { data: orders } = await query

  const statuses = ["all", "pending", "paid", "shipped", "delivered", "cancelled"]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      <div className="mb-4 flex gap-2">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/orders" : `/orders?status=${s}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              (s === "all" && !status) || status === s
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-white text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-[hsl(var(--border))] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-left">
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Date
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Customer
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Email
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Total
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Status
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(!orders || orders.length === 0) ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="border-b border-[hsl(var(--border))] last:border-0"
                  >
                    <td className="px-6 py-3 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      {order.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="px-6 py-3 text-[hsl(var(--muted-foreground))]">
                      {order.profiles?.email || "—"}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        View
                      </Link>
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
  }
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  )
}
