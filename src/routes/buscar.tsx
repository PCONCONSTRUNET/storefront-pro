import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/buscar")({
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) || "" }),
  component: Page,
});

function Page() {
  const { q } = Route.useSearch();
  const products = useStore(s => s.products.filter(p => p.active && p.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 py-5">
        <h1 className="text-2xl font-bold">Busca</h1>
        <p className="text-sm text-muted-foreground mb-4">{products.length} resultado(s) para "{q}"</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </StoreLayout>
  );
}
