// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco, publicarCatalogo } from "./banco";

const CF = "cybersecurity-fundamentals";
const SOC = "fundamentos-para-soc";
const PDF = "application/pdf";
const HASH = "a".repeat(64);

let db: PGlite;
let admin: string;
let instrutor: string;
let outroInstrutor: string;
let aluno: string;
let estranho: string;

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

interface Registro {
  id: string;
  caminho: string;
}
interface Material {
  id: string;
  status: string;
  enviado_por_mim: boolean;
  motivo_recusa: string | null;
}

const dados = (over: Record<string, unknown> = {}) =>
  JSON.stringify({ titulo: "Slides do módulo 1", nome_arquivo: "slides modulo 1.pdf", mime: PDF, tamanho: 2048, sha256: HASH, ...over });

/** Envio completo como o painel faz: registro, upload no Storage e confirmação. */
async function enviar(uid: string, curso = SOC, over: Record<string, unknown> = {}, tamanhoReal = 2048): Promise<Registro> {
  const r = await rpc<Registro>(uid, `public.academy_adm_registrar_material($1, $2::jsonb)`, [curso, dados(over)]);
  await como(db, "authenticated", `insert into storage.objects (bucket_id, name, owner, metadata) values ('academy-materiais', $1, $2, $3::jsonb)`, [
    r.caminho,
    uid,
    JSON.stringify({ size: tamanhoReal, mimetype: PDF }),
  ], uid);
  await rpc(uid, `public.academy_adm_confirmar_envio($1)`, [r.id]);
  return r;
}

async function podeLer(uid: string, caminho: string): Promise<boolean> {
  const r = await como(db, "authenticated", `select name from storage.objects where bucket_id = 'academy-materiais' and name = $1`, [caminho], uid);
  return r.length === 1;
}

