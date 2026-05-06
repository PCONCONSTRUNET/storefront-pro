import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { brl } from "@/lib/format";
import type { Product } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useStore((s) => s.addToCart);
  const [imgError, setImgError] = useState(false);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <article className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all flex flex-col">
      <Link to="/produto/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {imgError ? (
            <div className="absolute inset-0 grid place-items-center text-4xl bg-gradient-to-br from-rose to-accent">🎀</div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-gold text-gold-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              Últimas {product.stock}
            </span>
          )}
        </div>
      </Link>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <Link to="/produto/$id" params={{ id: product.id }} className="block">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[40px] leading-tight">{product.name}</h3>
        </Link>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-bold text-primary">{brl(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-muted-foreground line-through">{brl(product.oldPrice)}</span>}
        </div>
        <button
          onClick={() => { addToCart(product.id); toast.success("Adicionado ao carrinho"); }}
          disabled={product.stock === 0}
          className={cn(
            "mt-2 h-9 rounded-full text-xs font-semibold flex items-center justify-center gap-1 transition-all",
            product.stock === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "gradient-primary text-primary-foreground hover:opacity-90 active:scale-95"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          {product.stock === 0 ? "Esgotado" : "Adicionar"}
        </button>
      </div>
    </article>
  );
}
