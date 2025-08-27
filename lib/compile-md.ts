import { createCompiler } from "@fumadocs/mdx-remote";
import type { TableOfContents } from "fumadocs-core/server";
import type { MDXComponents } from "mdx/types";
import type { FC } from "react";
import { remarkCompact } from "./remark-compact";
import { remarkImage, rehypeCode, type RemarkImageOptions } from "fumadocs-core/mdx-plugins";

export interface CompiledPage {
  full?: boolean;
  source?: string;

  title?: string;
  description?: string;

  toc: TableOfContents;
  body: FC<{ components?: MDXComponents }>;

  isLocal?: boolean;
}

const cache = new Map<string, Promise<CompiledPage>>();

const compiler = createCompiler({
  remarkPlugins: (v) => [
    remarkCompact, 
    // remarkImage, 
    rehypeCode,
    ...v
  ],
  // remarkImageOptions: {
  //   publicDir: 'public',
  //   placeholder: 'blur',
  //   onError: 'ignore' as const,
  //   useImport: false,
  //   external: true,
  // },
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

function parseSourceBeforeCompile(filePath: string, source: string): string {
  let parsedSource = source;

  // Fix: <a xxx><img></a> - convert img to self-closing and keep anchor
  parsedSource = parsedSource.replace(/<a([^>]+)>(<img[^>]+)><\/a>/g, '<a$1>$2/></a>');

  // Replace <!-- xxx --> with <div class="note">xxx</div>, (CHANGELOG.md)
  parsedSource = parsedSource.replace(/<!--\s*(.*?)\s*-->/g, '<div class="note">$1</div>');

  // Replace relative links
  // e.g. 
  // [xxx](http://github.com/{owner}/{repo}/.github/CONTRIBUTING.md) -> [xxx](http://github.com/{owner}/{repo}/.github/CONTRIBUTING.md)
  // [xxx](http://github.com/{owner}/{repo}/./README.md) -> [xxx](http://github.com/{owner}/{repo}/./README.md)
  // [xxx](http://github.com/{owner}/{repo}/../LICENSE.md) -> [xxx](http://github.com/{owner}/{repo}/../LICENSE.md)
  // Extract case that have been set on repo-config
  // e.g. 
  // [xxx](CHANGELOG.md) -> [xxx]({baseUrl}/changelog)
  //console.log('**** sda', filePath);

  return parsedSource;
}

export async function compile(filePath: string, source: string) {
  const key = `${filePath}:${source}`;
  const cached = cache.get(key);

  if (cached) return cached;
  console.time(`compile md: ${filePath}`);

  const compiling = compiler
    .compile({
      filePath,
      source: parseSourceBeforeCompile(filePath, source),
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
