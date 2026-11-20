// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo } from "./banco";

const CURSO = "fundamentos-para-soc";
const CERTAS = { dominio: [1], autenticacao: [1], usuario: [1], classificacao: [1], acoes: [0, 1, 2] };

let db: PGlite;
let aluno: string;
let admin: string;

interface Correcao {
  id: string;
  enunciado: string;
  escolhidas: number[];
  corretas: number[];
  explicacao: string;
  acertou: boolean;
}
interface Tentativa {
  nota: number;
  acertos: number;
  total: number;
  aprovado: boolean;
  duracao_seg: number;
  evidencias: string[];
  correcao: Correcao[];
  encerramento: string;
  competencias: { slug: string; antes: number; depois: number }[];
}
interface Missao {
  codigo: string;
  situacao: string;
  aulas_total: number;
  aulas_concluidas: number;
  evidencias: { id: string; tipo: string }[];
  perguntas: { id: string; multipla: boolean; alternativas: string[] }[];
  aberta: { iniciada_em: string } | null;
  ultima: Tentativa | null;
  aprovada: boolean;
  melhor_nota: number | null;
  encerramento: string;
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

const missao = (uid = aluno) => rpc<Missao>(uid, `public.academy_missao('msn-001')`);
const iniciar = (uid = aluno) => rpc<{ iniciada_em: string }>(uid, `public.academy_iniciar_missao('MSN-001')`);
const enviar = (respostas: unknown, evid: string[] = [], uid = aluno) =>
  rpc<Tentativa>(uid, `public.academy_enviar_missao('msn-001', $1::jsonb, $2)`, [JSON.stringify(respostas), evid]);

async function concluirAulas(uid: string, curso = CURSO) {
  await db.query(
    `insert into public.progresso_aulas (user_id, aula_id, posicao_seg, concluida_em)
     select $1, a.id, a.duracao_seg, now() from public.aulas a join public.modulos m on m.id = a.modulo_id
      where m.curso_slug = $2 and a.publicado
     on conflict (user_id, aula_id) do update set concluida_em = now()`,
    [uid, curso],
  );
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  await db.query(`update public.missoes set publicado = true where codigo = 'MSN-001'`);
  aluno = (await criarAluno(db, "aluno@exemplo.com")).userId;
  await como(db, "authenticated", `select public.academy_registrar_acesso()`, [], aluno);
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin')`, [admin]);
}, 60_000);

describe("acesso à missão", () => {
  it("vem cadastrada sem publicar, no curso Fundamentos para SOC", async () => {
    const db2 = await novoBanco();
    const [m] = (await db2.query<{ curso_slug: string; publicado: boolean; n: number }>(
      `select curso_slug, publicado, jsonb_array_length(perguntas) n from public.missoes where codigo = 'MSN-001'`)).rows;
    expect(m).toEqual({ curso_slug: CURSO, publicado: false, n: 5 });
  });

  it("bloqueada até concluir as aulas: sem evidências nem perguntas; depois, liberada e sem gabarito", async () => {
    let m = await missao();
    expect(m).toMatchObject({ codigo: "MSN-001", situacao: "aulas_pendentes", aulas_concluidas: 0, evidencias: [], perguntas: [] });
    expect(m.aulas_total).toBeGreaterThan(0);
    expect(await erroDe(iniciar())).toMatch(/missao_bloqueada/);

    await concluirAulas(aluno);
    m = await missao();
    expect(m.situacao).toBe("liberada");
    expect(m.evidencias.map((e) => e.tipo)).toEqual(["email", "cabecalhos", "tabela", "alerta"]);
    expect(m.perguntas.map((p) => p.id)).toEqual(["dominio", "autenticacao", "usuario", "classificacao", "acoes"]);
    expect(m.perguntas.find((p) => p.id === "acoes")!.multipla).toBe(true);
    expect(JSON.stringify(m.perguntas)).not.toMatch(/corretas|explicacao/);
    expect(m.encerramento).toBe("");
  });

  it("liberada com a matrícula quando o requisito é matrícula; quem não está no curso não vê", async () => {
    await db.query(`update public.missoes set requisito = 'matricula'`);
    expect((await missao()).situacao).toBe("liberada");
    await db.query(`delete from public.matriculas where user_id = $1 and curso_slug = $2`, [aluno, CURSO]);
    expect(await erroDe(missao())).toMatch(/missao_inexistente/);
    expect(await rpc<unknown[]>(aluno, `public.academy_minhas_missoes()`)).toEqual([]);
    await db.query(`insert into public.matriculas (user_id, curso_slug, origem) values ($1, $2, 'gratuito')`, [aluno, CURSO]);
    await db.query(`update public.missoes set publicado = false`);
    expect(await erroDe(missao())).toMatch(/missao_inexistente/);
  });
});

