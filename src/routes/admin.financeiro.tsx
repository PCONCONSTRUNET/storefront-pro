import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, type Transaction, type TransactionCategory, type TransactionKind } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, X, Filter, Users, ShoppingBag, Pencil, Download, FileText } from "lucide-react";
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
  const orders = useStore(s => s.orders);
  const products = useStore(s => s.products);
  const affiliates = useStore(s => s.affiliates);
  const affiliateSales = useStore(s => s.affiliateSales);
  const transactions = useStore(s => s.transactions);
  const addTransaction = useStore(s => s.addTransaction);
  const deleteTransaction = useStore(s => s.deleteTransaction);
  const updateTransaction = useStore(s => s.updateTransaction);
  const deleteAffiliateSale = useStore(s => s.deleteAffiliateSale);

  const [filter, setFilter] = useState<"todos" | "entrada" | "saida">("todos");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const todayISO = new Date().toISOString().slice(0, 10);
  const monthAgoISO = (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().slice(0, 10); })();
  const [reportFrom, setReportFrom] = useState(monthAgoISO);
  const [reportTo, setReportTo] = useState(todayISO);

  const rows: Row[] = useMemo(() => {
    const list: Row[] = [];

    orders.forEach(o => {
      const isPaid = ["pago", "em_separacao", "saiu_para_entrega", "concluido"].includes(o.status);
      const isRefund = o.status === "reembolsado";
      if (!isPaid && !isRefund) return;
      const productSummary = o.items
        .map(it => {
          const p = products.find(pp => pp.id === it.productId);
          return `${it.quantity}× ${p?.name || it.productId}`;
        })
        .join(", ");
      list.push({
        id: `order-${o.id}`,
        date: o.createdAt,
        description: `Pedido #${o.id} · ${o.customerName}`,
        meta: productSummary,
        amount: o.total,
        isOut: isRefund,
        kind: "pedido",
        status: o.status,
      });
    });

    affiliateSales.filter(s => s.status === "confirmada").forEach(s => {
      const aff = affiliates.find(a => a.id === s.affiliateId);
      list.push({
        id: `affsale-${s.id}`,
        date: s.createdAt,
        description: `Venda afiliada · ${s.customerName}`,
        meta: `${s.productDescription} · por ${aff?.name || "—"}`,
        amount: s.saleValue,
        isOut: false,
        kind: "comissao",
        affiliateName: aff?.name,
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
        });
      }
    });

    transactions.forEach(t => {
      const aff = t.affiliateId ? affiliates.find(a => a.id === t.affiliateId) : null;
      list.push({
        id: `tx-${t.id}`,
        date: t.date,
        description: t.description || CATEGORY_LABEL[t.category],
        meta: [CATEGORY_LABEL[t.category], aff && `Afiliada: ${aff.name}`, t.productSummary, t.notes].filter(Boolean).join(" · "),
        amount: t.amount,
        isOut: t.kind === "saida",
        kind: "manual",
        affiliateName: aff?.name,
        txRef: t,
      });
    });

    return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [orders, products, affiliateSales, affiliates, transactions]);

  const totals = useMemo(() => {
    const entradas = rows.filter(r => !r.isOut).reduce((a, r) => a + r.amount, 0);
    const saidas = rows.filter(r => r.isOut).reduce((a, r) => a + r.amount, 0);
    const pendente = orders.filter(o => o.status === "aguardando_pagamento").reduce((a, o) => a + o.total, 0);
    return { entradas, saidas, pendente, caixa: entradas - saidas };
  }, [rows, orders]);

  const filteredRows = rows.filter(r => filter === "todos" || (filter === "entrada" ? !r.isOut : r.isOut));

  const cards = [
    { label: "Entradas", value: brl(totals.entradas), icon: TrendingUp, color: "text-success" },
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

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1">
          <Filter className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
          {(["todos", "entrada", "saida"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {f === "todos" ? "Todos" : f === "entrada" ? "Entradas" : "Saídas"}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="ml-auto flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> Novo lançamento
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-bold flex items-center justify-between gap-2 flex-wrap">
          <span>Movimentações</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-normal">{filteredRows.length} lançamento{filteredRows.length === 1 ? "" : "s"}</span>
            <button
              onClick={() => {
                if (filteredRows.length === 0) { toast.error("Sem dados para exportar"); return; }
                const head = ["Data", "Descrição", "Categoria/Detalhes", "Tipo", "Valor (R$)"];
                const body = filteredRows.map(r => [
                  new Date(r.date).toLocaleDateString("pt-BR"),
                  r.description,
                  r.meta || "",
                  r.isOut ? "Saída" : "Entrada",
                  (r.isOut ? -r.amount : r.amount).toFixed(2).replace(".", ","),
                ]);
                downloadCSV(`financeiro-${new Date().toISOString().slice(0,10)}.csv`, [head, ...body]);
                toast.success("CSV baixado");
              }}
              className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button
              onClick={() => {
                if (filteredRows.length === 0) { toast.error("Sem dados para exportar"); return; }
                downloadPDF({
                  filename: `financeiro-${new Date().toISOString().slice(0,10)}.pdf`,
                  title: "Relatório Financeiro — Movimentações",
                  subtitle: `${filteredRows.length} lançamento(s) · Entradas ${brl(totals.entradas)} · Saídas ${brl(totals.saidas)} · Caixa ${brl(totals.caixa)}`,
                  head: ["Data", "Descrição", "Detalhes", "Tipo", "Valor"],
                  body: filteredRows.map(r => [
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
          <div className="text-center py-12 text-muted-foreground">Sem movimentações.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredRows.map(r => (
              <li key={r.id} className="p-4 flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                    {r.kind === "comissao" && <Users className="h-3.5 w-3.5 text-primary" />}
                    {r.kind === "pedido" && <ShoppingBag className="h-3.5 w-3.5 text-primary" />}
                    {r.description}
                    {r.kind === "manual" && (
                      <span className="text-[9px] uppercase tracking-wide bg-muted px-1.5 py-0.5 rounded-full">manual</span>
                    )}
                  </div>
                  {r.meta && <div className="text-xs text-muted-foreground mt-0.5 break-words">{r.meta}</div>}
                  <div className="text-[11px] text-muted-foreground mt-1">{formatDate(r.date)}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className={`font-bold whitespace-nowrap ${r.isOut ? "text-destructive" : "text-success"}`}>
                    {r.isOut ? "− " : "+ "}{brl(r.amount)}
                  </div>
                  {r.txRef && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditing(r.txRef!); setShowForm(true); }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Excluir lançamento?")) { deleteTransaction(r.txRef!.id); toast.success("Removido"); } }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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

      {showForm && (
        <TransactionForm
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
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
  const products = useStore(s => s.products);
  const affiliates = useStore(s => s.affiliates);

  const [kind, setKind] = useState<TransactionKind>(editing?.kind || "entrada");
  const [category, setCategory] = useState<TransactionCategory>(editing?.category || "venda");
  const [description, setDescription] = useState(editing?.description || "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [date, setDate] = useState(editing ? editing.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [affiliateId, setAffiliateId] = useState(editing?.affiliateId || "");
  const [notes, setNotes] = useState(editing?.notes || "");
  const [items, setItems] = useState<{ productId: string; qty: number }[]>(() => {
    if (editing?.productSummary) return [];
    return [];
  });

  const productSummary = items
    .filter(i => i.productId)
    .map(i => {
      const p = products.find(pp => pp.id === i.productId);
      return p ? `${i.qty}× ${p.name}` : "";
    })
    .filter(Boolean)
    .join(", ") || editing?.productSummary;

  const totalFromItems = items.reduce((a, i) => {
    const p = products.find(pp => pp.id === i.productId);
    return p ? a + p.price * i.qty : a;
  }, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Informe um valor válido"); return; }
    if (!description.trim()) { toast.error("Informe uma descrição"); return; }
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
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 animate-overlay-in" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-card rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3 animate-modal-in">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{editing ? "Editar lançamento" : "Novo lançamento"}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
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
          <select value={category} onChange={e => setCategory(e.target.value as TransactionCategory)} className="input">
            {(Object.keys(CATEGORY_LABEL) as TransactionCategory[]).map(k => (
              <option key={k} value={k}>{CATEGORY_LABEL[k]}</option>
            ))}
          </select>
        </Field>

        <Field label="Descrição *">
          <input value={description} onChange={e => setDescription(e.target.value)} className="input" placeholder="Ex.: Venda balcão · cliente Maria" required />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Valor (R$) *">
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="input" required />
          </Field>
          <Field label="Data">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
          </Field>
        </div>

        {(category === "venda" || category === "comissao_afiliada") && affiliates.length > 0 && (
          <Field label="Afiliada (opcional)">
            <select value={affiliateId} onChange={e => setAffiliateId(e.target.value)} className="input">
              <option value="">— Nenhuma —</option>
              {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
        )}

        <div className="border border-border rounded-xl p-3 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold">Produtos vendidos (opcional)</span>
            <button
              type="button"
              onClick={() => setItems([...items, { productId: "", qty: 1 }])}
              className="text-xs flex items-center gap-1 text-primary font-semibold"
            >
              <Plus className="h-3 w-3" /> Adicionar
            </button>
          </div>
          {items.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">Adicione produtos para gerar o resumo automaticamente.</p>
          ) : (
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={it.productId}
                    onChange={e => setItems(items.map((x, i) => i === idx ? { ...x, productId: e.target.value } : x))}
                    className="input flex-1 !mt-0"
                  >
                    <option value="">Selecione...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} — {brl(p.price)}</option>)}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={it.qty}
                    onChange={e => setItems(items.map((x, i) => i === idx ? { ...x, qty: parseInt(e.target.value) || 1 } : x))}
                    className="input !mt-0 w-16 text-center"
                  />
                  <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {totalFromItems > 0 && (
                <button type="button" onClick={useItemsTotal} className="text-xs text-primary font-semibold underline">
                  Usar total dos produtos: {brl(totalFromItems)}
                </button>
              )}
            </div>
          )}
        </div>

        <Field label="Observações">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="input !h-auto py-2" />
        </Field>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-full border border-border font-semibold">Cancelar</button>
          <button className="flex-1 h-11 rounded-full gradient-primary text-primary-foreground font-semibold">Salvar</button>
        </div>

        <style>{`.input{margin-top:4px;width:100%;height:40px;padding:0 12px;border-radius:10px;background:var(--background);border:1px solid var(--border);outline:none;font-size:14px}`}</style>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function AffiliateReport({ from, to, onFromChange, onToChange }: {
  from: string; to: string; onFromChange: (v: string) => void; onToChange: (v: string) => void;
}) {
  const affiliates = useStore(s => s.affiliates);
  const affiliateSales = useStore(s => s.affiliateSales);
  const transactions = useStore(s => s.transactions);

  const report = useMemo(() => {
    const start = new Date(from + "T00:00:00");
    const end = new Date(to + "T23:59:59");
    const inRange = (iso: string) => { const d = new Date(iso); return d >= start && d <= end; };

    const rows = affiliates.map(a => {
      const sales = affiliateSales.filter(s => s.affiliateId === a.id && inRange(s.createdAt));
      const confirmed = sales.filter(s => s.status === "confirmada");
      const pending = sales.filter(s => s.status === "pendente");
      const canceled = sales.filter(s => s.status === "cancelada");
      const revenueConfirmed = confirmed.reduce((acc, s) => acc + s.saleValue, 0);
      const commissionConfirmed = confirmed.reduce((acc, s) => acc + s.commissionEarned, 0);
      const revenuePending = pending.reduce((acc, s) => acc + s.saleValue, 0);
      const commissionPending = pending.reduce((acc, s) => acc + s.commissionEarned, 0);
      const manualPaid = transactions
        .filter(t => t.affiliateId === a.id && t.kind === "saida" && t.category === "comissao_afiliada" && inRange(t.date))
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
    }).filter(r => r.salesCount > 0 || r.commissionPaid > 0)
      .sort((a, b) => b.commissionConfirmed - a.commissionConfirmed);

    const totals = rows.reduce((acc, r) => ({
      sales: acc.sales + r.salesCount,
      revenue: acc.revenue + r.revenueConfirmed,
      commission: acc.commission + r.commissionConfirmed,
      paid: acc.paid + r.commissionPaid,
      toPay: acc.toPay + r.commissionToPay,
    }), { sales: 0, revenue: 0, commission: 0, paid: 0, toPay: 0 });

    return { rows, totals };
  }, [affiliates, affiliateSales, transactions, from, to]);

  const head = ["Afiliada", "Vendas", "Confirmadas", "Pendentes", "Canceladas", "Faturamento (R$)", "Comissão (R$)", "Paga (R$)", "A pagar (R$)"];
  const exportCsv = () => {
    if (report.rows.length === 0) { toast.error("Sem dados no período"); return; }
    const body = report.rows.map(r => [
      r.name, r.salesCount, r.confirmedCount, r.pendingCount, r.canceledCount,
      r.revenueConfirmed.toFixed(2).replace(".", ","),
      r.commissionConfirmed.toFixed(2).replace(".", ","),
      r.commissionPaid.toFixed(2).replace(".", ","),
      r.commissionToPay.toFixed(2).replace(".", ","),
    ]);
    const totals = ["TOTAIS", report.totals.sales, "", "", "",
      report.totals.revenue.toFixed(2).replace(".", ","),
      report.totals.commission.toFixed(2).replace(".", ","),
      report.totals.paid.toFixed(2).replace(".", ","),
      report.totals.toPay.toFixed(2).replace(".", ","),
    ];
    downloadCSV(`afiliadas-${from}-a-${to}.csv`, [head, ...body, totals]);
    toast.success("CSV baixado");
  };

  const exportPdf = () => {
    if (report.rows.length === 0) { toast.error("Sem dados no período"); return; }
    downloadPDF({
      filename: `afiliadas-${from}-a-${to}.pdf`,
      title: "Relatório por Afiliada",
      subtitle: `Período: ${new Date(from).toLocaleDateString("pt-BR")} a ${new Date(to).toLocaleDateString("pt-BR")}`,
      head,
      body: report.rows.map(r => [
        r.name, r.salesCount, r.confirmedCount, r.pendingCount, r.canceledCount,
        brl(r.revenueConfirmed), brl(r.commissionConfirmed),
        brl(r.commissionPaid), brl(r.commissionToPay),
      ]),
      foot: ["TOTAIS", report.totals.sales, "", "", "",
        brl(report.totals.revenue), brl(report.totals.commission),
        brl(report.totals.paid), brl(report.totals.toPay)],
    });
    toast.success("PDF baixado");
  };

  return (
    <div className="bg-card rounded-2xl shadow-card mt-4 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <div className="font-bold flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Relatório por afiliada</div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs flex items-center gap-1">
            <span className="text-muted-foreground">De</span>
            <input type="date" value={from} onChange={e => onFromChange(e.target.value)} className="h-8 px-2 rounded-lg bg-background border border-border text-xs" />
          </label>
          <label className="text-xs flex items-center gap-1">
            <span className="text-muted-foreground">Até</span>
            <input type="date" value={to} onChange={e => onToChange(e.target.value)} className="h-8 px-2 rounded-lg bg-background border border-border text-xs" />
          </label>
          <button onClick={exportCsv} className="text-xs flex items-center gap-1 bg-muted hover:bg-muted/70 px-3 py-1.5 rounded-full font-semibold">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button onClick={exportPdf} className="text-xs flex items-center gap-1 bg-foreground text-background px-3 py-1.5 rounded-full font-semibold">
            <FileText className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>

      {report.rows.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">Nenhuma venda de afiliada no período.</div>
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
                {report.rows.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 font-medium">
                      {r.name}
                      <div className="text-[10px] text-muted-foreground">
                        {r.confirmedCount} conf. · {r.pendingCount} pend. · {r.canceledCount} canc.
                      </div>
                    </td>
                    <td className="text-center px-2 py-2">{r.salesCount}</td>
                    <td className="text-right px-2 py-2">{brl(r.revenueConfirmed)}</td>
                    <td className="text-right px-2 py-2 text-gold font-semibold">{brl(r.commissionConfirmed)}</td>
                    <td className="text-right px-2 py-2 text-success">{brl(r.commissionPaid)}</td>
                    <td className="text-right px-4 py-2 font-bold">{brl(r.commissionToPay)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30 font-bold text-sm">
                <tr>
                  <td className="px-4 py-2">Totais</td>
                  <td className="text-center px-2 py-2">{report.totals.sales}</td>
                  <td className="text-right px-2 py-2">{brl(report.totals.revenue)}</td>
                  <td className="text-right px-2 py-2 text-gold">{brl(report.totals.commission)}</td>
                  <td className="text-right px-2 py-2 text-success">{brl(report.totals.paid)}</td>
                  <td className="text-right px-4 py-2">{brl(report.totals.toPay)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

