/**
 * Postgres de verdade (PGlite, Postgres 17 em WebAssembly) com o mínimo do
 * Supabase que as migrações usam: papéis anon, authenticated e service_role,
 * o esquema auth com auth.users e auth.uid(). Todas as migrações do
 * repositório rodam em ordem, exatamente como estão no disco.
 */
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PASTA_MIGRACOES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../supabase/migrations");

const SUPABASE_MINIMO = `
create extension if not exists pgcrypto;
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;
create schema auth;
create table auth.users (id uuid primary key, email text not null);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
`;

/**
 * Default privileges do Supabase: toda função nova de public nasce com EXECUTE
 * para anon, authenticated e service_role. É o que a 0012 precisa fechar.
 */
const PADRAO_SUPABASE = `
alter default privileges for role postgres in schema public
  grant execute on functions to anon, authenticated, service_role;
`;

export interface OpcoesBanco {
  /** Recria os default privileges do Supabase antes das migrações. */
  padraoSupabase?: boolean;
  /** Para antes da migração com este prefixo (ex.: "0014"), para simular um banco antigo. */
  ate?: string;
}

export async function novoBanco(opcoes: OpcoesBanco = {}): Promise<PGlite> {
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(SUPABASE_MINIMO);
  if (opcoes.padraoSupabase) await db.exec(PADRAO_SUPABASE);
  const arquivos = readdirSync(PASTA_MIGRACOES)
    .filter((f) => f.endsWith(".sql"))
    .filter((f) => !opcoes.ate || f < opcoes.ate)
    .sort();
  for (const f of arquivos) {
    try {
      await db.exec(readFileSync(path.join(PASTA_MIGRACOES, f), "utf8"));
    } catch (e) {
      throw new Error(`migração ${f} falhou: ${(e as Error).message}`);
    }
  }
  return db;
}

export type Papel = "anon" | "authenticated" | "service_role";

/** Roda uma consulta como um papel do Supabase (e um usuário, se houver). */
export async function como<T = Record<string, unknown>>(
  db: PGlite,
  papel: Papel,
  sql: string,
  params: unknown[] = [],
  uid: string | null = null,
): Promise<T[]> {
  await db.exec(`select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); set role ${papel};`);
  try {
    const r = await db.query<T>(sql, params);
    return r.rows;
  } finally {
    await db.exec("reset role;");
  }
}

let n = 0;
export function uuid(): string {
  n += 1;
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

/** Pré-inscrição com consentimento, como a captura grava. */
export async function criarLead(db: PGlite, email: string, status = "pending_confirmation"): Promise<string> {
  const id = uuid();
  await db.query(
    `insert into public.leads (id, nome, email, perfil, status, request_id) values ($1, $2, $3, 'iniciante', $4, $5)`,
    [id, "Ana Teste", email.toLowerCase(), status, `req-${id}`],
  );
  await db.query(
    `insert into public.consentimentos (lead_id, aceito, versao_aviso, hash_aviso, declaracao_idade) values ($1, true, 'v2026.2', 'h', true)`,
    [id],
  );
  return id;
}

/** Usuário de login + aluno, como a função academy-acesso faz. */
export async function criarAluno(db: PGlite, email: string): Promise<{ userId: string; leadId: string }> {
  const leadId = await criarLead(db, email);
  const userId = uuid();
  await db.query(`insert into auth.users (id, email) values ($1, $2)`, [userId, email]);
  await como(db, "service_role", `select public.academy_provisionar_aluno($1, $2, $3)`, [userId, leadId, "Ana Teste"]);
  return { userId, leadId };
}

export async function publicarCatalogo(db: PGlite) {
  await db.exec(`
    update public.formacoes set publicado = true;
    update public.trilhas set publicado = true;
    update public.cursos set publicado = true;
    update public.aulas set publicado = true;
  `);
}
