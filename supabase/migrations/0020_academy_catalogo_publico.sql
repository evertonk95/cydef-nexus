-- ============================================================================
-- 0020_academy_catalogo_publico.sql - Catálogo público, trilhas e botão de
-- compra da Hotmart (fase 14)
--
-- Decisões do Everton (19/11/2026):
--   * A venda é da Hotmart: pagamento, reembolso e nota ficam lá. A CyDef só
--     mostra o curso e manda a pessoa para o checkout da Hotmart.
--   * O curso aparece em três vitrines, todas lidas da mesma fonte (este
--     banco): o site principal (cydef.com.br, a que vai para o Google), o
--     catálogo dentro do portal e a página do produto na própria Hotmart.
--   * No site, os cursos aparecem por trilha (SOC, Blue Team, Red Team, GRC,
--     Certificações, ISO) e numa página de catálogo completo. Cada curso tem
--     página com o sobre, a ementa, quem ensina, a carga horária e o preço.
--   * Só o admin decide o que vai para a vitrine, o link de checkout, o
--     produto da Hotmart e o preço exibido.
--
-- Modelo:
--   * trilhas passa a existir sem formação (formacao_slug opcional). Uma
--     trilha agrupa cursos para a vitrine; a formação, quando vier, agrupa
--     trilhas para o certificado de formação.
--   * cursos_vitrine: uma linha por curso, só lida pelas funções. Situação:
--       oculto   - fora das vitrines (padrão);
--       em_breve - aparece com "Avise-me", sem preço;
--       a_venda  - aparece com preço e botão Comprar. Exige curso publicado,
--                  link de checkout e preço.
--     O preço é só o que se exibe: quem cobra é a Hotmart. Por isso fica a
--     data da última conferência, que o painel mostra ao admin.
--   * academy_catalogo_publico(): a leitura pública (anon) do catálogo,
--     só com colunas de vitrine. É o que o build do site lê e o que o
--     portal mostra. Curso gratuito fica fora: ele tem a seção própria do
--     site (decisão de 18/11/2026).
--   * Os cursos que o site anunciava em código (SOC Analyst, Blue Team
--     Advanced e os quatro em preparação) entram no banco como em_breve,
--     com a ementa que o site já publicava, para o site passar a ler tudo
--     daqui. Curso que já exista com o mesmo endereço não é tocado.
--
-- Toda escrita vai para academy_auditoria. Idempotente.
-- ============================================================================

-- 1. Trilhas sem formação -----------------------------------------------------

alter table public.trilhas alter column formacao_slug drop not null;

drop policy if exists trilhas_publicadas on public.trilhas;
create policy trilhas_publicadas on public.trilhas
  for select to anon, authenticated
  using (
    publicado and (
      formacao_slug is null
      or exists (select 1 from public.formacoes f where f.slug = formacao_slug and f.publicado)
    )
  );

comment on column public.trilhas.formacao_slug is 'Vazio: trilha avulsa da vitrine. Preenchido: trilha que compõe uma formação.';

-- 2. Vitrine ------------------------------------------------------------------

create table if not exists public.cursos_vitrine (
  curso_slug          text primary key references public.cursos(slug) on delete cascade,
  situacao            text not null default 'oculto' check (situacao in ('oculto', 'em_breve', 'a_venda')),
  checkout_url        text check (
    checkout_url is null or (
      checkout_url ~ '^https://(pay|checkout)\.hotmart\.com/[A-Za-z0-9]{4,40}(\?[A-Za-z0-9=&._-]{1,200})?$'
      and length(checkout_url) <= 300
    )
  ),
  hotmart_produto_id  bigint check (hotmart_produto_id is null or hotmart_produto_id between 1 and 999999999999),
  preco_centavos      integer check (preco_centavos is null or preco_centavos between 100 and 10000000),
  preco_observacao    text not null default '' check (length(preco_observacao) <= 80),
  preco_conferido_em  timestamptz,
  atualizado_em       timestamptz not null default now(),
  atualizado_por      uuid,
  constraint cursos_vitrine_venda_completa
    check (situacao <> 'a_venda' or (checkout_url is not null and preco_centavos is not null))
);
create unique index if not exists cursos_vitrine_produto_uidx
  on public.cursos_vitrine (hotmart_produto_id) where hotmart_produto_id is not null;

