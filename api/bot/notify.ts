import { BOT_BASE, BOT_TOKEN, handleOptions, setBotHeaders, type VercelRequest, type VercelResponse } from "../_botProxy";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setBotHeaders(req, res);

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Método não permitido" });
    return;
  }

  const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
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
    res.status(502).json({ ok: false, status: 0, error: e instanceof Error ? e.message : String(e) });
  }
}