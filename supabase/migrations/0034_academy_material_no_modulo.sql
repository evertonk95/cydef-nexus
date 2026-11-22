-- ============================================================================
-- 0034_academy_material_no_modulo.sql - material complementar dentro do módulo (fase 22)
--
-- Pedido do Everton (22/11/2026): o material complementar de cada módulo
-- aparece dentro do bloco do módulo, como um item com check. O check vem do
-- download: baixou, conta. As questões do módulo só abrem depois que o aluno
-- baixa todo o material aprovado daquele módulo. Quem já passou no módulo não
-- é travado de novo.
--
-- O que muda:
--   * academy_materiais_baixados: quem baixou qual material e quando
--     (fechada; some com a conta e com o material);
--   * academy_registrar_material(p_material): o portal chama antes de gerar o
--     link de download; registra uma vez só;
--   * academy__material_pendente(uid, módulo): há material aprovado do módulo
--     que o aluno ainda não baixou;
--   * academy_materiais_curso passa a dizer se cada material já foi baixado;
--   * academy_questoes_modulo e academy_responder_modulo recusam com
--     'material_pendente' (o corpo é o da 0013, só com a trava nova);
--   * academy_meus_dados (cópia dos dados do aluno) inclui os materiais baixados.
--
-- O Aviso de Privacidade v2026.9 (0035) passa a citar o registro do download.
-- ============================================================================

create table if not exists public.academy_materiais_baixados (
  user_id     uuid not null references auth.users(id) on delete cascade,
  material_id uuid not null references public.materiais(id) on delete cascade,
  baixado_em  timestamptz not null default now(),
  primary key (user_id, material_id)
);
create index if not exists academy_materiais_baixados_material on public.academy_materiais_baixados (material_id);
alter table public.academy_materiais_baixados enable row level security;
revoke all on table public.academy_materiais_baixados from public, anon, authenticated;
grant all on table public.academy_materiais_baixados to service_role;

create or replace function public.academy__material_pendente(p_uid uuid, p_modulo uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.materiais m
     where m.modulo_id = p_modulo and m.status = 'aprovado'
       and not exists (select 1 from public.academy_materiais_baixados b
                        where b.user_id = p_uid and b.material_id = m.id)
  )
$$;

