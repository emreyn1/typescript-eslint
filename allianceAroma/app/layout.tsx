import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { Playfair_Display } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { CartProvider } from "@/lib/context/cart-context"
import { AuthProvider } from "@/lib/context/auth-context"
import { AffiliateProvider } from "@/lib/context/affiliate-context"
import { PostHogProvider } from "@/lib/posthog/provider"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-playfair" })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alliancearoma.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Alliance Aroma — Premium Fragrances | Dubai, UAE",
    template: "%s | Alliance Aroma",
  },
  description:
    "Alliance Aroma — premium perfumes by Genie Collection. Luxury fragrances crafted from the finest European oils. 25ml from 35 AED, 85ml from 120 AED. Based in Dubai, UAE.",
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: siteUrl,
    siteName: "Alliance Aroma",
    title: "Alliance Aroma — Premium Fragrances | Dubai, UAE",
    description: "Premium perfumes by Genie Collection. Luxury fragrances crafted from the finest European oils. Join our affiliate program and earn.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alliance Aroma — Premium Fragrances",
    description: "Premium perfumes by Genie Collection. Luxury fragrances from Dubai, UAE.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: "#FAF9F6",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Alliance Aroma",
  description: "Premium perfumes by Genie Collection — luxury fragrances crafted from the finest European oils, based in Dubai, UAE.",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "IBIS Business Center, 3rd Floor Office #64",
    addressLocality: "Al Rigga, Dubai",
    addressCountry: "AE",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${playfair.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PostHogProvider>
          <AuthProvider>
            <CartProvider>
              <AffiliateProvider>
                <div className="flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>
                <Toaster />
              </AffiliateProvider>
            </CartProvider>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
