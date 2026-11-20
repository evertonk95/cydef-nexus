-- ============================================================================
-- 0021_academy_concessoes_hotmart.sql - Acesso por concessão e compra pela
-- Hotmart (fase 16)
--
-- Decisões do Everton (19/11/2026):
--   * A Hotmart vende e cobra. A Academy só libera e retira o acesso.
--   * Formas de venda pela Hotmart: curso individual (acesso vitalício),
--     trilha completa (vale a trilha como estava no dia da compra) e acesso à
--     plataforma toda por 12 meses (pagamento único, sem renovação automática).
--   * Reembolso, chargeback, contestação e cancelamento retiram o acesso
--     daquela compra. A conta continua e o certificado já emitido fica.
--   * Cada aviso da Hotmart é gravado uma vez só (ela pode repetir). Só se
--     guarda o necessário: transação, produto, e-mail, nome do comprador,
--     situação e data. Nenhum dado de pagamento.
--   * Compra com e-mail diferente do da conta: o admin transfere pelo painel.
--   * Mapeado para a fase de empresas: contrato com vigência vira concessão
--     com origem "empresa"; o motor de acesso já considera essa origem.
--
-- Modelo:
--   * academy_concessoes: toda forma de acesso pago. Origem (hotmart, manual,
--     empresa), escopo (curso, trilha ou plataforma), validade (início e fim,
--     ou sem fim) e revogação. A trilha guarda a lista de cursos do dia da
--     compra. A plataforma cobre todos os cursos pagos enquanto vale.
--   * matriculas continua sendo o que o portal lê. academy__sincronizar
--     recalcula as matrículas pagas (origem compra ou cortesia) de um aluno a
--     partir das concessões ativas, sem tocar nas de curso gratuito. Progresso
--     e certificados não são apagados: se o acesso voltar, o aluno continua de
--     onde parou.
--   * Sincroniza: no aviso da Hotmart, nas ações do admin, no login e uma vez
--     por dia (pg_cron, quando a extensão estiver ligada), para o fim dos 12
--     meses valer mesmo sem login.
--   * academy_produtos: produto da Hotmart de trilha ou de plataforma. Produto
--     de curso continua na vitrine do curso (0020). Um código de produto serve
--     a um item só, nas duas tabelas.
--   * Quem compra sem pré-inscrição passa a poder pedir o link de acesso: a
--     concessão ativa conta como elegibilidade, e o aluno é criado sem lead.
--
-- Escrita só por funções: a da Hotmart só para service_role (Edge Function
-- academy-hotmart); as do painel só para admin, com auditoria. Idempotente.
-- ============================================================================

-- 1. Produtos de trilha e de plataforma ------------------------------------------

create table if not exists public.academy_produtos (
  hotmart_produto_id  bigint primary key check (hotmart_produto_id between 1 and 999999999999),
  nome                text not null check (length(btrim(nome)) between 2 and 120),
  escopo              text not null check (escopo in ('trilha', 'plataforma')),
  trilha_slug         text references public.trilhas(slug) on delete restrict,
  duracao_dias        integer check (duracao_dias is null or duracao_dias between 1 and 3660),
  ativo               boolean not null default true,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),
  constraint academy_produtos_alvo check (
    (escopo = 'trilha' and trilha_slug is not null) or (escopo = 'plataforma' and trilha_slug is null)
  )
);

comment on table public.academy_produtos is 'Produtos da Hotmart de trilha completa ou de acesso à plataforma. Produto de curso fica em cursos_vitrine.';
comment on column public.academy_produtos.duracao_dias is 'Vazio: vitalício. Plataforma: 365 (12 meses).';

alter table public.academy_produtos enable row level security;
revoke all on table public.academy_produtos from anon, authenticated, service_role;

-- 2. Concessões ------------------------------------------------------------------

