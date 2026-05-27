import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { products, getProductBySlug } from "@/lib/data/products"
import { ProductDetail } from "@/components/product/product-detail"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return { title: "Product Not Found" }
  return {
    title: product.name,
    description: product.tagline,
  }
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  return <ProductDetail product={product} />
}
