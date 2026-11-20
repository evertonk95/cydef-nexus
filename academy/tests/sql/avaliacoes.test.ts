// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, PASTA_MIGRACOES, publicarCatalogo } from "./banco";

const CURSO = "cybersecurity-fundamentals";

let db: PGlite;
let aluno: string;

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

async function aulasDoModulo(moduloId: string): Promise<string[]> {
  return (await db.query<{ id: string }>(`select id from public.aulas where modulo_id = $1 order by ordem`, [moduloId])).rows.map((r) => r.id);
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
  await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], aluno);
});

describe("requisitos por curso (0013)", () => {
  it("os dois cursos gratuitos entram com os mesmos requisitos decididos", async () => {
    const r = await db.query(
      `select * from public.cursos_requisitos where curso_slug in ('cybersecurity-fundamentals', 'fundamentos-para-soc') order by curso_slug`,
    );
    expect(r.rows).toHaveLength(2);
    const carga = (r.rows as Record<string, unknown>[]).map((x) => [x.curso_slug, x.carga_horaria_h === null ? null : Number(x.carga_horaria_h)]);
    expect(carga).toEqual([
      ["cybersecurity-fundamentals", 6],
      ["fundamentos-para-soc", null],
    ]);
    for (const row of r.rows as Record<string, unknown>[]) {
      expect(row).toMatchObject({
        exige_todas_aulas: true,
        exige_modulos: true,
        nota_minima_modulo: 70,
        questoes_modulo: 5,
        nota_minima_final: 80,
        questoes_final: 20,
        espera_final_horas: 24,
        tentativas_final_max: null,
        certificado_ativo: true,
      });
    }
  });

  it("rodar a 0013 de novo não muda nada", async () => {
    const { readFileSync } = await import("node:fs");
    await db.query(`update public.cursos_requisitos set carga_horaria_h = 7 where curso_slug = $1`, [CURSO]);
    await db.exec(readFileSync(`${PASTA_MIGRACOES}/0013_academy_avaliacoes.sql`, "utf8"));
    const r = await db.query<{ carga_horaria_h: string }>(`select carga_horaria_h from public.cursos_requisitos where curso_slug = $1`, [CURSO]);
    expect(Number(r.rows[0]!.carga_horaria_h)).toBe(7);
  });

  it("as tabelas novas não são lidas direto por anon nem por aluno", async () => {
    for (const t of ["cursos_requisitos", "questoes", "questoes_alternativas", "tentativas_modulo", "provas_finais", "certificados"]) {
      expect(await erroDe(como(db, "anon", `select * from public.${t}`))).toMatch(/permission denied/);
      expect(await erroDe(como(db, "authenticated", `select * from public.${t}`, [], aluno))).toMatch(/permission denied/);
    }
  });
});

