// Rate limiter compartilhado para edge functions.
// Usa a função SQL public.check_rate_limit (atomic upsert + count).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export interface RateLimitOptions {
  bucket: string;
  identifier: string;
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  retryAfterSeconds: number;
}

export async function checkRateLimit(
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  try {
    const { data, error } = await admin.rpc("check_rate_limit", {
      _bucket: opts.bucket,
      _identifier: opts.identifier,
      _max_requests: opts.maxRequests,
      _window_seconds: opts.windowSeconds,
    });
    if (error) {
      console.error("[rate-limit] rpc error:", error.message);
      // Fail-open para não derrubar produção se o RPC falhar.
      return { allowed: true, count: 0, retryAfterSeconds: 0 };
    }
    const row = Array.isArray(data) ? data[0] : data;
    return {
      allowed: row?.allowed ?? true,
      count: row?.current_count ?? 0,
      retryAfterSeconds: row?.retry_after_seconds ?? 0,
    };
  } catch (e) {
    console.error("[rate-limit] exception:", e);
    return { allowed: true, count: 0, retryAfterSeconds: 0 };
  }
}

export function rateLimitResponse(
  retryAfterSeconds: number,
  corsHeaders: Record<string, string>,
) {
  return new Response(
    JSON.stringify({
      error: "Muitas requisições. Tente novamente em instantes.",
      retry_after_seconds: retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}
