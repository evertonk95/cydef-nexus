-- ============================================================================
-- 0026_academy_missoes.sql - Missões de SOC (fase 15)
--
-- Missão é um caso prático no fim de um curso: o aluno examina evidências
-- (e-mail, cabeçalhos, logs, alerta), fixa as que provam o caso, responde a
-- investigação e recebe a correção com a explicação de cada pergunta.
-- Referência visual aprovada: prototipo-missao-soc-animado-v1.html (17/11/2026).
--
-- Regras:
--   * Cada missão pertence a um curso. Fica liberada com a matrícula ou, por
--     padrão, quando o aluno conclui todas as aulas publicadas do curso.
--   * O gabarito nunca sai antes do envio. A correção é feita no banco e
--     guardada com a tentativa (texto da pergunta, escolhas, explicação), para
--     que editar a missão depois não mude o histórico.
--   * Pode refazer. Aprovado com 80% ou mais (a mesma régua do certificado);
--     a missão aprovada dá o selo e soma nas competências.
--   * O tempo é medido no servidor, entre o início e o envio.
--   * A gestão das empresas (0024) não vê as missões.
--
-- Escrita só por funções. Idempotente.
-- ============================================================================

-- 1. Tabelas ----------------------------------------------------------------------

create table if not exists public.missoes (
  id             uuid primary key default gen_random_uuid(),
  curso_slug     text not null references public.cursos(slug) on delete restrict,
  codigo         text not null unique check (codigo ~ '^[A-Z]{2,5}-[0-9]{3}$'),
  slug           text generated always as (lower(codigo)) stored,
  titulo         text not null check (length(btrim(titulo)) between 3 and 80),
  severidade     text not null check (severidade in ('baixa', 'media', 'alta', 'critica')),
  mitre          text not null default '' check (length(mitre) <= 120),
  briefing       text not null check (length(btrim(briefing)) between 20 and 1200),
  requisito      text not null default 'aulas' check (requisito in ('aulas', 'matricula')),
  selo           text not null default '' check (length(selo) <= 60),
  encerramento   text not null default '' check (length(encerramento) <= 800),
  evidencias     jsonb not null default '[]'::jsonb check (jsonb_typeof(evidencias) = 'array'),
  perguntas      jsonb not null default '[]'::jsonb check (jsonb_typeof(perguntas) = 'array'),
  competencias   jsonb not null default '[]'::jsonb check (jsonb_typeof(competencias) = 'array'),
  ordem          integer not null default 1 check (ordem between 1 and 999),
  publicado      boolean not null default false,
  atualizado_em  timestamptz not null default now()
);
create unique index if not exists missoes_slug_idx on public.missoes (slug);
create index if not exists missoes_curso_idx on public.missoes (curso_slug, ordem);
comment on table public.missoes is 'Missões de SOC: caso prático com evidências e investigação. O gabarito (perguntas.corretas) só sai pelas funções, depois do envio.';

create table if not exists public.missao_tentativas (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.alunos(user_id) on delete cascade,
  missao_id             uuid not null references public.missoes(id) on delete cascade,
  iniciada_em           timestamptz not null default now(),
  enviada_em            timestamptz,
  respostas             jsonb,
  evidencias            text[] not null default '{}',
  acertos               integer,
  total                 integer,
  nota                  integer check (nota is null or nota between 0 and 100),
  aprovado              boolean,
  duracao_seg           integer,
  correcao              jsonb,
  competencias_antes    jsonb,
  competencias_depois   jsonb
);
create unique index if not exists missao_tentativas_aberta_idx on public.missao_tentativas (user_id, missao_id) where enviada_em is null;
create index if not exists missao_tentativas_aluno_idx on public.missao_tentativas (user_id, missao_id, enviada_em desc);

alter table public.missoes           enable row level security;
alter table public.missao_tentativas enable row level security;
revoke all on table public.missoes, public.missao_tentativas from anon, authenticated, service_role;

-- 2. Funções internas -------------------------------------------------------------

-- 'liberada', 'sem_matricula' ou 'aulas_pendentes', com o progresso no curso.
create or replace function public.academy__missao_situacao(p_user uuid, m public.missoes)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total  integer;
  v_feitas integer;
begin
  if p_user is null or not exists (select 1 from public.matriculas mt where mt.user_id = p_user and mt.curso_slug = m.curso_slug) then
    return json_build_object('situacao', 'sem_matricula', 'aulas_total', 0, 'aulas_concluidas', 0);
  end if;
  select count(*) into v_total
    from public.aulas a join public.modulos mo on mo.id = a.modulo_id
   where mo.curso_slug = m.curso_slug and a.publicado;
  select count(*) into v_feitas
    from public.aulas a join public.modulos mo on mo.id = a.modulo_id
    join public.progresso_aulas p on p.aula_id = a.id and p.user_id = p_user and p.concluida_em is not null
   where mo.curso_slug = m.curso_slug and a.publicado;
  return json_build_object(
    'situacao', case when m.requisito = 'matricula' or (v_total > 0 and v_feitas >= v_total) then 'liberada' else 'aulas_pendentes' end,
    'aulas_total', v_total, 'aulas_concluidas', v_feitas);
