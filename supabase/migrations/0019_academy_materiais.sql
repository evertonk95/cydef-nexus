-- ============================================================================
-- 0019_academy_materiais.sql - Material complementar com aprovação em duas
-- pessoas (fase 11)
--
-- Regras do Everton (19/11/2026):
--   * Só quem é da equipe do curso envia arquivo (instrutor ou admin).
--   * Todo arquivo entra em quarentena e só chega ao aluno depois que uma
--     SEGUNDA pessoa aprova: o admin ou alguém da equipe marcado como
--     aprovador. Quem enviou nunca aprova o próprio arquivo, nem sendo admin.
--     Mesmo princípio de dupla checagem do CyDef Inora.
--   * Tipos aceitos: PDF, DOCX, XLSX, XLS, PPTX, CSV, MD, TXT e ZIP.
--     Documentos até 25 MB; ZIP até 50 MB (limite máximo de arquivo no
--     plano Free do Supabase; no Pro, pode subir para 100 MB trocando só
--     academy__limite_material e o file_size_limit do bucket).
--
-- Camadas:
--   1. O navegador confere tipo pelo conteúdo, tamanho e macro em arquivos do
--      Office antes de enviar, e calcula o SHA-256.
--   2. O banco recusa extensão, tipo e tamanho fora da regra; o bucket
--      recusa MIME e tamanho fora da regra.
--   3. O arquivo vai para um bucket privado, num caminho que só existe
--      depois do registro; o envio só é aceito para o registro de quem
--      envia, em estado "enviando".
--   4. Ao confirmar o envio, o banco confere o tamanho gravado no Storage.
--   5. Quarentena: aluno não lê arquivo pendente. O aprovador baixa, o
--      navegador confere o SHA-256 e lista o conteúdo do ZIP, e só então
--      aprova ou recusa (com motivo).
--   6. Aluno baixa por link assinado de 60 s, como anexo, só de curso
--      publicado em que está matriculado.
--   Toda escrita vai para academy_auditoria.
--
-- Idempotente.
-- ============================================================================

-- 1. Quem aprova --------------------------------------------------------------

alter table public.academy_equipe
  add column if not exists aprova_materiais boolean not null default false;

comment on column public.academy_equipe.aprova_materiais is 'Instrutor que também aprova material complementar. Admin aprova sempre.';

-- 2. Materiais -------------------------------------------------------------------

create table if not exists public.materiais (
  id             uuid primary key default gen_random_uuid(),
  curso_slug     text not null references public.cursos(slug) on delete cascade,
  modulo_id      uuid references public.modulos(id) on delete set null,
  titulo         text not null check (length(btrim(titulo)) between 2 and 140),
  descricao      text not null default '' check (length(descricao) <= 400),
  nome_arquivo   text not null check (length(nome_arquivo) between 3 and 160),
  extensao       text not null check (extensao in ('pdf', 'docx', 'xlsx', 'xls', 'pptx', 'csv', 'md', 'txt', 'zip')),
  mime           text not null,
  tamanho        bigint not null check (tamanho > 0),
  sha256         text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  caminho        text not null unique,
  status         text not null default 'enviando' check (status in ('enviando', 'pendente', 'aprovado', 'recusado', 'arquivado')),
  enviado_por    uuid not null,
  enviado_em     timestamptz not null default now(),
  revisado_por   uuid,
  revisado_em    timestamptz,
  motivo_recusa  text check (motivo_recusa is null or length(motivo_recusa) <= 400),
  ordem          integer not null default 0,
  check (status not in ('aprovado', 'recusado') or (revisado_por is not null and revisado_por <> enviado_por))
);
create index if not exists materiais_curso_idx on public.materiais (curso_slug, status);

comment on table public.materiais is 'Material complementar. Só chega ao aluno com status aprovado, revisado por pessoa diferente de quem enviou.';

alter table public.materiais enable row level security;
revoke all on table public.materiais from anon, authenticated, service_role;

-- 3. Regras de tipo e tamanho --------------------------------------------------

create or replace function public.academy__mime_material(p_ext text)
returns text
language sql
immutable
set search_path = public
as $$
  select case p_ext
    when 'pdf'  then 'application/pdf'
    when 'docx' then 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    when 'xlsx' then 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    when 'pptx' then 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    when 'xls'  then 'application/vnd.ms-excel'
    when 'csv'  then 'text/csv'
    when 'md'   then 'text/markdown'
    when 'txt'  then 'text/plain'
    when 'zip'  then 'application/zip'
  end
