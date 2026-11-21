// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco } from "./banco";

/** Fase 21 (0033): a conta do dono da plataforma só muda pelas mãos dele. */

let db: PGlite;
let dono: string;
let outroAdmin: string;
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

/** Escrita direta na tabela com um usuário logado, para provar que a regra está na tabela e não só nas funções. */
async function direto(uid: string | null, sql: string, params: unknown[] = []) {
  await db.exec(`select set_config('request.jwt.claim.sub', '${uid ?? ""}', false);`);
  try {
    await db.query(sql, params);
  } finally {
    await db.exec(`select set_config('request.jwt.claim.sub', '', false);`);
  }
}

const PERFIL = { nome: "Everton Nascimento", cidade: "Recife" };

beforeEach(async () => {
  db = await novoBanco();
  // O primeiro admin cadastrado é o dono. A 0033 já rodou com a equipe vazia,
  // então aqui o dono é marcado como a migração faria num banco que já tem admin.
  ({ userId: dono } = await criarAluno(db, "dono@cydef.com.br"));
  ({ userId: outroAdmin } = await criarAluno(db, "matheus@cydef.com.br"));
  ({ userId: ana } = await criarAluno(db, "ana@exemplo.com"));
  await db.query(`insert into public.academy_equipe (user_id, papel, criado_em) values ($1, 'admin', now() - interval '1 day'), ($2, 'admin', now())`, [
    dono,
    outroAdmin,
  ]);
  await db.query(`insert into public.academy_dono (user_id) select user_id from public.academy_equipe where papel = 'admin' order by criado_em limit 1`);
});