describe("questões de módulo", () => {
  it("saem sem a correta e sem a explicação, e só para aluno matriculado", async () => {
    const [, m1] = await modulos();
    for (let i = 1; i <= 7; i++) await criarQuestao(m1!.id, i);
    const r = await rpc<{ nota_minima: number; aprovado: boolean; questoes: Questao[] }>(`public.academy_questoes_modulo($1)`, [m1!.id]);
    expect(r.nota_minima).toBe(70);
    expect(r.aprovado).toBe(false);
    expect(r.questoes).toHaveLength(5);
    const texto = JSON.stringify(r);
    expect(texto).not.toMatch(/correta|explica/i);
    expect(r.questoes[0]!.alternativas).toHaveLength(4);
    expect(await erroDe(como(db, "anon", `select public.academy_questoes_modulo($1)`, [m1!.id]))).toMatch(/permission denied/);
    const outro = (await criarAluno(db, "sem-matricula@x.com")).userId;
    expect(await erroDe(rpc(`public.academy_questoes_modulo($1)`, [m1!.id], outro))).toMatch(/sem_matricula/);
  });

  it("questão sem alternativa correta, com duas corretas ou não publicada não vai para o aluno", async () => {
    const [, m1] = await modulos();
    const semCorreta = await criarQuestao(m1!.id, 1);
    await db.query(`update public.questoes_alternativas set correta = false where questao_id = $1`, [semCorreta]);
    const rascunho = await criarQuestao(m1!.id, 2);
    await db.query(`update public.questoes set publicado = false where id = $1`, [rascunho]);
    expect(await erroDe(rpc(`public.academy_questoes_modulo($1)`, [m1!.id]))).toMatch(/sem_questoes/);
    const duas = await criarQuestao(m1!.id, 3);
    expect(
      await erroDe(db.query(`update public.questoes_alternativas set correta = true where questao_id = $1 and ordem = 2`, [duas])),
    ).toMatch(/duplicate|unique/);
  });

  it("3 de 5 reprova, 4 de 5 aprova, e a correção mostra a certa e a explicação", async () => {
    const [, m1] = await modulos();
    for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
    const q = await rpc<{ questoes: Questao[] }>(`public.academy_questoes_modulo($1)`, [m1!.id]);

    const r1 = await rpc<{ nota: number; aprovado: boolean; correcao: { questao: string; correta: boolean; alternativa_correta: string; explicacao: string }[] }>(
      `public.academy_responder_modulo($1, $2::jsonb)`,
      [m1!.id, JSON.stringify(await responder(q.questoes, 3))],
    );
    expect(r1).toMatchObject({ nota: 60, aprovado: false });
    expect(r1.correcao.filter((c) => c.correta)).toHaveLength(3);
    // A correção vem na ordem em que o aluno respondeu.
    expect(r1.correcao.map((c) => c.questao)).toEqual(q.questoes.map((x) => x.id));
    expect(r1.correcao.map((c) => c.correta)).toEqual([true, true, true, false, false]);
    expect(r1.correcao[3]!.explicacao).toMatch(/^Explicação da questão/);
    expect(r1.correcao[3]!.alternativa_correta).toBe(q.questoes[3]!.alternativas.find((a) => a.texto.startsWith("certa"))!.id);

    const r2 = await rpc<{ nota: number; aprovado: boolean }>(`public.academy_responder_modulo($1, $2::jsonb)`, [
      m1!.id,
      JSON.stringify(await responder(q.questoes, 4)),
    ]);
    expect(r2).toMatchObject({ nota: 80, aprovado: true });
  });

  it("recusa envio incompleto, repetido, de outro módulo ou com alternativa de outra questão", async () => {
    const [, m1, m2] = await modulos();
    for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
    const deFora = await criarQuestao(m2!.id, 99);
    const q = await rpc<{ questoes: Questao[] }>(`public.academy_questoes_modulo($1)`, [m1!.id]);
    const certo = await responder(q.questoes, 5);
    const enviar = (r: unknown) => erroDe(rpc(`public.academy_responder_modulo($1, $2::jsonb)`, [m1!.id, JSON.stringify(r)]));

    expect(await enviar(certo.slice(0, 4))).toMatch(/invalid_payload/);
    expect(await enviar([...certo.slice(0, 4), certo[0]])).toMatch(/invalid_payload/);
    expect(await enviar([...certo.slice(0, 4), { questao: deFora, alternativa: certo[4]!.alternativa }])).toMatch(/invalid_payload/);
    expect(await enviar([...certo.slice(0, 4), { questao: certo[4]!.questao, alternativa: certo[0]!.alternativa }])).toMatch(/invalid_payload/);
    expect(await enviar({ nao: "array" })).toMatch(/invalid_payload/);
  });
});