beforeEach(async () => {
  db = await novoBanco();
  await publicarCatalogo(db);
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  instrutor = (await criarAluno(db, "instrutor@exemplo.com")).userId;
  outroInstrutor = (await criarAluno(db, "revisor@exemplo.com")).userId;
  aluno = (await criarAluno(db, "aluno@exemplo.com")).userId;
  estranho = (await criarAluno(db, "estranho@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin'), ($2, 'instrutor'), ($3, 'instrutor')`, [admin, instrutor, outroInstrutor]);
  await db.query(`insert into public.academy_equipe_cursos (user_id, curso_slug) values ($1, $3), ($2, $3)`, [instrutor, outroInstrutor, SOC]);
  await db.query(`insert into public.matriculas (user_id, curso_slug, origem) values ($1, $2, 'gratuito') on conflict do nothing`, [aluno, SOC]);
}, 60_000);

describe("bucket e regras de arquivo", () => {
  it("bucket privado com limite e lista de tipos", async () => {
    const [b] = (await db.query<{ public: boolean; file_size_limit: string; allowed_mime_types: string[] }>(`select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'academy-materiais'`)).rows;
    expect(b!.public).toBe(false);
    expect(Number(b!.file_size_limit)).toBe(50 * 1024 * 1024);
    expect(b!.allowed_mime_types).toContain(PDF);
    expect(b!.allowed_mime_types).not.toContain("application/x-msdownload");
  });

  it("recusa tipo fora da lista, MIME trocado e arquivo grande", async () => {
    expect(await erroDe(rpc(instrutor, `public.academy_adm_registrar_material($1, $2::jsonb)`, [SOC, dados({ nome_arquivo: "lab.exe", mime: "application/octet-stream" })]))).toContain(
      "tipo_nao_permitido",
    );
    expect(await erroDe(rpc(instrutor, `public.academy_adm_registrar_material($1, $2::jsonb)`, [SOC, dados({ nome_arquivo: "planilha.xlsm" })]))).toContain(
      "tipo_nao_permitido",
    );
    expect(await erroDe(rpc(instrutor, `public.academy_adm_registrar_material($1, $2::jsonb)`, [SOC, dados({ mime: "application/zip" })]))).toContain("tipo_nao_permitido");
    expect(await erroDe(rpc(instrutor, `public.academy_adm_registrar_material($1, $2::jsonb)`, [SOC, dados({ tamanho: 26 * 1024 * 1024 })]))).toContain("arquivo_grande");
    // ZIP aceita até 50 MB.
    const zip = await rpc<Registro>(instrutor, `public.academy_adm_registrar_material($1, $2::jsonb)`, [
      SOC,
      dados({ nome_arquivo: "lab.zip", mime: "application/zip", tamanho: 40 * 1024 * 1024 }),
    ]);
    expect(zip.caminho).toMatch(/\/lab\.zip$/);
  });

  it("nome de arquivo vira nome seguro, sem caminho", async () => {
    const r = await rpc<Registro>(instrutor, `public.academy_adm_registrar_material($1, $2::jsonb)`, [SOC, dados({ nome_arquivo: "..\\..\\pasta/Slides módulo 1 (final).pdf" })]);
    expect(r.caminho).toBe(`${SOC}/${r.id}/Slides-m-dulo-1-final-.pdf`);
  });
});

describe("envio só por quem é da equipe do curso", () => {
  it("aluno e instrutor de outro curso não registram", async () => {
    expect(await erroDe(rpc(aluno, `public.academy_adm_registrar_material($1, $2::jsonb)`, [SOC, dados()]))).toContain("sem_permissao");
    expect(await erroDe(rpc(instrutor, `public.academy_adm_registrar_material($1, $2::jsonb)`, [CF, dados()]))).toContain("sem_permissao");
  });

  it("Storage só aceita o arquivo no caminho registrado, por quem registrou", async () => {
    const r = await rpc<Registro>(instrutor, `public.academy_adm_registrar_material($1, $2::jsonb)`, [SOC, dados()]);
    const gravar = (uid: string, nome: string) =>
      como(db, "authenticated", `insert into storage.objects (bucket_id, name, owner, metadata) values ('academy-materiais', $1, $2, '{"size":2048}'::jsonb)`, [nome, uid], uid);
    expect(await erroDe(gravar(outroInstrutor, r.caminho))).toMatch(/row-level security/);
    expect(await erroDe(gravar(instrutor, `${SOC}/qualquer/outro.pdf`))).toMatch(/row-level security/);
    expect(await erroDe(gravar(aluno, r.caminho))).toMatch(/row-level security/);
    await gravar(instrutor, r.caminho);
  });

  it("confirmação confere o tamanho gravado no Storage", async () => {
    const r = await rpc<Registro>(instrutor, `public.academy_adm_registrar_material($1, $2::jsonb)`, [SOC, dados()]);
    expect(await erroDe(rpc(instrutor, `public.academy_adm_confirmar_envio($1)`, [r.id]))).toContain("arquivo_ausente");
    await como(db, "authenticated", `insert into storage.objects (bucket_id, name, owner, metadata) values ('academy-materiais', $1, $2, '{"size":9999}'::jsonb)`, [r.caminho, instrutor], instrutor);
    expect(await erroDe(rpc(instrutor, `public.academy_adm_confirmar_envio($1)`, [r.id]))).toContain("arquivo_divergente");
  });
});

describe("quarentena e aprovação em duas pessoas", () => {
  it("pendente: aluno não lê; equipe e aprovador leem", async () => {
    const r = await enviar(instrutor);
    expect(await podeLer(aluno, r.caminho)).toBe(false);
    expect(await podeLer(estranho, r.caminho)).toBe(false);
    expect(await podeLer(admin, r.caminho)).toBe(true);
    expect(await podeLer(outroInstrutor, r.caminho)).toBe(true);
    expect(await rpc(aluno, `public.academy_materiais_curso($1)`, [SOC])).toEqual([]);
  });

  it("quem enviou nunca aprova, nem sendo admin", async () => {
    const r = await enviar(admin);
    expect(await erroDe(rpc(admin, `public.academy_adm_revisar_material($1, true, null)`, [r.id]))).toContain("mesma_pessoa");
  });

  it("instrutor sem marcação de aprovador não aprova; marcado pelo admin, aprova", async () => {
    const r = await enviar(instrutor);
    expect(await erroDe(rpc(outroInstrutor, `public.academy_adm_revisar_material($1, true, null)`, [r.id]))).toContain("sem_permissao");
    expect(await erroDe(rpc(outroInstrutor, `public.academy_adm_aprovacoes()`))).toContain("sem_permissao");
    expect(await erroDe(rpc(instrutor, `public.academy_adm_definir_aprovador($1, true)`, [outroInstrutor]))).toContain("sem_permissao");
    await rpc(admin, `public.academy_adm_definir_aprovador($1, true)`, [outroInstrutor]);
    expect(await rpc(outroInstrutor, `public.academy_adm_eu()`)).toMatchObject({ aprova_materiais: true });
    const pendentes = await rpc<Material[]>(outroInstrutor, `public.academy_adm_aprovacoes()`);
    expect(pendentes.map((m) => m.id)).toEqual([r.id]);
    await rpc(outroInstrutor, `public.academy_adm_revisar_material($1, true, null)`, [r.id]);
    expect((await db.query<{ status: string }>(`select status from public.materiais where id = $1`, [r.id])).rows[0]!.status).toBe("aprovado");
  });

  it("aprovado: aluno matriculado lê e baixa; quem não é matriculado, não", async () => {
    const r = await enviar(instrutor);
    await rpc(admin, `public.academy_adm_revisar_material($1, true, null)`, [r.id]);
    expect(await podeLer(aluno, r.caminho)).toBe(true);
    expect(await podeLer(estranho, r.caminho)).toBe(false);
    const lista = await rpc<{ titulo: string; caminho: string }[]>(aluno, `public.academy_materiais_curso($1)`, [SOC]);
    expect(lista).toEqual([expect.objectContaining({ titulo: "Slides do módulo 1", caminho: r.caminho })]);
    expect(await erroDe(rpc(estranho, `public.academy_materiais_curso($1)`, [SOC]))).toContain("sem_matricula");
    await db.query(`update public.cursos set publicado = false where slug = $1`, [SOC]);
    expect(await podeLer(aluno, r.caminho)).toBe(false);
  });

  it("recusa exige motivo e o arquivo recusado pode ser apagado do Storage", async () => {
    const r = await enviar(instrutor);
    expect(await erroDe(rpc(admin, `public.academy_adm_revisar_material($1, false, $2)`, [r.id, ""]))).toContain("motivo_obrigatorio");
    await rpc(admin, `public.academy_adm_revisar_material($1, false, $2)`, [r.id, "ZIP com executável sem explicação."]);
    const lista = await rpc<Material[]>(instrutor, `public.academy_adm_materiais($1)`, [SOC]);
    expect(lista[0]).toMatchObject({ status: "recusado", motivo_recusa: "ZIP com executável sem explicação." });
    expect(await podeLer(aluno, r.caminho)).toBe(false);
    const apagados = await como(db, "authenticated", `delete from storage.objects where name = $1 returning name`, [r.caminho], instrutor);
    expect(apagados).toHaveLength(1);
  });

  it("aprovado não pode ser apagado do Storage sem antes sair do ar", async () => {
    const r = await enviar(instrutor);
    await rpc(admin, `public.academy_adm_revisar_material($1, true, null)`, [r.id]);
    expect(await como(db, "authenticated", `delete from storage.objects where name = $1 returning name`, [r.caminho], instrutor)).toHaveLength(0);
    await rpc(instrutor, `public.academy_adm_arquivar_material($1)`, [r.id]);
    expect(await podeLer(aluno, r.caminho)).toBe(false);
    expect(await como(db, "authenticated", `delete from storage.objects where name = $1 returning name`, [r.caminho], instrutor)).toHaveLength(1);
  });

  it("título muda sem nova aprovação; tudo fica na auditoria", async () => {
    const r = await enviar(instrutor);
    await rpc(admin, `public.academy_adm_revisar_material($1, true, null)`, [r.id]);
    const m = await rpc<{ titulo: string; status: string }>(instrutor, `public.academy_adm_salvar_material($1, $2::jsonb)`, [r.id, JSON.stringify({ titulo: "Slides revisados" })]);
    expect(m).toMatchObject({ titulo: "Slides revisados", status: "aprovado" });
    const acoes = (await db.query<{ acao: string }>(`select acao from public.academy_auditoria order by id`)).rows.map((x) => x.acao);
    expect(acoes).toEqual(["material_registrado", "material_enviado", "material_aprovado", "material_salvo"]);
  });

  it("o banco recusa aprovação gravada direto pela mesma pessoa", async () => {
    const r = await enviar(instrutor);
    expect(await erroDe(db.query(`update public.materiais set status = 'aprovado', revisado_por = enviado_por where id = $1`, [r.id]))).toMatch(/check constraint/);
  });
});
