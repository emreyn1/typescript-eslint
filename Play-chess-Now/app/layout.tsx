import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebRTC Chess - Online Chess',
  description: 'Real-time video chess game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

