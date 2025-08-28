export interface SiteConfig {
  baseUrl: string;
  title: string;
  description: string;
}

export const siteConfig = {
  baseUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://solutionforest.github.io/plugins-doc-site",
  title: "Filament Plugin Documentation | Solution Forest",
  description:
    "Comprehensive documentation for all Filament plugins by Solution Forest. Explore features, installation guides, and detailed usage examples for Laravel Filament.",
} as SiteConfig;