describe("investigação e correção", () => {
  beforeEach(async () => {
    await concluirAulas(aluno);
  });

  it("corrige no banco, mostra a explicação, mede o tempo e soma nas competências", async () => {
    expect(await erroDe(enviar(CERTAS))).toMatch(/missao_nao_iniciada/);
    const a = await iniciar();
    expect((await iniciar()).iniciada_em).toBe(a.iniciada_em);
    await db.query(`update public.missao_tentativas set iniciada_em = now() - interval '7 minutes'`);

    const t = await enviar(CERTAS, [" Logs do proxy · 09:15:02 m.souza POST ", "", "Cabeçalhos · Reply-To"]);
    expect(t).toMatchObject({ nota: 100, acertos: 5, total: 5, aprovado: true, evidencias: ["Logs do proxy · 09:15:02 m.souza POST", "Cabeçalhos · Reply-To"] });
    expect(t.duracao_seg).toBeGreaterThanOrEqual(420);
    expect(t.correcao[4]).toMatchObject({ id: "acoes", escolhidas: [0, 1, 2], corretas: [0, 1, 2], acertou: true });
    expect(t.correcao[0]!.explicacao).toMatch(/nortec-fin\.example/);
    expect(t.encerramento).toMatch(/trilha de Resposta/);
    const triagem = t.competencias.find((c) => c.slug === "triagem-alertas")!;
    expect(triagem.depois).toBeGreaterThan(triagem.antes);
    expect(t.competencias.map((c) => c.slug).sort()).toEqual(["analise-logs", "mitre-attack", "triagem-alertas"]);

    expect(await erroDe(enviar(CERTAS))).toMatch(/missao_nao_iniciada/);
    const m = await missao();
    expect(m).toMatchObject({ aprovada: true, melhor_nota: 100, aberta: null });
    expect(m.ultima!.nota).toBe(100);
  });

  it("erra o que não bate exatamente: múltipla escolha incompleta, índice fora e pergunta sem resposta", async () => {
    await iniciar();
    const t = await enviar({ dominio: [1], autenticacao: [1, 1], usuario: [9], acoes: [0, 1] });
    expect(t).toMatchObject({ acertos: 2, total: 5, nota: 40, aprovado: false });
    expect(t.correcao.map((c) => c.acertou)).toEqual([true, true, false, false, false]);
    expect(t.correcao[2]!.escolhidas).toEqual([]);
    expect(await erroDe((async () => {
      await iniciar();
      return enviar("tudo");
    })())).toMatch(/invalid_payload/);
  });

  it("pode refazer: vale a melhor nota, e editar a missão não muda o histórico", async () => {
    await iniciar();
    await enviar({ ...CERTAS, acoes: [0] });
    await db.query(`update public.missoes set perguntas = jsonb_set(perguntas, '{0,enunciado}', '"Texto novo da pergunta"')`);
    await iniciar();
    await enviar(CERTAS);
    await iniciar();
    await enviar({});

    const lista = await rpc<{ melhor_nota: number; aprovada: boolean; tentativas: number }[]>(aluno, `public.academy_minhas_missoes()`);
    expect(lista[0]).toMatchObject({ melhor_nota: 100, aprovada: true, tentativas: 3 });
    const notas = (await db.query<{ nota: number; enunciado: string }>(
      `select nota, correcao->0->>'enunciado' as enunciado from public.missao_tentativas order by enviada_em`)).rows;
    expect(notas).toEqual([
      { nota: 80, enunciado: "De qual domínio o e-mail veio de verdade?" },
      { nota: 100, enunciado: "Texto novo da pergunta" },
      { nota: 0, enunciado: "Texto novo da pergunta" },
    ]);
  });
});

describe("painel", () => {
  it("mostra a próxima missão e conta a missão nas competências", async () => {
    let p = await rpc<{ missao: { codigo: string; situacao: string } | null; competencias: { slug: string; percentual: number }[] }>(aluno, `public.academy_meu_painel()`);
    expect(p.missao).toMatchObject({ codigo: "MSN-001", situacao: "aulas_pendentes" });
    await concluirAulas(aluno);
    const antes = (await rpc<typeof p>(aluno, `public.academy_meu_painel()`)).competencias.find((c) => c.slug === "triagem-alertas")!;
    await iniciar();
    await enviar(CERTAS);
    p = await rpc<typeof p>(aluno, `public.academy_meu_painel()`);
    expect(p.missao).toBeNull();
    expect(p.competencias.find((c) => c.slug === "triagem-alertas")!.percentual).toBeGreaterThan(antes.percentual);
  });

  it("missão não publicada não pesa nas competências", async () => {
    await concluirAulas(aluno);
    const pct = async () =>
      (await rpc<{ slug: string; percentual: number }[]>(aluno, `public.academy_minhas_competencias()`)).find((c) => c.slug === "triagem-alertas")?.percentual ?? 0;
    const comMissaoPendente = await pct();
    await db.query(`update public.missoes set publicado = false`);
    expect(await pct()).toBeGreaterThan(comMissaoPendente);
  });
});

