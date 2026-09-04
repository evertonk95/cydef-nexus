// Gera public/sitemap.xml + public/robots.txt (P2-03 — SEO i18n).
// Uso: node scripts/gen-sitemap.mjs  (a partir da raiz do repo)
// Lê os dados reais (slugs de páginas/artigos/cursos) via esbuild e grava
// URLs canônicas por idioma. Reexecutar sempre que rotas/conteúdo mudarem.
import { build } from "esbuild";
import { writeFileSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://www.cydef.com.br";
const LANGS = ["en", "pt", "es"];
const LAST_MOD = "2026-09-03";

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

const [{ pageSlugs }, { postsMetaByLang }, { courseDataPt }] = await Promise.all([
  load("src/lib/routes.ts"),
  load("src/lib/blog/posts.ts"),
  load("src/lib/courses.ts"),
]);

const urls = new Set();

for (const lang of LANGS) {
  urls.add(`/${lang}/`);
  for (const key of ["about", "ecosystem", "academy", "labs", "research", "blog", "contact", "privacy", "terms", "courses"]) {
    urls.add(`/${lang}/${pageSlugs[key][lang]}`);
  }
  // Slugs universais de artigos: iterar o meta DE CADA idioma (P3-01/F3: um
  // artigo pode existir só em PT até a tradução EN/ES chegar — não gerar URL
  // morta nos idiomas ainda não traduzidos).
  for (const post of postsMetaByLang[lang]) {
    urls.add(`/${lang}/${pageSlugs.blog[lang]}/${post.slug}`);
  }
  for (const courseId of Object.keys(courseDataPt)) {
    urls.add(`/${lang}/${pageSlugs.courses[lang]}/${courseId}`);
  }
  urls.add(`/${lang}/academy/gratuito`);
  // URL do Aviso de Privacidade VIGENTE (manter em sincronia com PRIVACY_VERSION em src/lib/config.ts).
  urls.add(`/${lang}/academy/privacidade/v2026.2`);
}

const sorted = [...urls].sort();
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sorted.map(
    (u) =>
      `  <url><loc>${ORIGIN}${u}</loc><changefreq>monthly</changefreq><lastmod>${LAST_MOD}</lastmod></url>`,
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
