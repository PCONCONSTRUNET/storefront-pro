/**
 * Gera dist/client/_shell.html após o build.
 * A Vercel reescreve rotas SPA para esse arquivo; sem ele, todo o site retorna 404.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "..");
const clientDir = path.join(projectRoot, "dist", "client");
const serverAssetsDir = path.join(projectRoot, "dist", "server", "assets");

function fail(msg) {
  console.error(`[generate-vercel-shell] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(clientDir)) fail("dist/client não encontrado — rode vite build antes.");
if (!fs.existsSync(serverAssetsDir)) fail("dist/server/assets não encontrado.");

const manifestFile = fs
  .readdirSync(serverAssetsDir)
  .find((f) => f.startsWith("_tanstack-start-manifest_v-"));
if (!manifestFile) fail("manifest TanStack Start não encontrado.");

const manifestSrc = fs.readFileSync(
  path.join(serverAssetsDir, manifestFile),
  "utf8",
);
const clientEntryMatch = manifestSrc.match(/clientEntry:\s*"([^"]+)"/);
if (!clientEntryMatch) fail("clientEntry não encontrado no manifest.");

const clientEntry = clientEntryMatch[1];
const assetsDir = path.join(clientDir, "assets");
const cssFile = fs
  .readdirSync(assetsDir)
  .find((f) => f.startsWith("styles-") && f.endsWith(".css"));
if (!cssFile) fail("styles-*.css não encontrado em dist/client/assets.");

const cssHref = `/assets/${cssFile}`;
const jsSrc = clientEntry.startsWith("/") ? clientEntry : `/${clientEntry}`;

const shell = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
    />
    <meta name="theme-color" content="#d177a8" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Princesa de Laços" />
    <meta name="mobile-web-app-capable" content="yes" />
    <title>Princesa de Laços — Loja On-line</title>
    <meta
      name="description"
      content="Laços, tiaras e acessórios infantis feitos com carinho."
    />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="stylesheet" href="${cssHref}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Pacifico&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${jsSrc}"></script>
  </body>
</html>
`;

const outPath = path.join(clientDir, "_shell.html");
fs.writeFileSync(outPath, shell, "utf8");
console.log(`[generate-vercel-shell] OK → ${outPath}`);
console.log(`[generate-vercel-shell] JS: ${jsSrc} | CSS: ${cssHref}`);
