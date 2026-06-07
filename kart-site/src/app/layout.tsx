import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prycard.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PryCard - Privacy-First Virtual Crypto Cards',
    template: '%s | PryCard',
  },
  description:
    'Spend your crypto privately and effortlessly. Fund with 100+ cryptocurrencies, get a virtual Visa card instantly, pay anywhere.',
  keywords: [
    'virtual card',
    'crypto card',
    'no kyc card',
    'privacy card',
    'bitcoin card',
    'prepaid visa',
    'anonymous card',
  ],
  authors: [{ name: 'PryCard' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'PryCard',
    title: 'PryCard - Privacy-First Virtual Crypto Cards',
    description:
      'Fund with 100+ cryptocurrencies. Get a virtual card instantly. Pay anywhere Visa is accepted.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PryCard - Privacy-First Virtual Crypto Cards',
    description:
      'Spend your crypto privately. Instant virtual Visa cards, no KYC, 100+ cryptocurrencies.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'PryCard',
  description:
    'Privacy-first virtual crypto cards. Fund with cryptocurrency, spend anywhere Visa is accepted.',
  url: siteUrl,
  serviceType: 'Virtual Prepaid Card',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
