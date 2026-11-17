-- ============================================================================
-- 0008_academy_portal.sql - Portal do aluno da CyDef Academy (academy.cydef.com.br)
--
-- Etapa 1 do portal: alunos, catálogo (formações, trilhas, cursos, módulos,
-- aulas), competências, matrículas, progresso, dias de estudo e boletim.
--
-- Segurança (mesmo padrão das migrações 0001 a 0007):
--   - RLS ligado em todas as tabelas novas.
--   - Nenhum INSERT/UPDATE/DELETE direto para anon ou authenticated: toda
--     escrita passa por função `security definer` que valida quem chama.
--   - Catálogo publicado é legível por anon e authenticated, mas só nas
--     colunas públicas: a referência do vídeo (`video_ref`) não é concedida.
--     O vídeo será entregue por função própria na etapa 2, depois de conferir
--     a matrícula.
--   - Dados do aluno (matrículas, progresso, dias de estudo) só aparecem
--     para o próprio aluno (`user_id = auth.uid()`).
--   - Funções do servidor de login (elegibilidade, provisionamento e limite
--     de tentativas) só têm EXECUTE para service_role.
--
-- Migração aditiva: não altera nem apaga nada das migrações anteriores.
-- Sem segredos neste arquivo (repositório público).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------

create table if not exists public.formacoes (
  slug        text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  titulo      text not null check (length(btrim(titulo)) between 2 and 80),
  descricao   text not null check (length(descricao) <= 400),
  ordem       integer not null default 0,
  publicado   boolean not null default false,
  criado_em   timestamptz not null default now()
);

create table if not exists public.trilhas (
  slug           text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  formacao_slug  text not null references public.formacoes(slug) on delete cascade,
  titulo         text not null check (length(btrim(titulo)) between 2 and 80),
  descricao      text not null check (length(descricao) <= 400),
  ordem          integer not null default 0,
  publicado      boolean not null default false,
  criado_em      timestamptz not null default now()
);
create index if not exists trilhas_formacao_idx on public.trilhas (formacao_slug, ordem);

