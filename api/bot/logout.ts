const BOT_BASE = "http://178.105.54.230:3005";
const BOT_TOKEN = "princesa_secret_123";

type VercelRequest = { method?: string; headers: { origin?: string } };
type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  end: () => void;
};

function setHeaders(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  if (req.headers.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
    res.setHeader("Vary", "Origin");
  }
}

function parseJson(text: string, fallback: unknown) {
  try { return text ? JSON.parse(text) : fallback; } catch { return fallback; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setHeaders(req, res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Método não permitido" });
    return;
  }

  try {
    const r = await fetch(`${BOT_BASE}/api/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: BOT_TOKEN }),
    });
    const text = await r.text();
    res.status(r.status).json(parseJson(text, { ok: r.ok, body: text }));
  } catch (e) {
    res.status(502).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}