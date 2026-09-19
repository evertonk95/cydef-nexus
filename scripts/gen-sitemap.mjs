// Gera public/sitemap.xml + public/robots.txt (P2-03 — SEO i18n).
// Uso: node scripts/gen-sitemap.mjs  (a partir da raiz do repo)
// Lê os dados reais (slugs de páginas/artigos/cursos) via esbuild e grava
// URLs canônicas por idioma. Reexecutar sempre que rotas/conteúdo mudarem.
//
// Forma da URL: COM barra final, via `withTrailingSlash` de src/lib/routes.ts.
// É a forma que o GitHub Pages serve (dist/<rota>/index.html); a forma sem
// barra respondia 301, e o Google lia a URL do sitemap como "Página com
// redirecionamento" (avisos do GSC de 16/09/2026). A regra vive em um único
// ponto (routes.ts), a mesma usada pela canônica/hreflang em head-seo.tsx.
//
// lastmod: data real do conteúdo quando o dado existe (artigos têm `dateISO`);
// nas páginas, data do build. Nunca mais uma data fixa no código, que ficou
// defasada em 03/09/2026 e escondia os artigos publicados depois.
// changefreq: removido. Google e Bing ignoram o campo; `lastmod` é o sinal que
// o buscador usa.
import { build } from "esbuild";
import { writeFileSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://www.cydef.com.br";
const LANGS = ["en", "pt", "es"];
/** Fallback de lastmod onde o conteúdo não carrega data própria. */
const BUILD_DATE = new Date().toISOString().slice(0, 10);

async function load(entry) {
  const res = await build({
    entryPoints: [join(ROOT, entry)],
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
  });
  const tmp = join(ROOT, `.gen-sitemap-${Date.now()}-${Math.random().toString(36).slice(2)}.cjs`);
  writeFileSync(tmp, res.outputFiles[0].text);
  const mod = await import(`file://${tmp.replace(/\\/g, "/")}`);
  try {
    unlinkSync(tmp);
  } catch {
    // arquivo temporário já removido — ok
  }
  return mod;
}

const [
  { pageSlugs, withTrailingSlash },
  { postsMetaByLang },
  { courseDataPt },
  { labsSlugsForLang },
] = await Promise.all([
  load("src/lib/routes.ts"),
  load("src/lib/blog/posts.ts"),
  load("src/lib/courses.ts"),
  load("src/lib/labs/artifacts.ts"),
]);

/** Rota -> lastmod (mantém a data mais recente quando a rota se repete). */
const urls = new Map();
const add = (path, lastmod = BUILD_DATE) => {
  const loc = withTrailingSlash(path);
  const current = urls.get(loc);
  if (!current || lastmod > current) urls.set(loc, lastmod);
};

for (const lang of LANGS) {
  add(`/${lang}/`);
  for (const key of ["about", "ecosystem", "academy", "labs", "research", "blog", "contact", "privacy", "terms", "courses"]) {
    add(`/${lang}/${pageSlugs[key][lang]}`);
  }
  // Slugs universais de artigos: iterar o meta DE CADA idioma (P3-01/F3: um
  // artigo pode existir só em PT até a tradução EN/ES chegar — não gerar URL
  // morta nos idiomas ainda não traduzidos). lastmod = data do artigo.
  for (const post of postsMetaByLang[lang]) {
    add(`/${lang}/${pageSlugs.blog[lang]}/${post.slug}`, post.dateISO || BUILD_DATE);
  }
  // Artefatos do Labs com conteúdo no idioma (F5: framework PT-first — só PT
  // até a tradução EN/ES chegar; não gerar URL morta nos demais idiomas).
  for (const slug of labsSlugsForLang(lang)) {
    add(`/${lang}/${pageSlugs.labs[lang]}/${slug}`);
  }
  for (const courseId of Object.keys(courseDataPt)) {
    add(`/${lang}/${pageSlugs.courses[lang]}/${courseId}`);
  }
  add(`/${lang}/academy/gratuito`);
  // Fora do sitemap, de propósito (etapa 58): as rotas utilitárias/privadas da
  // Academy (entrar, obrigado, status-confirmacao e o aviso de privacidade de
  // TODA versão publicada) servem `noindex, nofollow` e não são conteúdo de
  // descoberta. O index.html físico delas sai de src/lib/private-routes.ts
  // (postbuild/prerender), não deste script.
}

const sorted = [...urls.entries()].sort(([a], [b]) =>
  a < b ? -1 : a > b ? 1 : 0,
);
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sorted.map(
    ([path, lastmod]) =>
      `  <url><loc>${ORIGIN}${path}</loc><lastmod>${lastmod}</lastmod></url>`,
  ),
  "</urlset>",
  "",
].join("\n");

writeFileSync(join(ROOT, "public/sitemap.xml"), xml);
writeFileSync(
  join(ROOT, "public/robots.txt"),
  ["User-agent: *", "Allow: /", `Sitemap: ${ORIGIN}/sitemap.xml`, ""].join("\n"),
);
console.log(`sitemap.xml: ${sorted.length} URLs (${ORIGIN})`);
