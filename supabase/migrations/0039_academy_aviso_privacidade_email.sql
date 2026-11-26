-- ============================================================================
-- 0039_academy_aviso_privacidade_email.sql - e-mail de nova versão do Aviso de Privacidade (fase 27)
--
-- Pedido do Everton (26/11/2026). O Aviso de Privacidade diz, no item final,
-- que "quando houver mudança relevante, publicamos uma nova versão e avisamos
-- por e-mail quem tem conta na Academy". Até aqui esse e-mail não existia.
--
-- O que muda:
--   * tabela aviso_privacidade_comunicado (versão, resumo do que mudou): só a
--     versão que tem resumo cadastrado gera e-mail. É a trava para que uma
--     versão nova não dispare e-mail sozinha sem um texto revisado;
--   * academy_avisos_privacidade(limite): contas criadas antes da publicação
--     da versão vigente que ainda não receberam o aviso dela (uma vez por
--     conta e por versão, pela chave privacidade:<versão>);
--   * academy_avisos_registrar aceita a chave privacidade:<versão>;
--   * resumo da v2026.9 (itens 2.3 e 2.8), para o primeiro envio.
-- Quem envia é a rotina diária do academy-avisos, com o layout da Academy.
-- Não altera nem apaga dado existente.
-- ============================================================================

create table if not exists public.aviso_privacidade_comunicado (
  versao     text primary key references public.aviso_privacidade(versao),
  resumo     text not null check (length(btrim(resumo)) between 20 and 2000),
  criado_em  timestamptz not null default now()
);
comment on table public.aviso_privacidade_comunicado is
  'Resumo do que mudou em cada versão do Aviso de Privacidade, para o e-mail aos alunos. Sem resumo, a versão não gera e-mail.';
alter table public.aviso_privacidade_comunicado enable row level security;
revoke all on public.aviso_privacidade_comunicado from public, anon, authenticated;

insert into public.aviso_privacidade_comunicado (versao, resumo)
select 'v2026.9', E'Material complementar: passamos a registrar quais materiais você baixou e a data do primeiro download (item 2.3). É esse registro que libera as questões de cada módulo depois que você baixa o material.\nMeu perfil: você pode completar, se quiser, dados como cidade, empresa, cargo, tempo de experiência, uma bio curta e o seu LinkedIn (item 2.8). Todos os campos são opcionais, e você apaga cada um quando quiser. Instrutores e a gestão da sua empresa não veem o perfil.'
 where exists (select 1 from public.aviso_privacidade where versao = 'v2026.9')
on conflict (versao) do nothing;

-- Quem recebe: contas com e-mail criadas antes da publicação da versão vigente
-- (quem entrou depois já viu a versão nova), que ainda não receberam o aviso dela.
create or replace function public.academy_avisos_privacidade(p_limite integer)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(json_build_object(
           'chave', x.chave, 'email', x.email, 'nome', x.nome, 'versao', x.versao,
           'publicado_em', x.publicado_em, 'url', x.url_estavel, 'resumo', x.resumo)
           order by x.criado_em), '[]'::json)
    from (
      select 'privacidade:' || v.versao as chave, lower(u.email) as email, a.nome, v.versao,
             v.publicado_em, v.url_estavel, c.resumo, a.criado_em
        from public.aviso_privacidade v
        join public.aviso_privacidade_comunicado c on c.versao = v.versao
        join public.alunos a on a.criado_em < v.publicado_em
        join auth.users u on u.id = a.user_id
       where v.vigente
         and u.email is not null
         and not exists (select 1 from public.academy_avisos_enviados s
                          where s.chave = 'privacidade:' || v.versao and s.email = lower(u.email))
       order by a.criado_em
       limit greatest(0, least(coalesce(p_limite, 0), 300))
    ) x
$$;

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
   where coalesce(x->>'chave', '') ~ '^((concessao|empresa):[0-9a-f-]{36}:(7d|30d)|certificado:CYD-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}|aula:[0-9a-f-]{36}|privacidade:v[0-9]{4}\.[0-9]{1,3})$'
     and coalesce(x->>'email', '') <> ''
  on conflict do nothing;
  get diagnostics v_n = row_count;
  return v_n;
end $$;

revoke all on function
  public.academy_avisos_privacidade(integer),
  public.academy_avisos_registrar(jsonb)
from public, anon, authenticated;
grant execute on function
  public.academy_avisos_privacidade(integer),
  public.academy_avisos_registrar(jsonb)
to service_role;
