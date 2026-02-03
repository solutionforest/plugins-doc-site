'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Home Error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-6xl font-bold text-destructive">🏠</div>

        <h1 className="text-2xl font-bold">Home Page Error</h1>

        <p className="text-muted-foreground">
          We encountered an error while loading the home page. This might be due to a temporary issue.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md text-white bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Try Again
          </button>

          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Browse Documentation
          </Link>
        </div>

        <div className="pt-8">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please{' '}
            <Link href="https://github.com/solutionforest" className="underline hover:no-underline">
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}