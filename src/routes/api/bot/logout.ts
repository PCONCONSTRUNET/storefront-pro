import { createFileRoute } from "@tanstack/react-router";
import {
  BOT_BASE,
  BOT_TOKEN,
  botJsonResponse,
  botOptionsResponse,
  parseProxyJson,
} from "@/lib/botProxy";

export const Route = createFileRoute("/api/bot/logout")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => botOptionsResponse(request),
      POST: async ({ request }) => {
        try {
          const r = await fetch(`${BOT_BASE}/api/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: BOT_TOKEN }),
          });
          const text = await r.text();
          return botJsonResponse(request, parseProxyJson(text, { ok: r.ok, body: text }), r.status);
        } catch (e) {
          return botJsonResponse(
            request,
            { ok: false, error: e instanceof Error ? e.message : String(e) },
            502,
          );
        }
      },
    },
  },
});
