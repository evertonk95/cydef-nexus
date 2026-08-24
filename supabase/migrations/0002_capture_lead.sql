-- ============================================================================
-- 0002_capture_lead.sql — RPC `security definer` de captura (HEL-M03/M05/M07)
--
-- Único caminho de escrita: a Edge Function chama esta RPC com a credencial
-- da role de função (EXECUTE apenas). O corpo roda como owner (postgres) e
-- aplica, em ordem: validação server-side, rate limit (10/15min por IP),
-- dedupe silencioso (e-mail normalizado e request_id), e insert transacional
-- lead + consentimento SERVER-STAMPED (versão/hash do aviso vigente + relógio
-- do servidor — HEL-M01) + token de confirmação (hash; TTL 48h — HEL-M02/M05).
--
-- Honeypot: filtrado na Edge Function antes da RPC (SEC-006) — rejeição
-- silenciosa com resposta genérica, sem reflexão de entrada.
--
-- Sem segredos neste arquivo (repo público).
-- ============================================================================

create or replace function public.capture_lead(
  p_nome              text,
  p_email             text,
  p_perfil            text,
  p_ip_hash           text,
  p_request_id        text,
  p_aceito            boolean,
  p_declaracao_idade  boolean,
  p_token_hash        text,
  p_token_expira_em   timestamptz
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aviso          public.aviso_privacidade%rowtype;
  v_email_norm     text;
  v_lead_id        uuid;
  v_existente      uuid;
  v_bucket         bigint;
  v_rate_chave     text;
  v_rate_count     integer;
begin
  -- Validação server-side (SEC-002/SEC-006) — o banco é a última fronteira.
  if p_nome is null or length(btrim(p_nome)) < 2 or length(p_nome) > 80 then
    raise exception 'invalid_payload';
  end if;
  if p_email is null or length(p_email) = 0 or length(p_email) > 254 then
    raise exception 'invalid_payload';
  end if;
  v_email_norm := lower(btrim(p_email));
  if v_email_norm !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$' then
    raise exception 'invalid_payload';
  end if;
  if p_perfil is null or p_perfil not in ('iniciante','transicao','profissional','estudante','outro') then
    raise exception 'invalid_payload';
  end if;
  if p_request_id is null or length(p_request_id) = 0 or length(p_request_id) > 64 then
    raise exception 'invalid_payload';
  end if;
  if p_token_hash is null or length(p_token_hash) <> 64 then
    raise exception 'invalid_payload';
  end if;
  if p_token_expira_em is null or p_token_expira_em <= now() then
    raise exception 'invalid_payload';
  end if;

  -- SEC-001/SEC-002: opt-in explícito e declaração de 16+ (server-side).
  if p_aceito is not true then
    raise exception 'sem_consentimento';
  end if;
  if p_declaracao_idade is not true then
    raise exception 'sem_declaracao_idade';
  end if;

  -- Rate limit: 10/15 min por IP (HEL-M05) — bucket atômico em rate_limit_events.
  v_bucket := floor(extract(epoch from now()) / 900)::bigint;
  v_rate_chave := 'ip:' || coalesce(p_ip_hash, 'sem-ip') || ':' || v_bucket::text;
  insert into public.rate_limit_events (chave, contador, janela_inicio)
  values (v_rate_chave, 1, now())
  on conflict (chave) do update
    set contador = public.rate_limit_events.contador + 1
  returning contador into v_rate_count;
  if v_rate_count > 10 then
    raise exception 'rate_limited';
  end if;

  -- Dedupe silencioso (HEL-M05): e-mail normalizado já existente → mesmo 202 genérico.
  select id into v_existente
    from public.leads
   where lower(email) = v_email_norm
   limit 1;
  if v_existente is not null then
    return json_build_object('status', 'accepted_duplicate');
  end if;

  -- Idempotência por request_id (mesmo 202, sem duplicar).
  select id into v_existente
    from public.leads
   where request_id = p_request_id
   limit 1;
  if v_existente is not null then
    return json_build_object('status', 'accepted_duplicate');
  end if;

  -- Aviso vigente SERVER-STAMPED (HEL-M01): versão + hash do servidor, nunca do cliente.
  select * into v_aviso
    from public.aviso_privacidade
   where vigente = true
   order by publicado_em desc
   limit 1;
  if v_aviso is null then
    raise exception 'no_aviso_vigente';
  end if;

  -- Insert transacional (lead + consentimento + token) — tudo ou nada.
  insert into public.leads (nome, email, perfil, request_id)
  values (btrim(p_nome), v_email_norm, p_perfil, p_request_id)
  returning id into v_lead_id;

  insert into public.consentimentos
    (lead_id, aceito, versao_aviso, hash_aviso, declaracao_idade, ip_truncado)
  values
    (v_lead_id, true, v_aviso.versao, v_aviso.hash_sha256, true,
     left(coalesce(p_ip_hash, ''), 12));

  insert into public.tokens_confirmacao (lead_id, token_hash, expira_em)
  values (v_lead_id, p_token_hash, p_token_expira_em);

  return json_build_object('status', 'accepted', 'lead_id', v_lead_id);
end $$;

-- Grants: EXECUTE apenas para a role de função (M03). PUBLIC revogado
-- (o Postgres concede EXECUTE a PUBLIC por padrão na criação de função).
revoke all on function public.capture_lead(text, text, text, text, text, boolean, boolean, text, timestamptz)
  from public;
grant execute on function public.capture_lead(text, text, text, text, text, boolean, boolean, text, timestamptz)
  to service_role;
