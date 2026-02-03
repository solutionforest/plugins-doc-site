'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-6xl font-bold text-muted-foreground">404</div>

        <h1 className="text-2xl font-bold">Page Not Found</h1>

        <p className="text-muted-foreground">
          Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-white bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Go Home
          </Link>

          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Browse Documentation
          </Link>
        </div>

        {/* <div className="pt-8">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please{' '}
            <Link href="https://github.com/solutionforest" className="underline hover:no-underline">
              report it on GitHub
            </Link>
            .
          </p>
        </div> */}
      </div>
    </div>
  );
}