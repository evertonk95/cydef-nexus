#!/usr/bin/env node
/**
 * scripts/gen-aviso-redirects.mjs
 *
 * Gera, para cada versão do Aviso de Privacidade (src/lib/academy/consent.ts),
 * o index.html físico da URL estável:
 *
 *   /academy/privacidade/<versao>/index.html
 *
 * A URL estável é a prova de consentimento gravada no banco e não muda. O site
 * publica a versão sob o prefixo de idioma, então essas páginas redirecionam
 * na hora para `/pt/academy/privacidade/<versao>/` (meta refresh 0,
 * location.replace, canônica para o destino, noindex e link visível de
 * fallback).
 *
 * Ficam FORA do sitemap de propósito: o script reprova se alguma delas aparecer
 * em dist/sitemap.xml.
 *
 * Roda no postbuild, depois de postbuild.mjs e prerender.mjs.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAvisoRedirects } from "./lib/load-aviso-redirects.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

if (!existsSync(DIST)) {
  console.error("gen-aviso-redirects: dist/ não encontrado. Rode o build primeiro.");
  process.exit(1);
}

const paginas = await loadAvisoRedirects();
if (paginas.length === 0) {
  console.error("gen-aviso-redirects: nenhuma versão do aviso encontrada em AVISOS.");
  process.exit(1);
}

const sitemapPath = join(DIST, "sitemap.xml");
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, "utf8") : "";

const noSitemap = paginas.filter((pagina) => sitemap.includes(pagina.urlEstavel));

for (const pagina of paginas) {
  const arquivo = join(DIST, pagina.arquivo);
  mkdirSync(dirname(arquivo), { recursive: true });
  writeFileSync(arquivo, pagina.html, "utf8");
}

console.log(
  `aviso redirects: ${paginas.length} página(s) da URL estável -> ${paginas
    .map((p) => p.urlEstavel)
    .join(", ")}`,
);

if (noSitemap.length > 0) {
  console.error(
    `aviso redirects: URL estável não pode entrar no sitemap: ${noSitemap
      .map((p) => p.urlEstavel)
      .join(", ")}`,
  );
  process.exit(1);
}
