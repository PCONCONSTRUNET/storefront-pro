import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { c as useNavigate, q as useStoreHydrated, u as useStore, j as Sparkles, d as Link, t as toast } from "./router-CbsSSRKz.js";
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
  const currentId = useStore((s) => s.currentAffiliateId);
  const register = useStore((s) => s.registerAffiliate);
  const [form, setForm] = reactExports.useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  reactExports.useEffect(() => {
    if (hydrated && currentId) navigate({
      to: "/afiliada"
    });
  }, [hydrated, currentId, navigate]);
  const submit = async (e) => {
    e.preventDefault();
    const r = await register(form);
    if (r.ok) {
      window.history.replaceState(null, "", "/afiliada");
      navigate({
        to: "/afiliada",
        replace: true
      });
      toast.success(r.message);
    } else toast.error(r.message);
  };
  const set = (k) => (e) => setForm({
    ...form,
    [k]: e.target.value
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm bg-card rounded-3xl shadow-soft p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 mx-auto rounded-full gradient-primary grid place-items-center text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl text-primary mt-3", children: "Seja uma afiliada" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Crie sua conta para registrar suas vendas" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-6 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nome completo *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.name, onChange: set("name"), required: true, autoFocus: true, className: "input" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "E-mail *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: form.email, onChange: set("email"), required: true, className: "input" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "WhatsApp", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.phone, onChange: set("phone"), className: "input" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Senha *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: form.password, onChange: set("password"), required: true, minLength: 4, className: "input" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold", children: "Criar conta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground text-center pt-2", children: [
          "Já tem cadastro?",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/afiliada/login", className: "text-primary underline", children: "Entrar" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground text-center", children: "Sua comissão será definida pela administradora após o cadastro." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `.input{margin-top:4px;width:100%;height:44px;padding:0 12px;border-radius:12px;background:var(--background);border:1px solid var(--border);outline:none}.input:focus{box-shadow:0 0 0 2px color-mix(in oklab, var(--primary) 50%, transparent)}` })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label }),
    children
  ] });
}
export {
  Page as component
};
