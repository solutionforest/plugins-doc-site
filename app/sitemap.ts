import { plugins } from "@/lib/plugins";

// Static export configuration
export const dynamic = 'force-static';
export const revalidate = false;

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
  ];

  // Add plugin documentation routes
  for (const plugin of plugins) {
    for (const version of plugin.versions) {
      const docs = ['readme', 'documentation', 'changelog'];
      
      for (const doc of docs) {
        routes.push({
          url: `${baseUrl}/docs/${plugin.slug}/${version.version}/${doc}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: version.version === plugin.latest_version ? 0.8 : 0.6,
        });
      }
    }
  }

  return routes;
}
