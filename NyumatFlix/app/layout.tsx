import { NavbarServer } from "@/components/layout/nav/navbar-server";
import { FooterSection } from "@/components/layout/sections/footer";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { OnboardingProvider } from "@/components/providers/onboarding-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { GlobalDockProvider } from "@/components/ui/global-dock";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://movieon.to"),
  title: "MovieOn | Watch Movies and TV Shows",
  icons: {
    icon: "/favicon.ico",
  },
  description:
    "MovieOn is a free movie and tv show stream aggregator. Watch unlimited content.",
  openGraph: {
    type: "website",
    url: "/",
    title: "MovieOn | Watch Movies and TV Shows",
    description:
      "MovieOn is a free movie and tv show stream aggregator. Watch unlimited content.",
  },
  twitter: {
    card: "summary_large_image",
    site: "/",
    title: "MovieOn | Watch Movies and TV Shows",
    description:
      "MovieOn is a free movie and tv show stream aggregator. Watch unlimited content.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={cn("min-h-screen bg-background", inter.className)}>
        <QueryProvider>
          <AuthSessionProvider>
            <OnboardingProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                forcedTheme="dark"
                disableTransitionOnChange
              >
                <TooltipProvider>
                  <GlobalDockProvider>
                    <NavbarServer />
                    <main className="flex-1">{children}</main>
                    <FooterSection />
                    <Toaster richColors closeButton />
                  </GlobalDockProvider>
                </TooltipProvider>
              </ThemeProvider>
            </OnboardingProvider>
          </AuthSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
