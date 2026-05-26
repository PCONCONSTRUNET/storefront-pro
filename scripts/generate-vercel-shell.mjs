// Pós-build: gera saída no formato Vercel Build Output API v3
// usando Node.js 22 runtime (Serverless Function).
// Estrutura:
//   .vercel/output/
//     config.json
//     static/                         <- dist/client
//     functions/ssr.func/
//       .vc-config.json               <- runtime: nodejs22.x
//       package.json                  <- { "type": "module" }
//       index.mjs                     <- bridge Node http <-> server.fetch()
//       _server/...                   <- bundle TanStack Start (Node)

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
  console.error("[vercel] dist/client não encontrado.");
  process.exit(1);
}
if (!fs.existsSync(serverDir)) {
  console.error("[vercel] dist/server não encontrado.");
  process.exit(1);
}

const copyRec = (src, dst) => {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyRec(s, d);
    else fs.copyFileSync(s, d);
  }
};

if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// 1) Static
copyRec(clientDir, staticDir);
console.log(`[vercel] static/ ← dist/client`);

// 2) SSR Function (Node 22)
const serverEntry = path.join(serverDir, "server.js");
if (!fs.existsSync(serverEntry)) {
  console.error("[vercel] dist/server/server.js não encontrado.");
  process.exit(1);
}

fs.mkdirSync(funcDir, { recursive: true });
copyRec(serverDir, path.join(funcDir, "_server"));

// Bridge: Node http <-> Web fetch(Request)
const bridge = `// AUTO-GERADO por scripts/generate-vercel-shell.mjs
import server from "./_server/server.js";

function buildRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = new URL(req.url || "/", proto + "://" + host);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const vv of v) headers.append(k, vv);
    } else {
      headers.set(k, String(v));
    }
  }

  const method = req.method || "GET";
  const hasBody = method !== "GET" && method !== "HEAD";

  let body;
  if (hasBody) {
    body = new ReadableStream({
      start(controller) {
        req.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk)));
        req.on("end", () => controller.close());
        req.on("error", (err) => controller.error(err));
      },
    });
  }

  return new Request(url, {
    method,
    headers,
    body,
    duplex: hasBody ? "half" : undefined,
  });
}

async function writeResponse(response, res) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const reader = response.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) res.write(Buffer.from(value));
    }
  } finally {
    res.end();
  }
}

export default async function handler(req, res) {
  try {
    const request = buildRequest(req);
    const response = await server.fetch(request);
    await writeResponse(response, res);
  } catch (err) {
    console.error("[ssr] fatal", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
    }
    res.end("Internal Server Error: " + (err?.message || String(err)));
  }
}
`;
fs.writeFileSync(path.join(funcDir, "index.mjs"), bridge, "utf8");

fs.writeFileSync(
  path.join(funcDir, "package.json"),
  JSON.stringify({ type: "module" }, null, 2),
  "utf8",
);

const vcConfig = {
  runtime: "nodejs22.x",
  handler: "index.mjs",
  launcherType: "Nodejs",
  shouldAddHelpers: false,
  supportsResponseStreaming: true,
};
fs.writeFileSync(path.join(funcDir, ".vc-config.json"), JSON.stringify(vcConfig, null, 2), "utf8");
console.log(`[vercel] functions/ssr.func/ ← nodejs22.x`);

// 3) config.json — roteamento
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
console.log(`[vercel] config.json escrito`);

// 4) Limpa dist/ pra Vercel NÃO re-detectar framework
const distDir = path.join(projectRoot, "dist");
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
  console.log(`[vercel] dist/ removido`);
}

console.log(`[vercel] OK → .vercel/output/`);
