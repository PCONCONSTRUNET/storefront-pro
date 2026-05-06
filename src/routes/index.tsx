import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import { ChevronRight, Sparkles, Truck, ShieldCheck, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Princesa de Laços — Laços, tiaras e acessórios" },
      { name: "description", content: "Catálogo encantado de laços, tiaras e acessórios artesanais para princesas de todas as idades." },
      { property: "og:title", content: "Princesa de Laços" },
      { property: "og:description", content: "Catálogo encantado de laços, tiaras e acessórios artesanais." },
    ],
  }),
  component: Home,
});

function Home() {
  const { products, categories, settings } = useStore();
  const featured = useMemo(() => products.filter(p => p.active && p.oldPrice).slice(0, 6), [products]);
  const all = useMemo(() => products.filter(p => p.active), [products]);

  return (
    <StoreLayout>
      {/* Hero */}
      <section className="px-4 pt-4 md:pt-8 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl gradient-primary text-primary-foreground p-6 md:p-12 shadow-soft">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-gold/30 blur-2xl" />
          <div className="relative max-w-md">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
              <Sparkles className="h-3 w-3" /> Novidades
            </span>
            <h1 className="font-display text-3xl md:text-5xl mt-3 leading-tight">{settings.bannerTitle}</h1>
            <p className="mt-2 text-sm md:text-base text-primary-foreground/90">{settings.bannerSubtitle}</p>
            <Link to="/categorias" className="mt-5 inline-flex items-center gap-1.5 bg-white text-primary font-semibold rounded-full px-5 py-2.5 text-sm hover:opacity-95 active:scale-95 transition-all">
              Ver coleção <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-4 mt-4 max-w-6xl mx-auto grid grid-cols-3 gap-2 md:gap-4">
        {[
          { icon: Truck, label: "Frete fixo", sub: `R$ ${settings.shippingFee.toFixed(2)}` },
          { icon: ShieldCheck, label: "Compra segura", sub: "Pix e cartão" },
          { icon: Heart, label: "Feito à mão", sub: "Com carinho" },
        ].map((t) => (
          <div key={t.label} className="bg-card rounded-2xl p-3 md:p-4 text-center shadow-card">
            <t.icon className="h-5 w-5 mx-auto text-primary" />
            <div className="text-xs md:text-sm font-semibold mt-1">{t.label}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">{t.sub}</div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="mt-6 max-w-6xl mx-auto">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-bold">Categorias</h2>
          <Link to="/categorias" className="text-xs text-primary font-semibold">Ver todas</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {categories.map((c) => (
            <Link key={c.id} to="/categoria/$slug" params={{ slug: c.id }} className="shrink-0 flex flex-col items-center gap-1.5 group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-soft grid place-items-center text-2xl md:text-3xl shadow-card group-hover:scale-105 transition-transform">
                {c.image}
              </div>
              <span className="text-[11px] md:text-xs font-medium text-foreground">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotions */}
      {featured.length > 0 && (
        <section className="mt-8 max-w-6xl mx-auto">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-gold" /> Ofertas encantadas
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* All products */}
      <section className="mt-8 max-w-6xl mx-auto">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-bold">Todos os produtos</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-4">
          {all.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </StoreLayout>
  );
}
