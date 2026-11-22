// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo, uuid } from "./banco";

/** Fase 22 (0034): material complementar dentro do módulo, antes das questões. */

const CURSO = "cybersecurity-fundamentals";

let db: PGlite;
let aluno: string;
let m1: string;
let m2: string;

interface Questao {
  id: string;
  alternativas: { id: string; texto: string }[];
}
interface MaterialAluno {
  id: string;
  modulo_id: string | null;
  baixado: boolean;
}

async function erroDe(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  return "";
}

async function rpc<T>(sql: string, params: unknown[] = [], uid: string = aluno): Promise<T> {
  const [r] = await como<{ r: T }>(db, "authenticated", `select ${sql} r`, params, uid);
  return r!.r;
}

async function criarQuestao(moduloId: string, n: number) {
  const [{ id }] = (
    await db.query<{ id: string }>(
      `insert into public.questoes (curso_slug, modulo_id, enunciado, explicacao, publicado) values ($1, $2, $3, $4, true) returning id`,
      [CURSO, moduloId, `Enunciado da questão número ${n}`, `Explicação ${n}`],
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
}

async function criarMaterial(moduloId: string | null, status = "aprovado"): Promise<string> {
  const id = uuid();
  const revisado = status === "aprovado" || status === "recusado";
  await db.query(
    `insert into public.materiais (id, curso_slug, modulo_id, titulo, nome_arquivo, extensao, mime, tamanho, sha256, caminho, status,
                                   enviado_por, revisado_por, revisado_em)
     values ($1, $2, $3, 'Material de apoio', 'material.pdf', 'pdf', 'application/pdf', 1000, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      CURSO,
      moduloId,
      "a".repeat(64),
      `${CURSO}/${id}/material.pdf`,
      status,
      uuid(),
      revisado ? uuid() : null,
      revisado ? new Date().toISOString() : null,
    ],
  );
  return id;
}

async function responderTudoCerto() {
  const q = await rpc<{ questoes: Questao[] }>(`public.academy_questoes_modulo($1)`, [m1]);
  const respostas = q.questoes.map((x) => ({ questao: x.id, alternativa: x.alternativas.find((a) => a.texto.startsWith("certa"))!.id }));
  return rpc<{ aprovado: boolean }>(`public.academy_responder_modulo($1, $2::jsonb)`, [m1, JSON.stringify(respostas)]);
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  aluno = (await criarAluno(db, `aluno${Math.random()}@x.com`)).userId;
  await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], aluno);
  const mods = (await db.query<{ id: string }>(`select id from public.modulos where curso_slug = $1 order by ordem`, [CURSO])).rows;
  m1 = mods[1]!.id;
  m2 = mods[2]!.id;
  for (let i = 1; i <= 5; i++) await criarQuestao(m1, i);
});

describe("material complementar no módulo (0034)", () => {
  it("módulo sem material: as questões abrem como antes", async () => {
    await criarMaterial(m2);
    await criarMaterial(null);
    const r = await rpc<{ questoes: Questao[] }>(`public.academy_questoes_modulo($1)`, [m1]);
    expect(r.questoes).toHaveLength(5);
  });

  it("material do módulo não baixado trava as questões e a correção; baixar libera", async () => {
    const mat = await criarMaterial(m1);
    expect(await erroDe(rpc(`public.academy_questoes_modulo($1)`, [m1]))).toMatch(/material_pendente/);
    expect(await erroDe(rpc(`public.academy_responder_modulo($1, '[]'::jsonb)`, [m1]))).toMatch(/material_pendente/);

    const lista = await rpc<MaterialAluno[]>(`public.academy_materiais_curso($1)`, [CURSO]);
    expect(lista.find((x) => x.id === mat)).toMatchObject({ modulo_id: m1, baixado: false });

    const reg = await rpc<{ material_id: string; baixado_em: string }>(`public.academy_registrar_material($1)`, [mat]);
    expect(reg.material_id).toBe(mat);
    const depois = await rpc<MaterialAluno[]>(`public.academy_materiais_curso($1)`, [CURSO]);
    expect(depois.find((x) => x.id === mat)!.baixado).toBe(true);
    expect((await responderTudoCerto()).aprovado).toBe(true);
  });

  it("todos os materiais aprovados do módulo contam; pendente, recusado e fora do ar não", async () => {
    const a = await criarMaterial(m1);
    const b = await criarMaterial(m1);
    await criarMaterial(m1, "pendente");
    await criarMaterial(m1, "recusado");
    await criarMaterial(m1, "arquivado");
    await rpc(`public.academy_registrar_material($1)`, [a]);
    expect(await erroDe(rpc(`public.academy_questoes_modulo($1)`, [m1]))).toMatch(/material_pendente/);
    await rpc(`public.academy_registrar_material($1)`, [b]);
    expect(await erroDe(rpc(`public.academy_questoes_modulo($1)`, [m1]))).toBe("");
  });

  it("registrar duas vezes guarda só o primeiro download", async () => {
    const mat = await criarMaterial(m1);
    const r1 = await rpc<{ baixado_em: string }>(`public.academy_registrar_material($1)`, [mat]);
    const r2 = await rpc<{ baixado_em: string }>(`public.academy_registrar_material($1)`, [mat]);
    expect(r2.baixado_em).toBe(r1.baixado_em);
    const n = await db.query<{ n: number }>(`select count(*)::int n from public.academy_materiais_baixados where user_id = $1`, [aluno]);
    expect(n.rows[0]!.n).toBe(1);
  });

  it("não registra material que não está aprovado nem de curso fora da conta", async () => {
    const pendente = await criarMaterial(m1, "pendente");
    expect(await erroDe(rpc(`public.academy_registrar_material($1)`, [pendente]))).toMatch(/material_indisponivel/);
    expect(await erroDe(rpc(`public.academy_registrar_material($1)`, [uuid()]))).toMatch(/material_indisponivel/);
    const mat = await criarMaterial(m1);
    const outro = (await criarAluno(db, "sem-matricula@x.com")).userId;
    expect(await erroDe(rpc(`public.academy_registrar_material($1)`, [mat], outro))).toMatch(/sem_matricula/);
    expect(await erroDe(como(db, "anon", `select public.academy_registrar_material($1)`, [mat]))).toMatch(/permission denied/);
  });

  it("quem já passou no módulo não é travado pelo material que entrou depois", async () => {
    expect((await responderTudoCerto()).aprovado).toBe(true);
    await criarMaterial(m1);
    expect(await erroDe(rpc(`public.academy_questoes_modulo($1)`, [m1]))).toBe("");
  });

  it("a tabela é fechada, sai na cópia dos dados e some com a conta", async () => {
    const mat = await criarMaterial(m1);
    await rpc(`public.academy_registrar_material($1)`, [mat]);
    expect(await erroDe(como(db, "authenticated", `select * from public.academy_materiais_baixados`, [], aluno))).toMatch(/permission denied/);

    const dados = await rpc<{ materiais_baixados: { curso: string; material: string; baixado_em: string }[] }>(`public.academy_meus_dados()`);
    expect(dados.materiais_baixados).toHaveLength(1);
    expect(dados.materiais_baixados[0]).toMatchObject({ curso: "Cybersecurity Fundamentals", material: "Material de apoio" });

    await db.query(`delete from auth.users where id = $1`, [aluno]);
    const n = await db.query<{ n: number }>(`select count(*)::int n from public.academy_materiais_baixados`);
    expect(n.rows[0]!.n).toBe(0);
  });
});
