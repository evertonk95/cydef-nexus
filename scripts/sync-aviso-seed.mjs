/**
 * scripts/sync-aviso-seed.mjs
 *
 * Garante que o seed do Aviso de Privacidade na migração
 * `supabase/migrations/0001_init.sql` seja IDÊNTICO ao conteúdo servido pela
 * landing (`src/lib/academy/consent.ts`) — fonte única de verdade = consent.ts.
 *
 * Uso: node scripts/sync-aviso-seed.mjs [--check]
 *   sem flag: reescreve o bloco entre os marcadores AVISO_SEED_BEGIN/END;
 *   --check: apenas verifica (exit 1 se divergente) — usado no CI/typecheck.
 *
 * O hash é computado pelo trigger do banco a partir do conteúdo armazenado
 * (HEL-M01): conteúdo igual → hash igual ao da página servida.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AVISOS, versaoVigente } from "../src/lib/academy/consent.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATION = join(ROOT, "supabase", "migrations", "0001_init.sql");

function escaparE(s) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\t/g, "\\t").replace(/\n/g, "\\n");
}

function gerarSeed() {
  const versao = versaoVigente();
  const conteudo = AVISOS[versao].texto;
  return `insert into public.aviso_privacidade (versao, conteudo, url_estavel, vigente)
values (
  '${versao}',
  E'${escaparE(conteudo)}',
  '${AVISOS[versao].urlEstavel}',
  true
)
on conflict (versao) do nothing;`;
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const sql = readFileSync(MIGRATION, "utf8");
  const begin = ">>> AVISO_SEED_BEGIN";
  const end = ">>> AVISO_SEED_END";
  const start = sql.indexOf(begin);
  const stop = sql.indexOf(end);
  if (start === -1 || stop === -1) {
    console.error(`marcadores ${begin}/${end} não encontrados em ${MIGRATION}`);
    process.exit(2);
  }
  const prefixo = sql.slice(0, start + begin.length);
  const sufixo = sql.slice(stop);
  const novoBloco = `\n${gerarSeed()}\n`;
  const novo = `${prefixo}${novoBloco}${sufixo}`;

  if (novo === sql) {
    console.log("aviso seed em sincronia ✓");
    process.exit(0);
  }
  if (checkOnly) {
    console.error(
      "aviso seed DIVERGENTE — rode `node scripts/sync-aviso-seed.mjs` (SPA ↔ migração, HEL-M01)",
    );
    process.exit(1);
  }
  writeFileSync(MIGRATION, novo);
  console.log("aviso seed atualizado ✓ (rode novamente com --check para confirmar)");
}

main();
