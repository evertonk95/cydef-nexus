// Grava a cópia do catálogo da Academy usada no build (fase 14).
// Uso: node scripts/gen-catalogo-academy.mjs  (roda no prebuild, antes do sitemap)
//
// Com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente (deploy), lê a
// função pública do banco e regrava:
//   src/lib/academy/catalogo-snapshot.json  catálogo completo (páginas da Academy)
//   src/lib/academy/catalogo-meta.json      só o que a home, o og e o sitemap usam
// Sem as variáveis (máquina local, CI de PR), mantém a cópia do repositório.
//
// CATALOGO_OBRIGATORIO=1 (deploy): se o banco não responder, o build para. Um
// site publicado sem os cursos tiraria do ar as páginas que o Google já indexou.
// A exceção é a função ainda não existir (HTTP 404: deploy que sai antes do
// db push da 0020): o build segue com a cópia do repositório, e a verificação
// de hora em hora publica de novo quando a função responder.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buscarCatalogo, metaCatalogo, validarCatalogo, versaoCatalogo } from "./lib/catalogo-academy.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = join(ROOT, "src/lib/academy/catalogo-snapshot.json");
const META = join(ROOT, "src/lib/academy/catalogo-meta.json");

const url = process.env.VITE_SUPABASE_URL;
const chave = process.env.VITE_SUPABASE_ANON_KEY;
const obrigatorio = process.env.CATALOGO_OBRIGATORIO === "1";

const gravar = (c) => {
  writeFileSync(SNAPSHOT, `${JSON.stringify(c, null, 2)}\n`);
  writeFileSync(META, `${JSON.stringify(metaCatalogo(c), null, 2)}\n`);
};

if (!url || !chave) {
  if (obrigatorio) {
    console.error("catalogo: CATALOGO_OBRIGATORIO=1 sem VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY.");
    process.exit(1);
  }
  const atual = validarCatalogo(JSON.parse(readFileSync(SNAPSHOT, "utf8")));
  // A meta sai sempre da cópia completa: as duas nunca divergem.
  writeFileSync(META, `${JSON.stringify(metaCatalogo(atual), null, 2)}\n`);
  console.log(`catalogo: sem acesso ao banco neste ambiente, usando a cópia do repositório (${atual.cursos.length} cursos).`);
} else {
  try {
    const c = await buscarCatalogo({ url, chave });
    gravar(c);
    console.log(`catalogo: ${c.cursos.length} cursos, ${c.trilhas.length} trilhas, versão ${versaoCatalogo(c).slice(0, 12)}.`);
  } catch (e) {
    if (obrigatorio && !e.funcaoAusente) {
      console.error(`catalogo: falha ao ler o banco, build interrompido. ${e.message}`);
      process.exit(1);
    }
    console.warn(`catalogo: falha ao ler o banco, usando a cópia do repositório. ${e.message}`);
  }
}
