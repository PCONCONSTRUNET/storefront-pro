import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BOT_BASE, BOT_TOKEN, handleOptions, parseProxyJson, setBotHeaders } from "../_botProxy";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setBotHeaders(req, res);

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
    res.status(r.status).json(parseProxyJson(text, { ok: r.ok, body: text }));
  } catch (e) {
    res.status(502).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}