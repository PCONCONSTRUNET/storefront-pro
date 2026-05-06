import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin/financeiro")({
  component: Page,
});

function Page() {
  const orders = useStore(s => s.orders);
  const totals = useMemo(() => {
    const paid = orders.filter(o => ["pago", "em_separacao", "saiu_para_entrega", "concluido"].includes(o.status));
    const pending = orders.filter(o => o.status === "aguardando_pagamento");
    const refunded = orders.filter(o => o.status === "reembolsado");
    return {
      receita: paid.reduce((a, o) => a + o.total, 0),
      pendente: pending.reduce((a, o) => a + o.total, 0),
      saidas: refunded.reduce((a, o) => a + o.total, 0),
      caixa: paid.reduce((a, o) => a + o.total, 0) - refunded.reduce((a, o) => a + o.total, 0),
    };
  }, [orders]);

  const cards = [
    { label: "Entradas", value: brl(totals.receita), icon: TrendingUp, color: "text-success" },
    { label: "Pendentes", value: brl(totals.pendente), icon: Wallet, color: "text-gold" },
    { label: "Saídas", value: brl(totals.saidas), icon: TrendingDown, color: "text-destructive" },
    { label: "Caixa", value: brl(totals.caixa), icon: Wallet, color: "text-primary" },
  ];

  return (
    <AdminLayout title="Financeiro">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {cards.map(c => (
          <div key={c.label} className="bg-card rounded-2xl p-4 shadow-card">
            <c.icon className={`h-5 w-5 ${c.color}`} />
            <div className="text-xl font-bold mt-2">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-bold">Movimentações</div>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Sem movimentações.</div>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map(o => (
              <li key={o.id} className="p-4 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-sm">#{o.id} · {o.customerName}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</div>
                </div>
                <div className={`font-bold ${o.status === "reembolsado" ? "text-destructive" : "text-success"}`}>
                  {o.status === "reembolsado" ? "− " : "+ "}{brl(o.total)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
