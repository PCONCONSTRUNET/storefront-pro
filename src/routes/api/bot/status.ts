import { createFileRoute } from "@tanstack/react-router";

const BOT_BASE = "http://178.105.54.230:3005";

export const Route = createFileRoute("/api/bot/status")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const r = await fetch(`${BOT_BASE}/api/status`, {
            method: "GET",
            headers: { Accept: "application/json" },
          });
          const text = await r.text();
          return new Response(text, {
            status: r.status,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ status: "UNKNOWN", error: e instanceof Error ? e.message : String(e) }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