create table if not exists public.academy_concessoes (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null check (email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' and length(email) <= 254),
  user_id             uuid references auth.users(id) on delete set null,
  nome                text not null default '' check (length(nome) <= 80),
  origem              text not null check (origem in ('hotmart', 'manual', 'empresa')),
  escopo              text not null check (escopo in ('curso', 'trilha', 'plataforma')),
  curso_slug          text references public.cursos(slug) on delete cascade,
  trilha_slug         text references public.trilhas(slug) on delete set null,
  cursos              text[] not null default '{}',
  inicio              timestamptz not null default now(),
  fim                 timestamptz,
  hotmart_transacao   text unique check (hotmart_transacao is null or hotmart_transacao ~ '^[A-Za-z0-9_-]{4,64}$'),
  hotmart_produto_id  bigint,
  revogada_em         timestamptz,
  motivo_revogacao    text check (motivo_revogacao is null or length(motivo_revogacao) <= 200),
  criado_por          uuid,
  criado_em           timestamptz not null default now(),
  constraint academy_concessoes_alvo check (
    (escopo = 'curso' and curso_slug is not null)
    or (escopo = 'trilha' and cardinality(cursos) > 0)
    or escopo = 'plataforma'
  ),
  constraint academy_concessoes_periodo check (fim is null or fim > inicio),
  constraint academy_concessoes_hotmart check (origem <> 'hotmart' or hotmart_transacao is not null)
);
create index if not exists academy_concessoes_email_idx on public.academy_concessoes (email);
create index if not exists academy_concessoes_user_idx on public.academy_concessoes (user_id);

comment on table public.academy_concessoes is 'Toda forma de acesso pago: compra na Hotmart, liberação manual do admin ou contrato de empresa.';
comment on column public.academy_concessoes.cursos is 'Trilha: os cursos dela no dia da concessão (curso que entrar depois não entra).';

alter table public.academy_concessoes enable row level security;
revoke all on table public.academy_concessoes from anon, authenticated, service_role;

-- 3. Avisos da Hotmart (idempotência) --------------------------------------------

create table if not exists public.academy_hotmart_eventos (
  evento_id           text primary key check (length(evento_id) between 4 and 100),
  evento              text not null check (evento ~ '^[A-Z_]{3,60}$'),
  hotmart_transacao   text not null check (hotmart_transacao ~ '^[A-Za-z0-9_-]{4,64}$'),
  hotmart_produto_id  bigint not null,
  email               text not null check (length(email) <= 254),
  situacao            text not null default '' check (length(situacao) <= 40),
  ocorrido_em         timestamptz,
  recebido_em         timestamptz not null default now(),
  resultado           text not null check (resultado in ('liberado', 'encerrado', 'ignorado', 'produto_desconhecido', 'ja_encerrado'))
);
create index if not exists academy_hotmart_eventos_transacao_idx on public.academy_hotmart_eventos (hotmart_transacao);

comment on table public.academy_hotmart_eventos is 'Cada aviso da Hotmart, gravado uma vez. Sem dado de pagamento.';

alter table public.academy_hotmart_eventos enable row level security;
revoke all on table public.academy_hotmart_eventos from anon, authenticated, service_role;

-- Um código de produto serve a um item só, na vitrine de curso ou aqui.
create or replace function public.academy__produto_unico()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'academy_produtos' then
    if exists (select 1 from public.cursos_vitrine v where v.hotmart_produto_id = new.hotmart_produto_id) then
      raise exception 'produto_em_uso';
    end if;
  elsif new.hotmart_produto_id is not null
        and exists (select 1 from public.academy_produtos p where p.hotmart_produto_id = new.hotmart_produto_id) then
    raise exception 'produto_em_uso';
  end if;
  return new;
end $$;

drop trigger if exists academy_produtos_unico on public.academy_produtos;
create trigger academy_produtos_unico before insert or update of hotmart_produto_id on public.academy_produtos
  for each row execute function public.academy__produto_unico();
drop trigger if exists cursos_vitrine_produto_unico on public.cursos_vitrine;
create trigger cursos_vitrine_produto_unico before insert or update of hotmart_produto_id on public.cursos_vitrine
  for each row execute function public.academy__produto_unico();

-- 4. Motor de acesso ---------------------------------------------------------------

create or replace function public.academy__concessao_ativa(c public.academy_concessoes)
returns boolean
language sql
stable
set search_path = public
as $$
  select c.revogada_em is null and c.inicio <= now() and (c.fim is null or c.fim > now())
$$;

-- Cursos que uma concessão cobre agora.
create or replace function public.academy__cursos_da_concessao(c public.academy_concessoes)
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select c.curso_slug where c.escopo = 'curso'
  union
  select unnest(c.cursos) where c.escopo = 'trilha'
  union
  select k.slug from public.cursos k where c.escopo = 'plataforma' and not k.gratuito
$$;

-- Cursos cobertos agora pelas concessões de um aluno, com a origem da matrícula.
create or replace function public.academy__cursos_cobertos(p_user uuid)
returns table (slug text, origem text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (x.slug) x.slug, case when c.origem = 'hotmart' then 'compra' else 'cortesia' end
    from public.academy_concessoes c
    cross join lateral public.academy__cursos_da_concessao(c) as x(slug)
   where c.user_id = p_user and public.academy__concessao_ativa(c)
     and exists (select 1 from public.cursos k where k.slug = x.slug)
   order by x.slug, (c.origem = 'hotmart') desc
$$;

-- Liga as concessões do e-mail à conta e recalcula as matrículas pagas.
create or replace function public.academy__sincronizar(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if p_user is null or not exists (select 1 from public.alunos a where a.user_id = p_user) then
    return;
  end if;
  select lower(u.email) into v_email from auth.users u where u.id = p_user;
  if v_email is not null then
    update public.academy_concessoes set user_id = p_user where email = v_email and user_id is distinct from p_user;
  end if;

  insert into public.matriculas (user_id, curso_slug, origem)
  select p_user, t.slug, t.origem from public.academy__cursos_cobertos(p_user) t
  on conflict (user_id, curso_slug) do nothing;

  delete from public.matriculas m
   where m.user_id = p_user and m.origem in ('compra', 'cortesia')
     and not exists (select 1 from public.academy__cursos_cobertos(p_user) t where t.slug = m.curso_slug);
end $$;

-- Vencimentos do dia (plano de 12 meses, contrato de empresa): roda no pg_cron.
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
     where c.user_id is not null and c.fim is not null and c.fim <= now() and c.fim > now() - interval '3 days'
  loop
    perform public.academy__sincronizar(v_user);
    v_n := v_n + 1;
  end loop;
  return v_n;
end $$;

-- Cria a concessão de um produto (curso pela vitrine; trilha ou plataforma aqui).
create or replace function public.academy__conceder(
  p_email text, p_nome text, p_origem text, p_produto bigint, p_transacao text,
  p_escopo text, p_curso text, p_trilha text, p_dias integer, p_por uuid
) returns public.academy_concessoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_c       public.academy_concessoes%rowtype;
  v_cursos  text[] := '{}';
  v_user    uuid;
begin
  if p_escopo = 'trilha' then
    select coalesce(array_agg(tc.curso_slug order by tc.ordem), '{}') into v_cursos
      from public.trilha_cursos tc join public.cursos k on k.slug = tc.curso_slug
     where tc.trilha_slug = p_trilha and not k.gratuito;
    if cardinality(v_cursos) = 0 then
      raise exception 'trilha_vazia';
    end if;
  end if;
  select u.id into v_user from auth.users u where lower(u.email) = p_email limit 1;

  insert into public.academy_concessoes
    (email, user_id, nome, origem, escopo, curso_slug, trilha_slug, cursos, inicio, fim,
     hotmart_transacao, hotmart_produto_id, criado_por)
  values
    (p_email, v_user, left(btrim(coalesce(p_nome, '')), 80), p_origem, p_escopo,
     case when p_escopo = 'curso' then p_curso end,
     case when p_escopo = 'trilha' then p_trilha end,
     v_cursos, now(),
     case when p_dias is null then null else now() + make_interval(days => p_dias) end,
     p_transacao, p_produto, p_por)
  returning * into v_c;

  perform public.academy__sincronizar(v_user);
  return v_c;
end $$;

-- 5. Aviso da Hotmart (Edge Function academy-hotmart, service_role) ----------------
--
-- p_evento: { evento_id, evento, transacao, produto_id, email, nome, situacao, ocorrido_em }
-- Devolve { resultado, duplicado, email, nome, conta_existe, produto }.
create or replace function public.academy_hotmart_processar(p_evento jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id         text := p_evento->>'evento_id';
  v_evento     text := upper(coalesce(p_evento->>'evento', ''));
  v_transacao  text := p_evento->>'transacao';
  v_email      text := lower(btrim(coalesce(p_evento->>'email', '')));
  v_nome       text := left(btrim(coalesce(p_evento->>'nome', '')), 80);
  v_produto    bigint;
  v_curso      text;
  v_prod       public.academy_produtos%rowtype;
  v_c          public.academy_concessoes%rowtype;
  v_resultado  text;
  v_titulo     text;
begin
  if v_id is null or v_transacao is null or v_email = '' or jsonb_typeof(p_evento->'produto_id') is null then
    raise exception 'invalid_payload';
  end if;
  v_produto := (p_evento->>'produto_id')::bigint;

  -- Aviso repetido: não faz nada de novo.
  if exists (select 1 from public.academy_hotmart_eventos where evento_id = v_id) then
    return json_build_object('duplicado', true, 'resultado', (select resultado from public.academy_hotmart_eventos where evento_id = v_id));
  end if;

  select curso_slug into v_curso from public.cursos_vitrine where hotmart_produto_id = v_produto;
  select * into v_prod from public.academy_produtos where hotmart_produto_id = v_produto and ativo;
  v_titulo := coalesce((select titulo from public.cursos where slug = v_curso), v_prod.nome);

  if v_curso is null and v_prod.hotmart_produto_id is null then
    v_resultado := 'produto_desconhecido';
  elsif v_evento in ('PURCHASE_APPROVED', 'PURCHASE_COMPLETE') then
    select * into v_c from public.academy_concessoes where hotmart_transacao = v_transacao;
    if v_c.id is not null then
      v_resultado := case when v_c.revogada_em is null then 'ignorado' else 'ja_encerrado' end;
    elsif exists (select 1 from public.academy_hotmart_eventos e where e.hotmart_transacao = v_transacao and e.resultado in ('encerrado', 'ja_encerrado')) then
      -- Reembolso chegou antes da aprovação: não libera.
      v_resultado := 'ja_encerrado';
    else
      v_c := public.academy__conceder(
        v_email, v_nome, 'hotmart', v_produto, v_transacao,
        case when v_curso is not null then 'curso' else v_prod.escopo end,
        v_curso, v_prod.trilha_slug,
        case when v_curso is not null then null else v_prod.duracao_dias end,
        null);
      v_resultado := 'liberado';
    end if;
  elsif v_evento in ('PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_PROTEST', 'PURCHASE_CANCELED') then
    update public.academy_concessoes
       set revogada_em = now(), motivo_revogacao = lower(replace(v_evento, 'PURCHASE_', 'hotmart_'))
     where hotmart_transacao = v_transacao and revogada_em is null
    returning * into v_c;
    if v_c.id is not null then
      perform public.academy__sincronizar(v_c.user_id);
      v_resultado := 'encerrado';
      v_email := v_c.email;
      v_nome := v_c.nome;
    else
      v_resultado := 'ja_encerrado';
    end if;
  else
    v_resultado := 'ignorado';
  end if;

  insert into public.academy_hotmart_eventos
    (evento_id, evento, hotmart_transacao, hotmart_produto_id, email, situacao, ocorrido_em, resultado)
  values
    (v_id, v_evento, v_transacao, v_produto, v_email,
     left(coalesce(p_evento->>'situacao', ''), 40),
     case when p_evento->>'ocorrido_em' ~ '^\d{10,13}$'
          then to_timestamp((p_evento->>'ocorrido_em')::bigint / case when length(p_evento->>'ocorrido_em') = 13 then 1000.0 else 1 end)
     end,
     v_resultado);

  return json_build_object(
    'duplicado', false,
    'resultado', v_resultado,
    'email', v_email,
    'nome', v_nome,
    'produto', v_titulo,
    'conta_existe', exists (select 1 from auth.users u where lower(u.email) = v_email)
  );
exception
  when invalid_text_representation or numeric_value_out_of_range then
    raise exception 'invalid_payload';
end $$;

-- 6. Login de quem comprou sem pré-inscrição ----------------------------------------

create or replace function public.academy__concessao_por_email(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.academy_concessoes c
     where c.email = lower(btrim(p_email)) and public.academy__concessao_ativa(c)
  )
$$;

-- Mesma assinatura da 0008. Novo: concessão ativa também dá direito ao link.
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
     where c.email = v_email order by (c.nome <> '') desc, c.criado_em desc limit 1;
    return json_build_object('elegivel', true, 'user_id', v_user_id, 'aluno', false,
                             'lead_id', null, 'comprador', true, 'nome', coalesce(v_nome, ''));
  end if;
  return json_build_object('elegivel', false);
end $$;

-- Mesma assinatura da 0008. Novo: sem pré-inscrição, exige concessão ativa no e-mail.
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
    if not public.academy__concessao_por_email(v_email) then
      raise exception 'lead_inelegivel';
    end if;
    -- Sem nome da compra, o aluno corrige depois em Minha conta.
    v_nome := coalesce(nullif(btrim(p_nome), ''), nullif(split_part(v_email, '@', 1), ''), 'Aluno');
    if length(btrim(v_nome)) < 2 then
      v_nome := 'Aluno';
    end if;
  end if;

  insert into public.alunos (user_id, lead_id, nome)
  values (p_user_id, p_lead_id, left(btrim(v_nome), 80))
  on conflict (user_id) do nothing;
  perform public.academy__sincronizar(p_user_id);
  return json_build_object('status', 'ok');
end $$;

-- Mesma assinatura da 0008. Novo: sincroniza as concessões a cada login.
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

  perform public.academy__sincronizar(v_uid);
  return json_build_object('nome', v_aluno.nome);
end $$;

-- 7. Painel do admin ---------------------------------------------------------------

create or replace function public.academy__concessao_json(c public.academy_concessoes)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', c.id, 'email', c.email, 'nome', c.nome, 'origem', c.origem, 'escopo', c.escopo,
    'curso', c.curso_slug, 'trilha', c.trilha_slug, 'cursos', c.cursos,
    'alvo', case c.escopo
              when 'curso' then (select k.titulo from public.cursos k where k.slug = c.curso_slug)
              when 'trilha' then coalesce((select t.titulo from public.trilhas t where t.slug = c.trilha_slug), 'Trilha')
              else 'Plataforma toda' end,
    'inicio', c.inicio, 'fim', c.fim, 'transacao', c.hotmart_transacao, 'produto', c.hotmart_produto_id,
    'revogada_em', c.revogada_em, 'motivo', c.motivo_revogacao,
    'conta', c.user_id is not null,
    'situacao', case when c.revogada_em is not null then 'encerrada'
                     when c.fim is not null and c.fim <= now() then 'vencida'
                     else 'ativa' end,
    'criado_em', c.criado_em
  )
$$;

create or replace function public.academy_adm_concessoes(p_busca text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_busca text := lower(btrim(coalesce(p_busca, '')));
begin
  perform public.academy__exigir_admin();
  return coalesce((
    select json_agg(public.academy__concessao_json(c) order by c.criado_em desc)
      from (select * from public.academy_concessoes c
             where v_busca = '' or position(v_busca in c.email) > 0
                or lower(coalesce(c.hotmart_transacao, '')) = v_busca
             order by c.criado_em desc limit 200) c
  ), '[]'::json);
end $$;

-- Liberação manual (cortesia, ajuste, conferência): p_dados { email, nome, escopo, curso, trilha, dias, motivo }.
create or replace function public.academy_adm_conceder(p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid;
  v_email  text := lower(btrim(coalesce(p_dados->>'email', '')));
  v_escopo text := coalesce(p_dados->>'escopo', '');
  v_dias   integer;
  v_c      public.academy_concessoes%rowtype;
begin
  v_uid := public.academy__exigir_admin();
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' or length(v_email) > 254 then
    raise exception 'email_invalido';
  end if;
  if v_escopo not in ('curso', 'trilha', 'plataforma') then
    raise exception 'escopo_invalido';
  end if;
  if v_escopo = 'curso' and not exists (select 1 from public.cursos k where k.slug = p_dados->>'curso' and not k.gratuito) then
    raise exception 'curso_inexistente';
  end if;
  if v_escopo = 'trilha' and not exists (select 1 from public.trilhas t where t.slug = p_dados->>'trilha') then
    raise exception 'trilha_inexistente';
  end if;
  if p_dados ? 'dias' and jsonb_typeof(p_dados->'dias') <> 'null' then
    v_dias := (p_dados->>'dias')::integer;
    if v_dias not between 1 and 3660 then
      raise exception 'dias_invalidos';
    end if;
  end if;
  v_c := public.academy__conceder(v_email, p_dados->>'nome', 'manual', null, null, v_escopo,
                                  p_dados->>'curso', p_dados->>'trilha', v_dias, v_uid);
  perform public.academy__auditar('concessao_criada', v_c.id::text,
    jsonb_build_object('escopo', v_escopo, 'curso', p_dados->>'curso', 'trilha', p_dados->>'trilha', 'dias', v_dias,
                       'motivo', left(coalesce(p_dados->>'motivo', ''), 200)));
  return public.academy__concessao_json(v_c);
exception
  when invalid_text_representation or numeric_value_out_of_range then
    raise exception 'invalid_payload';
end $$;

-- Compra feita com outro e-mail: passa a concessão para o e-mail da conta.
create or replace function public.academy_adm_transferir_concessao(p_id uuid, p_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_novo   text := lower(btrim(coalesce(p_email, '')));
  v_antes  public.academy_concessoes%rowtype;
  v_c      public.academy_concessoes%rowtype;
  v_user   uuid;
begin
  perform public.academy__exigir_admin();
  if v_novo !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' or length(v_novo) > 254 then
    raise exception 'email_invalido';
  end if;
  select * into v_antes from public.academy_concessoes where id = p_id;
  if not found then
    raise exception 'concessao_inexistente';
  end if;
  if v_antes.email = v_novo then
    raise exception 'mesmo_email';
  end if;
  select u.id into v_user from auth.users u where lower(u.email) = v_novo limit 1;
  update public.academy_concessoes set email = v_novo, user_id = v_user where id = p_id returning * into v_c;
  perform public.academy__sincronizar(v_antes.user_id);
  perform public.academy__sincronizar(v_user);
  perform public.academy__auditar('concessao_transferida', p_id::text,
    jsonb_build_object('de', v_antes.email, 'para', v_novo));
  return public.academy__concessao_json(v_c);
end $$;

create or replace function public.academy_adm_revogar_concessao(p_id uuid, p_motivo text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_motivo text := btrim(coalesce(p_motivo, ''));
  v_c      public.academy_concessoes%rowtype;
begin
  perform public.academy__exigir_admin();
  if length(v_motivo) < 5 or length(v_motivo) > 200 then
    raise exception 'motivo_obrigatorio';
  end if;
  update public.academy_concessoes set revogada_em = now(), motivo_revogacao = v_motivo
   where id = p_id and revogada_em is null
  returning * into v_c;
  if v_c.id is null then
    raise exception 'concessao_inexistente';
  end if;
  perform public.academy__sincronizar(v_c.user_id);
  perform public.academy__auditar('concessao_revogada', p_id::text, jsonb_build_object('motivo', v_motivo));
  return public.academy__concessao_json(v_c);
end $$;

create or replace function public.academy_adm_produtos()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_admin();
  return json_build_object(
    'produtos', coalesce((
      select json_agg(json_build_object(
               'hotmart_produto_id', p.hotmart_produto_id, 'nome', p.nome, 'escopo', p.escopo,
               'trilha', p.trilha_slug, 'trilha_titulo', (select t.titulo from public.trilhas t where t.slug = p.trilha_slug),
               'duracao_dias', p.duracao_dias, 'ativo', p.ativo,
               'vendas', (select count(*) from public.academy_concessoes c where c.hotmart_produto_id = p.hotmart_produto_id and c.revogada_em is null)
             ) order by p.escopo desc, p.nome)
        from public.academy_produtos p), '[]'::json),
    'cursos', coalesce((
      select json_agg(json_build_object(
               'hotmart_produto_id', v.hotmart_produto_id, 'curso', k.slug, 'titulo', k.titulo,
               'vendas', (select count(*) from public.academy_concessoes c where c.hotmart_produto_id = v.hotmart_produto_id and c.revogada_em is null)
             ) order by k.ordem)
        from public.cursos_vitrine v join public.cursos k on k.slug = v.curso_slug
       where v.hotmart_produto_id is not null), '[]'::json),
    'eventos', coalesce((
      select json_agg(json_build_object('evento', e.evento, 'resultado', e.resultado, 'produto', e.hotmart_produto_id,
                                        'transacao', e.hotmart_transacao, 'recebido_em', e.recebido_em) order by e.recebido_em desc)
        from (select * from public.academy_hotmart_eventos order by recebido_em desc limit 20) e), '[]'::json)
  );
end $$;

-- p_dados { hotmart_produto_id, nome, escopo, trilha, duracao_dias, ativo }. Mesmo código: edita.
create or replace function public.academy_adm_salvar_produto(p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id     bigint;
  v_nome   text;
  v_escopo text := coalesce(p_dados->>'escopo', '');
  v_trilha text := nullif(p_dados->>'trilha', '');
  v_dias   integer;
begin
  perform public.academy__exigir_admin();
  if coalesce(p_dados->>'hotmart_produto_id', '') !~ '^[0-9]{1,12}$' then
    raise exception 'produto_invalido';
  end if;
  v_id := (p_dados->>'hotmart_produto_id')::bigint;
  if v_id < 1 then
    raise exception 'produto_invalido';
  end if;
  v_nome := public.academy__texto(p_dados->>'nome', 2, 120, 'nome_invalido');
  if v_escopo not in ('trilha', 'plataforma') then
    raise exception 'escopo_invalido';
  end if;
  if v_escopo = 'trilha' and (v_trilha is null or not exists (select 1 from public.trilhas t where t.slug = v_trilha)) then
    raise exception 'trilha_inexistente';
  end if;
  if v_escopo = 'trilha' and not exists (
       select 1 from public.trilha_cursos tc join public.cursos k on k.slug = tc.curso_slug
        where tc.trilha_slug = v_trilha and not k.gratuito) then
    raise exception 'trilha_vazia';
  end if;
  if v_escopo = 'plataforma' then
    v_trilha := null;
  end if;
  if p_dados ? 'duracao_dias' and jsonb_typeof(p_dados->'duracao_dias') <> 'null' then
    v_dias := (p_dados->>'duracao_dias')::integer;
    if v_dias not between 1 and 3660 then
      raise exception 'dias_invalidos';
    end if;
  elsif v_escopo = 'plataforma' then
    v_dias := 365;
  end if;

  insert into public.academy_produtos (hotmart_produto_id, nome, escopo, trilha_slug, duracao_dias, ativo, atualizado_em)
  values (v_id, v_nome, v_escopo, v_trilha, v_dias, coalesce((p_dados->>'ativo')::boolean, true), now())
  on conflict (hotmart_produto_id) do update set
    nome = excluded.nome, escopo = excluded.escopo, trilha_slug = excluded.trilha_slug,
    duracao_dias = excluded.duracao_dias, ativo = excluded.ativo, atualizado_em = now();

  perform public.academy__auditar('produto_salvo', v_id::text, p_dados);
  return public.academy_adm_produtos();
exception
  when invalid_text_representation or numeric_value_out_of_range then
    raise exception 'invalid_payload';
end $$;

-- 8. Vencimento diário (pg_cron, se a extensão estiver ligada) -----------------------

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'academy-expirar-concessoes';
    perform cron.schedule('academy-expirar-concessoes', '23 6 * * *', 'select public.academy_expirar_concessoes()');
  end if;
end $$;

-- 9. Privilégios (padrão da 0012) -----------------------------------------------

revoke all on function
  public.academy__produto_unico(),
  public.academy__concessao_ativa(public.academy_concessoes),
  public.academy__cursos_da_concessao(public.academy_concessoes),
  public.academy__cursos_cobertos(uuid),
  public.academy__sincronizar(uuid),
  public.academy_expirar_concessoes(),
  public.academy__conceder(text, text, text, bigint, text, text, text, text, integer, uuid),
  public.academy_hotmart_processar(jsonb),
  public.academy__concessao_por_email(text),
  public.academy_elegibilidade(text),
  public.academy_provisionar_aluno(uuid, uuid, text),
  public.academy_registrar_acesso(),
  public.academy__concessao_json(public.academy_concessoes),
  public.academy_adm_concessoes(text),
  public.academy_adm_conceder(jsonb),
  public.academy_adm_transferir_concessao(uuid, text),
  public.academy_adm_revogar_concessao(uuid, text),
  public.academy_adm_produtos(),
  public.academy_adm_salvar_produto(jsonb)
from public, anon, authenticated;

grant execute on function
  public.academy_registrar_acesso(),
  public.academy_adm_concessoes(text),
  public.academy_adm_conceder(jsonb),
  public.academy_adm_transferir_concessao(uuid, text),
  public.academy_adm_revogar_concessao(uuid, text),
  public.academy_adm_produtos(),
  public.academy_adm_salvar_produto(jsonb)
to authenticated;

grant execute on function
  public.academy__produto_unico(),
  public.academy__concessao_ativa(public.academy_concessoes),
  public.academy__cursos_da_concessao(public.academy_concessoes),
  public.academy__cursos_cobertos(uuid),
  public.academy__sincronizar(uuid),
  public.academy_expirar_concessoes(),
  public.academy__conceder(text, text, text, bigint, text, text, text, text, integer, uuid),
  public.academy_hotmart_processar(jsonb),
  public.academy__concessao_por_email(text),
  public.academy_elegibilidade(text),
  public.academy_provisionar_aluno(uuid, uuid, text),
  public.academy_registrar_acesso(),
  public.academy__concessao_json(public.academy_concessoes),
  public.academy_adm_concessoes(text),
  public.academy_adm_conceder(jsonb),
  public.academy_adm_transferir_concessao(uuid, text),
  public.academy_adm_revogar_concessao(uuid, text),
  public.academy_adm_produtos(),
  public.academy_adm_salvar_produto(jsonb)
to service_role;
