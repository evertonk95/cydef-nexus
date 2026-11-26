// @vitest-environment node
/** Fase 26 (0038): avaliação final montada pelo instrutor, além do sorteio. */
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo } from "./banco";

const CURSO = "cybersecurity-fundamentals";

let db: PGlite;
let aluno: string;
let admin: string;

interface Questao {
  id: string;
  enunciado: string;
  alternativas: { id: string; texto: string }[];
}

async function erroDe(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  return "";
}

async function rpc<T>(sql: string, params: unknown[] = [], uid: string | null = aluno): Promise<T> {
  const [r] = await como<{ r: T }>(db, "authenticated", `select ${sql} r`, params, uid);
  return r!.r;
}

async function modulos(): Promise<{ id: string; ordem: number }[]> {
  return (await db.query<{ id: string; ordem: number }>(`select id, ordem from public.modulos where curso_slug = $1 order by ordem`, [CURSO])).rows;
}

async function todasAsAulas(): Promise<string[]> {
  return (
    await db.query<{ id: string }>(
      `select a.id from public.aulas a join public.modulos m on m.id = a.modulo_id where m.curso_slug = $1 order by m.ordem, a.ordem`,
      [CURSO],
    )
  ).rows.map((r) => r.id);
}

/** Cria uma questão publicada com 4 alternativas; a primeira é a correta. */
async function criarQuestao(moduloId: string | null, n: number): Promise<string> {
  const [{ id }] = (
    await db.query<{ id: string }>(
      `insert into public.questoes (curso_slug, modulo_id, enunciado, explicacao, publicado)
       values ($1, $2, $3, $4, true) returning id`,
      [CURSO, moduloId, `Enunciado da questão número ${n}`, `Explicação da questão ${n}`],
    )
  ).rows as [{ id: string }];
  for (let i = 1; i <= 4; i++) {
    await db.query(`insert into public.questoes_alternativas (questao_id, ordem, texto, correta) values ($1, $2, $3, $4)`, [
      id,
      i,
      i === 1 ? `certa ${n}` : `errada ${n}.${i}`,
      i === 1,
    ]);
  }
  return id;
}

/** Monta respostas acertando as primeiras `acertos` questões. */
async function responder(questoes: Questao[], acertos: number) {
  return questoes.map((q, i) => {
    const certa = q.alternativas.find((a) => a.texto.startsWith("certa"))!;
    const errada = q.alternativas.find((a) => a.texto.startsWith("errada"))!;
    return { questao: q.id, alternativa: (i < acertos ? certa : errada).id };
  });
}

async function concluirAula(aulaId: string) {
  return rpc(`public.academy_registrar_progresso($1, 30, true)`, [aulaId]);
}

/** Aprova o módulo 1 (5 questões) e conclui todas as aulas do curso. */
async function cumprirAulasEModulos(m1: string) {
  const q = await rpc<{ questoes: Questao[] }>(`public.academy_questoes_modulo($1)`, [m1]);
  await rpc(`public.academy_responder_modulo($1, $2::jsonb)`, [m1, JSON.stringify(await responder(q.questoes, 5))]);
  for (const a of await todasAsAulas()) await concluirAula(a);
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  aluno = (await criarAluno(db, `aluno${Math.random()}@x.com`)).userId;
  admin = (await criarAluno(db, `admin${Math.random()}@x.com`)).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin')`, [admin]);
  await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], aluno);
}, 60_000);

const DEFINIR = `public.academy_adm_definir_prova_final($1, $2::uuid[], $3)`;
interface ProvaAdm {
  modo: "sorteio" | "fixa";
  questoes: string[];
  validas: number;
}

async function prepararAluno() {
  const [, m1] = await modulos();
  for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
  await cumprirAulasEModulos(m1!.id);
  return m1!.id;
}

async function modoFixa() {
  await rpc(`public.academy_adm_salvar_requisitos($1, $2::jsonb)`, [CURSO, JSON.stringify({ final_modo: "fixa" })], admin);
}

