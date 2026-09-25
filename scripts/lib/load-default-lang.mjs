// Carrega DEFAULT_LANG (src/i18n/index.ts) para os scripts de build.
//
// Fonte única: o mesmo módulo que o app usa para decidir o idioma padrão, o
// destino do `LangGate` (src/App.tsx) e, por consequência, a canônica da raiz
// pré-gravada no dist/index.html pelo scripts/postbuild.mjs (etapa 77).
// O build não repete o valor "en": uma canônica apontando para o idioma errado
// é silenciosa no código e só apareceria no Search Console, semanas depois.
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** @returns {Promise<string>} idioma padrão do site (ex.: "en") */
export async function loadDefaultLang() {
  const res = await esbuild.build({
    entryPoints: [path.join(ROOT, "src/i18n/index.ts")],
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    alias: { "@": path.join(ROOT, "src") },
    // O bundle CJS inicializa o i18next (react-i18next) e resolve os
    // dicionários; import.meta.env fica definido para qualquer módulo do grafo
    // que o leia (mesmo padrão do load-private-routes.mjs).
    define: { "import.meta.env": "{}" },
    logLevel: "silent",
  });
  const tmp = path.join(
    mkdtempSync(path.join(tmpdir(), "cydef-default-lang-")),
    "i18n.cjs",
  );
  writeFileSync(tmp, res.outputFiles[0].text, "utf8");
  const mod = await import(pathToFileURL(tmp).href);
  return mod.DEFAULT_LANG;
}
