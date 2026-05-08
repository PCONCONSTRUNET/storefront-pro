import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BOT_BASE, handleOptions, parseProxyJson, setBotHeaders } from "../_botProxy";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setBotHeaders(req, res);

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
    res.status(r.status).json(parseProxyJson(text, { status: "UNKNOWN", error: text || `Status ${r.status}` }));
  } catch (e) {
    res.status(502).json({ status: "UNKNOWN", error: e instanceof Error ? e.message : String(e) });
  }
}