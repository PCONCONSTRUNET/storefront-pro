import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { u as useStore, W as normalizeOrderStatus, v as brl, a9 as usePushNotifications, a5 as Bell, i as Crown, j as Sparkles, P as Package, t as toast } from "./router-CbsSSRKz.js";
import { U as Users, A as AdminLayout, b as Activity } from "./AdminLayout-IA_uuXcZ.js";
import { D as DollarSign } from "./dollar-sign-Dr-4p57q.js";
import { S as ShoppingCart } from "./shopping-cart-BRFmSKRc.js";
import { T as TrendingUp } from "./trending-up-D6tJUjsr.js";
import { T as TrendingDown } from "./trending-down-CnT_7V0L.js";
import { R as ResponsiveContainer, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip } from "./generateCategoricalChart-Bzk7-bPo.js";
import { A as AreaChart, a as Area } from "./AreaChart-BilQMIKj.js";
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
import "./settings-DhwBCChM.js";
import "./log-out-CpDN9yeE.js";
function Page() {
  const {
    orders,
    customers,
    products,
    sync
  } = useStore();
  reactExports.useEffect(() => {
    sync();
  }, [sync]);
  const stats = reactExports.useMemo(() => {
    const today = /* @__PURE__ */ new Date();
    const todayStr = today.toDateString();
    const yest = /* @__PURE__ */ new Date();
    yest.setDate(today.getDate() - 1);
    const yestStr = yest.toDateString();
    const valid = orders.filter((o) => !["cancelado", "reembolsado"].includes(normalizeOrderStatus(o.status)));
    const ordersToday = orders.filter((o) => new Date(o.createdAt).toDateString() === todayStr);
    const ordersYest = orders.filter((o) => new Date(o.createdAt).toDateString() === yestStr);
    const revToday = ordersToday.reduce((a, o) => a + o.total, 0);
    const revYest = ordersYest.reduce((a, o) => a + o.total, 0);
    const monthRev = valid.reduce((a, o) => a + o.total, 0);
    const ticket = orders.length ? monthRev / orders.length : 0;
    const deltaPct = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round((curr - prev) / prev * 100);
    };
    return {
      ordersToday: ordersToday.length,
      ordersDelta: ordersToday.length - ordersYest.length,
      monthRev,
      revDelta: deltaPct(revToday, revYest),
      ticket,
      customers: customers.length
    };
  }, [orders, customers]);
  const chartData = reactExports.useMemo(() => {
    const days = Array.from({
      length: 7
    }).map((_, i) => {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString("pt-BR", {
        weekday: "short"
      });
      const total = orders.filter((o) => new Date(o.createdAt).toDateString() === d.toDateString()).reduce((a, o) => a + o.total, 0);
      return {
        day: label.replace(".", ""),
        total: Number(total.toFixed(2))
      };
    });
    return days;
  }, [orders]);
  const weekTotal = reactExports.useMemo(() => chartData.reduce((a, d) => a + d.total, 0), [chartData]);
  const peakDay = reactExports.useMemo(() => chartData.reduce((max, d) => d.total > max.total ? d : max, chartData[0] || {
    day: "-",
    total: 0
  }), [chartData]);
  const topProducts = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    orders.forEach((o) => o.items.forEach((it) => map.set(it.name, (map.get(it.name) || 0) + it.quantity)));
    return Array.from(map.entries()).map(([name, qty]) => ({
      name,
      qty
    })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);
  const topQty = topProducts[0]?.qty ?? 0;
  const barColors = ["var(--primary)", "var(--gold)", "var(--accent)", "#a855f7", "#0ea5e9"];
  const cards = [{
    label: "Faturamento total",
    value: brl(stats.monthRev),
    icon: DollarSign,
    tint: "from-emerald-500/20 to-emerald-500/0",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    delta: stats.revDelta,
    deltaLabel: "vs ontem",
    isPct: true
  }, {
    label: "Pedidos hoje",
    value: String(stats.ordersToday),
    icon: ShoppingCart,
    tint: "from-primary/20 to-primary/0",
    iconBg: "bg-primary/15 text-primary",
    delta: stats.ordersDelta,
    deltaLabel: "vs ontem",
    isPct: false
  }, {
    label: "Ticket médio",
    value: brl(stats.ticket),
    icon: TrendingUp,
    tint: "from-amber-500/20 to-amber-500/0",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    delta: null,
    deltaLabel: "média geral",
    isPct: false
  }, {
    label: "Clientes",
    value: String(stats.customers),
    icon: Users,
    tint: "from-fuchsia-500/20 to-fuchsia-500/0",
    iconBg: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
    delta: null,
    deltaLabel: "cadastrados",
    isPct: false
  }];
  const {
    playerId: osId,
    subscribed: osActive,
    loading: syncing,
    enable: forceSync
  } = usePushNotifications({
    role: "admin"
  });
  const nukeServiceWorker = async () => {
    const {
      confirmDialog
    } = await import("./AdminLayout-IA_uuXcZ.js").then((n) => n.C);
    if (!await confirmDialog({
      title: "Resetar notificações?",
      description: "Isso vai limpar todas as configurações de notificação e recarregar a página.",
      confirmLabel: "Continuar"
    })) return;
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      localStorage.removeItem("push_prompt_accepted");
      localStorage.removeItem("push_prompt_dismissed_at");
      const dbs = await window.indexedDB.databases();
      dbs.forEach((db) => {
        if (db.name?.includes("OneSignal")) {
          window.indexedDB.deleteDatabase(db.name);
        }
      });
      window.alert("Sistema limpo! A página vai recarregar. Ative as notificações novamente ao voltar.");
      window.location.reload();
    } catch (err) {
      console.error("Erro ao limpar:", err);
      window.location.reload();
    }
  };
  const testNotification = async () => {
    try {
      const {
        supabase
      } = await import("./adminHelpers.server-BhLg7GIA.js").then((n) => n.c);
      if (!osId) {
        toast.error("Dispositivo não registrado ainda.");
        return;
      }
      const {
        error
      } = await supabase.functions.invoke("send-push", {
        body: {
          title: "Teste Admin Push 🚀",
          message: `Recebido! ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`,
          subscriptionIds: [osId],
          externalUserIds: ["admin-user"]
        }
      });
      if (error) throw error;
      toast.success(`Push enviado para o ID: ${osId.slice(0, 8)}...`);
    } catch (err) {
      console.error("[push-test]", err);
      toast.error(`Erro: ${err.message}`);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Dashboard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl border-2 border-indigo-500/20 shadow-lg relative z-[999] pointer-events-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-widest flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-3 w-3" }),
          " Status do Push"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${osActive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`, children: osActive ? "CONECTADO" : "DESCONECTADO" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/50 dark:bg-black/20 p-2 rounded-xl mb-4 font-mono text-[10px] break-all border border-black/5 dark:border-white/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50 block mb-0.5 uppercase text-[8px]", children: "Subscription ID" }),
        osId
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
          e.stopPropagation();
          nukeServiceWorker();
        }, className: "h-11 bg-destructive/10 text-destructive rounded-xl font-bold text-[10px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 border border-destructive/20", children: "Limpar Tudo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
          e.stopPropagation();
          window.alert("Sincronizando... aguarde o aviso de sucesso.");
          forceSync();
        }, disabled: syncing, className: "h-11 bg-white dark:bg-white/10 text-foreground rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 border border-border", children: syncing ? "..." : "Sincronizar" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: (e) => {
        e.stopPropagation();
        testNotification();
      }, className: "w-full h-11 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
        " Testar Push"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4", children: cards.map((c) => {
      const positive = c.delta != null && c.delta >= 0;
      const DeltaIcon = positive ? TrendingUp : TrendingDown;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative overflow-hidden bg-card rounded-2xl p-4 shadow-card border border-border/40 hover:shadow-lg transition-all group`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${c.tint} blur-2xl opacity-70 group-hover:opacity-100 transition-opacity` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-10 w-10 rounded-xl flex items-center justify-center ${c.iconBg}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: "h-5 w-5" }) }),
            c.delta != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full ${positive ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-destructive/15 text-destructive"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DeltaIcon, { className: "h-3 w-3" }),
              c.isPct ? `${positive ? "+" : ""}${c.delta}%` : `${positive ? "+" : ""}${c.delta}`
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl md:text-2xl font-black mt-3 tracking-tight", children: c.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground font-medium", children: c.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground/70", children: c.deltaLabel })
          ] })
        ] })
      ] }, c.label);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden bg-card rounded-2xl p-5 shadow-card border border-border/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-base", children: "Faturamento — 7 dias" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black tracking-tight", children: brl(weekTotal) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "total da semana" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-bold", children: "Pico" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-primary mt-0.5", children: peakDay?.day }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: brl(peakDay?.total || 0) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52 mt-3 -mx-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: chartData, margin: {
            top: 10,
            right: 8,
            left: 0,
            bottom: 0
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "revGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "var(--primary)", stopOpacity: 0.4 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "var(--primary)", stopOpacity: 0 })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day", stroke: "var(--muted-foreground)", fontSize: 10, tickLine: false, axisLine: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 10, tickLine: false, axisLine: false, width: 32 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { cursor: {
              stroke: "var(--primary)",
              strokeWidth: 1,
              strokeDasharray: "3 3"
            }, contentStyle: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,.08)"
            }, formatter: (v) => [brl(v), "Faturamento"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "total", stroke: "var(--primary)", strokeWidth: 2.5, fill: "url(#revGradient)", dot: {
              fill: "var(--primary)",
              r: 3,
              strokeWidth: 2,
              stroke: "var(--card)"
            }, activeDot: {
              r: 5,
              strokeWidth: 2,
              stroke: "var(--card)"
            } })
          ] }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden bg-card rounded-2xl p-5 shadow-card border border-border/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-gold/10 to-transparent rounded-full blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-base", children: "Mais vendidos" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Top 5 produtos" })
              ] })
            ] }),
            topProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
              topProducts.reduce((a, p) => a + p.qty, 0),
              " un."
            ] })
          ] }),
          topProducts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "Sem vendas ainda" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground/70", children: "Os campeões vão aparecer aqui" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5 mt-1", children: topProducts.map((p, i) => {
            const pct = topQty ? p.qty / topQty * 100 : 0;
            const color = barColors[i] || "var(--primary)";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group/row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0", style: {
                    background: color
                  }, children: i + 1 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold truncate", children: p.name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold tabular-nums ml-2 shrink-0", children: p.qty })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all duration-700 ease-out", style: {
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 60%, white))`
              } }) })
            ] }, p.name);
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 bg-card rounded-2xl p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
        " Estoque crítico"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "divide-y divide-border", children: [
        products.filter((p) => p.stock <= (p.minStock ?? 5)).slice(0, 8).map((p) => {
          const min = p.minStock ?? 5;
          const out = p.stock <= 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.image, alt: "", className: "w-10 h-10 rounded-lg object-cover bg-muted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm truncate", children: p.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                "Mínimo: ",
                min,
                " un."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-bold px-2 py-0.5 rounded-full ${out ? "bg-destructive/15 text-destructive" : "bg-gold/15 text-gold"}`, children: out ? "Esgotado" : `${p.stock} un.` })
          ] }, p.id);
        }),
        products.filter((p) => p.stock <= (p.minStock ?? 5)).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-muted-foreground py-4", children: "Tudo ok!" })
      ] })
    ] })
  ] });
}
export {
  Page as component
};
