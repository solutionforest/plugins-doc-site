# Plugin Documentation Site

A modern static documentation website for plugin documentation with automatic GitHub integration, built with Next.js and [Fumadocs](https://fumadocs.dev). Optimized for GitHub Pages deployment with automated CI/CD.

## ✨ Features

- 📚 **Plugin Documentation**: Automatically fetch and display documentation from GitHub repositories
- 🏷️ **Version Management**: Support multiple versions mapped to different GitHub branches
- 🔍 **Full-Text Search**: Powered by Orama for fast documentation search
- 🌙 **Theme Toggle**: Light/dark mode support
- 📱 **Responsive Design**: Mobile-friendly layout
- 🚀 **Static Export**: Optimized for GitHub Pages deployment
- 🔄 **Auto Deployment**: GitHub Actions workflow for continuous deployment
- 💾 **Smart Caching**: Intelligent caching system for GitHub API calls

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or higher
- npm or pnpm
- GitHub Personal Access Token (optional, but recommended)

### 1. Installation

```bash
# Clone the repository
git clone <your-repository-url>
cd static-plugin-doc-site-3

# Install dependencies
npm install
# or
pnpm install
```

### 2. Environment Setup (Optional)

Create a `.env.local` file in the root directory:

```env
GITHUB_TOKEN=your_github_personal_access_token_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Getting a GitHub Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "Plugin Docs Site"
4. Select scopes:
   - `public_repo` (for public repositories)
   - `repo` (if you need access to private repositories)
5. Copy the generated token and add it to your `.env.local` file

**Note**: GitHub token is optional for public repositories, but recommended to avoid rate limiting.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Build for Production

```bash
# Build with fresh documentation fetch
npm run build

# Or build with cached documentation (faster)
npm run build:cache
```

## 📁 Project Structure

```
static-plugin-doc-site-3/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions deployment workflow
├── app/                         # Next.js app directory
│   ├── (home)/                  # Homepage with plugin/product listings
│   ├── docs/                    # Documentation pages
│   │   ├── [[...slug]]/         # Dynamic documentation routes
│   │   └── components/          # Docs-specific components
│   ├── api/                     # API routes (search, etc.)
│   └── llms-full.txt/           # LLM-optimized documentation
├── components/                  # Shared React components
│   ├── partials/                # Reusable partial components
│   └── provider.tsx             # Theme and context providers
├── content/docs/                # Generated documentation (auto-created)
│   ├── [plugin-name]/
│   │   ├── _meta.json           # Navigation structure
│   │   └── [version]/
│   │       └── overview.mdx     # Version documentation
├── lib/
│   ├── config.ts                # **Plugin/product configuration (EDIT THIS)**
│   ├── source.ts                # Fumadocs source configuration
│   └── layout.shared.tsx        # Shared layout configuration
├── public/                      # Static assets
│   └── images/                  # Plugin images and assets
├── scripts/
│   └── fetch-docs.ts            # Documentation fetcher script
├── next.config.mjs              # Next.js configuration
├── source.config.ts             # MDX configuration
└── package.json                 # Dependencies and scripts
```

## 🔧 Configuration Guide

### Adding a New Plugin

Edit [`lib/config.ts`](lib/config.ts) and add your plugin to the `plugins` array:

```typescript
export const config: Config = {
  plugins: [
    {
      id: "your-plugin-slug",
      title: "Your Plugin Name",
      description: "Brief description of what your plugin does",
      repo: "your-github-username/your-repo-name",
      latestVersion: "3.x",
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
    // Add more plugins...
  ],
  products: [
    // Your products here...
  ],
};
```

#### Plugin Configuration Options

- **`id`** (required): Unique identifier, used in URLs (e.g., `/docs/filament-tree/3.x/overview`)
- **`title`** (required): Display name shown in the UI
- **`description`** (required): Short description for the plugin card
- **`repo`** (required): GitHub repository in format `owner/repo`
- **`latestVersion`** (required): The default version shown to users
- **`versions`** (required): Array of version configurations
  - `version`: Version identifier (e.g., '1.x', '2.x')
  - `github_branch`: Branch name in GitHub repository
  - `limited_files`: Array of specific files to fetch (usually just README.md for overview)
- **`hidden`** (optional): Set to `true` to hide from the homepage
- **`is_manual`** (optional): Set to `true` for custom documentation structure
- **`docs_structure`** (optional): 'folder_based' for complex structures
- **`docs_path`** (optional): Custom path in repo for documentation
- **`sections`** (optional): Manual section definitions for complex docs

### Adding Products (Non-Plugin Items)

Products are external links shown alongside plugins on the homepage:

```typescript
products: [
  {
    id: "your-product-id",
    title: "Your Product Name",
    description: "What your product does",
    link: "https://yourproduct.com",
    badge: {
      text: "External",
      color: "green",
    },
  },
];
```

### Advanced: Complex Documentation Structure

For plugins with multiple documentation files organized in folders:

```typescript
{
  id: 'complex-plugin',
  title: 'Complex Plugin',
  description: 'Plugin with structured documentation',
  repo: 'owner/repo',
  latestVersion: '3.x',
  is_manual: true,
  docs_structure: 'folder_based',
  docs_path: 'docs',  // Path within the repository
  versions: [
    { version: '3.x', github_branch: 'main' }
  ],
  sections: [
    {
      name: 'Getting Started',
      slug: 'getting-started',
      files: [
        { name: 'installation.md', title: 'Installation', slug: 'installation' },
        { name: 'configuration.md', title: 'Configuration', slug: 'configuration' },
      ],
    },
    {
      name: 'Advanced',
      slug: 'advanced',
      files: [
        { name: 'customization.md', title: 'Customization', slug: 'customization' },
      ],
    },
  ],
}
```

## 🚀 Deployment to GitHub Pages

### Initial Setup

1. **Push your code to GitHub**:

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Build and deployment"
   - Source: Select **"GitHub Actions"**

3. **Set GitHub Token (Optional)**:
   - Only needed if fetching from private repositories
   - Go to Settings → Secrets and variables → Actions
   - Add a new repository secret named `GITHUB_TOKEN`
   - Use a Personal Access Token with `repo` scope

4. **Configure Base Path** (if needed):
   - The workflow automatically detects your repository name
   - Your site will be at: `https://[username].github.io/[repository-name]/`
   - To customize, set `NEXT_PUBLIC_BASE_PATH` environment variable

### Automatic Deployment

The GitHub Actions workflow automatically:

- ✅ Triggers on every push to `main` branch
- ✅ Fetches latest documentation from configured repos
- ✅ Builds the static site
- ✅ Deploys to GitHub Pages

### Manual Deployment

You can also trigger deployment manually:

1. Go to Actions tab in your repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

### Rebuild Documentation

To rebuild docs without code changes:

```bash
# Locally trigger a repository dispatch event
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -d '{"event_type":"rebuild-docs"}'
```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server on port 3001

# Building
npm run build            # Fetch docs and build for production
npm run build:cache      # Build using cached documentation (faster)
npm run build:static     # Build for static export (used by GitHub Actions)

# Documentation Management
npm run fetch-docs       # Fetch documentation from GitHub
npm run fetch-docs:cache # Use cached docs, skip GitHub fetch

# Type Checking
npm run types:check      # Run TypeScript type checking

# Preview Production Build
npm run start            # Serve the production build locally
```

## 🔍 Troubleshooting

### Common Issues

#### "No documentation found"

**Causes**:

- README.md doesn't exist in the specified GitHub repository/branch
- GitHub token lacks proper permissions
- Branch name doesn't match configuration

**Solutions**:

1. Verify the file exists: `https://github.com/[owner]/[repo]/blob/[branch]/README.md`
2. Check your GitHub token has access to the repository
3. Ensure `github_branch` in `lib/config.ts` matches the actual branch name
4. Run `npm run fetch-docs` to see detailed error messages

#### "Rate limit exceeded"

**Cause**: GitHub API rate limiting (60 requests/hour without token, 5000 with token)

**Solutions**:

1. Add a GitHub token to `.env.local`
2. Use cached documentation: `npm run build:cache`
3. Wait for the rate limit to reset (check headers in error)

#### Build fails with "Cannot find module"

**Solutions**:

1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Next.js cache: `rm -rf .next`
3. Ensure all dependencies are installed: `npm install`

#### Images not loading

**Causes**:

- Images not in `public/images/` directory
- Incorrect image paths in markdown
- Base path not configured correctly

**Solutions**:

1. Ensure images are in `public/images/[plugin-name]/`
2. Use relative paths in markdown: `![alt](./image.png)`
3. Check `basePath` configuration in `next.config.mjs`

#### GitHub Actions deployment fails

**Common issues**:

1. **Permissions error**:
   - Go to Settings → Actions → General
   - Scroll to "Workflow permissions"
   - Select "Read and write permissions"
2. **Pages not enabled**:
   - Go to Settings → Pages
   - Set source to "GitHub Actions"

3. **Build errors**:
   - Check the Actions tab for detailed logs
   - Ensure all required files exist in repository
   - Verify `lib/config.ts` is correctly formatted

#### Cache issues during development

**Solutions**:

```bash
# Clear all caches
rm -rf .next .cache node_modules/.cache

# Rebuild
npm run build
```

### Debug Mode

Enable verbose logging by checking:

1. Browser console for client-side errors
2. Terminal output for build-time errors
3. `.cache/` directory for fetched files

### Getting Help

1. Check the [Fumadocs documentation](https://fumadocs.dev)
2. Review GitHub Actions logs in the Actions tab
3. Inspect `.cache/raw/` to see fetched files
4. Enable debug mode by adding `console.log` statements in `scripts/fetch-docs.ts`

## 🎨 Customization

### Styling and Branding

**Update site colors** in [`app/global.css`](app/global.css):

```css
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
  /* Modify other colors as needed */
}
```

**Update navigation** in [`lib/layout.shared.tsx`](lib/layout.shared.tsx):

```typescript
export const baseOptions: HomeLayoutProps = {
  nav: {
    title: "Your Site Name",
  },
  links: [
    // Add custom navigation links
  ],
};
```

**Customize MDX components** in [`mdx-components.tsx`](mdx-components.tsx):

```typescript
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // Add custom component overrides
  };
}
```

### Adding Custom Pages

Create new pages in the `app/` directory following Next.js conventions.

## 📄 License

This project is open source. Please check the repository for license details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test locally: `npm run build && npm run start`
5. Commit changes: `git commit -m "Add your feature"`
6. Push to branch: `git push origin feature/your-feature`
7. Submit a pull request

---

Built with ❤️ using [Next.js](https://nextjs.org/) and [Fumadocs](https://fumadocs.dev)

# Development server

npm run dev

# Type checking

npm run types:check

# Build for production

npm run build

# Preview production build

npm run start

```

## Contributing

1. Add new plugins/products to `lib/config.ts`
2. Test locally with `npm run dev`
3. Ensure build passes with `npm run build`
4. Commit and push changes

## License

[Add your license here]
```
