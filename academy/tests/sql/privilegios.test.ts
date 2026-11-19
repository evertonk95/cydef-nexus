// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { novoBanco, PASTA_MIGRACOES } from "./banco";

/**
 * Matriz permitida para toda função de public.
 *
 * anon: só a contagem pública da home.
 * authenticated: só as quatro funções do portal do aluno.
 * service_role: todas.
 */
const ESPERADO: Record<string, { anon: boolean; autenticado: boolean; servico: boolean }> = {
  _contato_contar: { anon: false, autenticado: false, servico: true },
  academy_elegibilidade: { anon: false, autenticado: false, servico: true },
  academy__aluno_no_curso: { anon: false, autenticado: false, servico: true },
  academy__aula_liberada: { anon: false, autenticado: false, servico: true },
  academy__corrigir: { anon: false, autenticado: false, servico: true },
  academy__modulos_do_aluno: { anon: false, autenticado: false, servico: true },
  academy__pendencias: { anon: false, autenticado: false, servico: true },
  academy__questao_valida: { anon: false, autenticado: false, servico: true },
  academy__questoes_para_aluno: { anon: false, autenticado: false, servico: true },
  academy__exigir_admin: { anon: false, autenticado: false, servico: true },
  academy__exigir_curso: { anon: false, autenticado: false, servico: true },
  academy__eh_admin: { anon: false, autenticado: false, servico: true },
  academy__auditar: { anon: false, autenticado: false, servico: true },
  academy__renumerar: { anon: false, autenticado: false, servico: true },
  academy__compactar_aulas: { anon: false, autenticado: false, servico: true },
  academy__compactar_modulos: { anon: false, autenticado: false, servico: true },
  academy__texto: { anon: false, autenticado: false, servico: true },
  academy__questao_em_uso: { anon: false, autenticado: false, servico: true },
  academy__aula_json: { anon: false, autenticado: false, servico: true },
  academy_adm_eu: { anon: false, autenticado: true, servico: true },
  academy_adm_cursos: { anon: false, autenticado: true, servico: true },
  academy_adm_curso: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_curso: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_modulo: { anon: false, autenticado: true, servico: true },
  academy_adm_mover_modulo: { anon: false, autenticado: true, servico: true },
  academy_adm_excluir_modulo: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_aula: { anon: false, autenticado: true, servico: true },
  academy_adm_mover_aula: { anon: false, autenticado: true, servico: true },
  academy_adm_excluir_aula: { anon: false, autenticado: true, servico: true },
  academy_adm_questoes: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_questao: { anon: false, autenticado: true, servico: true },
  academy_adm_excluir_questao: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_requisitos: { anon: false, autenticado: true, servico: true },
  academy_adm_boletim: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_boletim: { anon: false, autenticado: true, servico: true },
  academy_adm_excluir_boletim: { anon: false, autenticado: true, servico: true },
  academy_adm_equipe: { anon: false, autenticado: true, servico: true },
  academy_adm_definir_equipe: { anon: false, autenticado: true, servico: true },
  academy_adm_remover_equipe: { anon: false, autenticado: true, servico: true },
  academy_emitir_certificado: { anon: false, autenticado: true, servico: true },
  academy_enviar_final: { anon: false, autenticado: true, servico: true },
  academy_iniciar_final: { anon: false, autenticado: true, servico: true },
  academy_meu_painel: { anon: false, autenticado: true, servico: true },
  academy_questoes_modulo: { anon: false, autenticado: true, servico: true },
  academy_responder_modulo: { anon: false, autenticado: true, servico: true },
  academy_situacao_curso: { anon: false, autenticado: true, servico: true },
  academy_validar_certificado: { anon: true, autenticado: true, servico: true },
  academy_provisionar_aluno: { anon: false, autenticado: false, servico: true },
  academy_rate_limit: { anon: false, autenticado: false, servico: true },
  academy_registrar_acesso: { anon: false, autenticado: true, servico: true },
  academy_registrar_progresso: { anon: false, autenticado: true, servico: true },
  academy_video_aula: { anon: false, autenticado: true, servico: true },
  aviso_calcula_hash: { anon: false, autenticado: false, servico: true },
  aviso_conteudo_imutavel: { anon: false, autenticado: false, servico: true },
  capture_lead: { anon: false, autenticado: false, servico: true },
  confirmar_token: { anon: false, autenticado: false, servico: true },
  consentimentos_imutavel: { anon: false, autenticado: false, servico: true },
  contagem_alunos: { anon: true, autenticado: false, servico: true },
  expurgar_contatos: { anon: false, autenticado: false, servico: true },
  marcar_contato: { anon: false, autenticado: false, servico: true },
  metricas_funil: { anon: false, autenticado: false, servico: true },
  reenviar_token: { anon: false, autenticado: false, servico: true },
  registrar_contato: { anon: false, autenticado: false, servico: true },
};

