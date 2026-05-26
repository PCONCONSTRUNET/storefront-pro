// Middleware de auth admin via cookie httpOnly.
// Substitui o esquema antigo (token em localStorage) por:
//   - cookie "princesa_admin_session" httpOnly + Secure + SameSite=Strict
//   - validação no servidor a cada chamada via get_admin_session_record
import { createMiddleware } from "@tanstack/react-start";
import {
  getCookie,
  setCookie,
  deleteCookie,
} from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const ADMIN_COOKIE = "princesa_admin_session";

const ONE_DAY_SECONDS = 60 * 60 * 24;

export function setAdminSessionCookie(token: string) {
  setCookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: ONE_DAY_SECONDS,
  });
}

export function clearAdminSessionCookie() {
  deleteCookie(ADMIN_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
}

export const requireAdminAuth = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const token = getCookie(ADMIN_COOKIE);
  if (!token) {
    throw new Response("Unauthorized: sessão admin ausente", { status: 401 });
  }
  const { data, error } = await (supabaseAdmin as any)
    .rpc("get_admin_session_record", { _token: token })
    .maybeSingle();
  if (error || !data) {
    clearAdminSessionCookie();
    throw new Response("Unauthorized: sessão admin inválida", { status: 401 });
  }
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await (supabaseAdmin as any)
      .rpc("delete_admin_session", { _token: token })
      .then(() => {})
      .catch(() => {});
    clearAdminSessionCookie();
    throw new Response("Unauthorized: sessão admin expirada", { status: 401 });
  }
  // Sliding session: estende +24h a cada uso e renova o cookie no browser
  (supabaseAdmin as any)
    .rpc("refresh_admin_session", { _token: token })
    .then(() => {})
    .catch(() => {});
  setAdminSessionCookie(token);
  return next({
    context: { adminToken: token, adminEmail: data.email as string },
  });
});
