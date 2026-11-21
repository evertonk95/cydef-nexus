-- 0033: conta do dono da plataforma (fase 21).
--
-- Regra do Everton: a conta dele é absoluta. Dentro da plataforma ninguém
-- além dele altera o papel, o perfil, o nome, o cartão de instrutor ou os
-- acessos dela. E a conta do dono continua admin sempre, nem ele mesmo a
-- rebaixa pelo painel.
--
-- Como funciona:
--   * academy_dono guarda quem é o dono (uma linha só). A migração marca o
--     primeiro admin cadastrado, que é o Everton (entrou por SQL depois da
--     0015). Trocar o dono só por SQL no banco, nunca pela plataforma.
--   * Um gatilho nas tabelas da conta recusa com 'conta_protegida' qualquer
--     mudança numa linha do dono feita por outra pessoa logada. Por estar nas
--     tabelas, vale para as funções de hoje e para as que vierem.
--   * Sem usuário logado (service_role: webhook da Hotmart, tarefas agendadas,
--     SQL no painel do Supabase) o gatilho não interfere. Isso é fora da
--     plataforma e só a CyDef tem acesso.
--   * Vínculo com empresa cliente (academy_empresa_membros e as concessões de
--     origem 'empresa') segue o contrato da empresa e fica de fora.

-- 1. Quem é o dono ----------------------------------------------------------------------------

create table if not exists public.academy_dono (
  unico        boolean primary key default true check (unico),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  definido_em  timestamptz not null default now()
);
alter table public.academy_dono enable row level security;
revoke all on table public.academy_dono from public, anon, authenticated;
grant all on table public.academy_dono to service_role;

insert into public.academy_dono (user_id)
select e.user_id
  from public.academy_equipe e
 where e.papel = 'admin'
 order by e.criado_em, e.user_id
 limit 1
on conflict (unico) do nothing;

create or replace function public.academy__dono()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select user_id from public.academy_dono where unico
$$;

-- 2. Proteção nas tabelas ---------------------------------------------------------------------

create or replace function public.academy__proteger_dono()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ator   uuid := auth.uid();
  v_dono   uuid;
  v_email  text;
  v_velho  jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_novo   jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
begin
  -- Fora da plataforma (service_role, SQL no painel): sem restrição.
  if v_ator is null then
    return coalesce(new, old);
  end if;
  v_dono := public.academy__dono();
  if v_dono is null then
    return coalesce(new, old);
  end if;

  -- Concessão que vem de contrato de empresa segue o contrato.
  if tg_table_name = 'academy_concessoes'
     and coalesce(v_velho->>'origem', v_novo->>'origem') = 'empresa'
     and coalesce(v_novo->>'origem', v_velho->>'origem') = 'empresa' then
    return coalesce(new, old);
  end if;

  select lower(email) into v_email from auth.users where id = v_dono;

  if (v_velho->>'user_id')::uuid is not distinct from v_dono and v_velho is not null
     or (v_novo->>'user_id')::uuid is not distinct from v_dono and v_novo is not null
     or (v_email is not null and (lower(v_velho->>'email') = v_email or lower(v_novo->>'email') = v_email)) then
    if v_ator <> v_dono then
      raise exception 'conta_protegida';
    end if;
    -- O dono continua admin sempre, nem ele mesmo se rebaixa pela plataforma.
    if tg_table_name = 'academy_equipe'
       and (tg_op = 'DELETE' or v_novo->>'papel' <> 'admin') then
      raise exception 'dono_sempre_admin';
    end if;
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists academy_equipe_dono on public.academy_equipe;
create trigger academy_equipe_dono
  before insert or update or delete on public.academy_equipe
  for each row execute function public.academy__proteger_dono();

drop trigger if exists academy_equipe_cursos_dono on public.academy_equipe_cursos;
create trigger academy_equipe_cursos_dono
  before insert or update or delete on public.academy_equipe_cursos
  for each row execute function public.academy__proteger_dono();

drop trigger if exists alunos_dono on public.alunos;
create trigger alunos_dono
  before update or delete on public.alunos
  for each row execute function public.academy__proteger_dono();

drop trigger if exists academy_perfis_dono on public.academy_perfis;
create trigger academy_perfis_dono
  before insert or update or delete on public.academy_perfis
  for each row execute function public.academy__proteger_dono();

drop trigger if exists academy_concessoes_dono on public.academy_concessoes;
create trigger academy_concessoes_dono
  before insert or update or delete on public.academy_concessoes
  for each row execute function public.academy__proteger_dono();

drop trigger if exists instrutores_dono on public.instrutores;
create trigger instrutores_dono
  before insert or update or delete on public.instrutores
  for each row execute function public.academy__proteger_dono();

-- 3. Para a tela saber quem é o dono (só admin) -----------------------------------------------

create or replace function public.academy_adm_dono()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid  uuid;
  v_dono uuid;
begin
  v_uid := public.academy__exigir_admin();
  v_dono := public.academy__dono();
  return json_build_object('user_id', v_dono, 'eu', v_dono is not null and v_dono = v_uid);
end $$;

-- 4. Privilégios ------------------------------------------------------------------------------

revoke all on function
  public.academy__dono(),
  public.academy__proteger_dono(),
  public.academy_adm_dono()
  from public, anon, authenticated;

grant execute on function public.academy_adm_dono() to authenticated, service_role;
grant execute on function public.academy__dono(), public.academy__proteger_dono() to service_role;
