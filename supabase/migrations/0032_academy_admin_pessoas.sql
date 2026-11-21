-- ============================================================================
-- 0032_academy_admin_pessoas.sql - Indicadores e Pessoas no painel do admin
-- (fase 20)
--
-- Pedido do Everton (21/11/2026): o admin precisa ver quem se cadastrou, sem
-- precisar saber o e-mail de cada um, acompanhar os números da Academy e
-- editar o perfil das pessoas (menos o e-mail), além de trocar o papel.
--
--   academy_adm_indicadores()  números gerais, funil, cadastros por dia,
--                              perfis declarados e um resumo por curso
--   academy_adm_pessoas(...)   lista paginada: contas do portal e
--                              pré-inscrições que ainda não entraram
--   academy_adm_pessoa(id)     ficha de uma conta: perfil, papel, cursos com
--                              progresso, certificados e missões
--   academy_adm_salvar_perfil  edita o perfil (0030) de outra pessoa; o
--                              e-mail não muda; grava na auditoria
--
-- A troca de papel continua em academy_adm_definir_equipe e
-- academy_adm_remover_equipe (0015). Tudo exige admin (academy__exigir_admin)
-- e é só leitura, exceto academy_adm_salvar_perfil.
--
-- Sem bloqueio de acesso e sem exportação em planilha nesta fase.
-- Privilégios no padrão da 0012. Idempotente.
-- ============================================================================

