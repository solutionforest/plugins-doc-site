import { exportSearchIndexes } from '@/lib/export-search-indexes';
import { createSearchAPI } from 'fumadocs-core/search/server';

// Statically pre-render this route at build time so it works with `output: 'export'`
// Ref: https://www.fumadocs.dev/docs/search/custom
export const revalidate = false;

export const { staticGET: GET } = createSearchAPI('advanced', {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
  indexes: exportSearchIndexes().map((record) => ({
    title: record.title,
    description: record.description,
    url: record.url,
    id: record.url,
    structuredData: record.structured,
  })),
});