comment on table public.cursos_vitrine is 'O que cada curso mostra nas vitrines (site, portal, Hotmart). Só as funções leem e escrevem.';
comment on column public.cursos_vitrine.preco_centavos is 'Preço exibido, em centavos de real. Quem cobra é a Hotmart: conferir quando mudar lá.';
comment on column public.cursos_vitrine.hotmart_produto_id is 'Código do produto na Hotmart. O webhook da fase 16 usa para achar o curso da compra.';

alter table public.cursos_vitrine enable row level security;
revoke all on table public.cursos_vitrine from anon, authenticated, service_role;

-- 3. Trilhas iniciais -----------------------------------------------------------
-- Publicadas, mas só aparecem na vitrine quando tiverem curso nela.

insert into public.trilhas (slug, formacao_slug, titulo, descricao, ordem, publicado) values
  ('soc', null, 'SOC',
   'Para quem quer trabalhar em um Centro de Operações de Segurança: triagem de alertas, SIEM, investigação e resposta.', 1, true),
  ('blue-team', null, 'Blue Team',
   'Defesa em profundidade: threat hunting, forense digital, EDR e arquitetura de detecção.', 2, true),
  ('red-team', null, 'Red Team',
   'Do lado de quem ataca, com autorização: testes de intrusão, simulação de adversário e exploração de vulnerabilidades.', 3, true),
  ('grc', null, 'GRC',
   'Governança, risco e conformidade: políticas, gestão de riscos, controles e auditoria.', 4, true),
  ('certificacoes', null, 'Certificações',
   'Preparatórios para os exames de certificação mais pedidos pelo mercado.', 5, true),
  ('iso', null, 'ISO',
   'Normas ISO de segurança da informação na prática, da implantação à auditoria.', 6, true)
on conflict (slug) do nothing;

-- 4. Cursos que o site anunciava em código --------------------------------------

do $$
declare
  v_novo integer;