create or replace function public.academy_registrar_material(p_material uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_curso  text;
  v_status text;
  v_uid    uuid;
  v_em     timestamptz;
begin
  if p_material is null then
    raise exception 'invalid_payload';
  end if;
  select m.curso_slug, m.status into v_curso, v_status from public.materiais m where m.id = p_material;
  if v_curso is null or v_status <> 'aprovado' then
    raise exception 'material_indisponivel';
  end if;
  v_uid := public.academy__aluno_no_curso(v_curso);
  insert into public.academy_materiais_baixados (user_id, material_id) values (v_uid, p_material)
  on conflict (user_id, material_id) do nothing;
  select b.baixado_em into v_em from public.academy_materiais_baixados b
   where b.user_id = v_uid and b.material_id = p_material;
  return json_build_object('material_id', p_material, 'baixado_em', v_em);
end $$;

-- Material aprovado do curso, para o aluno matriculado, com o check do download.
create or replace function public.academy_materiais_curso(p_curso text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  v_uid := public.academy__aluno_no_curso(p_curso);
  return (
    select coalesce(json_agg(json_build_object(
             'id', m.id, 'modulo_id', m.modulo_id, 'titulo', m.titulo, 'descricao', m.descricao,
             'nome_arquivo', m.nome_arquivo, 'extensao', m.extensao, 'tamanho', m.tamanho,
             'sha256', m.sha256, 'caminho', m.caminho,
             'baixado', exists (select 1 from public.academy_materiais_baixados b where b.user_id = v_uid and b.material_id = m.id)
           ) order by m.ordem, m.enviado_em), '[]'::json)
      from public.materiais m
     where m.curso_slug = p_curso and m.status = 'aprovado'
  );
end $$;

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
  -- 0034: material complementar do módulo vem antes das questões. Quem já
  -- passou no módulo continua podendo refazer para revisar.
  if not v_mod.aprovado and public.academy__material_pendente(v_uid, p_modulo_id) then
    raise exception 'material_pendente';
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
  -- 0034: material complementar do módulo vem antes das questões. Quem já
  -- passou no módulo continua podendo refazer para revisar.
  if not v_mod.aprovado and public.academy__material_pendente(v_uid, p_modulo_id) then
    raise exception 'material_pendente';
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

create or replace function public.academy_meus_dados()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_aluno public.alunos%rowtype;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  select * into v_aluno from public.alunos where user_id = v_uid;
  if v_aluno.user_id is null then
    raise exception 'sem_cadastro';
  end if;

  return json_build_object(
    'gerado_em', now(),
    'controlador', 'CyDef (www.cydef.com.br). Encarregado: contato@cydef.com.br',
    'conta', json_build_object(
      'nome', v_aluno.nome,
      'email', (select u.email from auth.users u where u.id = v_uid),
      'criada_em', v_aluno.criado_em,
      'ultimo_acesso_em', v_aluno.ultimo_acesso_em
    ),
    'pre_inscricao', (
      select json_build_object(
        'nome', l.nome, 'email', l.email, 'perfil', l.perfil, 'situacao', l.status,
        'criada_em', l.created_at,
        'consentimentos', coalesce((
          select json_agg(json_build_object(
                   'aceito', c.aceito, 'versao_aviso', c.versao_aviso, 'hash_aviso', c.hash_aviso,
                   'data_hora', c.data_hora, 'declaracao_idade', c.declaracao_idade,
                   'ip_truncado', c.ip_truncado
                 ) order by c.data_hora)
            from public.consentimentos c where c.lead_id = l.id
        ), '[]'::json)
      )
        from public.leads l where l.id = v_aluno.lead_id
    ),
    'matriculas', coalesce((
      select json_agg(json_build_object('curso', cu.titulo, 'origem', m.origem, 'desde', m.criado_em) order by m.criado_em)
        from public.matriculas m join public.cursos cu on cu.slug = m.curso_slug
       where m.user_id = v_uid
    ), '[]'::json),
    'progresso', coalesce((
      select json_agg(json_build_object(
               'curso', cu.titulo, 'aula', a.numero, 'titulo', a.titulo,
               'parou_em_seg', p.posicao_seg, 'concluida_em', p.concluida_em, 'atualizado_em', p.atualizado_em
             ) order by cu.titulo, a.numero)
        from public.progresso_aulas p
        join public.aulas a on a.id = p.aula_id
        join public.modulos mo on mo.id = a.modulo_id
        join public.cursos cu on cu.slug = mo.curso_slug
       where p.user_id = v_uid
    ), '[]'::json),
    'materiais_baixados', coalesce((
      select json_agg(json_build_object('curso', cu.titulo, 'material', ma.titulo, 'baixado_em', b.baixado_em) order by b.baixado_em)
        from public.academy_materiais_baixados b
        join public.materiais ma on ma.id = b.material_id
        join public.cursos cu on cu.slug = ma.curso_slug
       where b.user_id = v_uid
    ), '[]'::json),
    'dias_de_estudo', coalesce((select json_agg(d.dia order by d.dia) from public.dias_estudo d where d.user_id = v_uid), '[]'::json),
    'questoes_de_modulo', coalesce((
      select json_agg(json_build_object(
               'curso', cu.titulo, 'modulo', mo.titulo, 'data', t.criado_em,
               'acertos', t.acertos, 'total', t.total, 'nota', t.nota, 'aprovado', t.aprovado,
               'respostas', public.academy__respostas_texto(t.respostas)
             ) order by t.criado_em)
        from public.tentativas_modulo t
        join public.modulos mo on mo.id = t.modulo_id
        join public.cursos cu on cu.slug = mo.curso_slug
       where t.user_id = v_uid
    ), '[]'::json),
    'avaliacoes_finais', coalesce((
      select json_agg(json_build_object(
               'curso', cu.titulo, 'iniciada_em', f.iniciada_em, 'enviada_em', f.enviada_em,
               'acertos', f.acertos, 'total', f.total, 'nota', f.nota, 'aprovado', f.aprovado,
               'respostas', public.academy__respostas_texto(f.respostas)
             ) order by f.iniciada_em)
        from public.provas_finais f join public.cursos cu on cu.slug = f.curso_slug
       where f.user_id = v_uid
    ), '[]'::json),
    'certificados', coalesce((
      select json_agg(json_build_object(
               'codigo', c.codigo, 'curso', c.curso_titulo, 'nome', c.nome, 'carga_horaria_h', c.carga_horaria_h,
               'nota_final', c.nota_final, 'concluido_em', c.concluido_em, 'emitido_em', c.emitido_em,
               'validacao_publica', c.validacao_publica
             ) order by c.emitido_em)
        from public.certificados c where c.user_id = v_uid
    ), '[]'::json)
  );
end $$;

-- Privilégios (padrão da 0012) ------------------------------------------------

revoke all on function
  public.academy__material_pendente(uuid, uuid),
  public.academy_registrar_material(uuid),
  public.academy_materiais_curso(text),
  public.academy_questoes_modulo(uuid),
  public.academy_responder_modulo(uuid, jsonb),
  public.academy_meus_dados()
from public, anon, authenticated;

grant execute on function
  public.academy_registrar_material(uuid),
  public.academy_materiais_curso(text),
  public.academy_questoes_modulo(uuid),
  public.academy_responder_modulo(uuid, jsonb),
  public.academy_meus_dados()
to authenticated, service_role;

grant execute on function public.academy__material_pendente(uuid, uuid) to service_role;
