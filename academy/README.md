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
- Privilégios das funções: a 0012 fecha `EXECUTE` em todas as funções de `public` e reafirma a matriz (anon só em `contagem_alunos`, authenticated só nas quatro do portal, service_role em todas). O `alter default privileges` vai em duas camadas: `in schema public` tira o que o Supabase deixou concedido, e a forma global (`for role postgres`, sem `in schema`) remove o grant embutido que o Postgres dá a `PUBLIC`. O default global vale para tudo que o papel `postgres` criar, inclusive extensões. Função nova nasce com `proacl = {postgres=X/postgres}`: quem precisar de grant concede na própria migração e termina com `revoke execute on function ... from public` como reforço.

## Publicar conteúdo

A migração 0009 cria a estrutura dos dois cursos gratuitos com tudo **não publicado**. A 0011 acrescenta ao Cybersecurity Fundamentals o módulo **Introdução** (ordem 0) com a aula 01, "Boas-vindas ao curso", já ligada ao vídeo `AKtr_lmAB6Y`. As demais aulas andaram uma posição: o curso tem 17 aulas, e a antiga aula 01 (CID) passou a ser a aula 02. Os títulos dos vídeos no YouTube seguem essa numeração.

### Vincular o vídeo de uma aula

O id é o trecho depois de `youtu.be/` ou de `v=` no link. Cadastre também a duração real em segundos: ela aparece na capa e define quando a aula conta como concluída.

```sql
update public.aulas a
   set video_provedor = 'youtube', video_ref = 'ID_DO_VIDEO', duracao_seg = 754
  from public.modulos m
 where m.id = a.modulo_id and m.curso_slug = 'cybersecurity-fundamentals' and a.numero = 2;
```

### Publicar

Ordem segura: merge, Pages no ar com a sala de aula, migração aplicada no banco e só então o SQL abaixo. Publicar é decisão do Everton.

Aplicação da migração neste projeto: por `psql` no pooler `aws-0-us-east-2.pooler.supabase.com:5432`, com a senha do `.env.local` em `PGPASSWORD`, `-v ON_ERROR_STOP=1 --single-transaction -f`, sem registrar no histórico. O `supabase db push` **não roda aqui**: o histórico `supabase_migrations.schema_migrations` só tem `0006` a `0009` (a `0010` foi aplicada por `psql` sem registro e a `0001` a `0005` nunca entraram), então o CLI recusa e pede `--include-all` para reaplicar 0001 a 0005, o que não se faz num banco que já tem esses objetos. Alinhar o histórico com `supabase migration repair` é decisão do Everton.

```sql
-- só a aula de boas-vindas, por enquanto
update public.aulas a set publicado = true
  from public.modulos m
 where m.id = a.modulo_id and m.curso_slug = 'cybersecurity-fundamentals' and m.ordem = 0 and a.numero = 1;

-- curso, trilha e formação
update public.cursos set publicado = true, atualizado_em = now() where slug = 'cybersecurity-fundamentals';
update public.trilhas set publicado = true where slug = 'fundamentos';
update public.formacoes set publicado = true where slug = 'analista-soc';
```

Aula não publicada aparece no catálogo como "em breve" e não abre a sala de aula. Aluno que já entrou antes da publicação é matriculado no próximo acesso.

### Sala de aula

- Endereço: `/cursos/<slug>/aulas/<numero>`. O número é o da aula no curso (1 a 17 no Cybersecurity Fundamentals).
- O vídeo só é entregue a aluno matriculado, pela função `academy_video_aula`; a coluna `video_ref` continua fora do alcance das consultas diretas.
- O player do YouTube é carregado em `youtube-nocookie.com` só depois do clique, sem script de terceiros. A conversa com ele é por `postMessage`, aceitando apenas mensagens da origem do YouTube.
- A posição é gravada a cada 15 s, ao pausar e ao sair da aba. A aula conta como concluída ao terminar o vídeo, ao passar de 92% ou pelo botão "Marcar como concluída". Conclusão não volta atrás.

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
