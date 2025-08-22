export interface PluginVersion {
  version: string;
  github_branch: string;
}

export interface MarkdownFile {
  name: string;
  title: string;
  path?: string; // Optional custom path, defaults to name
}

export interface Plugin {
  name: string;
  slug: string;
  description: string;
  repository_url: string;
  latest_version: string;
  is_private?: boolean; // New field to identify private repositories
  versions: PluginVersion[];
  markdown_files: MarkdownFile[]; // Available markdown files for this plugin
}

export const plugins: Plugin[] = [
  {
    name: 'Filament CMS Website Plugin',
    slug: 'filament-cms-website-plugin',
    description: 'A comprehensive CMS website plugin for Filament that provides content management capabilities with pages, posts, and media management.',
    repository_url: 'https://github.com/solutionforest/filament-cms-website-plugin',
    latest_version: '3.x',
    is_private: true, // Mark as private repository
    versions: [
      { version: '1.x', github_branch: '1.x' },
      { version: '2.x', github_branch: '2.x' },
      { version: '3.x', github_branch: '3.x' },
    ],
    markdown_files: [
      { name: "README.md", title: "Overview" },
      { name: "Documentation.md", title: "Documentation" },
      { name: "CHANGELOG.md", title: "Changelog" },
    ]
  },
  {
    name: 'Filament Tree',
    slug: 'filament-tree',
    description: 'A powerful tree structure management plugin for Filament with drag-and-drop functionality and hierarchical data organization.',
    repository_url: 'https://github.com/solutionforest/filament-tree',
    latest_version: '3.x',
    versions: [
      { version: '1.x', github_branch: '1.x' },
      { version: '2.x', github_branch: '2.x' },
      { version: '3.x', github_branch: '3.x' },
    ],
    markdown_files: [
      { name: "README.md", title: "Overview" },
      { name: "CHANGELOG.md", title: "Changelog" },
    ]
  },
  {
    name: 'Filament Tab Plugin',
    slug: 'filament-tab-plugin',
    description: 'Create beautiful tabbed interfaces in your Filament admin panel with this easy-to-use tab management plugin.',
    repository_url: 'https://github.com/solutionforest/filament-tab-plugin',
    latest_version: '3.x',
    versions: [
      { version: '1.x', github_branch: '1.x' },
      { version: '2.x', github_branch: '2.x' },
      { version: '3.x', github_branch: '3.x' },
    ],
    markdown_files: [
      { name: "README.md", title: "Overview" },
      { name: "CHANGELOG.md", title: "Changelog" },
    ]
  },
  {
    name: 'Filament Access Management',
    slug: 'filament-access-management',
    description: 'Complete user and role management solution for Filament applications with permissions, roles, and access control features.',
    repository_url: 'https://github.com/solutionforest/filament-access-management',
    latest_version: '2.x',
    versions: [
      { version: '1.x', github_branch: '1.x' },
      { version: '2.x', github_branch: '2.x' },
    ],
    markdown_files: [
      { name: "README.md", title: "Overview" },
      // No CHANGELOG.md for this plugin
    ]
  },
  {
    name: 'Filament Panzoom',
    slug: 'filament-panzoom',
    description: 'Add pan and zoom functionality to images and content in your Filament applications with smooth interactions.',
    repository_url: 'https://github.com/solutionforest/filament-panzoom',
    latest_version: '1.x',
    versions: [
      { version: '1.x', github_branch: 'main' },
    ],
    markdown_files: [
      { name: "README.md", title: "Overview" },
    ]
  },
  {
    name: 'Filament Scaffold',
    slug: 'filament-scaffold',
    description: 'Rapidly generate Filament resources, pages, and components with this powerful scaffolding tool.',
    repository_url: 'https://github.com/solutionforest/filament-scaffold',
    latest_version: '1.x',
    versions: [
      { version: '0.x', github_branch: 'main' },
      { version: '1.x', github_branch: 'main' },
    ],
    markdown_files: [
      { name: "README.md", title: "Overview" },
      { name: "CHANGELOG.md", title: "Changelog" },
    ]
  },
  {
    name: 'Simple Contact Form Plugin',
    slug: 'simple-contact-form',
    description: 'A straightforward contact form plugin with spam protection and email notifications for Filament applications.',
    repository_url: 'https://github.com/solutionforest/simple-contact-form',
    latest_version: '2.x',
    versions: [
      { version: '0.x', github_branch: 'main' },
      { version: '2.x', github_branch: 'main' },
    ],
    markdown_files: [
      { name: "README.md", title: "Overview" },
    ]
  },
  {
    name: 'Filament Firewall',
    slug: 'filament-firewall',
    description: 'Security and firewall management for Filament applications with IP blocking, rate limiting, and threat protection.',
    repository_url: 'https://github.com/solutionforest/filament-firewall',
    latest_version: '2.x',
    versions: [
      { version: '1.x', github_branch: '1.x' },
      { version: '2.x', github_branch: '2.x' },
    ],
    markdown_files: [
      { name: "README.md", title: "Overview" },
      { name: "CHANGELOG.md", title: "Changelog" },
    ]
  },
  {
    name: 'Filament Translate Field',
    slug: 'filament-translate-field',
    description: 'Multi-language field support for Filament with easy translation management and language switching.',
    repository_url: 'https://github.com/solutionforest/filament-translate-field',
    latest_version: '2.x',
    versions: [
      { version: '1.x', github_branch: '1.x' },
      { version: '2.x', github_branch: '2.x' },
    ],
    markdown_files: [
      { name: "README.md", title: "Overview" },
      { name: "CHANGELOG.md", title: "Changelog" },
    ]
  },
];

// Helper functions
export function getPluginBySlug(slug: string): Plugin | undefined {
  return plugins.find(plugin => plugin.slug === slug);
}

export function getPluginVersion(plugin: Plugin, version: string): PluginVersion | undefined {
  return plugin.versions.find(v => v.version === version);
}

export function parseRepositoryUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error(`Invalid GitHub URL: ${url}`);
  return { owner: match[1], repo: match[2] };
}