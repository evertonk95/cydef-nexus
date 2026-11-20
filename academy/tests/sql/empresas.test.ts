// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo, uuid } from "./banco";

const SOC = "soc-analyst";
const CF = "cybersecurity-fundamentals";

let db: PGlite;
let admin: string;

interface Empresa {
  id: string;
  nome: string;
  vagas: number;
  usadas: number;
  ativos: number;
  convites: number;
  gestoras: string[];
  situacao: string;
  fim: string;
}
interface Membro {
  id: string;
  email: string;
  gestor: boolean;
  situacao: string;
  nome: string | null;
  ultimo_acesso: string | null;
  cursos: { slug: string; total: number; concluidas: number; aprovado: boolean; certificado_em: string | null }[];
}
interface Painel {
  empresa: Empresa;
  membros: Membro[];
}
interface Minhas {
  convites: { id: string; empresa: string; gestor: boolean; alvo: string }[];
  empresas: { id: string; membro: string; empresa: string; gestor: boolean; aviso_versao: string }[];
}
interface Aviso {
  chave: string;
  email: string;
  tipo: string;
  acesso: string;
  dias: number;
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

const hoje = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);
const dias = (n: number) => new Date(Date.now() - 3 * 3600_000 + n * 86_400_000).toISOString().slice(0, 10);

async function criarEmpresa(dados: Record<string, unknown> = {}): Promise<Empresa> {
  return rpc<Empresa>(admin, `public.academy_adm_salvar_empresa($1::jsonb)`, [
    JSON.stringify({
      nome: "Banco Exemplo", tipo: "consultoria", escopo: "plataforma", inicio: hoje(), fim: dias(180),
      vagas: 3, observacao: "SOC 24x7", gestor_email: "gestora@banco.com", ...dados,
    }),
  ]);
}

/** Pessoa convidada que nunca se pré-inscreveu: entra como a academy-acesso faz. */
async function entrarConvidado(email: string): Promise<string> {
  const el = await servico<{ elegivel: boolean; convidado?: boolean; lead_id: string | null }>(`public.academy_elegibilidade($1)`, [email]);
  expect(el).toMatchObject({ elegivel: true, convidado: true, lead_id: null });
  const id = uuid();
  await db.query(`insert into auth.users (id, email) values ($1, $2)`, [id, email]);
  await como(db, "service_role", `select public.academy_provisionar_aluno($1, null, '')`, [id]);
  await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], id);
  return id;
}

async function aceitarPrimeiro(user: string): Promise<Minhas> {
  const m = await rpc<Minhas>(user, `public.academy_minhas_empresas()`);
  return rpc<Minhas>(user, `public.academy_aceitar_convite($1)`, [m.convites[0]!.id]);
}

/** Os cursos pagos do seed ainda não têm aulas: cria uma publicada. */
async function aulaPaga(curso = SOC): Promise<string> {
  const [m] = (await db.query<{ id: string }>(`select id from public.modulos where curso_slug = $1 order by ordem limit 1`, [curso])).rows;
  const [a] = (await db.query<{ id: string }>(
    `insert into public.aulas (modulo_id, ordem, numero, titulo, duracao_seg, publicado) values ($1, 99, 99, 'Aula de teste', 600, true) returning id`,
    [m!.id])).rows;
  return a!.id;
}

async function pagas(user: string) {
  const r = await db.query<{ curso_slug: string }>(
    `select curso_slug from public.matriculas where user_id = $1 and origem <> 'gratuito' order by 1`, [user]);
  return r.rows.map((x) => x.curso_slug);
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin')`, [admin]);
}, 60_000);

