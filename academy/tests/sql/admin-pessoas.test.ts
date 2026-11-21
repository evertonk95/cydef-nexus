// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, criarLead, novoBanco, publicarCatalogo } from "./banco";

/** Fase 20 (0032): Indicadores e Pessoas, só para admin. */

const CF = "cybersecurity-fundamentals";

interface CursoFicha { slug: string; progresso: { aulas: number; concluidas: number } }
interface Ficha {
  perfil: Record<string, unknown>;
  papel: string | null;
  pre_inscricao: Record<string, unknown> | null;
  cursos: CursoFicha[];
  missoes: { tentativas: number; aprovadas: number };
}
interface CursoInd { slug: string; matriculados: number; comecaram: number; concluiram: number; media_conclusao: number }
interface Indicadores {
  pre_inscricoes: { total: number };
  contas: { total: number };
  funil: { comecaram: number; concluiram_curso: number };
  por_dia: { pre_inscricoes: number }[];
  cursos: CursoInd[];
}
let db: PGlite;
let admin: string;
let instrutor: string;
let ana: string;

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

interface Lista {
  total: number;
  itens: { tipo: string; user_id: string | null; nome: string; email: string; papel: string | null; cursos: number }[];
}
const pessoas = (uid: string, busca: string | null = null, filtro = "todos", lim = 50, off = 0) =>
  rpc<Lista>(uid, `public.academy_adm_pessoas($1, $2, $3, $4)`, [busca, filtro, lim, off]);

