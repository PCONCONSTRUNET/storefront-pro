import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import { ChevronRight, Zap, Truck, ShieldCheck, Tag, Crown, Sparkles, Gift, Flame } from "lucide-react";

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
  const flash = useMemo(() => products.filter(p => p.active && p.oldPrice).slice(0, 8), [products]);
  const all = useMemo(() => products.filter(p => p.active), [products]);
  const { h, m, s } = useCountdown(8);

  const banners = [
    { icon: Crown, title: "Coleção Princesa", sub: "Tiaras e coroas", color: "from-primary to-rose" },
    { icon: Gift, title: "Kits Presente", sub: "A partir de R$ 49,90", color: "from-gold to-[oklch(0.78_0.16_55)]" },
    { icon: Sparkles, title: "Novidades", sub: "Toda semana", color: "from-rose to-accent" },
  ];

  return (
    <StoreLayout>
      {/* Hero carousel mock */}
      <section className="px-3 md:px-4 pt-3 md:pt-5 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          <div className="md:col-span-2 relative overflow-hidden rounded-lg gradient-primary text-primary-foreground p-5 md:p-10 shadow-card min-h-[140px] md:min-h-[260px]">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-6 -bottom-6 w-36 h-36 rounded-full bg-gold/30 blur-2xl" />
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-0.5 rounded-sm text-[10px] md:text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="h-3 w-3" /> Novidades
            </span>
            <h1 className="font-display text-2xl md:text-4xl mt-2 leading-tight max-w-md">{settings.bannerTitle}</h1>
            <p className="mt-1 text-xs md:text-sm text-primary-foreground/90 max-w-md">{settings.bannerSubtitle}</p>
            <Link to="/categorias" className="mt-3 inline-flex items-center gap-1 bg-white text-primary font-bold rounded-sm px-4 py-2 text-xs md:text-sm hover:opacity-95 active:scale-95 transition-all">
              Comprar agora <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden md:flex flex-col gap-3">
            {banners.slice(0, 2).map((b) => (
              <Link key={b.title} to="/categorias" className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${b.color} text-white p-4 flex-1 group`}>
                <b.icon className="absolute -right-2 -bottom-2 h-20 w-20 opacity-20" />
                <div className="text-xs font-semibold uppercase tracking-wide opacity-90">{b.sub}</div>
                <div className="font-display text-xl mt-1">{b.title}</div>
                <span className="mt-2 inline-flex items-center text-xs opacity-90 group-hover:translate-x-1 transition-transform">Ver mais <ChevronRight className="h-3 w-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-3 md:px-4 mt-3 max-w-6xl mx-auto">
        <div className="bg-card rounded-md border border-border grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {[
            { icon: Truck, label: "Frete fixo", sub: `R$ ${settings.shippingFee.toFixed(2)}` },
            { icon: ShieldCheck, label: "Compra 100% segura", sub: "Pix, cartão e dinheiro" },
            { icon: Zap, label: "Envio rápido", sub: "Em até 24h" },
            { icon: Tag, label: "Cupons", sub: `${coupons.filter(c=>c.active).length} ativos hoje` },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 p-2.5 md:p-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 grid place-items-center text-primary shrink-0">
                <t.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] md:text-xs font-semibold leading-tight">{t.label}</div>
                <div className="text-[10px] md:text-[11px] text-muted-foreground truncate">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories grid - Shopee style */}
      <section className="mt-3 max-w-6xl mx-auto">
        <div className="bg-card rounded-md border border-border mx-3 md:mx-4 p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm md:text-base font-bold flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-gold fill-gold" /> Categorias
            </h2>
            <Link to="/categorias" className="text-[11px] md:text-xs text-primary font-semibold flex items-center">
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 snap-x snap-mandatory">
            {categories.map((c) => (
              <Link key={c.id} to="/categoria/$slug" params={{ slug: c.id }} className="shrink-0 snap-start flex flex-col items-center gap-1.5 group p-2 rounded-md hover:bg-muted transition-colors w-[72px] md:w-[88px]">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full gradient-soft grid place-items-center text-2xl md:text-3xl group-hover:scale-110 transition-transform">
                  {c.image}
                </div>
                <span className="text-[10px] md:text-xs font-medium text-foreground text-center line-clamp-1">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Coupons strip */}
      {coupons.filter(c => c.active).length > 0 && (
        <section className="mt-3 max-w-6xl mx-auto px-3 md:px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {coupons.filter(c => c.active).map((c) => (
              <div key={c.code} className="shrink-0 flex items-stretch bg-card border border-dashed border-primary/40 rounded-md overflow-hidden">
                <div className="bg-primary text-primary-foreground px-3 grid place-items-center">
                  <Tag className="h-4 w-4" />
                </div>
                <div className="px-3 py-1.5">
                  <div className="text-[11px] font-bold text-primary leading-tight">{c.code}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {c.type === "percent" ? `${c.value}% OFF` : `R$ ${c.value} OFF`}
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
              <h2 className="font-bold text-sm md:text-lg uppercase tracking-wide">Ofertas Relâmpago</h2>
              <div className="flex items-center gap-1 ml-auto md:ml-2 text-xs">
                <span className="hidden md:inline opacity-90">Termina em</span>
                <span className="bg-background text-foreground font-bold px-1.5 py-0.5 rounded font-mono text-[11px] md:text-sm">{h}</span>
                <span className="font-bold">:</span>
                <span className="bg-background text-foreground font-bold px-1.5 py-0.5 rounded font-mono text-[11px] md:text-sm">{m}</span>
                <span className="font-bold">:</span>
                <span className="bg-background text-foreground font-bold px-1.5 py-0.5 rounded font-mono text-[11px] md:text-sm">{s}</span>
              </div>
              <Link to="/categorias" className="hidden md:inline-flex items-center text-xs font-semibold hover:underline ml-2">
                Ver todas <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 p-2 md:p-3">
              {flash.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* All products - "Para você" */}
      <section className="mt-4 max-w-6xl mx-auto pb-6">
        <div className="mx-3 md:mx-4">
          <div className="flex items-center justify-center mb-3 relative">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <h2 className="relative bg-background px-4 text-xs md:text-sm font-bold text-primary uppercase tracking-widest">
              ✨ Selecionado para você ✨
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
            {all.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-6 text-center">
            <Link to="/categorias" className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
              Ver mais produtos <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
