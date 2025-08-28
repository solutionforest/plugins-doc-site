import type { Source, VirtualFile } from "fumadocs-core/source";
import { Octokit } from "octokit";
import { compile, type CompiledPage } from "../compile-md";
import * as path from "node:path";
import { getTitleFromFile, removeLeadingNumber } from "../source";
import { fumadocMeta } from "../meta";
import {
  repositories,
  getRepositorySlug,
  type RepositoryConfig,
  type VersionConfig,
} from "../repo-config";
import { cache as reactCache } from 'react';

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

// Cached function for getting directory SHA
const getCachedDirectorySha = reactCache(async (
  config: RepositoryConfig,
  version: VersionConfig,
  dirPath: string = "docs",
): Promise<string | null> => {
  try {
    // Use cached GitHub tree function for better performance
    const treeData = await getGithubTree(
      config.owner,
      config.repo,
      version.github_branch,
    );

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
        const nextTreeData = await getGithubTree(
          config.owner,
          config.repo,
          currentSha,
        );
        currentTree = nextTreeData.tree;
      }

      return currentSha || null;
    } else {
      const directory = treeData.tree.find(
        (item: any) => item.path === dirPath,
      );

      if (directory?.sha) {
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
});

/**
 * @returns Sha code of directory in GitHub repo
 */
async function getDirectorySha(
  config: RepositoryConfig,
  version: VersionConfig,
  dirPath: string = "docs",
) {
  return getCachedDirectorySha(config, version, dirPath);
}

// Cached function for fetching files from repository
const getCachedFileFromRepo = reactCache(async (
  config: RepositoryConfig,
  version: VersionConfig,
  filePath: string,
): Promise<string | null> => {
  try {
    // Use cached GitHub content function
    const response = await getGitHubContent(
      config.owner,
      config.repo,
      filePath,
      version.github_branch,
    );

    if ("content" in response && response.content) {
      const content = Buffer.from(response.content, "base64").toString();
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
});

// Static export compatible GitHub API functions with fetch caching
async function getGitHubContent(
  owner: string,
  repo: string,
  path: string,
  ref: string,
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      // Use force-cache for static exports
      cache: "force-cache",
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}

async function getGithubTree(
  owner: string,
  repo: string,
  treeSha: string,
  recursive = false,
) {
  
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}${recursive ? "?recursive=1" : ""}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "force-cache",
      },
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
}

/**
 * Fetch a specific file from repository using caching
 */
async function fetchFileFromRepo(
  config: RepositoryConfig,
  version: VersionConfig,
  filePath: string,
): Promise<string | null> {
  return getCachedFileFromRepo(config, version, filePath);
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
  if (docsSha) {
    try {
      // Use cached GitHub tree function for better performance
      const treeData = await getGithubTree(
        config.owner,
        config.repo,
        docsSha,
        true,
      );

      let docsFiles: VirtualFile[] = [];

      let docFolderPages = new Map<string, string[]>();

      for (const file of treeData.tree) {
        if (!file.path || !file.url || file.type === "tree") {
          continue;
        }

        if (path.extname(file.path) === ".json") {
          console.warn(
            "We do not handle .json files at the moment, you need to hardcode them",
          );
          continue;
        }

        // Only include markdown files
        if (![".md", ".mdx"].includes(path.extname(file.path))) {
          continue;
        }

        // Parsing file path
        const parsedFilePath = path.parse(file.path);
        const pageTitle = getTitleFromFile(parsedFilePath.name);

        const pagePath = `${repoSlug}/${versionSlug}/${parsedFilePath.dir}/${parsedFilePath.name}`;

        if (!docFolderPages.has(parsedFilePath.dir)) {
          docFolderPages.set(parsedFilePath.dir, []);
        }
        docFolderPages.get(parsedFilePath.dir)!.push(parsedFilePath.name);

        // console.debug(`Docs file found: ${file.path} (Parsed: ${formattedFilePath})`);

        // console.debug(`2| Adding doc file: ${pagePath} (title: ${pageTitle})`);

        docsFiles.push({
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
        } satisfies VirtualFile);
      }

      allFiles.push(...docsFiles);

      // console.debug(`Fetched ${docsFiles.length} docs files from ${config.owner}/${config.repo} (${version.version})`, docsFiles);

      const docFolders = Array.from(docFolderPages.entries()).flatMap(([dir, pages]) => {
        // Create folder structure
        let folders: VirtualFile[] = [];
        for (const segment of dir.split('/')) {
          const formattedFolderName = getTitleFromFile(segment);
          const folderPrefix: string = folders.length > 0 ? folders[folders.length - 1].path.replace('/meta.json', '') : `${repoSlug}/${versionSlug}`;
          const folderPath = `${folderPrefix}/${segment}`;

          const folder = {
            type: 'meta',
            path: `${folderPath}/meta.json`,
            // root: false,
            data: {
              title: formattedFolderName,
              pages: pages,
            },
          } satisfies VirtualFile;

          folders.push(folder);
        }
        return folders; 
      }) || [];

      allFiles.push(...docFolders);

      // console.debug('Document folders added:', docFolders);

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
