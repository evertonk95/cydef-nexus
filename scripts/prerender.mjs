// Pré-render SSG (P3-01 batch 2) — orquestrador.
// Gera o HTML de cada rota com o conteúdo React já renderizado (jsdom), para o
// primeiro paint mostrar conteúdo real sem esperar o JS (LCP). Roda no
// postbuild, depois de scripts/postbuild.mjs (index.html físico por rota).
//
// Cada rota renderiza num PROCESSO FILHO (scripts/prerender-worker.mjs):
// isolamento total — crash/timer de uma rota não derruba o build; timers do
// React (scheduler/polling) morrem com o processo.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPrivateRoutes } from "./lib/load-private-routes.mjs";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKER = path.join(ROOT, "scripts/prerender-worker.mjs");
const CONCURRENCY = 4;

// 1. Bundle CJS do app (rotas lazy incluidas; CJS nao divide chunk)
const viteEnv = Object.fromEntries(
  Object.entries(process.env).filter(([k]) => k.startsWith("VITE_")),
);
const res = await esbuild.build({
  entryPoints: [path.join(ROOT, "src/main.tsx")],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "node",
  jsx: "automatic",
  alias: { "@": path.join(ROOT, "src") },
  loader: {
    ".css": "empty",
    ".webp": "empty",
    ".png": "empty",
    ".jpg": "empty",
    ".jpeg": "empty",
    ".svg": "empty",
    ".gif": "empty",
    ".woff": "empty",
    ".woff2": "empty",
  },
  define: {
    "import.meta.env": JSON.stringify({
      ...viteEnv,
      BASE_URL: "/",
      MODE: "production",
      DEV: false,
      PROD: true,
      SSR: false,
    }),
    "process.env.NODE_ENV": '"production"',
  },
  logLevel: "silent",
});
const bundleCode = res.outputFiles[0].text;

// 2. Rotas (sitemap → index.html físico do postbuild)
const sitemap = readFileSync(path.join(ROOT, "dist/sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
const sitemapRoutes = locs
  .map((loc) => new URL(loc).pathname)
  .filter((p) => p.startsWith("/"));
if (sitemapRoutes.length === 0) {
  console.error(
    "prerender: nenhuma rota em dist/sitemap.xml. Nada foi pre-renderizado.",
  );
  process.exit(1);
}
// Rotas utilitárias/privadas da Academy (etapa 58) também têm index.html físico
// (postbuild) e também são pré-renderizadas: elas não entram no sitemap, mas
// servem o mesmo conteúdo de SPA no primeiro paint. Fonte: src/lib/private-routes.ts.
const privateRoutes = (await loadPrivateRoutes()).filter(
  (route) => !sitemapRoutes.includes(route),
);
const routes = [...sitemapRoutes, ...privateRoutes];
console.log(
  `prerender: ${routes.length} rotas (${sitemapRoutes.length} do sitemap + ${privateRoutes.length} utilitarias fora do sitemap)`,
);

// 3. Workers em lotes
const bundleTmp = path.join(mkdtempSync(path.join(tmpdir(), "cydef-prerender-")), "app.cjs");
writeFileSync(bundleTmp, bundleCode, "utf8");

function renderRoute(route) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [WORKER, route, bundleTmp, "https://www.cydef.com.br"],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, 20000);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ route, code, out, err });
    });
  });
}

let ok = 0;
const failed = [];
for (let i = 0; i < routes.length; i += CONCURRENCY) {
  const batch = routes.slice(i, i + CONCURRENCY);
  const results = await Promise.all(batch.map(renderRoute));
  for (const { route, code, out, err } of results) {
    if (code === 0 && out) {
      try {
        const parsed = JSON.parse(out);
        const file = path.join(
          ROOT,
          "dist",
          route === "/" ? "index.html" : path.join(route, "index.html"),
        );
        writeFileSync(file, parsed.html, "utf8");
        ok += 1;
        continue;
      } catch (e) {
        failed.push(`${route} (saída inválida: ${e.message})`);
        continue;
      }
    }
    // A ultima linha do stderr e o ultimo frame do stack ("at main (file:///...)")
    // com o caminho absoluto da maquina: inutil no log e ilegivel no PR. Prefere
    // a linha com a mensagem do erro.
    const lines = (err || out || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const detail =
      lines.find((l) => /Error|erro|estabilizou|inv[aá]lid/i.test(l)) ||
      lines[lines.length - 1] ||
      `exit ${code}`;
    failed.push(`${route} (${detail.slice(0, 160)})`);
  }
  process.stdout.write(`\r  ${ok + failed.length}/${routes.length} rotas...`);
}
console.log("");
console.log(
  `prerender: ${ok}/${routes.length} rotas com conteudo no HTML` +
    (failed.length ? ` · falhas: ${failed.join(" | ")}` : ""),
);

// Falha parcial REPROVA o build.
// Antes a checagem era `ok === 0`: uma rota quebrada mantinha o shell do
// dist/404.html no index.html dela e o deploy seguia verde (as
// /pt|/en|/es/academy/gratuito ficaram meses em producao com 78/81 no log).
// O fallback fail-safe continua escrevendo o template original no dist, mas o
// build precisa falhar: rota vazia indexada e pior que deploy bloqueado.
// O gate vale para todas as rotas do portao, do sitemap e utilitarias: rota do
// sitemap que falha continua reprovando o build (etapa 57), e rota utilitaria
// que falha tambem (o shell dela iria para o ar sem conteudo e sem noindex).
if (failed.length > 0) {
  console.error("");
  console.error(
    `prerender: BLOQUEADO. ${failed.length} de ${routes.length} rotas ficaram com o shell do 404.html:`,
  );
  for (const f of failed) console.error(`  - ${f}`);
  console.error(
    "  Corrija a rota ou rode o worker direto: node scripts/prerender-worker.mjs \"<rota>\" \"%TEMP%/cydef-prerender-*/app.cjs\" \"https://www.cydef.com.br\"",
  );
  process.exit(1);
}
