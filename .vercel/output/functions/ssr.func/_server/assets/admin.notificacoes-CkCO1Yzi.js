import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { A as AdminLayout, B as BellRing, S as Send, a as Smartphone } from "./AdminLayout-B0sSU-Ve.js";
import { g as createLucideIcon, a2 as useNotifications, j as Sparkles, t as toast, z as Trash2, a3 as CATEGORY_LABELS, a4 as AUDIENCE_LABELS, X, a5 as Bell } from "./router-yLgiv1p7.js";
import { M as Mail } from "./mail-KLfYfUVi.js";
import { R as RefreshCw } from "./refresh-cw-B3gGSLit.js";
import { C as Check } from "./check-B5if4Xeu.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./adminHelpers.server-BhLg7GIA.js";
import "./client.server-C7GAOqxY.js";
import "./layout-dashboard-XIrZfteB.js";
import "./shopping-cart-CUZGzorf.js";
import "./dollar-sign-DqvXPngu.js";
import "./settings-aGUEQ0PF.js";
import "./log-out-KcgBpaKW.js";
const __iconNode$2 = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
];
const History = createLucideIcon("history", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      key: "18887p"
    }
  ]
];
const MessageSquare = createLucideIcon("message-square", __iconNode$1);
const __iconNode = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
];
const Settings2 = createLucideIcon("settings-2", __iconNode);
function Page() {
  const {
    templates,
    logs,
    pushPermission,
    pushEnabled,
    updateTemplate,
    resetTemplates,
    sendManual,
    markAllRead,
    clearLogs,
    requestPushPermission,
    disablePush
  } = useNotifications();
  const [tab, setTab] = reactExports.useState("enviar");
  const adminTemplates = reactExports.useMemo(() => templates.filter((t) => t.audience === "admin"), [templates]);
  const [form, setForm] = reactExports.useState({
    title: "",
    body: "",
    channels: {
      push: true,
      email: false,
      inapp: true
    }
  });
  const stats = reactExports.useMemo(() => ({
    total: logs.length,
    unread: logs.filter((l) => !l.read).length,
    push: logs.filter((l) => l.channels.includes("push")).length,
    activeTemplates: adminTemplates.filter((t) => t.enabled).length
  }), [logs, adminTemplates]);
  const send = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    const channels = [];
    if (form.channels.push) channels.push("push");
    if (form.channels.email) channels.push("email");
    if (form.channels.inapp) channels.push("inapp");
    if (channels.length === 0) {
      toast.error("Escolha ao menos um canal");
      return;
    }
    sendManual({
      title: form.title,
      body: form.body,
      audience: "admin",
      channels
    });
    setForm({
      ...form,
      title: "",
      body: ""
    });
    toast.success("Notificação enviada para o admin");
  };
  const [togglingPush, setTogglingPush] = reactExports.useState(false);
  const togglePush = async (enabled) => {
    setTogglingPush(true);
    try {
      if (enabled) {
        const OS = window.OneSignal;
        if (Notification.permission === "granted") {
          const sub = OS?.User?.PushSubscription;
          if (sub && !sub.optedIn) {
            await sub.optIn();
          }
          if (OS) {
            await OS.login("admin-user");
            OS.User.addTag("role", "admin");
          }
          toast.success("Notificações reativadas neste dispositivo!");
        } else {
          const r = await requestPushPermission();
          if (r === "granted") toast.success("Notificações ativadas!");
          else if (r === "denied") toast.error("Permissão negada. Ative manualmente nas configurações do navegador.");
          else toast.error("Seu navegador não suporta notificações push.");
        }
      } else {
        const OS = window.OneSignal;
        const sub = OS?.User?.PushSubscription;
        if (sub?.optedIn) {
          await sub.optOut();
          await disablePush();
          toast.success("Notificações desativadas neste dispositivo.");
        } else {
          await disablePush();
          toast.info("Notificações já estavam desativadas.");
        }
      }
    } catch (e) {
      console.error("[togglePush]", e);
      toast.error("Erro ao alterar as notificações. Tente novamente.");
    } finally {
      setTogglingPush(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Notificações", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl gradient-primary text-primary-foreground shadow-soft mb-4 animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/15 blur-3xl pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-gold/30 blur-3xl pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-5 flex flex-wrap items-center gap-4 justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-white/15 backdrop-blur grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BellRing, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl leading-tight", children: "Central de notificações" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-90", children: "Push, e-mail e in-app — tudo em um só lugar." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 bg-white/10 backdrop-blur px-4 py-2 rounded-2xl border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase opacity-70", children: "Status do Push" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PushBadge, { state: pushPermission })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-8 bg-white/20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase opacity-70 mb-1", children: "Notificações" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: pushEnabled, onChange: togglePush, className: `bg-white/20 ${togglingPush ? "opacity-50 pointer-events-none" : ""}` })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid grid-cols-2 md:grid-cols-4 gap-2 px-5 pb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Enviadas", value: stats.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Não lidas", value: stats.unread, highlight: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Via push", value: stats.push }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Modelos ativos", value: `${stats.activeTemplates}/${adminTemplates.length}` })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4 overflow-x-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "enviar", onClick: () => setTab("enviar"), icon: Send, children: "Enviar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBtn, { active: tab === "modelos", onClick: () => setTab("modelos"), icon: Settings2, children: [
        "Modelos (",
        adminTemplates.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBtn, { active: tab === "historico", onClick: () => setTab("historico"), icon: History, children: [
        "Histórico (",
        logs.length,
        ")"
      ] })
    ] }),
    tab === "enviar" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_360px] gap-4 animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: send, className: "bg-card rounded-2xl p-5 shadow-card space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
          " Notificação manual"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Título", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.title, onChange: (e) => setForm({
            ...form,
            title: e.target.value
          }), maxLength: 60, className: "input", placeholder: "Ex: Promoção relâmpago 🎀" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            form.title.length,
            "/60"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Mensagem", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.body, onChange: (e) => setForm({
            ...form,
            body: e.target.value
          }), rows: 4, maxLength: 160, className: "input min-h-[96px] py-2", placeholder: "Escreva uma mensagem curta e direta..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            form.body.length,
            "/160"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground rounded-xl bg-muted/50 px-3 py-2", children: [
          "Envio manual apenas para dispositivos ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "admin" }),
          " sincronizados."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Canais" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mt-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelToggle, { icon: Smartphone, label: "Push", active: form.channels.push, onClick: () => setForm({
              ...form,
              channels: {
                ...form.channels,
                push: !form.channels.push
              }
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelToggle, { icon: Mail, label: "E-mail", active: form.channels.email, onClick: () => setForm({
              ...form,
              channels: {
                ...form.channels,
                email: !form.channels.email
              }
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelToggle, { icon: MessageSquare, label: "In-app", active: form.channels.inapp, onClick: () => setForm({
              ...form,
              channels: {
                ...form.channels,
                inapp: !form.channels.inapp
              }
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
          " Enviar agora"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground text-center", children: "Push via OneSignal ativo ✅ — notificações serão entregues aos dispositivos cadastrados." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Pré-visualização" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationPreview, { title: form.title || "Título da notificação", body: form.body || "A mensagem aparece aqui..." })
      ] })
    ] }),
    tab === "modelos" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card p-4 animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: "Modelos automáticos (admin)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Disparados pelos eventos da loja. Use ",
            "{cliente}",
            ",",
            " ",
            "{pedido}",
            ", ",
            "{total}",
            ", ",
            "{afiliada}",
            ", ",
            "{produto}",
            ",",
            " ",
            "{estoque}",
            " como variáveis."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          resetTemplates();
          toast.success("Modelos restaurados");
        }, className: "h-9 px-3 rounded-full bg-muted hover:bg-muted/70 text-xs font-semibold flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
          " Restaurar padrão"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: adminTemplates.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TemplateRow, { template: t, onChange: (patch) => updateTemplate(t.id, patch) }, t.id)) })
    ] }),
    tab === "historico" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card p-4 animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: "Histórico de envios" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: markAllRead, className: "h-9 px-3 rounded-full bg-muted hover:bg-muted/70 text-xs font-semibold flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
            " Marcar todas como lidas"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: async () => {
            const {
              confirmDialog
            } = await import("./AdminLayout-B0sSU-Ve.js").then((n) => n.C);
            if (await confirmDialog({
              title: "Limpar histórico?",
              description: "Todas as notificações serão removidas.",
              confirmLabel: "Limpar"
            })) {
              clearLogs();
              toast.success("Histórico limpo");
            }
          }, className: "h-9 px-3 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
            " Limpar"
          ] })
        ] })
      ] }),
      logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-12", children: "Nenhuma notificação enviada ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: logs.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: `rounded-xl p-3 border transition-colors ${l.read ? "bg-background border-border" : "bg-primary/5 border-primary/30"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: l.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground", children: CATEGORY_LABELS[l.category] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-accent/40 text-foreground capitalize", children: AUDIENCE_LABELS[l.audience] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: l.body }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(l.sentAt).toLocaleString("pt-BR") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              l.channels.includes("push") && /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-3 w-3" }),
              l.channels.includes("email") && /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
              l.channels.includes("inapp") && /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3 w-3" })
            ] })
          ] })
        ] }),
        !l.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-primary mt-1 shrink-0" })
      ] }) }, l.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `.input{margin-top:4px;width:100%;height:44px;padding:0 14px;border-radius:14px;background:var(--background);border:1px solid var(--border);outline:none;transition:all .2s ease;font-size:14px}.input:focus{border-color:color-mix(in oklab,var(--primary) 60%,transparent);box-shadow:0 0 0 4px color-mix(in oklab,var(--primary) 15%,transparent)}.input::placeholder{color:color-mix(in oklab,var(--muted-foreground) 70%,transparent)}` })
  ] });
}
function TabBtn({
  active,
  onClick,
  icon: Icon,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: `h-10 px-4 rounded-full text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${active ? "gradient-primary text-primary-foreground shadow-soft" : "bg-card border border-border hover:bg-muted/40"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
    " ",
    children
  ] });
}
function Stat({
  label,
  value,
  highlight
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl px-3 py-2 backdrop-blur ${highlight ? "bg-gold text-gold-foreground" : "bg-white/15"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide opacity-90", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-base mt-0.5", children: value })
  ] });
}
function PushBadge({
  state
}) {
  const map = {
    granted: {
      label: "Push ativo",
      cls: "bg-success text-success-foreground"
    },
    denied: {
      label: "Push bloqueado",
      cls: "bg-destructive text-destructive-foreground"
    },
    default: {
      label: "Push pendente",
      cls: "bg-white/15"
    },
    unsupported: {
      label: "Sem suporte",
      cls: "bg-white/15"
    }
  };
  const m = map[state] ?? map.default;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-2 py-1 rounded-full font-semibold ${m.cls}`, children: m.label });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: label }),
    children
  ] });
}
function ChannelToggle({
  icon: Icon,
  label,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick, className: `h-12 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${active ? "border-primary bg-primary/10 text-primary scale-[1.02]" : "border-border bg-background text-muted-foreground hover:bg-muted/40"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
    " ",
    label,
    active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 opacity-50" })
  ] });
}
function NotificationPreview({
  title,
  body
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card border border-border space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: "Como aparecerá no celular" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-foreground/95 text-background p-3 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg gradient-primary grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] opacity-70 uppercase", children: "Princesa de Laços" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] opacity-70", children: "agora" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm truncate", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-90 line-clamp-2", children: body })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: "In-app (toast)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-card border border-border p-3 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm truncate", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground line-clamp-2", children: body })
      ] })
    ] })
  ] });
}
function TemplateRow({
  template,
  onChange
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-xl border border-border bg-background overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-accent/40 grid place-items-center text-xl shrink-0", children: template.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: CATEGORY_LABELS[template.category] }),
          !template.enabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive", children: "Desativado" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: template.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelDot, { icon: Smartphone, active: template.sendPush, title: "Push" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelDot, { icon: Mail, active: template.sendEmail, title: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelDot, { icon: MessageSquare, active: template.sendInApp, title: "In-app" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: template.enabled, onChange: (v) => onChange({
          enabled: v
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpen((o) => !o), className: "text-xs font-semibold text-primary px-2", children: open ? "Fechar" : "Editar" })
      ] })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border p-3 bg-muted/30 space-y-2 animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Título", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: template.title, onChange: (e) => onChange({
        title: e.target.value
      }), className: "input" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mensagem", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: template.body, onChange: (e) => onChange({
        body: e.target.value
      }), rows: 3, className: "input min-h-[80px] py-2" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { label: "Push", checked: template.sendPush, onChange: (v) => onChange({
          sendPush: v
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { label: "E-mail", checked: template.sendEmail, onChange: (v) => onChange({
          sendEmail: v
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { label: "In-app", checked: template.sendInApp, onChange: (v) => onChange({
          sendInApp: v
        }) })
      ] })
    ] })
  ] });
}
function ChannelDot({
  icon: Icon,
  active,
  title
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title, className: `w-7 h-7 rounded-lg grid place-items-center ${active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground/40"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }) });
}
function Switch({
  checked,
  onChange,
  label,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 cursor-pointer text-xs font-medium select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"} ${className || ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked, onChange: (e) => onChange(e.target.checked), className: "sr-only" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}` })
    ] }),
    label && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
  ] });
}
export {
  Page as component
};
