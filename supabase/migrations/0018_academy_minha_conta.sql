-- ============================================================================
-- 0018_academy_minha_conta.sql - Minha conta (fase 12)
--
-- Coloca no portal, ao alcance do aluno, o que o Aviso de Privacidade da
-- Academy (v2026.3) já promete:
--   * item 11, correção: o aluno corrige o próprio nome;
--   * item 11, acesso e portabilidade: o aluno baixa uma cópia dos dados
--     (academy_meus_dados), em JSON;
--   * item 4: o aluno liga e desliga a validação pública de cada
--     certificado (academy_validacao_publica).
-- A exclusão da conta continua pelo canal do item 11 (contato@cydef.com.br,
-- resposta em até 15 dias): a tela só prepara o e-mail.
--
-- Tudo só para o próprio aluno (auth.uid()), no padrão de privilégios da 0012.
--
-- Idempotente.
-- ============================================================================

-- Nome da conta. Não muda certificado já emitido (o nome do certificado é
-- conferido pelo aluno na emissão e fica gravado nele).
create or replace function public.academy_atualizar_nome(p_nome text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_nome text := regexp_replace(btrim(coalesce(p_nome, '')), '\s+', ' ', 'g');
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  if length(v_nome) not between 2 and 80 then
    raise exception 'nome_invalido';
  end if;
  update public.alunos set nome = v_nome where user_id = v_uid;
  if not found then
    raise exception 'sem_cadastro';
  end if;
  return json_build_object('nome', v_nome);
end $$;

-- Certificados do aluno, com o estado da validação pública.
create or replace function public.academy_meus_certificados()
returns json
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
  return (
    select coalesce(json_agg(json_build_object(
             'codigo', c.codigo, 'curso_slug', c.curso_slug, 'curso_titulo', c.curso_titulo,
             'nome', c.nome, 'carga_horaria_h', c.carga_horaria_h, 'concluido_em', c.concluido_em,
             'validacao_publica', c.validacao_publica
           ) order by c.emitido_em desc), '[]'::json)
      from public.certificados c
     where c.user_id = v_uid
  );
end $$;

-- Liga ou desliga a validação pública de um certificado do próprio aluno.
create or replace function public.academy_validacao_publica(p_codigo text, p_ativa boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  if p_ativa is null then
    raise exception 'invalid_payload';
  end if;
  update public.certificados
     set validacao_publica = p_ativa
   where codigo = upper(btrim(coalesce(p_codigo, ''))) and user_id = v_uid;
  if not found then
    raise exception 'certificado_inexistente';
  end if;
  return public.academy_meus_certificados();
end $$;

-- Respostas em texto (enunciado e alternativa escolhida), sem a correção.
create or replace function public.academy__respostas_texto(p_respostas jsonb)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(json_build_object(
           'questao', q.enunciado,
           'resposta', a.texto
         ) order by r.n), '[]'::json)
    from jsonb_array_elements(coalesce(p_respostas, '[]'::jsonb)) with ordinality r(e, n)
    left join public.questoes q on q.id::text = r.e->>'questao'
    left join public.questoes_alternativas a on a.id::text = r.e->>'alternativa'
$$;

-- Cópia dos dados do aluno (acesso e portabilidade, item 11 do aviso).
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
  public.academy_atualizar_nome(text),
  public.academy_meus_certificados(),
  public.academy_validacao_publica(text, boolean),
  public.academy__respostas_texto(jsonb),
  public.academy_meus_dados()
from public, anon, authenticated;

grant execute on function
  public.academy_atualizar_nome(text),
  public.academy_meus_certificados(),
  public.academy_validacao_publica(text, boolean),
  public.academy_meus_dados()
to authenticated;

grant execute on function
  public.academy_atualizar_nome(text),
  public.academy_meus_certificados(),
  public.academy_validacao_publica(text, boolean),
  public.academy__respostas_texto(jsonb),
  public.academy_meus_dados()
to service_role;
