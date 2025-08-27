import {
  DocsPage,
  DocsBody,
  // DocsCategory,
} from "fumadocs-ui/page";
import { generatePageMeta } from "@/lib/meta";
import { 
  DocPageHeading, 
} from "../components";
import { 
  repositories,
  getRepositorySlug,
  getRepositoryBySlug,
  getVersionBySlug,
  type RepositoryConfig,
  VersionConfig,
  getFileSlug,
} from "@/lib/repo-config";
import { generatePluginsGrid } from "@/app/layout.config";
import { notFound } from "next/navigation";
import { isLocal, source } from "@/lib/source";
import { createMdxComponents } from "@/components/mdx";
import { Star } from "lucide-react";
import { Cards, Card } from 'fumadocs-ui/components/card';
// import { createRelativeLink } from 'fumadocs-ui/mdx';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  // console.debug("###Doc Page params:", params);

  // List of all plugins
  if (!params.slug || params.slug.length === 0) {
    // If no plugin is specified, show the plugins grid
    return (
      <DocsPage>
        <DocsBody>
          {generatePluginsGrid()}
        </DocsBody>
      </DocsPage>
    );
  }
  // Parse the slug structure: [repo-slug, version?, ...rest]
  const [repoSlug, versionSlug, ...restPath] = params.slug;
  const repository = getRepositoryBySlug(repoSlug);
  if (!repository) {
    notFound();
  }
  
  // Repository's overview page
  if (!versionSlug) {
    return (
      <DocsPage>
        <DocPageHeading repository={repository} />
        <DocsBody>
          <Cards>
            {repository.versions?.map((version) => (
              <Card
                key={version.version}
                href={`/docs/${repoSlug}/${version.version}`}
                title={version.version}
                icon={version.version === repository.latest_version ? <Star size={16} /> : null}
                className="flex items-center gap-2"
              />
            ))}
          </Cards>
        </DocsBody>
      </DocsPage>
    );
  }

  // If version is provided, trigger  versioned page handler
  
  const version = getVersionBySlug(repository, versionSlug);
  if (!version) { // Invalid version
    return notFound();
  }
  
  // Parse the slug structure: [repo-slug, version?, ...rest]
  const fullSlug = [repoSlug, versionSlug, ...restPath];
  // console.debug("###Doc Page fullSlug:", fullSlug);
  const page = source.getPage(fullSlug);
  if (!page) {
    console.warn("Page not found for slugs:", fullSlug);
    notFound();
  }
  
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
      <DocPageHeading repository={repository} />
      <DocsBody>
        <MdxContent
          components={createMdxComponents({
            a: ({ href, ...props}: { href: string }) => {
              const link = createRelativeLink(repository, version, href);
              return <a href={link} {...props} />;
            },
          })}
        />
        {/* {page.file.name === "index" && (
          <DocsCategory page={page} from={source} />
        )} */}
      </DocsBody>
    </DocsPage>
  );
}

function createRelativeLink(repository: RepositoryConfig, version: VersionConfig, href: string) {
  // Skip link creation for external URLs
  if (href.startsWith('http') || href.startsWith('https')) {
    // console.debug("### Skipping relative link creation for external URL:", href);
    return href;
  }

  // Skip link creation for mailto:, #, and other protocols
  if (href.startsWith('mailto:') || href.startsWith('#')) {
    // console.debug("### Skipping relative link creation for:", href);
    return href;
  }

  const extractPaths = href.split('/').map((part) => getFileSlug(part)) || [];
  const existPage = source.getPage([repository.repo, version.version, ...extractPaths]);
  if (existPage) {
    return existPage.url;
  }

  let repositoryUrl = `${repository.repository_url}/blob/${version.github_branch || version.version}/${href}`;
  // console.debug("### Creating relative link for:", href, repositoryUrl);

  return repositoryUrl;
}

export function generateStaticParams(): { slug?: string[] }[] {

  if (isLocal) {
    const localSlugs = source.generateParams();
    // console.debug("###Generated local static params:", localSlugs);
    return localSlugs;
  };
  
  // Generate params for all repository and version combinations
  const params: { slug?: string[] }[] = [
    { slug: [] }, // Root docs page
  ];
  
  for (const repo of repositories) {
    const repoSlug = getRepositorySlug(repo);
    
    // Add repository overview (this handles /docs/repo-slug)
    params.push({ slug: [repoSlug] });
    
    // Add version pages
    for (const version of repo.versions) {
      const versionSlug = version.version;

      // Version overview page (/docs/repo-slug/version)
      params.push({ slug: [repoSlug, versionSlug] });
      
      // Add limited files for this version
      if (version.limited_files) {
        for (const file of version.limited_files) {
          params.push({ slug: [repoSlug, versionSlug, file.slug] });
        }
      }
      
      // Add docs if docsPath exists
      if (repo.docsPath) {
        const docPages = source.getPages().filter(p => p.url.startsWith(`/docs/${repoSlug}/${versionSlug}/`));
        // console.debug("###Pages from source:", docPages);
        for (const p of docPages) {
          // console.debug("###Adding page to static params:", p);
          params.push({ slug: p.slugs });
        }
      }
    }
  }

  // console.debug("###Generated static params:", params);

  return params;
}

export async function generateMetadata(props: {
  params: Promise<{ slugs?: string[] }>;
}) {
  const params = await props.params;
  const slugs = params.slugs || [];
  
    if (!slugs || slugs.length === 0) {
      return generatePageMeta();
    }
  
    const [repoSlug, versionSlug] = slugs;
    const repository = getRepositoryBySlug(repoSlug);
    
    if (!repository) {
      return generatePageMeta(
        "Repository Not Found",
      );
    }
  
    if (!versionSlug) {
      return generatePageMeta(
        `${repository.displayName || repository.repo} - Documentation`,
        `Documentation for ${repository.owner}/${repository.repo}`
      );
    }
  
    const version = getVersionBySlug(repository, versionSlug);
    const page = source.getPage(slugs);
    
    if (page) {
      return generatePageMeta(
        `${page.data.title} - ${repository.displayName || repository.repo} v${version.version}`,
        `Documentation from ${repository.owner}/${repository.repo}`
      );
    }
  
    return generatePageMeta(
      `${repository.displayName || repository.repo} v${version.version}`,
      `Documentation for ${repository.owner}/${repository.repo} version ${version.version}`
    );
}
