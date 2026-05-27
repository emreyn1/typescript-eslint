import { requireAdmin } from "@/lib/auth/admin-check"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

async function updateUserRole(formData: FormData) {
  "use server"
  await requireAdmin()
  const admin = createAdminClient()
  const userId = formData.get("userId") as string
  const newRole = formData.get("role") as string

  await admin
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId)

  revalidatePath(`/users/${userId}`)
}

export default async function UserDetailPage({ params }: Props) {
  await requireAdmin()
  const admin = createAdminClient()
  const { id } = await params

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!profile) notFound()

  const [ordersRes, commissionsRes] = await Promise.all([
    admin
      .from("orders")
      .select("id, total, status, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("commissions")
      .select("id, level, amount, status, created_at, order_id")
      .eq("affiliate_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  const orders = ordersRes.data || []
  const commissions = commissionsRes.data || []

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/users"
          className="text-sm text-[hsl(var(--muted-foreground))] hover:underline"
        >
          &larr; Users
        </Link>
        <h1 className="text-2xl font-bold">User Detail</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Info */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-white p-6">
          <h2 className="mb-4 font-semibold">Profile</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Name</dt>
              <dd className="font-medium">{profile.full_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Role</dt>
              <dd className="capitalize">{profile.role || "user"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">
                Affiliate
              </dt>
              <dd>{profile.is_affiliate ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">
                Referral Code
              </dt>
              <dd className="font-mono">{profile.referral_code || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Package</dt>
              <dd className="capitalize">{profile.package_type || "None"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Rank</dt>
              <dd>{profile.current_rank || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">
                Network Sales
              </dt>
              <dd>
                {formatPrice(Number(profile.total_network_sales || 0))}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Joined</dt>
              <dd>{new Date(profile.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        {/* Role Update */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-white p-6">
          <h2 className="mb-4 font-semibold">Change Role</h2>
          <form action={updateUserRole} className="space-y-4">
            <input type="hidden" name="userId" value={profile.id} />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Role</label>
              <select
                name="role"
                defaultValue={profile.role || "user"}
                className="w-full rounded-md border border-[hsl(var(--input))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(var(--primary)/0.9)]"
            >
              Update Role
            </button>
          </form>
        </div>
      </div>

      {/* Orders */}
      <div className="mt-6 rounded-lg border border-[hsl(var(--border))] bg-white">
        <div className="border-b border-[hsl(var(--border))] px-6 py-4">
          <h2 className="font-semibold">Orders ({orders.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-left">
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Date
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
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    No orders
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

      {/* Commissions */}
      <div className="mt-6 rounded-lg border border-[hsl(var(--border))] bg-white">
        <div className="border-b border-[hsl(var(--border))] px-6 py-4">
          <h2 className="font-semibold">Commissions ({commissions.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-left">
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Date
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Level
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
              {commissions.length === 0 ? (
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
                    <td className="px-6 py-3 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">Level {c.level}</td>
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
