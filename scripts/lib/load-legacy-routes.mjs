// Carrega os slugs antigos que redirecionam (src/lib/routes.ts: legacyPageSlugs)
// para o postbuild gravar uma página de redirecionamento física em cada URL
// antiga. Fonte única: o módulo TS, o mesmo que o PageRouter usa no cliente.
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** @returns {Promise<{ from: string, to: string }[]>} caminhos com barra final */
export async function loadLegacyRoutes() {
  const res = await esbuild.build({
    entryPoints: [path.join(ROOT, "src/lib/routes.ts")],
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    alias: { "@": path.join(ROOT, "src") },
    logLevel: "silent",
  });
  const tmp = path.join(
    mkdtempSync(path.join(tmpdir(), "cydef-legacy-routes-")),
    "routes.cjs",
  );
  writeFileSync(tmp, res.outputFiles[0].text, "utf8");
  const { legacyPageSlugs, legacyCoursePaths, contentAreaSlugs, pageSlugs, withTrailingSlash } = await import(
    pathToFileURL(tmp).href
  );
  const out = [];
  for (const [lang, map] of Object.entries(legacyPageSlugs)) {
    for (const [slug, key] of Object.entries(map)) {
      out.push({
        from: withTrailingSlash(`/${lang}/${slug}`),
        to: withTrailingSlash(`/${lang}/${pageSlugs[key][lang]}`),
      });
    }
  }
  // Páginas de curso removidas (legacyCoursePaths), nos três idiomas.
  for (const lang of Object.keys(legacyPageSlugs)) {
    for (const [id, destino] of Object.entries(legacyCoursePaths)) {
      out.push({
        from: withTrailingSlash(`/${lang}/${contentAreaSlugs.courses[lang]}/${id}`),
        to: withTrailingSlash(`/${lang}${destino}`),
      });
    }
  }
  // Cursos da Academy (fase 14): são em português, a página fica só em
  // /pt/cursos/<slug>. Em en/es o endereço (que já esteve no sitemap) vira
  // página de redirecionamento para a versão em pt.
  const meta = await esbuild.build({
    entryPoints: [path.join(ROOT, "src/lib/academy/catalogo-meta.ts")],
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    alias: { "@": path.join(ROOT, "src") },
    logLevel: "silent",
  });
  const tmpMeta = path.join(mkdtempSync(path.join(tmpdir(), "cydef-catalogo-")), "meta.cjs");
  writeFileSync(tmpMeta, meta.outputFiles[0].text, "utf8");
  const { cursosMeta, IDIOMA_DOS_CURSOS } = await import(pathToFileURL(tmpMeta).href);
  for (const lang of Object.keys(legacyPageSlugs)) {
    if (lang === IDIOMA_DOS_CURSOS) continue;
    for (const { slug } of cursosMeta) {
      if (legacyCoursePaths[slug]) continue;
      out.push({
        from: withTrailingSlash(`/${lang}/${contentAreaSlugs.courses[lang]}/${slug}`),
        to: withTrailingSlash(`/${IDIOMA_DOS_CURSOS}/${contentAreaSlugs.courses[IDIOMA_DOS_CURSOS]}/${slug}`),
      });
    }
  }
  return out;
}
