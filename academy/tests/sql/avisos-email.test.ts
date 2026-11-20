// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo } from "./banco";

/**
 * Fase 18 (0028): e-mails de certificado emitido e de aula nova.
 * Certificado: sempre. Aula nova: só para quem ligou o aviso em Minha conta.
 */

const CF = "cybersecurity-fundamentals";

let db: PGlite;

interface Certificado {
  chave: string;
  email: string;
  nome: string;
  curso: string;
  curso_slug: string;
  codigo: string;
}
interface Grupo {
  email: string;
  nome: string;
  curso: string;
  curso_slug: string;
  aulas: { chave: string; numero: number; titulo: string }[];
}

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

async function servico<T>(sql: string, params: unknown[] = []): Promise<T> {
  const [r] = await como<{ r: T }>(db, "service_role", `select ${sql} r`, params);
  return r!.r;
}

/** Aluno com matrícula nos cursos gratuitos publicados (como no primeiro acesso). */
async function aluno(email: string): Promise<string> {
  const { userId } = await criarAluno(db, email);
  await rpc(userId, `public.academy_registrar_acesso()`);
  await db.query(`update public.matriculas set criado_em = now() - interval '3 days' where user_id = $1`, [userId]);
  return userId;
}

async function aulaDoCurso(numero: number): Promise<string> {
  const r = await db.query<{ id: string }>(
    `select a.id from public.aulas a join public.modulos m on m.id = a.modulo_id where m.curso_slug = $1 and a.numero = $2`,
    [CF, numero],
  );
  return r.rows[0]!.id;
}

/** Publica a aula de novo e põe a publicação no passado (fora da janela de 30 min). */
async function publicar(id: string, haQuanto = "1 hour") {
  await db.query(`update public.aulas set publicado = false where id = $1`, [id]);
  await db.query(`update public.aulas set publicado = true where id = $1`, [id]);
  await db.query(`update public.aulas set publicada_em = now() - interval '${haQuanto}' where id = $1`, [id]);
}

async function certificar(userId: string, codigo: string, emitido = "now()") {
  await db.query(
    `insert into public.certificados (codigo, user_id, curso_slug, nome, curso_titulo, carga_horaria_h, nota_final, concluido_em, emitido_em)
     values ($1, $2, $3, 'Ana Teste', 'Cybersecurity Fundamentals', 6, 90, current_date, ${emitido})`,
    [codigo, userId, CF],
  );
}

const aulasNovas = (limite = 40) => servico<Grupo[]>(`public.academy_avisos_aulas($1)`, [limite]);
const certificados = () => servico<Certificado[]>(`public.academy_avisos_certificados()`);
const registrar = (itens: unknown[]) => servico<number>(`public.academy_avisos_registrar($1::jsonb)`, [JSON.stringify(itens)]);

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
}, 60_000);

describe("publicação da aula (gatilho)", () => {
  it("marca publicada_em quando a aula passa a publicada, e não mexe ao editar outra coisa", async () => {
    const id = await aulaDoCurso(1);
    await db.query(`update public.aulas set publicado = false, publicada_em = null where id = $1`, [id]);
    await db.query(`update public.aulas set publicado = true where id = $1`, [id]);
    const [a] = (await db.query<{ publicada_em: string | null }>(`select publicada_em from public.aulas where id = $1`, [id])).rows;
    expect(a!.publicada_em).not.toBeNull();

    await db.query(`update public.aulas set publicada_em = '2026-01-01' where id = $1`, [id]);
    await db.query(`update public.aulas set titulo = titulo || ' (rev.)' where id = $1`, [id]);
    await db.query(`update public.aulas set publicado = true where id = $1`, [id]);
    const [b] = (await db.query<{ d: string }>(`select publicada_em::date::text d from public.aulas where id = $1`, [id])).rows;
    expect(b!.d).toBe("2026-01-01");
  });
});

describe("preferência de aula nova (Minha conta)", () => {
  it("começa desligada, liga, mantém a data ao ligar de novo e desliga", async () => {
    const uid = await aluno("ana@exemplo.com");
    expect(await rpc(uid, `public.academy_meus_avisos()`)).toMatchObject({ aula_nova: false, aula_nova_desde: null });

    const ligado = await rpc<{ aula_nova: boolean; aula_nova_desde: string }>(uid, `public.academy_definir_aviso_aula_nova(true)`);
    expect(ligado.aula_nova).toBe(true);
    const de_novo = await rpc<{ aula_nova_desde: string }>(uid, `public.academy_definir_aviso_aula_nova(true)`);
    expect(de_novo.aula_nova_desde).toBe(ligado.aula_nova_desde);

    expect(await rpc(uid, `public.academy_definir_aviso_aula_nova(false)`)).toMatchObject({ aula_nova: false, aula_nova_desde: null });
    expect(await erroDe(rpc(uid, `public.academy_definir_aviso_aula_nova(null)`))).toMatch(/invalid_payload/);
  });

  it("anon não lê nem muda a preferência", async () => {
    expect(await erroDe(como(db, "anon", `select public.academy_meus_avisos()`))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "anon", `select public.academy_definir_aviso_aula_nova(true)`))).toMatch(/permission denied/);
  });
});

