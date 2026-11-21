-- ============================================================================
-- 0028_academy_emails_certificado_aula.sql - E-mails de certificado emitido e
-- de aula nova (fase 18)
--
-- Decisões do Everton (20/11/2026):
--   * certificado emitido: e-mail sempre, faz parte do serviço;
--   * aula nova: só para quem ligar o aviso em Minha conta (começa desligado);
--   * os dois saem na rotina diária academy-avisos (GitHub, 41 11 UTC), junto
--     com os avisos de vencimento da fase 17;
--   * aula nova tem teto diário (na função academy-avisos), para deixar folga
--     no limite do Resend para o link de login; o que passar sai no dia
--     seguinte.
--
-- O que muda:
--   1. aulas.publicada_em: preenchida por gatilho quando a aula passa a
--      publicada. Aulas já publicadas ficam com null e não geram aviso.
--   2. alunos.aviso_aula_nova_desde: null = desligado. Só avisa aula
--      publicada depois de o aluno ligar.
--   3. academy_meus_avisos e academy_definir_aviso_aula_nova (aluno).
--   4. academy_avisos_certificados e academy_avisos_aulas (service_role),
--      e academy_avisos_registrar aceitando as chaves novas.
--   5. Certificados já emitidos ficam marcados como avisados, para a primeira
--      rodada não mandar e-mail de certificado antigo.
--
-- Registro dos envios: academy_avisos_enviados (0024), com as chaves
-- certificado:<codigo> e aula:<id da aula>, uma por e-mail.
--
-- Privilégios no padrão da 0012. Idempotente.
-- ============================================================================

-- 1. Data de publicação da aula ----------------------------------------------------

alter table public.aulas add column if not exists publicada_em timestamptz;
comment on column public.aulas.publicada_em is
  'Quando a aula passou a publicada (gatilho academy__marcar_publicacao). Null nas aulas publicadas antes da 0028.';

create or replace function public.academy__marcar_publicacao()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.publicado and (tg_op = 'INSERT' or not old.publicado) then
    new.publicada_em := now();
  end if;
  return new;
end $$;

drop trigger if exists aulas_marcar_publicacao on public.aulas;
create trigger aulas_marcar_publicacao
  before insert or update of publicado on public.aulas
  for each row execute function public.academy__marcar_publicacao();

-- 2. Preferência do aluno ----------------------------------------------------------

alter table public.alunos add column if not exists aviso_aula_nova_desde timestamptz;
comment on column public.alunos.aviso_aula_nova_desde is
  'Aviso por e-mail de aula nova: null = desligado (padrão). Data em que o aluno ligou.';

-- 3. Funções do aluno --------------------------------------------------------------

create or replace function public.academy_meus_avisos()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_desde timestamptz;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  select a.aviso_aula_nova_desde into v_desde from public.alunos a where a.user_id = v_uid;
  if not found then
    raise exception 'sem_cadastro';
  end if;
  return json_build_object('aula_nova', v_desde is not null, 'aula_nova_desde', v_desde);
end $$;

create or replace function public.academy_definir_aviso_aula_nova(p_ligado boolean)
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
  if p_ligado is null then
    raise exception 'invalid_payload';
  end if;
  update public.alunos
     set aviso_aula_nova_desde = case
           when p_ligado then coalesce(aviso_aula_nova_desde, now())
           else null end
   where user_id = v_uid;
  if not found then
    raise exception 'sem_cadastro';
  end if;
  return public.academy_meus_avisos();
end $$;

-- 4. Funções da rotina diária (service_role) ---------------------------------------

-- Certificados emitidos nos últimos 14 dias que ainda não tiveram e-mail:
-- { chave, email, nome, curso, curso_slug, codigo, carga_horaria_h, concluido_em, validacao_publica }.
create or replace function public.academy_avisos_certificados()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(json_build_object(
           'chave', x.chave, 'email', x.email, 'nome', x.nome, 'curso', x.curso_titulo,
           'curso_slug', x.curso_slug, 'codigo', x.codigo, 'carga_horaria_h', x.carga_horaria_h,
           'concluido_em', x.concluido_em, 'validacao_publica', x.validacao_publica)
           order by x.emitido_em), '[]'::json)
    from (
      select 'certificado:' || c.codigo as chave, lower(u.email) as email, c.nome, c.curso_titulo,
             c.curso_slug, c.codigo, c.carga_horaria_h, c.concluido_em, c.validacao_publica, c.emitido_em
        from public.certificados c
        join auth.users u on u.id = c.user_id
       where c.emitido_em > now() - interval '14 days'
         and u.email is not null
         and not exists (select 1 from public.academy_avisos_enviados s
                          where s.chave = 'certificado:' || c.codigo and s.email = lower(u.email))
       order by c.emitido_em
       limit 300
    ) x
