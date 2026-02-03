import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { config as sourceConfig } from '@/lib/config';
import { SquareArrowOutUpRightIcon } from 'lucide-react';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // title: 'Solution Forest Plugins',
      title: (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SF</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Solution Forest Plugins
          </h1>
        </div>
      )
    },
    githubUrl: 'https://github.com/solutionforest',
    links: [
      {
        text: "Plugins",
        url: "/docs",
      },
      {
        text: "Cms Demo",
        url: "https://filament-cms-website-demo.solutionforest.net/admin",
        external: true,
        icon: <SquareArrowOutUpRightIcon />,
      },
      {
        type: 'menu',
        text: 'Products',
        items: sourceConfig.products.map((product) => ({
          text: product.title,
          description: product.description,
          url: product.link,
          external: true,
          icon: <SquareArrowOutUpRightIcon />,
        })),
      },
    ]
  };
}
