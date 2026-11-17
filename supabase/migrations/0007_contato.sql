-- ============================================================================
-- 0007_contato.sql — Contato comercial do site (formulário + bot de triagem)
--
-- Minimização (LGPD): o banco NÃO guarda nome, cargo, empresa, e-mail nem a
-- mensagem. O conteúdo vai só no e-mail interno para o time. Aqui ficam
-- apenas metadados de controle: hashes HMAC (pepper no secret manager) de IP,
-- e-mail e conteúdo, motivo, prioridade e status de envio.
--
-- Controles de abuso (aplicados na RPC, última fronteira):
--   * por IP: 3 envios / 15 min e 8 / 24 h
--   * por e-mail: 3 envios / 24 h
--   * global (disjuntor anti-flood): 60 envios / 24 h, protege a caixa do
--     time e a cota do provedor de e-mail
--   * idempotência por request_id e dedupe de conteúdo idêntico em 24 h
-- Limites retornam status em JSON (não exceção) para o contador persistir.
--
-- Acesso: RLS deny-by-default, sem DML direto para nenhuma role; escrita só
-- via RPC security definer com EXECUTE apenas para service_role.
-- Sem segredos neste arquivo (repo público).
-- ============================================================================

create table if not exists public.contatos (
  id             uuid primary key default gen_random_uuid(),
  request_id     text not null unique check (length(request_id) between 1 and 64),
  criado_em      timestamptz not null default now(),
  ip_hash        text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  email_hash     text not null check (email_hash ~ '^[0-9a-f]{64}$'),
  conteudo_hash  text not null check (conteudo_hash ~ '^[0-9a-f]{64}$'),
  motivo         text not null check (motivo in ('incidente','consultoria','inora','parceria')),
  prioridade     text not null check (prioridade in ('P1','P2','P3')),
  status         text not null default 'recebido'
                 check (status in ('recebido','enviado','falha_envio')),
  atualizado_em  timestamptz not null default now()
);

create index if not exists contatos_email_hash_idx    on public.contatos (email_hash, criado_em);
create index if not exists contatos_conteudo_hash_idx on public.contatos (conteudo_hash, criado_em);
create index if not exists contatos_criado_em_idx     on public.contatos (criado_em);

alter table public.contatos enable row level security;
revoke all on table public.contatos from anon, authenticated, service_role;

-- Incrementa um contador de janela fixa e devolve o valor atual.
create or replace function public._contato_contar(p_chave text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limit_events (chave, contador, janela_inicio)
  values (p_chave, 1, now())
  on conflict (chave) do update
    set contador = public.rate_limit_events.contador + 1
  returning contador into v_count;
  return v_count;
end $$;

revoke all on function public._contato_contar(text) from public;

create or replace function public.registrar_contato(
  p_request_id     text,
  p_ip_hash        text,
  p_email_hash     text,
  p_conteudo_hash  text,
  p_motivo         text,
  p_prioridade     text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_b15       bigint := floor(extract(epoch from now()) / 900)::bigint;
  v_bdia      bigint := floor(extract(epoch from now()) / 86400)::bigint;
  v_existente public.contatos%rowtype;
begin
  -- Validação server-side (o banco é a última fronteira).
  if p_request_id is null or length(p_request_id) = 0 or length(p_request_id) > 64 then
    raise exception 'invalid_payload';
  end if;
  if p_ip_hash !~ '^[0-9a-f]{64}$'
     or p_email_hash !~ '^[0-9a-f]{64}$'
     or p_conteudo_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_payload';
  end if;
  if p_motivo not in ('incidente','consultoria','inora','parceria')
     or p_prioridade not in ('P1','P2','P3') then
    raise exception 'invalid_payload';
  end if;

  -- Rate limit por IP (antes do global: flood de um IP não esgota o disjuntor).
  if public._contato_contar('contato:ip15:' || p_ip_hash || ':' || v_b15) > 3
     or public._contato_contar('contato:ipdia:' || p_ip_hash || ':' || v_bdia) > 8 then
    return json_build_object('status', 'rate_limited');
  end if;
  if public._contato_contar('contato:email:' || p_email_hash || ':' || v_bdia) > 3 then
    return json_build_object('status', 'rate_limited');
  end if;

  -- Idempotência: mesmo request_id. Se o envio anterior falhou, autoriza nova tentativa.
  select * into v_existente from public.contatos where request_id = p_request_id;
  if found then
    if v_existente.status = 'enviado' then
      return json_build_object('status', 'accepted_duplicate');
    end if;
    return json_build_object('status', 'retry');
  end if;

  -- Dedupe: conteúdo idêntico do mesmo remetente nas últimas 24 h.
  if exists (
    select 1 from public.contatos
     where conteudo_hash = p_conteudo_hash
       and criado_em > now() - interval '24 hours'
  ) then
    return json_build_object('status', 'accepted_duplicate');
  end if;

  -- Disjuntor global anti-flood.
  if public._contato_contar('contato:global:' || v_bdia) > 60 then
    return json_build_object('status', 'capacidade');
  end if;

  insert into public.contatos
    (request_id, ip_hash, email_hash, conteudo_hash, motivo, prioridade)
  values
    (p_request_id, p_ip_hash, p_email_hash, p_conteudo_hash, p_motivo, p_prioridade);

  return json_build_object('status', 'accepted');
end $$;

revoke all on function public.registrar_contato(text, text, text, text, text, text) from public;
grant execute on function public.registrar_contato(text, text, text, text, text, text) to service_role;

create or replace function public.marcar_contato(p_request_id text, p_status text)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('enviado','falha_envio') then
    raise exception 'invalid_payload';
  end if;
  update public.contatos
     set status = p_status, atualizado_em = now()
   where request_id = p_request_id;
  return json_build_object('status', 'ok');
end $$;

revoke all on function public.marcar_contato(text, text) from public;
grant execute on function public.marcar_contato(text, text) to service_role;

-- Retenção: metadados por 12 meses (alinhado à Política de Privacidade, item
-- de mensagens de contato) e contadores de rate limit do contato por 2 dias.
-- Agendar no pg_cron do projeto (diário), por exemplo:
--   select cron.schedule('expurgo-contatos', '17 4 * * *', 'select public.expurgar_contatos()');
create or replace function public.expurgar_contatos()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_c integer;
  v_r integer;
begin
  delete from public.contatos where criado_em < now() - interval '12 months';
  get diagnostics v_c = row_count;
  delete from public.rate_limit_events
   where chave like 'contato:%' and janela_inicio < now() - interval '2 days';
  get diagnostics v_r = row_count;
  return json_build_object('contatos', v_c, 'contadores', v_r);
end $$;

revoke all on function public.expurgar_contatos() from public;
grant execute on function public.expurgar_contatos() to service_role;