create table if not exists public.cursos (
  slug           text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  titulo         text not null check (length(btrim(titulo)) between 2 and 80),
  descricao      text not null check (length(descricao) <= 600),
  nivel          text not null check (nivel in ('iniciante','intermediario','avancado')),
  gratuito       boolean not null default false,
  publicado      boolean not null default false,
  ordem          integer not null default 0,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create table if not exists public.trilha_cursos (
  trilha_slug  text not null references public.trilhas(slug) on delete cascade,
  curso_slug   text not null references public.cursos(slug) on delete cascade,
  ordem        integer not null default 0,
  primary key (trilha_slug, curso_slug)
);

create table if not exists public.modulos (
  id          uuid primary key default gen_random_uuid(),
  curso_slug  text not null references public.cursos(slug) on delete cascade,
  ordem       integer not null check (ordem > 0),
  titulo      text not null check (length(btrim(titulo)) between 2 and 120),
  unique (curso_slug, ordem)
);

create table if not exists public.aulas (
  id             uuid primary key default gen_random_uuid(),
  modulo_id      uuid not null references public.modulos(id) on delete cascade,
  ordem          integer not null check (ordem > 0),
  numero         integer not null check (numero > 0),
  titulo         text not null check (length(btrim(titulo)) between 2 and 140),
  resumo         text not null default '' check (length(resumo) <= 1200),
  duracao_seg    integer not null check (duracao_seg between 30 and 14400),
  video_provedor text check (video_provedor in ('youtube','bunny')),
  video_ref      text check (video_ref is null or video_ref ~ '^[A-Za-z0-9_-]{6,64}$'),
  publicado      boolean not null default false,
  atualizado_em  timestamptz not null default now(),
  unique (modulo_id, ordem),
  check ((video_provedor is null) = (video_ref is null))
);
create index if not exists aulas_modulo_idx on public.aulas (modulo_id, ordem);

create table if not exists public.competencias (
  slug    text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  titulo  text not null check (length(btrim(titulo)) between 2 and 60),
  ordem   integer not null default 0
);

create table if not exists public.aula_competencias (
  aula_id           uuid not null references public.aulas(id) on delete cascade,
  competencia_slug  text not null references public.competencias(slug) on delete cascade,
  peso              integer not null default 1 check (peso between 1 and 10),
  primary key (aula_id, competencia_slug)
);

-- ---------------------------------------------------------------------------
-- Aluno, matrícula, progresso e dias de estudo
-- ---------------------------------------------------------------------------

create table if not exists public.alunos (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  lead_id           uuid unique references public.leads(id),
  nome              text not null check (length(btrim(nome)) between 2 and 80),
  criado_em         timestamptz not null default now(),
  ultimo_acesso_em  timestamptz
);

create table if not exists public.matriculas (
  user_id     uuid not null references public.alunos(user_id) on delete cascade,
  curso_slug  text not null references public.cursos(slug) on delete cascade,
  origem      text not null check (origem in ('gratuito','compra','cortesia')),
  criado_em   timestamptz not null default now(),
  primary key (user_id, curso_slug)
);

create table if not exists public.progresso_aulas (
  user_id        uuid not null references public.alunos(user_id) on delete cascade,
  aula_id        uuid not null references public.aulas(id) on delete cascade,
  posicao_seg    integer not null default 0 check (posicao_seg >= 0),
  concluida_em   timestamptz,
  atualizado_em  timestamptz not null default now(),
  primary key (user_id, aula_id)
);
create index if not exists progresso_recente_idx on public.progresso_aulas (user_id, atualizado_em desc);

create table if not exists public.dias_estudo (
  user_id  uuid not null references public.alunos(user_id) on delete cascade,
  dia      date not null,
  primary key (user_id, dia)
);

-- Boletim do SOC: avisos curtos publicados pela CyDef (sem dado de aluno).
create table if not exists public.boletim (
  id            uuid primary key default gen_random_uuid(),
  tipo          text not null check (tipo in ('atualizacao','ameaca','missao','aula')),
  titulo        text not null check (length(btrim(titulo)) between 4 and 140),
  link          text check (link is null or (link ~ '^https://[^[:space:]]+$' and length(link) <= 300)),
  publicado     boolean not null default false,
  publicado_em  timestamptz not null default now()
);
create index if not exists boletim_publicado_idx on public.boletim (publicado_em desc);

-- ---------------------------------------------------------------------------
-- RLS e grants
-- ---------------------------------------------------------------------------

alter table public.formacoes          enable row level security;
alter table public.trilhas            enable row level security;
alter table public.cursos             enable row level security;
alter table public.trilha_cursos      enable row level security;
alter table public.modulos            enable row level security;
alter table public.aulas              enable row level security;
alter table public.competencias       enable row level security;
alter table public.aula_competencias  enable row level security;
alter table public.alunos             enable row level security;
alter table public.matriculas         enable row level security;
alter table public.progresso_aulas    enable row level security;
alter table public.dias_estudo        enable row level security;
alter table public.boletim            enable row level security;

revoke all on table
  public.formacoes, public.trilhas, public.cursos, public.trilha_cursos,
  public.modulos, public.aulas, public.competencias, public.aula_competencias,
  public.alunos, public.matriculas, public.progresso_aulas, public.dias_estudo,
  public.boletim
  from anon, authenticated, service_role;

-- Catálogo publicado: leitura pública, só colunas públicas.
grant select on public.formacoes, public.trilhas, public.cursos, public.trilha_cursos,
                public.modulos, public.competencias, public.aula_competencias
  to anon, authenticated;
grant select (id, modulo_id, ordem, numero, titulo, resumo, duracao_seg, publicado, atualizado_em)
  on public.aulas to anon, authenticated;

drop policy if exists formacoes_publicadas on public.formacoes;
create policy formacoes_publicadas on public.formacoes
  for select to anon, authenticated using (publicado);

drop policy if exists trilhas_publicadas on public.trilhas;
create policy trilhas_publicadas on public.trilhas
  for select to anon, authenticated
  using (publicado and exists (select 1 from public.formacoes f where f.slug = formacao_slug and f.publicado));

drop policy if exists cursos_publicados on public.cursos;
create policy cursos_publicados on public.cursos
  for select to anon, authenticated using (publicado);

drop policy if exists trilha_cursos_publicados on public.trilha_cursos;
create policy trilha_cursos_publicados on public.trilha_cursos
  for select to anon, authenticated
  using (
    exists (select 1 from public.trilhas t where t.slug = trilha_slug and t.publicado)
    and exists (select 1 from public.cursos c where c.slug = curso_slug and c.publicado)
  );

drop policy if exists modulos_publicados on public.modulos;
create policy modulos_publicados on public.modulos
  for select to anon, authenticated
  using (exists (select 1 from public.cursos c where c.slug = curso_slug and c.publicado));

drop policy if exists aulas_publicadas on public.aulas;
create policy aulas_publicadas on public.aulas
  for select to anon, authenticated
  using (
    publicado and exists (
      select 1 from public.modulos m join public.cursos c on c.slug = m.curso_slug
       where m.id = modulo_id and c.publicado
    )
  );

drop policy if exists competencias_todas on public.competencias;
create policy competencias_todas on public.competencias
  for select to anon, authenticated using (true);

drop policy if exists aula_competencias_publicadas on public.aula_competencias;
create policy aula_competencias_publicadas on public.aula_competencias
  for select to anon, authenticated
  using (exists (select 1 from public.aulas a where a.id = aula_id and a.publicado));

-- Dados do aluno: só o próprio aluno lê; ninguém escreve direto.
grant select (user_id, nome, criado_em, ultimo_acesso_em) on public.alunos to authenticated;
grant select on public.matriculas, public.progresso_aulas, public.dias_estudo to authenticated;

drop policy if exists alunos_proprio on public.alunos;
create policy alunos_proprio on public.alunos
  for select to authenticated using (user_id = auth.uid());

drop policy if exists matriculas_proprias on public.matriculas;
create policy matriculas_proprias on public.matriculas
  for select to authenticated using (user_id = auth.uid());

drop policy if exists progresso_proprio on public.progresso_aulas;
create policy progresso_proprio on public.progresso_aulas
  for select to authenticated using (user_id = auth.uid());

drop policy if exists dias_proprios on public.dias_estudo;
create policy dias_proprios on public.dias_estudo
  for select to authenticated using (user_id = auth.uid());

-- Boletim: só alunos autenticados, só o que já foi publicado.
grant select (id, tipo, titulo, link, publicado_em) on public.boletim to authenticated;
drop policy if exists boletim_publicado on public.boletim;
create policy boletim_publicado on public.boletim
  for select to authenticated using (publicado and publicado_em <= now());

-- ---------------------------------------------------------------------------
-- Funções do servidor de login (EXECUTE só para service_role)
-- ---------------------------------------------------------------------------

-- Limite de tentativas genérico, na mesma tabela das migrações anteriores.
-- p_chave já chega com hash (nunca e-mail ou IP em claro).
create or replace function public.academy_rate_limit(
  p_chave       text,
  p_limite      integer,
  p_janela_seg  integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bucket bigint;
  v_chave  text;
  v_count  integer;
begin
  if p_chave is null or length(p_chave) < 8 or length(p_chave) > 160
     or p_limite is null or p_limite < 1 or p_janela_seg is null or p_janela_seg < 60 then
    raise exception 'invalid_payload';
  end if;
  v_bucket := floor(extract(epoch from now()) / p_janela_seg)::bigint;
  v_chave := 'academy:' || p_chave || ':' || v_bucket::text;
  insert into public.rate_limit_events (chave, contador, janela_inicio)
  values (v_chave, 1, now())
  on conflict (chave) do update
    set contador = public.rate_limit_events.contador + 1
  returning contador into v_count;
  return v_count <= p_limite;
end $$;

-- Quem pode receber link de acesso: aluno já provisionado, ou pré-inscrição
-- ativa (pendente ou confirmada) com consentimento registrado.
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
  if v_lead.id is null then
    return json_build_object('elegivel', false);
  end if;
  return json_build_object('elegivel', true, 'user_id', v_user_id, 'aluno', false,
                           'lead_id', v_lead.id, 'nome', v_lead.nome);
end $$;

-- Cria o registro de aluno depois que o servidor criou o usuário de login.
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
  v_lead public.leads%rowtype;
begin
  if p_user_id is null or p_lead_id is null then
    raise exception 'invalid_payload';
  end if;
  select * into v_lead from public.leads where id = p_lead_id
     and status in ('pending_confirmation','confirmed');
  if v_lead.id is null then
    raise exception 'lead_inelegivel';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_user_id and lower(u.email) = lower(v_lead.email)) then
    raise exception 'usuario_nao_confere';
  end if;
  insert into public.alunos (user_id, lead_id, nome)
  values (p_user_id, p_lead_id, left(btrim(coalesce(nullif(p_nome, ''), v_lead.nome)), 80))
  on conflict (user_id) do nothing;
  return json_build_object('status', 'ok');
end $$;

revoke all on function public.academy_rate_limit(text, integer, integer) from public;
revoke all on function public.academy_elegibilidade(text) from public;
revoke all on function public.academy_provisionar_aluno(uuid, uuid, text) from public;
grant execute on function public.academy_rate_limit(text, integer, integer) to service_role;
grant execute on function public.academy_elegibilidade(text) to service_role;
grant execute on function public.academy_provisionar_aluno(uuid, uuid, text) to service_role;

-- ---------------------------------------------------------------------------
-- Funções do aluno (EXECUTE só para authenticated)
-- ---------------------------------------------------------------------------

-- Chamada no retorno do link de acesso. Abrir o link prova que a pessoa é
-- dona do e-mail, então a pré-inscrição pendente passa a confirmada aqui.
-- Também matricula o aluno em todos os cursos gratuitos publicados.
create or replace function public.academy_registrar_acesso()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_aluno  public.alunos%rowtype;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  select * into v_aluno from public.alunos where user_id = v_uid;
  if v_aluno.user_id is null then
    raise exception 'sem_cadastro';
  end if;

  update public.alunos set ultimo_acesso_em = now() where user_id = v_uid;

  if v_aluno.lead_id is not null then
    update public.leads
       set status = 'confirmed', updated_at = now()
     where id = v_aluno.lead_id and status = 'pending_confirmation';
  end if;

  insert into public.matriculas (user_id, curso_slug, origem)
  select v_uid, c.slug, 'gratuito'
    from public.cursos c
   where c.gratuito and c.publicado
  on conflict (user_id, curso_slug) do nothing;

  return json_build_object('nome', v_aluno.nome);
end $$;

-- Registra posição e conclusão de uma aula (usada pela sala de aula na etapa 2).
create or replace function public.academy_registrar_progresso(
  p_aula_id    uuid,
  p_posicao    integer,
  p_concluida  boolean
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_aula   public.aulas%rowtype;
  v_curso  text;
  v_hoje   date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  if p_aula_id is null or p_posicao is null or p_posicao < 0 or p_concluida is null then
    raise exception 'invalid_payload';
  end if;

  select a.* into v_aula from public.aulas a where a.id = p_aula_id and a.publicado;
  if v_aula.id is null then
    raise exception 'aula_indisponivel';
  end if;
  select m.curso_slug into v_curso
    from public.modulos m join public.cursos c on c.slug = m.curso_slug
   where m.id = v_aula.modulo_id and c.publicado;
  if v_curso is null then
    raise exception 'aula_indisponivel';
  end if;
  if not exists (select 1 from public.matriculas where user_id = v_uid and curso_slug = v_curso) then
    raise exception 'sem_matricula';
  end if;
  if p_posicao > v_aula.duracao_seg + 60 then
    raise exception 'invalid_payload';
  end if;

  insert into public.progresso_aulas (user_id, aula_id, posicao_seg, concluida_em, atualizado_em)
  values (v_uid, p_aula_id, p_posicao, case when p_concluida then now() end, now())
  on conflict (user_id, aula_id) do update
    set posicao_seg   = excluded.posicao_seg,
        concluida_em  = case when p_concluida then coalesce(public.progresso_aulas.concluida_em, now()) else null end,
        atualizado_em = now();

  insert into public.dias_estudo (user_id, dia) values (v_uid, v_hoje)
  on conflict do nothing;

  return json_build_object('status', 'ok');
end $$;

-- Painel do aluno numa chamada só. Roda com as permissões de quem chama
-- (security invoker): o RLS garante que só os dados do próprio aluno entram.
create or replace function public.academy_meu_painel()
returns json
language sql
stable
security invoker
set search_path = public
as $$
  with
  me as (select a.user_id, a.nome from public.alunos a where a.user_id = auth.uid()),
  aulas_curso as (
    select c.slug as curso_slug, c.titulo as curso_titulo, m.id as modulo_id, m.ordem as modulo_ordem,
           m.titulo as modulo_titulo, a.id as aula_id, a.ordem as aula_ordem, a.numero, a.titulo as aula_titulo,
           a.duracao_seg
      from public.matriculas mt
      join public.cursos c on c.slug = mt.curso_slug
      join public.modulos m on m.curso_slug = c.slug
      join public.aulas a on a.modulo_id = m.id
     where mt.user_id = auth.uid()
  ),
  prog as (select * from public.progresso_aulas where user_id = auth.uid()),
  cursos_resumo as (
    select ac.curso_slug,
           min(ac.curso_titulo) as titulo,
           count(*) as total,
           count(p.concluida_em) as concluidas,
           max(p.atualizado_em) as ultimo
      from aulas_curso ac left join prog p on p.aula_id = ac.aula_id
     group by ac.curso_slug
  ),
  ultima as (
    select ac.*, p.posicao_seg, p.concluida_em
      from prog p join aulas_curso ac on ac.aula_id = p.aula_id
     order by p.atualizado_em desc
     limit 1
  ),
  proxima as (
    -- Continuar: a aula da última atividade, se não terminou; senão a próxima
    -- aula não concluída do mesmo curso; sem atividade, a primeira aula do
    -- primeiro curso matriculado.
    select x.* from (
      select ac.*, coalesce(p.posicao_seg, 0) as posicao_seg, 1 as prioridade
        from ultima u join aulas_curso ac on ac.aula_id = u.aula_id
        left join prog p on p.aula_id = ac.aula_id
       where u.concluida_em is null
      union all
      select ac.*, 0, 2
        from ultima u join aulas_curso ac on ac.curso_slug = u.curso_slug
        left join prog p on p.aula_id = ac.aula_id
       where p.concluida_em is null
         and (ac.modulo_ordem, ac.aula_ordem) > (u.modulo_ordem, u.aula_ordem)
      union all
      select ac.*, 0, 3
        from aulas_curso ac
        left join prog p on p.aula_id = ac.aula_id
       where p.concluida_em is null
    ) x
    order by x.prioridade, x.curso_slug, x.modulo_ordem, x.aula_ordem
    limit 1
  ),
  formacao_trilhas as (
    select f.slug as formacao_slug, f.titulo as formacao_titulo, f.ordem as formacao_ordem,
           t.slug as trilha_slug, t.titulo as trilha_titulo, t.ordem as trilha_ordem,
           count(a.id) as total,
           count(p.concluida_em) as concluidas
      from public.formacoes f
      join public.trilhas t on t.formacao_slug = f.slug
      left join public.trilha_cursos tc on tc.trilha_slug = t.slug
      left join public.modulos m on m.curso_slug = tc.curso_slug
      left join public.aulas a on a.modulo_id = m.id
      left join prog p on p.aula_id = a.id
     group by f.slug, f.titulo, f.ordem, t.slug, t.titulo, t.ordem
  ),
  comp as (
    select co.slug, co.titulo, co.ordem,
           coalesce(sum(ak.peso), 0) as total,
           coalesce(sum(ak.peso) filter (where p.concluida_em is not null), 0) as feito
      from public.competencias co
      left join public.aula_competencias ak on ak.competencia_slug = co.slug
      left join prog p on p.aula_id = ak.aula_id
     group by co.slug, co.titulo, co.ordem
  ),
  dias as (
    select d.dia from public.dias_estudo d
     where d.user_id = auth.uid()
       and d.dia > (now() at time zone 'America/Sao_Paulo')::date - 84
  )
  select case when (select user_id from me) is null then null else json_build_object(
    'nome', (select nome from me),
    'continuar', (
      select json_build_object(
        'curso_slug', pr.curso_slug, 'curso_titulo', pr.curso_titulo,
        'modulo_ordem', pr.modulo_ordem, 'modulo_titulo', pr.modulo_titulo,
        'aula_id', pr.aula_id, 'aula_numero', pr.numero, 'aula_titulo', pr.aula_titulo,
        'duracao_seg', pr.duracao_seg, 'posicao_seg', pr.posicao_seg,
        'progresso_curso', (select case when cr.total = 0 then 0 else round(cr.concluidas * 100.0 / cr.total) end
                              from cursos_resumo cr where cr.curso_slug = pr.curso_slug)
      ) from proxima pr
    ),
    'cursos', coalesce((
      select json_agg(json_build_object(
        'slug', cr.curso_slug, 'titulo', cr.titulo, 'total', cr.total, 'concluidas', cr.concluidas,
        'ultimo_acesso', cr.ultimo) order by cr.ultimo desc nulls last, cr.titulo)
        from cursos_resumo cr), '[]'::json),
    'formacoes', coalesce((
      select json_agg(fo order by (fo->>'ordem')::int) from (
        select json_build_object(
          'slug', ft.formacao_slug, 'titulo', ft.formacao_titulo, 'ordem', min(ft.formacao_ordem),
          'aulas_total', sum(ft.total), 'aulas_concluidas', sum(ft.concluidas),
          'trilhas', json_agg(json_build_object(
              'slug', ft.trilha_slug, 'titulo', ft.trilha_titulo,
              'total', ft.total, 'concluidas', ft.concluidas) order by ft.trilha_ordem)
        ) as fo
          from formacao_trilhas ft
         group by ft.formacao_slug, ft.formacao_titulo
      ) z), '[]'::json),
    'competencias', coalesce((
      select json_agg(json_build_object(
        'slug', c.slug, 'titulo', c.titulo,
        'percentual', case when c.total = 0 then 0 else round(c.feito * 100.0 / c.total) end) order by c.ordem)
        from comp c where c.total > 0), '[]'::json),
    'dias_estudo', coalesce((select json_agg(d.dia order by d.dia) from dias d), '[]'::json),
    'hoje', (now() at time zone 'America/Sao_Paulo')::date
  ) end
$$;

revoke all on function public.academy_registrar_acesso() from public;
revoke all on function public.academy_registrar_progresso(uuid, integer, boolean) from public;
revoke all on function public.academy_meu_painel() from public;
grant execute on function public.academy_registrar_acesso() to authenticated;
grant execute on function public.academy_registrar_progresso(uuid, integer, boolean) to authenticated;
grant execute on function public.academy_meu_painel() to authenticated;
