import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AVISOS, versaoVigente } from "./consent";

/**
 * Consistência SPA ↔ migração (HEL-M01): o conteúdo servido pela landing
 * (src/lib/academy/consent.ts) deve ser IDÊNTICO ao conteúdo semeado em
 * `supabase/migrations/*.sql` (tabela aviso_privacidade) para cada versão —
 * vigente e históricas. O hash é computado pelo trigger do banco a partir
 * desse conteúdo — qualquer divergência quebraria a equivalência
 * hash == conteúdo servido.
 */

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

function lerMigrations(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf8"));
}

function unescapeE(s: string): string {
  return s.replace(/\\(.)/g, (_, c: string) => {
    if (c === "n") return "\n";
    if (c === "t") return "\t";
    return c; // \' → ', \\ → \
  });
}

/**
 * Retorna o conteúdo semeado da versão: no arquivo de migração que contém a
 * URL estável da versão, extrai o trecho do INSERT em aviso_privacidade e
 * decodifica o literal E'...' do conteúdo.
 */
function conteudoSeedDaVersao(versao: string): { conteudo: string; arquivo: string } {
  const aviso = AVISOS[versao];
  for (const sql of lerMigrations()) {
    if (!sql.includes(aviso.urlEstavel)) continue;
    const arquivo = sql;
    const inicio = arquivo.indexOf("insert into public.aviso_privacidade");
    const fim = arquivo.indexOf("on conflict", inicio) + "on conflict".length;
    expect(inicio, `insert de ${versao} encontrado`).toBeGreaterThan(-1);
    expect(fim, `on conflict de ${versao} encontrado`).toBeGreaterThan(-1);
    const trecho = arquivo.slice(inicio, fim);
    const literais = [...trecho.matchAll(/E'((?:[^'\\]|\\.)*)'/g)].map((mm) => unescapeE(mm[1]));
    const conteudo = literais.join("");
    expect(conteudo.length).toBeGreaterThan(100);
    return { conteudo, arquivo: trecho };
  }
  throw new Error(`nenhuma migração semeia a URL estável de ${versao} (${aviso.urlEstavel})`);
}

describe("consistência do Aviso de Privacidade (SPA ↔ SQL seed)", () => {
  it("conteúdo de cada versão no SPA == conteúdo no seed da migração (vigente e histórico)", () => {
    for (const versao of Object.keys(AVISOS)) {
      const { conteudo } = conteudoSeedDaVersao(versao);
      expect(conteudo, `seed de ${versao}`).toBe(AVISOS[versao].texto);
    }
  });

  it("versão vigente é declarada vigente=true na migração que a semeia", () => {
    const { arquivo } = conteudoSeedDaVersao(versaoVigente());
    expect(arquivo).toMatch(/,\s*true\s*\)\s*on conflict/i);
  });

  it("toda versão tem URL estável imutável (versão embutida na URL)", () => {
    for (const [versao, aviso] of Object.entries(AVISOS)) {
      expect(aviso.urlEstavel).toBe(`/academy/privacidade/${versao}`);
    }
  });

  it("migrações definem trigger de hash a partir do conteúdo (sem hash manual)", () => {
    const todas = lerMigrations().join("\n");
    expect(todas).toContain("aviso_calcula_hash");
    expect(todas).toContain("encode(digest(new.conteudo, 'sha256'), 'hex')");
    expect(todas).toContain("aviso_conteudo_imutavel");
  });
});