describe("bloqueio de módulo na sala de aula", () => {
  it("o módulo seguinte só libera depois de aprovar as questões do anterior, inclusive no servidor", async () => {
    const [intro, m1, m2] = await modulos();
    for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
    const [aulaM2] = await aulasDoModulo(m2!.id);
    await db.query(`update public.aulas set video_provedor = 'youtube', video_ref = 'AAAAAAAAAAA' where id = $1`, [aulaM2]);

    // Introdução não tem questões e não bloqueia o módulo 1.
    const sit = await rpc<{ modulos: { ordem: number; liberado: boolean; tem_questoes: boolean }[] }>(`public.academy_situacao_curso($1)`, [CURSO]);
    expect(sit.modulos.map((m) => [m.ordem, m.liberado])).toEqual([
      [0, true],
      [1, true],
      [2, false],
      [3, false],
      [4, false],
      [5, false],
    ]);
    expect(await erroDe(rpc(`public.academy_video_aula($1)`, [aulaM2]))).toMatch(/modulo_bloqueado/);
    expect(await erroDe(concluirAula(aulaM2!))).toMatch(/modulo_bloqueado/);
    expect(await erroDe(rpc(`public.academy_questoes_modulo($1)`, [m2!.id]))).toMatch(/modulo_bloqueado/);
    expect(intro).toBeDefined();

    const q = await rpc<{ questoes: Questao[] }>(`public.academy_questoes_modulo($1)`, [m1!.id]);
    await rpc(`public.academy_responder_modulo($1, $2::jsonb)`, [m1!.id, JSON.stringify(await responder(q.questoes, 4))]);
    expect(await rpc(`public.academy_video_aula($1)`, [aulaM2])).toEqual({ provedor: "youtube", ref: "AAAAAAAAAAA" });
    expect(await concluirAula(aulaM2!)).toMatchObject({ concluida: true });
  });

  it("aprovação não se perde se o aluno refizer e for mal depois", async () => {
    const [, m1, m2] = await modulos();
    for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
    const q = await rpc<{ questoes: Questao[] }>(`public.academy_questoes_modulo($1)`, [m1!.id]);
    await rpc(`public.academy_responder_modulo($1, $2::jsonb)`, [m1!.id, JSON.stringify(await responder(q.questoes, 5))]);
    await rpc(`public.academy_responder_modulo($1, $2::jsonb)`, [m1!.id, JSON.stringify(await responder(q.questoes, 0))]);
    const [aulaM2] = await aulasDoModulo(m2!.id);
    expect(await concluirAula(aulaM2!)).toMatchObject({ concluida: true });
  });

  it("curso que não exige os módulos não bloqueia (requisito é do curso)", async () => {
    const [, m1, m2] = await modulos();
    for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
    await db.query(`update public.cursos_requisitos set exige_modulos = false where curso_slug = $1`, [CURSO]);
    const [aulaM2] = await aulasDoModulo(m2!.id);
    expect(await concluirAula(aulaM2!)).toMatchObject({ concluida: true });
  });
});

