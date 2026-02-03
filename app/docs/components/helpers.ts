import { config } from "@/lib/config";
import { getPluginImage } from "@/lib/source";

export function generateMetadataForPlugin(plugin: string) {
  const pluginConfig = config.plugins.find(p => p.id === plugin);
  if (!pluginConfig) return null;
  return {
    title: pluginConfig.name,
    description: pluginConfig.description,
    // openGraph: {
    //   images: [
    //     getPluginImage(plugin).url, 
    //     // getPageImage(page).url,
    //   ],
    // },
  };
};