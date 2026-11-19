// Carrega as páginas de redirecionamento do Aviso de Privacidade
// (src/lib/academy/avisoRedirects.ts + AVISOS de consent.ts) para o build.
//
// Mesmo padrão de scripts/lib/load-private-routes.mjs: o CI roda Node 22, que
// não importa .ts direto, então o módulo TS é empacotado com esbuild (já é
// dependência do build) e importado como CJS.
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** @returns {Promise<Array<{versao:string,urlEstavel:string,destino:string,arquivo:string,html:string}>>} */
export async function loadAvisoRedirects() {
  const res = await esbuild.build({
    stdin: {
      contents: [
        'export { AVISOS } from "./src/lib/academy/consent";',
        'export { paginasDeRedirecionamento } from "./src/lib/academy/avisoRedirects";',
      ].join("\n"),
      resolveDir: ROOT,
      loader: "ts",
    },
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    alias: { "@": path.join(ROOT, "src") },
    define: { "import.meta.env": "{}" },
    logLevel: "silent",
  });

  const tmp = path.join(
    mkdtempSync(path.join(tmpdir(), "cydef-aviso-redirects-")),
    "aviso-redirects.cjs",
  );
  writeFileSync(tmp, res.outputFiles[0].text, "utf8");
  const mod = await import(pathToFileURL(tmp).href);

  const avisos = Object.entries(mod.AVISOS).map(([versao, aviso]) => ({
    versao,
    urlEstavel: aviso.urlEstavel,
  }));
  return mod.paginasDeRedirecionamento(avisos);
}
