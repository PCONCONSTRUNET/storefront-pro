import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { g as createLucideIcon, X, u as useStore, w as Plus, v as brl, z as Trash2, t as toast, V as Star } from "./router-CbsSSRKz.js";
import { A as AdminLayout } from "./AdminLayout-IA_uuXcZ.js";
import { C as Check } from "./check-Dt2f_uGi.js";
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
const __iconNode$2 = [
  ["path", { d: "M6 2v14a2 2 0 0 0 2 2h14", key: "ron5a4" }],
  ["path", { d: "M18 22V8a2 2 0 0 0-2-2H2", key: "7s9ehn" }]
];
const Crop = createLucideIcon("crop", __iconNode$2);
const __iconNode$1 = [
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
  ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
  ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]
];
const GripVertical = createLucideIcon("grip-vertical", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);
function ImageCropModal({
  src,
  onCancel,
  onConfirm
}) {
  const containerRef = reactExports.useRef(null);
  const imgRef = reactExports.useRef(null);
  const [imgSize, setImgSize] = reactExports.useState({ w: 0, h: 0 });
  const [natural, setNatural] = reactExports.useState({ w: 0, h: 0 });
  const [rect, setRect] = reactExports.useState({ x: 0, y: 0, w: 0, h: 0 });
  const [mode, setMode] = reactExports.useState(null);
  const startRef = reactExports.useRef(null);
  const onImgLoad = () => {
    const img = imgRef.current;
    const cont = containerRef.current;
    const maxW = cont.clientWidth;
    const maxH = Math.min(window.innerHeight * 0.6, 600);
    const ratio = Math.min(
      maxW / img.naturalWidth,
      maxH / img.naturalHeight,
      1
    );
    const w = img.naturalWidth * ratio;
    const h = img.naturalHeight * ratio;
    setImgSize({ w, h });
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    const m = Math.min(w, h) * 0.1;
    setRect({ x: m, y: m, w: w - m * 2, h: h - m * 2 });
  };
  const getPos = (e) => {
    const t = "touches" in e ? e.touches[0] || e.changedTouches[0] : e;
    return { x: t.clientX, y: t.clientY };
  };
  const startDrag = (m) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const p = getPos(e);
    setMode(m);
    startRef.current = { mx: p.x, my: p.y, r: { ...rect } };
  };
  reactExports.useEffect(() => {
    if (!mode) return;
    const move = (e) => {
      if (!startRef.current) return;
      const p = getPos(e);
      const dx = p.x - startRef.current.mx;
      const dy = p.y - startRef.current.my;
      let { x, y, w, h } = startRef.current.r;
      const min = 20;
      if (mode === "move") {
        x = Math.max(0, Math.min(imgSize.w - w, x + dx));
        y = Math.max(0, Math.min(imgSize.h - h, y + dy));
      } else {
        if (mode.includes("e"))
          w = Math.max(min, Math.min(imgSize.w - x, w + dx));
        if (mode.includes("s"))
          h = Math.max(min, Math.min(imgSize.h - y, h + dy));
        if (mode.includes("w")) {
          const nx = Math.max(0, Math.min(x + w - min, x + dx));
          w = w + (x - nx);
          x = nx;
        }
        if (mode.includes("n")) {
          const ny = Math.max(0, Math.min(y + h - min, y + dy));
          h = h + (y - ny);
          y = ny;
        }
      }
      setRect({ x, y, w, h });
    };
    const up = () => {
      setMode(null);
      startRef.current = null;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [mode, imgSize.w, imgSize.h]);
  const confirm = () => {
    const scale = natural.w / imgSize.w;
    const sx = rect.x * scale, sy = rect.y * scale;
    const sw = rect.w * scale, sh = rect.h * scale;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      try {
        onConfirm(canvas.toDataURL("image/jpeg", 0.9));
      } catch {
        onConfirm(src);
      }
    };
    img.onerror = () => onConfirm(src);
    img.src = src;
  };
  const handles = [
    { m: "nw", cls: "-top-1.5 -left-1.5 cursor-nwse-resize" },
    { m: "ne", cls: "-top-1.5 -right-1.5 cursor-nesw-resize" },
    { m: "sw", cls: "-bottom-1.5 -left-1.5 cursor-nesw-resize" },
    { m: "se", cls: "-bottom-1.5 -right-1.5 cursor-nwse-resize" },
    { m: "n", cls: "-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
    { m: "s", cls: "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
    { m: "w", cls: "top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize" },
    { m: "e", cls: "top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-3",
      onClick: onCancel,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-card rounded-2xl w-full max-w-2xl shadow-soft",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Recortar imagem (livre)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onCancel,
                  className: "w-8 h-8 grid place-items-center rounded-full hover:bg-muted",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                ref: containerRef,
                className: "p-3 flex items-center justify-center bg-muted/30 select-none",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "relative",
                    style: { width: imgSize.w || "auto", height: imgSize.h || "auto" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          ref: imgRef,
                          src,
                          onLoad: onImgLoad,
                          alt: "",
                          className: "block max-w-full pointer-events-none",
                          style: {
                            width: imgSize.w || void 0,
                            height: imgSize.h || void 0
                          },
                          crossOrigin: "anonymous"
                        }
                      ),
                      imgSize.w > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: "absolute inset-0 pointer-events-none",
                            style: {
                              boxShadow: `0 0 0 9999px rgba(0,0,0,0.5) inset`,
                              clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${rect.y}px, ${rect.x}px ${rect.y}px, ${rect.x}px ${rect.y + rect.h}px, ${rect.x + rect.w}px ${rect.y + rect.h}px, ${rect.x + rect.w}px ${rect.y}px, 0 ${rect.y}px)`
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: "absolute border-2 border-white cursor-move",
                            style: {
                              left: rect.x,
                              top: rect.y,
                              width: rect.w,
                              height: rect.h,
                              boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)"
                            },
                            onMouseDown: startDrag("move"),
                            onTouchStart: startDrag("move"),
                            children: handles.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              {
                                onMouseDown: startDrag(h.m),
                                onTouchStart: startDrag(h.m),
                                className: `absolute w-3 h-3 bg-white border border-black/40 rounded-sm ${h.cls}`
                              },
                              h.m
                            ))
                          }
                        )
                      ] })
                    ]
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 p-3 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onCancel,
                  className: "flex-1 h-11 rounded-xl bg-muted font-semibold text-sm",
                  children: "Cancelar"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: confirm,
                  className: "flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
                    " Aplicar recorte"
                  ]
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
const empty = () => ({
  id: `p_${Date.now()}`,
  name: "",
  description: "",
  price: 0,
  image: "",
  gallery: [],
  category: "lacos",
  stock: 0,
  minStock: 5,
  sku: "",
  active: true,
  variations: []
});
function Page() {
  const {
    products,
    categories,
    upsertProduct,
    deleteProduct
  } = useStore();
  const [editing, setEditing] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const list = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Produtos", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "Buscar produto...", value: search, onChange: (e) => setSearch(e.target.value), className: "flex-1 h-10 px-3 rounded-xl bg-card border border-border outline-none focus:ring-2 ring-primary/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setEditing(empty()), className: "px-4 h-10 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Novo"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:grid grid-cols-[60px_1fr_120px_100px_80px_100px] gap-3 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Foto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Preço" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Estoque" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: list.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "md:grid md:grid-cols-[60px_1fr_120px_100px_80px_100px] gap-3 px-4 py-3 items-center flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.image, alt: "", className: "w-12 h-12 rounded-lg object-cover bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 ml-3 md:ml-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm truncate", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "SKU ",
            p.sku
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block text-sm font-semibold text-primary", children: brl(p.price) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-1.5 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.stock }),
          p.stock <= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold", children: "Esgotado" }) : p.stock <= (p.minStock ?? 5) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full bg-gold/15 text-gold font-semibold", children: "Baixo" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`, children: p.active ? "Ativo" : "Inativo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditing(p), className: "w-8 h-8 grid place-items-center rounded-lg hover:bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
            const {
              confirmDialog
            } = await import("./AdminLayout-IA_uuXcZ.js").then((n) => n.C);
            if (await confirmDialog({
              title: "Excluir produto?",
              description: `“${p.name}” será removido.`,
              confirmLabel: "Excluir"
            })) {
              deleteProduct(p.id);
              toast.success("Excluído");
            }
          }, className: "w-8 h-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }, p.id)) })
    ] }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { onClose: () => setEditing(null), title: products.find((p) => p.id === editing.id) ? "Editar produto" : "Novo produto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductForm, { product: editing, categories: categories.map((c) => ({
      id: c.id,
      name: c.name
    })), onSave: async (p) => {
      try {
        await upsertProduct(p);
        toast.success("Salvo!");
        setEditing(null);
      } catch (e) {
        toast.error(e?.message || "Falha ao salvar produto");
      }
    } }) })
  ] });
}
function ProductForm({
  product,
  categories,
  onSave
}) {
  const [p, setP] = reactExports.useState(product);
  const [tab, setTab] = reactExports.useState("basico");
  const tabs = [{
    id: "basico",
    label: "Básico"
  }, {
    id: "midia",
    label: "Mídia"
  }, {
    id: "var",
    label: "Variações"
  }, {
    id: "desc",
    label: "Descrição"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
    e.preventDefault();
    onSave(p);
  }, className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 p-1 bg-muted rounded-xl", children: tabs.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTab(t.id), className: `flex-1 h-8 text-xs font-semibold rounded-lg transition ${tab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground"}`, children: t.label }, t.id)) }),
    tab === "basico" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nome", value: p.name, onChange: (v) => setP({
        ...p,
        name: v
      }), className: "col-span-2", required: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "SKU", value: p.sku, onChange: (v) => setP({
        ...p,
        sku: v
      }), required: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Categoria" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: p.category, onChange: (e) => setP({
          ...p,
          category: e.target.value
        }), className: "mt-1 w-full h-10 px-2 text-sm rounded-xl bg-muted outline-none", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.id, children: c.name }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Preço", type: "number", value: String(p.price), onChange: (v) => setP({
        ...p,
        price: parseFloat(v) || 0
      }), required: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Promocional", type: "number", value: String(p.oldPrice ?? ""), onChange: (v) => setP({
        ...p,
        oldPrice: v ? parseFloat(v) : void 0
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Estoque", type: "number", value: String(p.stock), onChange: (v) => setP({
          ...p,
          stock: parseInt(v) || 0
        }), className: "flex-1", required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Estoque mínimo", type: "number", value: String(p.minStock ?? 5), onChange: (v) => setP({
          ...p,
          minStock: parseInt(v) || 0
        }), className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setP({
          ...p,
          stock: 0
        }), className: "self-end h-11 px-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold whitespace-nowrap", children: "Sem estoque" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-2 text-[11px] text-muted-foreground -mt-1", children: "Você receberá um alerta quando o estoque ficar igual ou abaixo do mínimo." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "col-span-2 flex items-center gap-2 p-3 rounded-xl bg-muted/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: p.active, onChange: (e) => setP({
          ...p,
          active: e.target.checked
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Ativo" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "col-span-2 flex items-center gap-2 p-3 rounded-xl bg-muted/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!p.hidden, onChange: (e) => setP({
          ...p,
          hidden: e.target.checked
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Ocultar da vitrine" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground ml-auto", children: "não aparece na home/categorias" })
      ] })
    ] }),
    tab === "midia" && /* @__PURE__ */ jsxRuntimeExports.jsx(GalleryEditor, { gallery: p.gallery && p.gallery.length > 0 ? p.gallery : p.image ? [p.image] : [], onChange: (imgs) => setP({
      ...p,
      gallery: imgs,
      image: imgs[0] || ""
    }) }),
    tab === "var" && /* @__PURE__ */ jsxRuntimeExports.jsx(VariationsEditor, { variations: p.variations ?? [], onChange: (v) => setP({
      ...p,
      variations: v
    }) }),
    tab === "desc" && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Descrição" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: p.description, onChange: (e) => setP({
        ...p,
        description: e.target.value
      }), rows: 6, className: "mt-1 w-full px-3 py-2 text-sm rounded-xl bg-muted outline-none" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold", children: "Salvar" })
  ] });
}
function normalizeOptions(opts) {
  return opts.map((o) => typeof o === "string" ? {
    label: o
  } : o);
}
function VariationsEditor({
  variations,
  onChange
}) {
  const norm = variations.map((v) => ({
    name: v.name,
    options: normalizeOptions(v.options)
  }));
  const add = () => onChange([...norm, {
    name: "",
    options: []
  }]);
  const update = (i, patch) => {
    onChange(norm.map((v, idx) => idx === i ? {
      ...v,
      ...patch
    } : v));
  };
  const remove = (i) => onChange(norm.filter((_, idx) => idx !== i));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Ex.: Tamanho → P (+0), G (+5,00) · Cor → Rosa, Azul" }),
    norm.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-xs text-muted-foreground bg-muted/40 rounded-xl", children: "Nenhuma variação." }),
    norm.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-xl p-2 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "Nome (ex: Tamanho)", value: v.name, onChange: (e) => update(i, {
          name: e.target.value
        }), className: "flex-1 h-9 px-2 text-sm rounded-lg bg-card outline-none focus:ring-2 ring-primary/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => remove(i), className: "w-9 h-9 grid place-items-center rounded-lg bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OptionsInput, { options: v.options, onChange: (opts) => update(i, {
        options: opts
      }) })
    ] }, i)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: add, className: "w-full h-9 rounded-xl bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " Adicionar variação"
    ] })
  ] });
}
function OptionsInput({
  options,
  onChange
}) {
  const [label, setLabel] = reactExports.useState("");
  const [delta, setDelta] = reactExports.useState("");
  const add = () => {
    const l = label.trim();
    if (!l || options.some((o) => o.label === l)) {
      setLabel("");
      setDelta("");
      return;
    }
    const d = parseFloat(delta);
    onChange([...options, {
      label: l,
      priceDelta: isNaN(d) ? void 0 : d
    }]);
    setLabel("");
    setDelta("");
  };
  const updateDelta = (i, v) => {
    const d = parseFloat(v);
    onChange(options.map((o, idx) => idx === i ? {
      ...o,
      priceDelta: isNaN(d) ? void 0 : d
    } : o));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 mb-2", children: options.map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 bg-card px-2 py-1 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs flex-1 truncate", children: o.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "+R$" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", value: o.priceDelta ?? "", onChange: (e) => updateDelta(i, e.target.value), placeholder: "0,00", className: "w-16 h-7 px-1 text-xs rounded bg-muted outline-none text-right" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onChange(options.filter((_, idx) => idx !== i)), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: label, onChange: (e) => setLabel(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          add();
        }
      }, placeholder: "Opção (ex: G)", className: "flex-1 h-8 px-2 text-xs rounded-lg bg-card outline-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", value: delta, onChange: (e) => setDelta(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          add();
        }
      }, placeholder: "+R$ 0,00", className: "w-24 h-8 px-2 text-xs rounded-lg bg-card outline-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: add, className: "px-3 h-8 rounded-lg bg-primary/10 text-primary text-xs font-semibold", children: "Add" })
    ] })
  ] });
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  required
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `block ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, onChange: (e) => onChange(e.target.value), required, className: "mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40" })
  ] });
}
function GalleryEditor({
  gallery,
  onChange
}) {
  const fileRef = reactExports.useRef(null);
  const [url, setUrl] = reactExports.useState("");
  const [dragIdx, setDragIdx] = reactExports.useState(null);
  const [cropIdx, setCropIdx] = reactExports.useState(null);
  const addFiles = async (files) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    const tooBig = arr.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      toast.error("Cada imagem deve ter no máximo 5MB");
      return;
    }
    const dataUrls = await Promise.all(arr.map((f) => new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(f);
    })));
    onChange([...gallery, ...dataUrls]);
    toast.success(`${dataUrls.length} foto${dataUrls.length > 1 ? "s" : ""} adicionada${dataUrls.length > 1 ? "s" : ""}`);
  };
  const addUrl = () => {
    const u = url.trim();
    if (!u) return;
    onChange([...gallery, u]);
    setUrl("");
  };
  const remove = (i) => onChange(gallery.filter((_, idx) => idx !== i));
  const setMain = (i) => {
    const next = [gallery[i], ...gallery.filter((_, idx) => idx !== i)];
    onChange(next);
  };
  const onDrop = (i) => {
    if (dragIdx === null || dragIdx === i) return;
    const next = [...gallery];
    const [m] = next.splice(dragIdx, 1);
    next.splice(i, 0, m);
    onChange(next);
    setDragIdx(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-muted-foreground", children: [
        "Fotos do produto (",
        gallery.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "A primeira é a capa. Arraste para reordenar." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onDragOver: (e) => e.preventDefault(), onDrop: (e) => {
      e.preventDefault();
      addFiles(e.dataTransfer.files);
    }, className: "border-2 border-dashed border-border rounded-xl p-3 bg-muted/30", children: [
      gallery.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3", children: gallery.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { draggable: true, onDragStart: () => setDragIdx(i), onDragOver: (e) => e.preventDefault(), onDrop: (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop(i);
      }, className: `relative group aspect-square rounded-lg overflow-hidden border-2 ${i === 0 ? "border-primary" : "border-transparent"} bg-card cursor-move`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "", className: "w-full h-full object-cover" }),
        i === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-2.5 w-2.5 fill-current" }),
          " Capa"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCropIdx(i), title: "Recortar", className: "w-6 h-6 grid place-items-center rounded-full bg-card/90 hover:bg-card shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crop, { className: "h-3 w-3" }) }),
          i !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMain(i), title: "Definir como capa", className: "w-6 h-6 grid place-items-center rounded-full bg-card/90 hover:bg-card shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => remove(i), title: "Remover", className: "w-6 h-6 grid place-items-center rounded-full bg-destructive text-destructive-foreground shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1 left-1 bg-black/40 text-white rounded p-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-3 w-3" }) })
      ] }, src + i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => fileRef.current?.click(), className: "w-full py-3 rounded-lg bg-card hover:bg-muted border border-border flex items-center justify-center gap-2 text-sm font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
        " Enviar fotos do dispositivo"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: (e) => {
        addFiles(e.target.files);
        e.target.value = "";
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground text-center mt-1", children: "ou arraste e solte aqui · até 5MB cada" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "url", value: url, onChange: (e) => setUrl(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addUrl();
        }
      }, placeholder: "ou cole uma URL de imagem", className: "flex-1 h-10 px-3 rounded-xl bg-muted text-sm outline-none focus:ring-2 ring-primary/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: addUrl, className: "px-4 h-10 rounded-xl bg-primary/10 text-primary text-sm font-semibold", children: "Adicionar" })
    ] }),
    cropIdx !== null && gallery[cropIdx] && /* @__PURE__ */ jsxRuntimeExports.jsx(ImageCropModal, { src: gallery[cropIdx], onCancel: () => setCropIdx(null), onConfirm: (dataUrl) => {
      const next = [...gallery];
      next[cropIdx] = dataUrl;
      onChange(next);
      setCropIdx(null);
      toast.success("Imagem recortada");
    } })
  ] });
}
export {
  Page as component
};
