import { getPageImage, getPluginImage, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { config } from '@/lib/config';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <DefaultImage title={page.data.title} description={page.data.description} site="My App" />,
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => {
    // Generate params for OG image route
    const data = {
      lang: page.locale,
      slug: getPageImage(page).segments,
    };
    // If is plugin docs page, return custom slugs
    const availablePluginNames = config.plugins.map((p) => p.id);
    if (page.slugs.length >= 2 && availablePluginNames.includes(page.slugs[0])) {
      const pluginId = page.slugs[0];
      data.slug = getPluginImage(pluginId).segments;
    }
    return data;
  });
}
