import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { u as useStore, t as toast } from "./router-yLgiv1p7.js";
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
    settings,
    updateSettings
  } = useStore();
  const [s, setS] = reactExports.useState(settings);
  const save = () => {
    updateSettings(s);
    toast.success("Configurações salvas!");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Configurações da loja", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid lg:grid-cols-2 gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { title: "Banner principal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Título", value: s.bannerTitle, onChange: (v) => setS({
        ...s,
        bannerTitle: v
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Subtítulo", value: s.bannerSubtitle, onChange: (v) => setS({
        ...s,
        bannerSubtitle: v
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: save, className: "px-6 h-11 rounded-full gradient-primary text-primary-foreground font-semibold", children: "Salvar tudo" }) })
  ] });
}
function Card({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children })
  ] });
}
function Field({
  label,
  value,
  onChange,
  type = "text"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, onChange: (e) => onChange(e.target.value), className: "mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40" })
  ] });
}
export {
  Page as component
};
