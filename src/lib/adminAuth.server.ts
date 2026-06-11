// Server-only: cookie helpers + admin session validation.
// All TanStack server imports stay isolated here. This file ends in
// `.server.ts` AND is only referenced from inside `createServerFn().handler()`
// bodies — never at module top-level — so the server-fn code-splitter
// strips it from the client bundle.
import {
  setCookie,
  deleteCookie,
  getCookie,
} from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const ADMIN_COOKIE = "princesa_admin_session";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30; // 30 dias — renovado a cada request via rotate/refresh
const ROTATE_AFTER_MS = 30 * 60 * 1000;

export function setAdminSessionCookie(token: string) {
  setCookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });
}

export function clearAdminSessionCookie() {
  deleteCookie(ADMIN_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
}

export function getAdminSessionCookie(): string | undefined {
  return getCookie(ADMIN_COOKIE);
}

function newAdminToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Validates the admin session cookie and returns { adminToken, adminEmail }.
 * Throws Error("Unauthorized: ...") on missing/invalid/expired sessions.
 * Call at the start of every admin-protected server fn handler.
 */
export async function requireAdminAuth(): Promise<{
  adminToken: string;
  adminEmail: string;
}> {
  const token = getAdminSessionCookie();
  if (!token) {
    throw new Error("Unauthorized: sessão admin ausente (cookie não enviado)");
  }
  const { data, error } = await (supabaseAdmin as any)
    .rpc("get_admin_session_record", { _token: token })
    .maybeSingle();
  if (error || !data) {
    clearAdminSessionCookie();
    throw new Error(
      `Unauthorized: sessão admin inválida${error ? ` (${error.message})` : ""}`,
    );
  }
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await (supabaseAdmin as any)
      .rpc("delete_admin_session", { _token: token })
      .then(() => {})
      .catch(() => {});
    clearAdminSessionCookie();
    throw new Error("Unauthorized: sessão admin expirada");
  }

  let activeToken = token;
  const lastRotated = (data as any).last_rotated_at
    ? new Date((data as any).last_rotated_at).getTime()
    : 0;
  if (Date.now() - lastRotated > ROTATE_AFTER_MS) {
    const newTok = newAdminToken();
    const { data: rotated } = await (supabaseAdmin as any)
      .rpc("rotate_admin_session", { _old_token: token, _new_token: newTok })
      .maybeSingle();
    if (rotated) activeToken = newTok;
  } else {
    (supabaseAdmin as any)
      .rpc("refresh_admin_session", { _token: token })
      .then(() => {})
      .catch(() => {});
  }
  setAdminSessionCookie(activeToken);
  return { adminToken: activeToken, adminEmail: data.email as string };
}
