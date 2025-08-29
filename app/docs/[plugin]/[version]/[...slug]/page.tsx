import { generatePageMeta } from "@/lib/meta";
import { DocsPage, DocsBody } from "fumadocs-ui/page";
import {
  getRepositoryBySlug,
  getRepositoryDisplayName,
  repositories,
  getVersionBySlug,
} from "@/lib/repo-config";
import { notFound } from "next/navigation";
import { DocPageHeading } from "../../../components";
import { source, isLocal } from "@/lib/source";
import { createMdxComponents, createRelativeLink } from "@/components/mdx";

type Props = {
  params: Promise<{ plugin: string; version: string; slug: string[] }>;
};

export default async function Page(props: Props) {

  const resolvedParams = await props.params;
  const repoSlug = resolvedParams.plugin;
  const versionSlug = resolvedParams.version;
  const slugs = resolvedParams.slug || [];

  const repository = getRepositoryBySlug(repoSlug);
  if (!repository) {
    notFound();
  }

  const version = getVersionBySlug(repository, versionSlug);
  if (!version) {
    notFound();
  }

  const fullSlug = [repoSlug, versionSlug, ...slugs];
  const page = source.getPage(fullSlug);
  if (!page) {
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
            a: ({ href, ...props }: { href: string }) => {
              return (
                <a
                  href={createRelativeLink(repository, version, href)}
                  {...props}
                />
              );
            },
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const repoSlug = resolvedParams.plugin;
  const versionSlug = resolvedParams.version;
  const slugs = resolvedParams.slug || [];

  const repository = getRepositoryBySlug(repoSlug);
  if (!repository) {
    return generatePageMeta("Repository Not Found");
  }

  const version = getVersionBySlug(repository, versionSlug);
  if (!version) {
    return generatePageMeta("Version Not Found");
  }

  const fullSlug = [repoSlug, versionSlug, ...slugs];
  const page = source.getPage(fullSlug);
  if (!page) {
    return generatePageMeta(
      `${getRepositoryDisplayName(repository)} v${version.version}`,
      `Documentation for ${repository.owner}/${repository.repo}`,
    );
  }

  return generatePageMeta(
    `${page.data.title} - ${getRepositoryDisplayName(repository)} v${version.version}`,
    `Documentation for ${repository.owner}/${repository.repo}`,
  );
}

export async function generateStaticParams() {
  // if (isLocal) {
  //   const localParams = source.generateParams();
  //   // console.debug("### Local params:", localParams);
  //   return localParams;
  // }
  // Generate params for all repository and version combinations with their actual pages
  const params: { plugin: string; version: string; slug: string[] }[] = [];

  // console.debug("### Repositories length:", repositories.length);

  for (const repository of repositories) {
    const repoSlug = repository.repo;
    // console.debug("### Processing repo:", repoSlug);

    for (const version of repository.versions) {
      const versionSlug = version.version;
      // console.debug("### Processing version:", versionSlug);

      // Get limited files for this version
      const limitedFiles = version.limited_files || [];
      // console.debug("### Limited files:", limitedFiles);

      for (const file of limitedFiles) {
        // console.debug("### Processing file:", file);
        
        // Skip files with slug "index" as they are handled by [version]/page.tsx
        if (file.slug === "index") {
          // console.debug("### Skipping index file");
          continue;
        }
        
        // Create the slug array for this file
        const slug = [file.slug];
        
        // console.debug("### Adding param:", { plugin: repoSlug, version: versionSlug, slug });
        
        params.push({
          plugin: repoSlug,
          version: versionSlug,
          slug: slug,
        });
      }

      if (repository.docsPath) {
        // Search the pages
        const docsPages = source.getPages()
          .filter(p => p.url.startsWith(`/docs/${repoSlug}/${versionSlug}/`));

        // console.debug("### Found doc pages:", docsPages);

        for (const docPage of docsPages) {
          
          const docPageSlug = docPage.slugs.slice(2); // Skip repo/version

          if (docPageSlug.length === 0) {
            // Skip empty slugs
            continue;
          }

          if (params.some(p => p.plugin === repoSlug && p.version === versionSlug && arraysEqual(p.slug, docPageSlug))) {
            // Skip existing params
            continue;
          }

          // Create a param for each doc page
          params.push({
            plugin: repoSlug,
            version: versionSlug,
            slug: docPageSlug,
          });
        }
      }
    }
  }

  // console.debug("### Final static params:", params);

  return params;
}


function arraysEqual(a: any[], b: any[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}