import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore, selectCartCount } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { brl } from "@/lib/format";
import {
  Minus,
  Plus,
  Trash2,
  Tag,
  ShoppingBag,
  MessageCircle,
  ArrowLeft,
  Store,
  ChevronDown,
  Heart,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { CorreiosLogo } from "@/components/CorreiosLogo";

function CartHeader({ isEditing, setIsEditing }: { isEditing?: boolean; setIsEditing?: (v: boolean) => void }) {
  const router = useRouter();
  const count = useStore(selectCartCount);

  return (
    <header className="sticky top-0 z-30 bg-card md:bg-primary text-foreground md:text-primary-foreground shadow-soft border-b border-border md:border-none">
      {/* Mobile Header */}
      <div className="md:hidden max-w-6xl mx-auto px-3 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 w-1/4">
          <button
            onClick={() => router.history.back()}
            aria-label="Voltar"
            className="w-10 h-10 flex items-center text-primary"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 text-center font-medium text-lg">
          Carrinho {count > 0 && <span className="opacity-80">({count})</span>}
        </div>

        <div className="w-1/4 flex justify-end items-center gap-3 text-sm">
          {isEditing ? (
            <button onClick={() => setIsEditing?.(false)} className="font-medium text-primary">
              Concluído
            </button>
          ) : (
            <>
              <button onClick={() => setIsEditing?.(true)}>Editar</button>
              <MessageCircle className="h-5 w-5 text-primary" />
            </>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex max-w-6xl mx-auto px-4 h-24 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-3xl">
            <ShoppingBag className="h-10 w-10" />
            <span className="hidden lg:inline">Princesa de Laços</span>
          </Link>
          <div className="border-l-2 border-white/30 pl-4 ml-2 font-medium text-2xl">
            Carrinho de Compras
          </div>
        </div>
        <div className="flex-1 max-w-xl ml-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar na loja..."
              className="w-full h-11 pl-4 pr-14 rounded-sm bg-white text-foreground outline-none shadow-inner"
            />
            <button className="absolute right-0 top-0 h-11 w-14 bg-black/10 hover:bg-black/20 rounded-r-sm flex items-center justify-center transition-colors">
              <Search className="h-5 w-5 text-foreground/70" />
            </button>
          </div>
        </div>
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
    coupons,
  } = useStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Initialize selection
  useEffect(() => {
    setSelectedIds(cart.map((c) => c.productId));
  }, [cart.length]); // only re-run if cart items are added/removed

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <CartHeader />
        <main className="flex-1 animate-page-in">
          <div className="max-w-md mx-auto text-center py-20 px-4 min-h-[60vh] flex flex-col justify-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted/50 grid place-items-center mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h1 className="text-xl font-medium text-foreground mb-2">
            Seu carrinho está vazio
          </h1>
          <Link
            to="/"
            className="mt-4 inline-block bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm px-8 py-3 font-medium transition-colors"
          >
            Ir às compras
          </Link>
        </div>
        </main>
      </div>
    );
  }

  const handleCoupon = () => {
    const r = applyCoupon(code);
    r.ok ? toast.success(r.message) : toast.error(r.message);
    if (r.ok) setCode("");
  };

  const toggleSelection = (productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === cart.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map((c) => c.productId));
    }
  };

  const isAllSelected = cart.length > 0 && selectedIds.length === cart.length;
  const selectedCart = cart.filter((ci) => selectedIds.includes(ci.productId));

  // Local calculation based on selection
  const subtotal = selectedCart.reduce((acc, ci) => {
    const p = products.find((x) => x.id === ci.productId);
    return acc + (p ? p.price * ci.quantity : 0);
  }, 0);

  const couponObj = coupons.find((c) => c.code === appliedCoupon);
  const discount = couponObj
    ? couponObj.type === "percent"
      ? (subtotal * couponObj.value) / 100
      : couponObj.type === "fixed"
        ? couponObj.value
        : 0
    : 0;

  const total = Math.max(0, subtotal - discount);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CartHeader isEditing={isEditing} setIsEditing={setIsEditing} />
      <main className="flex-1 animate-page-in bg-muted/30 pb-32 md:pb-40">
        <div className="max-w-6xl mx-auto md:px-4 md:py-6">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-[auto_1fr_150px_150px_150px_100px] gap-4 bg-card p-4 rounded-sm shadow-sm text-sm text-muted-foreground mb-4 items-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleAll}
              className="w-4 h-4 accent-primary rounded-sm cursor-pointer"
            />
            <div>Produtos</div>
            <div className="text-center">Preço Unitário</div>
            <div className="text-center">Quantidade</div>
            <div className="text-center">Preço Total</div>
            <div className="text-center">Ações</div>
          </div>

          {/* Store Block */}
          <div className="bg-card md:rounded-sm shadow-sm mb-4">
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleAll}
                className="w-4 h-4 accent-primary rounded-sm cursor-pointer"
              />
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                Oficial
              </span>
              <Store className="h-4 w-4 text-foreground/80 hidden md:block" />
              <span className="font-medium">Princesa de Laços</span>
              <MessageCircle className="h-4 w-4 text-primary ml-auto md:ml-0" />
              <span className="md:hidden text-sm ml-auto text-muted-foreground">Editar</span>
            </div>

            <div className="flex flex-col">
              {cart.map((ci, index) => {
                const p = products.find((x) => x.id === ci.productId);
                if (!p) return null;
                const isSelected = selectedIds.includes(ci.productId);

                return (
                  <div
                    key={ci.productId}
                    className={`p-4 ${
                      index !== cart.length - 1 ? "border-b border-border/50" : ""
                    } hover:bg-muted/20 transition-colors`}
                  >
                    {/* Desktop Row */}
                    <div className="hidden md:grid grid-cols-[auto_1fr_150px_150px_150px_100px] gap-4 items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(p.id)}
                        className="w-4 h-4 accent-primary rounded-sm cursor-pointer"
                      />
                      <div className="flex gap-3">
                        <Link to="/produto/$id" params={{ id: p.id }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-20 h-20 rounded-sm border border-border object-cover"
                          />
                        </Link>
                        <div className="flex flex-col justify-start max-w-xs">
                          <Link
                            to="/produto/$id"
                            params={{ id: p.id }}
                            className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                          >
                            {p.name}
                          </Link>
                          {ci.variation && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Variação: {ci.variation}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-center text-sm">{brl(p.price)}</div>
                      <div className="flex justify-center">
                        <div className="flex items-center border border-border rounded-sm bg-card">
                          <button
                            onClick={() => updateCartQty(p.id, ci.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-muted/50 text-foreground/70"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm border-x border-border h-8 flex items-center justify-center">
                            {ci.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (p.stock !== undefined && ci.quantity >= p.stock) {
                                toast.error(`Apenas ${p.stock} unidade(s) disponível(is) em estoque.`);
                                return;
                              }
                              updateCartQty(p.id, ci.quantity + 1);
                            }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-muted/50 text-foreground/70"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-center text-sm font-medium text-primary">
                        {brl(p.price * ci.quantity)}
                      </div>
                      <div className="flex flex-col items-center gap-2 text-sm">
                        <button
                          onClick={() => removeFromCart(p.id)}
                          className="hover:text-primary transition-colors"
                        >
                          Excluir
                        </button>
                        <button className="text-primary text-xs flex items-center hover:underline">
                          Similares <ChevronDown className="w-3 h-3 ml-0.5" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Row */}
                    <MobileCartItem
                      p={p}
                      ci={ci}
                      isSelected={isSelected}
                      toggleSelection={toggleSelection}
                      updateCartQty={updateCartQty}
                      removeFromCart={removeFromCart}
                      isEditing={isEditing}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coupon / Discount section for Desktop - on Mobile it's usually inside bottom bar or just above */}
          <div className="bg-card p-4 md:rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border md:border-none">
             <div className="flex items-center gap-2 text-sm">
               <Tag className="h-5 w-5 text-primary" />
               <span>Cupom de Desconto</span>
             </div>
             
             {appliedCoupon ? (
                <div className="flex items-center justify-between bg-success/10 text-success rounded px-3 py-2 flex-1 max-w-sm md:ml-auto">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    {appliedCoupon}
                  </span>
                  <button onClick={removeCoupon} className="text-xs underline hover:no-underline">
                    Remover
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 flex-1 max-w-sm md:ml-auto">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Insira o código"
                    className="flex-1 h-9 px-3 rounded-sm border border-border text-sm uppercase outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={handleCoupon}
                    className="px-4 h-9 rounded-sm bg-primary text-primary-foreground text-sm font-medium"
                  >
                    Aplicar
                  </button>
                </div>
              )}
          </div>
          
          {/* Shipping notice */}
          <div className="bg-card p-4 md:rounded-sm shadow-sm mt-4 text-sm flex items-center gap-2 border-y border-border md:border-none">
            <CorreiosLogo className="h-4 w-auto" />
            <span className="text-muted-foreground">Frete grátis para compras acima de R$ 197,90</span>
          </div>

        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between p-3 md:p-4 gap-3">
          
          <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleAll}
                className="w-5 h-5 accent-primary rounded-sm"
              />
              <span className="hidden md:inline">Selecionar Tudo ({cart.length})</span>
              <span className="md:hidden">Tudo</span>
            </label>
            <button
              onClick={() => {
                 selectedIds.forEach(id => removeFromCart(id));
                 setSelectedIds([]);
              }}
              className="hidden md:inline text-sm hover:text-primary transition-colors"
            >
              Excluir
            </button>
            <button className="hidden md:flex text-sm hover:text-primary items-center gap-1 transition-colors text-primary">
              Mover para Favoritos
            </button>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-4">
            {isEditing ? (
              <button
                onClick={() => {
                   selectedIds.forEach(id => removeFromCart(id));
                   setSelectedIds([]);
                   setIsEditing(false);
                }}
                disabled={selectedCart.length === 0}
                className="w-full md:w-auto bg-destructive text-destructive-foreground px-8 py-3 rounded-sm font-medium disabled:opacity-50 transition-colors"
              >
                Excluir ({selectedCart.length})
              </button>
            ) : (
              <>
                <div className="text-right flex-1 md:flex-none">
                  <div className="text-sm flex items-center justify-end gap-2">
                    <span>Total ({selectedCart.length} item{selectedCart.length !== 1 ? 's' : ''}):</span>
                    <span className="text-primary font-medium text-lg md:text-xl">
                      {brl(total)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="text-xs text-success">
                      Desconto aplicado: {brl(discount)}
                    </div>
                  )}
                  {couponObj?.type === "free_shipping" && (
                    <div className="text-xs text-success font-medium">
                      Cupom de Frete Grátis aplicado!
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    if (selectedCart.length === 0) {
                       toast.error("Selecione pelo menos um item para continuar.");
                       return;
                    }
                    setShowLocationModal(true)
                  }}
                  disabled={selectedCart.length === 0}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity min-w-[140px]"
                >
                  Continuar ({selectedCart.length})
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showLocationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowLocationModal(false)}
        >
          <div
            className="bg-card rounded-xl p-6 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-medium text-center mb-2">
              Qual a sua cidade?
            </h2>
            <p className="text-sm text-center text-muted-foreground mb-6">
              A retirada no ateliê é exclusiva para moradores de Lauro Müller. As
              demais cidades são enviadas via Correios.
            </p>

            <div className="space-y-3">
              <button
                onClick={() =>
                  navigate({
                    to: "/checkout",
                    search: { delivery: "retirada" },
                  })
                }
                className="w-full flex flex-col items-center justify-center p-4 rounded-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all text-center"
              >
                <span className="font-medium text-primary">
                  Sou de Lauro Müller
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Retirada no ateliê
                </span>
              </button>
              <button
                onClick={() =>
                  navigate({ to: "/checkout", search: { delivery: "entrega" } })
                }
                className="w-full flex flex-col items-center justify-center p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center bg-muted/10"
              >
                <span className="font-medium text-foreground">Outra cidade</span>
                <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  Envio via <CorreiosLogo className="h-3 w-auto -ml-0.5" />
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowLocationModal(false)}
              className="w-full mt-4 h-10 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileCartItem({
  p,
  ci,
  isSelected,
  toggleSelection,
  updateCartQty,
  removeFromCart,
  isEditing,
}: any) {
  const [offset, setOffset] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);

  useEffect(() => {
    if (isEditing) setOffset(0);
  }, [isEditing]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === null || isEditing) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    if (diff < 0) {
      setOffset(Math.max(diff, -80));
    } else {
      setOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (startX === null) return;
    if (offset < -40) {
      setOffset(-80);
    } else {
      setOffset(0);
    }
    setStartX(null);
  };

  return (
    <div className="relative md:hidden overflow-hidden bg-destructive rounded-sm">
      <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center">
        <button
          onClick={() => {
            removeFromCart(p.id);
            setOffset(0);
          }}
          className="w-full h-full flex items-center justify-center text-white"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      <div
        className="flex gap-3 bg-card relative transition-transform duration-200 ease-out h-full w-full"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="pt-8">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelection(p.id)}
            className="w-5 h-5 accent-primary rounded-sm cursor-pointer"
          />
        </div>
        <Link to="/produto/$id" params={{ id: p.id }}>
          <img
            src={p.image}
            alt={p.name}
            className="w-24 h-24 rounded-sm border border-border object-cover"
          />
        </Link>
        <div className="flex-1 flex flex-col min-w-0">
          <Link
            to="/produto/$id"
            params={{ id: p.id }}
            className="font-medium text-sm line-clamp-2"
          >
            {p.name}
          </Link>
          {ci.variation && (
            <div className="text-xs text-muted-foreground bg-muted/50 self-start px-2 py-0.5 rounded mt-1 max-w-full truncate">
              {ci.variation} <ChevronDown className="inline w-3 h-3"/>
            </div>
          )}
          <div className="flex items-end justify-between mt-auto pt-2 gap-2">
            <span className="text-primary font-medium truncate">
              {brl(p.price)}
            </span>
            <div className="flex items-center border border-border rounded-sm bg-background shrink-0">
              <button
                onClick={() => updateCartQty(p.id, ci.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-sm border-x border-border h-7 flex items-center justify-center">
                {ci.quantity}
              </span>
              <button
                onClick={() => {
                  if (p.stock !== undefined && ci.quantity >= p.stock) {
                    toast.error(`Apenas ${p.stock} unidade(s) disponível(is) em estoque.`);
                    return;
                  }
                  updateCartQty(p.id, ci.quantity + 1);
                }}
                className="w-7 h-7 flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
