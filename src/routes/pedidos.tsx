import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  useStore,
  useStoreHydrated,
  selectCurrentCustomer,
  getOrderStatusLabel,
  type Order,
} from "@/lib/store";
import { getDeliveryStatusLabel } from "@/lib/orderStatus";
import { StoreLayout } from "@/components/StoreLayout";
import { OrderListSkeleton } from "@/components/Skeleton";
import { ReorderModal } from "@/components/ReorderModal";
import { OrderAccentBar } from "@/components/OrderAccentBar";
import { brl, formatDate } from "@/lib/format";
import { Package, RotateCcw, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/pedidos")({
  head: () => ({ meta: [{ title: "Meus pedidos — Princesa de Laços" }] }),
  component: Page,
});

function Page() {
  const customer = useStore(selectCurrentCustomer);
  const hydrated = useStoreHydrated();
  const allOrders = useStore((s) => s.orders);
  const orders = customer
    ? allOrders.filter((o) => {
        if (o.customerId === customer.id) return true;
        const email = (customer.email || "").trim().toLowerCase();
        return (
          !!email &&
          (o.customerEmail || "").trim().toLowerCase() === email
        );
      })
    : [];

  const [reorderOrder, setReorderOrder] = useState<Order | null>(null);

  if (hydrated && !customer) {
    return (
      <StoreLayout>
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <Package className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-xl font-bold mt-3">
            Faça login para ver seus pedidos
          </h1>
          <Link
            to="/login"
            className="mt-4 inline-block bg-primary text-primary-foreground rounded-full px-6 py-3 font-semibold"
          >
            Entrar
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const openReorder = (e: React.MouseEvent, o: Order) => {
    e.preventDefault();
    e.stopPropagation();
    setReorderOrder(o);
  };

  return (
    <StoreLayout>
      <div className="max-w-3xl mx-auto px-4 py-5">
        <h1 className="text-2xl font-bold mb-4">Meus pedidos</h1>
        {!hydrated ? (
          <OrderListSkeleton />
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Você ainda não tem pedidos.
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => {
              const totalQty = o.items.reduce((s, i) => s + i.quantity, 0);
              const isPaid = o.paymentStatus === "approved";
              return (
                <li key={o.id}>
                  <Link
                    to="/pedido/$id"
                    params={{ id: o.id }}
                    className="relative block bg-card rounded-2xl shadow-card hover:shadow-soft transition-all overflow-hidden"
                  >
                    <OrderAccentBar />

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/40">
                      <div className="flex items-center gap-2 min-w-0">
                        <Package className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          #{o.id.slice(0, 8)} · {formatDate(o.createdAt)}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide shrink-0 ${
                          isPaid ? "text-primary" : "text-amber-600"
                        }`}
                      >
                        {isPaid
                          ? getDeliveryStatusLabel(o.deliveryStatus)
                          : getOrderStatusLabel(o.status)}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-border/40">
                      {o.items.slice(0, 3).map((it, idx) => (
                        <div key={idx} className="flex gap-3 px-4 py-3">
                          <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                            {it.image ? (
                              <img
                                src={it.image}
                                alt={it.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium line-clamp-2">
                              {it.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              x{it.quantity}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-semibold">
                              {brl(it.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {o.items.length > 3 && (
                        <div className="px-4 py-2 text-xs text-muted-foreground flex items-center justify-end gap-1">
                          +{o.items.length - 3} item(s)
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-muted/30 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Total de {totalQty} {totalQty === 1 ? "item" : "itens"}:
                      </span>
                      <span className="text-base font-bold text-primary">
                        {brl(o.total)}
                      </span>
                    </div>

                    <div className="px-4 pb-3">
                      <button
                        onClick={(e) => openReorder(e, o)}
                        className="w-full h-10 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" /> Comprar de novo
                      </button>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {reorderOrder && (
        <ReorderModal
          order={reorderOrder}
          onClose={() => setReorderOrder(null)}
        />
      )}
    </StoreLayout>
  );
}
