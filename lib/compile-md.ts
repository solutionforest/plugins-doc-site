import { createCompiler } from "@fumadocs/mdx-remote";
import type { TableOfContents } from "fumadocs-core/server";
import type { MDXComponents } from "mdx/types";
import type { FC } from "react";
import { remarkCompact } from "./remark-compact";
import {
  remarkImage,
  rehypeCode,
} from "fumadocs-core/mdx-plugins";
import { cache as reactCache } from 'react';

export interface CompiledPage {
  full?: boolean;
  source?: string;

  title?: string;
  description?: string;

  toc: TableOfContents;
  body: FC<{ components?: MDXComponents }>;
}

// Function to clean TOC items and convert them to plain text
function cleanTocItems(toc: TableOfContents): TableOfContents {
  return toc.map(item => ({
    ...item,
    title: cleanTocTitle(item.title)
  }));
}

// Function to convert TOC title to plain text
function cleanTocTitle(title: any): string {
  if (typeof title === 'string') {
    // Remove HTML tags and decode entities
    return title
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
  
  if (title && typeof title === 'object') {
    // Handle React nodes - extract text content
    if (title.props && title.props.children) {
      return cleanTocTitle(title.props.children);
    }
    
    if (Array.isArray(title)) {
      return title.map(cleanTocTitle).filter(Boolean).join('');
    }
    
    // If it's a React element with type and props
    if (title.type === 'a' && title.props && title.props.children) {
      return cleanTocTitle(title.props.children);
    }
    
    // Handle other React node types
    if (title.toString && typeof title.toString === 'function') {
      return cleanTocTitle(title.toString());
    }
  }
  
  if (Array.isArray(title)) {
    return title.map(cleanTocTitle).filter(Boolean).join('');
  }
  
  return String(title || '').trim();
}

// Create a cached compile function using React cache
const cachedCompile = reactCache(async (filePath: string, source: string): Promise<CompiledPage> => {
  // console.time(`compile md: ${filePath}`);

  return compiler
    .compile({
      filePath,
      source: parseSourceBeforeCompile(filePath, source),
    })
    .then((compiled) => ({
      body: compiled.body,
      toc: cleanTocItems(compiled.toc), // Clean TOC items to ensure plain text titles
      ...compiled.frontmatter,
    }))
    .catch((error) => {
      console.error(`Error compiling ${filePath}:`, error.message);
      // Return a fallback page with error information
      return {
        body: () => {
          const React = require("react");
          return React.createElement(
            "div",
            {
              style: {
                padding: "20px",
                border: "1px solid #ff6b6b",
                borderRadius: "8px",
                backgroundColor: "#fff5f5",
              },
            },
            [
              React.createElement(
                "h2",
                { key: "title" },
                "Content Compilation Error",
              ),
              React.createElement(
                "p",
                { key: "message" },
                "This document contains invalid syntax and could not be compiled.",
              ),
              React.createElement("details", { key: "details" }, [
                React.createElement(
                  "summary",
                  { key: "summary" },
                  "Error Details",
                ),
                React.createElement(
                  "pre",
                  {
                    key: "error",
                    style: { fontSize: "12px", overflow: "auto" },
                  },
                  error.message,
                ),
              ]),
            ],
          );
        },
        toc: [],
        title: "Compilation Error",
        description:
          "This document could not be compiled due to syntax errors.",
      };
    })
    .finally(() => {
      // console.timeEnd(`compile md: ${filePath}`);
    });
});

const compiler = createCompiler({
  remarkPlugins: (v) => [
    remarkCompact,
    remarkImage,
    rehypeCode,
    ...v,
  ],
  remarkImageOptions: {
    publicDir: 'public',
    placeholder: 'blur',
    onError: 'ignore',
    useImport: false,
    external: true,
  },
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
  parsedSource = parsedSource.replace(
    /<a([^>]+)>(<img[^>]+)><\/a>/g,
    "<a$1>$2/></a>",
  );

  // Replace <!-- xxx --> with <div class="note">xxx</div>, e.g. from CHANGELOG.md
  parsedSource = parsedSource.replace(
    /<!--\s*(.*?)\s*-->/g,
    '<div class="note">$1</div>',
  );

  // Fix type annotations that get interpreted as HTML tags
  // Replace array<type> with array&lt;type&gt; to prevent HTML parsing
  parsedSource = parsedSource.replace(
    /array<([^>]+)>/g,
    'array&lt;$1&gt;',
  );

  // Fix standalone type annotations at start of lines or after colons/spaces
  // This handles cases like "- `id`: int" -> "- `id`: `int`"
  parsedSource = parsedSource.replace(
    /(\s+- `[^`]+`):\s+(int|string|bool|float|double|object|array)(\s|$)/g,
    '$1: `$2`$3',
  );

  // Fix type annotations in parameter lists
  // This handles cases like "- **tags**: array<int> (optional)"
  parsedSource = parsedSource.replace(
    /(\*\*[^*]+\*\*):\s+(array&lt;[^&]+&gt;|int|string|bool|float|double|object|array)(\s)/g,
    '$1: `$2`$3',
  );

  // Replace "style="xx" as mdx format  
  // Convert CSS style attributes to JSX format
  parsedSource = parsedSource.replace(
    /style\s*=\s*"([^"]+)"/g,
    (match: string, styleValue: string): string => {
      // Parse CSS properties and convert to JSX object
      const styles = styleValue
        .split(';')
        .filter((prop: string) => prop.trim())
        .map((prop: string) => {
          const [property, ...valueParts] = prop.split(':');
          const value = valueParts.join(':').trim(); // Handle values with colons
          const trimmedProperty = property.trim();
          
          if (!trimmedProperty || !value) return '';
          
          // Convert kebab-case to camelCase
          const camelProperty = trimmedProperty.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
          return `${camelProperty}: "${value}"`;
        })
        .filter((prop: string) => prop)
        .join(', ');
      
      return `style={{ ${styles} }}`;
    }
  );

  // Replace "{{xxx}}" -> "\{\{xxx\}\}"
  parsedSource = parsedSource.replace(
    /{{\s*(.*?)\s*}}/g,
    '\\{\\{$1\\}\\}',
  );


  return parsedSource;
}

export async function compile(filePath: string, source: string) {
  return cachedCompile(filePath, source);
}