import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { u as useStore, w as Plus, z as Trash2, t as toast } from "./router-CbsSSRKz.js";
import { A as AdminLayout } from "./AdminLayout-IA_uuXcZ.js";
import { M as Modal } from "./AdminModal-CntqNPJR.js";
import { S as SquarePen } from "./square-pen-D50yz1xp.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./adminHelpers.server-BhLg7GIA.js";
import "./client.server-C7GAOqxY.js";
import "./layout-dashboard-Tw_Axpdn.js";
import "./shopping-cart-BRFmSKRc.js";
import "./dollar-sign-Dr-4p57q.js";
import "./settings-DhwBCChM.js";
import "./log-out-CpDN9yeE.js";
function Page() {
  const {
    categories,
    upsertCategory,
    deleteCategory
  } = useStore();
  const [editing, setEditing] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Categorias", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setEditing({
      id: `cat_${Date.now()}`,
      name: "",
      image: "🎀",
      order: categories.length + 1
    }), className: "px-4 h-10 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " Nova"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", children: categories.sort((a, b) => a.order - b.order).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl", children: c.image }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mt-2", children: c.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Ordem: ",
        c.order
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-center mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditing(c), className: "w-8 h-8 grid place-items-center rounded-lg hover:bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
          const {
            confirmDialog
          } = await import("./AdminLayout-IA_uuXcZ.js").then((n) => n.C);
          if (await confirmDialog({
            title: "Excluir categoria?",
            description: `“${c.name}” será removida.`,
            confirmLabel: "Excluir"
          })) {
            deleteCategory(c.id);
            toast.success("Excluída");
          }
        }, className: "w-8 h-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] })
    ] }, c.id)) }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { onClose: () => setEditing(null), title: "Categoria", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      upsertCategory(editing);
      toast.success("Salva!");
      setEditing(null);
    }, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nome", value: editing.name, onChange: (v) => setEditing({
        ...editing,
        name: v
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Emoji / ícone", value: editing.image, onChange: (v) => setEditing({
        ...editing,
        image: v
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ordem", type: "number", value: String(editing.order), onChange: (v) => setEditing({
        ...editing,
        order: parseInt(v) || 0
      }) }),
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
