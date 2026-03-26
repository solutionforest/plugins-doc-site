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

async function processImages(content: string, owner: string, repo: string, branch: string, docsPath: string, localImagesDir: string, fileDir: string, pluginId: string, cacheOnly: boolean = false, repoFileDir: string = ''): Promise<string> {
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
    if (imagePath.startsWith('../') || imagePath.startsWith('./')) {
      // Resolve the relative path starting from the file's own directory in the repo
      // (not just the docs root). For example, if the file is at
      // "filaletter/public/docs/2-features/foo.md" and the image is "../../images/x.png",
      // the correct result is "filaletter/public/images/x.png", not "filaletter/images/x.png".
      const baseParts = (repoFileDir || docsPath).split('/').filter(Boolean);
      const imageParts = imagePath.split('/').filter(Boolean);
      const resolvedParts = [...baseParts];

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

    // cleanImagePath is the resolved repo-relative path, e.g. "filaletter/images/capscreens/capscreen-14.png"
    // Local filesystem path under public/, e.g. "public/filaletter/images/capscreens/capscreen-14.png"
    const localImagePath = join('public', cleanImagePath);
    const localImageDir = join('public', cleanImagePath.substring(0, cleanImagePath.lastIndexOf('/')));
    console.debug(`💠 Processing image ${imagePath}`, { repoPath: repoImagePath, cleanImagePath, localPath: localImagePath, localImageDir });
    mkdirSync(localImageDir, { recursive: true });

    // Public URL served from Next.js, e.g. "/filaletter/images/capscreens/capscreen-14.png"
    // IMPORTANT: Must use cleanImagePath (the resolved path), NOT the raw relative imagePath.
    // Using path.join('/', pluginId, imagePath) would let path.join normalize away '../..' and
    // strip the plugin prefix, producing the wrong path like "/images/capscreens/capscreen-14.png".
    const publicUrl = '/' + cleanImagePath.replace(/\\/g, '/');
    const escapedImagePath = imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    try {
      const success = await downloadImage(owner, repo, repoImagePath, branch, localImagePath, cacheOnly);
      if (!success) {
        console.warn(`⚠️ Image not available (cache miss or download failed): ${imagePath} → ${localImagePath}`);
      }

      console.debug(`🖊️ Rewriting image path ${imagePath} to ${publicUrl} in content...`);

      // Replace markdown images ![alt](path) with <img> JSX tags.
      // Reason: fumadocs/Next.js converts markdown ![]() into static `import` statements at
      // build time. If the file is missing from public/, the build fails with "Module not found".
      // Using <img src="..."> is plain JSX — no import is generated — so a missing image only
      // produces a broken image at runtime (warning) instead of a hard build error.
      processedContent = processedContent.replace(
        new RegExp(`!\\[([^\\]]*)\\]\\(${escapedImagePath}\\)`, 'g'),
        `<img src="${publicUrl}" alt="$1" />`
      );

      // Replace HTML img src attributes
      processedContent = processedContent.replace(new RegExp(`src=["']${escapedImagePath}["']`, 'g'), `src="${publicUrl}"`);

    } catch (error) {
      console.warn(`⚠️ Failed to process image ${imagePath}, leaving as broken image tag`);
      // Convert to <img> with the best-effort URL so the build still succeeds
      processedContent = processedContent.replace(
        new RegExp(`!\\[([^\\]]*)\\]\\(${escapedImagePath}\\)`, 'g'),
        `<img src="${publicUrl}" alt="$1" />`
      );
    }
  }

  // Ensure all img tags are self-closing (simplified regex)
  processedContent = processedContent.replace(/<img\s+([^>]*?)(?:\/?>)/g, '<img $1 />');

  return processedContent;
}

