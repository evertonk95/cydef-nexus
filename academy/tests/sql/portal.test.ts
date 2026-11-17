// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, criarLead, novoBanco, PASTA_MIGRACOES, publicarCatalogo, uuid } from "./banco";

let db: PGlite;

beforeEach(async () => {
  db = await novoBanco();
});

async function erroDe(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  return "";
}

async function aulasDe(curso: string): Promise<{ id: string; numero: number }[]> {
  const r = await db.query<{ id: string; numero: number }>(
    `select a.id, a.numero from public.aulas a join public.modulos m on m.id = a.modulo_id where m.curso_slug = $1 order by a.numero`,
    [curso],
  );
  return r.rows;
}

describe("migrações", () => {
  it("rodam em ordem num banco novo e criam o catálogo inicial sem publicar nada", async () => {
    const cursos = await db.query<{ slug: string; publicado: boolean }>(`select slug, publicado from public.cursos order by ordem`);
    expect(cursos.rows.map((c) => c.slug)).toEqual(["cybersecurity-fundamentals", "fundamentos-para-soc"]);
    expect(cursos.rows.every((c) => !c.publicado)).toBe(true);
    expect((await aulasDe("cybersecurity-fundamentals")).length).toBe(16);
    expect((await aulasDe("fundamentos-para-soc")).length).toBe(12);
  });

  it("a migração do catálogo pode rodar de novo sem duplicar", async () => {
    const { readFileSync } = await import("node:fs");
    const sql = readFileSync(`${PASTA_MIGRACOES}/0009_academy_catalogo_inicial.sql`, "utf8");
    await db.exec(sql);
    expect((await aulasDe("fundamentos-para-soc")).length).toBe(12);
  });
});

describe("catálogo e leitura pública", () => {
  it("nada aparece para anon ou aluno enquanto não estiver publicado", async () => {
    expect(await como(db, "anon", `select slug from public.cursos`)).toEqual([]);
    expect(await como(db, "anon", `select id from public.aulas`)).toEqual([]);
  });

  it("depois de publicado, anon lê o catálogo mas não a referência do vídeo", async () => {
    await publicarCatalogo(db);
    expect((await como(db, "anon", `select slug from public.cursos`)).length).toBe(2);
    expect((await como(db, "anon", `select id, titulo from public.aulas`)).length).toBe(28);
    expect(await erroDe(como(db, "anon", `select video_ref from public.aulas`))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "authenticated", `select video_ref from public.aulas`, [], uuid()))).toMatch(/permission denied/);
  });

  it("aula não publicada continua escondida mesmo com o curso publicado", async () => {
    await publicarCatalogo(db);
    const [a] = await aulasDe("fundamentos-para-soc");
    await db.query(`update public.aulas set publicado = false where id = $1`, [a!.id]);
    const ids = (await como<{ id: string }>(db, "anon", `select id from public.aulas`)).map((r) => r.id);
    expect(ids).not.toContain(a!.id);
  });

  it("ninguém escreve direto no catálogo", async () => {
    expect(await erroDe(como(db, "authenticated", `update public.cursos set publicado = true`, [], uuid()))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "anon", `insert into public.boletim (tipo, titulo) values ('aula', 'teste xx')`))).toMatch(/permission denied/);
  });
});

describe("elegibilidade e provisionamento (servidor de login)", () => {
  it("só o service_role chama as funções do servidor de login", async () => {
    expect(await erroDe(como(db, "anon", `select public.academy_elegibilidade('a@b.com')`))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "authenticated", `select public.academy_elegibilidade('a@b.com')`, [], uuid()))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "authenticated", `select public.academy_rate_limit('chave-teste-123', 5, 900)`, [], uuid()))).toMatch(/permission denied/);
  });

  it("e-mail desconhecido não é elegível", async () => {
    const [r] = await como<{ j: { elegivel: boolean } }>(db, "service_role", `select public.academy_elegibilidade('ninguem@x.com') j`);
    expect(r!.j).toEqual({ elegivel: false });
  });

  it("pré-inscrição pendente com consentimento é elegível; inválida não é", async () => {
    await criarLead(db, "pendente@x.com");
    await criarLead(db, "invalido@x.com", "invalid");
    const [ok] = await como<{ j: { elegivel: boolean; aluno: boolean } }>(db, "service_role", `select public.academy_elegibilidade(' PENDENTE@x.com ') j`);
    expect(ok!.j.elegivel).toBe(true);
    expect(ok!.j.aluno).toBe(false);
    const [nao] = await como<{ j: { elegivel: boolean } }>(db, "service_role", `select public.academy_elegibilidade('invalido@x.com') j`);
    expect(nao!.j.elegivel).toBe(false);
  });

  it("não provisiona aluno se o usuário de login não for do mesmo e-mail", async () => {
    const lead = await criarLead(db, "dono@x.com");
    const outro = uuid();
    await db.query(`insert into auth.users (id, email) values ($1, 'intruso@x.com')`, [outro]);
    expect(await erroDe(como(db, "service_role", `select public.academy_provisionar_aluno($1, $2, 'X Y')`, [outro, lead]))).toMatch(/usuario_nao_confere/);
  });

  it("limite de tentativas bloqueia depois do teto", async () => {
    const res: boolean[] = [];
    for (let i = 0; i < 4; i += 1) {
      const [r] = await como<{ ok: boolean }>(db, "service_role", `select public.academy_rate_limit('ip-hash-abcdef', 3, 900) ok`);
      res.push(r!.ok);
    }
    expect(res).toEqual([true, true, true, false]);
  });
});

