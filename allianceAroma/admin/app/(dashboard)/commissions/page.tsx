import { requireAdmin } from "@/lib/auth/admin-check"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import Link from "next/link"

interface Props {
  searchParams: Promise<{ status?: string }>
}

async function bulkMarkPaid(formData: FormData) {
  "use server"
  await requireAdmin()
  const admin = createAdminClient()

  const ids = formData.getAll("commission_ids") as string[]
  if (ids.length === 0) return

  await admin
    .from("commissions")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .in("id", ids)

  revalidatePath("/commissions")
}

async function updateCommissionStatus(formData: FormData) {
  "use server"
  await requireAdmin()
  const admin = createAdminClient()

  const id = formData.get("id") as string
  const newStatus = formData.get("status") as string

  const updateData: Record<string, any> = { status: newStatus }
  if (newStatus === "paid") {
    updateData.paid_at = new Date().toISOString()
  }

  await admin.from("commissions").update(updateData).eq("id", id)
  revalidatePath("/commissions")
}

export default async function CommissionsPage({ searchParams }: Props) {
  await requireAdmin()
  const admin = createAdminClient()
  const { status } = await searchParams

  let query = admin
    .from("commissions")
    .select(
      "id, affiliate_id, order_id, level, amount, order_total, status, created_at, paid_at, profiles(full_name, email)"
    )
    .order("created_at", { ascending: false })
    .limit(200)

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  const { data: commissions } = await query

  const statuses = ["all", "pending", "processing", "paid", "cancelled"]

  const pendingCommissions = (commissions || []).filter(
    (c: any) => c.status === "pending" || c.status === "processing"
  )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Commissions</h1>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {statuses.map((s) => (
            <Link
              key={s}
              href={
                s === "all" ? "/commissions" : `/commissions?status=${s}`
              }
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
      </div>

      <form action={bulkMarkPaid}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {pendingCommissions.length} unpaid commission(s)
          </p>
          {pendingCommissions.length > 0 && (
            <button
              type="submit"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Mark Selected as Paid
            </button>
          )}
        </div>

        <div className="rounded-lg border border-[hsl(var(--border))] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-left">
                  <th className="px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                    Date
                  </th>
                  <th className="px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                    Affiliate
                  </th>
                  <th className="px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                    Level
                  </th>
                  <th className="px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                    Order Total
                  </th>
                  <th className="px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                    Commission
                  </th>
                  <th className="px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(!commissions || commissions.length === 0) ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]"
                    >
                      No commissions found
                    </td>
                  </tr>
                ) : (
                  commissions.map((c: any) => (
                    <tr
                      key={c.id}
                      className="border-b border-[hsl(var(--border))] last:border-0"
                    >
                      <td className="px-4 py-3">
                        {(c.status === "pending" ||
                          c.status === "processing") && (
                          <input
                            type="checkbox"
                            name="commission_ids"
                            value={c.id}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/users/${c.affiliate_id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {c.profiles?.full_name || "Unknown"}
                        </Link>
                        <br />
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {c.profiles?.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">Level {c.level}</td>
                      <td className="px-4 py-3">
                        {formatPrice(Number(c.order_total))}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatPrice(Number(c.amount))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        {c.status !== "paid" && c.status !== "cancelled" && (
                          <div className="flex gap-1">
                            <form action={updateCommissionStatus}>
                              <input type="hidden" name="id" value={c.id} />
                              <input
                                type="hidden"
                                name="status"
                                value="paid"
                              />
                              <button
                                type="submit"
                                className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                              >
                                Pay
                              </button>
                            </form>
                            <form action={updateCommissionStatus}>
                              <input type="hidden" name="id" value={c.id} />
                              <input
                                type="hidden"
                                name="status"
                                value="cancelled"
                              />
                              <button
                                type="submit"
                                className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </button>
                            </form>
                          </div>
                        )}
                        {c.status === "paid" && c.paid_at && (
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            Paid{" "}
                            {new Date(c.paid_at).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-orange-100 text-orange-800",
    paid: "bg-green-100 text-green-800",
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
