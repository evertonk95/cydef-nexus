-- ============================================================================
-- 0023_academy_ofertas.sql - Trilha completa e plataforma toda à venda nas
-- vitrines (fase 16b)
--
-- A 0021 já libera o acesso quando a Hotmart avisa a venda de uma trilha ou
-- da plataforma. Faltava mostrar essas ofertas no site e no portal:
--   * academy_produtos ganha situação (oculto ou à venda), link de checkout,
--     preço exibido, observação e data da conferência do preço, com as mesmas
--     regras da vitrine de curso (0020);
--   * academy_catalogo_publico passa a devolver "ofertas": a plataforma toda
--     e as trilhas à venda que aparecem no site (trilha publicada e com curso
--     na vitrine). O resto da resposta não muda;
--   * academy_meus_acessos: o aluno vê os próprios acessos pagos (Minha conta
--     e a cópia dos dados), como o Aviso v2026.4 prevê.
--
-- Idempotente.
-- ============================================================================

-- 1. Vitrine dos produtos ------------------------------------------------------

alter table public.academy_produtos
  add column if not exists situacao           text not null default 'oculto',
  add column if not exists checkout_url       text,
  add column if not exists preco_centavos     integer,
  add column if not exists preco_observacao   text not null default '',
  add column if not exists preco_conferido_em timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'academy_produtos_situacao') then
    alter table public.academy_produtos add constraint academy_produtos_situacao check (situacao in ('oculto', 'a_venda'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'academy_produtos_checkout') then
    alter table public.academy_produtos add constraint academy_produtos_checkout check (
      checkout_url is null or (
        checkout_url ~ '^https://(pay|checkout)\.hotmart\.com/[A-Za-z0-9]{4,40}(\?[A-Za-z0-9=&._-]{1,200})?$'
        and length(checkout_url) <= 300));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'academy_produtos_preco') then
    alter table public.academy_produtos add constraint academy_produtos_preco
      check (preco_centavos is null or preco_centavos between 100 and 10000000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'academy_produtos_observacao') then
    alter table public.academy_produtos add constraint academy_produtos_observacao check (length(preco_observacao) <= 80);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'academy_produtos_venda_completa') then
    alter table public.academy_produtos add constraint academy_produtos_venda_completa
      check (situacao <> 'a_venda' or (ativo and checkout_url is not null and preco_centavos is not null));
  end if;
end $$;

-- 2. Catálogo público com as ofertas ----------------------------------------------