describe("acesso do aluno", () => {
  it("registrar acesso confirma a pré-inscrição e matricula nos gratuitos publicados", async () => {
    await publicarCatalogo(db);
    const { userId, leadId } = await criarAluno(db, "ana@x.com");
    const [r] = await como<{ j: { nome: string } }>(db, "authenticated", `select public.academy_registrar_acesso() j`, [], userId);
    expect(r!.j.nome).toBe("Ana Teste");
    const lead = await db.query<{ status: string }>(`select status from public.leads where id = $1`, [leadId]);
    expect(lead.rows[0]!.status).toBe("confirmed");
    const mats = await como<{ curso_slug: string }>(db, "authenticated", `select curso_slug from public.matriculas order by curso_slug`, [], userId);
    expect(mats.map((m) => m.curso_slug)).toEqual(["cybersecurity-fundamentals", "fundamentos-para-soc"]);
  });

  it("usuário de login sem cadastro de aluno é recusado", async () => {
    const u = uuid();
    await db.query(`insert into auth.users (id, email) values ($1, 'solto@x.com')`, [u]);
    expect(await erroDe(como(db, "authenticated", `select public.academy_registrar_acesso()`, [], u))).toMatch(/sem_cadastro/);
    const [p] = await como<{ j: unknown }>(db, "authenticated", `select public.academy_meu_painel() j`, [], u);
    expect(p!.j).toBeNull();
  });

  it("anon não registra acesso nem progresso", async () => {
    expect(await erroDe(como(db, "anon", `select public.academy_registrar_acesso()`))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "anon", `select public.academy_meu_painel()`))).toMatch(/permission denied/);
  });
});

describe("progresso e isolamento entre alunos", () => {
  it("registra progresso só em curso matriculado e com posição coerente", async () => {
    await publicarCatalogo(db);
    const { userId } = await criarAluno(db, "bia@x.com");
    const [aula] = await aulasDe("fundamentos-para-soc");
    expect(await erroDe(como(db, "authenticated", `select public.academy_registrar_progresso($1, 10, false)`, [aula!.id], userId))).toMatch(/sem_matricula/);
    await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], userId);
    await como(db, "authenticated", `select public.academy_registrar_progresso($1, 120, true)`, [aula!.id], userId);
    expect(await erroDe(como(db, "authenticated", `select public.academy_registrar_progresso($1, 999999, false)`, [aula!.id], userId))).toMatch(/invalid_payload/);
    const dias = await como(db, "authenticated", `select dia from public.dias_estudo`, [], userId);
    expect(dias.length).toBe(1);
  });

  it("um aluno não enxerga matrícula, progresso nem dias de outro", async () => {
    await publicarCatalogo(db);
    const a = await criarAluno(db, "a@x.com");
    const b = await criarAluno(db, "b@x.com");
    const [aula] = await aulasDe("fundamentos-para-soc");
    for (const u of [a.userId, b.userId]) {
      await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], u);
    }
    await como(db, "authenticated", `select public.academy_registrar_progresso($1, 60, true)`, [aula!.id], a.userId);
    expect(await como(db, "authenticated", `select * from public.progresso_aulas`, [], b.userId)).toEqual([]);
    expect(await como(db, "authenticated", `select * from public.dias_estudo`, [], b.userId)).toEqual([]);
    expect((await como(db, "authenticated", `select * from public.matriculas`, [], b.userId)).length).toBe(2);
    expect(await como(db, "authenticated", `select user_id from public.alunos where user_id = $1`, [a.userId], b.userId)).toEqual([]);
  });

  it("aluno não grava progresso direto na tabela", async () => {
    await publicarCatalogo(db);
    const { userId } = await criarAluno(db, "c@x.com");
    const [aula] = await aulasDe("fundamentos-para-soc");
    expect(
      await erroDe(como(db, "authenticated", `insert into public.progresso_aulas (user_id, aula_id, concluida_em) values ($1, $2, now())`, [userId, aula!.id], userId)),
    ).toMatch(/permission denied/);
  });
});

