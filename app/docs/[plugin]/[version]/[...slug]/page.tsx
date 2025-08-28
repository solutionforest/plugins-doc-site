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
import { source } from "@/lib/source";
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
        {/* {page.file.name === "index" && (
          <DocsCategory page={page} from={source} />
        )} */}
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
  // Generate params for all repository and version combinations
  const params: { plugin: string; version: string; slug: string[] }[] = [];

  for (const repository of repositories) {
    const repoSlug = repository.repo;

    for (const version of repository.versions) {
      const versionSlug = version.version;

      // Skip empty slug - that's handled by [version]/page.tsx
      // params.push({ plugin: repoSlug, version: versionSlug, slug: [] });

      // Add limited files for this version
      if (version.limited_files) {
        for (const file of version.limited_files) {
          if (file.slug === "index") {
            continue; // skip index as it's handled by [version]/page.tsx
          }
          params.push({
            plugin: repoSlug,
            version: versionSlug,
            slug: [file.slug],
          });
        }
      }
    }
  }

  return params;
}
