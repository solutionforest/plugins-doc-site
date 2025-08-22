import { createCompiler } from "@fumadocs/mdx-remote";
import type { TableOfContents } from "fumadocs-core/server";
import type { MDXComponents } from "mdx/types";
import type { FC } from "react";
import { remarkCompact } from "./remark-compact";

export interface CompiledPage {
  full?: boolean;
  source?: string;

  title?: string;
  description?: string;

  toc: TableOfContents;
  body: FC<{ components?: MDXComponents }>;
}

const cache = new Map<string, Promise<CompiledPage>>();

const compiler = createCompiler({
  remarkPlugins: (v) => [remarkCompact, ...v],
  remarkImageOptions: false,
  rehypeCodeOptions: {
    lazy: true,
    tab: false,
    experimentalJSEngine: true,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  },
});

export async function compile(filePath: string, source: string) {
  const key = `${filePath}:${source}`;
  const cached = cache.get(key);

  if (cached) return cached;
  console.time(`compile md: ${filePath}`);
  const compiling = compiler
    .compile({
      filePath,
      source,
    })
    .then((compiled) => ({
      body: compiled.body,
      toc: compiled.toc,
      ...compiled.frontmatter,
    }))
    .catch((error) => {
      console.error(`Error compiling ${filePath}:`, error.message);
      // Return a fallback page with error information
      return {
        body: () => {
          const React = require('react');
          return React.createElement('div', { 
            style: { 
              padding: '20px', 
              border: '1px solid #ff6b6b', 
              borderRadius: '8px', 
              backgroundColor: '#fff5f5' 
            } 
          }, [
            React.createElement('h2', { key: 'title' }, 'Content Compilation Error'),
            React.createElement('p', { key: 'message' }, 'This document contains invalid syntax and could not be compiled.'),
            React.createElement('details', { key: 'details' }, [
              React.createElement('summary', { key: 'summary' }, 'Error Details'),
              React.createElement('pre', { 
                key: 'error', 
                style: { fontSize: '12px', overflow: 'auto' } 
              }, error.message)
            ])
          ]);
        },
        toc: [],
        title: 'Compilation Error',
        description: 'This document could not be compiled due to syntax errors.',
      };
    })
    .finally(() => {
      console.timeEnd(`compile md: ${filePath}`);
    });

  cache.set(key, compiling);

  return compiling;
}
