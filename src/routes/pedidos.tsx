import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  useStore,
  useStoreHydrated,
  selectCurrentCustomer,
  type Order,
} from "@/lib/store";
import {
  normalizeDeliveryStatus,
  normalizeOrderStatus,
} from "@/lib/orderStatus";
import { StoreLayout } from "@/components/StoreLayout";
import { OrderListSkeleton } from "@/components/Skeleton";
import { ReorderModal } from "@/components/ReorderModal";
import { brl } from "@/lib/format";
import {
  Package,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCcw,
  MessageCircle,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/pedidos")({
  head: () => ({ meta: [{ title: "Minhas Compras — Princesa de Laços" }] }),
  component: Page,
});

const TABS = [
  { id: "todos", label: "Tudo" },
  { id: "aguardando_pagamento", label: "A Pagar" },
  { id: "em_separacao", label: "Preparando" },
  { id: "saiu_para_entrega", label: "A caminho" },
  { id: "concluido", label: "Finalizado" },
  { id: "cancelado", label: "Cancelado" },
] as const;

type TabId = typeof TABS[number]["id"];

function StatusBadge({ o }: { o: Order }) {
  const status = normalizeOrderStatus(o.status);
  const delivery = normalizeDeliveryStatus(o.deliveryStatus);

  if (status === "cancelado") return (
    <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
      <XCircle className="w-3.5 h-3.5" /> Cancelado
    </span>
  );
  if (status === "reembolsado") return (
    <span className="flex items-center gap-1 text-orange-500 text-xs font-semibold">
      <RefreshCcw className="w-3.5 h-3.5" /> Reembolsado
    </span>
  );
  if (delivery === "entregue" || status === "concluido") return (
    <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
    </span>
  );
  if (delivery === "postado_correios") return (
    <span className="flex items-center gap-1 text-blue-600 text-xs font-semibold">
      <Truck className="w-3.5 h-3.5" /> Postado nos Correios
    </span>
  );
  if (delivery === "saiu_para_entrega") return (
    <span className="flex items-center gap-1 text-blue-600 text-xs font-semibold">
      <Truck className="w-3.5 h-3.5" /> {o.deliveryMethod === "retirada" ? "Aguardando Retirada" : "A caminho"}
    </span>
  );
  if (delivery === "em_separacao" || status === "em_separacao") return (
    <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
      <Package className="w-3.5 h-3.5" /> Preparando
    </span>
  );
  if (status === "pago") return (
    <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
      <ShieldCheck className="w-3.5 h-3.5" /> Pago
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
      <Clock className="w-3.5 h-3.5" /> A Pagar
    </span>
  );
}