begin
  -- SOC Analyst e Blue Team Advanced: com a ementa que o site já publicava.
  insert into public.cursos (slug, titulo, descricao, nivel, gratuito, publicado, ordem, objetivos, publico, pre_requisitos)
  values (
    'soc-analyst', 'SOC Analyst: Formação Completa',
    'Formação completa para atuar como Analista SOC Nível 1 e 2, com foco em detecção, análise e resposta a incidentes de segurança em ambientes corporativos.',
    'intermediario', false, false, 10,
    array['Dominar análise de logs e correlação de eventos',
          'Operar SIEM e ferramentas de detecção',
          'Investigar e responder a incidentes de segurança',
          'Aplicar o framework MITRE ATT&CK na prática',
          'Criar e executar playbooks de resposta'],
    'Profissionais que desejam atuar em SOC, analistas de suporte buscando especialização, profissionais de TI migrando para segurança.',
    'Conhecimentos em redes, sistemas operacionais e fundamentos de segurança. Recomendado ter concluído o Cybersecurity Fundamentals (gratuito) ou ter experiência equivalente.'
  )
  on conflict (slug) do nothing;
  get diagnostics v_novo = row_count;
  if v_novo > 0 then
    insert into public.modulos (curso_slug, ordem, titulo, resumo) values
      ('soc-analyst', 1, 'Introdução ao SOC', 'Estrutura e Processos de um SOC; Papéis e Responsabilidades; Métricas e KPIs; Integração com outras áreas.'),
      ('soc-analyst', 2, 'Análise de Logs', 'Logs de Sistemas Operacionais; Logs de Rede e Firewall; Logs de Aplicações; Correlação de Eventos.'),
      ('soc-analyst', 3, 'SIEM e Ferramentas de Detecção', 'Operação de SIEM; Criação de Regras de Detecção; Dashboards e Alertas; Integração de Fontes de Dados.'),
      ('soc-analyst', 4, 'Detecção e Análise de Ameaças', 'Identificação de Indicadores de Compromisso (IOCs); Análise de Malware em Contexto SOC; Threat Intelligence; Técnicas de Evasão.'),
      ('soc-analyst', 5, 'Resposta a Incidentes', 'Fases da Resposta a Incidentes; Triagem e Priorização; Containment e Erradicação; Recovery e Lições Aprendidas.'),
      ('soc-analyst', 6, 'MITRE ATT&CK', 'Framework MITRE ATT&CK; Mapeamento de Táticas e Técnicas; Detecção Baseada em ATT&CK; Casos Práticos.');
    insert into public.cursos_requisitos (curso_slug, carga_horaria_h) values ('soc-analyst', 80)
      on conflict (curso_slug) do nothing;
    insert into public.cursos_vitrine (curso_slug, situacao) values ('soc-analyst', 'em_breve')
      on conflict (curso_slug) do nothing;
    insert into public.trilha_cursos (trilha_slug, curso_slug, ordem) values ('soc', 'soc-analyst', 1)
      on conflict do nothing;
  end if;

  insert into public.cursos (slug, titulo, descricao, nivel, gratuito, publicado, ordem, objetivos, publico, pre_requisitos)
  values (
    'blue-team-advanced', 'Blue Team Advanced',
    'Curso avançado para profissionais experientes que buscam aprofundar conhecimentos em defesa cibernética, threat hunting, análise forense e estratégias de Blue Team.',
    'avancado', false, false, 11,
    array['Realizar threat hunting proativo',
          'Conduzir análises forenses avançadas',
          'Implementar defesa em profundidade',
          'Operar EDR em nível avançado',
          'Desenvolver estratégias de detecção customizadas'],
    'Analistas SOC experientes, profissionais de Blue Team, especialistas em segurança que desejam evoluir para posições sênior.',
    'Experiência sólida em SOC ou segurança defensiva. Recomendado ter concluído SOC Analyst ou experiência equivalente de 1+ ano.'
  )
  on conflict (slug) do nothing;
  get diagnostics v_novo = row_count;
  if v_novo > 0 then
    insert into public.modulos (curso_slug, ordem, titulo, resumo) values
      ('blue-team-advanced', 1, 'Threat Hunting Avançado', 'Metodologias de Hunting; Hipóteses e Investigações; Hunting em Rede; Hunting em Endpoints.'),
      ('blue-team-advanced', 2, 'Análise Forense Digital', 'Aquisição e Preservação de Evidências; Análise de Memória; Análise de Disco; Timeline Analysis.'),
      ('blue-team-advanced', 3, 'EDR Avançado', 'Detecção Comportamental; Response Automatizado; Análise de Telemetria; Tuning e Otimização.'),
      ('blue-team-advanced', 4, 'Defesa em Profundidade', 'Arquitetura de Defesa em Camadas; Segmentação Avançada; Microsegmentação; Zero Trust.');
    insert into public.cursos_requisitos (curso_slug, carga_horaria_h) values ('blue-team-advanced', 60)
      on conflict (curso_slug) do nothing;
    insert into public.cursos_vitrine (curso_slug, situacao) values ('blue-team-advanced', 'em_breve')
      on conflict (curso_slug) do nothing;
    insert into public.trilha_cursos (trilha_slug, curso_slug, ordem) values ('blue-team', 'blue-team-advanced', 1)
      on conflict do nothing;
  end if;
end $$;

-- Os quatro em preparação: só a apresentação, sem módulos.
with novos as (
  insert into public.cursos (slug, titulo, descricao, nivel, gratuito, publicado, ordem) values
    ('sc-900-prep', 'Preparatório SC-900',
     'Preparação completa para o exame Microsoft Security, Compliance, and Identity Fundamentals.', 'iniciante', false, false, 12),
    ('security-plus-prep', 'Preparatório Security+',
     'Preparação completa para a certificação CompTIA Security+, com exercícios práticos e simulados.', 'intermediario', false, false, 13),
    ('malware-analysis', 'Análise de Malware para SOC',
     'Introdução à análise de malware com foco em contexto SOC, identificação de comportamentos e IOCs.', 'intermediario', false, false, 14),
    ('incident-investigation', 'Investigação de Incidentes (MITRE ATT&CK)',
     'Investigação profunda de incidentes utilizando o framework MITRE ATT&CK para detecção e resposta.', 'avancado', false, false, 15)
  on conflict (slug) do nothing
  returning slug
),
req as (
  insert into public.cursos_requisitos (curso_slug, carga_horaria_h)
  select n.slug, case n.slug when 'sc-900-prep' then 30 when 'security-plus-prep' then 50
                             when 'malware-analysis' then 40 else 45 end
    from novos n
  on conflict (curso_slug) do nothing
  returning curso_slug
),
vit as (
  insert into public.cursos_vitrine (curso_slug, situacao)
  select n.slug, 'em_breve' from novos n
  on conflict (curso_slug) do nothing
  returning curso_slug
)
insert into public.trilha_cursos (trilha_slug, curso_slug, ordem)
select t.trilha, t.curso, t.ordem
  from novos n
  join (values ('certificacoes', 'sc-900-prep', 1),
               ('certificacoes', 'security-plus-prep', 2),
               ('soc', 'malware-analysis', 2),
               ('soc', 'incident-investigation', 3),
               ('blue-team', 'incident-investigation', 2)) as t(trilha, curso, ordem)
    on t.curso = n.slug
