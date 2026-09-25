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
//
// Etapa 77: a raiz ("/") não está no sitemap, então nunca passa pelo pré-render
// (scripts/prerender.mjs trabalha a lista do sitemap + as rotas utilitárias) e o
// dist/index.html publicado em `/` ficava com o template do Vite cru: era a única
// URL do site sem canônica no HTML servido. O `LangGate` (src/App.tsx) manda `/`
// para o idioma padrão com `<Navigate replace>` no cliente, e o buscador lê a raiz
// como redirecionamento ("Página com redirecionamento" no GSC). A canônica
// estática entra SÓ no dist/index.html: o 404.html e os arquivos de rota saem do
// template sem canônica (rota desconhecida não tem URL canônica) e o pré-render
// sobrescreve cada rota com a canônica dela.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadPrivateRoutes } from "./lib/load-private-routes.mjs";
import { loadDefaultLang } from "./lib/load-default-lang.mjs";

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

// Canônica da raiz (etapa 77). Depois dos arquivos acima, que saem do template
// SEM canônica. A URL é a mesma que o HeadSeo (src/lib/head-seo.tsx) emite para
// a home do idioma padrão, na mesma forma do sitemap (COM barra final, via
// withTrailingSlash): origin + "/" + DEFAULT_LANG + "/". O idioma vem do
// src/i18n (fonte única), não de um "en" repetido aqui.
// Se o template já trouxer uma canônica, ela não é duplicada: o guard abaixo
// exige exatamente UMA e igual a esta.
const DEFAULT_LANG = await loadDefaultLang();
const rootCanonical = `<link rel="canonical" href="${origin}/${DEFAULT_LANG}/">`;
// EOL do template (o checkout no Windows é CRLF, na CI é LF): a linha nova não
// pode deixar o artefato com um LF solto no meio de CRLF.
const eol = html.includes("\r\n") ? "\r\n" : "\n";
const rootHtml = html.includes('rel="canonical"')
  ? html
  : html.replace("</head>", `  ${rootCanonical}${eol}  </head>`);
writeFileSync(INDEX, rootHtml);

// Guard: canônica errada (ou ausente) na raiz só apareceria no Search Console,
// semanas depois do deploy. Aqui o build reprova na hora.
const canonicalsOf = (file) =>
  [...readFileSync(file, "utf8").matchAll(/<link\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => /rel=["']canonical["']/.test(tag));
const rootTags = canonicalsOf(INDEX);
const fallbackTags = canonicalsOf(join(DIST, "404.html"));
if (rootTags.length !== 1 || rootTags[0] !== rootCanonical || fallbackTags.length) {
  console.error(
    "postbuild: canônica da raiz incorreta.\n" +
      `  dist/index.html: ${rootTags.join(" | ") || "nenhuma"} (esperado: ${rootCanonical})\n` +
      `  dist/404.html: ${fallbackTags.join(" | ") || "nenhuma"} (esperado: nenhuma)`,
  );
  process.exit(1);
}

console.log(
  `postbuild: 404.html ok · ${count} rotas do sitemap + ${privateCount} rotas utilitárias com index.html físico (HTTP 200 no Pages) · raiz com canônica ${origin}/${DEFAULT_LANG}/`,
);