$$;

create or replace function public.academy__limite_material(p_ext text)
returns bigint
language sql
immutable
set search_path = public
as $$
  select case when p_ext = 'zip' then 50 * 1024 * 1024 else 25 * 1024 * 1024 end::bigint
$$;

-- 4. Bucket privado -------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('academy-materiais', 'academy-materiais', false, 50 * 1024 * 1024, array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'text/csv',
  'text/markdown',
  'text/plain',
  'application/zip'
])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- 5. Funções internas ---------------------------------------------------------

create or replace function public.academy__pode_aprovar()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.academy_equipe e
     where e.user_id = auth.uid() and (e.papel = 'admin' or e.aprova_materiais)
  )
$$;

-- Edita o curso (admin ou instrutor atribuído), sem levantar erro.
create or replace function public.academy__edita_curso(p_curso text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.academy_equipe e where e.user_id = auth.uid() and e.papel = 'admin')
      or exists (
           select 1 from public.academy_equipe e
             join public.academy_equipe_cursos ec on ec.user_id = e.user_id
            where e.user_id = auth.uid() and ec.curso_slug = p_curso
         )
$$;

-- Políticas do Storage: são avaliadas com o papel de quem chama, por isso as
-- consultas às tabelas fechadas ficam nestas funções.
create or replace function public.academy__pode_enviar_material(p_nome text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.materiais m
     where m.caminho = p_nome and m.status = 'enviando' and m.enviado_por = auth.uid()
       and public.academy__edita_curso(m.curso_slug)
  )
$$;

create or replace function public.academy__pode_ler_material(p_nome text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.materiais m
     where m.caminho = p_nome
       and (
         public.academy__pode_aprovar()
         or public.academy__edita_curso(m.curso_slug)
         or (
           m.status = 'aprovado'
           and exists (select 1 from public.cursos c where c.slug = m.curso_slug and c.publicado)
           and exists (select 1 from public.matriculas mt where mt.user_id = auth.uid() and mt.curso_slug = m.curso_slug)
         )
       )
  )
$$;

create or replace function public.academy__pode_apagar_material(p_nome text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.materiais m
     where m.caminho = p_nome
       and m.status in ('enviando', 'recusado', 'arquivado')
       and (public.academy__pode_aprovar() or public.academy__edita_curso(m.curso_slug))
  )
$$;

create or replace function public.academy__material_json(p_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', m.id, 'curso_slug', m.curso_slug, 'curso_titulo', c.titulo, 'modulo_id', m.modulo_id,
    'modulo_titulo', mo.titulo, 'modulo_ordem', mo.ordem,
    'titulo', m.titulo, 'descricao', m.descricao, 'nome_arquivo', m.nome_arquivo, 'extensao', m.extensao,
    'tamanho', m.tamanho, 'sha256', m.sha256, 'caminho', m.caminho, 'status', m.status, 'ordem', m.ordem,
    'enviado_em', m.enviado_em, 'enviado_por_nome', coalesce(ae.nome, ue.email),
    'enviado_por_mim', m.enviado_por = auth.uid(),
    'revisado_em', m.revisado_em, 'revisado_por_nome', coalesce(ar.nome, ur.email), 'motivo_recusa', m.motivo_recusa
  )
    from public.materiais m
    join public.cursos c on c.slug = m.curso_slug
    left join public.modulos mo on mo.id = m.modulo_id
    left join public.alunos ae on ae.user_id = m.enviado_por
    left join auth.users ue on ue.id = m.enviado_por
    left join public.alunos ar on ar.user_id = m.revisado_por
    left join auth.users ur on ur.id = m.revisado_por
   where m.id = p_id
$$;

-- 6. Políticas do Storage -----------------------------------------------------

drop policy if exists academy_materiais_enviar on storage.objects;
create policy academy_materiais_enviar on storage.objects
  for insert to authenticated
  with check (bucket_id = 'academy-materiais' and public.academy__pode_enviar_material(name));

drop policy if exists academy_materiais_ler on storage.objects;
create policy academy_materiais_ler on storage.objects
  for select to authenticated
  using (bucket_id = 'academy-materiais' and public.academy__pode_ler_material(name));

drop policy if exists academy_materiais_apagar on storage.objects;
create policy academy_materiais_apagar on storage.objects
  for delete to authenticated
  using (bucket_id = 'academy-materiais' and public.academy__pode_apagar_material(name));

-- 7. Equipe do curso: enviar, confirmar, editar e arquivar -------------------------

