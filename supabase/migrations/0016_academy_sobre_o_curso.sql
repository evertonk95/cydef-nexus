-- ============================================================================
-- 0016_academy_sobre_o_curso.sql - Sobre o curso e instrutores (fase 13b)
--
-- Pedido do Everton (19/11/2026): o instrutor edita, pelo painel, o que o
-- aluno precisa saber antes de começar: objetivos, para quem é,
-- pré-requisitos, a ementa (um resumo por módulo) e quem dá o curso,
-- inclusive convidados de collab.
--
-- Modelo:
--   * cursos ganha objetivos, publico e pre_requisitos; modulos ganha resumo.
--     As duas tabelas já são lidas pelo catálogo com select na tabela
--     inteira (0008), então os campos novos chegam ao aluno pela mesma
--     consulta, só de curso publicado (RLS).
--   * instrutores: perfil público de quem ensina. user_id preenchido quando
--     a pessoa é da equipe (edita o próprio perfil); vazio para convidado,
--     que aparece no curso sem ter acesso ao painel.
--   * cursos_instrutores: quem aparece em cada curso, com papel (instrutor
--     ou convidado) e ordem.
--
-- Leitura pública só das colunas de vitrine (nome, cargo, bio, links) e só
-- de quem está em curso publicado. user_id e criado_por ficam fora.
-- Escrita só pelas funções academy_adm_*, com papel conferido no servidor e
-- registro em academy_auditoria (0015).
--
-- Idempotente.
-- ============================================================================

-- 1. Campos novos ---------------------------------------------------------------

alter table public.cursos
  add column if not exists objetivos       text[] not null default '{}',
  add column if not exists publico         text   not null default '',
  add column if not exists pre_requisitos  text   not null default '';

alter table public.modulos
  add column if not exists resumo text not null default '';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cursos_objetivos_qtd') then
    alter table public.cursos add constraint cursos_objetivos_qtd check (cardinality(objetivos) <= 10);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cursos_publico_tam') then
    alter table public.cursos add constraint cursos_publico_tam check (length(publico) <= 600);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cursos_pre_requisitos_tam') then
    alter table public.cursos add constraint cursos_pre_requisitos_tam check (length(pre_requisitos) <= 600);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'modulos_resumo_tam') then
    alter table public.modulos add constraint modulos_resumo_tam check (length(resumo) <= 400);
  end if;
end $$;

comment on column public.cursos.objetivos is 'O que o aluno vai saber fazer ao terminar. Até 10 itens de até 200 caracteres.';
comment on column public.modulos.resumo is 'Ementa do módulo: o que se aprende nele. Aparece também em módulo ainda sem aula.';

-- 2. Instrutores ------------------------------------------------------------------

