import { source } from '@/lib/source';
import type { StructuredData } from 'fumadocs-core/mdx-plugins';

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
export function exportSearchIndexes(): DocumentRecord[] {
  const results: DocumentRecord[] = [];

  for (const page of source.getPages()) {
    results.push({
      structured: page.data.structuredData,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
    });
  }

  return results;
}
