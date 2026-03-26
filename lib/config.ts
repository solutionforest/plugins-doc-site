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
  docs_path?: string; // Base path in the GitHub repo where docs are located
  limited_files?: Array<{
    name: string;
    title: string;
    slug: string;
  }>;
  assets?: Array<{
    from: string; // Path in the GitHub repo
    to: string;   // Path in the local filesystem
  }>;
  /**
   * Optional override for folder display titles in the sidebar.
   * Keys are folder slugs (e.g. "getting-started"), values are display titles.
   * If not provided, titles are auto-derived from the folder slug.
   * Example: { 'getting-started': 'Getting Started', 'email-services': 'Email Services' }
   */
  folder_titles?: Record<string, string>;
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
  is_private?: boolean;
  is_manual?: boolean;
  // docs_structure?: string;
  // docs_path?: string;
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
        { version: '4.x', github_branch: '4.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '3.x', github_branch: '3.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filaletter',
      name: 'Filaletter',
      title: 'Filaletter',
      description: 'Modern self-hosted email marketing platform built specifically for Filament Admin Panel with subscriber management, email campaigns, and automation features.',
      repo: 'solutionforest/filaletter',
      latestVersion: '4.x',
      versions: [
        {
          version: '4.x',
          github_branch: 'v4.x',
          docs_path: 'filaletter/public/docs', // Base path in the GitHub repo where docs are located
          folder_titles: {
            'getting-started': 'Getting Started',
            'features': 'Features',
            'api': 'API',
            'email-services': 'Email Services',
          },
          limited_files: [
            { name: 'README.md', title: 'Overview', slug: 'overview' },
            { name: 'filaletter/public/docs/1-getting-started/1-introduction.md', title: 'Introduction', slug: 'getting-started/introduction' },
            { name: 'filaletter/public/docs/1-getting-started/2-getting-a-license.md', title: 'Getting a License', slug: 'getting-started/getting-a-license' },
            { name: 'filaletter/public/docs/1-getting-started/3-installation.md', title: 'Installation', slug: 'getting-started/installation' },
            { name: 'filaletter/public/docs/1-getting-started/4-quick-start.md', title: 'Quick Start', slug: 'getting-started/quick-start' },
            { name: 'filaletter/public/docs/1-getting-started/5-upgrading.md', title: 'Upgrading', slug: 'getting-started/upgrading' },
            { name: 'filaletter/public/docs/2-features/1-subscribers.md', title: 'Subscribers', slug: 'features/subscribers' },
            { name: 'filaletter/public/docs/2-features/2-segments.md', title: 'Segments', slug: 'features/segments' },
            { name: 'filaletter/public/docs/2-features/3-templates.md', title: 'Templates', slug: 'features/templates' },
            { name: 'filaletter/public/docs/2-features/4-campaigns.md', title: 'Campaigns', slug: 'features/campaigns' },
            { name: 'filaletter/public/docs/2-features/5-messages.md', title: 'Messages', slug: 'features/messages' },
            { name: 'filaletter/public/docs/2-features/6-workspace.md', title: 'Workspace', slug: 'features/workspace' },
            { name: 'filaletter/public/docs/2-features/7-choosing-an-editor.md', title: 'Choosing an Editor', slug: 'features/choosing-an-editor' },
            { name: 'filaletter/public/docs/2-features/8-custom-placeholder.md', title: 'Custom Placeholder', slug: 'features/custom-placeholder' },
            { name: 'filaletter/public/docs/3-api/1-introduction.md', title: 'API Introduction', slug: 'api/introduction' },
            { name: 'filaletter/public/docs/3-api/2-authentication.md', title: 'Authentication', slug: 'api/authentication' },
            { name: 'filaletter/public/docs/3-api/3-templates.md', title: 'Templates', slug: 'api/templates' },
            { name: 'filaletter/public/docs/3-api/4-subscribers.md', title: 'Subscribers', slug: 'api/subscribers' },
            { name: 'filaletter/public/docs/3-api/5-segments.md', title: 'Segments', slug: 'api/segments' },
            { name: 'filaletter/public/docs/3-api/6-segment-subscribers.md', title: 'Segment Subscribers', slug: 'api/segment-subscribers' },
            { name: 'filaletter/public/docs/3-api/7-subscriber-segments.md', title: 'Subscriber Segments', slug: 'api/subscriber-segments' },
            { name: 'filaletter/public/docs/3-api/8-campaigns.md', title: 'Campaigns', slug: 'api/campaigns' },
            { name: 'filaletter/public/docs/4-email-services/1-aws.md', title: 'AWS', slug: 'email-services/aws' },
            { name: 'filaletter/public/docs/4-email-services/2-postmark.md', title: 'Postmark', slug: 'email-services/postmark' },
            { name: 'filaletter/public/docs/4-email-services/3-sendgrid.md', title: 'SendGrid', slug: 'email-services/sendgrid' },
            { name: 'filaletter/public/docs/4-email-services/4-mailgun.md', title: 'Mailgun', slug: 'email-services/mailgun' },
            { name: 'filaletter/public/docs/4-email-services/5-mailjet.md', title: 'Mailjet', slug: 'email-services/mailjet' },
            { name: 'filaletter/public/docs/4-email-services/6-smtp.md', title: 'SMTP', slug: 'email-services/smtp' },
            { name: 'filaletter/public/docs/4-email-services/7-smtp-with-tracking.md', title: 'SMTP with Tracking', slug: 'email-services/smtp-with-tracking' },
          ],
          assets: [
            { from: 'filaletter/public/images', to: 'images' },
          ]
        },
        {
          version: '3.x',
          github_branch: 'v3.x',
          docs_path: 'filaletter/public/docs', // Base path in the GitHub repo where docs are located
          folder_titles: {
            'getting-started': 'Getting Started',
            'features': 'Features',
            'api': 'API',
            'email-services': 'Email Services',
          },
          limited_files: [
            { name: 'README.md', title: 'Overview', slug: 'overview' },
            { name: 'filaletter/public/docs/1-getting-started/1-introduction.md', title: 'Introduction', slug: 'getting-started/introduction' },
            { name: 'filaletter/public/docs/1-getting-started/2-getting-a-license.md', title: 'Getting a License', slug: 'getting-started/getting-a-license' },
            { name: 'filaletter/public/docs/1-getting-started/3-installation.md', title: 'Installation', slug: 'getting-started/installation' },
            { name: 'filaletter/public/docs/1-getting-started/4-quick-start.md', title: 'Quick Start', slug: 'getting-started/quick-start' },
            { name: 'filaletter/public/docs/1-getting-started/5-upgrading.md', title: 'Upgrading', slug: 'getting-started/upgrading' },
            { name: 'filaletter/public/docs/2-features/1-subscribers.md', title: 'Subscribers', slug: 'features/subscribers' },
            { name: 'filaletter/public/docs/2-features/2-segments.md', title: 'Segments', slug: 'features/segments' },
            { name: 'filaletter/public/docs/2-features/3-templates.md', title: 'Templates', slug: 'features/templates' },
            { name: 'filaletter/public/docs/2-features/4-campaigns.md', title: 'Campaigns', slug: 'features/campaigns' },
            { name: 'filaletter/public/docs/2-features/5-messages.md', title: 'Messages', slug: 'features/messages' },
            { name: 'filaletter/public/docs/2-features/6-workspace.md', title: 'Workspace', slug: 'features/workspace' },
            { name: 'filaletter/public/docs/2-features/7-choosing-an-editor.md', title: 'Choosing an Editor', slug: 'features/choosing-an-editor' },
            { name: 'filaletter/public/docs/2-features/8-custom-placeholder.md', title: 'Custom Placeholder', slug: 'features/custom-placeholder' },
            { name: 'filaletter/public/docs/3-api/1-introduction.md', title: 'API Introduction', slug: 'api/introduction' },
            { name: 'filaletter/public/docs/3-api/2-authentication.md', title: 'Authentication', slug: 'api/authentication' },
            { name: 'filaletter/public/docs/3-api/3-templates.md', title: 'Templates', slug: 'api/templates' },
            { name: 'filaletter/public/docs/3-api/4-subscribers.md', title: 'Subscribers', slug: 'api/subscribers' },
            { name: 'filaletter/public/docs/3-api/5-segments.md', title: 'Segments', slug: 'api/segments' },
            { name: 'filaletter/public/docs/3-api/6-segment-subscribers.md', title: 'Segment Subscribers', slug: 'api/segment-subscribers' },
            { name: 'filaletter/public/docs/3-api/7-subscriber-segments.md', title: 'Subscriber Segments', slug: 'api/subscriber-segments' },
            { name: 'filaletter/public/docs/3-api/8-campaigns.md', title: 'Campaigns', slug: 'api/campaigns' },
            { name: 'filaletter/public/docs/4-email-services/1-aws.md', title: 'AWS', slug: 'email-services/aws' },
            { name: 'filaletter/public/docs/4-email-services/2-postmark.md', title: 'Postmark', slug: 'email-services/postmark' },
            { name: 'filaletter/public/docs/4-email-services/3-sendgrid.md', title: 'SendGrid', slug: 'email-services/sendgrid' },
            { name: 'filaletter/public/docs/4-email-services/4-mailgun.md', title: 'Mailgun', slug: 'email-services/mailgun' },
            { name: 'filaletter/public/docs/4-email-services/5-mailjet.md', title: 'Mailjet', slug: 'email-services/mailjet' },
            { name: 'filaletter/public/docs/4-email-services/6-smtp.md', title: 'SMTP', slug: 'email-services/smtp' },
            { name: 'filaletter/public/docs/4-email-services/7-smtp-with-tracking.md', title: 'SMTP with Tracking', slug: 'email-services/smtp-with-tracking' },
          ],
          assets: [
            { from: 'filaletter/public/images', to: 'images' },
          ]
        },
        {
          version: '2.x',
          github_branch: 'v2.x',
          docs_path: 'filaletter/public/docs', // Base path in the GitHub repo where docs are located
          folder_titles: {
            'getting-started': 'Getting Started',
            'features': 'Features',
            'api': 'API',
            'email-services': 'Email Services',
          },
          limited_files: [
            { name: 'README.md', title: 'Overview', slug: 'overview' },
            { name: 'filaletter/public/docs/1-getting-started/1-introduction.md', title: 'Introduction', slug: 'getting-started/introduction' },
            { name: 'filaletter/public/docs/1-getting-started/2-getting-a-license.md', title: 'Getting a License', slug: 'getting-started/getting-a-license' },
            { name: 'filaletter/public/docs/1-getting-started/3-installation.md', title: 'Installation', slug: 'getting-started/installation' },
            { name: 'filaletter/public/docs/1-getting-started/4-quick-start.md', title: 'Quick Start', slug: 'getting-started/quick-start' },
            { name: 'filaletter/public/docs/1-getting-started/5-upgrading.md', title: 'Upgrading', slug: 'getting-started/upgrading' },
            { name: 'filaletter/public/docs/2-features/1-subscribers.md', title: 'Subscribers', slug: 'features/subscribers' },
            { name: 'filaletter/public/docs/2-features/2-segments.md', title: 'Segments', slug: 'features/segments' },
            { name: 'filaletter/public/docs/2-features/3-templates.md', title: 'Templates', slug: 'features/templates' },
            { name: 'filaletter/public/docs/2-features/4-campaigns.md', title: 'Campaigns', slug: 'features/campaigns' },
            { name: 'filaletter/public/docs/2-features/5-messages.md', title: 'Messages', slug: 'features/messages' },
            { name: 'filaletter/public/docs/2-features/6-workspace.md', title: 'Workspace', slug: 'features/workspace' },
            { name: 'filaletter/public/docs/2-features/7-choosing-an-editor.md', title: 'Choosing an Editor', slug: 'features/choosing-an-editor' },
            { name: 'filaletter/public/docs/2-features/8-custom-placeholder.md', title: 'Custom Placeholder', slug: 'features/custom-placeholder' },
            { name: 'filaletter/public/docs/3-api/1-introduction.md', title: 'API Introduction', slug: 'api/introduction' },
            { name: 'filaletter/public/docs/3-api/2-authentication.md', title: 'Authentication', slug: 'api/authentication' },
            { name: 'filaletter/public/docs/3-api/3-templates.md', title: 'Templates', slug: 'api/templates' },
            { name: 'filaletter/public/docs/3-api/4-subscribers.md', title: 'Subscribers', slug: 'api/subscribers' },
            { name: 'filaletter/public/docs/3-api/5-segments.md', title: 'Segments', slug: 'api/segments' },
            { name: 'filaletter/public/docs/3-api/6-segment-subscribers.md', title: 'Segment Subscribers', slug: 'api/segment-subscribers' },
            { name: 'filaletter/public/docs/3-api/7-subscriber-segments.md', title: 'Subscriber Segments', slug: 'api/subscriber-segments' },
            { name: 'filaletter/public/docs/3-api/8-campaigns.md', title: 'Campaigns', slug: 'api/campaigns' },
            { name: 'filaletter/public/docs/4-email-services/1-aws.md', title: 'AWS', slug: 'email-services/aws' },
            { name: 'filaletter/public/docs/4-email-services/2-postmark.md', title: 'Postmark', slug: 'email-services/postmark' },
            { name: 'filaletter/public/docs/4-email-services/3-sendgrid.md', title: 'SendGrid', slug: 'email-services/sendgrid' },
            { name: 'filaletter/public/docs/4-email-services/4-mailgun.md', title: 'Mailgun', slug: 'email-services/mailgun' },
            { name: 'filaletter/public/docs/4-email-services/5-mailjet.md', title: 'Mailjet', slug: 'email-services/mailjet' },
            { name: 'filaletter/public/docs/4-email-services/6-smtp.md', title: 'SMTP', slug: 'email-services/smtp' },
            { name: 'filaletter/public/docs/4-email-services/7-smtp-with-tracking.md', title: 'SMTP with Tracking', slug: 'email-services/smtp-with-tracking' },
          ],
          assets: [
            { from: 'filaletter/public/images', to: 'images' },
          ]
        },
      ],
    },
    {
      id: 'filament-cms-website-plugin',
      is_private: true,
      title: 'Filament CMS Website Plugin',
      description: 'A complete website content management plugin for Filament, allowing you to manage pages, media, and website content with ease.',
      repo: 'solutionforest/filament-cms-website-plugin',
      latestVersion: '4.x',
      versions: [
        { 
          version: '4.x', 
          github_branch: '4.x', 
          limited_files: [
            { name: 'README.md', title: 'Overview', slug: 'overview' },
            { name: 'docs/01-installation.md', title: 'Installation', slug: 'installation' },
            { name: 'docs/02-quick-start.md', title: 'Quick Start', slug: 'quick-start' },
            { name: 'docs/03-updating.md', title: 'Updating', slug: 'updating' },
            { name: 'docs/04-page-management.md', title: 'Page Management', slug: 'page-management' },
            { name: 'docs/05-navigation.md', title: 'Navigation', slug: 'navigation' },
            { name: 'docs/06-templates.md', title: 'Templates', slug: 'templates' },
          ] 
        },
        { 
          version: '3.x', 
          github_branch: '3.x', 
          limited_files: [
            { name: 'README.md', title: 'Overview', slug: 'overview' },
            { name: 'docs/01-installation.md', title: 'Installation', slug: 'installation' },
            { name: 'docs/02-quick-start.md', title: 'Quick Start', slug: 'quick-start' },
            { name: 'docs/03-updating.md', title: 'Updating', slug: 'updating' },
            { name: 'docs/04-page-management.md', title: 'Page Management', slug: 'page-management' },
            { name: 'docs/05-navigation.md', title: 'Navigation', slug: 'navigation' },
            { name: 'docs/06-templates.md', title: 'Templates', slug: 'templates' },
          ],
        },
        { 
          version: '2.x', 
          github_branch: '2.x', 
          limited_files: [
            { name: 'README.md', title: 'Overview', slug: 'overview' }, 
            { name: 'Documentation.md', title: 'Guide', slug: 'guide' },
          ] 
        },
        { 
          version: '1.x', 
          github_branch: '1.x', 
          limited_files: [
            { name: 'README.md', title: 'Overview', slug: 'overview' }, 
            { name: 'Documentation.md', title: 'Guide', slug: 'guide' },
          ] 
        },
      ],
    },
    {
      id: 'filament-tab-plugin',
      title: 'Filament Tab Plugin',
      description: 'Create beautiful tabbed interfaces in your Filament admin panel with this easy-to-use tab management plugin.',
      repo: 'solutionforest/filament-tab-plugin',
      latestVersion: '4.x',
      versions: [
        { version: '4.x', github_branch: '4.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '3.x', github_branch: '3.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-simple-lightbox',
      title: 'Filament Simple Lightbox',
      description: 'Filament SimpleLightbox is a PHP package that provides a simple and lightweight solution for implementing a lightbox feature in your Filament admin panel. It allows you to easily preview Image, PDF and Office documents within your Filament.',
      repo: 'solutionforest/Filament-SimpleLightBox',
      latestVersion: '1.x',
      versions: [
        { version: '1.x', github_branch: 'main', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
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
        { version: '1.x', github_branch: 'main', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '0.x', github_branch: 'main', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'simple-contact-form',
      title: 'Simple Contact Form',
      description: 'A straightforward contact form plugin with spam protection and email notifications for Filament applications.',
      repo: 'solutionforest/simple-contact-form',
      latestVersion: '2.x',
      versions: [
        { version: '2.x', github_branch: 'main', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '0.x', github_branch: 'main', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-firewall',
      title: 'Filament Firewall',
      description: 'Security and firewall management for Filament applications with IP blocking, rate limiting, and threat protection.',
      repo: 'solutionforest/filament-firewall',
      latestVersion: '4.x',
      versions: [
        { version: '4.x', github_branch: '4.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '3.x', github_branch: '3.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-translate-field',
      title: 'Filament Translate Field',
      description: 'Multi-language field support for Filament with easy translation management and language switching.',
      repo: 'solutionforest/filament-translate-field',
      latestVersion: '3.x',
      versions: [
        { version: '3.x', github_branch: '3.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-field-group',
      title: 'Filament Field Group',
      description: 'Group related fields together in your Filament forms with collapsible sections and organized layouts.',
      repo: 'solutionforest/filament-field-group',
      latestVersion: '3.x',
      versions: [
        { version: '3.x', github_branch: '3.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
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
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
    {
      id: 'filament-access-management',
      title: 'Filament Access Management',
      description: 'Complete user and role management solution for Filament applications with permissions, roles, and access control features.',
      repo: 'solutionforest/filament-access-management',
      latestVersion: '2.x',
      versions: [
        { version: '2.x', github_branch: '2.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
        { version: '1.x', github_branch: '1.x', limited_files: [{ name: 'README.md', title: 'Overview', slug: 'overview' }] },
      ],
    },
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