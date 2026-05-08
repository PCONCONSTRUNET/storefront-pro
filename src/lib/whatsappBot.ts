// Cliente do bot WhatsApp "Princesa de Laços"
// Chama proxy server-side (/api/bot/*) para evitar Mixed Content (HTTPS->HTTP).

export const WHATSAPP_BOT_BASE_URL = "http://178.105.54.230:3005"; // exibido na UI (VPS Princesa de Laços)

function getBotProxyPath(path: string) {
  if (typeof window === "undefined") return path;
  const isLovableHost =
    window.location.hostname.endsWith(".lovable.app") ||
    window.location.hostname.endsWith(".lovableproject.com");

  return isLovableHost ? path.replace("/api/bot/", "/api/lovable-bot/") : path;
}

export type BotStatus = "QR_READY" | "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "UNKNOWN";

export type BotStatusResponse = {
  status: BotStatus;
  qrcode?: string;
  message?: string;
};

export async function fetchBotStatus(signal?: AbortSignal): Promise<BotStatusResponse> {
  const res = await fetch(getBotProxyPath(`/api/bot/status`), { method: "GET", signal });
  if (!res.ok && res.status !== 502) throw new Error(`Status ${res.status}`);
  const data = await res.json();
  if (data.error && !data.status) throw new Error(data.error);
  return {
    status: (data.status ?? "UNKNOWN") as BotStatus,
    qrcode: data.qrcode ?? data.qr ?? undefined,
    message: data.message,
  };
}

export async function logoutBot(): Promise<void> {
  const res = await fetch(getBotProxyPath(`/api/bot/logout`), { method: "POST" });
  if (!res.ok) {
    let msg = `Logout falhou (${res.status})`;
    try { const j = await res.json(); if (j.error) msg = j.error; } catch {}
    throw new Error(msg);
  }
}

export type SendNotificationPayload = { numero: string; mensagem: string };

export async function sendBotNotification(payload: SendNotificationPayload): Promise<{ ok: boolean; status: number; body?: string }> {
  const res = await fetch(getBotProxyPath(`/api/bot/notify`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  try {
    const j = await res.json();
    return { ok: !!j.ok, status: j.status ?? res.status, body: j.body ?? j.error };
  } catch {
    return { ok: false, status: res.status };
  }
}

// Histórico em memória + localStorage
export type BotNotificationLog = {
  id: string;
  numero: string;
  mensagem: string;
  ok: boolean;
  status: number;
  error?: string;
  at: number;
};

const LOG_KEY = "whatsapp_bot_logs";
const MAX_LOGS = 50;

export function getBotLogs(): BotNotificationLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as BotNotificationLog[]) : [];
  } catch { return []; }
}

export function pushBotLog(entry: Omit<BotNotificationLog, "id" | "at">) {
  if (typeof window === "undefined") return;
  const logs = getBotLogs();
  logs.unshift({ ...entry, id: crypto.randomUUID(), at: Date.now() });
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  window.dispatchEvent(new Event("whatsapp-bot-logs-updated"));
}

export function clearBotLogs() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOG_KEY);
  window.dispatchEvent(new Event("whatsapp-bot-logs-updated"));
}

export async function notifyWhatsApp(numero: string, mensagem: string) {
  try {
    const r = await sendBotNotification({ numero, mensagem });
    pushBotLog({ numero, mensagem, ok: r.ok, status: r.status, error: r.ok ? undefined : r.body });
    return r;
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    pushBotLog({ numero, mensagem, ok: false, status: 0, error: err });
    throw e;
  }
}
