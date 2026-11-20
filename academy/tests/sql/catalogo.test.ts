// @vitest-environment node
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, PASTA_MIGRACOES } from "./banco";

const SOC = "soc-analyst";
const CF = "cybersecurity-fundamentals";
const CHECKOUT = "https://pay.hotmart.com/A1234567B";

let db: PGlite;
let admin: string;
let instrutor: string;
let aluno: string;

interface CursoPublico {
  slug: string;
  titulo: string;
  situacao: "em_breve" | "a_venda";
  carga_horaria_h: number | null;
  preco_centavos: number | null;
  preco_observacao: string;
  checkout_url: string | null;
  trilhas: string[];
  objetivos: string[];
  modulos: { ordem: number; titulo: string; resumo: string; aulas: { titulo: string; duracao_seg: number }[] }[];
  instrutores: { nome: string; cargo: string; papel: string }[];
}
interface Catalogo {
  trilhas: { slug: string; titulo: string; cursos: string[] }[];
  cursos: CursoPublico[];
}
interface Vitrine {
  situacao: string;
  situacao_efetiva: string;
  checkout_url: string | null;
  hotmart_produto_id: number | null;
  preco_centavos: number | null;
  preco_conferido_em: string | null;
  trilhas: { slug: string; no_curso: boolean }[];
  pendencias: string[];
}
interface TrilhaAdm {
  slug: string;
  ordem: number;
  publicado: boolean;
  cursos: { slug: string; ordem: number }[];
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

async function catalogo(): Promise<Catalogo> {
  const [r] = await como<{ r: Catalogo }>(db, "anon", `select public.academy_catalogo_publico() r`);
  return r!.r;
}

const salvar = (uid: string, curso: string, dados: Record<string, unknown>) =>
  rpc<Vitrine>(uid, `public.academy_adm_salvar_vitrine($1, $2::jsonb)`, [curso, JSON.stringify(dados)]);

beforeEach(async () => {
  db = await novoBanco();
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  instrutor = (await criarAluno(db, "instrutor@exemplo.com")).userId;
  aluno = (await criarAluno(db, "aluno@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin'), ($2, 'instrutor')`, [admin, instrutor]);
  await db.query(`insert into public.academy_equipe_cursos (user_id, curso_slug) values ($1, $2)`, [instrutor, SOC]);
}, 60_000);

describe("catálogo inicial (0020)", () => {
  it("os seis cursos que o site anunciava entram em breve, com trilhas, ementa e carga horária", async () => {
    const c = await catalogo();
    expect(c.cursos.map((x) => x.slug)).toEqual([
      "soc-analyst",
      "blue-team-advanced",
      "sc-900-prep",
      "security-plus-prep",
      "malware-analysis",
      "incident-investigation",
    ]);
    expect(c.cursos.every((x) => x.situacao === "em_breve" && x.checkout_url === null && x.preco_centavos === null)).toBe(true);

    const soc = c.cursos.find((x) => x.slug === SOC)!;
    expect(Number(soc.carga_horaria_h)).toBe(80);
    expect(soc.modulos).toHaveLength(6);
    expect(soc.modulos[0]).toMatchObject({ ordem: 1, titulo: "Introdução ao SOC", aulas: [] });
    expect(soc.objetivos).toHaveLength(5);
    expect(soc.trilhas).toEqual(["soc"]);

    // Trilha sem curso na vitrine não aparece (Red Team, GRC e ISO ainda vazias).
    expect(c.trilhas.map((t) => t.slug)).toEqual(["soc", "blue-team", "certificacoes"]);
    expect(c.trilhas[0]!.cursos).toEqual(["soc-analyst", "malware-analysis", "incident-investigation"]);
    expect(c.cursos.find((x) => x.slug === "incident-investigation")!.trilhas).toEqual(["soc", "blue-team"]);
  });

  it("curso gratuito nunca entra na vitrine paga, nem forçado direto na tabela", async () => {
    await db.query(`insert into public.cursos_vitrine (curso_slug, situacao) values ($1, 'em_breve')`, [CF]);
    expect((await catalogo()).cursos.map((x) => x.slug)).not.toContain(CF);
    expect(await erroDe(salvar(admin, CF, { situacao: "em_breve" }))).toMatch(/curso_gratuito/);
  });

  it("rodar a migração de novo não duplica ementa nem desfaz o que o admin mudou", async () => {
    await salvar(admin, SOC, { situacao: "oculto" });
    await db.exec(readFileSync(`${PASTA_MIGRACOES}/0020_academy_catalogo_publico.sql`, "utf8"));
    const r = await db.query<{ n: number }>(`select count(*)::int n from public.modulos where curso_slug = $1`, [SOC]);
    expect(r.rows[0]!.n).toBe(6);
    expect((await catalogo()).cursos.map((x) => x.slug)).not.toContain(SOC);
  });

  it("ninguém lê a tabela da vitrine direto, nem o código do produto", async () => {
    expect(await erroDe(como(db, "anon", `select * from public.cursos_vitrine`))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "authenticated", `select hotmart_produto_id from public.cursos_vitrine`, [], aluno))).toMatch(
      /permission denied/,
    );
    await db.query(`update public.cursos set publicado = true where slug = $1`, [SOC]);
    await salvar(admin, SOC, { situacao: "a_venda", checkout_url: CHECKOUT, preco_centavos: 49700, hotmart_produto_id: "770055" });
    expect(JSON.stringify(await catalogo())).not.toContain("770055");
  });
});

describe("venda pela vitrine", () => {
  it("à venda exige curso publicado, link de checkout e preço", async () => {
    expect(await erroDe(salvar(admin, SOC, { situacao: "a_venda", checkout_url: CHECKOUT, preco_centavos: 49700 }))).toMatch(
      /curso_nao_publicado/,
    );
    await db.query(`update public.cursos set publicado = true where slug = $1`, [SOC]);
    expect(await erroDe(salvar(admin, SOC, { situacao: "a_venda", preco_centavos: 49700 }))).toMatch(/venda_incompleta/);
    expect(await erroDe(salvar(admin, SOC, { situacao: "a_venda", checkout_url: CHECKOUT }))).toMatch(/venda_incompleta/);

    const v = await salvar(admin, SOC, {
      situacao: "a_venda",
      checkout_url: `${CHECKOUT}?off=ab12cd&checkoutMode=10`,
      preco_centavos: 49700,
      preco_observacao: "ou em até 12x no cartão",
    });
    expect(v).toMatchObject({ situacao: "a_venda", situacao_efetiva: "a_venda", preco_centavos: 49700 });

    const soc = (await catalogo()).cursos.find((x) => x.slug === SOC)!;
    expect(soc).toMatchObject({
      situacao: "a_venda",
      preco_centavos: 49700,
      preco_observacao: "ou em até 12x no cartão",
      checkout_url: `${CHECKOUT}?off=ab12cd&checkoutMode=10`,
    });
  });

  it("só aceita checkout da Hotmart, em https", async () => {
    for (const url of [
      "http://pay.hotmart.com/A1234567B",
      "https://pay.hotmart.com.evil.com/A1234567B",
      "https://go.hotmart.com/A1234567B",
      "https://exemplo.com/A1234567B",
      "javascript:alert(1)",
      "https://pay.hotmart.com/A1234567B?x=<script>",
      "https://pay.hotmart.com/",
    ]) {
      expect(await erroDe(salvar(admin, SOC, { checkout_url: url })), url).toMatch(/checkout_invalido/);
    }
    expect((await salvar(admin, SOC, { checkout_url: "https://checkout.hotmart.com/X9Y8Z7" })).checkout_url).toBe(
      "https://checkout.hotmart.com/X9Y8Z7",
    );
  });

  it("valida preço e produto, e um produto da Hotmart serve a um curso só", async () => {
    expect(await erroDe(salvar(admin, SOC, { preco_centavos: 50 }))).toMatch(/preco_invalido/);
    expect(await erroDe(salvar(admin, SOC, { preco_centavos: 497.5 }))).toMatch(/preco_invalido/);
    expect(await erroDe(salvar(admin, SOC, { preco_centavos: "49700" }))).toMatch(/preco_invalido/);
    expect(await erroDe(salvar(admin, SOC, { hotmart_produto_id: "12a" }))).toMatch(/produto_invalido/);
    expect(await erroDe(salvar(admin, SOC, { preco_observacao: "x".repeat(81) }))).toMatch(/observacao_invalida/);

    await salvar(admin, SOC, { hotmart_produto_id: "987654" });
    expect(await erroDe(salvar(admin, "blue-team-advanced", { hotmart_produto_id: "987654" }))).toMatch(/produto_em_uso/);
    expect((await salvar(admin, SOC, { hotmart_produto_id: "" })).hotmart_produto_id).toBeNull();
  });

  it("guarda quando o preço foi conferido: muda com o preço ou quando o admin confirma", async () => {
    const a = await salvar(admin, SOC, { preco_centavos: 49700 });
    expect(a.preco_conferido_em).not.toBeNull();
    await db.query(`update public.cursos_vitrine set preco_conferido_em = '2026-01-01T00:00:00Z' where curso_slug = $1`, [SOC]);
    const b = await salvar(admin, SOC, { preco_centavos: 49700, preco_observacao: "à vista" });
    expect(new Date(b.preco_conferido_em!).getUTCFullYear()).toBe(2026);
    expect(new Date(b.preco_conferido_em!).getUTCMonth()).toBe(0);
    const c = await salvar(admin, SOC, { conferir_preco: true });
    expect(new Date(c.preco_conferido_em!).getTime()).toBeGreaterThan(new Date("2026-02-01").getTime());
  });

  it("curso despublicado volta a em breve na vitrine e esconde o checkout", async () => {
    await db.query(`update public.cursos set publicado = true where slug = $1`, [SOC]);
    await salvar(admin, SOC, { situacao: "a_venda", checkout_url: CHECKOUT, preco_centavos: 49700 });
    await db.query(`update public.cursos set publicado = false where slug = $1`, [SOC]);
    const soc = (await catalogo()).cursos.find((x) => x.slug === SOC)!;
    expect(soc).toMatchObject({ situacao: "em_breve", checkout_url: null, preco_centavos: null });
  });

  it("mostra só aula publicada de curso publicado, e quem ensina", async () => {
    const [m] = (await db.query<{ id: string }>(`select id from public.modulos where curso_slug = $1 and ordem = 1`, [SOC])).rows;
    await db.query(
      `insert into public.aulas (modulo_id, ordem, numero, titulo, duracao_seg, publicado) values
         ($1, 1, 1, 'O que um SOC faz', 600, true), ($1, 2, 2, 'Rascunho', 600, false)`,
      [m!.id],
    );
    await db.query(
      `insert into public.instrutores (id, nome, cargo) values ('00000000-0000-4000-8000-0000000000aa', 'Everton Lima', 'Wazuh Ambassador')`,
    );
    await db.query(
      `insert into public.cursos_instrutores (curso_slug, instrutor_id, papel) values ($1, '00000000-0000-4000-8000-0000000000aa', 'instrutor')`,
      [SOC],
    );
    let soc = (await catalogo()).cursos.find((x) => x.slug === SOC)!;
    expect(soc.modulos[0]!.aulas).toEqual([]);
    expect(soc.instrutores).toEqual([expect.objectContaining({ nome: "Everton Lima", cargo: "Wazuh Ambassador", papel: "instrutor" })]);

    await db.query(`update public.cursos set publicado = true where slug = $1`, [SOC]);
    soc = (await catalogo()).cursos.find((x) => x.slug === SOC)!;
    expect(soc.modulos[0]!.aulas).toEqual([{ titulo: "O que um SOC faz", duracao_seg: 600 }]);
  });

  it("carga horária sem certificado sai da soma das aulas publicadas", async () => {
    await db.query(`update public.cursos_requisitos set carga_horaria_h = null where curso_slug = $1`, [SOC]);
    expect((await catalogo()).cursos.find((x) => x.slug === SOC)!.carga_horaria_h).toBeNull();
    const [m] = (await db.query<{ id: string }>(`select id from public.modulos where curso_slug = $1 and ordem = 1`, [SOC])).rows;
    await db.query(`insert into public.aulas (modulo_id, ordem, numero, titulo, duracao_seg, publicado) values ($1, 1, 1, 'Aula', 5400, true)`, [
      m!.id,
    ]);
    expect(Number((await catalogo()).cursos.find((x) => x.slug === SOC)!.carga_horaria_h)).toBe(1.5);
  });

  it("só o admin mexe na vitrine", async () => {
    expect(await erroDe(rpc(instrutor, `public.academy_adm_vitrine($1)`, [SOC]))).toMatch(/sem_permissao/);
    expect(await erroDe(salvar(instrutor, SOC, { situacao: "oculto" }))).toMatch(/sem_permissao/);
    expect(await erroDe(salvar(aluno, SOC, { situacao: "oculto" }))).toMatch(/sem_permissao/);
    expect(await erroDe(como(db, "anon", `select public.academy_adm_vitrine($1)`, [SOC]))).toMatch(/permission denied/);
    const r = await db.query<{ acao: string }>(`select acao from public.academy_auditoria where acao like 'vitrine%'`);
    expect(r.rows).toEqual([]);
  });

  it("mostra ao admin o que falta para a página do curso ficar completa", async () => {
    const v = await rpc<Vitrine>(admin, `public.academy_adm_vitrine($1)`, ["sc-900-prep"]);
    expect(v.pendencias).toEqual(["nao_publicado", "sem_instrutor", "sem_objetivos", "sem_modulos"]);
    expect(v.trilhas.find((t) => t.slug === "certificacoes")!.no_curso).toBe(true);
  });
});

describe("trilhas", () => {
  it("o admin escolhe as trilhas do curso pela vitrine", async () => {
    const v = await salvar(admin, SOC, { trilhas: ["soc", "red-team"] });
    expect(v.trilhas.filter((t) => t.no_curso).map((t) => t.slug)).toEqual(["soc", "red-team"]);
    expect((await catalogo()).trilhas.map((t) => t.slug)).toContain("red-team");
    expect(await erroDe(salvar(admin, SOC, { trilhas: ["nao-existe"] }))).toMatch(/trilha_inexistente/);
    const audit = await db.query<{ acao: string }>(`select acao from public.academy_auditoria where alvo = $1`, [SOC]);
    expect(audit.rows.map((a) => a.acao)).toContain("vitrine_salva");
  });

  it("cria, edita, publica e ordena trilhas", async () => {
    let t = await rpc<TrilhaAdm[]>(admin, `public.academy_adm_salvar_trilha('', $1::jsonb)`, [
      JSON.stringify({ slug: "cloud", titulo: "Segurança em nuvem", descricao: "AWS, Azure e GCP." }),
    ]);
    expect(t.at(-1)).toMatchObject({ slug: "cloud", publicado: false, ordem: 7 });
    expect(await erroDe(rpc(admin, `public.academy_adm_salvar_trilha('', $1::jsonb)`, [JSON.stringify({ slug: "soc", titulo: "SOC" })]))).toMatch(
      /slug_em_uso/,
    );
    expect(await erroDe(rpc(admin, `public.academy_adm_salvar_trilha('', $1::jsonb)`, [JSON.stringify({ slug: "Nuvem!", titulo: "X" })]))).toMatch(
      /slug_invalido/,
    );

    t = await rpc<TrilhaAdm[]>(admin, `public.academy_adm_mover_trilha('cloud', -1)`);
    expect(t.map((x) => x.slug).slice(-2)).toEqual(["cloud", "iso"]);
    expect(await erroDe(rpc(admin, `public.academy_adm_mover_trilha('fundamentos', -1)`))).toMatch(/limite/);

    await rpc(admin, `public.academy_adm_salvar_trilha('soc', $1::jsonb)`, [JSON.stringify({ publicado: false })]);
    expect((await catalogo()).trilhas.map((x) => x.slug)).not.toContain("soc");
    expect((await catalogo()).cursos.find((x) => x.slug === SOC)!.trilhas).toEqual([]);
  });

  it("ordena os cursos dentro da trilha", async () => {
    let t = await rpc<TrilhaAdm[]>(admin, `public.academy_adm_mover_na_trilha('soc', 'incident-investigation', -1)`);
    expect(t.find((x) => x.slug === "soc")!.cursos.map((c) => c.slug)).toEqual([
      "soc-analyst",
      "incident-investigation",
      "malware-analysis",
    ]);
    expect((await catalogo()).trilhas[0]!.cursos[1]).toBe("incident-investigation");
    expect(await erroDe(rpc(admin, `public.academy_adm_mover_na_trilha('soc', 'soc-analyst', -1)`))).toMatch(/limite/);
    expect(await erroDe(rpc(admin, `public.academy_adm_mover_na_trilha('grc', 'soc-analyst', 1)`))).toMatch(/curso_fora_da_trilha/);
    t = await rpc<TrilhaAdm[]>(admin, `public.academy_adm_trilhas()`);
    expect(t).toHaveLength(7);
    expect(await erroDe(rpc(instrutor, `public.academy_adm_trilhas()`))).toMatch(/sem_permissao/);
  });

  it("a trilha da formação continua escondida enquanto a formação não for publicada", async () => {
    await db.query(`update public.trilhas set publicado = true where slug = 'fundamentos'`);
    expect(await como(db, "anon", `select slug from public.trilhas where slug = 'fundamentos'`)).toEqual([]);
    const avulsa = await como<{ slug: string }>(db, "anon", `select slug from public.trilhas where slug = 'soc'`);
    expect(avulsa).toEqual([{ slug: "soc" }]);
  });
});
