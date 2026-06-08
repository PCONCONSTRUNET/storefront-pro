import { U as jsxRuntimeExports, r as reactExports } from "../server.js";
import { g as createLucideIcon, u as useStore, a9 as usePushNotifications, X, a5 as Bell, C as CircleCheck, aa as Share, w as Plus, t as toast, c as useNavigate, q as useStoreHydrated, ab as useRouterState, P as Package, j as Sparkles, T as Tag, y as CreditCard, d as Link, o as cn, a as Search } from "./router-yLgiv1p7.js";
import { s as supabase } from "./adminHelpers.server-BhLg7GIA.js";
import { L as LayoutDashboard } from "./layout-dashboard-XIrZfteB.js";
import { S as ShoppingCart } from "./shopping-cart-CUZGzorf.js";
import { D as DollarSign } from "./dollar-sign-DqvXPngu.js";
import { S as Settings } from "./settings-aGUEQ0PF.js";
import { L as LogOut } from "./log-out-KcgBpaKW.js";
const __iconNode$a = [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
];
const Activity = createLucideIcon("activity", __iconNode$a);
const __iconNode$9 = [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
];
const ArrowUpDown = createLucideIcon("arrow-up-down", __iconNode$9);
const __iconNode$8 = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  ["path", { d: "M22 8c0-2.3-.8-4.3-2-6", key: "5bb3ad" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ],
  ["path", { d: "M4 2C2.8 3.7 2 5.7 2 8", key: "tap9e0" }]
];
const BellRing = createLucideIcon("bell-ring", __iconNode$8);
const __iconNode$7 = [
  ["path", { d: "M5 21v-6", key: "1hz6c0" }],
  ["path", { d: "M12 21V9", key: "uvy0l4" }],
  ["path", { d: "M19 21V3", key: "11j9sm" }]
];
const ChartNoAxesColumnIncreasing = createLucideIcon("chart-no-axes-column-increasing", __iconNode$7);
const __iconNode$6 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$6);
const __iconNode$5 = [
  [
    "path",
    {
      d: "M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",
      key: "hod4my"
    }
  ],
  [
    "path",
    {
      d: "M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",
      key: "w4yl2u"
    }
  ],
  ["path", { d: "M3 5a2 2 0 0 0 2 2h3", key: "f2jnh7" }],
  ["path", { d: "M3 3v13a2 2 0 0 0 2 2h3", key: "k8epm1" }]
];
const FolderTree = createLucideIcon("folder-tree", __iconNode$5);
const __iconNode$4 = [
  ["path", { d: "M4 5h16", key: "1tepv9" }],
  ["path", { d: "M4 12h16", key: "1lakjw" }],
  ["path", { d: "M4 19h16", key: "1djgab" }]
];
const Menu = createLucideIcon("menu", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
const Send = createLucideIcon("send", __iconNode$3);
const __iconNode$2 = [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
];
const Smartphone = createLucideIcon("smartphone", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode);
function WhatsAppIcon({
  size = 24,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 32 32",
      fill: "currentColor",
      "aria-hidden": "true",
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.13-.602.158-.93-.085-.4-2.336-1.39-2.622-1.762zm-2.94 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.995-8.995s8.998 4.04 8.998 8.995-4.04 8.998-8.998 8.998zm0-19.798c-5.937 0-10.8 4.862-10.8 10.8 0 1.876.485 3.71 1.404 5.327L5 27.495l5.55-1.66a10.722 10.722 0 0 0 5.62 1.6c5.94 0 10.802-4.862 10.802-10.8s-4.862-10.8-10.8-10.8z" })
    }
  );
}
function EnableNotificationsPrompt() {
  const isAdmin = useStore((s) => s.isAdmin);
  const currentCustomerId = useStore((s) => s.currentCustomerId);
  const role = isAdmin ? "admin" : "cliente";
  const userId = isAdmin ? null : currentCustomerId;
  const { supported, subscribed, permission, loading, enable } = usePushNotifications({ role, userId });
  const shouldShow = supported && !subscribed && permission === "default" && !loading;
  if (!shouldShow) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4 pointer-events-none",
      style: { marginBottom: "60px" },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-auto max-w-sm mx-auto bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
            },
            "aria-label": "Fechar",
            className: "absolute right-2 top-2 w-7 h-7 grid place-items-center rounded-full hover:bg-muted text-muted-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl gradient-primary grid place-items-center text-primary-foreground shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 pr-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-foreground", children: "Ativar notificações" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: isAdmin ? "Receba avisos de pedidos, pagamentos e estoque 💰" : "Receba avisos de pedidos, pagamentos e novidades 💖" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: enable,
            disabled: loading,
            className: "mt-3 w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold text-sm shadow-soft active:scale-[0.98] transition-transform disabled:opacity-60",
            children: loading ? "Ativando..." : "Ativar agora"
          }
        )
      ] }) })
    }
  );
}
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function AdminDeviceSyncBanner() {
  const { supported, subscribed, permission, loading, playerId, enable } = usePushNotifications({ role: "admin", userId: null });
  const [iosInstallOpen, setIosInstallOpen] = reactExports.useState(false);
  const [testing, setTesting] = reactExports.useState(false);
  const [dismissed, setDismissed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      if (localStorage.getItem("admin_sync_dismissed_until")) {
        const until = Number(localStorage.getItem("admin_sync_dismissed_until"));
        if (until > Date.now()) setDismissed(true);
      }
    } catch {
    }
  }, []);
  const handleSync = async () => {
    if (isIOS() && !isStandalone()) {
      setIosInstallOpen(true);
      return;
    }
    if (!supported) {
      toast.error("Este navegador não suporta notificações push.");
      return;
    }
    if (permission === "denied") {
      toast.error("Permissão bloqueada. Vá em ajustes do navegador → Notificações → Permitir.");
      return;
    }
    const ok = await enable();
    if (ok) toast.success("Celular sincronizado! 🎉 Vai receber as notificações.");
    else toast.error("Não foi possível sincronizar. Tente novamente.");
  };
  const handleTest = async () => {
    setTesting(true);
    try {
      await supabase.functions.invoke("send-push", {
        body: {
          title: "🔔 Teste de notificação",
          message: "Se você recebeu isso, está tudo certo no seu celular!",
          audience: "admin",
          url: "/admin"
        }
      });
      toast.success("Push de teste enviado para todos os celulares admin!");
    } catch (e) {
      toast.error("Falha ao enviar teste.");
    } finally {
      setTesting(false);
    }
  };
  if (loading) return null;
  if (subscribed && playerId) {
    if (dismissed) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-emerald-500/15 grid place-items-center text-emerald-600 dark:text-emerald-400 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-emerald-900 dark:text-emerald-100", children: "Celular sincronizado ✨" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-emerald-700 dark:text-emerald-300 truncate", children: "Você receberá pedidos e pagamentos aqui." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleTest,
          disabled: testing,
          className: "shrink-0 h-9 px-3 rounded-full bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3.5 w-3.5" }),
            testing ? "..." : "Testar"
          ]
        }
      )
    ] });
  }
  if (!supported && !(isIOS() && !isStandalone())) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-2xl gradient-primary text-primary-foreground shadow-soft overflow-hidden animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-white/15 backdrop-blur grid place-items-center shrink-0", children: permission === "denied" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-6 w-6" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BellRing, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-base leading-tight", children: permission === "denied" ? "Notificações bloqueadas" : "Sincronize este celular" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-90 mt-0.5", children: permission === "denied" ? "Libere as notificações nas configurações do navegador para receber alertas." : "Receba avisos de pagamento aprovado, novos pedidos e estoque neste aparelho." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleSync,
          disabled: loading || permission === "denied",
          className: "w-full h-11 rounded-full bg-white text-primary font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60 shadow-soft",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4" }),
            loading ? "Sincronizando..." : "Sincronizar este celular"
          ]
        }
      ) })
    ] }),
    iosInstallOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in",
        onClick: () => setIosInstallOpen(false),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-card rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-in slide-in-from-bottom-4",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl gradient-primary grid place-items-center text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-6 w-6" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground", children: "Instalar no iPhone" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "No iOS o push só funciona no app instalado." })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "space-y-3 text-sm text-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold shrink-0", children: "1" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Toque no botão ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "inline h-4 w-4 mx-1" }),
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Compartilhar" }),
                    " do Safari."
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold shrink-0", children: "2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Escolha ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "inline h-4 w-4 mx-1" }),
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Adicionar à Tela de Início" }),
                    "."
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold shrink-0", children: "3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Abra pelo ícone instalado, faça login e toque em ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Sincronizar este celular" }),
                    "."
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setIosInstallOpen(false),
                  className: "mt-5 w-full h-11 rounded-full gradient-primary text-primary-foreground font-bold text-sm",
                  children: "Entendi"
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
let listener = null;
function confirmDialog(opts) {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(window.confirm(opts.description || opts.title || "Confirmar?"));
      return;
    }
    listener({ ...opts, resolve });
  });
}
function ConfirmHost() {
  const [pending, setPending] = reactExports.useState(null);
  reactExports.useEffect(() => {
    listener = setPending;
    return () => {
      listener = null;
    };
  }, []);
  if (!pending) return null;
  const {
    title = "Confirmar ação",
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    destructive = true,
    resolve
  } = pending;
  const close = (v) => {
    resolve(v);
    setPending(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center sm:p-3 animate-overlay-in",
      onClick: () => close(false),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-card rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm overflow-hidden shadow-soft animate-modal-in",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `w-10 h-10 grid place-items-center rounded-full shrink-0 ${destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: title }),
                description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => close(false),
                  className: "w-8 h-8 grid place-items-center rounded-lg hover:bg-muted -mr-2 -mt-2",
                  "aria-label": "Fechar",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 p-3 pt-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => close(false),
                  className: "h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted",
                  children: cancelLabel
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => close(true),
                  className: `h-10 rounded-xl text-sm font-semibold text-white ${destructive ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`,
                  children: confirmLabel
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
const ConfirmDialog = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ConfirmHost,
  confirmDialog
}, Symbol.toStringTag, { value: "Module" }));
const nav = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true
  },
  { to: "/admin/bi", label: "B.I.", icon: ChartNoAxesColumnIncreasing },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { to: "/admin/organizar", label: "Organizar Home", icon: ArrowUpDown },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/afiliadas", label: "Afiliadas", icon: Sparkles },
  { to: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { to: "/admin/cupons", label: "Cupons", icon: Tag },
  { to: "/admin/notificacoes", label: "Notificações", icon: Bell },
  { to: "/admin/chatbot", label: "Chatbot", icon: WhatsAppIcon },
  { to: "/admin/logs", label: "Logs de Auditoria", icon: FileText },
  { to: "/admin/sincronizacao", label: "Sincronização", icon: Activity },
  { to: "/admin/gateway", label: "Gateway", icon: CreditCard },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings }
];
function AdminLayout({
  children,
  title
}) {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const isAdmin = useStore((s) => s.isAdmin);
  const logout = useStore((s) => s.logoutAdmin);
  const sync = useStore((s) => s.sync);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (hydrated && !isAdmin) navigate({ to: "/admin/login" });
  }, [hydrated, isAdmin, navigate]);
  reactExports.useEffect(() => {
    if (!isAdmin) return;
    void sync();
    const interval = window.setInterval(() => void sync(), 1e4);
    return () => window.clearInterval(interval);
  }, [isAdmin, sync]);
  if (!isAdmin)
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center text-sm text-muted-foreground", children: "Carregando..." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-muted/30 flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex w-60 bg-card border-r border-border flex-col sticky top-0 h-screen", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl text-primary", children: "Admin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Princesa de Laços" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 p-3 space-y-0.5 overflow-y-auto", children: nav.map((it) => {
        const active = it.exact ? path === it.to : path.startsWith(it.to);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: it.to,
            className: cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(it.icon, { className: "h-4 w-4" }),
              " ",
              it.label
            ]
          },
          it.to
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-t border-border space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/",
            className: "block text-xs text-center text-muted-foreground hover:text-primary py-2",
            children: "Ver loja"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              logout();
              navigate({ to: "/" });
            },
            className: "w-full flex items-center justify-center gap-2 text-sm text-destructive py-2 hover:bg-destructive/10 rounded-xl",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
              " Sair"
            ]
          }
        )
      ] })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "md:hidden fixed inset-0 z-50 bg-black/50",
        onClick: () => setOpen(false),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "aside",
          {
            className: "absolute left-0 top-0 bottom-0 w-64 bg-card p-3 flex flex-col",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg text-primary", children: "Admin" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 space-y-0.5 overflow-y-auto", children: nav.map((it) => {
                const active = it.exact ? path === it.to : path.startsWith(it.to);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: it.to,
                    onClick: () => setOpen(false),
                    className: cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    ),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(it.icon, { className: "h-4 w-4" }),
                      " ",
                      it.label
                    ]
                  },
                  it.to
                );
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => {
                    logout();
                    navigate({ to: "/" });
                  },
                  className: "flex items-center justify-center gap-2 text-sm text-destructive py-2 mt-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
                    " Sair"
                  ]
                }
              )
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "bg-card border-b border-border h-14 flex items-center px-4 sticky top-0 z-30 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "md:hidden",
            onClick: () => setOpen(true),
            "aria-label": "Menu",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold truncate", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalSearch, {}) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 p-4 md:p-6 animate-page-in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDeviceSyncBanner, {}),
        children
      ] }, path)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EnableNotificationsPrompt, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmHost, {})
  ] });
}
function GlobalSearch() {
  const navigate = useNavigate();
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const products = useStore((s) => s.products);
  const [q, setQ] = reactExports.useState("");
  const [open, setOpen] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const results = reactExports.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return { orders: [], customers: [], products: [] };
    const digits = term.replace(/\D/g, "");
    return {
      orders: orders.filter(
        (o) => o.id.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term) || digits && o.customerPhone.replace(/\D/g, "").includes(digits)
      ).slice(0, 5),
      customers: customers.filter(
        (c) => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || digits && c.phone.replace(/\D/g, "").includes(digits)
      ).slice(0, 5),
      products: products.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 5)
    };
  }, [q, orders, customers, products]);
  const total = results.orders.length + results.customers.length + results.products.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: "relative w-44 sm:w-72", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        value: q,
        onChange: (e) => {
          setQ(e.target.value);
          setOpen(true);
        },
        onFocus: () => setOpen(true),
        placeholder: "Buscar pedido, cliente, produto...",
        className: "w-full h-9 pl-9 pr-3 rounded-full bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      }
    ),
    open && q.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 left-0 mt-2 bg-card border border-border rounded-2xl shadow-soft overflow-hidden max-h-96 overflow-y-auto z-50", children: total === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 text-sm text-muted-foreground text-center", children: [
      'Nada encontrado para "',
      q,
      '"'
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      results.orders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pt-2 pb-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wide", children: "Pedidos" }),
        results.orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setOpen(false);
              setQ("");
              navigate({ to: "/admin/pedidos", search: { q: o.id } });
            },
            className: "w-full text-left px-3 py-2 hover:bg-muted text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
                "#",
                o.id
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                o.customerName,
                " · ",
                o.customerPhone
              ] })
            ]
          },
          o.id
        ))
      ] }),
      results.customers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pt-2 pb-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wide", children: "Clientes" }),
        results.customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setOpen(false);
              setQ("");
              navigate({ to: "/admin/clientes" });
            },
            className: "w-full text-left px-3 py-2 hover:bg-muted text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                c.email,
                " · ",
                c.phone
              ] })
            ]
          },
          c.id
        ))
      ] }),
      results.products.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pt-2 pb-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wide", children: "Produtos" }),
        results.products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setOpen(false);
              setQ("");
              navigate({ to: "/admin/produtos" });
            },
            className: "w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2",
            children: [
              p.image && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: p.image,
                  alt: "",
                  className: "w-8 h-8 rounded-lg object-cover"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: p.name }) })
            ]
          },
          p.id
        ))
      ] })
    ] }) })
  ] });
}
export {
  AdminLayout as A,
  BellRing as B,
  ConfirmDialog as C,
  FileText as F,
  Send as S,
  TriangleAlert as T,
  Users as U,
  Smartphone as a,
  Activity as b
};
