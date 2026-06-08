import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { g as createLucideIcon, u as useStore, W as normalizeOrderStatus, v as brl, w as Plus, a8 as Download, t as toast, h as ShoppingBag, I as formatDate, z as Trash2, X } from "./router-CnaK_EO9.js";
import { A as AdminLayout, F as FileText, U as Users } from "./AdminLayout-De_VAja0.js";
import { d as downloadCSV, a as downloadPDF, P as Pencil } from "./export-dIrrUFh0.js";
import { T as TrendingUp } from "./trending-up-C5_Sivrs.js";
import { T as TrendingDown } from "./trending-down-DplW290n.js";
import { F as Funnel } from "./funnel-DQ7LHhVV.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./adminHelpers.server-BhLg7GIA.js";
import "./client.server-C7GAOqxY.js";
import "./layout-dashboard-TB_mnbRk.js";
import "./shopping-cart-B-gXG7d3.js";
import "./dollar-sign-UAWpRRk1.js";
import "./settings-QGrcKFnZ.js";
import "./log-out-DGsS6HUi.js";
import "./jspdf.node.min-LIwg0wSs.js";
import "fs";
import "path";
import "./jspdf.plugin.autotable-rNuKHwSj.js";
const __iconNode = [
  [
    "path",
    {
      d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
      key: "18etb6"
    }
  ],
  ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4", key: "xoc0q4" }]
];
const Wallet = createLucideIcon("wallet", __iconNode);
const CATEGORY_LABEL = {
  venda: "Venda manual",
  comissao_afiliada: "Comissão afiliada",
  fornecedor: "Fornecedor",
  marketing: "Marketing",
  operacional: "Operacional",
  outros: "Outros"
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
  reactExports.useEffect(() => {
    sync();
  }, [sync]);
  const [filter, setFilter] = reactExports.useState("todos");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const todayISO = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const monthAgoISO = (() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  })();
  const [reportFrom, setReportFrom] = reactExports.useState(monthAgoISO);
  const [reportTo, setReportTo] = reactExports.useState(todayISO);
  const rows = reactExports.useMemo(() => {
    const list = [];
    orders.forEach((o) => {
      const status = normalizeOrderStatus(o.status);
      const isPaid = ["pago", "em_separacao", "saiu_para_entrega", "concluido"].includes(status);
      const isRefund = status === "reembolsado";
      if (!isPaid && !isRefund) return;
      const productSummary = o.items.map((it) => {
        const p = products.find((pp) => pp.id === it.productId);
        return `${it.quantity}× ${p?.name || it.productId}`;
      }).join(", ");
      list.push({
        id: `order-${o.id}`,
        date: o.createdAt,
        description: `Pedido #${o.id} · ${o.customerName}`,
        meta: productSummary,
        amount: o.total,
        isOut: isRefund,
        kind: "pedido",
        status
      });
    });
    affiliateSales.filter((s) => s.status === "confirmada").forEach((s) => {
      const aff = affiliates.find((a) => a.id === s.affiliateId);
      list.push({
        id: `affsale-${s.id}`,
        date: s.createdAt,
        description: `Venda afiliada · ${s.customerName}`,
        meta: `${s.productDescription} · por ${aff?.name || "—"}`,
        amount: s.saleValue,
        isOut: false,
        kind: "comissao",
        affiliateName: aff?.name,
        affiliateSaleId: s.id
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
          affiliateSaleId: s.id
        });
      }
    });
    transactions.forEach((t) => {
      const isOrderTransaction = t.category === "venda" && orders.some((o) => t.id === o.id || t.description.includes(o.id));
      if (isOrderTransaction) return;
      const aff = t.affiliateId ? affiliates.find((a) => a.id === t.affiliateId) : null;
      list.push({
        id: `tx-${t.id}`,
        date: t.date,
        description: t.description || CATEGORY_LABEL[t.category],
        meta: [CATEGORY_LABEL[t.category], aff && `Afiliada: ${aff.name}`, t.productSummary, t.notes].filter(Boolean).join(" · "),
        amount: t.amount,
        isOut: t.kind === "saida",
        kind: "manual",
        affiliateName: aff?.name,
        txRef: t
      });
    });
    return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [orders, products, affiliateSales, affiliates, transactions]);
  const totals = reactExports.useMemo(() => {
    const entradas = rows.filter((r) => !r.isOut).reduce((a, r) => a + r.amount, 0);
    const saidas = rows.filter((r) => r.isOut).reduce((a, r) => a + r.amount, 0);
    const pendente = orders.filter((o) => normalizeOrderStatus(o.status) === "aguardando_pagamento").reduce((a, o) => a + o.total, 0);
    return {
      entradas,
      saidas,
      pendente,
      caixa: entradas - saidas
    };
  }, [rows, orders]);
  const filteredRows = rows.filter((r) => filter === "todos" || (filter === "entrada" ? !r.isOut : r.isOut));
  const cards = [{
    label: "Entradas",
    value: brl(totals.entradas),
    icon: TrendingUp,
    color: "text-success"
  }, {
    label: "Pendentes",
    value: brl(totals.pendente),
    icon: Wallet,
    color: "text-gold"
  }, {
    label: "Saídas",
    value: brl(totals.saidas),
    icon: TrendingDown,
    color: "text-destructive"
  }, {
    label: "Caixa",
    value: brl(totals.caixa),
    icon: Wallet,
    color: "text-primary"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Financeiro", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4", children: cards.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: `h-5 w-5 ${c.color}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold mt-2", children: c.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 bg-card border border-border rounded-full p-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "h-3.5 w-3.5 ml-2 text-muted-foreground" }),
        ["todos", "entrada", "saida"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f), className: `text-xs px-3 py-1.5 rounded-full font-semibold transition ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`, children: f === "todos" ? "Todos" : f === "entrada" ? "Entradas" : "Saídas" }, f))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        setEditing(null);
        setShowForm(true);
      }, className: "ml-auto flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Novo lançamento"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border font-bold flex items-center justify-between gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Movimentações" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-normal", children: [
            filteredRows.length,
            " lançamento",
            filteredRows.length === 1 ? "" : "s"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            if (filteredRows.length === 0) {
              toast.error("Sem dados para exportar");
              return;
            }
            const head = ["Data", "Descrição", "Categoria/Detalhes", "Tipo", "Valor (R$)"];
            const body = filteredRows.map((r) => [new Date(r.date).toLocaleDateString("pt-BR"), r.description, r.meta || "", r.isOut ? "Saída" : "Entrada", (r.isOut ? -r.amount : r.amount).toFixed(2).replace(".", ",")]);
            downloadCSV(`financeiro-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, [head, ...body]);
            toast.success("CSV baixado");
          }, className: "text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
            " CSV"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            if (filteredRows.length === 0) {
              toast.error("Sem dados para exportar");
              return;
            }
            downloadPDF({
              filename: `financeiro-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`,
              title: "Relatório Financeiro — Movimentações",
              subtitle: `${filteredRows.length} lançamento(s) · Entradas ${brl(totals.entradas)} · Saídas ${brl(totals.saidas)} · Caixa ${brl(totals.caixa)}`,
              head: ["Data", "Descrição", "Detalhes", "Tipo", "Valor"],
              body: filteredRows.map((r) => [new Date(r.date).toLocaleDateString("pt-BR"), r.description, r.meta || "—", r.isOut ? "Saída" : "Entrada", `${r.isOut ? "− " : "+ "}${brl(r.amount)}`]),
              foot: ["", "", "", "Caixa", brl(totals.caixa)]
            });
            toast.success("PDF baixado");
          }, className: "text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-foreground text-background font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
            " PDF"
          ] })
        ] })
      ] }),
      filteredRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "Sem movimentações." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: filteredRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-4 flex justify-between items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-sm flex items-center gap-2 flex-wrap", children: [
            r.kind === "comissao" && /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5 text-primary" }),
            r.kind === "pedido" && /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-3.5 w-3.5 text-primary" }),
            r.description,
            r.kind === "manual" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] uppercase tracking-wide bg-muted px-1.5 py-0.5 rounded-full", children: "manual" })
          ] }),
          r.meta && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5 break-words", children: r.meta }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-1", children: formatDate(r.date) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-bold whitespace-nowrap ${r.isOut ? "text-destructive" : "text-success"}`, children: [
            r.isOut ? "− " : "+ ",
            brl(r.amount)
          ] }),
          r.txRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setEditing(r.txRef);
              setShowForm(true);
            }, className: "p-1.5 rounded-lg hover:bg-muted text-muted-foreground", title: "Editar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
              const {
                confirmDialog
              } = await import("./AdminLayout-De_VAja0.js").then((n) => n.C);
              if (await confirmDialog({
                title: "Excluir lançamento?",
                confirmLabel: "Excluir"
              })) {
                deleteTransaction(r.txRef.id);
                toast.success("Removido");
              }
            }, className: "p-1.5 rounded-lg hover:bg-destructive/10 text-destructive", title: "Excluir", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] }),
          r.affiliateSaleId && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
            const {
              confirmDialog
            } = await import("./AdminLayout-De_VAja0.js").then((n) => n.C);
            if (await confirmDialog({
              title: "Excluir venda de afiliada?",
              description: "A comissão correspondente também será removida.",
              confirmLabel: "Excluir"
            })) {
              deleteAffiliateSale(r.affiliateSaleId);
              toast.success("Venda removida");
            }
          }, className: "p-1.5 rounded-lg hover:bg-destructive/10 text-destructive", title: "Excluir venda de afiliada", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AffiliateReport, { from: reportFrom, to: reportTo, onFromChange: setReportFrom, onToChange: setReportTo }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(TransactionForm, { editing, onClose: () => {
      setShowForm(false);
      setEditing(null);
    }, onSave: (payload) => {
      if (editing) {
        updateTransaction(editing.id, payload);
        toast.success("Lançamento atualizado");
      } else {
        addTransaction(payload);
        toast.success("Lançamento registrado");
      }
      setShowForm(false);
      setEditing(null);
    } })
  ] });
}
function TransactionForm({
  editing,
  onClose,
  onSave
}) {
  const products = useStore((s) => s.products);
  const affiliates = useStore((s) => s.affiliates);
  const [kind, setKind] = reactExports.useState(editing?.kind || "entrada");
  const [category, setCategory] = reactExports.useState(editing?.category || "venda");
  const [description, setDescription] = reactExports.useState(editing?.description || "");
  const [amount, setAmount] = reactExports.useState(editing ? String(editing.amount) : "");
  const [date, setDate] = reactExports.useState(editing ? editing.date.slice(0, 10) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [affiliateId, setAffiliateId] = reactExports.useState(editing?.affiliateId || "");
  const [notes, setNotes] = reactExports.useState(editing?.notes || "");
  const [items, setItems] = reactExports.useState(() => {
    if (editing?.productSummary) return [];
    return [];
  });
  const productSummary = items.filter((i) => i.productId).map((i) => {
    const p = products.find((pp) => pp.id === i.productId);
    return p ? `${i.qty}× ${p.name}` : "";
  }).filter(Boolean).join(", ") || editing?.productSummary;
  const totalFromItems = items.reduce((a, i) => {
    const p = products.find((pp) => pp.id === i.productId);
    return p ? a + p.price * i.qty : a;
  }, 0);
  const submit = (e) => {
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
      affiliateId: affiliateId || void 0,
      productSummary: productSummary || void 0,
      notes: notes.trim() || void 0
    });
  };
  const useItemsTotal = () => {
    if (totalFromItems > 0) setAmount(String(totalFromItems.toFixed(2)));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 animate-overlay-in", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, onClick: (e) => e.stopPropagation(), className: "bg-card rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3 animate-modal-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: editing ? "Editar lançamento" : "Novo lançamento" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "p-1.5 rounded-lg hover:bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setKind("entrada"), className: `h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${kind === "entrada" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
        " Entrada"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setKind("saida"), className: `h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${kind === "saida" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4" }),
        " Saída"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Categoria", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "input", children: Object.keys(CATEGORY_LABEL).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: CATEGORY_LABEL[k] }, k)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Descrição *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: description, onChange: (e) => setDescription(e.target.value), className: "input", placeholder: "Ex.: Venda balcão · cliente Maria", required: true }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Valor (R$) *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", min: "0", value: amount, onChange: (e) => setAmount(e.target.value), className: "input", required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Data", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "input" }) })
    ] }),
    (category === "venda" || category === "comissao_afiliada") && affiliates.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Afiliada (opcional)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: affiliateId, onChange: (e) => setAffiliateId(e.target.value), className: "input", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Nenhuma —" }),
      affiliates.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a.id, children: a.name }, a.id))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-3 bg-muted/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold", children: "Produtos vendidos (opcional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setItems([...items, {
          productId: "",
          qty: 1
        }]), className: "text-xs flex items-center gap-1 text-primary font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
          " Adicionar"
        ] })
      ] }),
      items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Adicione produtos para gerar o resumo automaticamente." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        items.map((it, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: it.productId, onChange: (e) => setItems(items.map((x, i) => i === idx ? {
            ...x,
            productId: e.target.value
          } : x)), className: "input flex-1 !mt-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Selecione..." }),
            products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.id, children: [
              p.name,
              " — ",
              brl(p.price)
            ] }, p.id))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "1", value: it.qty, onChange: (e) => setItems(items.map((x, i) => i === idx ? {
            ...x,
            qty: parseInt(e.target.value) || 1
          } : x)), className: "input !mt-0 w-16 text-center" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setItems(items.filter((_, i) => i !== idx)), className: "p-1.5 rounded-lg text-destructive hover:bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }, idx)),
        totalFromItems > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: useItemsTotal, className: "text-xs text-primary font-semibold underline", children: [
          "Usar total dos produtos: ",
          brl(totalFromItems)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Observações", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 2, className: "input !h-auto py-2" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "flex-1 h-11 rounded-full border border-border font-semibold", children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 h-11 rounded-full gradient-primary text-primary-foreground font-semibold", children: "Salvar" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `.input{margin-top:4px;width:100%;height:40px;padding:0 12px;border-radius:10px;background:var(--background);border:1px solid var(--border);outline:none;font-size:14px}` })
  ] }) });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label }),
    children
  ] });
}
function AffiliateReport({
  from,
  to,
  onFromChange,
  onToChange
}) {
  const affiliates = useStore((s) => s.affiliates);
  const affiliateSales = useStore((s) => s.affiliateSales);
  const transactions = useStore((s) => s.transactions);
  const report = reactExports.useMemo(() => {
    const start = /* @__PURE__ */ new Date(from + "T00:00:00");
    const end = /* @__PURE__ */ new Date(to + "T23:59:59");
    const inRange = (iso) => {
      const d = new Date(iso);
      return d >= start && d <= end;
    };
    const rows = affiliates.map((a) => {
      const sales = affiliateSales.filter((s) => s.affiliateId === a.id && inRange(s.createdAt));
      const confirmed = sales.filter((s) => s.status === "confirmada");
      const pending = sales.filter((s) => s.status === "pendente");
      const canceled = sales.filter((s) => s.status === "cancelada");
      const revenueConfirmed = confirmed.reduce((acc, s) => acc + s.saleValue, 0);
      const commissionConfirmed = confirmed.reduce((acc, s) => acc + s.commissionEarned, 0);
      const revenuePending = pending.reduce((acc, s) => acc + s.saleValue, 0);
      const commissionPending = pending.reduce((acc, s) => acc + s.commissionEarned, 0);
      const manualPaid = transactions.filter((t) => t.affiliateId === a.id && t.kind === "saida" && t.category === "comissao_afiliada" && inRange(t.date)).reduce((acc, t) => acc + t.amount, 0);
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
        commissionToPay: commissionConfirmed - manualPaid
      };
    }).filter((r) => r.salesCount > 0 || r.commissionPaid > 0).sort((a, b) => b.commissionConfirmed - a.commissionConfirmed);
    const totals = rows.reduce((acc, r) => ({
      sales: acc.sales + r.salesCount,
      revenue: acc.revenue + r.revenueConfirmed,
      commission: acc.commission + r.commissionConfirmed,
      paid: acc.paid + r.commissionPaid,
      toPay: acc.toPay + r.commissionToPay
    }), {
      sales: 0,
      revenue: 0,
      commission: 0,
      paid: 0,
      toPay: 0
    });
    return {
      rows,
      totals
    };
  }, [affiliates, affiliateSales, transactions, from, to]);
  const head = ["Afiliada", "Vendas", "Confirmadas", "Pendentes", "Canceladas", "Faturamento (R$)", "Comissão (R$)", "Paga (R$)", "A pagar (R$)"];
  const exportCsv = () => {
    if (report.rows.length === 0) {
      toast.error("Sem dados no período");
      return;
    }
    const body = report.rows.map((r) => [r.name, r.salesCount, r.confirmedCount, r.pendingCount, r.canceledCount, r.revenueConfirmed.toFixed(2).replace(".", ","), r.commissionConfirmed.toFixed(2).replace(".", ","), r.commissionPaid.toFixed(2).replace(".", ","), r.commissionToPay.toFixed(2).replace(".", ",")]);
    const totals = ["TOTAIS", report.totals.sales, "", "", "", report.totals.revenue.toFixed(2).replace(".", ","), report.totals.commission.toFixed(2).replace(".", ","), report.totals.paid.toFixed(2).replace(".", ","), report.totals.toPay.toFixed(2).replace(".", ",")];
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
      body: report.rows.map((r) => [r.name, r.salesCount, r.confirmedCount, r.pendingCount, r.canceledCount, brl(r.revenueConfirmed), brl(r.commissionConfirmed), brl(r.commissionPaid), brl(r.commissionToPay)]),
      foot: ["TOTAIS", report.totals.sales, "", "", "", brl(report.totals.revenue), brl(report.totals.commission), brl(report.totals.paid), brl(report.totals.toPay)]
    });
    toast.success("PDF baixado");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card mt-4 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-primary" }),
        " Relatório por afiliada"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "De" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: from, onChange: (e) => onFromChange(e.target.value), className: "h-8 px-2 rounded-lg bg-background border border-border text-xs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Até" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: to, onChange: (e) => onToChange(e.target.value), className: "h-8 px-2 rounded-lg bg-background border border-border text-xs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: exportCsv, className: "text-xs flex items-center gap-1 bg-muted hover:bg-muted/70 px-3 py-1.5 rounded-full font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
          " CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: exportPdf, className: "text-xs flex items-center gap-1 bg-foreground text-background px-3 py-1.5 rounded-full font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
          " PDF"
        ] })
      ] })
    ] }),
    report.rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-muted-foreground text-sm", children: "Nenhuma venda de afiliada no período." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2", children: "Afiliada" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-2 py-2", children: "Vendas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2", children: "Faturamento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2", children: "Comissão" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2", children: "Paga" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2", children: "A pagar" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: report.rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 font-medium", children: [
          r.name,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
            r.confirmedCount,
            " conf. · ",
            r.pendingCount,
            " pend. ·",
            " ",
            r.canceledCount,
            " canc."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center px-2 py-2", children: r.salesCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right px-2 py-2", children: brl(r.revenueConfirmed) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right px-2 py-2 text-gold font-semibold", children: brl(r.commissionConfirmed) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right px-2 py-2 text-success", children: brl(r.commissionPaid) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right px-4 py-2 font-bold", children: brl(r.commissionToPay) })
      ] }, r.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { className: "bg-muted/30 font-bold text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: "Totais" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center px-2 py-2", children: report.totals.sales }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right px-2 py-2", children: brl(report.totals.revenue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right px-2 py-2 text-gold", children: brl(report.totals.commission) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right px-2 py-2 text-success", children: brl(report.totals.paid) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right px-4 py-2", children: brl(report.totals.toPay) })
      ] }) })
    ] }) }) })
  ] });
}
export {
  Page as component
};
