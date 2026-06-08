import { U as jsxRuntimeExports } from "../server.js";
import { u as useStore, v as brl, I as formatDate } from "./router-yLgiv1p7.js";
import { A as AdminLayout } from "./AdminLayout-B0sSU-Ve.js";
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
import "./dollar-sign-DqvXPngu.js";
import "./settings-aGUEQ0PF.js";
import "./log-out-KcgBpaKW.js";
function Page() {
  const {
    customers,
    orders
  } = useStore();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLayout, { title: "Clientes", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card rounded-2xl shadow-card overflow-hidden", children: customers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-16 text-muted-foreground", children: "Nenhum cliente cadastrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: customers.map((c) => {
    const cOrders = orders.filter((o) => o.customerId === c.id);
    const spent = cOrders.reduce((a, o) => a + o.total, 0);
    const last = cOrders[0]?.createdAt;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-4 flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full gradient-primary text-primary-foreground grid place-items-center font-bold", children: c.name[0]?.toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          c.email,
          " · ",
          c.phone
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-primary font-bold", children: brl(spent) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
          cOrders.length,
          " pedidos"
        ] }),
        last && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
          "Último: ",
          formatDate(last)
        ] })
      ] })
    ] }, c.id);
  }) }) }) });
}
export {
  Page as component
};
