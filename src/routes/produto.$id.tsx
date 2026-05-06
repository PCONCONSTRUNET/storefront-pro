import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import { brl } from "@/lib/format";
import { ChevronLeft, Minus, Plus, ShoppingBag, Zap, Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/produto/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useStore();
  const product = products.find(p => p.id === id);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [selected, setSelected] = useState<Record<string, number>>({});

  const priceDelta = (() => {
    if (!product?.variations) return 0;
    let d = 0;
    for (const v of product.variations) {
      const idx = selected[v.name];
      if (idx == null) continue;
      const opt = v.options[idx];
      if (typeof opt === "object" && opt.priceDelta) d += opt.priceDelta;
    }
    return d;
  })();
  const finalPrice = (product?.price ?? 0) + priceDelta;

  if (!product) {
    return (
      <StoreLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Produto não encontrado.</p>
          <Link to="/" className="text-primary font-semibold mt-2 inline-block">Voltar à loja</Link>
        </div>
      </StoreLayout>
    );
  }

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const related = products.filter(p => p.category === product.category && p.id !== product.id && p.active && !p.hidden).slice(0, 4);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  const handleBuyNow = () => {
    addToCart(product.id, qty);
    navigate({ to: "/carrinho" });
  };

  return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          <div>
            <div className="aspect-square bg-muted rounded-3xl overflow-hidden relative shadow-card">
              {imgError ? (
                <div className="absolute inset-0 grid place-items-center text-7xl gradient-soft">🎀</div>
              ) : (
                <img src={gallery[imgIdx]} alt={product.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
              )}
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full">-{discount}%</span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3">
                {gallery.map((g, i) => (
                  <button key={i} onClick={() => { setImgIdx(i); setImgError(false); }}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${i === imgIdx ? "border-primary" : "border-transparent"}`}>
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
            <div className="text-xs text-muted-foreground mt-1">SKU: {product.sku} · Estoque: {product.stock}</div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{brl(product.price)}</span>
              {product.oldPrice && <span className="text-base text-muted-foreground line-through">{brl(product.oldPrice)}</span>}
            </div>
            <p className="text-xs text-success font-medium mt-1">ou Pix com 5% off: {brl(product.price * 0.95)}</p>

            <p className="mt-5 text-sm text-foreground/80 leading-relaxed">{product.description}</p>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{brl(finalPrice)}</span>
              {product.oldPrice && <span className="text-base text-muted-foreground line-through">{brl(product.oldPrice)}</span>}
            </div>
            <p className="text-xs text-success font-medium mt-1">ou Pix com 5% off: {brl(finalPrice * 0.95)}</p>

            <p className="mt-5 text-sm text-foreground/80 leading-relaxed">{product.description}</p>

            {product.variations?.map(v => (
              <div key={v.name} className="mt-4">
                <div className="text-sm font-semibold mb-2">{v.name}</div>
                <div className="flex gap-2 flex-wrap">
                  {v.options.map((o, idx) => {
                    const label = typeof o === "string" ? o : o.label;
                    const delta = typeof o === "object" ? o.priceDelta : undefined;
                    const isSel = selected[v.name] === idx;
                    return (
                      <button
                        key={label + idx}
                        type="button"
                        onClick={() => setSelected(s => ({ ...s, [v.name]: idx }))}
                        className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${isSel ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border hover:border-primary hover:bg-primary/5"}`}
                      >
                        {label}
                        {delta ? <span className="ml-1 text-xs opacity-80">+{brl(delta)}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm font-semibold">Quantidade</span>
              <div className="flex items-center bg-muted rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 grid place-items-center"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-9 h-9 grid place-items-center"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => { addToCart(product.id, qty); toast.success("Adicionado!"); }}
                disabled={product.stock === 0}
                className="h-12 rounded-full border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50">
                <ShoppingBag className="h-4 w-4" /> Carrinho
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                <Zap className="h-4 w-4" /> Comprar agora
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Frete fixo R$ 12,90</div>
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Compra protegida</div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold mb-3">Você também vai amar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </StoreLayout>
  );
}
