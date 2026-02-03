export interface Product {
  id: string;
  title: string;
  description: string;
  link: string;
  badge?: {
    text: string;
    color: string;
  };
  hidden?: boolean;
}

export interface PluginVersion {
  version: string;
  github_branch: string;
  limited_files?: Array<{
    name: string;
    title: string;
    slug: string;
  }>;
}

export interface PluginSection {
  name: string;
  slug: string;
  files: Array<{
    name: string;
    title: string;
    slug: string;
  }>;
}

export interface Plugin {
  id: string;
  name?: string;
  title: string;
  description: string;
  repo: string; // GitHub repo, e.g., 'owner/repo'
  latestVersion: string;
  versions: PluginVersion[];
  is_manual?: boolean;
  docs_structure?: string;
  docs_path?: string;
  sections?: PluginSection[];
  hidden?: boolean;
}

export interface Config {
  plugins: Plugin[];
  products: Product[];
}

export const config: Config = {
  plugins: [
    {
      id: 'filament-tree',
      title: 'Filament Tree',
      description: 'A powerful tree structure management plugin for Filament with drag-and-drop functionality and hierarchical data organization.',
      repo: 'solutionforest/filament-tree',
      latestVersion: '4.x',
      versions: [
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '3.x', github_branch: '3.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '4.x', github_branch: '4.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-tab-plugin',
      title: 'Filament Tab Plugin',
      description: 'Create beautiful tabbed interfaces in your Filament admin panel with this easy-to-use tab management plugin.',
      repo: 'solutionforest/filament-tab-plugin',
      latestVersion: '4.x',
      versions: [
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '3.x', github_branch: '3.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '4.x', github_branch: '4.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-access-management',
      title: 'Filament Access Management',
      description: 'Complete user and role management solution for Filament applications with permissions, roles, and access control features.',
      repo: 'solutionforest/filament-access-management',
      latestVersion: '2.x',
      versions: [
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-panzoom',
      title: 'Filament Panzoom',
      description: 'Add pan and zoom functionality to images and content in your Filament applications with smooth interactions.',
      repo: 'solutionforest/filament-panzoom',
      latestVersion: '1.x',
      versions: [
        { version: '1.x', github_branch: 'main', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-scaffold',
      title: 'Filament Scaffold',
      description: 'Rapidly generate Filament resources, pages, and components with this powerful scaffolding tool.',
      repo: 'solutionforest/filament-scaffold',
      latestVersion: '1.x',
      versions: [
        { version: '0.x', github_branch: 'main', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '1.x', github_branch: 'main', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'simple-contact-form',
      title: 'Simple Contact Form',
      description: 'A straightforward contact form plugin with spam protection and email notifications for Filament applications.',
      repo: 'solutionforest/simple-contact-form',
      latestVersion: '2.x',
      versions: [
        { version: '0.x', github_branch: 'main', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: 'main', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-firewall',
      title: 'Filament Firewall',
      description: 'Security and firewall management for Filament applications with IP blocking, rate limiting, and threat protection.',
      repo: 'solutionforest/filament-firewall',
      latestVersion: '4.x',
      versions: [
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '3.x', github_branch: '3.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '4.x', github_branch: '4.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-translate-field',
      title: 'Filament Translate Field',
      description: 'Multi-language field support for Filament with easy translation management and language switching.',
      repo: 'solutionforest/filament-translate-field',
      latestVersion: '3.x',
      versions: [
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '3.x', github_branch: '3.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-field-group',
      title: 'Filament Field Group',
      description: 'Group related fields together in your Filament forms with collapsible sections and organized layouts.',
      repo: 'solutionforest/filament-field-group',
      latestVersion: '3.x',
      versions: [
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '3.x', github_branch: '3.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-email-2fa',
      name: 'Filament Email 2FA',
      title: 'Filament Email 2FA',
      description: 'Enhance security in your Filament applications with email-based two-factor authentication (2FA) for user logins.',
      repo: 'solutionforest/filament-email-2fa',
      latestVersion: '2.x',
      versions: [
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    // {
    //   id: 'filaletter',
    //   name: 'Filaletter',
    //   title: 'Filaletter',
    //   description: 'Modern self-hosted email marketing platform built specifically for Filament Admin Panel with subscriber management, email campaigns, and automation features.',
    //   repo: 'solutionforest/filaletter',
    //   latestVersion: '3.x',
    //   is_manual: true,
    //   hidden: true,
    //   docs_structure: 'folder_based',
    //   docs_path: 'filaletter/public/docs',
    //   versions: [
    //     {
    //       version: '3.x',
    //       github_branch: 'v3.x',
    //       limited_files: [], // Will use sections
    //     },
    //   ],
    //   sections: [
    //     {
    //       name: 'Getting Started',
    //       slug: '1-getting-started',
    //       files: [
    //         { name: '1-getting-started/1-introduction.md', title: 'Introduction', slug: 'introduction' },
    //       ],
    //     },
    //     {
    //       name: 'Features',
    //       slug: '2-features',
    //       files: [
    //         { name: '2-features/1-subscribers.md', title: 'Subscribers', slug: 'subscribers' },
    //         { name: '2-features/7-choosing-an-editor.md', title: 'Choosing an Editor', slug: 'choosing-an-editor' },
    //       ],
    //     },
    //     {
    //       name: 'API',
    //       slug: '3-api',
    //       files: [
    //         { name: '3-api/2-authentication.md', title: 'Authentication', slug: 'authentication' },
    //       ],
    //     },
    //     {
    //       name: 'Email Services',
    //       slug: '4-email-services',
    //       files: [
    //         { name: '4-email-services/1-aws.md', title: 'AWS', slug: 'aws' },
    //       ],
    //     },
    //   ],
    // },
  ],
  products: [
    {
      id: 'inspirecms',
      title: 'InspireCMS',
      description: 'A full-featured Laravel CMS with everything you need out of the box. Build smarter, ship faster with our complete content management solution.',
      link: 'https://inspirecms.net',
      badge: { text: 'CMS', color: 'green' },
    },
    {
      id: 'filaletter-product',
      title: 'Filaletter',
      description: 'Modern self-hosted email marketing platform built specifically for Filament Admin Panel with subscriber management and campaign tools.',
      link: 'https://filaletter.solutionforest.net',
      badge: { text: 'Newsletter', color: 'purple' },
    },
    {
      id: 'website-cms',
      title: 'Website CMS',
      description: 'Complete website content management system built on Filament, perfect for managing website content, pages, and media.',
      link: 'https://filamentphp.com/plugins/solution-forest-cms-website',
      badge: { text: 'CMS', color: 'orange' },
    },
  ],
};