async function concluirAulas(user: string, curso: string, quantas: number) {
  await db.query(
    `insert into public.progresso_aulas (user_id, aula_id, posicao_seg, concluida_em)
     select $1, a.id, 60, now() from public.aulas a join public.modulos m on m.id = a.modulo_id
      where m.curso_slug = $2 and a.publicado order by m.ordem, a.ordem limit $3`,
    [user, curso, quantas],
  );
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  admin = (await criarAluno(db, "admin@cydef.com.br")).userId;
  instrutor = (await criarAluno(db, "instrutor@cydef.com.br")).userId;
  ana = (await criarAluno(db, "ana@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin'), ($2, 'instrutor')`, [admin, instrutor]);
  await db.query(`insert into public.academy_equipe_cursos (user_id, curso_slug) values ($1, $2)`, [instrutor, CF]);
  await rpc(ana, `public.academy_registrar_acesso()`);
  await criarLead(db, "so-pre@exemplo.com");
}, 60_000);

describe("permissões", () => {
  it("só admin chama; instrutor e aluno recebem sem_permissao; anon nem chega", async () => {
    for (const uid of [instrutor, ana]) {
      expect(await erroDe(rpc(uid, `public.academy_adm_indicadores()`))).toMatch(/sem_permissao/);
      expect(await erroDe(pessoas(uid))).toMatch(/sem_permissao/);
      expect(await erroDe(rpc(uid, `public.academy_adm_pessoa($1)`, [ana]))).toMatch(/sem_permissao/);
      expect(await erroDe(rpc(uid, `public.academy_adm_salvar_perfil($1, '{"nome":"X Y"}'::jsonb)`, [ana]))).toMatch(/sem_permissao/);
    }
    expect(await erroDe(como(db, "anon", `select public.academy_adm_indicadores()`))).toMatch(/permission denied/);
  });
});

describe("Pessoas", () => {
  it("lista contas e quem só fez a pré-inscrição, com papel e cursos", async () => {
    const l = await pessoas(admin);
    expect(l.total).toBe(4);
    const porEmail = Object.fromEntries(l.itens.map((i) => [i.email, i]));
    expect(porEmail["so-pre@exemplo.com"]).toMatchObject({ tipo: "pre_inscricao", user_id: null, papel: null });
    expect(porEmail["admin@cydef.com.br"]).toMatchObject({ tipo: "conta", papel: "admin" });
    expect(porEmail["instrutor@cydef.com.br"]).toMatchObject({ papel: "instrutor" });
    expect(porEmail["ana@exemplo.com"]!.cursos).toBeGreaterThan(0);
  });

  it("busca por nome ou e-mail, sem curinga do usuário, e filtra", async () => {
    expect((await pessoas(admin, "ANA@")).itens.map((i) => i.email)).toEqual(["ana@exemplo.com"]);
    expect((await pessoas(admin, "%")).total).toBe(0);
    expect((await pessoas(admin, null, "sem_conta")).itens.map((i) => i.email)).toEqual(["so-pre@exemplo.com"]);
    expect((await pessoas(admin, null, "equipe")).total).toBe(2);
    expect((await pessoas(admin, null, "contas")).total).toBe(3);
    expect(await erroDe(pessoas(admin, null, "outro"))).toMatch(/invalid_payload/);
  });

  it("pagina sem repetir", async () => {
    const a = await pessoas(admin, null, "todos", 2, 0);
    const b = await pessoas(admin, null, "todos", 2, 2);
    expect(a.total).toBe(4);
    expect(new Set([...a.itens, ...b.itens].map((i) => i.email)).size).toBe(4);
  });

  it("quem entrou com o e-mail de uma pré-inscrição aparece uma vez só, como conta", async () => {
    const l = await pessoas(admin, "ana@exemplo.com");
    expect(l.itens).toHaveLength(1);
    expect(l.itens[0]!.tipo).toBe("conta");
  });
});

describe("ficha e edição", () => {
  it("mostra perfil, papel, cursos com progresso, certificados e missões", async () => {
    await concluirAulas(ana, CF, 1);
    const f = await rpc<Ficha>(admin, `public.academy_adm_pessoa($1)`, [ana]);
    expect(f.perfil).toMatchObject({ email: "ana@exemplo.com", nome: "Ana Teste" });
    expect(f.papel).toBeNull();
    expect(f.pre_inscricao).toMatchObject({ perfil: expect.any(String) });
    const cf = f.cursos.find((c) => c.slug === CF)!;
    expect(cf.progresso.concluidas).toBe(1);
    expect(cf.progresso.aulas).toBeGreaterThan(1);
    expect(f.missoes).toEqual({ tentativas: 0, aprovadas: 0 });
    expect(await erroDe(rpc(admin, `public.academy_adm_pessoa($1)`, ["00000000-0000-4000-8000-000000000000"]))).toMatch(/pessoa_inexistente/);
  });

  it("admin edita o perfil de outra pessoa, o e-mail não muda e a auditoria guarda só os campos", async () => {
    const f = await rpc<Ficha>(admin, `public.academy_adm_salvar_perfil($1, $2::jsonb)`, [
      ana,
      JSON.stringify({ nome: "Ana Maria Teste", empresa: "Empresa X", telefone: "+55 61 99999-0000", email: "outro@exemplo.com" }),
    ]);
    expect(f.perfil).toMatchObject({ nome: "Ana Maria Teste", empresa: "Empresa X", email: "ana@exemplo.com" });
    const [a] = (await db.query<{ acao: string; alvo: string; detalhes: { campos: string[] }; user_id: string }>(
      `select acao, alvo, detalhes, user_id from public.academy_auditoria where acao = 'perfil_editado'`,
    )).rows;
    expect(a).toMatchObject({ alvo: ana, user_id: admin });
    expect(a!.detalhes.campos).toEqual(["empresa", "nome", "telefone"]);
    expect(JSON.stringify(a!.detalhes)).not.toContain("Empresa X");
  });

  it("a edição do admin passa pela mesma validação do aluno", async () => {
    expect(await erroDe(rpc(admin, `public.academy_adm_salvar_perfil($1, '{"nome":"Ana","linkedin":"https://evil.com"}'::jsonb)`, [ana]))).toMatch(/linkedin_invalido/);
  });
});

describe("Indicadores", () => {
  it("conta pré-inscrições, contas, funil e o resumo por curso", async () => {
    await concluirAulas(ana, CF, 100);
    const i = await rpc<Indicadores>(admin, `public.academy_adm_indicadores()`);
    expect(i.pre_inscricoes.total).toBe(4);
    expect(i.contas.total).toBe(3);
    expect(i.funil.comecaram).toBe(1);
    expect(i.funil.concluiram_curso).toBe(1);
    expect(i.por_dia).toHaveLength(30);
    expect(i.por_dia.at(-1)!.pre_inscricoes).toBe(4);
    const cf = i.cursos.find((c) => c.slug === CF)!;
    expect(cf).toMatchObject({ concluiram: 1, comecaram: 1 });
    expect(cf.matriculados).toBeGreaterThanOrEqual(1);
    expect(cf.media_conclusao).toBeGreaterThan(0);
  });
});