function Page() {
  const customer = useStore(selectCurrentCustomer);
  const hydrated = useStoreHydrated();
  const allOrders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const settings = useStore((s) => s.settings);
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

  const [activeTab, setActiveTab] = useState<TabId>("todos");
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
            className="mt-4 inline-block bg-primary text-primary-foreground rounded-full px-6 py-2 text-sm font-medium"
          >
            Entrar
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "todos") return true;
    const status = normalizeOrderStatus(o.status);
    const delivery = normalizeDeliveryStatus(o.deliveryStatus);

    if (activeTab === "concluido") {
      return status === "concluido" || delivery === "entregue";
    }
    if (activeTab === "saiu_para_entrega") {
      return (delivery === "saiu_para_entrega" || delivery === "postado_correios") && status !== "concluido";
    }
    if (activeTab === "em_separacao") {
      return (delivery === "em_separacao" || status === "em_separacao") && status !== "concluido" && delivery !== "entregue" && delivery !== "saiu_para_entrega";
    }
    return status === activeTab;
  });

  // Counts for badge tabs
  const tabCounts: Partial<Record<TabId, number>> = {
    aguardando_pagamento: orders.filter(o => normalizeOrderStatus(o.status) === "aguardando_pagamento").length,
    saiu_para_entrega: orders.filter(o => {
      const d = normalizeDeliveryStatus(o.deliveryStatus);
      return (d === "saiu_para_entrega" || d === "postado_correios") && normalizeOrderStatus(o.status) !== "concluido";
    }).length,
  };

  const whatsapp = (settings as any)?.whatsapp || "5548999999999";

  return (
    <StoreLayout>
      <div className="bg-muted/30 min-h-screen pb-10">
        <div className="max-w-2xl mx-auto">

          {/* Tabs */}
          <div className="bg-background flex overflow-x-auto scrollbar-hide shadow-sm sticky top-14 md:top-0 z-20 border-b border-border">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = tabCounts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[90px] text-center py-3.5 text-[13px] font-medium transition-colors border-b-2 whitespace-nowrap ${
                    isActive
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-1 text-primary">({count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          <div className="mt-2 space-y-2 px-2">
            {!hydrated ? (
              <OrderListSkeleton />
            ) : filteredOrders.length === 0 ? (
              <div className="bg-background rounded-2xl p-16 text-center shadow-card mt-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Package className="h-9 w-9 text-muted-foreground" />
                </div>
                <div className="text-muted-foreground">Nenhum pedido aqui ainda</div>
              </div>
            ) : (
              filteredOrders
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((o) => {
                const status = normalizeOrderStatus(o.status);
                const delivery = normalizeDeliveryStatus(o.deliveryStatus);
                const isConcluido = status === "concluido" || delivery === "entregue";
                const isACaminho = (delivery === "saiu_para_entrega" || delivery === "postado_correios") && !isConcluido;
                const isPending = status === "aguardando_pagamento";
                // Show only up to 2 items in the card, rest collapsed
                const visibleItems = o.items.slice(0, 2);
                const extraCount = o.items.length - 2;

                return (
                  <div key={o.id} className="bg-background rounded-2xl shadow-card overflow-hidden">
                    {/* Store header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Loja
                        </span>
                        <span className="font-semibold text-sm">{(settings as any)?.storeName || "Princesa de Laços"}</span>
                      </div>
                      <StatusBadge o={o} />
                    </div>

                    {/* Items - clickable */}
                    <Link to="/pedido/$id" params={{ id: o.id }} className="block">
                      <div className="px-4 py-3 space-y-3">
                        {visibleItems.map((it, idx) => {
                          const p = products.find(prod => prod.id === it.productId);
                          return (
                            <div key={idx} className="flex gap-3 items-start">
                              <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                                {it.image ? (
                                  <img src={it.image} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full grid place-items-center">
                                    <Package className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                                  {it.name}
                                </div>
                                {it.variation && (
                                  <div className="text-xs text-muted-foreground mt-0.5">{it.variation}</div>
                                )}
                                <div className="text-xs text-muted-foreground mt-0.5">x{it.quantity}</div>
                              </div>
                              <div className="text-sm font-semibold text-primary shrink-0">
                                {brl(it.price)}
                              </div>
                            </div>
                          );
                        })}
                        {extraCount > 0 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            + {extraCount} outro{extraCount > 1 ? "s" : ""} item{extraCount > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          {o.items.reduce((s, i) => s + i.quantity, 0)} {o.items.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "itens"}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">Total:</span>
                          <span className="text-lg font-bold text-primary">{brl(o.total)}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="px-4 py-3 border-t border-border bg-muted/20 flex flex-wrap gap-2 justify-end">
                      {isPending && (
                        <Link
                          to="/pedido/$id"
                          params={{ id: o.id }}
                          className="bg-primary text-primary-foreground px-5 py-2 text-sm rounded-full font-semibold shadow-sm hover:opacity-90 transition-opacity"
                        >
                          Pagar Agora
                        </Link>
                      )}
                      {(isConcluido || status === "cancelado") && (
                        <button
                          onClick={(e) => { e.preventDefault(); setReorderOrder(o); }}
                          className="flex items-center gap-1.5 border border-primary text-primary px-4 py-2 text-sm rounded-full font-semibold hover:bg-primary/5 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Comprar Novamente
                        </button>
                      )}
                      <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 border border-border text-foreground px-4 py-2 text-sm rounded-full font-medium hover:bg-muted transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Falar com Vendedor
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
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
