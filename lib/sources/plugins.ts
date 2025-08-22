import type { Source, VirtualFile } from "fumadocs-core/source";
import { Octokit } from "octokit";
import { compile, type CompiledPage } from "../compile-md";
// import { getTitleFromFile } from "../source";
import { plugins, parseRepositoryUrl, type Plugin, type PluginVersion } from "../plugins";
import { fetchWithCache, cache } from "../cache";

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error(`environment variable GITHUB_TOKEN is needed.`);

export const octokit = new Octokit({
  auth: token,
  request: {
    fetch: (request: any, opts?: any) => {
      return fetch(request, {
        ...opts,
        cache: "force-cache",
        next: { revalidate: 3600 }, // Next.js ISR - revalidate every hour
      });
    },
  },
});

async function sanitizeMarkdown(content: string): Promise<string> {
  let sanitized = content;
  
  // Sanitize code block languages to avoid bundle errors
  // Replace unsupported languages with supported ones
  const unsupportedLanguages = ['env', 'dotenv', 'environment'];
  unsupportedLanguages.forEach(lang => {
    // Replace ```env with ```bash or ```text
    const regex = new RegExp(`\`\`\`${lang}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '```bash');
  });
  
  // Remove all image references completely to avoid Next.js Image component issues
  sanitized = sanitized.replace(/!\[.*?\]\([^)]*\)/g, '[Image removed for compatibility]');
  
  // Remove HTML img tags completely
  sanitized = sanitized.replace(/<img[^>]*>/gi, '<!-- Image removed -->');
  
  // Remove any SVG content that might cause issues
  sanitized = sanitized.replace(/<svg[\s\S]*?<\/svg>/gi, '[SVG removed for compatibility]');
  
  // Handle complex image-link combinations like [![image](src)](link)
  sanitized = sanitized.replace(/\[\!\[([^\]]*)\]\([^)]*\)\]\([^)]*\)/g, '[$1 - View on GitHub]');
  
  // Remove GitHub user-attachments and asset links
  sanitized = sanitized.replace(/https:\/\/github\.com\/[^\s)]+\/assets\/[^\s)]*/g, '[GitHub Asset Link]');
  sanitized = sanitized.replace(/https:\/\/user-images\.githubusercontent\.com\/[^\s)]*/g, '[GitHub Image]');
  
  // Remove shields.io badges
  sanitized = sanitized.replace(/https:\/\/img\.shields\.io\/[^\s)]*/g, '[Badge]');
  
  // Convert all markdown images to simple links to avoid Next.js Image requirements
  // This handles ![alt](src) format
  sanitized = sanitized.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    // For GitHub user-attachments and other problematic image sources, convert to link
    if (src.includes('github.com/user-attachments') || 
        src.includes('img.shields.io') ||
        src.includes('githubusercontent.com')) {
      return `[${alt || 'View Image'}](${src})`;
    }
    // Keep other images but they might still need handling
    return match;
  });
  
  // Fix common issues with unclosed img tags within links
  sanitized = sanitized.replace(/<a([^>]*)>\s*<img([^>]*?)(?<!\/)\s*>\s*<\/a>/g, (match, aAttrs, imgAttrs) => {
    // Extract href from a tag
    const hrefMatch = aAttrs.match(/href\s*=\s*["']([^"']+)["']/);
    // Extract src and alt from img tag
    const srcMatch = imgAttrs.match(/src\s*=\s*["']([^"']+)["']/);
    const altMatch = imgAttrs.match(/alt\s*=\s*["']([^"']*?)["']/);
    
    if (hrefMatch && srcMatch) {
      const href = hrefMatch[1];
      const src = srcMatch[1];
      const alt = altMatch ? altMatch[1] : '';
      
      // Convert problematic images to simple links
      if (src.includes('github.com/user-attachments') || 
          src.includes('img.shields.io') ||
          src.includes('githubusercontent.com')) {
        return `[${alt || 'View Image'}](${href})`;
      }
      
      // Convert to markdown format for other images
      return `[![${alt}](${src})](${href})`;
    }
    
    // If extraction fails, just remove the problematic HTML
    return '';
  });
  
  // Remove all HTML img tags completely to avoid Next.js Image issues
  sanitized = sanitized.replace(/<img[^>]*>/gi, '<!-- Image removed for compatibility -->');
  
  // Also remove any remaining image references that could cause issues
  sanitized = sanitized.replace(/!\[.*?\]\(https:\/\/github\.com\/[^)]*\)/g, '[Image removed for compatibility]');
  sanitized = sanitized.replace(/!\[.*?\]\(https:\/\/githubusercontent\.com\/[^)]*\)/g, '[Image removed for compatibility]');
  sanitized = sanitized.replace(/!\[.*?\]\(https:\/\/img\.shields\.io\/[^)]*\)/g, '[Badge removed for compatibility]');
  
  // Remove HTML comments that might interfere
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove any YAML frontmatter that might cause parsing issues
  sanitized = sanitized.replace(/^---[\s\S]*?---\s*/m, '');
  
  // Fix problematic characters that cause parsing errors
  sanitized = sanitized.replace(/[\u003D]/g, '='); // Fix U+003D character issues
  sanitized = sanitized.replace(/[\u2013\u2014]/g, '-'); // Fix em/en dashes
  sanitized = sanitized.replace(/[\u201C\u201D]/g, '"'); // Fix smart quotes
  sanitized = sanitized.replace(/[\u2018\u2019]/g, "'"); // Fix smart apostrophes
  
  // Remove any malformed markdown syntax that could cause parsing errors
  sanitized = sanitized.replace(/^-{3,}\s*$/gm, '---'); // Fix malformed horizontal rules
  sanitized = sanitized.replace(/={3,}/g, '==='); // Fix malformed headers
  
  // Fix other common unclosed tags
  sanitized = sanitized.replace(/<(br|hr|input|area|base|col|embed|source|track|wbr)([^>]*)(?<!\/)\s*>/g, '<$1$2 />');
  
  // Remove problematic JSX-like syntax that might confuse the parser
  sanitized = sanitized.replace(/\<[^>]*=(?![^>]*["'])[^>]*\>/g, '');
  
  // Remove problematic nested HTML structures
  sanitized = sanitized.replace(/<div[^>]*>[\s\S]*?<\/div>/g, '');
  sanitized = sanitized.replace(/<span[^>]*>[\s\S]*?<\/span>/g, '');
  
  return sanitized;
}

async function fetchFileFromRepo(
  owner: string,
  repo: string,
  path: string,
  branch: string = "main"
): Promise<string | null> {
  const cacheKey = `github:${owner}/${repo}:${branch}:${path}`;
  
  return fetchWithCache(
    cacheKey,
    async () => {
      try {
        const response = await octokit.request(
          "GET /repos/{owner}/{repo}/contents/{path}",
          {
            owner,
            repo,
            path,
            ref: branch,
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );

        if (Array.isArray(response.data) || response.data.type !== "file") {
          return null;
        }

        return Buffer.from(response.data.content, "base64").toString();
      } catch (error: any) {
        console.warn(`Failed to fetch ${path} from ${owner}/${repo}@${branch}:`, error?.message);
        return null;
      }
    },
    7200 // 2 hours cache
  );
}

export async function createPluginSource(): Promise<
  Source<{
    metaData: { title: string; pages: string[] };
    pageData: {
      title: string;
      load: () => Promise<CompiledPage>;
    };
  }>
> {
  const files: VirtualFile[] = [];

  for (const plugin of plugins) {
    const { owner, repo } = parseRepositoryUrl(plugin.repository_url);

    for (const version of plugin.versions) {
      const basePath = `${plugin.slug}/${version.version}`;

      // Use plugin-specific markdown files
      const docFiles = plugin.markdown_files;

      for (const docFile of docFiles) {
        files.push({
          type: "page",
          path: `${basePath}/${docFile.name.toLowerCase().replace('.md', '')}`,
          data: {
            title: `${plugin.name} - ${version.version} - ${docFile.title}`, // Full title for prev/next
            shortTitle: docFile.title, // Short title for sidebar
            pluginName: plugin.name,
            async load() {
              const content = await fetchFileFromRepo(
                owner,
                repo,
                docFile.name,
                version.github_branch
              );

              if (!content) {
                return compile(
                  `${basePath}/${docFile.name}`,
                  `# ${docFile.title}\n\nThis document is not available for ${plugin.name} version ${version.version}.`
                );
              }

              // Always sanitize content before any compilation attempt
              const sanitizedContent = await sanitizeMarkdown(content);

              try {
                return compile(`${basePath}/${docFile.name}`, sanitizedContent);
              } catch (error) {
                console.warn(`Failed to compile ${docFile.name} for ${plugin.name}:`, error);
                
                // Try once more with more aggressive sanitization
                try {
                  let basicSanitized = content
                    .replace(/<[^>]*>/g, '') // Strip all HTML tags
                    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '') // Remove complex image links  
                    .replace(/!\[.*?\]\(.*?\)/g, '[Image removed for compatibility]') // Replace all images with placeholder
                    .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up excessive newlines
                    .replace(/[\u003D]/g, '=') // Fix U+003D character issues
                    .replace(/[\u2013\u2014]/g, '-') // Fix em/en dashes
                    .replace(/[\u201C\u201D]/g, '"') // Fix smart quotes
                    .replace(/[\u2018\u2019]/g, "'") // Fix smart apostrophes
                    .replace(/^---[\s\S]*?---\s*/m, '') // Remove YAML frontmatter
                    .replace(/^-{3,}\s*$/gm, '---') // Fix malformed horizontal rules
                    .replace(/={3,}/g, '==='); // Fix malformed headers
                  
                  // Also sanitize code block languages in fallback
                  const unsupportedLanguages = ['env', 'dotenv', 'environment'];
                  unsupportedLanguages.forEach(lang => {
                    const regex = new RegExp(`\`\`\`${lang}\\b`, 'gi');
                    basicSanitized = basicSanitized.replace(regex, '```bash');
                  });
                  
                  return compile(`${basePath}/${docFile.name}`, `# ${docFile.title}\n\n${basicSanitized}`);
                } catch (secondError) {
                  console.warn(`Second compilation attempt failed for ${docFile.name}:`, secondError);
                  
                  // Final fallback content when all compilation fails
                  const fallbackContent = `# ${docFile.title}

*Note: This document contains formatting that couldn't be processed. View the original on GitHub.*

${!plugin.is_private ? `[View on GitHub](${plugin.repository_url}/blob/${version.github_branch}/${docFile.name})` : ''}

---

This document is available but contains content that cannot be displayed properly in this format.
`;
                  
                  return compile(`${basePath}/${docFile.name}`, fallbackContent);
                }
              }
            },
          },
        });
      }

      // Create a meta file for each plugin version
      files.push({
        type: "meta",
        path: `${basePath}/meta.json`,
        data: {
          title: version.version,
          pages: ["readme", "documentation", "changelog"].filter((page) => true), // We'll check availability later if needed
        },
      });
    }

    // Create a top-level meta for the plugin
    files.push({
      type: "meta",
      path: `${plugin.slug}/meta.json`,
      data: {
        title: plugin.name,
        pages: plugin.versions.map(v => v.version),
      },
    });
  }

  return {
    files,
  };
}
