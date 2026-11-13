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
  const { legacyPageSlugs, pageSlugs, withTrailingSlash } = await import(
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
  return out;
}
