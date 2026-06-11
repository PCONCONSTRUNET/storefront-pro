import { Link } from "@tanstack/react-router";
import { Star, Truck, Heart } from "lucide-react";
import { useState } from "react";
import { brl } from "@/lib/format";
import { useStore, selectCurrentCustomer } from "@/lib/store";
import type { Product } from "@/lib/data";

export function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const customer = useStore(selectCurrentCustomer);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const isFav = !!customer?.favorites?.includes(product.id);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  const reviews = useStore((s) => s.reviews);
  const orders = useStore((s) => s.orders);

  const productReviews = (reviews || []).filter((r) => r.productId === product.id);
  
  const sold = (orders || []).reduce((acc, o) => {
    if (['pago', 'concluido', 'em_separacao', 'saiu_para_entrega'].includes(o.status)) {
      const it = (o.items || []).find(i => i.productId === product.id);
      if (it) return acc + it.quantity;
    }
    return acc;
  }, 0);

  const realCount = productReviews.length;
  const realAvg = realCount
    ? productReviews.reduce((a, r) => a + r.rating, 0) / realCount
    : 0;
  const rating = realCount > 0 ? realAvg.toFixed(1) : "0.0";
  
  // We hide free shipping since there is no real flag for it yet.
  const freeShip = false;
  // A real best seller can be defined if it has more than a few sales, 
  // or we can keep it based on high discounts if requested. We'll use real sales.
  const bestSeller = sold >= 5;

  return (
    <article className="group relative bg-card rounded-md overflow-hidden border border-border hover:border-primary/40 hover:shadow-soft transition-all flex flex-col">
      <Link to="/produto/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {imgError ? (
            <div className="absolute inset-0 grid place-items-center text-4xl bg-gradient-to-br from-rose to-accent">
              🎀
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              loading="eager"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {discount > 0 && (
            <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md">
              -{discount}%
            </span>
          )}
          {bestSeller && (
            <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-gold to-[oklch(0.78_0.16_55)] text-gold-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
              + Vendido
            </span>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <span className="absolute bottom-1.5 left-1.5 bg-foreground/80 text-background text-[9px] font-semibold px-1.5 py-0.5 rounded-sm">
              Últimas {product.stock}
            </span>
          )}
        </div>
      </Link>
      {customer && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          aria-label={
            isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-card/90 backdrop-blur grid place-items-center shadow-sm hover:scale-110 transition-transform z-10"
        >
          <Heart
            className={
              "h-4 w-4 " +
              (isFav ? "fill-primary text-primary" : "text-muted-foreground")
            }
          />
        </button>
      )}
      <div className="p-2 flex flex-col gap-1 flex-1">
        <Link to="/produto/$id" params={{ id: product.id }} className="block">
          <h3 className="text-[12px] md:text-sm text-foreground line-clamp-2 min-h-[34px] leading-tight">
            {product.name}
          </h3>
        </Link>
        {freeShip && (
          <span className="self-start inline-flex items-center gap-0.5 bg-success/10 text-success text-[9px] font-bold px-1.5 py-0.5 rounded-sm border border-success/30">
            <Truck className="h-2.5 w-2.5" /> FRETE GRÁTIS
          </span>
        )}
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-[10px] text-primary font-medium">R$</span>
          <span className="text-base md:text-lg font-bold text-primary leading-none">
            {product.price.toFixed(2).replace(".", ",")}
          </span>
          {product.oldPrice && (
            <span className="text-[10px] text-muted-foreground line-through">
              {brl(product.oldPrice)}
            </span>
          )}
        </div>
        {(realCount > 0 || sold > 0) ? (
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
            {realCount > 0 ? (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-gold text-gold" /> {rating}
                <span className="text-muted-foreground/70">({realCount})</span>
              </span>
            ) : (
              <span /> /* Empty span to keep 'sold' aligned to the right if needed, or we can just leave it */
            )}
            {sold > 0 && <span>{sold} {sold === 1 ? 'vendido' : 'vendidos'}</span>}
          </div>
        ) : (
          <div className="h-[18px] mt-0.5" /> /* Placeholder para manter o tamanho do card constante */
        )}
        <Link
          to="/produto/$id"
          params={{ id: product.id }}
          aria-disabled={product.stock === 0}
          className={
            "mt-1.5 h-8 rounded-sm text-[11px] font-semibold transition-all grid place-items-center " +
            (product.stock === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
              : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95")
          }
        >
          {product.stock === 0 ? "Esgotado" : "Comprar"}
        </Link>
      </div>
    </article>
  );
}
