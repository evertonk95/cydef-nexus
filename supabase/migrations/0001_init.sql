-- ============================================================================
-- CyDef Academy — Fase Protótipo/Validação
-- 0001_init.sql — schema aditivo (nenhuma alteração destrutiva; ADR-005)
--
-- REPO PÚBLICO: este arquivo NÃO contém segredos. Credenciais vivem apenas em
-- env/secret manager (HEL-M03). Toda migração é aditiva e compatível com a
-- evolução para o MVP (alunos/progresso).
-- ============================================================================

-- pgcrypto para gen_random_uuid e digest (sha256)
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

-- Aviso de Privacidade versionado (HEL-M01/SEC-003):
-- conteúdo imutável por versão; hash computado por trigger a partir do
-- conteúdo armazenado (hash == conteúdo servido, sem drift).
create table if not exists public.aviso_privacidade (
  versao        text primary key,
  conteudo      text not null,
  hash_sha256   text not null,
  url_estavel   text not null,
  vigente       boolean not null default false,
  publicado_em  timestamptz not null default now()
);

create or replace function public.aviso_calcula_hash() returns trigger
language plpgsql as $$
begin
  new.hash_sha256 := encode(digest(new.conteudo, 'sha256'), 'hex');
  return new;
end $$;

drop trigger if exists trg_aviso_calcula_hash on public.aviso_privacidade;
create trigger trg_aviso_calcula_hash
  before insert or update of conteudo on public.aviso_privacidade
  for each row execute function public.aviso_calcula_hash();

-- Imutabilidade do conteúdo publicado (HEL-M01): a coluna `vigente` pode ser
-- alternada (publicar nova versão desativa a anterior), mas o conteúdo de uma
-- versão publicada nunca é sobrescrito.
create or replace function public.aviso_conteudo_imutavel() returns trigger
language plpgsql as $$
begin
  raise exception 'conteúdo de aviso publicado é imutável (HEL-M01): nova versão = nova linha';
end $$;

drop trigger if exists trg_aviso_conteudo_imutavel on public.aviso_privacidade;
create trigger trg_aviso_conteudo_imutavel
  before update of conteudo on public.aviso_privacidade
  for each row execute function public.aviso_conteudo_imutavel();

-- Leads (coleta mínima: nome, e-mail, perfil — SEC-002)
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  email       text not null,
  perfil      text not null check (perfil in ('iniciante','transicao','profissional','estudante','outro')),
  status      text not null default 'pending_confirmation'
              check (status in ('pending_confirmation','confirmed','invalid','descartado')),
  source      text,
  request_id  text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists leads_email_norm_idx on public.leads (lower(email));

-- Registro de consentimento — IMUTÁVEL em profundidade (HEL-M03):
-- sem grants de UPDATE/DELETE para nenhuma role + trigger que nega (qualquer role).
create table if not exists public.consentimentos (
  id                uuid primary key default gen_random_uuid(),
  lead_id           uuid not null references public.leads(id),
  aceito            boolean not null,
  versao_aviso      text not null,
  hash_aviso        text not null,
  data_hora         timestamptz not null default now(),  -- relógio do servidor (M01)
  declaracao_idade  boolean not null,
  ip_truncado       text
);

create or replace function public.consentimentos_imutavel() returns trigger
language plpgsql as $$
begin
  raise exception 'consentimentos é imutável (HEL-M03): UPDATE/DELETE bloqueado';
end $$;

drop trigger if exists trg_consentimentos_imutavel on public.consentimentos;
create trigger trg_consentimentos_imutavel
  before update or delete on public.consentimentos
  for each row execute function public.consentimentos_imutavel();

-- Tokens de confirmação (HEL-M02/M05, SEC-007):
-- apenas hash SHA-256 armazenado; TTL 48h; uso único; contador de falhas (20 → invalida).
create table if not exists public.tokens_confirmacao (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id),
  token_hash  text not null unique,
  expira_em   timestamptz not null,
  usado_em    timestamptz,
  falhas      integer not null default 0,
  criado_em   timestamptz not null default now()
);

