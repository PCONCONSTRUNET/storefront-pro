import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { u as useStore, W as normalizeOrderStatus, v as brl, P as Package } from "./router-CnaK_EO9.js";
import { A as AdminLayout, b as Activity, T as TriangleAlert } from "./AdminLayout-De_VAja0.js";
import { T as TrendingUp } from "./trending-up-C5_Sivrs.js";
import { R as ResponsiveContainer, p as Cell, T as Tooltip, C as CartesianGrid, X as XAxis, Y as YAxis, B as Bar } from "./generateCategoricalChart-kLd23mZM.js";
import { P as PieChart, a as Pie, B as BarChart } from "./PieChart-42CZP_g_.js";
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
const COLORS = ["#d177a8", "#f09433", "#25d366", "#dc2743", "#bc1888"];
function Page() {
  const {
    orders,
    products,
    customers,
    sync
  } = useStore();
  reactExports.useEffect(() => {
    sync();
  }, [sync]);
  const metrics = reactExports.useMemo(() => {
    const paidOrders = orders.filter((o) => ["pago", "em_separacao", "saiu_para_entrega", "concluido"].includes(normalizeOrderStatus(o.status)));
    const totalRev = paidOrders.reduce((a, o) => a + o.total, 0);
    const avgTicket = paidOrders.length > 0 ? totalRev / paidOrders.length : 0;
    const stockCritical = products.filter((p) => p.stock <= (p.minStock ?? 5)).length;
    const activeCustomers = customers.length;
    return {
      totalRev,
      avgTicket,
      stockCritical,
      activeCustomers
    };
  }, [orders, products, customers]);
  const stockHealth = reactExports.useMemo(() => {
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= (p.minStock ?? 5)).length;
    const healthy = products.length - outOfStock - lowStock;
    return [{
      name: "Saudável",
      value: healthy
    }, {
      name: "Baixo",
      value: lowStock
    }, {
      name: "Esgotado",
      value: outOfStock
    }];
  }, [products]);
  const salesByCategory = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    orders.forEach((o) => {
      o.items.forEach((it) => {
        const p = products.find((prod) => prod.id === it.productId);
        const cat = p?.category || "Outros";
        map.set(cat, (map.get(cat) || 0) + it.price * it.quantity);
      });
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [orders, products]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Business Intelligence", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BIStat, { label: "Faturamento Total", value: brl(metrics.totalRev), icon: TrendingUp, color: "text-success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BIStat, { label: "Ticket Médio", value: brl(metrics.avgTicket), icon: Activity, color: "text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BIStat, { label: "Estoque Crítico", value: metrics.stockCritical, icon: TriangleAlert, color: "text-gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BIStat, { label: "Base de Clientes", value: metrics.activeCustomers, icon: Package, color: "text-primary" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-5 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-4", children: "Saúde do Estoque" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: stockHealth, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 80, paddingAngle: 5, dataKey: "value", children: stockHealth.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-4 mt-2", children: stockHealth.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full", style: {
            backgroundColor: COLORS[index % COLORS.length]
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            entry.name,
            ": ",
            entry.value
          ] })
        ] }, entry.name)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-5 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-4", children: "Faturamento por Categoria" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: salesByCategory, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "var(--border)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", fontSize: 11, stroke: "var(--muted-foreground)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { fontSize: 11, stroke: "var(--muted-foreground)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", fill: "var(--primary)", radius: [4, 4, 0, 0] })
        ] }) }) })
      ] })
    ] })
  ] });
}
function BIStat({
  label,
  value,
  icon: Icon,
  color
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card border border-border/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2 rounded-xl bg-muted ${color}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label })
  ] });
}
export {
  Page as component
};
