const BOT_BASE = "http://178.105.54.230:3005";
const BOT_TOKEN = "princesa_secret_123";

type VercelRequest = { method?: string; headers: { origin?: string }; body?: unknown };
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Método não permitido" });
    return;
  }

  let payload: any = {};
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body ?? {});
  } catch {
    res.status(400).json({ ok: false, error: "JSON inválido" });
    return;
  }
  const numero = String(payload.numero ?? "").replace(/\D/g, "");
  const mensagem = String(payload.mensagem ?? "").trim();

  if (numero.length < 10 || !mensagem) {
    res.status(400).json({ ok: false, error: "Parâmetros inválidos (numero/mensagem)" });
    return;
  }

  try {
    const r = await fetch(`${BOT_BASE}/webhook/notificacao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero, mensagem, token: BOT_TOKEN }),
    });
    const text = await r.text();
    res.status(200).json({ ok: r.ok, status: r.status, body: text });
  } catch (e) {
    res
      .status(502)
      .json({ ok: false, status: 0, error: e instanceof Error ? e.message : String(e) });
  }
}
