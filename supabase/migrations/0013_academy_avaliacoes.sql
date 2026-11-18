-- ============================================================================
-- 0013_academy_avaliacoes.sql - Questões, avaliação final e certificado
--
-- Decisões do Everton (18/11/2026):
--   * Requisitos são de cada curso (tabela cursos_requisitos). O painel do
--     instrutor vai editar essa tabela; até ele existir, a configuração entra
--     por migração. Os dois cursos gratuitos usam os mesmos requisitos.
--   * Questões por módulo: múltipla escolha com explicação; 70% de acerto
--     libera o módulo seguinte; refaz na hora. Módulo sem questões publicadas
--     não bloqueia (Introdução e cursos em construção).
--   * Avaliação final: questões sorteadas de um banco, sem cronômetro,
--     tentativas ilimitadas com 24 h de espera; 80% para aprovar.
--   * Certificado: todas as aulas, todos os módulos e a avaliação final. O
--     aluno confere o nome antes de emitir. Página pública de validação com
--     nome, curso, carga horária e data (Aviso de Privacidade v2026.3, item 4).
--
-- Segurança:
--   * Nenhuma tabela nova tem grant para anon ou authenticated: tudo passa
--     pelas funções abaixo, que conferem sessão, matrícula e publicação.
--   * A alternativa correta e a explicação só saem depois da resposta, e da
--     avaliação final só sai a nota (o banco não vaza).
--   * O bloqueio de módulo vale no servidor: aula de módulo bloqueado não
--     entrega vídeo nem registra progresso.
--   * Privilégios no padrão da 0012: revoke de public, anon e authenticated e
--     grant explícito para quem usa, inclusive service_role.
--
-- Idempotente.
-- ============================================================================

-- 1. Requisitos por curso -----------------------------------------------------

create table if not exists public.cursos_requisitos (
  curso_slug            text primary key references public.cursos(slug) on delete cascade,
  exige_todas_aulas     boolean not null default true,
  exige_modulos         boolean not null default true,
  nota_minima_modulo    integer not null default 70 check (nota_minima_modulo between 0 and 100),
  questoes_modulo       integer not null default 5 check (questoes_modulo between 1 and 50),
  nota_minima_final     integer not null default 80 check (nota_minima_final between 0 and 100),
  questoes_final        integer not null default 20 check (questoes_final between 1 and 100),
  espera_final_horas    integer not null default 24 check (espera_final_horas between 0 and 720),
  tentativas_final_max  integer check (tentativas_final_max is null or tentativas_final_max between 1 and 50),
  carga_horaria_h       numeric(5,1) check (carga_horaria_h is null or carga_horaria_h between 0.5 and 999),
  certificado_ativo     boolean not null default true,
  atualizado_em         timestamptz not null default now()
);

comment on table public.cursos_requisitos is
  'Requisitos de cada curso para questões, avaliação final e certificado. Editado pelo painel do instrutor.';
comment on column public.cursos_requisitos.tentativas_final_max is 'Vazio: tentativas ilimitadas.';
comment on column public.cursos_requisitos.carga_horaria_h is 'Vazio: o curso ainda não emite certificado.';

-- Os dois cursos gratuitos: mesmos requisitos. Carga horária definida pelo
-- Everton: Cybersecurity Fundamentals com 6 h (a mesma da página dos cursos
-- gratuitos). O Fundamentos para SOC fica sem carga até ele definir, e por
-- isso ainda não emite certificado.
insert into public.cursos_requisitos (curso_slug, carga_horaria_h)
select c.slug, case c.slug when 'cybersecurity-fundamentals' then 6 end
  from public.cursos c
 where c.slug in ('cybersecurity-fundamentals', 'fundamentos-para-soc')
on conflict (curso_slug) do nothing;

-- 2. Questões -----------------------------------------------------------------

