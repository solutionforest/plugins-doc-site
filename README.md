## Multi-Repository Documentation with Fumadocs

View documentation from multiple GitHub repositories in one unified interface powered by Fumadocs.
This project supports fetching and displaying documentation from multiple GitHub repositories simultaneously.

https://nextjs-fumadocs.vercel.app

### Features

- **Multi-Repository Support**: Browse documentation from multiple GitHub repositories
- **Dynamic Repository Configuration**: Easily add/remove repositories via configuration
- **GitHub API Integration**: Fetch content directly from GitHub repositories
- **Local Development Mode**: Preview content locally without GitHub API calls
- **Repository Identification**: Clear indication of which repository each document comes from
- **Unified Navigation**: Browse all repositories through a single interface

### Repository Configuration

Configure repositories in `lib/repo-config.ts`. Each repository supports multiple versions with version-specific files:

```typescript
export const repositories: RepositoryConfig[] = [
  {
    repository_url: "https://github.com/owner/repo-name",
    latest_version: "3.x",
    versions: [
      {
        version: "1.x",
        github_branch: "1.x",
        limited_files: [
          { name: "README.md", title: "Overview" },
          // Only include files that exist in this version
        ],
      },
      {
        version: "2.x",
        github_branch: "2.x",
        limited_files: [
          { name: "README.md", title: "Overview" },
          { name: "CHANGELOG.md", title: "Changelog" },
        ],
      },
    ],
  },
  // Add more repositories as needed
];
```

**Key Features:**

- **Version-Specific Files**: Each version can have different available files
- **Error Prevention**: Only files that exist in each version are configured
- **Flexible Configuration**: Easy to add/remove files per version

For detailed configuration instructions, see [REPOSITORY_CONFIG.md](./REPOSITORY_CONFIG.md).

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Add your GitHub Personal Access Token:

```bash
GITHUB_TOKEN=your_github_token_here
```

Generate a token at: https://github.com/settings/tokens
Required permissions: `public_repo` (for public repositories)

### Development Mode

For development with GitHub API:

```bash
pnpm dev
```

For local development without GitHub API:

```bash
pnpm sync:docs
LOCAL=true pnpm dev
```

This will use local files from the `next.js/docs` directory instead of GitHub API.

### Production Mode

```bash
pnpm build
pnpm start
```

In production, the app will use GitHub API to fetch the latest documentation content with ISR (Incremental Static Regeneration).

### URL Structure

- `/docs` - Main repository overview page
- `/docs/{owner}-{repo}` - Repository-specific documentation
- `/docs/{owner}-{repo}/{path}` - Specific document within a repository

Example:

- `/docs/vercel-next.js/app/getting-started` - Next.js App Router getting started guide
- `/docs/facebook-react/hooks/useState` - React useState hook documentation

### Adding New Repositories

1. Edit `lib/repo-config.ts`
2. Add a new repository configuration to the `repositories` array
3. The repository will automatically appear in the navigation and be accessible via the URL structure

### Troubleshooting

- **Bad credentials error**: Check your `GITHUB_TOKEN` in `.env.local`
- **Repository not found**: Verify the repository exists and is public
- **Empty documentation**: Check that the repository has a docs folder at the specified `docsPath`
