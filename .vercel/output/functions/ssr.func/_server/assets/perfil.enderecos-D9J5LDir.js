import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { c as useNavigate, q as useStoreHydrated, u as useStore, s as selectCurrentCustomer, S as StoreLayout, d as Link, k as ChevronLeft, m as MapPin, w as Plus, z as Trash2, t as toast } from "./router-yLgiv1p7.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./adminHelpers.server-BhLg7GIA.js";
import "./client.server-C7GAOqxY.js";
function Page() {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const customer = useStore(selectCurrentCustomer);
  const addAddress = useStore((s) => s.addAddress);
  const removeAddress = useStore((s) => s.removeAddress);
  const [value, setValue] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (hydrated && !customer) navigate({
      to: "/login"
    });
  }, [hydrated, customer, navigate]);
  if (!customer) return null;
  const list = customer.addresses || [];
  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    addAddress(value);
    setValue("");
    toast.success("Endereço adicionado");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/perfil", className: "inline-flex items-center gap-1 text-sm text-muted-foreground mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
      " Voltar"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold mb-4 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-5 w-5 text-primary" }),
      " Endereços"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "bg-card rounded-2xl shadow-card p-4 space-y-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Novo endereço" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value, onChange: (e) => setValue(e.target.value), placeholder: "Rua, nº, bairro, cidade/UF", className: "flex-1 h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "h-11 px-4 rounded-xl gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " Adicionar"
        ] })
      ] })
    ] }),
    list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-10", children: "Nenhum endereço cadastrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "bg-card rounded-2xl shadow-card divide-y divide-border overflow-hidden", children: list.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-primary shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm", children: a }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        removeAddress(i);
        toast.success("Removido");
      }, className: "text-destructive p-1.5 rounded-md hover:bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, i)) })
  ] }) });
}
export {
  Page as component
};
