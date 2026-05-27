import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBarDemo from "@/components/nav-bar/demo";

// Viewport - iOS Safari adres çubuğu sorunu için
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Emre Hallac - Full Stack Web Developer | Portfolio",
  description: "Full stack web developer specializing in React, Next.js, TypeScript, and modern web technologies. Creating beautiful, functional, and user-centered digital experiences.",
  keywords: ["web developer", "full stack developer", "React", "Next.js", "TypeScript", "portfolio", "frontend developer", "backend developer"],
  authors: [{ name: "Emre Hallac" }],
  creator: "Emre Hallac",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Emre Hallac - Full Stack Web Developer",
    description: "Full stack web developer passionate about creating beautiful, functional, and user-centered digital experiences.",
    url: "https://your-portfolio-url.vercel.app",
    siteName: "Emre Hallac Portfolio",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emre Hallac - Full Stack Web Developer",
    description: "Full stack web developer passionate about creating beautiful, functional, and user-centered digital experiences.",
    creator: "@yourtwitter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background overflow-x-hidden`}
      >
        {/* SABİT NAVBAR – En üstte, her zaman görünür */}
        <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4">
          <NavBarDemo />
        </header>

        {/* Sayfa içeriği – navbar'ın altında başlasın diye padding ekliyoruz */}
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}