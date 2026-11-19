-- ============================================================================
-- 0015_academy_instrutor.sql - Painel do instrutor da CyDef Academy
--
-- Pedido do Everton (19/11/2026): cadastrar e publicar conteúdo sem SQL
-- manual. Cobre cursos, módulos, aulas (com vídeo e publicação), questões,
-- requisitos do certificado, Boletim do SOC e a própria equipe.
--
-- Papéis:
--   * admin: tudo, em todos os cursos. Só o admin cria curso, publica curso,
--     muda se o curso é gratuito, edita o Boletim e gerencia a equipe.
--   * instrutor: só os cursos atribuídos a ele (academy_equipe_cursos):
--     estrutura, aulas, vídeos, publicação de aulas, questões e requisitos.
--
-- Segurança:
--   * Nenhuma tabela nova tem grant para anon ou authenticated. Toda leitura
--     e escrita passa pelas funções academy_adm_*, que conferem o papel de
--     quem chama no servidor (auth.uid()) antes de qualquer coisa.
--   * Toda escrita grava uma linha em academy_auditoria (quem, o quê, quando).
--   * O progresso dos alunos é protegido: aula publicada ou com progresso não
--     pode ser excluída (só despublicada); questão já respondida também não.
--   * Privilégios no padrão da 0012: revoke de public, anon e authenticated e
--     grant explícito para quem usa, inclusive service_role.
--   * O primeiro admin entra por SQL depois do db push (academy/README.md,
--     "Painel do instrutor"). Daí em diante, a equipe é gerida pelo painel.
--
-- Idempotente.
-- ============================================================================

-- 1. Equipe e auditoria -------------------------------------------------------

create table if not exists public.academy_equipe (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  papel      text not null check (papel in ('admin', 'instrutor')),
  criado_em  timestamptz not null default now()
);

create table if not exists public.academy_equipe_cursos (
  user_id     uuid not null references public.academy_equipe(user_id) on delete cascade,
  curso_slug  text not null references public.cursos(slug) on delete cascade,
  primary key (user_id, curso_slug)
);

create table if not exists public.academy_auditoria (
  id         bigint generated always as identity primary key,
  user_id    uuid,
  acao       text not null,
  alvo       text,
  detalhes   jsonb not null default '{}'::jsonb,
  criado_em  timestamptz not null default now()
);
create index if not exists academy_auditoria_recente_idx on public.academy_auditoria (criado_em desc);

comment on table public.academy_equipe is 'Quem pode usar o painel do instrutor. admin: tudo; instrutor: só os cursos de academy_equipe_cursos.';
comment on table public.academy_auditoria is 'Registro de toda escrita feita pelo painel do instrutor.';

alter table public.academy_equipe        enable row level security;
alter table public.academy_equipe_cursos enable row level security;
alter table public.academy_auditoria     enable row level security;

revoke all on table public.academy_equipe, public.academy_equipe_cursos, public.academy_auditoria
  from anon, authenticated, service_role;

-- 2. Funções internas ---------------------------------------------------------

-- Exige um admin na sessão. Devolve o uid.
create or replace function public.academy__exigir_admin()
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
  if not exists (select 1 from public.academy_equipe e where e.user_id = v_uid and e.papel = 'admin') then
    raise exception 'sem_permissao';
  end if;
  return v_uid;
end $$;

-- Exige alguém da equipe que possa editar o curso. Devolve o uid.
create or replace function public.academy__exigir_curso(p_curso text)
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
  if exists (select 1 from public.academy_equipe e where e.user_id = v_uid and e.papel = 'admin') then
    if not exists (select 1 from public.cursos c where c.slug = p_curso) then
      raise exception 'curso_inexistente';
    end if;
    return v_uid;
  end if;
  if exists (
    select 1 from public.academy_equipe e
      join public.academy_equipe_cursos ec on ec.user_id = e.user_id
     where e.user_id = v_uid and e.papel = 'instrutor' and ec.curso_slug = p_curso
  ) then
    return v_uid;
  end if;
  raise exception 'sem_permissao';
end $$;

create or replace function public.academy__eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.academy_equipe e where e.user_id = auth.uid() and e.papel = 'admin')
$$;

