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

// Rehype plugin for local <img src="/..."> tags in MDX files.
//
// Problem: In MDX, explicit <img> JSX tags are compiled as React.createElement('img', ...)
// and do NOT reliably go through the components map (unlike Markdown ![]() images).
// This means the `img` override in mdx-components.tsx is never called for them.
//
// Solution: Rename those nodes to <DocImage> (uppercase). Uppercase components ARE always
// resolved from the components context, so DocImage in mdx-components.tsx will be called.
// We also prepend basePath here since Next.js <Image> does NOT do it automatically —
// the src must already include basePath before being passed to next/image.
function rehypeDocImage() {
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH ||
    (process.env.NODE_ENV === 'production' ? '/plugins-doc-site' : '');

  function walk(node: any) {
    // MDX JSX nodes: mdxJsxFlowElement / mdxJsxTextElement
    if (
      (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
      node.name === 'img' &&
      Array.isArray(node.attributes)
    ) {
      // Rename to DocImage so the components map entry is used (enabling ImageZoom)
      node.name = 'DocImage';

      // Prepend basePath to local src paths
      for (const attr of node.attributes) {
        if (
          attr.type === 'mdxJsxAttribute' &&
          attr.name === 'src' &&
          typeof attr.value === 'string'
        ) {
          const src: string = attr.value;
          if (basePath && src.startsWith('/') && !src.startsWith('//') && !src.startsWith(basePath)) {
            attr.value = basePath + src;
          }
        }
      }
    }

    // Standard rehype element nodes (fallback for any genuine HTML <img> nodes)
    if (
      node.type === 'element' &&
      node.tagName === 'img' &&
      typeof node.properties?.src === 'string'
    ) {
      const src: string = node.properties.src;
      if (basePath && src.startsWith('/') && !src.startsWith('//') && !src.startsWith(basePath)) {
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
    rehypePlugins: [rehypeDocImage],
  },
});
