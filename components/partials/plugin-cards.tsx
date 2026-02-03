
import { Card as CardPrimitive, Cards as CardsPrimitive } from 'fumadocs-ui/components/card';
import { cn } from '@/lib/utils';
import { config } from '@/lib/config';
import { GithubIcon } from 'lucide-react';
import { getPluginGithubRepoUrl } from '@/lib/source';
import React from 'react';

export const PluginCards = () => {
  return (
    <Cards className="md:grid-cols-2 lg:grid-cols-3">
      {config.plugins.filter((plugin) => !plugin.hidden).map((plugin) => (
        <Card
          key={`plugin_${plugin.id}`}
          title={plugin.title}
          description={plugin.description}
          href={`/docs/${plugin.id}`}
        >
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">
              v{plugin.latestVersion}
            </span>
            <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              View Docs →
            </div>
          </div>
        </Card>
      ))}
    </Cards>
  )
}

export const OtherProducts = () => {
  return (
    <Cards>
      {config.products.filter((product) => !product.hidden).map((product) => (
        <Card
          key={`product_${product.id}`}
          title={product.title}
          badge={product.badge}
          description={product.description}
          href={product.link}
          external
        >
          <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            Learn More →
          </div>
        </Card>
      ))}
    </Cards>
  )
};

const Cards = ({
  className,
  ...props
}: React.ComponentProps<typeof CardsPrimitive>) => {
  return (
    <CardsPrimitive
      className={cn(
        'gap-6',
        className,
      )}
      {...props}
    />
  );
};

const CardTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{children}</h2>
  );
}

const Card = ({
  title,
  description,
  external,
  badge,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<typeof CardPrimitive>, 'title' | 'description'> & {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  badge?: { text: string; color?: string };
}) => {
  return (
    <CardPrimitive
      title={(
        <div className="flex items-center justify-between mb-4">
          {typeof title === 'string' ? (
            <CardTitle>{title}</CardTitle>
          ): title}
          {badge &&  (
            <span className={cn(
              "px-2 py-1 text-xs rounded-full",
              "border",
              badge.color === 'green' && `bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20`,
              badge.color === 'purple' && `bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20`,
              badge.color === 'orange' && `bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20`,
              badge.color === 'red' && `bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20`,
              badge.color === 'blue' && `bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20`,
              badge.color === 'amber' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
              badge.color === 'gray' || !badge.color ? `bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20` : '',
            )}>
              {badge.text}
            </span>
          )}
        </div>
      )}
      description={
        typeof description === 'string' ? (
          <span className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </span>
        ) : description
      }
      className={cn(
        'group block p-6 border border-border/50 rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 backdrop-blur-sm',
        'bg-white/50 dark:bg-black/50',
        className,
      )}
      {...props}
    >
      {children}
    </CardPrimitive>
  );
}