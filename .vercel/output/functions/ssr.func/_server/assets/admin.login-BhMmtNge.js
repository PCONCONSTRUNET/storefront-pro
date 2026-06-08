import { M as useRouter, r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { c as useNavigate, q as useStoreHydrated, u as useStore, i as Crown, L as LoaderCircle, d as Link, t as toast } from "./router-yLgiv1p7.js";
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
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const isAdmin = useStore((s) => s.isAdmin);
  const loginAdmin = useStore((s) => s.loginAdmin);
  const [email, setEmail] = reactExports.useState("");
  const [pwd, setPwd] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    router.preloadRoute({
      to: "/admin/dashboard"
    }).catch(() => {
    });
  }, [router]);
  reactExports.useEffect(() => {
    if (hydrated && isAdmin) navigate({
      to: "/admin/dashboard"
    });
  }, [hydrated, isAdmin, navigate]);
  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const r = await loginAdmin(email, pwd);
      if (r.ok) {
        window.history.replaceState(null, "", "/admin/dashboard");
        navigate({
          to: "/admin/dashboard",
          replace: true
        });
        toast.success(r.message);
      } else {
        toast.error(r.message);
        setSubmitting(false);
      }
    } catch (err) {
      toast.error(err?.message || "Erro ao entrar");
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm bg-card rounded-3xl shadow-soft p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 mx-auto rounded-full gradient-primary grid place-items-center text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-7 w-7" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl text-primary mt-3", children: "Painel Admin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Acesso restrito a e-mails autorizados" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "E-mail autorizado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoFocus: true, placeholder: "seu@email.com", className: "mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: pwd, onChange: (e) => setPwd(e.target.value), required: true, placeholder: "Sua senha", className: "mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: submitting, className: "w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70", children: [
        submitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        submitting ? "Entrando..." : "Entrar"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground text-center pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/esqueci-senha", className: "text-primary underline", children: "Esqueci minha senha" }) })
    ] })
  ] }) });
}
export {
  Page as component
};
