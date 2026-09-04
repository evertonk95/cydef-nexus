// Gera src/lib/blog/posts-meta.generated.ts a partir do conteúdo REAL dos artigos
// (P3-01 code-splitting: meta leve no bundle inicial; corpo só na página do artigo).
// Uso: node scripts/gerar-posts-meta.mjs
// Guarda no CI: src/lib/blog/posts-meta.test.ts falha se o meta divergir do conteúdo.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild"); // dep transitiva do vite; se ausente: npm i -D esbuild

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const res = await esbuild.build({
  entryPoints: [path.join(root, "src/lib/blog/posts.content.ts")],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "node",
  alias: { "@": path.join(root, "src") },
  logLevel: "silent",
});

const code = res.outputFiles[0].text;
const mod = { exports: {} };
const fn = new Function("module", "exports", "require", code);
fn(mod, mod.exports, require);
const { blogPostsByLang } = mod.exports;

const langs = ["en", "pt", "es"];
const metaOf = (posts) =>
  posts.map(({ sections, sources, changelog, tags, toc, authorRole, ...meta }) => meta);

const out = [];
out.push("// GERADO AUTOMATICAMENTE por scripts/gerar-posts-meta.mjs — não editar manualmente.");
out.push("// Fonte: conteúdo real dos artigos (posts.ts / posts.en.ts / posts.es.ts / posts-extra.generated.ts).");
out.push("// Regenerar ao adicionar/alterar artigo. Guarda: src/lib/blog/posts-meta.test.ts (CI).");
out.push('import type { Lang } from "@/i18n";');
out.push('import type { BlogPostMeta } from "./posts";');
out.push("");
for (const l of langs) {
  const name = l === "en" ? "En" : l === "es" ? "Es" : "Pt";
  const arr = metaOf(blogPostsByLang[l]);
  out.push(
    `export const blogPosts${name}Meta: BlogPostMeta[] = ${JSON.stringify(arr, null, 2)};`,
  );
  out.push("");
}
out.push("export const blogPostsMetaByLang: Record<Lang, BlogPostMeta[]> = {");
out.push("  en: blogPostsEnMeta,");
out.push("  pt: blogPostsPtMeta,");
out.push("  es: blogPostsEsMeta,");
out.push("};");
out.push("");

writeFileSync(
  path.join(root, "src/lib/blog/posts-meta.generated.ts"),
  out.join("\n"),
  "utf8",
);
console.log(
  "OK —",
  langs
    .map((l) => `${l}: ${blogPostsByLang[l].length} posts`)
    .join(" · "),
);
