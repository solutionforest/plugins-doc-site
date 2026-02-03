import { getLatestVersion } from '@/lib/source';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { config } from '@/lib/config';
import { generateMetadataForPlugin } from '@/app/docs/components';

type CurrentPageProps = PageProps<'/docs/[plugin]'>;

export default async function Page(props: CurrentPageProps) {
  const params = await props.params;
  const pluginName = params.plugin;

  const latestVersion = getLatestVersion(pluginName);
  if (!latestVersion) {
    return notFound();
  }
  return redirect(`/docs/${[pluginName, latestVersion].join('/')}`);
}

export async function generateStaticParams() {
  const params: { plugin: string }[] = [];

  for (const plugin of config.plugins) {
    params.push({ plugin: plugin.id });
  }

  return params;
}

export async function generateMetadata(props: CurrentPageProps): Promise<Metadata> {
  const params = await props.params;
  const pluginName = params.plugin;

  return generateMetadataForPlugin(pluginName) ?? notFound();
}