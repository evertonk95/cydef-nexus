// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco } from "./banco";

/** Fase 19 (0030): Meu perfil. Só o nome é obrigatório; o e-mail não muda. */

let db: PGlite;

async function erroDe(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  return "";
}

async function rpc<T>(uid: string, sql: string, params: unknown[] = []): Promise<T> {
  const [r] = await como<{ r: T }>(db, "authenticated", `select ${sql} r`, params, uid);
  return r!.r;
}

const salvar = (uid: string, dados: Record<string, unknown>) =>
  rpc<Record<string, unknown>>(uid, `public.academy_salvar_meu_perfil($1::jsonb)`, [JSON.stringify(dados)]);

const COMPLETO = {
  nome: "Ana  Lima   Souza",
  data_nascimento: "1994-03-12",
  telefone: "+55 (61) 99999-0000",
  cidade: "Brasília",
  pais: "Brasil",
  empresa: "Empresa X",
  cargo: "Analista de SOC N1",
  area: "seguranca",
  experiencia: "1_3",
  bio: "Gosto de investigar alertas.\r\nEstudando para a CySA+.",
  linkedin: "https://www.linkedin.com/in/ana-lima",
};

beforeEach(async () => {
  db = await novoBanco();
}, 60_000);

describe("meu perfil", () => {
  it("começa só com nome e e-mail, salva tudo e devolve normalizado", async () => {
    const { userId } = await criarAluno(db, "ana@exemplo.com");
    const vazio = await rpc<Record<string, unknown>>(userId, `public.academy_meu_perfil()`);
    expect(vazio).toMatchObject({ email: "ana@exemplo.com", telefone: null, empresa: null, atualizado_em: null });

    const p = await salvar(userId, COMPLETO);
    expect(p).toMatchObject({
      nome: "Ana Lima Souza",
      email: "ana@exemplo.com",
      data_nascimento: "1994-03-12",
      telefone: "+55 (61) 99999-0000",
      area: "seguranca",
      experiencia: "1_3",
      bio: "Gosto de investigar alertas.\nEstudando para a CySA+.",
    });
    const [al] = (await db.query<{ nome: string }>(`select nome from public.alunos where user_id = $1`, [userId])).rows;
    expect(al!.nome).toBe("Ana Lima Souza");
  });

  it("campo vazio apaga o valor; o e-mail enviado é ignorado", async () => {
    const { userId } = await criarAluno(db, "ana@exemplo.com");
    await salvar(userId, COMPLETO);
    const p = await salvar(userId, { nome: "Ana Lima", empresa: "  ", telefone: "", email: "outro@exemplo.com" });
    expect(p).toMatchObject({ nome: "Ana Lima", empresa: null, telefone: null, cargo: null, email: "ana@exemplo.com" });
  });

  it.each([
    [{ nome: "A" }, "nome_invalido"],
    [{ nome: "Ana", telefone: "abc12345" }, "telefone_invalido"],
    [{ nome: "Ana", telefone: "1234567" }, "telefone_invalido"],
    [{ nome: "Ana", data_nascimento: "2020-01-01" }, "nascimento_invalido"],
    [{ nome: "Ana", data_nascimento: "1899-12-31" }, "nascimento_invalido"],
    [{ nome: "Ana", data_nascimento: "12/03/1994" }, "nascimento_invalido"],
    [{ nome: "Ana", data_nascimento: "1994-02-30" }, "nascimento_invalido"],
    [{ nome: "Ana", area: "hacker" }, "campo_invalido"],
    [{ nome: "Ana", experiencia: "20" }, "campo_invalido"],
    [{ nome: "Ana", linkedin: "https://evil.com/in/ana" }, "linkedin_invalido"],
    [{ nome: "Ana", linkedin: "javascript:alert(1)" }, "linkedin_invalido"],
    [{ nome: "Ana", bio: "x".repeat(601) }, "bio_invalida"],
    [{ nome: "Ana", empresa: "x".repeat(121) }, "campo_invalido"],
  ])("recusa %o com %s", async (dados, erro) => {
    const { userId } = await criarAluno(db, "ana@exemplo.com");
    expect(await erroDe(salvar(userId, dados))).toMatch(erro);
  });

  it("aceita quem tem exatamente 16 anos hoje", async () => {
    const { userId } = await criarAluno(db, "ana@exemplo.com");
    const [{ d }] = (await db.query<{ d: string }>(`select (current_date - interval '16 years')::date::text d`)).rows as [{ d: string }];
    expect(await salvar(userId, { nome: "Ana", data_nascimento: d })).toMatchObject({ data_nascimento: d });
  });

  it("cada aluno só vê e grava o próprio perfil; anon não chama nada", async () => {
    const ana = (await criarAluno(db, "ana@exemplo.com")).userId;
    const bia = (await criarAluno(db, "bia@exemplo.com")).userId;
    await salvar(ana, COMPLETO);
    expect(await rpc(bia, `public.academy_meu_perfil()`)).toMatchObject({ email: "bia@exemplo.com", empresa: null });
    expect(await erroDe(como(db, "authenticated", `select * from public.academy_perfis`, [], bia))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "authenticated", `select public.academy__salvar_perfil($1, '{"nome":"X Y"}'::jsonb)`, [ana], bia))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "anon", `select public.academy_meu_perfil()`))).toMatch(/permission denied/);
  });

  it("apagar a conta apaga o perfil", async () => {
    const { userId } = await criarAluno(db, "ana@exemplo.com");
    await salvar(userId, COMPLETO);
    await db.query(`delete from auth.users where id = $1`, [userId]);
    const r = await db.query(`select 1 from public.academy_perfis where user_id = $1`, [userId]);
    expect(r.rows).toHaveLength(0);
  });
});
