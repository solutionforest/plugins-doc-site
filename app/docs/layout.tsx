import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { ArchivedSidebarBanner } from './components/archived-sidebar-banner';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      sidebar={{ banner: <ArchivedSidebarBanner /> }}
    >
      {children}
    </DocsLayout>
  );
}
