import { createMdxComponents } from "@/components/mdx";
import { source } from "@/lib/source";
import { getPluginBySlug, getPluginVersion, plugins } from "@/lib/plugins";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
  DocsCategory,
} from "fumadocs-ui/page";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";

// ISR configuration - revalidate every 2 hours
export const revalidate = 7200;

// Enable static generation for performance
export const dynamic = 'force-static';
export const dynamicParams = true;

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const slug = params.slug || [];
  
  // Handle the case when someone visits /docs directly (no slug)
  if (slug.length === 0) {
    // Get the first plugin and redirect to its overview page
    const firstPlugin = plugins[0];
    
    if (firstPlugin) {
      redirect(`/docs/${firstPlugin.slug}/${firstPlugin.latest_version}/readme`);
    }
    
    // Fallback redirect to homepage if no plugins are available
    redirect("/");
  }
  
  // Parse the slug: [plugin-slug, version, doc-type]
  const [pluginSlug, version, docType] = slug;
  
  if (!pluginSlug || !version || !docType) {
    notFound();
  }

  const plugin = getPluginBySlug(pluginSlug);
  if (!plugin) {
    notFound();
  }

  const pluginVersion = getPluginVersion(plugin, version);
  if (!pluginVersion) {
    notFound();
  }

  const page = source.getPage(slug);
  if (!page) notFound();

  let content = await page.data.load();

  if (content.source) {
    const sourcePage = source.getPage(content.source.split("/"));

    if (!sourcePage)
      throw new Error(
        `unresolved source in frontmatter of ${page.file.path}: ${content.source}`,
      );
    content = await sourcePage.data.load();
  }

  const MdxContent = content.body;

  return (
    <DocsPage toc={content.toc} full={content.full}>
      {/* Plugin Header */}
      <div className="mb-6 pb-4 border-b border-fd-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{plugin.name}</h1>
            <span className="text-sm bg-fd-primary/10 text-fd-primary px-2 py-1 rounded">
              {version}
            </span>
          </div>
          <div className="flex gap-2">
            {!plugin.is_private && (
              <Link
                href={plugin.repository_url}
                target="_blank"
                className="inline-flex items-center gap-1 text-sm text-fd-muted-foreground hover:text-fd-primary transition-colors"
              >
                <Github size={16} />
                Repository
              </Link>
            )}
          </div>
        </div>
        <p className="text-fd-muted-foreground text-sm">
          {plugin.description}
        </p>
      </div>

      <DocsTitle>{content.title}</DocsTitle>
      <DocsDescription>{content.description}</DocsDescription>
      <DocsBody>
        <MdxContent components={createMdxComponents(false)} />
        {page.file.name === "index" && (
          <DocsCategory page={page} from={source} />
        )}
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams(): { slug?: string[] }[] {
  // Generate static params for plugin documentation
  // You can customize this to pre-generate specific combinations
  return [];
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const slug = params.slug || [];
  const [pluginSlug, version, docType] = slug;

  if (!pluginSlug || !version || !docType) {
    return {
      title: "Plugin Documentation",
      description: "Filament plugin documentation",
    };
  }

  const plugin = getPluginBySlug(pluginSlug);
  if (!plugin) {
    return {
      title: "Plugin Not Found",
      description: "The requested plugin documentation was not found",
    };
  }

  const docTypeTitle = {
    readme: "Overview",
    documentation: "Documentation", 
    changelog: "Changelog"
  }[docType] || docType;

  return {
    title: `${plugin.name} ${docTypeTitle} (${version}) | Filament Plugins`,
    description: `${docTypeTitle} for ${plugin.name} version ${version}. ${plugin.description}`,
    keywords: [
      "filament",
      "laravel",
      "plugin",
      plugin.name.toLowerCase(),
      "documentation",
      docType
    ],
    openGraph: {
      title: `${plugin.name} ${docTypeTitle}`,
      description: plugin.description,
      type: "article",
      url: `/docs/${pluginSlug}/${version}/${docType}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${plugin.name} ${docTypeTitle}`,
      description: plugin.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
