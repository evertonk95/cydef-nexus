# Proteções Administrativas do Repositório — Passo a Passo

> **Davi Desenvolvimento** · Step 15 (remediação) · 2026-08-24
> Achados: **F-02 (Low — processo)** e pendência A-02 da Helena (push protection,
> branch protection, environment reviewers). Este documento é o **passo a passo de
> configuração** — exige papel **admin do repositório** e **não foi executado**
> (ação externa, fora da autorização de build). Executar **antes do primeiro merge**
> para `main` (gate de go-live S-10).

## Por que

- `deploy.yml` **já declara** `environment: github-pages` no job de deploy — sem
  config de ambiente, **qualquer push em `main` publica automaticamente**.
- O CI (lint/typecheck/testes/build/SCA/SBOM/gitleaks) e o SAST novo (semgrep)
  só protegem de verdade se forem **status checks obrigatórios** na branch.
- Sem push protection, um segredo commitado por engano passa pelo gitleaks do PR
  se o autor for admin/collaborator com bypass.

## Pré-requisitos

1. Conta com papel **Admin** no repositório `cydef-nexus` (Everton).
2. GitHub Advanced Security **não é obrigatório** para push protection em repos
   públicos; em repos privados, secret scanning/push protection exigem GHAS
   (verificar plano — se privado, sem GHAS, usar branch protection + gitleaks
   como compensação documentada).
3. Workflows já versionados: `ci.yml`, `gitleaks-history.yml`, `sast.yml`,
   `deploy.yml` (actions pinadas por SHA — HEL-L07).

## Passo 1 — Branch protection em `main`

Settings → Branches → Branch protection rules → **Add rule** → branch `main`:

- [x] **Require a pull request before merging** — required approvals: **1**
  (sem self-approve para o autor).
- [x] **Dismiss stale pull request approvals when new commits are pushed**.
- [x] **Require status checks to pass before merging** — marcar **todos**:
  - `CI — quality & security gates` (ci.yml: lint/typecheck/testes/build/SCA/SBOM)
  - `Gitleaks — secret scan (HEL-M04)` (job `gitleaks` do ci.yml)
  - `SAST — semgrep` (sast.yml)
- [x] **Require conversation resolution**.
- [x] **Do not allow bypassing the above settings** (desmarcar "Allow specified
  actors to bypass" — admin também passa pelo PR).
- [ ] **Require signed commits** — opcional; registrar como melhoria futura
  (alvo SLSA Build L2).

## Passo 2 — Environment `github-pages` com reviewers

Settings → Environments → `github-pages` (criado implicitamente pelo deploy.yml):

- [x] **Deployment branches**: `main` (somente main pode disparar o deploy).
- [x] **Required reviewers**: adicionar **Everton** (e opcionalmente Helena) —
  proteção de ambiente exige conta **Pro/Team/Enterprise** no plano atual do
  dono do repo; se o plano não suportar, registrar limitação e compensar com o
  branch protection do Passo 1 (única pessoa com acesso de deploy = Everton).
- [x] **Wait timer**: 0 min (não há necessidade de janela no protótipo).

Efeito: merge em `main` não publica sozinho — o deploy fica **aguardando
aprovação dos reviewers** na aba Environments.

## Passo 3 — Secret scanning + push protection

Settings → Code security and analysis:

- [x] **Secret scanning** — Enable (alertas).
- [x] **Push protection** — Enable (bloqueia push com segredo detectado;
  permite "bypass" apenas com justificativa por push, auditado).
- Verificar **Custom patterns** sugeridas: `supabase` service_role key
  (formato `sb_secret_…`), chave `age` do backup (HEL-L05), chave Resend
  (`re_…`), API key do Local REST API do Obsidian (não deve entrar no repo).

## Passo 4 — Verificação pós-configuração (antes do merge)

1. Abrir um PR de teste da branch `feat/academy-landing-slices` → conferir que
   os status checks obrigatórios aparecem e que o merge fica bloqueado sem
   aprovação.
2. Tentar `git push` com um segredo falso em arquivo temporário → confirmar que
   o push protection bloqueia (usar valor sintético `chave-teste` do
   `.gitleaks.toml` ou um formato de alta confiança, ex. `ghp_`).
3. Confirmar no PR que `Gitleaks` roda e que o ambiente `github-pages` fica
   **pending** até aprovação do reviewer.
4. Registrar o resultado no checklist S-08 (gate 8/10) e reportar à Helena.

## Compensações enquanto as proteções não estiverem ativas

- Nada é pushado/mergeado até autorização explícita de Everton (gate A-02/A-10).
- gitleaks já roda em PR (ci.yml) + histórico semanal (gitleaks-history.yml) +
  pre-commit local — o risco residual sem push protection é **janela entre
  commit local e push**, mitigada pelo pre-commit e pela revisão manual.
- Exposição de segredo = incidente (runbook S-08: rotação imediata + purga só
  com aprovação explícita).

## Responsáveis e prazo

| Item | Quem executa | Quando |
|---|---|---|
| Passos 1–4 acima | Everton (admin do repo) | **Antes do primeiro merge** (gate S-10) |
| Verificação da configuração | Davi + Vera (PR de teste) | Juntamente com o Passo 4 |
| Revalidação pela Helena | Helena | Após configuração + evidência |
