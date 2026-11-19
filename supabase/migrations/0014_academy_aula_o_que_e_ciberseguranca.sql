-- ============================================================================
-- 0014_academy_aula_o_que_e_ciberseguranca.sql - Nova aula de abertura do módulo 1
--
-- O Cybersecurity Fundamentals ganha, no início do módulo 1 (Princípios de
-- segurança), a aula "O que é cibersegurança, afinal?" (YouTube iKAWeoCtbmA).
-- A aula de CID passa a ser a segunda do módulo (YouTube J1AD8CV8AHM), igual à
-- numeração publicada no YouTube ("Módulo 1 · Aula 01" e "Mód 1 · Aula 02").
--
-- Efeitos:
--   1. As aulas do curso a partir do número 2 andam uma posição na numeração
--      (o curso passa de 17 para 18 aulas).
--   2. No módulo 1, as aulas existentes andam uma posição na ordem.
--   3. A nova aula entra com ordem 1 e número 2, já ligada ao vídeo.
--   4. A aula de CID fica ligada ao vídeo J1AD8CV8AHM.
--
-- Nada é publicado aqui e as durações são provisórias: a duração real de cada
-- vídeo e a publicação entram pelo SQL de "Vincular o vídeo de uma aula" do
-- academy/README.md, depois do db push. Progresso, questões e certificados
-- são ligados pelo id da aula, que não muda.
-- Idempotente: pode rodar de novo sem duplicar nem renumerar outra vez.
-- ============================================================================

do $$
declare
  v_modulo uuid;
begin
  select id into v_modulo
    from public.modulos
   where curso_slug = 'cybersecurity-fundamentals' and ordem = 1;

  if v_modulo is null then
    return;
  end if;

  if exists (
    select 1 from public.aulas
     where modulo_id = v_modulo and titulo = 'O que é cibersegurança, afinal?'
  ) then
    return;
  end if;

  -- 1. Numeração do curso: abre a posição 2.
  update public.aulas a
     set numero = a.numero + 1, atualizado_em = now()
    from public.modulos m
   where m.id = a.modulo_id
     and m.curso_slug = 'cybersecurity-fundamentals'
     and a.numero >= 2;

  -- 2. Ordem no módulo 1: abre a posição 1. Em dois passos por causa do
  --    unique (modulo_id, ordem), que é conferido linha a linha.
  update public.aulas set ordem = ordem + 1000 where modulo_id = v_modulo;
  update public.aulas set ordem = ordem - 999, atualizado_em = now() where modulo_id = v_modulo;

  -- 3. Nova aula de abertura do módulo.
  insert into public.aulas (modulo_id, ordem, numero, titulo, resumo, duracao_seg, video_provedor, video_ref, publicado)
  values (
    v_modulo, 1, 2, 'O que é cibersegurança, afinal?',
    'O que a cibersegurança protege, contra o quê e por que o assunto vale para qualquer pessoa, não só para quem trabalha na área.',
    600, 'youtube', 'iKAWeoCtbmA', false
  );

  -- 4. CID passa a ser a segunda aula do módulo, com o vídeo publicado.
  update public.aulas
     set video_provedor = 'youtube', video_ref = 'J1AD8CV8AHM', atualizado_em = now()
   where modulo_id = v_modulo
     and titulo = 'Confidencialidade, integridade e disponibilidade';
end $$;
