-- ============================================================================
-- 0038_academy_prova_montada.sql - avaliação final montada pelo instrutor (fase 26)
--
-- Pedido do Everton (21/11/2026), definido em 26/11/2026: o padrão continua
-- sendo o sorteio do banco de questões, com rotação por aluno. Em cada curso o
-- instrutor escolhe o modo da avaliação final:
--   * sorteio (padrão): como hoje, N questões sorteadas do banco da final;
--   * fixa: o instrutor escolhe as questões da prova. Todo aluno recebe as
--     mesmas questões, com a ordem das questões e das alternativas embaralhada
--     para cada um.
-- As questões de módulo continuam sempre sorteadas.
--
-- O que muda:
--   * cursos_requisitos.final_modo ('sorteio' ou 'fixa');
--   * tabela cursos_prova_final (curso, questão, ordem): as escolhidas, só
--     questões do banco da avaliação final do próprio curso;
--   * academy__prova_fixa(curso): as escolhidas que seguem publicadas e válidas;
--   * academy_situacao_curso e academy_iniciar_final: no modo fixa usam as
--     escolhidas (basta uma); a situação informa o modo ao portal;
--   * academy_adm_salvar_requisitos aceita final_modo;
--   * academy_adm_prova_final e academy_adm_definir_prova_final (painel).
-- O corpo das funções redefinidas é o atual, só com a mudança desta fase.
-- Não altera nem apaga dado existente: todo curso fica em sorteio.
-- ============================================================================

alter table public.cursos_requisitos
  add column if not exists final_modo text not null default 'sorteio';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cursos_requisitos_final_modo') then
    alter table public.cursos_requisitos add constraint cursos_requisitos_final_modo check (final_modo in ('sorteio', 'fixa'));
  end if;
end $$;

create table if not exists public.cursos_prova_final (
  curso_slug  text not null references public.cursos(slug) on delete cascade,
  questao_id  uuid not null references public.questoes(id) on delete cascade,
  ordem       integer not null default 0,
  incluida_em timestamptz not null default now(),
  primary key (curso_slug, questao_id)
);
comment on table public.cursos_prova_final is
  'Questões escolhidas pelo instrutor para a avaliação final no modo fixa. Lida só pelas funções.';
alter table public.cursos_prova_final enable row level security;
revoke all on public.cursos_prova_final from public, anon, authenticated;

-- As escolhidas que seguem no banco da final, publicadas e válidas, na ordem do instrutor.
create or replace function public.academy__prova_fixa(p_curso text)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(p.questao_id order by p.ordem, p.incluida_em), '{}')
    from public.cursos_prova_final p
    join public.questoes q on q.id = p.questao_id
   where p.curso_slug = p_curso and q.curso_slug = p_curso and q.modulo_id is null
     and public.academy__questao_valida(q.id)
$$;