$$;

-- Aulas novas por aluno e curso, para quem ligou o aviso:
-- { email, nome, curso, curso_slug, aulas: [{ chave, numero, titulo }] }.
-- Uma linha = um e-mail. p_limite (1 a 300) é o teto de e-mails da rodada.
-- Regras: aula publicada há pelo menos 30 minutos (tempo para o instrutor
-- desfazer) e há no máximo 14 dias, em curso publicado; aluno matriculado
-- antes da publicação e com o aviso ligado antes dela; sem e-mail já enviado
-- para aquela aula.
create or replace function public.academy_avisos_aulas(p_limite integer)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with novas as (
    select m.user_id, lower(u.email) as email, al.nome, cu.slug as curso_slug, cu.titulo as curso,
           a.id, a.numero, a.titulo, a.publicada_em
      from public.aulas a
      join public.modulos mo on mo.id = a.modulo_id
      join public.cursos cu on cu.slug = mo.curso_slug and cu.publicado
      join public.matriculas m on m.curso_slug = cu.slug and m.criado_em <= a.publicada_em
      join public.alunos al on al.user_id = m.user_id
                           and al.aviso_aula_nova_desde is not null
                           and al.aviso_aula_nova_desde <= a.publicada_em
      join auth.users u on u.id = m.user_id and u.email is not null
     where a.publicado
       and a.publicada_em is not null
       and a.publicada_em <= now() - interval '30 minutes'
       and a.publicada_em > now() - interval '14 days'
       and not exists (select 1 from public.academy_avisos_enviados s
                        where s.chave = 'aula:' || a.id and s.email = lower(u.email))
  ),
  grupos as (
    select n.email, min(n.nome) as nome, n.curso_slug, min(n.curso) as curso, min(n.publicada_em) as primeira,
           json_agg(json_build_object('chave', 'aula:' || n.id, 'numero', n.numero, 'titulo', n.titulo)
                    order by n.numero) as aulas
      from novas n
     group by n.email, n.curso_slug
  )
  select coalesce(json_agg(json_build_object(
           'email', g.email, 'nome', g.nome, 'curso', g.curso, 'curso_slug', g.curso_slug, 'aulas', g.aulas)
           order by g.primeira, g.email), '[]'::json)
    from (select * from grupos order by primeira, email limit greatest(1, least(coalesce(p_limite, 0), 300))) g
$$;

-- Registro dos envios: aceita também as chaves da fase 18.
create or replace function public.academy_avisos_registrar(p_itens jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  if p_itens is null or jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) > 300 then
    raise exception 'invalid_payload';
  end if;
  insert into public.academy_avisos_enviados (chave, email)
  select left(x->>'chave', 120), lower(left(x->>'email', 254))
    from jsonb_array_elements(p_itens) x
   where coalesce(x->>'chave', '') ~ '^((concessao|empresa):[0-9a-f-]{36}:(7d|30d)|certificado:CYD-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}|aula:[0-9a-f-]{36})$'
     and coalesce(x->>'email', '') <> ''
  on conflict do nothing;
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- 5. Certificados já emitidos não geram e-mail na primeira rodada -----------------

insert into public.academy_avisos_enviados (chave, email)
select 'certificado:' || c.codigo, lower(u.email)
  from public.certificados c join auth.users u on u.id = c.user_id
 where u.email is not null
on conflict do nothing;

-- 6. Privilégios (padrão da 0012) ---------------------------------------------------

revoke all on function
  public.academy__marcar_publicacao(),
  public.academy_meus_avisos(),
  public.academy_definir_aviso_aula_nova(boolean),
  public.academy_avisos_certificados(),
  public.academy_avisos_aulas(integer),
  public.academy_avisos_registrar(jsonb)
  from public, anon, authenticated;

grant execute on function
  public.academy_meus_avisos(),
  public.academy_definir_aviso_aula_nova(boolean)
  to authenticated, service_role;

grant execute on function
  public.academy__marcar_publicacao(),
  public.academy_avisos_certificados(),
  public.academy_avisos_aulas(integer),
  public.academy_avisos_registrar(jsonb)
  to service_role;
