import { U as jsxRuntimeExports, r as reactExports } from "../server.js";
import { g as createLucideIcon, W as normalizeOrderStatus, N as logoUrl, Y as getOrderStatusLabel, u as useStore, Z as Route, _ as normalizeDeliveryStatus, E as Clock, C as CircleCheck, P as Package, G as CircleX, v as brl$1, a as Search, X, $ as ORDER_STATUS_LABEL, a0 as DELIVERY_STATUS_LABEL, a1 as Truck, I as formatDate, y as CreditCard, t as toast, m as MapPin, e as Copy, z as Trash2 } from "./router-yLgiv1p7.js";
import { A as AdminLayout } from "./AdminLayout-B0sSU-Ve.js";
import { M as Modal } from "./AdminModal-CP04OAau.js";
import { D as DollarSign } from "./dollar-sign-DqvXPngu.js";
import { R as RefreshCw } from "./refresh-cw-B3gGSLit.js";
import { F as Funnel } from "./funnel-P2zaDa9z.js";
import { M as Mail } from "./mail-KLfYfUVi.js";
import { P as Phone } from "./phone-CIQ-tKUP.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./adminHelpers.server-BhLg7GIA.js";
import "./client.server-C7GAOqxY.js";
import "./layout-dashboard-XIrZfteB.js";
import "./shopping-cart-CUZGzorf.js";
import "./settings-aGUEQ0PF.js";
import "./log-out-KcgBpaKW.js";
const __iconNode$2 = [
  ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
  ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
  ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
  ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }]
];
const Hash = createLucideIcon("hash", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M2 5h20", key: "1fs1ex" }],
  ["path", { d: "M6 12h12", key: "8npq4p" }],
  ["path", { d: "M9 19h6", key: "456am0" }]
];
const ListFilter = createLucideIcon("list-filter", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
      key: "143wyd"
    }
  ],
  ["path", { d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6", key: "1itne7" }],
  ["rect", { x: "6", y: "14", width: "12", height: "8", rx: "1", key: "1ue0tg" }]
];
const Printer = createLucideIcon("printer", __iconNode);
function WhatsAppIcon({
  className = "h-4 w-4",
  filled = true
}) {
  if (filled) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        viewBox: "0 0 32 32",
        className,
        "aria-hidden": "true",
        focusable: "false",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              fill: "#25D366",
              d: "M16.001 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.59 4.46 1.72 6.4L3.2 28.8l6.55-1.71a12.74 12.74 0 0 0 6.25 1.61h.01c7.06 0 12.8-5.73 12.8-12.8s-5.74-12.7-12.8-12.7Z"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              fill: "#fff",
              d: "M22.84 19.4c-.31-.16-1.84-.91-2.13-1.01-.29-.11-.5-.16-.71.16-.21.31-.81 1.01-.99 1.22-.18.21-.36.24-.67.08-.31-.16-1.32-.49-2.51-1.56-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.14-.63.14-.14.31-.36.47-.54.16-.18.21-.31.31-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54l-.61-.01c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.62 0 1.55 1.13 3.04 1.29 3.25.16.21 2.22 3.39 5.39 4.75.75.32 1.34.52 1.8.67.76.24 1.45.21 2 .13.61-.09 1.84-.75 2.1-1.47.26-.72.26-1.34.18-1.47-.08-.13-.29-.21-.6-.37Z"
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 32 32", className, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      fill: "currentColor",
      d: "M16.001 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.59 4.46 1.72 6.4L3.2 28.8l6.55-1.71a12.74 12.74 0 0 0 6.25 1.61h.01c7.06 0 12.8-5.73 12.8-12.8s-5.74-12.7-12.8-12.7Zm6.84 16.2c-.31-.16-1.84-.91-2.13-1.01-.29-.11-.5-.16-.71.16-.21.31-.81 1.01-.99 1.22-.18.21-.36.24-.67.08-.31-.16-1.32-.49-2.51-1.56-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.14-.63.14-.14.31-.36.47-.54.16-.18.21-.31.31-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54l-.61-.01c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.62 0 1.55 1.13 3.04 1.29 3.25.16.21 2.22 3.39 5.39 4.75.75.32 1.34.52 1.8.67.76.24 1.45.21 2 .13.61-.09 1.84-.75 2.1-1.47.26-.72.26-1.34.18-1.47-.08-.13-.29-.21-.6-.37Z"
    }
  ) });
}
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmt = (d) => new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function printOrderReceipt(order, settings) {
  const status2 = normalizeOrderStatus(order.status);
  const logoSrc = new URL(logoUrl, window.location.origin).href;
  const shortId = String(order.id).slice(0, 8).toUpperCase();
  const itemsHtml = order.items.map(
    (it) => `
      <tr>
        <td>${esc(it.name)}</td>
        <td class="num">${it.quantity}</td>
        <td class="num">${brl(it.price)}</td>
        <td class="num">${brl(it.price * it.quantity)}</td>
      </tr>`
  ).join("");
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Recibo Pedido #${shortId} — ${esc(settings.storeName)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #f4f4f5; color: #111; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .sheet { width: 210mm; min-height: 297mm; margin: 16px auto; padding: 22mm 18mm; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 2px solid #ec4899; padding-bottom: 14px; margin-bottom: 18px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { width: 56px; height: 56px; object-fit: contain; }
  .brand h1 { margin: 0; font-size: 18px; color: #ec4899; }
  .brand .meta { font-size: 11px; color: #555; line-height: 1.5; }
  .doc-info { text-align: right; font-size: 11px; color: #444; }
  .doc-info .num { font-size: 16px; font-weight: 700; color: #111; }
  .doc-info .badge { display: inline-block; margin-top: 4px; padding: 2px 8px; border-radius: 999px; background: #fef3c7; color: #92400e; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
  .badge.pago { background: #d1fae5; color: #065f46; }
  .badge.cancelado { background: #fee2e2; color: #991b1b; }
  h2 { margin: 18px 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #ec4899; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; font-size: 12px; line-height: 1.6; }
  .grid p { margin: 0; }
  .grid strong { color: #555; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
  th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; vertical-align: top; }
  th { background: #fafafa; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #555; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  .totals { margin-top: 10px; margin-left: auto; width: 260px; font-size: 12px; }
  .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals .total { border-top: 2px solid #111; margin-top: 6px; padding-top: 8px; font-size: 16px; font-weight: 700; color: #ec4899; }
  .notes { margin-top: 14px; padding: 10px 12px; border-left: 3px solid #f59e0b; background: #fffbeb; font-size: 12px; }
  footer { margin-top: 28px; text-align: center; font-size: 10px; color: #777; border-top: 1px dashed #ddd; padding-top: 10px; }
  .actions { position: fixed; top: 12px; right: 12px; display: flex; gap: 8px; }
  .actions button { padding: 8px 14px; border-radius: 999px; border: 0; background: #ec4899; color: #fff; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(236,72,153,.3); }
  .actions button.secondary { background: #fff; color: #111; border: 1px solid #ddd; box-shadow: none; }
  @media print {
    body { background: #fff; }
    .sheet { margin: 0; box-shadow: none; padding: 14mm; }
    .actions { display: none; }
    @page { size: A4; margin: 10mm; }
  }
</style>
</head>
<body>
  <div class="actions">
    <button class="secondary" onclick="window.close()">Fechar</button>
    <button onclick="window.print()">Imprimir</button>
  </div>
  <div class="sheet">
    <header>
      <div class="brand">
        <img src="${esc(logoSrc)}" alt="logo" onerror="this.style.display='none'" />
        <div>
          <h1>${esc(settings.storeName)}</h1>
          <div class="meta">
            ${esc(settings.address)}<br/>
            ${esc(settings.whatsapp)} ${settings.instagram ? "· " + esc(settings.instagram) : ""}
          </div>
        </div>
      </div>
      <div class="doc-info">
        <div>RECIBO DE PEDIDO</div>
        <div class="num">#${shortId}</div>
        <div>Emitido em ${fmt((/* @__PURE__ */ new Date()).toISOString())}</div>
        <div class="badge ${status2 === "pago" || status2 === "concluido" ? "pago" : ""} ${status2 === "cancelado" || status2 === "reembolsado" ? "cancelado" : ""}">
          ${esc(getOrderStatusLabel(status2))}
        </div>
      </div>
    </header>

    <div class="grid">
      <div>
        <h2>Cliente</h2>
        <p><strong>Nome:</strong> ${esc(order.customerName)}</p>
        <p><strong>E-mail:</strong> ${esc(order.customerEmail)}</p>
        <p><strong>Telefone:</strong> ${esc(order.customerPhone)}</p>
      </div>
      <div>
        <h2>${order.deliveryMethod === "retirada" ? "Retirada no ateliê" : "Entrega"}</h2>
        <p>${esc(order.address || "—")}</p>
        <p style="margin-top:6px"><strong>Pagamento:</strong> ${esc(order.paymentMethod.toUpperCase())}</p>
        ${order.paidAt ? `<p><strong>Pago em:</strong> ${fmt(order.paidAt)}</p>` : ""}
        ${order.mpPaymentId ? `<p><strong>ID Pagamento:</strong> ${esc(order.mpPaymentId)}</p>` : ""}
        <p><strong>Pedido criado:</strong> ${fmt(order.createdAt)}</p>
      </div>
    </div>

    <h2>Itens</h2>
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th class="num">Qtd</th>
          <th class="num">Unitário</th>
          <th class="num">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${brl(order.subtotal)}</span></div>
      ${order.discount > 0 ? `<div class="row"><span>Desconto</span><span>- ${brl(order.discount)}</span></div>` : ""}
      ${order.shipping > 0 ? `<div class="row"><span>Frete</span><span>${brl(order.shipping)}</span></div>` : ""}
      <div class="row total"><span>Total</span><span>${brl(order.total)}</span></div>
    </div>

    ${order.notes ? `<div class="notes"><strong>Observações do cliente:</strong><br/>${esc(order.notes).replace(/\n/g, "<br/>")}</div>` : ""}

    <footer>
      Obrigado por comprar com a ${esc(settings.storeName)} 💖<br/>
      Em caso de dúvidas, fale conosco no WhatsApp ${esc(settings.whatsapp)}.
    </footer>
  </div>
  <script>setTimeout(function(){ try { window.focus(); window.print(); } catch(e){} }, 400);<\/script>
</body>
</html>`;
  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) {
    alert("Permita pop-ups para abrir o recibo.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
const statuses = ["aguardando_pagamento", "pago", "em_separacao", "saiu_para_entrega", "concluido", "cancelado", "reembolsado"];
const STATUS_STYLE = {
  aguardando_pagamento: "bg-amber-100 text-amber-800 border-amber-200",
  pago: "bg-emerald-100 text-emerald-800 border-emerald-200",
  em_separacao: "bg-blue-100 text-blue-800 border-blue-200",
  saiu_para_entrega: "bg-indigo-100 text-indigo-800 border-indigo-200",
  concluido: "bg-green-100 text-green-800 border-green-200",
  cancelado: "bg-red-100 text-red-800 border-red-200",
  reembolsado: "bg-slate-200 text-slate-800 border-slate-300"
};
const STATUS_ICON = {
  aguardando_pagamento: Clock,
  pago: CircleCheck,
  em_separacao: Package,
  saiu_para_entrega: Truck,
  concluido: CircleCheck,
  cancelado: CircleX,
  reembolsado: RefreshCw
};
function Page() {
  const {
    orders,
    updateOrderStatus,
    updateDeliveryStatus,
    deleteOrder,
    sync,
    settings
  } = useStore();
  reactExports.useEffect(() => {
    sync();
  }, [sync]);
  const {
    q: initialQ
  } = Route.useSearch();
  const [filter, setFilter] = reactExports.useState("todos");
  const [statusFilter, setStatusFilter] = reactExports.useState("");
  const [deliveryFilter, setDeliveryFilter] = reactExports.useState("");
  const [methodFilter, setMethodFilter] = reactExports.useState("");
  const [period, setPeriod] = reactExports.useState("todos");
  const [selected, setSelected] = reactExports.useState(null);
  const [query, setQuery] = reactExports.useState(initialQ);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setQuery(initialQ);
    if (initialQ) setFilter("todos");
  }, [initialQ]);
  const term = query.trim().toLowerCase();
  const digits = term.replace(/\D/g, "");
  const list = reactExports.useMemo(() => {
    const now = Date.now();
    const periodMs = period === "hoje" ? 864e5 : period === "7d" ? 7 * 864e5 : period === "30d" ? 30 * 864e5 : 0;
    return orders.filter((o) => {
      const status2 = normalizeOrderStatus(o.status);
      if (filter === "pendentes" && status2 !== "aguardando_pagamento") return false;
      if (filter === "pagos" && status2 !== "pago") return false;
      if (filter === "em_andamento" && !["em_separacao", "saiu_para_entrega"].includes(status2)) return false;
      if (filter === "concluidos" && status2 !== "concluido") return false;
      if (filter === "cancelados" && !["cancelado", "reembolsado"].includes(status2)) return false;
      if (statusFilter && status2 !== statusFilter) return false;
      if (deliveryFilter && normalizeDeliveryStatus(o.deliveryStatus) !== deliveryFilter) return false;
      if (methodFilter && o.paymentMethod !== methodFilter) return false;
      if (periodMs && now - new Date(o.createdAt).getTime() > periodMs) return false;
      if (!term) return true;
      return o.id.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term) || o.customerEmail.toLowerCase().includes(term) || digits && o.customerPhone.replace(/\D/g, "").includes(digits) || (o.mpPaymentId || "").toLowerCase().includes(term);
    });
  }, [orders, filter, statusFilter, deliveryFilter, methodFilter, period, term, digits]);
  const stats = reactExports.useMemo(() => {
    const pending = orders.filter((o) => normalizeOrderStatus(o.status) === "aguardando_pagamento");
    const paid = orders.filter((o) => normalizeOrderStatus(o.status) === "pago");
    const inProgress = orders.filter((o) => ["em_separacao", "saiu_para_entrega"].includes(normalizeOrderStatus(o.status)));
    const cancelled = orders.filter((o) => ["cancelado", "reembolsado"].includes(normalizeOrderStatus(o.status)));
    const revenue = orders.filter((o) => ["pago", "em_separacao", "saiu_para_entrega", "concluido"].includes(normalizeOrderStatus(o.status))).reduce((a, o) => a + o.total, 0);
    return {
      total: orders.length,
      pending: pending.length,
      paid: paid.length,
      inProgress: inProgress.length,
      cancelled: cancelled.length,
      revenue
    };
  }, [orders]);
  const order = orders.find((o) => o.id === selected);
  const onWhatsApp = (o) => {
    const phone = o.customerPhone.replace(/\D/g, "");
    const txt = encodeURIComponent(`Olá ${o.customerName.split(" ")[0]}! Sobre seu pedido #${String(o.id).slice(0, 8)}…`);
    window.open(`https://wa.me/55${phone}?text=${txt}`, "_blank");
  };
  const copy = (txt, label = "Copiado!") => {
    navigator.clipboard.writeText(txt);
    toast.success(label);
  };
  const exportCsv = () => {
    const header = ["id", "data", "cliente", "telefone", "email", "metodo", "entrega", "status", "subtotal", "frete", "desconto", "total", "pago_em", "mp_id"];
    const rows = list.map((o) => [o.id, o.createdAt, o.customerName, o.customerPhone, o.customerEmail, o.paymentMethod, o.deliveryMethod, o.status, o.subtotal, o.shipping, o.discount, o.total, o.paidAt || "", o.mpPaymentId || ""]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Pedidos", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Todos", value: stats.total, icon: ListFilter, color: "slate", onClick: () => setFilter("todos"), active: filter === "todos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pendentes", value: stats.pending, icon: Clock, color: "amber", onClick: () => setFilter(filter === "pendentes" ? "todos" : "pendentes"), active: filter === "pendentes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pagos", value: stats.paid, icon: CircleCheck, color: "emerald", onClick: () => setFilter(filter === "pagos" ? "todos" : "pagos"), active: filter === "pagos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Em andamento", value: stats.inProgress, icon: Package, color: "blue", onClick: () => setFilter(filter === "em_andamento" ? "todos" : "em_andamento"), active: filter === "em_andamento" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Cancelados", value: stats.cancelled, icon: CircleX, color: "red", onClick: () => setFilter(filter === "cancelados" ? "todos" : "cancelados"), active: filter === "cancelados" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card p-3 mb-3 flex flex-wrap items-center gap-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-3.5 w-3.5" }),
        " Faturamento confirmado:",
        " ",
        brl$1(stats.revenue)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
        "Mostrando ",
        list.length,
        " de ",
        stats.total
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => sync(), className: "px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 font-semibold flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
          " Atualizar"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: exportCsv, className: "px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 font-semibold", children: "Exportar CSV" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Buscar por ID, nome, telefone, email ou MP ID", className: "w-full h-10 pl-9 pr-9 rounded-full bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" }),
      query && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQuery(""), "aria-label": "Limpar", className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-3 items-center text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "h-3.5 w-3.5 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "h-8 px-2 rounded-full bg-card border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Pagamento: todos" }),
        statuses.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: ORDER_STATUS_LABEL[s] }, s))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: deliveryFilter, onChange: (e) => setDeliveryFilter(e.target.value), className: "h-8 px-2 rounded-full bg-card border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Entrega: todas" }),
        ["pendente", "em_separacao", "saiu_para_entrega", "entregue"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: DELIVERY_STATUS_LABEL[s] }, s))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: methodFilter, onChange: (e) => setMethodFilter(e.target.value), className: "h-8 px-2 rounded-full bg-card border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Pagamento: todos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pix", children: "Pix" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "card", children: "Cartão" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cash", children: "Dinheiro" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: period, onChange: (e) => setPeriod(e.target.value), className: "h-8 px-2 rounded-full bg-card border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "todos", children: "Período: todos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hoje", children: "Últimas 24h" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "7d", children: "Últimos 7 dias" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "30d", children: "Últimos 30 dias" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card rounded-2xl shadow-card overflow-hidden", children: list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-16 text-muted-foreground text-sm", children: "Nenhum pedido encontrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: list.map((o) => {
      const status2 = normalizeOrderStatus(o.status);
      const Icon = STATUS_ICON[status2];
      const expired = status2 === "aguardando_pagamento" && o.pixExpiresAt && new Date(o.pixExpiresAt).getTime() < Date.now();
      return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { onClick: () => setSelected(o.id), className: "p-3 hover:bg-muted/40 cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm truncate", children: [
              "#",
              String(o.id).slice(0, 8),
              " · ",
              o.customerName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${STATUS_STYLE[status2]}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
              ORDER_STATUS_LABEL[status2]
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border bg-indigo-50 text-indigo-800 border-indigo-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3 w-3" }),
              DELIVERY_STATUS_LABEL[normalizeDeliveryStatus(o.deliveryStatus)]
            ] }),
            expired && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 border border-red-200", children: "Pix expirado" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(o.createdAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              o.items.length,
              " itens"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase", children: o.paymentMethod }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: o.deliveryMethod === "retirada" ? "Retirada" : "Entrega" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-primary text-sm", children: brl$1(o.total) }) })
      ] }) }, o.id);
    }) }) }),
    order && (() => {
      const paymentStatus = normalizeOrderStatus(order.status);
      const deliveryStatus = normalizeDeliveryStatus(order.deliveryStatus);
      const paymentSteps = [{
        value: "pago",
        label: "Pago",
        icon: CircleCheck
      }, {
        value: "aguardando_pagamento",
        label: "Aguardando",
        icon: Clock
      }, {
        value: "cancelado",
        label: "Cancelado",
        icon: CircleX
      }, {
        value: "reembolsado",
        label: "Reembolsado",
        icon: RefreshCw
      }];
      const deliverySteps = [{
        value: "pendente",
        label: "Pendente",
        icon: Clock
      }, {
        value: "em_separacao",
        label: "Em separação",
        icon: Package
      }, {
        value: "saiu_para_entrega",
        label: "Saiu p/ entrega",
        icon: Truck
      }, {
        value: "entregue",
        label: "Entregue",
        icon: CircleCheck
      }];
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { onClose: () => setSelected(null), title: `Pedido #${String(order.id).slice(0, 8)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold border ${STATUS_STYLE[paymentStatus]}`, children: getOrderStatusLabel(order.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold border bg-indigo-50 text-indigo-800 border-indigo-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3 w-3" }),
            " ",
            DELIVERY_STATUS_LABEL[deliveryStatus]
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground w-full", children: [
            formatDate(order.createdAt),
            order.paidAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-700", children: [
              " · Pago ",
              formatDate(order.paidAt)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-2 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-bold uppercase text-muted-foreground tracking-wide mb-1.5 px-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-3 w-3" }),
            " Pagamento"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5", children: paymentSteps.map((s) => {
            const Icon = s.icon;
            const isCurrent = paymentStatus === s.value;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: isCurrent || busy, onClick: async () => {
              setBusy(true);
              try {
                await updateOrderStatus(order.id, s.value);
                toast.success(`Pagamento: ${s.label}`);
              } finally {
                setBusy(false);
              }
            }, className: `h-9 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition ${isCurrent ? "bg-primary text-primary-foreground border-primary cursor-default" : "bg-card hover:bg-primary/10 hover:border-primary/40 border-border"} disabled:opacity-60`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
              " ",
              s.label
            ] }, s.value);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-2 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-bold uppercase text-muted-foreground tracking-wide mb-1.5 px-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3 w-3" }),
            " Entrega"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5", children: deliverySteps.map((s) => {
            const Icon = s.icon;
            const isCurrent = deliveryStatus === s.value;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: isCurrent || busy, onClick: async () => {
              setBusy(true);
              try {
                await updateDeliveryStatus(order.id, s.value);
                toast.success(`Entrega: ${s.label}`);
              } finally {
                setBusy(false);
              }
            }, className: `h-9 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition ${isCurrent ? "bg-indigo-600 text-white border-indigo-600 cursor-default" : "bg-card hover:bg-indigo-500/10 hover:border-indigo-400/40 border-border"} disabled:opacity-60`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
              " ",
              s.label
            ] }, s.value);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-3 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold uppercase text-muted-foreground tracking-wide", children: "Cliente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Mail, label: "Nome", children: order.customerName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Mail, label: "E-mail", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => copy(order.customerEmail, "E-mail copiado"), className: "hover:text-primary text-left truncate max-w-[180px]", children: order.customerEmail }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Phone, label: "Telefone", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            order.customerPhone,
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onWhatsApp(order), title: "WhatsApp", className: "hover:opacity-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppIcon, { className: "h-4 w-4" }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: MapPin, label: order.deliveryMethod === "retirada" ? "Retirada" : "Endereço", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: order.address || "—" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-3 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold uppercase text-muted-foreground tracking-wide", children: "Pagamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: CreditCard, label: "Método", children: order.paymentMethod.toUpperCase() }),
          order.mpPaymentId && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Hash, label: "MP ID", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => copy(order.mpPaymentId, "MP ID copiado"), className: "font-mono text-xs hover:text-primary inline-flex items-center gap-1", children: [
            order.mpPaymentId,
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" })
          ] }) }),
          order.pixExpiresAt && status === "aguardando_pagamento" && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Clock, label: "Pix expira", children: formatDate(order.pixExpiresAt) })
        ] }),
        order.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-gold/10 border border-gold/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-gold uppercase tracking-wide mb-1", children: "Observações do cliente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm whitespace-pre-wrap", children: order.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 bg-muted/40 text-[11px] font-bold uppercase text-muted-foreground tracking-wide", children: [
            "Itens (",
            order.items.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: order.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-2.5 flex items-center gap-2.5", children: [
            it.image && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: it.image, alt: "", className: "w-10 h-10 rounded-lg object-cover bg-muted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", children: it.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                it.quantity,
                "× ",
                brl$1(it.price)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: brl$1(it.price * it.quantity) })
          ] }, it.productId)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border p-2.5 space-y-1 text-xs bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "Subtotal", value: brl$1(order.subtotal) }),
            order.discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "Desconto", value: `- ${brl$1(order.discount)}`, className: "text-emerald-700" }),
            order.shipping > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "Frete", value: brl$1(order.shipping) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { label: "Total", value: brl$1(order.total), className: "font-bold text-primary text-sm pt-1 border-t border-border mt-1" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onWhatsApp(order), className: "h-10 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppIcon, { className: "h-4 w-4" }),
            " WhatsApp"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => printOrderReceipt(order, settings), className: "h-10 rounded-full bg-muted font-semibold text-xs flex items-center justify-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
            " Imprimir"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: async () => {
            const {
              confirmDialog
            } = await import("./AdminLayout-B0sSU-Ve.js").then((n) => n.C);
            const ok = await confirmDialog({
              title: "Excluir pedido?",
              description: `O pedido #${String(order.id).slice(0, 8)} será removido. Esta ação não pode ser desfeita.`,
              confirmLabel: "Excluir"
            });
            if (ok) {
              deleteOrder(order.id);
              setSelected(null);
              toast.success("Pedido excluído");
            }
          }, className: "h-10 rounded-full bg-destructive/10 text-destructive font-semibold text-xs flex items-center justify-center gap-1.5 col-span-2 hover:bg-destructive/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
            " Excluir pedido"
          ] })
        ] })
      ] }) });
    })()
  ] });
}
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  onClick,
  active
}) {
  const palette = {
    amber: "from-amber-500/15 to-amber-500/5 text-amber-700 border-amber-200",
    emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-700 border-emerald-200",
    blue: "from-blue-500/15 to-blue-500/5 text-blue-700 border-blue-200",
    red: "from-red-500/15 to-red-500/5 text-red-700 border-red-200",
    slate: "from-slate-500/15 to-slate-500/5 text-slate-700 border-slate-200"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: `text-left p-3 rounded-2xl border bg-gradient-to-br shadow-sm transition ${palette[color]} ${active ? "ring-2 ring-primary/40" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-wide opacity-80", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 opacity-70" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold mt-0.5", children: value })
  ] });
}
function Row({
  icon: Icon,
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right text-foreground", children })
  ] });
}
function Line({
  label,
  value,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex justify-between ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value })
  ] });
}
export {
  Page as component
};
