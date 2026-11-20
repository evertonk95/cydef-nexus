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
  academy__instrutor_json: { anon: false, autenticado: false, servico: true },
  academy__aplicar_perfil: { anon: false, autenticado: false, servico: true },
  academy__instrutores_do_curso: { anon: false, autenticado: false, servico: true },
  academy__compactar_instrutores: { anon: false, autenticado: false, servico: true },
  academy_adm_salvar_sobre: { anon: false, autenticado: true, servico: true },
  academy_adm_editar_modulo: { anon: false, autenticado: true, servico: true },
  academy_adm_meu_perfil: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_meu_perfil: { anon: false, autenticado: true, servico: true },
  academy_adm_instrutores: { anon: false, autenticado: true, servico: true },
  academy_adm_vincular_instrutor: { anon: false, autenticado: true, servico: true },
  academy_adm_desvincular_instrutor: { anon: false, autenticado: true, servico: true },
  academy_adm_mover_instrutor: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_instrutor: { anon: false, autenticado: true, servico: true },
  academy__modelo_padrao: { anon: false, autenticado: false, servico: true },
  academy__conteudo_curso: { anon: false, autenticado: false, servico: true },
  academy__certificado_na_emissao: { anon: false, autenticado: false, servico: true },
  academy_meu_certificado: { anon: false, autenticado: true, servico: true },
  academy__respostas_texto: { anon: false, autenticado: false, servico: true },
  academy_atualizar_nome: { anon: false, autenticado: true, servico: true },
  academy_meus_certificados: { anon: false, autenticado: true, servico: true },
  academy_validacao_publica: { anon: false, autenticado: true, servico: true },
  academy_meus_dados: { anon: false, autenticado: true, servico: true },
  academy__mime_material: { anon: false, autenticado: false, servico: true },
  academy__limite_material: { anon: false, autenticado: false, servico: true },
  academy__pode_aprovar: { anon: false, autenticado: false, servico: true },
  academy__edita_curso: { anon: false, autenticado: false, servico: true },
  academy__material_json: { anon: false, autenticado: false, servico: true },
  academy__pode_enviar_material: { anon: false, autenticado: true, servico: true },
  academy__pode_ler_material: { anon: false, autenticado: true, servico: true },
  academy__pode_apagar_material: { anon: false, autenticado: true, servico: true },
  academy_adm_materiais: { anon: false, autenticado: true, servico: true },
  academy_adm_registrar_material: { anon: false, autenticado: true, servico: true },
  academy_adm_confirmar_envio: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_material: { anon: false, autenticado: true, servico: true },
  academy_adm_arquivar_material: { anon: false, autenticado: true, servico: true },
  academy_adm_aprovacoes: { anon: false, autenticado: true, servico: true },
  academy_adm_revisar_material: { anon: false, autenticado: true, servico: true },
  academy_adm_definir_aprovador: { anon: false, autenticado: true, servico: true },
  academy_materiais_curso: { anon: false, autenticado: true, servico: true },
  academy__situacao_vitrine: { anon: false, autenticado: false, servico: true },
  academy__carga_horaria: { anon: false, autenticado: false, servico: true },
  academy__renumerar_trilhas: { anon: false, autenticado: false, servico: true },
  academy__renumerar_trilha_cursos: { anon: false, autenticado: false, servico: true },
  academy_catalogo_publico: { anon: true, autenticado: true, servico: true },
  academy_adm_vitrine: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_vitrine: { anon: false, autenticado: true, servico: true },
  academy_adm_trilhas: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_trilha: { anon: false, autenticado: true, servico: true },
  academy_adm_mover_trilha: { anon: false, autenticado: true, servico: true },
  academy_adm_mover_na_trilha: { anon: false, autenticado: true, servico: true },
  academy__produto_unico: { anon: false, autenticado: false, servico: true },
  academy__concessao_ativa: { anon: false, autenticado: false, servico: true },
  academy__cursos_da_concessao: { anon: false, autenticado: false, servico: true },
  academy__cursos_cobertos: { anon: false, autenticado: false, servico: true },
  academy__sincronizar: { anon: false, autenticado: false, servico: true },
  academy_expirar_concessoes: { anon: false, autenticado: false, servico: true },
  academy__conceder: { anon: false, autenticado: false, servico: true },
  academy_hotmart_processar: { anon: false, autenticado: false, servico: true },
  academy__concessao_por_email: { anon: false, autenticado: false, servico: true },
  academy__concessao_json: { anon: false, autenticado: false, servico: true },
  academy_adm_concessoes: { anon: false, autenticado: true, servico: true },
  academy_adm_conceder: { anon: false, autenticado: true, servico: true },
  academy_adm_transferir_concessao: { anon: false, autenticado: true, servico: true },
  academy_adm_revogar_concessao: { anon: false, autenticado: true, servico: true },
  academy_adm_produtos: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_produto: { anon: false, autenticado: true, servico: true },
  academy_meus_acessos: { anon: false, autenticado: true, servico: true },
  academy__hoje: { anon: false, autenticado: false, servico: true },
  academy__empresa_inicio: { anon: false, autenticado: false, servico: true },
  academy__empresa_fim: { anon: false, autenticado: false, servico: true },
  academy__empresa_vigente: { anon: false, autenticado: false, servico: true },
  academy__empresa_situacao: { anon: false, autenticado: false, servico: true },
  academy__empresa_alvo: { anon: false, autenticado: false, servico: true },
  academy__empresa_vagas_usadas: { anon: false, autenticado: false, servico: true },
  academy__empresa_cursos: { anon: false, autenticado: false, servico: true },
  academy__exigir_gestor: { anon: false, autenticado: false, servico: true },
  academy__membro_conceder: { anon: false, autenticado: false, servico: true },
  academy__membro_encerrar: { anon: false, autenticado: false, servico: true },
  academy__garantir_gestora: { anon: false, autenticado: false, servico: true },
  academy__email_valido: { anon: false, autenticado: false, servico: true },
  academy__empresa_json: { anon: false, autenticado: false, servico: true },
  academy__membro_progresso: { anon: false, autenticado: false, servico: true },
  academy__membro_json: { anon: false, autenticado: false, servico: true },
  academy__membro_da_empresa: { anon: false, autenticado: false, servico: true },
  academy__convite_por_email: { anon: false, autenticado: false, servico: true },
  academy__coberta_depois: { anon: false, autenticado: false, servico: true },
  academy_avisos_vencimento: { anon: false, autenticado: false, servico: true },
  academy_avisos_registrar: { anon: false, autenticado: false, servico: true },
  academy_adm_empresas: { anon: false, autenticado: true, servico: true },
  academy_adm_salvar_empresa: { anon: false, autenticado: true, servico: true },
  academy_adm_encerrar_empresa: { anon: false, autenticado: true, servico: true },
  academy_empresa_painel: { anon: false, autenticado: true, servico: true },
  academy_empresa_convidar: { anon: false, autenticado: true, servico: true },
  academy_empresa_cancelar_convite: { anon: false, autenticado: true, servico: true },
  academy_empresa_remover: { anon: false, autenticado: true, servico: true },
  academy_empresa_definir_gestor: { anon: false, autenticado: true, servico: true },
  academy_empresa_reenviar_convite: { anon: false, autenticado: true, servico: true },
  academy_empresa_convites_pendentes: { anon: false, autenticado: true, servico: true },
  academy_empresa_convites_enviados: { anon: false, autenticado: true, servico: true },
  academy_minhas_empresas: { anon: false, autenticado: true, servico: true },
  academy_aceitar_convite: { anon: false, autenticado: true, servico: true },
  academy_recusar_convite: { anon: false, autenticado: true, servico: true },
  academy_sair_empresa: { anon: false, autenticado: true, servico: true },
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
