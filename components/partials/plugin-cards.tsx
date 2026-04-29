
import { Card as CardPrimitive, Cards as CardsPrimitive } from 'fumadocs-ui/components/card';
import { cn } from '@/lib/utils';
import { config } from '@/lib/config';
import { GithubIcon } from 'lucide-react';
import { getPluginGithubRepoUrl } from '@/lib/source';
import React from 'react';
import { Badge } from '../badge';

export const PluginCards = () => {
  const plugins = config.plugins
    .filter((plugin) => !plugin.hidden)
    .sort((a, b) => (a.archived ? 1 : 0) - (b.archived ? 1 : 0));

  return (
    <Cards className="md:grid-cols-2 lg:grid-cols-3">
      {plugins.map((plugin) => (
        <Card
          key={`plugin_${plugin.id}`}
          title={plugin.title}
          badge={plugin.badge}
          description={plugin.description}
          href={`/docs/${plugin.id}`}
          className={plugin.archived ? 'opacity-60' : undefined}
        >
          <div className="flex items-center justify-between">
            <Badge color="primary" size="lg">
              v{plugin.latestVersion}
            </Badge>
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
            <Badge color={badge.color as React.ComponentProps<typeof Badge>['color']}>{badge.text}</Badge>
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