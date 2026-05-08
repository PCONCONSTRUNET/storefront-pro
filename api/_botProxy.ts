export type VercelRequest = {
  method?: string;
  headers: { origin?: string };
  body?: unknown;
};

export type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  end: () => void;
};

export const BOT_BASE = "http://178.105.54.230:3005";
export const BOT_TOKEN = "princesa_secret_123";

const ALLOWED_CORS_ORIGINS = new Set([
  "https://princesadelacos.com.br",
  "https://www.princesadelacos.com.br",
  "https://xn--princesadelaos-rjb.com.br",
  "https://www.xn--princesadelaos-rjb.com.br",
  "https://amostrasistema.lovable.app",
]);

export function setBotHeaders(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  const origin = req.headers.origin;
  if (origin && ALLOWED_CORS_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Vary", "Origin");
  }
}

export function handleOptions(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "OPTIONS") return false;
  setBotHeaders(req, res);
  res.status(204).end();
  return true;
}

export function parseProxyJson(text: string, fallback: unknown) {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}