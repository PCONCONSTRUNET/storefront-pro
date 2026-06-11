import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, normalizeOrderStatus } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";
import { Search, Filter, CreditCard, Receipt, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/pagamentos")({
  component: Page,
});

function Page() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);

  const [filter, setFilter] = useState<"todos" | "pendentes" | "aprovados" | "cancelados">("todos");
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();

  const list = useMemo(() => {
    return orders.filter((o) => {
      const status = normalizeOrderStatus(o.status);
      
      // Filtro de botões
      if (filter === "pendentes" && status !== "aguardando_pagamento") return false;
      if (filter === "aprovados" && !["pago", "em_separacao", "saiu_para_entrega", "concluido"].includes(status)) return false;
      if (filter === "cancelados" && !["cancelado", "reembolsado", "falhou"].includes(status)) return false;

      // Busca por ID, MP ID, Nome, Email
      if (!term) return true;
      return (
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        (o.mpPaymentId || "").toLowerCase().includes(term)
      );
    }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, filter, term]);

  const StatusBadge = ({ status }: { status: string }) => {
    const norm = normalizeOrderStatus(status);
    if (["pago", "em_separacao", "saiu_para_entrega", "concluido"].includes(norm)) {
      return (
        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wide bg-success/20 text-success px-2 py-1 rounded-full">
          <CheckCircle2 className="h-3 w-3" /> Aprovado
        </span>
      );
    }
    if (["cancelado", "reembolsado", "falhou"].includes(norm)) {
      return (
        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wide bg-destructive/20 text-destructive px-2 py-1 rounded-full">
          <XCircle className="h-3 w-3" /> Cancelado
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wide bg-gold/20 text-gold px-2 py-1 rounded-full">
        <Clock className="h-3 w-3" /> Pendente
      </span>
    );
  };

  return (
    <AdminLayout title="Pagamentos">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por ID, Mercado Pago, Cliente ou Email..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1 self-start sm:self-auto overflow-x-auto max-w-full no-scrollbar">
          <Filter className="h-3.5 w-3.5 ml-2 text-muted-foreground shrink-0" />
          {(["todos", "pendentes", "aprovados", "cancelados"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-semibold transition whitespace-nowrap",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Pagamentos */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Data / Hora</th>
                <th className="px-4 py-3 font-semibold">Identificação</th>
                <th className="px-4 py-3 font-semibold">Cliente & Resumo</th>
                <th className="px-4 py-3 font-semibold text-right">Valor</th>
                <th className="px-4 py-3 font-semibold">Status do Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              ) : (
                list.map((o) => {
                  const productSummary = o.items
                    .map((it) => {
                      const p = products.find((pp) => pp.id === it.productId);
                      return `${it.quantity}x ${p?.name || it.name}`;
                    })
                    .join(", ");

                  return (
                    <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 align-top">
                        <div className="font-semibold text-foreground whitespace-nowrap">
                          {formatDate(o.createdAt).split(' ')[0]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(o.createdAt).split(' ')[1] || ""}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-1 text-muted-foreground text-xs font-mono mb-1">
                          <Receipt className="h-3 w-3" /> Pedido #{o.id.slice(0, 5).toUpperCase()}
                        </div>
                        <div className="font-mono text-xs text-foreground bg-muted inline-block px-1.5 py-0.5 rounded truncate max-w-[120px]" title={o.mpPaymentId || "Aguardando geração MP"}>
                          {o.mpPaymentId ? `MP: ${o.mpPaymentId}` : "Sem ID MP"}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 align-top max-w-[250px]">
                        <div className="font-semibold text-foreground truncate" title={o.customerName}>
                          {o.customerName}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5" title={productSummary}>
                          {productSummary}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top text-right">
                        <div className="font-bold text-foreground">
                          {brl(o.total)}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-0.5">
                          {o.paymentMethod === "pix" ? (
                            <div className="flex items-center gap-1 text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 rounded">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M11.956 0 2.215 9.74l2.585 2.586L11.956 5.17l7.155 7.156 2.585-2.586L11.956 0ZM2.215 14.26 11.956 24l9.74-9.74-2.585-2.586-7.155 7.156-7.155-7.156-2.585 2.586Z"/></svg>
                              PIX
                            </div>
                          ) : o.paymentMethod === "card" ? (
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" /> Cartão
                            </div>
                          ) : (
                            o.paymentMethod
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <StatusBadge status={o.status} />
                        {normalizeOrderStatus(o.status) === "aguardando_pagamento" && o.paymentMethod === "pix" && o.pixExpiresAt && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            Expira: {formatDate(o.pixExpiresAt)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