on conflict do nothing;

-- 5. Funções internas ---------------------------------------------------------

-- Situação que vale na vitrine: a_venda só com curso publicado e checkout.
create or replace function public.academy__situacao_vitrine(p_curso text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
           when c.gratuito or v.situacao is null or v.situacao = 'oculto' then 'oculto'
           when v.situacao = 'a_venda' and c.publicado and v.checkout_url is not null and v.preco_centavos is not null then 'a_venda'
           else 'em_breve'
         end
    from public.cursos c
    left join public.cursos_vitrine v on v.curso_slug = c.slug
   where c.slug = p_curso
$$;

-- Carga horária exibida: a do certificado; sem ela, a soma das aulas publicadas.
create or replace function public.academy__carga_horaria(p_curso text)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select r.carga_horaria_h from public.cursos_requisitos r where r.curso_slug = p_curso),
    (select nullif(round(sum(a.duracao_seg) / 3600.0, 1), 0)
       from public.aulas a join public.modulos m on m.id = a.modulo_id
      where m.curso_slug = p_curso and a.publicado)
  )
$$;

-- Renumera as trilhas 1..n, na ordem atual.
create or replace function public.academy__renumerar_trilhas()
returns void
language sql
security definer
set search_path = public
as $$
  update public.trilhas t set ordem = x.n
    from (select slug, row_number() over (order by ordem, slug) as n from public.trilhas) x
   where x.slug = t.slug and t.ordem <> x.n
$$;

-- Renumera os cursos de uma trilha 1..n, na ordem atual.
create or replace function public.academy__renumerar_trilha_cursos(p_trilha text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.trilha_cursos tc set ordem = x.n
    from (select tc2.curso_slug, row_number() over (order by tc2.ordem, c.ordem, tc2.curso_slug) as n
            from public.trilha_cursos tc2 join public.cursos c on c.slug = tc2.curso_slug
           where tc2.trilha_slug = p_trilha) x
   where tc.trilha_slug = p_trilha and tc.curso_slug = x.curso_slug and tc.ordem <> x.n
$$;

-- 6. Leitura pública ----------------------------------------------------------

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
    ), '[]'::json)
  )
$$;

comment on function public.academy_catalogo_publico() is 'Catálogo das vitrines (site e portal). Público: só cursos em_breve ou a_venda, só colunas de vitrine.';

-- 7. Painel: vitrine do curso (admin) -------------------------------------------

