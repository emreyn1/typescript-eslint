import { requireAdmin } from "@/lib/auth/admin-check"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils"
import { StatsCard } from "@/components/stats-card"
import { ShoppingCart, Users, DollarSign, Wallet } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  await requireAdmin()
  const admin = createAdminClient()

  const [ordersRes, usersRes, revenueRes, commissionsRes, recentOrdersRes] =
    await Promise.all([
      admin.from("orders").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("orders").select("total").eq("status", "paid"),
      admin
        .from("commissions")
        .select("amount")
        .in("status", ["pending", "processing", "paid"]),
      admin
        .from("orders")
        .select("id, total, status, created_at, user_id, profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const totalRevenue = (revenueRes.data || []).reduce(
    (sum, o) => sum + Number(o.total),
    0
  )
  const totalCommissions = (commissionsRes.data || []).reduce(
    (sum, c) => sum + Number(c.amount),
    0
  )

  const stats = [
    {
      title: "Total Orders",
      value: String(ordersRes.count || 0),
      icon: ShoppingCart,
    },
    {
      title: "Total Users",
      value: String(usersRes.count || 0),
      icon: Users,
    },
    {
      title: "Revenue (Paid)",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Total Commissions",
      value: formatPrice(totalCommissions),
      icon: Wallet,
    },
  ]

  const recentOrders = recentOrdersRes.data || []

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="rounded-lg border border-[hsl(var(--border))] bg-white">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link
            href="/orders"
            className="text-sm text-[hsl(var(--muted-foreground))] hover:underline"
          >
            View all
          </Link>
        </div>
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
                  Total
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="border-b border-[hsl(var(--border))] last:border-0"
                  >
                    <td className="px-6 py-3">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      {order.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="px-6 py-3">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={order.status} />
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
