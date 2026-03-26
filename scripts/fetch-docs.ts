import { Octokit } from '@octokit/rest';
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import * as dotenv from 'dotenv';
import { config } from '../lib/config';

dotenv.config({ path: '.env.local' });

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Parse command line arguments
// Usage: tsx scripts/fetch-docs.ts [--cache-only|--offline] [--plugin=<id>] [--version=<ver>]
// --cache-only / --offline : Skip fetching from GitHub and use only cached content
// --plugin=<id>            : Only fetch docs for the plugin with this id (can repeat)
// --version=<ver>          : Only fetch docs for this version string (can repeat)
//
// Examples:
//   tsx scripts/fetch-docs.ts --plugin=filament-tree
//   tsx scripts/fetch-docs.ts --plugin=filament-tree --version=4.x
//   tsx scripts/fetch-docs.ts --plugin=filament-tree --plugin=filament-firewall
const args = process.argv.slice(2);
const cacheOnly = args.includes('--cache-only') || args.includes('--offline');

// Collect repeated --plugin and --version values (supports both --plugin=id and --plugin id)
function parseRepeatedArg(argName: string, argv: string[]): string[] {
  const values: string[] = [];
  const prefix = `--${argName}=`;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith(prefix)) {
      values.push(argv[i].slice(prefix.length));
    } else if (argv[i] === `--${argName}` && i + 1 < argv.length) {
      values.push(argv[++i]);
    }
  }
  return values;
}

// CLI args take priority; fall back to env vars (FETCH_PLUGIN / FETCH_VERSION).
// Env vars support comma-separated values: FETCH_PLUGIN=filament-tree,filament-firewall
function splitEnvList(val: string | undefined): string[] {
  return val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
}

const filterPlugins  = parseRepeatedArg('plugin',  args).length
  ? parseRepeatedArg('plugin',  args)
  : splitEnvList(process.env.FETCH_PLUGIN);

const filterVersions = parseRepeatedArg('version', args).length
  ? parseRepeatedArg('version', args)
  : splitEnvList(process.env.FETCH_VERSION);

if (cacheOnly)             console.log('🔌 Running in cache-only mode. Will not fetch from GitHub.');
if (filterPlugins.length)  console.log(`🔍 Filtering plugins:  ${filterPlugins.join(', ')}`);
if (filterVersions.length) console.log(`🔍 Filtering versions: ${filterVersions.join(', ')}`);

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

async function downloadAssets(owner: string, repo: string, folder: string, ref: string, localFolder: string, cacheOnly: boolean = false, depth: number = 0): Promise<void> {
  // Safety for recursive calls
  if (depth > 5) {
    console.warn(`⚠️ Maximum asset download depth exceeded for folder ${folder}. Skipping further recursion.`);
    return;
  }
  try {
    const response = await octokit.repos.getContent({ owner, repo, path: folder, ref });
    // console.log(`Fetched asset list for ${folder}, processing...`, { response });
    if (Array.isArray(response.data)) {
      for (const item of response.data) {
        // console.log(`Processing asset item: ${item.path} (type: ${item.type})`);
        if (item.type === 'file') {
          // Download file from GitHub and save to local folder
          const localFilePath = join(localFolder, item.name);
          console.log(`Downloading asset file ${item.path} to ${localFilePath}...`);
          const success = await downloadImage(owner, repo, item.path, ref, localFilePath, cacheOnly);
          if (!success) {
            console.warn(`⚠️ Failed to download asset ${item.path}. Creating empty placeholder at ${localFilePath}.`);
            mkdirSync(dirname(localFilePath), { recursive: true });
            writeFileSync(localFilePath, '');
          }
        } else if (item.type === 'dir') {
          // Recursively download subdirectory
          const subLocalFolder = join(localFolder, item.name);
          await downloadAssets(owner, repo, item.path, ref, subLocalFolder, cacheOnly, depth + 1);
        }
      }
    }
  } catch (error: any) {
    if (error.status === 403 && error.message.includes('rate limit')) {
      console.warn(`⚠️ GitHub API rate limit exceeded while fetching assets in ${folder}. Skipping...`);
      return;
    }
    console.error(`Failed to fetch assets in ${folder}:`, error);
    return;
  }
}