create or replace function public.academy_catalogo_publico()
returns json
language sql
stable
security definer
set search_path = public
as $$
  with vis as (
    select c.*, public.academy__situacao_vitrine(c.slug) as situacao_efetiva
      from public.cursos c
  ),
  cur as (
    select v.* from vis v where v.situacao_efetiva <> 'oculto'
  )
  select json_build_object(
    'trilhas', coalesce((
      select json_agg(json_build_object(
               'slug', t.slug,
               'titulo', t.titulo,
               'descricao', t.descricao,
               'cursos', (select json_agg(tc.curso_slug order by tc.ordem, tc.curso_slug)
                            from public.trilha_cursos tc join cur on cur.slug = tc.curso_slug
                           where tc.trilha_slug = t.slug)
             ) order by t.ordem, t.slug)
        from public.trilhas t
       where t.publicado
         and exists (select 1 from public.trilha_cursos tc join cur on cur.slug = tc.curso_slug where tc.trilha_slug = t.slug)
    ), '[]'::json),
    'cursos', coalesce((
      select json_agg(json_build_object(
               'slug', c.slug,
               'titulo', c.titulo,
               'descricao', c.descricao,
               'nivel', c.nivel,
               'objetivos', c.objetivos,
               'publico', c.publico,
               'pre_requisitos', c.pre_requisitos,
               'situacao', c.situacao_efetiva,
               'carga_horaria_h', public.academy__carga_horaria(c.slug),
               'preco_centavos', case when c.situacao_efetiva = 'a_venda' then v.preco_centavos end,
               'preco_observacao', case when c.situacao_efetiva = 'a_venda' then v.preco_observacao else '' end,
               'checkout_url', case when c.situacao_efetiva = 'a_venda' then v.checkout_url end,
               'trilhas', coalesce((
                  select json_agg(t.slug order by t.ordem, t.slug)
                    from public.trilha_cursos tc join public.trilhas t on t.slug = tc.trilha_slug
                   where tc.curso_slug = c.slug and t.publicado), '[]'::json),
               'modulos', coalesce((
                  select json_agg(json_build_object(
                           'ordem', m.ordem,
                           'titulo', m.titulo,
                           'resumo', m.resumo,
                           'aulas', coalesce((
                              select json_agg(json_build_object('titulo', a.titulo, 'duracao_seg', a.duracao_seg) order by a.ordem)
                                from public.aulas a
                               where a.modulo_id = m.id and a.publicado and c.publicado), '[]'::json)
                         ) order by m.ordem)
                    from public.modulos m where m.curso_slug = c.slug), '[]'::json),
               'instrutores', coalesce((
                  select json_agg(json_build_object(
                           'nome', i.nome, 'cargo', i.cargo, 'bio', i.bio,
                           'linkedin', i.linkedin, 'site', i.site, 'papel', ci.papel
                         ) order by ci.ordem)
                    from public.cursos_instrutores ci join public.instrutores i on i.id = ci.instrutor_id
                   where ci.curso_slug = c.slug), '[]'::json),
               'atualizado_em', greatest(c.atualizado_em, v.atualizado_em)
             ) order by c.ordem, c.slug)
        from cur c left join public.cursos_vitrine v on v.curso_slug = c.slug
    ), '[]'::json),
    -- 0023: trilha completa e plataforma toda à venda pela Hotmart.
    'ofertas', coalesce((
      select json_agg(json_build_object(
               'tipo', p.escopo,
               'nome', p.nome,
               'trilha', p.trilha_slug,
               'duracao_dias', p.duracao_dias,
               'cursos', case when p.escopo = 'trilha' then (
                   select count(*) from public.trilha_cursos tc join cur on cur.slug = tc.curso_slug
                    where tc.trilha_slug = p.trilha_slug)
                 else (select count(*) from cur) end,
               'preco_centavos', p.preco_centavos,
               'preco_observacao', p.preco_observacao,
               'checkout_url', p.checkout_url
             ) order by (p.escopo = 'plataforma') desc, p.nome)
        from public.academy_produtos p
       where p.ativo and p.situacao = 'a_venda'
         and (p.escopo = 'plataforma' or exists (
               select 1 from public.trilhas t where t.slug = p.trilha_slug and t.publicado
                  and exists (select 1 from public.trilha_cursos tc join cur on cur.slug = tc.curso_slug where tc.trilha_slug = t.slug)))
    ), '[]'::json)
  )
$$;


-- 3. Painel ---------------------------------------------------------------------

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
               'situacao', p.situacao, 'checkout_url', p.checkout_url, 'preco_centavos', p.preco_centavos,
               'preco_observacao', p.preco_observacao, 'preco_conferido_em', p.preco_conferido_em,
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

