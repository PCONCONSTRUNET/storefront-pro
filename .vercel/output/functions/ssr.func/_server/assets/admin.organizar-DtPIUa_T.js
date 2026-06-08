import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { g as createLucideIcon, u as useStore, t as toast } from "./router-CnaK_EO9.js";
import { A as AdminLayout } from "./AdminLayout-De_VAja0.js";
import { R as RefreshCw } from "./refresh-cw-Bf96sPuo.js";
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
const __iconNode$2 = [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
];
const ArrowDown = createLucideIcon("arrow-down", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
];
const ArrowUp = createLucideIcon("arrow-up", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
];
const Save = createLucideIcon("save", __iconNode);
function Page() {
  const {
    categories,
    products,
    upsertCategory,
    upsertProduct,
    sync
  } = useStore();
  reactExports.useEffect(() => {
    sync();
  }, [sync]);
  const [tab, setTab] = reactExports.useState("categorias");
  const initialCats = reactExports.useMemo(() => [...categories].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)), [categories]);
  const initialProds = reactExports.useMemo(() => [...products].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)), [products]);
  const [catList, setCatList] = reactExports.useState(initialCats);
  const [prodList, setProdList] = reactExports.useState(initialProds);
  const [catFilter, setCatFilter] = reactExports.useState("");
  reactExports.useEffect(() => setCatList(initialCats), [initialCats]);
  reactExports.useEffect(() => setProdList(initialProds), [initialProds]);
  const move = (arr, from, to) => {
    if (to < 0 || to >= arr.length) return arr;
    const next = [...arr];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };
  const saveCategories = async () => {
    try {
      await Promise.all(catList.map((c, i) => upsertCategory({
        ...c,
        order: i + 1
      })));
      toast.success("Ordem das categorias salva!");
    } catch (e) {
      toast.error("Erro ao salvar");
    }
  };
  const saveProducts = async () => {
    try {
      const visible = catFilter ? prodList.filter((p) => p.category === catFilter) : prodList;
      await Promise.all(visible.map((p, i) => upsertProduct({
        ...p,
        sortOrder: i + 1
      })));
      toast.success("Ordem dos produtos salva!");
    } catch (e) {
      toast.error("Erro ao salvar");
    }
  };
  const visibleProds = catFilter ? prodList.filter((p) => p.category === catFilter) : prodList;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Organizar Home", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-3 shadow-card mb-3 text-xs text-muted-foreground", children: [
      "Reorganize a ordem em que as categorias e os produtos aparecem na página inicial. Use as setas para subir ou descer e clique em",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Salvar" }),
      " ao terminar."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab("categorias"), className: `flex-1 h-10 rounded-full text-sm font-semibold transition ${tab === "categorias" ? "bg-primary text-primary-foreground shadow-card" : "bg-card border border-border hover:bg-muted"}`, children: [
        "Categorias (",
        catList.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab("produtos"), className: `flex-1 h-10 rounded-full text-sm font-semibold transition ${tab === "produtos" ? "bg-primary text-primary-foreground shadow-card" : "bg-card border border-border hover:bg-muted"}`, children: [
        "Produtos (",
        prodList.length,
        ")"
      ] })
    ] }),
    tab === "categorias" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 flex items-center justify-between border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "Ordem das categorias" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCatList(initialCats), className: "px-3 h-8 rounded-full bg-muted text-xs font-semibold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
            " Resetar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: saveCategories, className: "px-3 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
            " Salvar"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: catList.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] w-6 text-center font-bold text-muted-foreground", children: i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: c.image }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-medium text-sm truncate", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: i === 0, onClick: () => setCatList(move(catList, i, i - 1)), className: "w-8 h-8 grid place-items-center rounded-lg bg-muted hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: i === catList.length - 1, onClick: () => setCatList(move(catList, i, i + 1)), className: "w-8 h-8 grid place-items-center rounded-lg bg-muted hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4" }) })
        ] })
      ] }, c.id)) })
    ] }),
    tab === "produtos" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 flex flex-wrap items-center gap-2 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: catFilter, onChange: (e) => setCatFilter(e.target.value), className: "h-8 px-2 rounded-full bg-muted border border-border text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Todas as categorias" }),
          catList.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.id, children: c.name }, c.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          visibleProds.length,
          " produto(s)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setProdList(initialProds), className: "px-3 h-8 rounded-full bg-muted text-xs font-semibold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
            " Resetar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: saveProducts, className: "px-3 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
            " Salvar"
          ] })
        ] })
      ] }),
      visibleProds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-sm text-muted-foreground", children: "Nenhum produto." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border max-h-[60vh] overflow-y-auto", children: visibleProds.map((p, i) => {
        const fullIdx = prodList.findIndex((x) => x.id === p.id);
        const prevId = visibleProds[i - 1]?.id;
        const nextId = visibleProds[i + 1]?.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 px-3 py-2 hover:bg-muted/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] w-6 text-center font-bold text-muted-foreground", children: i + 1 }),
          p.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.image, alt: "", className: "w-10 h-10 rounded-lg object-cover bg-muted" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-muted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm truncate", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
              p.category,
              " · ",
              p.active ? "ativo" : "inativo",
              p.hidden ? " · oculto" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: !prevId, onClick: () => {
              const prevIdx = prodList.findIndex((x) => x.id === prevId);
              setProdList(move(prodList, fullIdx, prevIdx));
            }, className: "w-8 h-8 grid place-items-center rounded-lg bg-muted hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: !nextId, onClick: () => {
              const nextIdx = prodList.findIndex((x) => x.id === nextId);
              setProdList(move(prodList, fullIdx, nextIdx));
            }, className: "w-8 h-8 grid place-items-center rounded-lg bg-muted hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4" }) })
          ] })
        ] }, p.id);
      }) })
    ] })
  ] });
}
export {
  Page as component
};
