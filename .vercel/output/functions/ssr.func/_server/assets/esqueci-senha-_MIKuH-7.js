import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { u as useStore, L as LoaderCircle, d as Link, e as Copy, M as MessageCircle, t as toast } from "./router-yLgiv1p7.js";
import { a as createResetToken, b as buildResetUrl } from "./passwordReset-BPVqX80p.js";
import { M as Mail } from "./mail-KLfYfUVi.js";
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
  const findAccountByEmail = useStore((s) => s.findAccountByEmail);
  const whatsapp = useStore((s) => s.settings.whatsapp);
  const [email, setEmail] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [link, setLink] = reactExports.useState(null);
  const [accountPhone, setAccountPhone] = reactExports.useState(void 0);
  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const account = findAccountByEmail(email);
      if (!account) {
        toast.success("Se este email estiver cadastrado, enviamos o link de recuperação.");
        return;
      }
      const token = await createResetToken(account.kind, account.email);
      const url = buildResetUrl(token);
      setLink(url);
      setAccountPhone(account.phone);
      try {
        const {
          sendPasswordResetEmail
        } = await import("./router-yLgiv1p7.js").then((n) => n.ag);
        await sendPasswordResetEmail({
          email: account.email,
          resetUrl: url
        });
        toast.success("Link enviado para seu e-mail! Válido por 30 minutos.");
      } catch {
        toast.success("Link de recuperação gerado! Válido por 30 minutos.");
      }
    } catch (err) {
      toast.error(err?.message || "Erro ao gerar link de recuperação");
    } finally {
      setSubmitting(false);
    }
  };
  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado");
  };
  const whatsappShare = () => {
    if (!link) return;
    const phone = (accountPhone || whatsapp || "").replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá! Use este link para redefinir sua senha (válido por 30 min):

${link}`);
    const base = phone ? `https://wa.me/${phone.startsWith("55") ? phone : "55" + phone}` : "https://wa.me/";
    window.open(`${base}?text=${msg}`, "_blank");
  };
  const emailShare = () => {
    if (!link) return;
    const subject = encodeURIComponent("Redefinição de senha");
    const body = encodeURIComponent(`Use este link para redefinir sua senha (válido por 30 min):

${link}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm bg-card rounded-3xl shadow-soft p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl text-primary text-center", children: "Recuperar senha" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center mt-1", children: "Digite seu e-mail e geramos um link seguro de redefinição." }),
    !link ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoFocus: true, className: "mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: submitting, className: "w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70", children: [
        submitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        "Gerar link de recuperação"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground text-center pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary underline", children: "Voltar ao login" }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Link gerado (válido por 30 minutos):" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono break-all text-foreground", children: link })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: copyLink, className: "w-full h-11 rounded-full bg-secondary text-secondary-foreground font-semibold inline-flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }),
        " Copiar link"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: whatsappShare, className: "w-full h-11 rounded-full bg-[#25D366] text-white font-semibold inline-flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
        " Enviar por WhatsApp"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: emailShare, className: "w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
        " Enviar por e-mail"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground text-center pt-2", children: "Após redefinir, faça login normalmente." })
    ] })
  ] }) });
}
export {
  Page as component
};
