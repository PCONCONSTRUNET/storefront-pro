export const BOT_BASE = "http://178.105.54.230:3005";
export const BOT_TOKEN = "princesa_secret_123";

const ALLOWED_CORS_ORIGINS = new Set([
  "https://princesadelacos.com.br",
  "https://www.princesadelacos.com.br",
  "https://xn--princesadelaos-rjb.com.br",
  "https://www.xn--princesadelaos-rjb.com.br",
]);

function isAllowedOrigin(origin: string) {
  return (
    ALLOWED_CORS_ORIGINS.has(origin) ||
    origin.endsWith(".lovable.app") ||
    origin.endsWith(".lovableproject.com")
  );
}

export function botJsonHeaders(request: Request) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  const origin = request.headers.get("origin");
  if (origin && isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Vary", "Origin");
  }

  return headers;
}

export function botOptionsResponse(request: Request) {
  return new Response(null, { status: 204, headers: botJsonHeaders(request) });
}

export function botJsonResponse(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: botJsonHeaders(request),
  });
}

export function parseProxyJson(text: string, fallback: unknown) {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}
