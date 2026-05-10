const BOT_BASE = "http://178.105.54.230:3005";

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
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin",
  );
  res.setHeader("Vary", "Origin");
}

function parseJson(text: string, fallback: unknown) {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ status: "UNKNOWN", error: "Método não permitido" });
    return;
  }

  try {
    const r = await fetch(`${BOT_BASE}/api/status`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const text = await r.text();
    res
      .status(r.status)
      .json(parseJson(text, { status: "UNKNOWN", error: text || `Status ${r.status}` }));
  } catch (e) {
    res.status(502).json({ status: "UNKNOWN", error: e instanceof Error ? e.message : String(e) });
  }
}
