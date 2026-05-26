// Pós-build: gera saída no formato Vercel Build Output API v3
// (https://vercel.com/docs/build-output-api/v3) para forçar a Vercel
// a servir o app sem depender de detecção de framework, vercel.json
// rewrites, ou da pasta /api convencional.
//
// Estrutura gerada:
//   .vercel/output/
//     config.json                     -> rotas (assets diretos, fallback p/ função SSR)
//     static/                         -> conteúdo de dist/client (assets, favicons, manifests)
//     functions/ssr.func/
//       .vc-config.json               -> { runtime: "edge", entrypoint: "index.js" }
//       index.js                      -> wrapper que chama worker.fetch()
//       _server/...                   -> bundle do server-entry do TanStack Start

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "..");
const clientDir = path.join(projectRoot, "dist", "client");
const serverDir = path.join(projectRoot, "dist", "server");
const outDir = path.join(projectRoot, ".vercel", "output");
const staticDir = path.join(outDir, "static");
const funcDir = path.join(outDir, "functions", "ssr.func");

if (!fs.existsSync(clientDir)) {
  console.error("[vercel-boa] dist/client não encontrado.");
  process.exit(1);
}
if (!fs.existsSync(serverDir)) {
  console.error("[vercel-boa] dist/server não encontrado — SSR não funcionará.");
  process.exit(1);
}

// Helpers --------------------------------------------------------------------
const copyRec = (src, dst) => {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyRec(s, d);
    else fs.copyFileSync(s, d);
  }
};

// Limpa saída anterior --------------------------------------------------------
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// 1) Static -------------------------------------------------------------------
copyRec(clientDir, staticDir);
console.log(`[vercel-boa] static/ ← dist/client (${fs.readdirSync(staticDir).length} itens top-level)`);

// 2) Função SSR (Edge) --------------------------------------------------------
const serverAssetsDir = path.join(serverDir, "assets");
const workerEntry = fs.existsSync(serverAssetsDir)
  ? fs.readdirSync(serverAssetsDir).find((f) => f.startsWith("worker-entry") && f.endsWith(".js"))
  : null;

if (!workerEntry) {
  console.error("[vercel-boa] worker-entry-*.js não encontrado em dist/server/assets");
  process.exit(1);
}

fs.mkdirSync(funcDir, { recursive: true });

// Copia todo o dist/server para dentro da func
const funcServerDir = path.join(funcDir, "_server");
copyRec(serverDir, funcServerDir);

// Wrapper Edge - usa a mesma API fetch(request, env, ctx) do Worker
const handlerJs = `// AUTO-GERADO por scripts/generate-vercel-shell.mjs
import worker from "./_server/assets/${workerEntry}";

const ctx = { waitUntil() {}, passThroughOnException() {} };

export default async function handler(request) {
  const env = (typeof process !== "undefined" && process.env) ? process.env : {};
  try {
    return await worker.fetch(request, env, ctx);
  } catch (err) {
    console.error("[ssr] fatal", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
`;
fs.writeFileSync(path.join(funcDir, "index.js"), handlerJs, "utf8");

// .vc-config.json — declara Edge runtime
const vcConfig = {
  runtime: "edge",
  entrypoint: "index.js",
};
fs.writeFileSync(path.join(funcDir, ".vc-config.json"), JSON.stringify(vcConfig, null, 2), "utf8");
console.log(`[vercel-boa] functions/ssr.func/ ← edge (entry: ${workerEntry})`);

// 3) config.json — rotas ------------------------------------------------------
// Ordem importa:
//  - assets com cache imutável
//  - service workers sem cache
//  - "filesystem" tenta servir arquivos estáticos primeiro
//  - tudo o resto cai na função SSR
const config = {
  version: 3,
  routes: [
    {
      src: "^/assets/(.*)$",
      headers: { "cache-control": "public, max-age=31536000, immutable" },
      continue: true,
    },
    {
      src: "^/(OneSignalSDKWorker|OneSignalSDKUpdaterWorker)\\.js$",
      headers: {
        "service-worker-allowed": "/",
        "cache-control": "no-cache, no-store, must-revalidate",
      },
      continue: true,
    },
    { src: "^/admin/manifest\\.json$", dest: "/manifest-admin.json" },
    { src: "^/afiliada/manifest\\.json$", dest: "/manifest-afiliada.json" },
    { handle: "filesystem" },
    { src: "^/.*$", dest: "/ssr" },
  ],
};
fs.writeFileSync(path.join(outDir, "config.json"), JSON.stringify(config, null, 2), "utf8");
console.log(`[vercel-boa] config.json escrito`);

console.log(`[vercel-boa] OK → .vercel/output/`);