create or replace function public.academy_situacao_curso(p_curso text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid       uuid;
  v_req       public.cursos_requisitos%rowtype;
  v_pend      json;
  v_banco     integer;
  v_aberta    uuid;
  v_ultima    timestamptz;
  v_feitas    integer;
  v_melhor    integer;
  v_proxima   timestamptz;
  v_pre_ok    boolean;
  v_final_ok  boolean;
  v_cert      public.certificados%rowtype;
  v_motivo    text;
begin
  v_uid := public.academy__aluno_no_curso(p_curso);
  select * into v_req from public.cursos_requisitos where curso_slug = p_curso;
  v_pend := public.academy__pendencias(v_uid, p_curso);
  v_pre_ok := (v_pend->>'aulas_ok')::boolean and (v_pend->>'modulos_ok')::boolean;
  v_final_ok := (v_pend->>'final_ok')::boolean;

  -- Fase 26: na prova montada, conta só as escolhidas pelo instrutor que seguem válidas.
  if coalesce(v_req.final_modo, 'sorteio') = 'fixa' then
    v_banco := coalesce(cardinality(public.academy__prova_fixa(p_curso)), 0);
  else
    select count(*) into v_banco from public.questoes q
     where q.curso_slug = p_curso and q.modulo_id is null and public.academy__questao_valida(q.id);
  end if;
  select f.id into v_aberta from public.provas_finais f
   where f.user_id = v_uid and f.curso_slug = p_curso and f.enviada_em is null;
  select count(*), max(f.nota), max(f.enviada_em) filter (where not f.aprovado)
    into v_feitas, v_melhor, v_ultima
    from public.provas_finais f
   where f.user_id = v_uid and f.curso_slug = p_curso and f.enviada_em is not null;
  if not v_final_ok and v_ultima is not null then
    v_proxima := v_ultima + make_interval(hours => coalesce(v_req.espera_final_horas, 24));
    if v_proxima <= now() then
      v_proxima := null;
    end if;
  end if;

  v_motivo := case
    when v_final_ok then 'aprovado'
    when v_req.curso_slug is null then 'sem_requisitos'
    when not v_pre_ok then 'requisitos_pendentes'
    when v_banco < case when coalesce(v_req.final_modo, 'sorteio') = 'fixa' then 1 else v_req.questoes_final end then 'sem_banco'
    when v_req.tentativas_final_max is not null and v_feitas >= v_req.tentativas_final_max then 'sem_tentativas'
    when v_proxima is not null then 'aguarde'
    else 'disponivel'
  end;

  select * into v_cert from public.certificados where user_id = v_uid and curso_slug = p_curso;

  return json_build_object(
    'requisitos', json_build_object(
      'exige_todas_aulas', coalesce(v_req.exige_todas_aulas, true),
      'exige_modulos', coalesce(v_req.exige_modulos, true),
      'nota_minima_modulo', coalesce(v_req.nota_minima_modulo, 70),
      'nota_minima_final', coalesce(v_req.nota_minima_final, 80),
      'questoes_final', case when coalesce(v_req.final_modo, 'sorteio') = 'fixa' then v_banco else coalesce(v_req.questoes_final, 20) end,
      'final_modo', coalesce(v_req.final_modo, 'sorteio'),
      'espera_final_horas', coalesce(v_req.espera_final_horas, 24),
      'tentativas_final_max', v_req.tentativas_final_max,
      'carga_horaria_h', v_req.carga_horaria_h
    ),
    'aulas', json_build_object('total', (v_pend->>'aulas_total')::int, 'concluidas', (v_pend->>'aulas_concluidas')::int),
    'modulos', (select coalesce(json_agg(json_build_object(
                  'id', x.modulo_id, 'ordem', x.ordem, 'titulo', x.titulo,
                  'tem_questoes', x.tem_questoes, 'aprovado', x.aprovado, 'liberado', x.liberado
                ) order by x.ordem), '[]'::json)
                  from public.academy__modulos_do_aluno(v_uid, p_curso) x),
    'final', json_build_object(
      'situacao', v_motivo,
      'prova_aberta', v_aberta,
      'tentativas', v_feitas,
      'melhor_nota', v_melhor,
      'proxima_em', v_proxima
    ),
    'certificado', json_build_object(
      'elegivel', v_cert.codigo is null and v_pre_ok and v_final_ok
                  and coalesce(v_req.certificado_ativo, false) and v_req.carga_horaria_h is not null,
      'codigo', v_cert.codigo,
      'nome', v_cert.nome,
      'concluido_em', v_cert.concluido_em
    )
  );
end $$;

create or replace function public.academy_iniciar_final(p_curso text)
returns json
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid    uuid;
  v_sit    json;
  v_req    public.cursos_requisitos%rowtype;
  v_prova  public.provas_finais%rowtype;
  v_ids    uuid[];
begin
  v_uid := public.academy__aluno_no_curso(p_curso);

  -- Prova já aberta: volta para ela (o aluno pode ter fechado a aba).
  select * into v_prova from public.provas_finais
   where user_id = v_uid and curso_slug = p_curso and enviada_em is null;
  if v_prova.id is null then
    v_sit := public.academy_situacao_curso(p_curso);
    if v_sit->'final'->>'situacao' <> 'disponivel' then
      raise exception '%', v_sit->'final'->>'situacao';
    end if;
    select * into v_req from public.cursos_requisitos where curso_slug = p_curso;
    if coalesce(v_req.final_modo, 'sorteio') = 'fixa' then
      -- Fase 26: as mesmas questões escolhidas pelo instrutor, em ordem embaralhada para cada aluno.
      select array_agg(x order by random()) into v_ids from unnest(public.academy__prova_fixa(p_curso)) x;
    else
      select array_agg(id) into v_ids from (
        select q.id from public.questoes q
         where q.curso_slug = p_curso and q.modulo_id is null and public.academy__questao_valida(q.id)
         order by random()
         limit v_req.questoes_final
      ) s;
    end if;
    insert into public.provas_finais (user_id, curso_slug, questoes)
    values (v_uid, p_curso, v_ids)
    returning * into v_prova;
  end if;

  return json_build_object(
    'prova_id', v_prova.id,
    'iniciada_em', v_prova.iniciada_em,
    'questoes', public.academy__questoes_para_aluno(v_prova.questoes)
  );
end $$;

create or replace function public.academy_adm_salvar_requisitos(p_curso text, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_r public.cursos_requisitos%rowtype;
begin
  perform public.academy__exigir_curso(p_curso);
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  insert into public.cursos_requisitos (curso_slug) values (p_curso) on conflict (curso_slug) do nothing;
  select * into v_r from public.cursos_requisitos where curso_slug = p_curso;

  update public.cursos_requisitos set
    exige_todas_aulas    = case when p_dados ? 'exige_todas_aulas' then (p_dados->>'exige_todas_aulas')::boolean else v_r.exige_todas_aulas end,
    exige_modulos        = case when p_dados ? 'exige_modulos' then (p_dados->>'exige_modulos')::boolean else v_r.exige_modulos end,
    nota_minima_modulo   = case when p_dados ? 'nota_minima_modulo' then (p_dados->>'nota_minima_modulo')::integer else v_r.nota_minima_modulo end,
    questoes_modulo      = case when p_dados ? 'questoes_modulo' then (p_dados->>'questoes_modulo')::integer else v_r.questoes_modulo end,
    nota_minima_final    = case when p_dados ? 'nota_minima_final' then (p_dados->>'nota_minima_final')::integer else v_r.nota_minima_final end,
    questoes_final       = case when p_dados ? 'questoes_final' then (p_dados->>'questoes_final')::integer else v_r.questoes_final end,
    espera_final_horas   = case when p_dados ? 'espera_final_horas' then (p_dados->>'espera_final_horas')::integer else v_r.espera_final_horas end,
    tentativas_final_max = case when p_dados ? 'tentativas_final_max' then (p_dados->>'tentativas_final_max')::integer else v_r.tentativas_final_max end,
    carga_horaria_h      = case when p_dados ? 'carga_horaria_h' then (p_dados->>'carga_horaria_h')::numeric else v_r.carga_horaria_h end,
    certificado_ativo    = case when p_dados ? 'certificado_ativo' then (p_dados->>'certificado_ativo')::boolean else v_r.certificado_ativo end,
    modelo_certificado   = case when p_dados ? 'modelo_certificado' then nullif(p_dados->>'modelo_certificado', '') else v_r.modelo_certificado end,
    final_modo           = case when p_dados ? 'final_modo' then p_dados->>'final_modo' else v_r.final_modo end,
    atualizado_em        = now()
  where curso_slug = p_curso;

  perform public.academy__auditar('requisitos_salvos', p_curso, p_dados);
  return public.academy_adm_curso(p_curso);
exception
  when check_violation or invalid_text_representation or numeric_value_out_of_range or not_null_violation then
    raise exception 'requisitos_invalidos';
end $$;

create or replace function public.academy_adm_prova_final(p_curso text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_curso(p_curso);
  return json_build_object(
    'modo', coalesce((select r.final_modo from public.cursos_requisitos r where r.curso_slug = p_curso), 'sorteio'),
    'questoes', (select coalesce(json_agg(p.questao_id order by p.ordem, p.incluida_em), '[]'::json)
                   from public.cursos_prova_final p where p.curso_slug = p_curso),
    'validas', coalesce(cardinality(public.academy__prova_fixa(p_curso)), 0)
  );
end $$;

-- Põe (p_incluir = true) ou tira questões da prova montada. Só questões do banco
-- da avaliação final do próprio curso; rascunho pode entrar, mas só conta para o
-- aluno depois de publicada.
create or replace function public.academy_adm_definir_prova_final(p_curso text, p_questoes uuid[], p_incluir boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proxima integer;
begin
  perform public.academy__exigir_curso(p_curso);
  if p_incluir is null or p_questoes is null or cardinality(p_questoes) = 0 or cardinality(p_questoes) > 200 then
    raise exception 'invalid_payload';
  end if;
  if exists (
    select 1 from unnest(p_questoes) x
     where not exists (select 1 from public.questoes q where q.id = x and q.curso_slug = p_curso and q.modulo_id is null)
  ) then
    raise exception 'questao_inexistente';
  end if;

  if p_incluir then
    select coalesce(max(ordem), 0) into v_proxima from public.cursos_prova_final where curso_slug = p_curso;
    -- Mantém a ordem em que o instrutor marcou; repetida conta uma vez.
    insert into public.cursos_prova_final (curso_slug, questao_id, ordem)
    select p_curso, d.x, v_proxima + row_number() over (order by d.pos)
      from (select x, min(pos) as pos from unnest(p_questoes) with ordinality as u(x, pos) group by x) d
    on conflict (curso_slug, questao_id) do nothing;
    if (select count(*) from public.cursos_prova_final where curso_slug = p_curso) > 100 then
      raise exception 'prova_grande_demais';
    end if;
  else
    delete from public.cursos_prova_final where curso_slug = p_curso and questao_id = any(p_questoes);
  end if;

  perform public.academy__auditar(case when p_incluir then 'prova_final_incluidas' else 'prova_final_retiradas' end, p_curso,
    jsonb_build_object('questoes', to_jsonb(p_questoes)));
  return public.academy_adm_prova_final(p_curso);
end $$;

revoke all on function
  public.academy__prova_fixa(text),
  public.academy_situacao_curso(text),
  public.academy_iniciar_final(text),
  public.academy_adm_salvar_requisitos(text, jsonb),
  public.academy_adm_prova_final(text),
  public.academy_adm_definir_prova_final(text, uuid[], boolean)
from public, anon, authenticated;

grant execute on function
  public.academy_situacao_curso(text),
  public.academy_iniciar_final(text),
  public.academy_adm_salvar_requisitos(text, jsonb),
  public.academy_adm_prova_final(text),
  public.academy_adm_definir_prova_final(text, uuid[], boolean)
to authenticated, service_role;

grant execute on function public.academy__prova_fixa(text) to service_role;
