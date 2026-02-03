import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { config } from '@/lib/config';
import { generateMetadataForPlugin } from '@/app/docs/components';

type CurrentPageProps = PageProps<'/docs/[plugin]/[version]'>;

export default async function Page(props: CurrentPageProps) {
  const params = await props.params;
  const pluginName = params.plugin;
  const version = params.version;

  return redirect(`/docs/${[pluginName, version, 'overview'].join('/')}`);
}

export async function generateStaticParams() {
  const params: { plugin: string, version: string }[] = [];

  for (const plugin of config.plugins) {
    for (const version of plugin.versions) {
      params.push({ plugin: plugin.id, version: version.version });
    }
  }

  return params;
}

export async function generateMetadata(props: CurrentPageProps): Promise<Metadata> {

  const params = await props.params;
  const pluginName = params.plugin;
  return generateMetadataForPlugin(pluginName) ?? notFound();
}