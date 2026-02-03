import { OtherProducts, PluginCards } from '@/components/partials/plugin-cards';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* <h1 className="text-3xl font-bold mb-8 text-center">Solution Forest Plugins & Products</h1> */}

      <section id="plugins">
        <h2 className="text-3xl font-bold text-center mb-8">Filament Plugins</h2>
        <PluginCards />
      </section>

      <section id="products">
        <h2 className="text-3xl font-bold text-center mb-8">Other Products</h2>
        <OtherProducts />
      </section>
    </div>
  );
}