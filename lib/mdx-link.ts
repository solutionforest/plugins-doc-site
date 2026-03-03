import { config } from '@/lib/config';
import { source } from '@/lib/source';
import type { Page } from 'fumadocs-core/source';

export function createCustomRelativeLink(page: Page) {
  return (href: any): string => {

    if (typeof href === 'string') {
      // do nothing
    } else {
      return String(href);
    }

    // Skip external and anchors
    if (
      href.startsWith('http') || 
      href.startsWith('https') || 
      href.startsWith('mailto:') || 
      href.startsWith('#')
    ) {
      return href;
    }

    const slugs = page.slugs; 
    // Expect: [pluginId, versionId, ...rest]
    if (slugs.length < 2) return href;

    const pluginId = slugs[0];
    const versionId = slugs[1];

    const plugin = config.plugins.find(p => p.id === pluginId);
    if (!plugin) return href;

    const versionConfig = plugin.versions.find(v => v.version === versionId);
    if (!versionConfig) return href;

    // Clean href for local lookup
    const cleanPath = href.replace(/\.mdx?$/, '').toLowerCase();
    
    // Resolve relative path
    // page.slugs example: ['plugin', 'v1', 'folder', 'page']
    // currentDirSlugs: ['folder']
    const currentDirSlugs = slugs.slice(2, -1);
    
    const parts = [...currentDirSlugs];
    const hrefParts = cleanPath.split('/');

    // First check if the href directly matches a limited file in the version config (for better handling of casing and extensions)
    if (hrefParts.length > 1) {
      // console.warn(`Link with multiple parts: ${href}, skipping limited_files check due to complexity.`);
      const matchedFile = Array.from(versionConfig.limited_files || []).find(f => f.name == href);
      if (matchedFile) {
        const resolvedPage = source.getPage([pluginId, versionId, matchedFile.slug]);
        if (resolvedPage) {
          return resolvedPage.url;
        } 
      }
    }

    // If the link has only one part, we can check if it matches a limited file in the current directory for better handling of casing and extensions
    const currentIsLimitedFile = Array.from(versionConfig.limited_files || []).find(f => f.slug == page.slugs.slice(2).join('/')) || null;
    const dir = currentIsLimitedFile?.name.split('/').slice(0, -1).join('/') || '';
    const matchedFile = Array.from(versionConfig.limited_files || []).find(f => f.name == [dir, href].join('/')) || null;
    if (currentIsLimitedFile && matchedFile) {
      const resolvedPage = source.getPage([pluginId, versionId, matchedFile.slug]);
      if (resolvedPage) {
        return resolvedPage.url;
      }
    }

    for (const part of hrefParts) {
      if (part === '.') continue;
      if (part === '..') {
        parts.pop();
      } else {
        parts.push(part);
      }
    }
    
    if (hrefParts.length > 0) {
      console.warn(`Resolving link: ${href} to slugs: ${parts.join('/')}`);
    }

    const resolvedPage = source.getPage([pluginId, versionId, ...parts]);
    
    if (resolvedPage) {
      return resolvedPage.url;
    }
    
    // Fallback to GitHub
    // repo is "owner/repo"
    const repoBase = `https://github.com/${plugin.repo}`;
    // Use configured branch or default to 'main'
    const branch = versionConfig.github_branch || 'main';
    
    // Construct GitHub blob URL
    // We use the original href here to preserve casing and extension, but we should handle '..' if possible.
    // However, GitHub handles '..' in blob paths? No, it usually 404s.
    // So we might need to resolve it properly for GitHub string too, but casing matters.
    // For now, simple concatenation as per reference implementation (wait, reference didn't resolve .. for github link?)
    // Reference: repositoryUrl = `${repository.repository_url}/blob/${version.github_branch || version.version}/${href}`;
    // So it blindly appended. We will do the same.
    
    return `${repoBase}/blob/${branch}/${href}`;
  };
}
