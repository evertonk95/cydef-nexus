// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo } from "./banco";

const CF = "cybersecurity-fundamentals";

let db: PGlite;
let aluno: string;
let outro: string;

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

async function emitir(uid: string, codigo: string) {
  await db.query(
    `insert into public.certificados (codigo, user_id, curso_slug, nome, curso_titulo, carga_horaria_h, nota_final, concluido_em)
     values ($1, $2, $3, 'Ana Teste', 'Cybersecurity Fundamentals', 6, 90, '2026-11-18')`,
    [codigo, uid, CF],
  );
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  aluno = (await criarAluno(db, "aluno@exemplo.com")).userId;
  outro = (await criarAluno(db, "outro@exemplo.com")).userId;
}, 60_000);

describe("nome da conta", () => {
  it("corrige o nome, com espaços normalizados, e recusa nome curto", async () => {
    expect(await rpc(aluno, `public.academy_atualizar_nome($1)`, ["  Ana   Maria  Souza "])).toEqual({ nome: "Ana Maria Souza" });
    const [a] = (await db.query<{ nome: string }>(`select nome from public.alunos where user_id = $1`, [aluno])).rows;
    expect(a!.nome).toBe("Ana Maria Souza");
    expect(await erroDe(rpc(aluno, `public.academy_atualizar_nome($1)`, ["A"]))).toContain("nome_invalido");
  });

  it("não muda o nome gravado no certificado", async () => {
    await emitir(aluno, "CYD-AAAA-BBBB-CCCC-0001");
    await rpc(aluno, `public.academy_atualizar_nome($1)`, ["Outro Nome"]);
    const [c] = (await db.query<{ nome: string }>(`select nome from public.certificados`)).rows;
    expect(c!.nome).toBe("Ana Teste");
  });

  it("sem login, nada", async () => {
    expect(await erroDe(como(db, "anon", `select public.academy_atualizar_nome($1)`, ["Ana"]))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "anon", `select public.academy_meus_dados()`))).toMatch(/permission denied/);
  });
});

describe("validação pública", () => {
  it("o aluno desliga e religa a validação do próprio certificado", async () => {
    await emitir(aluno, "CYD-AAAA-BBBB-CCCC-0002");
    const lista = await rpc<{ codigo: string; validacao_publica: boolean }[]>(aluno, `public.academy_validacao_publica($1, false)`, ["cyd-aaaa-bbbb-cccc-0002"]);
    expect(lista).toEqual([expect.objectContaining({ codigo: "CYD-AAAA-BBBB-CCCC-0002", validacao_publica: false })]);
    const [v] = await como<{ r: unknown }>(db, "anon", `select public.academy_validar_certificado($1) r`, ["CYD-AAAA-BBBB-CCCC-0002"]);
    expect(v!.r).toBeNull();
    await rpc(aluno, `public.academy_validacao_publica($1, true)`, ["CYD-AAAA-BBBB-CCCC-0002"]);
    const [v2] = await como<{ r: { nome: string } }>(db, "anon", `select public.academy_validar_certificado($1) r`, ["CYD-AAAA-BBBB-CCCC-0002"]);
    expect(v2!.r.nome).toBe("Ana Teste");
  });

  it("não mexe em certificado de outra pessoa", async () => {
    await emitir(outro, "CYD-AAAA-BBBB-CCCC-0003");
    expect(await erroDe(rpc(aluno, `public.academy_validacao_publica($1, false)`, ["CYD-AAAA-BBBB-CCCC-0003"]))).toContain("certificado_inexistente");
    expect(await rpc(aluno, `public.academy_meus_certificados()`)).toEqual([]);
  });
});

describe("cópia dos dados", () => {
  it("traz conta, pré-inscrição com consentimento, matrícula, progresso, questões em texto e certificado", async () => {
    const [m1] = (await db.query<{ id: string }>(`select id from public.modulos where curso_slug = $1 and ordem = 1`, [CF])).rows;
    const [aula] = (await db.query<{ id: string }>(`select id from public.aulas where modulo_id = $1 order by ordem limit 1`, [m1!.id])).rows;
    const q = (
      await db.query<{ id: string }>(
        `insert into public.questoes (curso_slug, modulo_id, enunciado, publicado) values ($1, $2, 'Qual pilar trata do sigilo?', true) returning id`,
        [CF, m1!.id],
      )
    ).rows[0]!;
    const alt = (
      await db.query<{ id: string }>(`insert into public.questoes_alternativas (questao_id, ordem, texto, correta) values ($1, 1, 'Confidencialidade', true) returning id`, [q.id])
    ).rows[0]!;
    await db.query(`insert into public.matriculas (user_id, curso_slug, origem) values ($1, $2, 'gratuito') on conflict do nothing`, [aluno, CF]);
    await db.query(`insert into public.progresso_aulas (user_id, aula_id, posicao_seg) values ($1, $2, 120)`, [aluno, aula!.id]);
    await db.query(
      `insert into public.tentativas_modulo (user_id, modulo_id, acertos, total, nota, aprovado, respostas) values ($1, $2, 1, 1, 100, true, $3::jsonb)`,
      [aluno, m1!.id, JSON.stringify([{ questao: q.id, alternativa: alt.id }])],
    );
    await emitir(aluno, "CYD-AAAA-BBBB-CCCC-0004");
    // Dado de outra pessoa não pode vazar.
    await emitir(outro, "CYD-AAAA-BBBB-CCCC-0005");

    const d = await rpc<Record<string, unknown> & {
      conta: { email: string; nome: string };
      pre_inscricao: { email: string; consentimentos: { versao_aviso: string }[] };
      matriculas: unknown[];
      progresso: { parou_em_seg: number }[];
      questoes_de_modulo: { nota: number; respostas: { questao: string; resposta: string }[] }[];
      certificados: { codigo: string }[];
    }>(aluno, `public.academy_meus_dados()`);
    expect(d.conta).toMatchObject({ email: "aluno@exemplo.com", nome: "Ana Teste" });
    expect(d.pre_inscricao.email).toBe("aluno@exemplo.com");
    expect(d.pre_inscricao.consentimentos[0]!.versao_aviso).toBe("v2026.2");
    expect(d.matriculas.length).toBeGreaterThan(0);
    expect(d.progresso[0]!.parou_em_seg).toBe(120);
    expect(d.questoes_de_modulo[0]!.respostas).toEqual([{ questao: "Qual pilar trata do sigilo?", resposta: "Confidencialidade" }]);
    expect(d.certificados.map((c) => c.codigo)).toEqual(["CYD-AAAA-BBBB-CCCC-0004"]);
    expect(JSON.stringify(d)).not.toContain("outro@exemplo.com");
    // Sem identificadores internos.
    expect(JSON.stringify(d)).not.toContain(aluno);
  });
});
