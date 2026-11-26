// @vitest-environment node
/** Fase 23 (0036): "Quem ensina" mostra a equipe sem cartão e acrescenta vários de uma vez. */
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

async function rpc<T>(
  uid: string,
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const [r] = await como<{ r: T }>(
    db,
    "authenticated",
    `select ${sql} r`,
    params,
    uid,
  );
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
  equipe_sem_perfil: { id: string; nome: string; eu: boolean }[];
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  instrutor = (await criarAluno(db, "instrutor@exemplo.com")).userId;
  aluno = (await criarAluno(db, "aluno@exemplo.com")).userId;
  await db.query(
    `insert into public.academy_equipe (user_id, papel) values ($1, 'admin'), ($2, 'instrutor')`,
    [admin, instrutor],
  );
  await db.query(
    `insert into public.academy_equipe_cursos (user_id, curso_slug) values ($1, $2)`,
    [instrutor, SOC],
  );
}, 60_000);

const ACRESCENTAR = `public.academy_adm_acrescentar_instrutores($1, $2::uuid[], $3::uuid[], $4)`;

describe("quem ensina com a equipe (0036)", () => {
  it("quem é da equipe e não tem cartão aparece para ser escolhido, com o nome da conta", async () => {
    await db.query(
      `update public.alunos set nome = 'Matheus Inacio' where user_id = $1`,
      [instrutor],
    );
    const r = await rpc<Instrutores>(
      admin,
      `public.academy_adm_instrutores($1)`,
      [SOC],
    );
    expect(r.equipe_sem_perfil).toEqual(
      expect.arrayContaining([
        { id: instrutor, nome: "Matheus Inacio", eu: false },
        { id: admin, nome: expect.any(String), eu: true },
      ]),
    );
    expect(r.equipe_sem_perfil.map((p) => p.id)).not.toContain(aluno);
  });

  it("acrescenta vários de uma vez: cria o cartão de quem não tem, ligado à conta, e mantém a ordem", async () => {
    const convidado = (await rpc<{ disponiveis: Perfil[] }>(
      admin,
      `public.academy_adm_salvar_instrutor($1, null, $2::jsonb)`,
      [
        CF,
        {
          nome: "Convidada Especial",
          cargo: "Pesquisadora",
          bio: "",
          linkedin: null,
          site: null,
        },
      ],
    )) as unknown;
    void convidado;
    const card = (
      await db.query<{ id: string }>(
        `select id from public.instrutores where nome = 'Convidada Especial'`,
      )
    ).rows[0]!.id;

    const r = await rpc<Instrutores>(admin, ACRESCENTAR, [
      SOC,
      [card],
      [instrutor, admin],
      "instrutor",
    ]);
    expect(r.do_curso.map((v) => v.instrutor.nome)).toHaveLength(3);
    expect(r.do_curso[0]!.instrutor.nome).toBe("Convidada Especial");
    expect(r.do_curso.map((v) => v.ordem)).toEqual([1, 2, 3]);
    expect(r.equipe_sem_perfil).toEqual([]);

    const cards = await db.query<{ user_id: string; criado_por: string }>(
      `select user_id, criado_por from public.instrutores where user_id is not null order by user_id`,
    );
    expect(cards.rows).toHaveLength(2);
    expect(cards.rows.every((c) => c.criado_por === admin)).toBe(true);

    const au = await db.query<{ detalhes: { cartoes_criados: number } }>(
      `select detalhes from public.academy_auditoria where acao = 'instrutores_acrescentados'`,
    );
    expect(au.rows).toHaveLength(1);
    expect(au.rows[0]!.detalhes.cartoes_criados).toBe(2);

    // De novo, como convidado: não duplica nem cria outro cartão, só troca o papel.
    const r2 = await rpc<Instrutores>(admin, ACRESCENTAR, [
      SOC,
      [],
      [instrutor],
      "convidado",
    ]);
    expect(r2.do_curso).toHaveLength(3);
    expect(
      r2.do_curso.find((v) => v.instrutor.da_equipe && !v.instrutor.eu)!.papel,
    ).toBe("convidado");
    expect(
      (
        await db.query(`select 1 from public.instrutores where user_id = $1`, [
          instrutor,
        ])
      ).rows,
    ).toHaveLength(1);
  });

  it("o cartão criado é o mesmo que a pessoa edita em Perfil de instrutor", async () => {
    await rpc(admin, ACRESCENTAR, [SOC, [], [instrutor], "instrutor"]);
    const p = await rpc<Perfil>(instrutor, `public.academy_adm_meu_perfil()`);
    expect(p.id).not.toBeNull();
    expect(p.eu).toBe(true);
  });

  it("recusa quem não é da equipe, papel errado, lista vazia e quem não cuida do curso", async () => {
    expect(
      await erroDe(rpc(admin, ACRESCENTAR, [SOC, [], [aluno], "instrutor"])),
    ).toMatch(/fora_da_equipe/);
    expect(
      await erroDe(rpc(admin, ACRESCENTAR, [SOC, [], [instrutor], "chefe"])),
    ).toMatch(/papel_invalido/);
    expect(
      await erroDe(rpc(admin, ACRESCENTAR, [SOC, [], [], "instrutor"])),
    ).toMatch(/invalid_payload/);
    expect(
      await erroDe(
        rpc(instrutor, ACRESCENTAR, [CF, [], [instrutor], "instrutor"]),
      ),
    ).toMatch(/sem_permissao/);
    expect(
      await erroDe(rpc(aluno, `public.academy_adm_instrutores($1)`, [SOC])),
    ).toMatch(/sem_permissao/);
    expect(
      (await db.query(`select 1 from public.instrutores`)).rows,
    ).toHaveLength(0);
  });

  it("instrutor do curso também acrescenta", async () => {
    const r = await rpc<Instrutores>(instrutor, ACRESCENTAR, [
      SOC,
      [],
      [instrutor],
      "instrutor",
    ]);
    expect(r.do_curso).toHaveLength(1);
    expect(r.do_curso[0]!.instrutor.eu).toBe(true);
  });
});
