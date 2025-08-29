export interface VersionConfig {
  version: string;
  github_branch: string;
  limited_files?: LimitedFile[]; // Version-specific files
}

export interface LimitedFile {
  name: string;
  title: string;
  slug: string;
}

export interface RepositoryConfig {
  repository_url: string;
  owner: string;
  repo: string;
  description?: string;
  latest_version: string;
  is_private?: boolean;
  versions: VersionConfig[];
  limited_files?: LimitedFile[]; // Deprecated: use version-specific limited_files instead
  docsPath?: string; // folder name for docs, e.g. "docs"
  displayName?: string;
}

// Parse repository URL to extract owner and repo
function parseRepositoryUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error(`Invalid repository URL: ${url}`);
  return { owner: match[1], repo: match[2] };
}

// Sample repositories from your JSON

const rawRepositories = [
  {
    description:
      "A comprehensive CMS website plugin for Filament that provides content management capabilities with pages, posts, and media management.",
    repository_url:
      "https://github.com/solutionforest/filament-cms-website-plugin",
    latest_version: "3.x",
    is_private: true,
    versions: [
      {
        version: "1.x",
        github_branch: "1.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
          { name: "Documentation.md", title: "Documentation", slug: "docs" },
        ],
      },
      {
        version: "2.x",
        github_branch: "2.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
          { name: "Documentation.md", title: "Documentation", slug: "docs" },
        ],
      },
      {
        version: "3.x",
        github_branch: "3.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
          { name: "Documentation.md", title: "Documentation", slug: "docs" },
        ],
      },
    ],
  },
  // {
  //   description: 'Effortlessly manage your newsletters with our Filament Newsletter package, designed for seamless integration with the Filament Admin Panel. Enjoy flexible and user-friendly email marketing directly within your admin panel.',
  //   repository_url: 'https://github.com/solutionforest/filaletter',
  //   latest_version: '3.x',
  //   is_private: true,
  //   versions: [
  //     {
  //       version: '2.x',
  //       github_branch: 'v2.x',
  //       limited_files: [
  //         { name: "README.md", title: "Overview", slug: "overview" },
  //       ]
  //     },
  //     {
  //       version: '3.x',
  //       github_branch: 'v3.x',
  //       limited_files: [
  //         { name: "README.md", title: "Overview", slug: "overview" },
  //       ]
  //     },
  //     {
  //       version: '4.x',
  //       github_branch: 'v4.x',
  //       limited_files: [
  //         { name: "README.md", title: "Overview", slug: "overview" },
  //       ]
  //     },
  //   ],
  //   docsPath: "filaletter/public/docs", // include docs
  // },
  {
    description:
      "A powerful tree structure management plugin for Filament with drag-and-drop functionality and hierarchical data organization.",
    repository_url: "https://github.com/solutionforest/filament-tree",
    latest_version: "3.x",
    versions: [
      {
        version: "1.x",
        github_branch: "1.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
      {
        version: "2.x",
        github_branch: "2.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
      {
        version: "3.x",
        github_branch: "3.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
    ],
  },
  {
    description:
      "Create beautiful tabbed interfaces in your Filament admin panel with this easy-to-use tab management plugin.",
    repository_url: "https://github.com/solutionforest/filament-tab-plugin",
    latest_version: "3.x",
    versions: [
      {
        version: "1.x",
        github_branch: "1.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
      {
        version: "2.x",
        github_branch: "2.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
      {
        version: "3.x",
        github_branch: "3.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
    ],
  },
  {
    description:
      "Complete user and role management solution for Filament applications with permissions, roles, and access control features.",
    repository_url:
      "https://github.com/solutionforest/filament-access-management",
    latest_version: "2.x",
    versions: [
      {
        version: "1.x",
        github_branch: "1.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
      {
        version: "2.x",
        github_branch: "2.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
    ],
  },
  {
    description:
      "Add pan and zoom functionality to images and content in your Filament applications with smooth interactions.",
    repository_url: "https://github.com/solutionforest/filament-panzoom",
    latest_version: "1.x",
    versions: [
      {
        version: "1.x",
        github_branch: "main",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
    ],
  },
  {
    description:
      "Rapidly generate Filament resources, pages, and components with this powerful scaffolding tool.",
    repository_url: "https://github.com/solutionforest/filament-scaffold",
    latest_version: "1.x",
    versions: [
      {
        version: "0.x",
        github_branch: "main",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
      {
        version: "1.x",
        github_branch: "main",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
    ],
  },
  {
    description:
      "A straightforward contact form plugin with spam protection and email notifications for Filament applications.",
    repository_url: "https://github.com/solutionforest/simple-contact-form",
    latest_version: "2.x",
    versions: [
      {
        version: "0.x",
        github_branch: "main",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
      {
        version: "2.x",
        github_branch: "main",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
    ],
  },
  {
    description:
      "Security and firewall management for Filament applications with IP blocking, rate limiting, and threat protection.",
    repository_url: "https://github.com/solutionforest/filament-firewall",
    latest_version: "2.x",
    versions: [
      {
        version: "1.x",
        github_branch: "1.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
      {
        version: "2.x",
        github_branch: "2.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
    ],
  },
  {
    description:
      "Multi-language field support for Filament with easy translation management and language switching.",
    repository_url:
      "https://github.com/solutionforest/filament-translate-field",
    latest_version: "2.x",
    versions: [
      {
        version: "1.x",
        github_branch: "1.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
      {
        version: "2.x",
        github_branch: "2.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
    ],
  },
  {
    description:
      "Group related fields together in your Filament forms with collapsible sections and organized layouts.",
    repository_url: "https://github.com/solutionforest/filament-field-group",
    latest_version: "2.x",
    versions: [
      {
        version: "1.x",
        github_branch: "1.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
      {
        version: "2.x",
        github_branch: "2.x",
        limited_files: [
          { name: "README.md", title: "Overview", slug: "overview" },
        ],
      },
    ],
  },
];

// Transform raw repositories to include parsed owner/repo and display names
export const repositories: RepositoryConfig[] = rawRepositories.map((repo) => {
  const { owner, repo: repoName } = parseRepositoryUrl(repo.repository_url);
  return {
    ...repo,
    owner,
    repo: repoName,
    displayName: repoName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  };
});

export function getRepositoryBySlug(
  slug: string,
): RepositoryConfig | undefined {
  return repositories.find(
    (repo) =>
      `${repo.repo}` === slug ||
      repo.displayName?.toLowerCase().replace(/\s+/g, "-") === slug,
  );
}

export function getRepositorySlug(config: RepositoryConfig): string {
  return `${config.repo}`;
}

export function getVersionBySlug(
  repo: RepositoryConfig,
  versionSlug?: string,
): VersionConfig {
  if (!versionSlug) {
    return (
      repo.versions.find((v) => v.version === repo.latest_version) ||
      repo.versions[0]
    );
  }
  return (
    repo.versions.find((v) => v.version === versionSlug) || repo.versions[0]
  );
}

export function getBaseFileName(
  file: LimitedFile | string,
): string | undefined {
  let filename = "";
  if (typeof file === "string") {
    filename = file;
  } else {
    filename = file.name;
  }
  // return filename.replace(/\.(md|mdx)$/, '')
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
}

export function getFileSlug(file: LimitedFile | string): string | undefined {
  const baseFileName = getBaseFileName(file);
  if (baseFileName) {
    // Transform to slug format
    return baseFileName.replace(/\s+/g, "-").toLowerCase();
  }
  return undefined;
}

export function getRepositoryDisplayName(repo: RepositoryConfig): string {
  return repo.displayName || repo.repo;
}
