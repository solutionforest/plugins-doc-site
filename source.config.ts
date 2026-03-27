import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema.extend({
      lastUpdated: z.union([z.string(), z.date()]).optional(),
      latest: z.boolean().optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// Rehype plugin that prepends basePath to local <img src="/..."> paths.
// Raw HTML <img> tags in MDX bypass the mdx-components.tsx `img` override and are
// emitted as literal HTML, so Next.js never gets a chance to apply basePath automatically.
// We rewrite them here at MDX compile time instead.
function rehypePrependBasePath() {
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH ||
    (process.env.NODE_ENV === 'production' ? '/plugins-doc-site' : '');

  if (!basePath) return (tree: any) => tree;

  function walk(node: any) {
    if (
      node.type === 'element' &&
      node.tagName === 'img' &&
      typeof node.properties?.src === 'string'
    ) {
      const src: string = node.properties.src;
      if (src.startsWith('/') && !src.startsWith('//') && !src.startsWith(basePath)) {
        node.properties.src = basePath + src;
      }
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
  }

  return (tree: any) => walk(tree);
}

export default defineConfig({
  mdxOptions: {
    remarkImageOptions: {
      external: false, // Disable fetching external image sizes
    },
    remarkPlugins: [],
    rehypePlugins: [rehypePrependBasePath],
  },
});
