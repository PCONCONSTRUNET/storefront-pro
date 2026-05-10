import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore, useStoreHydrated, selectCurrentCustomer } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { ChevronLeft, Heart } from "lucide-react";

export const Route = createFileRoute("/perfil/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos — Princesa de Laços" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const customer = useStore(selectCurrentCustomer);
  const products = useStore((s) => s.products);

  useEffect(() => {
    if (hydrated && !customer) navigate({ to: "/login" });
  }, [hydrated, customer, navigate]);

  return (
    <StoreLayout>
      <div className="max-w-5xl mx-auto px-4 py-5">
        <Link
          to="/perfil"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" /> Favoritos
        </h1>

        {!hydrated || !customer ? (
          <ProductGridSkeleton count={6} cols="grid-cols-2 md:grid-cols-4" />
        ) : (
          (() => {
            const favIds = customer.favorites || [];
            const favProducts = products.filter((p) => favIds.includes(p.id));
            if (favProducts.length === 0) {
              return (
                <div className="text-center py-16">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground mt-3">
                    Você ainda não tem favoritos.
                  </p>
                  <Link
                    to="/"
                    className="mt-4 inline-block text-primary text-sm font-semibold underline"
                  >
                    Ver produtos
                  </Link>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {favProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            );
          })()
        )}
      </div>
    </StoreLayout>
  );
}
