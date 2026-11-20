-- ============================================================================
-- 0024_academy_empresas.sql - Academy para empresas e aviso de vencimento
-- (fase 17)
--
-- Decisões do Everton (19/11/2026):
--   * Empresas não compram pela Hotmart: o contrato é negociado com a CyDef
--     ("fale com a gente") e a cobrança fica fora da Academy.
--   * Dois tipos: venda casada com consultoria (acesso durante o contrato de
--     consultoria) e plano para empresas e times pequenos.
--   * A pessoa gestora vê o progresso individual de cada membro, e o membro é
--     avisado disso antes de aceitar o convite.
--   * Plano de 12 meses sem renovação automática, com e-mail antes de vencer.
--
-- Modelo:
--   * academy_empresas: a empresa e o contrato em vigor (tipo, o que libera,
--     início e fim em datas de Brasília, vagas). Prorrogar é editar o fim.
--   * academy_empresa_membros: convites e membros. Toda pessoa do contrato
--     ocupa uma vaga, inclusive quem é gestora; convite pendente também ocupa.
--     O aceite registra a versão e o hash do aviso de privacidade vigente.
--   * Cada membro que aceita ganha uma concessão (0021) com origem "empresa",
--     o escopo e a validade do contrato. Editar o contrato atualiza as
--     concessões; encerrar, remover ou sair revoga a concessão. Conta,
--     progresso e certificados ficam com a pessoa.
--   * A gestora vê só os cursos do contrato: aulas concluídas, avaliação
--     final aprovada (sem a nota), certificado e último acesso. Deixa de ver
--     quando o contrato termina ou quando a pessoa sai.
--   * academy_avisos_enviados: um e-mail de vencimento por marco (30 e 7
--     dias), enviado pela Edge Function academy-avisos (service_role).
--
-- Escrita só por funções, com auditoria. Idempotente.
-- ============================================================================

-- 1. Empresas e membros -------------------------------------------------------------

create table if not exists public.academy_empresas (
  id                   uuid primary key default gen_random_uuid(),
  nome                 text not null check (length(btrim(nome)) between 2 and 120),
  tipo                 text not null check (tipo in ('consultoria', 'plano')),
  escopo               text not null check (escopo in ('curso', 'trilha', 'plataforma')),
  curso_slug           text references public.cursos(slug) on delete restrict,
  trilha_slug          text references public.trilhas(slug) on delete restrict,
  cursos               text[] not null default '{}',
  inicio               date not null,
  fim                  date not null,
  vagas                integer not null check (vagas between 1 and 5000),
  observacao           text not null default '' check (length(observacao) <= 300),
  encerrada_em         timestamptz,
  motivo_encerramento  text check (motivo_encerramento is null or length(motivo_encerramento) <= 200),
  criado_por           uuid,
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now(),
  constraint academy_empresas_alvo check (
    (escopo = 'curso' and curso_slug is not null)
    or (escopo = 'trilha' and trilha_slug is not null and cardinality(cursos) > 0)
    or escopo = 'plataforma'
  ),
  constraint academy_empresas_periodo check (fim >= inicio)
);
comment on table public.academy_empresas is 'Empresa e contrato em vigor (consultoria ou plano para times). Cobrança fora da Academy.';
comment on column public.academy_empresas.cursos is 'Trilha: os cursos dela quando o contrato foi salvo pela última vez.';
comment on column public.academy_empresas.fim is 'Último dia de acesso (data de Brasília).';

create table if not exists public.academy_empresa_membros (
  id                  uuid primary key default gen_random_uuid(),
  empresa_id          uuid not null references public.academy_empresas(id) on delete cascade,
  email               text not null check (email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' and length(email) <= 254),
  user_id             uuid references auth.users(id) on delete set null,
  gestor              boolean not null default false,
  situacao            text not null default 'convidado'
                      check (situacao in ('convidado', 'ativo', 'recusado', 'cancelado', 'removido', 'saiu')),
  convidado_por       uuid,
  convidado_em        timestamptz not null default now(),
  convite_enviado_em  timestamptz,
  reenvios            integer not null default 0 check (reenvios between 0 and 20),
  aceito_em           timestamptz,
  aviso_versao        text,
  aviso_hash          text,
  encerrado_em        timestamptz,
  concessao_id        uuid references public.academy_concessoes(id) on delete set null,
  constraint academy_empresa_membros_aceite check (situacao <> 'ativo' or (aceito_em is not null and aviso_versao is not null))
);
create unique index if not exists academy_empresa_membros_vaga_idx
  on public.academy_empresa_membros (empresa_id, email) where situacao in ('convidado', 'ativo');
create index if not exists academy_empresa_membros_email_idx on public.academy_empresa_membros (email);
create index if not exists academy_empresa_membros_user_idx on public.academy_empresa_membros (user_id);
comment on table public.academy_empresa_membros is 'Convites e membros de uma empresa. convidado e ativo ocupam vaga.';

alter table public.academy_concessoes
  add column if not exists empresa_id uuid references public.academy_empresas(id) on delete restrict;
create index if not exists academy_concessoes_empresa_idx on public.academy_concessoes (empresa_id);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'academy_concessoes_empresa') then
    alter table public.academy_concessoes add constraint academy_concessoes_empresa
      check (origem <> 'empresa' or empresa_id is not null);
  end if;
end $$;

create table if not exists public.academy_avisos_enviados (
  chave       text not null check (length(chave) between 5 and 120),
  email       text not null check (length(email) <= 254),
  enviado_em  timestamptz not null default now(),
  primary key (chave, email)
);
comment on table public.academy_avisos_enviados is 'E-mails de vencimento já enviados (um por marco), para não repetir.';

alter table public.academy_empresas         enable row level security;
alter table public.academy_empresa_membros  enable row level security;
alter table public.academy_avisos_enviados  enable row level security;
revoke all on table public.academy_empresas, public.academy_empresa_membros, public.academy_avisos_enviados
  from anon, authenticated, service_role;

-- 2. Funções internas -----------------------------------------------------------------

create or replace function public.academy__hoje()
returns date
language sql
stable
as $$
  select (now() at time zone 'America/Sao_Paulo')::date
$$;

