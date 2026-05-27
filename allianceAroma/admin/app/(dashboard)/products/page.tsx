import { requireAdmin } from "@/lib/auth/admin-check"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function createProduct(formData: FormData) {
  "use server"
  await requireAdmin()
  const admin = createAdminClient()

  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const price = parseFloat(formData.get("price") as string)
  const description = formData.get("description") as string
  const imageUrl = formData.get("image_url") as string

  await admin.from("products").insert({
    name,
    slug,
    price,
    description: description || null,
    image_url: imageUrl || null,
  })

  revalidatePath("/products")
  redirect("/products")
}

async function updateProduct(formData: FormData) {
  "use server"
  await requireAdmin()
  const admin = createAdminClient()

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const price = parseFloat(formData.get("price") as string)
  const description = formData.get("description") as string
  const imageUrl = formData.get("image_url") as string

  await admin
    .from("products")
    .update({
      name,
      slug,
      price,
      description: description || null,
      image_url: imageUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  revalidatePath("/products")
  redirect("/products")
}

async function deleteProduct(formData: FormData) {
  "use server"
  await requireAdmin()
  const admin = createAdminClient()
  const id = formData.get("id") as string
  await admin.from("products").delete().eq("id", id)
  revalidatePath("/products")
}

interface Props {
  searchParams: Promise<{ action?: string; edit?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  await requireAdmin()
  const admin = createAdminClient()
  const { action, edit } = await searchParams

  const { data: products } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  let editProduct: any = null
  if (edit) {
    const { data } = await admin
      .from("products")
      .select("*")
      .eq("id", edit)
      .single()
    editProduct = data
  }

  const showForm = action === "new" || !!editProduct

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        {!showForm && (
          <a
            href="/products?action=new"
            className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(var(--primary)/0.9)]"
          >
            Add Product
          </a>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-[hsl(var(--border))] bg-white p-6">
          <h2 className="mb-4 font-semibold">
            {editProduct ? "Edit Product" : "New Product"}
          </h2>
          <form
            action={editProduct ? updateProduct : createProduct}
            className="grid gap-4 sm:grid-cols-2"
          >
            {editProduct && (
              <input type="hidden" name="id" value={editProduct.id} />
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium">Name</label>
              <input
                name="name"
                required
                defaultValue={editProduct?.name || ""}
                className="w-full rounded-md border border-[hsl(var(--input))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Slug</label>
              <input
                name="slug"
                required
                defaultValue={editProduct?.slug || ""}
                className="w-full rounded-md border border-[hsl(var(--input))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="my-product-slug"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Price (AED)
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                defaultValue={editProduct?.price || ""}
                className="w-full rounded-md border border-[hsl(var(--input))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Image URL
              </label>
              <input
                name="image_url"
                defaultValue={editProduct?.image_url || ""}
                className="w-full rounded-md border border-[hsl(var(--input))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="https://..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={editProduct?.description || ""}
                className="w-full rounded-md border border-[hsl(var(--input))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>

            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(var(--primary)/0.9)]"
              >
                {editProduct ? "Update" : "Create"}
              </button>
              <a
                href="/products"
                className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--accent))]"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg border border-[hsl(var(--border))] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-left">
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Image
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Name
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Slug
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Price
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Created
                </th>
                <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(!products || products.length === 0) ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    No products yet
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr
                    key={product.id}
                    className="border-b border-[hsl(var(--border))] last:border-0"
                  >
                    <td className="px-6 py-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-[hsl(var(--muted))] text-xs text-[hsl(var(--muted-foreground))]">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-medium">{product.name}</td>
                    <td className="px-6 py-3 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                      {product.slug}
                    </td>
                    <td className="px-6 py-3">
                      {formatPrice(Number(product.price))}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/products?edit=${product.id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </a>
                        <form action={deleteProduct}>
                          <input
                            type="hidden"
                            name="id"
                            value={product.id}
                          />
                          <button
                            type="submit"
                            className="text-sm font-medium text-red-600 hover:underline"
                            onClick={(e) => {
                              if (
                                !confirm(
                                  "Are you sure you want to delete this product?"
                                )
                              ) {
                                e.preventDefault()
                              }
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
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
