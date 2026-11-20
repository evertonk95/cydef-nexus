// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo, uuid } from "./banco";

const SOC = "soc-analyst";
const BLUE = "blue-team-advanced";
const CF = "cybersecurity-fundamentals";
const PROD_SOC = 1001;
const PROD_TRILHA = 2002;
const PROD_PLATAFORMA = 3003;

let db: PGlite;
let admin: string;
let instrutor: string;
let n = 0;

interface Resultado {
  duplicado: boolean;
  resultado: string;
  email?: string;
  conta_existe?: boolean;
  produto?: string;
}
interface Concessao {
  id: string;
  email: string;
  situacao: string;
  escopo: string;
  cursos: string[];
  conta: boolean;
  fim: string | null;
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

/** Aviso da Hotmart como a Edge Function entrega ao banco. */
async function hotmart(evento: string, transacao: string, produto: number, email: string, extra: Record<string, unknown> = {}) {
  n += 1;
  const corpo = { evento_id: `ev-${n}-${transacao}`, evento, transacao, produto_id: produto, email, nome: "Bia Compradora", situacao: "APPROVED", ocorrido_em: "1763560000000", ...extra };
  const [r] = await como<{ r: Resultado }>(db, "service_role", `select public.academy_hotmart_processar($1::jsonb) r`, [JSON.stringify(corpo)]);
  return r!.r;
}

async function matriculas(user: string) {
  const r = await db.query<{ curso_slug: string; origem: string }>(
    `select curso_slug, origem from public.matriculas where user_id = $1 order by curso_slug`,
    [user],
  );
  return r.rows.map((m) => `${m.curso_slug}:${m.origem}`);
}

/** Comprador que nunca se pré-inscreveu: só o usuário de login, sem aluno. */
async function usuarioSemLead(email: string) {
  const id = uuid();
  await db.query(`insert into auth.users (id, email) values ($1, $2)`, [id, email]);
  return id;
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  instrutor = (await criarAluno(db, "instrutor@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin'), ($2, 'instrutor')`, [admin, instrutor]);
  await db.query(`update public.cursos_vitrine set hotmart_produto_id = $1 where curso_slug = $2`, [PROD_SOC, SOC]);
  await db.query(
    `insert into public.academy_produtos (hotmart_produto_id, nome, escopo, trilha_slug, duracao_dias) values
       ($1, 'Trilha Blue Team', 'trilha', 'blue-team', null),
       ($2, 'Academy completa por 12 meses', 'plataforma', null, 365)`,
    [PROD_TRILHA, PROD_PLATAFORMA],
  );
}, 60_000);

describe("compra pela Hotmart", () => {
  it("aprovação libera o curso para quem já é aluno; aviso repetido e compra completa não duplicam", async () => {
    const { userId } = await criarAluno(db, "bia@exemplo.com");
    const r = await hotmart("PURCHASE_APPROVED", "HP0001", PROD_SOC, "Bia@Exemplo.com");
    expect(r).toMatchObject({ duplicado: false, resultado: "liberado", email: "bia@exemplo.com", conta_existe: true, produto: "SOC Analyst: Formação Completa" });
    expect(await matriculas(userId)).toEqual([`${SOC}:compra`]);

    const [ev] = (await db.query<{ evento_id: string }>(`select evento_id from public.academy_hotmart_eventos limit 1`)).rows;
    const [dup] = await como<{ r: Resultado }>(db, "service_role", `select public.academy_hotmart_processar($1::jsonb) r`, [
      JSON.stringify({ evento_id: ev!.evento_id, evento: "PURCHASE_APPROVED", transacao: "HP0001", produto_id: PROD_SOC, email: "bia@exemplo.com" }),
    ]);
    expect(dup!.r).toMatchObject({ duplicado: true, resultado: "liberado" });
    expect((await hotmart("PURCHASE_COMPLETE", "HP0001", PROD_SOC, "bia@exemplo.com")).resultado).toBe("ignorado");
    expect((await db.query(`select 1 from public.academy_concessoes`)).rows).toHaveLength(1);
  });

  it("reembolso, chargeback, contestação e cancelamento retiram o acesso; progresso, conta e curso gratuito ficam", async () => {
    const { userId } = await criarAluno(db, "bia@exemplo.com");
    await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], userId);
    await hotmart("PURCHASE_APPROVED", "HP0002", PROD_SOC, "bia@exemplo.com");
    const [aula] = (await db.query<{ id: string }>(
      `select a.id from public.aulas a join public.modulos m on m.id = a.modulo_id where m.curso_slug = $1 limit 1`, [CF])).rows;
    await db.query(`insert into public.progresso_aulas (user_id, aula_id, posicao_seg) values ($1, $2, 30)`, [userId, aula!.id]);

    expect((await hotmart("PURCHASE_REFUNDED", "HP0002", PROD_SOC, "bia@exemplo.com")).resultado).toBe("encerrado");
    expect(await matriculas(userId)).toEqual([`${CF}:gratuito`, `fundamentos-para-soc:gratuito`].sort());
    expect((await db.query(`select 1 from public.progresso_aulas where user_id = $1`, [userId])).rows).toHaveLength(1);
    expect((await db.query(`select 1 from public.alunos where user_id = $1`, [userId])).rows).toHaveLength(1);
    expect((await hotmart("PURCHASE_CHARGEBACK", "HP0002", PROD_SOC, "bia@exemplo.com")).resultado).toBe("ja_encerrado");

    for (const [i, evento] of ["PURCHASE_CHARGEBACK", "PURCHASE_PROTEST", "PURCHASE_CANCELED"].entries()) {
      await hotmart("PURCHASE_APPROVED", `HP01${i}`, PROD_SOC, "bia@exemplo.com");
      expect(await matriculas(userId)).toContain(`${SOC}:compra`);
      expect((await hotmart(evento, `HP01${i}`, PROD_SOC, "bia@exemplo.com")).resultado).toBe("encerrado");
      expect(await matriculas(userId)).not.toContain(`${SOC}:compra`);
    }
  });

  it("reembolso que chega antes da aprovação impede a liberação", async () => {
    expect((await hotmart("PURCHASE_REFUNDED", "HP0003", PROD_SOC, "bia@exemplo.com")).resultado).toBe("ja_encerrado");
    expect((await hotmart("PURCHASE_APPROVED", "HP0003", PROD_SOC, "bia@exemplo.com")).resultado).toBe("ja_encerrado");
    expect((await db.query(`select 1 from public.academy_concessoes`)).rows).toEqual([]);
  });

  it("produto desconhecido e eventos sem efeito ficam só registrados", async () => {
    expect((await hotmart("PURCHASE_APPROVED", "HP0004", 999, "bia@exemplo.com")).resultado).toBe("produto_desconhecido");
    expect((await hotmart("PURCHASE_BILLET_PRINTED", "HP0005", PROD_SOC, "bia@exemplo.com")).resultado).toBe("ignorado");
    expect((await db.query(`select 1 from public.academy_concessoes`)).rows).toEqual([]);
    expect((await db.query(`select resultado from public.academy_hotmart_eventos order by recebido_em`)).rows).toHaveLength(2);
    expect(await erroDe(hotmart("PURCHASE_APPROVED", "HP 0006", PROD_SOC, "bia@exemplo.com"))).toMatch(/check|violates/);
  });

  it("trilha vale como estava no dia da compra", async () => {
    const { userId } = await criarAluno(db, "bia@exemplo.com");
    await hotmart("PURCHASE_APPROVED", "HP0007", PROD_TRILHA, "bia@exemplo.com");
    expect(await matriculas(userId)).toEqual([`${BLUE}:compra`, `incident-investigation:compra`]);
    // Curso que entra na trilha depois não entra na compra antiga.
    await db.query(`insert into public.trilha_cursos (trilha_slug, curso_slug, ordem) values ('blue-team', 'malware-analysis', 3)`);
    await rpc(admin, `public.academy_adm_conceder($1::jsonb)`, [JSON.stringify({ email: "outra@exemplo.com", escopo: "curso", curso: SOC })]);
    await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], userId);
    expect(await matriculas(userId)).not.toContain("malware-analysis:compra");
  });

  it("plataforma cobre todos os cursos pagos por 12 meses e vence sozinha", async () => {
    const { userId } = await criarAluno(db, "bia@exemplo.com");
    await hotmart("PURCHASE_APPROVED", "HP0008", PROD_PLATAFORMA, "bia@exemplo.com");
    const pagas = (await matriculas(userId)).filter((m) => m.endsWith(":compra"));
    expect(pagas).toHaveLength(6);
    const [c] = (await db.query<{ dias: number }>(`select extract(day from fim - inicio)::int dias from public.academy_concessoes`)).rows;
    expect(c!.dias).toBe(365);

    await db.query(`update public.academy_concessoes set inicio = now() - interval '366 days', fim = now() - interval '1 day'`);
    const [r] = await como<{ r: number }>(db, "service_role", `select public.academy_expirar_concessoes() r`);
    expect(r!.r).toBe(1);
    expect((await matriculas(userId)).filter((m) => m.endsWith(":compra"))).toEqual([]);
  });
});