create or replace function public.academy__empresa_inicio(e public.academy_empresas)
returns timestamptz
language sql
immutable
as $$
  select e.inicio::timestamp at time zone 'America/Sao_Paulo'
$$;

create or replace function public.academy__empresa_fim(e public.academy_empresas)
returns timestamptz
language sql
immutable
as $$
  select (e.fim + 1)::timestamp at time zone 'America/Sao_Paulo'
$$;

-- Aceita convites e mantém acessos: não encerrada e ainda dentro do prazo.
create or replace function public.academy__empresa_vigente(e public.academy_empresas)
returns boolean
language sql
stable
as $$
  select e.encerrada_em is null and e.fim >= public.academy__hoje()
$$;

create or replace function public.academy__empresa_situacao(e public.academy_empresas)
returns text
language sql
stable
as $$
  select case when e.encerrada_em is not null then 'encerrada'
              when e.fim < public.academy__hoje() then 'vencida'
              when e.inicio > public.academy__hoje() then 'futura'
              else 'vigente' end
$$;

create or replace function public.academy__empresa_alvo(e public.academy_empresas)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case e.escopo
           when 'curso' then coalesce((select k.titulo from public.cursos k where k.slug = e.curso_slug), 'Curso')
           when 'trilha' then 'Trilha ' || coalesce((select t.titulo from public.trilhas t where t.slug = e.trilha_slug), '')
           else 'Plataforma toda' end
$$;

