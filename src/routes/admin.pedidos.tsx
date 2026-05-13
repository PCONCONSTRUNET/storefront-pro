import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useStore, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";
import { Modal } from "./admin.produtos";
import {
  Search,
  X,
  Copy,
  Printer,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Truck,
  RefreshCw,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Hash,
  DollarSign,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/pedidos")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: Page,
});

const statuses: OrderStatus[] = [
  "aguardando_pagamento",
  "pago",
  "em_separacao",
  "saiu_para_entrega",
  "concluido",
  "cancelado",
  "reembolsado",
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  aguardando_pagamento: "bg-amber-100 text-amber-800 border-amber-200",
  pago: "bg-emerald-100 text-emerald-800 border-emerald-200",
  em_separacao: "bg-blue-100 text-blue-800 border-blue-200",
  saiu_para_entrega: "bg-indigo-100 text-indigo-800 border-indigo-200",
  concluido: "bg-green-100 text-green-800 border-green-200",
  cancelado: "bg-red-100 text-red-800 border-red-200",
  reembolsado: "bg-slate-200 text-slate-800 border-slate-300",
};

const STATUS_ICON: Record<OrderStatus, any> = {
  aguardando_pagamento: Clock,
  pago: CheckCircle2,
  em_separacao: Package,
  saiu_para_entrega: Truck,
  concluido: CheckCircle2,
  cancelado: XCircle,
  reembolsado: RefreshCw,
};

type QuickFilter =
  | "todos"
  | "pendentes"
  | "pagos"
  | "em_andamento"
  | "concluidos"
  | "cancelados";

