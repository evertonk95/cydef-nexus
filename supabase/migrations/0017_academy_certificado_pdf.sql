-- ============================================================================
-- 0017_academy_certificado_pdf.sql - Certificado em PDF (fase 10)
--
-- Decisões do Everton (18/11/2026):
--   * Três modelos, um por tipo. Curso gratuito: B, Clássico claro ("claro").
--     Curso pago: C, Técnico ("tecnico"). Formação: A, Noturno ("noturno"),
--     emitido quando houver conclusão de formação (etapa futura).
--   * O instrutor pode escolher o modelo do curso nos requisitos; vazio é o
--     padrão automático acima.
--   * Selo da CyDef Academy, sem assinatura. A nota não aparece no
--     certificado nem na validação pública.
--
-- O PDF é gerado no navegador a partir do que o banco grava na emissão. O
-- modelo e o conteúdo (títulos dos módulos) ficam congelados no certificado:
-- mudar o curso depois não muda um certificado já emitido.
--
-- A validação pública (academy_validar_certificado, 0013) não muda: continua
-- devolvendo só código, nome, curso, carga horária e data (Aviso v2026.3,
-- item 4).
--
-- Idempotente.
-- ============================================================================

-- 1. Campos novos ---------------------------------------------------------------

alter table public.certificados
  add column if not exists modelo   text,
  add column if not exists conteudo text[] not null default '{}';

alter table public.cursos_requisitos
  add column if not exists modelo_certificado text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'certificados_modelo_valido') then
    alter table public.certificados add constraint certificados_modelo_valido
      check (modelo is null or modelo in ('claro', 'tecnico', 'noturno'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cursos_requisitos_modelo_valido') then
    alter table public.cursos_requisitos add constraint cursos_requisitos_modelo_valido
      check (modelo_certificado is null or modelo_certificado in ('claro', 'tecnico'));
  end if;
end $$;

comment on column public.certificados.modelo is 'Modelo visual do PDF, gravado na emissão: claro (B), tecnico (C) ou noturno (A, formação).';
comment on column public.certificados.conteudo is 'Títulos dos módulos com aula publicada no dia da emissão (modelo Técnico).';
comment on column public.cursos_requisitos.modelo_certificado is 'Vazio: automático (gratuito usa claro, pago usa tecnico).';

-- 2. Modelo e conteúdo na emissão ---------------------------------------------

create or replace function public.academy__modelo_padrao(p_curso text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select r.modelo_certificado from public.cursos_requisitos r where r.curso_slug = p_curso),
    (select case when c.gratuito then 'claro' else 'tecnico' end from public.cursos c where c.slug = p_curso),
    'claro'
  )
$$;

create or replace function public.academy__conteudo_curso(p_curso text)
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(m.titulo order by m.ordem), '{}')
    from public.modulos m
   where m.curso_slug = p_curso
     and m.ordem > 0
     and exists (select 1 from public.aulas a where a.modulo_id = m.id and a.publicado)
$$;

create or replace function public.academy__certificado_na_emissao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.modelo := coalesce(new.modelo, public.academy__modelo_padrao(new.curso_slug));
  if cardinality(new.conteudo) = 0 then
    new.conteudo := public.academy__conteudo_curso(new.curso_slug);
  end if;
  return new;
end $$;

drop trigger if exists certificados_na_emissao on public.certificados;
create trigger certificados_na_emissao
  before insert on public.certificados
  for each row execute function public.academy__certificado_na_emissao();

-- Certificados já emitidos antes desta migração recebem o padrão de hoje.
update public.certificados c
   set modelo = public.academy__modelo_padrao(c.curso_slug),
       conteudo = case when cardinality(c.conteudo) = 0 then public.academy__conteudo_curso(c.curso_slug) else c.conteudo end
 where c.modelo is null;

-- 3. Dados do próprio certificado, para o PDF ----------------------------------

-- Só o dono, e só certificado já emitido. Null se não houver.
create or replace function public.academy_meu_certificado(p_curso text)
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
    select json_build_object(
      'codigo', c.codigo,
      'nome', c.nome,
      'curso_titulo', c.curso_titulo,
      'carga_horaria_h', c.carga_horaria_h,
      'concluido_em', c.concluido_em,
      'modelo', coalesce(c.modelo, public.academy__modelo_padrao(c.curso_slug)),
      'conteudo', to_json(c.conteudo)
    )
      from public.certificados c
     where c.user_id = v_uid and c.curso_slug = p_curso
  );
end $$;

-- 4. Requisitos no painel, com o modelo ------------------------------------------
-- Mesma assinatura da 0015; acrescenta modelo_certificado ("" volta ao
-- automático). Os privilégios da 0015 continuam.

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
    modelo_certificado   = case when p_dados ? 'modelo_certificado' then nullif(p_dados->>'modelo_certificado', '') else v_r.modelo_certificado end,
    atualizado_em        = now()
  where curso_slug = p_curso;

  perform public.academy__auditar('requisitos_salvos', p_curso, p_dados);
  return public.academy_adm_curso(p_curso);
exception
  when check_violation or invalid_text_representation or numeric_value_out_of_range or not_null_violation then
    raise exception 'requisitos_invalidos';
end $$;

-- 5. Privilégios (padrão da 0012) ------------------------------------------

revoke all on function
  public.academy__modelo_padrao(text),
  public.academy__conteudo_curso(text),
  public.academy__certificado_na_emissao(),
  public.academy_meu_certificado(text)
from public, anon, authenticated;

grant execute on function public.academy_meu_certificado(text) to authenticated;

grant execute on function
  public.academy__modelo_padrao(text),
  public.academy__conteudo_curso(text),
  public.academy__certificado_na_emissao(),
  public.academy_meu_certificado(text)
to service_role;
