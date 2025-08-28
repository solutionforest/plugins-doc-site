import type { VirtualFile } from "fumadocs-core/source";
import { repositories } from "./repo-config";
import type { Metadata } from "next";
import { siteConfig } from "./site-config";

export const pageMeta: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [
    "filament",
    "laravel",
    "plugins",
    "documentation",
    "solution forest",
  ],
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function generatePageMeta(
  title?: string,
  description?: string,
): Metadata {
  let base = pageMeta;
  if (title) {
    base.title = title + " | Solution Forest";
  }
  if (description) {
    base.description = description;
  }
  return base;
}

export const fumadocMeta: VirtualFile[] = [
  {
    type: "meta",
    path: "meta.json",
    data: {
      title: "Filament Documents",
      root: true,
      pages: [
        ...repositories.map((repo) => repo.repo), // Folders under repository's overview
      ],
    },
  },
  ...(repositories.flatMap((repo) => {
    const repoSlug = repo.repo;
    const repoName = repo.displayName ?? repo.repo;

    // Repository's Overview
    const repoMeta = {
      type: "meta" as const,
      path: `${repoSlug}/meta.json`,
      root: true,
      data: {
        title: repoName,
        description: repo.description,
        pages: [
          ...repo.versions.map((version) => version.version), // Folders under each version
        ],
      },
    };

    const versionsMeta =
      repo.versions?.map((version) => {
        const versionSlug = version.version;
        return {
          type: "meta" as const,
          path: `${repoSlug}/${versionSlug}/meta.json`,
          data: {
            title:
              `v${versionSlug}` +
              (repo.latest_version === versionSlug ? " (Latest)" : ""),
            root: false,
            pages: [
              `./index`, // e.g. /docs/repo-slug/3.x/ 
              "...", // all other files in this version
            ],
          },
        };
      }) || [];
    return [repoMeta, ...versionsMeta];
  }) || []),
];