describe("contrato e convites", () => {
  it("admin cadastra a empresa, a gestora entra sem pré-inscrição e aceita com o aviso vigente", async () => {
    const e = await criarEmpresa();
    expect(e).toMatchObject({ nome: "Banco Exemplo", vagas: 3, usadas: 1, ativos: 0, convites: 1, gestoras: ["gestora@banco.com"], situacao: "vigente" });

    const gestora = await entrarConvidado("gestora@banco.com");
    expect(await pagas(gestora)).toEqual([]);
    const antes = await rpc<Minhas>(gestora, `public.academy_minhas_empresas()`);
    expect(antes.convites).toMatchObject([{ empresa: "Banco Exemplo", gestor: true, alvo: "Plataforma toda" }]);

    const depois = await aceitarPrimeiro(gestora);
    const [aviso] = (await db.query<{ versao: string }>(`select versao from public.aviso_privacidade where vigente`)).rows;
    expect(depois.convites).toEqual([]);
    expect(depois.empresas).toMatchObject([{ empresa: "Banco Exemplo", gestor: true, aviso_versao: aviso!.versao }]);
    const cobertos = (await db.query<{ slug: string }>(`select slug from public.cursos where not gratuito order by 1`)).rows.map((x) => x.slug);
    expect(await pagas(gestora)).toEqual(cobertos);
    const [c] = (await db.query<{ origem: string; empresa_id: string }>(`select origem, empresa_id from public.academy_concessoes`)).rows;
    expect(c).toEqual({ origem: "empresa", empresa_id: e.id });
  });

  it("a gestora convida, quem já ocupa vaga é ignorado e o limite de vagas vale para convites pendentes", async () => {
    const e = await criarEmpresa();
    const gestora = await entrarConvidado("gestora@banco.com");
    await aceitarPrimeiro(gestora);

    const r = await rpc<{ convidados: number; ja_na_empresa: string[] }>(gestora, `public.academy_empresa_convidar($1, $2, false)`,
      [e.id, ["Ana@Banco.com", "ana@banco.com ", "gestora@banco.com"]]);
    expect(r).toEqual({ convidados: 1, ja_na_empresa: ["gestora@banco.com"] });
    expect(await erroDe(rpc(gestora, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["bruno@banco.com", "caio@banco.com"]]))).toMatch(/sem_vagas/);
    expect(await erroDe(rpc(gestora, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["nao-e-email"]]))).toMatch(/email_invalido/);
    await rpc(gestora, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["bruno@banco.com"]]);

    const p = await rpc<Painel>(gestora, `public.academy_empresa_painel($1)`, [e.id]);
    expect(p.empresa).toMatchObject({ usadas: 3, ativos: 1, convites: 2 });
    const ana = p.membros.find((m) => m.email === "ana@banco.com")!;
    await rpc(gestora, `public.academy_empresa_cancelar_convite($1)`, [ana.id]);
    await rpc(gestora, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["caio@banco.com"]]);
    expect(await erroDe(rpc(admin, `public.academy_adm_salvar_empresa($1::jsonb)`, [JSON.stringify({
      id: e.id, nome: "Banco Exemplo", tipo: "consultoria", escopo: "plataforma", inicio: hoje(), fim: dias(180), vagas: 2,
    })]))).toMatch(/vagas_insuficientes/);
  });

  it("só a gestora da empresa (ou o admin) vê o painel, e cada um aceita só o próprio convite", async () => {
    const e = await criarEmpresa();
    const gestora = await entrarConvidado("gestora@banco.com");
    await aceitarPrimeiro(gestora);
    await rpc(gestora, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["ana@banco.com"]]);
    const ana = await entrarConvidado("ana@banco.com");
    const intrusa = (await criarAluno(db, "intrusa@exemplo.com")).userId;

    const conviteAna = (await rpc<Minhas>(ana, `public.academy_minhas_empresas()`)).convites[0]!.id;
    expect(await erroDe(rpc(intrusa, `public.academy_aceitar_convite($1)`, [conviteAna]))).toMatch(/convite_inexistente/);
    await rpc(ana, `public.academy_aceitar_convite($1)`, [conviteAna]);

    expect(await erroDe(rpc(ana, `public.academy_empresa_painel($1)`, [e.id]))).toMatch(/sem_permissao/);
    expect(await erroDe(rpc(intrusa, `public.academy_empresa_painel($1)`, [e.id]))).toMatch(/sem_permissao/);
    expect(await erroDe(rpc(ana, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["x@banco.com"]]))).toMatch(/sem_permissao/);
    expect((await rpc<Painel>(admin, `public.academy_empresa_painel($1)`, [e.id])).membros).toHaveLength(2);
    expect(await erroDe(rpc(gestora, `public.academy_adm_empresas()`))).toMatch(/sem_permissao/);
  });

  it("a gestora vê aulas, aprovação e certificado só dos cursos do contrato, sem nota", async () => {
    const e = await criarEmpresa({ escopo: "curso", curso: SOC });
    const gestora = await entrarConvidado("gestora@banco.com");
    await aceitarPrimeiro(gestora);
    await rpc(gestora, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["ana@banco.com"]]);
    const ana = await entrarConvidado("ana@banco.com");
    await aceitarPrimeiro(ana);
    expect(await pagas(ana)).toEqual([SOC]);

    const [livre] = (await db.query<{ id: string }>(
      `select a.id from public.aulas a join public.modulos m on m.id = a.modulo_id where m.curso_slug = $1 limit 1`, [CF])).rows;
    for (const aula of [await aulaPaga(), livre!.id]) {
      await db.query(`insert into public.progresso_aulas (user_id, aula_id, posicao_seg, concluida_em) values ($1, $2, 60, now())`, [ana, aula]);
    }
    await db.query(
      `insert into public.provas_finais (user_id, curso_slug, questoes, enviada_em, acertos, total, nota, aprovado)
       values ($1, $2, array[gen_random_uuid()], now(), 9, 10, 90, true)`, [ana, SOC]);

    const p = await rpc<Painel>(gestora, `public.academy_empresa_painel($1)`, [e.id]);
    const m = p.membros.find((x) => x.email === "ana@banco.com")!;
    expect(m.nome).toBe("ana");
    expect(m.ultimo_acesso).not.toBeNull();
    expect(m.cursos).toHaveLength(1);
    expect(m.cursos[0]).toMatchObject({ slug: SOC, concluidas: 1, aprovado: true, certificado_em: null });
    expect(JSON.stringify(p)).not.toMatch(/nota|acertos|respostas/);
  });
});

