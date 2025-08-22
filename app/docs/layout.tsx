import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
// import { source } from "@/lib/source";
import { Body } from "./layout.client";
import { PluginSidebar } from "@/components/plugin-sidebar";
import { plugins } from "@/lib/plugins";
  
export default function Layout({ children }: { children: ReactNode }) {
  // // Create tabs from our plugins
  // const pluginTabs = plugins.map((plugin) => ({
  //   title: plugin.name,
  //   // description: plugin.description,
  //   url: `/docs/${plugin.slug}/${plugin.latest_version}/readme`,
  // }));

  // const customTree = {
  //   name:"Folder",
  //   root: true,
  //   children: [],
  // };
  const customTree = {
      name: "Folders",
      root: true,
      children: [
        {
          type: "folder" as const, 
          name: "Filament Plugins",
          defaultOpen: true,
          children: plugins.map((plugin) => ({
    type: "page" as const,
    name: plugin.name,
    url: `/docs/${plugin.slug}/${plugin.latest_version}/readme`,
  })),
        },
      ],
  };

  const docsOptions: DocsLayoutProps = {
    ...baseOptions,
    tree: customTree,
    sidebar: {
        prefetch: true,
        // tabs: pluginTabs,
        // Custom sidebar content for version selection
        banner: <PluginSidebar />,
    },
  };

  return (
    <Body>
      <DocsLayout {...docsOptions}>{children}</DocsLayout>
    </Body>
  );
}