end $$;

-- Competências do aluno: aulas concluídas e missões aprovadas, pelo peso.
create or replace function public.academy__competencias(p_user uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with pesos as (
    select ak.competencia_slug as slug, ak.peso,
           exists (select 1 from public.progresso_aulas p where p.user_id = p_user and p.aula_id = a.id and p.concluida_em is not null) as feito
      from public.aula_competencias ak
      join public.aulas a on a.id = ak.aula_id and a.publicado
      join public.modulos mo on mo.id = a.modulo_id
      join public.cursos c on c.slug = mo.curso_slug and c.publicado
    union all
    select x->>'slug', (x->>'peso')::integer,
           exists (select 1 from public.missao_tentativas t where t.user_id = p_user and t.missao_id = m.id and t.aprovado)
      from public.missoes m
      join public.cursos c on c.slug = m.curso_slug and c.publicado
      cross join lateral jsonb_array_elements(m.competencias) x
     where m.publicado
  ),
  comp as (
    select co.slug, co.titulo, co.ordem,
           coalesce(sum(p.peso), 0) as total,
           coalesce(sum(p.peso) filter (where p.feito), 0) as feito
      from public.competencias co left join pesos p on p.slug = co.slug
     group by co.slug, co.titulo, co.ordem
  )
  select coalesce(json_agg(json_build_object(
           'slug', c.slug, 'titulo', c.titulo,
           'percentual', case when c.total = 0 then 0 else round(c.feito * 100.0 / c.total) end) order by c.ordem), '[]'::json)
    from comp c where c.total > 0
$$;

-- O que o aluno vê da missão (sem o gabarito).
create or replace function public.academy__missao_aluno(m public.missoes)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', m.id, 'codigo', m.codigo, 'slug', m.slug, 'titulo', m.titulo, 'severidade', m.severidade, 'mitre', m.mitre,
    'briefing', m.briefing, 'selo', m.selo, 'requisito', m.requisito,
    'curso', m.curso_slug, 'curso_titulo', (select c.titulo from public.cursos c where c.slug = m.curso_slug),
    'perguntas_total', jsonb_array_length(m.perguntas),
    'competencias', coalesce((select json_agg(json_build_object('slug', co.slug, 'titulo', co.titulo) order by co.ordem)
                                from public.competencias co
                               where co.slug in (select x->>'slug' from jsonb_array_elements(m.competencias) x)), '[]'::json)
  )
$$;

create or replace function public.academy__tentativa_json(t public.missao_tentativas, m public.missoes)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', t.id, 'enviada_em', t.enviada_em, 'acertos', t.acertos, 'total', t.total, 'nota', t.nota,
    'aprovado', t.aprovado, 'duracao_seg', t.duracao_seg, 'evidencias', to_json(t.evidencias),
    'correcao', t.correcao, 'encerramento', m.encerramento,
    'competencias', coalesce((
      select json_agg(json_build_object('slug', d->>'slug', 'titulo', d->>'titulo',
                                        'antes', coalesce((select (a->>'percentual')::int from jsonb_array_elements(t.competencias_antes) a where a->>'slug' = d->>'slug'), 0),
                                        'depois', (d->>'percentual')::int))
        from jsonb_array_elements(t.competencias_depois) d
       where d->>'slug' in (select x->>'slug' from jsonb_array_elements(m.competencias) x)
    ), '[]'::json)
  )
$$;

-- 3. Aluno ------------------------------------------------------------------------

create or replace function public.academy_minhas_competencias()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'nao_autenticado';
  end if;
  return public.academy__competencias(auth.uid());
end $$;

-- Missões publicadas dos cursos em que o aluno está matriculado.
create or replace function public.academy_minhas_missoes()
returns json
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
  return coalesce((
    select json_agg((public.academy__missao_aluno(m)::jsonb || jsonb_build_object(
             'situacao', s->>'situacao', 'aulas_total', (s->>'aulas_total')::int, 'aulas_concluidas', (s->>'aulas_concluidas')::int,
             'melhor_nota', (select max(t.nota) from public.missao_tentativas t where t.user_id = v_uid and t.missao_id = m.id),
             'aprovada', exists (select 1 from public.missao_tentativas t where t.user_id = v_uid and t.missao_id = m.id and t.aprovado),
             'tentativas', (select count(*) from public.missao_tentativas t where t.user_id = v_uid and t.missao_id = m.id and t.enviada_em is not null)
           )) order by c.ordem, m.ordem, m.codigo)
      from public.missoes m
      join public.cursos c on c.slug = m.curso_slug and c.publicado
      join public.matriculas mt on mt.curso_slug = m.curso_slug and mt.user_id = v_uid
      cross join lateral (select public.academy__missao_situacao(v_uid, m)::jsonb as s) x
     where m.publicado
  ), '[]'::json);
end $$;

