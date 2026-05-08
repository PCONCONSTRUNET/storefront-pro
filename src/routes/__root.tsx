import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/lib/store";

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
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "icon", type: "image/png", href: "/icon-512.png" },
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
    if (perm === 'default') {
      var key = 'os_native_prompt_shown';
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        setTimeout(function(){ OneSignal.Notifications.requestPermission(); }, 1500);
      }
    }
  } catch(e) {}
});`,
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
  return <Outlet />;
}
