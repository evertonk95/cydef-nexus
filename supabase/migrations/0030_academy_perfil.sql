-- ============================================================================
-- 0030_academy_perfil.sql - Meu perfil (fase 19)
--
-- Pedido do Everton (21/11/2026): uma página onde o aluno, de qualquer papel,
-- completa o próprio perfil. Só o nome é obrigatório (já existia em alunos);
-- o resto é opcional e o aluno apaga quando quiser.
--
--   Contato:   telefone, cidade, país
--   Pessoal:   data de nascimento (16 anos ou mais, como na pré-inscrição)
--   Trabalho:  empresa, cargo, área de atuação, tempo de experiência
--   Sobre:     bio curta e LinkedIn
--
-- O e-mail é o login e não muda por aqui. Quem vê o perfil: o próprio aluno
-- e, na fase 20, os administradores (que editam tudo, menos o e-mail).
-- Instrutor e gestão de empresa não veem. Aviso de Privacidade v2026.8 (0031).
--
-- A tabela é fechada; só as funções leem e gravam. A validação fica em uma
-- função interna (academy__salvar_perfil), que a fase 20 reaproveita para o
-- admin. Apagar a conta apaga o perfil (on delete cascade).
--
-- Privilégios no padrão da 0012. Idempotente.
-- ============================================================================

create table if not exists public.academy_perfis (
  user_id          uuid primary key references public.alunos(user_id) on delete cascade,
  data_nascimento  date,
  telefone         text check (telefone is null or length(telefone) <= 20),
  cidade           text check (cidade is null or length(cidade) <= 80),
  pais             text check (pais is null or length(pais) <= 60),
  empresa          text check (empresa is null or length(empresa) <= 120),
  cargo            text check (cargo is null or length(cargo) <= 120),
  area             text check (area is null or area in
                     ('seguranca', 'infraestrutura', 'desenvolvimento', 'dados', 'suporte', 'gestao', 'estudante', 'outra')),
  experiencia      text check (experiencia is null or experiencia in ('menos_1', '1_3', '3_5', '5_10', 'mais_10')),
  bio              text check (bio is null or length(bio) <= 600),
  linkedin         text check (linkedin is null or length(linkedin) <= 200),
  atualizado_em    timestamptz not null default now()
);

comment on table public.academy_perfis is
  'Perfil opcional do aluno (fase 19). Lido e gravado só pelas funções academy_meu_perfil, academy_salvar_meu_perfil e, na fase 20, pelas do admin.';

alter table public.academy_perfis enable row level security;
revoke all on table public.academy_perfis from public, anon, authenticated;
grant all on table public.academy_perfis to service_role;