describe("prova montada pelo instrutor (0038)", () => {
  it("todo curso começa em sorteio, como antes", async () => {
    const r = await db.query<{ final_modo: string }>(`select distinct final_modo from public.cursos_requisitos`);
    expect(r.rows).toEqual([{ final_modo: "sorteio" }]);
    expect((await rpc<ProvaAdm>(`public.academy_adm_prova_final($1)`, [CURSO], admin)).modo).toBe("sorteio");
  });

  it("no modo fixa, todo aluno recebe só as escolhidas, embaralhadas, e basta uma para abrir", async () => {
    await prepararAluno();
    const banco: string[] = [];
    for (let i = 1; i <= 25; i++) banco.push(await criarQuestao(null, 100 + i));
    await modoFixa();
    let sit = await rpc<{ final: { situacao: string }; requisitos: { final_modo: string; questoes_final: number } }>(`public.academy_situacao_curso($1)`, [CURSO]);
    expect(sit.final.situacao).toBe("sem_banco");
    expect(sit.requisitos.final_modo).toBe("fixa");

    const escolhidas = banco.slice(0, 8);
    const adm = await rpc<ProvaAdm>(DEFINIR, [CURSO, escolhidas, true], admin);
    expect(adm).toMatchObject({ modo: "fixa", validas: 8 });
    expect(adm.questoes).toEqual(escolhidas);

    sit = await rpc(`public.academy_situacao_curso($1)`, [CURSO]);
    expect(sit.final.situacao).toBe("disponivel");
    expect(sit.requisitos.questoes_final).toBe(8);

    const ordens = new Set<string>();
    for (let t = 0; t < 6; t++) {
      const p = await rpc<{ prova_id: string; questoes: Questao[] }>(`public.academy_iniciar_final($1)`, [CURSO]);
      expect(p.questoes.map((q) => q.id).sort()).toEqual([...escolhidas].sort());
      ordens.add(p.questoes.map((q) => q.id).join());
      await db.query(`delete from public.provas_finais where id = $1`, [p.prova_id]);
    }
    expect(ordens.size).toBeGreaterThan(1);
  });

  it("questão despublicada sai da prova do aluno; tirar da prova também", async () => {
    await prepararAluno();
    const banco: string[] = [];
    for (let i = 1; i <= 4; i++) banco.push(await criarQuestao(null, 200 + i));
    await modoFixa();
    await rpc(DEFINIR, [CURSO, banco, true], admin);
    await db.query(`update public.questoes set publicado = false where id = $1`, [banco[0]]);
    const tirada = await rpc<ProvaAdm>(DEFINIR, [CURSO, [banco[1]], false], admin);
    expect(tirada.questoes).toEqual([banco[0], banco[2], banco[3]]);
    expect(tirada.validas).toBe(2);
    const p = await rpc<{ questoes: Questao[] }>(`public.academy_iniciar_final($1)`, [CURSO]);
    expect(p.questoes.map((q) => q.id).sort()).toEqual([banco[2], banco[3]].sort());
    const au = await db.query(`select acao from public.academy_auditoria where acao like 'prova_final_%' order by criado_em`);
    expect(au.rows.map((r) => (r as { acao: string }).acao)).toEqual(["prova_final_incluidas", "prova_final_retiradas"]);
  });

  it("voltar para sorteio usa o banco inteiro de novo, sem perder as escolhidas", async () => {
    await prepararAluno();
    const banco: string[] = [];
    for (let i = 1; i <= 20; i++) banco.push(await criarQuestao(null, 300 + i));
    await modoFixa();
    await rpc(DEFINIR, [CURSO, banco.slice(0, 3), true], admin);
    await rpc(`public.academy_adm_salvar_requisitos($1, $2::jsonb)`, [CURSO, JSON.stringify({ final_modo: "sorteio" })], admin);
    const p = await rpc<{ questoes: Questao[] }>(`public.academy_iniciar_final($1)`, [CURSO]);
    expect(p.questoes).toHaveLength(20);
    expect((await rpc<ProvaAdm>(`public.academy_adm_prova_final($1)`, [CURSO], admin)).questoes).toHaveLength(3);
  });

  it("recusa questão de módulo, de outro curso, modo inválido e quem não cuida do curso", async () => {
    const [, m1] = await modulos();
    const deModulo = await criarQuestao(m1!.id, 1);
    const final = await criarQuestao(null, 2);
    const outro = (
      await db.query<{ id: string }>(`insert into public.questoes (curso_slug, modulo_id, enunciado) values ('fundamentos-para-soc', null, 'Questão de outro curso?') returning id`)
    ).rows[0]!.id;
    expect(await erroDe(rpc(DEFINIR, [CURSO, [deModulo], true], admin))).toMatch(/questao_inexistente/);
    expect(await erroDe(rpc(DEFINIR, [CURSO, [outro], true], admin))).toMatch(/questao_inexistente/);
    expect(await erroDe(rpc(DEFINIR, [CURSO, [], true], admin))).toMatch(/invalid_payload/);
    expect(await erroDe(rpc(`public.academy_adm_salvar_requisitos($1, $2::jsonb)`, [CURSO, JSON.stringify({ final_modo: "manual" })], admin))).toMatch(
      /requisitos_invalidos/,
    );
    expect(await erroDe(rpc(DEFINIR, [CURSO, [final], true], aluno))).toMatch(/sem_permissao/);
    expect(await erroDe(rpc(`public.academy_adm_prova_final($1)`, [CURSO], aluno))).toMatch(/sem_permissao/);
    expect((await db.query(`select 1 from public.cursos_prova_final`)).rows).toHaveLength(0);
  });

  it("a tabela das escolhidas fica fechada para o aluno", async () => {
    expect(await erroDe(como(db, "authenticated", `select * from public.cursos_prova_final`, [], aluno))).toMatch(/permission denied/);
  });
});
