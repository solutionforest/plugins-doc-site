import Link from "next/link";
import { plugins } from "@/lib/plugins";
import { ChevronRight, Github, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

// Enable static generation for performance
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "Filament Plugin Documentation | Solution Forest",
  description: "Comprehensive documentation for all Filament plugins by Solution Forest. Explore features, installation guides, and detailed usage examples for Laravel Filament.",
  keywords: [
    "filament",
    "laravel", 
    "plugins",
    "documentation",
    "solution forest",
    "cms",
    "admin panel"
  ],
  openGraph: {
    title: "Filament Plugin Documentation",
    description: "Comprehensive documentation for all Filament plugins by Solution Forest",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Filament Plugin Documentation",
    description: "Comprehensive documentation for all Filament plugins by Solution Forest",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function HomePage() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Filament Plugin Documentation
        </h1>
        <p className="text-xl text-fd-muted-foreground max-w-2xl mx-auto">
          Comprehensive documentation for all Filament plugins by Solution Forest.
          Explore features, installation guides, and detailed usage examples.
        </p>
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {plugins.map((plugin) => (
          <div
            key={plugin.slug}
            className="group border border-fd-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-fd-primary/50"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-fd-primary group-hover:text-fd-primary/80">
                {plugin.name}
              </h3>
              <div className="flex gap-2">
                {!plugin.is_private && (
                  <Link
                    href={plugin.repository_url}
                    target="_blank"
                    className="p-1 text-fd-muted-foreground hover:text-fd-primary transition-colors"
                    title="View on GitHub"
                  >
                    <Github size={16} />
                  </Link>
                )}
              </div>
            </div>
            
            <p className="text-fd-muted-foreground text-sm mb-4 line-clamp-3">
              {plugin.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-fd-primary/10 text-fd-primary px-2 py-1 rounded">
                  {plugin.latest_version}
                </span>
                <span className="text-xs text-fd-muted-foreground">
                  {plugin.versions.length} version{plugin.versions.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <Link
                href={`/docs/${plugin.slug}/${plugin.latest_version}/readme`}
                className="inline-flex items-center gap-1 text-sm text-fd-primary hover:text-fd-primary/80 transition-colors"
              >
                View Docs
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
