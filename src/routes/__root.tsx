import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouter,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useStore, hydrateFromCloud } from "@/lib/store";
import {
  DEVTOOLS_GUARD_INLINE_SCRIPT,
  useDevtoolsGuard,
} from "@/hooks/use-devtools-guard";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import appCss from "../styles.css?url";

const PWA_ALLOWED_ROUTES = ["/afiliada/login", "/afiliada", "/admin"];
const PWA_LAUNCH_KEY = "pwa_launch_route";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

function matchAllowedRoute(path: string): string | null {
  return (
    PWA_ALLOWED_ROUTES.find((r) => path === r || path.startsWith(r + "/")) ??
    null
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
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
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      { name: "theme-color", content: "#d177a8" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Princesa de Laços" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "Princesa de Laços — Loja On-line" },
      {
        name: "description",
        content: "Catálogo encantado de laços, tiaras e acessórios.",
      },
      {
        property: "og:title",
        content: "Princesa de Laços — Catálogo encantado",
      },
      {
        property: "og:description",
        content: "Catálogo encantado de laços, tiaras e acessórios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "Princesa de Laços — Catálogo encantado",
      },
      {
        name: "twitter:description",
        content: "Catálogo encantado de laços, tiaras e acessórios.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/lXDtPqq8z6gJkDgJ553CSEpWldA2/social-images/social-1778083243316-versao_grande.webp",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/lXDtPqq8z6gJkDgJ553CSEpWldA2/social-images/social-1778083243316-versao_grande.webp",
      },
      { property: "og:title", content: "Princesa de Laços — Loja On-line" },
      { name: "twitter:title", content: "Princesa de Laços — Loja On-line" },
      { name: "description", content: "Princesa de Laços — Loja On-line" },
      { property: "og:description", content: "Princesa de Laços — Loja On-line" },
      { name: "twitter:description", content: "Princesa de Laços — Loja On-line" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/lXDtPqq8z6gJkDgJ553CSEpWldA2/social-images/social-1779231001061-princesa_de_lacos_1mb.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/lXDtPqq8z6gJkDgJ553CSEpWldA2/social-images/social-1779231001061-princesa_de_lacos_1mb.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/icon-192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/icon-512.png",
      },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "mask-icon", href: "/icon-maskable-512.png", color: "#d177a8" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Pacifico&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [],
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
        <script
          dangerouslySetInnerHTML={{ __html: DEVTOOLS_GUARD_INLINE_SCRIPT }}
        />
        {children}
        <Toaster position="top-center" richColors />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const currentCustomerId = useStore((s) => s.currentCustomerId);
  const isAdmin = useStore((s) => s.isAdmin);

  useDevtoolsGuard();

  // Inicialização global do OneSignal
  usePushNotifications({
    role: isAdmin ? "admin" : "cliente",
    userId: isAdmin ? null : currentCustomerId,
  });

  const sessions = useStore((s) => s.sessions);
  const customers = useStore((s) => s.customers);
  const affiliates = useStore((s) => s.affiliates);
  const refreshSession = useStore((s) => s.refreshSession);
  const router = useRouter();
  const location = useLocation();


  // Track allowed routes for PWA launch memory
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = location.pathname;
    const matched = matchAllowedRoute(path);
    if (matched) {
      try {
        localStorage.setItem(PWA_LAUNCH_KEY, path);
      } catch {}
    }

    // Swap <link rel="manifest"> based on current area
    let manifestHref = "/manifest.json";
    if (path === "/admin" || path.startsWith("/admin/"))
      manifestHref = "/admin/manifest.json";
    else if (path === "/afiliada" || path.startsWith("/afiliada/"))
      manifestHref = "/afiliada/manifest.json";

    const finalHref = `${manifestHref}?v=${Date.now()}`;
    let link = document.querySelector(
      'link[rel="manifest"]',
    ) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }

    link.setAttribute("href", finalHref);
    console.log("[PWA] Manifest set to:", finalHref);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      useStore.getState().setReferralId(ref);
      try {
        localStorage.setItem("referral_id", ref);
      } catch {}
      console.log("[Affiliate] Referral detected:", ref);
    } else {
      const saved = localStorage.getItem("referral_id");
      if (saved) useStore.getState().setReferralId(saved);
    }
  }, []);

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
  }, [location.pathname, router]);

  useEffect(() => {
    const tick = () => {
      refreshSession("admin");
      refreshSession("customer");
      refreshSession("affiliate");
    };
    tick();
    const events = ["click", "keydown", "visibilitychange", "focus"] as const;
    events.forEach((e) => window.addEventListener(e, tick));
    const interval = window.setInterval(tick, 1000 * 60 * 15);
    return () => {
      events.forEach((e) => window.removeEventListener(e, tick));
      window.clearInterval(interval);
    };
  }, [refreshSession]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    hydrateFromCloud();
  }, []);

  // OneSignal Tagging & Role Management
  useEffect(() => {
    if (typeof window === "undefined") return;

    const OS =
      (window as any).OneSignalDeferred ||
      ((window as any).OneSignalDeferred = []);
    OS.push(async (OneSignal: any) => {
      try {
        const path = location.pathname;
        let role: "admin" | "affiliate" | "customer" = "customer";
        let activeUser: { id: string; email: string; name?: string } | null =
          null;

        // Identifica o usuário ativo baseado na rota e na sessão
        if (path.startsWith("/admin") && sessions.admin) {
          role = "admin";
          activeUser = {
            id: sessions.admin.subjectId,
            email: sessions.admin.subjectId,
          };
        } else if (path.startsWith("/afiliada") && sessions.affiliate) {
          role = "affiliate";
          const aff = affiliates.find(
            (a) => a.id === sessions.affiliate?.subjectId,
          );
          if (aff)
            activeUser = { id: aff.id, email: aff.email, name: aff.name };
        } else if (sessions.customer) {
          role = "customer";
          const cust = customers.find(
            (c) => c.id === sessions.customer?.subjectId,
          );
          if (cust)
            activeUser = { id: cust.id, email: cust.email, name: cust.name };
        }

        if (activeUser) {
          console.log("[OneSignal] User identified:", role, activeUser.id);
          // O login vincula o dispositivo ao external_id (id do usuário)
          await OneSignal.login(activeUser.id);
          // As tags permitem filtrar por público (admin, cliente, afiliada)
          await OneSignal.User.addTags({
            role: role,
            email: activeUser.email,
            full_name: activeUser.name || "",
          });
        } else {
          console.log(
            "[OneSignal] No active session, logging out of OneSignal",
          );
          await OneSignal.logout();
        }
      } catch (e) {
        console.warn("[OneSignal] Role sync failed", e);
      }
    });
  }, [sessions, customers, affiliates, location.pathname]);

  return (
    <>
      <Outlet />
      <PwaInstallPrompt />
    </>
  );
}
