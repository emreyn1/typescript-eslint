import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "PrivacyCards";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3002";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | No-KYC Virtual Cards`,
  description:
    "Buy virtual Visa/Mastercard cards instantly with crypto. No KYC, no ID required. Online & offline payments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
