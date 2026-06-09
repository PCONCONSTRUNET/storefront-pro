import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import {
  ProductReviews,
  Stars,
  productRating,
} from "@/components/ProductReviews";
import { brl } from "@/lib/format";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/produto/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { products, addToCart, reviews, joinWaitlist } = useStore();
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Preço da opção selecionada (valor absoluto, não acréscimo)
  const selectedOptionPrice = (() => {
    const flatIdx = selected["_flat"];
    if (flatIdx == null || !product?.variations) return null;
    const allOpts = product.variations.flatMap((v: any) =>
      (v.options ?? []).map((o: any) =>
        typeof o === "object" ? (o.priceDelta ?? null) : null
      )
    );
    const val = allOpts[flatIdx];
    return val != null && val > 0 ? val : null;
  })();

  const finalPrice = selectedOptionPrice ?? (product?.price ?? 0);

  if (!product) {
    return (
      <StoreLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Produto não encontrado.</p>
          <Link to="/" className="text-primary font-semibold mt-2 inline-block">
            Voltar à loja
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];
  const related = products
    .filter(
      (p) =>
        (p.categories?.includes(product.category) || p.category === product.category) &&
        p.id !== product.id &&
        p.active &&
        !p.hidden,
    )
    .slice(0, 4);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const handleBuyNow = () => {
    addToCart(product.id, qty);
    navigate({ to: "/carrinho" });
  };

  return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          <div>
            <div className="aspect-square bg-muted rounded-3xl overflow-hidden relative shadow-card">
              {imgError ? (
                <div className="absolute inset-0 grid place-items-center text-7xl gradient-soft">
                  🎀
                </div>
              ) : (
                <img
                  src={gallery[imgIdx]}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              )}
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setImgIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
                      setImgError(false);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-background text-foreground rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setImgIdx((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
                      setImgError(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-background text-foreground rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setImgIdx(i);
                      setImgError(false);
                    }}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${i === imgIdx ? "border-primary" : "border-transparent"}`}
                  >
                    <img
                      src={g}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {product.name}
            </h1>
            {(() => {
              const r = productRating(reviews, product.id);
              if (r.count === 0) return null;
              return (
                <a
                  href="#avaliacoes"
                  className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Stars value={r.avg} size={14} />
                  <span className="font-semibold text-foreground">
                    {r.avg.toFixed(1)}
                  </span>
                  <span>
                    · {r.count} avaliação{r.count === 1 ? "" : "ões"}
                  </span>
                </a>
              );
            })()}
            <div className="text-xs text-muted-foreground mt-1">
              SKU: {product.sku} · Estoque: {product.stock}
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {brl(finalPrice)}
              </span>
              {product.oldPrice && (
                <span className="text-base text-muted-foreground line-through">
                  {brl(product.oldPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-success font-medium mt-1">
              ou Pix com 5% off: {brl(finalPrice * 0.95)}
            </p>

            <p className="mt-5 text-sm text-foreground/80 leading-relaxed">
              {product.description}
            </p>

            {(() => {
              // Flatten all options from all groups into a single list
              const allOpts = (product.variations ?? []).flatMap(v =>
                (v.options ?? []).map((o: any) => ({
                  label: typeof o === "string" ? o : o.label,
                  delta: typeof o === "object" ? (o.priceDelta ?? 0) : 0,
                }))
              ).filter(o => o.label);

              if (allOpts.length === 0) return null;

              return (
                <div className="mt-4">
                  <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                    Escolha uma opção
                    <span className="text-[10px] text-muted-foreground font-normal">(obrigatório)</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {allOpts.map((o, idx) => {
                      const isSel = selected["_flat"] === idx;
                      return (
                        <button
                          key={o.label + idx}
                          type="button"
                          onClick={() => setSelected({ _flat: idx })}
                          className={`px-4 py-2.5 rounded-xl border-2 text-sm transition-all flex items-center justify-center gap-1.5 ${
                            isSel
                              ? "border-primary bg-primary/10 text-primary font-bold shadow-md scale-[1.02]"
                              : "border-primary/20 bg-background text-foreground/80 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground font-medium shadow-sm"
                          }`}
                        >
                          {o.label}
                          {o.delta > 0 && (
                            <span className="text-xs opacity-80 font-normal">
                              {brl(o.delta)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selected["_flat"] != null && allOpts[selected["_flat"]]?.delta > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground/80">Valor escolhido:</span>
                      <span className="text-sm font-bold text-primary">{brl(allOpts[selected["_flat"]].delta)}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm font-semibold">Quantidade</span>
              <div className="flex items-center bg-muted rounded-full">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 grid place-items-center"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-9 h-9 grid place-items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {product.stock === 0 ? (
              <div className="mt-6 p-4 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
                  <ShieldCheck className="h-4 w-4" /> Avise-me quando chegar
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Este produto está esgotado no momento. Deixe seu e-mail para
                  ser avisada assim que ele voltar!
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!waitlistEmail) return;
                    setWaitlistLoading(true);
                    const r = joinWaitlist(product.id, waitlistEmail);
                    toast.success(r.message);
                    setWaitlistEmail("");
                    setWaitlistLoading(false);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="Seu melhor e-mail"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="flex-1 h-11 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="submit"
                    disabled={waitlistLoading}
                    className="h-11 px-4 rounded-xl gradient-primary text-white font-bold text-xs disabled:opacity-50"
                  >
                    {waitlistLoading ? "..." : "Avisar-me"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    addToCart(product.id, qty);
                    toast.success("Adicionado!");
                  }}
                  disabled={product.stock === 0}
                  className="h-12 rounded-full border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" /> Carrinho
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" /> Comprar agora
                </button>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Frete fixo R$ 12,90
              </div>
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Compra
                protegida
              </div>
            </div>
          </div>
        </div>

        <div id="avaliacoes">
          <ProductReviews productId={product.id} />
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold mb-3">Você também vai amar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </StoreLayout>
  );
}
