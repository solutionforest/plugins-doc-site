import { getLatestVersion, getPageImage, getPluginGithubRepoUrl, getPluginImage, source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle, PageLastUpdate } from 'fumadocs-ui/layouts/docs/page';
import { notFound, redirect } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createCustomRelativeLink } from '@/lib/mdx-link';
import Link from 'next/link';
import { ViewOptions } from '../components/page-actions';

export default async function Page(props: PageProps<'/docs/[...slug]'>) {
  const params = await props.params;
  const slugs = params.slug || [];
  const pluginName = slugs[0];
  const version = slugs[1] ?? null;
  const restSlugs = version ? slugs.slice(2) : slugs.slice(1);

  // If version is not specified, try redirect to latest version
  if (!version) {
    const latestVersion = getLatestVersion(pluginName);
    if (!latestVersion) {
      // Plugin doesn't exist, show 404
      return notFound();
    }
    return redirect(`/docs/${[pluginName, latestVersion].join('/')}`);
  }

  // If missing which page to load, default to 'overview'
  if (restSlugs.length === 0) {
    return redirect(`/docs/${[pluginName, version, 'overview'].join('/')}`);
  }

  const finalSlugs = [pluginName, version, ...restSlugs];
  const page = source.getPage(finalSlugs);

  // console.debug('Resolved final slugs for page:', finalSlugs, { pageExists: !!page });
  if (!page) {
    return notFound();
  }

  // console.debug('Rendering page with slugs:', finalSlugs);

  const MDX = page.data.body;

  const githubRepoUrl = getPluginGithubRepoUrl(pluginName);
  const latestUpdate = page.data.lastUpdated ? new Date(page.data.lastUpdated) : null;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      {latestUpdate || githubRepoUrl ? (
        <div className="flex flex-row gap-2 items-center border-b pb-6">
          {latestUpdate && <PageLastUpdate date={latestUpdate} />}
          {githubRepoUrl && <ViewOptions githubUrl={githubRepoUrl} />}
        </div>
      ) : null}
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: ({ href, ...props }: { href: string }) => {
              // console.log('Link href in MDX:', { href });
              const resolvedHref = createCustomRelativeLink(page)(href);
              // console.log('Resolved link href in MDX:', { resolvedHref });
              return <Link href={resolvedHref} {...props} />;
            },
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[...slug]'>): Promise<Metadata> {
  const params = await props.params;
  const slugs = params.slug || [];
  const pluginName = slugs[0];
  const page = source.getPage(slugs);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: [
        getPluginImage(pluginName).url, 
        // getPageImage(page).url,
      ],
    },
  };
}