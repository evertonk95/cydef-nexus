/**
 * scripts/sync-aviso-seed.mjs
 *
 * Confere se o seed da versão VIGENTE do Aviso de Privacidade é IDÊNTICO ao
 * conteúdo servido pela landing (`src/lib/academy/consent.ts`, fonte única de
 * verdade).
 *
 * Cada versão é semeada na migração que contém a sua URL estável
 * (`/academy/privacidade/<versão>`): v2026.1 na 0001, v2026.2 na 0006, e assim
 * por diante. O script procura essa migração e compara o bloco
 * `insert into public.aviso_privacidade ... on conflict (versao) do nothing;`
 * com o que seria gerado a partir de consent.ts.
 *
 * Uso: node scripts/sync-aviso-seed.mjs [--check]
 *   --check: só verifica (exit 1 se divergente).
 *   sem flag: se não houver migração para a versão vigente, imprime o bloco
 *             para criar uma migração nova. Nunca reescreve migração existente:
 *             migração aplicada é imutável (HEL-M01), e texto novo exige
 *             versão nova.
 *
 * O hash é computado pelo trigger do banco a partir do conteúdo armazenado:
 * conteúdo igual, hash igual ao da página servida.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AVISOS, versaoVigente } from "../src/lib/academy/consent.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PASTA = join(ROOT, "supabase", "migrations");

function escaparE(s) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\t/g, "\\t").replace(/\n/g, "\\n");
}

function gerarSeed(versao) {
  const aviso = AVISOS[versao];
  return `insert into public.aviso_privacidade (versao, conteudo, url_estavel, vigente)
values (
  '${versao}',
  E'${escaparE(aviso.texto)}',
  '${aviso.urlEstavel}',
  true
)
on conflict (versao) do nothing;`;
}

function blocoDaMigracao(sql, url) {
  const inicio = sql.lastIndexOf("insert into public.aviso_privacidade", sql.indexOf(url));
  const marca = "on conflict (versao) do nothing;";
  const fim = sql.indexOf(marca, inicio);
  if (inicio === -1 || fim === -1) return null;
  return sql.slice(inicio, fim + marca.length);
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const versao = versaoVigente();
  const url = AVISOS[versao].urlEstavel;
  const esperado = gerarSeed(versao);

  const arquivos = readdirSync(PASTA).filter((f) => f.endsWith(".sql")).sort();
  const alvo = arquivos.find((f) => readFileSync(join(PASTA, f), "utf8").includes(url));

  if (!alvo) {
    if (checkOnly) {
      console.error(`nenhuma migração semeia ${versao} (${url})`);
      process.exit(1);
    }
    console.log(`Crie uma migração nova para ${versao} com este bloco:\n\n${esperado}\n`);
    process.exit(0);
  }

  const atual = blocoDaMigracao(readFileSync(join(PASTA, alvo), "utf8"), url);
  if (atual === esperado) {
    console.log(`aviso ${versao} em sincronia com ${alvo} ✓`);
    process.exit(0);
  }
  console.error(
    `aviso ${versao} DIVERGENTE entre consent.ts e ${alvo}. Migração aplicada não muda (HEL-M01): ` +
      "se o texto mudou, crie uma versão nova em consent.ts e uma migração nova.",
  );
  process.exit(1);
}

main();
