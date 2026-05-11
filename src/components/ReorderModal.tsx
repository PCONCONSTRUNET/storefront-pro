import { useState, useEffect } from "react";
import { useStore, type Order } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { brl } from "@/lib/format";
import { X, Minus, Plus, RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function ReorderModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const products = useStore((s) => s.products);
  const addToCart = useStore((s) => s.addToCart);
  const navigate = useNavigate();

  const initial = order.items.map((it) => {
    const p = products.find((x) => x.id === it.productId);
    const stock = p?.stock ?? 0;
    return {
      productId: it.productId,
      name: it.name,
      image: it.image,
      price: it.price,
      maxStock: stock,
      available: !!p && stock > 0,
      selected: !!p && stock > 0,
      qty: Math.min(it.quantity, stock || 1),
    };
  });

  const [items, setItems] = useState(initial);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const toggle = (id: string) =>
    setItems((arr) =>
      arr.map((i) =>
        i.productId === id && i.available ? { ...i, selected: !i.selected } : i,
      ),
    );
  const setQty = (id: string, qty: number) =>
    setItems((arr) =>
      arr.map((i) =>
        i.productId === id
          ? { ...i, qty: Math.max(1, Math.min(qty, i.maxStock || 1)) }
          : i,
      ),
    );

  const selected = items.filter((i) => i.selected && i.available);
  const total = selected.reduce((a, i) => a + i.price * i.qty, 0);
  const allOn = items.filter((i) => i.available).every((i) => i.selected);

  const confirm = () => {
    if (selected.length === 0) {
      toast.error("Selecione pelo menos um item");
      return;
    }
    selected.forEach((i) => addToCart(i.productId, i.qty));
    toast.success(`${selected.length} item(s) adicionados ao carrinho`);
    onClose();
    navigate({ to: "/carrinho" });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-soft max-h-[92vh] flex flex-col animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-serif text-lg font-semibold">
              Comprar de novo
            </h2>
            <p className="text-xs text-muted-foreground">
              Escolha o que recomprar do pedido #{order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 hover:bg-muted rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-border flex items-center justify-between text-xs">
          <button
            onClick={() =>
              setItems((arr) =>
                arr.map((i) => (i.available ? { ...i, selected: !allOn } : i)),
              )
            }
            className="font-semibold text-primary hover:underline"
          >
            {allOn ? "Desmarcar todos" : "Selecionar todos"}
          </button>
          <span className="text-muted-foreground">
            {selected.length} de {items.filter((i) => i.available).length}{" "}
            selecionado(s)
          </span>
        </div>

        <ul className="flex-1 overflow-y-auto divide-y divide-border">
          {items.map((it) => (
            <li
              key={it.productId}
              className={`p-4 flex gap-3 ${!it.available ? "opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                checked={it.selected}
                disabled={!it.available}
                onChange={() => toggle(it.productId)}
                className="mt-1 h-5 w-5 accent-primary cursor-pointer disabled:cursor-not-allowed"
              />
              <img
                src={it.image}
                alt={it.name}
                className="w-14 h-14 rounded-xl object-cover bg-muted shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{it.name}</div>
                <div className="text-xs text-muted-foreground">
                  {brl(it.price)} cada
                </div>
                {!it.available ? (
                  <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-destructive font-semibold">
                    <AlertCircle className="h-3 w-3" /> Indisponível
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setQty(it.productId, it.qty - 1)}
                      disabled={!it.selected || it.qty <= 1}
                      className="h-7 w-7 rounded-full border border-border grid place-items-center disabled:opacity-40"
                      aria-label="Diminuir"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">
                      {it.qty}
                    </span>
                    <button
                      onClick={() => setQty(it.productId, it.qty + 1)}
                      disabled={!it.selected || it.qty >= it.maxStock}
                      className="h-7 w-7 rounded-full border border-border grid place-items-center disabled:opacity-40"
                      aria-label="Aumentar"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <span className="text-[11px] text-muted-foreground ml-1">
                      Estoque: {it.maxStock}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm font-semibold whitespace-nowrap">
                {brl(it.price * it.qty)}
              </div>
            </li>
          ))}
        </ul>

        <div className="p-4 border-t border-border safe-bottom space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal selecionado</span>
            <span className="font-bold text-primary text-base">
              {brl(total)}
            </span>
          </div>
          <button
            onClick={confirm}
            disabled={selected.length === 0}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-soft hover:opacity-90 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" /> Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
