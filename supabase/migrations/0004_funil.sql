-- ============================================================================
-- 0004_funil.sql — métricas sem PII (REQ-004/SEC-008, ADRV-07)
--
-- Fonte primária do funil: lead store (caminho substituto ao analytics).
-- Agregados somente — nenhuma linha individual, nenhum PII.
-- ============================================================================

-- Visão de funil agregada (sem PII).
create or replace view public.v_funil_preinscricao as
select
  count(*)                                        as preinscritos,
  count(*) filter (where status = 'confirmed')    as confirmados,
  count(*) filter (where status = 'invalid')      as invalidados,
  count(*) filter (where status = 'descartado')   as descartados
from public.leads;

-- Visão por perfil declarado (agregado, sem PII).
create or replace view public.v_funil_por_perfil as
select
  perfil,
  count(*)                                     as preinscritos,
  count(*) filter (where status = 'confirmed') as confirmados
from public.leads
group by perfil;

-- RPC de métricas agregadas (security definer; EXECUTE apenas p/ role de função).
create or replace function public.metricas_funil()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_preinscritos  integer;
  v_confirmados   integer;
  v_anomalias     integer;
begin
  select preinscritos, confirmados
    into v_preinscritos, v_confirmados
    from public.v_funil_preinscricao;

  -- Anomalias (possível bot): contagem total de eventos de rate limit
  -- (não expõe chaves/hashes — apenas contagem).
  select count(*) into v_anomalias from public.rate_limit_events;

  return json_build_object(
    'preinscritos', v_preinscritos,
    'confirmados',  v_confirmados,
    'taxa_confirmacao', case when v_preinscritos > 0
                             then round(v_confirmados::numeric / v_preinscritos, 4)
                             else null end,
    'eventos_rate_limit', v_anomalias
  );
end $$;

revoke all on function public.metricas_funil() from public;
grant execute on function public.metricas_funil() to service_role;
