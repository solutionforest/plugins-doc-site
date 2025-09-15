import { generatePageMeta } from "@/lib/meta";
import { DocsPage, DocsBody } from "fumadocs-ui/page";
import {
  getRepositoryBySlug,
  getRepositoryDisplayName,
  repositories,
  getVersionBySlug,
} from "@/lib/repo-config";
import { notFound, redirect } from "next/navigation";
import { DocPageHeading } from "../../components";
import { source } from "@/lib/source";
import { createMdxComponents, createRelativeLink } from "@/components/mdx";
import { Cards, Card } from "fumadocs-ui/components/card";

type Props = {
  params: Promise<{ plugin: string; version: string }>;
};

export default async function Page(props: Props) {
  const resolvedParams = await props.params;
  const repoSlug = resolvedParams.plugin;
  const versionSlug = resolvedParams.version;

  const repository = getRepositoryBySlug(repoSlug);
  if (!repository) {
    notFound();
  }

  const version = getVersionBySlug(repository, versionSlug);
  if (!version) {
    notFound();
  }

  const fullSlug = [repoSlug, versionSlug, 'overview'];
  const page = source.getPage(fullSlug);
  if (!page) {
    return (
      <DocsPage>
        <DocPageHeading repository={repository} />
        <DocsBody>
          <Cards>
            {version.limited_files?.map((file) => (
              <Card
                key={file.slug}
                href={`/docs/${repoSlug}/${versionSlug}/${file.slug}`}
                title={file.title}
                className="flex items-center gap-2"
              />
            ))}
          </Cards>
        </DocsBody>
      </DocsPage>
    );
  }
  
  redirect(`/docs/${repoSlug}/${versionSlug}/overview`);

  // let content = await page.data.load();

  // if (content.source) {
  //   const sourcePage = source.getPage(content.source.split("/"));

  //   if (!sourcePage)
  //     throw new Error(
  //       `unresolved source in frontmatter of ${page.file.path}: ${content.source}`,
  //     );
  //   content = await sourcePage.data.load();
  // }

  // const MdxContent = content.body;

  // return (
  //   <DocsPage toc={content.toc} full={content.full}>
  //     <DocPageHeading repository={repository} includeDocsDescription={false} />
  //     <DocsBody>
  //       <MdxContent
  //         components={createMdxComponents({
  //           a: ({ href, ...props }: { href: string }) => {
  //             return (
  //               <a
  //                 href={createRelativeLink(repository, version, href)}
  //                 {...props}
  //               />
  //             );
  //           },
  //         })}
  //       />
  //     </DocsBody>
  //   </DocsPage>
  // );
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const repoSlug = resolvedParams.plugin;
  const versionSlug = resolvedParams.version;

  const repository = getRepositoryBySlug(repoSlug);
  if (!repository) {
    return generatePageMeta("Repository Not Found");
  }

  const version = getVersionBySlug(repository, versionSlug);
  if (!version) {
    return generatePageMeta("Version Not Found");
  }

  return generatePageMeta(
    `${getRepositoryDisplayName(repository)} v${version.version}`,
    `Documentation for ${repository.owner}/${repository.repo}`,
  );
}

export async function generateStaticParams() {
  // Generate params for all repository and version combinations
  const params: { plugin: string; version: string }[] = [];

  for (const repository of repositories) {
    const repoSlug = repository.repo;

    for (const version of repository.versions) {
      const versionSlug = version.version;

      params.push({ plugin: repoSlug, version: versionSlug });
    }
  }

  return params;
}
