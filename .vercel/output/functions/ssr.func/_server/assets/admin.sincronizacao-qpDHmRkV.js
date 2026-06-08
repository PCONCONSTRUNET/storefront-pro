import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { A as AdminLayout, F as FileText } from "./AdminLayout-De_VAja0.js";
import { g as createLucideIcon, O as getSyncStatusFn, o as cn, F as CircleAlert, C as CircleCheck, y as CreditCard } from "./router-CnaK_EO9.js";
import { R as RefreshCw } from "./refresh-cw-Bf96sPuo.js";
import { S as ShoppingCart } from "./shopping-cart-B-gXG7d3.js";
import { D as DollarSign } from "./dollar-sign-UAWpRRk1.js";
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
import "./settings-QGrcKFnZ.js";
import "./log-out-DGsS6HUi.js";
const __iconNode = [
  [
    "path",
    {
      d: "M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2",
      key: "q3hayz"
    }
  ],
  ["path", { d: "m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06", key: "1go1hn" }],
  ["path", { d: "m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8", key: "qlwsc0" }]
];
const Webhook = createLucideIcon("webhook", __iconNode);
function fmt(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
function relative(ts) {
  if (!ts) return null;
  const diff = (Date.now() - new Date(ts).getTime()) / 1e3;
  if (diff < 60) return `${Math.floor(diff)}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}
function freshness(ts) {
  if (!ts) return "stale";
  const mins = (Date.now() - new Date(ts).getTime()) / 6e4;
  if (mins < 60) return "ok";
  if (mins < 60 * 24) return "warn";
  return "stale";
}
function StatusBadge({
  ts
}) {
  const s = freshness(ts);
  const cfg = {
    ok: {
      color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      label: "Em dia"
    },
    warn: {
      color: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
      label: "Atenção"
    },
    stale: {
      color: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
      label: "Sem atividade"
    }
  }[s];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide", cfg.color), children: cfg.label });
}
function Card({
  icon: Icon,
  title,
  stat
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-2xl p-4 space-y-2 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { ts: stat.lastAt })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold tabular-nums", children: stat.count.toLocaleString("pt-BR") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
      "Último registro: ",
      fmt(stat.lastAt),
      stat.lastAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-muted-foreground/70", children: [
        "(",
        relative(stat.lastAt),
        ")"
      ] })
    ] })
  ] });
}
function SyncPage() {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState(null);
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await getSyncStatusFn();
      setData(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 15e3);
    return () => window.clearInterval(t);
  }, [load]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLayout, { title: "Sincronização", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Estado em tempo real do banco — atualiza a cada 15s. Verifique se pedidos, pagamentos, financeiro e logs estão chegando." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => void load(), disabled: loading, className: "inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("h-4 w-4", loading && "animate-spin") }),
        "Atualizar"
      ] })
    ] }),
    (err || data?.error) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-xl p-3 text-sm flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "break-all", children: err || data?.error })
    ] }),
    data?.tables && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: ShoppingCart, title: "Pedidos", stat: data.tables.orders }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: CircleCheck, title: "Pedidos pagos", stat: data.tables.paidOrders }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: CreditCard, title: "Eventos de pagamento", stat: data.tables.paymentEvents }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: DollarSign, title: "Financeiro (transações)", stat: data.tables.transactions }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: FileText, title: "Logs de auditoria", stat: data.tables.activityLogs })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Webhook, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Último webhook Mercado Pago" })
          ] }),
          data.lastWebhook && /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { ts: data.lastWebhook.processedAt })
        ] }),
        data.lastWebhook ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tipo", value: data.lastWebhook.eventType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Processado em", value: `${fmt(data.lastWebhook.processedAt)} (${relative(data.lastWebhook.processedAt)})` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "ID do evento", value: data.lastWebhook.mpEventId, mono: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "ID pagamento MP", value: data.lastWebhook.mpPaymentId ?? "—", mono: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "ID pedido", value: data.lastWebhook.orderId ?? "—", mono: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status do pedido", value: data.lastWebhook.orderStatus ?? "—" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum webhook processado ainda." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground text-right", children: [
        "Hora do servidor: ",
        fmt(data.serverTime)
      ] })
    ] })
  ] }) });
}
function Field({
  label,
  value,
  mono
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground font-bold", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("truncate", mono && "font-mono text-xs"), children: value })
  ] });
}
export {
  SyncPage as component
};
