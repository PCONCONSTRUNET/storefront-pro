// Cookie helpers server-only. Usa import dinâmico para evitar que o
// specifier "@tanstack/react-start/server" entre no grafo estático do client
// (import-protection do Vite bloqueia esse specifier no bundle cliente,
// mesmo quando chegado transitivamente por um .server.ts).

export const ADMIN_COOKIE = "princesa_admin_session";

const ONE_DAY_SECONDS = 60 * 60 * 24;

export async function setAdminSessionCookie(token: string) {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: ONE_DAY_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(ADMIN_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
}

export async function getAdminSessionCookie(): Promise<string | undefined> {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(ADMIN_COOKIE);
}
