// Pré-render SSG (P3-01 batch 2) — orquestrador.
// Gera o HTML de cada rota com o conteúdo React já renderizado (jsdom), para o
// primeiro paint mostrar conteúdo real sem esperar o JS (LCP). Roda no
// postbuild, depois de scripts/postbuild.mjs (index.html físico por rota).
//
// Cada rota renderiza num PROCESSO FILHO (scripts/prerender-worker.mjs):
// isolamento total — crash/timer de uma rota não derruba o build; timers do
// React (scheduler/polling) morrem com o processo.
import { readFileSync, writeFileSync, mkdtempSync, readdirSync } from "node:fs";
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

// Preload do chunk da rota (06/11/2026).
// A rota é lazy: o HTML já chega com conteúdo, mas o React só assume a árvore
// depois de baixar o chunk dela. Sem o preload o download só começa quando o
// bundle principal executa, em série: no 4G simulado do Lighthouse o chunk do
// artigo iniciava em 4,0 s e terminava em 5,5 s, e o LCP ia a 5,9 s mesmo com o
// conteúdo no HTML. Com o preload o download começa junto com o bundle.
const ASSETS = readdirSync(path.join(ROOT, "dist", "assets"));
const chunkOf = (prefix) => {
  const file = ASSETS.find(
    (f) => f.startsWith(`${prefix}-`) && f.endsWith(".js"),
  );
  return file ? `/assets/${file}` : null;
};

const ACADEMY_CHUNKS = {
  gratuito: "AcademyLanding",
  privacidade: "AcademyPrivacy",
  "status-confirmacao": "AcademyStatusConfirmation",
  obrigado: "AcademyThankYou",
  entrar: "AcademyLogin",
};

/** Chunk da rota: mesma divisão declarada em src/App.tsx. */
const chunkForRoute = (route) => {
  // Resto do caminho depois do idioma: /pt/blog/<slug> -> ["pt","blog","<slug>"]
  const [, , section, sub] = route.split("/");
  // Home do idioma: renderizada por src/pages/Index.tsx, que já está no bundle
  // principal. Preload aqui só baixaria chunk à toa.
  if (!section) return null;
  if (section === "blog") return sub ? "BlogPost" : "SeoRouter";
  if (section === "labs") return sub ? "LabsArtifact" : "SeoRouter";
  if (section === "academy" && sub && ACADEMY_CHUNKS[sub]) {
    return ACADEMY_CHUNKS[sub];
  }
  // Demais páginas e áreas de curso vêm de src/lib/SeoRouter.tsx.
  return "SeoRouter";
};

const withModulePreload = (html, route) => {
  const chunk = chunkOf(chunkForRoute(route));
  if (!chunk || html.includes(`rel="modulepreload" href="${chunk}"`)) {
    return html;
  }
  const tag = `<link rel="modulepreload" href="${chunk}">`;
  return html.includes("</head>")
    ? html.replace("</head>", `  ${tag}\n</head>`)
    : html;
};

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
        writeFileSync(file, withModulePreload(parsed.html, route), "utf8");
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