create or replace function public.academy_adm_materiais(p_curso text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_curso(p_curso);
  return (
    select coalesce(json_agg(public.academy__material_json(m.id) order by m.ordem, m.enviado_em), '[]'::json)
      from public.materiais m
     where m.curso_slug = p_curso and m.status <> 'enviando'
  );
end $$;

-- Registra o envio e devolve o caminho no Storage. O arquivo só pode ser
-- gravado nesse caminho, por quem registrou, enquanto o estado for "enviando".
create or replace function public.academy_adm_registrar_material(p_curso text, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid;
  v_nome  text;
  v_ext   text;
  v_tam   bigint;
  v_mod   uuid;
  v_id    uuid := gen_random_uuid();
  v_cam   text;
begin
  v_uid := public.academy__exigir_curso(p_curso);
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  -- Nome seguro: sem caminho, só letras, números, ponto, hífen e sublinhado.
  v_nome := regexp_replace(regexp_replace(coalesce(p_dados->>'nome_arquivo', ''), '^.*[\\/]', ''), '[^A-Za-z0-9._-]+', '-', 'g');
  v_nome := btrim(v_nome, '.-');
  v_ext := lower(substring(v_nome from '\.([A-Za-z0-9]+)$'));
  if v_ext is null or public.academy__mime_material(v_ext) is null then
    raise exception 'tipo_nao_permitido';
  end if;
  if length(v_nome) < 3 or length(v_nome) > 160 then
    raise exception 'nome_arquivo_invalido';
  end if;
  if coalesce(p_dados->>'mime', '') <> public.academy__mime_material(v_ext) then
    raise exception 'tipo_nao_permitido';
  end if;
  v_tam := (p_dados->>'tamanho')::bigint;
  if v_tam is null or v_tam <= 0 or v_tam > public.academy__limite_material(v_ext) then
    raise exception 'arquivo_grande';
  end if;
  if coalesce(p_dados->>'sha256', '') !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_payload';
  end if;
  v_mod := nullif(p_dados->>'modulo_id', '')::uuid;
  if v_mod is not null and not exists (select 1 from public.modulos where id = v_mod and curso_slug = p_curso) then
    raise exception 'modulo_inexistente';
  end if;

  v_cam := p_curso || '/' || v_id::text || '/' || v_nome;
  insert into public.materiais (id, curso_slug, modulo_id, titulo, descricao, nome_arquivo, extensao, mime, tamanho, sha256, caminho, enviado_por, ordem)
  values (
    v_id, p_curso, v_mod,
    public.academy__texto(p_dados->>'titulo', 2, 140, 'titulo_invalido'),
    public.academy__texto(p_dados->>'descricao', 0, 400, 'descricao_invalida'),
    v_nome, v_ext, public.academy__mime_material(v_ext), v_tam, p_dados->>'sha256', v_cam, v_uid,
    coalesce((select max(ordem) from public.materiais where curso_slug = p_curso), 0) + 1
  );
  perform public.academy__auditar('material_registrado', v_id::text, jsonb_build_object('curso', p_curso, 'arquivo', v_nome, 'sha256', p_dados->>'sha256'));
  return json_build_object('id', v_id, 'caminho', v_cam, 'mime', public.academy__mime_material(v_ext));
exception
  when invalid_text_representation or numeric_value_out_of_range then
    raise exception 'invalid_payload';
end $$;

-- Depois do upload: confere o objeto no Storage e põe em quarentena.
create or replace function public.academy_adm_confirmar_envio(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  v_m   public.materiais%rowtype;
  v_tam bigint;
begin
  select * into v_m from public.materiais where id = p_id;
  if v_m.id is null or v_m.enviado_por <> auth.uid() then
    raise exception 'material_inexistente';
  end if;
  if v_m.status <> 'enviando' then
    raise exception 'material_inexistente';
  end if;
  select (o.metadata->>'size')::bigint into v_tam
    from storage.objects o where o.bucket_id = 'academy-materiais' and o.name = v_m.caminho;
  if v_tam is null then
    raise exception 'arquivo_ausente';
  end if;
  if v_tam <> v_m.tamanho then
    raise exception 'arquivo_divergente';
  end if;
  update public.materiais set status = 'pendente' where id = p_id;
  perform public.academy__auditar('material_enviado', p_id::text, jsonb_build_object('curso', v_m.curso_slug, 'tamanho', v_tam));
  return public.academy__material_json(p_id);
end $$;

-- Título, descrição e módulo podem mudar sem nova aprovação: o arquivo não muda.
create or replace function public.academy_adm_salvar_material(p_id uuid, p_dados jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_m   public.materiais%rowtype;
  v_mod uuid;
begin
  select * into v_m from public.materiais where id = p_id;
  if v_m.id is null then
    raise exception 'material_inexistente';
  end if;
  perform public.academy__exigir_curso(v_m.curso_slug);
  if p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception 'invalid_payload';
  end if;
  v_mod := case when p_dados ? 'modulo_id' then nullif(p_dados->>'modulo_id', '')::uuid else v_m.modulo_id end;
  if v_mod is not null and not exists (select 1 from public.modulos where id = v_mod and curso_slug = v_m.curso_slug) then
    raise exception 'modulo_inexistente';
  end if;
  update public.materiais set
    titulo    = case when p_dados ? 'titulo' then public.academy__texto(p_dados->>'titulo', 2, 140, 'titulo_invalido') else titulo end,
    descricao = case when p_dados ? 'descricao' then public.academy__texto(p_dados->>'descricao', 0, 400, 'descricao_invalida') else descricao end,
    modulo_id = v_mod
  where id = p_id;
  perform public.academy__auditar('material_salvo', p_id::text, p_dados);
  return public.academy__material_json(p_id);
exception
  when invalid_text_representation then
    raise exception 'invalid_payload';
end $$;

-- Tira do ar (aprovado) ou descarta (pendente, recusado). O objeto do Storage
-- é apagado em seguida pelo painel; a linha fica para auditoria.
create or replace function public.academy_adm_arquivar_material(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_m public.materiais%rowtype;
begin
  select * into v_m from public.materiais where id = p_id;
  if v_m.id is null then
    raise exception 'material_inexistente';
  end if;
  perform public.academy__exigir_curso(v_m.curso_slug);
  update public.materiais set status = 'arquivado' where id = p_id;
  perform public.academy__auditar('material_arquivado', p_id::text, jsonb_build_object('curso', v_m.curso_slug, 'status_anterior', v_m.status));
  return public.academy__material_json(p_id);
end $$;

-- 8. Aprovação (segunda pessoa) ---------------------------------------------------

create or replace function public.academy_adm_aprovacoes()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'nao_autenticado';
  end if;
  if not public.academy__pode_aprovar() then
    raise exception 'sem_permissao';
  end if;
  return (
    select coalesce(json_agg(public.academy__material_json(m.id) order by m.enviado_em), '[]'::json)
      from public.materiais m where m.status = 'pendente'
  );
end $$;

create or replace function public.academy_adm_revisar_material(p_id uuid, p_aprovar boolean, p_motivo text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_m      public.materiais%rowtype;
  v_motivo text;
begin
  if auth.uid() is null then
    raise exception 'nao_autenticado';
  end if;
  if not public.academy__pode_aprovar() then
    raise exception 'sem_permissao';
  end if;
  select * into v_m from public.materiais where id = p_id for update;
  if v_m.id is null or v_m.status <> 'pendente' then
    raise exception 'material_inexistente';
  end if;
  if v_m.enviado_por = auth.uid() then
    raise exception 'mesma_pessoa';
  end if;
  if p_aprovar is null then
    raise exception 'invalid_payload';
  end if;
  if not p_aprovar then
    v_motivo := public.academy__texto(p_motivo, 5, 400, 'motivo_obrigatorio');
  end if;

  update public.materiais
     set status = case when p_aprovar then 'aprovado' else 'recusado' end,
         revisado_por = auth.uid(), revisado_em = now(), motivo_recusa = v_motivo
   where id = p_id;
  perform public.academy__auditar(case when p_aprovar then 'material_aprovado' else 'material_recusado' end, p_id::text,
                                  jsonb_build_object('curso', v_m.curso_slug, 'sha256', v_m.sha256, 'motivo', v_motivo));
  return public.academy_adm_aprovacoes();
end $$;

-- Admin marca quem, além dos admins, aprova material.
create or replace function public.academy_adm_definir_aprovador(p_user_id uuid, p_aprova boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.academy__exigir_admin();
  update public.academy_equipe set aprova_materiais = coalesce(p_aprova, false) where user_id = p_user_id;
  if not found then
    raise exception 'usuario_inexistente';
  end if;
  perform public.academy__auditar('aprovador_definido', p_user_id::text, jsonb_build_object('aprova', coalesce(p_aprova, false)));
  return public.academy_adm_equipe();
end $$;

-- Mesma assinatura da 0015, com aprova_materiais. Privilégios da 0015 continuam.
create or replace function public.academy_adm_eu()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'papel', e.papel,
    'aprova_materiais', e.papel = 'admin' or e.aprova_materiais,
    'cursos', case when e.papel = 'admin'
                then (select coalesce(json_agg(c.slug order by c.ordem, c.slug), '[]'::json) from public.cursos c)
                else (select coalesce(json_agg(ec.curso_slug order by ec.curso_slug), '[]'::json)
                        from public.academy_equipe_cursos ec where ec.user_id = e.user_id)
              end
  )
    from public.academy_equipe e
   where e.user_id = auth.uid()
$$;

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
             'aprova_materiais', e.aprova_materiais,
             'eu', e.user_id = auth.uid(),
             'cursos', coalesce((select json_agg(ec.curso_slug order by ec.curso_slug)
                                   from public.academy_equipe_cursos ec where ec.user_id = e.user_id), '[]'::json)
           ) order by e.papel, u.email), '[]'::json)
      from public.academy_equipe e
      join auth.users u on u.id = e.user_id
      left join public.alunos al on al.user_id = e.user_id
  );
end $$;

-- 9. Aluno ---------------------------------------------------------------------

-- Material aprovado do curso, para o aluno matriculado.
create or replace function public.academy_materiais_curso(p_curso text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.academy__aluno_no_curso(p_curso);
  return (
    select coalesce(json_agg(json_build_object(
             'id', m.id, 'modulo_id', m.modulo_id, 'titulo', m.titulo, 'descricao', m.descricao,
             'nome_arquivo', m.nome_arquivo, 'extensao', m.extensao, 'tamanho', m.tamanho,
             'sha256', m.sha256, 'caminho', m.caminho
           ) order by m.ordem, m.enviado_em), '[]'::json)
      from public.materiais m
     where m.curso_slug = p_curso and m.status = 'aprovado'
  );
end $$;

-- 10. Privilégios (padrão da 0012) -----------------------------------------

revoke all on function
  public.academy__mime_material(text),
  public.academy__limite_material(text),
  public.academy__pode_aprovar(),
  public.academy__edita_curso(text),
  public.academy__pode_enviar_material(text),
  public.academy__pode_ler_material(text),
  public.academy__pode_apagar_material(text),
  public.academy__material_json(uuid),
  public.academy_adm_materiais(text),
  public.academy_adm_registrar_material(text, jsonb),
  public.academy_adm_confirmar_envio(uuid),
  public.academy_adm_salvar_material(uuid, jsonb),
  public.academy_adm_arquivar_material(uuid),
  public.academy_adm_aprovacoes(),
  public.academy_adm_revisar_material(uuid, boolean, text),
  public.academy_adm_definir_aprovador(uuid, boolean),
  public.academy_materiais_curso(text)
from public, anon, authenticated;

-- As três de política do Storage são avaliadas como authenticated e só
-- respondem verdadeiro ou falso sobre quem chama.
grant execute on function
  public.academy__pode_enviar_material(text),
  public.academy__pode_ler_material(text),
  public.academy__pode_apagar_material(text),
  public.academy_adm_materiais(text),
  public.academy_adm_registrar_material(text, jsonb),
  public.academy_adm_confirmar_envio(uuid),
  public.academy_adm_salvar_material(uuid, jsonb),
  public.academy_adm_arquivar_material(uuid),
  public.academy_adm_aprovacoes(),
  public.academy_adm_revisar_material(uuid, boolean, text),
  public.academy_adm_definir_aprovador(uuid, boolean),
  public.academy_materiais_curso(text)
to authenticated;

grant execute on function
  public.academy__mime_material(text),
  public.academy__limite_material(text),
  public.academy__pode_aprovar(),
  public.academy__edita_curso(text),
  public.academy__pode_enviar_material(text),
  public.academy__pode_ler_material(text),
  public.academy__pode_apagar_material(text),
  public.academy__material_json(uuid),
  public.academy_adm_materiais(text),
  public.academy_adm_registrar_material(text, jsonb),
  public.academy_adm_confirmar_envio(uuid),
  public.academy_adm_salvar_material(uuid, jsonb),
  public.academy_adm_arquivar_material(uuid),
  public.academy_adm_aprovacoes(),
  public.academy_adm_revisar_material(uuid, boolean, text),
  public.academy_adm_definir_aprovador(uuid, boolean),
  public.academy_materiais_curso(text)
to service_role;
