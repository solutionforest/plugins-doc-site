'use client';

import { usePathname } from 'next/navigation';
import { config } from '@/lib/config';
import { ArchiveIcon } from 'lucide-react';

export function ArchivedSidebarBanner() {
  const pathname = usePathname();
  const pluginId = pathname.split('/')[2]; // /docs/[plugin]/...
  const plugin = config.plugins.find((p) => p.id === pluginId);

  if (!plugin?.archived) return null;

  return (
    <div className="mx-2 mb-2 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
      <ArchiveIcon className="mt-0.5 size-3.5 shrink-0" />
      <span>This plugin is archived and no longer maintained.</span>
    </div>
  );
}
