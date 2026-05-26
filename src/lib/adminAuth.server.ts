// Cookie helpers server-only. Import estático: o arquivo termina em
// `.server.ts`, então o Vite já o bloqueia no bundle client — o dynamic
// import com @vite-ignore quebrava em runtime no Cloudflare Worker (sem
// resolução dinâmica de módulos).
import {
  setCookie,
  deleteCookie,
  getCookie,
} from "@tanstack/react-start/server";

export const ADMIN_COOKIE = "princesa_admin_session";

const ONE_DAY_SECONDS = 60 * 60 * 24;

export async function setAdminSessionCookie(token: string) {
  setCookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: ONE_DAY_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  deleteCookie(ADMIN_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
}

export async function getAdminSessionCookie(): Promise<string | undefined> {
  return getCookie(ADMIN_COOKIE);
}
