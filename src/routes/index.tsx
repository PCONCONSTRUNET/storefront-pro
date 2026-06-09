import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore, useStoreHydrated } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import {
  ChevronRight,
  ChevronLeft,
  Zap,
  Truck,
  ShieldCheck,
  Tag,
  Crown,
  Sparkles,
  Gift,
  Flame,
  Pause,
  Play,
} from "lucide-react";
import bannerEncantada from "@/assets/banner-encantada-2026.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Princesa de Laços — Laços, tiaras e acessórios" },
      {
        name: "description",
        content:
          "Catálogo encantado de laços, tiaras e acessórios artesanais para princesas de todas as idades.",
      },
      { property: "og:title", content: "Princesa de Laços" },
      {
        property: "og:description",
        content: "Catálogo encantado de laços, tiaras e acessórios artesanais.",
      },
    ],
  }),
  component: Home,
});

function useCountdown(hours: number) {
  const [end] = useState(() => Date.now() + hours * 3600 * 1000);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, end - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { h: pad(h), m: pad(m), s: pad(s) };
}

function Home() {
  const { products, categories, settings, coupons } = useStore();
  const hydrated = useStoreHydrated();
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [categories],
  );
  const sortedProducts = useMemo(
    () =>
      [...products].sort(
        (a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999),
      ),
    [products],
  );
  const flash = useMemo(
    () =>
      sortedProducts
        .filter((p) => p.active && !p.hidden && p.oldPrice)
        .slice(0, 8),
    [sortedProducts],
  );
  const all = useMemo(
    () => sortedProducts.filter((p) => p.active && !p.hidden),
    [sortedProducts],
  );
  const { h, m, s } = useCountdown(8);

  const banners = [
    {
      icon: Crown,
      title: "Coleção Princesa",
      sub: "Tiaras e coroas",
      color: "from-primary to-rose",
    },
    {
      icon: Gift,
      title: "Kits Presente",
      sub: "A partir de R$ 49,90",
      color: "from-gold to-[oklch(0.78_0.16_55)]",
    },
    {
      icon: Sparkles,
      title: "Novidades",
      sub: "Toda semana",
      color: "from-rose to-accent",
    },
  ];

  return (
    <StoreLayout>
      {/* Hero carousel mock */}
      <section className="px-3 md:px-4 pt-3 md:pt-5 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          <Link
            to="/categorias"
            className="md:col-span-2 relative overflow-hidden rounded-2xl shadow-card block group"
          >
            <img
              src={bannerEncantada}
              alt={settings.bannerTitle || "Coleção Encantada 2026"}
              className="w-full h-full object-cover aspect-[16/7] md:aspect-[16/7] group-hover:scale-[1.02] transition-transform duration-500"
              loading="eager"
            />
            <h1 className="sr-only">{settings.bannerTitle}</h1>
          </Link>
          <div className="hidden md:flex flex-col gap-3">
            {banners.slice(0, 2).map((b) => (
              <Link
                key={b.title}
                to="/categorias"
                className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${b.color} text-white p-4 flex-1 group`}
              >
                <b.icon className="absolute -right-2 -bottom-2 h-20 w-20 opacity-20" />
                <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                  {b.sub}
                </div>
                <div className="font-display text-xl mt-1">{b.title}</div>
                <span className="mt-2 inline-flex items-center text-xs opacity-90 group-hover:translate-x-1 transition-transform">
                  Ver mais <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <CategoriesScroller categories={sortedCategories} />

      {/* Coupons strip */}
      {coupons.filter((c) => c.active).length > 0 && (
        <section className="mt-3 max-w-6xl mx-auto px-3 md:px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {coupons
              .filter((c) => c.active)
              .map((c) => (
                <div
                  key={c.code}
                  className="shrink-0 flex items-stretch bg-card border border-dashed border-primary/40 rounded-md overflow-hidden"
                >
                  <div className="bg-primary text-primary-foreground px-3 grid place-items-center">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div className="px-3 py-1.5">
                    <div className="text-[11px] font-bold text-primary leading-tight">
                      {c.code}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {c.type === "percent"
                        ? `${c.value}% OFF`
                        : `R$ ${c.value} OFF`}
                      {c.minOrder > 0 ? ` · acima de R$ ${c.minOrder}` : ""}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Flash sale */}
      {flash.length > 0 && (
        <section className="mt-4 max-w-6xl mx-auto">
          <div className="mx-3 md:mx-4 bg-card rounded-md border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-destructive to-[oklch(0.7_0.2_15)] text-destructive-foreground px-3 md:px-4 py-2.5 flex items-center gap-2 md:gap-3">
              <Flame className="h-5 w-5 md:h-6 md:w-6 fill-gold text-gold" />
              <h2 className="font-bold text-sm md:text-lg uppercase tracking-wide">
                Ofertas Relâmpago
              </h2>
              <div className="flex items-center gap-1 ml-auto md:ml-2 text-xs">
                <span className="hidden md:inline opacity-90">Termina em</span>
                <span className="bg-background text-foreground font-bold px-1.5 py-0.5 rounded font-mono text-[11px] md:text-sm">
                  {h}
                </span>
                <span className="font-bold">:</span>
                <span className="bg-background text-foreground font-bold px-1.5 py-0.5 rounded font-mono text-[11px] md:text-sm">
                  {m}
                </span>
                <span className="font-bold">:</span>
                <span className="bg-background text-foreground font-bold px-1.5 py-0.5 rounded font-mono text-[11px] md:text-sm">
                  {s}
                </span>
              </div>
              <Link
                to="/categorias"
                className="hidden md:inline-flex items-center text-xs font-semibold hover:underline ml-2"
              >
                Ver todas <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 p-2 md:p-3">
              {!hydrated ? (
                <ProductGridSkeleton count={4} />
              ) : (
                flash.map((p) => <ProductCard key={p.id} product={p} />)
              )}
            </div>
          </div>
        </section>
      )}

      {/* Products by Category */}
      <section className="mt-4 max-w-6xl mx-auto pb-6 space-y-8">
        {!hydrated ? (
          <div className="mx-3 md:mx-4">
            <ProductGridSkeleton count={10} />
          </div>
        ) : (
          <>
            {sortedCategories.map((cat) => {
              const catProducts = all.filter(
                (p) =>
                  p.categories?.includes(cat.id) || p.category === cat.id
              );
              if (catProducts.length === 0) return null;

              return (
                <div key={cat.id} className="mx-3 md:mx-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                      {cat.image?.startsWith("http") ||
                      cat.image?.startsWith("data:") ? (
                        <img
                          src={cat.image}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover shadow-sm border border-border"
                        />
                      ) : (
                        <span>{cat.image || "🎀"}</span>
                      )}
                      {cat.name}
                    </h2>
                    <Link
                      to="/categorias"
                      className="text-xs md:text-sm font-semibold text-primary hover:underline"
                    >
                      Ver mais &gt;
                    </Link>
                  </div>
                  {/* Carousel */}
                  <ProductRowCarousel products={catProducts} />
                </div>
              );
            })}
            
            {all.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  to="/categorias"
                  className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
                >
                  Explorar todo o catálogo <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </StoreLayout>
  );
}

function CategoriesScroller({
  categories,
}: {
  categories: { id: string; name: string; image: string }[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const el = scrollRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 80, behavior: "smooth" });
      }
    }, 2000);
    return () => clearInterval(id);
  }, [autoplay]);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <section className="mt-3 max-w-6xl mx-auto">
      <div className="bg-card rounded-md border border-border mx-3 md:mx-4 p-3 md:p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm md:text-base font-bold flex items-center gap-1.5">
            <Crown className="h-4 w-4 text-gold fill-gold" /> Categorias
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAutoplay((v) => !v)}
              aria-label={autoplay ? "Pausar rolagem" : "Iniciar rolagem"}
              className="w-7 h-7 rounded-full bg-muted hover:bg-primary/10 text-foreground grid place-items-center transition-colors"
            >
              {autoplay ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Anterior"
              className="w-7 h-7 rounded-full bg-muted hover:bg-primary/10 grid place-items-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Próximo"
              className="w-7 h-7 rounded-full bg-muted hover:bg-primary/10 grid place-items-center transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              to="/categorias"
              className="ml-1 text-[11px] md:text-xs text-primary font-semibold flex items-center"
            >
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div
          ref={scrollRef}
          onPointerDown={() => setAutoplay(false)}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 snap-x"
        >
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/categoria/$slug"
              params={{ slug: c.id }}
              className="shrink-0 snap-start flex flex-col items-center gap-1.5 group p-2 rounded-md hover:bg-muted transition-colors w-[72px] md:w-[88px]"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full gradient-soft grid place-items-center text-2xl md:text-3xl group-hover:scale-110 transition-transform overflow-hidden">
                {c.image?.startsWith("http") || c.image?.startsWith("data:") || c.image?.startsWith("/") ? (
                  <img src={c.image} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                ) : (
                  c.image
                )}
              </div>
              <span className="text-[10px] md:text-xs font-medium text-foreground text-center line-clamp-1">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductRowCarousel({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    if (scrollRef.current) {
      const clientWidth = scrollRef.current.clientWidth;
      const scrollAmount = clientWidth * 0.8 * dir;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={() => scrollBy(-1)}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur border border-border shadow-soft items-center justify-center z-10 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
        aria-label="Rolar para esquerda"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-3 px-3 md:mx-0 md:px-0"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[42vw] sm:w-[160px] md:w-[200px] shrink-0 snap-start"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scrollBy(1)}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur border border-border shadow-soft items-center justify-center z-10 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
        aria-label="Rolar para direita"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
