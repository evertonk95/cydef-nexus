// Pós-build (P2-03 fix): GitHub Pages não reescreve rotas SPA — URLs sem
// arquivo físico caem no 404.html com status 404 (Googlebot recusa indexar).
// Este script gera um index.html físico para cada rota do sitemap:
//   /en/            -> dist/en/index.html
//   /en/about       -> dist/en/about/index.html
//   /en/blog/<slug> -> dist/en/blog/<slug>/index.html
// Assim o GitHub Pages responde HTTP 200 + HTML para todas as URLs canônicas.
// Também mantém a cópia 404.html (fallback p/ rotas desconhecidas).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const INDEX = join(DIST, "index.html");

const html = readFileSync(INDEX, "utf8");

// Fallback SPA (rotas desconhecidas) — mantém o comportamento atual.
writeFileSync(join(DIST, "404.html"), html);

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
  const pathname = loc.replace(origin, "");
  if (pathname === "/" || pathname === "") continue;
  const clean = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const dir = join(DIST, clean);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  count++;
}
console.log(`postbuild: 404.html ok · ${count} rotas com index.html físico (HTTP 200 no Pages)`);