create or replace function public.academy__auditar(p_acao text, p_alvo text, p_detalhes jsonb default '{}'::jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.academy_auditoria (user_id, acao, alvo, detalhes)
  values (auth.uid(), p_acao, p_alvo, coalesce(p_detalhes, '{}'::jsonb))
$$;

-- Numeração do curso: 1..n na ordem dos módulos e das aulas. É o número da
-- URL (/cursos/<curso>/aulas/<numero>); progresso e questões usam o id.
create or replace function public.academy__renumerar(p_curso text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.aulas a
     set numero = r.n, atualizado_em = now()
    from (
      select a2.id, row_number() over (order by m.ordem, a2.ordem)::integer as n
        from public.aulas a2
        join public.modulos m on m.id = a2.modulo_id
       where m.curso_slug = p_curso
    ) r
   where a.id = r.id and a.numero <> r.n
$$;

-- Ordem das aulas de um módulo: 1..n, sem buraco. Em dois passos por causa do
-- unique (modulo_id, ordem), conferido linha a linha.
create or replace function public.academy__compactar_aulas(p_modulo uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.aulas set ordem = ordem + 10000 where modulo_id = p_modulo;
  update public.aulas a
     set ordem = r.n
    from (
      select id, row_number() over (order by ordem)::integer as n
        from public.aulas where modulo_id = p_modulo
    ) r
   where a.id = r.id;
end $$;

-- Ordem dos módulos de um curso a partir de 1 (a Introdução, ordem 0, fica).
create or replace function public.academy__compactar_modulos(p_curso text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.modulos set ordem = ordem + 10000 where curso_slug = p_curso and ordem > 0;
  update public.modulos m
     set ordem = r.n
    from (
      select id, row_number() over (order by ordem)::integer as n
        from public.modulos where curso_slug = p_curso and ordem > 0
    ) r
   where m.id = r.id;
end $$;

-- Texto obrigatório entre min e max caracteres (depois do btrim).
create or replace function public.academy__texto(p_valor text, p_min integer, p_max integer, p_erro text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  v text := btrim(coalesce(p_valor, ''));
begin
  if length(v) < p_min or length(v) > p_max then
    raise exception '%', p_erro;
  end if;
  return v;
end $$;

-- Questão já respondida por algum aluno (módulo ou avaliação final).
create or replace function public.academy__questao_em_uso(p_questao uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.provas_finais f where p_questao = any (f.questoes))
      or exists (
           select 1 from public.tentativas_modulo t
            where t.respostas @> jsonb_build_array(jsonb_build_object('questao', p_questao::text))
         )
$$;

-- Aula de um jeito só, para o painel.
create or replace function public.academy__aula_json(p_aula uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', a.id, 'modulo_id', a.modulo_id, 'ordem', a.ordem, 'numero', a.numero,
    'titulo', a.titulo, 'resumo', a.resumo, 'duracao_seg', a.duracao_seg,
    'video_provedor', a.video_provedor, 'video_ref', a.video_ref,
    'publicado', a.publicado, 'atualizado_em', a.atualizado_em,
    'alunos_com_progresso', (select count(*) from public.progresso_aulas p where p.aula_id = a.id)
  )
    from public.aulas a
   where a.id = p_aula
$$;

-- 3. Quem sou eu no painel ----------------------------------------------------

-- Null para quem não é da equipe (o portal esconde o painel).
create or replace function public.academy_adm_eu()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'papel', e.papel,
    'cursos', case when e.papel = 'admin'
                then (select coalesce(json_agg(c.slug order by c.ordem, c.slug), '[]'::json) from public.cursos c)
                else (select coalesce(json_agg(ec.curso_slug order by ec.curso_slug), '[]'::json)
                        from public.academy_equipe_cursos ec where ec.user_id = e.user_id)
              end
  )
    from public.academy_equipe e
   where e.user_id = auth.uid()
$$;

-- 4. Cursos ---------------------------------------------------------------------

create or replace function public.academy_adm_cursos()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_admin boolean;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  if not exists (select 1 from public.academy_equipe e where e.user_id = v_uid) then
    raise exception 'sem_permissao';
  end if;
  v_admin := public.academy__eh_admin();

  return (
    select coalesce(json_agg(x order by x.ordem, x.slug), '[]'::json)
      from (
        select c.slug, c.titulo, c.nivel, c.gratuito, c.publicado, c.ordem,
               (select count(*) from public.modulos m where m.curso_slug = c.slug) as modulos,
               (select count(*) from public.aulas a join public.modulos m on m.id = a.modulo_id where m.curso_slug = c.slug) as aulas,
               (select count(*) from public.aulas a join public.modulos m on m.id = a.modulo_id where m.curso_slug = c.slug and a.publicado) as aulas_publicadas,
               (select count(*) from public.aulas a join public.modulos m on m.id = a.modulo_id where m.curso_slug = c.slug and a.video_ref is null) as aulas_sem_video,
               (select count(*) from public.questoes q where q.curso_slug = c.slug) as questoes,
               (select count(*) from public.questoes q where q.curso_slug = c.slug and q.publicado) as questoes_publicadas
          from public.cursos c
         where v_admin
            or exists (select 1 from public.academy_equipe_cursos ec where ec.user_id = v_uid and ec.curso_slug = c.slug)
      ) x
  );
end $$;

create or replace function public.academy_adm_curso(p_slug text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_req json;
begin
  perform public.academy__exigir_curso(p_slug);

  select row_to_json(r) into v_req from public.cursos_requisitos r where r.curso_slug = p_slug;

  return (
    select json_build_object(
      'slug', c.slug, 'titulo', c.titulo, 'descricao', c.descricao, 'nivel', c.nivel,
      'gratuito', c.gratuito, 'publicado', c.publicado, 'ordem', c.ordem,
      'eh_admin', public.academy__eh_admin(),
      'requisitos', v_req,
      'questoes_final', (select count(*) from public.questoes q where q.curso_slug = c.slug and q.modulo_id is null),
      'questoes_final_publicadas', (select count(*) from public.questoes q where q.curso_slug = c.slug and q.modulo_id is null and q.publicado),
      'modulos', coalesce((
        select json_agg(json_build_object(
                 'id', m.id, 'ordem', m.ordem, 'titulo', m.titulo,
                 'questoes', (select count(*) from public.questoes q where q.modulo_id = m.id),
                 'questoes_publicadas', (select count(*) from public.questoes q where q.modulo_id = m.id and q.publicado),
                 'aulas', coalesce((
                   select json_agg(public.academy__aula_json(a.id) order by a.ordem)
                     from public.aulas a where a.modulo_id = m.id
                 ), '[]'::json)
               ) order by m.ordem)
          from public.modulos m where m.curso_slug = c.slug
      ), '[]'::json)
    )
      from public.cursos c
     where c.slug = p_slug
  );
end $$;

-- p_slug vazio cria (só admin). Instrutor edita título, descrição e nível;
-- gratuito e publicado são decisões do admin.
create or replace function public.academy_adm_salvar_curso(p_slug text, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin   boolean;
  v_slug    text;
  v_atual   public.cursos%rowtype;
  v_titulo  text;
  v_desc    text;
  v_nivel   text;
  v_grat    boolean;
  v_pub     boolean;
begin
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  if p_slug is null or p_slug = '' then
    perform public.academy__exigir_admin();
    v_slug := lower(btrim(coalesce(p_dados->>'slug', '')));
    if v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(v_slug) > 60 then
      raise exception 'slug_invalido';
    end if;
    if exists (select 1 from public.cursos where slug = v_slug) then
      raise exception 'slug_em_uso';
    end if;
    v_titulo := public.academy__texto(p_dados->>'titulo', 2, 80, 'titulo_invalido');
    v_desc   := public.academy__texto(p_dados->>'descricao', 0, 600, 'descricao_invalida');
    v_nivel  := coalesce(p_dados->>'nivel', 'iniciante');
    if v_nivel not in ('iniciante', 'intermediario', 'avancado') then
      raise exception 'nivel_invalido';
    end if;
    insert into public.cursos (slug, titulo, descricao, nivel, gratuito, publicado, ordem)
    values (v_slug, v_titulo, v_desc, v_nivel, coalesce((p_dados->>'gratuito')::boolean, false), false,
            coalesce((select max(ordem) from public.cursos), 0) + 1);
    insert into public.cursos_requisitos (curso_slug) values (v_slug) on conflict (curso_slug) do nothing;
    perform public.academy__auditar('curso_criado', v_slug, jsonb_build_object('titulo', v_titulo));
    return public.academy_adm_curso(v_slug);
  end if;

  perform public.academy__exigir_curso(p_slug);
  v_admin := public.academy__eh_admin();
  select * into v_atual from public.cursos where slug = p_slug;

  v_titulo := case when p_dados ? 'titulo' then public.academy__texto(p_dados->>'titulo', 2, 80, 'titulo_invalido') else v_atual.titulo end;
  v_desc   := case when p_dados ? 'descricao' then public.academy__texto(p_dados->>'descricao', 0, 600, 'descricao_invalida') else v_atual.descricao end;
  v_nivel  := coalesce(p_dados->>'nivel', v_atual.nivel);
  if v_nivel not in ('iniciante', 'intermediario', 'avancado') then
    raise exception 'nivel_invalido';
  end if;
  v_grat := coalesce((p_dados->>'gratuito')::boolean, v_atual.gratuito);
  v_pub  := coalesce((p_dados->>'publicado')::boolean, v_atual.publicado);
  if not v_admin and (v_grat <> v_atual.gratuito or v_pub <> v_atual.publicado) then
    raise exception 'sem_permissao';
  end if;

  update public.cursos
     set titulo = v_titulo, descricao = v_desc, nivel = v_nivel,
         gratuito = v_grat, publicado = v_pub, atualizado_em = now()
   where slug = p_slug;

  perform public.academy__auditar('curso_salvo', p_slug, p_dados);
  return public.academy_adm_curso(p_slug);
exception
  when invalid_text_representation then
    raise exception 'invalid_payload';
end $$;

-- 5. Módulos --------------------------------------------------------------------

-- p_id vazio cria no fim do curso; com id, renomeia.
create or replace function public.academy_adm_salvar_modulo(p_curso text, p_id uuid, p_titulo text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_titulo text;
  v_id     uuid;
begin
  perform public.academy__exigir_curso(p_curso);
  v_titulo := public.academy__texto(p_titulo, 2, 120, 'titulo_invalido');

  if p_id is null then
    insert into public.modulos (curso_slug, ordem, titulo)
    values (p_curso, greatest(coalesce((select max(ordem) from public.modulos where curso_slug = p_curso), 0) + 1, 1), v_titulo)
    returning id into v_id;
    perform public.academy__auditar('modulo_criado', v_id::text, jsonb_build_object('curso', p_curso, 'titulo', v_titulo));
  else
    update public.modulos set titulo = v_titulo where id = p_id and curso_slug = p_curso returning id into v_id;
    if v_id is null then
      raise exception 'modulo_inexistente';
    end if;
    perform public.academy__auditar('modulo_renomeado', v_id::text, jsonb_build_object('titulo', v_titulo));
  end if;

  return public.academy_adm_curso(p_curso);
end $$;

-- Troca o módulo de lugar com o vizinho (-1 sobe, 1 desce). A Introdução
-- (ordem 0) não se move e nenhum módulo vai para a posição dela.
create or replace function public.academy_adm_mover_modulo(p_id uuid, p_direcao integer)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mod     public.modulos%rowtype;
  v_vizinho public.modulos%rowtype;
begin
  select * into v_mod from public.modulos where id = p_id;
  if v_mod.id is null then
    raise exception 'modulo_inexistente';
  end if;
  perform public.academy__exigir_curso(v_mod.curso_slug);
  if p_direcao not in (-1, 1) or v_mod.ordem = 0 then
    raise exception 'limite';
  end if;

  if p_direcao = -1 then
    select * into v_vizinho from public.modulos
     where curso_slug = v_mod.curso_slug and ordem < v_mod.ordem and ordem > 0
     order by ordem desc limit 1;
  else
    select * into v_vizinho from public.modulos
     where curso_slug = v_mod.curso_slug and ordem > v_mod.ordem
     order by ordem limit 1;
  end if;
  if v_vizinho.id is null then
    raise exception 'limite';
  end if;

  update public.modulos set ordem = v_mod.ordem + 10000 where id = v_mod.id;
  update public.modulos set ordem = v_mod.ordem where id = v_vizinho.id;
  update public.modulos set ordem = v_vizinho.ordem where id = v_mod.id;
  perform public.academy__renumerar(v_mod.curso_slug);
  perform public.academy__auditar('modulo_movido', p_id::text, jsonb_build_object('direcao', p_direcao));
  return public.academy_adm_curso(v_mod.curso_slug);
end $$;

-- Só módulo vazio (sem aula e sem questão) pode ser excluído.
create or replace function public.academy_adm_excluir_modulo(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mod public.modulos%rowtype;
begin
  select * into v_mod from public.modulos where id = p_id;
  if v_mod.id is null then
    raise exception 'modulo_inexistente';
  end if;
  perform public.academy__exigir_curso(v_mod.curso_slug);
  if exists (select 1 from public.aulas where modulo_id = p_id)
     or exists (select 1 from public.questoes where modulo_id = p_id) then
    raise exception 'modulo_nao_vazio';
  end if;

  delete from public.modulos where id = p_id;
  perform public.academy__compactar_modulos(v_mod.curso_slug);
  perform public.academy__auditar('modulo_excluido', p_id::text, jsonb_build_object('curso', v_mod.curso_slug, 'titulo', v_mod.titulo));
  return public.academy_adm_curso(v_mod.curso_slug);
end $$;

-- 6. Aulas ----------------------------------------------------------------------

-- p_id vazio cria no fim do módulo de p_dados.modulo_id. Com id, atualiza só
-- os campos enviados; modulo_id diferente leva a aula para o fim daquele
-- módulo (do mesmo curso). Publicar exige vídeo.
create or replace function public.academy_adm_salvar_aula(p_id uuid, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aula     public.aulas%rowtype;
  v_curso    text;
  v_modulo   uuid;
  v_origem   uuid;
  v_titulo   text;
  v_resumo   text;
  v_duracao  integer;
  v_prov     text;
  v_ref      text;
  v_pub      boolean;
  v_id       uuid;
begin
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  if p_id is not null then
    select * into v_aula from public.aulas where id = p_id;
    if v_aula.id is null then
      raise exception 'aula_inexistente';
    end if;
    v_origem := v_aula.modulo_id;
  end if;

  v_modulo := coalesce(nullif(p_dados->>'modulo_id', '')::uuid, v_aula.modulo_id);
  if v_modulo is null then
    raise exception 'modulo_inexistente';
  end if;
  select curso_slug into v_curso from public.modulos where id = v_modulo;
  if v_curso is null then
    raise exception 'modulo_inexistente';
  end if;
  perform public.academy__exigir_curso(v_curso);
  if v_origem is not null and v_origem <> v_modulo
     and (select curso_slug from public.modulos where id = v_origem) <> v_curso then
    raise exception 'modulo_inexistente';
  end if;

  v_titulo  := case when p_dados ? 'titulo' or p_id is null
                 then public.academy__texto(p_dados->>'titulo', 2, 140, 'titulo_invalido') else v_aula.titulo end;
  v_resumo  := case when p_dados ? 'resumo' or p_id is null
                 then public.academy__texto(p_dados->>'resumo', 0, 1200, 'resumo_invalido') else v_aula.resumo end;
  v_duracao := case when p_dados ? 'duracao_seg' or p_id is null
                 then (p_dados->>'duracao_seg')::integer else v_aula.duracao_seg end;
  if v_duracao is null or v_duracao not between 30 and 14400 then
    raise exception 'duracao_invalida';
  end if;

  if p_dados ? 'video_provedor' or p_dados ? 'video_ref' then
    v_prov := nullif(btrim(coalesce(p_dados->>'video_provedor', '')), '');
    v_ref  := nullif(btrim(coalesce(p_dados->>'video_ref', '')), '');
    if (v_prov is null) <> (v_ref is null)
       or (v_prov is not null and (v_prov not in ('youtube', 'bunny') or v_ref !~ '^[A-Za-z0-9_-]{6,64}$')) then
      raise exception 'video_invalido';
    end if;
  else
    v_prov := v_aula.video_provedor;
    v_ref  := v_aula.video_ref;
  end if;

  v_pub := coalesce((p_dados->>'publicado')::boolean, v_aula.publicado, false);
  if v_pub and v_ref is null then
    raise exception 'aula_sem_video';
  end if;

  if p_id is null then
    insert into public.aulas (modulo_id, ordem, numero, titulo, resumo, duracao_seg, video_provedor, video_ref, publicado)
    values (v_modulo, coalesce((select max(ordem) from public.aulas where modulo_id = v_modulo), 0) + 1, 1,
            v_titulo, v_resumo, v_duracao, v_prov, v_ref, v_pub)
    returning id into v_id;
    perform public.academy__auditar('aula_criada', v_id::text, jsonb_build_object('curso', v_curso, 'titulo', v_titulo));
  else
    v_id := p_id;
    if v_origem <> v_modulo then
      update public.aulas
         set modulo_id = v_modulo,
             ordem = coalesce((select max(ordem) from public.aulas where modulo_id = v_modulo), 0) + 1
       where id = v_id;
      perform public.academy__compactar_aulas(v_origem);
    end if;
    update public.aulas
       set titulo = v_titulo, resumo = v_resumo, duracao_seg = v_duracao,
           video_provedor = v_prov, video_ref = v_ref, publicado = v_pub, atualizado_em = now()
     where id = v_id;
    perform public.academy__auditar('aula_salva', v_id::text, p_dados);
  end if;

  perform public.academy__renumerar(v_curso);
  return public.academy__aula_json(v_id);
exception
  when invalid_text_representation or numeric_value_out_of_range then
    raise exception 'invalid_payload';
end $$;

-- Troca a aula de lugar com a vizinha no mesmo módulo (-1 sobe, 1 desce).
create or replace function public.academy_adm_mover_aula(p_id uuid, p_direcao integer)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aula    public.aulas%rowtype;
  v_vizinha public.aulas%rowtype;
  v_curso   text;
begin
  select * into v_aula from public.aulas where id = p_id;
  if v_aula.id is null then
    raise exception 'aula_inexistente';
  end if;
  select curso_slug into v_curso from public.modulos where id = v_aula.modulo_id;
  perform public.academy__exigir_curso(v_curso);
  if p_direcao not in (-1, 1) then
    raise exception 'limite';
  end if;

  select * into v_vizinha from public.aulas
   where modulo_id = v_aula.modulo_id
     and ((p_direcao = -1 and ordem < v_aula.ordem) or (p_direcao = 1 and ordem > v_aula.ordem))
   order by case when p_direcao = -1 then -ordem else ordem end
   limit 1;
  if v_vizinha.id is null then
    raise exception 'limite';
  end if;

  update public.aulas set ordem = v_aula.ordem + 10000 where id = v_aula.id;
  update public.aulas set ordem = v_aula.ordem where id = v_vizinha.id;
  update public.aulas set ordem = v_vizinha.ordem where id = v_aula.id;
  perform public.academy__renumerar(v_curso);
  perform public.academy__auditar('aula_movida', p_id::text, jsonb_build_object('direcao', p_direcao));
  return public.academy_adm_curso(v_curso);
end $$;

-- Aula publicada ou com progresso de aluno não sai: despublique.
create or replace function public.academy_adm_excluir_aula(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aula  public.aulas%rowtype;
  v_curso text;
begin
  select * into v_aula from public.aulas where id = p_id;
  if v_aula.id is null then
    raise exception 'aula_inexistente';
  end if;
  select curso_slug into v_curso from public.modulos where id = v_aula.modulo_id;
  perform public.academy__exigir_curso(v_curso);
  if v_aula.publicado or exists (select 1 from public.progresso_aulas where aula_id = p_id) then
    raise exception 'aula_em_uso';
  end if;

  delete from public.aulas where id = p_id;
  perform public.academy__compactar_aulas(v_aula.modulo_id);
  perform public.academy__renumerar(v_curso);
  perform public.academy__auditar('aula_excluida', p_id::text, jsonb_build_object('curso', v_curso, 'titulo', v_aula.titulo));
  return public.academy_adm_curso(v_curso);
end $$;

-- 7. Questões -------------------------------------------------------------------

create or replace function public.academy_adm_questoes(p_curso text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_curso(p_curso);
  return (
    select coalesce(json_agg(json_build_object(
             'id', q.id, 'modulo_id', q.modulo_id, 'enunciado', q.enunciado,
             'explicacao', q.explicacao, 'publicado', q.publicado,
             'atualizado_em', q.atualizado_em,
             'em_uso', public.academy__questao_em_uso(q.id),
             'alternativas', coalesce((
               select json_agg(json_build_object('ordem', a.ordem, 'texto', a.texto, 'correta', a.correta) order by a.ordem)
                 from public.questoes_alternativas a where a.questao_id = q.id
             ), '[]'::json)
           ) order by m.ordem nulls last, q.criado_em), '[]'::json)
      from public.questoes q
      left join public.modulos m on m.id = q.modulo_id
     where q.curso_slug = p_curso
  );
end $$;

-- p_id vazio cria. As alternativas são atualizadas por posição (o id de cada
-- posição se mantém), para não quebrar respostas já gravadas.
create or replace function public.academy_adm_salvar_questao(p_id uuid, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_q        public.questoes%rowtype;
  v_curso    text;
  v_modulo   uuid;
  v_enun     text;
  v_expl     text;
  v_pub      boolean;
  v_alts     jsonb;
  v_qtd      integer;
  v_id       uuid;
  i          integer;
  v_corretas integer;
begin
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  if p_id is not null then
    select * into v_q from public.questoes where id = p_id;
    if v_q.id is null then
      raise exception 'questao_inexistente';
    end if;
    v_curso := v_q.curso_slug;
  else
    v_curso := p_dados->>'curso_slug';
  end if;
  perform public.academy__exigir_curso(v_curso);

  if p_dados ? 'modulo_id' then
    v_modulo := nullif(p_dados->>'modulo_id', '')::uuid;
  else
    v_modulo := v_q.modulo_id;
  end if;
  if v_modulo is not null and not exists (select 1 from public.modulos where id = v_modulo and curso_slug = v_curso) then
    raise exception 'modulo_inexistente';
  end if;

  v_enun := public.academy__texto(coalesce(p_dados->>'enunciado', v_q.enunciado), 10, 2000, 'enunciado_invalido');
  v_expl := public.academy__texto(coalesce(p_dados->>'explicacao', v_q.explicacao, ''), 0, 2000, 'explicacao_invalida');
  v_pub  := coalesce((p_dados->>'publicado')::boolean, v_q.publicado, false);

  v_alts := p_dados->'alternativas';
  if v_alts is null and p_id is null then
    raise exception 'alternativas_invalidas';
  end if;
  if v_alts is not null then
    if jsonb_typeof(v_alts) <> 'array' then
      raise exception 'alternativas_invalidas';
    end if;
    v_qtd := jsonb_array_length(v_alts);
    if v_qtd < 2 or v_qtd > 8 then
      raise exception 'alternativas_invalidas';
    end if;
    if exists (
      select 1 from jsonb_array_elements(v_alts) e
       where jsonb_typeof(e) <> 'object'
          or length(btrim(coalesce(e->>'texto', ''))) not between 1 and 600
    ) then
      raise exception 'alternativas_invalidas';
    end if;
    select count(*) into v_corretas from jsonb_array_elements(v_alts) e where coalesce((e->>'correta')::boolean, false);
    if v_corretas <> 1 then
      raise exception 'correta_invalida';
    end if;
  end if;

  if p_id is null then
    insert into public.questoes (curso_slug, modulo_id, enunciado, explicacao, publicado)
    values (v_curso, v_modulo, v_enun, v_expl, false)
    returning id into v_id;
  else
    v_id := p_id;
    update public.questoes
       set modulo_id = v_modulo, enunciado = v_enun, explicacao = v_expl, atualizado_em = now()
     where id = v_id;
  end if;

  if v_alts is not null then
    update public.questoes_alternativas set correta = false where questao_id = v_id;
    delete from public.questoes_alternativas where questao_id = v_id and ordem > v_qtd;
    for i in 1..v_qtd loop
      insert into public.questoes_alternativas (questao_id, ordem, texto, correta)
      values (v_id, i, btrim(v_alts->(i - 1)->>'texto'), false)
      on conflict (questao_id, ordem) do update set texto = excluded.texto;
    end loop;
    update public.questoes_alternativas a
       set correta = true
     where a.questao_id = v_id
       and a.ordem = (select o.n from jsonb_array_elements(v_alts) with ordinality o(e, n)
                       where coalesce((o.e->>'correta')::boolean, false) limit 1);
  end if;

  -- Publicar exige questão válida (2 a 8 alternativas e uma correta).
  if v_pub and (
       (select count(*) from public.questoes_alternativas where questao_id = v_id) not between 2 and 8
    or (select count(*) from public.questoes_alternativas where questao_id = v_id and correta) <> 1
  ) then
    raise exception 'correta_invalida';
  end if;
  update public.questoes set publicado = v_pub where id = v_id;

  perform public.academy__auditar(case when p_id is null then 'questao_criada' else 'questao_salva' end, v_id::text,
                                  jsonb_build_object('curso', v_curso, 'publicado', v_pub));
  return public.academy_adm_questoes(v_curso);
exception
  when invalid_text_representation then
    raise exception 'invalid_payload';
end $$;

create or replace function public.academy_adm_excluir_questao(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_curso text;
begin
  select curso_slug into v_curso from public.questoes where id = p_id;
  if v_curso is null then
    raise exception 'questao_inexistente';
  end if;
  perform public.academy__exigir_curso(v_curso);
  if public.academy__questao_em_uso(p_id) then
    raise exception 'questao_em_uso';
  end if;
  delete from public.questoes where id = p_id;
  perform public.academy__auditar('questao_excluida', p_id::text, jsonb_build_object('curso', v_curso));
  return public.academy_adm_questoes(v_curso);
end $$;

-- 8. Requisitos do certificado ------------------------------------------------

create or replace function public.academy_adm_salvar_requisitos(p_curso text, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_r public.cursos_requisitos%rowtype;
begin
  perform public.academy__exigir_curso(p_curso);
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  insert into public.cursos_requisitos (curso_slug) values (p_curso) on conflict (curso_slug) do nothing;
  select * into v_r from public.cursos_requisitos where curso_slug = p_curso;

  update public.cursos_requisitos set
    exige_todas_aulas    = case when p_dados ? 'exige_todas_aulas' then (p_dados->>'exige_todas_aulas')::boolean else v_r.exige_todas_aulas end,
    exige_modulos        = case when p_dados ? 'exige_modulos' then (p_dados->>'exige_modulos')::boolean else v_r.exige_modulos end,
    nota_minima_modulo   = case when p_dados ? 'nota_minima_modulo' then (p_dados->>'nota_minima_modulo')::integer else v_r.nota_minima_modulo end,
    questoes_modulo      = case when p_dados ? 'questoes_modulo' then (p_dados->>'questoes_modulo')::integer else v_r.questoes_modulo end,
    nota_minima_final    = case when p_dados ? 'nota_minima_final' then (p_dados->>'nota_minima_final')::integer else v_r.nota_minima_final end,
    questoes_final       = case when p_dados ? 'questoes_final' then (p_dados->>'questoes_final')::integer else v_r.questoes_final end,
    espera_final_horas   = case when p_dados ? 'espera_final_horas' then (p_dados->>'espera_final_horas')::integer else v_r.espera_final_horas end,
    tentativas_final_max = case when p_dados ? 'tentativas_final_max' then (p_dados->>'tentativas_final_max')::integer else v_r.tentativas_final_max end,
    carga_horaria_h      = case when p_dados ? 'carga_horaria_h' then (p_dados->>'carga_horaria_h')::numeric else v_r.carga_horaria_h end,
    certificado_ativo    = case when p_dados ? 'certificado_ativo' then (p_dados->>'certificado_ativo')::boolean else v_r.certificado_ativo end,
    atualizado_em        = now()
  where curso_slug = p_curso;

  perform public.academy__auditar('requisitos_salvos', p_curso, p_dados);
  return public.academy_adm_curso(p_curso);
exception
  when check_violation or invalid_text_representation or numeric_value_out_of_range or not_null_violation then
    raise exception 'requisitos_invalidos';
end $$;

-- 9. Boletim do SOC (admin) -----------------------------------------------------

create or replace function public.academy_adm_boletim()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_admin();
  return (
    select coalesce(json_agg(json_build_object(
             'id', b.id, 'tipo', b.tipo, 'titulo', b.titulo, 'link', b.link,
             'publicado', b.publicado, 'publicado_em', b.publicado_em
           ) order by b.publicado_em desc), '[]'::json)
      from public.boletim b
  );
end $$;

create or replace function public.academy_adm_salvar_boletim(p_id uuid, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_b      public.boletim%rowtype;
  v_tipo   text;
  v_titulo text;
  v_link   text;
  v_pub    boolean;
begin
  perform public.academy__exigir_admin();
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;
  if p_id is not null then
    select * into v_b from public.boletim where id = p_id;
    if v_b.id is null then
      raise exception 'aviso_inexistente';
    end if;
  end if;

  v_tipo := coalesce(p_dados->>'tipo', v_b.tipo);
  if v_tipo is null or v_tipo not in ('atualizacao', 'ameaca', 'missao', 'aula') then
    raise exception 'tipo_invalido';
  end if;
  v_titulo := public.academy__texto(coalesce(p_dados->>'titulo', v_b.titulo), 4, 140, 'titulo_invalido');
  v_link := case when p_dados ? 'link' then nullif(btrim(coalesce(p_dados->>'link', '')), '') else v_b.link end;
  if v_link is not null and (v_link !~ '^https://[^[:space:]]+$' or length(v_link) > 300) then
    raise exception 'link_invalido';
  end if;
  v_pub := coalesce((p_dados->>'publicado')::boolean, v_b.publicado, false);

  if p_id is null then
    insert into public.boletim (tipo, titulo, link, publicado, publicado_em)
    values (v_tipo, v_titulo, v_link, v_pub, now())
    returning * into v_b;
    perform public.academy__auditar('aviso_criado', v_b.id::text, jsonb_build_object('titulo', v_titulo));
  else
    update public.boletim
       set tipo = v_tipo, titulo = v_titulo, link = v_link, publicado = v_pub,
           publicado_em = case when v_pub and not v_b.publicado then now() else v_b.publicado_em end
     where id = p_id;
    perform public.academy__auditar('aviso_salvo', p_id::text, p_dados);
  end if;
  return public.academy_adm_boletim();
exception
  when invalid_text_representation then
    raise exception 'invalid_payload';
end $$;

create or replace function public.academy_adm_excluir_boletim(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_admin();
  delete from public.boletim where id = p_id;
  if not found then
    raise exception 'aviso_inexistente';
  end if;
  perform public.academy__auditar('aviso_excluido', p_id::text);
  return public.academy_adm_boletim();
end $$;

-- 10. Equipe (admin) ----------------------------------------------------------

create or replace function public.academy_adm_equipe()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_admin();
  return (
    select coalesce(json_agg(json_build_object(
             'user_id', e.user_id, 'email', u.email, 'nome', al.nome, 'papel', e.papel,
             'eu', e.user_id = auth.uid(),
             'cursos', coalesce((select json_agg(ec.curso_slug order by ec.curso_slug)
                                   from public.academy_equipe_cursos ec where ec.user_id = e.user_id), '[]'::json)
           ) order by e.papel, u.email), '[]'::json)
      from public.academy_equipe e
      join auth.users u on u.id = e.user_id
      left join public.alunos al on al.user_id = e.user_id
  );
end $$;

-- A pessoa precisa já ter conta no portal (ter entrado ao menos uma vez).
create or replace function public.academy_adm_definir_equipe(p_email text, p_papel text, p_cursos text[])
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid;
  v_alvo  uuid;
begin
  v_uid := public.academy__exigir_admin();
  if p_papel not in ('admin', 'instrutor') then
    raise exception 'papel_invalido';
  end if;
  select id into v_alvo from auth.users where lower(email) = lower(btrim(coalesce(p_email, '')));
  if v_alvo is null then
    raise exception 'usuario_inexistente';
  end if;
  if p_papel = 'instrutor' then
    if coalesce(cardinality(p_cursos), 0) = 0
       or exists (select 1 from unnest(p_cursos) s where not exists (select 1 from public.cursos c where c.slug = s)) then
      raise exception 'cursos_invalidos';
    end if;
  end if;
  if v_alvo = v_uid and p_papel <> 'admin'
     and not exists (select 1 from public.academy_equipe where papel = 'admin' and user_id <> v_uid) then
    raise exception 'ultimo_admin';
  end if;

  insert into public.academy_equipe (user_id, papel) values (v_alvo, p_papel)
  on conflict (user_id) do update set papel = excluded.papel;
  delete from public.academy_equipe_cursos where user_id = v_alvo;
  if p_papel = 'instrutor' then
    insert into public.academy_equipe_cursos (user_id, curso_slug)
    select v_alvo, s from unnest(p_cursos) s
    on conflict do nothing;
  end if;

  perform public.academy__auditar('equipe_definida', v_alvo::text,
                                  jsonb_build_object('papel', p_papel, 'cursos', to_jsonb(coalesce(p_cursos, '{}'::text[]))));
  return public.academy_adm_equipe();
end $$;

create or replace function public.academy_adm_remover_equipe(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_admin();
  if exists (select 1 from public.academy_equipe where user_id = p_user_id and papel = 'admin')
     and not exists (select 1 from public.academy_equipe where papel = 'admin' and user_id <> p_user_id) then
    raise exception 'ultimo_admin';
  end if;
  delete from public.academy_equipe where user_id = p_user_id;
  if not found then
    raise exception 'usuario_inexistente';
  end if;
  perform public.academy__auditar('equipe_removida', p_user_id::text);
  return public.academy_adm_equipe();
end $$;

-- 11. Privilégios (padrão da 0012) ------------------------------------------

revoke all on function
  public.academy__exigir_admin(),
  public.academy__exigir_curso(text),
  public.academy__eh_admin(),
  public.academy__auditar(text, text, jsonb),
  public.academy__renumerar(text),
  public.academy__compactar_aulas(uuid),
  public.academy__compactar_modulos(text),
  public.academy__texto(text, integer, integer, text),
  public.academy__questao_em_uso(uuid),
  public.academy__aula_json(uuid),
  public.academy_adm_eu(),
  public.academy_adm_cursos(),
  public.academy_adm_curso(text),
  public.academy_adm_salvar_curso(text, jsonb),
  public.academy_adm_salvar_modulo(text, uuid, text),
  public.academy_adm_mover_modulo(uuid, integer),
  public.academy_adm_excluir_modulo(uuid),
  public.academy_adm_salvar_aula(uuid, jsonb),
  public.academy_adm_mover_aula(uuid, integer),
  public.academy_adm_excluir_aula(uuid),
  public.academy_adm_questoes(text),
  public.academy_adm_salvar_questao(uuid, jsonb),
  public.academy_adm_excluir_questao(uuid),
  public.academy_adm_salvar_requisitos(text, jsonb),
  public.academy_adm_boletim(),
  public.academy_adm_salvar_boletim(uuid, jsonb),
  public.academy_adm_excluir_boletim(uuid),
  public.academy_adm_equipe(),
  public.academy_adm_definir_equipe(text, text, text[]),
  public.academy_adm_remover_equipe(uuid)
from public, anon, authenticated;

grant execute on function
  public.academy_adm_eu(),
  public.academy_adm_cursos(),
  public.academy_adm_curso(text),
  public.academy_adm_salvar_curso(text, jsonb),
  public.academy_adm_salvar_modulo(text, uuid, text),
  public.academy_adm_mover_modulo(uuid, integer),
  public.academy_adm_excluir_modulo(uuid),
  public.academy_adm_salvar_aula(uuid, jsonb),
  public.academy_adm_mover_aula(uuid, integer),
  public.academy_adm_excluir_aula(uuid),
  public.academy_adm_questoes(text),
  public.academy_adm_salvar_questao(uuid, jsonb),
  public.academy_adm_excluir_questao(uuid),
  public.academy_adm_salvar_requisitos(text, jsonb),
  public.academy_adm_boletim(),
  public.academy_adm_salvar_boletim(uuid, jsonb),
  public.academy_adm_excluir_boletim(uuid),
  public.academy_adm_equipe(),
  public.academy_adm_definir_equipe(text, text, text[]),
  public.academy_adm_remover_equipe(uuid)
to authenticated;

grant execute on function
  public.academy__exigir_admin(),
  public.academy__exigir_curso(text),
  public.academy__eh_admin(),
  public.academy__auditar(text, text, jsonb),
  public.academy__renumerar(text),
  public.academy__compactar_aulas(uuid),
  public.academy__compactar_modulos(text),
  public.academy__texto(text, integer, integer, text),
  public.academy__questao_em_uso(uuid),
  public.academy__aula_json(uuid),
  public.academy_adm_eu(),
  public.academy_adm_cursos(),
  public.academy_adm_curso(text),
  public.academy_adm_salvar_curso(text, jsonb),
  public.academy_adm_salvar_modulo(text, uuid, text),
  public.academy_adm_mover_modulo(uuid, integer),
  public.academy_adm_excluir_modulo(uuid),
  public.academy_adm_salvar_aula(uuid, jsonb),
  public.academy_adm_mover_aula(uuid, integer),
  public.academy_adm_excluir_aula(uuid),
  public.academy_adm_questoes(text),
  public.academy_adm_salvar_questao(uuid, jsonb),
  public.academy_adm_excluir_questao(uuid),
  public.academy_adm_salvar_requisitos(text, jsonb),
  public.academy_adm_boletim(),
  public.academy_adm_salvar_boletim(uuid, jsonb),
  public.academy_adm_excluir_boletim(uuid),
  public.academy_adm_equipe(),
  public.academy_adm_definir_equipe(text, text, text[]),
  public.academy_adm_remover_equipe(uuid)
to service_role;
