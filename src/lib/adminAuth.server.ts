// Funções server-only para cookies de sessão admin.
// Separado do middleware para evitar import protection no client bundle.
import {
  getCookie,
  setCookie,
  deleteCookie,
} from "@tanstack/react-start/server";

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
