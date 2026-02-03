import { Octokit } from '@octokit/rest';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { config } from '../lib/config';

const octokit = new Octokit();

// Parse command line arguments
// Usage: tsx scripts/fetch-docs.ts [--cache-only|--offline]
// --cache-only: Skip fetching from GitHub and use only cached content
const args = process.argv.slice(2);
const cacheOnly = args.includes('--cache-only') || args.includes('--offline');

if (cacheOnly) {
  console.log('🔌 Running in cache-only mode. Will not fetch from GitHub.');
}

function getCachePath(owner: string, repo: string, ref: string, path: string): string {
  // Use a Safe path structure: .cache/raw/owner/repo/ref/path
  // Replce any potential invalid characters in ref just in case, though usually refs are file-safe or close to it.
  const safeRef = ref.replace(/[\/\\?%*:|"<>]/g, '-'); 
  return join(process.cwd(), '.cache', 'raw', owner, repo, safeRef, path);
}

async function fetchFromGithub(owner: string, repo: string, path: string, ref: string): Promise<string | null> {
  try {
    const response = await octokit.repos.getContent({ owner, repo, path, ref });
    if ('content' in response.data) {
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    }
  } catch (error: any) {
    if (error.status === 403 && error.message.includes('rate limit')) {
      console.warn(`⚠️ GitHub API rate limit exceeded while fetching ${path}. Skipping...`);
      return null;
    }
    console.error(`Failed to fetch ${path}:`, error);
  }
  return null;
}

async function fetchFileContent(owner: string, repo: string, path: string, ref: string, cacheOnly: boolean = false): Promise<string | null> {
  const cachePath = getCachePath(owner, repo, ref, path);

  if (existsSync(cachePath)) {
    // console.log(`[Cache Hit] ${path}`);
    return readFileSync(cachePath, 'utf-8');
  }

  if (cacheOnly) {
    console.warn(`⚠️ Cache miss for ${path} but running in cache-only mode. Skipping...`);
    return null;
  }

  // console.log(`[Cache Miss] Fetching ${path}...`);
  const content = await fetchFromGithub(owner, repo, path, ref);

  if (content) {
    mkdirSync(dirname(cachePath), { recursive: true });
    writeFileSync(cachePath, content);
  }

  return content;
}

async function downloadImage(owner: string, repo: string, imagePath: string, ref: string, localPath: string, cacheOnly: boolean = false): Promise<void> {
  if (existsSync(localPath)) {
    return;
  }

  if (cacheOnly) {
    console.warn(`⚠️ Image ${imagePath} not in cache but running in cache-only mode. Skipping...`);
    return;
  }

  try {
    const response = await octokit.repos.getContent({ owner, repo, path: imagePath, ref });
    if ('content' in response.data) {
      const buffer = Buffer.from(response.data.content, 'base64');
      writeFileSync(localPath, buffer);
    }
  } catch (error: any) {
    if (error.status === 403 && error.message.includes('rate limit')) {
      console.warn(`⚠️ GitHub API rate limit exceeded while downloading image ${imagePath}. Skipping...`);
      return;
    }
    console.error(`Failed to download image ${imagePath}:`, error);
  }
}

async function processImages(content: string, owner: string, repo: string, branch: string, docsPath: string, localImagesDir: string, fileDir: string, pluginId: string, cacheOnly: boolean = false): Promise<string> {
  // Run cleanup cleanupContent before processing images
  let processedContent = cleanupContent(content);

  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: string[] = [];

  let match;
  while ((match = imageRegex.exec(processedContent)) !== null) {
    images.push(match[2]);
  }

  for (const imagePath of images) {
    if (imagePath.startsWith('http')) {
      // For external images, ensure they're properly formatted but don't try to download them
      continue;
    }

    // Resolve relative path from the file location
    const fileRelativeDir = fileDir.replace(join('content', 'docs'), '').split('/').filter(Boolean);
    const relativeDepth = fileRelativeDir.length;
    const upDirs = '../'.repeat(relativeDepth);

    // The image path in repo is relative to the docs root
    let repoImagePath = imagePath;
    if (imagePath.startsWith('../')) {
      // Resolve .. relative to docsPath
      const docsParts = docsPath.split('/').filter(Boolean);
      const imageParts = imagePath.split('/').filter(Boolean);
      const resolvedParts = [...docsParts];

      for (const part of imageParts) {
        if (part === '..') {
          resolvedParts.pop();
        } else if (part !== '.') {
          resolvedParts.push(part);
        }
      }
      repoImagePath = resolvedParts.join('/');
    } else {
      repoImagePath = join(docsPath, imagePath).replace(/\\/g, '/');
    }

    // Local path in public/images
    const localImagePath = join(localImagesDir, imagePath);
    const localImageDir = join(localImagesDir, imagePath.substring(0, imagePath.lastIndexOf('/')));
    mkdirSync(localImageDir, { recursive: true });

    try {
      await downloadImage(owner, repo, repoImagePath, branch, localImagePath, cacheOnly);

      // Update the path in content to be relative to the MDX file
      const relativePath = join(upDirs, 'images', pluginId, imagePath).replace(/\\/g, '/');
      processedContent = processedContent.replace(new RegExp(imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), relativePath);
    } catch (error) {
      console.error(`Failed to process image ${imagePath}, replacing with placeholder`);
      // Replace with a placeholder text
      processedContent = processedContent.replace(new RegExp(`!\\[([^\\]]*)\\]\\(${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'), '*[Image: $1 not available]*');
    }
  }

  // Ensure all img tags are self-closing (simplified regex)
  processedContent = processedContent.replace(/<img\s+([^>]*?)(?:\/?>)/g, '<img $1 />');

  return processedContent;
}

function cleanupContent(source: string): string {
  let parsedSource = source;

  // Fix: <a xxx><img></a> - convert img to self-closing and keep anchor
  parsedSource = parsedSource.replace(
    /<a([^>]+)>(<img[^>]+)><\/a>/g,
    "<a$1>$2/></a>",
  );

  // Replace <!-- xxx --> with <div class="note">xxx</div>
  parsedSource = parsedSource.replace(
    /<!--\s*(.*?)\s*-->/g,
    '<div class="note">$1</div>',
  );

  // Fix type annotations
  parsedSource = parsedSource.replace(
    /array<([^>]+)>/g,
    'array&lt;$1&gt;',
  );

  // Fix standalone type annotations
  parsedSource = parsedSource.replace(
    /(\s+- `[^`]+`):\s+(int|string|bool|float|double|object|array)(\s|$)/g,
    '$1: `$2`$3',
  );

  // Fix type annotations in parameter lists
  parsedSource = parsedSource.replace(
    /(\*\*[^*]+\*\*):\s+(array&lt;[^&]+&gt;|int|string|bool|float|double|object|array)(\s)/g,
    '$1: `$2`$3',
  );

  // Replace "style="xx" as mdx format
  parsedSource = parsedSource.replace(
    /style\s*=\s*"([^"]+)"/g,
    (match: string, styleValue: string): string => {
      const styles = styleValue
        .split(';')
        .filter((prop: string) => prop.trim())
        .map((prop: string) => {
          const [property, ...valueParts] = prop.split(':');
          const value = valueParts.join(':').trim();
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

  // Replace invalid ```env blocks with ```plaintext
  parsedSource = parsedSource.replace(
    /```env/g,
    '```plaintext',
  );

  // Convert GitHub callouts to MDX Callout components
  parsedSource = parsedSource.replace(
    /> \[!(NOTE|IMPORTANT|WARNING|CAUTION|TIP)\]\s*\n([\s\S]*?)(?=\n\n|$)/g,
    (match: string, type: string, content: string): string => {
      const calloutType = type.toLowerCase();
      let mdxType = 'info'; // default

      switch (calloutType) {
        case 'note':
          mdxType = 'info';
          break;
        case 'important':
          mdxType = 'warn';
          break;
        case 'warning':
        case 'caution':
          mdxType = 'error';
          break;
        case 'tip':
          mdxType = 'idea';
          break;
      }

      // Clean up the content (remove leading/trailing whitespace and blockquote markers)
      const cleanContent = content
        .replace(/^>\s*/gm, '') // Remove blockquote markers
        .trim();

      return `<Callout type="${mdxType}">\n${cleanContent}\n</Callout>`;
    }
  );

  return parsedSource;
}

async function getLastUpdated(owner: string, repo: string, path: string, ref: string, cacheOnly: boolean = false): Promise<string> {
  if (cacheOnly) {
    // In cache-only mode, return current date since we can't fetch from GitHub
    console.warn(`⚠️ Skipping last updated fetch for ${path} in cache-only mode. Using current date.`);
    return new Date().toISOString();
  }

  try {
    const commits = await octokit.repos.listCommits({ owner, repo, path, sha: ref, per_page: 1 });
    return commits.data[0]?.commit?.committer?.date || new Date().toISOString();
  } catch (error: any) {
    if (error.status === 403 && error.message.includes('rate limit')) {
      console.warn(`⚠️ GitHub API rate limit exceeded while fetching last updated date for ${path}. Using current date.`);
    }
    return new Date().toISOString();
  }
}

async function fetchPluginDocs() {
  for (const plugin of config.plugins) {
    const [owner, repoName] = plugin.repo.split('/');

    const pluginDir = join('content', 'docs', plugin.id);
    mkdirSync(pluginDir, { recursive: true });

    // Create root _meta.json
    const rootMeta = {
      title: plugin.title,
      pages: plugin.versions.map(v => v.version),
    };
    writeFileSync(join(pluginDir, '_meta.json'), JSON.stringify(rootMeta, null, 2));

    for (const version of plugin.versions) {
      const versionDir = join('content', 'docs', plugin.id, version.version);
      mkdirSync(versionDir, { recursive: true });

      const branch = version.github_branch;
      let lastUpdated = await getLastUpdated(owner, repoName, 'README.md', branch, cacheOnly);

      if (plugin.is_manual && plugin.docs_structure === 'folder_based' && version.version === plugin.latestVersion && plugin.sections) {
        // Handle folder-based docs like Filaletter
        const docsPath = plugin.docs_path || '';
        const imagesDir = join('public', 'images', plugin.id);
        mkdirSync(imagesDir, { recursive: true });

        // Create version _meta.json
        const versionMeta = {
          title: `${plugin.title} ${version.version}`,
          pages: plugin.sections.map(s => s.slug),
        };
        writeFileSync(join(versionDir, '_meta.json'), JSON.stringify(versionMeta, null, 2));

        for (const section of plugin.sections) {
          const sectionDir = join(versionDir, section.slug);
          mkdirSync(sectionDir, { recursive: true });

          // Create section _meta.json
          const sectionMeta = {
            title: section.name,
            pages: section.files.map(f => f.slug),
          };
          writeFileSync(join(sectionDir, '_meta.json'), JSON.stringify(sectionMeta, null, 2));

          for (const file of section.files) {
            const filePath = join(docsPath, file.name).replace(/\\/g, '/');
            let content = await fetchFileContent(owner, repoName, filePath, branch, cacheOnly);
            if (content) {
              // Process images
              content = await processImages(content, owner, repoName, branch, docsPath, imagesDir, sectionDir, plugin.id, cacheOnly);

              const mdxContent = `---
title: ${file.title}
---

${content}
`;
              writeFileSync(join(sectionDir, `${file.slug}.mdx`), mdxContent);
            }
          }
        }
      } else {
        // Handle simple README-based docs
        const files = version.limited_files || [{ name: 'README.md', title: plugin.title, slug: 'index' }];
        const imagesDir = join('public', 'images', plugin.id);
        mkdirSync(imagesDir, { recursive: true });

        // Create version _meta.json
        const versionMeta = {
          title: `${plugin.title} ${version.version}`,
          pages: files.map(f => f.slug),
        };
        writeFileSync(join(versionDir, '_meta.json'), JSON.stringify(versionMeta, null, 2));

        for (const file of files) {
          let content = await fetchFileContent(owner, repoName, file.name, branch, cacheOnly);
          if (content) {
            // Process images
            content = await processImages(content, owner, repoName, branch, '', imagesDir, versionDir, plugin.id, cacheOnly);

            const mdxContent = `---
title: ${file.title}
description: ${plugin.description}
lastUpdated: ${lastUpdated}
---

${content}
`;
            writeFileSync(join(versionDir, `${file.slug}.mdx`), mdxContent);
          }
        }
      }

      console.log(`Fetched docs for ${plugin.id} ${version.version}`);
    }
  }
}

fetchPluginDocs();