-- ============================================================================
-- 0003_confirmacao.sql — RPCs de confirmação e reenvio (HEL-M02/M05, SEC-007)
--
-- confirmar_token(token_hash, ip_hash):
--   - rate limit: 5/h por token + 10/15min por IP (HEL-M05);
--   - todos os desfechos (válido/inválido/expirado/reutilizado) retornam a
--     MESMA forma {resultado: 'invalido'} ou {resultado: 'ok'} — a Edge
--     Function mapeia tudo para o MESMO 302 (sem oracle no HTTP);
--   - uso único; TTL 48h; 20 falhas → token invalidado (consumido).
--
-- reenviar_token(request_id, ip_hash, token_hash, token_expira_em):
--   - reenvia token para lead existente (dedupe por request_id); usado pela
--     UX "Reenviar e-mail" (estado email-failure). Resposta uniforme para
--     request_id desconhecido (sem oracle — M05).
--
-- Sem segredos neste arquivo (repo público).
-- ============================================================================

create or replace function public.confirmar_token(
  p_token_hash text,
  p_ip_hash    text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tok  public.tokens_confirmacao%rowtype;
  v_bucket       bigint;
  v_rate_chave   text;
  v_rate_count   integer;
begin
  -- Rate limit por IP (verify): 10/15 min.
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

  -- Token desconhecido → resposta uniforme (sem oracle — HEL-M05).
  select * into v_tok
    from public.tokens_confirmacao
   where token_hash = p_token_hash
   limit 1;
  if v_tok is null then
    return json_build_object('resultado', 'invalido');
  end if;

  -- Rate limit por token: 5/h.
  v_bucket := floor(extract(epoch from now()) / 3600)::bigint;
  v_rate_chave := 'token:' || p_token_hash || ':' || v_bucket::text;
  insert into public.rate_limit_events (chave, contador, janela_inicio)
  values (v_rate_chave, 1, now())
  on conflict (chave) do update
    set contador = public.rate_limit_events.contador + 1
  returning contador into v_rate_count;
  if v_rate_count > 5 then
    raise exception 'rate_limited';
  end if;

  -- Já usado (uso único) OU expirado (TTL 48h) OU invalidado por abuso
  -- (usado_em preenchido por limite de falhas) → mesma resposta.
  if v_tok.usado_em is not null or v_tok.expira_em < now() then
    -- registra falha (abuso/enumeração); 20 falhas → consome o token.
    update public.tokens_confirmacao
       set falhas = falhas + 1,
           usado_em = case when falhas + 1 >= 20 then now() else usado_em end
     where id = v_tok.id;
    return json_build_object('resultado', 'invalido');
  end if;

  -- Sucesso: uso único + lead confirmado.
  update public.tokens_confirmacao
     set usado_em = now()
   where id = v_tok.id;

  update public.leads
     set status = 'confirmed', updated_at = now()
   where id = v_tok.lead_id;

  return json_build_object('resultado', 'ok', 'lead_id', v_tok.lead_id);
end $$;

create or replace function public.reenviar_token(
  p_request_id      text,
  p_ip_hash         text,
  p_token_hash      text,
  p_token_expira_em timestamptz
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead    public.leads%rowtype;
  v_bucket  bigint;
  v_rate_chave text;
  v_rate_count integer;
begin
  -- Rate limit por IP: 10/15 min (mesmo bucket da captura).
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

  if p_token_hash is null or length(p_token_hash) <> 64 then
    raise exception 'invalid_payload';
  end if;
  if p_token_expira_em is null or p_token_expira_em <= now() then
    raise exception 'invalid_payload';
  end if;

  select * into v_lead from public.leads where request_id = p_request_id limit 1;
  if v_lead is null then
    -- Resposta uniforme: reenvio para request_id desconhecido não diferencia (M05).
    return json_build_object('status', 'accepted_duplicate');
  end if;

  -- Lead já confirmado não recebe novo token (não diferencia estado).
  if v_lead.status = 'confirmed' then
    return json_build_object('status', 'accepted_duplicate');
  end if;

  insert into public.tokens_confirmacao (lead_id, token_hash, expira_em)
  values (v_lead.id, p_token_hash, p_token_expira_em);

  -- email/nome retornam SOMENTE para a Edge Function (server-side), nunca ao browser.
  return json_build_object('status', 'accepted', 'lead_id', v_lead.id,
                           'email', v_lead.email, 'nome', v_lead.nome);
end $$;

-- Grants: EXECUTE apenas para a role de função (M03). PUBLIC revogado.
revoke all on function public.confirmar_token(text, text) from public;
revoke all on function public.reenviar_token(text, text, text, timestamptz) from public;
grant execute on function public.confirmar_token(text, text) to service_role;
grant execute on function public.reenviar_token(text, text, text, timestamptz) to service_role;
