import { createFileRoute } from "@tanstack/react-router";

const BOT_BASE = "http://167.250.155.178:3005";
const TOKEN = "princesa_secret_123";

export const Route = createFileRoute("/api/bot/notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: { numero?: string; mensagem?: string };
        try {
          payload = await request.json();
        } catch {
          return new Response(
            JSON.stringify({ ok: false, error: "JSON inválido" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const numero = (payload.numero ?? "").toString().replace(/\D/g, "");
        const mensagem = (payload.mensagem ?? "").toString().trim();

        if (numero.length < 10 || !mensagem) {
          return new Response(
            JSON.stringify({ ok: false, error: "Parâmetros inválidos (numero/mensagem)" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          const r = await fetch(`${BOT_BASE}/webhook/notificacao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numero, mensagem, token: TOKEN }),
          });
          const text = await r.text();
          return new Response(
            JSON.stringify({ ok: r.ok, status: r.status, body: text }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (e) {
          return new Response(
            JSON.stringify({ ok: false, status: 0, error: e instanceof Error ? e.message : String(e) }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
