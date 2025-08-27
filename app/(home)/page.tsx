import { generatePluginsGrid } from "@/app/layout.config";
import { generatePageMeta } from "@/lib/meta";

export const metadata = generatePageMeta();

export default async function HomePage() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Filament Plugin Documentation
        </h1>
        <p className="text-xl text-fd-muted-foreground max-w-2xl mx-auto">
          Comprehensive documentation for all Filament plugins by Solution Forest.
          Explore features, installation guides, and detailed usage examples.
        </p>
      </div>

      {generatePluginsGrid()}
    </main>
  );
}