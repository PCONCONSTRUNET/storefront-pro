import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "..");
const clientDir = path.join(projectRoot, "dist", "client");
const assetsDir = path.join(clientDir, "assets");

if (!fs.existsSync(clientDir)) {
  console.error("[generate-vercel-shell] dist/client não encontrado.");
  process.exit(1);
}

const jsFile = fs.existsSync(assetsDir)
  ? fs.readdirSync(assetsDir).find((f) => f.startsWith("client-entry") && f.endsWith(".js"))
  : null;
const fallbackJsFile = fs.existsSync(assetsDir)
  ? fs
      .readdirSync(assetsDir)
      .find((f) => /^index-[A-Za-z0-9_-]+\.js$/.test(f))
  : null;
const cssFile = fs.existsSync(assetsDir)
  ? fs.readdirSync(assetsDir).find((f) => f.startsWith("styles-") && f.endsWith(".css"))
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