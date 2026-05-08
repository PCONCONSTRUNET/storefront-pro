// Cliente da API do bot WhatsApp "Princesa de Laços"
// VPS: 167.250.155.178:3005

export const WHATSAPP_BOT_BASE_URL = "http://167.250.155.178:3005";
export const WHATSAPP_BOT_TOKEN = "princesa_secret_123";

export type BotStatus = "QR_READY" | "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "UNKNOWN";

export type BotStatusResponse = {
  status: BotStatus;
  qrcode?: string; // base64 (data:image/png;base64,... ou apenas base64)
  message?: string;
};

export async function fetchBotStatus(signal?: AbortSignal): Promise<BotStatusResponse> {
  const res = await fetch(`${WHATSAPP_BOT_BASE_URL}/api/status`, {
    method: "GET",
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const data = await res.json();
  return {
    status: (data.status ?? "UNKNOWN") as BotStatus,
    qrcode: data.qrcode ?? data.qr ?? undefined,
    message: data.message,
  };
}

export async function logoutBot(): Promise<void> {
  const res = await fetch(`${WHATSAPP_BOT_BASE_URL}/api/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: WHATSAPP_BOT_TOKEN }),
  });
  if (!res.ok) throw new Error(`Logout falhou (${res.status})`);
}

export type SendNotificationPayload = {
  numero: string;
  mensagem: string;
};

export async function sendBotNotification(payload: SendNotificationPayload): Promise<{ ok: boolean; status: number; body?: string }> {
  const res = await fetch(`${WHATSAPP_BOT_BASE_URL}/webhook/notificacao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, token: WHATSAPP_BOT_TOKEN }),
  });
  let body: string | undefined;
  try { body = await res.text(); } catch {}
  return { ok: res.ok, status: res.status, body };
}

// Log simples em memória + localStorage
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