describe("mudanças no contrato e saída", () => {
  it("prorrogar o contrato atualiza o acesso; encerrar retira de todos e cancela convites", async () => {
    const e = await criarEmpresa();
    const gestora = await entrarConvidado("gestora@banco.com");
    await aceitarPrimeiro(gestora);
    await rpc(gestora, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["ana@banco.com"]]);

    await rpc(admin, `public.academy_adm_salvar_empresa($1::jsonb)`, [JSON.stringify({
      id: e.id, nome: "Banco Exemplo", tipo: "consultoria", escopo: "trilha", trilha: "blue-team", inicio: hoje(), fim: dias(400), vagas: 10,
    })]);
    const [c] = (await db.query<{ escopo: string; dias: number }>(
      `select escopo, extract(day from fim - now())::int as dias from public.academy_concessoes where empresa_id = $1`, [e.id])).rows;
    expect(c!.escopo).toBe("trilha");
    expect(c!.dias).toBeGreaterThanOrEqual(399);
    const trilha = (await db.query<{ curso_slug: string }>(
      `select tc.curso_slug from public.trilha_cursos tc join public.cursos k on k.slug = tc.curso_slug
        where tc.trilha_slug = 'blue-team' and not k.gratuito order by 1`)).rows.map((x) => x.curso_slug);
    expect(await pagas(gestora)).toEqual(trilha);

    expect(await erroDe(rpc(admin, `public.academy_adm_encerrar_empresa($1, 'x')`, [e.id]))).toMatch(/motivo_obrigatorio/);
    await rpc(admin, `public.academy_adm_encerrar_empresa($1, 'Contrato de consultoria encerrado')`, [e.id]);
    expect(await pagas(gestora)).toEqual([]);
    expect(await erroDe(rpc(gestora, `public.academy_empresa_painel($1)`, [e.id]))).toMatch(/contrato_encerrado/);
    const situacoes = (await db.query<{ email: string; situacao: string }>(
      `select email, situacao from public.academy_empresa_membros order by email`)).rows;
    expect(situacoes).toEqual([{ email: "ana@banco.com", situacao: "cancelado" }, { email: "gestora@banco.com", situacao: "ativo" }]);
    expect((await servico<{ elegivel: boolean }>(`public.academy_elegibilidade('ana@banco.com')`)).elegivel).toBe(false);
  });

  it("remover e sair retiram o acesso e mantêm o progresso; a empresa não fica sem gestora", async () => {
    const e = await criarEmpresa();
    const gestora = await entrarConvidado("gestora@banco.com");
    await aceitarPrimeiro(gestora);
    await rpc(gestora, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["ana@banco.com", "bruno@banco.com"]]);
    const ana = await entrarConvidado("ana@banco.com");
    const bruno = await entrarConvidado("bruno@banco.com");
    await aceitarPrimeiro(ana);
    await aceitarPrimeiro(bruno);
    await db.query(`insert into public.progresso_aulas (user_id, aula_id, posicao_seg) values ($1, $2, 30)`, [ana, await aulaPaga()]);

    let p = await rpc<Painel>(gestora, `public.academy_empresa_painel($1)`, [e.id]);
    const id = (email: string) => p.membros.find((m) => m.email === email)!.id;
    expect(await erroDe(rpc(gestora, `public.academy_empresa_remover($1)`, [id("gestora@banco.com")]))).toMatch(/ultima_gestora/);
    expect(await erroDe(rpc(gestora, `public.academy_empresa_definir_gestor($1, false)`, [id("gestora@banco.com")]))).toMatch(/ultima_gestora/);

    p = await rpc<Painel>(gestora, `public.academy_empresa_remover($1)`, [id("ana@banco.com")]);
    expect(p.membros.map((m) => m.email)).toEqual(["gestora@banco.com", "bruno@banco.com"]);
    expect(await pagas(ana)).toEqual([]);
    expect((await db.query(`select 1 from public.progresso_aulas where user_id = $1`, [ana])).rows).toHaveLength(1);
    expect((await db.query(`select 1 from public.matriculas where user_id = $1 and origem = 'gratuito'`, [ana])).rows.length).toBeGreaterThan(0);

    await rpc(gestora, `public.academy_empresa_definir_gestor($1, true)`, [id("bruno@banco.com")]);
    const minhas = await rpc<Minhas>(gestora, `public.academy_minhas_empresas()`);
    await rpc(gestora, `public.academy_sair_empresa($1)`, [minhas.empresas[0]!.membro]);
    expect(await pagas(gestora)).toEqual([]);
    expect((await rpc<Painel>(bruno, `public.academy_empresa_painel($1)`, [e.id])).empresa.usadas).toBe(1);

    // Pode ser convidada de novo depois de sair.
    await rpc(bruno, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["ana@banco.com"]]);
    expect((await rpc<Minhas>(ana, `public.academy_minhas_empresas()`)).convites).toHaveLength(1);
  });

  it("recusar o convite libera a vaga e não dá acesso", async () => {
    const e = await criarEmpresa({ vagas: 2 });
    const gestora = await entrarConvidado("gestora@banco.com");
    await aceitarPrimeiro(gestora);
    await rpc(gestora, `public.academy_empresa_convidar($1, $2, false)`, [e.id, ["ana@banco.com"]]);
    const ana = await entrarConvidado("ana@banco.com");
    const m = await rpc<Minhas>(ana, `public.academy_minhas_empresas()`);
    await rpc(ana, `public.academy_recusar_convite($1)`, [m.convites[0]!.id]);
    expect(await pagas(ana)).toEqual([]);
    expect((await rpc<Painel>(gestora, `public.academy_empresa_painel($1)`, [e.id])).empresa.usadas).toBe(1);
  });

  it("e-mail do convite: pendentes saem uma vez; reenviar respeita o intervalo", async () => {
    const e = await criarEmpresa();
    const pend = await rpc<{ empresa: string; quem_convida: string; convites: { id: string; email: string; gestor: boolean }[] }>(
      admin, `public.academy_empresa_convites_pendentes($1)`, [e.id]);
    expect(pend).toMatchObject({ empresa: "Banco Exemplo", quem_convida: "Ana Teste", convites: [{ email: "gestora@banco.com", gestor: true }] });
    expect(await rpc<number>(admin, `public.academy_empresa_convites_enviados($1, $2)`, [e.id, [pend.convites[0]!.id]])).toBe(1);
    expect((await rpc<{ convites: unknown[] }>(admin, `public.academy_empresa_convites_pendentes($1)`, [e.id])).convites).toEqual([]);
    expect(await erroDe(rpc(admin, `public.academy_empresa_reenviar_convite($1)`, [pend.convites[0]!.id]))).toMatch(/aguarde_reenvio/);
    await db.query(`update public.academy_empresa_membros set convite_enviado_em = now() - interval '1 hour'`);
    await rpc(admin, `public.academy_empresa_reenviar_convite($1)`, [pend.convites[0]!.id]);
    expect((await rpc<{ convites: unknown[] }>(admin, `public.academy_empresa_convites_pendentes($1)`, [e.id])).convites).toHaveLength(1);
  });

  it("valida o cadastro do contrato", async () => {
    const base = { nome: "Time X", tipo: "plano", escopo: "plataforma", inicio: hoje(), fim: dias(30), vagas: 5, gestor_email: "g@x.com" };
    const salvar = (d: Record<string, unknown>) => erroDe(rpc(admin, `public.academy_adm_salvar_empresa($1::jsonb)`, [JSON.stringify({ ...base, ...d })]));
    expect(await salvar({ tipo: "outro" })).toMatch(/tipo_invalido/);
    expect(await salvar({ escopo: "curso", curso: CF })).toMatch(/curso_inexistente/);
    expect(await salvar({ fim: dias(-1) })).toMatch(/periodo_invalido/);
    expect(await salvar({ vagas: 0 })).toMatch(/vagas_invalidas/);
    expect(await salvar({ gestor_email: "x" })).toMatch(/email_invalido/);
    expect(await salvar({ inicio: "amanhã" })).toMatch(/invalid_payload/);
    const outro = (await criarAluno(db, "outro@exemplo.com")).userId;
    expect(await erroDe(rpc(outro, `public.academy_adm_salvar_empresa($1::jsonb)`, [JSON.stringify(base)]))).toMatch(/sem_permissao/);
  });
});