async function downloadImage(owner: string, repo: string, imagePath: string, ref: string, localPath: string, cacheOnly: boolean = false): Promise<boolean> {
  if (existsSync(localPath)) {
    return true;
  }

  // Try to find image in cache first
  const cachePath = getCachePath(owner, repo, ref, imagePath);
  if (existsSync(cachePath)) {
    const content = readFileSync(cachePath);
    // Ensure directory exists
    mkdirSync(dirname(localPath), { recursive: true });
    writeFileSync(localPath, content);
    return true;
  }

  if (cacheOnly) {
    console.warn(`⚠️ Image ${imagePath} not in cache (${cachePath}) but running in cache-only mode. Skipping...`);
    return false;
  }

  try {
    const response = await octokit.repos.getContent({ owner, repo, path: imagePath, ref });
    if ('content' in response.data) {
      const buffer = Buffer.from(response.data.content, 'base64');
      writeFileSync(localPath, buffer);
      
      // Save to cache
      console.debug(`🎨 Caching image ${imagePath} to ${cachePath}...`);
      mkdirSync(dirname(cachePath), { recursive: true });
      writeFileSync(cachePath, buffer);
      
      return true;
    }
  } catch (error: any) {
    if (error.status === 403 && error.message.includes('rate limit')) {
      console.warn(`⚠️ GitHub API rate limit exceeded while downloading image ${imagePath}. Skipping...`);
      return false;
    }
    console.error(`Failed to download image ${imagePath}:`, error);
  }
  return false;
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
    console.debug(`Resolving image path ${imagePath} from file directory ${fileDir} with docsPath ${docsPath}...`, {fileRelativeDir});

    // The image path in repo is relative to the docs root
    let repoImagePath = imagePath;
    let cleanImagePath = imagePath;
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
      cleanImagePath = repoImagePath;
    } else {
      repoImagePath = join(docsPath, imagePath).replace(/\\/g, '/');
      cleanImagePath = repoImagePath;
    }

    // Local path in public/{pluginId}/... for use in content
    const localImagePath = join(pluginId, imagePath, cleanImagePath);
    const localImageDir = join(pluginId, imagePath, cleanImagePath.substring(0, cleanImagePath.lastIndexOf('/')));
    console.debug(`💠 Processing image ${imagePath}`, { repoPath: repoImagePath, cleanImagePath, localPath: localImagePath, localImageDir });
    mkdirSync(localImageDir, { recursive: true });

    try {
      const success = await downloadImage(owner, repo, repoImagePath, branch, localImagePath, cacheOnly);
      
      if (!success) {
        // Create a placeholder image to prevent build errors
        // 1x1 transparent PNG
        const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        mkdirSync(localImageDir, { recursive: true });
        writeFileSync(localImagePath, placeholder);
        console.warn(`⚠️ Created placeholder for missing image: ${imagePath}`);
      }

      // Use absolute path for public images, format: /src="/{pluginId}/path/to/image"
      const relativePath = join('/', pluginId, imagePath).replace(/\\/g, '/');
      const escapedImagePath = imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      console.debug(`🖊️ Rewriting image path ${imagePath} to ${relativePath} in content...`, {escapedImagePath});
      
      // Use a more robust regex that handles optional title and different attribute orders if possible, 
      // but primarily ensures we replace the path inside the parens of markdown image syntax.
      // And also handling HTML img tags if they were mixed in.
      
      // Replace markdown images: ![alt](path)
      processedContent = processedContent.replace(new RegExp(`!\\[([^\\]]*)\\]\\(${escapedImagePath}\\)`, 'g'), `![$1](${relativePath})`);
      
      // Replace html images: <img src="path" ... />
      processedContent = processedContent.replace(new RegExp(`src=["']${escapedImagePath}["']`, 'g'), `src="${relativePath}"`);
      
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
  const cachePath = getCachePath(owner, repo, ref, path);
  if (cacheOnly) {
    // Try to get file stat from cache if exists
    if (existsSync(cachePath)) {
        // We can't trust file system mtime as it reflects when we downloaded it, not when it was committed.
        // But running in cache-only mode means we accept some staleness.
        // Using current date is safer than misleading old date, but let's suppress the warning if we have content.
        return new Date().toISOString(); 
    }
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
  const rootMetaPages: string[] = [];
  const rootMetaTitles: Record<string, string> = {};

  const plugins = filterPlugins.length
    ? config.plugins.filter(p => filterPlugins.includes(p.id))
    : config.plugins;

  if (filterPlugins.length && plugins.length === 0) {
    console.error(`❌ No plugins matched: ${filterPlugins.join(', ')}`);
    console.error(`   Available ids: ${config.plugins.map(p => p.id).join(', ')}`);
    process.exit(1);
  }

  for (const plugin of plugins) {
    const [owner, repoName] = plugin.repo.split('/');

    const pluginDir = join('content', 'docs', plugin.id);
    
    // Clean up existing directory to remove stale files
    if (existsSync(pluginDir)) {
      rmSync(pluginDir, { recursive: true, force: true });
    }
    
    mkdirSync(pluginDir, { recursive: true });

    // Add to root meta
    rootMetaPages.push(plugin.id);
    rootMetaTitles[plugin.id] = plugin.title;

    // Create plugin meta.json
    const rootMeta = {
      title: plugin.title, // Use title here ensures proper casing (e.g. "Filament Access Management")
      pages: plugin.versions.map(v => v.version),
    };
    writeFileSync(join(pluginDir, 'meta.json'), JSON.stringify(rootMeta, null, 2));

    const versions = filterVersions.length
      ? plugin.versions.filter(v => filterVersions.includes(v.version))
      : plugin.versions;

    if (filterVersions.length && versions.length === 0) {
      console.warn(`⚠️  No versions matched for ${plugin.id}: ${filterVersions.join(', ')} — skipping plugin.`);
      continue;
    }

    for (const version of versions) {
      const versionDir = join('content', 'docs', plugin.id, version.version);
      mkdirSync(versionDir, { recursive: true });

      const branch = version.github_branch;
      let lastUpdated = await getLastUpdated(owner, repoName, 'README.md', branch, cacheOnly);

      // Handle simple README-based docs
      const files = version.limited_files || [{ name: 'README.md', title: plugin.title, slug: 'index' }];
      const assetsDir = join('public', plugin.id);
      mkdirSync(assetsDir, { recursive: true });

      // Create version meta.json with explicitly ordered pages
      const versionMeta = {
        title: `${version.version}`, // Use title from config for proper casing
        pages: files.map(f => f.slug), // This array defines the exact order in sidebar
      };
      writeFileSync(join(versionDir, 'meta.json'), JSON.stringify(versionMeta, null, 2));

      if (version.assets) {
        for (const asset of version.assets) {
          const localAssetPath = join(assetsDir, asset.to);
          console.debug(`📦 Processing asset ${asset.from} to be saved at ${localAssetPath}...`);
          mkdirSync(dirname(localAssetPath), { recursive: true });
          // The asset.from is relative to the docs root in the repo
          try {
            await downloadAssets(owner, repoName, asset.from, branch, localAssetPath, cacheOnly);
          } catch (error) {
            console.error(`Failed to download asset ${asset.from}, creating placeholder`, error);
            writeFileSync(localAssetPath, '');
          }
        }
      }

      for (const file of files) {
        let content = await fetchFileContent(owner, repoName, file.name, branch, cacheOnly);
        if (content) {
          // Process images
          console.debug(`=== Processing content for file ${file.name} ===`);
          const docsPath = version.docs_path || ''; // Base path in repo for resolving images
          content = await processImages(content, owner, repoName, branch, docsPath, assetsDir, versionDir, plugin.id, cacheOnly);

          const mdxContent = `---
title: ${file.title} | ${version.version}
description: ${plugin.description}
lastUpdated: ${lastUpdated}
---

${content}
`;
          const mdxPath = join(versionDir, `${file.slug}.mdx`);
          mkdirSync(dirname(mdxPath), { recursive: true });
          writeFileSync(mdxPath, mdxContent);
        }
      }

      console.log(`Fetched docs for ${plugin.id} ${version.version}`);
    }
  }

  // Create root meta.json for correct ordering and casing in sidebar
  const rootMetaContent = {
    title: 'Plugins',
    pages: rootMetaPages
  };

  // Add custom titles for each page in root meta if needed, though pages array handles order.
  // Fumadocs uses meta.json pages array for order.
  // Titles for folders are usually taken from the folder's meta.json title property, 
  // which we already set above for each plugin.
  
  writeFileSync(join('content', 'docs', 'meta.json'), JSON.stringify(rootMetaContent, null, 2));
  console.log('✅ Generated content/docs/meta.json');
}

fetchPluginDocs();