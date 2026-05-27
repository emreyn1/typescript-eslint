import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import ActiveOrders from "@/components/ActiveOrders";

export const metadata: Metadata = {
  title: "GetSMSNow — Instant SMS Verification | 120+ Countries",
  description:
    "Get temporary phone numbers for SMS verification in 120+ countries. Real non-VoIP numbers, instant delivery, pay with crypto. No KYC required.",
  keywords: [
    "SMS verification",
    "temporary phone number",
    "receive SMS online",
    "virtual number",
    "crypto payment",
    "no KYC",
    "non-VoIP number",
  ],
  openGraph: {
    title: "GetSMSNow — Instant SMS Verification",
    description: "Temporary phone numbers in 120+ countries. Pay with crypto, no KYC.",
    url: "https://getsmsnow.com",
    siteName: "GetSMSNow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetSMSNow — Instant SMS Verification",
    description: "Temporary phone numbers in 120+ countries. Pay with crypto, no KYC.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ActiveOrders />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
