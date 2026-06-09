import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { A as AdminLayout } from "./AdminLayout-IA_uuXcZ.js";
import { g as createLucideIcon, a6 as getGatewayConfigFn, t as toast, L as LoaderCircle, X, e as Copy, a7 as saveGatewayConfigFn } from "./router-CbsSSRKz.js";
import { E as Eye } from "./eye-DJ4XyvgE.js";
import { C as Check } from "./check-Dt2f_uGi.js";
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
const __iconNode = [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const EyeOff = createLucideIcon("eye-off", __iconNode);
const WEBHOOK_URL = "https://glezvjgtzplflzevclor.supabase.co/functions/v1/mp-webhook";
function defaultFees(max) {
  const out = {};
  for (let i = 1; i <= max; i++) out[String(i)] = 0;
  return out;
}
function Page() {
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [showToken, setShowToken] = reactExports.useState(false);
  const [copied, setCopied] = reactExports.useState(false);
  const [accessToken, setAccessToken] = reactExports.useState("");
  const [publicKey, setPublicKey] = reactExports.useState("");
  const [maxInstallments, setMaxInstallments] = reactExports.useState(3);
  const [fees, setFees] = reactExports.useState(defaultFees(3));
  reactExports.useEffect(() => {
    (async () => {
      try {
        const row = await getGatewayConfigFn();
        setAccessToken(row?.mp_access_token || "");
        setPublicKey(row?.mp_public_key || "");
        const maxInst = Number(row?.max_installments ?? 3);
        setMaxInstallments(maxInst);
        const merged = defaultFees(maxInst);
        Object.entries(row?.installment_fees || {}).forEach(([k, v]) => {
          merged[k] = Number(v) || 0;
        });
        setFees(merged);
      } catch (e) {
        console.error("[gateway] load error", e);
        toast.error(e instanceof Error ? e.message : "Falha ao carregar configuração");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const handleMaxChange = (n) => {
    const v = Math.max(1, Math.min(12, n));
    setMaxInstallments(v);
    setFees((prev) => {
      const next = defaultFees(v);
      Object.entries(prev).forEach(([k, val]) => {
        if (Number(k) <= v) next[k] = val;
      });
      return next;
    });
  };
  const save = async () => {
    setSaving(true);
    try {
      const res = await saveGatewayConfigFn({
        data: {
          mp_access_token: accessToken.trim(),
          mp_public_key: publicKey.trim(),
          environment: "production",
          max_installments: maxInstallments,
          installment_fees: fees
        }
      });
      if (!res.ok) throw new Error(res.message);
      toast.success(res.message || "Configuração salva!");
    } catch (e) {
      console.error("[gateway] save error", e);
      toast.error(e instanceof Error ? e.message : "Erro ao salvar", {
        duration: 8e3
      });
    } finally {
      setSaving(false);
    }
  };
  const copyWebhook = async () => {
    await navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2e3);
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLayout, { title: "Gateway de pagamento", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-20 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin mr-2" }),
      " Carregando…"
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLayout, { title: "Gateway de pagamento", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { title: "Credenciais Mercado Pago", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-3", children: [
        "Acesse",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.mercadopago.com.br/developers/panel/app", target: "_blank", rel: "noreferrer", className: "text-primary underline", children: "Mercado Pago → Suas integrações" }),
        " ",
        "e cole as credenciais da sua aplicação."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Access Token (APP_USR-...)", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: showToken ? "text" : "password", value: accessToken, onChange: (e) => setAccessToken(e.target.value), onFocus: () => setShowToken(true), placeholder: "APP_USR-...", className: "flex-1 h-11 px-3 rounded-xl bg-muted/70 border border-border text-sm font-mono", autoComplete: "off", spellCheck: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowToken((v) => !v), title: showToken ? "Ocultar" : "Mostrar", className: "h-11 w-11 grid place-items-center rounded-xl border border-border bg-muted/70 hover:bg-muted", children: showToken ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
            setAccessToken("");
            setShowToken(true);
          }, title: "Limpar para colar novo token", className: "h-11 w-11 grid place-items-center rounded-xl border border-border bg-muted/70 hover:bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-1", children: [
          "Clique no ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "X" }),
          " para limpar e colar um novo token."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Public Key (usada no Checkout do cartão)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: publicKey, onChange: (e) => setPublicKey(e.target.value), placeholder: "APP_USR-pub-...", className: "flex-1 h-11 px-3 rounded-xl bg-muted/70 border border-border text-sm font-mono", autoComplete: "off", spellCheck: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPublicKey(""), title: "Limpar", className: "h-11 w-11 grid place-items-center rounded-xl border border-border bg-muted/70 hover:bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { title: "Webhook do Mercado Pago", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-2", children: [
        "Cole esta URL em ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Notificações → Webhooks" }),
        " no painel do Mercado Pago e marque o evento ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Pagamentos" }),
        ":"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { readOnly: true, value: WEBHOOK_URL, className: "flex-1 h-11 px-3 rounded-xl bg-muted/70 border border-border text-xs font-mono" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: copyWebhook, className: "h-11 px-3 rounded-xl border border-border bg-muted/70 hover:bg-muted flex items-center gap-1 text-sm", children: [
          copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }),
          copied ? "Copiado" : "Copiar"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { title: "Parcelamento no cartão", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nº máximo de parcelas (1 a 12)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, max: 12, value: maxInstallments, onChange: (e) => handleMaxChange(parseInt(e.target.value) || 1), className: "w-32 h-11 px-3 rounded-xl bg-muted/70 border border-border text-sm" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2 mb-2", children: [
        "Defina a ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "taxa em % por nº de parcelas" }),
        " que será somada ao total do pedido. Use ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "0" }),
        ' para "sem juros".'
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2", children: Array.from({
        length: maxInstallments
      }, (_, i) => i + 1).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-medium text-muted-foreground", children: [
          n,
          "x"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", min: 0, max: 100, value: fees[String(n)] ?? 0, onChange: (e) => setFees((prev) => ({
            ...prev,
            [String(n)]: parseFloat(e.target.value) || 0
          })), className: "w-full h-10 px-2 rounded-lg bg-muted/70 border border-border text-sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "%" })
        ] })
      ] }, n)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: save, disabled: saving, className: "h-11 px-6 rounded-full gradient-primary text-primary-foreground font-semibold disabled:opacity-60 flex items-center gap-2", children: [
      saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      "Salvar configuração"
    ] }) })
  ] }) });
}
function Card({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-5 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-3", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children })
  ] });
}
export {
  Page as component
};