create table if not exists public.questoes (
  id             uuid primary key default gen_random_uuid(),
  curso_slug     text not null references public.cursos(slug) on delete cascade,
  modulo_id      uuid references public.modulos(id) on delete cascade,
  enunciado      text not null check (length(btrim(enunciado)) between 10 and 2000),
  explicacao     text not null default '' check (length(explicacao) <= 2000),
  publicado      boolean not null default false,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
comment on column public.questoes.modulo_id is 'Vazio: questão do banco da avaliação final do curso.';
create index if not exists questoes_curso_modulo_idx on public.questoes (curso_slug, modulo_id);

create table if not exists public.questoes_alternativas (
  id          uuid primary key default gen_random_uuid(),
  questao_id  uuid not null references public.questoes(id) on delete cascade,
  ordem       integer not null check (ordem between 1 and 8),
  texto       text not null check (length(btrim(texto)) between 1 and 600),
  correta     boolean not null default false,
  unique (questao_id, ordem)
);
create unique index if not exists questoes_uma_correta_idx on public.questoes_alternativas (questao_id) where correta;

create table if not exists public.tentativas_modulo (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.alunos(user_id) on delete cascade,
  modulo_id  uuid not null references public.modulos(id) on delete cascade,
  acertos    integer not null check (acertos >= 0),
  total      integer not null check (total > 0),
  nota       integer not null check (nota between 0 and 100),
  aprovado   boolean not null,
  respostas  jsonb not null,
  criado_em  timestamptz not null default now()
);
create index if not exists tentativas_modulo_aluno_idx on public.tentativas_modulo (user_id, modulo_id, criado_em desc);

create table if not exists public.provas_finais (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.alunos(user_id) on delete cascade,
  curso_slug   text not null references public.cursos(slug) on delete cascade,
  questoes     uuid[] not null check (cardinality(questoes) between 1 and 100),
  iniciada_em  timestamptz not null default now(),
  enviada_em   timestamptz,
  acertos      integer,
  total        integer,
  nota         integer check (nota is null or nota between 0 and 100),
  aprovado     boolean,
  respostas    jsonb
);
create unique index if not exists provas_finais_aberta_idx on public.provas_finais (user_id, curso_slug) where enviada_em is null;
create index if not exists provas_finais_aluno_idx on public.provas_finais (user_id, curso_slug, enviada_em desc);

create table if not exists public.certificados (
  codigo             text primary key check (codigo ~ '^CYD-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$'),
  user_id            uuid not null references public.alunos(user_id) on delete cascade,
  curso_slug         text not null references public.cursos(slug) on delete cascade,
  nome               text not null check (length(btrim(nome)) between 2 and 120),
  curso_titulo       text not null,
  carga_horaria_h    numeric(5,1) not null,
  nota_final         integer not null check (nota_final between 0 and 100),
  concluido_em       date not null,
  emitido_em         timestamptz not null default now(),
  validacao_publica  boolean not null default true,
  unique (user_id, curso_slug)
);
comment on column public.certificados.validacao_publica is
  'Falso: a página pública responde como se o código não existisse (pedido do aluno, Aviso item 4).';

alter table public.cursos_requisitos      enable row level security;
alter table public.questoes               enable row level security;
alter table public.questoes_alternativas  enable row level security;
alter table public.tentativas_modulo      enable row level security;
alter table public.provas_finais          enable row level security;
alter table public.certificados           enable row level security;

revoke all on table
  public.cursos_requisitos, public.questoes, public.questoes_alternativas,
  public.tentativas_modulo, public.provas_finais, public.certificados
  from anon, authenticated, service_role;

-- 3. Funções internas ---------------------------------------------------------

-- Questão em condições de ir para o aluno: publicada, de 2 a 8 alternativas e
-- exatamente uma correta.
create or replace function public.academy__questao_valida(p_questao uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.questoes q
     where q.id = p_questao and q.publicado
       and (select count(*) from public.questoes_alternativas a where a.questao_id = q.id) between 2 and 8
       and (select count(*) from public.questoes_alternativas a where a.questao_id = q.id and a.correta) = 1
  )
$$;

-- Situação de cada módulo do curso para o aluno. Um módulo fica liberado
-- quando todo módulo anterior com questões válidas foi aprovado (ou quando o
-- curso não exige os módulos).
create or replace function public.academy__modulos_do_aluno(p_uid uuid, p_curso text)
returns table (modulo_id uuid, ordem integer, titulo text, tem_questoes boolean, aprovado boolean, liberado boolean)
language sql
stable
security definer
set search_path = public
as $$
  with req as (
    select coalesce((select r.exige_modulos from public.cursos_requisitos r where r.curso_slug = p_curso), true) as exige
  ),
  m as (
    select mo.id, mo.ordem, mo.titulo,
           exists (select 1 from public.questoes q where q.modulo_id = mo.id and public.academy__questao_valida(q.id)) as tem_q,
           exists (select 1 from public.tentativas_modulo t where t.modulo_id = mo.id and t.user_id = p_uid and t.aprovado) as aprov
      from public.modulos mo
     where mo.curso_slug = p_curso
  )
  select m.id, m.ordem, m.titulo, m.tem_q, m.aprov,
         (not (select exige from req))
         or not exists (select 1 from m m2 where m2.ordem < m.ordem and m2.tem_q and not m2.aprov)
    from m
   order by m.ordem
$$;

-- Aulas, módulos e avaliação final que ainda faltam para o aluno.
create or replace function public.academy__pendencias(p_uid uuid, p_curso text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_req          public.cursos_requisitos%rowtype;
  v_aulas_total  integer;
  v_aulas_feitas integer;
  v_mod_pend     integer;
  v_final_ok     boolean;
begin
  select * into v_req from public.cursos_requisitos where curso_slug = p_curso;

  -- Todas as aulas do curso, publicadas ou não: curso em construção não fecha.
  select count(*) into v_aulas_total
    from public.aulas a join public.modulos m on m.id = a.modulo_id
   where m.curso_slug = p_curso;
  select count(*) into v_aulas_feitas
    from public.aulas a join public.modulos m on m.id = a.modulo_id
    join public.progresso_aulas p on p.aula_id = a.id and p.user_id = p_uid and p.concluida_em is not null
   where m.curso_slug = p_curso and a.publicado;

  select count(*) into v_mod_pend
    from public.academy__modulos_do_aluno(p_uid, p_curso) x
   where x.tem_questoes and not x.aprovado;

  select exists (select 1 from public.provas_finais f where f.user_id = p_uid and f.curso_slug = p_curso and f.aprovado)
    into v_final_ok;

  return json_build_object(
    'aulas_total', v_aulas_total,
    'aulas_concluidas', v_aulas_feitas,
    'aulas_ok', not coalesce(v_req.exige_todas_aulas, true) or (v_aulas_total > 0 and v_aulas_feitas = v_aulas_total),
    'modulos_pendentes', v_mod_pend,
    'modulos_ok', not coalesce(v_req.exige_modulos, true) or v_mod_pend = 0,
    'final_ok', v_final_ok
  );
end $$;

-- Confere sessão, curso publicado e matrícula. Devolve o uid.
create or replace function public.academy__aluno_no_curso(p_curso text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  if p_curso is null or not exists (select 1 from public.cursos c where c.slug = p_curso and c.publicado) then
    raise exception 'curso_indisponivel';
  end if;
  if not exists (select 1 from public.matriculas where user_id = v_uid and curso_slug = p_curso) then
    raise exception 'sem_matricula';
  end if;
  return v_uid;
end $$;

-- Questões (sem a correta) em ordem sorteada, com alternativas embaralhadas.
create or replace function public.academy__questoes_para_aluno(p_ids uuid[])
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(json_build_object(
           'id', q.id,
           'enunciado', q.enunciado,
           'alternativas', (select json_agg(json_build_object('id', a.id, 'texto', a.texto) order by random())
                              from public.questoes_alternativas a where a.questao_id = q.id)
         ) order by array_position(p_ids, q.id)), '[]'::json)
    from public.questoes q
   where q.id = any (p_ids)
$$;

-- Corrige respostas no formato [{"questao": uuid, "alternativa": uuid}] contra
-- o conjunto esperado. Recusa faltando, sobrando ou repetida. Devolve na ordem
-- em que o aluno respondeu.
create or replace function public.academy__corrigir(p_esperadas uuid[], p_respostas jsonb)
returns table (posicao integer, questao_id uuid, alternativa_id uuid, correta boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_qtd integer;
begin
  if p_respostas is null or jsonb_typeof(p_respostas) <> 'array' then
    raise exception 'invalid_payload';
  end if;
  v_qtd := jsonb_array_length(p_respostas);
  if v_qtd <> cardinality(p_esperadas) then
    raise exception 'invalid_payload';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_respostas) e
     where jsonb_typeof(e) <> 'object'
        or coalesce(e->>'questao', '') !~ '^[0-9a-f-]{36}$'
        or coalesce(e->>'alternativa', '') !~ '^[0-9a-f-]{36}$'
  ) then
    raise exception 'invalid_payload';
  end if;
  if (select count(distinct (e->>'questao')::uuid) from jsonb_array_elements(p_respostas) e) <> v_qtd
     or exists (select 1 from jsonb_array_elements(p_respostas) e where not ((e->>'questao')::uuid = any (p_esperadas))) then
    raise exception 'invalid_payload';
  end if;
  -- Alternativa precisa ser da própria questão.
  if exists (
    select 1 from jsonb_array_elements(p_respostas) e
     where not exists (select 1 from public.questoes_alternativas a
                        where a.id = (e->>'alternativa')::uuid and a.questao_id = (e->>'questao')::uuid)
  ) then
    raise exception 'invalid_payload';
  end if;

  return query
    select e.n::integer, (e.v->>'questao')::uuid, (e.v->>'alternativa')::uuid, a.correta
      from jsonb_array_elements(p_respostas) with ordinality as e(v, n)
      join public.questoes_alternativas a on a.id = (e.v->>'alternativa')::uuid
     order by e.n;
end $$;

-- 4. Bloqueio de módulo na sala de aula ----------------------------------------

create or replace function public.academy__aula_liberada(p_uid uuid, p_aula uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select x.liberado
      from public.aulas a
      join public.modulos m on m.id = a.modulo_id
      cross join lateral public.academy__modulos_do_aluno(p_uid, m.curso_slug) x
     where a.id = p_aula and x.modulo_id = m.id
  ), false)
