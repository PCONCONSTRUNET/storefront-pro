// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { config as loadEnv } from "dotenv";

// noExternal só no build de produção (Vercel). No dev quebra CJS como react/index.js.
const isBuild = process.argv.includes("build");

// Carrega .env para injetar como literais no bundle (Vercel não expõe .env em runtime).
loadEnv();

const envDefines = {
  "process.env.SUPABASE_URL": JSON.stringify(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  ),
  "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
    process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      "",
  ),
  "process.env.VITE_SUPABASE_URL": JSON.stringify(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
  ),
  "process.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      "",
  ),
};

export default defineConfig({
  // Desabilita o plugin Cloudflare — geramos saída Node 22 para Vercel.
  cloudflare: false,
  vite: isBuild
    ? {
        define: envDefines,
        ssr: {
          // Bundla TODOS os deps no SSR pra função Vercel ser self-contained.
          noExternal: true,
        },
      }
    : { define: envDefines },
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
