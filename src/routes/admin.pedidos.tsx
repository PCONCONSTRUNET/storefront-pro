import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";
import { Modal } from "./admin.produtos";
import { Search, X } from "lucide-react";

export const Route = createFileRoute("/admin/pedidos")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  component: Page,
});

const statuses: OrderStatus[] = ["aguardando_pagamento", "pago", "em_separacao", "saiu_para_entrega", "concluido", "cancelado", "reembolsado"];

function Page() {
  const { orders, updateOrderStatus, deleteOrder } = useStore();
  const { q: initialQ } = Route.useSearch();
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos");
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQ);
  useEffect(() => { setQuery(initialQ); if (initialQ) setFilter("todos"); }, [initialQ]);
  const term = query.trim().toLowerCase();
  const digits = term.replace(/\D/g, "");
  const list = orders.filter(o => {
    if (filter !== "todos" && o.status !== filter) return false;
    if (!term) return true;
    return o.id.toLowerCase().includes(term)
      || o.customerName.toLowerCase().includes(term)
      || o.customerEmail.toLowerCase().includes(term)
      || (digits && o.customerPhone.replace(/\D/g, "").includes(digits));
  });
  const order = orders.find(o => o.id === selected);

  return (
    <AdminLayout title="Pedidos">
      <div className="relative mb-3">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por ID, nome ou telefone"
          className="w-full h-10 pl-9 pr-9 rounded-full bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Limpar" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {(["todos", ...statuses] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${filter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
            {s === "todos" ? "Todos" : ORDER_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {list.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">Nenhum pedido.</div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map(o => (
              <li key={o.id} onClick={() => setSelected(o.id)} className="p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">#{o.id} · {o.customerName}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(o.createdAt)} · {o.items.length} itens</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-primary">{brl(o.total)}</div>
                    <span className="text-[10px] inline-block mt-1 bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold">{ORDER_STATUS_LABEL[o.status]}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {order && (
        <Modal onClose={() => setSelected(null)} title={`Pedido #${order.id}`}>
          <div className="space-y-3 text-sm">
            <div><strong>Cliente:</strong> {order.customerName}</div>
            <div><strong>Contato:</strong> {order.customerEmail} · {order.customerPhone}</div>
            <div><strong>{order.deliveryMethod === "retirada" ? "Retirada no ateliê" : "Endereço"}:</strong> {order.address}</div>
            <div><strong>Pagamento:</strong> {order.paymentMethod.toUpperCase()}</div>
            {order.notes && (
              <div className="p-3 rounded-xl bg-gold/10 border border-gold/30">
                <div className="text-[11px] font-bold text-gold uppercase tracking-wide mb-1">📝 Observações do cliente</div>
                <div className="text-sm whitespace-pre-wrap">{order.notes}</div>
              </div>
            )}
            <hr className="border-border" />
            <ul className="space-y-2">
              {order.items.map(it => (
                <li key={it.productId} className="flex justify-between gap-2">
                  <span>{it.quantity}× {it.name}</span>
                  <span className="font-semibold">{brl(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <hr className="border-border" />
            <div className="flex justify-between font-bold"><span>Total</span><span className="text-primary">{brl(order.total)}</span></div>
            <label className="block mt-4">
              <span className="text-xs font-medium text-muted-foreground">Alterar status</span>
              <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                className="mt-1 w-full h-11 px-3 rounded-xl bg-muted">
                {statuses.map(s => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
              </select>
            </label>
            <button onClick={() => window.print()} className="w-full h-10 rounded-full bg-muted font-semibold">Imprimir guia</button>
            <button
              onClick={() => {
                if (confirm(`Excluir o pedido #${order.id}? Esta ação não pode ser desfeita.`)) {
                  deleteOrder(order.id);
                  setSelected(null);
                }
              }}
              className="w-full h-10 rounded-full bg-destructive/10 text-destructive font-semibold hover:bg-destructive/20 transition-colors"
            >
              Excluir pedido
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
