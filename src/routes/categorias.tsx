import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, useStoreHydrated } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { CategoryGridSkeleton } from "@/components/Skeleton";

export const Route = createFileRoute("/categorias")({
  head: () => ({ meta: [{ title: "Categorias — Princesa de Laços" }, { name: "description", content: "Explore todas as categorias de laços, tiaras e acessórios." }] }),
  component: Page,
});

function Page() {
  const hydrated = useStoreHydrated();
  const { categories, products } = useStore();
  return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Categorias</h1>
        <p className="text-sm text-muted-foreground mb-5">Encontre o acessório perfeito.</p>
        {!hydrated ? (
          <CategoryGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((c) => {
              const count = products.filter(p => p.category === c.id && p.active && !p.hidden).length;
              return (
                <Link key={c.id} to="/categoria/$slug" params={{ slug: c.id }}
                  className="bg-card rounded-2xl p-5 shadow-card hover:shadow-soft transition-all flex flex-col items-center text-center group">
                  <div className="w-20 h-20 rounded-2xl gradient-soft grid place-items-center text-4xl group-hover:scale-110 transition-transform">{c.image}</div>
                  <div className="mt-3 font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{count} {count === 1 ? "produto" : "produtos"}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
