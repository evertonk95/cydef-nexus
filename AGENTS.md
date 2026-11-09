# AGENTS.md — Site CyDef (cydef-nexus)

Regras para qualquer agente ou pessoa que altere este repositório. O padrão completo está na skill `padrao-sites-institucionais` do workspace; este arquivo é a versão operacional do projeto.

Site: https://www.cydef.com.br · Deploy automático via GitHub Pages a partir de `main`.

## Gate 1 — Processo (issue antes de código)

- Toda tarefa (correção, melhoria ou nova função) tem **issue** aberta neste repositório, com critério de aceite.
- Trabalho sempre em **branch + PR**, nunca direto em `main`. O corpo do PR referencia a issue (`Closes #N`) e traz: o que mudou, validação executada, efeito esperado em produção.
- Merge somente com checks verdes e aprovação explícita do Everton.
- Ao fechar, registrar a etapa no vault (`Cortana/Projetos/CyDef Nexus/Registros/`) e na memória do workspace.

## Gate 2 — Interface e motion

- Consultar as diretrizes de motion (`github.com/kylezantos/design-principles`) antes de desenhar tela ou componente novo.
- **Skeleton** com a silhueta do conteúdo final em todo bloco que carrega dado remoto; nunca spinner de página inteira e nunca salto de layout quando o dado chega.
- **Lazy loading**: imagem abaixo da dobra com `loading="lazy"` e `decoding="async"`; rota pesada por `React.lazy` + `Suspense`; fonte com `display: swap`.
- **Animação** de entrada, saída, carregamento e progresso em elemento interativo: 120 a 240 ms, `ease-out` na entrada, `ease-in` na saída, animando `transform` e `opacity` (nunca `width`, `height`, `top`).
- `prefers-reduced-motion: reduce` desliga ou encurta animação. Foco visível e teclado fazem parte do gate.
- Evidência: screenshot do estado de carregamento e do estado carregado no mesmo viewport.

## Gate 3 — Qualidade antes do deploy

O que o repositório **já tem** e roda no CI (`.github/workflows/ci.yml`): `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm audit --audit-level=high`, SBOM e gitleaks. Acessibilidade tem `axe-core`/`vitest-axe`.

O que **falta** para fechar o gate (em ordem de custo-benefício):

| Item | Ferramenta sugerida | Por que |
|---|---|---|
| commitlint + husky | `@commitlint/cli` + `husky` | impede commit fora do padrão antes de virar histórico |
| código morto e dep órfã | `knip` | dependência e export que ninguém usa pesam no bundle |
| teste de arquitetura | teste Vitest que barra import de `supabase/` dentro de `src/components` | impede vazamento de camada |
| E2E do fluxo crítico | `@playwright/test` no formulário de contato/cadastro | hoje só há teste de componente |
| cobertura publicada | `vitest --coverage` (+ Codecov se o repo abrir) | cobertura sem número não é gate |
| mutação | `stryker` só no miolo de regra (ex.: validação de formulário) | teste que não falha não prova nada |
| observabilidade | Sentry no cliente, DSN em variável de ambiente, `release` = commit | erro em produção hoje é invisível |
| lint sem warnings | `--max-warnings 0` no escopo já limpo | warning acumulado vira ruído e depois bug |

Regra: **não trocar o toolset que já funciona**. ESLint fica; Biome só entraria em projeto sem lint.

## Comandos de validação local (os mesmos do CI)

```
npm run typecheck
npm run lint
npm test
npm run build
node scripts/gerar-posts-meta.mjs && node scripts/gen-sitemap.mjs   # artigo novo
```

Nunca rodar `npx tsc --noEmit` puro: em tsconfig solution-style ele passa em falso.

## Regras de conteúdo

- Marca sempre **CyDef** (nunca "Cydef" em texto exibido).
- Sem travessão eme no meio do texto.
- Sem claim sem realidade verificável (oferta, rating, perfil social não confirmado); preço sempre "sob consulta".
- Alteração de frase no i18n exige paridade PT/EN/ES e varredura do `src` pelas ocorrências restantes.
- Métrica de alunos matriculados na home: fora até a construção da Academy fechar (decisão de 09/11/2026). Quando voltar, o número vem da API, não de limiar estimado.

## Pós-deploy

- Confirmar o run de deploy pelo sha do merge e exigir `build` e `deploy` em `success`.
- Provar o sitemap servido: todos os `<loc>` de `https://www.cydef.com.br/sitemap.xml` com 200 e sem redirect.
- Só então pedir indexação no Search Console (skill `cydef-indexacao-search-console`).
