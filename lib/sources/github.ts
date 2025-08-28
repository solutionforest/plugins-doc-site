import type { Source, VirtualFile } from "fumadocs-core/source";
import { Octokit } from "octokit";
import { compile, type CompiledPage } from "../compile-md";
import * as path from "node:path";
import { getTitleFromFile } from "../source";
import { fumadocMeta } from "../meta";
import {
  repositories,
  getRepositorySlug,
  type RepositoryConfig,
  type VersionConfig,
  getVersionBySlug,
  getBaseFileName,
  getFileSlug,
} from "../repo-config";
import {
  fetchWithCache,
  cache,
  getCachedGitHubContent,
  getCachedGitHubTree,
} from "../cache";

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error(`environment variable GITHUB_TOKEN is needed.`);

export const octokit = new Octokit({
  auth: token,
  request: {
    fetch: (request: any, opts?: any) => {
      return fetch(request, {
        ...opts,
        // Use force-cache for static exports
        cache: "force-cache",
      });
    },
  },
});

// Updated fetchBlob to use force-cache for static exports
async function fetchBlob(url: string): Promise<string> {
  console.time(`fetch ${url}`);

  // Use force-cache for static exports
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "force-cache",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch blob: ${res.status} ${res.statusText}`);
  }

  const { content: base64 } = (await res.json()) as {
    content: string;
  };

  console.timeEnd(`fetch ${url}`);
  return Buffer.from(base64, "base64").toString();
}

/**
 * @returns Sha code of directory in GitHub repo
 */
async function getDirectorySha(
  config: RepositoryConfig,
  version: VersionConfig,
  dirPath: string = "docs",
) {
  const cacheKey = `github:${config.owner}/${config.repo}:${version.github_branch}:${dirPath}`;

  // Check in-memory cache first for faster access
  const cached = cache.get<string>(cacheKey);
  if (cached) {
    console.log(`Cache hit for: ${cacheKey}`);
    return cached;
  }

  try {
    // Use cached GitHub tree function for better performance
    const treeData = await getCachedGitHubTree(
      config.owner,
      config.repo,
      version.github_branch,
    );

    // console.debug(`*** [getDirectorySha] |1| *** Directory listing for ${config.owner}/${config.repo} at ${version.github_branch}:`, treeData.tree);

    // If docsPath is a subdirectory, we need to find it
    // e.g., "docs/plugins"
    if (dirPath.includes("/")) {
      const parts = dirPath.split("/");
      let currentTree = treeData.tree;
      let currentSha: string | undefined = "";

      for (const part of parts) {
        const dir = currentTree.find(
          (item: any) => item.path === part && item.type === "tree",
        );
        if (!dir) {
          console.warn(`Directory part ${part} not found in path ${dirPath}`);
          return null;
        }
        currentSha = dir.sha;
        // Skip to next if no sha found
        if (!currentSha) {
          console.warn(
            `No SHA found for directory part ${part} in path ${dirPath}`,
          );
          continue;
        }
        // Fetch the next level tree using cached function
        const nextTreeData = await getCachedGitHubTree(
          config.owner,
          config.repo,
          currentSha,
        );
        currentTree = nextTreeData.tree;
      }

      // console.debug(`*** [getDirectorySha] |2.1| *** Found directory ${dirPath} in ${config.owner}/${config.repo} at ${version.github_branch}:`, currentSha);

      if (currentSha) {
        cache.set(cacheKey, currentSha);
      }
      return currentSha || null;
    } else {
      const directory = treeData.tree.find(
        (item: any) => item.path === dirPath,
      );

      // console.debug(`*** [getDirectorySha] |2.2| *** Found directory ${dirPath} in ${config.owner}/${config.repo} at ${version.github_branch}:`, directory);

      if (directory?.sha) {
        cache.set(cacheKey, directory.sha);
        return directory.sha;
      }

      return null;
    }
  } catch (error) {
    console.warn(
      `Failed to get directory sha for ${config.owner}/${config.repo}/${dirPath}:`,
      error,
    );
    return null;
  }
}

/**
 * Fetch a specific file from repository using caching
 */
async function fetchFileFromRepo(
  config: RepositoryConfig,
  version: VersionConfig,
  filePath: string,
): Promise<string | null> {
  const cacheKey = `github:${config.owner}/${config.repo}:${version.github_branch}:${filePath}`;

  // Check in-memory cache first
  const cached = cache.get<string>(cacheKey);
  if (cached) {
    console.log(`Cache hit for file: ${cacheKey}`);
    return cached;
  }

  try {
    // Use cached GitHub content function
    const response = await getCachedGitHubContent(
      config.owner,
      config.repo,
      filePath,
      version.github_branch,
    );

    if ("content" in response && response.content) {
      const content = Buffer.from(response.content, "base64").toString();
      // Cache in memory for faster subsequent access
      cache.set(cacheKey, content);
      return content;
    }
    return null;
  } catch (error: any) {
    // Handle 404 errors (file not found) gracefully
    if (error.message.includes("404")) {
      console.log(
        `File ${filePath} not found in ${config.owner}/${config.repo} (${version.github_branch}), skipping...`,
      );
      return null;
    }

    // Log other errors as warnings
    console.warn(
      `Failed to fetch file ${filePath} from ${config.owner}/${config.repo} (${version.github_branch}):`,
      error.message || error,
    );
    return null;
  }
}

async function fetchRepositoryFiles(
  config: RepositoryConfig,
  version: VersionConfig,
): Promise<VirtualFile[]> {
  const repoSlug = getRepositorySlug(config);
  const versionSlug = version.version;
  const allFiles: VirtualFile[] = [];

  // 1. Fetch limited files (README.md, CHANGELOG.md, etc.)
  // All repositories should now have version-specific limited_files
  const limitedFiles = version.limited_files || [];

  for (const limitedFile of limitedFiles) {
    const content = await fetchFileFromRepo(config, version, limitedFile.name);
    if (content) {
      const pagePath = `${repoSlug}/${versionSlug}/${limitedFile.slug}`;
      const pageTitle = limitedFile.title || getTitleFromFile(limitedFile.name);

      // console.debug(`1| Adding limited file: ${pagePath} (title: ${pageTitle})`);

      allFiles.push({
        type: "page",
        path: pagePath,
        data: {
          title: pageTitle,
          repository: config,
          version: version,
          async load() {
            return compile(limitedFile.name, content);
          },
        },
      } satisfies VirtualFile);
    } else {
      console.log(
        `Skipping ${limitedFile.name} for ${config.owner}/${config.repo} (${version.version}) - file not found`,
      );
    }
  }

  // 2. Fetch docs directory if it exists
  const docsSha = config.docsPath
    ? await getDirectorySha(config, version, config.docsPath)
    : null;
  if (config.docsPath) {
    // console.debug(`2| Ready to fetch docs for ${config.owner}/${config.repo} (${version.version})`, config);
    // console.debug(`2| Docs SHA for ${config.owner}/${config.repo} (${version.version}):`, docsSha);
  }
  if (docsSha) {
    try {
      // Use cached GitHub tree function for better performance
      const treeData = await getCachedGitHubTree(
        config.owner,
        config.repo,
        docsSha,
        true,
      );

      const docsFiles = treeData.tree.flatMap((file: any) => {
        if (!file.path || !file.url || file.type === "tree") return [];

        if (path.extname(file.path) === ".json") {
          console.warn(
            "We do not handle .json files at the moment, you need to hardcode them",
          );
          return [];
        }

        // Only include markdown files
        if (![".md", ".mdx"].includes(path.extname(file.path))) return [];

        const pagePath = `${repoSlug}/${versionSlug}/${file.path}`;
        const pageTitle = getTitleFromFile(file.path);

        // console.debug(`2| Adding doc file: ${pagePath} (title: ${pageTitle})`);

        return {
          type: "page",
          path: pagePath,
          data: {
            title: pageTitle,
            repository: config,
            version: version,

            async load() {
              const content = await fetchBlob(file.url as string);
              return compile(file.path!, content);
            },
          },
        } satisfies VirtualFile;
      });

      allFiles.push(...docsFiles);
    } catch (error) {
      console.warn(
        `Failed to fetch docs directory from ${config.owner}/${config.repo}:`,
        error,
      );
    }
  }

  return allFiles;
}

export async function createGitHubSource(): Promise<
  Source<{
    metaData: {
      title: string;
      pages: string[];
      repository?: RepositoryConfig;
      version?: VersionConfig;
    };
    pageData: {
      title: string;
      repository: RepositoryConfig;
      version: VersionConfig;
      load: () => Promise<CompiledPage>;
    };
  }>
> {
  const allPages: VirtualFile[] = [];

  // Fetch files from all configured repositories and versions
  for (const config of repositories) {
    // Skip private repositories if no token or insufficient permissions
    if (config.is_private && !token) {
      console.warn(
        `Skipping private repository ${config.owner}/${config.repo} - no GitHub token`,
      );
      continue;
    }

    for (const version of config.versions) {
      try {
        const repoPages = await fetchRepositoryFiles(config, version);
        allPages.push(...repoPages);
      } catch (error) {
        console.error(
          `❌ Failed to fetch files from ${config.owner}/${config.repo} (${version.version}):`,
          error,
        );
      }
    }
  }

  return {
    files: [...allPages, ...fumadocMeta],
  };
}