create table if not exists public.instrutores (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references auth.users(id) on delete set null,
  nome          text not null check (length(btrim(nome)) between 2 and 80),
  cargo         text not null default '' check (length(cargo) <= 120),
  bio           text not null default '' check (length(bio) <= 1200),
  linkedin      text check (linkedin is null or (linkedin ~ '^https://([a-z]{2,3}\.)?linkedin\.com/[^[:space:]]+$' and length(linkedin) <= 300)),
  site          text check (site is null or (site ~ '^https://[^[:space:]]+$' and length(site) <= 300)),
  criado_por    uuid,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.cursos_instrutores (
  curso_slug   text not null references public.cursos(slug) on delete cascade,
  instrutor_id uuid not null references public.instrutores(id) on delete cascade,
  papel        text not null default 'instrutor' check (papel in ('instrutor', 'convidado')),
  ordem        integer not null default 1 check (ordem > 0),
  primary key (curso_slug, instrutor_id)
);
create index if not exists cursos_instrutores_instrutor_idx on public.cursos_instrutores (instrutor_id);

comment on table public.instrutores is 'Perfil público de quem ensina. user_id vazio: convidado, sem acesso ao painel.';

alter table public.instrutores        enable row level security;
alter table public.cursos_instrutores enable row level security;

revoke all on table public.instrutores, public.cursos_instrutores from anon, authenticated, service_role;

grant select (curso_slug, instrutor_id, papel, ordem) on public.cursos_instrutores to anon, authenticated;
grant select (id, nome, cargo, bio, linkedin, site) on public.instrutores to anon, authenticated;

drop policy if exists cursos_instrutores_publicados on public.cursos_instrutores;
create policy cursos_instrutores_publicados on public.cursos_instrutores
  for select to anon, authenticated
  using (exists (select 1 from public.cursos c where c.slug = curso_slug and c.publicado));

drop policy if exists instrutores_em_curso_publicado on public.instrutores;
create policy instrutores_em_curso_publicado on public.instrutores
  for select to anon, authenticated
  using (exists (
    select 1 from public.cursos_instrutores ci join public.cursos c on c.slug = ci.curso_slug
     where ci.instrutor_id = id and c.publicado
  ));

-- 3. Funções internas ---------------------------------------------------------

create or replace function public.academy__instrutor_json(p_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', i.id, 'nome', i.nome, 'cargo', i.cargo, 'bio', i.bio,
    'linkedin', i.linkedin, 'site', i.site,
    'da_equipe', i.user_id is not null,
    'eu', i.user_id is not null and i.user_id = auth.uid()
  )
    from public.instrutores i where i.id = p_id
$$;

-- Valida e aplica os campos de perfil enviados. Campos ausentes ficam como estão.
create or replace function public.academy__aplicar_perfil(p_id uuid, p_dados jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.instrutores%rowtype;
  v_link text;
  v_site text;
begin
  select * into v from public.instrutores where id = p_id;
  if p_dados ? 'linkedin' then
    v_link := nullif(btrim(coalesce(p_dados->>'linkedin', '')), '');
    if v_link is not null and (v_link !~ '^https://([a-z]{2,3}\.)?linkedin\.com/[^[:space:]]+$' or length(v_link) > 300) then
      raise exception 'linkedin_invalido';
    end if;
  else
    v_link := v.linkedin;
  end if;
  if p_dados ? 'site' then
    v_site := nullif(btrim(coalesce(p_dados->>'site', '')), '');
    if v_site is not null and (v_site !~ '^https://[^[:space:]]+$' or length(v_site) > 300) then
      raise exception 'link_invalido';
    end if;
  else
    v_site := v.site;
  end if;

  update public.instrutores set
    nome  = case when p_dados ? 'nome' then public.academy__texto(p_dados->>'nome', 2, 80, 'nome_invalido') else nome end,
    cargo = case when p_dados ? 'cargo' then public.academy__texto(p_dados->>'cargo', 0, 120, 'cargo_invalido') else cargo end,
    bio   = case when p_dados ? 'bio' then public.academy__texto(p_dados->>'bio', 0, 1200, 'bio_invalida') else bio end,
    linkedin = v_link,
    site = v_site,
    atualizado_em = now()
  where id = p_id;
end $$;

-- Lista de quem aparece no curso, na ordem.
create or replace function public.academy__instrutores_do_curso(p_curso text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(
           json_build_object('papel', ci.papel, 'ordem', ci.ordem, 'instrutor', public.academy__instrutor_json(ci.instrutor_id))
           order by ci.ordem), '[]'::json)
    from public.cursos_instrutores ci where ci.curso_slug = p_curso
$$;

create or replace function public.academy__compactar_instrutores(p_curso text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.cursos_instrutores ci
     set ordem = r.n
    from (select instrutor_id, row_number() over (order by ordem, instrutor_id)::integer as n
            from public.cursos_instrutores where curso_slug = p_curso) r
   where ci.curso_slug = p_curso and ci.instrutor_id = r.instrutor_id and ci.ordem <> r.n
$$;

-- 4. Curso no painel, com os campos novos ------------------------------------
-- Mesma assinatura da 0015; acrescenta objetivos, público, pré-requisitos,
-- resumo dos módulos e instrutores. Os privilégios da 0015 continuam.

create or replace function public.academy_adm_curso(p_slug text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_req json;
begin
  perform public.academy__exigir_curso(p_slug);

  select row_to_json(r) into v_req from public.cursos_requisitos r where r.curso_slug = p_slug;

  return (
    select json_build_object(
      'slug', c.slug, 'titulo', c.titulo, 'descricao', c.descricao, 'nivel', c.nivel,
      'gratuito', c.gratuito, 'publicado', c.publicado, 'ordem', c.ordem,
      'objetivos', to_json(c.objetivos), 'publico', c.publico, 'pre_requisitos', c.pre_requisitos,
      'eh_admin', public.academy__eh_admin(),
      'requisitos', v_req,
      'instrutores', public.academy__instrutores_do_curso(c.slug),
      'questoes_final', (select count(*) from public.questoes q where q.curso_slug = c.slug and q.modulo_id is null),
      'questoes_final_publicadas', (select count(*) from public.questoes q where q.curso_slug = c.slug and q.modulo_id is null and q.publicado),
      'modulos', coalesce((
        select json_agg(json_build_object(
                 'id', m.id, 'ordem', m.ordem, 'titulo', m.titulo, 'resumo', m.resumo,
                 'questoes', (select count(*) from public.questoes q where q.modulo_id = m.id),
                 'questoes_publicadas', (select count(*) from public.questoes q where q.modulo_id = m.id and q.publicado),
                 'aulas', coalesce((
                   select json_agg(public.academy__aula_json(a.id) order by a.ordem)
                     from public.aulas a where a.modulo_id = m.id
                 ), '[]'::json)
               ) order by m.ordem)
          from public.modulos m where m.curso_slug = c.slug
      ), '[]'::json)
    )
      from public.cursos c
     where c.slug = p_slug
  );
end $$;

-- 5. Sobre o curso e ementa ---------------------------------------------------

create or replace function public.academy_adm_salvar_sobre(p_curso text, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_obj text[];
begin
  perform public.academy__exigir_curso(p_curso);
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  if p_dados ? 'objetivos' then
    if jsonb_typeof(p_dados->'objetivos') <> 'array' then
      raise exception 'objetivos_invalidos';
    end if;
    select coalesce(array_agg(btrim(e) order by n), '{}') into v_obj
      from jsonb_array_elements_text(p_dados->'objetivos') with ordinality o(e, n)
     where btrim(e) <> '';
    if cardinality(v_obj) > 10 or exists (select 1 from unnest(v_obj) x where length(x) > 200) then
      raise exception 'objetivos_invalidos';
    end if;
  end if;

  update public.cursos set
    objetivos      = case when p_dados ? 'objetivos' then v_obj else objetivos end,
    publico        = case when p_dados ? 'publico' then public.academy__texto(p_dados->>'publico', 0, 600, 'publico_invalido') else publico end,
    pre_requisitos = case when p_dados ? 'pre_requisitos' then public.academy__texto(p_dados->>'pre_requisitos', 0, 600, 'pre_requisitos_invalidos') else pre_requisitos end,
    atualizado_em  = now()
  where slug = p_curso;

  perform public.academy__auditar('sobre_salvo', p_curso, p_dados);
  return public.academy_adm_curso(p_curso);
end $$;

-- Título e resumo (ementa) do módulo.
create or replace function public.academy_adm_editar_modulo(p_id uuid, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_curso text;
begin
  select curso_slug into v_curso from public.modulos where id = p_id;
  if v_curso is null then
    raise exception 'modulo_inexistente';
  end if;
  perform public.academy__exigir_curso(v_curso);
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  update public.modulos set
    titulo = case when p_dados ? 'titulo' then public.academy__texto(p_dados->>'titulo', 2, 120, 'titulo_invalido') else titulo end,
    resumo = case when p_dados ? 'resumo' then public.academy__texto(p_dados->>'resumo', 0, 400, 'resumo_invalido') else resumo end
  where id = p_id;

  perform public.academy__auditar('modulo_editado', p_id::text, p_dados);
  return public.academy_adm_curso(v_curso);
end $$;

-- 6. Perfil de quem é da equipe -------------------------------------------------

-- Perfil de quem chama. Sem perfil ainda: id null e o nome do cadastro de aluno.
create or replace function public.academy_adm_meu_perfil()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  if not exists (select 1 from public.academy_equipe where user_id = v_uid) then
    raise exception 'sem_permissao';
  end if;
  select id into v_id from public.instrutores where user_id = v_uid;
  if v_id is not null then
    return public.academy__instrutor_json(v_id);
  end if;
  return json_build_object(
    'id', null, 'nome', coalesce((select nome from public.alunos where user_id = v_uid), ''),
    'cargo', '', 'bio', '', 'linkedin', null, 'site', null, 'da_equipe', true, 'eu', true
  );
end $$;

create or replace function public.academy_adm_salvar_meu_perfil(p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  if not exists (select 1 from public.academy_equipe where user_id = v_uid) then
    raise exception 'sem_permissao';
  end if;
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  select id into v_id from public.instrutores where user_id = v_uid;
  if v_id is null then
    insert into public.instrutores (user_id, nome, criado_por)
    values (v_uid, public.academy__texto(p_dados->>'nome', 2, 80, 'nome_invalido'), v_uid)
    returning id into v_id;
  end if;
  perform public.academy__aplicar_perfil(v_id, p_dados);
  perform public.academy__auditar('perfil_salvo', v_id::text, p_dados);
  return public.academy__instrutor_json(v_id);
end $$;

-- 7. Instrutores do curso ---------------------------------------------------------

-- Quem está no curso e quem pode ser acrescentado (perfis existentes).
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
    )
  );
end $$;

-- Acrescenta ao curso (no fim) ou troca o papel de quem já está.
create or replace function public.academy_adm_vincular_instrutor(p_curso text, p_instrutor uuid, p_papel text)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_curso(p_curso);
  if p_papel not in ('instrutor', 'convidado') then
    raise exception 'papel_invalido';
  end if;
  if not exists (select 1 from public.instrutores where id = p_instrutor) then
    raise exception 'instrutor_inexistente';
  end if;
  insert into public.cursos_instrutores (curso_slug, instrutor_id, papel, ordem)
  values (p_curso, p_instrutor, p_papel,
          coalesce((select max(ordem) from public.cursos_instrutores where curso_slug = p_curso), 0) + 1)
  on conflict (curso_slug, instrutor_id) do update set papel = excluded.papel;
  perform public.academy__auditar('instrutor_vinculado', p_curso, jsonb_build_object('instrutor', p_instrutor, 'papel', p_papel));
  return public.academy_adm_instrutores(p_curso);
end $$;

create or replace function public.academy_adm_desvincular_instrutor(p_curso text, p_instrutor uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_curso(p_curso);
  delete from public.cursos_instrutores where curso_slug = p_curso and instrutor_id = p_instrutor;
  if not found then
    raise exception 'instrutor_inexistente';
  end if;
  perform public.academy__compactar_instrutores(p_curso);
  perform public.academy__auditar('instrutor_desvinculado', p_curso, jsonb_build_object('instrutor', p_instrutor));
  return public.academy_adm_instrutores(p_curso);
end $$;

create or replace function public.academy_adm_mover_instrutor(p_curso text, p_instrutor uuid, p_direcao integer)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ordem   integer;
  v_vizinho uuid;
  v_ordem_v integer;
begin
  perform public.academy__exigir_curso(p_curso);
  select ordem into v_ordem from public.cursos_instrutores where curso_slug = p_curso and instrutor_id = p_instrutor;
  if v_ordem is null then
    raise exception 'instrutor_inexistente';
  end if;
  if p_direcao not in (-1, 1) then
    raise exception 'limite';
  end if;
  select instrutor_id, ordem into v_vizinho, v_ordem_v from public.cursos_instrutores
   where curso_slug = p_curso
     and ((p_direcao = -1 and ordem < v_ordem) or (p_direcao = 1 and ordem > v_ordem))
   order by case when p_direcao = -1 then -ordem else ordem end
   limit 1;
  if v_vizinho is null then
    raise exception 'limite';
  end if;
  update public.cursos_instrutores set ordem = v_ordem_v where curso_slug = p_curso and instrutor_id = p_instrutor;
  update public.cursos_instrutores set ordem = v_ordem where curso_slug = p_curso and instrutor_id = v_vizinho;
  perform public.academy__auditar('instrutor_movido', p_curso, jsonb_build_object('instrutor', p_instrutor, 'direcao', p_direcao));
  return public.academy_adm_instrutores(p_curso);
end $$;

-- Convidado (sem conta): p_id vazio cria o perfil e já põe no curso como
-- convidado. Com id, edita. Perfil de alguém da equipe só a própria pessoa
-- (academy_adm_salvar_meu_perfil) ou o admin edita. Convidado: o admin ou
-- quem edita um curso em que ele aparece.
create or replace function public.academy_adm_salvar_instrutor(p_curso text, p_id uuid, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid;
  v_alvo public.instrutores%rowtype;
  v_id   uuid;
begin
  v_uid := public.academy__exigir_curso(p_curso);
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  if p_id is null then
    insert into public.instrutores (nome, criado_por)
    values (public.academy__texto(p_dados->>'nome', 2, 80, 'nome_invalido'), v_uid)
    returning id into v_id;
    perform public.academy__aplicar_perfil(v_id, p_dados);
    insert into public.cursos_instrutores (curso_slug, instrutor_id, papel, ordem)
    values (p_curso, v_id, 'convidado', coalesce((select max(ordem) from public.cursos_instrutores where curso_slug = p_curso), 0) + 1);
    perform public.academy__auditar('convidado_criado', v_id::text, jsonb_build_object('curso', p_curso, 'nome', p_dados->>'nome'));
    return public.academy_adm_instrutores(p_curso);
  end if;

  select * into v_alvo from public.instrutores where id = p_id;
  if v_alvo.id is null then
    raise exception 'instrutor_inexistente';
  end if;
  if not public.academy__eh_admin() then
    if v_alvo.user_id is not null and v_alvo.user_id <> v_uid then
      raise exception 'sem_permissao';
    end if;
    if v_alvo.user_id is null
       and not exists (select 1 from public.cursos_instrutores where curso_slug = p_curso and instrutor_id = p_id) then
      raise exception 'sem_permissao';
    end if;
  end if;
  perform public.academy__aplicar_perfil(p_id, p_dados);
  perform public.academy__auditar('instrutor_salvo', p_id::text, p_dados);
  return public.academy_adm_instrutores(p_curso);
end $$;

-- 8. Privilégios (padrão da 0012) ------------------------------------------

revoke all on function
  public.academy__instrutor_json(uuid),
  public.academy__aplicar_perfil(uuid, jsonb),
  public.academy__instrutores_do_curso(text),
  public.academy__compactar_instrutores(text),
  public.academy_adm_salvar_sobre(text, jsonb),
  public.academy_adm_editar_modulo(uuid, jsonb),
  public.academy_adm_meu_perfil(),
  public.academy_adm_salvar_meu_perfil(jsonb),
  public.academy_adm_instrutores(text),
  public.academy_adm_vincular_instrutor(text, uuid, text),
  public.academy_adm_desvincular_instrutor(text, uuid),
  public.academy_adm_mover_instrutor(text, uuid, integer),
  public.academy_adm_salvar_instrutor(text, uuid, jsonb)
from public, anon, authenticated;

grant execute on function
  public.academy_adm_salvar_sobre(text, jsonb),
  public.academy_adm_editar_modulo(uuid, jsonb),
  public.academy_adm_meu_perfil(),
  public.academy_adm_salvar_meu_perfil(jsonb),
  public.academy_adm_instrutores(text),
  public.academy_adm_vincular_instrutor(text, uuid, text),
  public.academy_adm_desvincular_instrutor(text, uuid),
  public.academy_adm_mover_instrutor(text, uuid, integer),
  public.academy_adm_salvar_instrutor(text, uuid, jsonb)
to authenticated;

grant execute on function
  public.academy__instrutor_json(uuid),
  public.academy__aplicar_perfil(uuid, jsonb),
  public.academy__instrutores_do_curso(text),
  public.academy__compactar_instrutores(text),
  public.academy_adm_salvar_sobre(text, jsonb),
  public.academy_adm_editar_modulo(uuid, jsonb),
  public.academy_adm_meu_perfil(),
  public.academy_adm_salvar_meu_perfil(jsonb),
  public.academy_adm_instrutores(text),
  public.academy_adm_vincular_instrutor(text, uuid, text),
  public.academy_adm_desvincular_instrutor(text, uuid),
  public.academy_adm_mover_instrutor(text, uuid, integer),
  public.academy_adm_salvar_instrutor(text, uuid, jsonb)
to service_role;
