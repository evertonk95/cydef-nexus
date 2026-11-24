-- ============================================================================
-- 0036_academy_quem_ensina_equipe.sql - "Quem ensina" com a equipe e vários de uma vez (fase 23)
--
-- Pedido do Everton (24/11/2026): o Matheus, instrutor da Equipe, não aparecia
-- para ser escolhido em "Quem ensina" do Fundamentos para SOC. A lista só
-- mostrava quem já tinha cartão de instrutor, e o cartão só nascia quando a
-- pessoa preenchia "Perfil de instrutor". Além disso, dava para acrescentar
-- uma pessoa por vez.
--
-- O que muda:
--   * academy_adm_instrutores passa a devolver também "equipe_sem_perfil":
--     quem está na Equipe e ainda não tem cartão (só id e nome);
--   * academy_adm_acrescentar_instrutores(curso, cartões, pessoas, papel)
--     acrescenta vários de uma vez. Para pessoa da Equipe sem cartão, cria o
--     cartão ligado à conta dela, com o nome da conta; cargo, bio e links ela
--     completa em "Perfil de instrutor". Uma linha de auditoria por chamada.
--
-- academy_adm_vincular_instrutor continua existindo, sem mudança.
-- ============================================================================

create or replace function public.academy_adm_instrutores(p_curso text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_curso(p_curso);
  return json_build_object(
    'do_curso', public.academy__instrutores_do_curso(p_curso),
    'disponiveis', (
      select coalesce(json_agg(public.academy__instrutor_json(i.id) order by i.nome), '[]'::json)
        from public.instrutores i
       where not exists (select 1 from public.cursos_instrutores ci where ci.curso_slug = p_curso and ci.instrutor_id = i.id)
    ),
    'equipe_sem_perfil', (
      select coalesce(json_agg(json_build_object('id', e.user_id, 'nome', public.academy__nome_da_conta(e.user_id), 'eu', e.user_id = auth.uid())
                               order by public.academy__nome_da_conta(e.user_id)), '[]'::json)
        from public.academy_equipe e
       where not exists (select 1 from public.instrutores i where i.user_id = e.user_id)
    )
  );
end $$;

-- Nome que vai no cartão novo: o de Meu perfil e, sem ele, o começo do e-mail.
create or replace function public.academy__nome_da_conta(p_user uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select left(coalesce(
           nullif(btrim((select a.nome from public.alunos a where a.user_id = p_user)), ''),
           nullif(split_part((select u.email from auth.users u where u.id = p_user), '@', 1), ''),
           'Instrutor'
         ), 80)
$$;

create or replace function public.academy_adm_acrescentar_instrutores(
  p_curso       text,
  p_instrutores uuid[],
  p_pessoas     uuid[],
  p_papel       text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid;
  v_cards  uuid[] := coalesce(p_instrutores, '{}');
  v_pessoa uuid;
  v_card   uuid;
  v_novos  int := 0;
  v_id     uuid;
begin
  v_uid := public.academy__exigir_curso(p_curso);
  if p_papel not in ('instrutor', 'convidado') then
    raise exception 'papel_invalido';
  end if;
  if cardinality(v_cards) + cardinality(coalesce(p_pessoas, '{}')) = 0
     or cardinality(v_cards) + cardinality(coalesce(p_pessoas, '{}')) > 20 then
    raise exception 'invalid_payload';
  end if;
  if exists (select 1 from unnest(v_cards) x where not exists (select 1 from public.instrutores i where i.id = x)) then
    raise exception 'instrutor_inexistente';
  end if;

  foreach v_pessoa in array coalesce(p_pessoas, '{}') loop
    if not exists (select 1 from public.academy_equipe e where e.user_id = v_pessoa) then
      raise exception 'fora_da_equipe';
    end if;
    select i.id into v_card from public.instrutores i where i.user_id = v_pessoa;
    if v_card is null then
      insert into public.instrutores (user_id, nome, criado_por)
      values (v_pessoa, public.academy__nome_da_conta(v_pessoa), v_uid)
      returning id into v_card;
      v_novos := v_novos + 1;
    end if;
    v_cards := array_append(v_cards, v_card);
  end loop;

  foreach v_id in array v_cards loop
    insert into public.cursos_instrutores (curso_slug, instrutor_id, papel, ordem)
    values (p_curso, v_id, p_papel,
            coalesce((select max(ordem) from public.cursos_instrutores where curso_slug = p_curso), 0) + 1)
    on conflict (curso_slug, instrutor_id) do update set papel = excluded.papel;
  end loop;

  perform public.academy__auditar('instrutores_acrescentados', p_curso,
    jsonb_build_object('instrutores', to_jsonb(v_cards), 'papel', p_papel, 'cartoes_criados', v_novos));
  return public.academy_adm_instrutores(p_curso);
end $$;

revoke all on function
  public.academy_adm_instrutores(text),
  public.academy__nome_da_conta(uuid),
  public.academy_adm_acrescentar_instrutores(text, uuid[], uuid[], text)
from public, anon, authenticated;

grant execute on function
  public.academy_adm_instrutores(text),
  public.academy_adm_acrescentar_instrutores(text, uuid[], uuid[], text)
to authenticated, service_role;

grant execute on function public.academy__nome_da_conta(uuid) to service_role;
