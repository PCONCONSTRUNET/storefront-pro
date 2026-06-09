import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { u as useStore, s as selectCurrentCustomer, S as StoreLayout, U as User, P as Package, R as Receipt, m as MapPin, H as Heart, d as Link, l as ChevronRight, X, t as toast } from "./router-CbsSSRKz.js";
import { C as CircleQuestionMark } from "./circle-question-mark-85SQLCqF.js";
import { S as Settings } from "./settings-DhwBCChM.js";
import { L as LogOut } from "./log-out-CpDN9yeE.js";
import { I as Instagram } from "./instagram-DFec4G7v.js";
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
  const customer = useStore(selectCurrentCustomer);
  const logoutCustomer = useStore((s) => s.logoutCustomer);
  const [authMode, setAuthMode] = reactExports.useState(null);
  if (!customer) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(StoreLayout, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto text-center py-20 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 mx-auto rounded-full gradient-soft grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-9 w-9 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold mt-4", children: "Bem-vinda à Princesa de Laços" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Entre ou crie sua conta para acompanhar pedidos." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAuthMode("login"), className: "h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center", children: "Entrar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAuthMode("cadastro"), className: "h-12 rounded-full border-2 border-primary text-primary font-semibold flex items-center justify-center", children: "Cadastrar" })
        ] })
      ] }),
      authMode && /* @__PURE__ */ jsxRuntimeExports.jsx(AuthModal, { mode: authMode, setMode: setAuthMode, onClose: () => setAuthMode(null) })
    ] });
  }
  const items = [{
    to: "/pedidos",
    icon: Package,
    label: "Meus pedidos"
  }, {
    to: "/perfil/transacoes",
    icon: Receipt,
    label: "Histórico de transações"
  }, {
    to: "/perfil/enderecos",
    icon: MapPin,
    label: "Endereços"
  }, {
    to: "/perfil/favoritos",
    icon: Heart,
    label: "Favoritos"
  }, {
    to: "/suporte",
    icon: CircleQuestionMark,
    label: "Central de Ajuda"
  }, {
    to: "/perfil/configuracoes",
    icon: Settings,
    label: "Configurações"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-primary to-rose text-primary-foreground rounded-2xl p-5 flex items-center gap-4 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-white/20 grid place-items-center text-2xl font-bold", children: customer.name[0]?.toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg", children: customer.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-90", children: customer.email })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 bg-card rounded-2xl shadow-card divide-y divide-border overflow-hidden", children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: it.to, className: "flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(it.icon, { className: "h-5 w-5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-medium text-sm", children: it.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
    ] }) }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: logoutCustomer, className: "mt-4 w-full h-12 rounded-full border-2 border-destructive/30 text-destructive font-semibold flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
      " Sair"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Siga a gente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://www.instagram.com/princesadelacos58/", target: "_blank", rel: "noopener noreferrer", "aria-label": "Instagram", className: "group relative w-12 h-12 rounded-2xl flex items-center justify-center text-white overflow-hidden shadow-lg transition-all hover:scale-110 hover:shadow-xl", style: {
          background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Instagram, { className: "h-6 w-6 relative z-10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://wa.me/554888644474", target: "_blank", rel: "noopener noreferrer", "aria-label": "WhatsApp", className: "group relative w-12 h-12 rounded-2xl flex items-center justify-center text-white overflow-hidden shadow-lg transition-all hover:scale-110 hover:shadow-xl", style: {
          background: "linear-gradient(135deg, #25d366, #128c7e)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 32 32", className: "h-6 w-6 relative z-10", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.464-1.32.057-.16.057-.327.057-.487 0-.484-.156-.612-.602-.84-.473-.235-.93-.488-1.404-.738zM16.044 26.27a9.93 9.93 0 0 1-5.4-1.586l-3.866 1.234 1.255-3.74a9.917 9.917 0 0 1-1.916-5.876c0-5.486 4.464-9.95 9.952-9.95s9.95 4.464 9.95 9.95c0 5.485-4.466 9.967-9.975 9.967zm0-21.95C9.39 4.32 4 9.708 4 16.346c0 2.28.626 4.408 1.722 6.224L3.66 28.66l6.32-2.02a11.94 11.94 0 0 0 6.064 1.65c6.66 0 12.054-5.41 12.054-12.05 0-6.633-5.394-12.018-12.06-12.018z" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors" })
        ] })
      ] })
    ] })
  ] }) });
}
function AuthModal({
  mode,
  setMode,
  onClose
}) {
  const loginCustomer = useStore((s) => s.loginCustomer);
  const registerCustomer = useStore((s) => s.registerCustomer);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [form, setForm] = reactExports.useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const submitLogin = async (e) => {
    e.preventDefault();
    const r = await loginCustomer(email, password);
    if (r.ok) {
      toast.success(r.message);
      onClose();
    } else {
      toast.error(r.message);
    }
  };
  const submitCadastro = async (e) => {
    e.preventDefault();
    const r = await registerCustomer(form);
    if (r.ok) {
      toast.success(r.message);
      onClose();
    } else {
      toast.error(r.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-overlay-in", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-[340px] sm:max-w-sm bg-card rounded-2xl overflow-hidden shadow-2xl animate-modal-in", onClick: (e) => e.stopPropagation(), role: "dialog", "aria-modal": "true", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gradient-primary text-primary-foreground px-4 pt-4 pb-5 relative text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "absolute right-3 top-3 w-7 h-7 grid place-items-center rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors", "aria-label": "Fechar", type: "button", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl", children: mode === "login" ? "Bem-vinda" : "Crie sua conta" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-primary-foreground/90 text-xs", children: mode === "login" ? "Entre na sua conta." : "Preencha os dados para começar." })
    ] }),
    mode === "login" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitLogin, className: "px-4 py-4 space-y-3 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthField, { label: "E-mail", type: "email", value: email, onChange: setEmail, placeholder: "seu@email.com" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthField, { label: "Senha", type: "password", value: password, onChange: setPassword, placeholder: "Sua senha" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold mt-1 shadow-soft hover:opacity-95 active:scale-[0.99] transition-all text-sm", children: "Entrar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground pt-0.5", children: [
        "Não tem conta?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMode("cadastro"), className: "text-primary font-semibold", children: "Cadastre-se" })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitCadastro, className: "px-4 py-4 space-y-3 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthField, { label: "Nome completo", value: form.name, onChange: (v) => setForm({
        ...form,
        name: v
      }), placeholder: "Como devemos te chamar?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthField, { label: "E-mail", type: "email", value: form.email, onChange: (v) => setForm({
        ...form,
        email: v
      }), placeholder: "seu@email.com" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthField, { label: "Telefone", value: form.phone, onChange: (v) => setForm({
        ...form,
        phone: v
      }), placeholder: "(11) 99999-9999" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthField, { label: "Senha", type: "password", value: form.password, onChange: (v) => setForm({
        ...form,
        password: v
      }), placeholder: "Mínimo 6 caracteres" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold mt-1 shadow-soft hover:opacity-95 active:scale-[0.99] transition-all text-sm", children: "Criar conta" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground pt-0.5", children: [
        "Já tem conta?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMode("login"), className: "text-primary font-semibold", children: "Entrar" })
      ] })
    ] })
  ] }) });
}
function AuthField({
  label,
  value,
  onChange,
  type = "text",
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, onChange: (e) => onChange(e.target.value), required: true, placeholder, className: "mt-1 w-full h-10 px-3 rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" })
  ] });
}
export {
  Page as component
};