describe("aviso de vencimento", () => {
  async function avisos() {
    return servico<Aviso[]>(`public.academy_avisos_vencimento()`);
  }

  it("plano de 12 meses: 30 e 7 dias antes, uma vez cada; não avisa liberação curta nem quem renovou", async () => {
    const { userId } = await criarAluno(db, "bia@exemplo.com");
    await db.query(`insert into public.academy_produtos (hotmart_produto_id, nome, escopo, duracao_dias) values (3003, 'Academy 12 meses', 'plataforma', 365)`);
    const conceder = (fim: string, inicio = "now() - interval '345 days'", origem = "manual") =>
      db.query(`insert into public.academy_concessoes (email, user_id, origem, escopo, inicio, fim, hotmart_transacao)
                values ('bia@exemplo.com', $1, '${origem}', 'plataforma', ${inicio}, ${fim}, ${origem === "hotmart" ? "'HP9' || floor(random()*1e6)::text" : "null"})
                returning id`, [userId]);
    const [c] = (await conceder("now() + interval '20 days'", "now() - interval '345 days'", "hotmart")).rows as { id: string }[];
    await conceder("now() + interval '5 days'", "now() - interval '5 days'");

    let a = await avisos();
    expect(a).toMatchObject([{ chave: `concessao:${c!.id}:30d`, email: "bia@exemplo.com", tipo: "plano", acesso: "Plataforma toda" }]);
    expect(a[0]!.dias).toBeGreaterThanOrEqual(19);
    expect(await servico<number>(`public.academy_avisos_registrar($1::jsonb)`, [JSON.stringify(a)])).toBe(1);
    expect(await avisos()).toEqual([]);

    await db.query(`update public.academy_concessoes set fim = now() + interval '6 days' where id = $1`, [c!.id]);
    a = await avisos();
    expect(a.map((x) => x.chave)).toEqual([`concessao:${c!.id}:7d`]);
    await servico(`public.academy_avisos_registrar($1::jsonb)`, [JSON.stringify(a)]);

    await conceder("now() + interval '400 days'", "now()", "hotmart");
    await db.query(`update public.academy_concessoes set fim = now() + interval '25 days', inicio = now() - interval '300 days' where id = $1`, [c!.id]);
    await db.query(`delete from public.academy_avisos_enviados`);
    expect(await avisos()).toEqual([]);
    expect(await erroDe(servico(`public.academy_avisos_registrar($1::jsonb)`, [JSON.stringify({})]))).toMatch(/invalid_payload/);
    expect(await servico<number>(`public.academy_avisos_registrar($1::jsonb)`, [JSON.stringify([{ chave: "qualquer", email: "x@y.com" }])])).toBe(0);
  });

  it("empresa: gestora recebe 30 dias antes e o membro 7 dias antes", async () => {
    const e = await criarEmpresa({ fim: dias(25) });
    const gestora = await entrarConvidado("gestora@banco.com");
    await aceitarPrimeiro(gestora);
    let a = await avisos();
    expect(a).toMatchObject([{ chave: `empresa:${e.id}:30d`, email: "gestora@banco.com", tipo: "gestora", acesso: "Banco Exemplo" }]);
    await servico(`public.academy_avisos_registrar($1::jsonb)`, [JSON.stringify(a)]);

    await rpc(admin, `public.academy_adm_salvar_empresa($1::jsonb)`, [JSON.stringify({
      id: e.id, nome: "Banco Exemplo", tipo: "consultoria", escopo: "plataforma", inicio: hoje(), fim: dias(5), vagas: 3,
    })]);
    a = await avisos();
    expect(a).toMatchObject([{ email: "gestora@banco.com", tipo: "membro", acesso: "Banco Exemplo" }]);
    expect(a[0]!.chave).toMatch(/^concessao:.*:7d$/);
    expect(a[0]!.dias).toBe(5);
  });

  it("anon e authenticated não chamam as funções de aviso", async () => {
    const outro = (await criarAluno(db, "x@exemplo.com")).userId;
    expect(await erroDe(rpc(outro, `public.academy_avisos_vencimento()`))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "anon", `select public.academy_avisos_registrar('[]'::jsonb)`))).toMatch(/permission denied/);
  });
});

describe("contrato que começa depois", () => {
  it("o acesso só vale a partir do início, e a rotina diária liga quando chega o dia", async () => {
    const e = await criarEmpresa({ inicio: dias(10), fim: dias(100) });
    const gestora = await entrarConvidado("gestora@banco.com");
    await aceitarPrimeiro(gestora);
    expect(await pagas(gestora)).toEqual([]);
    expect((await rpc<Painel>(gestora, `public.academy_empresa_painel($1)`, [e.id])).empresa.situacao).toBe("futura");
    await db.query(`update public.academy_concessoes set inicio = now() - interval '1 hour', criado_em = now() - interval '2 days' where empresa_id = $1`, [e.id]);
    expect(await servico<number>(`public.academy_expirar_concessoes()`)).toBe(1);
    expect((await pagas(gestora)).length).toBeGreaterThan(0);
  });
});
