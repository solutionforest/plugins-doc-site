# Repository Configuration Guide

This guide explains how to configure repositories in the documentation system.

## Configuration Structure

Each repository is configured in `lib/repo-config.ts` with the following structure:

```typescript
{
  repository_url: 'https://github.com/owner/repo-name',
  latest_version: '3.x',
  is_private?: boolean, // Optional, for private repositories
  versions: [
    {
      version: '1.x',
      github_branch: '1.x',
      limited_files: [
        { name: "README.md", title: "Overview", slug: "index" },
        // Add other files as needed
      ]
    },
    {
      version: '2.x',
      github_branch: '2.x',
      limited_files: [
        { name: "README.md", title: "Overview", slug: "index" },
        { name: "CHANGELOG.md", title: "Changelog", slug: "changelog" },
      ]
    },
  ],
}
```

## Version-Specific Files

As of the latest update, all `limited_files` configurations have been moved to the version level. This allows for more granular control over which files are available for each version of a repository.

### Benefits of Version-Specific Files

1. **Accuracy**: Only show files that actually exist in each version
2. **Error Prevention**: Avoid 404 errors when fetching non-existent files
3. **Flexibility**: Different versions can have different sets of documentation files

### Common File Patterns

- **README.md**: Usually available in all versions, contains overview and installation instructions
- **CHANGELOG.md**: Often not available in early versions (1.x), added in later versions
- **Documentation.md**: Sometimes present for more complex packages

## Migration Notes

- **Before**: Files were configured at the repository level and applied to all versions
- **After**: Files are configured per version, allowing for precise control
- **Fallback**: If no `limited_files` are specified for a version, an empty array is used

## Adding New Repositories

When adding a new repository:

1. Add the repository configuration to the `rawRepositories` array
2. Specify version-specific `limited_files` for each version
3. Ensure the files actually exist in the corresponding GitHub branches
4. Test the configuration by running the development server

## Error Handling

The system now includes improved error handling for missing files:

- 404 errors are logged as informational messages, not warnings
- Missing files are gracefully skipped without breaking the build
- Each version can have different files without causing errors

## Example: Complete Repository Configuration

```typescript
{
  repository_url: 'https://github.com/solutionforest/filament-tree',
  latest_version: '3.x',
  versions: [
    {
      version: '1.x',
      github_branch: '1.x',
      limited_files: [
        { name: "README.md", title: "Overview", slug: "index" },
        // CHANGELOG.md doesn't exist in 1.x branch
      ]
    },
    {
      version: '2.x',
      github_branch: '2.x',
      limited_files: [
        { name: "README.md", title: "Overview", slug: "index" },
        { name: "CHANGELOG.md", title: "Changelog", slug: "changelog" },
      ]
    },
    {
      version: '3.x',
      github_branch: '3.x',
      limited_files: [
        { name: "README.md", title: "Overview", slug: "index" },
        { name: "CHANGELOG.md", title: "Changelog", slug: "changelog" },
      ]
    },
  ],
}
```
