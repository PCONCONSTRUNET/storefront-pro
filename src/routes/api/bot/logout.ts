import { createFileRoute } from "@tanstack/react-router";

const BOT_BASE = "http://167.250.155.178:3005";
const TOKEN = "princesa_secret_123";

export const Route = createFileRoute("/api/bot/logout")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const r = await fetch(`${BOT_BASE}/api/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: TOKEN }),
          });
          const text = await r.text();
          return new Response(text || JSON.stringify({ ok: r.ok }), {
            status: r.status,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
