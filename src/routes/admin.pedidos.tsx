import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  useStore,
  ORDER_STATUS_LABEL,
  getOrderStatusLabel,
  normalizeOrderStatus,
  normalizeDeliveryStatus,
  DELIVERY_STATUS_LABEL,
  type OrderStatus,
  type DeliveryStatus,
} from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";
import { Modal } from "@/components/AdminModal";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
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
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Hash,
  DollarSign,
  Filter,
  ListFilter,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { printOrderReceipt } from "@/lib/printReceipt";

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
  const { orders, products, updateOrderStatus, updateDeliveryStatus, deleteOrder, sync, settings } = useStore();
  useEffect(() => {
    sync();
  }, [sync]);

  const { q: initialQ } = Route.useSearch();
  const [filter, setFilter] = useState<QuickFilter>("todos");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryStatus | "">("");
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
      const status = normalizeOrderStatus(o.status);
      if (filter === "pendentes" && status !== "aguardando_pagamento")
        return false;
      if (filter === "pagos" && status !== "pago") return false;
      if (
        filter === "em_andamento" &&
        !["em_separacao", "saiu_para_entrega"].includes(status)
      )
        return false;
      if (filter === "concluidos" && status !== "concluido") return false;
      if (filter === "cancelados" && !["cancelado", "reembolsado"].includes(status))
        return false;

      if (statusFilter && status !== statusFilter) return false;
      if (
        deliveryFilter &&
        normalizeDeliveryStatus(o.deliveryStatus) !== deliveryFilter
      )
        return false;
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
  }, [orders, filter, statusFilter, deliveryFilter, methodFilter, period, term, digits]);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => normalizeOrderStatus(o.status) === "aguardando_pagamento");
    const paid = orders.filter((o) => normalizeOrderStatus(o.status) === "pago");
    const inProgress = orders.filter((o) =>
      ["em_separacao", "saiu_para_entrega"].includes(normalizeOrderStatus(o.status)),
    );
    const cancelled = orders.filter((o) =>
      ["cancelado", "reembolsado"].includes(normalizeOrderStatus(o.status)),
    );
    const revenue = orders
      .filter((o) =>
        ["pago", "em_separacao", "saiu_para_entrega", "concluido"].includes(
          normalizeOrderStatus(o.status),
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
      `Olá ${o.customerName.split(" ")[0]}! Sobre seu pedido #${String(o.id).slice(0, 5).toUpperCase()}…`,
    );
    window.open(`https://wa.me/55${phone}?text=${txt}`, "_blank");
  };

  const copy = (txt: string, label = "Copiado!") => {
    navigator.clipboard.writeText(txt);
    toast.success(label);
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <StatCard
          label="Todos"
          value={stats.total}
          icon={ListFilter}
          color="slate"
          onClick={() => setFilter("todos")}
          active={filter === "todos"}
        />
        <StatCard
          label="Pendentes"
          value={stats.pending}
          icon={Clock}
          color="amber"
          onClick={() =>
            setFilter(filter === "pendentes" ? "todos" : "pendentes")
          }
          active={filter === "pendentes"}
        />
        <StatCard
          label="Pagos"
          value={stats.paid}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => setFilter(filter === "pagos" ? "todos" : "pagos")}
          active={filter === "pagos"}
        />
        <StatCard
          label="Em andamento"
          value={stats.inProgress}
          icon={Package}
          color="blue"
          onClick={() =>
            setFilter(filter === "em_andamento" ? "todos" : "em_andamento")
          }
          active={filter === "em_andamento"}
        />
        <StatCard
          label="Cancelados"
          value={stats.cancelled}
          icon={XCircle}
          color="red"
          onClick={() =>
            setFilter(filter === "cancelados" ? "todos" : "cancelados")
          }
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
            onClick={async () => {
              setBusy(true);
              try {
                const { injectMockOrder } = await import("@/lib/cloud");
                await injectMockOrder();
                useStore.setState(s => ({ 
                  settings: { ...s.settings, cpfCnpj: s.settings?.cpfCnpj || "12.345.678/0001-90" } as any
                }));
                await sync();
                toast.success("Pedido Teste Correios gerado!");
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
            className="px-2.5 py-1 rounded-full bg-primary/20 text-primary hover:bg-primary/30 font-semibold"
          >
            Gerar Pedido Teste Correios
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
          <option value="">Pagamento: todos</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          value={deliveryFilter}
          onChange={(e) =>
            setDeliveryFilter(e.target.value as DeliveryStatus | "")
          }
          className="h-8 px-2 rounded-full bg-card border border-border"
        >
          <option value="">Entrega: todas</option>
          {(
            [
              "pendente",
              "em_separacao",
              "postado_correios",
              "saiu_para_entrega",
              "entregue",
            ] as DeliveryStatus[]
          ).map((s) => (
            <option key={s} value={s}>
              {DELIVERY_STATUS_LABEL[s]}
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
          <ul className="p-2 space-y-2">
            {list.map((o) => {
              const status = normalizeOrderStatus(o.status);
              const Icon = STATUS_ICON[status];
              const expired =
                status === "aguardando_pagamento" &&
                o.pixExpiresAt &&
                new Date(o.pixExpiresAt).getTime() < Date.now();
              return (
                <li
                  key={o.id}
                  onClick={() => setSelected(o.id)}
                  className="p-3 relative overflow-hidden rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors shadow-sm cursor-pointer"
                >
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl"
                    style={{
                      backgroundColor:
                        status === "cancelado" || status === "reembolsado" ? "#ef4444" :
                        status === "concluido" || status === "pago" ? "#22c55e" :
                        status === "saiu_para_entrega" || status === "em_separacao" ? "#3b82f6" : "#f59e0b",
                    }}
                  />
                  <div className="flex justify-between items-start gap-3 ml-2">
                    {/* Imagem do primeiro produto */}
                    {o.items?.[0] && (() => {
                      const firstProduct = products.find(p => p.id === o.items[0].productId);
                      if (firstProduct?.image) {
                        return (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                            <img src={firstProduct.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        );
                      }
                      return (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                          <Package className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      );
                    })()}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">
                          {o.customerName}
                        </span>
                        <span
                          className={`text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${STATUS_STYLE[status]}`}
                        >
                          <Icon className="h-3 w-3" />
                          {ORDER_STATUS_LABEL[status]}
                        </span>
                        <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border bg-indigo-50 text-indigo-800 border-indigo-200">
                          <Truck className="h-3 w-3" />
                          {DELIVERY_STATUS_LABEL[normalizeDeliveryStatus(o.deliveryStatus)]}
                        </span>
                        {expired && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 border border-red-200">
                            Pix expirado
                          </span>
                        )}
                        {o.deliveryMethod === "entrega" && (
                          <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                            <Package className="h-3 w-3" /> VIA CORREIOS
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

      {order && (() => {
        const paymentStatus = normalizeOrderStatus(order.status);
        const deliveryStatus = normalizeDeliveryStatus(order.deliveryStatus);
        const paymentSteps: { value: OrderStatus; label: string; icon: any }[] = [
          { value: "pago", label: "Pago", icon: CheckCircle2 },
          { value: "aguardando_pagamento", label: "Aguardando", icon: Clock },
          { value: "cancelado", label: "Cancelado", icon: XCircle },
          { value: "reembolsado", label: "Reembolsado", icon: RefreshCw },
        ];
        const deliverySteps: { value: DeliveryStatus; label: string; icon: any }[] = [
          { value: "pendente", label: "Pendente", icon: Clock },
          { value: "em_separacao", label: "Em separação", icon: Package },
          { value: "postado_correios", label: "Postado", icon: Truck },
          { value: "saiu_para_entrega", label: order.deliveryMethod === "retirada" ? "Aguardando retirada" : "Em trânsito", icon: Truck },
          { value: "entregue", label: "Entregue", icon: CheckCircle2 },
        ];
        return (
        <Modal
          onClose={() => setSelected(null)}
          title={`Pedido #${String(order.id).slice(0, 5).toUpperCase()}`}
        >
          <div className="space-y-3 text-sm">
            {/* Status header */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold border ${STATUS_STYLE[paymentStatus]}`}
              >
                {getOrderStatusLabel(order.status)}
              </span>
              <span className="text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold border bg-indigo-50 text-indigo-800 border-indigo-200">
                <Truck className="h-3 w-3" /> {DELIVERY_STATUS_LABEL[deliveryStatus]}
              </span>
              <span className="text-[11px] text-muted-foreground w-full">
                {formatDate(order.createdAt)}
                {order.paidAt && (
                  <span className="text-emerald-700"> · Pago {formatDate(order.paidAt)}</span>
                )}
              </span>
            </div>

            {/* Pagamento — quick actions */}
            <div className="rounded-xl border border-border p-2 bg-muted/30">
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide mb-1.5 px-1 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Pagamento
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {paymentSteps.map((s) => {
                  const Icon = s.icon;
                  const isCurrent = paymentStatus === s.value;
                  return (
                    <button
                      key={s.value}
                      disabled={isCurrent || busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await updateOrderStatus(order.id, s.value);
                          toast.success(`Pagamento: ${s.label}`);
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className={`h-9 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition ${
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary cursor-default"
                          : "bg-card hover:bg-primary/10 hover:border-primary/40 border-border"
                      } disabled:opacity-60`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entrega — quick actions independentes */}
            <div className="rounded-xl border border-border p-2 bg-muted/30">
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide mb-1.5 px-1 flex items-center gap-1">
                <Truck className="h-3 w-3" /> Entrega
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {deliverySteps.map((s) => {
                  const Icon = s.icon;
                  const isCurrent = deliveryStatus === s.value;
                  return (
                    <button
                      key={s.value}
                      disabled={isCurrent || busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await updateDeliveryStatus(order.id, s.value);
                          toast.success(`Entrega: ${s.label}`);
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className={`h-9 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition ${
                        isCurrent
                          ? "bg-indigo-600 text-white border-indigo-600 cursor-default"
                          : "bg-card hover:bg-indigo-500/10 hover:border-indigo-400/40 border-border"
                      } disabled:opacity-60`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {order.deliveryMethod === "entrega" && (
              <div className="rounded-xl border border-border p-3 bg-muted/30">
                <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide mb-1.5 px-1 flex items-center gap-1">
                  <Package className="h-3 w-3" /> Rastreio Correios
                </div>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Ex: AB123456789BR"
                    defaultValue={order.notes?.match(/\[RASTREIO: (.*?)\]/)?.[1] || ""}
                    id="tracking-input"
                    className="flex-1 h-9 rounded-lg border border-border px-3 text-sm bg-background focus:outline-none focus:border-primary/50"
                  />
                  <button
                    disabled={busy}
                    onClick={() => {
                      const input = document.getElementById("tracking-input") as HTMLInputElement;
                      if (!input) return;
                      const code = input.value.trim();
                      const cleanNotes = (order.notes || "").replace(/\[RASTREIO: .*?\]\n?/g, "").trim();
                      const newNotes = code ? `[RASTREIO: ${code}]\n${cleanNotes}`.trim() : cleanNotes;
                      setBusy(true);
                      try {
                        useStore.getState().updateOrderNotes(order.id, newNotes);
                        if (code && order.deliveryStatus === "em_separacao") {
                           updateDeliveryStatus(order.id, "postado_correios");
                        }
                        toast.success("Rastreio salvo!");
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {/* Cliente */}
            <div className="rounded-xl border border-border p-3 space-y-1.5">
              <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wide">
                Cliente
              </div>
              <Row icon={Mail} label="Nome">
                {order.customerName}
              </Row>
              <Row icon={Mail} label="E-mail">
                <button
                  onClick={() => copy(order.customerEmail, "E-mail copiado")}
                  className="hover:text-primary text-left truncate max-w-[180px]"
                >
                  {order.customerEmail}
                </button>
              </Row>
              <Row icon={Phone} label="Telefone">
                <span className="flex items-center gap-2">
                  {order.customerPhone}
                  <button
                    onClick={() => onWhatsApp(order)}
                    title="WhatsApp"
                    className="hover:opacity-80"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </button>
                </span>
              </Row>
              <Row
                icon={MapPin}
                label={order.deliveryMethod === "retirada" ? "Retirada" : "Endereço"}
              >
                <span className="text-right">{order.address || "—"}</span>
              </Row>
              {order.notes?.match(/\[RASTREIO: (.*?)\]/) && (
                <Row icon={Package} label="Cód. Rastreio">
                  <button
                    onClick={() => copy(order.notes?.match(/\[RASTREIO: (.*?)\]/)?.[1] || "", "Código copiado!")}
                    className="hover:text-primary font-mono text-xs"
                  >
                    {order.notes?.match(/\[RASTREIO: (.*?)\]/)?.[1]}
                  </button>
                </Row>
              )}
            </div>

            {/* Pagamento */}
            <div className="rounded-xl border border-border p-3 space-y-1.5">
              <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wide">
                Pagamento
              </div>
              <Row icon={Hash} label="ID do Pedido">
                <button
                  onClick={() => copy(order.id, "ID copiado")}
                  className="font-mono text-[10px] hover:text-primary text-right max-w-[150px] truncate"
                  title={order.id}
                >
                  {order.id}
                </button>
              </Row>
              <Row icon={CreditCard} label="Método">
                {order.paymentMethod.toUpperCase()}
              </Row>
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
              {order.pixExpiresAt && status === "aguardando_pagamento" && (
                <Row icon={Clock} label="Pix expira">
                  {formatDate(order.pixExpiresAt)}
                </Row>
              )}
            </div>

            {(order.notes || "").replace(/\[RASTREIO: .*?\]\n?/g, "").trim() && (
              <div className="p-3 rounded-xl bg-gold/10 border border-gold/30">
                <div className="text-[11px] font-bold text-gold uppercase tracking-wide mb-1">
                  Observações do cliente
                </div>
                <div className="text-sm whitespace-pre-wrap">{(order.notes || "").replace(/\[RASTREIO: .*?\]\n?/g, "").trim()}</div>
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
                        className="w-10 h-10 rounded-lg object-cover bg-muted"
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
              <div className="border-t border-border p-2.5 space-y-1 text-xs bg-muted/20">
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
                <Line
                  label="Total"
                  value={brl(order.total)}
                  className="font-bold text-primary text-sm pt-1 border-t border-border mt-1"
                />
              </div>
            </div>

            {/* Ações */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onWhatsApp(order)}
                className="h-10 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-500/20"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </button>
              <button
                onClick={() => {
                  printOrderReceipt(order, settings);
                }}
                className="h-10 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90"
              >
                <Printer className="h-4 w-4" /> Imprimir
              </button>
              {order.deliveryMethod === "entrega" && (
                <button
                  onClick={() => {
                    import("@/lib/printShippingLabel").then(m => m.printShippingLabel(order, settings));
                  }}
                  className="col-span-2 h-10 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-yellow-200"
                >
                  <Package className="h-4 w-4" /> Imprimir Declaração Correios
                </button>
              )}
              <button
                onClick={async () => {
                  const { confirmDialog } = await import("@/components/ConfirmDialog");
                  const ok = await confirmDialog({
                    title: "Excluir pedido?",
                    description: `O pedido #${String(order.id).slice(0, 5).toUpperCase()} será removido. Esta ação não pode ser desfeita.`,
                    confirmLabel: "Excluir",
                  });
                  if (ok) {
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
          </div>
        </Modal>
        );
      })()}
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
  color: "amber" | "emerald" | "blue" | "red" | "slate";
  onClick: () => void;
  active?: boolean;
}) {
  const palette: Record<string, string> = {
    amber: "from-amber-500/15 to-amber-500/5 text-amber-700 border-amber-200",
    emerald:
      "from-emerald-500/15 to-emerald-500/5 text-emerald-700 border-emerald-200",
    blue: "from-blue-500/15 to-blue-500/5 text-blue-700 border-blue-200",
    red: "from-red-500/15 to-red-500/5 text-red-700 border-red-200",
    slate: "from-slate-500/15 to-slate-500/5 text-slate-700 border-slate-200",
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
