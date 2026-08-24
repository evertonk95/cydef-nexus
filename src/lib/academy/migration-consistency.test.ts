import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AVISOS, versaoVigente } from "./consent";

/**
 * Consistência SPA ↔ migração (HEL-M01): o conteúdo servido pela landing
 * (src/lib/academy/consent.ts) deve ser IDÊNTICO ao conteúdo semeado em
 * `supabase/migrations/0001_init.sql` (aviso_privacidade). O hash é computado
 * pelo trigger do banco a partir desse conteúdo — qualquer divergência
 * quebraria a equivalência hash == conteúdo servido.
 */

const SQL_PATH = join(process.cwd(), "supabase", "migrations", "0001_init.sql");

function lerSql(): string {
  return readFileSync(SQL_PATH, "utf8");
}

describe("consistência do Aviso de Privacidade (SPA ↔ SQL seed)", () => {
  it("conteúdo da versão vigente no SPA == conteúdo no seed da migração", () => {
    const sql = lerSql();

    const valores = sql.match(/values\s*\(([\s\S]*?)\)\s*on conflict/i)?.[1];
    expect(valores, "bloco de seed encontrado").toBeTruthy();

    const literais = [...(valores?.matchAll(/E'((?:[^'\\]|\\.)*)'/g) ?? [])].map((m) =>
      unescapeE(m[1]),
    );
    const conteudoSql = literais.join("");
    expect(conteudoSql.length).toBeGreaterThan(100);

    const textoSpa = AVISOS[versaoVigente()].texto;
    expect(conteudoSql).toBe(textoSpa);
  });

  it("migração declara a versão vigente como vigente=true com URL estável", () => {
    const sql = lerSql();
    expect(sql).toContain(`'${versaoVigente()}'`);
    expect(sql).toContain(AVISOS[versaoVigente()].urlEstavel);
    expect(sql).toContain("true");
  });

  it("migração define trigger de hash a partir do conteúdo (sem hash manual)", () => {
    const sql = lerSql();
    expect(sql).toContain("aviso_calcula_hash");
    expect(sql).toContain("encode(digest(new.conteudo, 'sha256'), 'hex')");
  });
});

function unescapeE(s: string): string {
  return s.replace(/\\(.)/g, (_, c: string) => {
    if (c === "n") return "\n";
    if (c === "t") return "\t";
    return c; // \' → ', \\ → \
  });
}
