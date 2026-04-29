import { getLatestVersion, getPageImage, getPluginGithubRepoUrl, getPluginImage, source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle, PageLastUpdate } from 'fumadocs-ui/layouts/docs/page';
import { notFound, redirect } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createCustomRelativeLink } from '@/lib/mdx-link';
import Link from 'next/link';
import { ViewOptions, generateMetadataForPlugin } from '@/app/docs/components';
import { Footer } from '@/app/docs/components/footer';
import { config } from '@/lib/config';
import { ArchiveIcon } from 'lucide-react';

type CurrentPageProps = PageProps<'/docs/[plugin]/[version]/[...slug]'>;

export default async function Page(props: CurrentPageProps) {
  const params = await props.params;
  const pluginName = params.plugin;
  const version = params.version;
  const slugs = params.slug || [];

  // If missing which page to load, default to 'overview'
  if (slugs.length === 0) {
    return redirect(`/docs/${[pluginName, version, 'overview'].join('/')}`);
  }

  const finalSlugs = [pluginName, version, ...slugs];
  const page = source.getPage(finalSlugs);

  // console.debug('Resolved final slugs for page:', finalSlugs, { pageExists: !!page });
  if (!page) {
    return notFound();
  }

  // console.debug('Rendering page with slugs:', finalSlugs);

  const MDX = page.data.body;

  const githubRepoUrl = getPluginGithubRepoUrl(pluginName);
  const latestUpdate = page.data.lastUpdated ? new Date(page.data.lastUpdated) : null;

  const pluginConfig = config.plugins.find((p) => p.id === pluginName);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} footer={{ component: <Footer /> }}>
      {pluginConfig?.archived && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <ArchiveIcon className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Archived Plugin</p>
            <p className="text-amber-600/80 dark:text-amber-400/80">This plugin is no longer actively maintained. The documentation is kept for reference.</p>
          </div>
        </div>
      )}
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      {latestUpdate || githubRepoUrl ? (
        <div className="flex flex-row gap-2 items-center border-b pb-6">
          {latestUpdate && (
            <p className="text-sm text-fd-muted-foreground">
              Last updated {latestUpdate.toUTCString()}
            </p>
          )}
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
  const slugs = source.generateParams();
  const params: { plugin: string, version: string, slug: string[] }[] = [];

  Array.from(slugs).forEach((array) => {
    const slugArray = array['slug'];
    const plugin = slugArray[0];
    const version = slugArray[1];
    const rest = slugArray.slice(2);
    params.push({ plugin, version, slug: rest });
  });

  return params;
}

export async function generateMetadata(props: CurrentPageProps): Promise<Metadata> {
  const params = await props.params;
  const pluginName = params.plugin;
  const version = params.version;

  return generateMetadataForPlugin(pluginName, version) ?? notFound();
  // const page = source.getPage([pluginName, version, ...slugs]);
  // if (!page) notFound();

  // return {
  //   title: page.data.title,
  //   description: page.data.description,
  //   openGraph: {
  //     images: [
  //       getPluginImage(pluginName).url, 
  //       // getPageImage(page).url,
  //     ],
  //   },
  // };
}

