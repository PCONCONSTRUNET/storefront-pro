import { createFileRoute } from "@tanstack/react-router";
import { BOT_BASE, botJsonResponse, botOptionsResponse, parseProxyJson } from "@/lib/botProxy";

export const Route = createFileRoute("/api/bot/status")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => botOptionsResponse(request),
      GET: async ({ request }) => {
        try {
          const r = await fetch(`${BOT_BASE}/api/status`, {
            method: "GET",
            headers: { Accept: "application/json" },
          });
          const text = await r.text();
          return botJsonResponse(request, parseProxyJson(text, { status: "UNKNOWN", error: text || `Status ${r.status}` }), r.status);
        } catch (e) {
          return botJsonResponse(request, { status: "UNKNOWN", error: e instanceof Error ? e.message : String(e) }, 502);
        }
      },
    },
  },
});
