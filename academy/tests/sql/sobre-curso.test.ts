// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo } from "./banco";

const CF = "cybersecurity-fundamentals";
const SOC = "fundamentos-para-soc";

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

interface Perfil {
  id: string | null;
  nome: string;
  cargo: string;
  bio: string;
  linkedin: string | null;
  da_equipe: boolean;
  eu: boolean;
}
interface Vinculo {
  papel: string;
  ordem: number;
  instrutor: Perfil;
}
interface Instrutores {
  do_curso: Vinculo[];
  disponiveis: Perfil[];
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  instrutor = (await criarAluno(db, "instrutor@exemplo.com")).userId;
  aluno = (await criarAluno(db, "aluno@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin'), ($2, 'instrutor')`, [admin, instrutor]);
  await db.query(`insert into public.academy_equipe_cursos (user_id, curso_slug) values ($1, $2)`, [instrutor, SOC]);
}, 60_000);

describe("sobre o curso e ementa", () => {
  it("instrutor salva objetivos, público e pré-requisitos do curso dele, e o aluno lê pelo catálogo", async () => {
    const c = await rpc<{ objetivos: string[]; publico: string }>(instrutor, `public.academy_adm_salvar_sobre($1, $2::jsonb)`, [
      SOC,
      JSON.stringify({ objetivos: ["Triar alertas no SIEM", "  ", "Escalar um incidente"], publico: "Quem quer entrar em SOC.", pre_requisitos: "Nenhum." }),
    ]);
    expect(c.objetivos).toEqual(["Triar alertas no SIEM", "Escalar um incidente"]);
    expect(c.publico).toBe("Quem quer entrar em SOC.");

    await db.query(`update public.cursos set publicado = true where slug = $1`, [SOC]);
    const [lido] = await como<{ objetivos: string[]; pre_requisitos: string }>(
      db,
      "authenticated",
      `select objetivos, pre_requisitos from public.cursos where slug = $1`,
      [SOC],
      aluno,
    );
    expect(lido).toEqual({ objetivos: ["Triar alertas no SIEM", "Escalar um incidente"], pre_requisitos: "Nenhum." });
  });

  it("recusa objetivo longo demais e mais de 10 objetivos", async () => {
    expect(await erroDe(rpc(admin, `public.academy_adm_salvar_sobre($1, $2::jsonb)`, [CF, JSON.stringify({ objetivos: ["x".repeat(201)] })]))).toContain(
      "objetivos_invalidos",
    );
    const onze = Array.from({ length: 11 }, (_, i) => `Objetivo ${i + 1}`);
    expect(await erroDe(rpc(admin, `public.academy_adm_salvar_sobre($1, $2::jsonb)`, [CF, JSON.stringify({ objetivos: onze })]))).toContain(
      "objetivos_invalidos",
    );
  });

  it("instrutor não edita o sobre de curso que não é dele; aluno não edita nada", async () => {
    expect(await erroDe(rpc(instrutor, `public.academy_adm_salvar_sobre($1, $2::jsonb)`, [CF, JSON.stringify({ publico: "x" })]))).toContain("sem_permissao");
    expect(await erroDe(rpc(aluno, `public.academy_adm_salvar_sobre($1, $2::jsonb)`, [SOC, JSON.stringify({ publico: "x" })]))).toContain("sem_permissao");
  });

  it("resumo do módulo (ementa) sai no painel e no catálogo", async () => {
    const [m] = (await db.query<{ id: string }>(`select id from public.modulos where curso_slug = $1 and ordem = 1`, [CF])).rows;
    const c = await rpc<{ modulos: { id: string; resumo: string; titulo: string }[] }>(admin, `public.academy_adm_editar_modulo($1, $2::jsonb)`, [
      m!.id,
      JSON.stringify({ resumo: "Tríade CID, risco e defesa em profundidade." }),
    ]);
    expect(c.modulos.find((x) => x.id === m!.id)!.resumo).toBe("Tríade CID, risco e defesa em profundidade.");
    const [lido] = await como<{ resumo: string }>(db, "authenticated", `select resumo from public.modulos where id = $1`, [m!.id], aluno);
    expect(lido!.resumo).toBe("Tríade CID, risco e defesa em profundidade.");
    expect(await erroDe(rpc(admin, `public.academy_adm_editar_modulo($1, $2::jsonb)`, [m!.id, JSON.stringify({ resumo: "x".repeat(401) })]))).toContain(
      "resumo_invalido",
    );
  });
});

describe("perfil e instrutores do curso", () => {
  it("membro da equipe cria e edita o próprio perfil; aluno não tem perfil de instrutor", async () => {
    const vazio = await rpc<Perfil>(instrutor, `public.academy_adm_meu_perfil()`);
    expect(vazio.id).toBeNull();
    const p = await rpc<Perfil>(instrutor, `public.academy_adm_salvar_meu_perfil($1::jsonb)`, [
      JSON.stringify({ nome: "Matheus Lima", cargo: "Analista de SOC", bio: "Seis anos em SOC.", linkedin: "https://www.linkedin.com/in/matheus" }),
    ]);
    expect(p).toMatchObject({ nome: "Matheus Lima", cargo: "Analista de SOC", da_equipe: true, eu: true });
    expect(await erroDe(rpc(instrutor, `public.academy_adm_salvar_meu_perfil($1::jsonb)`, [JSON.stringify({ linkedin: "https://evil.com/x" })]))).toContain(
      "linkedin_invalido",
    );
    expect(await erroDe(rpc(aluno, `public.academy_adm_meu_perfil()`))).toContain("sem_permissao");
  });

  it("instrutor convida um collab, ordena e o aluno vê só nome, cargo, bio e links", async () => {
    await rpc(instrutor, `public.academy_adm_salvar_meu_perfil($1::jsonb)`, [JSON.stringify({ nome: "Matheus Lima" })]);
    const lista0 = await rpc<Instrutores>(instrutor, `public.academy_adm_instrutores($1)`, [SOC]);
    const eu = lista0.disponiveis.find((p) => p.eu)!;
    await rpc(instrutor, `public.academy_adm_vincular_instrutor($1, $2, 'instrutor')`, [SOC, eu.id]);
    const lista = await rpc<Instrutores>(instrutor, `public.academy_adm_salvar_instrutor($1, null, $2::jsonb)`, [
      SOC,
      JSON.stringify({ nome: "Ana Convidada", cargo: "Threat Intel", bio: "Convidada do módulo 3." }),
    ]);
    expect(lista.do_curso.map((v) => [v.instrutor.nome, v.papel, v.ordem])).toEqual([
      ["Matheus Lima", "instrutor", 1],
      ["Ana Convidada", "convidado", 2],
    ]);
    const ana = lista.do_curso[1]!.instrutor;
    expect(ana.da_equipe).toBe(false);

    const movida = await rpc<Instrutores>(instrutor, `public.academy_adm_mover_instrutor($1, $2, -1)`, [SOC, ana.id]);
    expect(movida.do_curso.map((v) => v.instrutor.nome)).toEqual(["Ana Convidada", "Matheus Lima"]);

    // Curso publicado: o aluno lê pelo catálogo, sem user_id nem criado_por.
    await db.query(`update public.cursos set publicado = true where slug = $1`, [SOC]);
    const vistos = await como<{ nome: string; papel: string }>(
      db,
      "authenticated",
      `select i.nome, ci.papel from public.cursos_instrutores ci join public.instrutores i on i.id = ci.instrutor_id where ci.curso_slug = $1 order by ci.ordem`,
      [SOC],
      aluno,
    );
    expect(vistos).toEqual([
      { nome: "Ana Convidada", papel: "convidado" },
      { nome: "Matheus Lima", papel: "instrutor" },
    ]);
    expect(await erroDe(como(db, "authenticated", `select user_id from public.instrutores`, [], aluno))).toMatch(/permission denied/);
  });

  it("perfil de curso não publicado e perfil fora de curso ficam invisíveis para o aluno", async () => {
    await rpc(admin, `public.academy_adm_salvar_instrutor($1, null, $2::jsonb)`, [CF, JSON.stringify({ nome: "Convidado CF" })]);
    await db.query(`update public.cursos set publicado = false where slug = $1`, [CF]);
    const vistos = await como(db, "authenticated", `select nome from public.instrutores`, [], aluno);
    expect(vistos).toEqual([]);
  });

  it("instrutor não edita o perfil de outra pessoa da equipe nem convidado de outro curso", async () => {
    const pAdmin = await rpc<Perfil>(admin, `public.academy_adm_salvar_meu_perfil($1::jsonb)`, [JSON.stringify({ nome: "Everton" })]);
    await rpc(admin, `public.academy_adm_vincular_instrutor($1, $2, 'instrutor')`, [SOC, pAdmin.id]);
    expect(
      await erroDe(rpc(instrutor, `public.academy_adm_salvar_instrutor($1, $2, $3::jsonb)`, [SOC, pAdmin.id, JSON.stringify({ nome: "Outro nome" })])),
    ).toContain("sem_permissao");

    const cf = await rpc<Instrutores>(admin, `public.academy_adm_salvar_instrutor($1, null, $2::jsonb)`, [CF, JSON.stringify({ nome: "Convidado CF" })]);
    const convidado = cf.do_curso[0]!.instrutor;
    expect(
      await erroDe(rpc(instrutor, `public.academy_adm_salvar_instrutor($1, $2, $3::jsonb)`, [SOC, convidado.id, JSON.stringify({ nome: "Mudado" })])),
    ).toContain("sem_permissao");
    // O admin edita qualquer perfil.
    const ok = await rpc<Instrutores>(admin, `public.academy_adm_salvar_instrutor($1, $2, $3::jsonb)`, [CF, convidado.id, JSON.stringify({ cargo: "Pentester" })]);
    expect(ok.do_curso[0]!.instrutor.cargo).toBe("Pentester");
  });

  it("desvincular tira do curso e reordena; toda escrita vai para a auditoria", async () => {
    await rpc(admin, `public.academy_adm_salvar_instrutor($1, null, $2::jsonb)`, [CF, JSON.stringify({ nome: "Primeiro" })]);
    const l = await rpc<Instrutores>(admin, `public.academy_adm_salvar_instrutor($1, null, $2::jsonb)`, [CF, JSON.stringify({ nome: "Segundo" })]);
    const depois = await rpc<Instrutores>(admin, `public.academy_adm_desvincular_instrutor($1, $2)`, [CF, l.do_curso[0]!.instrutor.id]);
    expect(depois.do_curso.map((v) => [v.instrutor.nome, v.ordem])).toEqual([["Segundo", 1]]);
    expect(depois.disponiveis.map((p) => p.nome)).toContain("Primeiro");
    const acoes = (await db.query<{ acao: string }>(`select acao from public.academy_auditoria order by id`)).rows.map((r) => r.acao);
    expect(acoes).toEqual(["convidado_criado", "convidado_criado", "instrutor_desvinculado"]);
  });
});
