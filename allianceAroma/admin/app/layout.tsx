import type { Metadata } from "next"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Alliance Aroma Admin",
  description: "Admin panel for Alliance Aroma",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
