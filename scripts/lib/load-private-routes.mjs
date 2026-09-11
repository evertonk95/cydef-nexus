// Carrega a lista de rotas utilitárias/privadas da Academy
// (src/lib/private-routes.ts) para os scripts de build.
//
// Fonte única da lista: o módulo TS — o mesmo que o HeadSeo usa para decidir o
// noindex. O build não repete caminho nenhum (rota nova entra lá e já ganha
// index.html físico + pré-render).
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LANGS = ["en", "pt", "es"];

/** @returns {Promise<string[]>} caminhos com prefixo de idioma (ex.: "/pt/academy/entrar") */
export async function loadPrivateRoutes() {
  const res = await esbuild.build({
    entryPoints: [path.join(ROOT, "src/lib/private-routes.ts")],
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    alias: { "@": path.join(ROOT, "src") },
    // O módulo importa @/lib/academy/consent (sem env) mas o bundle pode puxar
    // @/lib/config: import.meta.env precisa existir no formato CJS.
    define: { "import.meta.env": "{}" },
    logLevel: "silent",
  });
  const tmp = path.join(
    mkdtempSync(path.join(tmpdir(), "cydef-private-routes-")),
    "private-routes.cjs",
  );
  writeFileSync(tmp, res.outputFiles[0].text, "utf8");
  const mod = await import(pathToFileURL(tmp).href);
  const routes = LANGS.flatMap((lang) => mod.privateRoutesForLang(lang));
  return [...new Set(routes)];
}
