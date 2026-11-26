// @vitest-environment node
/** Fase 24 (0037): publicar ou voltar para rascunho várias questões de uma vez. */
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo } from "./banco";

const CF = "cybersecurity-fundamentals";
const SOC = "fundamentos-para-soc";
const PUBLICAR = `public.academy_adm_publicar_questoes($1, $2::uuid[], $3)`;

let db: PGlite;
let admin: string;
let instrutor: string;
let aluno: string;

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

interface Resultado {
  alteradas: number;
  ignoradas: string[];
  questoes: { id: string; publicado: boolean }[];
}

async function criarQuestoes(slug: string, n: number): Promise<string[]> {
  const m = (await db.query<{ id: string }>(`select id from public.modulos where curso_slug = $1 order by ordem desc limit 1`, [slug])).rows[0]!.id;
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const q = (
      await db.query<{ id: string }>(`insert into public.questoes (curso_slug, modulo_id, enunciado) values ($1, $2, $3) returning id`, [
        slug,
        m,
        `Questão de teste número ${i + 1}?`,
      ])
    ).rows[0]!.id;
    await db.query(`insert into public.questoes_alternativas (questao_id, ordem, texto, correta) values ($1, 1, 'Certa', true), ($1, 2, 'Errada', false)`, [q]);
    ids.push(q);
  }
  return ids;
}

const publicadas = async (ids: string[]) =>
  (await db.query<{ n: number }>(`select count(*)::int n from public.questoes where id = any($1::uuid[]) and publicado`, [ids])).rows[0]!.n;

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  instrutor = (await criarAluno(db, "instrutor@exemplo.com")).userId;
  aluno = (await criarAluno(db, "aluno@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin'), ($2, 'instrutor')`, [admin, instrutor]);
  await db.query(`insert into public.academy_equipe_cursos (user_id, curso_slug) values ($1, $2)`, [instrutor, SOC]);
}, 60_000);

describe("publicar questões em lote (0037)", () => {
  it("publica todas de uma vez, devolve a lista nova e grava uma linha de auditoria", async () => {
    const ids = await criarQuestoes(CF, 16);
    const r = await rpc<Resultado>(admin, PUBLICAR, [CF, ids, true]);
    expect(r.alteradas).toBe(16);
    expect(r.ignoradas).toEqual([]);
    expect(r.questoes.filter((q) => ids.includes(q.id)).every((q) => q.publicado)).toBe(true);
    expect(await publicadas(ids)).toBe(16);
    const au = await db.query<{ alvo: string; detalhes: { questoes: string[] } }>(`select alvo, detalhes from public.academy_auditoria where acao = 'questoes_publicadas'`);
    expect(au.rows).toHaveLength(1);
    expect(au.rows[0]!.alvo).toBe(CF);
    expect(au.rows[0]!.detalhes.questoes).toHaveLength(16);
  });

  it("questão sem alternativa correta fica em rascunho e volta em ignoradas, sem derrubar as outras", async () => {
    const ids = await criarQuestoes(CF, 3);
    await db.query(`update public.questoes_alternativas set correta = false where questao_id = $1`, [ids[1]]);
    const r = await rpc<Resultado>(admin, PUBLICAR, [CF, ids, true]);
    expect(r.alteradas).toBe(2);
    expect(r.ignoradas).toEqual([ids[1]]);
    expect(await publicadas(ids)).toBe(2);
  });

  it("volta várias para rascunho", async () => {
    const ids = await criarQuestoes(CF, 4);
    await rpc(admin, PUBLICAR, [CF, ids, true]);
    const r = await rpc<Resultado>(admin, PUBLICAR, [CF, ids.slice(0, 3), false]);
    expect(r.alteradas).toBe(3);
    expect(await publicadas(ids)).toBe(1);
    expect((await db.query(`select 1 from public.academy_auditoria where acao = 'questoes_despublicadas'`)).rows).toHaveLength(1);
  });

  it("instrutor publica no curso dele e não no dos outros; aluno não publica", async () => {
    const soc = await criarQuestoes(SOC, 2);
    const cf = await criarQuestoes(CF, 2);
    expect((await rpc<Resultado>(instrutor, PUBLICAR, [SOC, soc, true])).alteradas).toBe(2);
    expect(await erroDe(rpc(instrutor, PUBLICAR, [CF, cf, true]))).toMatch(/sem_permissao/);
    expect(await erroDe(rpc(aluno, PUBLICAR, [CF, cf, true]))).toMatch(/sem_permissao/);
    expect(await publicadas(cf)).toBe(0);
  });

  it("recusa questão de outro curso, lista vazia e lista grande demais", async () => {
    const soc = await criarQuestoes(SOC, 1);
    const cf = await criarQuestoes(CF, 1);
    expect(await erroDe(rpc(admin, PUBLICAR, [CF, [...cf, ...soc], true]))).toMatch(/questao_inexistente/);
    expect(await erroDe(rpc(admin, PUBLICAR, [CF, [], true]))).toMatch(/invalid_payload/);
    expect(await erroDe(rpc(admin, PUBLICAR, [CF, Array(201).fill(cf[0]), true]))).toMatch(/invalid_payload/);
    expect(await publicadas([...cf, ...soc])).toBe(0);
  });
});
