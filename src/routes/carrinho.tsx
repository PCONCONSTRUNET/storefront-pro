import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore, selectCartTotals, selectCartCount } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { StoreLayout } from "@/components/StoreLayout";
import { brl } from "@/lib/format";
import {
  Minus,
  Plus,
  Trash2,
  Tag,
  ShoppingBag,
  ChevronLeft,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { CorreiosLogo } from "@/components/CorreiosLogo";

function CartHeader() {
  const router = useRouter();
  const count = useStore(selectCartCount);
  const settings = useStore((s) => s.settings);
  return (
    <header className="sticky top-0 z-30 gradient-primary text-primary-foreground shadow-soft">
      <div className="max-w-6xl mx-auto px-3 md:px-4 h-14 flex items-center gap-2">
        <button
          onClick={() => router.history.back()}
          aria-label="Voltar"
          className="w-10 h-10 grid place-items-center rounded-full hover:bg-white/15 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center font-bold text-base">
          Carrinho{" "}
          {count > 0 && (
            <span className="opacity-90 font-semibold">({count})</span>
          )}
        </h1>
        <span className="w-10 h-10" />
      </div>
    </header>
  );
}

export const Route = createFileRoute("/carrinho")({
  head: () => ({ meta: [{ title: "Carrinho — Princesa de Laços" }] }),
  component: Page,
});

function Page() {
  const {
    cart,
    products,
    updateCartQty,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
  } = useStore();
  const totals = useStore(useShallow(selectCartTotals));
  const [code, setCode] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <StoreLayout header={<CartHeader />}>
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <div className="w-20 h-20 mx-auto rounded-full gradient-soft grid place-items-center">
            <ShoppingBag className="h-9 w-9 text-primary" />
          </div>
          <h1 className="text-xl font-bold mt-4">Seu carrinho está vazio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Que tal escolher um lacinho lindo?
          </p>
          <Link
            to="/"
            className="mt-6 inline-block bg-primary text-primary-foreground rounded-full px-6 py-3 font-semibold"
          >
            Explorar produtos
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const handleCoupon = () => {
    const r = applyCoupon(code);
    r.ok ? toast.success(r.message) : toast.error(r.message);
    if (r.ok) setCode("");
  };

  return (
    <StoreLayout header={<CartHeader />}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4" /> Continuar comprando
        </Link>
        <h1 className="text-2xl font-bold mb-4">Meu carrinho</h1>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <ul className="space-y-3">
            {cart.map((ci) => {
              const p = products.find((x) => x.id === ci.productId);
              if (!p) return null;
              return (
                <li
                  key={ci.productId}
                  className="bg-card rounded-2xl p-3 flex gap-3 shadow-card"
                >
                  <Link
                    to="/produto/$id"
                    params={{ id: p.id }}
                    className="shrink-0"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-xl bg-muted"
                      loading="lazy"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/produto/$id"
                      params={{ id: p.id }}
                      className="font-medium text-sm line-clamp-2 hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <div className="text-primary font-bold text-sm mt-1">
                      {brl(p.price)}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-muted rounded-full">
                        <button
                          onClick={() => updateCartQty(p.id, ci.quantity - 1)}
                          className="w-8 h-8 grid place-items-center"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQty(
                              p.id,
                              Math.min(p.stock, ci.quantity + 1),
                            )
                          }
                          className="w-8 h-8 grid place-items-center"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(p.id)}
                        className="w-8 h-8 grid place-items-center text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="bg-card rounded-2xl p-4 shadow-card h-fit lg:sticky lg:top-24">
            <h2 className="font-bold mb-3">Resumo</h2>

            <div className="mb-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-success/10 text-success rounded-xl px-3 py-2">
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    {appliedCoupon}
                  </span>
                  <button onClick={removeCoupon} className="text-xs underline">
                    remover
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="CUPOM"
                    className="flex-1 h-10 px-3 rounded-xl bg-muted text-sm uppercase outline-none focus:ring-2 ring-primary/40"
                  />
                  <button
                    onClick={handleCoupon}
                    className="px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </div>

            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{brl(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Desconto</dt>
                  <dd>− {brl(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <dt>Retirada</dt>
                <dd>No ateliê · sem custo</dd>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border mt-2">
                <dt>Total</dt>
                <dd className="text-primary">
                  {brl(Math.max(0, totals.subtotal - totals.discount))}
                </dd>
              </div>
            </dl>

            <button
              onClick={() => setShowLocationModal(true)}
              className="mt-4 w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center active:scale-95 transition-all"
            >
              Finalizar compra
            </button>

            <div className="mt-3 text-[11px] text-muted-foreground text-center">
              Cupons disponíveis: PRIMEIRA10, PRINCESA20
            </div>
          </aside>
        </div>
      </div>

      {showLocationModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowLocationModal(false)}
        >
          <div 
            className="bg-card rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center mb-2">Qual a sua cidade?</h2>
            <p className="text-sm text-center text-muted-foreground mb-6">
              A retirada no ateliê é exclusiva para moradores de Lauro Müller. As demais cidades são enviadas via Correios.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate({ to: "/checkout", search: { delivery: "retirada" } })}
                className="w-full flex flex-col items-center justify-center p-4 rounded-2xl border-[3px] border-primary/20 hover:border-primary hover:bg-primary/5 transition-all text-center shadow-sm"
              >
                <span className="font-bold text-lg text-primary">Sou de Lauro Müller</span>
                <span className="text-sm font-medium text-muted-foreground mt-0.5">Retirada no ateliê</span>
              </button>
              <button
                onClick={() => navigate({ to: "/checkout", search: { delivery: "entrega" } })}
                className="w-full flex flex-col items-center justify-center p-4 rounded-2xl border-[3px] border-border hover:border-primary hover:bg-primary/5 transition-all text-center shadow-sm bg-muted/20"
              >
                <span className="font-bold text-lg text-foreground">Outra cidade</span>
                <span className="text-sm font-medium text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  Envio via <CorreiosLogo className="h-4 w-auto -ml-0.5" />
                </span>
              </button>
            </div>
            
            <button
              onClick={() => setShowLocationModal(false)}
              className="w-full mt-4 h-10 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </StoreLayout>
  );
}
