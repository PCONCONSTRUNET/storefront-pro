import { createFileRoute } from "@tanstack/react-router";
import { BOT_BASE, BOT_TOKEN, botJsonResponse, botOptionsResponse } from "@/lib/botProxy";

export const Route = createFileRoute("/api/bot/notify")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => botOptionsResponse(request),
      POST: async ({ request }) => {
        let payload: { numero?: string; mensagem?: string };
        try {
          payload = await request.json();
        } catch {
          return botJsonResponse(request, { ok: false, error: "JSON inválido" }, 400);
        }

        const numero = (payload.numero ?? "").toString().replace(/\D/g, "");
        const mensagem = (payload.mensagem ?? "").toString().trim();

        if (numero.length < 10 || !mensagem) {
          return botJsonResponse(request, { ok: false, error: "Parâmetros inválidos (numero/mensagem)" }, 400);
        }

        try {
          const r = await fetch(`${BOT_BASE}/webhook/notificacao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numero, mensagem, token: BOT_TOKEN }),
          });
          const text = await r.text();
          return botJsonResponse(request, { ok: r.ok, status: r.status, body: text });
        } catch (e) {
          return botJsonResponse(request, { ok: false, status: 0, error: e instanceof Error ? e.message : String(e) }, 502);
        }
      },
    },
  },
});