interface Linha {
  proname: string;
  anon: boolean;
  autenticado: boolean;
  servico: boolean;
}

let db: PGlite;

// Todo teste aqui roda com os default privileges do Supabase recriados antes
// das migrações: sem isso o PGlite não reproduz o problema que a 0012 fecha.
beforeEach(async () => {
  db = await novoBanco({ padraoSupabase: true });
});

async function matriz(): Promise<Linha[]> {
  const r = await db.query<Linha>(`
    select p.proname,
           has_function_privilege('anon', p.oid, 'execute') as anon,
           has_function_privilege('authenticated', p.oid, 'execute') as autenticado,
           has_function_privilege('service_role', p.oid, 'execute') as servico
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
     order by 1
  `);
  return r.rows;
}

async function erroDe(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  return "";
}

async function como(papel: "anon" | "authenticated" | "service_role", sql: string): Promise<unknown> {
  await db.exec(`set role ${papel};`);
  try {
    return await db.query(sql);
  } finally {
    await db.exec("reset role;");
  }
}

describe("privilégios das funções (0012)", () => {
  it("toda função de public bate com a matriz permitida", async () => {
    const linhas = await matriz();
    const encontradas = linhas.map((l) => l.proname).sort();
    expect(encontradas).toEqual(Object.keys(ESPERADO).sort());

    const divergentes = linhas
      .filter((l) => {
        const esperado = ESPERADO[l.proname];
        return !esperado || esperado.anon !== l.anon || esperado.autenticado !== l.autenticado || esperado.servico !== l.servico;
      })
      .map((l) => `${l.proname}: anon=${l.anon} authenticated=${l.autenticado} service_role=${l.servico}`);
    expect(divergentes).toEqual([]);
  });

  it("anon executa só a contagem pública e é recusado nas funções de servidor", async () => {
    expect(await como("anon", "select public.contagem_alunos()")).toBeTruthy();
    expect(await erroDe(como("anon", "select public.metricas_funil()"))).toMatch(/permission denied/);
    expect(await erroDe(como("anon", "select public.academy_elegibilidade('aluno@example.com')"))).toMatch(/permission denied/);
    expect(await erroDe(como("anon", "select public.expurgar_contatos()"))).toMatch(/permission denied/);
    expect(await erroDe(como("anon", "select public.capture_lead('a','b','c','d','e',true,true,'f',now())"))).toMatch(/permission denied/);
  });

  it("authenticated executa as quatro do portal e não as de servidor", async () => {
    for (const nome of ["academy_meu_painel", "academy_registrar_acesso", "academy_registrar_progresso", "academy_video_aula"]) {
      expect(ESPERADO[nome]?.autenticado).toBe(true);
    }
    expect(await erroDe(como("authenticated", "select public.academy_elegibilidade('aluno@example.com')"))).toMatch(/permission denied/);
    expect(await erroDe(como("authenticated", "select public.registrar_contato('a','b','c','d','e','f')"))).toMatch(/permission denied/);
  });

  it("as três funções de trigger ficam fechadas para anon e authenticated", async () => {
    for (const nome of ["aviso_calcula_hash", "aviso_conteudo_imutavel", "consentimentos_imutavel"]) {
      expect(ESPERADO[nome] ?? null).toEqual({ anon: false, autenticado: false, servico: true });
    }
  });

  it("função nova nasce fechada, sem revoke manual", async () => {
    await db.exec(`create function public.teste_funcao_nova() returns integer language sql as $$ select 1 $$;`);
    const r = await db.query<{ proacl: string[] | null }>(`select proacl from pg_proc where proname = 'teste_funcao_nova'`);
    expect(r.rows[0]?.proacl).toEqual(["postgres=X/postgres"]);
    const fechada = await db.query<{ anon_ok: boolean; svc_ok: boolean }>(
      `select has_function_privilege('anon', 'public.teste_funcao_nova()', 'execute') as anon_ok,
              has_function_privilege('service_role', 'public.teste_funcao_nova()', 'execute') as svc_ok`,
    );
    expect(fechada.rows[0]?.anon_ok).toBe(false);
    expect(fechada.rows[0]?.svc_ok).toBe(false);
    expect(await erroDe(como("anon", "select public.teste_funcao_nova()"))).toMatch(/permission denied/);
    await db.exec(`drop function public.teste_funcao_nova();`);
  });

  it("a 0012 pode rodar de novo sem mudar a matriz", async () => {
    const { readFileSync } = await import("node:fs");
    const antes = await matriz();
    await db.exec(readFileSync(`${PASTA_MIGRACOES}/0012_supabase_privilegios_funcoes.sql`, "utf8"));
    expect(await matriz()).toEqual(antes);
  });
});