describe("editor do instrutor", () => {
  const base = {
    codigo: "MSN-002", titulo: "Força bruta no VPN", severidade: "media", mitre: "T1110.003", requisito: "matricula", selo: "", encerramento: "",
    briefing: "Terça, 03:12. O SIEM disparou várias falhas de login no concentrador de VPN.",
    evidencias: [{ id: "log", tipo: "tabela", titulo: "Logs da VPN", dica: "", conteudo: { colunas: ["Hora", "Usuário"], linhas: [["03:10", "j.silva"]] } }],
    perguntas: [{ id: "q1", enunciado: "Qual a técnica?", dica: "", alternativas: ["Spraying", "Phishing"], corretas: [0], explicacao: "Muitas contas, poucas senhas." }],
    competencias: [{ slug: "triagem-alertas", peso: 2 }],
    publicado: true,
  };
  const salvar = (uid: string, dados: Record<string, unknown>) =>
    rpc<{ missoes: { codigo: string; perguntas: { corretas: number[] }[]; tentativas: number; id: string }[] }>(uid, `public.academy_adm_salvar_missao($1, $2::jsonb)`, [CURSO, JSON.stringify(dados)]);

  it("admin cria e publica; o editor vê o gabarito; o aluno passa a ver a missão nova", async () => {
    const r = await salvar(admin, base);
    expect(r.missoes.map((m) => m.codigo)).toEqual(["MSN-001", "MSN-002"]);
    expect(r.missoes[1]!.perguntas[0]!.corretas).toEqual([0]);
    expect((await rpc<{ codigo: string }[]>(aluno, `public.academy_minhas_missoes()`)).map((m) => m.codigo)).toEqual(["MSN-001", "MSN-002"]);
  });

  it("valida o conteúdo e não deixa publicar incompleta", async () => {
    const erro = (d: Record<string, unknown>) => erroDe(salvar(admin, { ...base, ...d }));
    expect(await erro({ codigo: "msn2" })).toMatch(/codigo_invalido/);
    expect(await erro({ codigo: "MSN-001" })).toMatch(/codigo_em_uso/);
    expect(await erro({ severidade: "urgente" })).toMatch(/severidade_invalida/);
    expect(await erro({ briefing: "curto" })).toMatch(/briefing_invalido/);
    expect(await erro({ perguntas: [{ ...base.perguntas[0], corretas: [5] }] })).toMatch(/perguntas_invalidas/);
    expect(await erro({ perguntas: [{ ...base.perguntas[0], corretas: [0, 0] }] })).toMatch(/perguntas_invalidas/);
    expect(await erro({ evidencias: [{ ...base.evidencias[0], conteudo: { colunas: ["Hora", "Usuário"], linhas: [["03:10"]] } }] })).toMatch(/evidencias_invalidas/);
    expect(await erro({ evidencias: [{ ...base.evidencias[0], tipo: "pcap" }] })).toMatch(/evidencias_invalidas/);
    expect(await erro({ competencias: [{ slug: "nao-existe", peso: 2 }] })).toMatch(/competencias_invalidas/);
    expect(await erro({ competencias: [{ slug: "triagem-alertas", peso: 11 }] })).toMatch(/competencias_invalidas/);
    expect(await erro({ perguntas: [] })).toMatch(/missao_incompleta/);
    expect((await salvar(admin, { ...base, perguntas: [], publicado: false })).missoes).toHaveLength(2);
  });

  it("instrutor de outro curso não edita; com tentativa a missão não é excluída", async () => {
    const instrutor = (await criarAluno(db, "instrutor@exemplo.com")).userId;
    await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'instrutor')`, [instrutor]);
    await db.query(`insert into public.academy_equipe_cursos (user_id, curso_slug) values ($1, 'cybersecurity-fundamentals')`, [instrutor]);
    expect(await erroDe(salvar(instrutor, base))).toMatch(/sem_permissao/);
    expect(await erroDe(rpc(instrutor, `public.academy_adm_missoes($1)`, [CURSO]))).toMatch(/sem_permissao/);
    expect(await erroDe(rpc(aluno, `public.academy_adm_missoes($1)`, [CURSO]))).toMatch(/sem_permissao/);

    const nova = (await salvar(admin, base)).missoes.find((m) => m.codigo === "MSN-002")!;
    await concluirAulas(aluno);
    await iniciar();
    const msn1 = (await rpc<{ missoes: { id: string; codigo: string }[] }>(admin, `public.academy_adm_missoes($1)`, [CURSO])).missoes[0]!;
    expect(await erroDe(rpc(admin, `public.academy_adm_excluir_missao($1)`, [msn1.id]))).toMatch(/missao_com_tentativas/);
    const r = await rpc<{ missoes: unknown[] }>(admin, `public.academy_adm_excluir_missao($1)`, [nova.id]);
    expect(r.missoes).toHaveLength(1);
  });
});
