import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, useStoreHydrated } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { SearchX } from "lucide-react";

export const Route = createFileRoute("/buscar")({
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) || "" }),
  component: Page,
});

function Page() {
  const { q } = Route.useSearch();
  const hydrated = useStoreHydrated();
  const allProducts = useStore((s) => s.products);
  const products = useMemo(
    () =>
      allProducts.filter(
        (p) => p.active && !p.hidden && p.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [allProducts, q],
  );
  return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 py-5">
        <h1 className="text-2xl font-bold">Busca</h1>
        <p className="text-sm text-muted-foreground mb-4">
          {hydrated ? `${products.length} resultado(s) para "${q}"` : "Buscando..."}
        </p>
        {!hydrated ? (
          <ProductGridSkeleton count={8} cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <SearchX className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum produto encontrado para "{q}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
