import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { g as createLucideIcon, u as useStore, s as selectCurrentCustomer, q as useStoreHydrated, S as StoreLayout, R as Receipt, d as Link, L as LoaderCircle, v as brl, F as CircleAlert, G as CircleX, E as Clock, C as CircleCheck, y as CreditCard, Q as QrCode, I as formatDate, e as Copy, t as toast } from "./router-CbsSSRKz.js";
import { s as supabase } from "./adminHelpers.server-BhLg7GIA.js";
import { R as RefreshCw } from "./refresh-cw-quCvE8C7.js";
import { C as ChevronDown } from "./chevron-down-B1Nu5dJQ.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./client.server-C7GAOqxY.js";
const __iconNode = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]];
const ChevronUp = createLucideIcon("chevron-up", __iconNode);
const STATUS = {
  approved: {
    label: "Aprovado",
    cls: "bg-green-100 text-green-700",
    Icon: CircleCheck
  },
  pending: {
    label: "Pendente",
    cls: "bg-amber-100 text-amber-700",
    Icon: Clock
  },
  rejected: {
    label: "Recusado",
    cls: "bg-destructive/10 text-destructive",
    Icon: CircleX
  },
  cancelled: {
    label: "Cancelado",
    cls: "bg-muted text-muted-foreground",
    Icon: CircleX
  },
  refunded: {
    label: "Reembolsado",
    cls: "bg-blue-100 text-blue-700",
    Icon: RefreshCw
  }
};
function Page() {
  const customer = useStore(selectCurrentCustomer);
  const hydrated = useStoreHydrated();
  const [txs, setTxs] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [filter, setFilter] = reactExports.useState("all");
  const [openId, setOpenId] = reactExports.useState(null);
  const load = async () => {
    if (!customer) return;
    setLoading(true);
    setError(null);
    const {
      data,
      error: error2
    } = await supabase.from("orders").select("id, created_at, paid_at, total, subtotal, discount, shipping, payment_method, payment_status, mp_payment_id, items, customer_name, customer_email").eq("customer_email", customer.email).order("created_at", {
      ascending: false
    }).limit(200);
    if (error2) setError(error2.message);
    else setTxs(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    if (hydrated && customer) load();
  }, [hydrated, customer?.email]);
  if (hydrated && !customer) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto text-center py-20 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-12 w-12 text-primary mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold mt-3", children: "Faça login para ver suas transações" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "mt-4 inline-block bg-primary text-primary-foreground rounded-full px-6 py-3 font-semibold", children: "Entrar" })
    ] }) });
  }
  const filtered = txs.filter((t) => filter === "all" ? true : t.payment_status === filter);
  const totalApproved = txs.filter((t) => t.payment_status === "approved").reduce((s, t) => s + Number(t.total), 0);
  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado`);
    } catch {
      toast.error("Falha ao copiar");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-6 w-6 text-primary" }),
          " Histórico de transações"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Pagamentos via Pix e Cartão." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: load, disabled: loading, className: "h-10 px-3 rounded-full bg-muted hover:bg-muted/70 text-sm font-medium flex items-center gap-2 disabled:opacity-50", children: [
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
        "Atualizar"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Total", value: String(txs.length) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Aprovadas", value: String(txs.filter((t) => t.payment_status === "approved").length) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Pago", value: brl(totalApproved) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-4 overflow-x-auto pb-1", children: [["all", "Todas"], ["approved", "Aprovadas"], ["pending", "Pendentes"], ["rejected", "Recusadas"]].map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(k), className: `h-9 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filter === k ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"}`, children: label }, k)) }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-destructive/10 text-destructive rounded-2xl p-4 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Não foi possível carregar suas transações" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-90 mt-0.5", children: error })
      ] })
    ] }) : loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 bg-muted rounded-2xl animate-pulse" }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground bg-card rounded-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-10 w-10 mx-auto mb-2 opacity-50" }),
      "Nenhuma transação encontrada."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: filtered.map((t) => {
      const meta = STATUS[t.payment_status] ?? {
        label: t.payment_status,
        cls: "bg-muted text-muted-foreground",
        Icon: Clock
      };
      const isCard = t.payment_method === "card";
      const isOpen = openId === t.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "bg-card rounded-2xl shadow-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setOpenId(isOpen ? null : t.id), className: "w-full text-left p-4 hover:bg-muted/30 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-10 w-10 rounded-xl grid place-items-center shrink-0 ${isCard ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`, children: isCard ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: isCard ? "Cartão de crédito" : "Pix" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${meta.cls}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(meta.Icon, { className: "h-3 w-3" }),
                " ",
                meta.label
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5 truncate", children: [
              "#",
              t.id.slice(0, 8),
              " · ",
              formatDate(t.created_at)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-primary", children: brl(Number(t.total)) }),
            isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground ml-auto mt-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground ml-auto mt-1" })
          ] })
        ] }) }),
        isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 border-t border-border pt-3 space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "ID do pedido", value: t.id, mono: true, onCopy: () => copy(t.id, "ID do pedido") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "ID do pagamento (MP)", value: t.mp_payment_id ?? "—", mono: true, onCopy: t.mp_payment_id ? () => copy(t.mp_payment_id, "ID do pagamento") : void 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Criado em", value: formatDate(t.created_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Pago em", value: t.paid_at ? formatDate(t.paid_at) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 pt-2 border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mini, { label: "Subtotal", value: brl(Number(t.subtotal)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mini, { label: "Desconto", value: `- ${brl(Number(t.discount))}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mini, { label: "Frete", value: brl(Number(t.shipping)) })
          ] }),
          Array.isArray(t.items) && t.items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground mb-1", children: "Itens" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: t.items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate pr-2", children: [
                it.quantity ?? 1,
                "x ",
                it.name ?? "Item"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: brl(Number(it.price ?? 0) * Number(it.quantity ?? 1)) })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/pedido/$id", params: {
            id: t.id
          }, className: "inline-block text-xs font-semibold text-primary underline mt-1", children: "Ver detalhes do pedido" })
        ] })
      ] }, t.id);
    }) })
  ] }) });
}
function SummaryCard({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-3 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground font-medium", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm mt-0.5 truncate", children: value })
  ] });
}
function DetailRow({
  label,
  value,
  mono,
  onCopy
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground shrink-0", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs ${mono ? "font-mono" : ""} truncate`, children: value }),
      onCopy && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCopy, type: "button", className: "h-6 w-6 grid place-items-center rounded-md hover:bg-muted text-muted-foreground", "aria-label": "Copiar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }) })
    ] })
  ] });
}
function Mini({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground uppercase", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold", children: value })
  ] });
}
export {
  Page as component
};