-- p_dados { hotmart_produto_id, nome, escopo, trilha, duracao_dias, ativo,
--           situacao, checkout_url, preco_centavos, preco_observacao, conferir_preco }
create or replace function public.academy_adm_salvar_produto(p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id     bigint;
  v_atual  public.academy_produtos%rowtype;
  v_nome   text;
  v_escopo text := coalesce(p_dados->>'escopo', '');
  v_trilha text := nullif(p_dados->>'trilha', '');
  v_dias   integer;
  v_ativo  boolean;
  v_sit    text;
  v_url    text;
  v_preco  integer;
  v_obs    text;
  v_conf   timestamptz;
begin
  perform public.academy__exigir_admin();
  if coalesce(p_dados->>'hotmart_produto_id', '') !~ '^[0-9]{1,12}$' then
    raise exception 'produto_invalido';
  end if;
  v_id := (p_dados->>'hotmart_produto_id')::bigint;
  if v_id < 1 then
    raise exception 'produto_invalido';
  end if;
  select * into v_atual from public.academy_produtos where hotmart_produto_id = v_id;
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
  v_ativo := coalesce((p_dados->>'ativo')::boolean, true);

  v_sit := coalesce(p_dados->>'situacao', v_atual.situacao, 'oculto');
  if v_sit not in ('oculto', 'a_venda') then
    raise exception 'situacao_invalida';
  end if;
  v_url := case when p_dados ? 'checkout_url' then nullif(btrim(coalesce(p_dados->>'checkout_url', '')), '') else v_atual.checkout_url end;
  if v_url is not null and (v_url !~ '^https://(pay|checkout)\.hotmart\.com/[A-Za-z0-9]{4,40}(\?[A-Za-z0-9=&._-]{1,200})?$' or length(v_url) > 300) then
    raise exception 'checkout_invalido';
  end if;
  if p_dados ? 'preco_centavos' then
    if jsonb_typeof(p_dados->'preco_centavos') = 'null' then
      v_preco := null;
    elsif jsonb_typeof(p_dados->'preco_centavos') <> 'number'
          or (p_dados->>'preco_centavos')::numeric <> trunc((p_dados->>'preco_centavos')::numeric)
          or (p_dados->>'preco_centavos')::numeric not between 100 and 10000000 then
      raise exception 'preco_invalido';
    else
      v_preco := (p_dados->>'preco_centavos')::integer;
    end if;
  else
    v_preco := v_atual.preco_centavos;
  end if;
  v_obs := case when p_dados ? 'preco_observacao'
                then public.academy__texto(coalesce(p_dados->>'preco_observacao', ''), 0, 80, 'observacao_invalida')
                else coalesce(v_atual.preco_observacao, '') end;
  if v_sit = 'a_venda' and (not v_ativo or v_url is null or v_preco is null) then
    raise exception 'venda_incompleta';
  end if;
  v_conf := case
              when v_preco is null then null
              when v_preco is distinct from v_atual.preco_centavos
                   or coalesce((p_dados->>'conferir_preco')::boolean, false) then now()
              else v_atual.preco_conferido_em
            end;

  insert into public.academy_produtos
    (hotmart_produto_id, nome, escopo, trilha_slug, duracao_dias, ativo,
     situacao, checkout_url, preco_centavos, preco_observacao, preco_conferido_em, atualizado_em)
  values (v_id, v_nome, v_escopo, v_trilha, v_dias, v_ativo, v_sit, v_url, v_preco, v_obs, v_conf, now())
  on conflict (hotmart_produto_id) do update set
    nome = excluded.nome, escopo = excluded.escopo, trilha_slug = excluded.trilha_slug,
    duracao_dias = excluded.duracao_dias, ativo = excluded.ativo,
    situacao = excluded.situacao, checkout_url = excluded.checkout_url, preco_centavos = excluded.preco_centavos,
    preco_observacao = excluded.preco_observacao, preco_conferido_em = excluded.preco_conferido_em, atualizado_em = now();

  perform public.academy__auditar('produto_salvo', v_id::text, p_dados);
  return public.academy_adm_produtos();
exception
  when invalid_text_representation or numeric_value_out_of_range then
    raise exception 'invalid_payload';
end $$;

-- 4. Acessos do próprio aluno ------------------------------------------------------

create or replace function public.academy_meus_acessos()
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
  return coalesce((
    select json_agg(json_build_object(
             'acesso', j->>'alvo', 'origem', case c.origem when 'hotmart' then 'Compra na Hotmart'
                                                         when 'manual' then 'Liberado pela CyDef' else 'Empresa' end,
             'transacao', c.hotmart_transacao, 'desde', c.inicio, 'ate', c.fim,
             'situacao', j->>'situacao', 'encerrado_em', c.revogada_em
           ) order by c.inicio desc)
      from public.academy_concessoes c
      cross join lateral (select public.academy__concessao_json(c)::jsonb as j) x
     where c.user_id = v_uid or c.email = v_email
  ), '[]'::json);
end $$;

-- 5. Privilégios (padrão da 0012) -----------------------------------------------

revoke all on function
  public.academy_catalogo_publico(),
  public.academy_adm_produtos(),
  public.academy_adm_salvar_produto(jsonb),
  public.academy_meus_acessos()
from public, anon, authenticated;

grant execute on function public.academy_catalogo_publico() to anon, authenticated;
grant execute on function
  public.academy_adm_produtos(),
  public.academy_adm_salvar_produto(jsonb),
  public.academy_meus_acessos()
to authenticated;
grant execute on function
  public.academy_catalogo_publico(),
  public.academy_adm_produtos(),
  public.academy_adm_salvar_produto(jsonb),
  public.academy_meus_acessos()
to service_role;
