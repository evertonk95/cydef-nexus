// Pós-build (P2-03 fix): GitHub Pages não reescreve rotas SPA — URLs sem
// arquivo físico caem no 404.html com status 404 (Googlebot recusa indexar).
// Este script gera um index.html físico para cada rota do sitemap:
//   /en/            -> dist/en/index.html
//   /en/about       -> dist/en/about/index.html
//   /en/blog/<slug> -> dist/en/blog/<slug>/index.html
// Assim o GitHub Pages responde HTTP 200 + HTML para todas as URLs canônicas.
// Também mantém a cópia 404.html (fallback p/ rotas desconhecidas).
//
// Etapa 58: as rotas utilitárias/privadas da Academy (login, obrigado, status,
// aviso de privacidade por versão) NÃO estão no sitemap, mas são de uso real —
// o link "Entrar" da Navigation e os deep links de e-mail respondiam 404. Elas
// recebem o mesmo index.html físico aqui (fonte da lista:
// src/lib/private-routes.ts) e seguem fora do sitemap, com noindex.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadPrivateRoutes } from "./lib/load-private-routes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const INDEX = join(DIST, "index.html");

const html = readFileSync(INDEX, "utf8");

// Fallback SPA (rotas desconhecidas) — mantém o comportamento atual.
writeFileSync(join(DIST, "404.html"), html);

/** Grava dist/<rota>/index.html (HTTP 200 no Pages). Rota "/" = index raiz. */
const writeRouteFile = (pathname) => {
  if (pathname === "/" || pathname === "") return false;
  const clean = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const dir = join(DIST, clean);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  return true;
};

// Rotas do sitemap -> arquivos físicos com HTTP 200.
const sitemapPath = join(DIST, "sitemap.xml");
if (!existsSync(sitemapPath)) {
  console.error("postbuild: dist/sitemap.xml não encontrado — rode prebuild primeiro.");
  process.exit(1);
}
const xml = readFileSync(sitemapPath, "utf8");
const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
const origin = "https://www.cydef.com.br";
let count = 0;
for (const loc of locs) {
  if (writeRouteFile(loc.replace(origin, ""))) count++;
}

// Rotas utilitárias/privadas (fora do sitemap) -> mesmo arquivo físico.
const privateRoutes = await loadPrivateRoutes();
let privateCount = 0;
for (const pathname of privateRoutes) {
  if (writeRouteFile(pathname)) privateCount++;
}

console.log(
  `postbuild: 404.html ok · ${count} rotas do sitemap + ${privateCount} rotas utilitárias com index.html físico (HTTP 200 no Pages)`,
);
