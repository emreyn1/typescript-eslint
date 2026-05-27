import { requireAdmin } from "@/lib/auth/admin-check"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function UsersPage({ searchParams }: Props) {
  await requireAdmin()
  const admin = createAdminClient()
  const { q } = await searchParams

  let query = admin
    .from("profiles")
    .select(
      "id, full_name, email, is_affiliate, package_type, current_rank, role, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200)

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: users } = await query

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Users</h1>

      <form className="mb-4">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Search by name or email..."
            className="w-full max-w-sm rounded-md border border-[hsl(var(--input))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
          <button
            type="submit"
            className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(var(--primary)/0.9)]"
          >
            Search
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-[hsl(var(--border))] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-left">
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Name
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Email
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Role
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Affiliate
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Package
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Rank
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Joined
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(!users || users.length === 0) ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr
                    key={user.id}
                    className="border-b border-[hsl(var(--border))] last:border-0"
                  >
                    <td className="px-6 py-3 font-medium">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-3 text-[hsl(var(--muted-foreground))]">
                      {user.email}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.role === "admin" || user.role === "super_admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {user.is_affiliate ? (
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="text-[hsl(var(--muted-foreground))]">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 capitalize">
                      {user.package_type || "—"}
                    </td>
                    <td className="px-6 py-3">
                      {user.current_rank || "—"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/users/${user.id}`}
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
