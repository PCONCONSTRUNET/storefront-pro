// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Disable the Cloudflare Workers build plugin so we can deploy to Vercel
  // (or any static host) as a single-page app. Set to a truthy value if you
  // want to switch back to a Cloudflare Workers deploy via Lovable.
  cloudflare: false,
  tanstackStart: {
    // Render as an SPA: build a client-only bundle + prerendered shell at
    // /_shell so static hosts (Vercel, Netlify, GitHub Pages...) can serve
    // every route via a fallback rewrite.
    spa: { enabled: true },
    router: {
      codeSplittingOptions: {
        splitBehavior: ({ routeId }: { routeId: string }) => {
          const instantStoreRoutes = new Set([
            "/",
            "/buscar",
            "/cadastro",
            "/carrinho",
            "/categorias",
            "/checkout",
            "/login",
            "/pedidos",
            "/perfil",
            "/categoria/$slug",
            "/pedido/$id",
            "/produto/$id",
          ]);

          return instantStoreRoutes.has(routeId) ? [] : undefined;
        },
        defaultBehavior: [["component", "errorComponent", "notFoundComponent"]],
      },
    },
  },
});
