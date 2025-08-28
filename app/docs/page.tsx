
import {
  DocsPage,
  DocsBody,
} from "fumadocs-ui/page";
import { generatePageMeta } from "@/lib/meta";
import { generatePluginsGrid } from "@/app/layout.config";

export const metadata = generatePageMeta();

export default async function Page() {
  return (
    <DocsPage>
      <DocsBody>
        {generatePluginsGrid()}
      </DocsBody>
    </DocsPage>
  );
}
