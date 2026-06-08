import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { u as useStore, w as Plus, z as Trash2, t as toast } from "./router-yLgiv1p7.js";
import { A as AdminLayout } from "./AdminLayout-B0sSU-Ve.js";
import { M as Modal } from "./AdminModal-CP04OAau.js";
import { S as SquarePen } from "./square-pen-BaW1deO5.js";
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
    coupons,
    upsertCoupon,
    deleteCoupon
  } = useStore();
  const [editing, setEditing] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Cupons", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setEditing({
      code: "",
      type: "percent",
      value: 10,
      validUntil: "2026-12-31",
      maxUses: 100,
      usedCount: 0,
      minOrder: 0,
      active: true
    }), className: "px-4 h-10 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " Novo cupom"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 gap-3", children: coupons.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-xl gradient-primary text-primary-foreground grid place-items-center font-bold text-xl", children: "%" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: c.code }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          c.type === "percent" ? `${c.value}% off` : `R$ ${c.value} off`,
          " ",
          "· Mín ",
          c.minOrder
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Usos: ",
          c.usedCount,
          "/",
          c.maxUses,
          " · Até ",
          c.validUntil
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full font-semibold ${c.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`, children: c.active ? "Ativo" : "Inativo" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditing(c), className: "w-8 h-8 grid place-items-center rounded-lg hover:bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
          const {
            confirmDialog
          } = await import("./AdminLayout-B0sSU-Ve.js").then((n) => n.C);
          if (await confirmDialog({
            title: "Excluir cupom?",
            description: `“${c.code}” será removido.`,
            confirmLabel: "Excluir"
          })) {
            deleteCoupon(c.code);
            toast.success("Excluído");
          }
        }, className: "w-8 h-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] })
    ] }, c.code)) }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { onClose: () => setEditing(null), title: "Cupom", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      upsertCoupon({
        ...editing,
        code: editing.code.toUpperCase()
      });
      toast.success("Salvo!");
      setEditing(null);
    }, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Código", value: editing.code, onChange: (v) => setEditing({
        ...editing,
        code: v.toUpperCase()
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Tipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: editing.type, onChange: (e) => setEditing({
            ...editing,
            type: e.target.value
          }), className: "mt-1 w-full h-11 px-3 rounded-xl bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "percent", children: "Percentual" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fixed", children: "Valor fixo" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Valor", type: "number", value: String(editing.value), onChange: (v) => setEditing({
          ...editing,
          value: parseFloat(v) || 0
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Pedido mínimo", type: "number", value: String(editing.minOrder), onChange: (v) => setEditing({
          ...editing,
          minOrder: parseFloat(v) || 0
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Máx. usos", type: "number", value: String(editing.maxUses), onChange: (v) => setEditing({
          ...editing,
          maxUses: parseInt(v) || 0
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Validade", type: "date", value: editing.validUntil, onChange: (v) => setEditing({
          ...editing,
          validUntil: v
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: editing.active, onChange: (e) => setEditing({
            ...editing,
            active: e.target.checked
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Ativo" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold", children: "Salvar" })
    ] }) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, onChange: (e) => onChange(e.target.value), required: true, className: "mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40" })
  ] });
}
export {
  Page as component
};
