-- ============================================================================
-- 0011_academy_sala_de_aula.sql - Sala de aula (etapa 05b) e módulo de introdução
--
-- 1. Módulo de introdução: módulos passam a aceitar ordem 0. O Cybersecurity
--    Fundamentals ganha o módulo "Introdução" com a aula "Boas-vindas ao curso"
--    (vídeo do YouTube AKtr_lmAB6Y, 2min02s). As aulas existentes andam uma
--    posição na numeração (Aula 01 passa a ser as boas-vindas), igual à
--    numeração publicada no YouTube. Nada é publicado aqui: publicar é decisão
--    do Everton, depois que a sala de aula estiver no ar (academy/README.md).
-- 2. academy_registrar_progresso: a conclusão passa a ser definitiva. Reassistir
--    uma aula concluída atualiza a posição sem desmarcar a conclusão.
-- 3. academy_video_aula: entrega o provedor e a referência do vídeo apenas para
--    aula e curso publicados e aluno matriculado. A coluna video_ref continua
--    fechada para anon e authenticated pela API de tabelas.
-- Idempotente: pode rodar de novo sem duplicar nada.
-- ============================================================================

-- 1. Módulo de introdução ----------------------------------------------------

alter table public.modulos drop constraint if exists modulos_ordem_check;
alter table public.modulos add constraint modulos_ordem_check check (ordem >= 0);

do $$
declare
  v_modulo uuid;
begin
  if exists (
    select 1 from public.modulos
     where curso_slug = 'cybersecurity-fundamentals' and ordem = 0
  ) then
    return;
  end if;

  -- As aulas do curso andam uma posição na numeração.
  update public.aulas a
     set numero = a.numero + 1, atualizado_em = now()
    from public.modulos m
   where m.id = a.modulo_id and m.curso_slug = 'cybersecurity-fundamentals';

  insert into public.modulos (curso_slug, ordem, titulo)
  values ('cybersecurity-fundamentals', 0, 'Introdução')
  returning id into v_modulo;

  insert into public.aulas (modulo_id, ordem, numero, titulo, resumo, duracao_seg, video_provedor, video_ref, publicado)
  values (
    v_modulo, 1, 1, 'Boas-vindas ao curso',
    'O que vamos estudar, para quem é o curso e por que cibersegurança faz parte da vida de todo mundo, não só dos profissionais de segurança. Não precisa saber programar nem ter experiência na área.',
    122, 'youtube', 'AKtr_lmAB6Y', false
  );
end $$;

-- 2. Conclusão definitiva -----------------------------------------------------

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

-- 3. Vídeo da aula ------------------------------------------------------------

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
  if v_aula.video_ref is null then
    raise exception 'sem_video';
  end if;

  return json_build_object('provedor', v_aula.video_provedor, 'ref', v_aula.video_ref);
end $$;

revoke all on function public.academy_registrar_progresso(uuid, integer, boolean) from public;
revoke all on function public.academy_video_aula(uuid) from public;
grant execute on function public.academy_registrar_progresso(uuid, integer, boolean) to authenticated;
grant execute on function public.academy_video_aula(uuid) to authenticated;
