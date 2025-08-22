import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

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
  links: [],
};
