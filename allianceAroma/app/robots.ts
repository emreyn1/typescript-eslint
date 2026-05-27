import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alliancearoma.com"
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout/", "/auth/", "/api/", "/cart", "/affiliate"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/checkout/", "/auth/", "/api/", "/cart"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
