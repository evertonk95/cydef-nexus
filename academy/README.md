# Portal do aluno da CyDef Academy

Endereço: https://academy.cydef.com.br · Publicado no Cloudflare Pages a partir desta pasta.

O site institucional (raiz do repositório) não muda com este portal. Os dois usam o mesmo projeto do Supabase.

## O que existe nesta etapa

- Login por link no e-mail, sem senha, pedido pela função `supabase/functions/academy-acesso`.
- Painel do aluno: continuar de onde parou, formação, Boletim do SOC, competências e sequência de estudo.
- Meus cursos e a página de cada curso, com módulos, aulas e progresso.
- Busca com Ctrl+K.

## Como o login funciona

1. O aluno digita o e-mail. O widget do Turnstile gera um token de uso único.
2. A função `academy-acesso` confere a origem, o Turnstile e o limite de tentativas (por IP e por e-mail, com chaves em HMAC). Depois consulta no banco se o e-mail é de um aluno ou de uma pré-inscrição ativa com consentimento.
3. Para quem não é elegível, a resposta é a mesma de quem é elegível (202, com o mesmo tempo mínimo). De fora, ninguém descobre quem está cadastrado.
4. Para quem é elegível, a função cria o usuário de login (se ainda não existir), cria o registro de aluno e envia o link. O endereço de retorno é fixo no servidor (`ACADEMY_URL/entrar/retorno`).
5. No retorno, o portal chama `academy_registrar_acesso`. Como abrir o link comprova que a pessoa é dona do e-mail, a pré-inscrição pendente passa a confirmada aqui, e o aluno é matriculado nos cursos gratuitos publicados.

## Banco (migrações 0008 e 0009)

- Catálogo: formações, trilhas, cursos, módulos, aulas e competências. A leitura é pública só para o que está publicado e só nas colunas públicas. A referência do vídeo (`video_ref`) não é liberada para ninguém pela API de tabelas.
- Dados do aluno (matrícula, progresso, dias de estudo): cada aluno lê só os próprios. Ninguém grava direto nas tabelas; a escrita passa por funções do banco que conferem quem chama.
- Os testes em `tests/sql` rodam todas as migrações num Postgres real (PGlite) e conferem essas regras.

## Publicar conteúdo

A migração 0009 cria a estrutura dos dois cursos gratuitos com tudo **não publicado**. Quando as aulas de um curso estiverem gravadas, rode no SQL Editor do Supabase:

```sql
-- 1. vídeo de cada aula (YouTube nos gratuitos; o id é o trecho depois de v= no link)
update public.aulas a set video_provedor = 'youtube', video_ref = 'ID_DO_VIDEO'
  from public.modulos m
 where m.id = a.modulo_id and m.curso_slug = 'fundamentos-para-soc' and a.numero = 1;

-- 2. publicar aulas, curso, trilha e formação
update public.aulas set publicado = true
 where modulo_id in (select id from public.modulos where curso_slug = 'fundamentos-para-soc');
update public.cursos set publicado = true, atualizado_em = now() where slug = 'fundamentos-para-soc';
update public.trilhas set publicado = true where slug = 'fundamentos';
update public.formacoes set publicado = true where slug = 'analista-soc';
```

Aluno que já entrou antes da publicação é matriculado no próximo acesso.

## Boletim do SOC

```sql
insert into public.boletim (tipo, titulo, link, publicado)
values ('ameaca', 'Campanha de phishing com QR code mira equipes financeiras', 'https://www.cydef.com.br/blog/...', true);
```

`tipo`: `atualizacao`, `ameaca`, `missao` ou `aula`. O link precisa começar com `https://`. Com `publicado_em` no futuro, o aviso só aparece na data.

## Desenvolvimento

```
cd academy
npm ci
cp .env.example .env.local   # preencher os valores públicos
npm run dev                  # http://localhost:5180
npm run lint && npm run typecheck && npm test && npm run build
```

Para testar o login no ambiente local, `http://localhost:5180` precisa estar em `ACADEMY_ALLOWED_ORIGINS` da função e nas Redirect URLs do Supabase.

## Cloudflare Pages

- Repositório: `evertonk95/cydef-nexus`, branch de produção `main`.
- Root directory: `academy` · Build command: `npm ci && npm run build` · Output: `dist`.
- Variáveis de ambiente (todas públicas, configuradas no painel do Pages, Production e Preview): `NODE_VERSION=22`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ACESSO_API_URL`, `VITE_TURNSTILE_SITE_KEY`. O repositório não versiona arquivos `.env.*` (regra S-07).
- Domínio personalizado: `academy.cydef.com.br`.
- `public/_headers` aplica CSP, HSTS, bloqueio de iframe e `noindex`. `public/_redirects` faz o roteamento da SPA.

## Regras de interface

- Animação de entrada e de interação entre 120 e 240 ms; progresso anima por `transform`, nunca por largura.
- Esqueleto com a silhueta do conteúdo em todo bloco que depende do banco.
- `prefers-reduced-motion` deixa tudo estático, inclusive o fundo de partículas, que também pausa quando a aba sai de foco.
- Só aparece no portal o que existe: nada de "em breve".