describe("painel do aluno", () => {
  it("monta continuar, formação, competências e dias de estudo com os dados do próprio aluno", async () => {
    await publicarCatalogo(db);
    const { userId } = await criarAluno(db, "d@x.com");
    await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], userId);

    type P = {
      nome: string;
      continuar: { curso_slug: string; aula_numero: number; progresso_curso: number } | null;
      cursos: { slug: string; total: number; concluidas: number }[];
      formacoes: { slug: string; aulas_total: number; aulas_concluidas: number; trilhas: { slug: string }[] }[];
      competencias: { slug: string; percentual: number }[];
      dias_estudo: string[];
    };
    const ler = async () => (await como<{ j: P }>(db, "authenticated", `select public.academy_meu_painel() j`, [], userId))[0]!.j;

    let p = await ler();
    expect(p.nome).toBe("Ana Teste");
    expect(p.continuar?.curso_slug).toBe("cybersecurity-fundamentals");
    expect(p.continuar?.aula_numero).toBe(1);
    expect(p.formacoes[0]?.aulas_total).toBe(28);
    expect(p.dias_estudo).toEqual([]);

    const aulas = await aulasDe("fundamentos-para-soc");
    for (const a of aulas.slice(0, 3)) {
      await como(db, "authenticated", `select public.academy_registrar_progresso($1, 100, true)`, [a.id], userId);
    }
    p = await ler();
    expect(p.continuar?.curso_slug).toBe("fundamentos-para-soc");
    expect(p.continuar?.aula_numero).toBe(4);
    expect(p.continuar?.progresso_curso).toBe(25);
    expect(p.cursos.find((c) => c.slug === "fundamentos-para-soc")?.concluidas).toBe(3);
    expect(p.formacoes[0]?.aulas_concluidas).toBe(3);
    const triagem = p.competencias.find((c) => c.slug === "triagem-alertas");
    expect(triagem?.percentual).toBeGreaterThan(0);
    expect(p.dias_estudo.length).toBe(1);
  });

  it("aula começada e não terminada é a que aparece para continuar", async () => {
    await publicarCatalogo(db);
    const { userId } = await criarAluno(db, "e@x.com");
    await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], userId);
    const aulas = await aulasDe("fundamentos-para-soc");
    await como(db, "authenticated", `select public.academy_registrar_progresso($1, 300, false)`, [aulas[4]!.id], userId);
    const [r] = await como<{ j: { continuar: { aula_numero: number; posicao_seg: number } } }>(db, "authenticated", `select public.academy_meu_painel() j`, [], userId);
    expect(r!.j.continuar.aula_numero).toBe(5);
    expect(r!.j.continuar.posicao_seg).toBe(300);
  });
});

describe("boletim", () => {
  it("só alunos leem, e só o que está publicado e com data já chegada", async () => {
    await db.exec(`
      insert into public.boletim (tipo, titulo, publicado, publicado_em) values
        ('aula', 'Aula nova publicada', true, now() - interval '1 hour'),
        ('ameaca', 'Rascunho de ameaça', false, now()),
        ('atualizacao', 'Agendado para amanhã', true, now() + interval '1 day');
    `);
    expect(await erroDe(como(db, "anon", `select titulo from public.boletim`))).toMatch(/permission denied/);
    const r = await como<{ titulo: string }>(db, "authenticated", `select titulo from public.boletim`, [], uuid());
    expect(r.map((x) => x.titulo)).toEqual(["Aula nova publicada"]);
  });

  it("recusa link que não seja https", async () => {
    expect(await erroDe(db.exec(`insert into public.boletim (tipo, titulo, link, publicado) values ('aula', 'Link ruim', 'javascript:alert(1)', true)`))).toMatch(/check/);
  });
});
