-- ============================================================================
-- 0005_contagem_publica.sql - contagem agregada pública (sem PII)
--
-- Exibe no portal principal (home) a quantidade REAL de alunos matriculados
-- na CyDef Academy. A home é um site estático público, então a leitura da
-- contagem precisa ser acessível à role `anon` (chave pública do frontend).
--
-- Segurança (alinhada a HEL-M03/SEC-008):
--   - Retorna APENAS contagens agregadas - nenhuma linha individual, nenhum
--     dado pessoal (mesma política das views de funil da 0004).
--   - `security definer` + RLS deny-by-default: o acesso às tabelas continua
--     bloqueado para anon; a função lê como owner e expõe só o agregado.
--   - PUBLIC revogado e EXECUTE concedido apenas a `anon` (e service_role,
--     que já é a role de função usada pelas outras RPCs).
--
-- "Matriculados" = leads com status `confirmed` (confirmação de e-mail).
-- "Preinscritos" = todos os cadastros recebidos (inclui pendentes/invalidados).
-- ============================================================================

create or replace function public.contagem_alunos()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_preinscritos integer;
  v_confirmados  integer;
begin
  select count(*) into v_preinscritos from public.leads;
  select count(*) into v_confirmados from public.leads where status = 'confirmed';
  return json_build_object(
    'matriculados', v_confirmados,
    'preinscritos', v_preinscritos
  );
end $$;

revoke all on function public.contagem_alunos() from public;
grant execute on function public.contagem_alunos() to anon;
grant execute on function public.contagem_alunos() to service_role;
