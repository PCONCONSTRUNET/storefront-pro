import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { b as useSearch, c as useNavigate, u as useStore, L as LoaderCircle, d as Link, C as CircleCheck, t as toast } from "./router-CbsSSRKz.js";
import { c as consumeResetToken } from "./passwordReset-Bf6hGSGE.js";
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
  const {
    token
  } = useSearch({
    from: "/redefinir-senha"
  });
  const navigate = useNavigate();
  const resetPasswordFor = useStore((s) => s.resetPasswordFor);
  const [loading, setLoading] = reactExports.useState(true);
  const [account, setAccount] = reactExports.useState(null);
  const [pwd, setPwd] = reactExports.useState("");
  const [pwd2, setPwd2] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [done, setDone] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const r = await consumeResetToken(token);
      if (!active) return;
      setAccount(r);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [token]);
  const submit = (e) => {
    e.preventDefault();
    if (!account) return;
    if (pwd !== pwd2) {
      toast.error("As senhas não conferem");
      return;
    }
    setSubmitting(true);
    const r = resetPasswordFor(account.subjectType, account.subjectEmail, pwd);
    if (r.ok) {
      toast.success(r.message);
      setDone(true);
    } else {
      toast.error(r.message);
      setSubmitting(false);
    }
  };
  const loginPath = account?.subjectType === "admin" ? "/admin/login" : account?.subjectType === "affiliate" ? "/afiliada/login" : "/login";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm bg-card rounded-3xl shadow-soft p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl text-primary text-center", children: "Redefinir senha" }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) }) : !token || !account ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Link inválido ou expirado." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/esqueci-senha", className: "inline-block text-sm text-primary underline", children: "Solicitar novo link" })
    ] }) : done ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-12 w-12 mx-auto text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground", children: "Senha redefinida com sucesso!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
        to: loginPath,
        replace: true
      }), className: "w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold", children: "Ir para o login" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
        "Conta:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: account.subjectEmail })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Nova senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: pwd, onChange: (e) => setPwd(e.target.value), required: true, minLength: 4, autoFocus: true, className: "mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Confirmar senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: pwd2, onChange: (e) => setPwd2(e.target.value), required: true, minLength: 4, className: "mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: submitting, className: "w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70", children: [
        submitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        "Redefinir senha"
      ] })
    ] })
  ] }) });
}
export {
  Page as component
};
