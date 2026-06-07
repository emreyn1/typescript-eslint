'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Error</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t load this page. This might be a temporary issue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="gradient" onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