create or replace function public.academy_adm_vitrine(p_curso text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_c public.cursos%rowtype;
  v_v public.cursos_vitrine%rowtype;
begin
  perform public.academy__exigir_admin();
  select * into v_c from public.cursos where slug = p_curso;
  if not found then
    raise exception 'curso_inexistente';
  end if;
  select * into v_v from public.cursos_vitrine where curso_slug = p_curso;

  return json_build_object(
    'curso', p_curso,
    'situacao', coalesce(v_v.situacao, 'oculto'),
    'situacao_efetiva', public.academy__situacao_vitrine(p_curso),
    'checkout_url', v_v.checkout_url,
    'hotmart_produto_id', v_v.hotmart_produto_id,
    'preco_centavos', v_v.preco_centavos,
    'preco_observacao', coalesce(v_v.preco_observacao, ''),
    'preco_conferido_em', v_v.preco_conferido_em,
    'atualizado_em', v_v.atualizado_em,
    'trilhas', coalesce((
      select json_agg(json_build_object(
               'slug', t.slug, 'titulo', t.titulo, 'publicado', t.publicado,
               'no_curso', exists (select 1 from public.trilha_cursos tc where tc.trilha_slug = t.slug and tc.curso_slug = p_curso)
             ) order by t.ordem, t.slug)
        from public.trilhas t), '[]'::json),
    -- O que falta para a página do curso ficar completa na vitrine.
    'pendencias', array_remove(array[
      case when v_c.gratuito then 'gratuito' end,
      case when not v_c.publicado then 'nao_publicado' end,
      case when public.academy__carga_horaria(p_curso) is null then 'sem_carga_horaria' end,
      case when not exists (select 1 from public.cursos_instrutores ci where ci.curso_slug = p_curso) then 'sem_instrutor' end,
      case when cardinality(v_c.objetivos) = 0 then 'sem_objetivos' end,
      case when not exists (select 1 from public.modulos m where m.curso_slug = p_curso) then 'sem_modulos' end
    ], null)
  );
end $$;

create or replace function public.academy_adm_salvar_vitrine(p_curso text, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid;
  v_c        public.cursos%rowtype;
  v_atual    public.cursos_vitrine%rowtype;
  v_sit      text;
  v_url      text;
  v_prod     bigint;
  v_preco    integer;
  v_obs      text;
  v_conf     timestamptz;
  v_trilhas  text[];
  v_t        text;
begin
  v_uid := public.academy__exigir_admin();
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;
  select * into v_c from public.cursos where slug = p_curso;
  if not found then
    raise exception 'curso_inexistente';
  end if;
  select * into v_atual from public.cursos_vitrine where curso_slug = p_curso;

  v_sit := coalesce(p_dados->>'situacao', v_atual.situacao, 'oculto');
  if v_sit not in ('oculto', 'em_breve', 'a_venda') then
    raise exception 'situacao_invalida';
  end if;

  if p_dados ? 'checkout_url' then
    v_url := nullif(btrim(coalesce(p_dados->>'checkout_url', '')), '');
  else
    v_url := v_atual.checkout_url;
  end if;
  if v_url is not null and (
       v_url !~ '^https://(pay|checkout)\.hotmart\.com/[A-Za-z0-9]{4,40}(\?[A-Za-z0-9=&._-]{1,200})?$'
       or length(v_url) > 300) then
    raise exception 'checkout_invalido';
  end if;

  if p_dados ? 'hotmart_produto_id' then
    if p_dados->'hotmart_produto_id' is null or jsonb_typeof(p_dados->'hotmart_produto_id') = 'null'
       or btrim(coalesce(p_dados->>'hotmart_produto_id', '')) = '' then
      v_prod := null;
    elsif btrim(p_dados->>'hotmart_produto_id') !~ '^[0-9]{1,12}$' then
      raise exception 'produto_invalido';
    else
      v_prod := btrim(p_dados->>'hotmart_produto_id')::bigint;
      if v_prod < 1 then
        raise exception 'produto_invalido';
      end if;
    end if;
  else
    v_prod := v_atual.hotmart_produto_id;
  end if;
  if v_prod is not null and exists (
       select 1 from public.cursos_vitrine where hotmart_produto_id = v_prod and curso_slug <> p_curso) then
    raise exception 'produto_em_uso';
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

  if v_sit <> 'oculto' and v_c.gratuito then
    raise exception 'curso_gratuito';
  end if;
  if v_sit = 'a_venda' then
    if not v_c.publicado then
      raise exception 'curso_nao_publicado';
    end if;
    if v_url is null or v_preco is null then
      raise exception 'venda_incompleta';
    end if;
  end if;

  -- Data da conferência do preço: muda quando o preço muda ou quando o admin
  -- confirma que conferiu na Hotmart.
  v_conf := case
              when v_preco is null then null
              when v_preco is distinct from v_atual.preco_centavos
                   or coalesce((p_dados->>'conferir_preco')::boolean, false) then now()
              else v_atual.preco_conferido_em
            end;

  insert into public.cursos_vitrine as cv
         (curso_slug, situacao, checkout_url, hotmart_produto_id, preco_centavos, preco_observacao,
          preco_conferido_em, atualizado_em, atualizado_por)
  values (p_curso, v_sit, v_url, v_prod, v_preco, v_obs, v_conf, now(), v_uid)
  on conflict (curso_slug) do update set
    situacao = excluded.situacao, checkout_url = excluded.checkout_url,
    hotmart_produto_id = excluded.hotmart_produto_id, preco_centavos = excluded.preco_centavos,
    preco_observacao = excluded.preco_observacao, preco_conferido_em = excluded.preco_conferido_em,
    atualizado_em = now(), atualizado_por = v_uid;

  -- Trilhas do curso, quando vierem: a lista enviada passa a ser a lista.
  if p_dados ? 'trilhas' then
    if jsonb_typeof(p_dados->'trilhas') <> 'array' then
      raise exception 'invalid_payload';
    end if;
    select coalesce(array_agg(distinct x), '{}') into v_trilhas
      from jsonb_array_elements_text(p_dados->'trilhas') x;
    if exists (select 1 from unnest(v_trilhas) s where not exists (select 1 from public.trilhas t where t.slug = s)) then
      raise exception 'trilha_inexistente';
    end if;
    delete from public.trilha_cursos where curso_slug = p_curso and trilha_slug <> all (v_trilhas);
    foreach v_t in array v_trilhas loop
      insert into public.trilha_cursos (trilha_slug, curso_slug, ordem)
      values (v_t, p_curso, coalesce((select max(ordem) from public.trilha_cursos where trilha_slug = v_t), 0) + 1)
      on conflict (trilha_slug, curso_slug) do nothing;
    end loop;
  end if;

  perform public.academy__auditar('vitrine_salva', p_curso, p_dados);
  return public.academy_adm_vitrine(p_curso);
exception
  when invalid_text_representation then
    raise exception 'invalid_payload';
end $$;

-- 8. Painel: trilhas (admin) ------------------------------------------------------

create or replace function public.academy_adm_trilhas()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_admin();
  return coalesce((
    select json_agg(json_build_object(
             'slug', t.slug,
             'titulo', t.titulo,
             'descricao', t.descricao,
             'ordem', t.ordem,
             'publicado', t.publicado,
             'formacao', t.formacao_slug,
             'cursos', coalesce((
                select json_agg(json_build_object(
                         'slug', c.slug, 'titulo', c.titulo, 'ordem', tc.ordem,
                         'situacao', public.academy__situacao_vitrine(c.slug)
                       ) order by tc.ordem, c.slug)
                  from public.trilha_cursos tc join public.cursos c on c.slug = tc.curso_slug
                 where tc.trilha_slug = t.slug), '[]'::json)
           ) order by t.ordem, t.slug)
      from public.trilhas t
  ), '[]'::json);
end $$;

-- p_slug vazio cria a trilha.
create or replace function public.academy_adm_salvar_trilha(p_slug text, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_atual  public.trilhas%rowtype;
  v_slug   text;
  v_titulo text;
  v_desc   text;
  v_pub    boolean;
begin
  perform public.academy__exigir_admin();
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  if p_slug is null or p_slug = '' then
    v_slug := lower(btrim(coalesce(p_dados->>'slug', '')));
    if v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(v_slug) > 60 then
      raise exception 'slug_invalido';
    end if;
    if exists (select 1 from public.trilhas where slug = v_slug) then
      raise exception 'slug_em_uso';
    end if;
    v_titulo := public.academy__texto(p_dados->>'titulo', 2, 80, 'titulo_invalido');
    v_desc   := public.academy__texto(coalesce(p_dados->>'descricao', ''), 0, 400, 'descricao_invalida');
    insert into public.trilhas (slug, formacao_slug, titulo, descricao, ordem, publicado)
    values (v_slug, null, v_titulo, v_desc,
            coalesce((select max(ordem) from public.trilhas), 0) + 1,
            coalesce((p_dados->>'publicado')::boolean, false));
    perform public.academy__auditar('trilha_criada', v_slug, p_dados);
    return public.academy_adm_trilhas();
  end if;

  select * into v_atual from public.trilhas where slug = p_slug;
  if not found then
    raise exception 'trilha_inexistente';
  end if;
  v_titulo := case when p_dados ? 'titulo' then public.academy__texto(p_dados->>'titulo', 2, 80, 'titulo_invalido') else v_atual.titulo end;
  v_desc   := case when p_dados ? 'descricao' then public.academy__texto(coalesce(p_dados->>'descricao', ''), 0, 400, 'descricao_invalida') else v_atual.descricao end;
  v_pub    := coalesce((p_dados->>'publicado')::boolean, v_atual.publicado);

  update public.trilhas set titulo = v_titulo, descricao = v_desc, publicado = v_pub where slug = p_slug;
  perform public.academy__auditar('trilha_salva', p_slug, p_dados);
  return public.academy_adm_trilhas();
exception
  when invalid_text_representation then
    raise exception 'invalid_payload';
end $$;

create or replace function public.academy_adm_mover_trilha(p_slug text, p_direcao integer)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ordem   integer;
  v_vizinho text;
begin
  perform public.academy__exigir_admin();
  if p_direcao not in (-1, 1) then
    raise exception 'invalid_payload';
  end if;
  perform public.academy__renumerar_trilhas();
  select ordem into v_ordem from public.trilhas where slug = p_slug;
  if not found then
    raise exception 'trilha_inexistente';
  end if;
  select slug into v_vizinho from public.trilhas where ordem = v_ordem + p_direcao;
  if v_vizinho is null then
    raise exception 'limite';
  end if;
  update public.trilhas set ordem = v_ordem where slug = v_vizinho;
  update public.trilhas set ordem = v_ordem + p_direcao where slug = p_slug;
  perform public.academy__auditar('trilha_movida', p_slug, jsonb_build_object('direcao', p_direcao));
  return public.academy_adm_trilhas();
end $$;

create or replace function public.academy_adm_mover_na_trilha(p_trilha text, p_curso text, p_direcao integer)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ordem   integer;
  v_vizinho text;
begin
  perform public.academy__exigir_admin();
  if p_direcao not in (-1, 1) then
    raise exception 'invalid_payload';
  end if;
  perform public.academy__renumerar_trilha_cursos(p_trilha);
  select ordem into v_ordem from public.trilha_cursos where trilha_slug = p_trilha and curso_slug = p_curso;
  if not found then
    raise exception 'curso_fora_da_trilha';
  end if;
  select curso_slug into v_vizinho from public.trilha_cursos where trilha_slug = p_trilha and ordem = v_ordem + p_direcao;
  if v_vizinho is null then
    raise exception 'limite';
  end if;
  update public.trilha_cursos set ordem = v_ordem where trilha_slug = p_trilha and curso_slug = v_vizinho;
  update public.trilha_cursos set ordem = v_ordem + p_direcao where trilha_slug = p_trilha and curso_slug = p_curso;
  perform public.academy__auditar('curso_movido_na_trilha', p_trilha, jsonb_build_object('curso', p_curso, 'direcao', p_direcao));
  return public.academy_adm_trilhas();
end $$;

-- 9. Privilégios (padrão da 0012) -----------------------------------------------

revoke all on function
  public.academy__situacao_vitrine(text),
  public.academy__carga_horaria(text),
  public.academy__renumerar_trilhas(),
  public.academy__renumerar_trilha_cursos(text),
  public.academy_catalogo_publico(),
  public.academy_adm_vitrine(text),
  public.academy_adm_salvar_vitrine(text, jsonb),
  public.academy_adm_trilhas(),
  public.academy_adm_salvar_trilha(text, jsonb),
  public.academy_adm_mover_trilha(text, integer),
  public.academy_adm_mover_na_trilha(text, text, integer)
from public, anon, authenticated;

-- Catálogo: público. É o que o site lê no build, sem sessão.
grant execute on function public.academy_catalogo_publico() to anon, authenticated;

grant execute on function
  public.academy_adm_vitrine(text),
  public.academy_adm_salvar_vitrine(text, jsonb),
  public.academy_adm_trilhas(),
  public.academy_adm_salvar_trilha(text, jsonb),
  public.academy_adm_mover_trilha(text, integer),
  public.academy_adm_mover_na_trilha(text, text, integer)
to authenticated;

grant execute on function
  public.academy__situacao_vitrine(text),
  public.academy__carga_horaria(text),
  public.academy__renumerar_trilhas(),
  public.academy__renumerar_trilha_cursos(text),
  public.academy_catalogo_publico(),
  public.academy_adm_vitrine(text),
  public.academy_adm_salvar_vitrine(text, jsonb),
  public.academy_adm_trilhas(),
  public.academy_adm_salvar_trilha(text, jsonb),
  public.academy_adm_mover_trilha(text, integer),
  public.academy_adm_mover_na_trilha(text, text, integer)
to service_role;
