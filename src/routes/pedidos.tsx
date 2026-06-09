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
  MessageSquare,
  Store,
  Truck,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/pedidos")({
  head: () => ({ meta: [{ title: "Minhas Compras — Princesa de Laços" }] }),
  component: Page,
});

const TABS = [
  { id: "todos", label: "Tudo" },
  { id: "aguardando_pagamento", label: "A Pagar" },
  { id: "em_separacao", label: "Preparando" },
  { id: "saiu_para_entrega", label: "Retirada" },
  { id: "concluido", label: "Finalizado" },
  { id: "cancelado", label: "Cancelado" },
] as const;

type TabId = typeof TABS[number]["id"];

function Page() {
  const customer = useStore(selectCurrentCustomer);
  const hydrated = useStoreHydrated();
  const allOrders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
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
            className="mt-4 inline-block bg-[#ee4d2d] text-white rounded px-6 py-2 text-sm font-medium"
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
      return delivery === "saiu_para_entrega" && status !== "concluido" && delivery !== "entregue";
    }
    if (activeTab === "em_separacao") {
      return (delivery === "em_separacao" || status === "em_separacao") && status !== "concluido" && delivery !== "entregue" && delivery !== "saiu_para_entrega";
    }
    return status === activeTab;
  });

  const getStatusText = (o: Order) => {
    const status = normalizeOrderStatus(o.status);
    const delivery = normalizeDeliveryStatus(o.deliveryStatus);
    
    if (status === "cancelado") return { text: "CANCELADO", deliveryText: "Pedido cancelado", color: "text-[#ee4d2d]", icon: false };
    if (status === "reembolsado") return { text: "REEMBOLSO", deliveryText: "Pedido reembolsado", color: "text-[#ee4d2d]", icon: false };
    if (delivery === "entregue" || status === "concluido") return { text: "FINALIZADO", deliveryText: "Pedido entregue / finalizado com sucesso", color: "text-[#ee4d2d]", icon: true };
    if (delivery === "saiu_para_entrega") return { text: "AGUARDANDO RETIRADA", deliveryText: "Aguardando retirada no ateliê", color: "text-[#ee4d2d]", icon: true };
    if (delivery === "em_separacao" || status === "em_separacao") return { text: "PREPARANDO", deliveryText: "O vendedor está preparando seu pedido", color: "text-[#26aa99]", icon: true };
    if (status === "pago") return { text: "PAGO", deliveryText: "Pagamento confirmado", color: "text-[#26aa99]", icon: false };
    return { text: "A PAGAR", deliveryText: "Aguardando pagamento", color: "text-[#ee4d2d]", icon: false };
  };

  return (
    <StoreLayout>
      <div className="bg-[#f5f5f5] min-h-screen pb-10">
        <div className="max-w-5xl mx-auto pt-4">
          
          {/* Tabs */}
          <div className="bg-white flex overflow-x-auto scrollbar-hide shadow-sm sticky top-14 md:top-0 z-20">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              // Add a count badge just like Shopee does for some tabs (mocking for "A caminho")
              const count = tab.id === "saiu_para_entrega" ? orders.filter(o => normalizeDeliveryStatus(o.deliveryStatus) === "saiu_para_entrega").length : 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] text-center py-4 text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? "text-[#ee4d2d] border-[#ee4d2d]"
                      : "text-gray-700 border-transparent hover:text-[#ee4d2d]"
                  }`}
                >
                  {tab.label} {count > 0 && <span className="text-[#ee4d2d]">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          <div className="mt-3">
            {!hydrated ? (
              <div className="px-4"><OrderListSkeleton /></div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white p-20 text-center shadow-sm">
                <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
                <div className="text-gray-500 text-lg">Ainda não há pedidos</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((o) => {
                  const meta = getStatusText(o);
                  const isConcluido = normalizeOrderStatus(o.status) === "concluido" || normalizeDeliveryStatus(o.deliveryStatus) === "entregue";
                  const isACaminho = normalizeDeliveryStatus(o.deliveryStatus) === "saiu_para_entrega" && !isConcluido;

                  return (
                    <div key={o.id} className="bg-white shadow-sm">
                      {/* Header */}
                      <div className="flex items-center justify-between p-3 md:px-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Indicado
                          </span>
                          <span className="font-bold text-sm text-gray-800">Princesa de Laços</span>
                          <button className="bg-[#ee4d2d] text-white flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ml-1">
                            <MessageSquare className="w-3 h-3" /> Chat
                          </button>
                          <Link
                            to="/"
                            className="border border-gray-300 text-[10px] px-2 py-0.5 rounded text-gray-600 flex items-center gap-1 hover:bg-gray-50"
                          >
                            <Store className="w-3 h-3" /> Ver Página Da Loja
                          </Link>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className={`hidden md:flex items-center gap-1.5 ${meta.icon ? "text-[#26aa99]" : "text-gray-500"}`}>
                            {meta.icon && <Truck className="w-4 h-4" />}
                            <span className="text-sm">{meta.deliveryText}</span>
                            <HelpCircle className="w-3 h-3 text-gray-400" />
                          </div>
                          <div className="hidden md:block w-px h-4 bg-gray-300"></div>
                          <span className={`uppercase font-medium ${meta.color}`}>
                            {meta.text}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <Link to="/pedido/$id" params={{ id: o.id }} className="block">
                        {o.items.map((it, idx) => {
                          const p = products.find(prod => prod.id === it.productId);
                          return (
                            <div key={idx} className="flex gap-3 p-3 md:px-6 bg-[#fafafa] border-b border-white">
                              <div className="w-20 h-20 shrink-0 border border-gray-200 bg-white p-1">
                                {it.image ? (
                                  <img src={it.image} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full grid place-items-center bg-gray-100">
                                    <Package className="w-6 h-6 text-gray-300"/>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <div>
                                  <div className="text-sm text-gray-800 line-clamp-2 leading-snug">
                                    {it.name}
                                  </div>
                                  {p?.category && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Variação: {p.category}
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-gray-800">x{it.quantity}</div>
                              </div>
                              <div className="flex items-center">
                                <span className="text-[#ee4d2d] text-sm md:text-base">{brl(it.price)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </Link>

                      {/* Total */}
                      <div className="p-4 md:px-6 bg-[#fffefb] border-b border-gray-100 flex justify-end items-center">
                        <span className="text-sm text-gray-600 mr-2 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-[#ee4d2d]"/>
                          Total do Pedido:
                        </span>
                        <span className="text-xl md:text-2xl text-[#ee4d2d] font-medium">{brl(o.total)}</span>
                      </div>

                      {/* Actions */}
                      <div className="p-4 md:px-6 bg-[#fffefb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-xs text-gray-500">
                          {isConcluido ? "Esperando pelo vendedor dar uma classificação a você" : "Só confirme o recebimento depois de verificar os itens recebidos"}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          {normalizeOrderStatus(o.status) === "aguardando_pagamento" && (
                            <Link
                              to="/pedido/$id"
                              params={{ id: o.id }}
                              className="bg-[#ee4d2d] text-white px-5 py-2 text-sm rounded shadow-sm hover:bg-[#d73211] transition-colors whitespace-nowrap"
                            >
                              Pagar Agora
                            </Link>
                          )}
                          {isACaminho && (
                            <button className="bg-[#ee4d2d] text-white px-5 py-2 text-sm rounded shadow-sm hover:bg-[#d73211] transition-colors whitespace-nowrap">
                              Pedido Recebido
                            </button>
                          )}
                          {(isConcluido || normalizeOrderStatus(o.status) === "cancelado") && (
                            <button 
                              onClick={(e) => { e.preventDefault(); setReorderOrder(o); }}
                              className="bg-[#ee4d2d] text-white px-5 py-2 text-sm rounded shadow-sm hover:bg-[#d73211] transition-colors whitespace-nowrap"
                            >
                              Comprar Novamente
                            </button>
                          )}
                          <button className="border border-gray-300 px-4 py-2 text-sm text-gray-700 rounded hover:bg-gray-50 transition-colors whitespace-nowrap">
                            Reportar Problema
                          </button>
                          <a 
                            href={`https://wa.me/5565984489626`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="border border-gray-300 px-4 py-2 text-sm text-gray-700 rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
                          >
                            Falar Com Vendedor
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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