describe("aviso de aula nova", () => {
  it("só para quem ligou, um e-mail por curso, uma vez por aula", async () => {
    const ana = await aluno("ana@exemplo.com");
    await aluno("bia@exemplo.com"); // não ligou
    await db.query(`update public.alunos set aviso_aula_nova_desde = now() - interval '2 days' where user_id = $1`, [ana]);

    const [a2, a3] = [await aulaDoCurso(2), await aulaDoCurso(3)];
    await publicar(a2);
    await publicar(a3, "50 minutes");

    const grupos = await aulasNovas();
    expect(grupos).toHaveLength(1);
    expect(grupos[0]).toMatchObject({ email: "ana@exemplo.com", curso_slug: CF });
    expect(grupos[0]!.aulas.map((x) => x.chave)).toEqual([`aula:${a2}`, `aula:${a3}`]);

    const itens = grupos.flatMap((g) => g.aulas.map((x) => ({ chave: x.chave, email: g.email })));
    expect(await registrar(itens)).toBe(2);
    expect(await aulasNovas()).toEqual([]);
  });

  it("não avisa aula publicada há menos de 30 minutos, nem há mais de 14 dias", async () => {
    const ana = await aluno("ana@exemplo.com");
    await db.query(`update public.alunos set aviso_aula_nova_desde = now() - interval '30 days' where user_id = $1`, [ana]);
    await db.query(`update public.matriculas set criado_em = now() - interval '30 days' where user_id = $1`, [ana]);
    await publicar(await aulaDoCurso(2), "10 minutes");
    await publicar(await aulaDoCurso(3), "15 days");
    expect(await aulasNovas()).toEqual([]);
  });

  it("não avisa aula publicada antes de ligar o aviso nem antes da matrícula", async () => {
    const ana = await aluno("ana@exemplo.com");
    await publicar(await aulaDoCurso(2), "2 hours");
    await rpc(ana, `public.academy_definir_aviso_aula_nova(true)`);
    expect(await aulasNovas()).toEqual([]);

    await db.query(`update public.alunos set aviso_aula_nova_desde = now() - interval '5 days' where user_id = $1`, [ana]);
    await db.query(`update public.matriculas set criado_em = now() where user_id = $1`, [ana]);
    expect(await aulasNovas()).toEqual([]);
  });

  it("aula despublicada ou curso despublicado não gera aviso", async () => {
    const ana = await aluno("ana@exemplo.com");
    await db.query(`update public.alunos set aviso_aula_nova_desde = now() - interval '2 days' where user_id = $1`, [ana]);
    const a2 = await aulaDoCurso(2);
    await publicar(a2);
    await db.query(`update public.aulas set publicado = false where id = $1`, [a2]);
    expect(await aulasNovas()).toEqual([]);

    await publicar(a2);
    await db.query(`update public.cursos set publicado = false where slug = $1`, [CF]);
    expect(await aulasNovas()).toEqual([]);
  });

  it("respeita o teto da rodada; o resto fica para a próxima", async () => {
    for (const e of ["a@x.com", "b@x.com", "c@x.com"]) {
      const uid = await aluno(e);
      await db.query(`update public.alunos set aviso_aula_nova_desde = now() - interval '2 days' where user_id = $1`, [uid]);
    }
    await publicar(await aulaDoCurso(2));
    const primeira = await aulasNovas(2);
    expect(primeira).toHaveLength(2);
    await registrar(primeira.flatMap((g) => g.aulas.map((x) => ({ chave: x.chave, email: g.email }))));
    const segunda = await aulasNovas(2);
    expect(segunda).toHaveLength(1);
    expect(segunda[0]!.email).not.toBe(primeira[0]!.email);
  });
});

describe("aviso de certificado emitido", () => {
  it("certificado novo aparece uma vez; o antigo e o de mais de 14 dias não", async () => {
    const ana = await aluno("ana@exemplo.com");
    await certificar(ana, "CYD-AAAA-BBBB-CCCC-0001");
    const c = await certificados();
    expect(c).toMatchObject([
      { chave: "certificado:CYD-AAAA-BBBB-CCCC-0001", email: "ana@exemplo.com", curso_slug: CF, codigo: "CYD-AAAA-BBBB-CCCC-0001" },
    ]);
    expect(await registrar(c)).toBe(1);
    expect(await certificados()).toEqual([]);

    const bia = await aluno("bia@exemplo.com");
    await certificar(bia, "CYD-AAAA-BBBB-CCCC-0002", "now() - interval '20 days'");
    expect(await certificados()).toEqual([]);
  });

  it("registro aceita só as chaves conhecidas", async () => {
    expect(await registrar([{ chave: "certificado:qualquer", email: "a@b.com" }, { chave: "aula:nao-e-uuid", email: "a@b.com" }])).toBe(0);
    expect(await registrar([{ chave: "certificado:CYD-AAAA-BBBB-CCCC-0009", email: "" }])).toBe(0);
  });

  it("authenticated não chama as funções da rotina", async () => {
    const ana = await aluno("ana@exemplo.com");
    expect(await erroDe(rpc(ana, `public.academy_avisos_certificados()`))).toMatch(/permission denied/);
    expect(await erroDe(rpc(ana, `public.academy_avisos_aulas(10)`))).toMatch(/permission denied/);
  });
});