-- Rate limit events (SEC-006/HEL-M05): apenas hashes, sem PII.
create table if not exists public.rate_limit_events (
  chave          text primary key,
  contador       integer not null default 1,
  janela_inicio  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS deny-by-default (HEL-M03/M07, SEC-009):
-- RLS habilitado SEM policies em todas as tabelas → nenhuma role acessa via RLS.
-- ---------------------------------------------------------------------------
alter table public.leads                enable row level security;
alter table public.consentimentos       enable row level security;
alter table public.tokens_confirmacao   enable row level security;
alter table public.aviso_privacidade    enable row level security;
alter table public.rate_limit_events    enable row level security;

-- Revoga DML direto de tabela de TODAS as roles (M03): anon/authenticated/
-- service_role não têm SELECT/INSERT/UPDATE/DELETE nas tabelas. O acesso de
-- escrita ocorre SOMENTE via RPC `security definer` (owner = postgres).
revoke all on table public.leads,
                public.consentimentos,
                public.tokens_confirmacao,
                public.aviso_privacidade,
                public.rate_limit_events
  from anon, authenticated, service_role;

-- Grants de EXECUTE das RPCs são declarados na migração de cada função
-- (0002/0003/0004): por padrão o Postgres concede EXECUTE a PUBLIC na criação,
-- então cada migração revoga de PUBLIC e concede apenas à role de função
-- (service_role restrito por grants; chave nunca no repo público — M03).

-- Seed do Aviso de Privacidade v2026.1 (RASCUNHO — texto final depende de
-- parecer jurídico/DPO antes do go-live, SEC-003). O trigger calcula o hash
-- a partir do conteúdo armazenado. O conteúdo servido na landing
-- (src/lib/academy/consent.ts) deve ser idêntico a este na versão vigente —
-- verificação no checklist de go-live (S-08) e teste automatizado
-- (src/lib/academy/migration-consistency.test.ts).
--
-- >>> AVISO_SEED_BEGIN
insert into public.aviso_privacidade (versao, conteudo, url_estavel, vigente)
values (
  'v2026.1',
  E'# Aviso de Privacidade — CyDef Academy · Pré-inscrição\n\n> **RASCUNHO v2026.1 — aguarda revisão jurídica/DPO antes do go-live.**\n> Este texto é a versão de referência para build e testes; o conteúdo final\n> publicado pode divergir e, se divergir, receberá nova versão (URL nova),\n> preservando a imutabilidade por versão (HEL-M01).\n\n## 1. Quem é o controlador\n\nA CyDef (www.cydef.com.br) é a controladora dos dados pessoais tratados nesta\npágina de pré-inscrição.\n\n## 2. Quais dados coletamos e para quê\n\nColetamos apenas: nome completo, e-mail e perfil declarado (iniciante, em\ntransição para SOC, profissional ativo, estudante ou outro). Finalidade:\nprocessar sua pré-inscrição nos cursos gratuitos de entrada da CyDef Academy,\nenviar o e-mail de confirmação (token de validação com validade de 48 horas) e,\nse você for selecionado, acompanhar a entrega assistida do curso gratuito.\n\nNão coletamos CPF, dados financeiros, dados sensíveis (art. 5º II, LGPD) nem\nconteúdo de mensagens. Esta página é destinada a maiores de 16 anos.\n\n## 3. Base legal\n\nConsentimento (art. 7º I, LGPD), manifestado pelo opt-in explícito e não\npré-marcado. O registro do consentimento (aceite, data/hora, versão deste\naviso, hash do conteúdo e declaração de idade) é armazenado de forma imutável\npara comprovação de conformidade.\n\n## 4. Compartilhamento\n\nNão compartilhamos seus dados com terceiros para fins de marketing. O\nprocessamento técnico (armazenamento e envio de e-mail) é feito por provedores\ncom função de operador, com contratos e medidas de segurança adequadas.\n\n## 5. Retenção\n\nSeus dados serão mantidos durante a fase de validação (pré-inscrição e coorte)\ne por até 30 dias após o relatório de decisão GO/NO-GO, salvo obrigação legal.\nO registro de consentimento é mantido enquanto o dado associado existir.\nApós esse prazo, os dados são descartados ou anonimizados.\n\n## 6. Seus direitos (art. 18–22, LGPD)\n\nVocê pode solicitar confirmação, acesso, correção, anonimização, portabilidade,\neliminação ou revogação do consentimento a qualquer momento pelo canal de\ndireitos: privacidade@cydef.com.br (canal a ser validado no go-live). Também\npode reclamar à ANPD.\n\n## 7. Segurança\n\nAdotamos controles de segurança e privacidade por design: acesso restrito à\nbase (RLS), registro imutável de consentimento, token de confirmação de uso\núnico e sem dados pessoais em logs ou métricas.\n\n## 8. Contato do encarregado\n\nprivacidade@cydef.com.br — respondemos no prazo legal.\n\n_Última atualização: 2026-08-24 (v2026.1)_',
  '/academy/privacidade/v2026.1',
  true
)
on conflict (versao) do nothing;
>>> AVISO_SEED_END
