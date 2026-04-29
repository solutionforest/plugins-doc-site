import { source } from '@/lib/source';
import type { StructuredData } from 'fumadocs-core/mdx-plugins';
import { config } from '@/lib/config';

export interface DocumentRecord {
  title: string;
  description?: string;
  url: string;
  structured: StructuredData;
}

/**
 * Export all pages as plain search records.
 * Used by the search route to build a static search index.
 * Can also be used to sync indexes to external search services (Algolia, Orama Cloud, etc.)
 */
const archivedPluginIds = new Set(
  config.plugins.filter((p) => p.archived).map((p) => p.id),
);

export function exportSearchIndexes(): DocumentRecord[] {
  const results: DocumentRecord[] = [];

  for (const page of source.getPages()) {
    // Skip pages belonging to archived plugins
    const pluginId = page.url.split('/')[2]; // /docs/[plugin]/...
    if (archivedPluginIds.has(pluginId)) continue;

    results.push({
      structured: page.data.structuredData,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
    });
  }

  return results;
}