describe("quem compra sem pré-inscrição", () => {
  it("pode pedir o link, vira aluno sem lead e já entra com o curso", async () => {
    const [antes] = await como<{ r: { elegivel: boolean } }>(db, "service_role", `select public.academy_elegibilidade('novo@exemplo.com') r`);
    expect(antes!.r.elegivel).toBe(false);

    await hotmart("PURCHASE_APPROVED", "HP0009", PROD_SOC, "novo@exemplo.com", { nome: "Carlos Novo" });
    const [el] = await como<{ r: Record<string, unknown> }>(db, "service_role", `select public.academy_elegibilidade('Novo@Exemplo.com') r`);
    expect(el!.r).toMatchObject({ elegivel: true, aluno: false, lead_id: null, comprador: true, nome: "Carlos Novo" });

    const user = await usuarioSemLead("novo@exemplo.com");
    await como(db, "service_role", `select public.academy_provisionar_aluno($1, null, $2)`, [user, "Carlos Novo"]);
    expect(await matriculas(user)).toEqual([`${SOC}:compra`]);
    const [aluno] = (await db.query<{ nome: string; lead_id: string | null }>(`select nome, lead_id from public.alunos where user_id = $1`, [user])).rows;
    expect(aluno).toEqual({ nome: "Carlos Novo", lead_id: null });
  });

  it("sem concessão ativa, não vira aluno sem pré-inscrição", async () => {
    const user = await usuarioSemLead("ninguem@exemplo.com");
    expect(await erroDe(como(db, "service_role", `select public.academy_provisionar_aluno($1, null, 'X Y')`, [user]))).toMatch(/lead_inelegivel/);
    await hotmart("PURCHASE_APPROVED", "HP0010", PROD_SOC, "ninguem@exemplo.com");
    await hotmart("PURCHASE_REFUNDED", "HP0010", PROD_SOC, "ninguem@exemplo.com");
    expect(await erroDe(como(db, "service_role", `select public.academy_provisionar_aluno($1, null, 'X Y')`, [user]))).toMatch(/lead_inelegivel/);
  });
});

