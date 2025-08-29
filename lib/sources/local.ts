import type { Source, VirtualFile } from "fumadocs-core/source";
import { compile, type CompiledPage } from "../compile-md";
import * as path from "node:path";
import fs from 'fs';
import { getTitleFromFile } from "../source";
import { fumadocMeta } from "../meta";
import {
  repositories,
  getRepositorySlug,
  type RepositoryConfig,
  type VersionConfig,
  getBaseFileName,
} from "../repo-config";
import FastGlob from "fast-glob";
import { readFile } from "node:fs/promises";

const dir = "fi-plugins/docs";

export async function createLocalSource(): Promise<
  Source<{
    metaData: {
      title: string;
      pages: string[];
      repository?: RepositoryConfig;
      version?: VersionConfig;
    };
    pageData: {
      title: string;
      repository?: RepositoryConfig;
      version?: VersionConfig;
      load: () => Promise<CompiledPage>;
    };
  }>
> {
  const files = await FastGlob(`${dir}/**/*.{md,mdx,json}`);

  const pages = files.flatMap((file) => {
    const relativePath = path.relative(dir, file);
    if (path.extname(file) === ".json") {
      console.warn(
        "We do not handle .json files at the moment, you need to hardcode them",
      );
      return [];
    }

    // Parse the path structure: {repo}/{version}/{file}
    const pathParts = relativePath.split(path.sep);
    // console.debug("Local file pathParts:", pathParts);
    if (pathParts.length < 3) {
      console.warn(
        `Invalid path structure: ${relativePath}. Expected: {repo}/{version}/{file}`,
      );
      return [];
    }

    const [repoSlug, version, ...fileParts] = pathParts;
    const fileName = fileParts.join("/");

    // console.debug(`Processing local file: repo=${repoSlug}, version=${version}, file=${fileName}`);

    // Find the repository configuration that matches this repo slug
    const repository = repositories.find(
      (repo) => getRepositorySlug(repo) === repoSlug,
    );
    if (!repository) {
      console.warn(`Repository not found for slug: ${repoSlug}`);
      return [];
    }

    // Find the version configuration
    const versionConfig = repository.versions.find(
      (v) => v.version === version,
    );
    if (!versionConfig) {
      console.warn(`Version not found: ${version} for repository: ${repoSlug}`);
      return [];
    }

    // Create the path for fumadocs
    const pagePath = `${repoSlug}/${version}/${getBaseFileName(fileName)}`;

    console.debug(
      `Read local page: ${pagePath} (title: ${getTitleFromFile(fileName)})`,
    );

    return {
      type: "page",
      path: pagePath,
      data: {
        title: getTitleFromFile(fileName),
        repository,
        version: versionConfig,

        async load() {
          const content = await readFile(file);
          // console.debug(
          //   `### Loaded content for ${pagePath}, content: `,
          //   content,
          // );
          return compile(file, content.toString());
        },
      },
    } satisfies VirtualFile;
  });

  // Collect unique repositories and versions from the discovered files
  const repoVersionMap = new Map<string, Set<string>>();

  files.forEach((file) => {
    const relativePath = path.relative(dir, file);
    const pathParts = relativePath.split(path.sep);
    if (pathParts.length >= 3) {
      const [repoSlug, version] = pathParts;
      if (!repoVersionMap.has(repoSlug)) {
        repoVersionMap.set(repoSlug, new Set());
      }
      repoVersionMap.get(repoSlug)!.add(version);
    }
  });

  return {
    files: [...pages, ...fumadocMeta],
  };
}


export async function buildMarkdownFileToLocal(files: Map<string,string>): Promise<void> {
  for (const [filePath, content] of files) {
    try {

      const realPath = path.join(dir, filePath + ".md");
      console.info("Writing local file:", realPath);

      // Ensure the directory exists before writing the file
      fs.mkdirSync(path.dirname(realPath), { recursive: true });

      // Here you would write the markdown content to a local file
      fs.writeFileSync(realPath, content);
      // fs.writeFileSync(realPath, content, { encoding: "utf-8", mode: 0o644, flag: "w" });

    } catch (error) {
      console.error(`Failed to write local file for ${filePath}:`, error);
    }
  }
}