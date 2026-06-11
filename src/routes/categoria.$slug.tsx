import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, useStoreHydrated } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/categoria/$slug")({
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const hydrated = useStoreHydrated();
  const { categories } = useStore();
  const cat = (categories || []).find((c) => c?.id === slug);
  const list = useStore((s) =>
    (s?.products || []).filter(
      (p) => p && ((p.categories && p.categories.includes(slug)) || p.category === slug) && p.active && !p.hidden,
    ),
  );

  return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 py-5">
        <Link
          to="/categorias"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-2 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Categorias
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl flex items-center justify-center">
            {cat?.image?.startsWith("http") || cat?.image?.startsWith("data:") || cat?.image?.startsWith("/") ? (
              <img src={cat.image} alt="" className="w-8 h-8 object-contain" />
            ) : (
              cat?.image
            )}
          </span>
          {cat?.name || "Categoria"}
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          {hydrated
            ? `${list.length} ${list.length === 1 ? "produto" : "produtos"}`
            : "Carregando..."}
        </p>
        {!hydrated ? (
          <ProductGridSkeleton
            count={8}
            cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          />
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum produto nesta categoria.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
