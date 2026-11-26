-- ============================================================================
-- 0037_academy_publicar_questoes_em_lote.sql - publicar várias questões de uma vez (fase 24)
--
-- Pedido do Everton (25/11/2026): no banco de questões, publicar era uma por
-- vez (entrar na questão, marcar, salvar). Com 16 ou 20 questões por módulo,
-- isso não serve.
--
-- academy_adm_publicar_questoes(curso, questões, publicar) publica (ou volta
-- para rascunho) até 200 questões do curso numa chamada. Ao publicar, a regra é
-- a mesma de academy_adm_salvar_questao: 2 a 8 alternativas e uma correta. Questão
-- que não cumpre fica como está e volta na lista "ignoradas", sem derrubar o
-- resto. Uma linha de auditoria por chamada.
-- ============================================================================

create or replace function public.academy_adm_publicar_questoes(p_curso text, p_questoes uuid[], p_publicar boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_validas   uuid[];
  v_ignoradas uuid[];
begin
  perform public.academy__exigir_curso(p_curso);
  if p_publicar is null or p_questoes is null or cardinality(p_questoes) = 0 or cardinality(p_questoes) > 200 then
    raise exception 'invalid_payload';
  end if;
  if exists (
    select 1 from unnest(p_questoes) x
     where not exists (select 1 from public.questoes q where q.id = x and q.curso_slug = p_curso)
  ) then
    raise exception 'questao_inexistente';
  end if;

  if p_publicar then
    select coalesce(array_agg(q.id) filter (where ok), '{}'), coalesce(array_agg(q.id) filter (where not ok), '{}')
      into v_validas, v_ignoradas
      from (
        select q.id,
               (select count(*) from public.questoes_alternativas a where a.questao_id = q.id) between 2 and 8
               and (select count(*) from public.questoes_alternativas a where a.questao_id = q.id and a.correta) = 1 as ok
          from public.questoes q
         where q.id = any(p_questoes)
      ) q;
  else
    v_validas := array(select distinct x from unnest(p_questoes) x);
    v_ignoradas := '{}';
  end if;

  update public.questoes
     set publicado = p_publicar, atualizado_em = now()
   where id = any(v_validas) and publicado is distinct from p_publicar;

  perform public.academy__auditar(case when p_publicar then 'questoes_publicadas' else 'questoes_despublicadas' end, p_curso,
    jsonb_build_object('questoes', to_jsonb(v_validas), 'ignoradas', to_jsonb(v_ignoradas)));

  return json_build_object(
    'alteradas', cardinality(v_validas),
    'ignoradas', to_json(v_ignoradas),
    'questoes', public.academy_adm_questoes(p_curso)
  );
end $$;

revoke all on function public.academy_adm_publicar_questoes(text, uuid[], boolean) from public, anon, authenticated;
grant execute on function public.academy_adm_publicar_questoes(text, uuid[], boolean) to authenticated, service_role;
