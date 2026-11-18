-- ============================================================================
-- 0012_supabase_privilegios_funcoes.sql - Fecha as funções de public
--
-- Problema: o Supabase concede, por default privileges, EXECUTE em toda função
-- nova de public para anon, authenticated e service_role. O padrão usado nas
-- migrações anteriores (`revoke all on function ... from public` seguido de
-- `grant execute ... to authenticated`) NÃO remove esses grants explícitos: o
-- revoke de PUBLIC só tira o grant implícito. Resultado medido em 18/11/2026:
-- as 19 funções de public respondiam `true` para anon, authenticated e
-- service_role, inclusive as que deveriam ser só de service_role
-- (capture_lead, expurgar_contatos, metricas_funil, academy_elegibilidade...).
--
-- Correção: revoke explícito por função, grants reafirmados conforme a matriz
-- e, no fim, a mudança do default para que função nova nasça fechada.
--
-- Matriz permitida:
--   anon          -> contagem_alunos
--   authenticated -> academy_registrar_acesso, academy_meu_painel,
--                    academy_registrar_progresso, academy_video_aula
--   service_role  -> todas
--
-- As funções de trigger (aviso_calcula_hash, aviso_conteudo_imutavel,
-- consentimentos_imutavel) também são fechadas para anon e authenticated.
--
-- Idempotente: rodar de novo não muda o estado.
-- ============================================================================

-- 1. Fecha tudo ---------------------------------------------------------------

revoke all on function public._contato_contar(text) from public, anon, authenticated;
revoke all on function public.academy_elegibilidade(text) from public, anon, authenticated;
revoke all on function public.academy_meu_painel() from public, anon, authenticated;
revoke all on function public.academy_provisionar_aluno(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.academy_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.academy_registrar_acesso() from public, anon, authenticated;
revoke all on function public.academy_registrar_progresso(uuid, integer, boolean) from public, anon, authenticated;
revoke all on function public.academy_video_aula(uuid) from public, anon, authenticated;
revoke all on function public.aviso_calcula_hash() from public, anon, authenticated;
revoke all on function public.aviso_conteudo_imutavel() from public, anon, authenticated;
revoke all on function public.capture_lead(text, text, text, text, text, boolean, boolean, text, timestamp with time zone) from public, anon, authenticated;
revoke all on function public.confirmar_token(text, text) from public, anon, authenticated;
revoke all on function public.consentimentos_imutavel() from public, anon, authenticated;
revoke all on function public.contagem_alunos() from public, anon, authenticated;
revoke all on function public.expurgar_contatos() from public, anon, authenticated;
revoke all on function public.marcar_contato(text, text) from public, anon, authenticated;
revoke all on function public.metricas_funil() from public, anon, authenticated;
revoke all on function public.reenviar_token(text, text, text, timestamp with time zone) from public, anon, authenticated;
revoke all on function public.registrar_contato(text, text, text, text, text, text) from public, anon, authenticated;

-- 2. Grants reafirmados -------------------------------------------------------

-- Leitura pública da home.
grant execute on function public.contagem_alunos() to anon;

-- Portal do aluno: quem está logado.
grant execute on function public.academy_registrar_acesso(),
                          public.academy_meu_painel(),
                          public.academy_registrar_progresso(uuid, integer, boolean),
                          public.academy_video_aula(uuid)
  to authenticated;

-- Servidor (Edge Functions e rotinas): tudo.
grant execute on function public._contato_contar(text),
                          public.academy_elegibilidade(text),
                          public.academy_provisionar_aluno(uuid, uuid, text),
                          public.academy_rate_limit(text, integer, integer),
                          public.aviso_calcula_hash(),
                          public.aviso_conteudo_imutavel(),
                          public.capture_lead(text, text, text, text, text, boolean, boolean, text, timestamp with time zone),
                          public.confirmar_token(text, text),
                          public.consentimentos_imutavel(),
                          public.contagem_alunos(),
                          public.expurgar_contatos(),
                          public.marcar_contato(text, text),
                          public.metricas_funil(),
                          public.reenviar_token(text, text, text, timestamp with time zone),
                          public.registrar_contato(text, text, text, text, text, text)
  to service_role;

-- 3. Default privileges -------------------------------------------------------
-- Duas camadas. No schema public, o que o Supabase deixou concedido; sem esta
-- linha a função nova já nasce com grant explícito para service_role.
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;

-- No padrão global do papel postgres, que o "in schema" não alcança: o
-- Postgres dá EXECUTE a PUBLIC em toda função criada. Vale para tudo que o
-- papel postgres criar, inclusive extensões.
alter default privileges for role postgres
  revoke execute on functions from public;

-- Resultado: função nova nasce com proacl = {postgres=X/postgres}. Quem
-- precisar de grant concede de propósito, na migração que cria a função, e
-- termina com `revoke execute on function ... from public` como reforço.
