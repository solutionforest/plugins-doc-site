import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { config } from './config';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [],
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export function getPluginImage(pluginName: string) {
  return {
    segments: [pluginName, 'image.png'],
    url: `/og/plugins/${pluginName}/image.png`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}

export function getAvailableVersions(pluginName: string) {
  const plugin = config.plugins.find((p) => p.id === pluginName);
  if (!plugin) return [];

  return plugin.versions.map((v) => v.version);
};

export function getLatestVersion(pluginName: string) {
  const plugin = config.plugins.find((p) => p.id === pluginName);
  if (!plugin) return null;

  return plugin.latestVersion;
};

export function getPluginGithubRepoUrl(pluginName: string) {
  const plugin = config.plugins.find((p) => p.id === pluginName);
  if (!plugin) return null;

  const repo = plugin.repo;

  return `https://github.com/${repo}`;
};