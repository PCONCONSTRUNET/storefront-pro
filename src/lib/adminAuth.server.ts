// Cookie helpers server-only. Usa import dinâmico com @vite-ignore para que
// o specifier "@tanstack/react-start/server" não entre no grafo estático do
// client (a import-protection do Vite bloqueia esse specifier no bundle
// cliente, mesmo quando alcançado transitivamente).

export const ADMIN_COOKIE = "princesa_admin_session";

const ONE_DAY_SECONDS = 60 * 60 * 24;
const SERVER_MOD = "@tanstack/react-start/server";

async function srv(): Promise<any> {
  return await import(/* @vite-ignore */ SERVER_MOD);
}

export async function setAdminSessionCookie(token: string) {
  const { setCookie } = await srv();
  setCookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: ONE_DAY_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const { deleteCookie } = await srv();
  deleteCookie(ADMIN_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
}

export async function getAdminSessionCookie(): Promise<string | undefined> {
  const { getCookie } = await srv();
  return getCookie(ADMIN_COOKIE);
}