-- Texto opcional: vazio vira null, espaços repetidos viram um só.
create or replace function public.academy__texto_opcional(p_valor text, p_max integer, p_erro text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  v text := nullif(regexp_replace(btrim(coalesce(p_valor, '')), '\s+', ' ', 'g'), '');
begin
  if v is not null and length(v) > p_max then
    raise exception '%', p_erro;
  end if;
  return v;
end $$;

-- Perfil de um usuário, com o e-mail do login (só leitura).
create or replace function public.academy__perfil(p_user uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'nome', al.nome,
    'email', u.email,
    'data_nascimento', p.data_nascimento,
    'telefone', p.telefone,
    'cidade', p.cidade,
    'pais', p.pais,
    'empresa', p.empresa,
    'cargo', p.cargo,
    'area', p.area,
    'experiencia', p.experiencia,
    'bio', p.bio,
    'linkedin', p.linkedin,
    'atualizado_em', p.atualizado_em
  )
    from public.alunos al
    join auth.users u on u.id = al.user_id
    left join public.academy_perfis p on p.user_id = al.user_id
   where al.user_id = p_user
$$;

-- Validação e gravação, usadas pelo aluno e (fase 20) pelo admin.
-- p_dados traz o perfil inteiro: campo ausente ou vazio fica sem valor.
create or replace function public.academy__salvar_perfil(p_user uuid, p_dados jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nome     text := regexp_replace(btrim(coalesce(p_dados->>'nome', '')), '\s+', ' ', 'g');
  v_tel      text := public.academy__texto_opcional(p_dados->>'telefone', 20, 'telefone_invalido');
  v_nasc_txt text := nullif(btrim(coalesce(p_dados->>'data_nascimento', '')), '');
  v_nasc     date;
  v_area     text := nullif(btrim(coalesce(p_dados->>'area', '')), '');
  v_exp      text := nullif(btrim(coalesce(p_dados->>'experiencia', '')), '');
  v_link     text := public.academy__texto_opcional(p_dados->>'linkedin', 200, 'linkedin_invalido');
  v_bio      text := nullif(btrim(regexp_replace(coalesce(p_dados->>'bio', ''), '\r\n?', E'\n', 'g')), '');
begin
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;
  if length(v_nome) not between 2 and 80 then
    raise exception 'nome_invalido';
  end if;
  if v_tel is not null and (v_tel !~ '^\+?[0-9 ().-]{8,20}$'
                            or length(regexp_replace(v_tel, '[^0-9]', '', 'g')) not between 8 and 15) then
    raise exception 'telefone_invalido';
  end if;
  if v_nasc_txt is not null then
    if v_nasc_txt !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'nascimento_invalido';
    end if;
    begin
      v_nasc := v_nasc_txt::date;
    exception when others then
      raise exception 'nascimento_invalido';
    end;
    if v_nasc < date '1900-01-01' or v_nasc > (current_date - interval '16 years')::date then
      raise exception 'nascimento_invalido';
    end if;
  end if;
  if v_area is not null and v_area not in ('seguranca', 'infraestrutura', 'desenvolvimento', 'dados', 'suporte', 'gestao', 'estudante', 'outra') then
    raise exception 'campo_invalido';
  end if;
  if v_exp is not null and v_exp not in ('menos_1', '1_3', '3_5', '5_10', 'mais_10') then
    raise exception 'campo_invalido';
  end if;
  if v_link is not null and v_link !~ '^https://([a-z]{2,3}\.)?linkedin\.com/in/[A-Za-z0-9_%-]{3,100}/?$' then
    raise exception 'linkedin_invalido';
  end if;
  if v_bio is not null and length(v_bio) > 600 then
    raise exception 'bio_invalida';
  end if;

  update public.alunos set nome = v_nome where user_id = p_user;
  if not found then
    raise exception 'sem_cadastro';
  end if;

  insert into public.academy_perfis as p
         (user_id, data_nascimento, telefone, cidade, pais, empresa, cargo, area, experiencia, bio, linkedin, atualizado_em)
  values (p_user, v_nasc, v_tel,
          public.academy__texto_opcional(p_dados->>'cidade', 80, 'campo_invalido'),
          public.academy__texto_opcional(p_dados->>'pais', 60, 'campo_invalido'),
          public.academy__texto_opcional(p_dados->>'empresa', 120, 'campo_invalido'),
          public.academy__texto_opcional(p_dados->>'cargo', 120, 'campo_invalido'),
          v_area, v_exp, v_bio, v_link, now())
  on conflict (user_id) do update set
    data_nascimento = excluded.data_nascimento, telefone = excluded.telefone, cidade = excluded.cidade,
    pais = excluded.pais, empresa = excluded.empresa, cargo = excluded.cargo, area = excluded.area,
    experiencia = excluded.experiencia, bio = excluded.bio, linkedin = excluded.linkedin,
    atualizado_em = now();
end $$;

-- Funções do aluno ---------------------------------------------------------------

create or replace function public.academy_meu_perfil()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v     json;
begin
  if v_uid is null then
    raise exception 'nao_autenticado';
  end if;
  v := public.academy__perfil(v_uid);
  if v is null then
    raise exception 'sem_cadastro';
  end if;
  return v;
end $$;

create or replace function public.academy_salvar_meu_perfil(p_dados jsonb)
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
  perform public.academy__salvar_perfil(v_uid, p_dados);
  return public.academy__perfil(v_uid);
end $$;

-- Privilégios (padrão da 0012) -----------------------------------------------------

revoke all on function
  public.academy__texto_opcional(text, integer, text),
  public.academy__perfil(uuid),
  public.academy__salvar_perfil(uuid, jsonb),
  public.academy_meu_perfil(),
  public.academy_salvar_meu_perfil(jsonb)
  from public, anon, authenticated;

grant execute on function
  public.academy_meu_perfil(),
  public.academy_salvar_meu_perfil(jsonb)
  to authenticated, service_role;

grant execute on function
  public.academy__texto_opcional(text, integer, text),
  public.academy__perfil(uuid),
  public.academy__salvar_perfil(uuid, jsonb)
  to service_role;
