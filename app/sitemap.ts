import type { MetadataRoute } from "next";
import { repositories } from "@/lib/repo-config";
import { source } from "@/lib/source";
import { siteConfig } from "@/lib/site-config";

// Static export configuration
export const dynamic = "force-static";
export const revalidate = false;

export default async function sitemap() {
  // Use the correct base URL for GitHub Pages
  const baseUrl = siteConfig.baseUrl;

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...(await Promise.all(
      source.getPages().map(async (page) => {
        // const { lastModified } = await page.data.load();
        return {
          // url: url(page.url),
          url: baseUrl + page.url,
          // lastModified: lastModified ? new Date(lastModified) : undefined,
          changeFrequency: "weekly",
          priority: 0.5,
        } as MetadataRoute.Sitemap[number];
      }),
    )),
  ];
  // console.debug("#### Repositories:", repositories);

  // Add repository documentation routes
  // for (const repository of repositories) {
  //   for (const version of repository.versions) {
  //     const docs = ['readme', 'documentation', 'changelog'];

  //     for (const doc of docs) {
  //       routes.push({
  //         url: `${baseUrl}/docs/${repository.slug}/${version.version}/${doc}`,
  //         lastModified: new Date(),
  //         changeFrequency: 'weekly' as const,
  //         priority: version.version === repository.latest_version ? 0.8 : 0.6,
  //       });
  //     }
  //   }
  // }

  return routes;
}