describe("avaliação final", () => {
  async function prepararBanco(qtd = 25) {
    for (let i = 1; i <= qtd; i++) await criarQuestao(null, 100 + i);
  }

  it("só abre com aulas e módulos cumpridos e com banco suficiente", async () => {
    const [, m1] = await modulos();
    for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
    await prepararBanco(10);
    expect(await erroDe(rpc(`public.academy_iniciar_final($1)`, [CURSO]))).toMatch(/requisitos_pendentes/);
    await cumprirAulasEModulos(m1!.id);
    expect(await erroDe(rpc(`public.academy_iniciar_final($1)`, [CURSO]))).toMatch(/sem_banco/);
    await prepararBanco(15);
    const p = await rpc<{ prova_id: string; questoes: Questao[] }>(`public.academy_iniciar_final($1)`, [CURSO]);
    expect(p.questoes).toHaveLength(20);
    expect(JSON.stringify(p)).not.toMatch(/correta|explica/i);
    // Fechou a aba: volta para a mesma prova.
    const de_novo = await rpc<{ prova_id: string; questoes: Questao[] }>(`public.academy_iniciar_final($1)`, [CURSO]);
    expect(de_novo.prova_id).toBe(p.prova_id);
    expect(de_novo.questoes.map((q) => q.id)).toEqual(p.questoes.map((q) => q.id));
  });

  it("reprovação devolve só a nota e segura 24 h; depois disso abre de novo e aprova com 80%", async () => {
    const [, m1] = await modulos();
    for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
    await prepararBanco();
    await cumprirAulasEModulos(m1!.id);

    const p1 = await rpc<{ prova_id: string; questoes: Questao[] }>(`public.academy_iniciar_final($1)`, [CURSO]);
    const r1 = await rpc<Record<string, unknown>>(`public.academy_enviar_final($1, $2::jsonb)`, [p1.prova_id, JSON.stringify(await responder(p1.questoes, 15))]);
    expect(r1).toMatchObject({ acertos: 15, total: 20, nota: 75, aprovado: false });
    expect(r1).not.toHaveProperty("correcao");
    expect(r1.proxima_em).toBeTruthy();
    expect(await erroDe(rpc(`public.academy_enviar_final($1, $2::jsonb)`, [p1.prova_id, "[]"]))).toMatch(/prova_ja_enviada/);
    expect(await erroDe(rpc(`public.academy_iniciar_final($1)`, [CURSO]))).toMatch(/aguarde/);
    const sit = await rpc<{ final: { situacao: string; proxima_em: string } }>(`public.academy_situacao_curso($1)`, [CURSO]);
    expect(sit.final.situacao).toBe("aguarde");

    await db.query(`update public.provas_finais set enviada_em = now() - interval '25 hours' where id = $1`, [p1.prova_id]);
    const p2 = await rpc<{ prova_id: string; questoes: Questao[] }>(`public.academy_iniciar_final($1)`, [CURSO]);
    expect(p2.prova_id).not.toBe(p1.prova_id);
    const r2 = await rpc(`public.academy_enviar_final($1, $2::jsonb)`, [p2.prova_id, JSON.stringify(await responder(p2.questoes, 16))]);
    expect(r2).toMatchObject({ nota: 80, aprovado: true, proxima_em: null });
    expect(await erroDe(rpc(`public.academy_iniciar_final($1)`, [CURSO]))).toMatch(/aprovado/);
  });

  it("respeita o limite de tentativas quando o curso define um", async () => {
    const [, m1] = await modulos();
    for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
    await prepararBanco();
    await cumprirAulasEModulos(m1!.id);
    await db.query(`update public.cursos_requisitos set tentativas_final_max = 1, espera_final_horas = 0 where curso_slug = $1`, [CURSO]);
    const p = await rpc<{ prova_id: string; questoes: Questao[] }>(`public.academy_iniciar_final($1)`, [CURSO]);
    await rpc(`public.academy_enviar_final($1, $2::jsonb)`, [p.prova_id, JSON.stringify(await responder(p.questoes, 0))]);
    expect(await erroDe(rpc(`public.academy_iniciar_final($1)`, [CURSO]))).toMatch(/sem_tentativas/);
  });

  it("prova de outro aluno não pode ser enviada", async () => {
    const [, m1] = await modulos();
    for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
    await prepararBanco();
    await cumprirAulasEModulos(m1!.id);
    const p = await rpc<{ prova_id: string; questoes: Questao[] }>(`public.academy_iniciar_final($1)`, [CURSO]);
    const intruso = (await criarAluno(db, "intruso@x.com")).userId;
    expect(
      await erroDe(rpc(`public.academy_enviar_final($1, $2::jsonb)`, [p.prova_id, JSON.stringify(await responder(p.questoes, 20))], intruso)),
    ).toMatch(/prova_indisponivel/);
  });
});

