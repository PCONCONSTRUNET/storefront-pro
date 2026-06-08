import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { c as useNavigate, q as useStoreHydrated, u as useStore, s as selectCurrentCustomer, S as StoreLayout, d as Link, k as ChevronLeft, t as toast } from "./router-yLgiv1p7.js";
import { S as Settings } from "./settings-aGUEQ0PF.js";
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
  const updateCustomer = useStore((s) => s.updateCustomer);
  const [name, setName] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [pwd, setPwd] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (hydrated && !customer) navigate({
      to: "/login"
    });
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
    }
  }, [hydrated, customer, navigate]);
  if (!customer) return null;
  const save = async (e) => {
    e.preventDefault();
    const data = {
      name,
      phone
    };
    if (pwd) data.password = pwd;
    const r = await updateCustomer(data);
    if (r.ok) {
      toast.success(r.message);
      setPwd("");
    } else toast.error(r.message);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/perfil", className: "inline-flex items-center gap-1 text-sm text-muted-foreground mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
      " Voltar"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold mb-4 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-5 w-5 text-primary" }),
      " Configurações"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "bg-card rounded-2xl shadow-card p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Nome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), required: true, className: "mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: customer.email, disabled: true, className: "mt-1 w-full h-11 px-3 rounded-xl bg-muted border border-border text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Telefone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: phone, onChange: (e) => setPhone(e.target.value), className: "mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Nova senha (opcional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: pwd, onChange: (e) => setPwd(e.target.value), placeholder: "Deixe em branco para manter", className: "mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold", children: "Salvar alterações" })
    ] })
  ] }) });
}
export {
  Page as component
};
