import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  normalizeOrderStatus,
  useStore,
  type Transaction,
  type TransactionCategory,
  type TransactionKind,
} from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Trash2,
  X,
  Filter,
  Users,
  ShoppingBag,
  Pencil,
  Download,
  FileText,
  Share,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { downloadCSV, downloadPDF } from "@/lib/export";

export const Route = createFileRoute("/admin/financeiro")({
  component: Page,
});

type RowKind = "pedido" | "comissao" | "manual";
type Row = {
  id: string;
  date: string;
  description: string;
  meta?: string;
  amount: number;
  isOut: boolean;
  kind: RowKind;
  status?: string;
  affiliateName?: string;
  txRef?: Transaction;
  affiliateSaleId?: string;
  customerEmail?: string;
  mpPaymentId?: string;
  isCompleted: boolean;
};

const CATEGORY_LABEL: Record<TransactionCategory, string> = {
  venda: "Venda manual",
  comissao_afiliada: "Comissão afiliada",
  fornecedor: "Fornecedor",
  marketing: "Marketing",
  operacional: "Operacional",
  outros: "Outros",
};

function Page() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const affiliates = useStore((s) => s.affiliates);
  const affiliateSales = useStore((s) => s.affiliateSales);
  const transactions = useStore((s) => s.transactions);
  const addTransaction = useStore((s) => s.addTransaction);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const deleteAffiliateSale = useStore((s) => s.deleteAffiliateSale);
  const sync = useStore((s) => s.sync);

  useEffect(() => {
    sync();
  }, [sync]);

  const [filter, setFilter] = useState<"todos" | "entrada" | "saida">("todos");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const [viewingRow, setViewingRow] = useState<Row | null>(null);

  type DateFilter = "hoje" | "7d" | "30d" | "mes" | "custom";
  const [dateFilter, setDateFilter] = useState<DateFilter>("30d");

  const todayISO = new Date().toISOString().slice(0, 10);
  const monthAgoISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  })();
  const [reportFrom, setReportFrom] = useState(monthAgoISO);
  const [reportTo, setReportTo] = useState(todayISO);

  useEffect(() => {
    if (dateFilter !== "custom") {
      const start = new Date();
      if (dateFilter === "hoje") {
      } else if (dateFilter === "7d") {
        start.setDate(start.getDate() - 6);
      } else if (dateFilter === "30d") {
        start.setDate(start.getDate() - 29);
      } else if (dateFilter === "mes") {
        start.setDate(1);
      }
      setReportFrom(start.toISOString().slice(0, 10));
      setReportTo(todayISO);
    }
  }, [dateFilter, todayISO]);

  const rows: Row[] = useMemo(() => {
    const list: Row[] = [];

    orders.forEach((o) => {
      const status = normalizeOrderStatus(o.status);
      const isPaid = [
        "pago",
        "em_separacao",
        "saiu_para_entrega",
        "concluido",
      ].includes(status);
      const isRefund = status === "reembolsado";
      const productSummary = o.items
        .map((it) => {
          const p = products.find((pp) => pp.id === it.productId);
          return `${it.quantity}× ${p?.name || it.productId}`;
        })
        .join(", ");
      list.push({
        id: `order-${o.id}`,
        date: o.createdAt,
        description: `Pedido #${o.id.slice(0, 5).toUpperCase()} · ${o.customerName}`,
        meta: productSummary,
        amount: o.total,
        isOut: isRefund,
        kind: "pedido",
        status,
        customerEmail: o.customerEmail,
        mpPaymentId: o.mpPaymentId,
        isCompleted: isPaid || isRefund,
      });
    });

    affiliateSales
      .forEach((s) => {
        const aff = affiliates.find((a) => a.id === s.affiliateId);
        const isCompleted = s.status === "confirmada";
        list.push({
          id: `affsale-${s.id}`,
          date: s.createdAt,
          description: `Venda afiliada · ${s.customerName}`,
          meta: `${s.productDescription} · por ${aff?.name || "—"}`,
          amount: s.saleValue,
          isOut: false,
          kind: "comissao",
          affiliateName: aff?.name,
          affiliateSaleId: s.id,
          status: s.status,
          isCompleted,
        });
        if (s.commissionEarned > 0) {
          list.push({
            id: `affcom-${s.id}`,
            date: s.createdAt,
            description: `Comissão de ${aff?.name || "afiliada"}`,
            meta: `Sobre venda de ${s.customerName}`,
            amount: s.commissionEarned,
            isOut: true,
            kind: "comissao",
            affiliateName: aff?.name,
            affiliateSaleId: s.id,
            status: s.status,
            isCompleted,
          });
        }
      });

    transactions.forEach((t) => {
      const isOrderTransaction =
        t.category === "venda" &&
        orders.some((o) => t.id === o.id || t.description.includes(o.id));
      if (isOrderTransaction) return;

      const aff = t.affiliateId
        ? affiliates.find((a) => a.id === t.affiliateId)
        : null;
      list.push({
        id: `tx-${t.id}`,
        date: t.date,
        description: t.description || CATEGORY_LABEL[t.category],
        meta: [
          CATEGORY_LABEL[t.category],
          aff && `Afiliada: ${aff.name}`,
          t.productSummary,
          t.notes,
        ]
          .filter(Boolean)
          .join(" · "),
        amount: t.amount,
        isOut: t.kind === "saida",
        kind: "manual",
        affiliateName: aff?.name,
        txRef: t,
        isCompleted: true,
      });
    });

    return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [orders, products, affiliateSales, affiliates, transactions]);

  const dateFilteredRows = useMemo(() => {
    return rows.filter((r) => {
      const d = r.date.slice(0, 10);
      return d >= reportFrom && d <= reportTo;
    });
  }, [rows, reportFrom, reportTo]);

  const totals = useMemo(() => {
    const entradas = dateFilteredRows
      .filter((r) => !r.isOut && r.isCompleted)
      .reduce((a, r) => a + r.amount, 0);
    const saidas = dateFilteredRows
      .filter((r) => r.isOut && r.isCompleted)
      .reduce((a, r) => a + r.amount, 0);
    const pendente = orders
      .filter((o) => {
        const d = o.createdAt.slice(0, 10);
        return d >= reportFrom && d <= reportTo && normalizeOrderStatus(o.status) === "aguardando_pagamento";
      })
      .reduce((a, o) => a + o.total, 0);
    return { entradas, saidas, pendente, caixa: entradas - saidas };
  }, [dateFilteredRows, orders, reportFrom, reportTo]);

  const chartData = useMemo(() => {
    const groups: Record<string, { entradas: number; saidas: number; pendentes: number }> = {};
    const start = new Date(reportFrom + "T12:00:00Z");
    const end = new Date(reportTo + "T12:00:00Z");
    
    if (end.getTime() - start.getTime() <= 60 * 24 * 60 * 60 * 1000) {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const k = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
        groups[k] = { entradas: 0, saidas: 0, pendentes: 0 };
      }
    }
    
    dateFilteredRows.forEach((r) => {
      const d = new Date(r.date);
      const k = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
      if (!groups[k]) groups[k] = { entradas: 0, saidas: 0, pendentes: 0 };
      
      if (r.isCompleted) {
        if (r.isOut) groups[k].saidas += r.amount;
        else groups[k].entradas += r.amount;
      } else if (r.status === "aguardando_pagamento" || r.status === "pendente") {
        if (!r.isOut) groups[k].pendentes += r.amount;
      }
    });

    return Object.entries(groups).map(([date, data]) => ({
      date,
      Entradas: data.entradas,
      Saídas: data.saidas,
      Pendentes: data.pendentes,
    }));
  }, [dateFilteredRows, reportFrom, reportTo]);

  const filteredRows = dateFilteredRows.filter(
    (r) => filter === "todos" || (filter === "entrada" ? !r.isOut : r.isOut),
  );

  const cards = [
    {
      label: "Entradas",
      value: brl(totals.entradas),
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Pendentes",
      value: brl(totals.pendente),
      icon: Wallet,
      color: "text-gold",
    },
    {
      label: "Saídas",
      value: brl(totals.saidas),
      icon: TrendingDown,
      color: "text-destructive",
    },
    {
      label: "Caixa",
      value: brl(totals.caixa),
      icon: Wallet,
      color: "text-primary",
    },
  ];

  return (
    <AdminLayout title="Financeiro">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-2xl p-4 shadow-card">
            <c.icon className={`h-5 w-5 ${c.color}`} />
            <div className="text-xl font-bold mt-2">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-card p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-bold text-lg">Visão Geral</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-full p-1">
              <Calendar className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
              {(
                [
                  { id: "hoje", label: "Hoje" },
                  { id: "7d", label: "7 dias" },
                  { id: "30d", label: "30 dias" },
                  { id: "mes", label: "Mês atual" },
                  { id: "custom", label: "Outro" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${dateFilter === f.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {dateFilter === "custom" && (
              <div className="flex items-center gap-2 text-sm bg-muted/50 border border-border rounded-full px-3 py-1">
                <input
                  type="date"
                  value={reportFrom}
                  onChange={(e) => setReportFrom(e.target.value)}
                  className="bg-transparent outline-none text-xs font-semibold"
                />
                <span className="text-muted-foreground">até</span>
                <input
                  type="date"
                  value={reportTo}
                  onChange={(e) => setReportTo(e.target.value)}
                  className="bg-transparent outline-none text-xs font-semibold"
                />
              </div>
            )}
          </div>
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(val) => `R$${val}`} />
                <RechartsTooltip
                  cursor={false}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "14px", fontWeight: "bold" }}
                  formatter={(value: number) => brl(value)}
                  labelStyle={{ color: "#6b7280", marginBottom: "4px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Pendentes" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma movimentação concluída neste período.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1">
          <Filter className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
          {(["todos", "entrada", "saida"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {f === "todos"
                ? "Todos"
                : f === "entrada"
                  ? "Entradas"
                  : "Saídas"}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="ml-auto flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> Novo lançamento
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-bold flex items-center justify-between gap-2 flex-wrap">
          <span>Movimentações</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-normal">
              {filteredRows.length} lançamento
              {filteredRows.length === 1 ? "" : "s"}
            </span>
            <button
              onClick={() => {
                if (filteredRows.length === 0) {
                  toast.error("Sem dados para exportar");
                  return;
                }
                const head = [
                  "Data",
                  "Descrição",
                  "Categoria/Detalhes",
                  "Tipo",
                  "Valor (R$)",
                ];
                const body = filteredRows.map((r) => [
                  new Date(r.date).toLocaleDateString("pt-BR"),
                  r.description,
                  r.meta || "",
                  r.isOut ? "Saída" : "Entrada",
                  (r.isOut ? -r.amount : r.amount).toFixed(2).replace(".", ","),
                ]);
                downloadCSV(
                  `financeiro-${new Date().toISOString().slice(0, 10)}.csv`,
                  [head, ...body],
                );
                toast.success("CSV baixado");
              }}
              className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button
              onClick={() => {
                if (filteredRows.length === 0) {
                  toast.error("Sem dados para exportar");
                  return;
                }
                downloadPDF({
                  filename: `financeiro-${new Date().toISOString().slice(0, 10)}.pdf`,
                  title: "Relatório Financeiro — Movimentações",
                  subtitle: `${filteredRows.length} lançamento(s) · Entradas ${brl(totals.entradas)} · Saídas ${brl(totals.saidas)} · Caixa ${brl(totals.caixa)}`,
                  head: ["Data", "Descrição", "Detalhes", "Tipo", "Valor"],
                  body: filteredRows.map((r) => [
                    new Date(r.date).toLocaleDateString("pt-BR"),
                    r.description,
                    r.meta || "—",
                    r.isOut ? "Saída" : "Entrada",
                    `${r.isOut ? "− " : "+ "}${brl(r.amount)}`,
                  ]),
                  foot: ["", "", "", "Caixa", brl(totals.caixa)],
                });
                toast.success("PDF baixado");
              }}
              className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-foreground text-background font-semibold"
            >
              <FileText className="h-3.5 w-3.5" /> PDF
            </button>
          </div>
        </div>
        {filteredRows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Sem movimentações.
          </div>
        ) : (
          <ul className="p-2 space-y-2">
            {filteredRows.map((r) => (
              <li
                key={r.id}
                onClick={() => setViewingRow(r)}
                className="cursor-pointer p-4 flex justify-between items-start gap-3 relative overflow-hidden rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors shadow-sm"
              >
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl ${
                    !r.isCompleted
                      ? r.status === "cancelado" || r.status === "falhou" || r.status === "cancelada"
                        ? "bg-destructive"
                        : r.status === "aguardando_pagamento" || r.status === "pendente"
                          ? "bg-yellow-500"
                          : "bg-muted-foreground/30"
                      : r.isOut
                        ? "bg-destructive"
                        : "bg-success"
                  }`}
                />
                <div className="min-w-0 flex-1 ml-1">
                  <div className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                    {r.kind === "comissao" && (
                      <Users className="h-3.5 w-3.5 text-primary" />
                    )}
                    {r.kind === "pedido" && (
                      <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                    )}
                    {r.description}
                    {r.kind === "manual" && (
                      <span className="text-[9px] uppercase tracking-wide bg-muted px-1.5 py-0.5 rounded-full">
                        manual
                      </span>
                    )}
                    {r.status && (
                      <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full
                        ${
                          ['pago', 'concluido', 'confirmada'].includes(r.status)
                            ? 'bg-success/10 text-success'
                            : ['aguardando_pagamento', 'pendente', 'em_separacao', 'saiu_para_entrega'].includes(r.status)
                              ? 'bg-gold/10 text-gold'
                              : 'bg-destructive/10 text-destructive'
                        }
                      `}>
                        {r.status.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  {r.meta && (
                    <div className="text-xs text-muted-foreground mt-0.5 break-words">
                      {r.meta}
                    </div>
                  )}
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {formatDate(r.date)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div
                    className={`font-bold whitespace-nowrap ${
                      !r.isCompleted
                        ? "text-muted-foreground"
                        : r.isOut
                          ? "text-destructive"
                          : "text-success"
                    } ${r.status === "cancelado" || r.status === "falhou" || r.status === "cancelada" ? "line-through opacity-60" : ""}`}
                  >
                    {r.isOut ? "− " : "+ "}
                    {brl(r.amount)}
                  </div>
                  {r.txRef && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(r.txRef!);
                          setShowForm(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const { confirmDialog } =
                            await import("@/components/ConfirmDialog");
                          if (
                            await confirmDialog({
                              title: "Excluir lançamento?",
                              confirmLabel: "Excluir",
                            })
                          ) {
                            deleteTransaction(r.txRef!.id);
                            toast.success("Removido");
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {r.affiliateSaleId && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const { confirmDialog } =
                          await import("@/components/ConfirmDialog");
                        if (
                          await confirmDialog({
                            title: "Excluir venda de afiliada?",
                            description:
                              "A comissão correspondente também será removida.",
                            confirmLabel: "Excluir",
                          })
                        ) {
                          deleteAffiliateSale(r.affiliateSaleId!);
                          toast.success("Venda removida");
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                      title="Excluir venda de afiliada"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AffiliateReport
        from={reportFrom}
        to={reportTo}
        onFromChange={setReportFrom}
        onToChange={setReportTo}
      />

      {viewingRow && (
        <TransactionDetailsModal
          row={viewingRow}
          onClose={() => setViewingRow(null)}
        />
      )}

      {showForm && (
        <TransactionForm
          editing={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={(payload) => {
            if (editing) {
              updateTransaction(editing.id, payload);
              toast.success("Lançamento atualizado");
            } else {
              addTransaction(payload);
              toast.success("Lançamento registrado");
            }
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </AdminLayout>
  );
}

function TransactionForm({
  editing,
  onClose,
  onSave,
}: {
  editing: Transaction | null;
  onClose: () => void;
  onSave: (t: Omit<Transaction, "id" | "createdAt">) => void;
}) {
  const products = useStore((s) => s.products);
  const affiliates = useStore((s) => s.affiliates);

  const [kind, setKind] = useState<TransactionKind>(editing?.kind || "entrada");
  const [category, setCategory] = useState<TransactionCategory>(
    editing?.category || "venda",
  );
  const [description, setDescription] = useState(editing?.description || "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [date, setDate] = useState(
    editing ? editing.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [affiliateId, setAffiliateId] = useState(editing?.affiliateId || "");
  const [notes, setNotes] = useState(editing?.notes || "");
  const [items, setItems] = useState<{ productId: string; qty: number }[]>(
    () => {
      if (editing?.productSummary) return [];
      return [];
    },
  );

  const productSummary =
    items
      .filter((i) => i.productId)
      .map((i) => {
        const p = products.find((pp) => pp.id === i.productId);
        return p ? `${i.qty}× ${p.name}` : "";
      })
      .filter(Boolean)
      .join(", ") || editing?.productSummary;

  const totalFromItems = items.reduce((a, i) => {
    const p = products.find((pp) => pp.id === i.productId);
    return p ? a + p.price * i.qty : a;
  }, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    if (!description.trim()) {
      toast.error("Informe uma descrição");
      return;
    }
    onSave({
      kind,
      category,
      description: description.trim(),
      amount: amt,
      date: new Date(date).toISOString(),
      affiliateId: affiliateId || undefined,
      productSummary: productSummary || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const useItemsTotal = () => {
    if (totalFromItems > 0) setAmount(String(totalFromItems.toFixed(2)));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 animate-overlay-in"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3 animate-modal-in"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {editing ? "Editar lançamento" : "Novo lançamento"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setKind("entrada")}
            className={`h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${kind === "entrada" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <TrendingUp className="h-4 w-4" /> Entrada
          </button>
          <button
            type="button"
            onClick={() => setKind("saida")}
            className={`h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${kind === "saida" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <TrendingDown className="h-4 w-4" /> Saída
          </button>
        </div>

        <Field label="Categoria">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            className="input"
          >
            {(Object.keys(CATEGORY_LABEL) as TransactionCategory[]).map((k) => (
              <option key={k} value={k}>
                {CATEGORY_LABEL[k]}
              </option>
            ))}
          </select>
        </Field>

        <Field label={kind === "saida" ? "Motivo da saída *" : "Descrição *"}>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            placeholder={
              kind === "saida"
                ? "Ex.: Compra de embalagens, Conta de luz..."
                : "Ex.: Venda balcão · cliente Maria"
            }
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Valor (R$) *">
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Data">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        {(category === "venda" || category === "comissao_afiliada") &&
          affiliates.length > 0 && (
            <Field label="Afiliada (opcional)">
              <select
                value={affiliateId}
                onChange={(e) => setAffiliateId(e.target.value)}
                className="input"
              >
                <option value="">— Nenhuma —</option>
                {affiliates.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

        <div className="border border-border rounded-xl p-3 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold">
              Produtos vendidos (opcional)
            </span>
            <button
              type="button"
              onClick={() => setItems([...items, { productId: "", qty: 1 }])}
              className="text-xs flex items-center gap-1 text-primary font-semibold"
            >
              <Plus className="h-3 w-3" /> Adicionar
            </button>
          </div>
          {items.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              Adicione produtos para gerar o resumo automaticamente.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={it.productId}
                    onChange={(e) =>
                      setItems(
                        items.map((x, i) =>
                          i === idx ? { ...x, productId: e.target.value } : x,
                        ),
                      )
                    }
                    className="input flex-1 !mt-0"
                  >
                    <option value="">Selecione...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {brl(p.price)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={it.qty}
                    onChange={(e) =>
                      setItems(
                        items.map((x, i) =>
                          i === idx
                            ? { ...x, qty: parseInt(e.target.value) || 1 }
                            : x,
                        ),
                      )
                    }
                    className="input !mt-0 w-16 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {totalFromItems > 0 && (
                <button
                  type="button"
                  onClick={useItemsTotal}
                  className="text-xs text-primary font-semibold underline"
                >
                  Usar total dos produtos: {brl(totalFromItems)}
                </button>
              )}
            </div>
          )}
        </div>

        <Field label="Observações">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="input !h-auto py-2"
          />
        </Field>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-full border border-border font-semibold"
          >
            Cancelar
          </button>
          <button className="flex-1 h-11 rounded-full gradient-primary text-primary-foreground font-semibold">
            Salvar
          </button>
        </div>

        <style>{`.input{margin-top:4px;width:100%;height:40px;padding:0 12px;border-radius:10px;background:var(--background);border:1px solid var(--border);outline:none;font-size:14px}`}</style>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function AffiliateReport({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  const affiliates = useStore((s) => s.affiliates);
  const affiliateSales = useStore((s) => s.affiliateSales);
  const transactions = useStore((s) => s.transactions);

  const report = useMemo(() => {
    const start = new Date(from + "T00:00:00");
    const end = new Date(to + "T23:59:59");
    const inRange = (iso: string) => {
      const d = new Date(iso);
      return d >= start && d <= end;
    };

    const rows = affiliates
      .map((a) => {
        const sales = affiliateSales.filter(
          (s) => s.affiliateId === a.id && inRange(s.createdAt),
        );
        const confirmed = sales.filter((s) => s.status === "confirmada");
        const pending = sales.filter((s) => s.status === "pendente");
        const canceled = sales.filter((s) => s.status === "cancelada");
        const revenueConfirmed = confirmed.reduce(
          (acc, s) => acc + s.saleValue,
          0,
        );
        const commissionConfirmed = confirmed.reduce(
          (acc, s) => acc + s.commissionEarned,
          0,
        );
        const revenuePending = pending.reduce((acc, s) => acc + s.saleValue, 0);
        const commissionPending = pending.reduce(
          (acc, s) => acc + s.commissionEarned,
          0,
        );
        const manualPaid = transactions
          .filter(
            (t) =>
              t.affiliateId === a.id &&
              t.kind === "saida" &&
              t.category === "comissao_afiliada" &&
              inRange(t.date),
          )
          .reduce((acc, t) => acc + t.amount, 0);
        return {
          id: a.id,
          name: a.name,
          salesCount: sales.length,
          confirmedCount: confirmed.length,
          pendingCount: pending.length,
          canceledCount: canceled.length,
          revenueConfirmed,
          commissionConfirmed,
          revenuePending,
          commissionPending,
          commissionPaid: manualPaid,
          commissionToPay: commissionConfirmed - manualPaid,
        };
      })
      .filter((r) => r.salesCount > 0 || r.commissionPaid > 0)
      .sort((a, b) => b.commissionConfirmed - a.commissionConfirmed);

    const totals = rows.reduce(
      (acc, r) => ({
        sales: acc.sales + r.salesCount,
        revenue: acc.revenue + r.revenueConfirmed,
        commission: acc.commission + r.commissionConfirmed,
        paid: acc.paid + r.commissionPaid,
        toPay: acc.toPay + r.commissionToPay,
      }),
      { sales: 0, revenue: 0, commission: 0, paid: 0, toPay: 0 },
    );

    return { rows, totals };
  }, [affiliates, affiliateSales, transactions, from, to]);

  const head = [
    "Afiliada",
    "Vendas",
    "Confirmadas",
    "Pendentes",
    "Canceladas",
    "Faturamento (R$)",
    "Comissão (R$)",
    "Paga (R$)",
    "A pagar (R$)",
  ];
  const exportCsv = () => {
    if (report.rows.length === 0) {
      toast.error("Sem dados no período");
      return;
    }
    const body = report.rows.map((r) => [
      r.name,
      r.salesCount,
      r.confirmedCount,
      r.pendingCount,
      r.canceledCount,
      r.revenueConfirmed.toFixed(2).replace(".", ","),
      r.commissionConfirmed.toFixed(2).replace(".", ","),
      r.commissionPaid.toFixed(2).replace(".", ","),
      r.commissionToPay.toFixed(2).replace(".", ","),
    ]);
    const totals = [
      "TOTAIS",
      report.totals.sales,
      "",
      "",
      "",
      report.totals.revenue.toFixed(2).replace(".", ","),
      report.totals.commission.toFixed(2).replace(".", ","),
      report.totals.paid.toFixed(2).replace(".", ","),
      report.totals.toPay.toFixed(2).replace(".", ","),
    ];
    downloadCSV(`afiliadas-${from}-a-${to}.csv`, [head, ...body, totals]);
    toast.success("CSV baixado");
  };

  const exportPdf = () => {
    if (report.rows.length === 0) {
      toast.error("Sem dados no período");
      return;
    }
    downloadPDF({
      filename: `afiliadas-${from}-a-${to}.pdf`,
      title: "Relatório por Afiliada",
      subtitle: `Período: ${new Date(from).toLocaleDateString("pt-BR")} a ${new Date(to).toLocaleDateString("pt-BR")}`,
      head,
      body: report.rows.map((r) => [
        r.name,
        r.salesCount,
        r.confirmedCount,
        r.pendingCount,
        r.canceledCount,
        brl(r.revenueConfirmed),
        brl(r.commissionConfirmed),
        brl(r.commissionPaid),
        brl(r.commissionToPay),
      ]),
      foot: [
        "TOTAIS",
        report.totals.sales,
        "",
        "",
        "",
        brl(report.totals.revenue),
        brl(report.totals.commission),
        brl(report.totals.paid),
        brl(report.totals.toPay),
      ],
    });
    toast.success("PDF baixado");
  };

  return (
    <div className="bg-card rounded-2xl shadow-card mt-4 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <div className="font-bold flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Relatório por afiliada
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs flex items-center gap-1">
            <span className="text-muted-foreground">De</span>
            <input
              type="date"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              className="h-8 px-2 rounded-lg bg-background border border-border text-xs"
            />
          </label>
          <label className="text-xs flex items-center gap-1">
            <span className="text-muted-foreground">Até</span>
            <input
              type="date"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              className="h-8 px-2 rounded-lg bg-background border border-border text-xs"
            />
          </label>
          <button
            onClick={exportCsv}
            className="text-xs flex items-center gap-1 bg-muted hover:bg-muted/70 px-3 py-1.5 rounded-full font-semibold"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            onClick={exportPdf}
            className="text-xs flex items-center gap-1 bg-foreground text-background px-3 py-1.5 rounded-full font-semibold"
          >
            <FileText className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>

      {report.rows.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          Nenhuma venda de afiliada no período.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">Afiliada</th>
                  <th className="text-center px-2 py-2">Vendas</th>
                  <th className="text-right px-2 py-2">Faturamento</th>
                  <th className="text-right px-2 py-2">Comissão</th>
                  <th className="text-right px-2 py-2">Paga</th>
                  <th className="text-right px-4 py-2">A pagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 font-medium">
                      {r.name}
                      <div className="text-[10px] text-muted-foreground">
                        {r.confirmedCount} conf. · {r.pendingCount} pend. ·{" "}
                        {r.canceledCount} canc.
                      </div>
                    </td>
                    <td className="text-center px-2 py-2">{r.salesCount}</td>
                    <td className="text-right px-2 py-2">
                      {brl(r.revenueConfirmed)}
                    </td>
                    <td className="text-right px-2 py-2 text-gold font-semibold">
                      {brl(r.commissionConfirmed)}
                    </td>
                    <td className="text-right px-2 py-2 text-success">
                      {brl(r.commissionPaid)}
                    </td>
                    <td className="text-right px-4 py-2 font-bold">
                      {brl(r.commissionToPay)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30 font-bold text-sm">
                <tr>
                  <td className="px-4 py-2">Totais</td>
                  <td className="text-center px-2 py-2">
                    {report.totals.sales}
                  </td>
                  <td className="text-right px-2 py-2">
                    {brl(report.totals.revenue)}
                  </td>
                  <td className="text-right px-2 py-2 text-gold">
                    {brl(report.totals.commission)}
                  </td>
                  <td className="text-right px-2 py-2 text-success">
                    {brl(report.totals.paid)}
                  </td>
                  <td className="text-right px-4 py-2">
                    {brl(report.totals.toPay)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function TransactionDetailsModal({
  row,
  onClose,
}: {
  row: Row;
  onClose: () => void;
}) {
  const storeSettings = useStore((s) => s.settings);

  const handlePrint = () => {
    const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Comprovante — ${storeSettings.storeName}</title>
<style>
  body { font-family: sans-serif; background: #f4f4f5; margin: 0; padding: 20px; color: #111; }
  .receipt { max-width: 400px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 16px; margin-bottom: 16px; }
  .header h1 { margin: 0; font-size: 18px; color: #ec4899; }
  .header p { margin: 4px 0 0; font-size: 12px; color: #666; }
  .amount { text-align: center; font-size: 32px; font-weight: 900; margin: 24px 0; color: ${row.isOut ? '#ef4444' : '#22c55e'}; }
  .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
  .row span:first-child { color: #666; font-weight: 500; }
  .row span:last-child { font-weight: 700; text-align: right; max-width: 60%; word-break: break-word; }
  .footer { text-align: center; font-size: 12px; color: #888; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; }
  @media print { body { background: #fff; } .receipt { box-shadow: none; max-width: 100%; padding: 0; } }
</style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>${storeSettings.storeName}</h1>
      <p>Comprovante de Transação</p>
    </div>
    <div class="amount">${row.isOut ? '− ' : '+ '}${brl(row.amount)}</div>
    <div class="row"><span>Data e Hora</span><span>${formatDate(row.date)}</span></div>
    <div class="row"><span>Tipo</span><span>${row.isOut ? 'Saída' : 'Entrada'}</span></div>
    <div class="row"><span>Descrição</span><span>${row.description}</span></div>
    ${row.status ? `<div class="row"><span>Status</span><span style="text-transform:uppercase">${row.status.replace(/_/g, " ")}</span></div>` : ""}
    ${row.meta ? `<div class="row" style="flex-direction:column; gap:4px"><span>Detalhes</span><span style="text-align:left; max-width:100%">${row.meta}</span></div>` : ""}
    <div class="footer">Autenticação: ${row.id.toUpperCase()}<br/>Gerado em ${new Date().toLocaleString("pt-BR")}</div>
  </div>
  <script>setTimeout(() => window.print(), 300);</script>
</body>
</html>`;
    const w = window.open("", "_blank", "width=500,height=700");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const handleShare = async () => {
    const text = `Comprovante - ${storeSettings.storeName}
Data: ${formatDate(row.date)}
Valor: ${brl(row.amount)}
Descrição: ${row.description}
Status: ${row.status || 'Concluído'}
Autenticação: ${row.id.toUpperCase()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Comprovante",
          text,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copiado para a área de transferência!");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] w-full max-w-sm overflow-hidden animate-modal-in shadow-2xl relative flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center relative border-b border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="w-12 h-12 bg-white/10 rounded-full mx-auto flex items-center justify-center text-white mb-3 shadow-sm border border-white/10">
            <span className="font-bold text-lg">{storeSettings.storeName.charAt(0)}</span>
          </div>
          
          <h3 className="font-medium text-white/50 text-xs uppercase tracking-wider mb-1">
            Comprovante de Transação
          </h3>
          <div className={`text-4xl font-black tracking-tight ${row.isOut ? "text-red-400" : "text-green-400"}`}>
            {row.isOut ? "− " : "+ "}{brl(row.amount)}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-sm text-white/50">Data e Hora</span>
            <span className="text-sm font-medium">{formatDate(row.date)}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-sm text-white/50">Tipo</span>
            <span className="text-sm font-medium">{row.isOut ? 'Saída (Despesa)' : 'Entrada (Receita)'}</span>
          </div>

          <div className="flex flex-col gap-1 pb-3 border-b border-white/5">
            <span className="text-sm text-white/50">Descrição</span>
            <span className="text-sm font-medium">{row.description}</span>
          </div>

          {row.status && (
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-white/50">Status</span>
              <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full
                ${
                  ['pago', 'concluido', 'confirmada'].includes(row.status)
                    ? 'bg-green-500/20 text-green-300'
                    : ['aguardando_pagamento', 'pendente', 'em_separacao', 'saiu_para_entrega'].includes(row.status)
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-red-500/20 text-red-300'
                }
              `}>
                {row.status.replace(/_/g, " ")}
              </span>
            </div>
          )}

          {row.mpPaymentId && (
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-white/50">ID Mercado Pago</span>
              <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-white/80">{row.mpPaymentId}</span>
            </div>
          )}

          {row.meta && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-white/50">Detalhes</span>
              <span className="text-sm text-white/80 font-medium break-words leading-relaxed">
                {row.meta}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white/5 flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors border border-white/10"
          >
            <Share className="h-4 w-4" /> Compartilhar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
        </div>
      </div>
    </div>
  );
}
