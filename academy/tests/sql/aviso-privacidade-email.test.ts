// @vitest-environment node
/** Fase 27 (0039): e-mail de nova versão do Aviso de Privacidade, uma vez por conta e por versão. */
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco } from "./banco";

let db: PGlite;

interface Aviso {
  chave: string;
  email: string;
  nome: string;
  versao: string;
  url: string;
  resumo: string;
}

async function erroDe(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  return "";
}
async function servico<T>(sql: string, params: unknown[] = []): Promise<T> {
  const [r] = await como<{ r: T }>(db, "service_role", `select ${sql} r`, params);
  return r!.r;
}
const avisos = (limite = 40) => servico<Aviso[]>(`public.academy_avisos_privacidade($1)`, [limite]);
const registrar = (itens: unknown[]) => servico<number>(`public.academy_avisos_registrar($1::jsonb)`, [JSON.stringify(itens)]);

/** Conta criada antes (ou depois) da publicação da versão vigente. */
async function conta(email: string, quando: "antes" | "depois"): Promise<string> {
  const { userId } = await criarAluno(db, email);
  await db.query(`update public.alunos set criado_em = now() ${quando === "antes" ? "-" : "+"} interval '10 days' where user_id = $1`, [userId]);
  return userId;
}

beforeEach(async () => {
  db = await novoBanco();
}, 60_000);

describe("aviso de nova versão do Aviso de Privacidade (0039)", () => {
  it("a v2026.9 vigente já tem o resumo do que mudou, com os itens 2.3 e 2.8", async () => {
    const r = await db.query<{ versao: string; resumo: string; vigente: boolean }>(
      `select c.versao, c.resumo, v.vigente from public.aviso_privacidade_comunicado c join public.aviso_privacidade v using (versao)`,
    );
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0]).toMatchObject({ versao: "v2026.9", vigente: true });
    expect(r.rows[0]!.resumo.split("\n")).toHaveLength(2);
    expect(r.rows[0]!.resumo).toContain("(item 2.3)");
    expect(r.rows[0]!.resumo).toContain("(item 2.8)");
  });

  it("vai para quem tinha conta antes da versão, uma vez só; quem entrou depois não recebe", async () => {
    await conta("ana@exemplo.com", "antes");
    await conta("Bia@Exemplo.com", "antes");
    await conta("caio@exemplo.com", "depois");
    let lista = await avisos();
    expect(lista.map((a) => a.email).sort()).toEqual(["ana@exemplo.com", "bia@exemplo.com"]);
    expect(lista[0]).toMatchObject({ chave: "privacidade:v2026.9", versao: "v2026.9", url: "/academy/privacidade/v2026.9", nome: "Ana Teste" });

    expect(await registrar([{ chave: "privacidade:v2026.9", email: "ana@exemplo.com" }])).toBe(1);
    lista = await avisos();
    expect(lista.map((a) => a.email)).toEqual(["bia@exemplo.com"]);
    expect((await avisos(1)).length).toBe(1);
    expect(await avisos(0)).toEqual([]);
  });

  it("versão sem resumo cadastrado não gera e-mail", async () => {
    await conta("ana@exemplo.com", "antes");
    await db.query(`delete from public.aviso_privacidade_comunicado`);
    expect(await avisos()).toEqual([]);
  });

  it("registrar aceita só a chave privacidade:<versão> no formato certo", async () => {
    expect(await registrar([{ chave: "privacidade:v2026.10", email: "x@exemplo.com" }])).toBe(1);
    expect(await registrar([{ chave: "privacidade:2026.9", email: "x@exemplo.com" }])).toBe(0);
    expect(await registrar([{ chave: "privacidade:v2026.9; drop", email: "x@exemplo.com" }])).toBe(0);
  });

  it("fica fechado para o aluno: a função e a tabela do resumo", async () => {
    const id = await conta("ana@exemplo.com", "antes");
    expect(await erroDe(como(db, "authenticated", `select public.academy_avisos_privacidade(10)`, [], id))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "authenticated", `select * from public.aviso_privacidade_comunicado`, [], id))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "anon", `select public.academy_avisos_privacidade(10)`, []))).toMatch(/permission denied/);
  });
});
