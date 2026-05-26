// Middleware de auth admin via cookie httpOnly.
// Substitui o esquema antigo (token em localStorage) por:
//   - cookie "princesa_admin_session" httpOnly + Secure + SameSite=Strict
//   - validação no servidor a cada chamada via get_admin_session_record
import { createMiddleware } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  ADMIN_COOKIE,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  getAdminSessionCookie,
} from "./adminAuth.server";

const ROTATE_AFTER_MS = 30 * 60 * 1000; // rotaciona token a cada 30 min

function newAdminToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

  let activeToken = token;
  // Rotação: troca o token periodicamente para limitar a janela de uso caso vaze
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
    // Sliding session: estende +24h a cada uso
    (supabaseAdmin as any)
      .rpc("refresh_admin_session", { _token: token })
      .then(() => {})
      .catch(() => {});
  }
  setAdminSessionCookie(activeToken);
  return next({
    context: { adminToken: activeToken, adminEmail: data.email as string },
  });
});

export { ADMIN_COOKIE };
