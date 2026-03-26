import { config } from "@/lib/config";
import { getPluginImage } from "@/lib/source";

export function generateMetadataForPlugin(plugin: string, version?: string) {
  const pluginConfig = config.plugins.find(p => p.id === plugin);
  if (!pluginConfig) return null;
  return {
    title: [
      pluginConfig.title,
      version,
      'Solution Forest Plugins'
    ].filter(Boolean).join(' | '),
    description: pluginConfig.description,
    // openGraph: {
    //   images: [
    //     getPluginImage(plugin).url, 
    //     // getPageImage(page).url,
    //   ],
    // },
  };
};