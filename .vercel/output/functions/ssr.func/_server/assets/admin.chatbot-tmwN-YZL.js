import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { A as AdminLayout, S as Send } from "./AdminLayout-IA_uuXcZ.js";
import { M as MessageCircle, F as CircleAlert, C as CircleCheck, L as LoaderCircle, Q as QrCode, z as Trash2, t as toast } from "./router-CbsSSRKz.js";
import { R as RefreshCw } from "./refresh-cw-quCvE8C7.js";
import { L as LogOut } from "./log-out-CpDN9yeE.js";
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
const WHATSAPP_BOT_BASE_URL = "http://178.105.54.230:3005";
function getBotProxyPath(path) {
  if (typeof window === "undefined") return path;
  const isLovableHost = window.location.hostname.endsWith(".lovable.app") || window.location.hostname.endsWith(".lovableproject.com");
  return isLovableHost ? path.replace("/api/bot/", "/api/lovable-bot/") : path;
}
async function fetchBotStatus(signal) {
  const res = await fetch(getBotProxyPath(`/api/bot/status`), {
    method: "GET",
    signal
  });
  if (!res.ok && res.status !== 502) throw new Error(`Status ${res.status}`);
  const data = await res.json();
  if (data.error && !data.status) throw new Error(data.error);
  return {
    status: data.status ?? "UNKNOWN",
    qrcode: data.qrcode ?? data.qr ?? void 0,
    message: data.message
  };
}
async function logoutBot() {
  const res = await fetch(getBotProxyPath(`/api/bot/logout`), {
    method: "POST"
  });
  if (!res.ok) {
    let msg = `Logout falhou (${res.status})`;
    try {
      const j = await res.json();
      if (j.error) msg = j.error;
    } catch {
    }
    throw new Error(msg);
  }
}
async function sendBotNotification(payload) {
  const res = await fetch(getBotProxyPath(`/api/bot/notify`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  try {
    const j = await res.json();
    const rawBody = j.body ?? j.error;
    let ok = !!j.ok;
    let body = rawBody;
    if (ok && typeof rawBody === "string") {
      try {
        const inner = JSON.parse(rawBody);
        if (inner && typeof inner === "object" && typeof inner.aviso === "string") {
          ok = false;
          body = `Bot ignorou: ${inner.aviso}`;
        }
      } catch {
      }
    }
    return { ok, status: j.status ?? res.status, body };
  } catch {
    return { ok: false, status: res.status };
  }
}
const LOG_KEY = "whatsapp_bot_logs";
const MAX_LOGS = 50;
function getBotLogs() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function pushBotLog(entry) {
  if (typeof window === "undefined") return;
  const logs = getBotLogs();
  logs.unshift({ ...entry, id: crypto.randomUUID(), at: Date.now() });
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  window.dispatchEvent(new Event("whatsapp-bot-logs-updated"));
}
function clearBotLogs() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOG_KEY);
  window.dispatchEvent(new Event("whatsapp-bot-logs-updated"));
}
async function notifyWhatsApp(numero, mensagem) {
  try {
    const r = await sendBotNotification({ numero, mensagem });
    pushBotLog({
      numero,
      mensagem,
      ok: r.ok,
      status: r.status,
      error: r.ok ? void 0 : r.body
    });
    return r;
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    pushBotLog({ numero, mensagem, ok: false, status: 0, error: err });
    throw e;
  }
}
function Page() {
  const [status, setStatus] = reactExports.useState("UNKNOWN");
  const [qrcode, setQrcode] = reactExports.useState();
  const [error, setError] = reactExports.useState(null);
  const [loadingLogout, setLoadingLogout] = reactExports.useState(false);
  const [lastUpdate, setLastUpdate] = reactExports.useState(null);
  const [logs, setLogs] = reactExports.useState(() => getBotLogs());
  const [testNumber, setTestNumber] = reactExports.useState("");
  const [testMessage, setTestMessage] = reactExports.useState("Olá! Mensagem de validação da Princesa de Laços 💖");
  const [sending, setSending] = reactExports.useState(false);
  const abortRef = reactExports.useRef(null);
  const poll = async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const r = await fetchBotStatus(ac.signal);
      setStatus(r.status);
      setQrcode(r.qrcode);
      setError(null);
      setLastUpdate(Date.now());
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Falha ao consultar o bot");
      setStatus("UNKNOWN");
    }
  };
  reactExports.useEffect(() => {
    poll();
    const id = setInterval(poll, 5e3);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, []);
  reactExports.useEffect(() => {
    const onUpd = () => setLogs(getBotLogs());
    window.addEventListener("whatsapp-bot-logs-updated", onUpd);
    return () => window.removeEventListener("whatsapp-bot-logs-updated", onUpd);
  }, []);
  const handleLogout = async () => {
    const {
      confirmDialog
    } = await import("./AdminLayout-IA_uuXcZ.js").then((n) => n.C);
    if (!await confirmDialog({
      title: "Desconectar WhatsApp?",
      description: "A sessão será encerrada.",
      confirmLabel: "Desconectar"
    })) return;
    setLoadingLogout(true);
    try {
      await logoutBot();
      toast.success("Sessão encerrada. Reiniciando bot...");
      setTimeout(poll, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao desconectar");
    } finally {
      setLoadingLogout(false);
    }
  };
  const handleSendTest = async () => {
    const numero = testNumber.replace(/\D/g, "");
    if (numero.length < 10) {
      toast.error("Informe um número válido com DDD");
      return;
    }
    if (!testMessage.trim()) {
      toast.error("Mensagem vazia");
      return;
    }
    setSending(true);
    try {
      const r = await notifyWhatsApp(numero, testMessage.trim());
      if (r.ok) toast.success("Notificação enviada");
      else toast.error(`Falha (${r.status})`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar");
    } finally {
      setSending(false);
    }
  };
  const qrSrc = qrcode ? qrcode.startsWith("data:") ? qrcode : `data:image/png;base64,${qrcode}` : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLayout, { title: "Chatbot WhatsApp", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl bg-primary/10 grid place-items-center text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl", children: "Princesa de Laços · WhatsApp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
          "Endpoint: ",
          WHATSAPP_BOT_BASE_URL
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: poll, className: "h-9 px-3 rounded-full bg-muted hover:bg-muted/70 text-sm font-medium flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
        " Atualizar"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl border border-border p-5 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Conexão" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[280px] grid place-items-center bg-muted/30 rounded-xl p-4", children: error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-sm text-destructive flex flex-col items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-8 w-8" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Não foi possível conectar à API" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground max-w-xs", children: error })
        ] }) : status === "CONNECTED" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center flex flex-col items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-12 w-12 text-green-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-lg", children: "✅ WhatsApp Conectado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "O bot está pronto para enviar e receber mensagens." })
        ] }) : status === "QR_READY" && qrSrc ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: qrSrc, alt: "QR Code WhatsApp", className: "w-56 h-56 rounded-lg bg-white p-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground max-w-xs", children: "Abra o WhatsApp → Configurações → Aparelhos conectados → Conectar aparelho" })
        ] }) : status === "CONNECTING" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center flex flex-col items-center gap-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-10 w-10 animate-spin text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "⏳ Iniciando conexão..." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center flex flex-col items-center gap-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-10 w-10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: "Aguardando status do bot..." })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: lastUpdate ? `Atualizado às ${new Date(lastUpdate).toLocaleTimeString("pt-BR")}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleLogout, disabled: loadingLogout || status === "UNKNOWN", className: "h-9 px-3 rounded-full bg-destructive/10 text-destructive text-sm font-semibold flex items-center gap-2 hover:bg-destructive/20 disabled:opacity-50", children: [
            loadingLogout ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
            "Desconectar WhatsApp"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl border border-border p-5 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-4", children: "Enviar notificação de teste" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Número (com DDD)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: testNumber, onChange: (e) => setTestNumber(e.target.value), placeholder: "5511999999999", className: "mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Mensagem" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: testMessage, onChange: (e) => setTestMessage(e.target.value), rows: 5, className: "mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSendTest, disabled: sending || status !== "CONNECTED", className: "w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50", children: [
            sending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
            "Enviar"
          ] }),
          status !== "CONNECTED" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground text-center", children: "Conecte o WhatsApp para enviar mensagens." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl border border-border p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Histórico de envios" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          clearBotLogs();
          setLogs([]);
        }, className: "h-8 px-3 rounded-full bg-muted text-xs font-medium flex items-center gap-1 hover:bg-muted/70", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
          " Limpar"
        ] })
      ] }),
      logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-6", children: "Nenhuma notificação enviada ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: logs.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-3 flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-0.5 h-7 w-7 rounded-full grid place-items-center shrink-0 ${l.ok ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`, children: l.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: l.numero }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${l.ok ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`, children: l.ok ? `OK ${l.status}` : `ERRO ${l.status || "—"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground ml-auto", children: new Date(l.at).toLocaleString("pt-BR") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: l.mensagem }),
          l.error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-destructive mt-1 break-all", children: l.error })
        ] })
      ] }, l.id)) })
    ] })
  ] }) });
}
function StatusBadge({
  status
}) {
  const map = {
    CONNECTED: {
      label: "Conectado",
      cls: "bg-green-100 text-green-700"
    },
    QR_READY: {
      label: "Aguardando QR",
      cls: "bg-amber-100 text-amber-700"
    },
    CONNECTING: {
      label: "Conectando",
      cls: "bg-blue-100 text-blue-700"
    },
    DISCONNECTED: {
      label: "Desconectado",
      cls: "bg-muted text-muted-foreground"
    },
    UNKNOWN: {
      label: "Desconhecido",
      cls: "bg-muted text-muted-foreground"
    }
  };
  const m = map[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] px-2.5 py-1 rounded-full font-bold ${m.cls}`, children: m.label });
}
export {
  Page as component
};