-- Próxima missão do painel: a primeira liberada e ainda não aprovada; senão, a primeira bloqueada.
create or replace function public.academy_minha_proxima_missao()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select j from (
    select x::json as j,
           case when x->>'situacao' = 'liberada' then 0 else 1 end as p, ord
      from jsonb_array_elements(coalesce(public.academy_minhas_missoes()::jsonb, '[]'::jsonb)) with ordinality as e(x, ord)
     where not (x->>'aprovada')::boolean
  ) z
  order by p, ord
  limit 1
$$;

create or replace function public.academy__missao_por_slug(p_slug text)
returns public.missoes
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_m public.missoes%rowtype;
begin
  select m.* into v_m from public.missoes m join public.cursos c on c.slug = m.curso_slug and c.publicado
   where m.slug = lower(coalesce(p_slug, '')) and m.publicado;
  if v_m.id is null then
    raise exception 'missao_inexistente';
  end if;
  return v_m;
end $$;

-- A missão para a tela: sem evidências e perguntas enquanto estiver bloqueada.
create or replace function public.academy_missao(p_slug text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_m    public.missoes%rowtype;
  v_s    json;
  v_t    public.missao_tentativas%rowtype;
  v_ab   public.missao_tentativas%rowtype;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  v_m := public.academy__missao_por_slug(p_slug);
  if not exists (select 1 from public.matriculas mt where mt.user_id = v_uid and mt.curso_slug = v_m.curso_slug) then
    raise exception 'missao_inexistente';
  end if;
  v_s := public.academy__missao_situacao(v_uid, v_m);
  select * into v_t from public.missao_tentativas
   where user_id = v_uid and missao_id = v_m.id and enviada_em is not null order by enviada_em desc limit 1;
  select * into v_ab from public.missao_tentativas
   where user_id = v_uid and missao_id = v_m.id and enviada_em is null;
  return (public.academy__missao_aluno(v_m)::jsonb || jsonb_build_object(
    'situacao', v_s->>'situacao', 'aulas_total', (v_s->>'aulas_total')::int, 'aulas_concluidas', (v_s->>'aulas_concluidas')::int,
    'encerramento', case when v_t.id is not null then v_m.encerramento else '' end,
    'evidencias', case when v_s->>'situacao' = 'liberada' then v_m.evidencias else '[]'::jsonb end,
    'perguntas', case when v_s->>'situacao' = 'liberada' then coalesce((
        select jsonb_agg(jsonb_build_object('id', q->>'id', 'enunciado', q->>'enunciado', 'dica', q->>'dica',
                                            'alternativas', q->'alternativas', 'multipla', jsonb_array_length(q->'corretas') > 1) order by o)
          from jsonb_array_elements(v_m.perguntas) with ordinality as e(q, o)), '[]'::jsonb) else '[]'::jsonb end,
    'aberta', case when v_ab.id is null then null else jsonb_build_object('iniciada_em', v_ab.iniciada_em) end,
    'aprovada', exists (select 1 from public.missao_tentativas t where t.user_id = v_uid and t.missao_id = v_m.id and t.aprovado),
    'melhor_nota', (select max(t.nota) from public.missao_tentativas t where t.user_id = v_uid and t.missao_id = v_m.id),
    'ultima', case when v_t.id is null then null else public.academy__tentativa_json(v_t, v_m)::jsonb end
  ))::json;
end $$;

create or replace function public.academy_iniciar_missao(p_slug text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_m    public.missoes%rowtype;
  v_t    public.missao_tentativas%rowtype;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  v_m := public.academy__missao_por_slug(p_slug);
  if public.academy__missao_situacao(v_uid, v_m)->>'situacao' <> 'liberada' then
    raise exception 'missao_bloqueada';
  end if;
  select * into v_t from public.missao_tentativas where user_id = v_uid and missao_id = v_m.id and enviada_em is null;
  if v_t.id is null then
    insert into public.missao_tentativas (user_id, missao_id) values (v_uid, v_m.id) returning * into v_t;
  end if;
  return json_build_object('iniciada_em', v_t.iniciada_em);
end $$;

-- p_respostas: { "<id da pergunta>": [índices escolhidos] }. p_evidencias: até 30 textos curtos.
create or replace function public.academy_enviar_missao(p_slug text, p_respostas jsonb, p_evidencias text[])
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_m         public.missoes%rowtype;
  v_t         public.missao_tentativas%rowtype;
  v_correcao  jsonb;
  v_acertos   integer;
  v_total     integer;
  v_nota      integer;
  v_antes     jsonb;
  v_evid      text[];
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  v_m := public.academy__missao_por_slug(p_slug);
  select * into v_t from public.missao_tentativas where user_id = v_uid and missao_id = v_m.id and enviada_em is null for update;
  if v_t.id is null then
    raise exception 'missao_nao_iniciada';
  end if;
  if p_respostas is null or jsonb_typeof(p_respostas) <> 'object' or length(p_respostas::text) > 8000 then
    raise exception 'invalid_payload';
  end if;
  select coalesce(array_agg(left(btrim(e), 160) order by o), '{}') into v_evid
    from unnest(coalesce(p_evidencias, '{}')) with ordinality as u(e, o)
   where btrim(e) <> '' and o <= 30;

  -- Correção, pergunta por pergunta, com o texto do momento.
  select jsonb_agg(jsonb_build_object(
           'id', q->>'id', 'enunciado', q->>'enunciado', 'alternativas', q->'alternativas',
           'escolhidas', to_jsonb(esc), 'corretas', q->'corretas', 'explicacao', q->>'explicacao',
           'acertou', esc = cor) order by o),
         count(*) filter (where esc = cor), count(*)
    into v_correcao, v_acertos, v_total
    from jsonb_array_elements(v_m.perguntas) with ordinality as e(q, o)
    cross join lateral (
      select coalesce(array_agg(distinct (x)::int order by (x)::int), '{}') as esc
        from jsonb_array_elements_text(case when jsonb_typeof(p_respostas->(q->>'id')) = 'array' then p_respostas->(q->>'id') else '[]'::jsonb end) x
       where x ~ '^[0-9]{1,2}$' and (x)::int < jsonb_array_length(q->'alternativas')
    ) a
    cross join lateral (
      select coalesce(array_agg((y)::int order by (y)::int), '{}') as cor from jsonb_array_elements_text(q->'corretas') y
    ) b;
  v_total := coalesce(v_total, 0);
  v_nota := case when v_total = 0 then 0 else round(v_acertos * 100.0 / v_total) end;
  v_antes := public.academy__competencias(v_uid)::jsonb;

  update public.missao_tentativas
     set enviada_em = now(), respostas = p_respostas, evidencias = v_evid, acertos = v_acertos, total = v_total,
         nota = v_nota, aprovado = v_nota >= 80, correcao = coalesce(v_correcao, '[]'::jsonb),
         duracao_seg = least(greatest(extract(epoch from now() - iniciada_em)::int, 0), 86400),
         competencias_antes = v_antes
   where id = v_t.id;
  update public.missao_tentativas set competencias_depois = public.academy__competencias(v_uid)::jsonb
   where id = v_t.id returning * into v_t;
  return public.academy__tentativa_json(v_t, v_m);
end $$;

-- 4. Painel (mesma assinatura da 0008): competências com as missões e a próxima missão.
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
    'competencias', public.academy_minhas_competencias(),
    'missao', public.academy_minha_proxima_missao(),
    'dias_estudo', coalesce((select json_agg(d.dia order by d.dia) from dias d), '[]'::json),
    'hoje', (now() at time zone 'America/Sao_Paulo')::date
  ) end
$$;

-- 5. Instrutor --------------------------------------------------------------------

create or replace function public.academy__missao_validar(p jsonb)
returns void
language plpgsql
immutable
as $$
declare
  e     jsonb;
  q     jsonb;
  c     jsonb;
  l     jsonb;
  v_ids text[] := '{}';
  v_n   integer;
begin
  if jsonb_typeof(coalesce(p->'evidencias', 'null')) <> 'array' or jsonb_array_length(p->'evidencias') > 8 then
    raise exception 'evidencias_invalidas';
  end if;
  for e in select * from jsonb_array_elements(p->'evidencias') loop
    if coalesce(e->>'id', '') !~ '^[a-z0-9-]{1,40}$' or e->>'id' = any(v_ids)
       or length(btrim(coalesce(e->>'titulo', ''))) not between 2 and 40
       or length(coalesce(e->>'dica', '')) > 300
       or jsonb_typeof(coalesce(e->'conteudo', 'null')) <> 'object' then
      raise exception 'evidencias_invalidas';
    end if;
    v_ids := v_ids || (e->>'id');
    c := e->'conteudo';
    case e->>'tipo'
      when 'email' then
        if length(coalesce(c->>'de', '')) not between 1 and 200 or length(coalesce(c->>'para', '')) > 200
           or length(coalesce(c->>'assunto', '')) not between 1 and 200 or length(coalesce(c->>'corpo', '')) not between 1 and 4000
           or length(coalesce(c->>'link_texto', '')) > 60 or length(coalesce(c->>'link_destino', '')) > 300
           or length(coalesce(c->>'assinatura', '')) > 120 then
          raise exception 'evidencias_invalidas';
        end if;
      when 'cabecalhos' then
        if jsonb_typeof(coalesce(c->'linhas', 'null')) <> 'array' or jsonb_array_length(c->'linhas') not between 1 and 60 then
          raise exception 'evidencias_invalidas';
        end if;
        for l in select * from jsonb_array_elements(c->'linhas') loop
          if length(coalesce(l->>'campo', '')) > 80 or length(coalesce(l->>'valor', '')) not between 1 and 500 then
            raise exception 'evidencias_invalidas';
          end if;
        end loop;
      when 'tabela' then
        if jsonb_typeof(coalesce(c->'colunas', 'null')) <> 'array' or jsonb_array_length(c->'colunas') not between 1 and 10
           or jsonb_typeof(coalesce(c->'linhas', 'null')) <> 'array' or jsonb_array_length(c->'linhas') not between 1 and 200 then
          raise exception 'evidencias_invalidas';
        end if;
        v_n := jsonb_array_length(c->'colunas');
        if exists (select 1 from jsonb_array_elements_text(c->'colunas') x where length(btrim(x)) not between 1 and 40) then
          raise exception 'evidencias_invalidas';
        end if;
        for l in select * from jsonb_array_elements(c->'linhas') loop
          if jsonb_typeof(l) <> 'array' or jsonb_array_length(l) <> v_n
             or exists (select 1 from jsonb_array_elements(l) x where jsonb_typeof(x) <> 'string' or length(x #>> '{}') > 300) then
            raise exception 'evidencias_invalidas';
          end if;
        end loop;
      when 'alerta' then
        if length(coalesce(c->>'titulo', '')) not between 1 and 60 or length(coalesce(c->>'subtitulo', '')) > 120
           or jsonb_typeof(coalesce(c->'linhas', 'null')) <> 'array' or jsonb_array_length(c->'linhas') not between 1 and 40 then
          raise exception 'evidencias_invalidas';
        end if;
        for l in select * from jsonb_array_elements(c->'linhas') loop
          if length(coalesce(l->>'campo', '')) not between 1 and 60 or length(coalesce(l->>'valor', '')) not between 1 and 300 then
            raise exception 'evidencias_invalidas';
          end if;
        end loop;
      when 'texto' then
        if length(coalesce(c->>'texto', '')) not between 1 and 4000 then
          raise exception 'evidencias_invalidas';
        end if;
      else
        raise exception 'evidencias_invalidas';
    end case;
  end loop;

  v_ids := '{}';
  if jsonb_typeof(coalesce(p->'perguntas', 'null')) <> 'array' or jsonb_array_length(p->'perguntas') > 15 then
    raise exception 'perguntas_invalidas';
  end if;
  for q in select * from jsonb_array_elements(p->'perguntas') loop
    if coalesce(q->>'id', '') !~ '^[a-z0-9-]{1,40}$' or q->>'id' = any(v_ids)
       or length(btrim(coalesce(q->>'enunciado', ''))) not between 5 and 300
       or length(coalesce(q->>'dica', '')) > 200
       or length(btrim(coalesce(q->>'explicacao', ''))) not between 5 and 800
       or jsonb_typeof(coalesce(q->'alternativas', 'null')) <> 'array' or jsonb_array_length(q->'alternativas') not between 2 and 8
       or jsonb_typeof(coalesce(q->'corretas', 'null')) <> 'array' or jsonb_array_length(q->'corretas') < 1 then
      raise exception 'perguntas_invalidas';
    end if;
    v_ids := v_ids || (q->>'id');
    if exists (select 1 from jsonb_array_elements(q->'alternativas') x where jsonb_typeof(x) <> 'string' or length(btrim(x #>> '{}')) not between 1 and 200) then
      raise exception 'perguntas_invalidas';
    end if;
    if exists (select 1 from jsonb_array_elements(q->'corretas') x
                where jsonb_typeof(x) <> 'number' or (x #>> '{}') !~ '^[0-9]+$' or (x #>> '{}')::int >= jsonb_array_length(q->'alternativas'))
       or (select count(distinct x) from jsonb_array_elements(q->'corretas') x) <> jsonb_array_length(q->'corretas') then
      raise exception 'perguntas_invalidas';
    end if;
  end loop;

  if jsonb_typeof(coalesce(p->'competencias', 'null')) <> 'array' or jsonb_array_length(p->'competencias') > 6
     or exists (select 1 from jsonb_array_elements(p->'competencias') x
                 where coalesce(x->>'slug', '') !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or coalesce(x->>'peso', '') !~ '^([1-9]|10)$')
     or (select count(distinct x->>'slug') from jsonb_array_elements(p->'competencias') x) <> jsonb_array_length(p->'competencias') then
    raise exception 'competencias_invalidas';
  end if;
end $$;

create or replace function public.academy__missao_adm_json(m public.missoes)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', m.id, 'curso', m.curso_slug, 'codigo', m.codigo, 'slug', m.slug, 'titulo', m.titulo, 'severidade', m.severidade,
    'mitre', m.mitre, 'briefing', m.briefing, 'requisito', m.requisito, 'selo', m.selo, 'encerramento', m.encerramento,
    'evidencias', m.evidencias, 'perguntas', m.perguntas, 'competencias', m.competencias, 'ordem', m.ordem,
    'publicado', m.publicado, 'atualizado_em', m.atualizado_em,
    'tentativas', (select count(*) from public.missao_tentativas t where t.missao_id = m.id and t.enviada_em is not null),
    'aprovados', (select count(distinct t.user_id) from public.missao_tentativas t where t.missao_id = m.id and t.aprovado)
  )
$$;

create or replace function public.academy_adm_missoes(p_curso text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_curso(p_curso);
  return json_build_object(
    'missoes', coalesce((select json_agg(public.academy__missao_adm_json(m) order by m.ordem, m.codigo)
                           from public.missoes m where m.curso_slug = p_curso), '[]'::json),
    'competencias', coalesce((select json_agg(json_build_object('slug', c.slug, 'titulo', c.titulo) order by c.ordem)
                                from public.competencias c), '[]'::json)
  );
end $$;

-- p_dados: { id?, codigo, titulo, severidade, mitre, briefing, requisito, selo, encerramento, ordem,
--            evidencias[], perguntas[], competencias[], publicado }
create or replace function public.academy_adm_salvar_missao(p_curso text, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id      uuid := nullif(p_dados->>'id', '')::uuid;
  v_codigo  text := upper(btrim(coalesce(p_dados->>'codigo', '')));
  v_antes   public.missoes%rowtype;
  v_m       public.missoes%rowtype;
  v_pub     boolean := coalesce((p_dados->>'publicado')::boolean, false);
begin
  perform public.academy__exigir_curso(p_curso);
  if v_codigo !~ '^[A-Z]{2,5}-[0-9]{3}$' then
    raise exception 'codigo_invalido';
  end if;
  if length(btrim(coalesce(p_dados->>'titulo', ''))) not between 3 and 80 then
    raise exception 'titulo_invalido';
  end if;
  if coalesce(p_dados->>'severidade', '') not in ('baixa', 'media', 'alta', 'critica') then
    raise exception 'severidade_invalida';
  end if;
  if length(btrim(coalesce(p_dados->>'briefing', ''))) not between 20 and 1200 then
    raise exception 'briefing_invalido';
  end if;
  if coalesce(p_dados->>'requisito', 'aulas') not in ('aulas', 'matricula') then
    raise exception 'requisito_invalido';
  end if;
  if length(coalesce(p_dados->>'mitre', '')) > 120 or length(coalesce(p_dados->>'selo', '')) > 60
     or length(coalesce(p_dados->>'encerramento', '')) > 800 then
    raise exception 'texto_longo';
  end if;
  perform public.academy__missao_validar(p_dados);
  if exists (select 1 from jsonb_array_elements(p_dados->'competencias') x
              where not exists (select 1 from public.competencias c where c.slug = x->>'slug')) then
    raise exception 'competencias_invalidas';
  end if;
  if v_pub and (jsonb_array_length(p_dados->'evidencias') = 0 or jsonb_array_length(p_dados->'perguntas') = 0) then
    raise exception 'missao_incompleta';
  end if;
  if exists (select 1 from public.missoes m where m.codigo = v_codigo and m.id is distinct from v_id) then
    raise exception 'codigo_em_uso';
  end if;

  if v_id is null then
    insert into public.missoes (curso_slug, codigo, titulo, severidade, mitre, briefing, requisito, selo, encerramento,
                                evidencias, perguntas, competencias, ordem, publicado)
    values (p_curso, v_codigo, btrim(p_dados->>'titulo'), p_dados->>'severidade', btrim(coalesce(p_dados->>'mitre', '')),
            btrim(p_dados->>'briefing'), coalesce(p_dados->>'requisito', 'aulas'), btrim(coalesce(p_dados->>'selo', '')),
            btrim(coalesce(p_dados->>'encerramento', '')), p_dados->'evidencias', p_dados->'perguntas', p_dados->'competencias',
            coalesce((p_dados->>'ordem')::integer, 1), v_pub)
    returning * into v_m;
    perform public.academy__auditar('missao_criada', v_m.id::text, jsonb_build_object('curso', p_curso, 'codigo', v_codigo));
  else
    select * into v_antes from public.missoes where id = v_id;
    if v_antes.id is null or v_antes.curso_slug <> p_curso then
      raise exception 'missao_inexistente';
    end if;
    update public.missoes
       set codigo = v_codigo, titulo = btrim(p_dados->>'titulo'), severidade = p_dados->>'severidade',
           mitre = btrim(coalesce(p_dados->>'mitre', '')), briefing = btrim(p_dados->>'briefing'),
           requisito = coalesce(p_dados->>'requisito', 'aulas'), selo = btrim(coalesce(p_dados->>'selo', '')),
           encerramento = btrim(coalesce(p_dados->>'encerramento', '')), evidencias = p_dados->'evidencias',
           perguntas = p_dados->'perguntas', competencias = p_dados->'competencias',
           ordem = coalesce((p_dados->>'ordem')::integer, v_antes.ordem), publicado = v_pub, atualizado_em = now()
     where id = v_id
    returning * into v_m;
    perform public.academy__auditar('missao_alterada', v_id::text,
      jsonb_build_object('codigo', v_codigo, 'publicado', v_pub, 'publicado_antes', v_antes.publicado));
  end if;
  return public.academy_adm_missoes(p_curso);
exception
  when invalid_text_representation or numeric_value_out_of_range then
    raise exception 'invalid_payload';
end $$;

create or replace function public.academy_adm_excluir_missao(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_m public.missoes%rowtype;
begin
  select * into v_m from public.missoes where id = p_id;
  if v_m.id is null then
    raise exception 'missao_inexistente';
  end if;
  perform public.academy__exigir_curso(v_m.curso_slug);
  if exists (select 1 from public.missao_tentativas t where t.missao_id = p_id) then
    raise exception 'missao_com_tentativas';
  end if;
  delete from public.missoes where id = p_id;
  perform public.academy__auditar('missao_excluida', p_id::text, jsonb_build_object('codigo', v_m.codigo));
  return public.academy_adm_missoes(v_m.curso_slug);
end $$;

-- 6. Primeira missão (do protótipo aprovado), sem publicar -------------------------

insert into public.missoes (curso_slug, codigo, titulo, severidade, mitre, briefing, requisito, selo, encerramento,
                            evidencias, perguntas, competencias, ordem, publicado)
select 'fundamentos-para-soc', 'MSN-001', 'Triagem de phishing', 'alta', 'MITRE ATT&CK T1566.002 · Phishing com link',
       'Segunda-feira, 09:31. Uma colaboradora do financeiro reportou um e-mail de cobrança suspeito. Você é o analista N1 de plantão: examine as evidências, descubra se alguém caiu no golpe e decida o que fazer.',
       'aulas', 'Caçador de phishing',
       'O caso real ainda pediria abrir um incidente, avisar o gestor do m.souza e procurar outros destinatários do mesmo e-mail. Isso vem na trilha de Resposta.',
       j->'evidencias', j->'perguntas', j->'competencias', 1, false
  from (select $seed${"evidencias": [{"id": "email", "tipo": "email", "titulo": "E-mail reportado", "dica": "Passe o mouse sobre o botão para ver para onde ele leva. O nome exibido no remetente não prova de onde o e-mail veio.", "conteudo": {"de": "Financeiro Nortec <financeiro@nortec.example>", "para": "ana.ribeiro@nortec.example", "assunto": "Boleto em atraso: regularize hoje para evitar protesto", "corpo": "Prezada colaboradora,\n\nIdentificamos um boleto em aberto vinculado ao seu centro de custo. Para evitar o protesto, acesse o documento e confirme seus dados ainda hoje.", "link_texto": "Visualizar boleto", "link_destino": "https://nortec-fin.example/boleto/8841", "assinatura": "Equipe Financeira"}}, {"id": "cabecalhos", "tipo": "cabecalhos", "titulo": "Cabeçalhos", "dica": "", "conteudo": {"linhas": [{"campo": "Return-Path:", "valor": "<bounce@mail.nortec-fin.example>", "destaque": false}, {"campo": "Received:", "valor": "from mail.nortec-fin.example ([203.0.113.45])", "destaque": false}, {"campo": "", "valor": "by mx1.nortec.example; Mon, 16 Nov 2026 09:02:17 -0300", "destaque": false}, {"campo": "Authentication-Results:", "valor": "mx1.nortec.example;", "destaque": false}, {"campo": "", "valor": "spf=fail (nortec.example does not designate 203.0.113.45)", "destaque": true}, {"campo": "", "valor": "dkim=none;", "destaque": true}, {"campo": "", "valor": "dmarc=fail header.from=nortec.example", "destaque": true}, {"campo": "From:", "valor": "\"Financeiro Nortec\" <financeiro@nortec.example>", "destaque": false}, {"campo": "Reply-To:", "valor": "pagamentos@nortec-fin.example", "destaque": false}, {"campo": "Subject:", "valor": "Boleto em atraso: regularize hoje para evitar protesto", "destaque": false}]}}, {"id": "proxy", "tipo": "tabela", "titulo": "Logs do proxy", "dica": "A Ana reportou o e-mail às 09:29 e não clicou. Veja se mais alguém recebeu e acessou o link.", "conteudo": {"colunas": ["Hora", "Usuário", "Origem", "Método", "URL", "Ação"], "linhas": [["09:12:04", "a.lima", "10.0.4.21", "GET", "intranet.nortec.example/", "ALLOWED"], ["09:14:37", "m.souza", "10.0.4.33", "GET", "nortec-fin.example/boleto/8841", "ALLOWED"], ["09:15:02", "m.souza", "10.0.4.33", "POST", "nortec-fin.example/login.php", "ALLOWED"], ["09:20:11", "r.costa", "10.0.4.40", "GET", "cdn.office.example/app.js", "ALLOWED"], ["09:28:45", "ana.ribeiro", "10.0.4.18", "GET", "intranet.nortec.example/chamados", "ALLOWED"]]}}, {"id": "wazuh", "tipo": "alerta", "titulo": "Alerta do Wazuh", "dica": "Regra criada pelo time da Nortec. Domínios muito novos são comuns em campanhas de phishing.", "conteudo": {"titulo": "NÍVEL 10", "subtitulo": "regra 100210 · personalizada", "linhas": [{"campo": "descrição", "valor": "Acesso a domínio registrado há menos de 7 dias"}, {"campo": "data", "valor": "16/11/2026 09:14:37"}, {"campo": "agente", "valor": "proxy-01"}, {"campo": "usuário", "valor": "m.souza"}, {"campo": "destino", "valor": "nortec-fin.example"}, {"campo": "idade do domínio", "valor": "2 dias"}]}}], "perguntas": [{"id": "dominio", "enunciado": "De qual domínio o e-mail veio de verdade?", "dica": "Compare o remetente exibido com os cabeçalhos.", "alternativas": ["nortec.example", "nortec-fin.example", "office.example"], "corretas": [1], "explicacao": "O From mostra nortec.example, mas o Return-Path, o servidor de origem e o Reply-To são de nortec-fin.example, um domínio parecido criado pelo atacante."}, {"id": "autenticacao", "enunciado": "O que a autenticação do e-mail mostra?", "dica": "Veja a linha Authentication-Results.", "alternativas": ["SPF, DKIM e DMARC passaram", "SPF falhou, não há DKIM e o DMARC falhou", "Só o DKIM falhou"], "corretas": [1], "explicacao": "O SPF falhou porque o IP 203.0.113.45 não está autorizado para nortec.example, não existe assinatura DKIM e, por isso, o DMARC também falhou."}, {"id": "usuario", "enunciado": "Quem acessou o link e enviou dados?", "dica": "Fixe nos logs do proxy a linha que prova isso.", "alternativas": ["a.lima", "m.souza", "r.costa", "Ninguém acessou"], "corretas": [1], "explicacao": "m.souza abriu o boleto às 09:14:37 e fez um POST em login.php às 09:15:02. O POST indica que credenciais foram enviadas."}, {"id": "classificacao", "enunciado": "Como você classifica o caso?", "dica": "", "alternativas": ["Falso positivo", "Verdadeiro positivo", "Benigno, apenas spam"], "corretas": [1], "explicacao": "É um verdadeiro positivo: phishing real, com acesso confirmado e provável roubo de credenciais."}, {"id": "acoes", "enunciado": "Quais ações você toma agora?", "dica": "Marque todas as que se aplicam.", "alternativas": ["Bloquear nortec-fin.example no proxy e no e-mail", "Redefinir a senha do m.souza e encerrar as sessões dele", "Remover o e-mail das caixas de quem o recebeu", "Desligar o servidor de e-mail", "Encerrar o caso, porque a Ana não clicou"], "corretas": [0, 1, 2], "explicacao": "Bloquear o domínio, conter a conta comprometida e remover o e-mail são as ações imediatas. Desligar o servidor de e-mail interrompe a empresa inteira sem necessidade."}], "competencias": [{"slug": "triagem-alertas", "peso": 3}, {"slug": "analise-logs", "peso": 2}, {"slug": "mitre-attack", "peso": 1}]}$seed$::jsonb as j) s
 where exists (select 1 from public.cursos c where c.slug = 'fundamentos-para-soc')
on conflict (codigo) do nothing;

-- 7. Privilégios (padrão da 0012) ----------------------------------------------------

revoke all on function
  public.academy__missao_situacao(uuid, public.missoes),
  public.academy__competencias(uuid),
  public.academy__missao_aluno(public.missoes),
  public.academy__tentativa_json(public.missao_tentativas, public.missoes),
  public.academy_minhas_competencias(),
  public.academy_minhas_missoes(),
  public.academy_minha_proxima_missao(),
  public.academy__missao_por_slug(text),
  public.academy_missao(text),
  public.academy_iniciar_missao(text),
  public.academy_enviar_missao(text, jsonb, text[]),
  public.academy_meu_painel(),
  public.academy__missao_validar(jsonb),
  public.academy__missao_adm_json(public.missoes),
  public.academy_adm_missoes(text),
  public.academy_adm_salvar_missao(text, jsonb),
  public.academy_adm_excluir_missao(uuid)
from public, anon, authenticated;

grant execute on function
  public.academy_minhas_competencias(),
  public.academy_minhas_missoes(),
  public.academy_minha_proxima_missao(),
  public.academy_missao(text),
  public.academy_iniciar_missao(text),
  public.academy_enviar_missao(text, jsonb, text[]),
  public.academy_meu_painel(),
  public.academy_adm_missoes(text),
  public.academy_adm_salvar_missao(text, jsonb),
  public.academy_adm_excluir_missao(uuid)
to authenticated;

grant execute on function
  public.academy__missao_situacao(uuid, public.missoes),
  public.academy__competencias(uuid),
  public.academy__missao_aluno(public.missoes),
  public.academy__tentativa_json(public.missao_tentativas, public.missoes),
  public.academy_minhas_competencias(),
  public.academy_minhas_missoes(),
  public.academy_minha_proxima_missao(),
  public.academy__missao_por_slug(text),
  public.academy_missao(text),
  public.academy_iniciar_missao(text),
  public.academy_enviar_missao(text, jsonb, text[]),
  public.academy_meu_painel(),
  public.academy__missao_validar(jsonb),
  public.academy__missao_adm_json(public.missoes),
  public.academy_adm_missoes(text),
  public.academy_adm_salvar_missao(text, jsonb),
  public.academy_adm_excluir_missao(uuid)
to service_role;
