'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-white">Critical Error</h1>
          <p className="text-zinc-400 mb-6">
            Something went seriously wrong. Please refresh the page or return to the homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
