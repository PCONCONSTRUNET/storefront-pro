// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
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
