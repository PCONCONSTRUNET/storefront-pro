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

function warn(msg) {
  console.warn(`[generate-vercel-shell] ⚠ ${msg}`);
}

if (!fs.existsSync(clientDir)) {
  console.error("[generate-vercel-shell] dist/client não encontrado — rode vite build antes.");
  process.exit(1);
}

// --- Tenta obter o JS entry e o CSS do manifest do server ---
let jsSrc = null;
let cssHref = null;

if (fs.existsSync(serverAssetsDir)) {
  const manifestFile = fs
    .readdirSync(serverAssetsDir)
    .find((f) => f.startsWith("_tanstack-start-manifest_v-"));

  if (manifestFile) {
    const manifestSrc = fs.readFileSync(
      path.join(serverAssetsDir, manifestFile),
      "utf8",
    );
    const clientEntryMatch = manifestSrc.match(/clientEntry:\s*"([^"]+)"/);
    if (clientEntryMatch) {
      const entry = clientEntryMatch[1];
      jsSrc = entry.startsWith("/") ? entry : `/${entry}`;
    } else {
      warn("clientEntry não encontrado no manifest.");
    }
  } else {
    warn("manifest TanStack Start não encontrado em dist/server/assets.");
  }
} else {
  warn("dist/server/assets não encontrado — tentando fallback.");
}

// --- Fallback: busca o entry JS diretamente em dist/client/assets ---
const assetsDir = path.join(clientDir, "assets");
if (!jsSrc && fs.existsSync(assetsDir)) {
  const jsFile = fs
    .readdirSync(assetsDir)
    .find((f) => f.startsWith("client-entry") && f.endsWith(".js"));
  if (jsFile) {
    jsSrc = `/assets/${jsFile}`;
    warn(`Usando fallback JS entry: ${jsSrc}`);
  }
}

// --- CSS ---
if (fs.existsSync(assetsDir)) {
  const cssFile = fs
    .readdirSync(assetsDir)
    .find((f) => f.startsWith("styles-") && f.endsWith(".css"));
  if (cssFile) {
    cssHref = `/assets/${cssFile}`;
  } else {
    warn("styles-*.css não encontrado — shell será gerado sem CSS link.");
  }
} else {
  warn("dist/client/assets não encontrado.");
}

if (!jsSrc) {
  console.error("[generate-vercel-shell] Não foi possível encontrar o JS entry. Abortando.");
  process.exit(1);
}

const cssLink = cssHref
  ? `    <link rel="stylesheet" href="${cssHref}" />`
  : "    <!-- CSS não encontrado -->";

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
${cssLink}
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
console.log(`[generate-vercel-shell] JS: ${jsSrc} | CSS: ${cssHref || "N/A"}`);
