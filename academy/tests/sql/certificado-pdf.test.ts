// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo } from "./banco";

const CF = "cybersecurity-fundamentals";
const SOC = "fundamentos-para-soc";

let db: PGlite;
let aluno: string;
let outro: string;
let admin: string;

async function erroDe(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  return "";
}

async function emitirDireto(uid: string, curso: string, codigo: string) {
  await db.query(
    `insert into public.certificados (codigo, user_id, curso_slug, nome, curso_titulo, carga_horaria_h, nota_final, concluido_em)
     values ($1, $2, $3, 'Ana Teste', 'Curso', 6, 90, '2026-11-18')`,
    [codigo, uid, curso],
  );
}

interface Meu {
  codigo: string;
  modelo: string;
  conteudo: string[];
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  aluno = (await criarAluno(db, "aluno@exemplo.com")).userId;
  outro = (await criarAluno(db, "outro@exemplo.com")).userId;
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin')`, [admin]);
}, 60_000);

describe("modelo e conteúdo gravados na emissão", () => {
  it("curso gratuito usa o Clássico claro e grava os módulos com aula publicada", async () => {
    await emitirDireto(aluno, CF, "CYD-AAAA-BBBB-CCCC-0001");
    const [c] = (await db.query<{ modelo: string; conteudo: string[] }>(`select modelo, conteudo from public.certificados where codigo = $1`, ["CYD-AAAA-BBBB-CCCC-0001"]))
      .rows;
    expect(c!.modelo).toBe("claro");
    const esperado = (
      await db.query<{ titulo: string }>(
        `select m.titulo from public.modulos m where m.curso_slug = $1 and m.ordem > 0
           and exists (select 1 from public.aulas a where a.modulo_id = m.id and a.publicado) order by m.ordem`,
        [CF],
      )
    ).rows.map((r) => r.titulo);
    expect(esperado.length).toBeGreaterThan(0);
    expect(c!.conteudo).toEqual(esperado);
  });

  it("curso pago usa o Técnico; o modelo escolhido no curso vale sobre o automático", async () => {
    await db.query(`update public.cursos set gratuito = false where slug = $1`, [SOC]);
    await emitirDireto(aluno, SOC, "CYD-AAAA-BBBB-CCCC-0002");
    await db.query(`update public.cursos_requisitos set modelo_certificado = 'tecnico' where curso_slug = $1`, [CF]);
    await emitirDireto(outro, CF, "CYD-AAAA-BBBB-CCCC-0003");
    const r = (await db.query<{ codigo: string; modelo: string }>(`select codigo, modelo from public.certificados order by codigo`)).rows;
    expect(r).toEqual([
      { codigo: "CYD-AAAA-BBBB-CCCC-0002", modelo: "tecnico" },
      { codigo: "CYD-AAAA-BBBB-CCCC-0003", modelo: "tecnico" },
    ]);
  });

  it("mudar o curso depois não muda o certificado já emitido", async () => {
    await emitirDireto(aluno, CF, "CYD-AAAA-BBBB-CCCC-0004");
    await db.query(`update public.cursos set gratuito = false where slug = $1`, [CF]);
    await db.query(`update public.modulos set titulo = 'Título novo' where curso_slug = $1 and ordem = 1`, [CF]);
    const [c] = (await db.query<{ modelo: string; conteudo: string[] }>(`select modelo, conteudo from public.certificados`)).rows;
    expect(c!.modelo).toBe("claro");
    expect(c!.conteudo).not.toContain("Título novo");
  });
});

describe("academy_meu_certificado", () => {
  it("devolve o certificado só para o dono", async () => {
    await emitirDireto(aluno, CF, "CYD-AAAA-BBBB-CCCC-0005");
    const [meu] = await como<{ r: Meu }>(db, "authenticated", `select public.academy_meu_certificado($1) r`, [CF], aluno);
    expect(meu!.r).toMatchObject({ codigo: "CYD-AAAA-BBBB-CCCC-0005", modelo: "claro" });
    const [alheio] = await como<{ r: Meu | null }>(db, "authenticated", `select public.academy_meu_certificado($1) r`, [CF], outro);
    expect(alheio!.r).toBeNull();
    expect(await erroDe(como(db, "anon", `select public.academy_meu_certificado($1)`, [CF]))).toMatch(/permission denied/);
  });

  it("a validação pública continua sem modelo, conteúdo e nota", async () => {
    await emitirDireto(aluno, CF, "CYD-AAAA-BBBB-CCCC-0006");
    const [v] = await como<{ r: Record<string, unknown> }>(db, "anon", `select public.academy_validar_certificado($1) r`, ["cyd-aaaa-bbbb-cccc-0006"]);
    expect(Object.keys(v!.r).sort()).toEqual(["carga_horaria_h", "codigo", "concluido_em", "curso", "nome"]);
  });
});

describe("modelo no painel", () => {
  it("admin escolhe o modelo do curso e volta ao automático", async () => {
    const c = await como<{ r: { requisitos: { modelo_certificado: string | null } } }>(
      db,
      "authenticated",
      `select public.academy_adm_salvar_requisitos($1, $2::jsonb) r`,
      [CF, JSON.stringify({ modelo_certificado: "tecnico" })],
      admin,
    );
    expect(c[0]!.r.requisitos.modelo_certificado).toBe("tecnico");
    const d = await como<{ r: { requisitos: { modelo_certificado: string | null } } }>(
      db,
      "authenticated",
      `select public.academy_adm_salvar_requisitos($1, $2::jsonb) r`,
      [CF, JSON.stringify({ modelo_certificado: "" })],
      admin,
    );
    expect(d[0]!.r.requisitos.modelo_certificado).toBeNull();
    expect(
      await erroDe(como(db, "authenticated", `select public.academy_adm_salvar_requisitos($1, $2::jsonb)`, [CF, JSON.stringify({ modelo_certificado: "noturno" })], admin)),
    ).toContain("requisitos_invalidos");
  });
});
