import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";
import { Modal } from "./admin.produtos";

export const Route = createFileRoute("/admin/pedidos")({
  component: Page,
});

const statuses: OrderStatus[] = ["aguardando_pagamento", "pago", "em_separacao", "saiu_para_entrega", "concluido", "cancelado", "reembolsado"];

function Page() {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos");
  const [selected, setSelected] = useState<string | null>(null);
  const list = filter === "todos" ? orders : orders.filter(o => o.status === filter);
  const order = orders.find(o => o.id === selected);

  return (
    <AdminLayout title="Pedidos">
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
            <div><strong>Endereço:</strong> {order.address}</div>
            <div><strong>Pagamento:</strong> {order.paymentMethod.toUpperCase()}</div>
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
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
