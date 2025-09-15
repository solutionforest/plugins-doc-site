import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Cards, Card } from "fumadocs-ui/components/card";
import {
  repositories,
  getRepositorySlug,
  getRepositoryDisplayName,
} from "@/lib/repo-config";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { SquareArrowOutUpRightIcon } from 'lucide-react';

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

export function generatePageMeta(
  title?: string,
  description?: string,
): Metadata {
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
      text: "Quick Start",
      url: "/docs",
    },
    {
      text: "Cms Demo",
      url: "https://filament-cms-website-demo.solutionforest.net/admin",
      external: true,
    },
    {
      type: 'menu',
      text: 'Other Plugins',
      items: [
        {
          text: 'Filaletter',
          description: 'A comprehensive newsletter management solution for Filament',
          url: 'http://filaletter.solutionforest.net/',
          external: true,
          icon: <SquareArrowOutUpRightIcon />,
        },
        {
          text: 'InspireCMS',
          description: 'A powerful content management system built with modern technologies',
          url: 'https://inspirecms.net/',
          external: true,
          icon: <SquareArrowOutUpRightIcon />,
        },
      ],
    },
  ],
};
