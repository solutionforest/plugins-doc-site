# My Plugin Documentation Site

A modern documentation website for showcasing plugin documentation with automatic GitHub integration, built with Next.js and Fumadocs.

## � Quick Start

### Prerequisites

- Node.js 18+ or higher
- npm, yarn, or pnpm
- GitHub Personal Access Token

### 1. Installation

```bash
# Clone the repository
git clone <your-repository-url>
cd nextjs-fumadocs

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
GITHUB_TOKEN=your_github_personal_access_token_here
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

#### Getting a GitHub Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "Plugin Docs Site"
4. Select scopes:
   - `public_repo` (for public repositories)
   - `repo` (if you need access to private repositories)
5. Copy the generated token and add it to your `.env.local` file

### 3. Configure Your Plugins

Edit `lib/plugins.ts` to add your plugins:

```typescript
export const plugins: Plugin[] = [
  {
    name: "Your Plugin Name",
    slug: "your-plugin-slug",
    description: "Description of what your plugin does",
    repository_url: "https://github.com/your-username/your-plugin",
    latest_version: "2.x",
    is_private: false, // Set to true for private repositories
    versions: [
      { version: "1.x", github_branch: "1.x" },
      { version: "2.x", github_branch: "2.x" },
    ],
  },
  // Add more plugins here...
];
```

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
# or
pnpm build && pnpm start
```

## 📁 Project Structure

```
├── app/
│   ├── (home)/              # Homepage with plugin listings
│   ├── docs/                # Documentation pages
│   │   ├── layout.tsx       # Docs layout with sidebar
│   │   └── [[...slug]]/     # Dynamic plugin documentation
│   ├── api/                 # API endpoints
│   └── layout.tsx           # Root layout
├── lib/
│   ├── plugins.ts           # Plugin configuration (EDIT THIS)
│   ├── sources/             # GitHub integration
│   ├── cache.ts             # Performance optimizations
│   └── compile-md.ts        # Markdown processing
├── components/              # React components
└── public/                  # Static assets
```

## ⚙️ Features

### Plugin Documentation

The site automatically fetches and displays documentation from your GitHub repositories:

- **README.md** → Overview page
- **DOCUMENTATION.md** → Detailed documentation
- **CHANGELOG.md** → Version history

### Version Management

Each plugin can have multiple versions mapped to different GitHub branches:

```typescript
versions: [
  { version: "1.x", github_branch: "1.x" },
  { version: "2.x", github_branch: "2.x" },
  { version: "3.x", github_branch: "main" },
];
```

### Performance Features

- **Caching**: Intelligent caching system for GitHub API calls
- **ISR**: Incremental Static Regeneration for optimal performance
- **Rate Limiting**: Respects GitHub API limits
- **Error Handling**: Graceful fallbacks for missing content

## 🔧 Customization

### Adding New Plugins

1. Add plugin configuration to `lib/plugins.ts`
2. Ensure your GitHub repository has documentation files
3. The site will automatically generate pages for each version

### Private Repositories

For private repositories, set `is_private: true` in the plugin configuration. This will:

- Hide GitHub repository links in the UI
- Require proper token permissions
- Show appropriate fallback content if access is denied

### Styling and Branding

- Update `app/layout.config.tsx` for site configuration
- Modify `app/global.css` for custom styles
- Colors are defined using CSS custom properties

### API Endpoints

- `/api/status?action=health` - Site health check
- `/api/status?action=plugins` - List all configured plugins
- `/api/status?action=cache-stats` - Cache performance stats

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `GITHUB_TOKEN`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy automatically

### Other Platforms

1. Build the project: `npm run build`
2. Serve the generated files
3. Set environment variables on your hosting platform

## 🔍 Troubleshooting

### Common Issues

**"No documentation found"**

- Check if README.md exists in your repository
- Verify GitHub token has correct permissions
- Check if the branch name matches your configuration

**"Rate limit exceeded"**

- The site includes rate limiting, wait a few minutes
- Consider caching in production environment

**"Build fails"**

- Ensure all environment variables are set
- Check if GitHub token is valid
- Verify plugin configurations in `lib/plugins.ts`

### Debug Mode

Check the browser console for detailed error messages. The site logs:

- Cache hits/misses
- GitHub API calls
- Compilation errors

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
