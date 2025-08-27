# Migration from Git Submodules to GitHub API

This document explains the migration from Git submodules to GitHub API for fetching documentation from multiple repositories.

## Background

The project originally used Git submodules to include documentation from external repositories. However, this approach had several limitations:

1. **Single Repository Limitation**: Git submodules work best for including one repository at a time
2. **Version Management Complexity**: Managing multiple versions from different branches was difficult
3. **Build Complexity**: Submodules need to be initialized and updated separately
4. **Private Repository Issues**: Accessing private repositories requires additional authentication setup

## New GitHub API Approach

The project now uses GitHub's REST API to fetch documentation dynamically, which provides:

### ✅ Benefits

1. **Multi-Repository Support**: Easily fetch from multiple repositories simultaneously
2. **Version-Specific Configuration**: Each version can have different available files
3. **Dynamic Content**: Content is fetched at runtime, always up-to-date
4. **Private Repository Support**: Uses GitHub tokens for authentication
5. **Error Handling**: Graceful handling of missing files or repositories
6. **No Build Dependencies**: No need to initialize submodules

### 🔧 Configuration

Repositories are configured in `lib/repo-config.ts`:

```typescript
const rawRepositories = [
  {
    repository_url: "https://github.com/solutionforest/filament-tree",
    latest_version: "3.x",
    versions: [
      {
        version: "1.x",
        github_branch: "1.x",
        limited_files: [
          { name: "README.md", title: "Overview" },
          // CHANGELOG.md doesn't exist in 1.x branch
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
];
```

## Migration Steps Completed

### 1. Removed Git Submodule Configuration

- ✅ Deleted `.gitmodules` file
- ✅ Removed submodule configuration from Git config
- ✅ Updated `package.json` scripts

### 2. Updated Scripts

- **Before**: `"sync:docs": "git submodule update --init"`
- **After**: `"sync:docs": "echo 'Documentation is now fetched via GitHub API - see lib/repo-config.ts'"`

### 3. Enhanced Page Rendering

- ✅ Updated `page.tsx` to show version-specific limited files
- ✅ Fixed static parameter generation for version-specific files
- ✅ Improved UI to display available files per version

### 4. Improved Error Handling

- ✅ Graceful handling of missing files (404 errors)
- ✅ Version-specific file availability
- ✅ Better logging and error messages

## Current Commands

| Command          | Purpose           | Description                              |
| ---------------- | ----------------- | ---------------------------------------- |
| `pnpm dev`       | Development       | Start development server with GitHub API |
| `pnpm dev:local` | Local Development | Use local files instead of GitHub API    |
| `pnpm build`     | Production Build  | Build site with GitHub API content       |
| `pnpm sync:docs` | Information       | Shows migration message                  |

## Environment Setup

Ensure you have a GitHub token in `.env.local`:

```bash
GITHUB_TOKEN=your_github_token_here
```

This token is used to:

- Access private repositories
- Increase API rate limits
- Fetch content from multiple repositories simultaneously

## Benefits Realized

1. **No More Submodule Errors**: No issues with `git submodule update --init`
2. **Dynamic Content**: Documentation is always current
3. **Multi-Version Support**: Easy version switching and comparison
4. **Scalable**: Easy to add new repositories
5. **Maintainable**: Clear configuration in TypeScript

## Future Enhancements

- [ ] Caching mechanism for GitHub API responses
- [ ] Webhook integration for automatic content updates
- [ ] Enhanced search across all repositories
- [ ] Repository-specific themes or styling