create or replace function public.academy__empresa_vagas_usadas(p_empresa uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.academy_empresa_membros m
   where m.empresa_id = p_empresa and m.situacao in ('convidado', 'ativo')
$$;

-- Cursos que o contrato cobre agora (para a visão da gestora).
create or replace function public.academy__empresa_cursos(e public.academy_empresas)
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select e.curso_slug where e.escopo = 'curso'
  union
  select unnest(e.cursos) where e.escopo = 'trilha'
  union
  select k.slug from public.cursos k where e.escopo = 'plataforma' and not k.gratuito
$$;

-- Gestora ativa da empresa (ou admin). Devolve o uid.
create or replace function public.academy__exigir_gestor(p_empresa uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_e   public.academy_empresas%rowtype;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  select * into v_e from public.academy_empresas where id = p_empresa;
  if v_e.id is null then
    raise exception 'empresa_inexistente';
  end if;
  if public.academy__eh_admin() then
    return v_uid;
  end if;
  if not exists (
    select 1 from public.academy_empresa_membros m
     where m.empresa_id = p_empresa and m.user_id = v_uid and m.situacao = 'ativo' and m.gestor
  ) then
    raise exception 'sem_permissao';
  end if;
  if not public.academy__empresa_vigente(v_e) then
    raise exception 'contrato_encerrado';
  end if;
  return v_uid;
end $$;

-- Cria a concessão do membro que aceitou (ou a atualiza para o contrato atual).
create or replace function public.academy__membro_conceder(p_membro uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_m  public.academy_empresa_membros%rowtype;
  v_e  public.academy_empresas%rowtype;
  v_c  uuid;
begin
  select * into v_m from public.academy_empresa_membros where id = p_membro;
  select * into v_e from public.academy_empresas where id = v_m.empresa_id;
  if v_m.situacao <> 'ativo' then
    return;
  end if;
  if v_m.concessao_id is not null and exists (
    select 1 from public.academy_concessoes c where c.id = v_m.concessao_id and c.revogada_em is null
  ) then
    update public.academy_concessoes
       set escopo = v_e.escopo,
           curso_slug = case when v_e.escopo = 'curso' then v_e.curso_slug end,
           trilha_slug = case when v_e.escopo = 'trilha' then v_e.trilha_slug end,
           cursos = case when v_e.escopo = 'trilha' then v_e.cursos else '{}' end,
           inicio = public.academy__empresa_inicio(v_e),
           fim = public.academy__empresa_fim(v_e),
           email = v_m.email,
           user_id = coalesce(v_m.user_id, user_id)
     where id = v_m.concessao_id;
  else
    insert into public.academy_concessoes
      (email, user_id, nome, origem, escopo, curso_slug, trilha_slug, cursos, inicio, fim, empresa_id, criado_por)
    values
      (v_m.email, v_m.user_id, left(v_e.nome, 80), 'empresa', v_e.escopo,
       case when v_e.escopo = 'curso' then v_e.curso_slug end,
       case when v_e.escopo = 'trilha' then v_e.trilha_slug end,
       case when v_e.escopo = 'trilha' then v_e.cursos else '{}' end,
       public.academy__empresa_inicio(v_e), public.academy__empresa_fim(v_e), v_e.id, auth.uid())
    returning id into v_c;
    update public.academy_empresa_membros set concessao_id = v_c where id = v_m.id;
  end if;
  perform public.academy__sincronizar(v_m.user_id);
end $$;

-- Encerra a participação: remove, saída ou fim de contrato.
create or replace function public.academy__membro_encerrar(p_membro uuid, p_situacao text, p_motivo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_m public.academy_empresa_membros%rowtype;
begin
  update public.academy_empresa_membros
     set situacao = p_situacao, encerrado_em = now()
   where id = p_membro
  returning * into v_m;
  if v_m.concessao_id is not null then
    update public.academy_concessoes
       set revogada_em = now(), motivo_revogacao = left(p_motivo, 200)
     where id = v_m.concessao_id and revogada_em is null;
  end if;
  perform public.academy__sincronizar(v_m.user_id);
end $$;

-- Não deixa a empresa sem gestora entre as pessoas que ocupam vaga.
create or replace function public.academy__garantir_gestora(p_empresa uuid, p_sem uuid)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.academy_empresa_membros m
     where m.empresa_id = p_empresa and m.gestor and m.situacao in ('convidado', 'ativo') and m.id <> p_sem
  ) then
    raise exception 'ultima_gestora';
  end if;
end $$;

create or replace function public.academy__email_valido(p_email text)
returns boolean
language sql
immutable
as $$
  select p_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' and length(p_email) <= 254
$$;

-- 3. JSON das telas -----------------------------------------------------------------

create or replace function public.academy__empresa_json(e public.academy_empresas)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', e.id, 'nome', e.nome, 'tipo', e.tipo, 'escopo', e.escopo,
    'curso', e.curso_slug, 'trilha', e.trilha_slug, 'alvo', public.academy__empresa_alvo(e),
    'inicio', e.inicio, 'fim', e.fim, 'vagas', e.vagas,
    'usadas', public.academy__empresa_vagas_usadas(e.id),
    'ativos', (select count(*) from public.academy_empresa_membros m where m.empresa_id = e.id and m.situacao = 'ativo'),
    'convites', (select count(*) from public.academy_empresa_membros m where m.empresa_id = e.id and m.situacao = 'convidado'),
    'gestoras', coalesce((select json_agg(m.email order by m.email) from public.academy_empresa_membros m
                           where m.empresa_id = e.id and m.gestor and m.situacao in ('convidado', 'ativo')), '[]'::json),
    'observacao', e.observacao, 'situacao', public.academy__empresa_situacao(e),
    'encerrada_em', e.encerrada_em, 'motivo', e.motivo_encerramento, 'criado_em', e.criado_em
  )
$$;

-- Progresso de um membro nos cursos do contrato (sem notas).
create or replace function public.academy__membro_progresso(p_user uuid, p_empresa uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with e as (select * from public.academy_empresas where id = p_empresa),
  cs as (
    select k.slug, k.titulo, k.ordem from public.cursos k
     where k.publicado and k.slug in (select public.academy__empresa_cursos(e.*) from e)
  ),
  pr as (
    select cs.slug, cs.titulo, cs.ordem,
           (select count(*) from public.aulas a join public.modulos mo on mo.id = a.modulo_id
             where mo.curso_slug = cs.slug and a.publicado) as total,
           (select count(*) from public.progresso_aulas p join public.aulas a on a.id = p.aula_id
              join public.modulos mo on mo.id = a.modulo_id
             where p.user_id = p_user and mo.curso_slug = cs.slug and a.publicado and p.concluida_em is not null) as concluidas,
           exists (select 1 from public.provas_finais f where f.user_id = p_user and f.curso_slug = cs.slug and f.aprovado) as aprovado,
           (select c.emitido_em from public.certificados c where c.user_id = p_user and c.curso_slug = cs.slug) as certificado_em
      from cs
  )
  select coalesce(json_agg(json_build_object(
           'slug', pr.slug, 'titulo', pr.titulo, 'total', pr.total, 'concluidas', pr.concluidas,
           'aprovado', pr.aprovado, 'certificado_em', pr.certificado_em) order by pr.ordem), '[]'::json)
    from pr
   where p_user is not null and (pr.concluidas > 0 or pr.aprovado or pr.certificado_em is not null)
$$;

create or replace function public.academy__membro_json(m public.academy_empresa_membros, p_progresso boolean)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', m.id, 'email', m.email, 'gestor', m.gestor, 'situacao', m.situacao,
    'nome', (select a.nome from public.alunos a where a.user_id = m.user_id),
    'convidado_em', m.convidado_em, 'convite_enviado_em', m.convite_enviado_em, 'aceito_em', m.aceito_em,
    'ultimo_acesso', case when p_progresso and m.situacao = 'ativo'
                          then (select a.ultimo_acesso_em from public.alunos a where a.user_id = m.user_id) end,
    'cursos', case when p_progresso and m.situacao = 'ativo'
                   then public.academy__membro_progresso(m.user_id, m.empresa_id) else '[]'::json end
  )
$$;

-- 4. Painel do admin ------------------------------------------------------------------

create or replace function public.academy_adm_empresas()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_admin();
  return coalesce((
    select json_agg(public.academy__empresa_json(e) order by (e.encerrada_em is null) desc, e.fim desc, e.nome)
      from public.academy_empresas e
  ), '[]'::json);
end $$;

-- p_dados { id?, nome, tipo, escopo, curso, trilha, inicio, fim, vagas, observacao, gestor_email (só ao criar) }
create or replace function public.academy_adm_salvar_empresa(p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid;
  v_id      uuid;
  v_antes   public.academy_empresas%rowtype;
  v_e       public.academy_empresas%rowtype;
  v_nome    text := btrim(coalesce(p_dados->>'nome', ''));
  v_tipo    text := coalesce(p_dados->>'tipo', '');
  v_escopo  text := coalesce(p_dados->>'escopo', '');
  v_curso   text := nullif(p_dados->>'curso', '');
  v_trilha  text := nullif(p_dados->>'trilha', '');
  v_obs     text := btrim(coalesce(p_dados->>'observacao', ''));
  v_gestor  text := lower(btrim(coalesce(p_dados->>'gestor_email', '')));
  v_inicio  date;
  v_fim     date;
  v_vagas   integer;
  v_cursos  text[] := '{}';
  v_m       uuid;
begin
  v_uid := public.academy__exigir_admin();
  if length(v_nome) < 2 or length(v_nome) > 120 then
    raise exception 'nome_invalido';
  end if;
  if v_tipo not in ('consultoria', 'plano') then
    raise exception 'tipo_invalido';
  end if;
  if v_escopo not in ('curso', 'trilha', 'plataforma') then
    raise exception 'escopo_invalido';
  end if;
  if v_escopo = 'curso' and not exists (select 1 from public.cursos k where k.slug = v_curso and not k.gratuito) then
    raise exception 'curso_inexistente';
  end if;
  if v_escopo = 'trilha' then
    if not exists (select 1 from public.trilhas t where t.slug = v_trilha) then
      raise exception 'trilha_inexistente';
    end if;
    select coalesce(array_agg(tc.curso_slug order by tc.ordem), '{}') into v_cursos
      from public.trilha_cursos tc join public.cursos k on k.slug = tc.curso_slug
     where tc.trilha_slug = v_trilha and not k.gratuito;
    if cardinality(v_cursos) = 0 then
      raise exception 'trilha_vazia';
    end if;
  end if;
  if length(v_obs) > 300 then
    raise exception 'observacao_invalida';
  end if;
  v_inicio := (p_dados->>'inicio')::date;
  v_fim := (p_dados->>'fim')::date;
  if v_inicio is null or v_fim is null or v_fim < v_inicio or v_fim > v_inicio + 3660 then
    raise exception 'periodo_invalido';
  end if;
  v_vagas := (p_dados->>'vagas')::integer;
  if v_vagas is null or v_vagas not between 1 and 5000 then
    raise exception 'vagas_invalidas';
  end if;

  v_id := nullif(p_dados->>'id', '')::uuid;
  if v_id is null then
    if not public.academy__email_valido(v_gestor) then
      raise exception 'email_invalido';
    end if;
    if v_fim < public.academy__hoje() then
      raise exception 'periodo_invalido';
    end if;
    insert into public.academy_empresas
      (nome, tipo, escopo, curso_slug, trilha_slug, cursos, inicio, fim, vagas, observacao, criado_por)
    values
      (v_nome, v_tipo, v_escopo, case when v_escopo = 'curso' then v_curso end,
       case when v_escopo = 'trilha' then v_trilha end, v_cursos, v_inicio, v_fim, v_vagas, v_obs, v_uid)
    returning * into v_e;
    insert into public.academy_empresa_membros (empresa_id, email, gestor, convidado_por)
    values (v_e.id, v_gestor, true, v_uid);
    perform public.academy__auditar('empresa_criada', v_e.id::text,
      jsonb_build_object('nome', v_nome, 'tipo', v_tipo, 'escopo', v_escopo, 'inicio', v_inicio, 'fim', v_fim, 'vagas', v_vagas));
  else
    select * into v_antes from public.academy_empresas where id = v_id for update;
    if v_antes.id is null then
      raise exception 'empresa_inexistente';
    end if;
    if v_antes.encerrada_em is not null then
      raise exception 'contrato_encerrado';
    end if;
    if v_vagas < public.academy__empresa_vagas_usadas(v_id) then
      raise exception 'vagas_insuficientes';
    end if;
    update public.academy_empresas
       set nome = v_nome, tipo = v_tipo, escopo = v_escopo,
           curso_slug = case when v_escopo = 'curso' then v_curso end,
           trilha_slug = case when v_escopo = 'trilha' then v_trilha end,
           cursos = v_cursos, inicio = v_inicio, fim = v_fim, vagas = v_vagas, observacao = v_obs,
           atualizado_em = now()
     where id = v_id
    returning * into v_e;
    for v_m in select m.id from public.academy_empresa_membros m where m.empresa_id = v_id and m.situacao = 'ativo' loop
      perform public.academy__membro_conceder(v_m);
    end loop;
    perform public.academy__auditar('empresa_alterada', v_id::text,
      jsonb_build_object('escopo', v_escopo, 'inicio', v_inicio, 'fim', v_fim, 'vagas', v_vagas,
                         'fim_anterior', v_antes.fim, 'vagas_anteriores', v_antes.vagas));
  end if;
  return public.academy__empresa_json(v_e);
exception
  when invalid_text_representation or numeric_value_out_of_range or invalid_datetime_format or datetime_field_overflow then
    raise exception 'invalid_payload';
end $$;

create or replace function public.academy_adm_encerrar_empresa(p_id uuid, p_motivo text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_motivo text := btrim(coalesce(p_motivo, ''));
  v_e      public.academy_empresas%rowtype;
  v_m      public.academy_empresa_membros%rowtype;
begin
  perform public.academy__exigir_admin();
  if length(v_motivo) < 5 or length(v_motivo) > 200 then
    raise exception 'motivo_obrigatorio';
  end if;
  update public.academy_empresas set encerrada_em = now(), motivo_encerramento = v_motivo, atualizado_em = now()
   where id = p_id and encerrada_em is null
  returning * into v_e;
  if v_e.id is null then
    raise exception 'empresa_inexistente';
  end if;
  update public.academy_empresa_membros set situacao = 'cancelado', encerrado_em = now()
   where empresa_id = p_id and situacao = 'convidado';
  for v_m in select * from public.academy_empresa_membros where empresa_id = p_id and situacao = 'ativo' loop
    if v_m.concessao_id is not null then
      update public.academy_concessoes set revogada_em = now(), motivo_revogacao = left('Contrato encerrado: ' || v_motivo, 200)
       where id = v_m.concessao_id and revogada_em is null;
    end if;
    perform public.academy__sincronizar(v_m.user_id);
  end loop;
  perform public.academy__auditar('empresa_encerrada', p_id::text, jsonb_build_object('motivo', v_motivo));
  return public.academy__empresa_json(v_e);
end $$;

-- 5. Gestora (ou admin) -----------------------------------------------------------------

create or replace function public.academy_empresa_painel(p_empresa uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_e public.academy_empresas%rowtype;
begin
  perform public.academy__exigir_gestor(p_empresa);
  select * into v_e from public.academy_empresas where id = p_empresa;
  return json_build_object(
    'empresa', public.academy__empresa_json(v_e),
    'membros', coalesce((
      select json_agg(public.academy__membro_json(m, true) order by (m.situacao = 'ativo') desc, m.gestor desc, m.email)
        from public.academy_empresa_membros m
       where m.empresa_id = p_empresa and m.situacao in ('convidado', 'ativo')
    ), '[]'::json)
  );
end $$;

-- Convida até 50 e-mails por vez. Quem já ocupa vaga é ignorado.
create or replace function public.academy_empresa_convidar(p_empresa uuid, p_emails text[], p_gestor boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid;
  v_e         public.academy_empresas%rowtype;
  v_emails    text[];
  v_novos     text[];
  v_ja        text[];
  v_invalidos text[];
begin
  v_uid := public.academy__exigir_gestor(p_empresa);
  select * into v_e from public.academy_empresas where id = p_empresa for update;
  if not public.academy__empresa_vigente(v_e) then
    raise exception 'contrato_encerrado';
  end if;
  if p_emails is null or cardinality(p_emails) = 0 then
    raise exception 'email_invalido';
  end if;
  if cardinality(p_emails) > 50 then
    raise exception 'convites_demais';
  end if;
  select coalesce(array_agg(distinct x), '{}') into v_emails
    from (select lower(btrim(e)) as x from unnest(p_emails) e) t where x <> '';
  select coalesce(array_agg(x order by x), '{}') into v_invalidos
    from unnest(v_emails) x where not public.academy__email_valido(x);
  if cardinality(v_invalidos) > 0 then
    raise exception 'email_invalido';
  end if;
  select coalesce(array_agg(x order by x), '{}') into v_ja
    from unnest(v_emails) x
   where exists (select 1 from public.academy_empresa_membros m
                  where m.empresa_id = p_empresa and m.email = x and m.situacao in ('convidado', 'ativo'));
  select coalesce(array_agg(x order by x), '{}') into v_novos from unnest(v_emails) x where not (x = any(v_ja));
  if public.academy__empresa_vagas_usadas(p_empresa) + cardinality(v_novos) > v_e.vagas then
    raise exception 'sem_vagas';
  end if;
  insert into public.academy_empresa_membros (empresa_id, email, gestor, convidado_por, user_id)
  select p_empresa, x, coalesce(p_gestor, false), v_uid, (select u.id from auth.users u where lower(u.email) = x limit 1)
    from unnest(v_novos) x;
  perform public.academy__auditar('empresa_convites', p_empresa::text,
    jsonb_build_object('quantidade', cardinality(v_novos), 'gestor', coalesce(p_gestor, false)));
  return json_build_object('convidados', cardinality(v_novos), 'ja_na_empresa', to_json(v_ja));
end $$;

create or replace function public.academy__membro_da_empresa(p_membro uuid)
returns public.academy_empresa_membros
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_m public.academy_empresa_membros%rowtype;
begin
  select * into v_m from public.academy_empresa_membros where id = p_membro;
  if v_m.id is null then
    raise exception 'membro_inexistente';
  end if;
  perform public.academy__exigir_gestor(v_m.empresa_id);
  return v_m;
end $$;

create or replace function public.academy_empresa_cancelar_convite(p_membro uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_m public.academy_empresa_membros%rowtype;
begin
  v_m := public.academy__membro_da_empresa(p_membro);
  if v_m.situacao <> 'convidado' then
    raise exception 'convite_inexistente';
  end if;
  if v_m.gestor then
    perform public.academy__garantir_gestora(v_m.empresa_id, v_m.id);
  end if;
  update public.academy_empresa_membros set situacao = 'cancelado', encerrado_em = now() where id = p_membro;
  perform public.academy__auditar('empresa_convite_cancelado', v_m.empresa_id::text, jsonb_build_object('membro', p_membro));
  return public.academy_empresa_painel(v_m.empresa_id);
end $$;

create or replace function public.academy_empresa_remover(p_membro uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_m public.academy_empresa_membros%rowtype;
begin
  v_m := public.academy__membro_da_empresa(p_membro);
  if v_m.situacao <> 'ativo' then
    raise exception 'membro_inexistente';
  end if;
  if v_m.gestor then
    perform public.academy__garantir_gestora(v_m.empresa_id, v_m.id);
  end if;
  perform public.academy__membro_encerrar(p_membro, 'removido', 'Removido pela empresa');
  perform public.academy__auditar('empresa_membro_removido', v_m.empresa_id::text, jsonb_build_object('membro', p_membro));
  return public.academy_empresa_painel(v_m.empresa_id);
end $$;

create or replace function public.academy_empresa_definir_gestor(p_membro uuid, p_gestor boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_m public.academy_empresa_membros%rowtype;
begin
  v_m := public.academy__membro_da_empresa(p_membro);
  if v_m.situacao not in ('convidado', 'ativo') then
    raise exception 'membro_inexistente';
  end if;
  if v_m.gestor and not coalesce(p_gestor, false) then
    perform public.academy__garantir_gestora(v_m.empresa_id, v_m.id);
  end if;
  update public.academy_empresa_membros set gestor = coalesce(p_gestor, false) where id = p_membro;
  perform public.academy__auditar('empresa_gestora', v_m.empresa_id::text, jsonb_build_object('membro', p_membro, 'gestor', coalesce(p_gestor, false)));
  return public.academy_empresa_painel(v_m.empresa_id);
end $$;

-- Marca o convite para sair de novo pela academy-empresa (no máximo a cada 10 minutos, 5 vezes).
create or replace function public.academy_empresa_reenviar_convite(p_membro uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_m public.academy_empresa_membros%rowtype;
begin
  v_m := public.academy__membro_da_empresa(p_membro);
  if v_m.situacao <> 'convidado' then
    raise exception 'convite_inexistente';
  end if;
  if v_m.reenvios >= 5 then
    raise exception 'reenvios_esgotados';
  end if;
  if v_m.convite_enviado_em is not null and v_m.convite_enviado_em > now() - interval '10 minutes' then
    raise exception 'aguarde_reenvio';
  end if;
  update public.academy_empresa_membros
     set convite_enviado_em = null, reenvios = reenvios + case when v_m.convite_enviado_em is null then 0 else 1 end
   where id = p_membro;
  return public.academy_empresa_painel(v_m.empresa_id);
end $$;

-- Usadas pela Edge Function academy-empresa com o token de quem convidou.
create or replace function public.academy_empresa_convites_pendentes(p_empresa uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_e   public.academy_empresas%rowtype;
begin
  v_uid := public.academy__exigir_gestor(p_empresa);
  select * into v_e from public.academy_empresas where id = p_empresa;
  return json_build_object(
    'empresa', v_e.nome, 'alvo', public.academy__empresa_alvo(v_e), 'fim', v_e.fim,
    'quem_convida', coalesce((select a.nome from public.alunos a where a.user_id = v_uid), 'A equipe da CyDef'),
    'convites', coalesce((
      select json_agg(json_build_object('id', m.id, 'email', m.email, 'gestor', m.gestor) order by m.convidado_em)
        from (select * from public.academy_empresa_membros m
               where m.empresa_id = p_empresa and m.situacao = 'convidado' and m.convite_enviado_em is null
               order by m.convidado_em limit 60) m
    ), '[]'::json)
  );
end $$;

create or replace function public.academy_empresa_convites_enviados(p_empresa uuid, p_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  perform public.academy__exigir_gestor(p_empresa);
  update public.academy_empresa_membros set convite_enviado_em = now()
   where empresa_id = p_empresa and id = any(coalesce(p_ids, '{}')) and situacao = 'convidado';
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- 6. Pessoa convidada ou membro ---------------------------------------------------------

create or replace function public.academy_minhas_empresas()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  select lower(u.email) into v_email from auth.users u where u.id = v_uid;
  return json_build_object(
    'convites', coalesce((
      select json_agg(json_build_object(
               'id', m.id, 'empresa', e.nome, 'gestor', m.gestor, 'alvo', public.academy__empresa_alvo(e),
               'inicio', e.inicio, 'fim', e.fim, 'convidado_em', m.convidado_em) order by m.convidado_em)
        from public.academy_empresa_membros m join public.academy_empresas e on e.id = m.empresa_id
       where m.email = v_email and m.situacao = 'convidado' and public.academy__empresa_vigente(e)
    ), '[]'::json),
    'empresas', coalesce((
      select json_agg(json_build_object(
               'id', e.id, 'membro', m.id, 'empresa', e.nome, 'gestor', m.gestor, 'alvo', public.academy__empresa_alvo(e),
               'inicio', e.inicio, 'fim', e.fim, 'situacao', public.academy__empresa_situacao(e),
               'aceito_em', m.aceito_em, 'aviso_versao', m.aviso_versao) order by e.nome)
        from public.academy_empresa_membros m join public.academy_empresas e on e.id = m.empresa_id
       where (m.user_id = v_uid or m.email = v_email) and m.situacao = 'ativo'
    ), '[]'::json)
  );
end $$;

create or replace function public.academy_aceitar_convite(p_membro uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_email  text;
  v_m      public.academy_empresa_membros%rowtype;
  v_e      public.academy_empresas%rowtype;
  v_aviso  public.aviso_privacidade%rowtype;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  if not exists (select 1 from public.alunos a where a.user_id = v_uid) then
    raise exception 'sem_cadastro';
  end if;
  select lower(u.email) into v_email from auth.users u where u.id = v_uid;
  select * into v_m from public.academy_empresa_membros where id = p_membro for update;
  if v_m.id is null or v_m.email <> v_email or v_m.situacao <> 'convidado' then
    raise exception 'convite_inexistente';
  end if;
  select * into v_e from public.academy_empresas where id = v_m.empresa_id;
  if not public.academy__empresa_vigente(v_e) then
    raise exception 'contrato_encerrado';
  end if;
  select * into v_aviso from public.aviso_privacidade where vigente limit 1;
  if v_aviso.versao is null then
    raise exception 'no_aviso_vigente';
  end if;
  update public.academy_empresa_membros
     set situacao = 'ativo', user_id = v_uid, aceito_em = now(),
         aviso_versao = v_aviso.versao, aviso_hash = v_aviso.hash_sha256
   where id = p_membro;
  perform public.academy__membro_conceder(p_membro);
  perform public.academy__auditar('empresa_convite_aceito', v_e.id::text, jsonb_build_object('membro', p_membro, 'aviso', v_aviso.versao));
  return public.academy_minhas_empresas();
end $$;

create or replace function public.academy_recusar_convite(p_membro uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_n     integer;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  select lower(u.email) into v_email from auth.users u where u.id = v_uid;
  update public.academy_empresa_membros set situacao = 'recusado', encerrado_em = now()
   where id = p_membro and email = v_email and situacao = 'convidado';
  get diagnostics v_n = row_count;
  if v_n = 0 then
    raise exception 'convite_inexistente';
  end if;
  return public.academy_minhas_empresas();
end $$;

create or replace function public.academy_sair_empresa(p_membro uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_m     public.academy_empresa_membros%rowtype;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  select lower(u.email) into v_email from auth.users u where u.id = v_uid;
  select * into v_m from public.academy_empresa_membros where id = p_membro;
  if v_m.id is null or v_m.situacao <> 'ativo' or (v_m.user_id is distinct from v_uid and v_m.email <> v_email) then
    raise exception 'membro_inexistente';
  end if;
  perform public.academy__membro_encerrar(p_membro, 'saiu', 'Saiu da empresa');
  perform public.academy__auditar('empresa_saida', v_m.empresa_id::text, jsonb_build_object('membro', p_membro));
  return public.academy_minhas_empresas();
end $$;

-- 7. Login de quem foi convidado sem pré-inscrição -----------------------------------------

create or replace function public.academy__convite_por_email(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.academy_empresa_membros m join public.academy_empresas e on e.id = m.empresa_id
     where m.email = lower(btrim(p_email)) and m.situacao in ('convidado', 'ativo') and public.academy__empresa_vigente(e)
  )
$$;

-- Mesma assinatura da 0008. Novo: convite de empresa também dá direito ao link.
create or replace function public.academy_elegibilidade(p_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email    text;
  v_user_id  uuid;
  v_aluno    boolean := false;
  v_lead     public.leads%rowtype;
  v_nome     text;
begin
  if p_email is null or length(p_email) = 0 or length(p_email) > 254 then
    raise exception 'invalid_payload';
  end if;
  v_email := lower(btrim(p_email));

  select u.id into v_user_id from auth.users u where lower(u.email) = v_email limit 1;
  if v_user_id is not null then
    select exists (select 1 from public.alunos a where a.user_id = v_user_id) into v_aluno;
  end if;

  select l.* into v_lead
    from public.leads l
   where lower(l.email) = v_email
     and l.status in ('pending_confirmation','confirmed')
     and exists (select 1 from public.consentimentos c where c.lead_id = l.id and c.aceito)
   limit 1;

  if v_aluno then
    return json_build_object('elegivel', true, 'user_id', v_user_id, 'aluno', true,
                             'lead_id', v_lead.id, 'nome', coalesce(v_lead.nome, ''));
  end if;
  if v_lead.id is not null then
    return json_build_object('elegivel', true, 'user_id', v_user_id, 'aluno', false,
                             'lead_id', v_lead.id, 'nome', v_lead.nome);
  end if;
  if public.academy__concessao_por_email(v_email) then
    select c.nome into v_nome from public.academy_concessoes c
     where c.email = v_email and c.origem <> 'empresa' order by (c.nome <> '') desc, c.criado_em desc limit 1;
    return json_build_object('elegivel', true, 'user_id', v_user_id, 'aluno', false,
                             'lead_id', null, 'comprador', true, 'nome', coalesce(v_nome, ''));
  end if;
  if public.academy__convite_por_email(v_email) then
    return json_build_object('elegivel', true, 'user_id', v_user_id, 'aluno', false,
                             'lead_id', null, 'convidado', true, 'nome', '');
  end if;
  return json_build_object('elegivel', false);
end $$;

-- Mesma assinatura da 0008. Novo: sem pré-inscrição, aceita concessão ativa ou convite de empresa.
create or replace function public.academy_provisionar_aluno(
  p_user_id  uuid,
  p_lead_id  uuid,
  p_nome     text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead   public.leads%rowtype;
  v_email  text;
  v_nome   text;
begin
  if p_user_id is null then
    raise exception 'invalid_payload';
  end if;
  select lower(u.email) into v_email from auth.users u where u.id = p_user_id;
  if v_email is null then
    raise exception 'usuario_nao_confere';
  end if;

  if p_lead_id is not null then
    select * into v_lead from public.leads where id = p_lead_id
       and status in ('pending_confirmation','confirmed');
    if v_lead.id is null then
      raise exception 'lead_inelegivel';
    end if;
    if lower(v_lead.email) <> v_email then
      raise exception 'usuario_nao_confere';
    end if;
    v_nome := coalesce(nullif(btrim(p_nome), ''), v_lead.nome);
  else
    if not public.academy__concessao_por_email(v_email) and not public.academy__convite_por_email(v_email) then
      raise exception 'lead_inelegivel';
    end if;
    -- Sem nome, o aluno corrige depois em Minha conta.
    v_nome := coalesce(nullif(btrim(p_nome), ''), nullif(split_part(v_email, '@', 1), ''), 'Aluno');
    if length(btrim(v_nome)) < 2 then
      v_nome := 'Aluno';
    end if;
  end if;

  insert into public.alunos (user_id, lead_id, nome)
  values (p_user_id, p_lead_id, left(btrim(v_nome), 80))
  on conflict (user_id) do nothing;
  update public.academy_empresa_membros set user_id = p_user_id where email = v_email and user_id is null;
  perform public.academy__sincronizar(p_user_id);
  return json_build_object('status', 'ok');
end $$;

-- Mesma assinatura da 0021. Novo: também ativa o acesso de contratos que começaram.
create or replace function public.academy_expirar_concessoes()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_n    integer := 0;
begin
  for v_user in
    select distinct c.user_id from public.academy_concessoes c
     where c.user_id is not null
       and ((c.fim is not null and c.fim <= now() and c.fim > now() - interval '3 days')
            or (c.inicio <= now() and c.inicio > now() - interval '3 days' and c.criado_em < c.inicio))
  loop
    perform public.academy__sincronizar(v_user);
    v_n := v_n + 1;
  end loop;
  return v_n;
end $$;

-- 8. Aviso de vencimento (Edge Function academy-avisos, service_role) ----------------------

-- Outra concessão ativa cobre o mesmo acesso depois do fim desta?
create or replace function public.academy__coberta_depois(c public.academy_concessoes)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.academy_concessoes o
     where o.id <> c.id and (o.email = c.email or (o.user_id is not null and o.user_id = c.user_id))
       and public.academy__concessao_ativa(o)
       and (o.fim is null or o.fim > c.fim)
       and (o.escopo = 'plataforma'
            or (o.escopo = c.escopo and o.escopo = 'curso' and o.curso_slug = c.curso_slug)
            or (o.escopo = c.escopo and o.escopo = 'trilha' and o.cursos @> c.cursos))
  )
$$;

-- Devolve os e-mails a enviar agora: { chave, email, nome, tipo, acesso, fim, dias, renovar_url }.
-- tipo: plano (compra ou liberação de 60 dias ou mais), membro (7 dias antes), gestora (30 dias antes).
create or replace function public.academy_avisos_vencimento()
returns json
language sql
stable
security definer
set search_path = public
as $$
  with plano as (
    select c.id, c.email, c.user_id, c.nome, c.fim,
           public.academy__concessao_json(c)::jsonb->>'alvo' as alvo,
           case when c.fim <= now() + interval '7 days' then '7d' else '30d' end as marco
      from public.academy_concessoes c
     where c.origem in ('hotmart', 'manual') and public.academy__concessao_ativa(c)
       and c.fim is not null and c.fim <= now() + interval '30 days'
       and c.fim - c.inicio >= interval '60 days'
       and not public.academy__coberta_depois(c)
  ),
  membro as (
    select c.*, e.nome as empresa
      from public.academy_concessoes c join public.academy_empresas e on e.id = c.empresa_id
     where c.origem = 'empresa' and public.academy__concessao_ativa(c)
       and c.fim <= now() + interval '7 days'
       and not public.academy__coberta_depois(c)
  ),
  gestora as (
    select e.*, m.email as gestora_email, m.user_id as gestora_user
      from public.academy_empresas e join public.academy_empresa_membros m on m.empresa_id = e.id
     where public.academy__empresa_vigente(e) and e.fim <= public.academy__hoje() + 30
       and m.gestor and m.situacao = 'ativo'
  ),
  renovar as (
    select p.checkout_url from public.academy_produtos p
     where p.escopo = 'plataforma' and p.ativo and p.situacao = 'a_venda' order by p.preco_centavos limit 1
  ),
  itens as (
    select 'concessao:' || p.id || ':' || p.marco as chave, p.email,
           coalesce((select a.nome from public.alunos a where a.user_id = p.user_id), p.nome) as nome,
           'plano' as tipo, p.alvo as acesso,
           ((p.fim - interval '1 second') at time zone 'America/Sao_Paulo')::date as fim,
           (select checkout_url from renovar) as renovar_url
      from plano p
    union all
    select 'concessao:' || m.id || ':7d', m.email,
           coalesce((select a.nome from public.alunos a where a.user_id = m.user_id), ''),
           'membro', m.empresa, ((m.fim - interval '1 second') at time zone 'America/Sao_Paulo')::date, null
      from membro m
    union all
    select 'empresa:' || g.id || ':30d', g.gestora_email,
           coalesce((select a.nome from public.alunos a where a.user_id = g.gestora_user), ''),
           'gestora', g.nome, g.fim, null
      from gestora g
  )
  select coalesce(json_agg(json_build_object(
           'chave', i.chave, 'email', i.email, 'nome', i.nome, 'tipo', i.tipo, 'acesso', i.acesso,
           'fim', i.fim, 'dias', greatest(i.fim - public.academy__hoje(), 0), 'renovar_url', i.renovar_url)
           order by i.fim, i.email), '[]'::json)
    from (select * from itens i
           where not exists (select 1 from public.academy_avisos_enviados s where s.chave = i.chave and s.email = i.email)
             -- quem recebe o de 7 dias não recebe o de 30 depois
             and not (i.chave like '%:30d' and exists (
                   select 1 from public.academy_avisos_enviados s
                    where s.email = i.email and s.chave = replace(i.chave, ':30d', ':7d')))
           order by i.fim limit 300) i
$$;

create or replace function public.academy_avisos_registrar(p_itens jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  if p_itens is null or jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) > 300 then
    raise exception 'invalid_payload';
  end if;
  insert into public.academy_avisos_enviados (chave, email)
  select left(x->>'chave', 120), lower(left(x->>'email', 254))
    from jsonb_array_elements(p_itens) x
   where coalesce(x->>'chave', '') ~ '^(concessao|empresa):[0-9a-f-]{36}:(7d|30d)$'
  on conflict do nothing;
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- 9. Privilégios (padrão da 0012) -----------------------------------------------------

revoke all on function
  public.academy__hoje(),
  public.academy__empresa_inicio(public.academy_empresas),
  public.academy__empresa_fim(public.academy_empresas),
  public.academy__empresa_vigente(public.academy_empresas),
  public.academy__empresa_situacao(public.academy_empresas),
  public.academy__empresa_alvo(public.academy_empresas),
  public.academy__empresa_vagas_usadas(uuid),
  public.academy__empresa_cursos(public.academy_empresas),
  public.academy__exigir_gestor(uuid),
  public.academy__membro_conceder(uuid),
  public.academy__membro_encerrar(uuid, text, text),
  public.academy__garantir_gestora(uuid, uuid),
  public.academy__email_valido(text),
  public.academy__empresa_json(public.academy_empresas),
  public.academy__membro_progresso(uuid, uuid),
  public.academy__membro_json(public.academy_empresa_membros, boolean),
  public.academy__membro_da_empresa(uuid),
  public.academy__convite_por_email(text),
  public.academy__coberta_depois(public.academy_concessoes),
  public.academy_adm_empresas(),
  public.academy_adm_salvar_empresa(jsonb),
  public.academy_adm_encerrar_empresa(uuid, text),
  public.academy_empresa_painel(uuid),
  public.academy_empresa_convidar(uuid, text[], boolean),
  public.academy_empresa_cancelar_convite(uuid),
  public.academy_empresa_remover(uuid),
  public.academy_empresa_definir_gestor(uuid, boolean),
  public.academy_empresa_reenviar_convite(uuid),
  public.academy_empresa_convites_pendentes(uuid),
  public.academy_empresa_convites_enviados(uuid, uuid[]),
  public.academy_minhas_empresas(),
  public.academy_aceitar_convite(uuid),
  public.academy_recusar_convite(uuid),
  public.academy_sair_empresa(uuid),
  public.academy_elegibilidade(text),
  public.academy_provisionar_aluno(uuid, uuid, text),
  public.academy_expirar_concessoes(),
  public.academy_avisos_vencimento(),
  public.academy_avisos_registrar(jsonb)
from public, anon, authenticated;

grant execute on function
  public.academy_adm_empresas(),
  public.academy_adm_salvar_empresa(jsonb),
  public.academy_adm_encerrar_empresa(uuid, text),
  public.academy_empresa_painel(uuid),
  public.academy_empresa_convidar(uuid, text[], boolean),
  public.academy_empresa_cancelar_convite(uuid),
  public.academy_empresa_remover(uuid),
  public.academy_empresa_definir_gestor(uuid, boolean),
  public.academy_empresa_reenviar_convite(uuid),
  public.academy_empresa_convites_pendentes(uuid),
  public.academy_empresa_convites_enviados(uuid, uuid[]),
  public.academy_minhas_empresas(),
  public.academy_aceitar_convite(uuid),
  public.academy_recusar_convite(uuid),
  public.academy_sair_empresa(uuid)
to authenticated;

grant execute on function
  public.academy__hoje(),
  public.academy__empresa_inicio(public.academy_empresas),
  public.academy__empresa_fim(public.academy_empresas),
  public.academy__empresa_vigente(public.academy_empresas),
  public.academy__empresa_situacao(public.academy_empresas),
  public.academy__empresa_alvo(public.academy_empresas),
  public.academy__empresa_vagas_usadas(uuid),
  public.academy__empresa_cursos(public.academy_empresas),
  public.academy__exigir_gestor(uuid),
  public.academy__membro_conceder(uuid),
  public.academy__membro_encerrar(uuid, text, text),
  public.academy__garantir_gestora(uuid, uuid),
  public.academy__email_valido(text),
  public.academy__empresa_json(public.academy_empresas),
  public.academy__membro_progresso(uuid, uuid),
  public.academy__membro_json(public.academy_empresa_membros, boolean),
  public.academy__membro_da_empresa(uuid),
  public.academy__convite_por_email(text),
  public.academy__coberta_depois(public.academy_concessoes),
  public.academy_adm_empresas(),
  public.academy_adm_salvar_empresa(jsonb),
  public.academy_adm_encerrar_empresa(uuid, text),
  public.academy_empresa_painel(uuid),
  public.academy_empresa_convidar(uuid, text[], boolean),
  public.academy_empresa_cancelar_convite(uuid),
  public.academy_empresa_remover(uuid),
  public.academy_empresa_definir_gestor(uuid, boolean),
  public.academy_empresa_reenviar_convite(uuid),
  public.academy_empresa_convites_pendentes(uuid),
  public.academy_empresa_convites_enviados(uuid, uuid[]),
  public.academy_minhas_empresas(),
  public.academy_aceitar_convite(uuid),
  public.academy_recusar_convite(uuid),
  public.academy_sair_empresa(uuid),
  public.academy_elegibilidade(text),
  public.academy_provisionar_aluno(uuid, uuid, text),
  public.academy_expirar_concessoes(),
  public.academy_avisos_vencimento(),
  public.academy_avisos_registrar(jsonb)
to service_role;