describe("certificado", () => {
  async function aprovarTudo() {
    const [, m1] = await modulos();
    for (let i = 1; i <= 5; i++) await criarQuestao(m1!.id, i);
    for (let i = 1; i <= 25; i++) await criarQuestao(null, 100 + i);
    await cumprirAulasEModulos(m1!.id);
    const p = await rpc<{ prova_id: string; questoes: Questao[] }>(`public.academy_iniciar_final($1)`, [CURSO]);
    await rpc(`public.academy_enviar_final($1, $2::jsonb)`, [p.prova_id, JSON.stringify(await responder(p.questoes, 18))]);
  }

  it("só fica elegível com todos os requisitos e com a carga horária definida", async () => {
    const elegivel = async () => (await rpc<{ certificado: { elegivel: boolean } }>(`public.academy_situacao_curso($1)`, [CURSO])).certificado.elegivel;
    await db.query(`update public.cursos_requisitos set carga_horaria_h = null where curso_slug = $1`, [CURSO]);
    expect(await elegivel()).toBe(false);
    expect(await erroDe(rpc(`public.academy_emitir_certificado($1, $2)`, [CURSO, "Ana Teste"]))).toMatch(/nao_elegivel/);
    await aprovarTudo();
    expect(await elegivel()).toBe(false); // sem carga horária
    await db.query(`update public.cursos_requisitos set carga_horaria_h = 6 where curso_slug = $1`, [CURSO]);
    expect(await elegivel()).toBe(true);
  });

  it("aula ainda não publicada impede o certificado (curso em construção)", async () => {
    await aprovarTudo();
    await db.query(`update public.cursos_requisitos set carga_horaria_h = 6 where curso_slug = $1`, [CURSO]);
    const [ultima] = (await todasAsAulas()).slice(-1);
    await db.query(`delete from public.progresso_aulas where aula_id = $1`, [ultima]);
    await db.query(`update public.aulas set publicado = false where id = $1`, [ultima]);
    expect((await rpc<{ certificado: { elegivel: boolean } }>(`public.academy_situacao_curso($1)`, [CURSO])).certificado.elegivel).toBe(false);
  });

  it("emite com o nome conferido, código no formato e uma vez só", async () => {
    await aprovarTudo();
    await db.query(`update public.cursos_requisitos set carga_horaria_h = 6 where curso_slug = $1`, [CURSO]);
    expect(await erroDe(rpc(`public.academy_emitir_certificado($1, $2)`, [CURSO, "A"]))).toMatch(/nome_invalido/);
    expect(await erroDe(rpc(`public.academy_emitir_certificado($1, $2)`, [CURSO, "<script>"]))).toMatch(/nome_invalido/);
    expect(await erroDe(rpc(`public.academy_emitir_certificado($1, $2)`, [CURSO, "Ana 123"]))).toMatch(/nome_invalido/);

    const c = await rpc<{ codigo: string; nome: string; curso_titulo: string; carga_horaria_h: number; concluido_em: string }>(
      `public.academy_emitir_certificado($1, $2)`,
      [CURSO, "  Ana   Lúcia d'Ávila  "],
    );
    expect(c.codigo).toMatch(/^CYD-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(c).toMatchObject({ nome: "Ana Lúcia d'Ávila", curso_titulo: "Cybersecurity Fundamentals", carga_horaria_h: 6 });
    const de_novo = await rpc<{ codigo: string; nome: string }>(`public.academy_emitir_certificado($1, $2)`, [CURSO, "Outro Nome"]);
    expect(de_novo).toMatchObject({ codigo: c.codigo, nome: "Ana Lúcia d'Ávila" });
    const sit = await rpc<{ certificado: { elegivel: boolean; codigo: string } }>(`public.academy_situacao_curso($1)`, [CURSO]);
    expect(sit.certificado).toMatchObject({ elegivel: false, codigo: c.codigo });
  });

  it("validação pública: só com o código, só nome, curso, carga e data, e some se for desativada", async () => {
    await aprovarTudo();
    await db.query(`update public.cursos_requisitos set carga_horaria_h = 6 where curso_slug = $1`, [CURSO]);
    const c = await rpc<{ codigo: string }>(`public.academy_emitir_certificado($1, $2)`, [CURSO, "Ana Teste"]);

    const [v] = await como<{ v: Record<string, unknown> }>(db, "anon", `select public.academy_validar_certificado($1) v`, [c.codigo.toLowerCase()]);
    expect(Object.keys(v!.v).sort()).toEqual(["carga_horaria_h", "codigo", "concluido_em", "curso", "nome"]);
    expect(v!.v).toMatchObject({ codigo: c.codigo, nome: "Ana Teste", curso: "Cybersecurity Fundamentals", carga_horaria_h: 6 });

    for (const ruim of ["CYD-0000-0000-0000-0000", "nada", "", "' or 1=1 --"]) {
      const [x] = await como<{ v: unknown }>(db, "anon", `select public.academy_validar_certificado($1) v`, [ruim]);
      expect(x!.v).toBeNull();
    }
    await db.query(`update public.certificados set validacao_publica = false where codigo = $1`, [c.codigo]);
    const [y] = await como<{ v: unknown }>(db, "anon", `select public.academy_validar_certificado($1) v`, [c.codigo]);
    expect(y!.v).toBeNull();
  });
});
