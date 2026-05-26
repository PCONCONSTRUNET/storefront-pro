// Pós-build: prepara saída para Vercel
//   1) Empacota o worker-entry (Cloudflare-compatible fetch handler gerado
//      pelo TanStack Start) como uma Vercel Edge Function em /api/index.js
//      para que rotas dinâmicas, SSR e /_serverFn/* funcionem.
//   2) Gera dist/client/_shell.html como fallback SPA.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "..");
const clientDir = path.join(projectRoot, "dist", "client");
const assetsDir = path.join(clientDir, "assets");
const serverDir = path.join(projectRoot, "dist", "server");
const apiDir = path.join(projectRoot, "api");

if (!fs.existsSync(clientDir)) {
  console.error("[generate-vercel-shell] dist/client não encontrado.");
  process.exit(1);
}

// ---------- 1) Vercel Edge function wrapping the worker entry ----------
if (fs.existsSync(serverDir)) {
  const serverAssetsDir = path.join(serverDir, "assets");
  const workerEntry = fs.existsSync(serverAssetsDir)
    ? fs
        .readdirSync(serverAssetsDir)
        .find((f) => f.startsWith("worker-entry") && f.endsWith(".js"))
    : null;

  if (!workerEntry) {
    console.error(
      "[vercel-edge] worker-entry-*.js não encontrado em dist/server/assets",
    );
    process.exit(1);
  }

  // Copia toda a árvore dist/server para api/_server/ (Vercel só inclui
  // arquivos dentro de /api/ no bundle da função).
  const apiServerDir = path.join(apiDir, "_server");
  if (fs.existsSync(apiServerDir))
    fs.rmSync(apiServerDir, { recursive: true, force: true });
  fs.mkdirSync(apiServerDir, { recursive: true });
  // copia recursivamente
  const copyRec = (src, dst) => {
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, entry.name);
      const d = path.join(dst, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(d, { recursive: true });
        copyRec(s, d);
      } else {
        fs.copyFileSync(s, d);
      }
    }
  };
  copyRec(serverDir, apiServerDir);

  const handlerJs = `// AUTO-GERADO por scripts/generate-vercel-shell.mjs
// Wrapper: roda o worker-entry do TanStack Start como Vercel Edge Function.
export const config = { runtime: "edge" };

import worker from "./_server/assets/${workerEntry}";

const ctx = {
  waitUntil() {},
  passThroughOnException() {},
};

export default async function handler(request) {
  // Espelha process.env do runtime na env esperada pelo worker
  const env = (typeof process !== "undefined" && process.env) ? process.env : {};
  return worker.fetch(request, env, ctx);
}
`;
  fs.mkdirSync(apiDir, { recursive: true });
  fs.writeFileSync(path.join(apiDir, "ssr.js"), handlerJs, "utf8");
  console.log(
    `[vercel-edge] OK → api/ssr.js (entry: ${workerEntry}, ${fs.readdirSync(apiServerDir).length} top-level items copiados)`,
  );
} else {
  console.warn(
    "[vercel-edge] dist/server não encontrado — SSR/server-fn não funcionarão.",
  );
}

// ---------- 2) SPA shell fallback ----------
const jsFile = fs.existsSync(assetsDir)
  ? fs
      .readdirSync(assetsDir)
      .find((f) => f.startsWith("client-entry") && f.endsWith(".js"))
  : null;
const fallbackJsFile = fs.existsSync(assetsDir)
  ? fs
      .readdirSync(assetsDir)
      .find((f) => /^index-[A-Za-z0-9_-]+\.js$/.test(f))
  : null;
const cssFile = fs.existsSync(assetsDir)
  ? fs
      .readdirSync(assetsDir)
      .find((f) => f.startsWith("styles-") && f.endsWith(".css"))
  : null;

const entryJsFile = jsFile || fallbackJsFile;

if (!entryJsFile) {
  console.error("[generate-vercel-shell] JS entry não encontrado.");
  process.exit(1);
}

const shell = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#d177a8" />
    <title>Princesa de Laços — Loja On-line</title>
    <meta name="description" content="Laços, tiaras e acessórios infantis feitos com carinho." />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="manifest" href="/manifest.json" />
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
    <script>self.$_TSR={h(){this.hydrated=true;this.c&&this.c()},e(){this.streamEnded=true;this.c&&this.c()},c(){},p(fn){fn()},buffer:[],router:{manifest:{routes:{}},matches:[{i:"__root__",s:"success"},{i:"/",s:"success"}],lastMatchId:"/"}}</script>
  </head>
  <body>
    <script type="module" src="/assets/${entryJsFile}"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(clientDir, "_shell.html"), shell, "utf8");
console.log(`[generate-vercel-shell] OK → dist/client/_shell.html`);