describe("painel do admin", () => {
  it("libera manualmente, transfere para outro e-mail e revoga com motivo", async () => {
    const velho = (await criarAluno(db, "pessoal@exemplo.com")).userId;
    const novo = (await criarAluno(db, "trabalho@exemplo.com")).userId;
    await hotmart("PURCHASE_APPROVED", "HP0011", PROD_SOC, "pessoal@exemplo.com");
    expect(await matriculas(velho)).toContain(`${SOC}:compra`);

    const [c] = await rpc<Concessao[]>(admin, `public.academy_adm_concessoes('pessoal')`);
    expect(c).toMatchObject({ email: "pessoal@exemplo.com", situacao: "ativa", escopo: "curso", conta: true });
    expect(await erroDe(rpc(admin, `public.academy_adm_transferir_concessao($1, 'pessoal@exemplo.com')`, [c!.id]))).toMatch(/mesmo_email/);
    const t = await rpc<Concessao>(admin, `public.academy_adm_transferir_concessao($1, ' Trabalho@Exemplo.com ')`, [c!.id]);
    expect(t.email).toBe("trabalho@exemplo.com");
    expect(await matriculas(velho)).not.toContain(`${SOC}:compra`);
    expect(await matriculas(novo)).toContain(`${SOC}:compra`);

    const m = await rpc<Concessao>(admin, `public.academy_adm_conceder($1::jsonb)`, [
      JSON.stringify({ email: "pessoal@exemplo.com", escopo: "curso", curso: BLUE, dias: 30, motivo: "conferência" }),
    ]);
    expect(m.fim).not.toBeNull();
    expect(await matriculas(velho)).toContain(`${BLUE}:cortesia`);
    expect(await erroDe(rpc(admin, `public.academy_adm_revogar_concessao($1, 'x')`, [m.id]))).toMatch(/motivo_obrigatorio/);
    await rpc(admin, `public.academy_adm_revogar_concessao($1, 'Liberado por engano')`, [m.id]);
    expect(await matriculas(velho)).not.toContain(`${BLUE}:cortesia`);

    const audit = await db.query<{ acao: string }>(`select acao from public.academy_auditoria where acao like 'concessao%' order by id`);
    expect(audit.rows.map((a) => a.acao)).toEqual(["concessao_transferida", "concessao_criada", "concessao_revogada"]);
  });

  it("recusa dados ruins na liberação manual", async () => {
    const conceder = (d: Record<string, unknown>) => rpc(admin, `public.academy_adm_conceder($1::jsonb)`, [JSON.stringify(d)]);
    expect(await erroDe(conceder({ email: "sem-arroba", escopo: "curso", curso: SOC }))).toMatch(/email_invalido/);
    expect(await erroDe(conceder({ email: "a@b.com", escopo: "tudo" }))).toMatch(/escopo_invalido/);
    expect(await erroDe(conceder({ email: "a@b.com", escopo: "curso", curso: CF }))).toMatch(/curso_inexistente/);
    expect(await erroDe(conceder({ email: "a@b.com", escopo: "plataforma", dias: 0 }))).toMatch(/dias_invalidos/);
  });

  it("cadastra produto de trilha e de plataforma; um código serve a um item só", async () => {
    const salvar = (d: Record<string, unknown>) => rpc<{ produtos: unknown[]; cursos: unknown[] }>(admin, `public.academy_adm_salvar_produto($1::jsonb)`, [JSON.stringify(d)]);
    const r = await salvar({ hotmart_produto_id: "4004", nome: "Trilha SOC completa", escopo: "trilha", trilha: "soc" });
    expect(r.produtos).toHaveLength(3);
    expect(r.cursos).toEqual([expect.objectContaining({ hotmart_produto_id: PROD_SOC, curso: SOC })]);
    expect(await erroDe(salvar({ hotmart_produto_id: String(PROD_SOC), nome: "Outro", escopo: "plataforma" }))).toMatch(/produto_em_uso/);
    expect(await erroDe(db.query(`update public.cursos_vitrine set hotmart_produto_id = $1 where curso_slug = $2`, [PROD_TRILHA, BLUE]))).toMatch(
      /produto_em_uso/,
    );
    expect(await erroDe(salvar({ hotmart_produto_id: "5005", nome: "Trilha vazia", escopo: "trilha", trilha: "red-team" }))).toMatch(/trilha_vazia/);
    const plat = await salvar({ hotmart_produto_id: "6006", nome: "Plataforma", escopo: "plataforma" });
    expect(plat.produtos).toContainEqual(expect.objectContaining({ hotmart_produto_id: 6006, duracao_dias: 365 }));
  });

  it("só o admin usa o painel de vendas; ninguém lê as tabelas nem chama o processamento da Hotmart", async () => {
    expect(await erroDe(rpc(instrutor, `public.academy_adm_concessoes('')`))).toMatch(/sem_permissao/);
    expect(await erroDe(rpc(instrutor, `public.academy_adm_produtos()`))).toMatch(/sem_permissao/);
    for (const tabela of ["academy_concessoes", "academy_produtos", "academy_hotmart_eventos"]) {
      expect(await erroDe(como(db, "authenticated", `select * from public.${tabela}`, [], admin))).toMatch(/permission denied/);
      expect(await erroDe(como(db, "anon", `select * from public.${tabela}`))).toMatch(/permission denied/);
    }
    expect(await erroDe(como(db, "authenticated", `select public.academy_hotmart_processar('{}'::jsonb)`, [], admin))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "anon", `select public.academy_hotmart_processar('{}'::jsonb)`))).toMatch(/permission denied/);
  });
});
