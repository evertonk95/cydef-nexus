// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo, uuid } from "./banco";

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

async function rpc<T>(uid: string, sql: string, params: unknown[] = []): Promise<T> {
  const [r] = await como<{ r: T }>(db, "authenticated", `select ${sql} r`, params, uid);
  return r!.r;
}

interface AulaAdm {
  id: string;
  modulo_id: string;
  ordem: number;
  numero: number;
  titulo: string;
  publicado: boolean;
  video_ref: string | null;
}
interface ModuloAdm {
  id: string;
  ordem: number;
  titulo: string;
  aulas: AulaAdm[];
}
interface CursoAdm {
  slug: string;
  publicado: boolean;
  modulos: ModuloAdm[];
  requisitos: { nota_minima_final: number; carga_horaria_h: number | null };
}

async function curso(uid = admin, slug = CF) {
  return rpc<CursoAdm>(uid, `public.academy_adm_curso($1)`, [slug]);
}

function numeros(c: CursoAdm): number[] {
  return c.modulos.flatMap((m) => m.aulas.map((a) => a.numero));
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  instrutor = (await criarAluno(db, "instrutor@exemplo.com")).userId;
  aluno = (await criarAluno(db, "aluno@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin'), ($2, 'instrutor')`, [admin, instrutor]);
  await db.query(`insert into public.academy_equipe_cursos (user_id, curso_slug) values ($1, $2)`, [instrutor, SOC]);
}, 60_000);

describe("quem pode usar o painel", () => {
  it("academy_adm_eu: null para aluno, papel e cursos para a equipe", async () => {
    expect(await rpc(aluno, `public.academy_adm_eu()`)).toBeNull();
    expect(await rpc(instrutor, `public.academy_adm_eu()`)).toEqual({ papel: "instrutor", cursos: [SOC] });
    const eu = await rpc<{ papel: string; cursos: string[] }>(admin, `public.academy_adm_eu()`);
    expect(eu.papel).toBe("admin");
    expect(eu.cursos).toContain(CF);
  });

  it("aluno não lê nem escreve nada do painel", async () => {
    expect(await erroDe(rpc(aluno, `public.academy_adm_cursos()`))).toContain("sem_permissao");
    expect(await erroDe(rpc(aluno, `public.academy_adm_curso($1)`, [CF]))).toContain("sem_permissao");
    expect(await erroDe(rpc(aluno, `public.academy_adm_salvar_curso($1, $2::jsonb)`, [CF, JSON.stringify({ titulo: "Invadido" })]))).toContain(
      "sem_permissao",
    );
    expect(await erroDe(rpc(aluno, `public.academy_adm_boletim()`))).toContain("sem_permissao");
  });

  it("sem sessão: nao_autenticado", async () => {
    const [r] = await como<{ r: unknown }>(db, "authenticated", `select public.academy_adm_eu() r`, [], null);
    expect(r!.r).toBeNull();
    expect(await erroDe(como(db, "authenticated", `select public.academy_adm_cursos()`, [], null))).toContain("nao_autenticado");
  });

  it("instrutor só vê e edita os cursos dele", async () => {
    const lista = await rpc<{ slug: string }[]>(instrutor, `public.academy_adm_cursos()`);
    expect(lista.map((c) => c.slug)).toEqual([SOC]);
    expect(await erroDe(curso(instrutor, CF))).toContain("sem_permissao");
    expect((await curso(instrutor, SOC)).slug).toBe(SOC);
  });

  it("instrutor não publica curso, não muda gratuito e não mexe no Boletim nem na equipe", async () => {
    expect(await erroDe(rpc(instrutor, `public.academy_adm_salvar_curso($1, $2::jsonb)`, [SOC, JSON.stringify({ publicado: false })]))).toContain(
      "sem_permissao",
    );
    expect(await erroDe(rpc(instrutor, `public.academy_adm_salvar_curso($1, $2::jsonb)`, [SOC, JSON.stringify({ gratuito: false })]))).toContain(
      "sem_permissao",
    );
    const ok = await rpc<CursoAdm & { titulo: string }>(instrutor, `public.academy_adm_salvar_curso($1, $2::jsonb)`, [
      SOC,
      JSON.stringify({ titulo: "Fundamentos para SOC (revisado)" }),
    ]);
    expect(ok.titulo).toBe("Fundamentos para SOC (revisado)");
    expect(await erroDe(rpc(instrutor, `public.academy_adm_boletim()`))).toContain("sem_permissao");
    expect(await erroDe(rpc(instrutor, `public.academy_adm_equipe()`))).toContain("sem_permissao");
    expect(await erroDe(rpc(instrutor, `public.academy_adm_salvar_curso(null, $1::jsonb)`, [JSON.stringify({ slug: "novo", titulo: "Novo curso" })]))).toContain(
      "sem_permissao",
    );
  });

  it("nenhuma tabela nova é legível direto por authenticated", async () => {
    for (const t of ["academy_equipe", "academy_equipe_cursos", "academy_auditoria"]) {
      expect(await erroDe(como(db, "authenticated", `select * from public.${t}`, [], admin))).toMatch(/permission denied/);
    }
  });
});

describe("aulas", () => {
  it("cria no fim do módulo, renumera o curso e só publica com vídeo", async () => {
    const antes = await curso();
    const m1 = antes.modulos.find((m) => m.ordem === 1)!;
    const nova = await rpc<AulaAdm>(admin, `public.academy_adm_salvar_aula(null, $1::jsonb)`, [
      JSON.stringify({ modulo_id: m1.id, titulo: "Aula nova de teste", resumo: "Resumo", duracao_seg: 300 }),
    ]);
    expect(nova.ordem).toBe(m1.aulas.length + 1);
    expect(nova.publicado).toBe(false);

    const depois = await curso();
    const ns = numeros(depois);
    expect(ns).toEqual(ns.map((_, i) => i + 1));
    expect(ns.length).toBe(numeros(antes).length + 1);

    expect(await erroDe(rpc(admin, `public.academy_adm_salvar_aula($1, $2::jsonb)`, [nova.id, JSON.stringify({ publicado: true })]))).toContain(
      "aula_sem_video",
    );
    expect(
      await erroDe(rpc(admin, `public.academy_adm_salvar_aula($1, $2::jsonb)`, [nova.id, JSON.stringify({ video_provedor: "youtube", video_ref: "a b" })])),
    ).toContain("video_invalido");
    const pub = await rpc<AulaAdm>(admin, `public.academy_adm_salvar_aula($1, $2::jsonb)`, [
      nova.id,
      JSON.stringify({ video_provedor: "youtube", video_ref: "iKAWeoCtbmA", publicado: true }),
    ]);
    expect(pub.publicado).toBe(true);
    expect(pub.video_ref).toBe("iKAWeoCtbmA");
  });

  it("valida título e duração", async () => {
    const m1 = (await curso()).modulos.find((m) => m.ordem === 1)!;
    expect(
      await erroDe(rpc(admin, `public.academy_adm_salvar_aula(null, $1::jsonb)`, [JSON.stringify({ modulo_id: m1.id, titulo: "x", duracao_seg: 300 })])),
    ).toContain("titulo_invalido");
    expect(
      await erroDe(rpc(admin, `public.academy_adm_salvar_aula(null, $1::jsonb)`, [JSON.stringify({ modulo_id: m1.id, titulo: "Aula ok", duracao_seg: 5 })])),
    ).toContain("duracao_invalida");
  });

  it("move a aula no módulo e entre módulos, sempre com numeração contínua", async () => {
    const c = await curso();
    const m1 = c.modulos.find((m) => m.ordem === 1)!;
    const m2 = c.modulos.find((m) => m.ordem === 2)!;
    const [primeira, segunda] = m1.aulas;

    const r = await rpc<CursoAdm>(admin, `public.academy_adm_mover_aula($1, 1)`, [primeira!.id]);
    const m1r = r.modulos.find((m) => m.id === m1.id)!;
    expect(m1r.aulas[0]!.id).toBe(segunda!.id);
    expect(m1r.aulas[1]!.id).toBe(primeira!.id);
    expect(await erroDe(rpc(admin, `public.academy_adm_mover_aula($1, -1)`, [segunda!.id]))).toContain("limite");

    await rpc(admin, `public.academy_adm_salvar_aula($1, $2::jsonb)`, [primeira!.id, JSON.stringify({ modulo_id: m2.id })]);
    const d = await curso();
    const m1d = d.modulos.find((m) => m.id === m1.id)!;
    const m2d = d.modulos.find((m) => m.id === m2.id)!;
    expect(m1d.aulas.map((a) => a.ordem)).toEqual(m1d.aulas.map((_, i) => i + 1));
    expect(m2d.aulas.at(-1)!.id).toBe(primeira!.id);
    const ns = numeros(d);
    expect(ns).toEqual(ns.map((_, i) => i + 1));
  });

  it("não exclui aula publicada nem com progresso; exclui rascunho", async () => {
    const c = await curso();
    const publicada = c.modulos.flatMap((m) => m.aulas).find((a) => a.publicado)!;
    expect(await erroDe(rpc(admin, `public.academy_adm_excluir_aula($1)`, [publicada.id]))).toContain("aula_em_uso");

    const m1 = c.modulos.find((m) => m.ordem === 1)!;
    const rascunho = await rpc<AulaAdm>(admin, `public.academy_adm_salvar_aula(null, $1::jsonb)`, [
      JSON.stringify({ modulo_id: m1.id, titulo: "Rascunho", duracao_seg: 300 }),
    ]);
    await db.query(`insert into public.progresso_aulas (user_id, aula_id, posicao_seg) values ($1, $2, 10)`, [aluno, rascunho.id]);
    expect(await erroDe(rpc(admin, `public.academy_adm_excluir_aula($1)`, [rascunho.id]))).toContain("aula_em_uso");
    await db.query(`delete from public.progresso_aulas where aula_id = $1`, [rascunho.id]);

    const depois = await rpc<CursoAdm>(admin, `public.academy_adm_excluir_aula($1)`, [rascunho.id]);
    expect(depois.modulos.flatMap((m) => m.aulas).some((a) => a.id === rascunho.id)).toBe(false);
  });
});

describe("módulos", () => {
  it("cria no fim, renomeia, move sem tocar na Introdução e só exclui módulo vazio", async () => {
    const c = await rpc<CursoAdm>(admin, `public.academy_adm_salvar_modulo($1, null, $2)`, [CF, "Módulo de teste"]);
    const ultimo = c.modulos.at(-1)!;
    expect(ultimo.titulo).toBe("Módulo de teste");
    expect(ultimo.ordem).toBe(c.modulos.length - 1);

    const intro = c.modulos.find((m) => m.ordem === 0)!;
    expect(await erroDe(rpc(admin, `public.academy_adm_mover_modulo($1, 1)`, [intro.id]))).toContain("limite");
    const m1 = c.modulos.find((m) => m.ordem === 1)!;
    expect(await erroDe(rpc(admin, `public.academy_adm_mover_modulo($1, -1)`, [m1.id]))).toContain("limite");

    const movido = await rpc<CursoAdm>(admin, `public.academy_adm_mover_modulo($1, -1)`, [ultimo.id]);
    expect(movido.modulos.find((m) => m.id === ultimo.id)!.ordem).toBe(ultimo.ordem - 1);
    const ns = numeros(movido);
    expect(ns).toEqual(ns.map((_, i) => i + 1));

    expect(await erroDe(rpc(admin, `public.academy_adm_excluir_modulo($1)`, [m1.id]))).toContain("modulo_nao_vazio");
    const sem = await rpc<CursoAdm>(admin, `public.academy_adm_excluir_modulo($1)`, [ultimo.id]);
    expect(sem.modulos.map((m) => m.ordem)).toEqual(sem.modulos.map((_, i) => i));
  });
});

describe("questões", () => {
  interface QuestaoAdm {
    id: string;
    publicado: boolean;
    em_uso: boolean;
    alternativas: { ordem: number; texto: string; correta: boolean }[];
  }
  const alternativas = (correta: number, n = 4) =>
    Array.from({ length: n }, (_, i) => ({ texto: `Alternativa ${i + 1}`, correta: i === correta }));

  it("cria, valida a correta e publica", async () => {
    const m1 = (await curso()).modulos.find((m) => m.ordem === 1)!;
    const dados = { curso_slug: CF, modulo_id: m1.id, enunciado: "Qual é a pergunta de teste?", explicacao: "Porque sim.", alternativas: alternativas(0) };
    const lista = await rpc<QuestaoAdm[]>(admin, `public.academy_adm_salvar_questao(null, $1::jsonb)`, [JSON.stringify(dados)]);
    const q = lista.at(-1)!;
    expect(q.publicado).toBe(false);
    expect(q.alternativas.filter((a) => a.correta)).toHaveLength(1);

    expect(
      await erroDe(
        rpc(admin, `public.academy_adm_salvar_questao(null, $1::jsonb)`, [
          JSON.stringify({ ...dados, alternativas: [...alternativas(0, 2), { texto: "Outra", correta: true }] }),
        ]),
      ),
    ).toContain("correta_invalida");
    expect(
      await erroDe(rpc(admin, `public.academy_adm_salvar_questao(null, $1::jsonb)`, [JSON.stringify({ ...dados, alternativas: alternativas(0, 1) })])),
    ).toContain("alternativas_invalidas");
    expect(await erroDe(rpc(admin, `public.academy_adm_salvar_questao(null, $1::jsonb)`, [JSON.stringify({ ...dados, enunciado: "curta" })]))).toContain(
      "enunciado_invalido",
    );

    const pub = await rpc<QuestaoAdm[]>(admin, `public.academy_adm_salvar_questao($1, $2::jsonb)`, [q.id, JSON.stringify({ publicado: true })]);
    expect(pub.find((x) => x.id === q.id)!.publicado).toBe(true);
  });

  it("troca a correta mantendo o id de cada posição", async () => {
    const lista = await rpc<QuestaoAdm[]>(admin, `public.academy_adm_salvar_questao(null, $1::jsonb)`, [
      JSON.stringify({ curso_slug: CF, modulo_id: null, enunciado: "Pergunta da avaliação final", alternativas: alternativas(0) }),
    ]);
    const q = lista.at(-1)!;
    const ids = (await db.query<{ id: string }>(`select id from public.questoes_alternativas where questao_id = $1 order by ordem`, [q.id])).rows;
    await rpc(admin, `public.academy_adm_salvar_questao($1, $2::jsonb)`, [q.id, JSON.stringify({ alternativas: alternativas(2) })]);
    const depois = (await db.query<{ id: string; correta: boolean }>(`select id, correta from public.questoes_alternativas where questao_id = $1 order by ordem`, [q.id]))
      .rows;
    expect(depois.map((r) => r.id)).toEqual(ids.map((r) => r.id));
    expect(depois.map((r) => r.correta)).toEqual([false, false, true, false]);
  });

  it("questão já respondida não sai; sem resposta sai", async () => {
    const m1 = (await curso()).modulos.find((m) => m.ordem === 1)!;
    const lista = await rpc<QuestaoAdm[]>(admin, `public.academy_adm_salvar_questao(null, $1::jsonb)`, [
      JSON.stringify({ curso_slug: CF, modulo_id: m1.id, enunciado: "Pergunta já respondida", alternativas: alternativas(1) }),
    ]);
    const q = lista.at(-1)!;
    await db.query(
      `insert into public.tentativas_modulo (user_id, modulo_id, acertos, total, nota, aprovado, respostas) values ($1, $2, 1, 1, 100, true, $3::jsonb)`,
      [aluno, m1.id, JSON.stringify([{ questao: q.id, alternativa: uuid() }])],
    );
    expect(await erroDe(rpc(admin, `public.academy_adm_excluir_questao($1)`, [q.id]))).toContain("questao_em_uso");
    await db.query(`delete from public.tentativas_modulo where modulo_id = $1`, [m1.id]);
    const restante = await rpc<QuestaoAdm[]>(admin, `public.academy_adm_excluir_questao($1)`, [q.id]);
    expect(restante.some((x) => x.id === q.id)).toBe(false);
  });

  it("instrutor não cria questão em curso que não é dele", async () => {
    expect(
      await erroDe(
        rpc(instrutor, `public.academy_adm_salvar_questao(null, $1::jsonb)`, [
          JSON.stringify({ curso_slug: CF, enunciado: "Pergunta fora do curso", alternativas: alternativas(0) }),
        ]),
      ),
    ).toContain("sem_permissao");
  });
});

describe("requisitos, Boletim e equipe", () => {
  it("salva requisitos válidos e recusa fora da faixa", async () => {
    const c = await rpc<CursoAdm>(admin, `public.academy_adm_salvar_requisitos($1, $2::jsonb)`, [
      CF,
      JSON.stringify({ nota_minima_final: 85, carga_horaria_h: 7.5 }),
    ]);
    expect(c.requisitos.nota_minima_final).toBe(85);
    expect(Number(c.requisitos.carga_horaria_h)).toBe(7.5);
    expect(await erroDe(rpc(admin, `public.academy_adm_salvar_requisitos($1, $2::jsonb)`, [CF, JSON.stringify({ nota_minima_final: 150 })]))).toContain(
      "requisitos_invalidos",
    );
  });

  it("Boletim: cria, publica e o aluno passa a ver", async () => {
    const lista = await rpc<{ id: string; publicado: boolean }[]>(admin, `public.academy_adm_salvar_boletim(null, $1::jsonb)`, [
      JSON.stringify({ tipo: "atualizacao", titulo: "Aula nova no ar", publicado: true }),
    ]);
    expect(lista[0]!.publicado).toBe(true);
    const visto = await como<{ titulo: string }>(db, "authenticated", `select titulo from public.boletim`, [], aluno);
    expect(visto.map((b) => b.titulo)).toContain("Aula nova no ar");
    expect(
      await erroDe(rpc(admin, `public.academy_adm_salvar_boletim(null, $1::jsonb)`, [JSON.stringify({ tipo: "aula", titulo: "Link ruim", link: "http://x" })])),
    ).toContain("link_invalido");
  });

  it("equipe: adiciona instrutor por e-mail, protege o último admin", async () => {
    const outro = await criarAluno(db, "matheus@exemplo.com");
    const [{ email }] = (await db.query<{ email: string }>(`select email from auth.users where id = $1`, [outro.userId])).rows as [{ email: string }];
    const equipe = await rpc<{ user_id: string; papel: string; cursos: string[] }[]>(admin, `public.academy_adm_definir_equipe($1, 'instrutor', $2)`, [
      email.toUpperCase(),
      [SOC],
    ]);
    expect(equipe.find((e) => e.user_id === outro.userId)).toMatchObject({ papel: "instrutor", cursos: [SOC] });

    expect(await erroDe(rpc(admin, `public.academy_adm_definir_equipe($1, 'instrutor', $2)`, ["ninguem@exemplo.com", [SOC]]))).toContain(
      "usuario_inexistente",
    );
    expect(await erroDe(rpc(admin, `public.academy_adm_definir_equipe($1, 'instrutor', $2)`, [email, []]))).toContain("cursos_invalidos");

    const [{ email: meu }] = (await db.query<{ email: string }>(`select email from auth.users where id = $1`, [admin])).rows as [{ email: string }];
    expect(await erroDe(rpc(admin, `public.academy_adm_definir_equipe($1, 'instrutor', $2)`, [meu, [SOC]]))).toContain("ultimo_admin");
    expect(await erroDe(rpc(admin, `public.academy_adm_remover_equipe($1)`, [admin]))).toContain("ultimo_admin");
  });

  it("toda escrita fica na auditoria com quem fez", async () => {
    await rpc(admin, `public.academy_adm_salvar_modulo($1, null, $2)`, [CF, "Auditado"]);
    const [linha] = (
      await db.query<{ user_id: string; acao: string }>(`select user_id, acao from public.academy_auditoria order by id desc limit 1`)
    ).rows;
    expect(linha).toEqual({ user_id: admin, acao: "modulo_criado" });
  });
});