describe("conta do dono (0033)", () => {
  it("a migração marca o primeiro admin como dono, e só admin consulta", async () => {
    const novo = await novoBanco({ ate: "0033" });
    const a = "00000000-0000-4000-8000-00000000d001";
    const b = "00000000-0000-4000-8000-00000000d002";
    await novo.query(`insert into auth.users (id, email) values ($1, 'primeiro@cydef.com.br'), ($2, 'segundo@cydef.com.br')`, [a, b]);
    await novo.query(`insert into public.academy_equipe (user_id, papel, criado_em) values ($1, 'admin', '2026-11-01'), ($2, 'admin', '2026-11-10')`, [a, b]);
    const { readFileSync } = await import("node:fs");
    const { PASTA_MIGRACOES } = await import("./banco");
    await novo.exec(readFileSync(`${PASTA_MIGRACOES}/0033_academy_conta_do_dono.sql`, "utf8"));
    const r = await novo.query<{ user_id: string }>(`select user_id from public.academy_dono`);
    expect(r.rows).toEqual([{ user_id: a }]);

    expect(await rpc(dono, "public.academy_adm_dono()")).toEqual({ user_id: dono, eu: true });
    expect(await rpc(outroAdmin, "public.academy_adm_dono()")).toEqual({ user_id: dono, eu: false });
    expect(await erroDe(rpc(ana, "public.academy_adm_dono()"))).toBe("sem_permissao");
  });

  it("outro admin não muda o papel do dono, nem tira da equipe, nem mexe na aprovação", async () => {
    for (const papel of ["instrutor", "admin"]) {
      expect(
        await erroDe(rpc(outroAdmin, "public.academy_adm_definir_equipe($1, $2, $3)", ["dono@cydef.com.br", papel, ["cybersecurity-fundamentals"]])),
      ).toBe("conta_protegida");
    }
    expect(await erroDe(rpc(outroAdmin, "public.academy_adm_remover_equipe($1)", [dono]))).toBe("conta_protegida");
    expect(await erroDe(rpc(outroAdmin, "public.academy_adm_definir_aprovador($1, true)", [dono]))).toBe("conta_protegida");
    const r = await db.query(`select papel from public.academy_equipe where user_id = $1`, [dono]);
    expect(r.rows).toEqual([{ papel: "admin" }]);
  });

  it("outro admin não edita o perfil nem o nome do dono", async () => {
    expect(await erroDe(rpc(outroAdmin, "public.academy_adm_salvar_perfil($1, $2)", [dono, { ...PERFIL, nome: "Outro Nome" }]))).toBe(
      "conta_protegida",
    );
    expect(await erroDe(direto(outroAdmin, `update public.alunos set nome = 'Outro Nome' where user_id = $1`, [dono]))).toBe("conta_protegida");
    const r = await db.query(`select nome from public.alunos where user_id = $1`, [dono]);
    expect(r.rows).toEqual([{ nome: "Ana Teste" }]);
  });

  it("outro admin não concede, não transfere e não encerra acesso do dono", async () => {
    expect(
      await erroDe(rpc(outroAdmin, "public.academy_adm_conceder($1)", [{ email: "dono@cydef.com.br", escopo: "plataforma", motivo: "teste" }])),
    ).toBe("conta_protegida");

    // Concessão do dono criada fora da plataforma (webhook, service_role): passa.
    const [c] = await como<{ r: { id: string } }>(
      db,
      "service_role",
      `select public.academy__concessao_json(public.academy__conceder('dono@cydef.com.br', 'Everton', 'manual', null, null, 'plataforma', null, null, null, null)) r`,
    );
    const id = c!.r.id;
    expect(await erroDe(rpc(outroAdmin, "public.academy_adm_revogar_concessao($1, $2)", [id, "teste"]))).toBe("conta_protegida");
    expect(await erroDe(rpc(outroAdmin, "public.academy_adm_transferir_concessao($1, $2)", [id, "ana@exemplo.com"]))).toBe("conta_protegida");

    // Também não dá para jogar a compra de outra pessoa para o e-mail do dono.
    const [d] = await como<{ r: { id: string } }>(
      db,
      "service_role",
      `select public.academy__concessao_json(public.academy__conceder('ana@exemplo.com', 'Ana', 'manual', null, null, 'plataforma', null, null, null, null)) r`,
    );
    expect(await erroDe(rpc(outroAdmin, "public.academy_adm_transferir_concessao($1, $2)", [d!.r.id, "dono@cydef.com.br"]))).toBe(
      "conta_protegida",
    );
  });

  it("outro admin não mexe no cartão de instrutor ligado ao dono", async () => {
    await db.query(`insert into public.instrutores (user_id, nome) values ($1, 'Everton Nascimento')`, [dono]);
    expect(await erroDe(direto(outroAdmin, `update public.instrutores set bio = 'x' where user_id = $1`, [dono]))).toBe("conta_protegida");
    expect(await erroDe(direto(outroAdmin, `delete from public.instrutores where user_id = $1`, [dono]))).toBe("conta_protegida");
  });

  it("o dono edita o próprio perfil e o de outras pessoas normalmente", async () => {
    await rpc(dono, "public.academy_salvar_meu_perfil($1)", [PERFIL]);
    await rpc(dono, "public.academy_adm_salvar_perfil($1, $2)", [dono, { ...PERFIL, cidade: "Brasília" }]);
    await rpc(dono, "public.academy_adm_salvar_perfil($1, $2)", [ana, { nome: "Ana Souza" }]);
    await rpc(outroAdmin, "public.academy_adm_salvar_perfil($1, $2)", [ana, { nome: "Ana Lima" }]);
    const r = await db.query(`select user_id, nome from public.alunos where user_id in ($1, $2) order by nome`, [dono, ana]);
    expect(r.rows).toEqual([
      { user_id: ana, nome: "Ana Lima" },
      { user_id: dono, nome: "Everton Nascimento" },
    ]);
  });

  it("o dono continua admin: nem ele mesmo se rebaixa ou sai da equipe pela plataforma", async () => {
    expect(await erroDe(rpc(dono, "public.academy_adm_definir_equipe($1, 'instrutor', $2)", ["dono@cydef.com.br", ["cybersecurity-fundamentals"]]))).toBe(
      "dono_sempre_admin",
    );
    expect(await erroDe(rpc(dono, "public.academy_adm_remover_equipe($1)", [dono]))).toBe("dono_sempre_admin");
    // O outro admin continua podendo ser rebaixado, inclusive pelo dono.
    await rpc(dono, "public.academy_adm_definir_equipe($1, 'instrutor', $2)", ["matheus@cydef.com.br", ["cybersecurity-fundamentals"]]);
    const r = await db.query(`select papel from public.academy_equipe where user_id = $1`, [outroAdmin]);
    expect(r.rows).toEqual([{ papel: "instrutor" }]);
  });

  it("fora da plataforma (SQL e service_role) a conta do dono pode ser ajustada", async () => {
    await direto(null, `update public.alunos set nome = 'Everton Igor' where user_id = $1`, [dono]);
    await direto(null, `update public.academy_dono set user_id = $1`, [outroAdmin]);
    // Com o dono trocado por SQL, a proteção passa para a nova conta.
    expect(await erroDe(rpc(dono, "public.academy_adm_definir_aprovador($1, true)", [outroAdmin]))).toBe("conta_protegida");
  });

  it("a tabela do dono fica fechada para quem está logado", async () => {
    expect(await erroDe(como(db, "authenticated", `select * from public.academy_dono`, [], dono))).toMatch(/permission denied/);
    expect(await erroDe(como(db, "authenticated", `update public.academy_dono set user_id = $1`, [outroAdmin], outroAdmin))).toMatch(
      /permission denied/,
    );
  });
});
