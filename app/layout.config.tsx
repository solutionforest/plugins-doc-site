import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Cards, Card } from "fumadocs-ui/components/card"
import { repositories, getRepositorySlug, getRepositoryDisplayName } from "@/lib/repo-config";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";

export function generatePluginsGrid() {
  return (
    <Cards>
      {repositories.map((repo) => (
        <Card
          key={getRepositorySlug(repo)}
          href={`/docs/${getRepositorySlug(repo)}`}
          title={getRepositoryDisplayName(repo)}
          description={repo.description}
        />
      ))}
    </Cards>
  );
}

export function generatePageMeta(title?: string, description?: string): Metadata {
  let base = pageMeta;
  if (title) {
    base.title = title + " | Solution Forest";
  }
  if (description) {
    base.description = description;
  }
  return base;
}

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="inline-flex flex-row gap-3 items-center pb-2 [aside_&]:-ms-1.5">
        <span className="text-xl font-bold">SolutionForest Plugin</span>
      </span>
    ),
  },
  links: [
    {
      text: "Documentation",
      url: "/docs",
      secondary: false,
    }
  ],
};