-- Progresso de um aluno em um curso: aulas publicadas e concluídas.
create or replace function public.academy__progresso_curso(p_user uuid, p_curso text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with pub as (
    select a.id from public.aulas a join public.modulos m on m.id = a.modulo_id
     where m.curso_slug = p_curso and a.publicado
  )
  select json_build_object(
    'aulas', (select count(*) from pub),
    'concluidas', (select count(*) from public.progresso_aulas p
                    where p.user_id = p_user and p.concluida_em is not null and p.aula_id in (select id from pub)),
    'ultima_atividade', (select max(p.atualizado_em) from public.progresso_aulas p
                          where p.user_id = p_user and p.aula_id in (select id from pub))
  )
$$;

-- Indicadores ------------------------------------------------------------------------

create or replace function public.academy_adm_indicadores()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_admin();
  return (
    with leads_validos as (
      select l.* from public.leads l where l.status not in ('invalid', 'descartado')
    ),
    aulas_pub as (
      select m.curso_slug, a.id from public.aulas a join public.modulos m on m.id = a.modulo_id where a.publicado
    ),
    por_matricula as (
      select mt.user_id, mt.curso_slug,
             (select count(*) from aulas_pub ap where ap.curso_slug = mt.curso_slug) as total,
             (select count(*) from public.progresso_aulas p join aulas_pub ap on ap.id = p.aula_id
               where p.user_id = mt.user_id and ap.curso_slug = mt.curso_slug and p.concluida_em is not null) as feitas,
             exists (select 1 from public.progresso_aulas p join aulas_pub ap on ap.id = p.aula_id
                      where p.user_id = mt.user_id and ap.curso_slug = mt.curso_slug) as comecou
        from public.matriculas mt
    ),
    cursos_pub as (
      select c.slug, c.titulo, c.gratuito, c.ordem from public.cursos c where c.publicado
    )
    select json_build_object(
      'gerado_em', now(),
      'pre_inscricoes', json_build_object(
        'total', (select count(*) from leads_validos),
        'ult_7', (select count(*) from leads_validos where created_at > now() - interval '7 days'),
        'ult_30', (select count(*) from leads_validos where created_at > now() - interval '30 days')
      ),
      'contas', json_build_object(
        'total', (select count(*) from public.alunos),
        'ult_7', (select count(*) from public.alunos where criado_em > now() - interval '7 days'),
        'ult_30', (select count(*) from public.alunos where criado_em > now() - interval '30 days')
      ),
      'ativos', json_build_object(
        'ult_7', (select count(distinct d.user_id) from public.dias_estudo d where d.dia > current_date - 7),
        'ult_30', (select count(distinct d.user_id) from public.dias_estudo d where d.dia > current_date - 30)
      ),
      'certificados', json_build_object(
        'total', (select count(*) from public.certificados),
        'ult_30', (select count(*) from public.certificados where emitido_em > now() - interval '30 days')
      ),
      'funil', json_build_object(
        'pre_inscritos', (select count(*) from leads_validos),
        'entraram', (select count(*) from public.alunos where ultimo_acesso_em is not null),
        'comecaram', (select count(distinct user_id) from por_matricula where comecou),
        'concluiram_curso', (select count(distinct user_id) from por_matricula where total > 0 and feitas >= total),
        'certificados', (select count(distinct user_id) from public.certificados)
      ),
      'por_dia', (
        select coalesce(json_agg(json_build_object(
                 'dia', d::date,
                 'pre_inscricoes', (select count(*) from leads_validos l where l.created_at::date = d::date),
                 'contas', (select count(*) from public.alunos al where al.criado_em::date = d::date)
               ) order by d), '[]'::json)
          from generate_series(current_date - 29, current_date, interval '1 day') d
      ),
      'perfil_declarado', (
        select coalesce(json_object_agg(perfil, n), '{}'::json)
          from (select perfil, count(*) n from leads_validos group by perfil) x
      ),
      'areas', (
        select coalesce(json_object_agg(area, n), '{}'::json)
          from (select area, count(*) n from public.academy_perfis where area is not null group by area) x
      ),
      'experiencia', (
        select coalesce(json_object_agg(experiencia, n), '{}'::json)
          from (select experiencia, count(*) n from public.academy_perfis where experiencia is not null group by experiencia) x
      ),
      'cursos', (
        select coalesce(json_agg(json_build_object(
                 'slug', c.slug, 'titulo', c.titulo, 'gratuito', c.gratuito,
                 'aulas', (select count(*) from aulas_pub ap where ap.curso_slug = c.slug),
                 'matriculados', (select count(*) from por_matricula pm where pm.curso_slug = c.slug),
                 'comecaram', (select count(*) from por_matricula pm where pm.curso_slug = c.slug and pm.comecou),
                 'concluiram', (select count(*) from por_matricula pm where pm.curso_slug = c.slug and pm.total > 0 and pm.feitas >= pm.total),
                 'media_conclusao', (select coalesce(round(avg(case when pm.total > 0 then least(pm.feitas, pm.total) * 100.0 / pm.total else 0 end)), 0)
                                       from por_matricula pm where pm.curso_slug = c.slug),
                 'aprovados_final', (select count(distinct pf.user_id) from public.provas_finais pf where pf.curso_slug = c.slug and pf.aprovado),
                 'certificados', (select count(*) from public.certificados ce where ce.curso_slug = c.slug)
               ) order by c.gratuito desc, c.ordem, c.slug), '[]'::json)
          from cursos_pub c
      )
    )
  );
end $$;

-- Lista de pessoas ---------------------------------------------------------------------
-- p_filtro: 'todos' | 'contas' | 'sem_conta' | 'equipe'. p_busca procura no
-- nome e no e-mail. Ordem: cadastro mais recente primeiro.
create or replace function public.academy_adm_pessoas(p_busca text, p_filtro text, p_limite integer, p_offset integer)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_busca  text := nullif(btrim(coalesce(p_busca, '')), '');
  v_filtro text := coalesce(nullif(btrim(coalesce(p_filtro, '')), ''), 'todos');
  v_lim    integer := greatest(1, least(coalesce(p_limite, 50), 100));
  v_off    integer := greatest(0, coalesce(p_offset, 0));
  v_padrao text;
begin
  perform public.academy__exigir_admin();
  if v_filtro not in ('todos', 'contas', 'sem_conta', 'equipe') then
    raise exception 'invalid_payload';
  end if;
  if v_busca is not null and length(v_busca) > 120 then
    raise exception 'invalid_payload';
  end if;
  v_padrao := case when v_busca is null then null
                   else '%' || replace(replace(replace(lower(v_busca), '\', '\\'), '%', '\%'), '_', '\_') || '%' end;

  return (
    with pessoas as (
      select 'conta'::text as tipo, al.user_id, al.lead_id, al.nome, lower(u.email) as email,
             e.papel, l.perfil as perfil_declarado, al.criado_em as cadastro_em, al.ultimo_acesso_em,
             (select count(*) from public.matriculas mt where mt.user_id = al.user_id) as cursos,
             (select count(*) from public.certificados ce where ce.user_id = al.user_id) as certificados
        from public.alunos al
        join auth.users u on u.id = al.user_id
        left join public.academy_equipe e on e.user_id = al.user_id
        left join public.leads l on l.id = al.lead_id
      union all
      select 'pre_inscricao', null, l.id, l.nome, lower(l.email), null, l.perfil, l.created_at, null, 0, 0
        from public.leads l
       where l.status not in ('invalid', 'descartado')
         and not exists (select 1 from public.alunos al where al.lead_id = l.id)
         and not exists (select 1 from auth.users u join public.alunos al on al.user_id = u.id where lower(u.email) = lower(l.email))
    ),
    filtradas as (
      select * from pessoas p
       where (v_padrao is null or lower(p.nome) like v_padrao escape '\' or p.email like v_padrao escape '\')
         and (v_filtro = 'todos'
              or (v_filtro = 'contas' and p.tipo = 'conta')
              or (v_filtro = 'sem_conta' and p.tipo = 'pre_inscricao')
              or (v_filtro = 'equipe' and p.papel is not null))
    )
    select json_build_object(
      'total', (select count(*) from filtradas),
      'itens', coalesce((
        select json_agg(json_build_object(
                 'tipo', f.tipo, 'user_id', f.user_id, 'lead_id', f.lead_id, 'nome', f.nome, 'email', f.email,
                 'papel', f.papel, 'perfil_declarado', f.perfil_declarado, 'cadastro_em', f.cadastro_em,
                 'ultimo_acesso_em', f.ultimo_acesso_em, 'cursos', f.cursos, 'certificados', f.certificados
               ) order by f.cadastro_em desc, f.email)
          from (select * from filtradas order by cadastro_em desc, email limit v_lim offset v_off) f
      ), '[]'::json)
    )
  );
end $$;

-- Ficha de uma conta ----------------------------------------------------------------------

create or replace function public.academy_adm_pessoa(p_user_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_perfil json;
begin
  perform public.academy__exigir_admin();
  v_perfil := public.academy__perfil(p_user_id);
  if v_perfil is null then
    raise exception 'pessoa_inexistente';
  end if;
  return (
    select json_build_object(
      'user_id', al.user_id,
      'perfil', v_perfil,
      'criado_em', al.criado_em,
      'ultimo_acesso_em', al.ultimo_acesso_em,
      'papel', e.papel,
      'eu', al.user_id = auth.uid(),
      'cursos_equipe', coalesce((select json_agg(ec.curso_slug order by ec.curso_slug)
                                   from public.academy_equipe_cursos ec where ec.user_id = al.user_id), '[]'::json),
      'pre_inscricao', case when l.id is null then null
                            else json_build_object('perfil', l.perfil, 'criado_em', l.created_at, 'status', l.status) end,
      'cursos', coalesce((
        select json_agg(json_build_object(
                 'slug', c.slug, 'titulo', c.titulo, 'origem', mt.origem, 'matriculado_em', mt.criado_em,
                 'progresso', public.academy__progresso_curso(al.user_id, c.slug)
               ) order by mt.criado_em)
          from public.matriculas mt join public.cursos c on c.slug = mt.curso_slug
         where mt.user_id = al.user_id), '[]'::json),
      'certificados', coalesce((
        select json_agg(json_build_object('codigo', ce.codigo, 'curso_titulo', ce.curso_titulo, 'emitido_em', ce.emitido_em)
                        order by ce.emitido_em desc)
          from public.certificados ce where ce.user_id = al.user_id), '[]'::json),
      'missoes', json_build_object(
        'tentativas', (select count(*) from public.missao_tentativas mt where mt.user_id = al.user_id and mt.enviada_em is not null),
        'aprovadas', (select count(distinct mt.missao_id) from public.missao_tentativas mt where mt.user_id = al.user_id and mt.aprovado)
      )
    )
      from public.alunos al
      left join public.academy_equipe e on e.user_id = al.user_id
      left join public.leads l on l.id = al.lead_id
     where al.user_id = p_user_id
  );
end $$;

-- Edição do perfil pelo admin (o e-mail nunca muda) ---------------------------------------

create or replace function public.academy_adm_salvar_perfil(p_user_id uuid, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_antes json;
begin
  perform public.academy__exigir_admin();
  v_antes := public.academy__perfil(p_user_id);
  if v_antes is null then
    raise exception 'pessoa_inexistente';
  end if;
  perform public.academy__salvar_perfil(p_user_id, p_dados);
  -- Na auditoria vão só os nomes dos campos que mudaram, não os valores.
  perform public.academy__auditar('perfil_editado', p_user_id::text, jsonb_build_object('campos', (
    select coalesce(jsonb_agg(k order by k), '[]'::jsonb)
      from jsonb_each(v_antes::jsonb) a(k, v)
      join jsonb_each(public.academy__perfil(p_user_id)::jsonb) d(k2, v2) on d.k2 = a.k
     where a.k not in ('email', 'atualizado_em') and a.v is distinct from d.v2
  )));
  return public.academy_adm_pessoa(p_user_id);
end $$;

-- Privilégios (padrão da 0012) -------------------------------------------------------------

revoke all on function
  public.academy__progresso_curso(uuid, text),
  public.academy_adm_indicadores(),
  public.academy_adm_pessoas(text, text, integer, integer),
  public.academy_adm_pessoa(uuid),
  public.academy_adm_salvar_perfil(uuid, jsonb)
  from public, anon, authenticated;

grant execute on function
  public.academy_adm_indicadores(),
  public.academy_adm_pessoas(text, text, integer, integer),
  public.academy_adm_pessoa(uuid),
  public.academy_adm_salvar_perfil(uuid, jsonb)
  to authenticated, service_role;

grant execute on function public.academy__progresso_curso(uuid, text) to service_role;