function cleanupContent(source: string): string {
  let parsedSource = source;

  // Replace invalid ```env blocks with ```plaintext (must run before code block protection)
  parsedSource = parsedSource.replace(/```env/g, '```plaintext');

  // Protect fenced code blocks from transformations — stash them as placeholders.
  // This prevents {{}} escaping, array<T> encoding, style conversion, etc. from
  // corrupting code examples.
  const codeBlocks: string[] = [];
  parsedSource = parsedSource.replace(/```[^\n]*\n[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `\x00CODE_BLOCK_${codeBlocks.length - 1}\x00`;
  });

  // Protect inline code spans from transformations
  const inlineCodes: string[] = [];
  parsedSource = parsedSource.replace(/`[^`\n]+`/g, (match) => {
    inlineCodes.push(match);
    return `\x00INLINE_CODE_${inlineCodes.length - 1}\x00`;
  });

  // Fix: <a xxx><img></a> - convert img to self-closing and keep anchor
  parsedSource = parsedSource.replace(
    /<a([^>]+)>(<img[^>]+)><\/a>/g,
    "<a$1>$2/></a>",
  );

  // Replace <!-- xxx --> with <div className="note">xxx</div>
  // NOTE: must use className (not class) — MDX is JSX and class is invalid
  parsedSource = parsedSource.replace(
    /<!--\s*(.*?)\s*-->/gs,
    '<div className="note">$1</div>',
  );

  // Fix type annotations (outside code blocks)
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

  // Replace "{{xxx}}" -> "\{\{xxx\}\}" (Blade/template syntax that breaks MDX).
  // Must run BEFORE the style conversion so the newly-generated style={{ }} JSX
  // objects are not accidentally escaped by this rule.
  parsedSource = parsedSource.replace(
    /{{\s*(.*?)\s*}}/g,
    '\\{\\{$1\\}\\}',
  );

  // Replace style="xx" as MDX/JSX format.
  // Runs AFTER the {{}} escaping so its output (style={{ }}) is never re-escaped.
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

  // Convert GitHub callouts to MDX Callout components.
  // Uses multiline flag (m) so ^ matches line starts.
  // Content group only matches lines that begin with '>' so it never
  // accidentally swallows non-blockquote content (headings, paragraphs, etc.)
  // that follows immediately without a blank line separating them.
  parsedSource = parsedSource.replace(
    /^> \[!(NOTE|IMPORTANT|WARNING|CAUTION|TIP)\]\s*\n((?:>[ \t]?[^\n]*\n?)*)/gm,
    (match: string, type: string, content: string): string => {
      const calloutType = type.toLowerCase();
      let mdxType = 'info'; // default

      switch (calloutType) {
        case 'note':      mdxType = 'info';  break;
        case 'important': mdxType = 'warn';  break;
        case 'warning':
        case 'caution':   mdxType = 'error'; break;
        case 'tip':       mdxType = 'idea';  break;
      }

      // Clean up the content (remove leading/trailing whitespace and blockquote markers)
      const cleanContent = content
        .replace(/^>[ \t]?/gm, '') // Remove blockquote markers
        .trim();

      return `<Callout type="${mdxType}">\n${cleanContent}\n</Callout>\n`;
    }
  );

  // Restore protected inline code and fenced code blocks
  parsedSource = parsedSource.replace(/\x00INLINE_CODE_(\d+)\x00/g, (_, i) => inlineCodes[parseInt(i)]);
  parsedSource = parsedSource.replace(/\x00CODE_BLOCK_(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)]);

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

      // Build version meta.json and per-folder meta.json files.
      // Slugs may be flat ("overview") or nested ("getting-started/introduction").
      // Top-level pages list contains flat slugs and folder names (de-duped, ordered).
      // Each folder gets its own meta.json inside its subdirectory.
      const topLevelPages: string[] = [];
      const folderGroups = new Map<string, string[]>(); // folder slug -> ordered page slugs

      // Helper: convert a folder slug to a display title, e.g. "getting-started" -> "Getting Started"
      const folderSlugToTitle = (slug: string): string =>
        (version.folder_titles?.[slug]) ??
        slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      for (const file of files) {
        const slashIdx = file.slug.indexOf('/');
        if (slashIdx === -1) {
          // Top-level page (e.g. "overview")
          topLevelPages.push(file.slug);
        } else {
          // Nested page: split into folder + page slug (e.g. "getting-started/installation")
          const folder = file.slug.slice(0, slashIdx);
          const pageSlug = file.slug.slice(slashIdx + 1);
          if (!folderGroups.has(folder)) {
            folderGroups.set(folder, []);
            topLevelPages.push(folder); // add folder name once, in order
          }
          folderGroups.get(folder)!.push(pageSlug);
        }
      }

      // Write version-level meta.json (top-level pages + folder names only)
      const versionMeta = {
        title: `${version.version}`,
        pages: topLevelPages,
      };
      writeFileSync(join(versionDir, 'meta.json'), JSON.stringify(versionMeta, null, 2));

      // Write a meta.json inside each subfolder
      for (const [folder, pages] of folderGroups.entries()) {
        const subfolderDir = join(versionDir, folder);
        mkdirSync(subfolderDir, { recursive: true });
        const subMeta = {
          title: folderSlugToTitle(folder),
          pages,
        };
        writeFileSync(join(subfolderDir, 'meta.json'), JSON.stringify(subMeta, null, 2));
        console.log(`  📁 Generated meta.json for ${plugin.id} ${version.version}/${folder}`);
      }

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
          // Pass the file's own directory in the repo so relative image paths (../../) resolve correctly.
          const repoFileDir = dirname(file.name).replace(/\\/g, '/');
          content = await processImages(content, owner, repoName, branch, docsPath, assetsDir, versionDir, plugin.id, cacheOnly, repoFileDir);

          const mdxContent = `---
title: ${file.title}
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