$$;

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
  v_fim    timestamptz;
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
  if not public.academy__aula_liberada(v_uid, p_aula_id) then
    raise exception 'modulo_bloqueado';
  end if;
  if p_posicao > v_aula.duracao_seg + 60 then
    raise exception 'invalid_payload';
  end if;

  insert into public.progresso_aulas (user_id, aula_id, posicao_seg, concluida_em, atualizado_em)
  values (v_uid, p_aula_id, p_posicao, case when p_concluida then now() end, now())
  on conflict (user_id, aula_id) do update
    set posicao_seg   = excluded.posicao_seg,
        concluida_em  = coalesce(public.progresso_aulas.concluida_em, excluded.concluida_em),
        atualizado_em = now()
  returning concluida_em into v_fim;

  insert into public.dias_estudo (user_id, dia) values (v_uid, v_hoje)
  on conflict do nothing;

  return json_build_object('status', 'ok', 'concluida', v_fim is not null);
end $$;

create or replace function public.academy_video_aula(p_aula_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_aula   public.aulas%rowtype;
  v_curso  text;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  if p_aula_id is null then
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
  if not public.academy__aula_liberada(v_uid, p_aula_id) then
    raise exception 'modulo_bloqueado';
  end if;
  if v_aula.video_ref is null then
    raise exception 'sem_video';
  end if;

  return json_build_object('provedor', v_aula.video_provedor, 'ref', v_aula.video_ref);
end $$;

-- 5. Questões de módulo --------------------------------------------------------

create or replace function public.academy_questoes_modulo(p_modulo_id uuid)
returns json
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_curso  text;
  v_uid    uuid;
  v_req    public.cursos_requisitos%rowtype;
  v_mod    record;
  v_ids    uuid[];
begin
  if p_modulo_id is null then
    raise exception 'invalid_payload';
  end if;
  select m.curso_slug into v_curso from public.modulos m where m.id = p_modulo_id;
  if v_curso is null then
    raise exception 'curso_indisponivel';
  end if;
  v_uid := public.academy__aluno_no_curso(v_curso);
  select * into v_req from public.cursos_requisitos where curso_slug = v_curso;

  select * into v_mod from public.academy__modulos_do_aluno(v_uid, v_curso) x where x.modulo_id = p_modulo_id;
  if not v_mod.liberado then
    raise exception 'modulo_bloqueado';
  end if;
  if not v_mod.tem_questoes then
    raise exception 'sem_questoes';
  end if;

  select array_agg(id) into v_ids from (
    select q.id from public.questoes q
     where q.modulo_id = p_modulo_id and public.academy__questao_valida(q.id)
     order by random()
     limit coalesce(v_req.questoes_modulo, 5)
  ) s;

  return json_build_object(
    'modulo_id', p_modulo_id,
    'nota_minima', coalesce(v_req.nota_minima_modulo, 70),
    'aprovado', v_mod.aprovado,
    'questoes', public.academy__questoes_para_aluno(v_ids)
  );
end $$;

create or replace function public.academy_responder_modulo(p_modulo_id uuid, p_respostas jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_curso     text;
  v_uid       uuid;
  v_req       public.cursos_requisitos%rowtype;
  v_mod       record;
  v_validas   integer;
  v_esperadas uuid[];
  v_acertos   integer;
  v_total     integer;
  v_nota      integer;
  v_minima    integer;
  v_aprovado  boolean;
begin
  if p_modulo_id is null then
    raise exception 'invalid_payload';
  end if;
  select m.curso_slug into v_curso from public.modulos m where m.id = p_modulo_id;
  if v_curso is null then
    raise exception 'curso_indisponivel';
  end if;
  v_uid := public.academy__aluno_no_curso(v_curso);
  select * into v_req from public.cursos_requisitos where curso_slug = v_curso;

  select * into v_mod from public.academy__modulos_do_aluno(v_uid, v_curso) x where x.modulo_id = p_modulo_id;
  if not v_mod.liberado then
    raise exception 'modulo_bloqueado';
  end if;
  if not v_mod.tem_questoes then
    raise exception 'sem_questoes';
  end if;
  -- Freio contra envio em massa: refazer na hora é permitido, robô não.
  if (select count(*) from public.tentativas_modulo t
       where t.user_id = v_uid and t.modulo_id = p_modulo_id and t.criado_em > now() - interval '10 minutes') >= 20 then
    raise exception 'muitas_tentativas';
  end if;

  -- O conjunto respondido tem de ter o tamanho do sorteio e sair do módulo.
  select count(*) into v_validas from public.questoes q
   where q.modulo_id = p_modulo_id and public.academy__questao_valida(q.id);
  if p_respostas is null or jsonb_typeof(p_respostas) <> 'array'
     or jsonb_array_length(p_respostas) <> least(v_validas, coalesce(v_req.questoes_modulo, 5)) then
    raise exception 'invalid_payload';
  end if;
  select array_agg(q.id) into v_esperadas from public.questoes q
   where q.modulo_id = p_modulo_id and public.academy__questao_valida(q.id)
     and q.id in (select (e->>'questao')::uuid from jsonb_array_elements(p_respostas) e
                   where coalesce(e->>'questao', '') ~ '^[0-9a-f-]{36}$');
  if coalesce(cardinality(v_esperadas), 0) <> jsonb_array_length(p_respostas) then
    raise exception 'invalid_payload';
  end if;

  select count(*) filter (where c.correta), count(*) into v_acertos, v_total
    from public.academy__corrigir(v_esperadas, p_respostas) c;
  v_nota := round(v_acertos * 100.0 / v_total);
  v_minima := coalesce(v_req.nota_minima_modulo, 70);
  v_aprovado := v_nota >= v_minima;

  insert into public.tentativas_modulo (user_id, modulo_id, acertos, total, nota, aprovado, respostas)
  values (v_uid, p_modulo_id, v_acertos, v_total, v_nota, v_aprovado, p_respostas);

  return json_build_object(
    'acertos', v_acertos,
    'total', v_total,
    'nota', v_nota,
    'nota_minima', v_minima,
    'aprovado', v_aprovado,
    'correcao', (
      select json_agg(json_build_object(
               'questao', c.questao_id,
               'escolhida', c.alternativa_id,
               'correta', c.correta,
               'alternativa_correta', (select a.id from public.questoes_alternativas a where a.questao_id = c.questao_id and a.correta),
               'explicacao', (select q.explicacao from public.questoes q where q.id = c.questao_id)
             ) order by c.posicao)
        from public.academy__corrigir(v_esperadas, p_respostas) c
    )
  );
end $$;

-- 6. Situação do curso para o aluno ---------------------------------------------

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

  select count(*) into v_banco from public.questoes q
   where q.curso_slug = p_curso and q.modulo_id is null and public.academy__questao_valida(q.id);
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
    when v_banco < v_req.questoes_final then 'sem_banco'
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
      'questoes_final', coalesce(v_req.questoes_final, 20),
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

-- 7. Avaliação final ----------------------------------------------------------

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
    select array_agg(id) into v_ids from (
      select q.id from public.questoes q
       where q.curso_slug = p_curso and q.modulo_id is null and public.academy__questao_valida(q.id)
       order by random()
       limit v_req.questoes_final
    ) s;
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

create or replace function public.academy_enviar_final(p_prova_id uuid, p_respostas jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_prova     public.provas_finais%rowtype;
  v_req       public.cursos_requisitos%rowtype;
  v_acertos   integer;
  v_total     integer;
  v_nota      integer;
  v_aprovado  boolean;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  if p_prova_id is null then
    raise exception 'invalid_payload';
  end if;
  select * into v_prova from public.provas_finais where id = p_prova_id and user_id = v_uid for update;
  if v_prova.id is null then
    raise exception 'prova_indisponivel';
  end if;
  if v_prova.enviada_em is not null then
    raise exception 'prova_ja_enviada';
  end if;
  perform public.academy__aluno_no_curso(v_prova.curso_slug);
  select * into v_req from public.cursos_requisitos where curso_slug = v_prova.curso_slug;

  select count(*) filter (where c.correta), count(*) into v_acertos, v_total
    from public.academy__corrigir(v_prova.questoes, p_respostas) c;
  v_nota := round(v_acertos * 100.0 / v_total);
  v_aprovado := v_nota >= coalesce(v_req.nota_minima_final, 80);

  update public.provas_finais
     set enviada_em = now(), acertos = v_acertos, total = v_total, nota = v_nota,
         aprovado = v_aprovado, respostas = p_respostas
   where id = v_prova.id;

  -- Só a nota: a correção questão a questão revelaria o banco da prova.
  return json_build_object(
    'acertos', v_acertos,
    'total', v_total,
    'nota', v_nota,
    'nota_minima', coalesce(v_req.nota_minima_final, 80),
    'aprovado', v_aprovado,
    'proxima_em', case when v_aprovado then null
                       else now() + make_interval(hours => coalesce(v_req.espera_final_horas, 24)) end
  );
end $$;

-- 8. Certificado --------------------------------------------------------------

create or replace function public.academy_emitir_certificado(p_curso text, p_nome text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid;
  v_sit     json;
  v_req     public.cursos_requisitos%rowtype;
  v_cert    public.certificados%rowtype;
  v_nome    text;
  v_codigo  text;
  v_hex     text;
  v_data    date;
  v_nota    integer;
  v_titulo  text;
begin
  v_uid := public.academy__aluno_no_curso(p_curso);

  select * into v_cert from public.certificados where user_id = v_uid and curso_slug = p_curso;
  if v_cert.codigo is null then
    v_sit := public.academy_situacao_curso(p_curso);
    if not (v_sit->'certificado'->>'elegivel')::boolean then
      raise exception 'nao_elegivel';
    end if;

    v_nome := regexp_replace(btrim(coalesce(p_nome, '')), '\s+', ' ', 'g');
    if length(v_nome) not between 2 and 120
       or v_nome !~ '^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' .-]*[A-Za-zÀ-ÖØ-öø-ÿ.]$' then
      raise exception 'nome_invalido';
    end if;

    select * into v_req from public.cursos_requisitos where curso_slug = p_curso;
    select c.titulo into v_titulo from public.cursos c where c.slug = p_curso;
    select (min(f.enviada_em) at time zone 'America/Sao_Paulo')::date, max(f.nota)
      into v_data, v_nota
      from public.provas_finais f
     where f.user_id = v_uid and f.curso_slug = p_curso and f.aprovado;

    -- 64 bits aleatórios (gen_random_uuid sem os dígitos fixos de versão).
    loop
      v_hex := upper(replace(gen_random_uuid()::text, '-', ''));
      v_hex := substr(v_hex, 1, 12) || substr(v_hex, 14, 4);
      v_codigo := 'CYD-' || substr(v_hex, 1, 4) || '-' || substr(v_hex, 5, 4) || '-' || substr(v_hex, 9, 4) || '-' || substr(v_hex, 13, 4);
      exit when not exists (select 1 from public.certificados where codigo = v_codigo);
    end loop;

    insert into public.certificados (codigo, user_id, curso_slug, nome, curso_titulo, carga_horaria_h, nota_final, concluido_em)
    values (v_codigo, v_uid, p_curso, v_nome, v_titulo, v_req.carga_horaria_h, v_nota, v_data)
    returning * into v_cert;
  end if;

  return json_build_object(
    'codigo', v_cert.codigo,
    'nome', v_cert.nome,
    'curso_titulo', v_cert.curso_titulo,
    'carga_horaria_h', v_cert.carga_horaria_h,
    'concluido_em', v_cert.concluido_em
  );
end $$;

-- Pública: só com o código. Código inexistente, malformado ou com a validação
-- desativada recebem a mesma resposta (null).
create or replace function public.academy_validar_certificado(p_codigo text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
           'codigo', c.codigo,
           'nome', c.nome,
           'curso', c.curso_titulo,
           'carga_horaria_h', c.carga_horaria_h,
           'concluido_em', c.concluido_em
         )
    from public.certificados c
   where c.codigo = upper(btrim(coalesce(p_codigo, '')))
     and c.validacao_publica
$$;

-- 9. Privilégios (padrão da 0012) -----------------------------------------------

revoke all on function public.academy__questao_valida(uuid) from public, anon, authenticated;
revoke all on function public.academy__modulos_do_aluno(uuid, text) from public, anon, authenticated;
revoke all on function public.academy__pendencias(uuid, text) from public, anon, authenticated;
revoke all on function public.academy__aluno_no_curso(text) from public, anon, authenticated;
revoke all on function public.academy__questoes_para_aluno(uuid[]) from public, anon, authenticated;
revoke all on function public.academy__corrigir(uuid[], jsonb) from public, anon, authenticated;
revoke all on function public.academy__aula_liberada(uuid, uuid) from public, anon, authenticated;
revoke all on function public.academy_questoes_modulo(uuid) from public, anon, authenticated;
revoke all on function public.academy_responder_modulo(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.academy_situacao_curso(text) from public, anon, authenticated;
revoke all on function public.academy_iniciar_final(text) from public, anon, authenticated;
revoke all on function public.academy_enviar_final(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.academy_emitir_certificado(text, text) from public, anon, authenticated;
revoke all on function public.academy_validar_certificado(text) from public, anon, authenticated;

grant execute on function public.academy_questoes_modulo(uuid),
                          public.academy_responder_modulo(uuid, jsonb),
                          public.academy_situacao_curso(text),
                          public.academy_iniciar_final(text),
                          public.academy_enviar_final(uuid, jsonb),
                          public.academy_emitir_certificado(text, text)
  to authenticated;

grant execute on function public.academy_validar_certificado(text) to anon, authenticated;

grant execute on function public.academy__questao_valida(uuid),
                          public.academy__modulos_do_aluno(uuid, text),
                          public.academy__pendencias(uuid, text),
                          public.academy__aluno_no_curso(text),
                          public.academy__questoes_para_aluno(uuid[]),
                          public.academy__corrigir(uuid[], jsonb),
                          public.academy__aula_liberada(uuid, uuid),
                          public.academy_questoes_modulo(uuid),
                          public.academy_responder_modulo(uuid, jsonb),
                          public.academy_situacao_curso(text),
                          public.academy_iniciar_final(text),
                          public.academy_enviar_final(uuid, jsonb),
                          public.academy_emitir_certificado(text, text),
                          public.academy_validar_certificado(text)
  to service_role;