function Page() {
  const { orders, updateOrderStatus, deleteOrder, sync, settings } = useStore();
  useEffect(() => {
    sync();
  }, [sync]);

  const { q: initialQ } = Route.useSearch();
  const [filter, setFilter] = useState<QuickFilter>("todos");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [period, setPeriod] = useState<"todos" | "hoje" | "7d" | "30d">(
    "todos",
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQ);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setQuery(initialQ);
    if (initialQ) setFilter("todos");
  }, [initialQ]);

  const term = query.trim().toLowerCase();
  const digits = term.replace(/\D/g, "");

  const list = useMemo(() => {
    const now = Date.now();
    const periodMs =
      period === "hoje"
        ? 86400000
        : period === "7d"
          ? 7 * 86400000
          : period === "30d"
            ? 30 * 86400000
            : 0;

    return orders.filter((o) => {
      if (filter === "pendentes" && o.status !== "aguardando_pagamento")
        return false;
      if (filter === "pagos" && o.status !== "pago") return false;
      if (
        filter === "em_andamento" &&
        !["em_separacao", "saiu_para_entrega"].includes(o.status)
      )
        return false;
      if (filter === "concluidos" && o.status !== "concluido") return false;
      if (filter === "cancelados" && !["cancelado", "reembolsado"].includes(o.status))
        return false;

      if (statusFilter && o.status !== statusFilter) return false;
      if (methodFilter && o.paymentMethod !== methodFilter) return false;

      if (periodMs && now - new Date(o.createdAt).getTime() > periodMs)
        return false;

      if (!term) return true;
      return (
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        (digits && o.customerPhone.replace(/\D/g, "").includes(digits)) ||
        (o.mpPaymentId || "").toLowerCase().includes(term)
      );
    });
  }, [orders, filter, statusFilter, methodFilter, period, term, digits]);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "aguardando_pagamento");
    const paid = orders.filter((o) => o.status === "pago");
    const inProgress = orders.filter((o) =>
      ["em_separacao", "saiu_para_entrega"].includes(o.status),
    );
    const cancelled = orders.filter((o) =>
      ["cancelado", "reembolsado"].includes(o.status),
    );
    const revenue = orders
      .filter((o) =>
        ["pago", "em_separacao", "saiu_para_entrega", "concluido"].includes(
          o.status,
        ),
      )
      .reduce((a, o) => a + o.total, 0);
    return {
      total: orders.length,
      pending: pending.length,
      paid: paid.length,
      inProgress: inProgress.length,
      cancelled: cancelled.length,
      revenue,
    };
  }, [orders]);

  const order = orders.find((o) => o.id === selected);

  const onWhatsApp = (o: typeof orders[number]) => {
    const phone = o.customerPhone.replace(/\D/g, "");
    const txt = encodeURIComponent(
      `Olá ${o.customerName.split(" ")[0]}! Sobre seu pedido #${String(o.id).slice(0, 8)}…`,
    );
    window.open(`https://wa.me/55${phone}?text=${txt}`, "_blank");
  };

  const copy = (txt: string, label = "Copiado!") => {
    navigator.clipboard.writeText(txt);
    toast.success(label);
  };

  const simulateApprove = async (id: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke(
        "mp-simulate-approve",
        { body: { order_id: id } },
      );
      if (error) throw error;
      toast.success("Pedido aprovado (sandbox)");
      await sync();
    } catch (e: any) {
      toast.error("Falha ao aprovar: " + (e?.message || ""));
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const header = [
      "id",
      "data",
      "cliente",
      "telefone",
      "email",
      "metodo",
      "entrega",
      "status",
      "subtotal",
      "frete",
      "desconto",
      "total",
      "pago_em",
      "mp_id",
    ];
    const rows = list.map((o) => [
      o.id,
      o.createdAt,
      o.customerName,
      o.customerPhone,
      o.customerEmail,
      o.paymentMethod,
      o.deliveryMethod,
      o.status,
      o.subtotal,
      o.shipping,
      o.discount,
      o.total,
      o.paidAt || "",
      o.mpPaymentId || "",
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r
          .map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Pedidos">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <StatCard
          label="Pendentes"
          value={stats.pending}
          icon={Clock}
          color="amber"
          onClick={() => setFilter("pendentes")}
          active={filter === "pendentes"}
        />
        <StatCard
          label="Pagos"
          value={stats.paid}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => setFilter("pagos")}
          active={filter === "pagos"}
        />
        <StatCard
          label="Em andamento"
          value={stats.inProgress}
          icon={Package}
          color="blue"
          onClick={() => setFilter("em_andamento")}
          active={filter === "em_andamento"}
        />
        <StatCard
          label="Cancelados"
          value={stats.cancelled}
          icon={XCircle}
          color="red"
          onClick={() => setFilter("cancelados")}
          active={filter === "cancelados"}
        />
      </div>

      <div className="bg-card rounded-2xl shadow-card p-3 mb-3 flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
          <DollarSign className="h-3.5 w-3.5" /> Faturamento confirmado:{" "}
          {brl(stats.revenue)}
        </div>
        <div className="text-muted-foreground">
          Mostrando {list.length} de {stats.total}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => sync()}
            className="px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
          <button
            onClick={exportCsv}
            className="px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 font-semibold"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="relative mb-2">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por ID, nome, telefone, email ou MP ID"
          className="w-full h-10 pl-9 pr-9 rounded-full bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Limpar"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3 items-center text-xs">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as OrderStatus | "")
          }
          className="h-8 px-2 rounded-full bg-card border border-border"
        >
          <option value="">Status: todos</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-8 px-2 rounded-full bg-card border border-border"
        >
          <option value="">Pagamento: todos</option>
          <option value="pix">Pix</option>
          <option value="card">Cartão</option>
          <option value="cash">Dinheiro</option>
        </select>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="h-8 px-2 rounded-full bg-card border border-border"
        >
          <option value="todos">Período: todos</option>
          <option value="hoje">Últimas 24h</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {list.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Nenhum pedido encontrado.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((o) => {
              const Icon = STATUS_ICON[o.status];
              const expired =
                o.status === "aguardando_pagamento" &&
                o.pixExpiresAt &&
                new Date(o.pixExpiresAt).getTime() < Date.now();
              return (
                <li
                  key={o.id}
                  onClick={() => setSelected(o.id)}
                  className="p-3 hover:bg-muted/40 cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">
                          #{String(o.id).slice(0, 8)} · {o.customerName}
                        </span>
                        <span
                          className={`text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${STATUS_STYLE[o.status]}`}
                        >
                          <Icon className="h-3 w-3" />
                          {ORDER_STATUS_LABEL[o.status]}
                        </span>
                        {expired && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 border border-red-200">
                            Pix expirado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>{formatDate(o.createdAt)}</span>
                        <span>{o.items.length} itens</span>
                        <span className="uppercase">{o.paymentMethod}</span>
                        <span>
                          {o.deliveryMethod === "retirada"
                            ? "Retirada"
                            : "Entrega"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-primary text-sm">
                        {brl(o.total)}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {order && (
        <Modal
          onClose={() => setSelected(null)}
          title={`Pedido #${String(order.id).slice(0, 8)}`}
        >
          <div className="space-y-3 text-sm">
            {/* Status badge + actions */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold border ${STATUS_STYLE[order.status]}`}
              >
                {ORDER_STATUS_LABEL[order.status]}
              </span>
              {order.paidAt && (
                <span className="text-[11px] text-emerald-700">
                  Pago em {formatDate(order.paidAt)}
                </span>
              )}
            </div>

            {/* Cliente */}
            <div className="rounded-xl border border-border p-3 space-y-1.5">
              <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wide">
                Cliente
              </div>
              <Row icon={Hash} label="ID">
                <button
                  onClick={() => copy(order.id, "ID copiado")}
                  className="font-mono text-xs hover:text-primary inline-flex items-center gap-1"
                >
                  {String(order.id).slice(0, 8)}…
                  <Copy className="h-3 w-3" />
                </button>
              </Row>
              <Row icon={Mail} label="Nome">
                {order.customerName}
              </Row>
              <Row icon={Mail} label="E-mail">
                <button
                  onClick={() => copy(order.customerEmail, "E-mail copiado")}
                  className="hover:text-primary text-left"
                >
                  {order.customerEmail}
                </button>
              </Row>
              <Row icon={Phone} label="Telefone">
                <span className="flex items-center gap-2">
                  {order.customerPhone}
                  <button
                    onClick={() => onWhatsApp(order)}
                    className="text-emerald-600 hover:text-emerald-700"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </span>
              </Row>
              <Row icon={MapPin} label={order.deliveryMethod === "retirada" ? "Retirada" : "Endereço"}>
                <span className="text-right">{order.address || "—"}</span>
              </Row>
            </div>

            {/* Pagamento */}
            <div className="rounded-xl border border-border p-3 space-y-1.5">
              <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wide">
                Pagamento
              </div>
              <Row icon={CreditCard} label="Método">
                {order.paymentMethod.toUpperCase()}
              </Row>
              {order.paymentStatus && (
                <Row icon={CheckCircle2} label="Status MP">
                  {order.paymentStatus}
                </Row>
              )}
              {order.mpPaymentId && (
                <Row icon={Hash} label="MP ID">
                  <button
                    onClick={() => copy(order.mpPaymentId!, "MP ID copiado")}
                    className="font-mono text-xs hover:text-primary inline-flex items-center gap-1"
                  >
                    {order.mpPaymentId}
                    <Copy className="h-3 w-3" />
                  </button>
                </Row>
              )}
              {order.pixExpiresAt && (
                <Row icon={Clock} label="Pix expira">
                  {formatDate(order.pixExpiresAt)}
                </Row>
              )}
            </div>

            {order.notes && (
              <div className="p-3 rounded-xl bg-gold/10 border border-gold/30">
                <div className="text-[11px] font-bold text-gold uppercase tracking-wide mb-1">
                  📝 Observações do cliente
                </div>
                <div className="text-sm whitespace-pre-wrap">{order.notes}</div>
              </div>
            )}

            {/* Itens */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-3 py-2 bg-muted/40 text-[11px] font-bold uppercase text-muted-foreground tracking-wide">
                Itens ({order.items.length})
              </div>
              <ul className="divide-y divide-border">
                {order.items.map((it) => (
                  <li
                    key={it.productId}
                    className="p-2.5 flex items-center gap-2.5"
                  >
                    {it.image && (
                      <img
                        src={it.image}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-muted"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {it.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {it.quantity}× {brl(it.price)}
                      </div>
                    </div>
                    <div className="font-semibold text-sm">
                      {brl(it.price * it.quantity)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Totais */}
            <div className="rounded-xl border border-border p-3 space-y-1 text-sm">
              <Line label="Subtotal" value={brl(order.subtotal)} />
              {order.discount > 0 && (
                <Line
                  label="Desconto"
                  value={`- ${brl(order.discount)}`}
                  className="text-emerald-700"
                />
              )}
              {order.shipping > 0 && (
                <Line label="Frete" value={brl(order.shipping)} />
              )}
              <div className="h-px bg-border my-1" />
              <Line
                label="Total"
                value={brl(order.total)}
                className="font-bold text-primary text-base"
              />
            </div>

            {/* Alterar status */}
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Alterar status
              </span>
              <select
                value={order.status}
                onChange={(e) => {
                  updateOrderStatus(order.id, e.target.value as OrderStatus);
                  toast.success("Status atualizado");
                }}
                className="mt-1 w-full h-11 px-3 rounded-xl bg-muted"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>

            {/* Ações */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onWhatsApp(order)}
                className="h-10 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-500/20"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </button>
              <button
                onClick={() => window.print()}
                className="h-10 rounded-full bg-muted font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Imprimir
              </button>
              {order.status === "aguardando_pagamento" && (
                <button
                  disabled={busy}
                  onClick={() => simulateApprove(order.id)}
                  className="h-10 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 col-span-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Marcar como pago
                  (sandbox)
                </button>
              )}
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Excluir o pedido #${String(order.id).slice(0, 8)}? Esta ação não pode ser desfeita.`,
                    )
                  ) {
                    deleteOrder(order.id);
                    setSelected(null);
                    toast.success("Pedido excluído");
                  }
                }}
                className="h-10 rounded-full bg-destructive/10 text-destructive font-semibold text-xs flex items-center justify-center gap-1.5 col-span-2 hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4" /> Excluir pedido
              </button>
            </div>

            <div className="text-[10px] text-muted-foreground text-center pt-2">
              Criado em {formatDate(order.createdAt)} ·{" "}
              {settings?.storeName || "Loja"}
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  onClick,
  active,
}: {
  label: string;
  value: number;
  icon: any;
  color: "amber" | "emerald" | "blue" | "red";
  onClick: () => void;
  active?: boolean;
}) {
  const palette: Record<string, string> = {
    amber: "from-amber-500/15 to-amber-500/5 text-amber-700 border-amber-200",
    emerald:
      "from-emerald-500/15 to-emerald-500/5 text-emerald-700 border-emerald-200",
    blue: "from-blue-500/15 to-blue-500/5 text-blue-700 border-blue-200",
    red: "from-red-500/15 to-red-500/5 text-red-700 border-red-200",
  };
  return (
    <button
      onClick={onClick}
      className={`text-left p-3 rounded-2xl border bg-gradient-to-br shadow-sm transition ${palette[color]} ${active ? "ring-2 ring-primary/40" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
          {label}
        </div>
        <Icon className="h-4 w-4 opacity-70" />
      </div>
      <div className="text-2xl font-bold mt-0.5">{value}</div>
    </button>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-right text-foreground">{children}</div>
    </div>
  );
}

function Line({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
