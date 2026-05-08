import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouter, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

const PWA_ALLOWED_ROUTES = ["/afiliada/login", "/afiliada", "/admin"];
const PWA_LAUNCH_KEY = "pwa_launch_route";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
}

function matchAllowedRoute(path: string): string | null {
  return PWA_ALLOWED_ROUTES.find(r => path === r || path.startsWith(r + "/")) ?? null;
}
import { Toaster } from "@/components/ui/sonner";
import { useStore, hydrateFromCloud } from "@/lib/store";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { name: "theme-color", content: "#d177a8" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Princesa de Laços" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "Princesa de Laços — Catálogo encantado" },
      { name: "description", content: "A responsive web application for creating a professional digital storefront, akin to a marketplace." },
      { property: "og:title", content: "Princesa de Laços — Catálogo encantado" },
      { property: "og:description", content: "A responsive web application for creating a professional digital storefront, akin to a marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Princesa de Laços — Catálogo encantado" },
      { name: "twitter:description", content: "A responsive web application for creating a professional digital storefront, akin to a marketplace." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/lXDtPqq8z6gJkDgJ553CSEpWldA2/social-images/social-1778083243316-versao_grande.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/lXDtPqq8z6gJkDgJ553CSEpWldA2/social-images/social-1778083243316-versao_grande.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "mask-icon", href: "/icon-maskable-512.png", color: "#d177a8" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Pacifico&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
    scripts: [
      { src: "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js", defer: true },
      {
        children: `window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
  await OneSignal.init({
    appId: "eceb417e-8a33-4d57-9a0f-0cdfe8f8c7e6",
    safari_web_id: "web.onesignal.auto.18c6dc90-7633-4ce6-8875-ae2763214094",
    notifyButton: { enable: false },
    promptOptions: { slidedown: { prompts: [] } },
  });
  try {
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (!isStandalone) return;
    var perm = (typeof Notification !== 'undefined') ? Notification.permission : 'denied';
    if (perm !== 'default') return;
    var asked = false;
    var ask = function(){
      if (asked) return;
      asked = true;
      try { OneSignal.Notifications.requestPermission(); } catch(e) {}
    };
    setTimeout(ask, 1200);
    var onGesture = function(){
      ask();
      window.removeEventListener('pointerdown', onGesture, true);
      window.removeEventListener('touchstart', onGesture, true);
      window.removeEventListener('click', onGesture, true);
      window.removeEventListener('keydown', onGesture, true);
    };
    window.addEventListener('pointerdown', onGesture, true);
    window.addEventListener('touchstart', onGesture, true);
    window.addEventListener('click', onGesture, true);
    window.addEventListener('keydown', onGesture, true);
  } catch(e) {}
});` ,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster position="top-center" richColors />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const refreshSession = useStore(s => s.refreshSession);
  const router = useRouter();
  const location = useLocation();

  // Track allowed routes for PWA launch memory + swap manifest dynamically
  // so installing from /afiliada or /admin pins the start_url to that area.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = location.pathname;
    const matched = matchAllowedRoute(path);
    if (matched) {
      try { localStorage.setItem(PWA_LAUNCH_KEY, path); } catch {}
    }

    // Swap <link rel="manifest"> based on current area
    let manifestHref = "/manifest.json";
    if (path === "/admin" || path.startsWith("/admin/")) manifestHref = "/manifest-admin.json";
    else if (path === "/afiliada" || path.startsWith("/afiliada/")) manifestHref = "/manifest-afiliada.json";

    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (link && link.getAttribute("href") !== manifestHref) {
      link.setAttribute("href", manifestHref);
    }
  }, [location.pathname]);

  // On PWA launch at "/", redirect to last allowed route if any
  useEffect(() => {
    if (!isStandaloneMode()) return;
    if (location.pathname !== "/") return;
    try {
      const saved = localStorage.getItem(PWA_LAUNCH_KEY);
      if (saved && matchAllowedRoute(saved)) {
        router.navigate({ to: saved, replace: true });
      }
    } catch {}
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Sliding session: any user activity refreshes the active sessions.
    const tick = () => {
      refreshSession("admin");
      refreshSession("customer");
      refreshSession("affiliate");
    };
    tick();
    const events = ["click", "keydown", "visibilitychange", "focus"] as const;
    events.forEach(e => window.addEventListener(e, tick));
    const interval = window.setInterval(tick, 1000 * 60 * 15); // every 15 min
    return () => {
      events.forEach(e => window.removeEventListener(e, tick));
      window.clearInterval(interval);
    };
  }, [refreshSession]);
  return <><Outlet /><PwaInstallPrompt /></>;
}
